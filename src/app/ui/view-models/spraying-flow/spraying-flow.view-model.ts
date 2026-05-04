import { computed, inject, Injectable } from '@angular/core';
import { SprayingFlowRepository } from '../../../data/repositories/spraying-flow/spraying-flow-repository';

@Injectable()
export class SprayingFlowViewModel {
  private sprayingFlowRepository = inject(SprayingFlowRepository);

  public sessions = this.sprayingFlowRepository.sessions;
  public selectedSessionId = this.sprayingFlowRepository.selectedSessionId;
  public selectedVisualization = this.sprayingFlowRepository.selectedVisualization;
  public isLoadingSessions = this.sprayingFlowRepository.isLoadingSessions;
  public isLoadingVisualization = this.sprayingFlowRepository.isLoadingVisualization;
  public error = this.sprayingFlowRepository.error;

  public selectedSession = computed(() => this.selectedVisualization()?.session ?? null);
  public routePoints = computed(() => this.selectedVisualization()?.routePoints ?? []);
  public plants = computed(() => this.selectedVisualization()?.plants ?? []);
  public products = computed(() => this.selectedVisualization()?.products ?? []);
  public totalSessions = computed(() => this.sessions().length);
  public totalRoutePoints = computed(() => this.routePoints().length);
  public totalPlants = computed(() => this.plants().length);
  public totalProducts = computed(() => this.products().length);

  public async loadSessions(): Promise<void> {
    await this.sprayingFlowRepository.fetchSessions();
  }

  public async selectSession(sessionId: string): Promise<void> {
    await this.sprayingFlowRepository.selectSession(sessionId);
  }

  public async refreshSelectedSession(): Promise<void> {
    await this.sprayingFlowRepository.refreshSelectedSession();
  }
}
