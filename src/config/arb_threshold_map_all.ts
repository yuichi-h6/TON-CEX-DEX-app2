// config/arb_threshold_map_all.ts

// しきい値マップの型定義
export type ThresholdMap = {
    readonly [amount: number]: number;
  };
  
  // USDT用のしきい値マップ
  export const ARB_THRESHOLD_MAP_USDT: ThresholdMap = {
    30: 1.6,
    50: 1.5,
    100: 1.4,
    // 1.5: -3.0,
    200: 1.0,
    300: 0.8,
    400: 0.7
  } as const;
  
  // TON用のしきい値マップ
  export const ARB_THRESHOLD_MAP_TON: ThresholdMap = {
    30: 1.4,
    50: 1.5,
    100: 1.5
  } as const;
  
  // しきい値を取得するユーティリティ関数
  export const getThreshold = (
    amount: number,
    map: ThresholdMap,
    defaultThreshold: number = 1.4
  ): number => {
    return map[amount] ?? defaultThreshold;
  };
  
  // マップの値を検証するユーティリティ関数
  // export const validateThresholdMap = (map: ThresholdMap): boolean => {
  //   return Object.entries(map).every(([amount, threshold]) => {
  //     const isValidAmount = !isNaN(Number(amount)) && Number(amount) > 0;
  //     const isValidThreshold = !isNaN(threshold) && threshold > 0;
  //     return isValidAmount && isValidThreshold;
  //   });
  // };
  
  // // 設定値の検証
  // if (!validateThresholdMap(ARB_THRESHOLD_MAP_USDT)) {
  //   throw new Error('Invalid USDT threshold map configuration');
  // }
  
  // if (!validateThresholdMap(ARB_THRESHOLD_MAP_TON)) {
  //   throw new Error('Invalid TON threshold map configuration');
  // }