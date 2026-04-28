import { inject, Injectable, signal } from '@angular/core';
import { SprayingFlowService } from '../../services/spraying-flow/spraying-flow-service';
import type {
  SprayingSession,
  SprayingSessionVisualization,
} from '../../../domain/models/spraying-session.model';

@Injectable({
  providedIn: 'root',
})
export class SprayingFlowRepository {
  private sprayingFlowService = inject(SprayingFlowService);

  public sessions = signal<SprayingSession[]>([]);
  public selectedSessionId = signal<string | null>(null);
  public selectedVisualization = signal<SprayingSessionVisualization | null>(null);
  public isLoadingSessions = signal<boolean>(false);
  public isLoadingVisualization = signal<boolean>(false);
  public error = signal<string | null>(null);

  public async fetchSessions(): Promise<void> {
    this.isLoadingSessions.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.sprayingFlowService.getSessions();
      if (error) throw error;

      const sessions = data ?? [];
      this.sessions.set(sessions);

      if (sessions.length === 0) {
        this.selectedSessionId.set(null);
        this.selectedVisualization.set(null);
        return;
      }

      const currentSelectedId = this.selectedSessionId();
      const nextSessionId =
        currentSelectedId && sessions.some((session) => session.id === currentSelectedId)
          ? currentSelectedId
          : sessions[0].id;
    } catch (error) {
      this.error.set(`Error fetching spraying sessions\n${JSON.stringify(error)}`);
    } finally {
      this.isLoadingSessions.set(false);
    }

    const currentSelectedId = this.selectedSessionId();
    const sessions = this.sessions();
    if (sessions.length === 0) {
      return;
    }

    const nextSessionId =
      currentSelectedId && sessions.some((session) => session.id === currentSelectedId)
        ? currentSelectedId
        : sessions[0].id;

    void this.selectSession(nextSessionId);
  }

  public async selectSession(sessionId: string): Promise<void> {
    this.selectedSessionId.set(sessionId);
    this.isLoadingVisualization.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.sprayingFlowService.getSessionVisualization(sessionId);
      if (error) throw error;
      this.selectedVisualization.set(data);
    } catch (error) {
      this.selectedVisualization.set(null);
      this.error.set(`Error fetching spraying session visualization\n${JSON.stringify(error)}`);
    } finally {
      this.isLoadingVisualization.set(false);
    }
  }

  public async refreshSelectedSession(): Promise<void> {
    const sessionId = this.selectedSessionId();
    if (!sessionId) return;

    await this.selectSession(sessionId);
  }
}
