import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { WebsocketService } from './../services/websocket/websocket';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatComponent {
  messages: string[] = [];
  message: string = '';
  private sub!: Subscription;

  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.wsService.connectPostman();
    this.sub = this.wsService.messages$.subscribe((msg) => {
      this.messages.push('Server: ' + msg);
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.messages.push('You: ' + this.message);
      this.wsService.send(this.message);
      this.message = '';
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.wsService?.disconnect();
  }
}
