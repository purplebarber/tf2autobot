import filterAxiosError from '@tf2autobot/filter-axios-error';
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios';
import IPricer, {
    GetItemPriceResponse,
    GetPricelistResponse,
    Item,
    PricerOptions,
    RequestCheckResponse
} from 'src/classes/IPricer';
import EventSourceHandler from './purplepricer-sse';
import log from '../../logger';

export default class PurplePricer implements IPricer {
    private readonly sse: EventSourceHandler;

    public constructor(private options: PricerOptions) {this.sse = new EventSourceHandler(this.options);}

    getOptions(): PricerOptions {
        return this.options;
    }

    requestCheck(sku: string): Promise<RequestCheckResponse> {
        return this.callPricerApi<RequestCheckResponse>('POST', `/items/${sku}`, {'token': this.options.pricerApiToken});
    }

    getPrice(sku: string): Promise<GetItemPriceResponse> {
        return this.callPricerApi<GetItemPriceResponse>('GET', `/items/${sku}`, {'token': this.options.pricerApiToken});
    }

    getPricelist(): Promise<GetPricelistResponse> {
        return this.callPricerApi<GetItemPriceResponse>('GET', `/items`, {'token': this.options.pricerApiToken});
    }

    connect(enabled: boolean): void {}

    shutdown(enabled: boolean): void {
        if (enabled) {
            this.sse.shutDown();
        }
    }

    init(enabled: boolean): void {
        if (enabled) {
            this.sse.connect();
            this.sse.bindEvents();
        }
    }

    bindHandlePriceEvent(onPriceChange: (item: GetItemPriceResponse) => void): void {
        const sse = this.sse.getSSE();
        if (sse) {
          sse.addEventListener('price', (msg: any) => {
            const item = JSON.parse(msg.data as string) as GetItemPriceResponse;
            onPriceChange(item);
          });
        }
      }

    get isPricerConnecting(): boolean {
        return this.sse.isConnecting;
    }

    private async callPricerApi<T>(
        httpMethod: string,
        path: string,
        params?: Record<string, any>,
        data?: Record<string, any>,
        headers?: Record<string, any>
    ): Promise<T> {
        if (!headers) {
            headers = {};
        }

        const axiosConfig: AxiosRequestConfig = {
            method: httpMethod as Method,
            url: path,
            baseURL: this.options.pricerUrl,
            headers: {
                'User-Agent': 'Autobot@' + process.env.BOT_VERSION,
                ...headers
            },
            timeout: 15000
        };

        if (params) {
            axiosConfig.params = params;
        }

        if (data) {
            axiosConfig.data = data;
        }

        return new Promise((res, rej) => {
            void axios(axiosConfig)
                .then(rsp => {
                    const content = rsp.data as T;
                    res(content);
                })
                .catch((err: AxiosError) => {
                    if (err) {
                        rej(filterAxiosError(err));
                    }
                });
        });
    }
}