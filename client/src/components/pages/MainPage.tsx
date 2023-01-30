import { HStack, Spacer, Stack } from "@chakra-ui/react";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { RoomControls } from "../screens/RoomControls";
import { MainTabs } from "../screens/MainTabs";
import { WebControllerPanel } from "../screens/ControllerConnectionPanel";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";


const MainPage = () => {

  return <Stack
  >
    <MainJoinRoomSection orientation={useCheckMobileScreen() ? "vertical" : "horizontal"} />
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

  const { roomInfo } = useConnectionContext();
  if (roomInfo) {
    //TODO add a collapse button
  }
  if (orientation === "horizontal") {
    return (<HStack padding={5}>

      <RoomControls />
      <Spacer />
      <WebControllerPanel />
    </HStack>)
  }
  else {
    return (
      <Stack padding={5}>
        <RoomControls />
        <WebControllerPanel />
      </Stack>
    )
  }
}

export default MainPage;