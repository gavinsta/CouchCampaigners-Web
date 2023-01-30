import { Box, HStack } from "@chakra-ui/react"
import { useState } from "react"
import { Left, Right } from "../DirectionalButtons"

export type Color = {
  r: number,
  g: number,
  b: number,
  a: number
}
interface ColorSelectionProps {
  colors: Color[],
  additionalColors?: number
}
const ColorSelection = (props: ColorSelectionProps) => {
  const { colors } = props;
  const sideColors = props.additionalColors || 1
  const [index, setIndex] = useState(0);

  function shiftIndex(value: number) {
    let val = index + value;
    if (val >= colors.length) {
      setIndex(val - colors.length);
    }
    else if (val < 0) {
      setIndex(colors.length + val);
    }
    else {
      setIndex(val);
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
          color={color}
          selected={i == index}
        />)
    }
    return swatches;
  }
  return <HStack>
    <Left action={() => {
      shiftIndex(-1)
    }} />
    {showSwatches()}
    <Right action={() => {
      shiftIndex(1)
    }} />
  </HStack>
}

function ColorSwatch({ color, selected }: { color: Color, selected: boolean }) {
  function createColor(color: Color): string {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`
  }
  return (<Box
    borderColor={selected ? "whiteAlpha.700" : ""}
    borderWidth={selected ? "5px" : ""}
    borderRadius={10} w={selected ? '60px' : 50} h={selected ? '60px' : 50} bg={createColor(color)}>
  </Box>)
}
export default ColorSelection;