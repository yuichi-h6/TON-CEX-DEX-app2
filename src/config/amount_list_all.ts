// config/amount_list_all.ts

// 取引量リストの型定義
export type AmountList = readonly number[];

// USDT用の取引量リスト
// export const AMOUNT_LIST_USDT: AmountList = [300, 200, 100] as const;
export const AMOUNT_LIST_USDT: AmountList = [100,50,30] as const;
// export const AMOUNT_LIST_USDT: AmountList = [300, 200, 100, 50] as const;
// export const AMOUNT_LIST_USDT: AmountList = [100, 200, 300, 400] as const;
// export const AMOUNT_LIST_USDT: AmountList = [1.5, 200, 300, 400] as const;

// TON用の取引量リスト
export const AMOUNT_TON_LIST: AmountList = [30, 50, 100] as const;

// 取引量リストを検証するユーティリティ関数
export const validateAmountList = (amounts: AmountList): boolean => {
  return amounts.every(amount => {
    const isValid = !isNaN(amount) && amount > 0;
    return isValid;
  });
};

// 特定の取引量が有効かチェックするユーティリティ関数
export const isValidAmount = (amount: number, validAmounts: AmountList): boolean => {
  return validAmounts.includes(amount);
};

// 初期検証
if (!validateAmountList(AMOUNT_LIST_USDT)) {
  throw new Error('Invalid USDT amount list configuration');
}

if (!validateAmountList(AMOUNT_TON_LIST)) {
  throw new Error('Invalid TON amount list configuration');
}