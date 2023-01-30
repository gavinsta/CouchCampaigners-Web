import { Box, Button, ButtonGroup, GridItem, Heading, HStack, Input, InputAddon, InputGroup, SimpleGrid, Stack, Textarea } from "@chakra-ui/react"
import { useState } from "react";
import { Trait } from "./Trait";
const base = "http://localhost:5050/assetmaker/traits"//"/assetmaker/traits"

async function getAllTraits(): Promise<{ traits: Trait[] }> {
  const res = await fetch(base + "/all", {
    method: 'Get',
    headers: {
      'Content-type': 'application/json'
    }
  });
  return res.json();
}

const TraitMaker = function () {
  const defaultNewTrait: Trait = {
    name: "",
    description: "",
    effect: []
  }
  const [currentTrait, setCurrentTrait] = useState<Trait>(defaultNewTrait)
  const [allTraits, setAllTraits] = useState<Map<string, Trait>>(new Map())

  function saveChanges() {
    //TODO
  }

  function showCompTraits() {
    if (!currentTrait.compTraits) return <></>
    return currentTrait.compTraits.map((traitName) => {
      const trait = allTraits.get(traitName);
      if (trait) {
        return <Button onClick={() => setCurrentTrait(trait)}>
          {trait.name}<br />{trait.description}
        </Button>
      }
      else return <Button colorScheme={"red"}>
        Create: {traitName}
      </Button>
    });
  }
  function showAntiTraits() {
    if (!currentTrait.antiTraits) return <></>
    return currentTrait.antiTraits.map((traitName) => {
      const trait = allTraits.get(traitName);
      if (trait) {
        return (
          <Button onClick={() => setCurrentTrait(trait)}>
            {trait.name}<br />{trait.description}
          </Button>);
      }
      else return (<Button colorScheme={"red"}>
        Create: {traitName}
      </Button>);
    })
  }

  return (<>
    <ButtonGroup>
      <Button onClick={() => {

      }}>
        New Trait
      </Button>
      <Button onClick={async () => {
        const obj = await getAllTraits();
        setAllTraits(new Map<string, Trait>(obj.traits.map(i => [i.name, i])));

      }}>
        Load all traits
      </Button>
    </ButtonGroup>
    <TraitListDisplay traits={Array.from(allTraits.values())} inspectTrait={setCurrentTrait} />
    <Stack>
      <InputGroup>
        <InputAddon w={200}>
          Name
        </InputAddon>
        <Input
          name="name"
          placeholder={currentTrait.name}
        />
      </InputGroup>
      <InputGroup>
        <InputAddon w={200} >
          Description
        </InputAddon>
        <Textarea maxH={100} placeholder={currentTrait.description} />
      </InputGroup>


    </Stack>
    <Heading>Other traits</Heading>
    <HStack>
      <Stack>
        <Heading>Comp Traits:</Heading>
        {showCompTraits()}

      </Stack>

      <Stack>
        <Heading>Anti Traits:</Heading>
        {showAntiTraits()}
      </Stack>
    </HStack>




    <Button colorScheme={"blue"}
      onClick={() => {
        saveChanges()
      }}>Save Changes</Button>
  </>)
}
export default TraitMaker

function TraitDisplay({ trait }: { trait: Trait }) {

  return (<Box>

  </Box>)
}

function TraitListDisplay(props: { traits: Trait[], inspectTrait: (trait: Trait) => void }) {
  const { traits, inspectTrait } = props;
  function createButtons() {
    return traits.map((trait) => {
      return <GridItem>
        <Button onClick={() => inspectTrait(trait)}>
          {trait.name}<br />{trait.description}
        </Button>
      </GridItem>
    });
  }
  return (
    <SimpleGrid columns={5}>
      {createButtons()}
    </SimpleGrid>
  )
}