"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
// Ví dụ cách sử dụng client
async function example() {
    try {
        // Địa chỉ contract của bạn
        const contractAddress = "neutron1tlszjwhg83eqax0se6ys5thv8ceeuje46dk4tfwc4ahzdxxqrz5qug8e6j";
        // RPC endpoint của mạng Neutron Testnet
        const rpcEndpoint = "https://rpc-palvus.pion-1.ntrn.tech:443";
        console.log("Tạo client chỉ đọc...");
        const queryClient = await client_1.BrickkenProtocolClient.createQueryClient(rpcEndpoint, contractAddress);
        // Thực hiện các truy vấn (query)
        console.log("Truy vấn thông tin từ contract...");
        const count = await queryClient.getCount();
        console.log("Giá trị đếm hiện tại:", count);
        const owner = await queryClient.getOwner();
        console.log("Chủ sở hữu contract:", owner);
        // Ví dụ tạo signing client (cần mnemonic để ký giao dịch)
        console.log("\nTạo signing client...");
        console.log("Lưu ý: Trong ví dụ này, bạn cần thay YOUR_MNEMONIC bằng mnemonic thực tế của bạn");
        /*
        const mnemonic = "YOUR_MNEMONIC"; // Thay bằng mnemonic thật của bạn
        const signingClient = await BrickkenProtocolClient.createSigningClient(
          rpcEndpoint,
          mnemonic,
          contractAddress
        );
        
        // Kiểm tra xem client có thể ký giao dịch không
        if (signingClient.canSign()) {
          console.log("Client có thể ký giao dịch");
          
          // Lấy địa chỉ ví (bạn cần truyền vào khi gọi execute functions)
          const walletAddress = "YOUR_WALLET_ADDRESS"; // Thay bằng địa chỉ ví thật của bạn
          
          // Thực hiện các lệnh execute (cần phí gas)
          console.log("\nGửi transaction để tăng biến đếm...");
          const incrementResult = await signingClient.increment(walletAddress);
          console.log("Kết quả increment:", incrementResult);
          
          // Truy vấn lại sau khi thay đổi
          const newCount = await signingClient.getCount();
          console.log("Giá trị đếm mới:", newCount);
          
          // Reset counter về 5 (chỉ chủ sở hữu mới có quyền)
          if (walletAddress === owner) {
            console.log("\nReset counter về 5...");
            const resetResult = await signingClient.reset(walletAddress, 5);
            console.log("Kết quả reset:", resetResult);
            
            const resetCount = await signingClient.getCount();
            console.log("Counter sau khi reset:", resetCount);
          } else {
            console.log("\nKhông thể reset counter vì bạn không phải chủ sở hữu");
          }
        }
        */
    }
    catch (error) {
        console.error("Đã xảy ra lỗi:", error);
    }
}
// Chạy ví dụ
example().catch(console.error);
