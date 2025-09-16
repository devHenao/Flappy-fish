import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, type Fish, type Obstacle } from '@core/services';

type GameState = 'idle' | 'playing' | 'paused' | 'gameOver';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements AfterViewInit, OnDestroy {
  @Output() gameOver = new EventEmitter<number>();

  readonly gameService = inject(GameService);
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  @ViewChild('gameCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  private handleKeyDown!: (event: KeyboardEvent) => void;
  private handleClick!: () => void;

  private setupEventListeners(): void {
    // Use arrow functions to maintain 'this' context
    this.handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        this.gameService.jump();
      }
    };

    this.handleClick = () => {
      this.gameService.jump();
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('click', this.handleClick);
  }

  private removeEventListeners(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('click', this.handleClick);
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.setupEventListeners();
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private initializeCanvas(): void {
    const canvas = this.gameCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.ctx = context;

    // Set canvas size to match parent container
    const container = canvas.parentElement;
    if (!container) {
      throw new Error('Canvas parent element not found');
    }

    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    updateCanvasSize();

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    // Cleanup resize observer on component destroy
    const originalNgOnDestroy = this.ngOnDestroy.bind(this);
    this.ngOnDestroy = () => {
      resizeObserver.disconnect();
      originalNgOnDestroy();
    };
  }

  private startGameLoop(): void {
    const gameLoop = () => {
      this.update();
      this.render();
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };
    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  private update() {
    this.gameService.update();

    if (this.gameService.gameState() === 'gameOver') {
      this.gameOver.emit(this.gameService.getScore());
    }
  }

  private render(): void {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw game elements
    this.drawBackground();
    this.drawFish();
    this.drawObstacles();
    this.drawScore();
  }

  private drawBackground(): void {
    if (!this.ctx) return;

    // Fondo con gradiente azul más oscuro
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.ctx.canvas.height
    );
    gradient.addColorStop(0, '#1e90ff'); // Azul claro
    gradient.addColorStop(1, '#0077be'); // Azul más oscuro

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Dibujar olas en la parte inferior
    const waterLevel = this.ctx.canvas.height * 0.7;
    this.ctx.fillStyle = 'rgba(0, 119, 190, 0.6)';

    // Patrón de olas
    this.ctx.beginPath();
    this.ctx.moveTo(0, waterLevel);

    const waveHeight = 20;
    const waveLength = 200;

    for (let x = 0; x < this.ctx.canvas.width + waveLength; x += waveLength) {
      this.ctx.quadraticCurveTo(
        x - waveLength / 2,
        waterLevel + waveHeight * (x % 2 === 0 ? 1 : -1),
        x,
        waterLevel
      );
    }

    this.ctx.lineTo(this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.lineTo(0, this.ctx.canvas.height);
    this.ctx.closePath();
    this.ctx.fill();

    // Dibujar burbujas
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.ctx.canvas.width;
      const y = Math.random() * waterLevel;
      const radius = Math.random() * 5 + 2;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Destello en las burbujas
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    }
  }

  private drawFish() {
    const fish = this.gameService.getFish();
    if (!fish) return;

    this.ctx.save();
    this.ctx.translate(fish.x, fish.y);

    // Aplicar rotación basada en la velocidad para simular movimiento
    const rotation = Math.min(Math.max(fish.velocity * 0.1, -0.5), 0.5);
    this.ctx.rotate(rotation);

    // Cuerpo del pez con gradiente
    const bodyGradient = this.ctx.createLinearGradient(
      -fish.width / 2,
      0,
      fish.width / 2,
      0
    );
    bodyGradient.addColorStop(0, '#FF8C00'); // Naranja oscuro
    bodyGradient.addColorStop(1, '#FFA500'); // Naranja claro

    // Cuerpo principal
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, fish.width / 2, fish.height / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Cola con gradiente
    const tailGradient = this.ctx.createLinearGradient(
      -fish.width,
      -fish.height / 2,
      -fish.width / 2,
      fish.height / 2
    );
    tailGradient.addColorStop(0, '#FF8C00');
    tailGradient.addColorStop(1, '#FF4500'); // Naranja rojizo

    this.ctx.fillStyle = tailGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(-fish.width * 0.5, 0);
    this.ctx.quadraticCurveTo(
      -fish.width * 1.2,
      -fish.height * 0.6,
      -fish.width,
      0
    );
    this.ctx.quadraticCurveTo(
      -fish.width * 1.2,
      fish.height * 0.6,
      -fish.width * 0.5,
      0
    );
    this.ctx.closePath();
    this.ctx.fill();

    // Ojo
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(
      fish.width * 0.25,
      -fish.height * 0.2,
      fish.width * 0.12,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Pupila
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(
      fish.width * 0.28,
      -fish.height * 0.2,
      fish.width * 0.05,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Reflejo en el ojo
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(
      fish.width * 0.27,
      -fish.height * 0.22,
      fish.width * 0.03,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Aletas superiores e inferiores
    this.ctx.fillStyle = 'rgba(255, 140, 0, 0.8)';

    // Aleta superior
    this.ctx.beginPath();
    this.ctx.moveTo(fish.width * 0.1, -fish.height * 0.4);
    this.ctx.quadraticCurveTo(
      fish.width * 0.3,
      -fish.height * 0.6,
      fish.width * 0.1,
      -fish.height * 0.3
    );
    this.ctx.quadraticCurveTo(
      fish.width * -0.1,
      -fish.height * 0.5,
      fish.width * 0.1,
      -fish.height * 0.4
    );
    this.ctx.fill();

    // Aleta inferior
    this.ctx.beginPath();
    this.ctx.moveTo(fish.width * 0.1, fish.height * 0.4);
    this.ctx.quadraticCurveTo(
      fish.width * 0.3,
      fish.height * 0.6,
      fish.width * 0.1,
      fish.height * 0.3
    );
    this.ctx.quadraticCurveTo(
      fish.width * -0.1,
      fish.height * 0.5,
      fish.width * 0.1,
      fish.height * 0.4
    );
    this.ctx.fill();

    // Detalles en el cuerpo
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.ellipse(
      0,
      0,
      fish.width / 2.2,
      fish.height / 2.2,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawObstacles() {
    const obstacles = this.gameService.getObstacles() || [];

    // Draw rock bottom background
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(
      0,
      this.ctx.canvas.height * 0.9,
      this.ctx.canvas.width,
      this.ctx.canvas.height * 0.1
    );

    obstacles.forEach((obstacle: Obstacle) => {
      if (!obstacle) return;

      const coralColors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FF9F1C',
        '#2EC4B6',
      ];
      const coralColor =
        coralColors[Math.floor(Math.random() * coralColors.length)];

      // Draw top coral
      this.ctx.fillStyle = coralColor;
      this.ctx.save();
      this.ctx.translate(obstacle.x + obstacle.width / 2, obstacle.top);

      // Irregular coral shape
      this.ctx.beginPath();
      this.ctx.moveTo(-obstacle.width / 2, 0);
      this.ctx.lineTo(obstacle.width / 2, 0);

      // Create coral shape with random curves
      const segments = 5;
      const segmentWidth = obstacle.width / segments;

      for (let i = 0; i <= segments; i++) {
        const x = -obstacle.width / 2 + i * segmentWidth;
        const y = -Math.random() * 30 - 10;
        this.ctx.lineTo(x, y);
      }

      this.ctx.lineTo(obstacle.width / 2, 0);
      this.ctx.closePath();
      this.ctx.fill();

      // Coral details
      const gradient = this.ctx.createLinearGradient(0, -50, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.ctx.restore();

      // Draw seaweed in the bottom part
      const algaeHeight =
        this.ctx.canvas.height - (obstacle.top + obstacle.gap);
      if (algaeHeight > 50) {
        this.ctx.save();
        this.ctx.translate(
          obstacle.x + obstacle.width / 2,
          obstacle.top + obstacle.gap
        );

        // Seaweed stem
        this.ctx.strokeStyle = '#2E8B57';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(20, algaeHeight * 0.5, 0, algaeHeight * 0.8);
        this.ctx.stroke();

        // Seaweed leaves
        this.ctx.fillStyle = '#3CB371';
        for (let i = 0; i < 3; i++) {
          const y = algaeHeight * 0.3 * i;
          this.ctx.beginPath();
          this.ctx.ellipse(0, y, 15, 8, Math.PI / 4, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }
    });
  }

  private drawScore() {
    const score = this.gameService.getScore();
    this.ctx.font = 'bold 36px "Press Start 2P", cursive';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;

    // Draw score with outline
    const text = `${score}`;
    const x = this.ctx.canvas.width / 2;
    const y = 70;

    // Draw outline
    this.ctx.strokeText(text, x, y);

    // Draw filled text
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.fillText(text, x, y);

    // Reset shadow
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  restartGame(): void {
    this.gameService.restartGame();
  }
}
