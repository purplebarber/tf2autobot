import IPricer, { PricerOptions } from '../../classes/IPricer';
import PricesTfPricer from './pricestf/prices-tf-pricer';
import PricesTfApi from './pricestf/prices-tf-api';
import CustomPricer from './custom/custom-pricer';
import CustomPricerApi from './custom/custom-pricer-api';

export function getPricer(options: PricerOptions): IPricer {
    if (options.pricerUrl !== '') {
        return new CustomPricer(new CustomPricerApi(options.pricerUrl, options.pricerApiToken));
    } else {
        const api = new PricesTfApi();
        return new PricesTfPricer(api);
    }
}
