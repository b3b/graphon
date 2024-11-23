import { Address, Contract, beginCell, contractAddress, toNano } from "@ton/core";
import TonWeb from "tonweb";

import {getCollection, getContractAddress, newTonWebSender, newTonClient} from "./utils";

(async () => {
    const collection = await getCollection();
    const data = await collection.collection.getCollectionData();

    const itemAddress = await collection.collection.getNftItemAddressByIndex(getItemIndex());

    
    const sender = await newTonWebSender();
    const wallet = sender.wallet;
    const secretKey = sender.secretKey;

    const nftItem = new TonWeb.token.nft.NftItem(sender.wallet.provider, {address: itemAddress});

    let forwardPayload = new TonWeb.boc.Cell();
    forwardPayload.bits.writeUint(getItemIndex(), 32);

    console.log (
            await wallet.methods.transfer({
                secretKey: sender.secretKey,
                toAddress: itemAddress,
                amount: TonWeb.utils.toNano('0.2'),
                seqno: sender.seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: new TonWeb.Address((await getContractAddress()).toString()),
                    forwardAmount: TonWeb.utils.toNano('0.2'),
                    forwardPayload: forwardPayload,
                    responseAddress: wallet.address!,
                }),
                sendMode: 3,
            }).send()        
    );


})();

function getItemIndex() {
    const args = process.argv.slice(2);
    if (args.length < 1) throw new Error("Item index.");
    return parseInt(args[0]);
}
