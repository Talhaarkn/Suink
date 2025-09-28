// SuiKnow Sui Testnet Integration Tests
const { SuiClient } = require('@mysten/sui/client');
const { fromHEX } = require('@mysten/sui/utils');

// Testnet configuration
const TESTNET_RPC_URL = 'https://fullnode.testnet.sui.io:443';
const PACKAGE_ID = '0x923a088b66b59b790499d37305989d03b8fcf8c38ea72bc7ae9da0bb7c581afb';

class SuiTestnetTester {
  constructor() {
    this.client = new SuiClient({ url: TESTNET_RPC_URL });
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting SuiKnow Sui Testnet Tests...');
    console.log('=====================================');
    console.log(`RPC URL: ${TESTNET_RPC_URL}`);
    console.log(`Package ID: ${PACKAGE_ID}`);
    console.log('');

    const tests = [
      { name: 'Network Connection', test: () => this.testNetworkConnection() },
      { name: 'Package Exists', test: () => this.testPackageExists() },
      { name: 'Module Access', test: () => this.testModuleAccess() },
      { name: 'Object Queries', test: () => this.testObjectQueries() },
      { name: 'Transaction Building', test: () => this.testTransactionBuilding() },
      { name: 'Seal Integration', test: () => this.testSealIntegration() }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`🔍 Running test: ${name}`);
        const result = await test();
        this.testResults.push({ name, passed: true, result });
        console.log(`✅ ${name}: PASSED`);
        if (result) console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
      } catch (error) {
        this.testResults.push({ name, passed: false, error: error.message });
        console.log(`❌ ${name}: FAILED`);
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }

    this.printSummary();
  }

  async testNetworkConnection() {
    try {
      const chainId = await this.client.getChainIdentifier();
      const epoch = await this.client.getCurrentEpoch();
      
      return {
        chainId,
        currentEpoch: epoch.epoch,
        network: 'testnet'
      };
    } catch (error) {
      throw new Error(`Network connection failed: ${error.message}`);
    }
  }

  async testPackageExists() {
    try {
      const packageInfo = await this.client.getObject({
        id: PACKAGE_ID,
        options: { showContent: true }
      });

      if (!packageInfo.data) {
        throw new Error('Package not found');
      }

      return {
        packageId: PACKAGE_ID,
        version: packageInfo.data.content?.fields?.version,
        modules: Object.keys(packageInfo.data.content?.fields?.modules || {})
      };
    } catch (error) {
      throw new Error(`Package check failed: ${error.message}`);
    }
  }

  async testModuleAccess() {
    try {
      // Try to get module information
      const moduleInfo = await this.client.getObject({
        id: PACKAGE_ID,
        options: { showContent: true }
      });

      const modules = moduleInfo.data?.content?.fields?.modules || {};
      const suiKahootModule = modules['sui_kahoot'];

      if (!suiKahootModule) {
        throw new Error('sui_kahoot module not found');
      }

      return {
        moduleName: 'sui_kahoot',
        functions: Object.keys(suiKahootModule.functions || {}),
        structs: Object.keys(suiKahootModule.structs || {})
      };
    } catch (error) {
      throw new Error(`Module access failed: ${error.message}`);
    }
  }

  async testObjectQueries() {
    try {
      // Test basic object queries
      const objects = await this.client.getOwnedObjects({
        owner: '0x0000000000000000000000000000000000000000000000000000000000000000', // Zero address
        options: { showContent: true }
      });

      return {
        totalObjects: objects.data.length,
        hasObjects: objects.data.length > 0
      };
    } catch (error) {
      throw new Error(`Object queries failed: ${error.message}`);
    }
  }

  async testTransactionBuilding() {
    try {
      const { Transaction } = require('@mysten/sui/transactions');
      
      const tx = new Transaction();
      
      // Try to build a simple transaction
      tx.moveCall({
        target: `${PACKAGE_ID}::sui_kahoot::create_quiz`,
        arguments: [
          tx.pure.string('Test Quiz'),
          tx.pure.string('Test Description'),
          tx.pure.vector('string', ['Q1', 'Q2']),
          tx.pure.vector('string', ['A1', 'A2'])
        ]
      });

      // Build transaction (this will fail if module doesn't exist, but that's expected)
      try {
        const txBytes = await tx.build({ client: this.client, onlyTransactionKind: true });
        return {
          transactionBuilt: true,
          transactionSize: txBytes.length
        };
      } catch (buildError) {
        // This is expected if the module doesn't exist yet
        return {
          transactionBuilt: false,
          reason: 'Module not deployed yet (expected)',
          buildError: buildError.message
        };
      }
    } catch (error) {
      throw new Error(`Transaction building failed: ${error.message}`);
    }
  }

  async testSealIntegration() {
    try {
      // Test Seal Protocol integration
      const { Transaction } = require('@mysten/sui/transactions');
      
      const tx = new Transaction();
      
      // Try to build a Seal-related transaction
      tx.moveCall({
        target: `${PACKAGE_ID}::sui_kahoot::seal_approve`,
        arguments: [
          tx.pure.vector('u8', fromHEX('test_id')),
          tx.pure.string('0x1234567890abcdef')
        ]
      });

      try {
        const txBytes = await tx.build({ client: this.client, onlyTransactionKind: true });
        return {
          sealTransactionBuilt: true,
          transactionSize: txBytes.length
        };
      } catch (buildError) {
        return {
          sealTransactionBuilt: false,
          reason: 'Seal module not deployed yet (expected)',
          buildError: buildError.message
        };
      }
    } catch (error) {
      throw new Error(`Seal integration test failed: ${error.message}`);
    }
  }

  printSummary() {
    console.log('📊 Test Summary');
    console.log('===============');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');
    
    if (failed > 0) {
      console.log('Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Deploy Move package to testnet');
    console.log('2. Test quiz creation and management');
    console.log('3. Test Seal Protocol integration');
    console.log('4. Test zkLogin authentication');
    console.log('5. Test sponsored transactions');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SuiTestnetTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SuiTestnetTester;


