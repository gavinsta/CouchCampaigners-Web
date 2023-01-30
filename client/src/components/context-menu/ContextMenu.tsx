import { useState } from "react";
import { Button, Stack } from "@chakra-ui/react"
interface Position {
  x: number,
  y: number
}
function ContextMenu({ position, options, action }: { position: { x: number, y: number }, options: string[], action: (option: string) => void }) {
  const [contextPos, setContextPos] = useState<Position>({ x: 0, y: 0 })
  const showContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const position = {
      x: event.pageX,
      y: event.pageY
    }
    setContextPos(position)
    console.log(position)
  }
  function renderMenuOptions() {
    return options.map(option => {
      return <Button
        variant="outline"
        onClick={() => action(option.toLowerCase())}>
        {option}
      </Button>
    })
  }
  return (
    <Stack width={"300px"}
      style={{
        position: "fixed",
        top: `${position.y}px`, left: `${position.x}PX`
      }}
      className="custom-context-menu"
    >
      {renderMenuOptions()}
    </Stack>
  )
}

export default ContextMenu