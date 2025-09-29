import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { WebsocketService } from '../services/websocket/websocket';
import { ChatComponent } from './chat';

class MockWebsocketService {
  private subject = new Subject<string>();
  messages$ = this.subject.asObservable();

  connectPostman() {}
  send(_: string) {}
  disconnect() {}

  mockServerMessage(msg: string) {
    this.subject.next(msg);
  }
}

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let wsService: MockWebsocketService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent, CommonModule, FormsModule],
      providers: [{ provide: WebsocketService, useClass: MockWebsocketService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    wsService = TestBed.inject(WebsocketService) as unknown as MockWebsocketService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect to WebSocket on init', () => {
    spyOn(wsService, 'connectPostman');
    component.ngOnInit();
    expect(wsService.connectPostman).toHaveBeenCalled();
  });

  it('should push server messages to messages array', () => {
    const serverMsg = 'Hello';
    wsService.mockServerMessage(serverMsg);
    expect(component.messages).toContain('Server: ' + serverMsg);
  });

  it('should send message and clear input', () => {
    spyOn(wsService, 'send');
    component.message = 'Test Message';
    component.sendMessage();

    expect(component.messages).toContain('You: Test Message');
    expect(wsService.send).toHaveBeenCalledWith('Test Message');
    expect(component.message).toBe('');
  });

  it('should not send empty message', () => {
    spyOn(wsService, 'send');
    component.message = '   ';
    component.sendMessage();
    expect(wsService.send).not.toHaveBeenCalled();
  });

  it('should unsubscribe and disconnect on destroy', () => {
    spyOn(component['sub']!, 'unsubscribe').and.callThrough();
    spyOn(wsService, 'disconnect');

    component.ngOnDestroy();

    expect(component['sub']!.unsubscribe).toHaveBeenCalled();
    expect(wsService.disconnect).toHaveBeenCalled();
  });
});
