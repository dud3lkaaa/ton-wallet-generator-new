import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton'; // Исправляем импорт
import axios from 'axios';

// Тип для кошелька
interface Wallet {
  seed_phrase: string;
  address: string;
  balance: number;
  state?: string;
  walletType?: string;
}

const API_KEYS = [
  "AGUNLLUL232RH4YAAAAGUY6GW3PXCGRJ4GNAMSIIEAAJIIIBN7ZQZR4HA67YBPKHZXHHF3A",
  "AGUNLLULS22FFZIAAAAOMJK4CDLRWKZCF5ZUUGGCFI3XA5VRDUV3YUHM5EZJ7MZA3R2GGOQ",
  "AGUNLLULYGISWHQAAAANFYNGKXB2XV6TNYRHUAVLISQXN5D6NN7O5F2V6ZJV3FGFJ24IXGQ",
  "AGUNLLULRXS36LIAAAAPJRQIICZNNA5I54MNI74JD42CKDTWUCM4VKASBUGNHAK3G7T6E4Q",
  "AGUNLLULXRP6IIQAAAAFDLGXLL4T3QRXWS7PMMJPEU3BELCE2AJAPMBFLVHQC24KO7CECFQ",
  "AGUNLLULMR2VR5IAAAADGXUMPLA33JBVEQQLEOGM7KZF5QNBBWCJJTDHIBC4N4VUM2HCPZQ",
];
const TON_API_URL = 'https://tonapi.io/v2/accounts';
const BATCH_SIZE = 5;
let checked = 0;
const results: { all_wallets: Wallet[]; balance_wallets: Wallet[] } = { all_wallets: [], balance_wallets: [] }; // Явный тип
const usedSeeds = new Set<string>();

async function generateWallet(): Promise<Wallet> {
  const startTime = Date.now();
  let mnemonic: string[], seed_phrase: string;
  do {
    mnemonic = await mnemonicNew();
    seed_phrase = mnemonic.join(' ');
  } while (usedSeeds.has(seed_phrase));

  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const address = wallet.address.toString();
  usedSeeds.add(seed_phrase);
  console.log(`Generated wallet: ${address} (time: ${Date.now() - startTime} ms)`);
  return { seed_phrase, address, balance: 0, walletType: 'v4r2' };
}

async function checkAddress(wallet: Wallet) {
  const startTime = Date.now();
  const keyIndex = Math.floor(Math.random() * API_KEYS.length);
  try {
    const response = await axios.get(`${TON_API_URL}/${wallet.address}`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS[keyIndex]}`,
        'Content-Type': 'application/json',
      },
    });
    const result = response.data;
    const balance = result.balance ? parseInt(result.balance) / 10 ** 9 : 0;
    const state = result.status || 'nonexist';
    const walletData = { ...wallet, balance, state };
    results.all_wallets.push(walletData);
    console.log(`Checked wallet ${wallet.address}, balance: ${balance} TON, state: ${state} (time: ${Date.now() - startTime} ms)`);
    if (balance > 0) {
      results.balance_wallets.push(walletData);
      const li = document.createElement('li');
      li.textContent = `Address: ${wallet.address}, Seed: ${wallet.seed_phrase}, Balance: ${balance} TON`;
      document.getElementById('walletList')!.appendChild(li);
    }
    checked++;
    document.getElementById('progress')!.textContent = `Checked: ${checked}`;
  } catch (error) {
    console.error(`Error checking ${wallet.address}:`, error instanceof Error ? error.message : String(error));
  }
}

async function generationProcess() {
  while (true) {
    const batchStartTime = Date.now();
    const wallets = await Promise.all(
      Array.from({ length: BATCH_SIZE }, generateWallet)
    );
    await Promise.all(wallets.map(checkAddress));
    const elapsed = Date.now() - batchStartTime;
    const delay = Math.max(0, 1000 - elapsed);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

document.getElementById('startButton')!.addEventListener('click', () => {
  document.getElementById('startButton')!.setAttribute('disabled', 'true');
  generationProcess().catch(error => console.error('Generation process error:', error));
});