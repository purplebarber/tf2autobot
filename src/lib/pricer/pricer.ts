import IPricer, { PricerOptions } from '../../classes/IPricer';
import PricesTfPricer from './pricestf/prices-tf-pricer';
import PricesTfApi from './pricestf/prices-tf-api';
import PurplePricer from './purplepricer/purplepricer';

export function getPricer(options: PricerOptions): IPricer {
    if (options.pricerUrl !== '') {
        return new PurplePricer(options);
    } else {
        const api = new PricesTfApi();
        return new PricesTfPricer(api);
    }
}