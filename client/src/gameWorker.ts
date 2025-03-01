import { Game, ProcessMsgType } from "../../server/src/game/game";
import type { ProcessMsg } from "../../server/src/game/gameProcessManager";

let game: Game | undefined;

function sendMsg(msg: ProcessMsg) {
    postMessage(msg);
}

const socketMsgs: Array<{
    socketId: string;
    data: ArrayBuffer;
}> = [];

addEventListener("message", async (message) => {
    const msg = message.data as ProcessMsg;

    if (msg.type === ProcessMsgType.Create && !game) {
        game = new Game(
            msg.id,
            msg.config,
            (id, data) => {
                socketMsgs.push({
                    socketId: id,
                    data,
                });
            },
            (id) => {
                sendMsg({
                    type: ProcessMsgType.SocketClose,
                    socketId: id,
                });
            },
            (msg) => {
                sendMsg(msg);
                if (msg.stopped) {
                    game = undefined;
                }
            },
        );

        await game.init();
        sendMsg({
            type: ProcessMsgType.Created,
        });
    }

    if (!game) return;

    switch (msg.type) {
        case ProcessMsgType.AddJoinToken:
            game.addJoinToken(msg.token, msg.autoFill, msg.playerCount);
            break;
        case ProcessMsgType.SocketMsg:
            game.handleMsg(msg.msgs[0].data, msg.msgs[0].socketId);
            break;
        case ProcessMsgType.SocketClose:
            game.handleSocketClose(msg.socketId);
            break;
    }
});

setInterval(() => {
    if (game) {
        game?.updateData();
    } else {
        sendMsg({
            type: ProcessMsgType.KeepAlive,
        });
    }
}, 5000);

setInterval(() => {
    game?.update();
    game?.netSync();
    sendMsg({
        type: ProcessMsgType.SocketMsg,
        msgs: socketMsgs,
    });
    socketMsgs.length = 0;
}, 1000 / 120);
