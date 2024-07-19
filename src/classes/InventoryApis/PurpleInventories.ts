import { UnknownDictionaryKnownValues } from 'src/types/common';
import Bot from '../Bot';
import InventoryApi from './InventoryApi';

export default class PurpleInventories extends InventoryApi {
    private readonly pricerApiKey: string;

    private readonly pricerUrl: string;

    constructor(bot: Bot) {
        super(bot, 'purpleInventories');
        const pricerSettings = bot.priceSource.getOptions();
        this.pricerApiKey = pricerSettings.pricerApiToken;
        this.pricerUrl = pricerSettings.pricerUrl;
    }

    protected getURLAndParams(
        steamID64: string,
        appID: number,
        contextID: string
    ): [string, UnknownDictionaryKnownValues] {
        return [
          `${this.pricerUrl}/inventory/${steamID64}/${appID}/${contextID}?token=${encodeURIComponent(this.pricerApiKey)}`,
            {steamID64, appID, contextID, token: this.pricerApiKey}
        ];
    }
}
