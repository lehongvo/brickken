"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
async function testSigningClient() {
    try {
        // Contract từ UI
        const contractAddress = "neutron1hm35xuas7n8km0ce7xldhhvrddu6h4hjpskc2h73jj6ayxmlwpxsfxcnxv";
        const rpcEndpoint = "https://rpc-palvus.pion-1.ntrn.tech:443";
        const mnemonic = "bag boat victory dream gospel smooth pulp release rent derive cross cost";
        console.log("🔍 Testing Brickken Protocol Signing Client");
        console.log("==========================================");
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
                const newDesc = `Updated by TypeScript client at ${new Date().toISOString()}`;
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
        console.log("🎉 Signing client test completed!");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}
testSigningClient().catch(console.error);
