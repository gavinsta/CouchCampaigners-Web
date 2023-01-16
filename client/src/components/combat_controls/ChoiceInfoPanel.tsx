import { BoxProps } from "@chakra-ui/react";
import { Choice } from "../../types/ConnectionInterfaces";

export const ChoiceInfoPanel: React.FC<{
  selectedChoice: Choice | null,
  hoverChoice: Choice | null,
} & BoxProps> = ({ selectedChoice, hoverChoice, style }) => {
  function presentChoiceInfo(choice: Choice) {
    //TODO flesh out the choice panel
    if (choice) {

      return (<>
        <div>{choice.choiceName}</div>
        <div>{choice.choiceDescription}</div>
        <div>{choice.attachedData}</div>
      </>);

    }
  }
  return (<><div
    style={style}>
    <div>{hoverChoice && presentChoiceInfo(hoverChoice)}</div>
    <div>
      <h2>Selected:</h2>
      {selectedChoice && presentChoiceInfo(selectedChoice)}
    </div>
  </div>
  </>);
}