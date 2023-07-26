import { TextData } from "../interfaces";
import { ResultStatus } from "../enums";

type Result = {
  /** Result of the action */
  status: ResultStatus;
  /**Message related to the result */
  textData: TextData;
  data?: any;
};
export default Result;
