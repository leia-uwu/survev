class Pool {
    constructor(e) {
        // assert(e !== undefined);
        this.creator = {
            type: e
        };
        this.mt = [];
        this.activeCount = 0;
    }

    alloc() {
        let e = null;
        for (let t = 0; t < this.mt.length; t++) {
            if (!this.mt[t].active) {
                e = this.mt[t];
                break;
            }
        }
        if (!e) {
            /* eslint-disable new-cap */
            e = new this.creator.type();
            this.mt.push(e);
        }
        e.active = true;
        e.o();
        this.activeCount++;
        return e;
    }

    free(e) {
        e.n();
        e.active = false;
        this.activeCount--;
        if (
            this.mt.length > 128 &&
            this.activeCount < this.mt.length / 2
        ) {
            const t = [];
            for (let r = 0; r < this.mt.length; r++) {
                if (this.mt[r].active) {
                    t.push(this.mt[r]);
                }
            }
            this.mt = t;
        }
    }

    p() {
        return this.mt;
    }
}

class Creator {
    constructor() {
        this.idToObj = {};
        this.types = {};
        this.seenCount = 0;
    }

    registerType(e, t) {
        this.types[e] = t;
    }

    getObjById(e) {
        return this.idToObj[e];
    }

    getTypeById(e, t) {
        const r = this.getObjById(e);
        if (!r) {
            /* const a = {
                instId: firebaseManager.instanceId,
                id: e,
                ids: Object.keys(this.idToObj),
                stream: t._view._view
            };
            firebaseManager.logError(`getTypeById${JSON.stringify(a)}`);
            firebaseManager.storeGeneric("objectPoolErr", "getTypeById"); */
            return 0;
        }
        return r.__type;
    }

    updateObjFull(e, t, r, a) {
        let i = this.getObjById(t);
        let o = false;
        if (i === undefined) {
            i = this.types[e].alloc();
            i.__id = t;
            i.__type = e;
            this.idToObj[t] = i;
            this.seenCount++;
            o = true;
        }
        i.c(r, true, o, a);
        return i;
    }

    updateObjPart(e, t, r) {
        const a = this.getObjById(e);
        if (a) {
            a.c(t, false, false, r);
        } else {
            console.log("updateObjPart, missing object", e);
            // firebaseManager.storeGeneric("objectPoolErr", "updateObjPart");
        }
    }

    deleteObj(e) {
        const t = this.getObjById(e);
        if (t === undefined) {
            console.log("deleteObj, missing object", e);
            // firebaseManager.storeGeneric("objectPoolErr", "deleteObj");
        } else {
            this.types[t.__type].free(t);
            delete this.idToObj[e];
        }
    }
}

export default {
    Pool,
    Creator
};
