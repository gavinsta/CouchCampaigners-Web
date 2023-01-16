import { ButtonGroup, Grid, GridItem, IconButton, Stack, Text } from "@chakra-ui/react";
import { AiFillCaretLeft, AiFillCaretRight, AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";

interface DirectionalButtonsParams {
  directions: "all" | "vertical" | "horizontal",
  label?: string,
  output: (direction: string) => void
}
function Left() {
  return <IconButton aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretLeft />} fontSize={40} />
}

function Right() {
  return <IconButton aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretRight />} fontSize={40} />
}

function Up(action: (string)) {
  return <IconButton aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretUp />} fontSize={40} />
}

function Down() {

}
const DirectionalButtons = (params: DirectionalButtonsParams) => {

  const { directions, label, output } = params;

  return <Grid
    templateAreas={`"ul um ur""cl cm cr""bl bm br"`}
    gridTemplateRows={`50px 80px 50px`}
    gridTemplateColumns={`50px 80px 50px`}
    gap='1'>
    {directions === "horizontal" ? <></> :
      <GridItem
        area={"um"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("up")} aria-label={"choose_up"} colorScheme="blue" icon={<AiFillCaretUp />} fontSize={40} />
      </GridItem>}
    {directions === "horizontal" ? <></> :
      <GridItem
        area={"bm"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("down")} aria-label={"choose_down"} colorScheme="blue" icon={<AiFillCaretDown />} fontSize={40} />
      </GridItem>
    }
    {directions === "vertical" ? <></> :
      <GridItem
        area={"cl"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("left")} aria-label={"choose_left"} colorScheme="blue" icon={<AiFillCaretLeft />} fontSize={40} />
      </GridItem>}
    {directions === "vertical" ? <></> :
      <GridItem
        area={"cr"}>
        <IconButton
          h={"100%"}
          w={"100%"}
          onClick={() => output("right")} aria-label={"choose_right"} colorScheme="blue" icon={<AiFillCaretRight />} fontSize={40} />
      </GridItem>
    }


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