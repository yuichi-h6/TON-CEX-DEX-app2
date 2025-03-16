import TonWeb from 'tonweb';
import tonMnemonic from "tonweb-mnemonic";
import { TonClient, toNano } from "@ton/ton";
import { DEX, pTON } from "@ston-fi/sdk";
import axios from "axios";
// import StonFiApi from "@ston-fi/api";

import { CONFIG } from '../config/config';

// 環境変数の読み込み
// dotenv.config();
const tonApiKey = CONFIG.TON_API_KEY;
// const tonApiKey_testnet = process.env.TON_API_KEY_TESTNET;

// tonwebの初期化
// メインネット
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {   
    apiKey: tonApiKey
}));

// テストネット
// const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {
//     apiKey: tonApiKey_testnet
// }));


// const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
//     apiKey: tonApiKey
// }));

const tonClient = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    // endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

// StonFiのインスタンスを作成
// const API_URL = "https://api.ston.fi"; // APIのエンドポイント
// const stonFi = new StonFiApi({ apiUrl: API_URL });


export async function createKeypair(mnemonic: string) {

    if (!mnemonic) {
        throw new Error('MNEMONIC_DEV_TEST2 is not defined in .env file');
    }

    // ニーモニックを配列に分割
    const mnemonicArray = await mnemonic ? mnemonic.split(' ') : []; // 空チェック

    // 公開鍵と秘密鍵を生成
    const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonicArray);
    // console.log('Key Pair:', keyPair);
    // console.log('Public Key:', TonWeb.utils.bytesToHex(keyPair.publicKey));
    // console.log('Private Key:', TonWeb.utils.bytesToHex(keyPair.secretKey));

    // v4R2ウォレットを作成
    const WalletClass = tonweb.wallet.all.v4R2;
    // const WalletClass = tonweb.wallet.all.v5r1;

    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        // wc: -1 // v5のアドレスは -1:<hash>
    });

    // ウォレットアドレスを取得
    const walletAddress = await wallet.getAddress();
    // console.log('Wallet Address:', walletAddress.toString(true, true, true));
    
    // return keyPair;
    return {
        keyPair: keyPair,
        wallet: wallet,
        walletAddress: walletAddress.toString(true, true, true)
    }
}


// ウォレットをデプロイ
export async function deployWallet(wallet: any, keyPair: any) {
    const deploy =  await wallet.deploy(keyPair.secretKey); // deploy method
    console.log('Deploy:', deploy);

    const deployFee = await deploy.estimateFee()  // get estimate fee of deploy
    console.log('Deploy Fee:', deployFee);

    const deploySended = await deploy.send() // deploy wallet contract to blockchain
    console.log('Deploy Sended:', deploySended);
    return deploySended;

    // const deployQuery = await deploy.getQuery();   // get deploy query Cell 
    // console.log('Deploy Query:', deployQuery);
}

// ウォレット情報を取得
export async function getWalletInfo() {
    const walletInfo = await tonweb.provider.getAddressInfo(walletAddress.toString());
    console.log('Wallet Info:', walletInfo);
}

// 残高確認
export async function getJettonBalance(walletAddress: string, symbol: string) {
    try {
        const TON_API_BASE_URL = "https://tonapi.io/v2";
        const response = await axios.get(`${TON_API_BASE_URL}/accounts/${walletAddress}/jettons`);
        const jettons = response.data.balances;
        // console.log(jettons)

        // 指定した Jetton (USDC) の残高を取得
        const Balance = jettons.find((jetton: any) => jetton.jetton.symbol === symbol);

        if (Balance) {
            return Balance.balance;
        } else {
            // console.log("USDC balance not found.");
            return "balance not found.";
        }
    } catch (error) {
        // console.error("Error fetching Jetton balance:", error);
            return error;
    }
}


// トランザクション履歴を取得
export async function getTransactionHistory(address) {
    const txHistory = await tonweb.provider.getTransactions(address.toString(), 21);
    console.log('Transaction History:', txHistory);
}

// Ton送金
export async function sendTon(wallet: any, keyPair: any, walletAddress: string, amount: string) {
    try {
        const recipientAddress = walletAddress; // 受信者のアドレス
        console.log('Recipient Address:', recipientAddress);

        const senderWallet = wallet;
        const sendAmount = await TonWeb.utils.toNano(amount); // 送金額 (0.01 TON)

        // ウォレット seqno（トランザクション番号）を取得
        const seqno = await senderWallet.methods.seqno().call(); // 現在のseqnoを取得
        console.log('Seqno:', seqno);

        const transfer = senderWallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: recipientAddress,
            amount: sendAmount,
            seqno: seqno,
            payload: 'Hello, TON!', // オプションのメッセージ
            sendMode: 3,
        });

        console.log('Transfer:', transfer);

        const transferSended = await transfer.send();  // send transfer query to blockchain
        console.log('Transfer Sended:', transferSended);
        return transferSended;

    } catch (error) {
        console.error('送金エラー:', error);
        return error;
    }

}

// Token送金
export async function sendToken(
        params:{
        wallet: any,
        keyPair: any,
        recipientAddress: string,
        amount: number,
        decimals: number,
        comment: string,
        contractAddress: string
    }
) {
    try {
        // const BN = TonWeb.utils.BN;
        const senderAddress = params.wallet.address;
        const recipientAddress = params.recipientAddress;
        const comment_string = params.comment;
        // const amountToSend = new TonWeb.utils.BN(Math.floor(params.amount * (10 ** params.decimals)));
        const amountToSend = new TonWeb.utils.BN(Math.floor(params.amount * (10 ** params.decimals)).toString());

        console.log('amountToSend:', amountToSend.toString(10));
    
        // ✅ JettonMinter（USDTのコントラクト）を取得
        const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
            address: params.contractAddress,
        });
    
        // console.log('Jetton Minter Address:', jettonMinter.address.toString(true, true, true));
    
        
        // ✅ 送信者の JettonWallet を取得
        const senderJettonWalletAddress = await jettonMinter.getJettonWalletAddress(
            new TonWeb.utils.Address(senderAddress) // sender wallet
        );
        
        // console.log('Sender Jetton Wallet Address:', senderJettonWalletAddress.toString(true, true, true));
    
        // ✅ 受信者の JettonWallet を取得
        const recipientJettonWalletAddress = await jettonMinter.getJettonWalletAddress(
            new TonWeb.utils.Address(recipientAddress) // recipient wallet
        );
    
        // console.log('Recipient Jetton Wallet Address:', recipientJettonWalletAddress.toString(true, true, true));
    
        // ✅ 送信者の JettonWallet のインスタンスを作成
        const senderJettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
            address: senderJettonWalletAddress,
        });
    
        // ✅ 送信メッセージ
        const comment = new Uint8Array([...new Uint8Array(4), ...new TextEncoder().encode(comment_string)]);

        // ✅ 送金処理（TONウォレット経由でJettonを送る）
        const tx = params.wallet.methods.transfer({
            secretKey: params.keyPair.secretKey,
            toAddress: senderJettonWallet.address!,  // ✅ 送信者の JettonWallet にTONを送る
            // amount: TonWeb.utils.toNano('0.2'), // ガス代（TON）
            amount: TonWeb.utils.toNano('0.05'), // ガス代（TON）
            // seqno: (await params.wallet.methods.seqno().call()) ?? 0,
            seqno: await params.wallet.methods.seqno().call(),

            payload: await senderJettonWallet.createTransferBody({
                queryId: Date.now(), // 1111,
                jettonAmount: new TonWeb.utils.BN(amountToSend), // 
                // tokenAmount: new TonWeb.utils.BN(amountToSend), // 
                toAddress: new TonWeb.utils.Address(recipientAddress), // , // ✅ Jetton Wallet アドレスを指定
                // forwardAmount: TonWeb.utils.toNano('0.01'), // ✅ 受信者の JettonWallet にガス代を渡す
                forwardAmount: 1, // ✅ 受信者の JettonWallet にガス代を渡す
                forwardPayload: comment,
                responseAddress: params.wallet.address, // 
                bounce: true,
                // bounce: false, // 一旦falseで試す
            }),

            sendMode: 3,
        });
    
        const returnValue = await tx.send();
        // console.log('Transaction sent:', returnValue);
        return returnValue;
    } catch (error) {
        console.error('USDT transfer error:', error);
    }
    
    
    
}

// Stonfi Swap v1 TON to jetton
export async function sendSwap_v1() {
    try {
        const dex = tonClient.open(new DEX.v1.Router());
        // const dex = tonweb.open(new DEX.v1.Router());

        const txParams = await dex.getSwapTonToJettonTxParams({
            offerAmount: toNano("0.01"), // swap 1 TON
            askJettonAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO", // for a STON
            minAskAmount: toNano("0.001"), // but not less than 0.1 STON
            proxyTon: new pTON.v1(),
            userWalletAddress: (await wallet.getAddress()).toString(),
        });

        const transferSended_swapv1 = await wallet.methods
            .transfer({
                secretKey: keyPair.secretKey,
                toAddress: txParams.to.toString(),
                amount: new tonweb.utils.BN(txParams.value),
                seqno: (await wallet.methods.seqno().call()) ?? 0,
                payload: TonWeb.boc.Cell.oneFromBoc(
                    TonWeb.utils.base64ToBytes(txParams.body?.toBoc().toString("base64"))
                ),
                sendMode: 3,
            })
            .send();

        console.log('Transfer Sended:', transferSended_swapv1);
        return transferSended_swapv1;

    }
    catch (error) {
        console.error('送金エラー:', error);
        return error;
    }
}


// Stonfi Swap v2 jetton to jetton
export async function sendSwap_v2(
    params:{
        wallet: any,
        keyPair: any,
        rounterVersion: string,
        userwalletAddress: string,
        routerAddress: string,
        offerJettonAddress: string,
        offerAmount: number,
        askJettonAddress: string,
        minAskAmount: number,
        queryId: number
    }
) 
{
    try {
        let txParams;
        let router;

        // デバッグ情報の出力
        console.error("=== Swap Debug Info ===");
        console.error("Router Version:", params.rounterVersion);
        console.error("Router Address:", params.routerAddress);
        console.error("Offer Token:", params.offerJettonAddress);
        console.error("Ask Token:", params.askJettonAddress);
        console.error("Offer Amount:", params.offerAmount);
        console.error("Min Ask Amount:", params.minAskAmount);

        if (params.askJettonAddress === 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ') {
            console.log('Tonトークンのtx作成');
            if (params.rounterVersion === 'v1') {
                router = tonClient.open(
                    DEX.v1.Router.create(
                        params.routerAddress
                    )
                );
            }
            else if (params.rounterVersion === 'v2_1') {
                router = tonClient.open(
                    DEX.v2_1.Router.create(
                        params.routerAddress
                    )
                );
            }
              
            const proxyTon = pTON.v2_1.create(
            "EQBnGWMCf3-FZZq1W4IWcWiGAc3PHuZ0_H-7sad2oY00o83S" // pTON v2.1.0
            );

            txParams = await router.getSwapJettonToTonTxParams({
                userWalletAddress: params.userwalletAddress, // ! replace with your address
                offerJettonAddress: params.offerJettonAddress,
                offerAmount: params.offerAmount.toString(),
                minAskAmount: toNano(0),//toNano(params.minAskAmount),
                proxyTon,
                queryId: params.queryId,
            });
        }
        else
        {
            console.log('Ton以外のトークンのtx作成');
            if (params.rounterVersion === 'v1') {
                router = tonClient.open(
                    DEX.v1.Router.create(
                        params.routerAddress
                    )
                );
            }
            else if (params.rounterVersion === 'v2_1') {
                router = tonClient.open(
                    DEX.v2_1.Router.create(
                        params.routerAddress
                    )
                );
            }
    
            txParams = await router.getSwapJettonToJettonTxParams({
                userWalletAddress: params.userwalletAddress, // ! replace with your address
                offerJettonAddress: params.offerJettonAddress,
                offerAmount: params.offerAmount.toString(),
                askJettonAddress: params.askJettonAddress,
                minAskAmount: params.minAskAmount,
                // minAskAmount: toNano(params.minAskAmount),
                queryId: params.queryId,
            });
        }
        

        console.error("Generated txParams:", JSON.stringify(txParams, null, 2));

        const transferSended_swapv2 = await params.wallet.methods
            .transfer({
                secretKey: params.keyPair.secretKey,
                toAddress: txParams.to.toString(),
                amount: new tonweb.utils.BN(txParams.value),
                seqno: (await params.wallet.methods.seqno().call()) ?? 0,
                payload: TonWeb.boc.Cell.oneFromBoc(
                    TonWeb.utils.base64ToBytes(txParams.body?.toBoc().toString("base64"))
                ),
                sendMode: 3,
            })
            .send();

        console.error("Transfer Result:", JSON.stringify(transferSended_swapv2, null, 2));
        return transferSended_swapv2;

    }
    catch (error) {
        console.error("=== Swap Error Details ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return error;
    }
}


// トランザクション取得
// * 送信後の最新トランザクションを取得して txHash を取得する
// * @param walletAddress 送信元のウォレットアドレス
// * @returns 最新のトランザクションハッシュを返す
// */
export async function getLatestTransactionHash(walletAddress: string): Promise<string | null> {
   try {
    //    const transactions = await tonweb.getTransactions(walletAddress, { limit: 1 });
       const transactions = await tonweb.provider.getTransactions(walletAddress.toString(), 1);
       if (transactions.length > 0) {
           console.log("✅ 取得した最新のトランザクション:", transactions[0]);
        //    return transactions[0].hash;
           return transactions[0].transaction_id.hash;
       }
   } catch (error) {
       console.error("❗ トランザクション取得エラー:", error);
   }
   return null;
}


// トランザクションのステータス取得
// * 指定したトランザクションのステータスを取得する
// * @param walletAddress 送信元のウォレットアドレス
// * @param txHash トランザクションのハッシュ
// * @returns "success", "failed", "pending" のいずれかを返す
// */
async function getTransactionStatus(walletAddress: string, txHash: string): Promise<string> {
   try {
       // トランザクションのリストを取得
       const transactions = await tonweb.getTransactions(walletAddress, { limit: 10 });

       // 指定のトランザクションを検索
       const tx = transactions.find((t: any) => t.hash === txHash);

       if (!tx) return "pending"; // トランザクションがまだ確認できない場合

       // ステータス判定
       if (tx.out_msgs && tx.out_msgs.length > 0) {
           return "success"; // 成功
       } else if (tx.description?.type === "error") {
           return "failed"; // 失敗
       }

       return "pending"; // まだ確定していない
   } catch (error) {
       console.error("❗ トランザクションの取得エラー:", error);
       return "failed";
   }
}

// import { StonFiApi } from "@ston-fi/api";

// const API_URL = "https://api.ston.fi"; // APIのエンドポイント

// async function checkSwapStatus(swapTxHash: string) {
//     try {
//         // StonFi API インスタンスを作成
//         const stonFi = await StonFiApi.create(API_URL);

//         // スワップのステータスを取得
//         const status = await stonFi.getSwapStatus(swapTxHash);
//         console.log("Swap Status:", status);

//         if (status.status === "Completed") {
//             console.log("✅ Swap completed successfully!");
//             return;
//         } else if (status.status === "Pending") {
//             console.log("⏳ Swap is still pending...");
//         } else {
//             console.log("❌ Swap failed or unknown status:", status.status);
//         }

//         // 5秒ごとに再試行
//         setTimeout(() => checkSwapStatus(swapTxHash), 5000);
//     } catch (error) {
//         console.error("⚠️ Error checking swap status:", error);
//     }
// }

// import { StonFiApi } from "@ston-fi/api";




// const swapTxHash = "0x123456789abcdef"; // 実際のTxハッシュを設定
// checkSwapStatus(swapTxHash);

import { StonApiClient } from "@ston-fi/api";

const stonApiClient = new StonApiClient({
  baseURL: process.env.STON_API_URL ?? "https://api.ston.fi",
});

export async function checkSwapStatus(swapTxHash: any) {
    try {
        // const stonFi = await StonFiApi.create(API_URL);
        const status = await stonApiClient.getSwapStatus
        ({
            // ...transactionDetails,
            // queryId: swapTxHash.toString(),  // queryIdを文字列に変換
            queryId: encodeURIComponent(swapTxHash.toString()),
        });
        // (
        //     swapTxHash
        // );
        console.log("Swap Status:", status);
    } catch (error) {
        console.error("Error:", error);
    }
}
