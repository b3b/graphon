import { Address, Cell, Contract, contractAddress, toNano } from "@ton/core";
import { TonClient, WalletContractV3R2 } from "@ton/ton";
import { mnemonicToPrivateKey, mnemonicToWalletKey } from "@ton/crypto";
import TonWeb from "tonweb";
import { CollectorContract } from "../output/graphon_nft_CollectorContract";

// Utility function to check and get required environment variables
function getRequiredEnvVars(vars: string[]): Record<string, string> {
    const values: Record<string, string> = {};
    for (const variable of vars) {
        const value = process.env[variable];
        if (!value) throw new Error(`${variable} environment variable is not set.`);
        values[variable] = value;
    }
    return values;
}

// Get contract initialization parameters
export async function getContractInitParams(): Promise<[Address, Cell]> {
    const { COLLECTOR_REWARD_AMOUNT } = getRequiredEnvVars(["COLLECTOR_REWARD_AMOUNT"]);
    const collection = await getCollection();
    const nftItemCode: Cell = Cell.fromBoc(
        Buffer.from(TonWeb.token.nft.NftItem.codeHex, 'hex')
    )[0];

    return [
        Address.parse(collection.address),
        nftItemCode,
    ];
}

// Initialize the contract
export async function initContract() {
    return await CollectorContract.init(...await getContractInitParams());
}

// Get the contract address
export async function getContractAddress() {
    return contractAddress(0, await initContract());
}

// Open the Collector contract
export async function openCollectorContract(client?: TonClient) {
    return openContract(CollectorContract, await getContractAddress(), client);
}

// Create a new TonClient instance
export function newTonClient() {
    const network = isTestnet() ? "testnet" : "mainnet";
    const { TON_API_URL, TON_API_KEY } = getRequiredEnvVars(["TON_API_URL", "TON_API_KEY"]);
    return new TonClient({ endpoint: TON_API_URL, apiKey: TON_API_KEY });
}

// Determine if the environment is testnet
export function isTestnet(): boolean {
    return parseBoolEnv("TON_TESTNET");
}

// Parse a boolean environment variable
export function parseBoolEnv(envVar: string): boolean {
    const value = process.env[envVar];
    if (!value) throw new Error(`${envVar} environment variable is not set.`);
    const parsed = new Map([["1", true], ["0", false]]).get(value);
    if (parsed === undefined) throw new Error(`Invalid value for ${envVar}. Must be '1' or '0'.`);
    return parsed;
}

// Create a new sender using TonClient
export async function newSender(client: TonClient) {
    const { TON_PRIVATE_MNEMONIC } = getRequiredEnvVars(["TON_PRIVATE_MNEMONIC"]);
    const key = await mnemonicToPrivateKey(TON_PRIVATE_MNEMONIC.split(" "));
    const wallet = client.open(WalletContractV3R2.create({ publicKey: key.publicKey, workchain: 0 }));
    return { wallet, sender: wallet.sender(key.secretKey) };
}

// Create a new TonWeb sender
export async function newTonWebSender() {
    const { TON_PRIVATE_MNEMONIC, TON_API_URL, TON_API_KEY } = getRequiredEnvVars([
        "TON_PRIVATE_MNEMONIC",
        "TON_API_URL",
        "TON_API_KEY",
    ]);
    const tonweb = new TonWeb(new TonWeb.HttpProvider(TON_API_URL, { apiKey: TON_API_KEY }));
    const keyPair = await mnemonicToWalletKey(TON_PRIVATE_MNEMONIC.split(" "));
    const wallet = new TonWeb.Wallets.all.v3R2(tonweb.provider, { publicKey: keyPair.publicKey, wc: 0 });

    return {
        wallet,
        secretKey: keyPair.secretKey,
        seqno: (await wallet.methods.seqno().call()) || 0,
    };
}

// Fetch collection data
export async function getCollection() {
    const { collectionMetaURL, collectionBaseURL } = getSettings();
    const sender = await newTonWebSender();

    if (!(await isFileAvailable(collectionMetaURL))) {
        throw new Error(`Collection metadata is not available at ${collectionMetaURL}.`);
    }

    const collection = new TonWeb.token.nft.NftCollection(sender.wallet.provider, {
        ownerAddress: sender.wallet.address,
        royalty: 0,
        royaltyAddress: sender.wallet.address,
        collectionContentUri: collectionMetaURL,
        nftItemContentBaseUri: collectionBaseURL,
        nftItemCodeHex: TonWeb.token.nft.NftItem.codeHex,
    });

    const address = (await collection.getAddress()).toString(true, true, true, isTestnet());

    return { collection, address };
}

// Get environment settings for the collection
export function getSettings() {
    const { COLLECTION_META_URL, COLLECTION_BASE_URL } = getRequiredEnvVars([
        "COLLECTION_META_URL",
        "COLLECTION_BASE_URL",
    ]);
    return { collectionMetaURL: COLLECTION_META_URL, collectionBaseURL: COLLECTION_BASE_URL };
}

// Check if a file is available at a given URL
async function isFileAvailable(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: "GET" });
        return response.status === 200;
    } catch (error) {
        console.error("Error checking file:", error);
        return false;
    }
}

// Open a contract using TonClient
async function openContract(contractType: any, address: Address, client?: TonClient) {
    if (!client) client = newTonClient();
    return client.open(await contractType.fromAddress(address));
}

// Wait for the next seqno of the wallet
export async function nextSeqno(wallet: any) {
    let seqno = await wallet.getSeqno();
    while ((await wallet.getSeqno()) <= seqno) {
        await delay(500);
    }
}

// Utility for adding delays
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
