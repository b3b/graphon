import { Address, Contract, contractAddress, toNano } from "@ton/core";
import TonWeb from "tonweb";

import {getCollection, newTonWebSender, newTonClient} from "./utils";

(async () => {
    const collection = await getCollection();
    const sender = await newTonWebSender();
    console.log('Deploying collection:', collection.address);
    console.log(
        await sender.wallet.methods.transfer({
                secretKey: sender.secretKey,
                toAddress: collection.address,
                amount: TonWeb.utils.toNano('0.2'),
                seqno: sender.seqno,
                sendMode: 3,
                stateInit: (await collection.collection.createStateInit()).stateInit
            }).send()
        );

})();
 
