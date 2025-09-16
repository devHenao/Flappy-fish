import { Injectable } from '@angular/core';
import { Score } from '../models';
import { ScoreRepository } from './score-repository.interface';

@Injectable({
  providedIn: 'root'
})
export class InMemoryScoreRepository implements ScoreRepository {
  private scores: Score[] = [];
  private nextId = 1;

  async create(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score> {
    const newScore: Score = {
      ...score,
      id: this.nextId++,
      createdAt: new Date()
    };
    this.scores.push(newScore);
    return newScore;
  }

  async getTopScores(limit: number = 10): Promise<Score[]> {
    return [...this.scores]
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  async getByPlayerId(playerId: string): Promise<Score[]> {
    return this.scores
      .filter(score => score.alias === playerId)
      .sort((a, b) => b.points - a.points);
  }

  async getById(id: string): Promise<Score | null> {
    const numericId = parseInt(id, 10);
    return this.scores.find(score => score.id === numericId) || null;
  }

  async update(id: string, scoreUpdate: Partial<Score>): Promise<Score> {
    const numericId = parseInt(id, 10);
    const index = this.scores.findIndex(s => s.id === numericId);
    if (index === -1) {
      throw new Error(`Score with id ${id} not found`);
    }
    
    this.scores[index] = { ...this.scores[index], ...scoreUpdate };
    return this.scores[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.scores.length;
    const numericId = parseInt(id, 10);
    this.scores = this.scores.filter(score => score.id !== numericId);
    return this.scores.length < initialLength;
  }
}
