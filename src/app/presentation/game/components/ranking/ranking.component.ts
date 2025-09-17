import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Score } from '@domain/models';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent {
  @Input() scores: Score[] = [];
  @Input() rankingMode: 'top' | 'player' = 'top';
  @Output() closeModal = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<'top' | 'player'>();

  onClose(): void {
    this.closeModal.emit();
  }

  changeView(mode: 'top' | 'player'): void {
    if (this.rankingMode !== mode) {
      this.viewChange.emit(mode);
    }
  }
}
