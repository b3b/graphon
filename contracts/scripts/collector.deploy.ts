import * as fs from "fs";
import * as path from "path";
import { Address, contractAddress, toNano } from "@ton/core";
import { TonClient, WalletContractV3R2 } from "@ton/ton";
import { CollectorContract } from "../output/graphon_nft_CollectorContract";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { delay, getContractInitParams, initContract, isTestnet, newTonClient, newSender } from "./utils";

async function deployContract(contract: any, address: any) {
    const client = newTonClient();
    const senderCreated = await newSender(client);
    const wallet = senderCreated.wallet;
    const sender = senderCreated.sender;

    let contractDeployed = await client.isContractDeployed(address);

    if (contractDeployed) {
        console.error("Contract was already deployed before.");
        return;
    }

    let balance = await wallet.getBalance();
    console.log(`Wallet balance: ${balance}`);
    let seqno = await wallet.getSeqno();
    console.log(`Wallet seqno: ${seqno}`);

    await client.open(contract).send(sender, { value: toNano("0.2") }, { $$type: "Deploy", queryId: 0n });

    console.log("Wait contract deploy confirmation ...");
    while (!contractDeployed) {
        contractDeployed = await client.isContractDeployed(address);
        await delay(1100);
    }

    await client.open(contract).send(sender, { value: toNano("0.3") }, "topUP");
    
}

(async () => {
    let packageName = "graphon_nft_CollectorContract.pkg";
    console.log(`Contract init arguments: ${await getContractInitParams()}`,);
    let init = await initContract();

    let address = contractAddress(0, init);
    let addressString = address.toString({ testOnly: isTestnet() });
    let data = init.data.toBoc();
    let pkg = fs.readFileSync(path.resolve(__dirname, "..", "output", packageName));


    console.log();
    console.log("Contract address:", addressString);
    console.log();

    await deployContract(await CollectorContract.fromInit(...await getContractInitParams()), address);
    console.log("Contract deployed.");

    fs.writeFile("sources/output/address", addressString, (err) => {
        if (err) {
            console.error("Error saving contract address  to file file:", err);
            return;
        }
    });
})();
