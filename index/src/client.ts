import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import {
  GetCountResponse,
  GetDescriptionResponse,
  GetOwnerResponse
} from "./types";

/**
 * Lớp client để tương tác với Brickken Protocol smart contract
 */
export class BrickkenProtocolClient {
  private readonly client: CosmWasmClient | SigningCosmWasmClient;
  private readonly contractAddress: string;

  constructor(client: CosmWasmClient | SigningCosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
  }

  /**
   * Tạo client chỉ đọc
   * @param rpcEndpoint Endpoint của RPC node (ví dụ: https://rpc-palvus.pion-1.ntrn.tech:443)
   * @param contractAddress Địa chỉ của smart contract
   * @returns Client instance
   */
  static async createQueryClient(
    rpcEndpoint: string,
    contractAddress: string
  ): Promise<BrickkenProtocolClient> {
    const client = await CosmWasmClient.connect(rpcEndpoint);
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
  static async createSigningClient(
    rpcEndpoint: string,
    mnemonic: string,
    contractAddress: string,
    prefix: string = "neutron"
  ): Promise<BrickkenProtocolClient> {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: GasPrice.fromString("0.025untrn") }
    );
    return new BrickkenProtocolClient(client, contractAddress);
  }

  /**
   * Kiểm tra xem client có khả năng ký giao dịch không
   * @returns true nếu có thể ký giao dịch
   */
  canSign(): boolean {
    return this.client instanceof SigningCosmWasmClient;
  }

  // --- QUERY METHODS ---

  /**
   * Truy vấn giá trị hiện tại của biến đếm
   * @returns Giá trị đếm hiện tại
   */
  async getCount(): Promise<number> {
    const result = await this.client.queryContractSmart(
      this.contractAddress,
      { get_count: {} }
    ) as GetCountResponse;
    return result.count;
  }

  /**
   * Truy vấn địa chỉ của chủ sở hữu contract
   * @returns Địa chỉ của chủ sở hữu
   */
  async getOwner(): Promise<string> {
    const result = await this.client.queryContractSmart(
      this.contractAddress,
      { get_owner: {} }
    ) as GetOwnerResponse;
    return result.owner;
  }

  /**
   * Truy vấn mô tả của contract
   * @returns Mô tả của contract
   */
  async getDescription(): Promise<string> {
    const result = await this.client.queryContractSmart(
      this.contractAddress,
      { get_description: {} }
    ) as GetDescriptionResponse;
    return result.description;
  }

  // --- EXECUTE METHODS ---

  /**
   * Tăng giá trị của biến đếm lên 1
   * @param senderAddress Địa chỉ của người gửi giao dịch
   * @returns Kết quả giao dịch
   */
  async increment(senderAddress: string): Promise<any> {
    if (!(this.client instanceof SigningCosmWasmClient)) {
      throw new Error("increment yêu cầu SigningCosmWasmClient");
    }

    return await this.client.execute(
      senderAddress,
      this.contractAddress,
      { increment: {} },
      "auto"
    );
  }

  /**
   * Đặt lại giá trị của biến đếm (chỉ chủ sở hữu)
   * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
   * @param count Giá trị mới cho biến đếm
   * @returns Kết quả giao dịch
   */
  async reset(senderAddress: string, count: number): Promise<any> {
    if (!(this.client instanceof SigningCosmWasmClient)) {
      throw new Error("reset yêu cầu SigningCosmWasmClient");
    }

    return await this.client.execute(
      senderAddress,
      this.contractAddress,
      { reset: { count } },
      "auto"
    );
  }

  /**
   * Cập nhật mô tả của contract (chỉ chủ sở hữu)
   * @param senderAddress Địa chỉ của người gửi giao dịch (phải là chủ sở hữu)
   * @param description Mô tả mới
   * @returns Kết quả giao dịch
   */
  async updateDescription(senderAddress: string, description: string): Promise<any> {
    if (!(this.client instanceof SigningCosmWasmClient)) {
      throw new Error("updateDescription yêu cầu SigningCosmWasmClient");
    }

    return await this.client.execute(
      senderAddress,
      this.contractAddress,
      { update_description: { description } },
      "auto"
    );
  }
}