import { type BitStream } from "./net";

export interface Msg {
    serialize: (s: BitStream) => void
}
