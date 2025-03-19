import type { AbstractMsg, BitStream } from "./net";

export class EditMsg implements AbstractMsg {
    overrideZoom = false;
    zoom = 1;
    cull = false;
    loadNewMap = false;
    newMapSeed = 0;
    printLootStats = false;
    spawnLootType = "";

    serialize(s: BitStream) {
        s.writeBoolean(this.overrideZoom);
        s.writeBoolean(this.cull);
        s.writeFloat32(this.zoom);

        s.writeBoolean(this.printLootStats);

        s.writeBoolean(this.loadNewMap);
        s.writeUint32(this.newMapSeed);

        s.writeGameType(this.spawnLootType);

        s.writeAlignToNextByte();
    }

    deserialize(s: BitStream) {
        this.overrideZoom = s.readBoolean();
        this.cull = s.readBoolean();
        this.zoom = s.readFloat32();

        this.printLootStats = s.readBoolean();

        this.loadNewMap = s.readBoolean();
        this.newMapSeed = s.readUint32();

        this.spawnLootType = s.readGameType();
        s.readAlignToNextByte();
    }
}
