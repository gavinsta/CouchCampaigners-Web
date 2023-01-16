import { ResultStatus } from "./enums/Status"

type Result = {
  /** Result of the action */
  status: ResultStatus
  /**Message related to the result */
  text?: string

}
export default Result