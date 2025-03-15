// csv.ts
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { ArbitrageData } from '../config/types';

export class CsvService {
  private getWriter(filename: string) {
    return createObjectCsvWriter({
      // path: path.join(__dirname, filename),
      path: path.join(process.cwd(), filename),
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'pair', title: 'Pair' },
        { id: 'amount_usdt', title: 'Amount_USDT' },
        { id: 'mexc_amount_out', title: 'MEXC Amount Out' },
        { id: 'stonfi_amount_out', title: 'Ston.fi Amount Out' },
        { id: 'stonfi_price_buy', title: 'Ston.fi Buy Price' },
        { id: 'mexc_price_sell', title: 'MEXC Sell Price' },
        { id: 'price_diff_percent', title: 'Price Difference (%)' },
        { id: 'profit', title: 'Profit' }
      ],
      append: true
    });
  }

  async saveData(filename: string, data: ArbitrageData): Promise<void> {
    try {
      const writer = this.getWriter(filename);
      await writer.writeRecords([data]);
      console.log(`Data saved to ${filename}`);
    } catch (error) {
      console.error('CSV save error:', error);
    }
  }
}