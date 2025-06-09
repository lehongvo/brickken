/**
 * Message khởi tạo contract
 */
export interface InstantiateMsg {
  count: number;
}

/**
 * Các message execute để thay đổi trạng thái contract
 */
export type ExecuteMsg =
  | { increment: Record<string, never> }
  | { reset: { count: number } }
  | { update_description: { description: string } };

/**
 * Các message query để đọc trạng thái contract
 */
export type QueryMsg =
  | { get_count: Record<string, never> }
  | { get_owner: Record<string, never> }
  | { get_description: Record<string, never> };

/**
 * Response cho query get_count
 */
export interface GetCountResponse {
  count: number;
}

/**
 * Response cho query get_owner
 */
export interface GetOwnerResponse {
  owner: string;
}

/**
 * Response cho query get_description
 */
export interface GetDescriptionResponse {
  description: string;
}