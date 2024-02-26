import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';
import log from '../../../lib/logger';
import * as Events from 'reconnecting-websocket/events';

export default class CustomPricerSocketManager {
    private ws: ReconnectingWebSocket;
    private lastActivity: Date;

    constructor(public url: string, public key?: string) {
        this.lastActivity = new Date();
    }

    init(): void {
        this.shutDown();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment

        this.url.replace('http://', 'ws://').replace('https://', 'wss://');

        if (this.url.endsWith('/')) {
            this.url = this.url.slice(0, -1);
        }
        this.url += '/ws';

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

        this.ws.addEventListener('price', () => {
            this.lastActivity = new Date();
        });

        setInterval(() => this.checkActivity(), 30 * 60 * 1000);
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

    checkActivity(): void {
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        if (this.lastActivity < thirtyMinutesAgo) {
            this.connect();
        }
    }

    send(data: string): void {
        this.ws.send(data);
    }

    on<T extends keyof Events.WebSocketEventListenerMap>(name: T, handler: Events.WebSocketEventListenerMap[T]): void {
        this.ws.addEventListener(name, handler);
    }
}
