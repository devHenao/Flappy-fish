import { Routes } from '@angular/router';
import { GameComponent } from './features/game/game.component';

export const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    title: 'Flappy Fish - Play Now!'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
