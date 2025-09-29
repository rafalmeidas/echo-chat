import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: WebSocket;
  private messagesSubject = new Subject<string>();
  messages$: Observable<string> = this.messagesSubject.asObservable();

  connectPostman(): void {
    this.connect('wss://ws.postman-echo.com/raw');
  }

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.messagesSubject.next(event.data);
    };

    this.socket.onclose = () => {
      this.messagesSubject.complete();
    };
  }

  send(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  disconnect(): void {
    this.socket?.close();
  }
}
