import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';
import log from '../../../lib/logger';
import * as Events from 'reconnecting-websocket/events';

export default class CustomPricerSocketManager {
    private ws: ReconnectingWebSocket;

    constructor(public url: string, public key?: string) {}

    init(): void {
        this.shutDown();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment

        this.url.replace('http://', 'ws://').replace('https://', 'wss://');

        if (this.url.includes('?')) {
            this.url += `&token=${this.key}`;
        } else {
            this.url += `?token=${this.key}`;
        }

        this.ws = new ReconnectingWebSocket(this.url, [], {
            WebSocket: WS,
            maxEnqueuedMessages: 0,
            startClosed: true
        });
        if (this.isConnecting) {
            log.debug('Custom pricer is connecting...');
        }
        if (this.ws.readyState === WS.OPEN) {
            log.debug('Custom pricer is connected.');
        }
    }

    connect(): void {
        this.ws.reconnect();
    }

    get isConnecting(): boolean {
        return this.ws.readyState === WS.CONNECTING;
    }

    shutDown(): void {
        if (this.ws) {
            // Why no removeAllEventListener ws? :(
            this.ws.close();
            this.ws = undefined;
        }
    }

    send(data: string): void {
        this.ws.send(data);
    }

    on<T extends keyof Events.WebSocketEventListenerMap>(name: T, handler: Events.WebSocketEventListenerMap[T]): void {
        this.ws.addEventListener(name, handler);
    }
}
