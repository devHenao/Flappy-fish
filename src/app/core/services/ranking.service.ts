import { inject, Injectable } from '@angular/core';
import { Score } from '@domain/models';
import { ScoreUseCase } from '@core/use-cases';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private readonly scoreUseCase = inject(ScoreUseCase);

  getTopScores(limit = 10): Promise<Score[]> {
    return this.scoreUseCase.getTopScores(limit);
  }

  getScoresByAlias(alias: string): Promise<Score[]> {
    return this.scoreUseCase.getScoresByAlias(alias);
  }
}
