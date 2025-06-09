"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrickkenProtocolClient = void 0;
const cosmwasm_stargate_1 = require("@cosmjs/cosmwasm-stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
const stargate_1 = require("@cosmjs/stargate");
/**
 * Lớp client để tương tác với Brickken Protocol smart contract
 */
class BrickkenProtocolClient {
    constructor(client, contractAddress) {
        this.client = client;
        this.contractAddress = contractAddress;
    }
    /**
     * Tạo client chỉ đọc
     * @param rpcEndpoint Endpoint của RPC node (ví dụ: https://rpc-palvus.pion-1.ntrn.tech:443)
     * @param contractAddress Địa chỉ của smart contract
     * @returns Client instance
     */
    static async createQueryClient(rpcEndpoint, contractAddress) {
        const client = await cosmwasm_stargate_1.CosmWasmClient.connect(rpcEndpoint);
        return new BrickkenProtocolClient(client, contractAddress);
    }
    /**
     * Tạo client có khả năng ký và gửi giao dịch
     * @param rpcEndpoint Endpoint của RPC node
     * @param mnemonic Cụm từ ghi nhớ của ví
     * @param contractAddress Địa chỉ của smart contract
     * @param prefix Tiền tố của địa chỉ (mặc định: neutron)
     * @returns Client instance
     */
    static async createSigningClient(rpcEndpoint, mnemonic, contractAddress, prefix = "neutron") {
        const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
        const client = await cosmwasm_stargate_1.SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet, { gasPrice: stargate_1.GasPrice.fromString("0.025untrn") });
        return new BrickkenProtocolClient(client, contractAddress);
    }
    /**
     * Kiểm tra xem client có khả năng ký giao dịch không
     * @returns true nếu có thể ký giao dịch
     */
    canSign() {
        return this.client instanceof cosmwasm_stargate_1.SigningCosmWasmClient;
    }
    // --- QUERY METHODS ---
    /**
     * Truy vấn giá trị hiện tại của biến đếm
     * @returns Giá trị đếm hiện tại
     */
    async getCount() {
        const result = await this.client.queryContractSmart(this.contractAddress, { get_count: {} });
        return result.count;
    }
    /**
     * Truy vấn địa chỉ của chủ sở hữu contract
     * @returns Địa chỉ của chủ sở hữu
     */
    async getOwner() {
        const result = await this.client.queryContractSmart(this.contractAddress, { get_owner: {} });
        return result.owner;
    }
    /**
     * Truy vấn mô tả của contract
     * @returns Mô tả của contract
     */
    async getDescription() {
        const result = await this.client.queryContractSmart(this.contractAddress, { get_description: {} });
        return result.description;
    }
    // --- EXECUTE METHODS ---
    /**
     * Tăng giá trị của biến đếm lên 1
     * @param senderAddress Địa chỉ của người gửi giao dịch
     * @returns Kết quả giao dịch
     */
    async increment(senderAddress) {
        if (!(this.client instanceof cosmwasm_stargate_1.SigningCosmWasmClient)) {
            throw new Error("increment yêu cầu SigningCosmWasmClient");
        }
        return await this.client.execute(senderAddress, this.contractAddress, { increment: {} }, "auto");
    }
    /**
     * Đặt lại giá trị của biến đếm (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param count Giá trị mới cho biến đếm
     * @returns Kết quả giao dịch
     */
    async reset(senderAddress, count) {
        if (!(this.client instanceof cosmwasm_stargate_1.SigningCosmWasmClient)) {
            throw new Error("reset yêu cầu SigningCosmWasmClient");
        }
        return await this.client.execute(senderAddress, this.contractAddress, { reset: { count } }, "auto");
    }
    /**
     * Cập nhật mô tả của contract (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param description Mô tả mới
     * @returns Kết quả giao dịch
     */
    async updateDescription(senderAddress, description) {
        if (!(this.client instanceof cosmwasm_stargate_1.SigningCosmWasmClient)) {
            throw new Error("updateDescription yêu cầu SigningCosmWasmClient");
        }
        return await this.client.execute(senderAddress, this.contractAddress, { update_description: { description } }, "auto");
    }
}
exports.BrickkenProtocolClient = BrickkenProtocolClient;
