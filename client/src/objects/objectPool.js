import firebaseManager from "../firebaseManager";

function Pool(e) {
    // assert(e !== undefined);
    this.creator = {
        type: e
    };
    this.mt = [];
    this.activeCount = 0;
}

function Creator(e) {
    this.idToObj = {};
    this.types = {};
    this.seenCount = 0;
}

Pool.prototype = {
    alloc: function() {
        var e = null;
        for (var t = 0; t < this.mt.length; t++) {
            if (!this.mt[t].active) {
                e = this.mt[t];
                break;
            }
        }
        if (!e) {
            e = new this.creator.type();
            this.mt.push(e);
        }
        e.active = true;
        e.o();
        this.activeCount++;
        return e;
    },
    free: function(e) {
        e.n();
        e.active = false;
        this.activeCount--;
        if (
            this.mt.length > 128 &&
            this.activeCount < this.mt.length / 2
        ) {
            var t = [];
            for (var r = 0; r < this.mt.length; r++) {
                if (this.mt[r].active) {
                    t.push(this.mt[r]);
                }
            }
            this.mt = t;
        }
    },
    p: function() {
        return this.mt;
    }
};

Creator.prototype = {
    registerType: function(e, t) {
        this.types[e] = t;
    },
    getObjById: function(e) {
        return this.idToObj[e];
    },
    getTypeById: function(e, t) {
        const r = this.getObjById(e);
        if (!r) {
            const a = {
                instId: firebaseManager.instanceId,
                id: e,
                ids: Object.keys(this.idToObj),
                stream: t._view._view
            };
            firebaseManager.logError(`getTypeById${JSON.stringify(a)}`);
            firebaseManager.storeGeneric("objectPoolErr", "getTypeById");
            return 0;
        }
        return r.__type;
    },
    updateObjFull: function(e, t, r, a) {
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
    },
    updateObjPart: function(e, t, r) {
        const a = this.getObjById(e);
        if (a) {
            a.c(t, false, false, r);
        } else {
            console.log("updateObjPart, missing object", e);
            firebaseManager.storeGeneric("objectPoolErr", "updateObjPart");
        }
    },
    deleteObj: function(e) {
        const t = this.getObjById(e);
        if (t === undefined) {
            console.log("deleteObj, missing object", e);
            firebaseManager.storeGeneric("objectPoolErr", "deleteObj");
        } else {
            this.types[t.__type].free(t);
            delete this.idToObj[e];
        }
    }
};
export default {
    Pool: Pool,
    Creator: Creator
};
