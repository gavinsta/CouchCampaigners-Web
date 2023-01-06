type Choice = {
  type: string,
  controllerKey: string,
  choiceID: string,
  choiceName: string,
  choiceDescription: string,
  attachedData?: string,
  choiceData?: any,
  additionalChoices: Choice[],
}


export default Choice