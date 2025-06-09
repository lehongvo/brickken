import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { PriceResponse } from "./types";
/**
 * Lớp client để tương tác với Brickken Protocol smart contract
 */
export declare class BrickkenProtocolClient {
    private readonly client;
    private readonly contractAddress;
    constructor(client: CosmWasmClient | SigningCosmWasmClient, contractAddress: string);
    /**
     * Tạo client chỉ đọc
     * @param rpcEndpoint Endpoint của RPC node (ví dụ: https://rpc-palvus.pion-1.ntrn.tech:443)
     * @param contractAddress Địa chỉ của smart contract
     * @returns Client instance
     */
    static createQueryClient(rpcEndpoint: string, contractAddress: string): Promise<BrickkenProtocolClient>;
    /**
     * Tạo client có khả năng ký và gửi giao dịch
     * @param rpcEndpoint Endpoint của RPC node
     * @param mnemonic Cụm từ ghi nhớ của ví
     * @param contractAddress Địa chỉ của smart contract
     * @param prefix Tiền tố của địa chỉ (mặc định: neutron)
     * @returns Client instance
     */
    static createSigningClient(rpcEndpoint: string, mnemonic: string, contractAddress: string, prefix?: string): Promise<BrickkenProtocolClient>;
    /**
     * Kiểm tra xem client có khả năng ký giao dịch không
     * @returns true nếu có thể ký giao dịch
     */
    canSign(): boolean;
    /**
     * Truy vấn giá trị hiện tại của biến đếm
     * @returns Giá trị đếm hiện tại
     */
    getCount(): Promise<number>;
    /**
     * Truy vấn địa chỉ của chủ sở hữu contract
     * @returns Địa chỉ của chủ sở hữu
     */
    getOwner(): Promise<string>;
    /**
     * Truy vấn mô tả của contract
     * @returns Mô tả của contract
     */
    getDescription(): Promise<string>;
    /**
     * Truy vấn giá USDT từ Band Protocol Oracle
     * @returns Thông tin giá từ Band Protocol
     */
    getUsdtPriceBand(): Promise<PriceResponse>;
    /**
     * Truy vấn giá USDT từ Pyth Network Oracle
     * @returns Thông tin giá từ Pyth Network
     */
    getUsdtPricePyth(): Promise<PriceResponse>;
    /**
     * Tăng giá trị của biến đếm lên 1
     * @param senderAddress Địa chỉ của người gửi giao dịch
     * @returns Kết quả giao dịch
     */
    increment(senderAddress: string): Promise<any>;
    /**
     * Đặt lại giá trị của biến đếm (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param count Giá trị mới cho biến đếm
     * @returns Kết quả giao dịch
     */
    reset(senderAddress: string, count: number): Promise<any>;
    /**
     * Cập nhật mô tả của contract (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param description Mô tả mới
     * @returns Kết quả giao dịch
     */
    updateDescription(senderAddress: string, description: string): Promise<any>;
    /**
     * Thiết lập địa chỉ Band Protocol Oracle (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param address Địa chỉ của Band Protocol Oracle contract
     * @returns Kết quả giao dịch
     */
    setBandOracleAddress(senderAddress: string, address: string): Promise<any>;
    /**
     * Thiết lập địa chỉ Pyth Network Oracle (chỉ chủ sở hữu)
     * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
     * @param address Địa chỉ của Pyth Network Oracle contract
     * @returns Kết quả giao dịch
     */
    setPythOracleAddress(senderAddress: string, address: string): Promise<any>;
}
