import { inject, Injectable } from '@angular/core';
import { Score } from '../models';
import { ScoreRepository, SCORE_REPOSITORY } from '../repositories';

@Injectable({
  providedIn: 'root'
})
export class ScoreUseCase {
  private readonly scoreRepository = inject(SCORE_REPOSITORY);

  async createScore(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score> {
    return this.scoreRepository.create(score);
  }

  async getTopScores(limit: number = 10): Promise<Score[]> {
    return this.scoreRepository.getTopScores(limit);
  }

  async getScoresByPlayer(playerId: string): Promise<Score[]> {
    return this.scoreRepository.getByPlayerId(playerId);
  }
}
