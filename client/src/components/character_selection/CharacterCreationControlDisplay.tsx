import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, ButtonGroup, Center, GridItem, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import ColorSelection, { Color } from "../input-controls/ColorSelection";
import { useEffect, useState } from "react";
import OriginSelectionButton from "./OriginSelectionButton";
import { useConnectionContext } from "../contexts/ConnectionContext";
import CollapsableHeading from "../generic/CollapsableHeading";
const CharacterCreationControlDisplay = () => {


  const { sendButtonInput: sendButtonInput, choiceContext } = useGameControllerContext();
  const defaultSelectionProcess = {
    originSelection: false,
    appearanceSelection: false,
  }
  const [selectionStep, setSelectionStep] = useState(defaultSelectionProcess)
  const { roomInfo } = useConnectionContext();
  const playerName = roomInfo ? roomInfo.playerName : "Player"
  const [pronoun, setPronoun] = useState<string>("he")
  const isMobile = useCheckMobileScreen();
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null)
  const [subSceneType, setSubSceneType] = useState<string>("")
  const [origins, setOrigins] = useState<any[]>([])

  useEffect(() => {
    if (choiceContext) {
      console.log(choiceContext)
      const _origins = choiceContext.playerChoices.filter((x: any) => x.choiceContext === "origin")
      setOrigins(_origins)
    }

  }, [choiceContext])
  // const origins = [{ name: "Mountain Folk", description: "Suited to a harsh life in the mountains, <Player> has learned to be more resilient than the average adventurer.", possibleTraits: ["Adventurous", "Burly", "C"] },
  // { name: "Disgruntled Monk ", description: "<Player> likes prayer!" }]
  //const subSceneType = gameContext ? gameContext.subSceneType : null
  enum CharacterCreationStages {
    ORIGIN_PHYSICAL, ORIGIN_CLASS, APPEARANCE, COLORS, READY
  }

  const primaryColors: Color[] = [{
    r: 200, g: 150, b: 50, a: 1
  },
  {
    r: 200, g: 50, b: 50, a: 1
  },
  {
    r: 155, g: 155, b: 255, a: 1
  },
  {
    r: 50, g: 50, b: 150, a: 1
  },
  {
    r: 50, g: 150, b: 50, a: 1
  },
  {
    r: 150, g: 150, b: 150, a: 1
  },
  {
    r: 100, g: 100, b: 50, a: 1
  },
  {
    r: 50, g: 150, b: 50, a: 1
  }];
  const tertiaryColors: Color[] = [{
    r: 180, g: 140, b: 50, a: 1
  },
  {
    r: 180, g: 45, b: 45, a: 1
  },
  {
    r: 125, g: 125, b: 180, a: 1
  },
  {
    r: 45, g: 45, b: 125, a: 1
  },
  {
    r: 45, g: 120, b: 45, a: 1
  },
  {
    r: 180, g: 160, b: 45, a: 1
  }];
  const skinColors: Color[] = [{
    r: 141, g: 85, b: 36, a: 1
  },
  {
    r: 198, g: 134, b: 66, a: 1
  },
  {
    r: 224, g: 172, b: 105, a: 1
  },
  {
    r: 241, g: 194, b: 125, a: 1
  },
  {
    r: 255, g: 219, b: 172, a: 1
  },
  ]

  const _expanded = {
    bg: 'blue.400',
    color: 'white'
  }

  function sendColor(fieldName: string, color: Color) {
    sendButtonInput(fieldName, `${color.r / 255},${color.g / 255},${color.b / 255},${color.a}`)
  }

  function pronounSelection() {
    function selectPronoun(pronoun: string) {
      sendButtonInput("pronoun", pronoun);
      setPronoun(pronoun);
    }
    return (
      <Stack>
        <Text>How are you referred to?</Text>
        <ButtonGroup>
          <Button onPointerDown={() => { selectPronoun("he") }}
            colorScheme={pronoun === "he" ? "blue" : "blackAlpha"}
          >
            He
          </Button>
          <Button
            onPointerDown={() => { selectPronoun("she") }}
            colorScheme={pronoun === "she" ? "blue" : "blackAlpha"}
          >She</Button>
          <Button
            onPointerDown={() => { selectPronoun("they") }}
            colorScheme={pronoun === "they" ? "blue" : "blackAlpha"}
          >They</Button>
        </ButtonGroup></Stack>)
  }

  function originSelection(pronoun: string) {
    function processOriginText(text: string): string {
      let _text = text.replaceAll("<Player>", playerName)
      if (pronoun === "she") {
        _text = _text.replaceAll("<he>", "she")
        _text = _text.replaceAll("<him>", "her")
        _text = _text.replaceAll("<his>", "her")
        _text = _text.replaceAll("<he was>", "she was")

      }
      else if (pronoun === "they") {
        _text = _text.replaceAll("<he>", "they")
        _text = _text.replaceAll("<him>", "them")
        _text = _text.replaceAll("<his>", "their")
        _text = _text.replaceAll("<he was>", "they were")

      }
      else {
        _text = _text.replaceAll("<", "")
        _text = _text.replaceAll(">", "")
      }
      return _text
    }

    const originButtons = origins.map((x: any) => {
      const { name, description } = x.data
      const origin = {
        name: name,
        description: processOriginText(description)
      }
      return (
        <GridItem
        >
          <OriginSelectionButton selected={selectedOrigin ? selectedOrigin.name === origin.name : false}
            onSelect={() => {
              if (selectedOrigin && origin.name === selectedOrigin.name) {
                setSelectedOrigin(null)
              }
              else {
                setSelectedOrigin(origin)
              }
            }}
            confirm={() => { sendButtonInput("origin", origin.name) }}
            origin={origin} />
        </GridItem>)
    })
    return (
      <Stack>
        <SimpleGrid
          columns={isMobile ? 1 : 3}
          borderColor={"blue.500"}
          borderWidth={2}
          borderRadius={3}
          boxShadow={"base"}
          overflowY={"scroll"}
          height={"50vh"}>
          {originButtons}
        </SimpleGrid>
      </Stack>

    )
  }

  const appearanceButtonStyle = { fontFamily: 'clear', fontSize: 25, width: '100%' }
  function appearanceSelection() {
    return (
      <Box >


        <SimpleGrid
          spacing={4}
          columns={isMobile ? 2 : 3}
        >
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "head_shape")
            }}
              {...appearanceButtonStyle}
            >
              Head Shape</Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "hair_front")
            }}{...appearanceButtonStyle}
            >
              Front Hair</Button>
          </GridItem>

          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "hair_main")
            }}{...appearanceButtonStyle}
            >
              Main Hair</Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "brows")
            }}{...appearanceButtonStyle}
            >
              Brows</Button>

          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "eyes")
            }}{...appearanceButtonStyle}
            >
              Eyes</Button>
          </GridItem>

          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "iris")
            }}{...appearanceButtonStyle}
            >
              Pupils</Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "ears")
            }}{...appearanceButtonStyle}
            >
              Ears</Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "nose")
            }}{...appearanceButtonStyle}
            >
              Nose</Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => {
              sendButtonInput("face", "mouth")
            }}{...appearanceButtonStyle}
            >
              Mouth</Button>
          </GridItem>
        </SimpleGrid></Box >)

  }
  function colorSelection() {
    return (<Center width={isMobile ? '100%' : ''}>
      <Stack spacing={5}>
        <CollapsableHeading title={"Skin Color"} >
          <ColorSelection colors={skinColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:skin`, color)} lightnessSlider />

        </CollapsableHeading>

        <CollapsableHeading title={"Primary Color"} >
          <ColorSelection colors={primaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:primary`, color)} rSlider gSlider bSlider lightnessSlider />
        </CollapsableHeading>

        <CollapsableHeading title={"Secondary Color"} >
          <ColorSelection colors={primaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:secondary`, color)} rSlider gSlider bSlider lightnessSlider />
        </CollapsableHeading>

        <CollapsableHeading title={"Tertiary Color"} >

          <ColorSelection colors={tertiaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:tertiary`, color)} rSlider gSlider bSlider lightnessSlider />

        </CollapsableHeading>

        <CollapsableHeading title={"Eye Color"} >

          <ColorSelection colors={tertiaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:iris`, color)} rSlider gSlider bSlider lightnessSlider />
        </CollapsableHeading>
        <CollapsableHeading title={"Primary Hair Color"} >
          <ColorSelection colors={primaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:hair`, color)} rSlider gSlider bSlider lightnessSlider />
        </CollapsableHeading>
        <CollapsableHeading title={"Secondary Hair Color"} >
          <ColorSelection colors={tertiaryColors} additionalColors={isMobile ? 1 : 2} submitColorChange={(color) => sendColor(`color:secondary_hair`, color)} rSlider gSlider bSlider lightnessSlider />
        </CollapsableHeading>
      </Stack>
    </Center>)
  }

  function finalCheck() {
    if (selectedOrigin == null) {
      return false;
    }
    //can include other checks here
    return true;
  }

  return (<>
    <Center>
      <Heading>Character Creation</Heading>
    </Center>
    <Accordion allowToggle p={4}
      bg={'blackAlpha.200'}>
      <AccordionItem>
        <h2>
          <AccordionButton _expanded={_expanded}>
            <Box as='span' flex='1' textAlign='left'>
              Pronoun Selection
            </Box>
            <AccordionIcon />
          </AccordionButton>

        </h2>
        <AccordionPanel pb={4}>
          {pronounSelection()}
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton _expanded={_expanded}>
            <Box as="span" flex='1' textAlign='left'>
              Origin Selection
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          {originSelection(pronoun)}
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton _expanded={_expanded}>
            <Box as="span" flex='1' textAlign='left'>
              Appearance Selection
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} pl={1}>
          {appearanceSelection()}
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton _expanded={_expanded}>
            <Box as="span" flex='1' textAlign='left'>
              Color Selection
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} pl={1}>
          <SimpleGrid columns={isMobile ? 1 : 4}>
            <GridItem colSpan={3}>
              {colorSelection()}
            </GridItem>
            <GridItem>
              <Center>
                <Text fontFamily={"clear"}
                  textAlign={"center"}
                >
                  Note that at some values of lightness, the color may appear black or white (or extremes of one hue)
                </Text>
              </Center>
            </GridItem>
          </SimpleGrid>

        </AccordionPanel>
      </AccordionItem>
    </Accordion>
    <Center>
      <Button w={'100%'}
        p={4}
        disabled={!finalCheck()}
        onClick={() => {
          sendButtonInput("ready", "ready")
          console.log(selectedOrigin)
        }}
      >Ready</Button>
    </Center>
  </>)
}

export default CharacterCreationControlDisplay