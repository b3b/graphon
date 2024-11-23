import { Address, Contract, contractAddress, toNano } from "@ton/core";
import TonWeb from "tonweb";

import {getCollection, newTonWebSender, newTonClient} from "./utils";

(async () => {
    const collection = await getCollection();
    const data = await collection.collection.getCollectionData();
    const itemIndex = data.nextItemIndex;

    const author = getAuthorAddress();
    
    const sender = await newTonWebSender();
    const wallet = sender.wallet;
    const secretKey = sender.secretKey;

    const contentUri = `${itemIndex}.json`
    console.log("Mint. Collection address:", collection.address);
    console.log("itemContentUri:", contentUri);
    console.log("Item owner:", author.toString());

    console.log (
        await wallet.methods.transfer({
            secretKey: secretKey,
            toAddress: collection.address,
            amount: TonWeb.utils.toNano('0.2'),
            seqno: sender.seqno,
            payload: await collection.collection.createMintBody({
                amount: TonWeb.utils.toNano('0.2'),
                itemIndex: itemIndex,
                itemOwnerAddress: author,
                itemContentUri: contentUri,
            }),
            sendMode: 3,
        }).send()
    );


})();

function getAuthorAddress() {
    const args = process.argv.slice(2);
    if (args.length < 1) throw new Error("Should specify the author of the NFT.");
    return new TonWeb.Address(args[0]);
}

