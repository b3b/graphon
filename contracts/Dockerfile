FROM node:lts

WORKDIR /app

RUN git clone https://github.com/tact-lang/tact-template.git . && \
    git checkout 1cd1673fd5c02ec52e1d227fd1e170316cf94cf4

#RUN yarn install
#RUN yarn add "ton/ton@^13.11.2" @ton/sandbox @ton/test-utils eslint
#RUN npm install ton-crypto

# packages.json
# RUN npm install
RUN npm install tonweb @tonx/adapter @tonx/core

# RUN git clone https://github.com/tondiamonds/ton-nft-deployer
# WORKDIR ./ton-nft-deployer
# RUN npm install

COPY . /app/sources
COPY ./tact.config.json /app/tact.config.json

# RUN rm -f sources/output/* && yarn build && yarn test

RUN chmod +x /app/sources/scripts/entrypoint.sh

ENTRYPOINT ["/app/sources/scripts/entrypoint.sh"]

LABEL org.opencontainers.image.title="grapon-contracts"
LABEL org.opencontainers.image.description="Graphon contracts"
LABEL org.opencontainers.image.url="https://github.com/b3b/graphon"
LABEL org.opencontainers.image.source="https://github.com/b3b/graphon"