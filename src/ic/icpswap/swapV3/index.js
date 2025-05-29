import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./swapFactory.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */


export const createSwapFactoryActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // TODO: CRITICAL - This canister ID is incorrect and causing 404 errors
  // The current ID "4mmnk-kiaaa-aaaag-qbllq-cai" does not exist or is not accessible
  // Need to find the correct ICPSwap V3 factory canister ID for mainnet
  // Possible alternatives to investigate:
  // - ggzvv-5qaaa-aaaag-qck7a-cai (common ICPSwap reference)
  // - Contact ICPSwap team for the correct mainnet factory canister ID
  // - Check https://icpswap.com or ICPSwap documentation for mainnet addresses
  
  // Temporarily throwing an error to prevent 404 failures
  throw new Error("ICPSwap factory canister ID needs to be updated. Current ID is invalid: 4mmnk-kiaaa-aaaag-qbllq-cai");

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId:"4mmnk-kiaaa-aaaag-qbllq-cai",
    ...options.actorOptions,
  });
};

