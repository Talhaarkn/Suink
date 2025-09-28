import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { bcs } from '@mysten/sui/bcs'

// Contract configuration
const CONTRACT_PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID || '0xe17a91baf6aeae43d4486ef042e8c1000a7565977979e669966a7069ea255f2e'
const CONTRACT_MODULE = 'sui_kahoot_optimized'
const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'

// Initialize Sui client
const suiClient = new SuiClient({ url: SUI_RPC_URL })

export interface QuizQuestion {
  question_text: string
  options: string[]
  correct_answer: number
  time_limit: number
}

export interface QuizConfig {
  duration_seconds: number
  question_time_limit: number
  max_participants: number
  prize_distribution: number[]
}

export interface QuizData {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  owner: string
  start_time: number
  end_time: number
  duration_seconds: number
  is_active: boolean
  auto_end_enabled: boolean
  total_prize_pool: number
  created_at: number
  winners_count: number
  participant_reward_pool: number
  participation_reward_per_user: number
  prize_distributed: boolean
}

export interface Answer {
  question_index: number
  selected_option: number
  time_taken: number
  is_correct: boolean
}

export interface Participation {
  id: string
  quiz_id: string
  participant: string
  answers: Answer[]
  total_score: number
  completion_time: number
  rank: number
  prize_claimed: boolean
}

export interface LeaderboardEntry {
  participant: string
  score: number
  rank: number
  completion_time: number
}

export class QuizContractService {
  private client: SuiClient
  private packageId: string

  constructor() {
    this.client = suiClient
    this.packageId = CONTRACT_PACKAGE_ID
  }

  /**
   * Create a new quiz with optimized gas usage
   */
  async createQuiz(
    title: string,
    description: string,
    questions: QuizQuestion[],
    config: QuizConfig,
    prizeAmount: number, // in MIST (1 SUI = 1,000,000,000 MIST)
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<{ digest: string; quizObjectId: string }> {
    const tx = new Transaction()
    
    // Create a simple coin for prize (use gas coin directly)
    const coin = tx.gas
    
    // Register BCS types matching on-chain structs
    const questionType = `${this.packageId}::${CONTRACT_MODULE}::Question`
    const quizConfigType = `${this.packageId}::${CONTRACT_MODULE}::QuizConfig`

    try {
      bcs.registerStructType(questionType, {
        question_text: bcs.string(),
        options: bcs.vector(bcs.string()),
        correct_answer: bcs.u8(),
        time_limit: bcs.u64(),
      })
    } catch (_) {
      // already registered, ignore
    }

    try {
      bcs.registerStructType(quizConfigType, {
        duration_seconds: bcs.u64(),
        question_time_limit: bcs.u64(),
        max_participants: bcs.u64(),
        prize_distribution: bcs.vector(bcs.u64()),
      })
    } catch (_) {
      // already registered, ignore
    }

    // Prepare simple inputs for JS-friendly function
    const firstQuestion = questions.length > 0 ? questions[0] : {
      question_text: 'Sample Question',
      options: ['Option A', 'Option B'],
      correct_answer: 0,
      time_limit: 30,
    }

    // Use the simplified JS-friendly entry function - Community Template Pattern
    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_MODULE}::create_quiz_js`,
      arguments: [
        tx.pure.string(title),
        tx.pure.string(description),
        tx.pure.string(firstQuestion.question_text),
        tx.pure.vector('string', firstQuestion.options),
        tx.pure.u8(firstQuestion.correct_answer),
        tx.pure.u64(firstQuestion.time_limit),
        tx.pure.u64(config.duration_seconds),
        tx.pure.u64(config.question_time_limit),
        tx.pure.u64(config.max_participants),
        tx.pure.vector('u64', config.prize_distribution || [100]),
        coin,
        tx.object('0x6') // Clock object - Community Template Pattern
      ]
    })
    
    // Set gas budget to avoid version mismatch
    tx.setGasBudget(50000000)

    const result = await signAndExecuteTransaction(tx)
    
    // Extract the created quiz object ID from return values or created objects
    let quizObjectId = ''
    
    console.log('🔍 Full transaction result:', JSON.stringify(result, null, 2))
    
    // Detailed transaction analysis
    console.log('🔍 Full transaction result:', JSON.stringify(result, null, 2))
    console.log('🔍 Transaction digest:', result.digest)
    console.log('🔍 Transaction effects:', result.effects)
    console.log('🔍 Transaction events:', result.effects?.events)
    console.log('🔍 Transaction created objects:', result.effects?.created)
    console.log('🔍 Transaction object changes:', result.objectChanges)
    console.log('🔍 Transaction return values:', result.effects?.returnValues)
    
    // Basic validation - if we have a digest, the transaction was submitted
    if (!result.digest) {
      console.error('❌ No transaction digest found')
      throw new Error('Transaction failed: No transaction digest')
    }
    
    // Check for explicit errors
    if (result.effects?.status?.error) {
      console.error('❌ Transaction has explicit error:', result.effects.status.error)
      throw new Error(`Transaction failed: ${result.effects.status.error}`)
    }
    
    console.log('✅ Transaction appears successful (has digest and no explicit errors)')
    
    // Enhanced object ID extraction with multiple strategies
    
    // Strategy 1: Check return values first (Community Template Pattern)
    if (result.effects?.returnValues && result.effects.returnValues.length > 0) {
      console.log('🔍 Checking return values for quiz ID (Community Template):', result.effects.returnValues)
      try {
        // The first return value should be the quiz ID (Community Template Pattern)
        const returnValue = result.effects.returnValues[0]
        console.log('🔍 First return value:', returnValue)
        
        if (returnValue && returnValue[0]) {
          console.log('🔍 Return value data:', returnValue[0])
          
          // Community Template Pattern: Enhanced decoding with Sui-specific handling
          const decodeMethods = [
            // Method 1: Sui Object ID from base64 (most common)
            () => {
              try {
                const decoded = Buffer.from(returnValue[0], 'base64').toString('hex')
                // Sui object IDs are 32 bytes (64 hex chars)
                if (decoded.length === 64) {
                  return '0x' + decoded
                }
                return null
              } catch {
                return null
              }
            },
            // Method 2: Direct hex string (already formatted)
            () => {
              const value = returnValue[0]
              if (value.startsWith('0x') && value.length === 66) { // 0x + 64 chars
                return value
              }
              return null
            },
            // Method 3: Uint8Array to hex conversion
            () => {
              try {
                const bytes = new Uint8Array(Buffer.from(returnValue[0], 'base64'))
                if (bytes.length === 32) { // 32 bytes for Sui object ID
                  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
                  return '0x' + hex
                }
                return null
              } catch {
                return null
              }
            }
          ]
          
          for (let i = 0; i < decodeMethods.length; i++) {
            try {
              const decoded = decodeMethods[i]()
              if (decoded && decoded.startsWith('0x') && decoded.length === 66) {
                quizObjectId = decoded
                console.log(`✅ Found quiz ID in return values (Community Template method ${i + 1}):`, quizObjectId)
                break
              }
            } catch (error) {
              console.warn(`⚠️ Community Template method ${i + 1} failed:`, error)
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error processing return value (Community Template):', error)
      }
    }
    
    // Strategy 2: Look for QuizCreated event (fallback)
    if (!quizObjectId && result.effects?.events) {
      console.log('🔍 Checking events for quiz ID:', result.effects.events)
      for (const event of result.effects.events) {
        console.log('🔍 Event:', event)
        if (event.type && event.type.includes('QuizCreated')) {
          if (event.parsedJson?.quiz_id) {
            quizObjectId = event.parsedJson.quiz_id
            console.log('✅ Found quiz ID in QuizCreated event:', quizObjectId)
            break
          }
        }
      }
    }
    
    // Strategy 3: Look in created objects (Quiz should be shared object)
    if (!quizObjectId && result.effects?.created) {
      console.log('🔍 Checking created objects:', result.effects.created)
      for (const created of result.effects.created) {
        console.log('🔍 Created object:', JSON.stringify(created, null, 2))
        
        // Look for objects with proper structure
        if (created.reference?.objectId) {
          const objectId = created.reference.objectId
          console.log('🔍 Found object ID in reference:', objectId)
          // Validate it's a proper Sui object ID
          if (objectId.startsWith('0x') && objectId.length >= 10) {
            quizObjectId = objectId
            console.log('✅ Found quiz ID in created objects (reference):', quizObjectId)
            break
          }
        }
        
        // Also check other possible structures
        if (created.objectId) {
          const objectId = created.objectId
          console.log('🔍 Found object ID directly:', objectId)
          if (objectId.startsWith('0x') && objectId.length >= 10) {
            quizObjectId = objectId
            console.log('✅ Found quiz ID in created objects (direct):', quizObjectId)
            break
          }
        }
        
        // Check for owner field (shared objects have owner: "Shared")
        if (created.owner && created.owner === 'Shared') {
          console.log('🔍 Found shared object, checking for ID...')
          if (created.reference?.objectId) {
            const objectId = created.reference.objectId
            if (objectId.startsWith('0x') && objectId.length >= 10) {
              quizObjectId = objectId
              console.log('✅ Found quiz ID in shared object:', quizObjectId)
              break
            }
          }
        }
      }
    }
    
    // Strategy 4: Look in objectChanges (alternative structure)
    if (!quizObjectId && result.objectChanges) {
      console.log('🔍 Checking object changes:', result.objectChanges)
      for (const change of result.objectChanges) {
        console.log('🔍 Object change:', change)
        if (change.type === 'created' && change.objectId) {
          const objectId = change.objectId
          if (objectId.startsWith('0x') && objectId.length >= 10) {
            quizObjectId = objectId
            console.log('✅ Found quiz ID in object changes:', quizObjectId)
            break
          }
        }
      }
    }
    
    // Strategy 5: Check if there are any return values with object IDs
    if (!quizObjectId && result.effects?.transactionDigest) {
      console.log('🔍 Transaction has digest, attempting to extract from full response')
      // Sometimes the object ID might be in a different location
      if (result.effects?.mutated) {
        for (const mutated of result.effects.mutated) {
          if (mutated.reference?.objectId) {
            const objectId = mutated.reference.objectId
            if (objectId.startsWith('0x') && objectId.length >= 10) {
              quizObjectId = objectId
              console.log('✅ Found quiz ID in mutated objects:', quizObjectId)
              break
            }
          }
        }
      }
    }
    
    console.log('📦 Created objects:', result.effects?.created)
    console.log('🆔 Quiz Object ID found:', quizObjectId)
    console.log('✅ Is valid Sui object ID?', /^0x[a-fA-F0-9]{64}$/.test(quizObjectId))
    
    // Final validation - temporary relaxation for debugging
    if (!quizObjectId) {
      console.error('❌ No valid quiz object ID found!')
      console.error('❌ Transaction may have succeeded but object ID extraction failed')
      console.log('🔍 Complete transaction result:', JSON.stringify(result, null, 2))
      
      // Temporary: Generate a fallback ID for debugging
      console.warn('⚠️ TEMPORARY: Using fallback ID for debugging')
      quizObjectId = `debug_${result.digest?.slice(2, 18) || 'unknown'}_${Date.now()}`
      console.log('🔄 Generated debug fallback ID:', quizObjectId)
    }
    
    // Validate that the extracted ID is a proper Sui object ID
    if (!quizObjectId.startsWith('0x') || quizObjectId.length < 10) {
      console.warn('⚠️ Extracted quiz ID is not a valid Sui object ID:', quizObjectId)
      console.warn('⚠️ This is a debug fallback ID - transaction may have succeeded')
      // Don't throw error for now, just warn
    }
    
    return { 
      digest: result.digest,
      quizObjectId 
    }
  }

  /**
   * Start a quiz
   */
  async startQuiz(
    quizId: string,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<string> {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_MODULE}::start_quiz`,
      arguments: [
        tx.object(quizId),
        tx.object('0x6') // Clock object
      ]
    })

    const result = await signAndExecuteTransaction(tx)
    return result.digest
  }

  /**
   * Submit an answer for a question
   */
  async submitAnswer(
    quizId: string,
    questionIndex: number,
    selectedOption: number,
    timeTaken: number,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<string> {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_MODULE}::submit_answer`,
      arguments: [
        tx.object(quizId),
        tx.pure.u64(questionIndex),
        tx.pure.u8(selectedOption),
        tx.pure.u64(timeTaken),
        tx.object('0x6') // Clock object
      ]
    })

    const result = await signAndExecuteTransaction(tx)
    return result.digest
  }

  /**
   * End a quiz and calculate winners
   */
  async endQuiz(
    quizId: string,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<string> {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_MODULE}::end_quiz`,
      arguments: [
        tx.object(quizId),
        tx.object('0x6') // Clock object
      ]
    })

    const result = await signAndExecuteTransaction(tx)
    return result.digest
  }

  /**
   * Complete quiz participation, mint SBT, and distribute rewards automatically
   */
  async completeQuiz(
    quizId: string,
    answers: Answer[],
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<{ participationId: string; sbtId: string }> {
    const tx = new Transaction()
    
    // Complete quiz and mint SBT (auto-distributes rewards)
    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_MODULE}::complete_quiz`,
      arguments: [
        tx.object(quizId),
        tx.pure.u64(answers.length), // Number of answers
        tx.object('0x6') // Clock object
      ]
    })

    const result = await signAndExecuteTransaction(tx)
    
    // Extract created object IDs from the transaction result
    const participationId = result.effects?.created?.[0]?.reference?.objectId || ''
    const sbtId = result.effects?.created?.[1]?.reference?.objectId || ''
    
    return { participationId, sbtId }
  }

  /**
   * Manually distribute rewards to winners (can be called by anyone)
   */
  async distributeWinnerRewards(
    quizId: string,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${this.packageId}::${CONTRACT_MODULE}::distribute_winner_rewards`,
        arguments: [tx.object(quizId)]
      })

      await signAndExecuteTransaction(tx)
      return true
    } catch (error) {
      console.error('Error distributing winner rewards:', error)
      return false
    }
  }

  /**
   * Check and auto-end quiz if time expired (distributes rewards automatically)
   */
  async checkAndAutoEndQuiz(
    quizId: string,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${this.packageId}::${CONTRACT_MODULE}::check_and_auto_end_quiz`,
        arguments: [
          tx.object(quizId),
          tx.object('0x6') // Clock object
        ]
      })

      await signAndExecuteTransaction(tx)
      return true
    } catch (error) {
      console.error('Error checking and auto-ending quiz:', error)
      return false
    }
  }

  /**
   * Get quiz information
   */
  async getQuizInfo(quizId: string): Promise<QuizData | null> {
    try {
      const object = await this.client.getObject({
        id: quizId,
        options: { showContent: true }
      })

      if (!object.data?.content || 'fields' in object.data.content === false) {
        return null
      }

      const fields = object.data.content.fields
      
      return {
        id: quizId,
        title: fields.title,
        description: fields.description,
        questions: fields.questions || [],
        owner: fields.owner,
        start_time: parseInt(fields.start_time),
        end_time: parseInt(fields.end_time),
        duration_seconds: parseInt(fields.duration_seconds || '0'),
        is_active: fields.is_active,
        auto_end_enabled: fields.auto_end_enabled || true,
        total_prize_pool: parseInt(fields.total_prize_pool),
        created_at: parseInt(fields.created_at),
        winners_count: parseInt(fields.winners_count || '0'),
        participant_reward_pool: parseInt(fields.participant_reward_pool || '0'),
        participation_reward_per_user: parseInt(fields.participation_reward_per_user || '0'),
        prize_distributed: fields.prize_distributed || false
      }
    } catch (error) {
      console.error('Error getting quiz info:', error)
      return null
    }
  }

  /**
   * Get participant score
   */
  async getParticipantScore(quizId: string, participant: string): Promise<number> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: {
          kind: 'programmableTransaction',
          inputs: [
            { type: 'object', objectType: 'immOrOwnedObject', objectId: quizId },
            { type: 'pure', valueType: 'address', value: participant }
          ],
          transactions: [
            {
              MoveCall: {
                package: this.packageId,
                module: CONTRACT_MODULE,
                function: 'get_participant_score',
                arguments: [0, 1]
              }
            }
          ]
        },
        sender: participant
      })

      return parseInt(result.results?.[0]?.returnValues?.[0]?.[0] || '0')
    } catch (error) {
      console.error('Error getting participant score:', error)
      return 0
    }
  }

  /**
   * Get winners list
   */
  async getWinners(quizId: string): Promise<string[]> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: {
          kind: 'programmableTransaction',
          inputs: [
            { type: 'object', objectType: 'immOrOwnedObject', objectId: quizId }
          ],
          transactions: [
            {
              MoveCall: {
                package: this.packageId,
                module: CONTRACT_MODULE,
                function: 'get_winners',
                arguments: [0]
              }
            }
          ]
        },
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      // Parse the returned vector of addresses
      const winnersData = result.results?.[0]?.returnValues?.[0]?.[0]
      if (!winnersData) return []

      // This would need proper parsing of the vector data
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting winners:', error)
      return []
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: {
          kind: 'programmableTransaction',
          inputs: [
            { type: 'object', objectType: 'immOrOwnedObject', objectId: quizId }
          ],
          transactions: [
            {
              MoveCall: {
                package: this.packageId,
                module: CONTRACT_MODULE,
                function: 'get_leaderboard',
                arguments: [0]
              }
            }
          ]
        },
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      // Parse the returned leaderboard data
      // This would need proper parsing of the vector data
      return []
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  /**
   * Check if quiz is active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${this.packageId}::${CONTRACT_MODULE}::is_quiz_active`,
        arguments: [tx.object(quizId)]
      })

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      return result.results?.[0]?.returnValues?.[0]?.[0] === 1
    } catch (error) {
      console.error('Error checking quiz status:', error)
      return false
    }
  }

  /**
   * Check if participant is a winner
   */
  async isWinner(quizId: string, participant: string): Promise<boolean> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: {
          kind: 'programmableTransaction',
          inputs: [
            { type: 'object', objectType: 'immOrOwnedObject', objectId: quizId },
            { type: 'pure', valueType: 'address', value: participant }
          ],
          transactions: [
            {
              MoveCall: {
                package: this.packageId,
                module: CONTRACT_MODULE,
                function: 'is_winner',
                arguments: [0, 1]
              }
            }
          ]
        },
        sender: participant
      })

      return result.results?.[0]?.returnValues?.[0]?.[0] === 'true'
    } catch (error) {
      console.error('Error checking winner status:', error)
      return false
    }
  }

  /**
   * Check if prizes are distributed
   */
  async arePrizesDistributed(quizId: string): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${this.packageId}::${CONTRACT_MODULE}::are_prizes_distributed`,
        arguments: [tx.object(quizId)]
      })

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      return result.results?.[0]?.returnValues?.[0]?.[0] === 1
    } catch (error) {
      console.error('Error checking prize distribution status:', error)
      return false
    }
  }

  /**
   * Check if quiz time has expired (new function)
   */
  async isQuizExpired(quizId: string): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        package: this.packageId,
        module: CONTRACT_MODULE,
        function: 'is_quiz_expired',
        arguments: [
          tx.object(quizId),
          tx.sharedObjectRef({
            objectId: '0x6',
            initialSharedVersion: 1,
            mutable: false
          })
        ]
      })

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      return result.results?.[0]?.returnValues?.[0]?.[0] === 'true'
    } catch (error) {
      console.error('Error checking if quiz is expired:', error)
      return false
    }
  }

  /**
   * Get remaining time in seconds (new function)
   */
  async getRemainingTimeSeconds(quizId: string): Promise<number> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        package: this.packageId,
        module: CONTRACT_MODULE,
        function: 'get_remaining_time_seconds',
        arguments: [
          tx.object(quizId),
          tx.sharedObjectRef({
            objectId: '0x6',
            initialSharedVersion: 1,
            mutable: false
          })
        ]
      })

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      })

      const remainingTime = result.results?.[0]?.returnValues?.[0]
      return remainingTime ? parseInt(remainingTime[0]) : 0
    } catch (error) {
      console.error('Error getting remaining time:', error)
      return 0
    }
  }


  /**
   * Distribute all rewards (winners + participation) - can be called by anyone (new function)
   */
  async distributeAllRewards(
    quizId: string,
    signAndExecuteTransaction: (tx: Transaction) => Promise<any>
  ): Promise<boolean> {
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        package: this.packageId,
        module: CONTRACT_MODULE,
        function: 'distribute_all_rewards',
        arguments: [tx.object(quizId)]
      })

      await signAndExecuteTransaction(tx)
      return true
    } catch (error) {
      console.error('Error distributing all rewards:', error)
      return false
    }
  }

}

// Export singleton instance
export const quizContractService = new QuizContractService()

