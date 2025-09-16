// Note: Avoid circular imports by not importing Score here
// Use type-only imports if needed in the future

export interface Alias {
  id: number;
  name: string;
  scores?: any[]; // Use 'any' to avoid circular dependency
  createdAt: Date;
}
