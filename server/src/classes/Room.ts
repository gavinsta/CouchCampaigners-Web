
import { ConnectionStatus, ResultStatus } from "../types/enums/Status";
import GameLog from "../types/GameLog";
import Result from "../types/Result";
import { GameContext } from "../types/GameContext"
import Host from "./Host";
import Player from "./Player";
import WebController from "./WebController";

import { sendWSMessage } from "../utils/websocket_functions";
import { WebControllerMessageType, WSMessage, WSMessageType } from "../types/WSMessage";
import WebSocket from "ws";
import ExtWebSocket from "./ExtWebSocket";
import { Choice } from "../types/Choice";
const TIMEOUT_DURATION = 30 * 1000; //30 seconds 
//TODO change this it's just for testing

interface RoomStatus {
  general: "OPEN" | "CLOSED"
  hostStatus: ConnectionStatus,
  timeLeft?: number,
}

interface RoomSettings {
  messageSettings: {
    saveChatMessages: boolean,
    saveSystemMessages: boolean,
    saveLogMessages: boolean,
  },
  /**private, public, etc.*/
  privacySettings: "PUBLIC" | "PRIVATE"
}

/** Room objects hold controllerKeys, controllers, hosts, players, etc 
 * and supporting functions
 */
class Room {
  /**The room code of the room */
  roomCode: string
  /** The status of the room. Should include all things we might need statuses on */
  status: RoomStatus = {
    general: "OPEN",
    hostStatus: ConnectionStatus.DISCONNECTED
  };

  /** Host object */
  host: Host | null;

  /**Array of players */
  players: Player[];

  /**Map of controllers to player objects*/
  controllers: Map<WebController, Player | null>;

  /**Settings object for the Room Object */
  settings: RoomSettings = {
    //TODO implement settings
    messageSettings: {
      saveChatMessages: true,
      saveSystemMessages: true,
      saveLogMessages: true,
    },
    privacySettings: "PUBLIC"
  };
  /** Chat and message log of the room */
  log: GameLog[];

  //TODO a game context object
  gameContext: GameContext | null = null;

  /**Map of players to their choice contexts*/
  choiceContexts;

  /**Reference to timeout if room is scheduled to close */
  roomCloseTimeout: NodeJS.Timeout | null = null;

  roomCloseIntervalTimer: NodeJS.Timer | null = null;

  /**
   * Construct a new room
   * @param {string} roomCode 
   * @param {Array<String>} controllerKeys array of controller keys
   */
  constructor(roomCode: string, controllerKeys: string[], host: Host) {
    this.roomCode = roomCode;
    this.host = host;
    host.room = this;
    this.players = [];
    if (controllerKeys && controllerKeys.length > 0) {
      var allControllers = controllerKeys.map(key => new WebController(key));
      this.controllers = new Map(allControllers.map(x => [x, null]))
      this.choiceContexts = new Map(controllerKeys.map(x => [x, '']),);
    }
    else {
      this.controllers = new Map();
      this.choiceContexts = new Map();
    }
    //start with empty log
    this.log = [];

    //send a confirmation message to the host
    const text = `Added new room: ${roomCode}.`;
    console.log(text);

    host.send({
      type: WSMessageType.ROOM,
      header: 'new_room',
      sender: `room`,
      title: 'New Room Created!',
      text: text,
      data: {
        roomCode: roomCode,
        status: 'open',
        controllerKeys: controllerKeys,
        text: this.printStats()
      }
    })
  }

  checkHostStatus() {
    if (this.host && this.host.ws.readyState === WebSocket.OPEN) {
      this.status.hostStatus = ConnectionStatus.CONNECTED;
    }
    else {
      this.status.hostStatus = ConnectionStatus.DISCONNECTED;
    }
  }

  /**
   * Send a String message to be displayed in the room's chat/log to everyone
   * @param {string} text string message to be sent to everyone
   */
  broadcast(text: string) {
    this.newLog({
      type: "broadcast",
      sender: 'room',
      text: text,
    });
    console.log(text)
  }

  /**
   * Returns an integer by default of all the players in the game. 
   */
  countActivePlayers() {
    //TODO some logic for checking activity
    return this.players.length;
  }

  /**
   * Join a room that is already open with the current player's name and websocket
   * @param ws 
   * @param playerName 
   * @returns 
   */
  joinRoom(ws: ExtWebSocket, playerName: string) {
    console.log(`${playerName} joining room ${this.roomCode} with ID: ${ws.id}`);
    const existingPlayer = this.findPlayerByName(playerName);

    if (existingPlayer && existingPlayer.ws.readyState === WebSocket.OPEN) {
      //player exists and is connected...
      const errorText = `"${playerName}" already exists in room ${this.roomCode}. Try a different name.\nClosing Connection.`;
      sendWSMessage(ws, { type: WSMessageType.ROOM, header: "join_reject", sender: "room", title: "Player Already Exists", text: errorText });
      ws.close();
      return;
    }
    //create a new player!
    const player = new Player(ws, playerName, this);
    this.players.push(player)

    const text = `${playerName} joined room ${this.roomCode}.`;
    player.send(
      {
        type: WebControllerMessageType.ROOM,
        header: "join_success",
        sender: "room",
        textData: {
          title: `Successfully Joined ${this.roomCode}`,
        },
        status: ResultStatus.SUCCESS,
        data: {
          "roomCode": this.roomCode,
          "currentPlayers": this.countActivePlayers(),
          "playerName": playerName
        }
      }
    )
    this.broadcast(text);

  }
  /**
  * Use a WebSocket id to return a player object in the room.
  * @param {string} id the generated uuid.v4
  * @returns {Player} the player object
  */
  findPlayerById(id: string) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        return this.players[i];
      }
    }
    return null;
  }
  /**
   * Use a player's name to return a player object in the room
   * @param {string} name the player name
   * @returns the player object
   */
  findPlayerByName(name: string) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].name == name) {
        return this.players[i];
      }
    }
    return null;
  }

  getAllControllerKeys() {
    let keys: string[] = [];
    for (var controller of this.controllers.keys()) {
      keys.push(controller.key);
    }
    return keys;
  }

  getPlayerControllerKey(name: string) {
    const player = this.findPlayerByName(name);
    if (player && player.controller) {
      return player.controller.key
    }
    return null;
  }

  /**
  * Check if the room contains a player with this name already
  * @param {String} name Player's playerName attribute
  * @returns if a player with this name already exists
  */
  checkForPlayerName(name: string): boolean {
    if (this.players.length < 1) {
      return false;
    }
    for (var i = 0, len = this.players.length; i < len; i++) {
      if (this.players[i].name === name) {
        //player name is in room
        return true;
      }
    };
    return false;
  }

  /**
   * Remove a player from the room by name
   * @param {String} playerName 
   */
  removePlayerByName(playerName: string) {
    if (this.players.length > 0) {
      for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].name == playerName) {
          this.players.splice(i, 1);
          i--;
        }
      }
    }
  }

  /**
   * Remove a player from the room by name
   * @param {String} id 
   */
  removePlayerByID(id: string) {
    if (this.players.length > 0) {
      for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id == id) {
          this.players.splice(i, 1);
          i--;
        }
      }
    }
  }

  getController(controllerKey: string): WebController | null {
    for (var controller of this.controllers.keys()) {
      if (controller.key === controllerKey) return controller;
    }
    return null;
  }

  /**
   * check if the controller key exists and whether or not it is 'connected'
   * @param {String} controllerKey the controller key
   * @returns 
   */
  checkControllerAvailability(controllerKey: string) {
    //check that this is a key already added into the room
    for (var controller of this.controllers.keys()) {
      if (controller.key == controllerKey) {
        //disconnected controller ready to use
        if (controller.status === ConnectionStatus.DISCONNECTED && !this.controllers.get(controller)) return true
      }
    }
    //console.log(`Room ${this.roomCode} does not have controller with key: ${controllerKey}`);
    return false;
  }
  /**
   * print all the controller keys of this room separated by new lines
   * @returns a string of all the controller keys.
   */
  printControllerKeys() {
    let text = '';
    for (const key of this.controllers.keys()) {
      text += key + '\n';
    }
    return text;
  }
  /**
   * print all the controller keys of this room separated by new lines
   * @returns 
   */
  printControllerPairs() {
    let text = '';
    for (const pair of this.controllers) {
      if (pair[1]) {
        text += `${pair[0].key} => ${pair[1].name} \n`;
      }
    }
    return text;
  }
  printPlayerNames() {
    let text = '';
    for (var i = 0; i < this.players.length; i++) {
      text += this.players[i].name + '\n';
    }
    return text;
  }
  /**
   * Returns the current stats of the room
   * @returns 
   */
  printStats() {
    const text = `Room Code: ${this.roomCode}\n`
      + `Players:\n${this.printPlayerNames()}`
      + `Controller Keys:\n${this.printControllerPairs()}`
      + `Log length: ${this.log.length}`;
    return text;
  }
  getStats() {
    const data = {
      roomCode: this.roomCode,
      players: [this.players],
      controllers: this.controllers,
    }
  }

  /**
  * A new host has connected as Host of this session
  * @param {Host} host
  */
  //TODO this method should act to connect a NEW host to the room (replacing the previous host, if any)
  reconnectHost(host: Host) {
    this.host = host;
    host.room = this;
    const connectMessage = `Host reconnected to room ${this.roomCode}`;
    this.broadcast(connectMessage);
    //console.log(connectMessage);
    this.roomTimeOut(false);
    host.send({
      type: WSMessageType.ROOM,
      header: 'new_room',
      sender: `room`,
      title: 'New Room Created!',
      text: `Now hosting room: ${this.roomCode}.`,
      data: {
        roomCode: this.roomCode,
        status: 'open',
        controllerKeys: this.getAllControllerKeys(),
        text: this.printStats()
      }
    })
  }

  /**
   * Disconnects the current host of this room.
   */
  //TODO create disconnection EVENT
  disconnectHost() {
    //this.host.disconnect();
    const disconnectMessage = `Host disconnected from room ${this.roomCode}. Timeout countdown begun: `;
    this.host = null;
    this.checkHostStatus();
    this.broadcast(disconnectMessage);
    //console.log(disconnectMessage);
    this.roomTimeOut(true);
    this.broadcast(this.printStats());
    //console.log(this.printStats());
  }

  /**
   * Closes the room after time has passed (designated by {timeOutDuration}). Can be interrupted by providing "false" as the parameter
   * @param {Boolean} start if true: starts the timer, if false: stops it.
   */
  roomTimeOut(start: boolean) {
    if (start) {
      //if we already started a timer, reset it
      if (this.roomCloseTimeout) {
        clearTimeout(this.roomCloseTimeout);
      }
      const now = new Date().getTime();
      const endTime = new Date(now + TIMEOUT_DURATION);

      this.broadcast(`Room ${this.roomCode} will close in ${TIMEOUT_DURATION / 1000} seconds.`)

      this.roomCloseIntervalTimer = setInterval(() => {
        //while current time is less than end time (timeout duration) keep counting down and print the remaining time to the console
        const now = new Date().getTime();
        this.status.timeLeft = endTime.getTime() - now;
        if (Math.floor(this.status.timeLeft / 1000) % 5 === 0 || Math.floor(this.status.timeLeft / 1000) <= 10) {
          this.broadcast(`Room ${this.roomCode} will close in ${Math.floor(this.status.timeLeft / 1000)} seconds.`)
        }
      }, 1000);

      this.roomCloseTimeout = setTimeout(() => {
        this.status.general = "CLOSED";
        //console.log(`Room ${this.roomCode} has been closed due to inactivity.`)
        this.broadcast(`Room ${this.roomCode} has been closed due to inactivity.`)
        if (this.roomCloseIntervalTimer) {
          clearInterval(this.roomCloseIntervalTimer);
        }
      }, TIMEOUT_DURATION);
    }
    else if (this.roomCloseTimeout) {
      //if we started a timer, now we can stop it.
      clearTimeout(this.roomCloseTimeout);
      if (this.roomCloseIntervalTimer) clearInterval(this.roomCloseIntervalTimer);
      this.roomCloseTimeout = null;
    }
  }

  /**
   * Connect (really we are just saving the association) a Websocket ID to a controller.
   * @param {String} id the WebSocket ID assigned on connection
   * @param {String} key the controller key you are trying to connect to
   * @returns a result object which holds status and text
   */
  connectController(player: Player, key: string): Result {
    const result: Result = { status: ResultStatus.ERROR, text: "Cause unknown" }
    //console.log(`Room ${this.roomCode}: Connecting ${player.playerName} to controller ${controllerKey}...`)

    if (player.controller) {
      result.text = `${player.name} already has a controller: ${player.controller.key}!`;
      return result;
    }
    if (!this.checkControllerAvailability(key)) {
      result.text = `Controller ${key} does not exist or is already in use.`
      return result;
    }

    const controller = this.getController(key)
    if (controller) {
      player.controller = controller
      controller.status = ConnectionStatus.CONNECTED
      this.controllers.set(controller, player)
      result.status = ResultStatus.SUCCESS;
      result.text = `Room ${this.roomCode}: ${player.name} connected to controller: ${key}`;
      this.updatePlayerGameContext(player)
      return result;
    }

    return result
  }
  /**
   * Disconnects a WebSocket ID's player from the web controller
   * @param {String} id WebSocket ID of the player controller we are disconnecting
   */
  disconnectController(player: Player): Result {
    if (player && player.controller) {
      const controller = player.controller;
      controller.status = ConnectionStatus.DISCONNECTED
      this.controllers.set(controller, null);
      player.controller = null;

      const text = `${player.name} disconnected from ${controller.key}`;
      this.broadcast(text);
      return { status: ResultStatus.SUCCESS, text: text }
    }
    else return { status: ResultStatus.ERROR, text: `Nothing to disconnect ${player?.name} from` }
  }
  /**
   * Send a log to the room
   * @param {object} fullMessage text message
   */
  newLog(logMessageParams: { type: string, sender: string, text: string, data?: any }) {
    //process data to return to chat
    const { type, sender, text } = logMessageParams;
    console.log(sender == 'host' ? `[HOST]: ${text}` : `[${sender}]: ${text}`);
    //NOTE we update time to be when the SERVER processed this message. 
    //The server acts as the unifying reference source on timing
    this.log.push({
      sender: sender,
      type: type.toUpperCase(),
      text: text,
      time: new Date()
    });

    if (this.host && this.host.status == ConnectionStatus.CONNECTED) {
      this.host.send({
        type: WSMessageType.FULL_LOG,
        header: "full_log",
        sender: 'server',
        data: this.log
      })
    }
    for (var i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      player.send({
        type: WebControllerMessageType.FULL_LOG,
        header: "full_log",
        sender: 'server',
        data: this.log
      })
    }
  }
  /**
   * Updates the player choice contexts for all players
   */
  updateAllPlayerChoiceContexts() {
    this.players.forEach((player) => {
      if (player.controller) {
        this.updatePlayerChoiceContext(player)
      }
    });
  }
  /**
   * Updates the player choice context for a specific player
   * @param {Player} player 
   */
  updatePlayerChoiceContext(player: Player) {
    //console.log(`${player.playerName} has key: ${player.controller.key}`)
    if (player.controller) {
      const context = this.choiceContexts.get(player.controller.key);

      player.send({
        type: WebControllerMessageType.CHOICE_CONTEXT,
        header: "choice_context",
        sender: "room",
        data: context
      })

      console.log(`CHOICE CONTEXT SENT:`)
      console.log(context)
    }
  }

  updateAllPlayerGameContext() {
    if (this.gameContext != null) {
      for (var i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        this.updatePlayerGameContext(player);
      }
    }
  }


  updatePlayerGameContext(player: Player) {
    if (this.gameContext != null) {
      player.send({
        type: WebControllerMessageType.GAME_CONTEXT,
        header: "game_context",
        sender: "room",
        data: this.gameContext
      })
    }
    console.log(`Sent game_context to ${player.name}. Data:${this.gameContext}`)
  }


  /**
   * Parse the GameContext data from a WebSocket message
   * @param {Object} incomingMsg 
   */
  parseGameContext(incomingMsg: WSMessage) {
    console.log(`updating game context`)
    if (!incomingMsg.data) {
      console.log(`No game_context recieved!`)
      return;
    }

    this.gameContext = JSON.parse(incomingMsg.data);
    console.log("**GAME CONTEXT**")
    console.log(this.gameContext)
    this.updateAllPlayerGameContext();

  }

  /** Receive a player choice context and then send it to that player */
  parsePlayerChoiceContext(incomingMsg: WSMessage) {
    if (!incomingMsg.data) {
      console.log(`Received empty ChoiceContext message`)
      return;
    }
    const choiceContext = JSON.parse(incomingMsg.data);
    console.log("**RECEVING CHOICE CONTEXT OBJECT**")
    console.log(choiceContext)
    const controllerKey = choiceContext.controllerKey;
    if (!controllerKey) {
      let text = `Received a choice context from ${incomingMsg.sender} with no controller key.`
      console.warn(text);
      return;
    }

    this.choiceContexts.set(controllerKey, choiceContext);
    const controller = this.getController(controllerKey)

    if (!controller) {
      return;
    }
    const player = this.controllers.get(controller)
    if (controller && player) {
      this.updatePlayerChoiceContext(player);
    }


  }

  parseSelectedChoice(msg: any, player: Player) {
    const { header, data } = msg;
    if (header === "choice") {
      if (!data) {
        //send the player an error response.
        player.send({
          type: WebControllerMessageType.ROOM,
          header: "missing_data",
          sender: "room",
          status: ResultStatus.ERROR,
          textData: {
            title: "Error: Missing Data",
            text: 'Could not find data for submitted choice'
          }
        })
      }
      else {
        const choice = data;
        console.log(`Received Choice!`)
        //console.log(choice);
        this.updatePlayerSelectedChoice(player, choice)
      }
    }

  }
  parseControllerInput(incomingMsg: any, player: Player) {
    const { header, data, inputData, controllerKey } = incomingMsg
    if (!player.controller) {
      console.log(`*ERROR* Recieved Controller Input from ${player.name}, but player does not have a controller assigned!`);
      return;
    }

    if (header === "button") {
      if (!inputData) {
        player.send({
          type: WebControllerMessageType.ROOM,
          header: "missing_data",
          sender: "room",
          status: ResultStatus.ERROR,
          textData: {
            title: "Error: Missing Data",
            text: 'Could not find data for simple input'
          }
        });
        return;
      }
      var newChoice: Choice = {
        choiceContext: inputData.fieldName,
        choiceID: inputData.value
      }
      this.updatePlayerSelectedChoice(player, newChoice);
    }
  }

  /**Parse game data requests from the player (requesting current choices, game context, etc.) */
  parsePlayerUpdateRequest(incomingMsg: WSMessage, player: Player) {

    switch (incomingMsg.header) {
      case "get_choice_context":
        //NOTE when we update game_context, we will automatiicaly send choice context as well
        this.updatePlayerChoiceContext(player);
        break;
      case "get_game_context":
        this.updatePlayerGameContext(player);
        break;
    }
  }
  /**This method handles managing a Player connecting/disconnecting to a controller on this room */
  parsePlayerControllerManagment(incomingMsg: WSMessage, player: Player) {
    let data;
    if (incomingMsg.sender == "host" && incomingMsg.data) {
      data = JSON.parse(incomingMsg.data);
    }
    else {
      data = incomingMsg.data;
    }

    //NOTE Connecting to controller
    if (incomingMsg.header == "controller_connect") {
      if (!this.host) {
        player.send({
          header: "controller_connect",
          sender: "room",
          type: WebControllerMessageType.CONTROLLER,
          status: ResultStatus.ERROR,
          textData: {
            title: "Error connecting to controller",
            text: "Can't connect right now because there's no game running"
          }
        })
        return;
      }
      if (!data) {
        player.send({
          type: WebControllerMessageType.CONTROLLER,
          status: ResultStatus.ERROR,
          sender: "room",
          header: "controller_connect",
          textData: {
            title: "Missing Data",
            text: "No data attached to connect request!",
          }
        })
        return;
      }
      const controllerKey = data.key;
      if (!controllerKey) {
        player.send({
          header: "controller_connect",
          sender: "room",
          type: WebControllerMessageType.CONTROLLER,
          status: ResultStatus.ERROR,
          textData: {
            title: "Missing Data",
            text: "No Controller Key attached!"
          }
        })
        return;
      }

      const connect_result = this.connectController(player, controllerKey)
      console.log(`${connect_result.status}: ${connect_result.text}`)
      //on success!


      //send new stuff to the client and host
      if (connect_result.status === ResultStatus.SUCCESS) {
        const successMessage = {
          type: WebControllerMessageType.CONTROLLER,
          header: "controller_connect",
          sender: "room",
          status: "success",
          data: {
            key: controllerKey,
            playerName: player.name,
            status: "CONNECTED"
          },
          textData: {
            title: "Controller Connection Status",
            text: connect_result.text,
          }
        }
        player.send(successMessage);

        //console.log(successMessage)
        this.updatePlayerGameContext(player)
        this.updatePlayerChoiceContext(player);

        //finally send a new controller connected message back to the host 
        //NOTE alternative connection message is "controller_connection:reconnect", I guess?
        this.host.send({
          header: "controller_connection:new",
          type: WSMessageType.ROOM,
          sender: "room",
          controllerKey: controllerKey,
          data: {
            playerName: player.name,
            controllerKey: controllerKey
          }
        });

        this.broadcast(`${player.name} using Controller ${controllerKey}`)
      }
    }
    if (incomingMsg.header == "controller_disconnect") {
      let disconnect_result = this.disconnectController(player);

      this.host?.sendDisconnectController(player, incomingMsg.controllerKey!)
    }
  }
  parsePlayerRoomCommand(incomingMsg: WSMessage, player: Player) {

    let data;
    if (incomingMsg.sender == "host" && incomingMsg.data) {
      data = JSON.parse(incomingMsg.data);
    }
    else {
      data = incomingMsg.data;
    }
  }

  updatePlayerSelectedChoice(player: Player, choice: Choice) {
    //always cache last choice
    this.currentSelectedChoices.set(player, choice);

    if (!this.host) {
      console.error(`No host connected. Waiting to send choices.`)
      return;
    }

    if (this.gameContext?.mode === "BATCHED") {
      //run a quick check to see if we still need more player choices
      if (this.currentSelectedChoices.size == this.countActivePlayers()) {
        //send the choices off!
        //TODO we will eventually put some logic here in case only certain players at a time can make a decision/choice
        this.sendSelectedChoices();
      }
    }
    else if (this.gameContext?.mode === "INSTANT") {

      this.host.send({
        type: WSMessageType.COMMAND,
        controllerKey: player.controller?.key,
        header: "single_choice",
        sender: "room",
        data: choice
      });
    }
  }

  sendSelectedChoices() {
    if (!this.host) {
      console.error(`No host connected. Waiting to send choices.`)
      return;
    }
    let choices: Choice[] = [];
    this.currentSelectedChoices.forEach((val) => {
      choices.push(val);
    })
    const bundledChoices = {
      prompt: 'some_prompt',
      choices: choices,
    }
    console.log(bundledChoices)

    this.host.send({
      type: WSMessageType.COMMAND,
      header: "choice_bundle",
      sender: "room",
      data: bundledChoices
    });

  }

  currentSelectedChoices = new Map<Player, Choice>();
}

export default Room