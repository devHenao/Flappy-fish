import { InjectionToken } from '@angular/core';
import { Score } from '../../domain/models/score.model';

export interface ScoreRepository {
  create(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score>;
  getTopScores(limit?: number): Promise<Score[]>;
  getByPlayerId(playerId: string): Promise<Score[]>;
  getById(id: string): Promise<Score | null>;
}

export const SCORE_REPOSITORY = new InjectionToken<ScoreRepository>('ScoreRepository');
