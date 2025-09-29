import { WebsocketService } from './websocket';

class FakeWebSocket {
  static OPEN = 1;
  readyState = FakeWebSocket.OPEN;

  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;

  sentMessages: string[] = [];
  closed = false;

  constructor(public url: string) {}

  send(message: string) {
    this.sentMessages.push(message);
  }

  close() {
    this.closed = true;
    if (this.onclose) {
      this.onclose();
    }
  }

  mockServerMessage(msg: string) {
    if (this.onmessage) {
      this.onmessage({ data: msg });
    }
  }
}

describe('WebsocketService', () => {
  let service: WebsocketService;
  let originalWebSocket: any;

  beforeEach(() => {
    originalWebSocket = (window as any).WebSocket;
    (window as any).WebSocket = FakeWebSocket as any;

    service = new WebsocketService();
  });

  afterEach(() => {
    (window as any).WebSocket = originalWebSocket;
  });

  it('should connect using connectPostman', () => {
    spyOn(service as any, 'connect');
    service.connectPostman();
    expect((service as any).connect).toHaveBeenCalledWith('wss://ws.postman-echo.com/raw');
  });

  it('should create a WebSocket connection', () => {
    service.connect('ws://test');
    expect((service as any).socket).toBeTruthy();
    expect(((service as any).socket as FakeWebSocket).url).toBe('ws://test');
  });

  it('should emit messages received from server', (done) => {
    service.connect('ws://test');
    const fakeSocket = (service as any).socket as FakeWebSocket;

    const expectedMessage = 'Hello from server';

    service.messages$.subscribe((msg) => {
      expect(msg).toBe(expectedMessage);
      done();
    });

    fakeSocket.mockServerMessage(expectedMessage);
  });

  it('should send a message when socket is open', () => {
    service.connect('ws://test');
    const fakeSocket = (service as any).socket as FakeWebSocket;

    service.send('hello');
    expect(fakeSocket.sentMessages).toContain('hello');
  });

  it('should not send a message if socket is not open', () => {
    service.connect('ws://test');
    const fakeSocket = (service as any).socket as FakeWebSocket;
    fakeSocket.readyState = 0;

    service.send('should-not-send');
    expect(fakeSocket.sentMessages).not.toContain('should-not-send');
  });

  it('should complete messages$ on disconnect', (done) => {
    service.connect('ws://test');
    const fakeSocket = (service as any).socket as FakeWebSocket;

    service.messages$.subscribe({
      complete: () => {
        expect(true).toBeTrue();
        done();
      },
    });

    service.disconnect();
    expect(fakeSocket.closed).toBeTrue();
  });
});
