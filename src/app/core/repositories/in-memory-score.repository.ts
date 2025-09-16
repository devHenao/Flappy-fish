import { Injectable } from '@angular/core';
import { Score } from '../../domain/models';
import { ScoreRepository } from './score-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class InMemoryScoreRepository implements ScoreRepository {
  private scores: Score[] = [];
  private nextId = 1;

  async create(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score> {
    const newScore: Score = {
      ...score,
      id: this.nextId++,
      createdAt: new Date(),
    };
    this.scores.push(newScore);
    return newScore;
  }

  async getTopScores(limit: number = 10): Promise<Score[]> {
    return [...this.scores].sort((a, b) => b.points - a.points).slice(0, limit);
  }

  async getByPlayerId(playerId: string): Promise<Score[]> {
    return this.scores
      .filter((score) => score.alias === playerId)
      .sort((a, b) => b.points - a.points);
  }

  async getById(id: string): Promise<Score | null> {
    const numericId = parseInt(id, 10);
    return this.scores.find((score) => score.id === numericId) || null;
  }
}
