import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  public connection: signalR.HubConnection =
    new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chat')
      .configureLogging(signalR.LogLevel.Information)
      .build();

  public messages$ = new BehaviorSubject<any[]>([]);
  public connectedUsers$ = new BehaviorSubject<string[]>([]);

  private messages: any[] = [];

  constructor(private ngZone: NgZone) {

    this.connection.on('ReceiveMessage', (user, message, messageTime) => {
      this.ngZone.run(() => {
        this.messages = [...this.messages, { user, message, messageTime }];
        this.messages$.next(this.messages);
      });
    });

    this.connection.on('ConnectedUser', (users: any) => {
      this.ngZone.run(() => {
        this.connectedUsers$.next(users);
      });
    });
  }

  public async start() {
    try {
      if (this.connection.state === signalR.HubConnectionState.Disconnected) {
        await this.connection.start();
        console.log('Connection established');
      }
    } catch (error) {
      console.log('Connection error:', error);
    }
  }

  public async joinRoom(user: string, room: string) {
    await this.start();
    return this.connection.invoke('JoinRoom', { user, room });
  }

  public async sendMessage(message: string) {
    try {
      if (!message || !message.trim()) return;
      await this.connection.invoke('SendMessage', message);
    } catch (error) {
      console.log('SendMessage error:', error);
    }
  }

  public async leaveChat() {
    try {
      this.messages = [];
      this.messages$.next([]);
      this.connectedUsers$.next([]);
      return await this.connection.stop();
    } catch (error) {
      console.log('LeaveChat error:', error);
    }
  }
}