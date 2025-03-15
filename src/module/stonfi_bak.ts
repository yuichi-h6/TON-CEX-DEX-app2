// stonfi.ts
import axios from 'axios';
import { CONFIG } from '../config/config';
import { ArbitrageData } from '../config/types';
export class StonfiService {
  async getPrice(
    offer_address: string,
    ask_address: string,
    units: number
  ): Promise<number | null> {
    try {
      const response = await axios.post(`${CONFIG.STONFI_API_BASE_URL}/swap/simulate`, null, {
        params: {
          offer_address,
          ask_address,
          units,
          slippage_tolerance: CONFIG.SLIPPAGE_TOLERANCE,
          dex_v2: CONFIG.DEX_V2
        }
      });

      const swap_rate = response.data.swap_rate;
      // return swap_rate ? 1 / Number(swap_rate) : null;
      return response.data;
    } catch (error) {
      console.error('Ston.fi price fetch error:', error);
      return null;
    }
  }
}