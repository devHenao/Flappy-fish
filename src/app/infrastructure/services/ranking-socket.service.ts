import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Score } from '@domain/models';
import { apiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RankingSocketService {
  private hubConnection!: signalR.HubConnection;
  private rankingSource = new Subject<Score[]>();

  ranking$ = this.rankingSource.asObservable();

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(apiConfig.rankingHubUrl)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('ScoreUpdated', (topScores: Score[]) => {
      this.rankingSource.next(topScores);
    });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
