import { Box, Button, ButtonGroup, Heading, HStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useGameControllerContext } from "../contexts/GameControllerContext";

const WorldMapControlDisplay = () => {
  const { choiceContext, sendButtonInput } = useGameControllerContext();
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    if (choiceContext) {
      //console.log(choiceContext)
      const _destinations = choiceContext.playerChoices.filter((x: any) => x.choiceContext === "location").map((x: any) => x.data);
      setDestinations(_destinations)
    }
    else setDestinations([])
  }, [choiceContext]);

  function sendChoice(name: string) {
    sendButtonInput("location", name)
  }
  return (<Box>
    <ButtonGroup>
      {destinations.map(x => <WorldMapLocationButton locationName={x.Name} description={x.Description} select={sendChoice} />)}
    </ButtonGroup>

  </Box>);
}

function WorldMapLocationButton(props: { locationName: string, description: string, select: (name: string) => void }) {
  const { select, locationName, description } = props;
  return <Button onClick={() => {
    select(locationName);
  }}>
    <HStack>
      <Heading>{locationName}</Heading>
      <Text>
        {description}
      </Text>
    </HStack>
  </Button>
}

export default WorldMapControlDisplay;