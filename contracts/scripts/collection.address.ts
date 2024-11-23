import { getCollection } from "./utils";

(async () => {
       const collection = await getCollection();
       console.log(collection.address);
})();
