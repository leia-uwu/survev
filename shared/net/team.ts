// /api/team_v2 websocket msgs typing

export interface RoomData {
    roomUrl: string;
    findingGame: boolean;
    lastError: string;
    region: string;
    autoFill: boolean;
    enabledGameModeIdxs: number[];
    gameModeIdx: number;
    maxPlayers: number;
}

//
// Team msgs that the server sends to clients
//

/**
 * send by the server to all clients to make them join the game
 */
export interface TeamJoinGameMsg {
    readonly type: "joinGame";
    data: {
        zone: string;
        gameId: string;
        hosts: string[];
        addrs: string[];
        // server generated data that gets sent back to the server on `joinMsg.matchPriv`
        data: string;
        useHttps: boolean;
    };
}

export interface TeamMenuPlayer {
    name: string;
    playerId: number;
    isLeader: boolean;
    inGame: boolean;
}

/**
 * Send by the server to update the client team ui
 */
export interface TeamStateMsg {
    readonly type: "state";
    data: {
        localPlayerId: number; // always -1 by default since it can only be set when the socket is actually sending state to each individual client
        room: RoomData;
        players: TeamMenuPlayer[];
    };
}

/**
 * Send by the client AND server to keep the connection alive
 */
export interface TeamKeepAliveMsg {
    readonly type: "keepAlive";
    data: {};
}

/**
 * Send by the server when the player gets kicked from the team room
 */
export interface TeamKickedMsg {
    readonly type: "kicked";
    data: {};
}

export interface TeamErrorMsg {
    readonly type: "error";
    data: {
        type: string;
    };
}

export type ServerToClientTeamMsg =
    | TeamJoinGameMsg
    | TeamStateMsg
    | TeamKeepAliveMsg
    | TeamKickedMsg
    | TeamErrorMsg;

//
// Team Msgs that the client sends to the server
//

/**
 * send by the client to join a team room
 */
export interface TeamJoinMsg {
    readonly type: "join";
    data: {
        roomUrl: string;
        playerData: {
            name: string;
        };
    };
}

/**
 * Send by the client to change the player name
 */
export interface TeamChangeNameMsg {
    readonly type: "changeName";
    data: {
        name: string;
    };
}

/**
 * Send by the client to set the room properties
 */
export interface TeamSetRoomPropsMsg {
    readonly type: "setRoomProps";
    data: RoomData;
}

/**
 * Send by the client to create a room
 */
export interface TeamCreateMsg {
    readonly type: "create";
    data: {
        roomData: RoomData;
        playerData: {
            name: string;
        };
    };
}

/**
 * Send by the client when the team leader kicks someone from the team
 */
export interface TeamKickMsg {
    readonly type: "kick";
    data: {
        playerId: number;
    };
}

/**
 * Send by the client when the game is completed
 */
export interface TeamGameCompleteMsg {
    readonly type: "gameComplete";
}

export interface TeamPlayGameMsg {
    readonly type: "playGame";
    data: {
        version: number;
        region: string;
        zones: string[];
    };
}

export type ClientToServerTeamMsg =
    | TeamKeepAliveMsg
    | TeamJoinMsg
    | TeamChangeNameMsg
    | TeamSetRoomPropsMsg
    | TeamCreateMsg
    | TeamKickMsg
    | TeamGameCompleteMsg
    | TeamPlayGameMsg;
