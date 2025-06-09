"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
async function testSigningClient() {
    try {
        // Contract từ UI
        const contractAddress = "neutron1e0e4e44watnnsmnvnlsdw5ar6qdjraecc265424wn42r0mq5v5gqgsktm2"; // New deployed contract
        const rpcEndpoint = "https://rpc-palvus.pion-1.ntrn.tech:443";
        const mnemonic = "bag boat victory dream gospel smooth pulp release rent derive cross cost";
        console.log("🔍 Testing Brickken Protocol Signing Client with Oracle Support");
        console.log("===============================================================");
        console.log(`Contract: ${contractAddress}`);
        console.log(`RPC: ${rpcEndpoint}`);
        console.log("");
        // Tạo signing client
        console.log("📦 Creating signing client...");
        const signingClient = await client_1.BrickkenProtocolClient.createSigningClient(rpcEndpoint, mnemonic, contractAddress);
        // Lấy wallet address (sẽ dùng để gọi execute functions)
        const walletAddress = "neutron1822rfvhsq4qmzem3yu7y0mq76u8tju6z2ezwlw"; // Địa chỉ từ deploy log
        console.log(`👛 Wallet address: ${walletAddress}`);
        console.log(`🔐 Can sign: ${signingClient.canSign()}`);
        console.log("");
        // Test query functions trước
        console.log("=== TESTING QUERY FUNCTIONS ===");
        const count = await signingClient.getCount();
        console.log(`🔢 Current count: ${count}`);
        const owner = await signingClient.getOwner();
        console.log(`👤 Contract owner: ${owner}`);
        const description = await signingClient.getDescription();
        console.log(`📝 Description: ${description}`);
        console.log("");
        // Test Oracle query functions
        console.log("=== TESTING ORACLE QUERY FUNCTIONS ===");
        console.log("📊 Testing Band Protocol Oracle query...");
        try {
            const bandPrice = await signingClient.getUsdtPriceBand();
            console.log(`   ✅ Band Protocol USDT price:`, bandPrice);
            console.log(`   💰 Price: ${bandPrice.price}`);
            console.log(`   🏷️  Symbol: ${bandPrice.symbol}`);
            console.log(`   🔗 Oracle: ${bandPrice.oracle}`);
            console.log(`   ⏰ Last Updated: ${new Date(bandPrice.last_updated * 1000).toISOString()}`);
        }
        catch (error) {
            console.log(`   ❌ Band Protocol query failed: ${error.message}`);
        }
        console.log("");
        console.log("🐍 Testing Pyth Network Oracle query...");
        try {
            const pythPrice = await signingClient.getUsdtPricePyth();
            console.log(`   ✅ Pyth Network USDT price:`, pythPrice);
            console.log(`   💰 Price: ${pythPrice.price}`);
            console.log(`   🏷️  Symbol: ${pythPrice.symbol}`);
            console.log(`   🔗 Oracle: ${pythPrice.oracle}`);
            console.log(`   ⏰ Last Updated: ${new Date(pythPrice.last_updated * 1000).toISOString()}`);
        }
        catch (error) {
            console.log(`   ❌ Pyth Network query failed: ${error.message}`);
        }
        console.log("");
        // Test execute functions
        console.log("=== TESTING EXECUTE FUNCTIONS ===");
        // Test increment
        console.log("📈 Testing increment...");
        try {
            const incrementResult = await signingClient.increment(walletAddress);
            console.log("   ✅ Increment successful!");
            console.log(`   TX Hash: ${incrementResult.transactionHash}`);
            // Query lại count sau increment
            const newCount = await signingClient.getCount();
            console.log(`   📊 New count: ${newCount}`);
        }
        catch (error) {
            console.log(`   ❌ Increment failed: ${error.message}`);
        }
        console.log("");
        // Test reset (chỉ owner mới được reset)
        if (walletAddress === owner) {
            console.log("🔄 Testing reset (as owner)...");
            try {
                const resetResult = await signingClient.reset(walletAddress, 100);
                console.log("   ✅ Reset successful!");
                console.log(`   TX Hash: ${resetResult.transactionHash}`);
                const resetCount = await signingClient.getCount();
                console.log(`   📊 Count after reset: ${resetCount}`);
            }
            catch (error) {
                console.log(`   ❌ Reset failed: ${error.message}`);
            }
        }
        else {
            console.log("🔄 Skipping reset test (not owner)");
        }
        console.log("");
        // Test update description (chỉ owner mới được update)
        if (walletAddress === owner) {
            console.log("📝 Testing update description (as owner)...");
            try {
                const newDesc = `Updated by TypeScript client with Oracle support at ${new Date().toISOString()}`;
                const updateResult = await signingClient.updateDescription(walletAddress, newDesc);
                console.log("   ✅ Update description successful!");
                console.log(`   TX Hash: ${updateResult.transactionHash}`);
                const updatedDesc = await signingClient.getDescription();
                console.log(`   📝 New description: ${updatedDesc}`);
            }
            catch (error) {
                console.log(`   ❌ Update description failed: ${error.message}`);
            }
        }
        else {
            console.log("📝 Skipping update description test (not owner)");
        }
        console.log("");
        // Test Oracle execute functions (chỉ owner mới được set)
        console.log("=== TESTING ORACLE EXECUTE FUNCTIONS ===");
        if (walletAddress === owner) {
            // Test set Band Protocol Oracle address
            console.log("🔗 Testing set Band Protocol Oracle address (as owner)...");
            try {
                // Band Protocol std_reference contract address on Neutron testnet
                // Note: Đây là địa chỉ giả định, cần thay thế bằng địa chỉ thực
                const bandOracleAddr = "neutron1band_oracle_address_here";
                const setBandResult = await signingClient.setBandOracleAddress(walletAddress, bandOracleAddr);
                console.log("   ✅ Set Band Oracle address successful!");
                console.log(`   TX Hash: ${setBandResult.transactionHash}`);
                console.log(`   🔗 Band Oracle Address: ${bandOracleAddr}`);
                // Test query lại sau khi set
                const bandPriceAfterSet = await signingClient.getUsdtPriceBand();
                console.log(`   📊 Band price after setting address:`, bandPriceAfterSet);
            }
            catch (error) {
                console.log(`   ❌ Set Band Oracle address failed: ${error.message}`);
            }
            console.log("");
            // Test set Pyth Network Oracle address
            console.log("🐍 Testing set Pyth Network Oracle address (as owner)...");
            try {
                // Pyth Oracle contract address on Neutron testnet
                // Note: Đây là địa chỉ giả định, cần thay thế bằng địa chỉ thực
                const pythOracleAddr = "neutron1pyth_oracle_address_here";
                const setPythResult = await signingClient.setPythOracleAddress(walletAddress, pythOracleAddr);
                console.log("   ✅ Set Pyth Oracle address successful!");
                console.log(`   TX Hash: ${setPythResult.transactionHash}`);
                console.log(`   🔗 Pyth Oracle Address: ${pythOracleAddr}`);
                // Test query lại sau khi set
                const pythPriceAfterSet = await signingClient.getUsdtPricePyth();
                console.log(`   📊 Pyth price after setting address:`, pythPriceAfterSet);
            }
            catch (error) {
                console.log(`   ❌ Set Pyth Oracle address failed: ${error.message}`);
            }
        }
        else {
            console.log("🔗 Skipping Oracle address setup tests (not owner)");
        }
        console.log("");
        console.log("🎉 Oracle-enabled signing client test completed!");
        console.log("");
        console.log("📝 Notes:");
        console.log("   • Band Protocol and Pyth Network queries are currently using mock data");
        console.log("   • To use real Oracle data, set the correct Oracle contract addresses");
        console.log("   • Band Protocol: Set real Band std_reference contract address");
        console.log("   • Pyth Network: Set real Pyth oracle contract address on Neutron");
        console.log("   • Both Oracle integrations will fallback to mock data if addresses aren't set");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}
testSigningClient().catch(console.error);
