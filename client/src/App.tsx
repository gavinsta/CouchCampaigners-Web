
import { GameControllerContextProvider } from './components/contexts/GameControllerContext';
import '@fontsource/bangers'
import '@fontsource/luckiest-guy'
import '@fontsource/anton'
import { ChakraProvider } from '@chakra-ui/react'
import { ConnectionContextProvider } from './components/contexts/ConnectionContext';
import ControllerPage from './components/pages/ControllerPage';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ConnectionContextProvider>
        <GameControllerContextProvider>
          <ControllerPage />
        </GameControllerContextProvider>
      </ConnectionContextProvider>
    </ChakraProvider>

  );
}

export default App;
