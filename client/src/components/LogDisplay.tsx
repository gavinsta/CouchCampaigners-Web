import { useGameControllerContext } from "./contexts/GameControllerContext";
import { useState, useRef, useEffect } from "react";
import { Button, Stack, Grid, GridItem, HStack, Input, List, ListItem, ListIcon, useToast } from '@chakra-ui/react'
import { AiOutlineAlert, AiOutlineUser } from 'react-icons/ai'
import { RiZzzFill } from 'react-icons/ri'
import GameLog from "../types/GameLog";
import { IncomingWSMessage, MessageType } from "../types/ClientWSMessage";
import { useConnectionContext } from "./contexts/ConnectionContext";
export function LogDisplay() {
  const { sendWSText, roomInfo, fullLog } = useConnectionContext();
  const [text, setText] = useState<string>("");
  const toast = useToast();
  const myRef = useRef(null)

  function formatLog(log: GameLog) {
    const str = `[${log.time}] ${log.sender}: ${log.text}`;
    switch (log.type) {
      case "LOG":
        return (<ListItem>
          <ListIcon as={AiOutlineAlert} color='gray.300' />
          {str}
        </ListItem>
        );
      default:
        return (<ListItem>
          <ListIcon as={AiOutlineUser} />
          {str}
        </ListItem>
        );
    }
  }


  function sendMessage() {
    if (text) {
      if (!roomInfo) {
        toast({ title: 'Haven\'t joined a room!', description: 'You\'ve got nobody to talk to.', status: 'warning' })
        return;
      }
      const message = {
        type: MessageType.LOG,
        header: "chat",
        text: text,
      }
      sendWSText({ type: MessageType.LOG, header: "chat", text: text });
      setText("");
    }
  }
  return (
    <Grid
      templateRows='minmax(100%,auto) min-content'
      height={'70vh'}
      gap='1'
    >
      <GridItem
        overflowY={'scroll'}
        h={'100%'}
        maxH={'100%'}
      >
        <List>
          {fullLog.length > 0 ? fullLog.map(formatLog) : <ListItem><ListIcon as={RiZzzFill} />No messages</ListItem>}
        </List>
      </GridItem>
      <GridItem>
        <HStack>
          <Input
            type="text"
            onChange={e => {
              setText(e.target.value)
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder="Type Here"
            value={text}
          />
          <Button colorScheme={'govy'}
            onClick={sendMessage}>
            Send
          </Button>
        </HStack>
      </GridItem>
    </Grid>
  );
}