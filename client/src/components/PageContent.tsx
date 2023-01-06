import { useStyleContext } from "../contexts/StyleContext";
import { ControlsDisplay } from "./ControlsDisplay";
import { LogDisplay } from "./LogDisplay";
import { Tabs, TabList, TabPanels, Tab, TabPanel, BoxProps } from '@chakra-ui/react'
export const PageContent: React.FC<BoxProps> = ({ height }) => {

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
          <ControlsDisplay />
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