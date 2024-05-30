import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { assert } from "../../../shared/utils/util";

export class Pool {
    constructor(classFn) {
        assert(classFn !== undefined);
        this.creator = {
            type: classFn
        };
        this.pool = [];
        this.activeCount = 0;
    }

    alloc() {
        let obj = null;
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                obj = this.pool[i];
                break;
            }
        }
        if (!obj) {
            /* eslint-disable new-cap */
            obj = new this.creator.type();
            this.pool.push(obj);
        }
        obj.active = true;
        obj.init();
        this.activeCount++;
        return obj;
    }

    free(obj) {
        obj.free();
        obj.active = false;
        this.activeCount--;

        if (
            this.pool.length > 128 &&
            this.activeCount < this.pool.length / 2
        ) {
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
    constructor() {
        /** @type {Record<ObjectType, import("../../clientTypes").ClientObject} */
        this.idToObj = {};
        this.types = {};
        this.seenCount = 0;
    }

    registerType(type, pool) {
        this.types[type] = pool;
    }

    /** @param { number } id */
    getObjById(id) {
        return this.idToObj[id];
    }

    /**
     * @param { number } id
     * @param {import("../../../shared/net").BitStream} s
     * @returns {ObjectType}
     */
    getTypeById(id, s) {
        const obj = this.getObjById(id);
        if (!obj) {
            const err = {
                id,
                ids: Object.keys(this.idToObj),
                stream: s._view._view
            };
            console.error("objectPoolErr", `getTypeById${JSON.stringify(err)}`);
            return ObjectType.Invalid;
        }
        return obj.__type;
    }

    updateObjFull(type, id, data, ctx) {
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

    updateObjPart(id, data, ctx) {
        const obj = this.getObjById(id);
        if (obj) {
            obj.updateData(data, false, false, ctx);
        } else {
            console.error("updateObjPart, missing object", id);
        }
    }

    deleteObj(id) {
        const obj = this.getObjById(id);
        if (obj === undefined) {
            console.error("deleteObj, missing object", id);
        } else {
            this.types[obj.__type].free(obj);
            delete this.idToObj[id];
        }
    }
}
