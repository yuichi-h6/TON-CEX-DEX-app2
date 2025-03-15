// arbitrage.ts
import { MexcService } from './module/mexc';
import { StonfiService } from './module/stonfi';
import { NotificationService } from './module/notifications';
import { CsvService } from './module/csv';
import { CONFIG } from './config/config';
import { TOKEN_PAIRS_USDT } from './config/token_pairs_all';
import { AMOUNT_LIST_USDT } from './config/amount_list_all';
import { ARB_THRESHOLD_MAP_USDT } from './config/arb_threshold_map_all';
import { createKeypair, sendSwap_v2, getJettonBalance, sendToken } from "./module/stonfi-sdk";
import { sleep } from "../node_modules/ccxt/js/src/base/functions";
import { ArbitrageData } from './config/types';

const return_keyPair = await createKeypair(CONFIG.MNEMONIC);
// console.log(return_keyPair);

// スワップ完了を確認する関数
async function waitForSwapCompletion(walletAddress: string, tokenSymbol: string, expectedAmount: number, decimals: number, initialBalance: number, maxAttempts = 50, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`スワップ完了確認中... (${attempt}/${maxAttempts})`);

    try {
      // ウォレットの残高を取得
      // console.log(walletAddress, tokenSymbol, decimals)
      const getWalletBalanse_Token = await getJettonBalance(walletAddress, tokenSymbol);
      const WalletBalanse_Token = getWalletBalanse_Token / Math.pow(10, decimals); 
      const receivedTokenAmount = WalletBalanse_Token - initialBalance;

      console.log(`増加数量: ${receivedTokenAmount}, 期待値: ${expectedAmount}`);

      // 目標値に達したら成功
      if (receivedTokenAmount >= expectedAmount) {
        console.log(`スワップ完了！ 受け取ったトークン: ${receivedTokenAmount}`);
        return receivedTokenAmount;
      }
    } catch (error) {
      console.error("スワップ確認エラー:", error);
    }

    // 一定時間待機
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.log("スワップが完了しませんでした。");
  return 0;
}



export class ArbitrageBot {
  private mexcService: MexcService;
  private stonfiService: StonfiService;
  private notificationService: NotificationService;
  private csvService: CsvService;

  constructor() {
    this.mexcService = new MexcService();
    this.stonfiService = new StonfiService();
    this.notificationService = new NotificationService();
    this.csvService = new CsvService();
  }

  private getTimestamp(): string {
    const now = new Date();
    now.setHours(now.getHours() + CONFIG.DIFF_JST_FROM_UTC);
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  // MEXCへの送金完了を確認する関数
  // async waitForMEXCBalance(pair: any, stonfi_amount_out_min: number) {
  //   console.log("MEXCの残高確認中...");
    
  //   const checkInterval = 3000; // 3秒ごとに確認
  //   const maxRetries = 100; // 最大試行回数 (約60秒)
  //   let retries = 0;

  //   while (retries < maxRetries) {
  //       const getCEXBalance_TOKEN = await this.mexcService.getAvailableBalance(pair.symbol_token);
  //       // console.log(getCEXBalance_TOKEN);
  //       // const availableBalance = getCEXBalance_TOKEN / Math.pow(10, pair.decimals); 

  //       console.log(`MEXCの現在の残高: ${getCEXBalance_TOKEN} ${pair.symbol_token} > ${stonfi_amount_out_min}`);

  //       if (getCEXBalance_TOKEN >= stonfi_amount_out_min) {
  //           console.log("MEXCへの送金成功を確認！");
  //           return getCEXBalance_TOKEN;
  //       }

  //       retries++;
  //       console.log(`MEXCの残高確認中... (${retries}/${maxRetries})`);
  //       await new Promise(resolve => setTimeout(resolve, checkInterval)); // 3秒待機
  //   }

  //   console.error("MEXCの残高確認タイムアウト: 送金が完了しなかった可能性があります");
  //   return 0;
  // }
  

  
  

  async checkArbitrage(pair: TokenPair, amount_usdt: number): Promise<void> {
    try {

      // 取引可能か確認
      const canTrade = await this.mexcService.checkTradingAvailable(pair.symbol);
      if (!canTrade) {
        console.log(`${pair.symbol} は現在取引できません`);
        return;
      }

      // 初期値設定
      const arb_threshold = ARB_THRESHOLD_MAP_USDT[amount_usdt] ?? 1.4;
      let slippage = 0.985; 

      console.log(`\n ----- ${pair.symbol_token} - ${amount_usdt} USDT- ${arb_threshold} のチェック -----`);

      
      const units = amount_usdt * CONFIG.DECIMAL_USDT;

      // DEX buy CEX sell

      // Get Ston.fi price
      const priceResult = await this.stonfiService.getPrice(
        pair.offer_address,
        pair.ask_address,
        units
      );

      if (!priceResult || !priceResult.router_address) {
        console.log("Router addressの取得に失敗しました");
        return;
      }

      const stonfi_price_buy = priceResult.price;
      const router_address = priceResult.router_address;

      const stonfi_amount_out = amount_usdt / stonfi_price_buy;

      // Get MEXC price
      const mexc_sell_result = await this.mexcService.estimateTrade(
        pair.symbol,
        stonfi_amount_out,
        'bids'
      );
      // console.log(mexc_sell_result);

      const { totalAmount: mexc_amount_out, reachedPrice: mexc_price_sell } = mexc_sell_result;

      // 詳細な情報出力
      console.log(`${pair.symbol.split('/')[0]}の数量: ${stonfi_amount_out}`);
      console.log(`USDTの数量: ${mexc_amount_out.toFixed(2)}`);
      console.log(`Ston.fiのbuy価格: ${stonfi_price_buy.toFixed(6)} USDT`);
      console.log(`MEXCのsell価格: ${mexc_price_sell.toFixed(6)} USDT`);

      // Calculate profit and difference
      const profit = mexc_amount_out - amount_usdt;
      const price_diff_percent = (profit / amount_usdt) * 100;

      console.log(`収益: ${profit.toFixed(2)}`);
      console.log(`収益率: ${price_diff_percent.toFixed(2)}%`);

      if (price_diff_percent >= arb_threshold) {
    //  if (price_diff_percent >= 10000) {
      // if (price_diff_percent) {
        const timestamp = this.getTimestamp();

        const arbitrageData: ArbitrageData = {
          timestamp,
          pair: pair.symbol,
          amount_usdt,
          mexc_amount_out,
          stonfi_amount_out,
          stonfi_price_buy: parseFloat(stonfi_price_buy.toFixed(6)),  // 事前に toFixed を適用
          mexc_price_sell: parseFloat(mexc_price_sell.toFixed(6)),  // 事前に toFixed を適用
          price_diff_percent: parseFloat(price_diff_percent.toFixed(2)),  // 事前に toFixed を適用
          profit: parseFloat(profit.toFixed(2))  // 事前に toFixed を適用
        };

        await this.notificationService.sendSlackNotification(arbitrageData);
        await this.csvService.saveData(CONFIG.CSV_FILES.OPPORTUNITIES, arbitrageData);

        // USDT残高確認(Wallet)
        const getWalletBalanse_USDT = await getJettonBalance(return_keyPair.walletAddress, CONFIG.SYMBOL_USDT);
        const WalletBalanse_USDT = getWalletBalanse_USDT / Math.pow(10, 6);

        console.log("USDT残高:", WalletBalanse_USDT);

        // USDT残高が足りていない場合は次の処理へ、Slack通知をする
        if (WalletBalanse_USDT < amount_usdt) {
          console.log(`USDT残高不足 ${WalletBalanse_USDT} < ${amount_usdt}`);
          const BalanceUSDT_message = {
            text: "<!channel> USDT残高が不足しています",
            attachments: [{
              fields: [
                { title: "USDT残高", value: `${WalletBalanse_USDT}  USDT` },
              ]
            }]
          };

          await this.notificationService.sendSlackNotification_nomal(BalanceUSDT_message);
          return;
        }

        if (!pair.tradeExecute){
          console.log("取引は実行しません");
          return;
        }


        // Token残高確認(CEX)
        const getCEXBalance_TOKEN = await this.mexcService.getAvailableBalance(pair.symbol_token)
        console.log("Token残高", getCEXBalance_TOKEN)

        // Token残高が足りていない場合は次の処理へ、Slack通知をする
        if (getCEXBalance_TOKEN <= stonfi_amount_out) {
          console.log("Token残高不足");
          const BalanceTOKEN_message = {
            text: '<!channel> TOKEN残高が不足しています',
            attachments: [{
              fields: [
                { title: '残高', value: `${getCEXBalance_TOKEN} ${pair.symbol_token}` },
              ]
            }]
          };
          await this.notificationService.sendSlackNotification_nomal(BalanceTOKEN_message);
          return;
        }

        console.log("取引を実行します")
        console.log("修正中")
        return;

        // Stonfi Swap USDTをpair.symbol_tokenに交換
        console.log('stonfi swap実行')
        // const stonfi_amount_out_min = Math.floor(stonfi_amount_out);
        if (price_diff_percent >= 5) {
          slippage = 0.98; // 収益率 1%未満はスリッページを0.5%に抑える
        }
        const stonfi_amount_out_min = Math.floor(stonfi_amount_out*slippage);
        console.log(`最小出力量: ${stonfi_amount_out_min}`) 

        const swapResult = await sendSwap_v2({
          wallet: return_keyPair.wallet,
          keyPair: return_keyPair.keyPair,
          rounterVersion: pair.routerVersion,
          userwalletAddress: return_keyPair.walletAddress,
          routerAddress: router_address,
          // routerAddress: pair.routerAddress,
          offerJettonAddress: pair.offer_address,
          offerAmount: BigInt(Math.floor(amount_usdt * CONFIG.DECIMAL_USDT)),
          // offerAmount: BigInt(Math.floor(amount_usdt_test * CONFIG.DECIMAL_USDT)),
          askJettonAddress: pair.ask_address,
          // minAskAmount: Math.floor(stonfi_amount_out_min*0.99),
          minAskAmount: BigInt(Math.floor(stonfi_amount_out_min * Math.pow(10, pair.decimals_token))) ,
          // minAskAmount: stonfi_amount_out_min,
          queryId: Date.now() //12345
        });

        if (swapResult["@type"] !== "ok") {
          console.log("Stonfi Swap 失敗");
          const StonfiSwap_message = {
            text: '<!channel> Stonfi Swap に失敗しました',
          };
          await this.notificationService.sendSlackNotification_nomal(StonfiSwap_message);
          return;
        }

        console.log("Stonfi Swap 送信成功");

        // swap送信成功のSlack通知
        const StonfiSwapSuccess_message = {
          text: 'Stonfi Swap 送信成功',
        };
        await this.notificationService.sendSlackNotification_nomal(StonfiSwapSuccess_message);  

        // Swap完了確認(SwapTokenのWallet残高確認)
        await sleep(10000);
        const receivedTokenAmount = await waitForSwapCompletion(return_keyPair.walletAddress, pair.symbol_token, stonfi_amount_out_min, pair.decimals_token);

        if (!receivedTokenAmount || receivedTokenAmount <= 0) {
          console.error("Swap 実行失敗: 受け取ったトークン量が無効です", receivedTokenAmount);
          const StonfiSwapExecute_message = {
            text: '<!channel> Swap 実行失敗: 受け取ったトークン量が無効です',
          };
          await this.notificationService.sendSlackNotification_nomal(StonfiSwapExecute_message);
          return;
        }

        // Swap実行成功のSlack通知
        const StonfiSwapExecuteSuccess_message = {
          text: 'Swap 実行成功',
        };
        await this.notificationService.sendSlackNotification_nomal(StonfiSwapExecuteSuccess_message);

        const amountToMexc = Math.floor(receivedTokenAmount);
        
        // 🔸MEXCへTokenを送金
        // console.log(`MEXCへ送金 送金数量：${amountToMexc}`);
        // try {
        //   const sendTokenResult = await sendToken({
        //     wallet: return_keyPair.wallet,
        //     keyPair: return_keyPair.keyPair,
        //     recipientAddress: CONFIG.MEXC_TON_ADDRESS,
        //     amount: amountToMexc,
        //     decimals: pair.decimals_token,
        //     comment: CONFIG.MEXC_TON_COMMENT,
        //     contractAddress: pair.ask_address,
        //   });
        
        //   console.log("送金結果:", sendTokenResult);
        // } catch (error) {
        //   console.error("Token transfer error:", error);
        // }

        // await sleep(10000);

        // 🔸MEXCへの送金完了を確認
        // console.log("MEXCの残高確認中...");
        // // const receiveTokenAmount_MEXC = await this.waitForMEXCBalance.bind(this)(pair, stonfi_amount_out_min);
        // const receiveTokenAmount_MEXC = await this.waitForMEXCBalance.bind(this)(pair, amountToMexc);

        // await sleep(2000); //2秒待機


        // if (!receiveTokenAmount_MEXC || receiveTokenAmount_MEXC <= 0) {
        //   // console.error("MEXCへの送金失敗: 受け取ったトークン量が無効です", receiveTokenAmount_MEXC);
        //   console.log("MEXCへの送金失敗: 受け取ったトークン量が無効です", receiveTokenAmount_MEXC);
        //   const receiveTokenAmount_MEXC_message = {
        //     text: '<!channel> MEXCへの送金失敗: 受け取ったトークン量が無効です',
        //   };
        //   await this.notificationService.sendSlackNotification_nomal(receiveTokenAmount_MEXC_message);
        //   return;
        // }

        

        // 🔸CEX取引 pair.symbol_tokenをUSDTに交換
        console.log("CEX取引中...");
        const tradeResult = await this.mexcService.marketExchange(pair.symbol, amountToMexc, false);
        console.log("CEX取引詳細 ", tradeResult)
        if (!tradeResult || !tradeResult.id) {
          console.log("CEX取引 失敗");
          const CexTrade_message = {
            text: '<!channel> CEX取引に失敗しました',
          };
          await this.notificationService.sendSlackNotification_nomal(CexTrade_message);
          return;
        }

        await sleep(1000); //1秒待機

        console.log("CEX取引 成功");

        // USDT交換額の取得
        // 手数料を除いたUSDT量を計算


        // 注文IDの確認
        if (!tradeResult || !tradeResult.id) {
          throw new Error('注文IDが取得できません。');
        }

        const orderId = tradeResult.id;
        console.log(`取得した注文ID: ${orderId}`);

        // 注文詳細を取得
        const usdtReceived = await this.mexcService.getAmountAfterTrade(orderId, pair.symbol);
        await sleep(1000); //1秒待機

        // 🔸USDTをWalletへ送金
        // console.log("USDTをWalletへ送金");
        // const sendUSDTResult = await this.mexcService.withdrawToken(CONFIG.SYMBOL_USDT_WITHDRAW, usdtReceived, CONFIG.WALLET_ADDRESS, "TONCOIN", undefined);
        // if (!sendUSDTResult) {
        //   // throw new Error('USDTをWalletへ送金に失敗しました。');
        //   console.error('USDTをWalletへ送金に失敗しました。');
        //   const sendUSDTResult_message = {
        //     text: '<!channel> USDTをWalletへ送金に失敗しました。',
        //   };
        //   await this.notificationService.sendSlackNotification_nomal(sendUSDTResult_message);
        //   return;
        // }
        // await sleep(1000); //1秒待機

        const ArbitrageSuccess_message = {
          text: 'アービトラージ成功',
          attachments: [{
            fields: [
              // { title: '利益', value: `: ${profit.toFixed(2)}` },
              { title: '利益', value: `: ${usdtReceived-amount_usdt}` },
            ]
          }]
        };
        await this.notificationService.sendSlackNotification_nomal(ArbitrageSuccess_message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // ⭐️CEX buy DEX sell

      console.log(`\n ----- ${pair.symbol_token} - ${amount_usdt} USDT- ${arb_threshold} ---Mexc buy--のチェック -----`);
      // Get MEXC price
      const mexc_buy_result = await this.mexcService.estimateTrade(
      pair.symbol,
      amount_usdt,
      'asks'
      );
      // console.log(mexc_buy_result);

      const { totalAmount: mexc_amount_out_buy, reachedPrice: mexc_price_buy } = mexc_buy_result;
      // console.log(`MEXCのbuy価格: ${mexc_price_buy.toFixed(6)} USDT`);

      const units_sell = (mexc_amount_out_buy * Math.pow(10, pair.decimals_token)).toFixed(0);
      // console.log(`units_sell: ${units_sell} `);
      // return;      

      // Get Ston.fi price
      const priceResult_opposite = await this.stonfiService.getPrice(
        pair.ask_address,
        pair.offer_address,
        units_sell
      );

      if (!priceResult_opposite || !priceResult_opposite.router_address) {
        console.log("Router addressの取得に失敗しました");
        return;
      }

      const stonfi_price_sell = priceResult_opposite.price;
      const router_address_opposite = priceResult_opposite.router_address;
      const stonfi_amount_out_opposite = mexc_amount_out_buy / stonfi_price_sell;
      const stonfi_price_sell_opposite = 1/stonfi_price_sell;

      // 詳細な情報出力
      console.log(`${pair.symbol.split('/')[0]}の数量: ${mexc_amount_out_buy}`);
      console.log(`USDTの数量: ${stonfi_amount_out_opposite.toFixed(2)}`);
      console.log(`MEXCのbuy価格: ${mexc_price_buy.toFixed(6)} USDT`);
      console.log(`Ston.fiのsell価格: ${stonfi_price_sell_opposite.toFixed(6)} USDT`);


      // Calculate profit and difference
      const profit_opposit = stonfi_amount_out_opposite - amount_usdt;
      const price_diff_percent_opposit = (profit_opposit / amount_usdt) * 100;

      console.log(`収益: ${profit_opposit.toFixed(2)}`);
      console.log(`収益率: ${price_diff_percent_opposit.toFixed(2)}%`);

      if (price_diff_percent_opposit >= arb_threshold) {

          const timestamp_opposit = this.getTimestamp();
  
          const arbitrageData_opposit: ArbitrageData = {
            timestamp: timestamp_opposit,
            pair: pair.symbol+'/opposite',
            amount_usdt,
            mexc_amount_out: stonfi_amount_out_opposite,
            stonfi_amount_out: mexc_amount_out_buy,
            stonfi_price_buy: parseFloat(mexc_price_buy.toFixed(6)),  // 事前に toFixed を適用
            mexc_price_sell: parseFloat(stonfi_price_sell_opposite.toFixed(6)),  // 事前に toFixed を適用
            price_diff_percent: parseFloat(price_diff_percent_opposit.toFixed(2)),  // 事前に toFixed を適用
            profit: parseFloat(profit_opposit.toFixed(2))  // 事前に toFixed を適用
          };
  
          await this.notificationService.sendSlackNotification(arbitrageData_opposit);
          await this.csvService.saveData(CONFIG.CSV_FILES.OPPORTUNITIES, arbitrageData_opposit);
      

        // 🔸USDT残高確認(CEX)
        const getCEXBalance_USDT = await this.mexcService.getAvailableBalance(CONFIG.SYMBOL_USDT_WITHDRAW)
        console.log("USDT残高", getCEXBalance_USDT)

        // USDT残高が足りていない場合は次の処理へ、Slack通知をする
        if (getCEXBalance_USDT < amount_usdt) {
          console.log(`USDT残高不足 ${getCEXBalance_USDT} < ${amount_usdt}`);
          const BalanceUSDT_message = {
            text: "<!channel> USDT残高が不足しています",
            attachments: [{ 
              fields: [
                { title: "USDT残高", value: `${getCEXBalance_USDT}  USDT` },
              ]
            }]
          };
          await this.notificationService.sendSlackNotification_nomal(BalanceUSDT_message);
          return;
        }

        // 🔸Token残高確認(Wallet )
        const getWalletBalanse_TOKEN = await getJettonBalance(return_keyPair.walletAddress, pair.symbol_token);
        console.log("Token残高", getWalletBalanse_TOKEN)

    
        const mexc_amount_out_buy_decimal = mexc_amount_out_buy * Math.pow(10, pair.decimals_token)
        console.log(`TOKEN購入数量_Decimal: ${mexc_amount_out_buy_decimal}`)

        // Token残高が足りていない場合は次の処理へ、Slack通知をする
        if (getWalletBalanse_TOKEN <= mexc_amount_out_buy_decimal) {
          console.log("Token残高不足");
          const BalanceTOKEN_message = {
            text: '<!channel> TOKEN残高が不足しています',
            attachments: [{
              fields: [
                { title: '残高', value: `${getWalletBalanse_TOKEN} ${pair.symbol_token}` },
              ]
            }]
          };
          await this.notificationService.sendSlackNotification_nomal(BalanceTOKEN_message);
          return;
        }

        console.log("取引を実行します")

        // swap前のWalletのUSDT残高
        const getWalletBalanse_USDT = await getJettonBalance(return_keyPair.walletAddress, CONFIG.SYMBOL_USDT)
        const swap_before_USDT = getWalletBalanse_USDT / Math.pow(10, CONFIG.DECIMAL_USDT_NORMAL)
        console.log("swap前のWalletのUSDT残高", swap_before_USDT)

        // Stonfi Swap TokenをUSDTに交換
        console.log('stonfi swap実行')
        // const stonfi_amount_out_min = Math.floor(stonfi_amount_out);
        if (price_diff_percent >= 5) {  
          slippage = 0.98; // 収益率 1%未満はスリッページを0.5%に抑える
        }
        // const stonfi_amount_out_min = Math.floor(stonfi_amount_out_opposite*slippage);
        const stonfi_amount_out_min = Number((stonfi_amount_out_opposite * slippage));
        // const mexc_amount_out_buy_min = Number((mexc_amount_out_buy * slippage).toFixed(2));

        console.log(`最小出力量: ${stonfi_amount_out_min}`)  
        console.log(`最小出力量_Decimal: ${BigInt(Math.floor(stonfi_amount_out_min * Math.pow(10, CONFIG.DECIMAL_USDT_NORMAL)))}`)
        console.log(`購入数量_Decimal_mexc: ${BigInt(Math.floor(mexc_amount_out_buy * Math.pow(10, pair.decimals_token)))}`)

        // return;
        
        const swapResult = await sendSwap_v2({
          wallet: return_keyPair.wallet,
          keyPair: return_keyPair.keyPair,
          rounterVersion: pair.routerVersion_opposite,
          userwalletAddress: return_keyPair.walletAddress,
          routerAddress: router_address_opposite,
          // routerAddress: pair.routerAddress_opposite,
          offerJettonAddress: pair.ask_address,
          offerAmount: BigInt(Math.floor(mexc_amount_out_buy * Math.pow(10, pair.decimals_token))),
          askJettonAddress: pair.offer_address,
          minAskAmount: BigInt(Math.floor(stonfi_amount_out_min * Math.pow(10, CONFIG.DECIMAL_USDT_NORMAL))),
          // minAskAmount: 0,  
          queryId: Date.now() //12345
        });
      
        if (swapResult["@type"] !== "ok") {
          console.log("Stonfi Swap 失敗");
          const StonfiSwap_message = {
            text: '<!channel> Stonfi Swap に失敗しました',
          };
          await this.notificationService.sendSlackNotification_nomal(StonfiSwap_message);
          return;
        }

        console.log("Stonfi Swap 送信成功");

        // swap送信成功のSlack通知
        const StonfiSwapSuccess_message = {
          text: 'Stonfi Swap 送信成功',
        };
        await this.notificationService.sendSlackNotification_nomal(StonfiSwapSuccess_message);

        // Swap完了確認(SwapTokenのWallet残高確認)
        await sleep(10000);
        const receivedTokenAmount = await waitForSwapCompletion(return_keyPair.walletAddress, CONFIG.SYMBOL_USDT, stonfi_amount_out_min, CONFIG.DECIMAL_USDT_NORMAL, swap_before_USDT);
        console.log("receivedTokenAmount", receivedTokenAmount)
        
        if (!receivedTokenAmount || receivedTokenAmount <= 0) {
          console.error("Swap 実行失敗: 受け取ったトークン量が無効です", receivedTokenAmount);
          const StonfiSwapExecute_message = {
            text: '<!channel> Swap 実行失敗: 受け取ったトークン量が無効です',
          };
          await this.notificationService.sendSlackNotification_nomal(StonfiSwapExecute_message);
          return;
        }



        // 🔸CEX取引 USDTをpair.symbol_tokenに交換　　⭐️USDT
        console.log("CEX取引中...");
        const tradeResult = await this.mexcService.marketExchange(pair.symbol, Math.floor(mexc_amount_out_buy), true);
        console.log("CEX取引詳細 ", tradeResult)
        if (!tradeResult || !tradeResult.id) {
          console.log("CEX取引 失敗");
          const CexTrade_message = {
            text: '<!channel> CEX取引に失敗しました',
          };
          await this.notificationService.sendSlackNotification_nomal(CexTrade_message);
          return;
        }

        await sleep(1000); //1秒待機

        console.log("CEX取引 成功");

        // 取引完了のSlack通知
        const CexTradeSuccess_message = {
          text: 'CEX取引 成功',
        };
        await this.notificationService.sendSlackNotification_nomal(CexTradeSuccess_message);

        // 注文IDの確認
        if (!tradeResult || !tradeResult.id) {
          throw new Error('注文IDが取得できません。');
        }

        const orderId = tradeResult.id;
        console.log(`取得した注文ID: ${orderId}`);

        // 注文詳細を取得
        const usdtpayed = await this.mexcService.getAmountAfterTrade(orderId, pair.symbol);
        await sleep(1000); //1秒待機


        // アービトラージ成功のSlack通知
        const ArbitrageSuccess_message = {
          text: 'アービトラージ成功',
          attachments: [{
            fields: [
              { title: '利益', value: `: ${receivedTokenAmount-usdtpayed}` },
            ]
          }]    
        };
        await this.notificationService.sendSlackNotification_nomal(ArbitrageSuccess_message);


     }
      

  // 

    } catch (error) {
      console.error('Arbitrage check error:', error);
      await this.notificationService.sendSlackNotification_nomal(error);
    }
  }

  async start(): Promise<void> {
    while (true) {
      for (const pair of TOKEN_PAIRS_USDT) {
        for (const amount of AMOUNT_LIST_USDT) {
          await this.checkArbitrage(pair, amount);
          // await this.checkArbitrage(pair, 1.1);
          const timestamp = this.getTimestamp();
          console.log(timestamp);
        }
      }
    }
  }
}