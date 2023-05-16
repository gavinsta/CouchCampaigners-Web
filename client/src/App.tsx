
import { GameControllerContextProvider } from './components/contexts/GameControllerContext';
import '@fontsource/bangers'
import '@fontsource/luckiest-guy'
import '@fontsource/anton'
import "@fontsource/dela-gothic-one"
import { Button, ChakraProvider, useDisclosure } from '@chakra-ui/react'
import { ConnectionContextProvider } from './components/contexts/ConnectionContext';
import theme from './theme';
import useCheckMobileScreen from './hooks/useCheckMobileScreen';
import { MainTabs } from './components/screens/MainTabs';
import ConnectionControls, { ConnectionControlDrawer } from './components/pages/ConnectionControls';
import { useState } from 'react';

function App() {
  //const [viewConnectionPanel, setViewConnectionPanel] = useState<boolean>(false);

  return (
    <ChakraProvider theme={theme}>
      <ConnectionContextProvider>
        <GameControllerContextProvider>
          <ConnectionControls />
          <MainTabs />

        </GameControllerContextProvider>
      </ConnectionContextProvider>
    </ChakraProvider>

  );
}

export default App;
