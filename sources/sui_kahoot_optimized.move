/// Sui Kahoot Optimized - Community Template Compatible
/// A decentralized quiz platform with automatic reward distribution
/// Following Sui community project template patterns
module sui_kahoot::sui_kahoot_optimized {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use std::string::String;
    use std::vector;

    // ===== Error Constants =====
    const EQuizNotFound: u64 = 0;
    const EQuizAlreadyStarted: u64 = 1;
    const EQuizNotStarted: u64 = 2;
    const EQuizEnded: u64 = 3;
    const EInvalidAnswer: u64 = 4;
    const EAlreadyParticipated: u64 = 5;
    const ENotQuizOwner: u64 = 6;
    const EInvalidQuestionCount: u64 = 7;
    const EQuizNotEnded: u64 = 8;
    const EAlreadyClaimed: u64 = 9;
    const EInsufficientPrizePool: u64 = 10;
    const EInvalidDuration: u64 = 11;

    // ===== Structs =====

    /// Quiz question structure
    public struct Question has copy, drop, store {
        question_text: String,
        options: vector<String>,
        correct_answer: u8,
        time_limit: u64,
    }

    /// Main quiz object
    public struct Quiz has key, store {
        id: UID,
        title: String,
        description: String,
        questions: vector<Question>,
        owner: address,
        start_time: u64,
        end_time: u64,
        duration_seconds: u64,
        is_active: bool,
        participants: vector<address>,
        scores: Table<address, u64>,
        prize_balance: Balance<SUI>,
        winners: vector<address>,
        prize_distributed: bool,
        participant_reward_percentage: u64, // Percentage for all participants (e.g., 30)
        created_at: u64,
    }

    /// Participant's answer
    public struct Answer has copy, drop, store {
        question_index: u64,
        selected_option: u8,
        time_taken: u64,
        is_correct: bool,
    }

    /// Quiz participation record
    public struct Participation has key, store {
        id: UID,
        quiz_id: ID,
        participant: address,
        answers: vector<Answer>,
        total_score: u64,
        completion_time: u64,
        rank: u64,
        prize_claimed: bool,
    }

    /// Soulbound Token for quiz completion
    public struct QuizCompletionSBT has key, store {
        id: UID,
        quiz_id: ID,
        participant: address,
        score: u64,
        rank: u64,
        completion_date: u64,
        quiz_title: String,
    }

    // ===== Events =====

    public struct QuizCreated has copy, drop {
        quiz_id: ID,
        title: String,
        owner: address,
        question_count: u64,
        prize_pool: u64,
        duration_seconds: u64,
    }

    public struct QuizStarted has copy, drop {
        quiz_id: ID,
        start_time: u64,
        end_time: u64,
    }

    public struct QuizEnded has copy, drop {
        quiz_id: ID,
        end_time: u64,
        total_participants: u64,
        winners_count: u64,
    }

    public struct AnswerSubmitted has copy, drop {
        quiz_id: ID,
        participant: address,
        question_index: u64,
        is_correct: bool,
        current_score: u64,
    }

    public struct QuizCompleted has copy, drop {
        quiz_id: ID,
        participant: address,
        total_score: u64,
        rank: u64,
    }

    public struct RewardsDistributed has copy, drop {
        quiz_id: ID,
        winners_count: u64,
        total_participants: u64,
        winner_reward_per_person: u64,
        participant_reward_per_person: u64,
    }

    // ===== Public Functions =====

    /// Create a new quiz (JS-friendly version)
    /// Returns the quiz object ID for frontend extraction
    public entry fun create_quiz_js(
        title: String,
        description: String,
        question_text: String,
        options: vector<String>,
        correct_answer: u8,
        time_limit: u64,
        duration_seconds: u64,
        _question_time_limit: u64, // Unused parameter, prefixed with _
        _max_participants: u64,    // Unused parameter, prefixed with _
        _prize_distribution: vector<u64>, // Unused parameter, prefixed with _
        prize_coin: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        // Create single question from JS inputs
        let question = Question {
            question_text,
            options,
            correct_answer,
            time_limit,
        };
        
        let mut questions = vector::empty<Question>();
        vector::push_back(&mut questions, question);
        
        // Create quiz with 30% participant reward
        let quiz_id = create_quiz(
            title,
            description,
            questions,
            duration_seconds,
            30, // participant_reward_percentage
            prize_coin,
            clock,
            ctx
        );
        
        // Emit event with quiz ID for frontend to extract
        event::emit(QuizCreated {
            quiz_id,
            title,
            owner: tx_context::sender(ctx),
            question_count: 1,
            prize_pool: 0, // Will be set by create_quiz
            duration_seconds,
        });
        
        // Return the quiz ID so frontend can extract it
        quiz_id
    }

    /// Create a new quiz - Community Template Pattern
    public fun create_quiz(
        title: String,
        description: String,
        questions: vector<Question>,
        duration_seconds: u64,
        participant_reward_percentage: u64, // e.g., 30 for 30%
        prize_coin: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        // Input validation following community template patterns
        assert!(vector::length(&questions) > 0, EInvalidQuestionCount);
        assert!(duration_seconds > 0, EInvalidDuration);
        assert!(participant_reward_percentage <= 50, EInvalidDuration); // Max 50% for participants

        let current_time = clock::timestamp_ms(clock);
        
        // Create quiz object with proper UID management
        let quiz_id = object::new(ctx);
        let quiz_id_copy = object::uid_to_inner(&quiz_id);

        // Create quiz object following community template patterns
        let quiz = Quiz {
            id: quiz_id,
            title,
            description,
            questions,
            owner: tx_context::sender(ctx),
            start_time: 0,
            end_time: 0,
            duration_seconds,
            is_active: false,
            participants: vector::empty(),
            scores: table::new(ctx),
            prize_balance: coin::into_balance(prize_coin),
            winners: vector::empty(),
            prize_distributed: false,
            participant_reward_percentage,
            created_at: current_time,
        };

        // Share object publicly following community template patterns
        transfer::public_share_object(quiz);
        
        // Return the object ID for frontend extraction
        quiz_id_copy
    }

    /// Start a quiz
    public fun start_quiz(
        quiz: &mut Quiz,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(quiz.owner == tx_context::sender(ctx), ENotQuizOwner);
        assert!(!quiz.is_active, EQuizAlreadyStarted);

        let current_time = clock::timestamp_ms(clock);
        quiz.start_time = current_time;
        quiz.end_time = current_time + (quiz.duration_seconds * 1000);
        quiz.is_active = true;

        event::emit(QuizStarted {
            quiz_id: object::uid_to_inner(&quiz.id),
            start_time: current_time,
            end_time: quiz.end_time,
        });
    }

    /// Submit an answer
    public fun submit_answer(
        quiz: &mut Quiz,
        question_index: u64,
        selected_option: u8,
        time_taken: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(quiz.is_active, EQuizNotStarted);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time <= quiz.end_time, EQuizEnded);

        let participant = tx_context::sender(ctx);
        let questions = &quiz.questions;
        assert!(question_index < vector::length(questions), EInvalidAnswer);

        let question = vector::borrow(questions, question_index);
        let is_correct = question.correct_answer == selected_option;

        // Add participant if not already added
        if (!vector::contains(&quiz.participants, &participant)) {
            vector::push_back(&mut quiz.participants, participant);
            table::add(&mut quiz.scores, participant, 0);
        };

        // Calculate score
        let base_score = if (is_correct) { 100 } else { 0 };
        let speed_bonus = if (is_correct && time_taken < 5000) { 50 } else { 0 };
        let total_score = base_score + speed_bonus;

        // Update participant's score
        let current_score = table::borrow_mut(&mut quiz.scores, participant);
        *current_score = *current_score + total_score;

        event::emit(AnswerSubmitted {
            quiz_id: object::uid_to_inner(&quiz.id),
            participant,
            question_index,
            is_correct,
            current_score: *current_score,
        });
    }

    /// End quiz and calculate winners
    public fun end_quiz(
        quiz: &mut Quiz,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(quiz.owner == tx_context::sender(ctx), ENotQuizOwner);
        assert!(quiz.is_active, EQuizNotStarted);

        let current_time = clock::timestamp_ms(clock);
        quiz.is_active = false;
        quiz.end_time = current_time;

        calculate_winners(quiz);

        event::emit(QuizEnded {
            quiz_id: object::uid_to_inner(&quiz.id),
            end_time: current_time,
            total_participants: vector::length(&quiz.participants),
            winners_count: vector::length(&quiz.winners),
        });
    }

    /// Auto-end quiz if time expired and distribute rewards (can be called by anyone)
    public fun check_and_auto_end_quiz(
        quiz: &mut Quiz,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(quiz.is_active, EQuizNotStarted);

        let current_time = clock::timestamp_ms(clock);
        if (current_time >= quiz.end_time) {
            quiz.is_active = false;
            calculate_winners(quiz);

            // Auto-distribute rewards to winners
            if (!quiz.prize_distributed) {
                distribute_rewards(quiz, ctx);
            };

            event::emit(QuizEnded {
                quiz_id: object::uid_to_inner(&quiz.id),
                end_time: current_time,
                total_participants: vector::length(&quiz.participants),
                winners_count: vector::length(&quiz.winners),
            });
        };
    }

    /// Complete quiz and mint SBT with automatic reward distribution
    public fun complete_quiz(
        quiz: &mut Quiz,
        answer_count: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): (Participation, QuizCompletionSBT) {
        let participant = tx_context::sender(ctx);
        assert!(vector::contains(&quiz.participants, &participant), EAlreadyParticipated);
        assert!(!quiz.is_active, EQuizNotEnded);

        let current_time = clock::timestamp_ms(clock);
        let total_score = *table::borrow(&quiz.scores, participant);

        // Determine rank
        let rank = if (vector::contains(&quiz.winners, &participant)) { 1 } else { 2 };

        // Create empty answers vector for now (we'll populate it from frontend data)
        let answers = vector::empty<Answer>();
        
        let participation = Participation {
            id: object::new(ctx),
            quiz_id: object::uid_to_inner(&quiz.id),
            participant,
            answers,
            total_score,
            completion_time: current_time,
            rank,
            prize_claimed: false,
        };

        let sbt = QuizCompletionSBT {
            id: object::new(ctx),
            quiz_id: object::uid_to_inner(&quiz.id),
            participant,
            score: total_score,
            rank,
            completion_date: current_time,
            quiz_title: quiz.title,
        };

        event::emit(QuizCompleted {
            quiz_id: object::uid_to_inner(&quiz.id),
            participant,
            total_score,
            rank,
        });

        // Auto-distribute rewards
        distribute_rewards(quiz, ctx);

        (participation, sbt)
    }

    /// Distribute rewards to winners only (1st place gets all prize)
    public fun distribute_rewards(
        quiz: &mut Quiz,
        ctx: &mut TxContext
    ) {
        assert!(!quiz.is_active, EQuizNotEnded);
        assert!(!quiz.prize_distributed, EAlreadyClaimed);

        let total_prize = balance::value(&quiz.prize_balance);
        let winners_count = vector::length(&quiz.winners);

        if (winners_count == 0) {
            // No winners, no distribution
            quiz.prize_distributed = true;
            return
        };

        // Calculate winner reward (equal distribution among all winners)
        let winner_reward = total_prize / winners_count;

        // Distribute to winners only
        let mut i = 0;
        while (i < winners_count) {
            let winner = *vector::borrow(&quiz.winners, i);
            if (winner_reward > 0) {
                let winner_coin = coin::from_balance(
                    balance::split(&mut quiz.prize_balance, winner_reward),
                    ctx
                );
                transfer::public_transfer(winner_coin, winner);
            };
            i = i + 1;
        };

        quiz.prize_distributed = true;

        event::emit(RewardsDistributed {
            quiz_id: object::uid_to_inner(&quiz.id),
            winners_count,
            total_participants: vector::length(&quiz.participants),
            winner_reward_per_person: winner_reward,
            participant_reward_per_person: 0, // No participant rewards
        });
    }

    /// Manually distribute rewards to winners - can be called by anyone
    public fun distribute_winner_rewards(
        quiz: &mut Quiz,
        ctx: &mut TxContext
    ) {
        assert!(!quiz.is_active, EQuizNotEnded);
        assert!(!quiz.prize_distributed, EAlreadyClaimed);

        let total_prize = balance::value(&quiz.prize_balance);
        let winners_count = vector::length(&quiz.winners);

        if (winners_count == 0) {
            // No winners, no distribution
            quiz.prize_distributed = true;
            return
        };

        // Calculate winner reward (equal distribution among all winners)
        let winner_reward = total_prize / winners_count;

        // Distribute to winners only
        let mut i = 0;
        while (i < winners_count) {
            let winner = *vector::borrow(&quiz.winners, i);
            if (winner_reward > 0) {
                let winner_coin = coin::from_balance(
                    balance::split(&mut quiz.prize_balance, winner_reward),
                    ctx
                );
                transfer::public_transfer(winner_coin, winner);
            };
            i = i + 1;
        };

        quiz.prize_distributed = true;

        event::emit(RewardsDistributed {
            quiz_id: object::uid_to_inner(&quiz.id),
            winners_count,
            total_participants: vector::length(&quiz.participants),
            winner_reward_per_person: winner_reward,
            participant_reward_per_person: 0,
        });
    }

    // ===== Helper Functions =====

    /// Calculate winners (highest scorers)
    fun calculate_winners(quiz: &mut Quiz) {
        let mut max_score = 0;
        let participants = &quiz.participants;
        let size = vector::length(participants);

        // Find maximum score
        let mut i = 0;
        while (i < size) {
            let participant = *vector::borrow(participants, i);
            let score = *table::borrow(&quiz.scores, participant);
            if (score > max_score) {
                max_score = score;
            };
            i = i + 1;
        };

        // Find all participants with max score
        quiz.winners = vector::empty();
        i = 0;
        while (i < size) {
            let participant = *vector::borrow(participants, i);
            let score = *table::borrow(&quiz.scores, participant);
            if (score == max_score && score > 0) {
                vector::push_back(&mut quiz.winners, participant);
            };
            i = i + 1;
        };
    }

    // ===== View Functions =====

    /// Check if quiz is active
    public fun is_quiz_active(quiz: &Quiz): bool {
        quiz.is_active
    }

    /// Check if quiz time has expired
    public fun is_quiz_expired(quiz: &Quiz, clock: &Clock): bool {
        if (!quiz.is_active) return false;
        let current_time = clock::timestamp_ms(clock);
        current_time >= quiz.end_time
    }

    /// Get remaining time in seconds
    public fun get_remaining_time_seconds(quiz: &Quiz, clock: &Clock): u64 {
        if (!quiz.is_active) return 0;
        let current_time = clock::timestamp_ms(clock);
        if (current_time >= quiz.end_time) {
            0
        } else {
            (quiz.end_time - current_time) / 1000
        }
    }

    /// Check if participant is a winner
    public fun is_winner(quiz: &Quiz, participant: address): bool {
        vector::contains(&quiz.winners, &participant)
    }

    /// Check if prizes are distributed
    public fun are_prizes_distributed(quiz: &Quiz): bool {
        quiz.prize_distributed
    }

    /// Get quiz info
    public fun get_quiz_info(quiz: &Quiz): (String, String, u64, u64, bool, u64, u64) {
        (
            quiz.title,
            quiz.description,
            quiz.start_time,
            quiz.end_time,
            quiz.is_active,
            balance::value(&quiz.prize_balance),
            vector::length(&quiz.winners)
        )
    }

    /// Get participant score
    public fun get_participant_score(quiz: &Quiz, participant: address): u64 {
        if (table::contains(&quiz.scores, participant)) {
            *table::borrow(&quiz.scores, participant)
        } else {
            0
        }
    }

    /// Get participant count
    public fun get_participant_count(quiz: &Quiz): u64 {
        vector::length(&quiz.participants)
    }

    /// Get winners count
    public fun get_winners_count(quiz: &Quiz): u64 {
        vector::length(&quiz.winners)
    }
}
