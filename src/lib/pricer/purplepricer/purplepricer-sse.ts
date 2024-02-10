import { GetItemPriceResponse, PricerOptions } from 'src/classes/IPricer';
import log from '../../../lib/logger';
import ReconnectingEventSource from 'reconnecting-eventsource';

export type EventBasedPriceUpdate = GetItemPriceResponse;

export default class EventSourceHandler {
    private sse?: ReconnectingEventSource;

    private options: PricerOptions;

    constructor(options: PricerOptions) {
        this.options = options;
    }

    connect(): void {
        if (this.options.pricerApiToken == undefined) {
            throw new Error('No pricer API token provided!');
        }
        const url = `${this.options.pricerUrl}/sse?token=${encodeURIComponent(this.options.pricerApiToken)}`;
        this.sse = new ReconnectingEventSource(url);
    }

    bindEvents(): void {
        this.sse.addEventListener('error', () => {
            log.error(`Failed to connect to the pricer with SSE protocoll!`);
        });

        this.sse.addEventListener('open', () => {
            log.debug('SSE stream is opened! Ready to receive price updates!');
        });
    }

    get isConnecting(): boolean {
        return this.sse.readyState === this.sse.CONNECTING;
    }

    getSSE(): EventSource {
        return this.sse;
    }

    shutDown(): void {
        if (this.sse) {
            this.sse.close();
            this.sse = undefined;
        }
    }
}
