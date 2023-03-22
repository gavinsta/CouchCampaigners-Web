
import { CombatControlsDisplay } from "../combat_controls/CombatControlsDisplay";
import { LogDisplay } from "../LogDisplay";
import { Tabs, TabList, TabPanels, Tab, TabPanel, BoxProps } from '@chakra-ui/react'

import { useGameControllerContext } from "../contexts/GameControllerContext";
import CharacterCreationControlDisplay from "../character_selection/CharacterCreationControlDisplay";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import WorldMapControlDisplay from "../world_map_controls/WorldMapControlDisplay";

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
    if (gameContext.sceneType === "WORLD_MAP") {
      return <WorldMapControlDisplay />
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
        <Tab>Controls</Tab>
        <Tab>Log</Tab>
      </TabList>
      <TabPanels p='1rem'>
        <TabPanel>
          <WorldMapControlDisplay />
          {contextDependentControls()}
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