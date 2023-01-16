export interface Choice {
  controllerKey: string,
  choiceID: string,
  choiceName: string,
  choiceDescription?: string,
  attachedData?: string,
  choiceData?: any,
  additionalChoices: Choice[],
}

export interface CommandInput {
  controllerKey: string,
  sender: string,
  input:
  {
    fieldName: string,
    value: string | number,
  }
}
