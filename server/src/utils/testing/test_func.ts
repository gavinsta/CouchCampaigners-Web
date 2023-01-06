import Room from "../../classes/Room";

export function addTestMessages(room: Room) {
  for (var i = 0; i < 5; i++) {
    const testChat = {
      type: 'CHAT',
      sender: i % 2 == 0 ? 'A' : 'B',
      text: `testing chat #${i + 1}`,
      header: "testing",
      time: new Date()
    }
    const testLog = {
      type: 'CHAT',
      sender: i % 2 == 0 ? 'B' : 'A',
      text: `testing log #${i + 1}`,
      header: "testing",
      time: new Date(),
    }
    room.log.push(testChat);
    room.log.push(testLog);
  }
}