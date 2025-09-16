import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { InMemoryScoreRepository } from './core/repositories';
import { SCORE_REPOSITORY } from './core/repositories/score-repository.interface';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    {
      provide: SCORE_REPOSITORY,
      useClass: InMemoryScoreRepository
    }
  ]
};
