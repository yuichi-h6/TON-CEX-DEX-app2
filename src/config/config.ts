// config.ts
import { pro } from 'ccxt';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL_bot1_stonfi,
  STONFI_API_BASE_URL: 'https://api.ston.fi/v1',
  DECIMAL_USDT: Math.pow(10, 6),
  DECIMAL_USDT_NORMAL: 6,
  SYMBOL_USDT: "USD₮",
  SYMBOL_USDT_WITHDRAW: "USDT",
  SLIPPAGE_TOLERANCE: 0.001,
  DEX_V2: "true",
  DIFF_JST_FROM_UTC: 9,
  CSV_FILES: {
    OPPORTUNITIES: 'Data/Stonfi_Mexc_arbitrage_both_opportunities.csv',
    ANALYSIS: 'Data/Stonfi_Mexc_both_analysis_data.csv'
  },
  // MNEMONIC: process.env.MNEMONIC_STONFI || "",
  // WALLET_ADDRESS: process.env.WALLET_ADDRESS_STONFI_BASE64 || "",

  MNEMONIC: process.env.MNEMONIC_DEV_TEST2 || "",
  WALLET_ADDRESS: process.env.WALLET_ADDRESS_DEV_TEST2 || "",

  

  MEXC_API_KEY: process.env.MEXC_API_KEY || "",
  MEXC_SECRET_KEY: process.env.MEXC_SECRET_KEY || "",
  MEXC_TON_ADDRESS: process.env.MEXC_TON_ADDRESS || "",
  MEXC_TON_COMMENT: process.env.MEXC_TON_COMMENT || "",
  TON_API_KEY: process.env.TON_API_KEY || "",
};