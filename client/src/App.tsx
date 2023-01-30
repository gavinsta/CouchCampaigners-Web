
import { GameControllerContextProvider } from './components/contexts/GameControllerContext';

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ConnectionContextProvider } from './components/contexts/ConnectionContext';
import MainPage from './components/pages/MainPage';

const theme = extendTheme({
  colors: {
    govy:
    {
      50: '#ffedde',
      100: '#fdd3b3',
      200: '#f9bb85',
      300: '#f5a656',
      400: '#f17f28',
      500: '#d85910',
      600: '#a9390a',
      700: '#792105',
      800: '#490d00',
      900: '#1d0000',
    }
  }
})
function App() {
  return (
    <ChakraProvider theme={theme}>
      <ConnectionContextProvider>
        <GameControllerContextProvider>
          <MainPage />
        </GameControllerContextProvider>
      </ConnectionContextProvider>
    </ChakraProvider>

  );
}

export default App;
