import dotenv from 'dotenv';
import { createKeypair, deployWallet, getWalletInfo, getJettonBalance, getTransactionHistory, sendTon, sendToken, sendSwap_v1, sendSwap_v2, getLatestTransactionHash, checkSwapStatus  } from "./module/stonfi-sdk";
import { send } from 'process';


// 環境変数の読み込み
dotenv.config();

// ニーモニックフレーズと受信アドレス
// const mnemonic = process.env.MNEMONIC_DEV_TEST2;
const mnemonic = process.env.MNEMONIC_STONFI || "";
const userwalletAddress = process.env.WALLET_ADDRESS_DEV_TEST2;
const recipientAddress: string = process.env.WALLET_ADDRESS_DEV_TEST_HEX_v4 || "";
const recipientAddress_mexc: string = process.env.MEXC_TON_ADDRESS || "";
const coment_mexc: string = process.env.MEXC_TON_COMMENT || "";
const tonApiKey = process.env.TON_API_KEY;

if (!mnemonic) {
    throw new Error('MNEMONIC_DEV_TEST2 is not defined in .env file');
}


// KeyPairを生成
const return_keyPair = await createKeypair(mnemonic);
// console.log('Key Pair:', keyPair);
// console.log(return_keyPair);
console.log("Wallet address", return_keyPair.walletAddress)



// デプロイウォレット
async function deployWallet_call(wallet: any, keyPair: any) {

    const return_deployWallet = await deployWallet(wallet, keyPair);
    console.log(return_deployWallet);

    return return_deployWallet
}


// 残高取得
async function getBalance() {

    const walletAddress = return_keyPair.walletAddress; // USDCの残高を取得したいウォレット
    // const symbol = "USD₮"
    // const decimals = 6
    const symbol = "DOGS"
    const decimals = 9

    const getBlanse = await getJettonBalance(walletAddress, symbol);
    // console.log("残高", getBlanse)
    console.log("残高:", getBlanse / Math.pow(10, decimals)); 
    
}

// Token送付
async function sendToken_call() {

    const amount = 0.01;
    const recipientAddress = recipientAddress_mexc;
    const contractAddress = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"

    const return_sendToken = await sendToken({
        wallet: return_keyPair.wallet,
        keyPair: return_keyPair.keyPair,
        recipientAddress: recipientAddress,
        amount: amount,
        decimals: 6,
        comment: coment_mexc,
        contractAddress: contractAddress,
    })
    console.log("Token送付", return_sendToken);
}




// Stonfi Swap v2 TON to jetton
async function sendSwap_v2_call() {
    const offerJettonAddress = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"; // USDT
    // const askJettonAddress = "EQA3AshPEVly8wQ6mZincrKC_CkJSKXqqjyg0VMsVjF_CATS"; // CATS
    // const routerAddress = "EQCx0HDJ_DxLxDSQyfsEqHI8Rs65nygvdmeD9Ra7rY15OWN8"; // CPI Router v2.1.0
    // const rounterVersion = "v2_1";
    const offerAmount = 0.1 * 10 ** 6; // 0.1 USDT
    const minAskAmount = 0.02;
    const queryId = 12345;
    
    // const askJettonAddress = "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo";    // HMSTR
    // const routerAddress = "EQBZj7nhXNhB4O9rRCn4qGS82DZaPUPlyM2k6ZrbvQ1j3Ge7"; // CPI Router v2.1.0
    // const rounterVersion = "v2_1";

    // const askJettonAddress = "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7";   // CATI
    // const routerAddress = "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"; // 
    // const rounterVersion = "v1";

    // const askJettonAddress = "EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon";   // JETTON
    // const routerAddress = "EQBCtlN7Zy96qx-3yH0Yi4V0SNtQ-8RbhYaNs65MC4Hwfq31"; // 
    // const rounterVersion = "v2_1";

    // const askJettonAddress = "EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR";    // MAJOR
    // const routerAddress = "EQAyD7O8CvVdR8AEJcr96fHI1ifFq21S8QMt1czi5IfJPyfA";
    // const rounterVersion = "v2_1";

    const askJettonAddress = "UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ";    // TON
    const routerAddress = "EQDQ6j53q21HuZtw6oclm7z4LU2cG6S2OKvpSSMH548d7kJT";
    const rounterVersion = "v2_1";



// stonfi v2 swap
    const swapResult = await sendSwap_v2({
        wallet: return_keyPair.wallet,
        keyPair: return_keyPair.keyPair,
        userwalletAddress: return_keyPair.walletAddress,
        rounterVersion: rounterVersion,
        routerAddress: routerAddress,
        offerJettonAddress: offerJettonAddress,
        offerAmount: offerAmount,
        askJettonAddress: askJettonAddress,
        minAskAmount: minAskAmount,
        queryId: queryId,
    });
    console.log(swapResult);
}


// ⭐️実行コード

// デプロイウォレットを実行
// deployWallet_call(return_keyPair.wallet, return_keyPair.keyPair);


// 残高取得を実行
// getBalance();

// トランザクション履歴確認
// getTransactionHistory(address_testnet);
// console.log(return_keyPair.walletAddress)
// getTransactionHistory(return_keyPair.walletAddress);

// Ton送付を実行
// console.log("recipientAddress", recipientAddress)
// const recipientAddress_ton = recipientAddress;
// const return_sendTon = await sendTon(return_keyPair.wallet, return_keyPair.keyPair, recipientAddress_ton, "0.01");

// Token送付を実行
// sendToken_call();

// Stonfi Swap v2 TON to jettonを実行
// sendSwap_v2_call();


// const transactionId = swapResult["@extra"]; // ここで適切なIDを取得
// const transactionId = "1739961546.0719254:7:0.10101656472801734"; // ここで適切なIDを取得
// const receivedTokenAmount = await checkSwapCompletion(transactionId);
// if (receivedTokenAmount !== null) {
//     console.log(`スワップ完了！ 受け取ったトークン: ${receivedTokenAmount}`);
// }

// getLatestTransactionHash(return_keyPair.walletAddress).then(txHash => {
//     if (txHash) {
//         console.log("🔍 最新のトランザクションハッシュ:", txHash);
//     } else {
//         console.log("⚠️ トランザクションハッシュが見つかりませんでした。");
//     }
// });

// 使用例（送信したスワップのTxハッシュを渡す）
// const swapTxHash = "1739961546.0719254:7:0.10101656472801734"; // ここに実際のTxハッシュをセット
// const transactionDetails =  { '@type': 'ok', '@extra': '1740535769.5627625:5:0.17925259861597365' };
// const swapTxHash = "1740535758537"; // ここに実際のTxハッシュをセット
// // const swapTxHash = "12345"; // ここに実際のTxハッシュをセット
// checkSwapStatus(swapTxHash);