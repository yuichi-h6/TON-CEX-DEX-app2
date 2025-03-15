// types.ts
export interface TokenPair {
  symbol: string;
  offer_address: string;
  ask_address: string;
}

  
export type TradeResult = {
    total_amount: number;
    reached_price: number;
  };
  
export type ArbitrageData = {
    timestamp: string;
    pair: string;
    amount_usdt: number;
    mexc_amount_out: number;
    stonfi_amount_out: number;
    stonfi_price_buy: number;
    mexc_price_sell: number;
    price_diff_percent: number;
    profit: number;
  };

  