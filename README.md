# Graphon

**Graphon** : Draw & Guess & Own is a social game on Telegram powered by the TON blockchain, where players can draw, guess, and own unique NFTs.

The project allows players to mint and transfer Graphon NFTs, as well as interact with a [Collector contract](./contracts/contract.tact) to reward authors. 

## Getting Started

### Clone the Repository

Clone the Graphon repository to your local machine:

```bash
git clone https://github.com/b3b/graphon.git
cd graphon
```


## Configure Environment Variables
Navigate to the contracts directory and edit the .env file.
You can use the provided example file [contracts/env.example](./contracts/env.example) as a reference.

```bash
cd contracts
cp env.example .env
```

## Build the Docker Containers

```bash
docker-compose build
```

## Run commands

For any command, run the following format:

```bash
docker-compose run --rm tact <COMMAND>
```

For example, to fetch the address of the Graphon NFT collection:

```bash
docker-compose run --rm tact collection.address
```

## List of Available Commands

- **`collection.deploy`**
  Deploys the Graphon NFT collection to the TON blockchain. This command will set up the smart contract for the collection.
  
- **`collection.address`**
  Fetches and displays the address of the Graphon NFT collection on the TON blockchain.
  
- **`collection.mint`**
  Mints the next Graphon NFT collection item for a specified owner. 
  
- **`collection.transfer`**
  Transfers a Graphon NFT item to the Collector contract. This action rewards the previous owner with a fixed amount, as defined in the Collector contract.

- **`collector.setup`**
  Configures the reward amount for the Collector contract. This command allows you to set the reward amount in TON for transferring an NFT to the Collector contract.
