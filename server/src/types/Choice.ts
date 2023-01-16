export type Choice = {
  controllerKey: string,
  choiceID: string,
  choiceName: string,
  choiceDescription?: string,
  choiceData?: any
  additionalChoices?: Choice[]
}