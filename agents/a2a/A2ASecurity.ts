/**
 * A2ASecurity.ts
 * 
 * Provides cryptographic handshake and identity verification for the A2A system.
 * Ensures only authorized agents can communicate within the Sovereign Lattice.
 */

import { neuralTelemetry } from '@/engine/NeuralTelemetry';

export interface SovereignHandshake {
  agentId: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

export class A2ASecurity {
  private static instance: A2ASecurity;
  private sovereignSecret: string = 'SOVEREIGN_ROOT_DNA_KEY_v5.0';

  private constructor() {}

  public static getInstance(): A2ASecurity {
    if (!A2ASecurity.instance) {
      A2ASecurity.instance = new A2ASecurity();
    }
    return A2ASecurity.instance;
  }

  /**
   * Generates a unique handshake for an agent request.
   */
  public generateHandshake(agentId: string): SovereignHandshake {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    const signature = this.sign(`${agentId}:${timestamp}:${nonce}`);
    
    return { agentId, timestamp, nonce, signature };
  }

  /**
   * Verifies a handshake from a remote agent.
   */
  public verifyHandshake(handshake: SovereignHandshake): boolean {
    const { agentId, timestamp, nonce, signature } = handshake;
    
    // 1. Check timestamp (prevent replay attacks, allow 30s drift)
    if (Math.abs(Date.now() - timestamp) > 30000) {
      neuralTelemetry.logFault('A2A_SECURITY', `Handshake expired for ${agentId}`, 'error');
      return false;
    }

    // 2. Verify signature
    const expectedSignature = this.sign(`${agentId}:${timestamp}:${nonce}`);
    if (signature !== expectedSignature) {
      neuralTelemetry.logFault('A2A_SECURITY', `Invalid signature from ${agentId}`, 'critical');
      return false;
    }

    return true;
  }

  private sign(payload: string): string {
    // Simulated cryptographic signing (In a real scenario, use SubtleCrypto)
    let hash = 0;
    const fullPayload = payload + this.sovereignSecret;
    for (let i = 0; i < fullPayload.length; i++) {
      hash = (hash << 5) - hash + fullPayload.charCodeAt(i);
      hash |= 0;
    }
    return `SIG_${Math.abs(hash).toString(16)}`;
  }
}

export const a2aSecurity = A2ASecurity.getInstance();
