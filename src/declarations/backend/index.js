import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./backend.did.js";
export { idlFactory } from "./backend.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId =
  process.env.CANISTER_ID_BACKEND;

export const createActor = (canisterId, options = {}) => {
  const agentOptions = { ...options.agentOptions };

  // Default to mainnet host if none provided (prevents local replica mismatch)
  if (!agentOptions.host) {
    agentOptions.host = 'https://icp-api.io';
  }

  const agent = options.agent || new HttpAgent(agentOptions);

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key only for local replica hosts
  const host = agentOptions.host || '';
  const isLocalHost = /localhost|127\.0\.0\.1|\:4943/.test(host);
  if (isLocalHost) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const backend = canisterId ? createActor(canisterId) : undefined;
