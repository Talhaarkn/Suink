import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

/**
 * Package ID for SuiLinkTree - Deployed to Sui Testnet
 * 
 * Package ID: 0xa3e899191de3c7cfb334ec890d97f5c1fec7a189f4b525824c7f30fc9cdfebec
 * ProfileRegistry ID: 0xea275751172d6e3e99dd33f8891c0ded3091306056d158f16435657dec881275
 */
const PACKAGE_ID = "0xa3e899191de3c7cfb334ec890d97f5c1fec7a189f4b525824c7f30fc9cdfebec";

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
