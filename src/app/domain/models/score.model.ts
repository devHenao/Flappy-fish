// Note: Using type-only imports to avoid circular dependencies
import type { Alias } from './alias.model';
import type { Session } from './session.model';

export interface Score {
  id: number;
  alias: string;
  points: number;
  maxCombo?: number | null;
  durationSec?: number | null;
  metadata?: string | null;
  sessionId?: string | null;  // GUID
  createdAt: Date;

  // Navigation properties (using type imports)
  aliasNavigation?: Alias;
  session?: Session;
}

export interface CreateScoreDto {
  alias: string;
  points: number;
  maxCombo?: number | null;
  durationSec?: number | null;
  metadata?: string | null;
  sessionId?: string | null;
}

export interface ScoreResponse {
  scores: Score[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
