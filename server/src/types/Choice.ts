export type Choice = {
  controllerKey: string;
  /**The context that this choice pertains to e.g. Number of eggs to buy vs. number of axes to grind may both have "1 or 2" as options*/
  choiceContext: string;
  /**The choice the player responds */
  choiceID: string;
  display?: {
    title: string;
    description?: string;
  };
  data?: any;
  additionalChoices?: Choice[];
};
