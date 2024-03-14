import Bot from '../../classes/Bot';

// Interfaces (no changes needed)
export interface RecentPurchase {
    time: number; // Timestamp of the purchase
    itemStatsValue: ItemStatsValue; // Details of the bought item
}

export interface ItemStatsValue {
    count: number;
    keys: number;
    metal: number;
}

// Function to get the most recent purchase
export default function getMostRecentPurchase(bot: Bot, SKU: string): Promise<RecentPurchase | null> {
    return new Promise((resolve, reject) => {
        const pollData = bot.manager.pollData;
        const isCheckForPainted = /;[p][0-9]+/.test(SKU);

        if (!pollData.offerData) {
            return reject('No offer data found.');
        }

        const trades = Object.keys(pollData.offerData)
            .map(offerID => ({ ...pollData.offerData[offerID], offerID }))
            .filter(trade => trade.handledByUs && trade.isAccepted);

        // Filter for trades involving the specified SKU (where item was bought)
        const relevantTrades = trades.filter(trade => {
            for (const sku in trade.dict.their) {
                if ((!isCheckForPainted ? sku.replace(/;[p][0-9]+/, '') : sku) === SKU) {
                    return true;
                }
            }
            return false;
        });

        // Sort trades by descending timestamp
        relevantTrades.sort((a, b) => b.handleTimestamp - a.handleTimestamp);

        if (relevantTrades.length === 0) {
            return resolve(null); // No recent purchases found
        }

        const mostRecentTrade = relevantTrades[0];

        // Find the itemStatsValue for the SKU in the most recent trade
        let boughtItemStats: ItemStatsValue | undefined;
        for (const sku in mostRecentTrade.dict.their) {
            if ((!isCheckForPainted ? sku.replace(/;[p][0-9]+/, '') : sku) === SKU) {
                const itemCount =
                    typeof mostRecentTrade.dict.their[sku] === 'object'
                        ? (mostRecentTrade.dict.their[sku]['amount'] as number)
                        : mostRecentTrade.dict.their[sku];

                const tradePrices = mostRecentTrade.prices[sku];

                boughtItemStats = {
                    count: itemCount,
                    keys: tradePrices?.buy.keys || 0,
                    metal: tradePrices?.buy.metal || 0,
                };
                break;
            }
        }

        if (!boughtItemStats) {
            return reject('Item not found in recent purchase.');
        }

        return resolve({
            time: mostRecentTrade.handleTimestamp,
            itemStatsValue: boughtItemStats
        });
    });
}
