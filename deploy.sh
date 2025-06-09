#!/bin/bash

# Deployment script for Brickken Protocol on Neutron testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHAIN_ID="pion-1"
NODE="https://rpc-palvus.pion-1.ntrn.tech:443"
WALLET_NAME="custom-wallet"
KEYRING_BACKEND="test"
GAS_ADJUSTMENT="1.3"
FEES="30000untrn"
CONTRACT_LABEL="brickken-protocol"

echo -e "${BLUE}🚀 Deploying Brickken Protocol to Neutron testnet${NC}"
echo "=========================================="

# Set up environment
echo -e "${YELLOW}📦 Setting up environment...${NC}"
export PATH="/opt/homebrew/opt/go@1.23/bin:$PATH"
export PATH="$PATH:$(go env GOPATH)/bin"

# Configure neutrond
echo -e "${YELLOW}⚙️  Configuring neutrond...${NC}"
neutrond config chain-id $CHAIN_ID
neutrond config node $NODE

# Check if wallet exists
echo -e "${YELLOW}👛 Checking wallet...${NC}"
if ! neutrond keys show $WALLET_NAME --keyring-backend $KEYRING_BACKEND &>/dev/null; then
    echo -e "${RED}❌ Wallet '$WALLET_NAME' not found. Creating new wallet...${NC}"
    neutrond keys add $WALLET_NAME --keyring-backend $KEYRING_BACKEND
    echo -e "${YELLOW}⚠️  Please fund your wallet with testnet tokens from:${NC}"
    echo "   https://neutron.celat.one/pion-1/faucet"
    echo "   or Discord: https://discord.gg/neutron (channel #testnet-faucet)"
    exit 1
fi

# Get wallet address
WALLET_ADDRESS=$(neutrond keys show $WALLET_NAME --keyring-backend $KEYRING_BACKEND -a)
echo -e "${BLUE}📍 Wallet address: $WALLET_ADDRESS${NC}"

# Check balance
echo -e "${YELLOW}💰 Checking balance...${NC}"
BALANCE_OUTPUT=$(neutrond query bank balances $WALLET_ADDRESS --node $NODE --output json 2>/dev/null || echo '{"balances":[]}')
BALANCE=$(echo "$BALANCE_OUTPUT" | jq -r '.balances[0].amount // "0"' 2>/dev/null || echo "0")
if [ "$BALANCE" = "0" ] || [ "$BALANCE" = "null" ]; then
    echo -e "${RED}❌ Insufficient balance. Please fund your wallet first.${NC}"
    echo "   Faucet: https://neutron.celat.one/pion-1/faucet"
    exit 1
fi
echo -e "${GREEN}✅ Balance: $BALANCE untrn${NC}"

# Check if contract file exists
WASM_FILE="artifacts/brickken_protocol.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo -e "${RED}❌ Contract file not found: $WASM_FILE${NC}"
    echo -e "${YELLOW}🔨 Building contract...${NC}"
    
    # Build with Docker optimizer
    docker run --rm -v "$(pwd)":/code \
        --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
        --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
        cosmwasm/optimizer:0.16.0
    
    if [ ! -f "$WASM_FILE" ]; then
        echo -e "${RED}❌ Failed to build contract${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Contract file found: $WASM_FILE${NC}"

# Upload contract
echo -e "${YELLOW}📤 Uploading contract to Neutron testnet...${NC}"
UPLOAD_TX=$(neutrond tx wasm store $WASM_FILE \
    --from $WALLET_NAME \
    --keyring-backend $KEYRING_BACKEND \
    --gas auto \
    --gas-adjustment $GAS_ADJUSTMENT \
    --fees $FEES \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --output json \
    -y)

UPLOAD_TXHASH=$(echo "$UPLOAD_TX" | jq -r '.txhash')
echo -e "${BLUE}📋 Upload TX Hash: $UPLOAD_TXHASH${NC}"

# Wait for transaction to be processed
echo -e "${YELLOW}⏳ Waiting for upload transaction to be processed...${NC}"
sleep 10

# Get code ID and upload details
UPLOAD_RESULT=$(neutrond query tx $UPLOAD_TXHASH --node $NODE --output json)
CODE_ID=$(echo "$UPLOAD_RESULT" | jq -r '.events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')
UPLOAD_GAS_USED=$(echo "$UPLOAD_RESULT" | jq -r '.gas_used')

if [ "$CODE_ID" = "null" ] || [ -z "$CODE_ID" ]; then
    echo -e "${RED}❌ Failed to get code ID. Please check the transaction manually.${NC}"
    echo "TX Hash: $UPLOAD_TXHASH"
    exit 1
fi

echo -e "${GREEN}✅ Contract uploaded! Code ID: $CODE_ID${NC}"

# Instantiate contract
echo -e "${YELLOW}🎯 Instantiating contract...${NC}"

# Instantiate message with required count field
INIT_MSG='{"count": 0}'

INSTANTIATE_TX=$(neutrond tx wasm instantiate $CODE_ID "$INIT_MSG" \
    --from $WALLET_NAME \
    --keyring-backend $KEYRING_BACKEND \
    --label "$CONTRACT_LABEL" \
    --no-admin \
    --gas auto \
    --gas-adjustment $GAS_ADJUSTMENT \
    --fees $FEES \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --output json \
    -y)

INSTANTIATE_TXHASH=$(echo "$INSTANTIATE_TX" | jq -r '.txhash')
echo -e "${BLUE}📋 Instantiate TX Hash: $INSTANTIATE_TXHASH${NC}"

# Wait for transaction to be processed
echo -e "${YELLOW}⏳ Waiting for instantiation...${NC}"
sleep 10

# Get contract address and instantiate details
INSTANTIATE_RESULT=$(neutrond query tx $INSTANTIATE_TXHASH --node $NODE --output json)
CONTRACT_ADDRESS=$(echo "$INSTANTIATE_RESULT" | jq -r '.events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value')
INSTANTIATE_GAS_USED=$(echo "$INSTANTIATE_RESULT" | jq -r '.gas_used')
DEPLOYED_AT=$(echo "$INSTANTIATE_RESULT" | jq -r '.timestamp')

if [ "$CONTRACT_ADDRESS" = "null" ] || [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Failed to get contract address. Please check the transaction manually.${NC}"
    echo "TX Hash: $INSTANTIATE_TXHASH"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=========================================="
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   Chain ID: $CHAIN_ID"
echo -e "   Wallet: $WALLET_ADDRESS"
echo -e "   Code ID: $CODE_ID"
echo -e "   Contract Address: $CONTRACT_ADDRESS"
echo -e "   Upload TX: $UPLOAD_TXHASH"
echo -e "   Instantiate TX: $INSTANTIATE_TXHASH"
echo ""
echo -e "${YELLOW}🔗 Useful links:${NC}"
echo -e "   Upload TX: https://neutron.celat.one/pion-1/tx/$UPLOAD_TXHASH"
echo -e "   Instantiate TX: https://neutron.celat.one/pion-1/tx/$INSTANTIATE_TXHASH"
echo -e "   Contract: https://neutron.celat.one/pion-1/contracts/$CONTRACT_ADDRESS"
echo -e "   Code: https://neutron.celat.one/pion-1/codes/$CODE_ID"
echo ""

# Save deployment info to deployment_summary.json
echo -e "${YELLOW}💾 Saving deployment summary...${NC}"
cat > deployment_summary.json << EOF
{
  "chain_id": "$CHAIN_ID",
  "network": "Neutron Testnet",
  "wallet_name": "$WALLET_NAME",
  "wallet_address": "$WALLET_ADDRESS",
  "deployment": {
    "upload": {
      "tx_hash": "$UPLOAD_TXHASH",
      "code_id": "$CODE_ID",
      "status": "success",
      "gas_used": "$UPLOAD_GAS_USED",
      "fees_paid": "$FEES"
    },
    "instantiate": {
      "tx_hash": "$INSTANTIATE_TXHASH",
      "contract_address": "$CONTRACT_ADDRESS",
      "status": "success",
      "gas_used": "$INSTANTIATE_GAS_USED",
      "fees_paid": "$FEES",
      "init_msg": $INIT_MSG
    }
  },
  "contract_info": {
    "name": "brickken-protocol",
    "wasm_file": "$WASM_FILE",
    "checksum": "$(sha256sum $WASM_FILE | cut -d' ' -f1)",
    "label": "$CONTRACT_LABEL",
    "admin": "none (immutable contract)"
  },
  "explorer_links": {
    "upload_transaction": "https://neutron.celat.one/pion-1/tx/$UPLOAD_TXHASH",
    "instantiate_transaction": "https://neutron.celat.one/pion-1/tx/$INSTANTIATE_TXHASH",
    "contract": "https://neutron.celat.one/pion-1/contracts/$CONTRACT_ADDRESS",
    "code": "https://neutron.celat.one/pion-1/codes/$CODE_ID"
  },
  "commands": {
    "query_code": "neutrond query wasm code $CODE_ID --node $NODE",
    "query_contract": "neutrond query wasm contract $CONTRACT_ADDRESS --node $NODE",
    "query_count": "neutrond query wasm contract-state smart $CONTRACT_ADDRESS '{\"get_count\":{}}' --node $NODE",
    "execute_increment": "neutrond tx wasm execute $CONTRACT_ADDRESS '{\"increment\":{}}' --from $WALLET_NAME --keyring-backend $KEYRING_BACKEND --gas auto --gas-adjustment 1.3 --fees 10000untrn --chain-id $CHAIN_ID --node $NODE -y",
    "execute_reset": "neutrond tx wasm execute $CONTRACT_ADDRESS '{\"reset\":{\"count\":0}}' --from $WALLET_NAME --keyring-backend $KEYRING_BACKEND --gas auto --gas-adjustment 1.3 --fees 10000untrn --chain-id $CHAIN_ID --node $NODE -y"
  },
  "deployed_at": "$DEPLOYED_AT"
}
EOF

echo -e "${GREEN}✅ Deployment summary saved to deployment_summary.json${NC}"

echo ""
echo -e "${BLUE}🧪 Testing contract...${NC}"
echo -e "${YELLOW}📤 Querying current count...${NC}"
neutrond query wasm contract-state smart $CONTRACT_ADDRESS '{"get_count":{}}' --node $NODE

echo ""
echo -e "${GREEN}🚀 Ready to use! Try these commands:${NC}"
echo -e "${YELLOW}Query count:${NC}"
echo "neutrond query wasm contract-state smart $CONTRACT_ADDRESS '{\"get_count\":{}}' --node $NODE"
echo ""
echo -e "${YELLOW}Increment count:${NC}"
echo "neutrond tx wasm execute $CONTRACT_ADDRESS '{\"increment\":{}}' --from $WALLET_NAME --keyring-backend $KEYRING_BACKEND --gas auto --gas-adjustment 1.3 --fees 10000untrn --chain-id $CHAIN_ID --node $NODE -y"
echo ""
echo -e "${YELLOW}Reset count:${NC}"
echo "neutrond tx wasm execute $CONTRACT_ADDRESS '{\"reset\":{\"count\":5}}' --from $WALLET_NAME --keyring-backend $KEYRING_BACKEND --gas auto --gas-adjustment 1.3 --fees 10000untrn --chain-id $CHAIN_ID --node $NODE -y" 