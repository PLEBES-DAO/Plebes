// Test script to debug frontend calls
import { createActor } from './src/declarations/backend/index.js';

const stakingCanisterId = "qyxbw-vyaaa-aaaag-auepq-cai";

async function testCalls() {
  try {
    console.log('Creating actor...');
    const actor = createActor(stakingCanisterId, {
      agentOptions: { host: 'https://icp-api.io' }
    });

  console.log('Testing get_early_staking_stats...');
    const slotsRemaining = await actor.get_early_staking_stats();
    console.log('Slots remaining:', slotsRemaining);
    console.log('Participants (computed):', 100 - Number(slotsRemaining));

    console.log('Testing get_burn_stats...');
    const burnStats = await actor.get_burn_stats();
    console.log('Burn stats:', burnStats);

    console.log('Testing get_protocol_stats...');
    const protocolStats = await actor.get_protocol_stats();
    console.log('Protocol stats:', protocolStats);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCalls();
