// mexc.ts
import ccxt from 'ccxt';
import { CONFIG } from '../config/config';


export class MexcService {
  private exchange: ccxt.Exchange;

  constructor() {
    this.exchange = new ccxt.mexc({
      apiKey: CONFIG.MEXC_API_KEY,
      secret: CONFIG.MEXC_SECRET_KEY,
      enableRateLimit: true,
      options: { 
        defaultType: 'spot', // 現物取引を明示
        recvWindow: 5000 // 5秒の時間誤差を許容
      }
    });
    this.exchange.loadMarkets();  // マーケット情報をロード

  }

  // async estimateTrade(symbol: string, amount: number, orderType: 'bids' | 'asks'): Promise<TradeResult> {
  //   try {
  //     const orderBook = await this.exchange.fetchOrderBook(symbol);
  //     let totalAmount = 0;
  //     let remainingAmount = amount;
  //     let reachedPrice = 0;

  //     const orders = orderBook[orderType];
  //     for (const [price, volume] of orders) {
  //       const tradableVolume = Math.min(remainingAmount, volume);
  //       totalAmount += tradableVolume * price;
  //       remainingAmount -= tradableVolume;
  //       reachedPrice = price;

  //       if (remainingAmount <= 0) break;
  //     }

  //     return {
  //       total_amount: totalAmount,
  //       reached_price: reachedPrice
  //     };
  //   } catch (error) {
  //     throw new Error(`MEXC trade estimation error: ${error}`);
  //   }
  // }

  async estimateTrade(
    symbol: string,
    amount: number,
    orderBookSide: 'bids' | 'asks'
  ): Promise<{ totalAmount: number; reachedPrice: number | null }> {
    if (!this.exchange) throw new Error('APIの設定が完了していません。');
    try {
      const orderBook = await this.exchange.fetchOrderBook(symbol);
      const orders = orderBook[orderBookSide];
      let totalAmount = 0;
      let remainingAmount = amount;
      let reachedPrice: number | null = null;
  
      for (const [price, qty] of orders) {
        if (remainingAmount <= 0) break;
        const tradableQty =
          orderBookSide === 'bids'
            ? Math.min(qty, remainingAmount)
            : Math.min(qty * price, remainingAmount) / price;
        totalAmount +=
          orderBookSide === 'bids' ? tradableQty * price : tradableQty;
        remainingAmount -=
          orderBookSide === 'bids' ? tradableQty : tradableQty * price;
        if (remainingAmount <= 0) {
          reachedPrice = price;
        }
      }
  
      if (remainingAmount > 0) {
        console.log(`注文板の深さが不足しています。残りの数量: ${remainingAmount}`);
      }
  
      return { totalAmount, reachedPrice };
    } catch (error) {
      console.error(`Error fetching order book: ${error}`);
      return { totalAmount: 0, reachedPrice: null };
    }
  }

  // 残高取得
  async getAvailableBalance(token: string) {
    try {
      const balance = await this.exchange.fetchBalance();
      // console.log(balance);
      // console.log(balance.free[token]);
      return balance.free[token]; // 利用可能な残高のみ取得
    } catch (error) {
      throw new Error(`MEXC get balance error: ${error}`);
    }
  }

  // 成行取引
  async marketExchange(pair: string, amount: number, isBuy: boolean) {
    console.log(pair, amount, isBuy);

    await this.exchange.loadMarkets()
    const market = this.exchange.market(pair);

    // 最小取引数量チェック
    if (amount < market.limits.amount.min) {
      throw new Error(`Amount ${amount} is less than the minimum allowed: ${market.limits.amount.min}`);
    } 

    let maxRetries = 50;  // 最大リトライ回数
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (isBuy) {
          const return_buy = await this.exchange.createMarketBuyOrder(pair, amount);
          return return_buy;
        } else {
          const return_sell = await this.exchange.createMarketSellOrder(pair, amount);
          return return_sell;
        }
    } catch (error) {
        console.error(`Order error: ${error.message}`);
        if (i === maxRetries - 1) {
          console.error("Max retry attempts reached. Returning null.");
          return null;  // 最後のリトライで失敗したら null を返す
        }
  
        await new Promise(res => setTimeout(res, 2000));  // 2秒待機
    }

    }
  }

  // 取引後数量取得
  async getAmountAfterTrade(orderId: string, pair: string) {
    // 注文詳細を取得
    const orderDetails = await this.exchange.fetchOrder(orderId, pair);
    console.log(`注文の詳細: ${JSON.stringify(orderDetails, null, 2)}`);
    // 成行取引で得たコスト (USDTの合計)
    const filledCost = orderDetails.cost || parseFloat(orderDetails.info.cummulativeQuoteQty || "0");
    console.log(`取引後数量: ${filledCost}`);
    return filledCost;
  }

    // 出金処理（タグとネットワーク対応）
  async withdrawToken(
    token: string,
    amount: number,
    address: string,
    network?: string,
    tag?: string
  ) {

    try {
      const params: { network?: string; tag?: string } = {};
      if (network) params.network = network;
      if (tag) params.tag = tag;

      return await this.exchange.withdraw(token, amount, address, params);
    } catch (error) {
      console.error(`Error during withdrawal: ${error}`);
      throw error;
    }
  }

  async checkTradingAvailable(symbol: string): Promise<boolean> {
    try {
      const markets = await this.exchange.loadMarkets();
      return !!(markets[symbol] && markets[symbol].active);
    } catch (error) {
      console.error('Market check error:', error);
      return false;
    }
  }
  

}