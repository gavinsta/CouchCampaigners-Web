import { Button, HStack, IconButton, Spacer, Stack } from "@chakra-ui/react";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { RoomControls } from "../screens/RoomControls";
import { MainTabs } from "../screens/MainTabs";
import { WebControllerPanel } from "../screens/WebControllerPanel";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import { useState } from "react";
import { IoReorderThree } from "react-icons/io5"

const ControllerPage = () => {

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
//TODO move section into a ChakraUI Drawer
function MainJoinRoomSection({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { roomInfo } = useConnectionContext();
  if (collapsed) {
    return (<IconButton aria-label="Expand Menu" icon={<IoReorderThree />}
      onClick={() => {
        setCollapsed(false)
      }}
    />)
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
        <Button variant="ghost"
          colorScheme={"blue"}
          leftIcon={<IoReorderThree />}
          onClick={() => {
            setCollapsed(true)
          }}
        >Hide Menu</Button>
      </Stack>
    )
  }
}

export default ControllerPage;