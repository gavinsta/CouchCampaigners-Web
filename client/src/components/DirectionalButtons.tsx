import { ButtonGroup, Grid, GridItem, IconButton, Stack, Text } from "@chakra-ui/react";
import { AiFillCaretLeft, AiFillCaretRight, AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";

interface FullDirectionalButtonsParams {
  directions: "all" | "vertical" | "horizontal",
  label?: string,
  output: (direction: string) => void,
  centerWidth?: number
}
interface DirectionalButtonParams {
  action: (value: string) => void
}
export function Left({ action }: DirectionalButtonParams) {
  return <IconButton aria-label={"choose_left"}
    onClick={() => {
      action("left");
    }}
    colorScheme="blue" icon={<AiFillCaretLeft />} fontSize={40} />
}

export function Right({ action }: DirectionalButtonParams) {
  return <IconButton aria-label={"choose_right"}
    onClick={() => {
      action("right");
    }}
    colorScheme="blue" icon={<AiFillCaretRight />} fontSize={40} />
}

export function Up({ action }: DirectionalButtonParams) {
  return <IconButton
    aria-label={"choose_up"}
    onClick={() => {
      action("up");
    }}
    colorScheme="blue" icon={<AiFillCaretUp />} fontSize={40} />
}

export function Down({ action }: DirectionalButtonParams) {
  return <IconButton aria-label={"choose_down"}
    onClick={() => {
      action("down");
    }}
    colorScheme="blue" icon={<AiFillCaretDown />} fontSize={40} />
}
const DirectionalButtons = (params: FullDirectionalButtonsParams) => {

  const { directions, label, output, centerWidth } = params;

  if (directions == "horizontal") {
    return (<Grid
      templateAreas={`"cl cm cr"`}
      gridTemplateColumns={`50px ${centerWidth} 50px`}
      gap='1'>
      <GridItem
        area={"cl"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("left")} aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretLeft />} fontSize={40} />
      </GridItem><GridItem
        area={"cm"}
        padding={5}>
        <Text
          textAlign={"center"}
          w={"100%"}
          style={{ wordWrap: "normal" }}>{label}</Text>
      </GridItem><GridItem
        area={"cr"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("right")} aria-label={"choose_right"} colorScheme="blue" icon={<AiFillCaretRight />} fontSize={40} />
      </GridItem>
    </Grid>)
  }
  else if (directions == "vertical") {
    return (<Grid
      templateAreas={`"up""cm""bm"`}
      gridTemplateRows={`50px 80px 50px`}
      gap='1'>
      <GridItem
        area={"um"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("up")} aria-label={"choose_up"} colorScheme="blue" icon={<AiFillCaretUp />} fontSize={40} />
      </GridItem>
      <GridItem
        area={"cm"}
        padding={5}>
        <Text
          textAlign={"center"}
          w={"100%"}
          style={{ wordWrap: "normal" }}>{label}</Text>
      </GridItem><GridItem
        area={"bm"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("down")} aria-label={"choose_down"} colorScheme="blue" icon={<AiFillCaretDown />} fontSize={40} />
      </GridItem>
    </Grid>)
  }
  return <Grid
    templateAreas={`"ul um ur""cl cm cr""bl bm br"`}
    gridTemplateRows={`50px 80px 50px`}
    gridTemplateColumns={`50px 80px 50px`}
    gap='1'>

    <GridItem
      area={"um"}>
      <IconButton
        h={"100%"}
        w={"100%"}
        onClick={() => output("up")} aria-label={"choose_up"} colorScheme="blue" icon={<AiFillCaretUp />} fontSize={40} />
    </GridItem>
    <GridItem
      area={"bm"}>
      <IconButton
        h={"100%"}
        w={"100%"}
        onClick={() => output("down")} aria-label={"choose_down"} colorScheme="blue" icon={<AiFillCaretDown />} fontSize={40} />
    </GridItem>
    <GridItem
      area={"cl"}>
      <IconButton
        h={"100%"}
        w={"100%"}
        onClick={() => output("left")} aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretLeft />} fontSize={40} />
    </GridItem>
    <GridItem
      area={"cr"}>
      <IconButton
        h={"100%"}
        w={"100%"}
        onClick={() => output("right")} aria-label={"choose_right"} colorScheme="blue" icon={<AiFillCaretRight />} fontSize={40} />
    </GridItem>
    <GridItem
      area={"cm"}
      padding={5}>
      <Text
        textAlign={"center"}
        w={"100%"}
        style={{ wordWrap: "normal" }}>{label}</Text>
    </GridItem>
  </Grid>
}

export default DirectionalButtons;