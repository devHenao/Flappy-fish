export interface Session {
  sessionId: string;
  alias?: string;
  startedAt: Date;
  endedAt?: Date;
  metadata?: string;
  scores?: any[];
}
