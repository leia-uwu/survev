import type { AbstractMsg, BitStream } from "./net";

/**
 * color: green, red, etc
 *
 * background: linear-gradient(to right, red, blue)
 *
 * backgroundColor: green, red, etc
 *
 * textDecoration: underline, strikethrough
 *
 * fontWeight: bold
 *
 * fontStyle: italics
 */
export const styleKeys = [
    "color",
    "background",
    "backgroundColor",
    "textDecoration",
    "fontWeight",
    "fontStyle",
] as const;

export interface KillFeedSegment {
    text: string;
    style: Partial<Record<(typeof styleKeys)[number], string>>;
}

function getFlags(style: KillFeedSegment["style"]) {
    let flags = 0;
    for (let i = 0; i < styleKeys.length; i++) {
        const key = styleKeys[i];
        if (key in style) {
            flags |= 1 << i;
        }
    }
    return flags;
}

export class KillFeedMsg implements AbstractMsg {
    segments: KillFeedSegment[] = [];
    /** animation if endColor provided, static bg otherwise*/
    background = { startColor: "", endColor: "" };

    pushSegment(text: KillFeedSegment["text"], style: KillFeedSegment["style"]): void {
        this.segments.push({ text, style });
    }

    serialize(s: BitStream) {
        s.writeUint8(this.segments.length);
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            s.writeASCIIString(segment.text);

            s.writeUint8(getFlags(segment.style));
            for (let j = 0; j < styleKeys.length; j++) {
                const key = styleKeys[j];
                if (segment.style[key] !== undefined) {
                    s.writeASCIIString(segment.style[key]);
                }
            }
        }

        s.writeASCIIString(this.background.startColor);
        s.writeASCIIString(this.background.endColor);
    }

    deserialize(s: BitStream) {
        const segmentCount = s.readUint8();
        for (let i = 0; i < segmentCount; i++) {
            const segment = { style: {} } as KillFeedSegment;
            segment.text = s.readASCIIString();

            const flags = s.readUint8();
            for (let j = 0; j < styleKeys.length; j++) {
                if (((flags >> j) & 1) == 1) {
                    segment.style[styleKeys[j]] = s.readASCIIString();
                }
            }

            this.segments.push(segment);
        }

        this.background.startColor = s.readASCIIString();
        this.background.endColor = s.readASCIIString();
    }
}
