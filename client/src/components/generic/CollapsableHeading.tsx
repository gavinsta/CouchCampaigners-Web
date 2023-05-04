import { useDisclosure, Box, BoxProps, Button, Collapse, Heading, Icon, HStack, Spacer } from "@chakra-ui/react"
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi"
export default function CollapsableHeading(props: BoxProps | { title?: string, children: React.ReactNode }) {
  const { isOpen: open, onToggle: toggle } = useDisclosure()
  const { title, children } = props;
  return (
    <>
      <Button as={Heading} onClick={toggle}
        color={open ? 'white' : ''}
        bg={open ? 'base.50' : ''}
      >{title} <Spacer width={'10px'} /><Icon as={open ? HiOutlineChevronUp : HiOutlineChevronDown} /></Button>

      <Collapse in={open} animateOpacity>
        <Box
          {...props}

        >
          {children}
        </Box>
      </Collapse>
    </>
  )
}

