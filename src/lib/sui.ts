import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { TransactionBlock } from '@mysten/sui/transactions'

// Contract configuration
const CONTRACT_PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID || '0xf5cea5e60a747e0782f04b36ce998d68569b19cc51de6963bb20a8c431354637'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { fromB64 } from '@mysten/sui/utils'

// Sui client configuration
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet') // Change to 'mainnet' for production
})

// Package and module addresses (these would be set after deployment)
export const PACKAGE_ID = '0x0' // Replace with actual package ID after deployment
export const QUIZ_MODULE = 'sui_kahoot'

// Quiz object types
export const QUIZ_OBJECT_TYPE = `${PACKAGE_ID}::${QUIZ_MODULE}::Quiz`
export const PARTICIPATION_OBJECT_TYPE = `${PACKAGE_ID}::${QUIZ_MODULE}::Participation`
export const SBT_OBJECT_TYPE = `${PACKAGE_ID}::${QUIZ_MODULE}::QuizCompletionSBT`

// Transaction helper functions
export class QuizTransactionBuilder {
  private txb: TransactionBlock

  constructor() {
    this.txb = new TransactionBlock()
  }

  // Create a new quiz
  createQuiz(
    title: string,
    description: string,
    questions: any[],
    durationSeconds: number,
    prizePool: number
  ) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::create_quiz`,
      arguments: [
        this.txb.pure.string(title),
        this.txb.pure.string(description),
        this.txb.pure(questions),
        this.txb.pure.u64(durationSeconds),
        this.txb.pure.u64(prizePool),
        this.txb.object('0x6'), // Clock object
      ],
    })
  }

  // Start a quiz
  startQuiz(quizId: string) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::start_quiz`,
      arguments: [
        this.txb.object(quizId),
        this.txb.object('0x6'), // Clock object
      ],
    })
  }

  // Submit an answer
  submitAnswer(
    quizId: string,
    questionIndex: number,
    selectedOption: number,
    timeTaken: number
  ) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::submit_answer`,
      arguments: [
        this.txb.object(quizId),
        this.txb.pure.u64(questionIndex),
        this.txb.pure.u8(selectedOption),
        this.txb.pure.u64(timeTaken),
        this.txb.object('0x6'), // Clock object
      ],
    })
  }

  // Complete quiz and mint SBT
  completeQuiz(quizId: string, answers: any[]) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::complete_quiz`,
      arguments: [
        this.txb.object(quizId),
        this.txb.pure(answers),
        this.txb.object('0x6'), // Clock object
      ],
    })
  }

  // End a quiz
  endQuiz(quizId: string) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::end_quiz`,
      arguments: [
        this.txb.object(quizId),
        this.txb.object('0x6'), // Clock object
      ],
    })
  }

  // Claim prize
  claimPrize(quizId: string, participationId: string) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${QUIZ_MODULE}::claim_prize`,
      arguments: [
        this.txb.object(quizId),
        this.txb.object(participationId),
      ],
    })
  }

  getTransactionBlock() {
    return this.txb
  }
}

// Query helper functions
export class QuizQueries {
  // Get quiz information
  static async getQuizInfo(quizId: string) {
    try {
      const object = await suiClient.getObject({
        id: quizId,
        options: {
          showContent: true,
          showType: true,
        },
      })

      if (object.data?.content && 'fields' in object.data.content) {
        return object.data.content.fields
      }
      return null
    } catch (error) {
      console.error('Error fetching quiz info:', error)
      return null
    }
  }

  // Get participant score
  static async getParticipantScore(quizId: string, participant: string) {
    try {
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: new TransactionBlock().moveCall({
          target: `${PACKAGE_ID}::${QUIZ_MODULE}::get_participant_score`,
          arguments: [
            new TransactionBlock().object(quizId),
            new TransactionBlock().pure.address(participant),
          ],
        }),
        sender: participant,
      })

      return result.results?.[0]?.returnValues?.[0]?.[0]
    } catch (error) {
      console.error('Error fetching participant score:', error)
      return 0
    }
  }

  // Get leaderboard
  static async getLeaderboard(quizId: string) {
    try {
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: new TransactionBlock().moveCall({
          target: `${PACKAGE_ID}::${QUIZ_MODULE}::get_leaderboard`,
          arguments: [new TransactionBlock().object(quizId)],
        }),
        sender: '0x0', // Any address for read-only calls
      })

      return result.results?.[0]?.returnValues?.[0]?.[0]
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  // Get all quizzes by querying QuizCreated events
  static async getAllQuizzes() {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') })
      
      // Query QuizCreated events from the contract
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${CONTRACT_PACKAGE_ID}::sui_kahoot_optimized::QuizCreated`
        },
        limit: 50,
        order: 'descending'
      })

      return events.data.map(event => ({
        id: event.parsedJson?.quiz_id,
        title: event.parsedJson?.title,
        owner: event.parsedJson?.owner,
        questionCount: event.parsedJson?.question_count,
        prizePool: event.parsedJson?.prize_pool,
        duration: event.parsedJson?.duration,
        createdAt: event.timestampMs
      }))
    } catch (error) {
      console.error('Error fetching quizzes from blockchain:', error)
      return []
    }
  }
}

// Event types for type safety
export interface QuizCreatedEvent {
  quiz_id: string
  title: string
  owner: string
  question_count: number
  prize_pool: number
}

export interface QuizCompletedEvent {
  quiz_id: string
  participant: string
  total_score: number
  rank: number
  sbt_minted: boolean
}

// Event query helpers
export class EventQueries {
  // Get quiz creation events
  static async getQuizCreatedEvents() {
    try {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${QUIZ_MODULE}::QuizCreated`,
        },
        limit: 50,
        order: 'descending',
      })

      return events.data.map(event => ({
        ...event.parsedJson as QuizCreatedEvent,
        timestamp: event.timestampMs,
        txDigest: event.id.txDigest,
      }))
    } catch (error) {
      console.error('Error fetching quiz created events:', error)
      return []
    }
  }

  // Get quiz completion events
  static async getQuizCompletedEvents(participant?: string) {
    try {
      const query: any = {
        MoveEventType: `${PACKAGE_ID}::${QUIZ_MODULE}::QuizCompleted`,
      }

      if (participant) {
        query.Sender = participant
      }

      const events = await suiClient.queryEvents({
        query,
        limit: 50,
        order: 'descending',
      })

      return events.data.map(event => ({
        ...event.parsedJson as QuizCompletedEvent,
        timestamp: event.timestampMs,
        txDigest: event.id.txDigest,
      }))
    } catch (error) {
      console.error('Error fetching quiz completed events:', error)
      return []
    }
  }
}

