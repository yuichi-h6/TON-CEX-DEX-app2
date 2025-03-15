// config/token_pairs_all.ts
import { TokenPair } from './types';

export const TOKEN_PAIRS_USDT: TokenPair[] = [
  // {
  //   symbol: 'HMSTR/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo",    // HMSTR
  //   // routerAddress: "EQBZj7nhXNhB4O9rRCn4qGS82DZaPUPlyM2k6ZrbvQ1j3Ge7", // 
  //   routerAddress: "EQBQ_UBQvR9ryUjKDwijtoiyyga2Wl-yJm6Y8gl0k-HDh_5x", // 
  //   routerVersion: "v2_1",
  //   symbol_token: "HMSTR",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  // {
  //   symbol: 'NOT/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",    // NOT
  //   // routerAddress: "EQDAPye7HAPAAl4WXpz5jOCdhf2H9h9QkkzRQ-6K5usiuQeC", // 
  //   routerAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt", // 
  //   // routerVersion: "v2_1",
  //   routerVersion: "v1",
  //   symbol_token: "NOT",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  {
    symbol: 'CATI/USDT',
    offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
    ask_address: "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7",    // CATI
    routerAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt", // 
    routerVersion: "v1",
    symbol_token: "CATI",
    decimals_token: 9,
    tradeExecute: true,    
  },
  // {
  //   symbol: 'JETTON/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon",    // JETTON
  //   routerAddress: "EQBCtlN7Zy96qx-3yH0Yi4V0SNtQ-8RbhYaNs65MC4Hwfq31", // 
  //   routerVersion: "v2_1",
  //   symbol_token: "JETTON",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  // {
  //   symbol: "DOGS/USDT",
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",    // DOGS
  //   routerAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt", // 
  //   routerVersion: "v1",
  //   symbol_token: "DOGS",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  {
    symbol: "CATS/USDT",
    offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
    ask_address: "EQA3AshPEVly8wQ6mZincrKC_CkJSKXqqjyg0VMsVjF_CATS",    // CATS
    routerAddress: "EQCx0HDJ_DxLxDSQyfsEqHI8Rs65nygvdmeD9Ra7rY15OWN8", // 
    routerVersion: "v2_1",
    routerAddress_opposite: "EQCxkYVQcfXKw9uJ-MMtutvR2Cu0DVCZFfLNBp6NwXgO8vQY", // CATS -> USDT
    routerVersion_opposite: "v2_1",
    symbol_token: "CATS",
    decimals_token: 9,
    tradeExecute: true,
  },
  // {
  //   symbol: 'GTON/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQAj680BapntDEm6parX4BfX_S1Jcb1qpF63BREiHZYBGENE",    // GTON
  //   routerAddress: "EQDh5oHPvfRwPu2bORBGCoLEO4WQZKL4fk5DD1gydeNG9oEH", // 
  //   routerVersion: "v2_1",
  //   symbol_token: "GTON",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  // {
  //   symbol: 'CLAY/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQB-vc00g9PeUWLptSAH4g1J5kYS7WTgtVEfhI6oKdQtRudE",    // CLAY
  //   routerAddress: "EQBQ_UBQvR9ryUjKDwijtoiyyga2Wl-yJm6Y8gl0k-HDh_5x", // 
  //   routerVersion: "v2_1",
  //   symbol_token: "CLAY",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
  {
    symbol: 'MAJOR/USDT',
    offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
    ask_address: "EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR",    // MAJOR
    routerAddress: "EQAyD7O8CvVdR8AEJcr96fHI1ifFq21S8QMt1czi5IfJPyfA", // 
    routerVersion: "v2_1",
    symbol_token: "MAJOR",
    decimals_token: 9,
    tradeExecute: true,
  },
  // {
  //   symbol: 'MERGE/USDT',
  //   offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
  //   ask_address: "EQCvCDFaKVqFB4eSM1r2pHHWAU-NjcbU6vDDUUsTQKqIjGa8",    // MERGE
  //   routerAddress: "EQAyD7O8CvVdR8AEJcr96fHI1ifFq21S8QMt1czi5IfJPyfA", // 
  //   routerVersion: "v2_1",
  //   symbol_token: "MERGE",
  //   decimals_token: 9,
  //   tradeExecute: true,
  // },
] as const;

// コメントアウトされたペアは必要に応じて追加可能
/*
  {
    symbol: 'X/USDT',
    offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
    ask_address: "EQB4zZusHsbU2vVTPqjhlokIOoiZhEdCMT703CWEzhTOo__X",    // X
  },
  {
    symbol: 'AIC/USDT',
    offer_address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  // USDT
    ask_address: "EQBIzvHeNGl1CCALgCa_iC-OiK_4lFhs_TBKtRNjP6fi0024",    // AIC
  },
  // ... その他のコメントアウトされたペア
*/

// 型の安全性を確保するためのユーティリティ関数
export const isValidTokenPair = (pair: unknown): pair is TokenPair => {
  if (typeof pair !== 'object' || pair === null) return false;
  
  const p = pair as TokenPair;
  return (
    typeof p.symbol === 'string' &&
    typeof p.offer_address === 'string' &&
    typeof p.ask_address === 'string'
  );
};

// すべてのトークンペアの型チェック
TOKEN_PAIRS_USDT.forEach((pair, index) => {
  if (!isValidTokenPair(pair)) {
    throw new Error(`Invalid token pair at index ${index}`);
  }
});