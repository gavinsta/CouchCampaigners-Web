import { Center, Container, Heading, HStack, Stack } from "@chakra-ui/react";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { RoomControls } from "../screens/RoomControls";
import { MainTabs } from "../screens/MainTabs";
import { WebControllerPanel } from "../screens/ControllerConnectionPanel";

const MainPage = () => {
  const { roomInfo } = useConnectionContext();
  return <Stack>
    <MainJoinRoomSection orientation="horizontal" />
    <MainTabs />
  </Stack>
  /*
  return (<>{roomInfo ?
    <PageContent />
    :
    <Center>
      <Stack>
        <Heading textAlign={"center"}>
          Join a room first
        </Heading>
        <MainJoinRoomSection />
      </Stack>

    </Center>

  }</>)
  */


}

function MainJoinRoomSection({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  if (orientation === "horizontal") {
    return (<HStack>

      <RoomControls />
      <WebControllerPanel />
    </HStack>)
  }
  else {
    return (
      <Stack>
        <RoomControls />
        <WebControllerPanel />
      </Stack>
    )
  }
}

export default MainPage;