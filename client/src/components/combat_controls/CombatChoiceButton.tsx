import { HStack, Button, ChakraProps } from "@chakra-ui/react";
import { useState } from "react";
import { BsHourglassSplit } from "react-icons/bs";
import { GiAxeSword, GiFire } from "react-icons/gi";
import { Choice } from "../../types/ConnectionInterfaces";
function CombatChoiceButton({ choice, selectChoice, setHoverChoice }:
  {
    choice: Choice,
    selectChoice: (choice: Choice) => void,
    setHoverChoice: (choice: Choice) => void
  } & ChakraProps) {
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    setDelayHandler(setTimeout(() => {
      if (choice) {
        setHoverChoice(choice);
      }
    }, 300))
  }

  const handleMouseLeave = () => {
    if (delayHandler) {
      clearTimeout(delayHandler)
    }
  }
  function chooseIcon() {
    switch (choice.choiceData.status) {
      case "on_cooldown":
        return <BsHourglassSplit />
      case "charging":
        return <GiFire />
      case "no_charges":
        return <GiFire />
      default:
        return <GiAxeSword />
    }
  }
  function chooseColor() {
    switch (choice.choiceData.status) {
      case "on_cooldown":
        return 'red';
      case "no_charges":
        return 'yellow'
      case "charging":
        return 'orange';
      case 'charged':
        return 'green'
      default:
        return 'grey'
    }
  }
  return (
    <HStack>
      <Button
        leftIcon={chooseIcon()}
        height='60px'
        maxHeight='100px'
        width='100%'
        onClick={() => {
          selectChoice(choice);
        }}
        colorScheme={chooseColor()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={choice.choiceData.status === "on_cooldown" ? true : false}
        variant={choice.choiceData.status === "charged" ? 'solid' : 'outline'}
      >
        {choice.choiceName}
      </Button>
    </HStack>
  )
}

export default CombatChoiceButton