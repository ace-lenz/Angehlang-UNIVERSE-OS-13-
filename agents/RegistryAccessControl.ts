import { sovereignVault, SovereignVault } from '../storage/SovereignVault';

type AccessTier = 'admin' | 'write' | 'read';

interface AgentAccess {
  agentId: string;
  tier: AccessTier;
  grantedBy: string;
  grantedAt: number;
}

export class RegistryAccessControl {
  private vault: SovereignVault;
  private static instance: RegistryAccessControl;
  
  private readonly ADMIN_AGENTS = ['Lead_Engineer', 'PerfectionistAgent', 'SecurityAuditor'];
  private readonly WRITE_AGENTS = ['ArchitectAgent', 'CodeAgent', 'ChangeLogger', 'AutomationAgent'];
  private readonly ALL_AGENTS = 'All_Agents';

  private constructor() {
    this.vault = sovereignVault;
  }

  static getInstance(): RegistryAccessControl {
    if (!RegistryAccessControl.instance) {
      RegistryAccessControl.instance = new RegistryAccessControl();
    }
    return RegistryAccessControl.instance;
  }

  async canAccess(agentId: string, requiredTier: AccessTier): Promise<boolean> {
    const access = await this.getAgentAccess(agentId);
    
    if (requiredTier === 'read') {
      return access.tier === 'admin' || access.tier === 'write' || access.tier === 'read' || agentId === this.ALL_AGENTS;
    }
    if (requiredTier === 'write') {
      return access.tier === 'admin' || access.tier === 'write';
    }
    if (requiredTier === 'admin') {
      return access.tier === 'admin';
    }
    return false;
  }

  private async getAgentAccess(agentId: string): Promise<AgentAccess> {
    const stored = await this.vault.get(`access_${agentId}`);
    if (stored) return stored as AgentAccess;

    const tier = this.ADMIN_AGENTS.includes(agentId) ? 'admin' as AccessTier :
                 this.WRITE_AGENTS.includes(agentId) ? 'write' as AccessTier :
                 'read' as AccessTier;

    return {
      agentId,
      tier,
      grantedBy: 'System',
      grantedAt: Date.now(),
    };
  }

  async logAccessAttempt(agentId: string, requestedTier: AccessTier, granted: boolean): Promise<void> {
    await this.vault.set(`access_attempt_${Date.now()}`, {
      agentId,
      requestedTier,
      granted,
      timestamp: Date.now(),
    });
  }

  async grantAccess(agentId: string, tier: AccessTier, grantedBy: string): Promise<void> {
    const access: AgentAccess = {
      agentId,
      tier,
      grantedBy,
      grantedAt: Date.now(),
    };
    await this.vault.set(`access_${agentId}`, access);
  }
}
