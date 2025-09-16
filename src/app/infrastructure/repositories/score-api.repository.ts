import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ScoreRepository } from '@core/repositories';
import { Score, CreateScoreDto } from '@domain/models';
import { apiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ScoreApiRepository implements ScoreRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${apiConfig.baseUrl}/scores`;

  create(score: CreateScoreDto): Promise<Score> {
    return firstValueFrom(
      this.http.post<Score>(this.apiUrl, score)
    );
  }

  getTopScores(limit = 10): Promise<Score[]> {
    return firstValueFrom(
      this.http.get<Score[]>(`${this.apiUrl}/top?limit=${limit}`)
    );
  }

  getByPlayerId(alias: string): Promise<Score[]> {
    return firstValueFrom(
      this.http.get<Score[]>(`${this.apiUrl}/alias/${alias}`)
    );
  }

  getById(id: string): Promise<Score | null> {
    console.warn('getById is not implemented in ScoreApiRepository');
    return Promise.resolve(null);
  }
}
