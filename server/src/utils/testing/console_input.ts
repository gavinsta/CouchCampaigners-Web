import { createInterface } from "readline";
import EventEmitter from "events";
import { colorText } from "./color_console";
import {
  createTestRoom,
  findRoomFromCode,
  listAllRoomCodes,
} from "../room_functions";
import Room, { TIMEOUT_DURATION } from "../../classes/Room";
const consoleInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
});
// console.log("input is a TTY?", process.stdin.isTTY);
const readLineAsync = (msg: string) => {
  return new Promise<string>((resolve) => {
    consoleInterface.question(msg, (userRes) => {
      resolve(userRes);
    });
  });
};

export const consoleInputEvent = new EventEmitter();
// consoleInputEvent.on("complete", (command: string, ...args: string[]) => {
//   console.log("Your command was: " + command + " and " + args[0]);
// });
const getConsoleInput = async () => {
  const userRes = await readLineAsync(consoleInterface.getPrompt());
  // inputCommandReader.close();
  const breakpoint = /\s+/;
  const commandArgs = userRes.trim().split(breakpoint);
  consoleInputEvent.emit("input", commandArgs[0], ...commandArgs.slice(1));
};

let selectedRoom: Room | null = null;
consoleInputEvent.on("input", async (input: string, ...args: string[]) => {
  if (selectedRoom != null) {
    consoleInterface.prompt();
    switch (input) {
      case "help":
      case "-h":
        consoleInterface.setPrompt("");
        consoleInterface.write(`Commands:
      ${colorText("close", "cyan")} [${colorText(
          "TIME_OUT=true",
          "yellow"
        )}]: close the selected room. If ${colorText(
          "[TIME_OUT]",
          "yellow"
        )} is true, the room will close after the timeout duration.
      ${colorText("deselect", "cyan")}: deselect the room.

      `);
        consoleInterface.setPrompt(`[${selectedRoom.roomCode}]> `);

        break;
      case "close":
        if (args[0]) {
          consoleInterface.write(
            `Closing room after timeout: ${TIMEOUT_DURATION}\n`
          );

          selectedRoom.roomTimeOut(true, true);
        } else {
          consoleInterface.write(`Closing room\n`);
          selectedRoom.closeRoom();
        }
      case "deselect":
        selectedRoom = null;
        consoleInterface.setPrompt(`> `);
        break;
      default:
        consoleInterface.write("Unrecognized input\n");
        break;
    }
    consoleInputEvent.emit("finish");
    return;
  }

  switch (input) {
    case "help":
    case "-h":
      consoleInterface.write(`Commands:
      create room [ROOM_CODE] [CONTROLLER_KEYS_LIST]
      select [ROOM_CODE]
      `);

      break;
    case "create":
      if (args.length == 0) {
        argumentException(1, 0);
        break;
      }
      if (args[0] == "room") {
        createTestRoom(
          args[1] || "TESTER",
          args.slice(1) || ["TEST0", "TEST1"]
        );
      } else {
        consoleInterface.write(
          `Unrecognized create command ${colorText(args[0], "red")}\n`
        );
      }
      break;
    case "close":
      if (args.length == 0) {
        argumentException(1, 0);
        break;
      }
      var room = findRoomFromCode(args[0]);
      if (room) {
        consoleInterface.write(`Closing room\n`);
        room.closeRoom();
      } else {
        roomNotFound(args[0]);
      }
    case "info":
      var room = findRoomFromCode(args[0]);
      if (room) {
        console.log(room.printStats());
      }
      break;
    case "list":
      console.log("List of rooms:");
      console.log(listAllRoomCodes().join("\n"));
      break;
    case "select":
      if (args.length == 0) {
        argumentException(1, 0);
        break;
      }
      selectedRoom = findRoomFromCode(args[0]);
      if (selectedRoom != null) {
        consoleInterface.setPrompt(`[${selectedRoom.roomCode}]> `);
      } else {
        roomNotFound(args[0]);
      }
      break;
    default:
      console.log(
        `Unrecognized input ${input} or ${args.join(
          ", "
        )} Type "-h" or "help" to see what commands are available`
      );
  }

  consoleInputEvent.emit("finish");
});

consoleInputEvent.on("finish", () => {
  getConsoleInput();
});

function roomNotFound(roomCode: string) {
  consoleInterface.write(`Room [${colorText(roomCode, "red")}] not found\n`);
}

function argumentException(expected: number, actual: number) {
  consoleInterface.write(
    `Invalid arguments. ${"Expected: " + expected.toString()} ${
      "Received: " + actual.toString()
    }\n`
  );
}
export default getConsoleInput;
