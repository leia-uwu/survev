import { AbstractMsg, type BitStream } from "../net";

export class AliveCountsMsg extends AbstractMsg {
    teamAliveCounts: number[] = [];

    override serialize(s: BitStream) {
        const count = this.teamAliveCounts.length;
        s.writeUint8(count);
        for (let i = 0; i < count; i++) {
            s.writeUint8(this.teamAliveCounts[i]);
        }
    }

    override deserialize(s: BitStream) {
        const count = s.readUint8();
        for (let i = 0; i < count; i++) {
            const alive = s.readUint8();
            this.teamAliveCounts.push(alive);
        }
    }
}
