import { ButtonGroup, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"
const AllApps = () => {
  const navigate = useNavigate();
  return (<ButtonGroup>
    <Button onClick={() => {
      navigate("/traitmaker")
    }}>
      Trait Maker
    </Button>
  </ButtonGroup>)
}

export default AllApps;