import { Msg, MsgType, type SurvivBitStream } from "./net";

export class AliveCountMsg extends Msg {
    override readonly msgType = MsgType.AliveCounts;

    aliveCounts: number[] = [];

    serialize(stream: SurvivBitStream): void {
        stream.writeUint8(this.aliveCounts.length);
        for (const aliveCount of this.aliveCounts) {
            stream.writeUint8(aliveCount);
        }
    }

    deserialize(stream: SurvivBitStream): void {
        const count = stream.readUint8();
        for (let i = 0; i < count; i++) {
            this.aliveCounts.push(stream.readUint8());
        }
    }
}
