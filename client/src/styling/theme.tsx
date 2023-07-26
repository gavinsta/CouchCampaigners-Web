import { extendTheme, type ThemeConfig, defineStyleConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Bangers', 'sans-serif'`,
    body: `'Luckiest Guy', 'cursive'`,
    clear: `'Anton', 'sans-serif'`,
    note: `'Dela Gothic One', 'cursive'`
  },
  textstyles: {
    note: {
      fontFamily: 'note',
      fontSize: 'sm',
    }
  },
  colors: {
    brand: {
      lightPink: '#E8A49C',
      lightBlue: '#3C4CAD',
      darkBlue: '#240E8B',
      hotPink: '#F04393',
      yellow: "#F9C449"
    },
    base: {
      50: '#F2B85A',
      100: '#C4A572',
      200: '#A67E3D',
      300: '#B59E79',
      400: '#73572A'
    },
    dark: {
      red: '#631C06',
      orange: '#82520E',
      olive: '#3D370A',
      maroon: '#3D1323',
      teal: '#094D4A'

    },
    main: {
      maroon: '#520120',
      teal: '#08403E',
      olive: '#706513',
      orange: '#B57114',
      red: '#962B09',

    },
    highlight: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      red: '#E37452',
      orange: '#C1924F',
      olive: '#BDAA20',
      maroon: '#EB025B',
      teal: '#1AD9D2'


    },
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

export default theme