import { Button, ButtonGroup, Center, GridItem, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import ColorSelection, { Color } from "../input-controls/ColorSelection";
import { useEffect, useState } from "react";
import OriginSelectionButton from "./OriginSelectionButton";
import { useConnectionContext } from "../contexts/ConnectionContext";
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
    ORIGIN_PHYSICAL, ORIGIN_CLASS, APPEARANCE, READY
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

  function sendColor(fieldName: string, color: Color) {
    sendButtonInput(fieldName, `${color.r / 255},${color.g / 255},${color.b / 255},${color.a}`)
  }

  function setSubScene() {
    return (
      <>
        <Heading>Selection Stage</Heading>
        <ButtonGroup orientation="vertical" variant={"outline"}>
          <Button onClick={() => { setSubSceneType("origin") }}>
            Origin Selection
          </Button>
          <Button onClick={() => { setSubSceneType("appearance") }}>
            Appearance Selection
          </Button>
        </ButtonGroup></>)
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
        <GridItem>
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

  function appearanceSelection() {
    return (<Stack>
      <Center>
        <Stack>
          <Heading textAlign="center"
            fontSize={20}>Skin Color</Heading>
          <ColorSelection colors={skinColors} additionalColors={isMobile ? 1 : 2} onColorChange={(color) => sendColor(`color:skin`, color)} />
        </Stack>
      </Center>
      <Center>
        <Stack>
          <Heading
            textAlign="center"
            fontSize={20}>Primary Color</Heading>
          <ColorSelection colors={primaryColors} additionalColors={isMobile ? 1 : 2} onColorChange={(color) => sendColor(`color:primary`, color)} />
        </Stack>

      </Center>
      <Center>
        <Stack>
          <Heading textAlign="center"
            fontSize={20}>Secondary Color</Heading>
          <ColorSelection colors={primaryColors} additionalColors={isMobile ? 1 : 2} onColorChange={(color) => sendColor(`color:secondary`, color)} />
        </Stack>
      </Center>
      <Center>
        <Stack>
          <Heading textAlign="center"
            fontSize={20}>Tertiary Color</Heading>
          <ColorSelection colors={tertiaryColors} additionalColors={isMobile ? 1 : 2} onColorChange={(color) => sendColor(`color:tertiary`, color)} />
        </Stack>
      </Center>
    </Stack>)
  }


  return (<>
    <Heading>Character Creation</Heading>
    <Center>
      <Stack direction={isMobile ? "column" : "row"}>
        {setSubScene()}
        {pronounSelection()}
      </Stack>
    </Center>

    {/**COLOR SELECTION */}
    {subSceneType === "appearance" ? appearanceSelection() : <></>}
    {subSceneType === "origin" ? originSelection(pronoun) : <></>}

  </>)
}

export default CharacterCreationControlDisplay