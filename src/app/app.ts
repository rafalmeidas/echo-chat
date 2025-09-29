import { Component } from '@angular/core';

import { ChatComponent } from './chat/chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
