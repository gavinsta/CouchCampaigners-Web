/**
 * Statuses of a host or user connection
 */
enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  /**When the controller has been inactive for some time */
  INACTIVE = "INACTIVE",
}
export default ConnectionStatus;
