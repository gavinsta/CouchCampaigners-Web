import { Box, Collapse, HStack, IconButton, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, useDisclosure } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { Left, Right } from "../DirectionalButtons"
import { BsFillBrightnessHighFill } from "react-icons/bs"
import { IoColorPaletteSharp } from "react-icons/io5"
export type Color = {
  r: number,
  g: number,
  b: number,
  a: number
}
interface ColorSelectionProps {
  colors: Color[],
  lightnessSlider?: boolean,
  rSlider?: boolean,
  gSlider?: boolean,
  bSlider?: boolean,
  additionalColors?: number
  onColorChange: (color: Color) => void
}
const ColorSelection = (props: ColorSelectionProps) => {
  const { colors, onColorChange, lightnessSlider, rSlider, gSlider, bSlider } = props;
  const sideColors = props.additionalColors || 1
  const [index, setIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState(colors.at(0))
  const [currentAdjustment, setCurrentAdjustment] = useState<Color>({ r: 0, g: 0, b: 0, a: 0 })
  const { isOpen: openRGB, onToggle: toggleRGB } = useDisclosure();
  const { isOpen: openLightness, onToggle: toggleLightness } = useDisclosure();

  useEffect(() => {


  }, [index])
  function shiftIndex(value: number) {
    let val = index + value;
    if (val >= colors.length) {
      val -= colors.length
      setIndex(val);
    }
    else if (val < 0) {
      val += colors.length;
      setIndex(val);
    }
    else {
      setIndex(val);
    }

    const _color = colors.at(val)
    if (_color) {
      setCurrentColor(_color);
      onColorChange(_color);
    }
  }

  function showSwatches() {
    let swatches = []
    for (var i = index - sideColors; i <= index + sideColors; i++) {
      let spot = i;
      if (i < 0) {
        spot = colors.length + i;
      }
      else if (i >= colors.length) {
        spot = i - colors.length;
      }
      const color = colors.at(spot);
      if (color)
        swatches.push(<ColorSwatch
          color={getEdittedColor(color)}
          selected={i == index}
        />)
    }
    return swatches;
  }

  function getEdittedColor(_color: Color): Color {
    return {
      r: _color.r + currentAdjustment.r + currentAdjustment.a,
      g: _color.g + currentAdjustment.g + currentAdjustment.a,
      b: _color.b + currentAdjustment.b + currentAdjustment.a,
      a: 1
    }
  }

  function editColor(value: number, channel: 'r' | 'g' | 'b' | 'a') {
    setCurrentAdjustment({ ...currentAdjustment, [channel]: value })
    const _color = colors.at(index);
    if (_color) {
      const _edittedColor: Color = {
        r: _color.r + currentAdjustment.r + currentAdjustment.a,
        g: _color.g + currentAdjustment.g + currentAdjustment.a,
        b: _color.b + currentAdjustment.b + currentAdjustment.a,
        a: _color.a
      }
      setCurrentColor(_edittedColor);

    }


    if (currentColor)
      onColorChange(currentColor);
  }
  return <Stack>
    <HStack>
      <Left action={() => {
        shiftIndex(-1)

      }} />
      {showSwatches()}
      <Right action={() => {
        shiftIndex(1)

      }} />

    </HStack>
    <HStack>
      <Box
        width={'20px'}
        height={'20px'}
        bg={currentColor ? createColor(currentColor) : 'white'}></Box>
      {rSlider || gSlider || bSlider ? <IconButton aria-label={'edit color'} icon={<IoColorPaletteSharp />} onClick={toggleRGB} bg={openRGB ? 'blue.400' : "highlight.100"} color={openRGB ? 'white' : 'black'} /> : <></>}
      {lightnessSlider ? <IconButton aria-label={'edit lightness'} icon={<BsFillBrightnessHighFill />} onClick={toggleLightness} bg={openLightness ? 'blue.400' : "highlight.100"} color={openLightness ? 'white' : 'black'} /> : <></>}

    </HStack>
    <Collapse in={openLightness} animateOpacity>
      <Slider size='lg' min={-64} max={64} defaultValue={0}
        onChange={(value) => {
          editColor(value, 'a')
        }}
      >
        <SliderTrack bg={'white'} height={'10px'} borderWidth={1} >
          <SliderFilledTrack bg={'black'} />
        </SliderTrack>
        <SliderThumb as={BsFillBrightnessHighFill} color={'black'} />
      </Slider>

    </Collapse>
    <Collapse in={openRGB} animateOpacity>
      {/**Red slider*/
        rSlider ?

          <Slider size='lg' min={-64} max={64} defaultValue={0}
            onChange={(value) => {
              editColor(value, 'r')
            }}
          >
            <SliderTrack bg={'white'} height={'10px'} borderWidth={1} borderColor={'blue'}>
              <SliderFilledTrack bg={'red'} />
            </SliderTrack>
            <SliderThumb as={BsFillBrightnessHighFill} color={'black'} />
          </Slider> : <></>}
      {/**Green slider*/
        gSlider ?

          <Slider size='lg' min={-64} max={64} defaultValue={0}
            onChange={(value) => {
              editColor(value, 'g')
            }}
          >
            <SliderTrack bg={'white'} height={'10px'} borderWidth={1} borderColor={'blue'}>
              <SliderFilledTrack bg={'green'} />
            </SliderTrack>
            <SliderThumb as={BsFillBrightnessHighFill} color={'black'} />
          </Slider> : <></>}
      {/**Blue slider*/
        bSlider ?
          <Slider size='lg' min={-64} max={64} defaultValue={0}
            onChange={(value) => {
              editColor(value, 'b')
            }}
          >
            <SliderTrack bg={'white'} height={'10px'} borderWidth={1} borderColor={'blue'}>
              <SliderFilledTrack bg={'blue'} />
            </SliderTrack>
            <SliderThumb as={BsFillBrightnessHighFill} color={'black'} />
          </Slider> : <></>}
    </Collapse>
  </Stack>
}

function ColorSwatch({ color, selected }: { color: Color, selected: boolean }) {

  return (<Box
    borderColor={selected ? "whiteAlpha.700" : ""}
    borderWidth={selected ? "5px" : ""}
    borderRadius={10} w={selected ? '60px' : 50} h={selected ? '60px' : 50} bg={createColor(color)}>
  </Box>)
}

function createColor(color: Color): string {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`
}
export default ColorSelection;