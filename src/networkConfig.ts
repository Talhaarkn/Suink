import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

/**
 * Package ID for Sui Kahoot - will be set after deployment
 * 
 * To get the package ID, run:
 * ```bash
 * sui move publish --gas-budget 100000000
 * ```
 * 
 * Then copy the PackageID from the output and replace the value below.
 */
const PACKAGE_ID = "0x923a088b66b59b790499d37305989d03b8fcf8c38ea72bc7ae9da0bb7c581afb";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: { packageId: PACKAGE_ID },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: { packageId: PACKAGE_ID },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: { packageId: PACKAGE_ID },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
