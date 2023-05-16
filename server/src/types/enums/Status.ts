export enum ResultStatus {
  ERROR = "error",
  SUCCESS = "success",
}
/**
 * Statuses of a host or user connection
 */
export enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  /**When the controller has been inactive for some time */
  INACTIVE = "INACTIVE"
}