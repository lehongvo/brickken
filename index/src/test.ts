import { BrickkenProtocolClient } from './client';

async function testClient() {
  try {
    // Sử dụng contract address từ screenshot UI
    const contractAddress = "neutron1hm35xuas7n8km0ce7xldhhvrddu6h4hjpskc2h73jj6ayxmlwpxsfxcnxv";
    const rpcEndpoint = "https://rpc-palvus.pion-1.ntrn.tech:443";
    
    console.log("🔍 Testing Brickken Protocol Client");
    console.log("=====================================");
    console.log(`Contract: ${contractAddress}`);
    console.log(`RPC: ${rpcEndpoint}`);
    console.log("");
    
    // Tạo query client
    console.log("📦 Creating query client...");
    const client = await BrickkenProtocolClient.createQueryClient(
      rpcEndpoint,
      contractAddress
    );
    
    // Test get_count
    console.log("🔢 Testing get_count...");
    const count = await client.getCount();
    console.log(`   ✅ Current count: ${count}`);
    
    // Test get_owner
    console.log("👤 Testing get_owner...");
    const owner = await client.getOwner();
    console.log(`   ✅ Contract owner: ${owner}`);
    
    // Test get_description
    console.log("📝 Testing get_description...");
    const description = await client.getDescription();
    console.log(`   ✅ Contract description: ${description}`);
    
    // Check if client can sign (should be false for query-only client)
    console.log("🔐 Testing canSign...");
    const canSign = client.canSign();
    console.log(`   ✅ Can sign transactions: ${canSign}`);
    
    console.log("");
    console.log("🎉 All tests passed! Client is working correctly.");
    console.log("");
    console.log("📝 Available methods:");
    console.log("   - getCount(): Get current counter value");
    console.log("   - getOwner(): Get contract owner address");
    console.log("   - getDescription(): Get contract description");
    console.log("   - canSign(): Check if client can sign transactions");
    console.log("   - increment(address): Increment counter (requires signing client)");
    console.log("   - reset(address, count): Reset counter (requires signing client & owner)");
    console.log("   - updateDescription(address, desc): Update description (requires signing client & owner)");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testClient().catch(console.error); 