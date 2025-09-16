import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SCORE_REPOSITORY } from './core/repositories';
import { ScoreApiRepository } from './infrastructure/repositories/score-api.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(HttpClientModule),
    { provide: SCORE_REPOSITORY, useClass: ScoreApiRepository }
  ]
};
