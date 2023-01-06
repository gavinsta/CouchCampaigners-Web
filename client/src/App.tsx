import logo from './logo.svg';
import './App.css';
import { GameContextProvider } from './contexts/GameContext';
import { RoomControls } from './components/RoomControls';
import { StyleContextProvider } from './contexts/StyleContext';
import { PageContent } from './components/PageContent';
import { ChakraProvider, extendTheme, Grid } from '@chakra-ui/react'
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
      <StyleContextProvider>
        <GameContextProvider>
          <RoomControls />
          <PageContent
            height={'90vh'} />
        </GameContextProvider>
      </StyleContextProvider>
    </ChakraProvider>
  );
}

export default App;
