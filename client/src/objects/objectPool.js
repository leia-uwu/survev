export class Pool {
    constructor(classFn) {
        // assert(e !== undefined);
        this.creator = {
            type: classFn
        };
        this.pool = [];
        this.activeCount = 0;
    }

    alloc() {
        let e = null;
        for (let t = 0; t < this.pool.length; t++) {
            if (!this.pool[t].active) {
                e = this.pool[t];
                break;
            }
        }
        if (!e) {
            /* eslint-disable new-cap */
            e = new this.creator.type();
            this.pool.push(e);
        }
        e.active = true;
        e.o();
        this.activeCount++;
        return e;
    }

    free(obj) {
        obj.n();
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

    p() {
        return this.pool;
    }
}

export class Creator {
    constructor() {
        this.idToObj = {};
        this.types = {};
        this.seenCount = 0;
    }

    registerType(type, pool) {
        this.types[type] = pool;
    }

    getObjById(id) {
        return this.idToObj[id];
    }

    getTypeById(id, s) {
        const obj = this.getObjById(id);
        if (!obj) {
            const err = {
                id,
                ids: Object.keys(this.idToObj),
                stream: s._view._view
            };
            console.error("objectPoolErr", `getTypeById${JSON.stringify(err)}`);
            return 0;
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
        obj.c(data, true, isNew, ctx);
        return obj;
    }

    updateObjPart(id, data, ctx) {
        const obj = this.getObjById(id);
        if (obj) {
            obj.c(data, false, false, ctx);
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
