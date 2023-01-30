import { Input } from "@chakra-ui/react"
function InputText({ isActive = true, label, value, setValue }: { isActive: boolean, label: string, value: string, setValue: (val: string) => void }) {
  return (
    <Input
      //width={"100%"}
      bg="white"
      //w={'20%'}
      placeholder={label}
      value={value}
      onChange={e => {
        if (isActive) setValue(e.target.value.toUpperCase())
      }}
      disabled={!isActive} />
  )
}

export default InputText;