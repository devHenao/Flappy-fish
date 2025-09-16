import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService, GameState } from '../../core/services';
import { ScoreUseCase } from '@core/use-cases';
import { GameBoardComponent } from './components/game-board/game-board.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    GameBoardComponent
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  private gameService = inject(GameService);
  private scoreUseCase = inject(ScoreUseCase);

  gameState = signal<GameState>('idle');
  score = signal(0);
  highScore = signal(0);
  playerName = signal('Player');
  showNameInput = signal(true);

  ngOnInit() {
    this.loadHighScore();
  }

  startGame() {
    const name = this.playerName().trim();
    if (name) {
      this.playerName.set(name);
      this.showNameInput.set(false);
      this.gameService.startGame(name);
      this.gameState.set('playing');
    }
  }

  private loadHighScore() {
    const savedHighScore = localStorage.getItem('flappyFishHighScore');
    if (savedHighScore) {
      this.highScore.set(parseInt(savedHighScore, 10));
    }
  }

  onGameOver(finalScore: number) {
    this.gameState.set('gameOver');
    if (finalScore > this.highScore()) {
      this.highScore.set(finalScore);
      localStorage.setItem('flappyFishHighScore', finalScore.toString());
    }
  }

  restartGame() {
    this.gameService.restartGame();
    this.gameState.set('playing');
  }
}
