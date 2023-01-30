
import { CombatControlsDisplay } from "../combat_controls/CombatControlsDisplay";
import { LogDisplay } from "../LogDisplay";
import { Tabs, TabList, TabPanels, Tab, TabPanel, BoxProps } from '@chakra-ui/react'

import { useGameControllerContext } from "../contexts/GameControllerContext";
import CharacterCreationControlDisplay from "../character_selection/CharacterCreationControlDisplay";
import useWindowDimensions from "../../hooks/useWindowDimensions";

export const MainTabs: React.FC<BoxProps> = ({ }) => {

  const { gameContext } = useGameControllerContext();
  const { height } = useWindowDimensions();
  function contextDependentControls() {
    if (!gameContext) return;
    if (gameContext.sceneType === "CHARACTER_SELECTION") {
      return <CharacterCreationControlDisplay />
    }
    if (gameContext.sceneType === "COMBAT") {
      return <CombatControlsDisplay />
    }
  }
  return (

    <Tabs
      isFitted
      variant='enclosed-colored'
      colorScheme={'govy'}
      h={height * 0.7}>
      <TabList
        h={'5vh'}
        mb='1em'>
        <Tab>Character Creation</Tab>
        <Tab>Combat Controls</Tab>
        <Tab>Log</Tab>
      </TabList>
      <TabPanels p='1rem'>
        <TabPanel>
          <CharacterCreationControlDisplay />
        </TabPanel>
        <TabPanel>
          <CombatControlsDisplay />
          {
            //TODO revert to calling context-dependent controls
            //contextDependentControls()
          }

        </TabPanel>
        <TabPanel
          h={'100%'}
          maxH={'75vh'}>
          <LogDisplay />
        </TabPanel>
      </TabPanels>
    </Tabs>

  )
}