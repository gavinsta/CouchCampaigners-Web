import { useRef, useState } from "react"
import { Box, Button, Center, Heading, Stack, Text } from "@chakra-ui/react"
const OriginSelectionButton = ({ origin, onSelect, selected, confirm }: { selected: boolean, origin: any, onSelect: (origin: any) => void, confirm: () => void }) => {
  const [clicked, setClicked] = useState<Boolean>(false)
  const { name, description } = origin
  const timeout = useRef<number | null>(null);
  function clear() {
    setClicked(false);
    if (timeout.current) {
      window.clearTimeout(timeout.current);
      timeout.current = null
    }
  }

  return (<Box
    style={{
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",

    }}

    padding={2}

    onContextMenu={(e) => { e.preventDefault() }}
    onClick={(e) => {
      e.preventDefault();
      onSelect(origin)
    }}>
    <Stack

      spacing={0}>
      <Heading
        borderRadius="full"
        borderColor={clicked ? "blue.400" : selected ? "blue.600" : "blackAlpha.600"}
        borderWidth={8}
        textAlign={"center"}>{name}</Heading>
      {selected ? <Center
      >
        <Stack>
          <Text width={"90%"}

            pl={3} pr={3}
            borderColor="blue.600"
            borderBottomRadius={"15"}
            bg={"whiteAlpha.400"}
          >{description}</Text>
          <Button colorScheme={"blue"}
            disabled={!selected}
            onClick={() => {
              confirm()
            }}>
            Choose Origin
          </Button>
        </Stack>



      </Center>
        : <></>}


    </Stack>

  </Box >)
}

export default OriginSelectionButton