import { BoxProps, Button, ButtonGroup, Grid, GridItem } from "@chakra-ui/react";
import Choice from "../types/Choices";
import ChoiceButton from "./ChoiceButton";
function ChoiceButtonsDisplay(
  { gridArea, submitChoice, choices, selectChoice, back, clearSelection, setHoverChoice }:
    {
      gridArea: string,
      submitChoice: () => void,
      choices: Choice[],
      selectChoice: (choice: Choice) => void,
      back: () => void,
      clearSelection: () => void,
      setHoverChoice: (choice: Choice) => void,

    }) {
  function renderChoices() {
    if (!choices) {
      return <div
      >No Choices</div>
    }
    const choiceButtons = []
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const newButton = <ChoiceButton
        choice={choice}
        selectChoice={selectChoice}
        setHoverChoice={setHoverChoice}
      />
      choiceButtons.push(newButton)
    }
    return choiceButtons;
  }


  return <Grid
    gridArea={gridArea}
    backgroundColor='govy.500'
    display='grid'
    gridTemplateRows='auto min-content'
    height='100%'
  >
    <GridItem
      //display: 'block',
      overflowY='scroll'
      width='100%'
      height='100%'
    >
      {renderChoices()}
    </GridItem>
    <ButtonGroup
      colorScheme={'govy'}
      flexDirection={'row'}
    >
      <Button
        onClick={back}
        color='maroon'
        width='30%'
      //disabled={!hasChoices}
      >
        Back
      </Button>
      <Button
        color='red'
        width='30%'
        //disabled={!hasChoices}
        onClick={() => {
          clearSelection();
        }}>Clear Selection</Button>
      <Button
        style={{
          color: 'green',
          width: '30%'
        }}
        onClick={submitChoice}
      >
        Confirm</Button>
    </ButtonGroup>
  </Grid>
}

export default ChoiceButtonsDisplay