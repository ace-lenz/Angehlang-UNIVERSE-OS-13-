import { sovereignVault, SovereignVault } from '../storage/SovereignVault';
import { v4 as uuidv4 } from 'uuid';

interface ChangeRecord {
  id: string;
  timestamp: number;
  filePath: string;
  changeType: 'create' | 'modify' | 'delete';
  planItemId?: string;
  agentId: string;
  summary: string;
  diffHash: string;
  systemRelevanceScore?: number;
}

interface RegistryAccess {
  timestamp: number;
  agentId: string;
  accessType: 'read' | 'write' | 'admin';
  success: boolean;
}

export class ChangeLogger {
  private vault: SovereignVault;
  private static instance: ChangeLogger;

  private constructor() {
    this.vault = sovereignVault;
  }

  static getInstance(): ChangeLogger {
    if (!ChangeLogger.instance) {
      ChangeLogger.instance = new ChangeLogger();
    }
    return ChangeLogger.instance;
  }

  async logChange(record: Omit<ChangeRecord, 'id' | 'timestamp'>): Promise<string> {
    const changeId = `CHG-${uuidv4().slice(0, 8)}`;
    const fullRecord: ChangeRecord = {
      ...record,
      id: changeId,
      timestamp: Date.now(),
    };

    await this.vault.set(`change_${changeId}`, fullRecord);
    await this.updateModificationLog(fullRecord);
    return changeId;
  }

  async logAccess(access: Omit<RegistryAccess, 'timestamp'>): Promise<void> {
    const accessRecord: RegistryAccess = {
      ...access,
      timestamp: Date.now(),
    };
    await this.vault.set(`access_${uuidv4().slice(0, 8)}`, accessRecord);
  }

  private async updateModificationLog(record: ChangeRecord): Promise<void> {
    const planPath = 'PLANS/StudioImprovementPlan.md';
    const existingLog = ((await this.vault.get('modification_log')) as any[]) || [];
    existingLog.push({
      file: record.filePath,
      time: record.timestamp,
      agent: record.agentId,
      planItem: record.planItemId || 'UNASSIGNED',
      summary: record.summary,
    });
    await this.vault.set('modification_log', existingLog);
  }

  async getChangesForFile(filePath: string): Promise<ChangeRecord[]> {
    const allKeys = this.vault.getKeys();
    const changeKeys = allKeys.filter(k => k.startsWith('change_'));
    const changes: ChangeRecord[] = [];
    for (const key of changeKeys) {
      const record = await this.vault.get(key) as ChangeRecord;
      if (record && record.filePath === filePath) {
        changes.push(record);
      }
    }
    return changes.sort((a, b) => b.timestamp - a.timestamp);
  }

  async validatePlanItemId(planItemId?: string): Promise<boolean> {
    if (!planItemId) return false;
    const validPatterns = /^((TI|TII|TIII|TIV|TV|TVI)-\d+|ERR-\d+|CHG-\w+)$/;
    return validPatterns.test(planItemId);
  }
}
