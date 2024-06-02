const alphanumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

/**
 * Class to manage entity ID's
 */
export class RoomCodeAllocator {
    /**
     * set of codes
     */
    private readonly _activeCodes = new Set<string>();

    //#4fgE, #bleh, #ball, #0000
    private generate() {    
        let str = "";
        let i = 0;
        while (i < 4) {
          str += alphanumerics.charAt(Math.floor(Math.random() * alphanumerics.length));
          i++;
        }
        return "#" + str;
    }

    getCode(): string {
        let code = this.generate();
        while (this._activeCodes.has(code)){
            code = this.generate();
        }
        this._activeCodes.add(code);
        return code;
    }

    freeCode(code: string) {
        this._activeCodes.delete(code);
    }
}
