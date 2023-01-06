
import { ConnectionStatus, Status } from "../types/enums/Status";
import GameLog from "../types/GameLog";
import Result from "../types/Result";
import Host from "./Host";
import Player from "./Player";
import WebController from "./WebController";

import { sendWSMessage } from "../utils/websocket_functions";
import { WSMessage, WSMessageType } from "../types/WSMessage";
const TIMEOUT_DURATION = 3 * 60
/** Room objects hold controllerKeys, controllers, hosts, players, etc 
 * and supporting functions
 */
class Room {
  /**The room code of the room */
  roomCode: string
  /** The status of the room. Should include all things we might need statuses on */
  status = {
    general: "open",
    input: "pending",
  };

  /** Host object */
  host: Host;

  /**Array of players */
  players: Player[];

  /**Map of controllers to player objects*/
  controllers: WebController[];

  /**Settings object for the Room Object */
  settings = {
    //TODO implement settings
    messageSettings: {
      saveChatMessages: true,
      saveSystemMessages: true,
      saveLogMessages: true,
    },
    /**private, public, etc.*/
    privacySettings: "public"
  };
  /** Chat and message log of the room */
  log: GameLog[];

  //TODO a game context object
  gameContext = {};

  /**Map of players to their choice contexts*/
  choiceContexts;

  /**Reference to timeout if room is scheduled to close */
  timer: NodeJS.Timeout | null = null;

  /**
   * Construct a new room
   * @param {string} roomCode 
   * @param {Array<String>} controllerKeys array of controller keys
   */
  constructor(roomCode: string, controllerKeys: string[], host: Host) {
    this.roomCode = roomCode;
    this.host = host;
    this.players = [];
    if (controllerKeys && controllerKeys.length > 0) {
      this.controllers = controllerKeys.map(key => new WebController(key));
      this.choiceContexts = new Map(controllerKeys.map(x => [x, '']),);
    }
    else {
      this.controllers = [];
      this.choiceContexts = new Map();
    }
    //start with empty log
    this.log = [];

  }

  /**
   * Send a String message to be displayed in the room's chat/log to everyone
   * @param {string} text string message to be sent to everyone
   */
  broadcast(text: string) {
    this.newLog({
      type: WSMessageType.SERVER,
      sender: 'server',
      header: 'broadcast',
      text: text,
      time: new Date()
    });
  }

  /**
   * Returns an integer by default of all the players in the game. 
   * @param {bool} names If names = true, will isntead return
   */
  countActivePlayers(names = false) {
    if (names) {

    }
    else return this.players.length;
  }
  /**
   * Adds a player to the room
   * @param player 
   */
  addPlayer(player: Player) {
    if (player.room) {
      console.error(`${player.name} was already in Room: ${player.room.roomCode}!`)

      player.room = this;
    }
    console.log(`${player.name} joining room ${this.roomCode} with ID: ${player.id}`);
    this.players.push(player)
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
    for (var controller of this.controllers) {
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
    for (var controller of this.controllers) {
      if (controller.key == controllerKey) {
        //disconnected controlle ready to use
        if (controller.status === ConnectionStatus.DISCONNECTED) return true
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
    for (const controller of this.controllers) {
      if (controller.player) {
        text += `${controller.key} => ${controller.player.name} \n`;
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
  connectNewHost(host: Host) {
    this.host.disconnect()
    this.host = host;
    const connectMessage = `Host connected to room ${this.roomCode}`;
    this.broadcast(connectMessage);
    console.log(connectMessage);
    this.roomTimeOut(false);
  }

  /**
   * Disconnects the current host of this room.
   */
  disconnectHost() {
    this.host.disconnect();
    const disconnectMessage = `Host disconnected from room ${this.roomCode}. Timeout countdown begun: `;

    this.broadcast(disconnectMessage);
    console.log(disconnectMessage);
    this.roomTimeOut(true);
  }

  /**
   * Closes the room after time has passed (designated by {timeOutDuration}). Can be interrupted by providing "false" as the parameter
   * @param {Boolean} start if true: starts the timer, if false: stops it.
   */
  roomTimeOut(start: boolean) {
    if (start && !this.timer) {
      this.timer = setTimeout(() => {
        this.status.general = "closed";
      }, TIMEOUT_DURATION);
    }
    else if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Connect (really we are just saving the association) a Websocket ID to a controller.
   * @param {String} id the WebSocket ID assigned on connection
   * @param {String} key the controller key you are trying to connect to
   * @returns a result object which holds status and text
   */
  connectController(player: Player, key: string): Result {
    const result: Result = { status: Status.ERROR, text: "Cause unknown" }
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
      controller.connectPlayer(player);
      result.status = Status.SUCCESS;
      result.text = `Room ${this.roomCode}: ${player.name} connected to controller: ${key}`;
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
      controller.disconnectPlayer();
      //player.unassignController();
      const text = `${player.name} disconnected from ${controller.key}`;
      this.broadcast(text);
      return { status: Status.SUCCESS, text: text }
    }
    else return { status: Status.ERROR, text: `Nothing to disconnect ${player?.name} from` }
  }
  /**
   * Send a log to the room
   * @param {object} fullMessage text message
   */
  newLog(fullMessage: WSMessage) {
    //process data to return to chat
    const { sender, text } = fullMessage;
    //console.log(sender == 'host' ? `[HOST]: ${text}` : `[${sender}]: ${text}`);
    fullMessage.time = new Date();
    this.log.push(fullMessage);
    const fullLogMessage = {
      type: WSMessageType.FULL_LOG,
      header: "full_log",
      sender: 'server',
      time: new Date()
    }
    if (this.host.status == ConnectionStatus.CONNECTED) {
      sendWSMessage(this.host.ws, fullLogMessage, this.log)
    }
    for (var i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      sendWSMessage(player.ws, fullLogMessage, this.log);
    }
  }
  /**
   * Parse the GameContext data from a WebSocket message
   * @param {Object} incomingMsg 
   */
  parseGameContext(incomingMsg: WSMessage) {
    if (incomingMsg.data) {
      this.gameContext = JSON.parse(incomingMsg.data);
      this.updateGameContext();
    }
  }

  updateGameContext() {
    if (this.gameContext != null) {
      for (var i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        const message = {
          type: WSMessageType.UPDATE,
          header: "game_context",
          sender: "server",
          time: new Date(),
        }
        sendWSMessage(player.ws, message, this.gameContext);
      }
    }
  }
  /** Receive a player choice context and then send it to that player */
  parsePlayerChoiceContext(incomingMsg: WSMessage) {
    if (!incomingMsg.data) {
      console.log(`Received empty ChoiceContext message`)
      return;
    }
    const choiceContext = JSON.parse(incomingMsg.data);
    console.log(choiceContext)
    const controllerKey = choiceContext.controllerKey;
    if (!controllerKey) {
      let text = `Received a choice context from ${incomingMsg.sender} with no controller key.`
      console.warn(text);
      return;
    }
    else {
      this.choiceContexts.set(controllerKey, choiceContext);
      const controller = this.getController(controllerKey)
      if (controller && controller.player) {
        const player = controller.player;
        const message = {
          type: WSMessageType.UPDATE,
          header: "choice_context",
          sender: "server",
          time: new Date()
        }
        sendWSMessage(player.ws, message, choiceContext);
      }
    }
  }
  /**
   * Updates the player choice contexts for all players
   */
  updateAllPlayerChoiceContexts() {
    const message = {
      type: WSMessageType.UPDATE,
      header: "choice_context",
      sender: "server",
      time: new Date()
    }
    this.controllers.forEach((controller) => {
      const context = this.choiceContexts.get(controller.key);
      if (controller.player)
        sendWSMessage(controller.player.ws, message, context);
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
      const message = {
        type: WSMessageType.UPDATE,
        header: "choice_context",
        sender: "server",
        time: new Date()
      }
      sendWSMessage(player.ws, message, context);
    }
  }

  parseClientCommand(incomingMsg: WSMessage, player: Player) {
    const { header, data } = incomingMsg
    const response: WSMessage = {
      type: WSMessageType.SERVER,
      header: "",
      sender: "server",
      time: new Date(),
    }
    switch (header) {
      case "choice":
        if (!data) {
          response.header = "error_parsing_command";
          response.status = Status.ERROR;
          response.text = 'Could not find data for submitted choice'
          break;
        }
        else {
          const choice = JSON.parse(data);
          console.log(`Received Choice!`)
          //console.log(choice);
          this.updatePlayerSelectedChoice(player, choice)
        }
        break;
    }

    sendWSMessage(player.ws, response);
  }


  parseClientRequest(incomingMsg: WSMessage, player: Player) {
    const reply: WSMessage = {
      type: WSMessageType.UPDATE,
      header: "",
      sender: "server",
      time: new Date(),
    }
    let data = {};
    let result: Result = { status: Status.ERROR }
    switch (incomingMsg.header) {
      case "game_context":
        reply.header = incomingMsg.header;
        data = this.gameContext;

        //NOTE when we update game_context, we will automatiicaly send choice context as well
        this.updatePlayerChoiceContext(player);
        break;

      case "controller_connection":
        const controllerKey = incomingMsg?.controllerKey;
        if (!controllerKey) {
          result.status = Status.ERROR;
          result.text = "No controller key attached to controller connect request";
          break;
        }

        result = this.connectController(player, controllerKey)
        console.log(`${result.status}: ${result.text}`)
        reply.header = incomingMsg.header;
        reply.status = result.status;
        reply.text = result.text;
        sendWSMessage(player.ws, reply);
        this.updatePlayerChoiceContext(player);
        break;
      case "controller_disconnection":
        result = this.disconnectController(player);
        reply.status = result.status;
        reply.text = result.text;
        reply.header = "controller_connection"
        break;
    }
    sendWSMessage(player.ws, reply, data)
  }
  updatePlayerSelectedChoice(player: Player, choice: any) {
    this.currentSelectedChoices.set(player, choice);
    //run a quick check to see if we still need more player choices
    if (this.currentSelectedChoices.size == this.countActivePlayers()) {
      //send the choices off!
      //TODO we will eventually put some logic here in case only certain players at a time can make a decision/choice
      this.sendSelectedChoices();
    }
  }

  sendSelectedChoices() {
    const message = {
      type: WSMessageType.COMMAND,
      header: "choices",
      time: new Date(),
      sender: "server"
    }
    let choices: any[] = [];
    this.currentSelectedChoices.forEach((val, key) => {
      choices.push(val);
    })
    const bundledChoices = {
      prompt: 'some_prompt',
      choices: choices,
    }
    console.log(bundledChoices)
    //TODO debug is on
    sendWSMessage(this.host.ws, message, bundledChoices, true);
  }
  currentSelectedChoices = new Map();
}

export default Room