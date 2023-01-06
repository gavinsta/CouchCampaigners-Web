import { useGameContext } from "../contexts/GameContext";
import { ChoiceInfoPanel } from "./ChoiceInfoPanel";
import { useState, useEffect, useRef } from "react";
import { BsHourglassSplit } from "react-icons/bs";
import { GiFire, GiAxeSword } from "react-icons/gi";
import { Grid, GridItem, Icon, Button, ButtonGroup, Stack, HStack } from '@chakra-ui/react'
import Choice from "../types/Choices";
import ChoiceButtonsDisplay from "./ChoiceButtonDisplay";
export function ControlsDisplay() {

  const { gameState, choiceContext, sendChoice, controllerStatus } = useGameContext();
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [expanded, setExpanded] = useState<Choice[]>([]);
  const [hasChoices, setHasChoices] = useState(false);
  const [hoverChoice, setHoverChoice] = useState<Choice | null>(null);
  useEffect(() => {
    if (choiceContext?.playerChoices) {
      setHasChoices(true);
    }
    else {
      setHasChoices(false);
    }
  });

  function clearSelection() {
    setExpanded([]);
    setSelectedChoice(null);
  }
  function selectFinalChoice(choice: Choice) {
    if (expanded.length > 0) {
      const finalChoice: Choice = {
        //TODO what will we do for choiceID
        choiceID: "",

        controllerKey: expanded[0].controllerKey,
        type: choice.type,
        choiceName: expanded[0].choiceName,
        choiceDescription: expanded[0].choiceDescription,
        attachedData: expanded[0].attachedData,
        additionalChoices: [],
      }

      let lastChoice = finalChoice;
      //shove the rest of the expanded list into a nested structure
      //TODO add a way to include multiple choices at the same level. We'll revisit this.
      console.log(`expanded.length: ${expanded.length}`)
      for (let i = 1; i < expanded.length; i++) {
        const currentChild = expanded[i];
        lastChoice.additionalChoices.push(currentChild)
        console.log(`Adding ${expanded[i]} to choice`);
        lastChoice = currentChild
      }
      lastChoice.additionalChoices.push(choice);

      return finalChoice;
    }
    else {
      return choice;
    }
  }
  function selectChoice(choice: Choice) {
    if (choice.additionalChoices) {
      if (expanded) {
        setExpanded([...expanded, choice]);
      }
      else (
        setExpanded([choice])
      )
    }
    //if there's no more additional choices
    else {
      setSelectedChoice(selectFinalChoice(choice));
      console.log(`Selected choice: ${choice.choiceName} id: ${choice.choiceID}`);
    }
  }
  function submitChoice() {
    if (selectedChoice) {
      sendChoice(selectedChoice);
    }
    clearSelection();
  }
  function back() {
    if (!expanded) return;
    if (expanded.length > 1) {
      const changed = [...expanded]
      changed.pop();
      setExpanded(changed);
    }
    else if (expanded.length == 1) {
      setExpanded([]);
    }
  }
  function getChildChoices() {
    if (expanded && expanded[expanded.length - 1]) {
      if (expanded[expanded.length - 1].additionalChoices !== undefined) {
        return expanded[expanded.length - 1].additionalChoices;
      }
    }
    else return choiceContext?.playerChoices
  }
  return (<Grid
    gridTemplateAreas={`" main info"
      " main info"
      " end end"`}
    gridTemplateColumns={'2fr 1fr'}
    gridTemplateRows={'2fr 2fr 1fr'}
  >
    {!hasChoices ? <GridItem
      gridArea='main'
    >
      No controls to display
    </GridItem> :
      <ChoiceButtonsDisplay
        gridArea="main"


        choices={getChildChoices()}
        selectChoice={selectChoice}
        back={back}
        clearSelection={clearSelection}
        setHoverChoice={setHoverChoice}
        submitChoice={submitChoice}
      />
    }
    <ChoiceInfoPanel
      style={{
        gridArea: "info",
        backgroundColor: 'lightgrey',
        width: '100%',
        display: 'grid',
        padding: '15 15',
        gridTemplateRows: 'auto min-content'
      }}
      hoverChoice={hoverChoice}
      selectedChoice={selectedChoice}
    />

  </Grid >)
}
