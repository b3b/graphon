import { Address, toNano } from "@ton/core";
import { CollectorContract } from "../output/graphon_nft_CollectorContract";
import { delay, openCollectorContract, nextSeqno, newSender, newTonClient } from "./utils";

(async () => {
    const contract = await openCollectorContract();
    const client = newTonClient();
    const senderCreated = await newSender(client);
    const wallet = senderCreated.wallet;
    const sender = senderCreated.sender;
    await contract.send(sender, { value: toNano("0.01") }, {
        $$type: "SetupMessage",
        rewardAmount: getNewReward(),
    });
    await nextSeqno(wallet);

})();


function getNewReward() : bigint {
    const args = process.argv.slice(2);
    if (args.length < 1) throw new Error("Reward is not specified.");
    return toNano(args[0]);
}

