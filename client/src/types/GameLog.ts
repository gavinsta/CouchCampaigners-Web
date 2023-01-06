type GameLog = {
  type: string,
  sender: string,
  header: string,
  text?: string,
  data?: string,
  time: Date,
}

export default GameLog