import { ArbitrageBot } from './arbitrage';
// import { ArbitrageBot } from './arbitrage_parallel';
import { initializeCSVFiles } from './utils/initializeFiles';

initializeCSVFiles();

const bot = new ArbitrageBot();
bot.start().catch(console.error);