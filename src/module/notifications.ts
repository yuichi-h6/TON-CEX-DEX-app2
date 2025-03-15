// notifications.ts
import axios from 'axios';
import { CONFIG } from '../config/config';
import { ArbitrageData } from '../config/types';

export class NotificationService {
  async sendSlackNotification(data: ArbitrageData): Promise<void> {
    if (!CONFIG.SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL is not configured');
    }

    const message = {
      text: "<!channel> 裁定取引のチャンスがあります！",
      attachments: [{
        fields: [
          { title: "裁定取引チャンス", value: `${data.pair} - ${data.amount_usdt} USDT` },
          { title: "時間", value: data.timestamp },
          { title: "入金量", value: `${data.amount_usdt} USDT` },
          { title: "出金量", value: `${data.mexc_amount_out} USDT` },
          { title: "出金量_交換トークン", value: `${data.stonfi_amount_out} USDT` },
          { title: "Buy価格", value: `${data.stonfi_price_buy.toFixed(6)} USDT` },
          { title: "Sell価格", value: `${data.mexc_price_sell.toFixed(6)} USDT` },
          { title: "価格の差異", value: `${data.price_diff_percent.toFixed(2)}%` },
          { title: "利益", value: data.profit.toFixed(2) }
        ]
      }]
    };

    try {
      await axios.post(CONFIG.SLACK_WEBHOOK_URL, message);
      console.log("Slack notification sent successfully");
    } catch (error) {
      console.error('Slack notification error:', error);
    }
  }

  async sendSlackNotification_nomal(message: object): Promise<void> {
    if (!CONFIG.SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL is not configured');
    }
    try {
      await axios.post(CONFIG.SLACK_WEBHOOK_URL, message);
      console.log("Slack notification sent successfully");
    } catch (error) {
      console.error('Slack notification error:', error);
    }
  }
}