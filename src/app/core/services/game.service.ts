import { Injectable, signal, WritableSignal } from '@angular/core';

export type GameState = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Fish {
  x: number;
  y: number;
  velocity: number;
  width: number;
  height: number;
}

export interface Obstacle {
  x: number;
  top: number;
  width: number;
  gap: number;
  scored: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Game state signals
  private _gameState: WritableSignal<GameState> = signal('idle');
  private _score: WritableSignal<number> = signal(0);
  private _highScore: WritableSignal<number> = signal(0);
  private _playerName: WritableSignal<string> = signal('Player');

  // Public signals with computed values
  gameState = this._gameState.asReadonly();
  score = this._score.asReadonly();
  highScore = this._highScore.asReadonly();
  playerName = this._playerName.asReadonly();

  // Game elements
  private _fish: WritableSignal<Fish> = signal({
    x: 100,
    y: 300,
    velocity: 0,
    width: 40,
    height: 30
  });

  private _obstacles: WritableSignal<Obstacle[]> = signal([]);

  // Game elements
  fish = signal<Fish>({
    x: 100,
    y: 300,
    velocity: 0,
    width: 40,
    height: 30
  });

  obstacles = signal<Obstacle[]>([]);

  // Game settings
  private readonly GRAVITY = 0.5;
  private readonly JUMP_FORCE = -10;
  private readonly PIPE_SPEED = 2;
  private readonly PIPE_GAP = 200;
  private readonly PIPE_WIDTH = 80;
  private readonly PIPE_FREQUENCY = 1500; // ms

  private lastPipeTime = 0;
  private animationFrameId: number | null = null;

  constructor() {
    this.loadHighScore();
  }

  // Public methods
  startGame(playerName: string): void {
    this._playerName.set(playerName);
    this._score.set(0);
    this.resetFish();
    this._obstacles.set([]);
    this._gameState.set('playing');
    this.lastPipeTime = Date.now();

    if (!this.animationFrameId) {
      this.gameLoop();
    }
  }

  jump(): void {
    if (this._gameState() === 'playing') {
      this._fish.update(fish => ({
        ...fish,
        velocity: this.JUMP_FORCE
      }));
    } else if (this._gameState() === 'gameOver') {
      this.startGame(this._playerName());
    }
  }

  pauseGame(): void {
    if (this._gameState() === 'playing') {
      this._gameState.set('paused');
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }

  resumeGame(): void {
    if (this._gameState() === 'paused') {
      this._gameState.set('playing');
      this.lastPipeTime = Date.now();
      this.gameLoop();
    }
  }

  restartGame(): void {
    this.startGame(this._playerName());
  }

  cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Game logic
  private gameLoop(): void {
    if (this._gameState() !== 'playing') return;

    this.update();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  update(): void {
    if (this._gameState() !== 'playing') return;

    this.updateFish();
    this.updateObstacles();
    this.checkCollisions();
    this.spawnObstacles();
  }

  private updateFish(): void {
    this._fish.update(fish => {
      const newY = fish.y + fish.velocity;
      const newVelocity = fish.velocity + this.GRAVITY;

      return {
        ...fish,
        y: Math.max(0, Math.min(window.innerHeight - fish.height, newY)),
        velocity: newVelocity
      };
    });

    // Check if fish hit the ground or ceiling
    const fish = this._fish();
    if (fish.y <= 0 || fish.y >= window.innerHeight - fish.height) {
      this.gameOver();
    }
  }

  private updateObstacles(): void {
    this._obstacles.update(obstacles =>
      obstacles
        .map(obstacle => ({
          ...obstacle,
          x: obstacle.x - this.PIPE_SPEED
        }))
        .filter(obstacle => obstacle.x > -this.PIPE_WIDTH)
    );

    // Check for scoring
    this._obstacles.update(obstacles =>
      obstacles.map(obstacle => {
        if (!obstacle.scored && obstacle.x + this.PIPE_WIDTH < this._fish().x) {
          this.incrementScore();
          return { ...obstacle, scored: true };
        }
        return obstacle;
      })
    );
  }

  private spawnObstacles(): void {
    const now = Date.now();
    if (now - this.lastPipeTime > this.PIPE_FREQUENCY) {
      this.lastPipeTime = now;

      const minGap = 100;
      const maxGap = 400;
      const gap = Math.random() * (maxGap - minGap) + minGap;

      const minTop = 50;
      const maxTop = window.innerHeight - gap - 50;
      const top = Math.random() * (maxTop - minTop) + minTop;

      this._obstacles.update(obstacles => [
        ...obstacles,
        {
          x: window.innerWidth,
          top,
          width: this.PIPE_WIDTH,
          gap,
          scored: false
        }
      ]);
    }
  }

  private checkCollisions(): void {
    const fish = this._fish();
    const obstacles = this._obstacles();
    const hitboxScale = 0.5; // Reduce hitbox to 50% of original size

    const fishHitbox = {
      x: fish.x + (fish.width * (1 - hitboxScale)) / 2,
      y: fish.y + (fish.height * (1 - hitboxScale)) / 2,
      width: fish.width * hitboxScale,
      height: fish.height * hitboxScale
    };

    for (const obstacle of obstacles) {
      // Check collision with top pipe
      if (
        fishHitbox.x + fishHitbox.width > obstacle.x &&
        fishHitbox.x < obstacle.x + obstacle.width &&
        fishHitbox.y < obstacle.top
      ) {
        this.gameOver();
        return;
      }

      // Check collision with bottom pipe
      if (
        fishHitbox.x + fishHitbox.width > obstacle.x &&
        fishHitbox.x < obstacle.x + obstacle.width &&
        fishHitbox.y + fishHitbox.height > obstacle.top + obstacle.gap
      ) {
        this.gameOver();
        return;
      }
    }
  }

  private gameOver(): void {
    this._gameState.set('gameOver');
    this.saveHighScore();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private incrementScore(): void {
    this._score.update(score => score + 1);
  }

  private resetFish(): void {
    this._fish.set({
      x: 100,
      y: window.innerHeight / 2,
      velocity: 0,
      width: 40,
      height: 30
    });
  }

  private saveHighScore(): void {
    const currentScore = this._score();
    const currentHighScore = this._highScore();

    if (currentScore > currentHighScore) {
      this._highScore.set(currentScore);
      localStorage.setItem('flappyFishHighScore', currentScore.toString());
    }
  }

  private loadHighScore(): void {
    const savedHighScore = localStorage.getItem('flappyFishHighScore');
    if (savedHighScore) {
      const highScore = parseInt(savedHighScore, 10);
      if (!isNaN(highScore)) {
        this._highScore.set(highScore);
      }
    }
  }

  getFish(): Fish {
    return this._fish();
  }

  getObstacles(): Obstacle[] {
    return this._obstacles();
  }

  getScore(): number {
    return this._score();
  }

  getHighScore(): number {
    return this._highScore();
  }
}
