// stonfi.ts
import axios from 'axios';
import { CONFIG } from '../config/config';
import { ArbitrageData } from '../config/types';

// 戻り値の型定義
type PriceResult = {
  price: number;
  router_address: string;
}

export class StonfiService {
  async getPrice(
    offer_address: string,
    ask_address: string,
    units: number
  ): Promise<PriceResult | null> {
    try {
      const response = await axios.post(`${CONFIG.STONFI_API_BASE_URL}/swap/simulate`, null, {
        params: {
          offer_address: offer_address,
          ask_address: ask_address,
          units,
          slippage_tolerance: CONFIG.SLIPPAGE_TOLERANCE,
          dex_v2: CONFIG.DEX_V2
        }
      });

      const swap_rate = response.data.swap_rate;
      const router_address = response.data.router_address;
      const calculatedPrice = swap_rate ? 1 / Number(swap_rate) : null;

      return {
        price: calculatedPrice,
        router_address: router_address
      };
    } catch (error) {
      console.error('Ston.fi price fetch error:', error);
      return null;
    }
  }
}