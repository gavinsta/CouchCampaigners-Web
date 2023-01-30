import { Box, Heading, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Stack, Text } from "@chakra-ui/react"
import React, { useState } from "react";

function BravesSelector() {
  const totalPoints = 350;
  const defaultBraves = {
    brawn: 50,
    resistance: 50,
    attunement: 50,
    virtuosity: 50,
    energy: 50,
    speed: 50
  }
  const [braves, setBraves] = useState(defaultBraves)
  const [pointsLeft, setPointsLeft] = useState(totalPoints - currentBravesSum())

  function currentBravesSum(): number {
    var tally = 0;
    for (var prop in braves) {
      tally += Object(braves)[prop]
    }
    return tally;
  }

  function changeSliderValue(statName: string, value: number) {
    setBraves({ ...braves, [statName]: value })
    setPointsLeft(totalPoints - currentBravesSum())
  }

  function renderBravesSliders() {
    var elements: React.ReactNode[] = [];
    for (var prop in braves) {
      var currentValue = Object(braves)[prop];
      elements.push(

        <BravesSlider
          setBravesValue={changeSliderValue}
          sliderValue={currentValue}
          statName={prop}
          maxAvailablePoints={currentValue + pointsLeft}
        />)
    }

    return elements
  }

  return (<Stack>
    <Heading>BRAVES</Heading>
    <Text>Points Remaining: {pointsLeft}</Text>

    {renderBravesSliders()}
  </Stack>)
}

function BravesSlider(params: { setBravesValue: (statName: string, value: number) => void, sliderValue: number, statName: string, maxAvailablePoints: number }) {
  //const [sliderValue, setSliderValue] = useState(50)
  const { maxAvailablePoints, setBravesValue: setSliderValue, sliderValue, statName } = params;
  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }
  return (<Box pt={6} pb={2}>
    <Text>
      {statName}
    </Text>

    <Slider
      defaultValue={50}
      min={10}
      max={100}
      step={5}
      value={sliderValue}
      onChange={(val) => {
        if (val > maxAvailablePoints) {
          val = maxAvailablePoints;
        }
        setSliderValue(statName, val)
      }}>
      <SliderMark value={25} {...labelStyles}>
        25
      </SliderMark>
      <SliderMark value={50} {...labelStyles}>
        50
      </SliderMark>
      <SliderMark value={75} {...labelStyles}>
        75
      </SliderMark>
      <SliderMark
        value={sliderValue}
        textAlign='center'
        bg='blue.500'
        color='white'
        mt='-10'
        ml='-5'
        w='12'
      >
        {sliderValue}
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  </Box>)
}

export default BravesSelector;