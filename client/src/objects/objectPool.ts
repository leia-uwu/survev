import type { BitStream } from "../../../shared/net/net";
import {
    type ObjectData,
    ObjectType,
    type ObjectsPartialData,
} from "../../../shared/net/objectSerializeFns";
import { assert } from "../../../shared/utils/util";
import type { Ctx } from "../game";

import type { AbstractObject } from "./player";

type C<T extends AbstractObject> = new () => T;

export class Pool<T extends AbstractObject> {
    pool: T[] = [];
    activeCount = 0;
    creator: {
        type: C<T>;
    };

    constructor(classFn: C<T>) {
        this.creator = {
            type: classFn,
        };
        assert(classFn !== undefined);
    }

    alloc() {
        let obj: T | null = null;
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                obj = this.pool[i];
                break;
            }
        }
        if (!obj) {
            obj = new this.creator.type();
            this.pool.push(obj);
        }
        obj.active = true;
        obj.init();
        this.activeCount++;
        return obj;
    }

    free(obj: AbstractObject) {
        obj.free();
        obj.active = false;
        this.activeCount--;

        if (this.pool.length > 128 && this.activeCount < this.pool.length / 2) {
            const compact = [];
            for (let i = 0; i < this.pool.length; i++) {
                if (this.pool[i].active) {
                    compact.push(this.pool[i]);
                }
            }
            this.pool = compact;
        }
    }

    getPool() {
        return this.pool;
    }
}

export class Creator {
    idToObj: Record<number, AbstractObject> = {};
    types: Record<string, Pool<AbstractObject>> = {};
    seenCount = 0;

    registerType(type: string, pool: Pool<AbstractObject>) {
        this.types[type] = pool;
    }

    getObjById(id: number) {
        return this.idToObj[id];
    }

    getTypeById(id: number, s: BitStream) {
        const obj = this.getObjById(id);
        if (!obj) {
            const err = {
                id,
                ids: Object.keys(this.idToObj),
                stream: s._view._view,
            };
            console.error("objectPoolErr", `getTypeById${JSON.stringify(err)}`);
            return ObjectType.Invalid;
        }
        return obj.__type;
    }

    updateObjFull<Type extends ObjectType>(
        type: Type,
        id: number,
        data: ObjectData<Type>,
        ctx: Ctx,
    ) {
        let obj = this.getObjById(id);
        let isNew = false;
        if (obj === undefined) {
            obj = this.types[type].alloc();
            obj.__id = id;
            obj.__type = type;
            this.idToObj[id] = obj;
            this.seenCount++;
            isNew = true;
        }
        obj.updateData(data, true, isNew, ctx);
        return obj;
    }

    updateObjPart(id: number, data: ObjectsPartialData[ObjectType], ctx: Ctx) {
        const obj = this.getObjById(id);
        if (obj) {
            obj.updateData(data, false, false, ctx);
        } else {
            console.error("updateObjPart, missing object", id);
        }
    }

    deleteObj(id: number) {
        const obj = this.getObjById(id);
        if (obj === undefined) {
            console.error("deleteObj, missing object", id);
        } else {
            this.types[obj.__type].free(obj);
            delete this.idToObj[id];
        }
    }
}
