import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService, GameState } from '../../core/services';
import { ScoreUseCase } from '@core/use-cases';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { RankingSocketService } from '../../infrastructure/services/ranking-socket.service';
import { Score } from '@domain/models';

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
export class GameComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  private scoreUseCase = inject(ScoreUseCase);
  private rankingSocketService = inject(RankingSocketService);

  gameState = signal<GameState>('idle');
  score = signal(0);
  highScore = signal(0);
  playerName = signal('Player');
  showNameInput = signal(true);
  ranking = signal<Score[]>([]);
  finalScore = signal(0);
  private isGameOverHandled = false;

  ngOnInit() {
    this.loadTopScores();
    this.rankingSocketService.startConnection();
    this.rankingSocketService.ranking$.subscribe(ranking => {
      this.ranking.set(ranking);
    });
  }

  ngOnDestroy() {
    this.rankingSocketService.stopConnection();
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

  private async loadTopScores() {
    const topScores = await this.scoreUseCase.getTopScores(10);
    this.ranking.set(topScores);
    if (topScores.length > 0) {
      this.highScore.set(topScores[0].points);
    }
  }

  async onGameOver(finalScore: number) {
    if (this.isGameOverHandled) return;

    this.isGameOverHandled = true;
    this.finalScore.set(finalScore);
    this.gameState.set('gameOver');
    await this.scoreUseCase.registerScore({
      alias: this.playerName(),
      points: finalScore
    });
  }

  restartGame() {
    this.isGameOverHandled = false;
    this.gameService.restartGame();
    this.gameState.set('playing');
  }
}
