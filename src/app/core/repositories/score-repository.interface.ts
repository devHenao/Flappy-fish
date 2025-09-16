import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Score } from '../models/score.model';

export interface ScoreRepository {
  create(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score>;
  getTopScores(limit?: number): Promise<Score[]>;
  getByPlayerId(playerId: string): Promise<Score[]>;
  getById(id: string): Promise<Score | null>;
  update(id: string, score: Partial<Score>): Promise<Score>;
  delete(id: string): Promise<boolean>;
}

export const SCORE_REPOSITORY = new InjectionToken<ScoreRepository>('ScoreRepository');
