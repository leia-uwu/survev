export class ObjectPool<T> {
    private pool: T[] = new Array<T>(15);
    private removalIndex: number = 0;
    private insertIndex: number = 0;
    
    constructor(private objConstructor: () => T){}

    private resizePool(){
        let newPool = new Array<T>(this.pool.length * 2);
        for(let i = 0; i < this.pool.length; i++){
            newPool[i] = this.pool[i];
        }
        this.insertIndex = this.pool.length;
        this.removalIndex = 0;
        this.pool = newPool;
    }

    public getObj(): T{
        if (this.removalIndex == this.insertIndex){
            return this.objConstructor();
        }
        const obj: T = this.pool[this.removalIndex];
        this.removalIndex = (this.removalIndex + 1) % this.pool.length;
        return obj;
    }

    public freeObj(obj: T): void{
        this.pool[this.insertIndex] = obj;
        this.insertIndex = (this.insertIndex + 1) % this.pool.length;

        if (this.insertIndex == this.removalIndex){
            this.resizePool();
        }
    }
}