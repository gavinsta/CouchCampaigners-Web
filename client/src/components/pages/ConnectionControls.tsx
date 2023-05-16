import { IconButton, HStack, Spacer, Stack, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Text, Box, useDisclosure } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useState } from "react";
import { IoReorderThree } from "react-icons/io5";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { RoomControls } from "../screens/RoomControls";
import { WebControllerPanel } from "../screens/WebControllerPanel";

export default function ConnectionControls() {
  const { onToggle, isOpen, onClose, onOpen } = useDisclosure();
  const { roomInfo } = useConnectionContext();
  useEffect(() => {
    onOpen()
  }, []);
  return <><HStack>
    <Button
      onClick={onToggle}
    >{roomInfo ? "Room Controls" : "Room Controls"}</Button>
    {roomInfo ?
      <Text>{roomInfo?.roomCode}</Text>
      :
      <></>
    }
  </HStack><ConnectionControlDrawer isOpen={isOpen} onClose={onClose}
    />
  </>
}

/**
 * Show the connection controls in a drawer
 * @param props 
 * @returns 
 */
export function ConnectionControlDrawer(props: { isOpen: boolean, onClose: () => void }) {
  //const btnRef = React.useRef<HTMLButtonElement>(null)
  const { roomInfo } = useConnectionContext();
  const { isOpen, onClose } = props;
  const isMobile = useCheckMobileScreen();
  return (
    <Drawer
      isOpen={isOpen}
      placement={isMobile ? 'top' : "right"}
      onClose={onClose}
    //finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Room Controls</DrawerHeader>

        <DrawerBody>
          <Stack>
            <RoomControls orientation={isMobile ? "vertical" : "horizontal"} />
            <Spacer />
            <WebControllerPanel />
            <Box borderRadius={5} p={2} bg={'whiteAlpha.100'}>
              {roomInfo ?
                <>
                  Room for more information
                  <Text>Some information goes here</Text>

                </> : <></>}
            </Box>

          </Stack>

        </DrawerBody>

        <DrawerFooter>
          <Button variant="ghost"
            colorScheme={"blue"}
            leftIcon={<IoReorderThree />}
            onClick={onClose}
          >Hide Menu</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}