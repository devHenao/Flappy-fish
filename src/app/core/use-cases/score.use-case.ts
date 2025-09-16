import { inject, Injectable } from '@angular/core';
import { Score, CreateScoreDto } from '../../domain/models';
import { ScoreRepository, SCORE_REPOSITORY } from '../repositories';

@Injectable({
  providedIn: 'root'
})
export class ScoreUseCase {
  private scoreRepository = inject(SCORE_REPOSITORY);

  registerScore(score: CreateScoreDto): Promise<Score> {
    return this.scoreRepository.create(score);
  }

  getTopScores(limit: number = 10): Promise<Score[]> {
    return this.scoreRepository.getTopScores(limit);
  }

  getScoresByAlias(alias: string): Promise<Score[]> {
    return this.scoreRepository.getByPlayerId(alias);
  }
}
