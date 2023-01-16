import { useStyleContext } from "../contexts/StyleContext";
import { CombatControlsDisplay } from "../combat_controls/CombatControlsDisplay";
import { LogDisplay } from "../LogDisplay";
import { Tabs, TabList, TabPanels, Tab, TabPanel, BoxProps, Box, Heading, Center } from '@chakra-ui/react'
import { useConnectionContext } from "../contexts/ConnectionContext";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import CharacterCreationControlDisplay from "../character_selection/CharacterCreationControlDisplay";

export const MainTabs: React.FC<BoxProps> = ({ height }) => {

  const { gameContext } = useGameControllerContext();

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
      h={'85vh'}>
      <TabList
        h={'5vh'}
        mb='1em'>
        <Tab>Controls</Tab>
        <Tab>Log</Tab>
      </TabList>
      <TabPanels p='1rem'>
        <TabPanel>
          {
            contextDependentControls()
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