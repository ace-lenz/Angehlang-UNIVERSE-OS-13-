import { Mission, MissionStep, Artifact } from '@/types';
import { artifactStore } from '@/storage/ArtifactStore';
import { autonomousOrchestrator } from './AutonomousOrchestrator';

/**
 * MissionEngine - Orchestrates complex, multi-agent missions.
 * Inspired by Google Antigravity's 'Commander's Intent'.
 */
export class MissionEngine {
  private static STORAGE_KEY = 'angeh_mission_store_v4';
  private missions: Map<string, Mission> = new Map();

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const data = localStorage.getItem(MissionEngine.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        Object.entries(parsed).forEach(([id, mission]) => {
          this.missions.set(id, mission as Mission);
        });
        console.log(`[MissionEngine] Hydrated ${this.missions.size} missions.`);
      }
    } catch (e) {
      console.warn('[MissionEngine] Hydration failed:', e);
    }
  }

  private persist() {
    try {
      const obj = Object.fromEntries(this.missions);
      localStorage.setItem(MissionEngine.STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('[MissionEngine] Persistence failed:', e);
    }
  }

  /**
   * Start a new mission
   */
  public async createMission(name: string, description: string, steps: Partial<MissionStep>[]): Promise<Mission> {
    const id = `mission_${Date.now()}`;
    const newMission: Mission = {
      id,
      name,
      description,
      status: 'active',
      steps: steps.map((s, idx) => ({
        id: `${id}_step_${idx}`,
        role: s.role || 'generalist',
        action: s.action || 'assist',
        status: 'pending',
        multiFile: s.multiFile || false
      })),
      artifacts: [],
      startTime: Date.now()
    };

    this.missions.set(id, newMission);
    this.persist();
    console.log(`[MissionEngine] Created Mission: ${name} (${id})`);
    return newMission;
  }

  /**
   * Execute a step in a mission and generate an artifact
   * Includes autonomous validation and self-correction loop.
   */
  public async executeStep(missionId: string, stepId: string, result: any, artifactType: Artifact['type'], agentId: string): Promise<void> {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    const step = mission.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'active';
      this.persist();

      let finalResult = result;
      let repairLogs = '';

      // ── Autonomous Validation Loop ──────────────────────────────────────────
      if (artifactType === 'code_diff' || (typeof result === 'string' && (result.includes('export') || result.includes('import')))) {
         const validation = await autonomousOrchestrator.orchestrate(
           typeof result === 'string' ? result : JSON.stringify(result),
           `Validation for Step: ${step.role} -> ${step.action}`
         );

         if (validation.status === 'REPAIRED' && validation.repairedCode) {
            finalResult = validation.repairedCode;
            repairLogs = `[SAO] Logic repaired autonomously from error: ${validation.originalError}`;
         } else if (validation.status === 'CRITICAL') {
            step.status = 'failed';
            this.persist();
            console.error(`[MissionEngine] Step ${stepId} failed validation critically.`);
            return;
         }
      }

      step.status = 'completed';
      step.result = finalResult;

      // Create artifact from step result
      const artifact: Artifact = {
        id: `art_${Date.now()}_${stepId}`,
        type: artifactType,
        content: finalResult,
        createdBy: agentId,
        parentMissionId: missionId,
        timestamp: Date.now(),
        metadata: {
           repairLogs
        }
      };

      artifactStore.save(artifact);
      mission.artifacts.push(artifact.id);

      // Check if all steps complete
      const allDone = mission.steps.every(s => s.status === 'completed' || s.status === 'failed');
      if (allDone) {
        mission.status = mission.steps.some(s => s.status === 'failed') ? 'failed' : 'completed';
        mission.endTime = Date.now();
      }

      this.persist();
      console.log(`[MissionEngine] Finalized step ${stepId} for mission ${missionId}`);
    }
  }

  /**
   * Get mission details
   */
  public getMission(id: string): Mission | undefined {
    return this.missions.get(id);
  }

  /**
   * List all missions
   */
  public listMissions(): Mission[] {
    return Array.from(this.missions.values()).sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Delete a mission
   */
  public deleteMission(id: string): void {
    const mission = this.getMission(id);
    if (mission) {
      // Cleanup artifacts?
      mission.artifacts.forEach(aid => {
        artifactStore.delete(aid);
      });
      this.missions.delete(id);
      this.persist();
    }
  }
}

export const missionEngine = new MissionEngine();
