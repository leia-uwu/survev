export interface CrosshairDef {
    type: "crosshair"
    name: string
    rarity: number
    cursor?: string
    texture: string
    code: string
}

export const CrosshairDefs: Record<string, CrosshairDef> = {
    crosshair_default: {
        type: "crosshair",
        name: "Default",
        rarity: 0,
        cursor: "crosshair",
        texture: "crosshair000.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path fill="white" paint-order="fill markers stroke" d="M7.938 4.233h1.058V12.7H7.938z"/><path fill="white" paint-order="fill markers stroke" d="M12.7 7.937v1.058H4.233V7.937z"/></svg>'
    },
    crosshair_001: {
        type: "crosshair",
        name: "Style 001",
        rarity: 1,
        texture: "crosshair001.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M7.693.215v1.471A6.829 6.829 0 0 0 1.69 7.693H.215V9.24h1.471a6.829 6.829 0 0 0 6.007 6.003v1.475H9.24v-1.47a6.829 6.829 0 0 0 6.003-6.008h1.475V7.693h-1.47A6.829 6.829 0 0 0 9.24 1.69V.215zm0 2.745v1.897H9.24V2.96a5.567 5.567 0 0 1 4.734 4.733h-1.897V9.24h1.896a5.567 5.567 0 0 1-4.733 4.734v-1.897H7.693v1.896A5.567 5.567 0 0 1 2.96 9.24h1.897V7.693H2.96A5.567 5.567 0 0 1 7.693 2.96z" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_005: {
        type: "crosshair",
        name: "Style 005",
        rarity: 1,
        texture: "crosshair005.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M.53 3.704L3.703.53l4.763 4.763L13.229.529l3.175 3.175-4.762 4.763 4.762 4.762-3.175 3.175-4.762-4.762-4.763 4.762L.53 13.23l4.763-4.762L.529 3.704" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_007: {
        type: "crosshair",
        name: "Style 007",
        rarity: 1,
        texture: "crosshair007.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M9.091.345v4.998H7.842V.345h1.25m2.498 7.497h4.998v1.25H11.59v-1.25M9.091 11.59v4.998H7.842V11.59h1.25M.344 7.842h4.998v1.25H.345v-1.25" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_010: {
        type: "crosshair",
        name: "Style 010",
        rarity: 1,
        texture: "crosshair010.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.98.265v4.1H7.953v-4.1h1.025m0 12.303v4.1H7.954v-4.1h1.025M.265 7.954h4.1v1.025h-4.1V7.954m12.303 0h4.1v1.025h-4.1V7.954M8.98 8.467q0 .218-.154.359-.141.153-.36.153-.217 0-.371-.153-.141-.141-.141-.36 0-.217.141-.371.154-.141.372-.141t.359.141q.153.154.153.372" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_022: {
        type: "crosshair",
        name: "Style 022",
        rarity: 1,
        texture: "crosshair022.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.467 7.408l1.587 1.588-.529.529-1.058-1.058-1.059 1.058-.529-.53 1.588-1.587" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_027: {
        type: "crosshair",
        name: "Style 027",
        rarity: 1,
        texture: "crosshair027.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M2.117 1.058H6.35v1.059H2.117V6.35H1.058V2.117q0-.437.305-.741.317-.318.754-.318m0 14.817q-.437 0-.754-.318-.305-.304-.305-.74v-4.234h1.059v4.234H6.35v1.058H2.117m12.7-14.817q.436 0 .754.318.304.304.304.74V6.35h-1.058V2.117h-4.234V1.058h4.234m1.058 13.759q0 .436-.304.74-.318.318-.754.318h-4.234v-1.058h4.234v-4.234h1.058v4.234M8.996 6.88v1.057h1.058v1.059H8.996v1.058H7.937V8.996H6.88V7.937h1.058V6.88h1.059" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_038: {
        type: "crosshair",
        name: "Style 038",
        rarity: 1,
        texture: "crosshair038.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M4.233 6.88V5.82l1.588-1.587h1.058v1.059H6.35L5.292 6.35v.53H4.233m4.763 1.587q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.146.384-.146t.37.146q.159.159.159.384M12.7 6.879h-1.058V6.35l-1.059-1.058h-.529V4.233h1.059L12.7 5.821v1.058m0 3.175v1.059L11.113 12.7h-1.059v-1.058h.53l1.058-1.059v-.529H12.7m-8.467 0h1.059v.53l1.058 1.058h.53V12.7H5.82l-1.587-1.587v-1.059" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_040: {
        type: "crosshair",
        name: "Style 040",
        rarity: 1,
        texture: "crosshair040.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M11.642 4.233q.436 0 .754.318.304.304.304.74v2.117h-1.058V5.292H9.525V4.233h2.117m-.53 3.704h2.117v1.059h-2.116V7.937m.529 4.763H9.525v-1.058h2.117V9.525H12.7v2.117q0 .436-.304.74-.318.318-.754.318M7.937 5.82V3.705h1.059v2.117H7.937M5.292 4.233h2.116v1.059H5.292v2.116H4.233V5.292q0-.437.305-.741.317-.318.754-.318M3.704 7.937h2.117v1.059H3.704V7.937M5.292 12.7q-.437 0-.754-.318-.305-.304-.305-.74V9.525h1.059v2.117h2.116V12.7H5.292m2.645-1.587h1.059v2.116H7.937v-2.116" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_045: {
        type: "crosshair",
        name: "Style 045",
        rarity: 1,
        texture: "crosshair045.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M9.79 3.44l3.704 3.704-.384.383-3.704-3.704.384-.383M8.73 5.292v1.587h-.529V5.292h.53M3.44 7.144L7.144 3.44l.37.37L3.81 7.514l-.37-.37m5.556 1.323q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.146.384-.146t.37.146q.159.159.159.384m-3.704-.265h1.587v.53H5.292v-.53m4.762 0h1.588v.53h-1.588v-.53m-1.323 1.852v1.588h-.529v-1.588h.53m4.762-.264L9.79 13.494l-.37-.37 3.703-3.705.37.37m-6.35 3.705L3.44 9.79l.37-.37 3.704 3.703-.37.37" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_051: {
        type: "crosshair",
        name: "Style 051",
        rarity: 1,
        texture: "crosshair051.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M13.758 3.704L11.113 6.35h-.53v-.53l2.646-2.645.53.53m-10.584 0l.53-.53L6.35 5.821v.529h-.53L3.176 3.704m5.82 4.763l.53.529v.529h-.53l-.528-.53-.53.53h-.529v-.53l.53-.528-.53-.53v-.529h.53l.529.53.529-.53h.529v.53l-.53.529m4.763 4.762l-.529.53-2.646-2.646v-.53h.53l2.645 2.646m-10.583 0l2.646-2.646h.529v.53l-2.646 2.645-.529-.529" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_064: {
        type: "crosshair",
        name: "Style 064",
        rarity: 1,
        texture: "crosshair064.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M7.937 0v.546c-1.969.116-3.667.88-5.093 2.298C1.426 4.27.662 5.968.546 7.937H0v1.059h.546c.116 1.968.88 3.662 2.298 5.08 1.426 1.426 3.124 2.195 5.093 2.31v.547h1.059v-.546c1.968-.117 3.662-.886 5.08-2.311 1.425-1.418 2.194-3.112 2.31-5.08h.547V7.937h-.546c-.116-1.969-.885-3.667-2.311-5.093C12.658 1.427 10.964.662 8.996.546V0H7.937zm0 1.607v2.125c-1.087.11-2.031.562-2.83 1.361l-.014.014c-.799.799-1.251 1.743-1.36 2.83H1.606c.114-1.677.777-3.124 1.991-4.339 1.215-1.214 2.662-1.877 4.34-1.99zm1.059 0c1.678.114 3.125.777 4.34 1.991 1.214 1.215 1.876 2.662 1.99 4.34h-2.125c-.11-1.09-.568-2.038-1.374-2.845-.8-.799-1.743-1.251-2.831-1.36V1.606zM7.937 4.801V6.35h1.059V4.8a3.547 3.547 0 0 1 2.09 1.047c.595.595.941 1.293 1.047 2.09h-1.55v1.059h1.55c-.107.79-.453 1.483-1.047 2.077l-.013.013c-.594.594-1.287.94-2.077 1.046v-1.549H7.937v1.55a3.547 3.547 0 0 1-2.09-1.047 3.547 3.547 0 0 1-1.046-2.09H6.35V7.937H4.8a3.547 3.547 0 0 1 1.047-2.09 3.547 3.547 0 0 1 2.09-1.046zm-6.33 4.195h2.125c.11 1.088.562 2.032 1.361 2.83.807.807 1.756 1.265 2.844 1.375v2.125c-1.677-.114-3.124-.776-4.339-1.99-1.214-1.215-1.877-2.662-1.99-4.34zm11.594 0h2.125c-.114 1.678-.776 3.125-1.99 4.34-1.215 1.214-2.662 1.876-4.34 1.99v-2.125c1.08-.112 2.025-.569 2.83-1.374.806-.806 1.263-1.75 1.375-2.831z" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_080: {
        type: "crosshair",
        name: "Style 080",
        rarity: 1,
        texture: "crosshair080.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M3.598 3.598q-1.627 1.628-1.931 3.81H.595q.318-2.619 2.25-4.564Q4.788.913 7.407.595v1.072q-2.182.304-3.81 1.931m9.737 9.737q1.627-1.627 1.945-3.81h1.058q-.317 2.62-2.262 4.55-1.932 1.946-4.551 2.263V15.28q2.183-.318 3.81-1.945m0-9.737q-1.627-1.627-3.81-1.931V.595q2.62.318 4.55 2.25 1.946 1.944 2.263 4.563H15.28q-.318-2.182-1.945-3.81M6.879 6.88h1.058v1.058H6.88V6.88m2.117 0h1.058v1.058H8.996V6.88m0 2.117h1.058v1.058H8.996V8.996m-2.117 0h1.058v1.058H6.88V8.996M3.6 13.335q1.627 1.627 3.81 1.945v1.058q-2.62-.317-4.565-2.262Q.913 12.144.595 9.525h1.072q.304 2.183 1.931 3.81" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_086: {
        type: "crosshair",
        name: "Style 086",
        rarity: 1,
        texture: "crosshair086.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M16.528 1.413L11.49 6.451h-1.008V5.444L15.52.406l1.008 1.007m-16.122 0L1.413.406l5.038 5.038V6.45H5.444L.406 1.413m0 14.107l5.038-5.038H6.45v1.008l-5.038 5.038L.406 15.52m16.122 0l-1.008 1.008-5.038-5.038v-1.008h1.008l5.038 5.038" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_094: {
        type: "crosshair",
        name: "Style 094",
        rarity: 1,
        texture: "crosshair094.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.467 1.587q-2.077 0-3.705 1.059l-.754-.754Q5.953.529 8.467.529q2.513 0 4.471 1.363l-.767.754q-1.627-1.059-3.704-1.059m6.879 6.88q0-2.077-1.059-3.705l.768-.754q1.35 1.945 1.35 4.459 0 2.513-1.35 4.471l-.768-.767q1.059-1.627 1.059-3.704m1.058-6.88L13.23 4.762h-1.058V3.704L15.346.53l1.058 1.058M1.587.53l3.175 3.175v1.058H3.704L.53 1.587 1.587.53m0 7.938q0 2.077 1.059 3.704l-.754.767Q.529 10.98.529 8.467q0-2.514 1.363-4.459l.754.754Q1.587 6.39 1.587 8.467m6.35 0l.53-.53.529.53-.53.529-.529-.53m.53 6.88q2.077 0 3.704-1.059l.767.768q-1.958 1.35-4.471 1.35-2.514 0-4.459-1.35l.754-.768q1.628 1.059 3.705 1.059m-6.88 1.058L.53 15.346l3.175-3.175h1.058v1.058l-3.175 3.175m13.759 0L12.17 13.23v-1.058h1.058l3.175 3.175-1.058 1.058" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_098: {
        type: "crosshair",
        name: "Style 098",
        rarity: 1,
        texture: "crosshair098.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.996 8.467q0 .172-.093.304l-.066.066q-.145.159-.37.159t-.384-.159l-.053-.066q-.093-.132-.093-.304 0-.225.146-.384.159-.146.384-.146t.37.146q.159.159.159.384m-5.821 3.175h10.583L8.467 2.646l-5.292 8.996M8.467.529L15.875 12.7H1.058L8.467.53" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_101: {
        type: "crosshair",
        name: "Style 101",
        rarity: 1,
        texture: "crosshair101.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M6.588 6.588l-.013.013q-.754.78-.754 1.866v.013q0 .542.185 1.005.198.463.582.86l.066.066q.754.702 1.813.702 1.058 0 1.812-.715l.053-.053.013-.013q.384-.384.582-.86.186-.463.186-1.005 0-1.098-.768-1.879-.582-.582-1.35-.714L8.48 5.82h-.013l-.53.053q-.754.132-1.336.7l-.013.014m1.35-4.471h1.058v2.685q1.204.146 2.09 1.032 1.085 1.085 1.085 2.633 0 .926-.397 1.693l2.222 1.773-.767.767-2.116-1.64-.027.026q-1.085 1.085-2.62 1.085-1.547 0-2.632-1.085l-.026-.026-2.104 1.64-.767-.767 2.222-1.773q-.396-.767-.396-1.693 0-1.535 1.071-2.62l.013-.013q.887-.886 2.09-1.032V2.117m1.059 6.35q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.145-.145-.145-.37t.145-.384q.159-.146.384-.146t.37.146q.159.159.159.384" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_102: {
        type: "crosshair",
        name: "Style 102",
        rarity: 1,
        texture: "crosshair102.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M2.937 11.933l2.222-1.773q.238.476.649.9L3.704 12.7l-.767-.767m5.53-7.17l-.53.04V2.116h1.059v2.685l-.53-.04m.53 3.705q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.145.384-.145t.37.145q.159.159.159.384m4.233 4.233l-2.116-1.64q.41-.424.661-.9l2.222 1.773-.767.767" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_109: {
        type: "crosshair",
        name: "Style 109",
        rarity: 1,
        texture: "crosshair109.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.467 15.346q1.918 0 3.452-.9l.53.913q-1.773 1.045-3.982 1.045-2.196 0-3.97-1.032l.53-.926q1.535.9 3.44.9m-6.88-6.88q0 1.932.913 3.467l-.913.529Q.53 10.689.53 8.467q0-2.21 1.045-3.97l.913.53q-.9 1.535-.9 3.44m13.759 0q0-1.919-.9-3.44l.913-.53q1.045 1.76 1.045 3.97 0 2.222-1.058 3.995l-.913-.53q.913-1.547.913-3.465m-6.88-6.88q-1.918 0-3.452.913l-.53-.926Q6.258.53 8.468.53q2.209 0 3.982 1.045l-.53.926q-1.534-.913-3.452-.913M6.588 6.588l-.013.013q-.754.78-.754 1.866v.013q0 1.085.767 1.865.78.768 1.879.768 1.098 0 1.865-.768l.013-.013q.768-.767.768-1.865 0-1.098-.768-1.879-.78-.767-1.865-.767h-.013q-1.085 0-1.866.754l-.013.013m2.408 1.879q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.145.384-.145t.37.145q.159.159.159.384m2.09-2.633q1.085 1.085 1.085 2.633 0 1.534-1.085 2.619-1.085 1.085-2.62 1.085-1.547 0-2.632-1.085-1.072-1.085-1.072-2.62 0-1.534 1.072-2.619l.013-.013q1.085-1.072 2.62-1.072 1.534 0 2.619 1.072" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_118: {
        type: "crosshair",
        name: "Style 118",
        rarity: 1,
        texture: "crosshair118.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M13.335 3.598q-2.01-2.01-4.868-2.01-2.858 0-4.869 2.01-2.01 2.011-2.01 4.869 0 2.857 2.01 4.868 2.011 2.01 4.869 2.01 2.857 0 4.868-2.01 2.01-2.01 2.01-4.868 0-2.858-2.01-4.869m3.07 4.869q0 3.294-2.33 5.609-2.314 2.328-5.608 2.328-3.294 0-5.623-2.328Q.53 11.76.53 8.466q0-3.293 2.315-5.622Q5.173.53 8.467.53t5.609 2.315q2.328 2.329 2.328 5.623" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/><path d="M8.996 8.467q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.146.384-.146t.37.146q.159.159.159.384" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_124: {
        type: "crosshair",
        name: "Style 124",
        rarity: 1,
        texture: "crosshair124.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.467 5.292L4.762 1.588l.53-.53 3.175 3.175 3.175-3.175.529.53-3.704 3.704M5.292 8.467L1.587 12.17l-.529-.53 3.175-3.174-3.175-3.175.53-.53 3.704 3.705m6.35 0l3.704-3.704.529.529L12.7 8.467l3.175 3.175-.53.529-3.703-3.704m-3.175 3.175l3.704 3.704-.53.529L8.468 12.7l-3.175 3.175-.53-.53 3.705-3.703M6.88 7.514l.634-.635.953.953.952-.953.635.635-.952.953.952.952-.635.635-.952-.952-.953.952-.635-.635.953-.952-.953-.953" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_125: {
        type: "crosshair",
        name: "Style 125",
        rarity: 1,
        texture: "crosshair125.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M9.525 8.467l1.587-1.588.53.53-1.059 1.058 1.059 1.058-.53.53-1.587-1.588M8.467 9.525l1.587 1.587-.529.53-1.058-1.059-1.059 1.059-.529-.53 1.588-1.587m0-2.117L6.879 5.821l.53-.53L8.466 6.35l1.058-1.058.53.529-1.588 1.587M7.408 8.467l-1.587 1.587-.53-.529L6.35 8.467 5.292 7.408l.529-.529 1.587 1.588" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_136: {
        type: "crosshair",
        name: "Style 136",
        rarity: 1,
        texture: "crosshair136.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.466.354A8.112 8.112 0 0 0 .354 8.466a8.112 8.112 0 0 0 8.112 8.113 8.112 8.112 0 0 0 8.113-8.113A8.112 8.112 0 0 0 8.466.354zm-.1 1.497v6.514H1.852a6.619 6.619 0 0 1 6.512-6.514zm.202.002a6.619 6.619 0 0 1 6.514 6.512H8.568V1.853zM1.85 8.568h6.514v6.512a6.619 6.619 0 0 1-6.514-6.512zm6.717 0h6.512a6.619 6.619 0 0 1-6.512 6.514V8.568z" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_158: {
        type: "crosshair",
        name: "Style 158",
        rarity: 1,
        texture: "crosshair158.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M8.98 8.46q0 .218-.141.372-.154.142-.372.142t-.36-.142q-.154-.154-.154-.372t.154-.359q.142-.154.36-.154t.372.154q.14.141.14.36m-7.698 0q0 1.808.834 3.271l.706-.706.988.988-1.604 1.579q-.475-.526-.834-1.104Q.255 10.706.255 8.46q0-2.976 1.95-5.132L3.848 4.97 2.82 5.997l-.744-.744Q1.28 6.69 1.28 8.46m14.371 0q0-1.77-.783-3.195l-.641.63L13.2 4.867l1.527-1.54q.513.564.886 1.18 1.064 1.758 1.064 3.952 0 2.207-1.077 3.965l-.886 1.168-1.63-1.63 1.027-1.026.744.744q.796-1.45.796-3.22" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_160: {
        type: "crosshair",
        name: "Style 160",
        rarity: 1,
        texture: "crosshair160.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M16.933.564L9.878 7.62l-.565-.564L16.37 0l.564.564M9.031 8.467q0 .24-.17.395-.154.17-.394.17-.24 0-.41-.17-.155-.155-.155-.395 0-.24.155-.41.17-.155.41-.155.24 0 .395.155.17.17.17.41m7.337 8.466L9.313 9.878l.565-.565 7.055 7.056-.564.564M0 .564L.564 0 7.62 7.056l-.564.564L0 .564m.564 16.37L0 16.368l7.056-7.056.564.565-7.056 7.055" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_173: {
        type: "crosshair",
        name: "Style 173",
        rarity: 1,
        texture: "crosshair173.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M11.642 8.467q0-.926-.45-1.654l-.609.595L9.525 6.35l.609-.595q-.741-.463-1.667-.463t-1.654.463l.595.595L6.35 7.408l-.595-.595q-.463.728-.463 1.654 0 .926.463 1.667l.595-.609 1.058 1.058-.595.609q.728.45 1.654.45.926 0 1.667-.45l-.609-.609 1.058-1.058.609.609q.45-.741.45-1.667m1.058 0q0 1.362-.754 2.42l.754.755-1.058 1.058-.754-.754-.305.198q-.939.556-2.116.556-1.363 0-2.421-.754l-.754.754-1.059-1.058.754-.754q-.754-1.059-.754-2.421 0-1.376.754-2.421l-.754-.754 1.059-1.059.754.754q1.045-.754 2.42-.754 1.178 0 2.117.556l.305.198.754-.754L12.7 5.292l-.754.754q.754 1.058.754 2.42" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_176: {
        type: "crosshair",
        name: "Style 176",
        rarity: 1,
        texture: "crosshair176.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M12.7 8.467q0 1.137-.53 2.063v1.112h-.912Q10.081 12.7 8.467 12.7q-1.628 0-2.805-1.058h-.9v-1.098q-.529-.926-.529-2.077 0-1.151.53-2.077V5.292h.886q1.19-1.059 2.818-1.059 1.614 0 2.804 1.059h.9V6.39q.529.926.529 2.077m-1.984-2.25q-.913-.899-2.17-.925h-.159q-1.27.026-2.17.926-.925.926-.925 2.249 0 1.31.926 2.249.9.9 2.17.926h.158q1.257-.027 2.17-.926.926-.94.926-2.25 0-1.322-.926-2.248m-1.72 2.249q0 .225-.159.37-.145.159-.37.159t-.384-.159q-.145-.145-.145-.37t.145-.384q.159-.146.384-.146t.37.146q.159.159.159.384" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_177: {
        type: "crosshair",
        name: "Style 177",
        rarity: 1,
        texture: "crosshair177.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M1.058 12.726l1.879-2.91.913.542-.675 1.31h1.588v1.058H1.058M8.467.556l1.733 2.91-.913.542-.82-1.362-.807 1.362-.913-.542 1.72-2.91m.529 7.937q0 .172-.093.304l-.066.067q-.145.158-.37.158t-.384-.158l-.053-.067q-.092-.132-.092-.304 0-.225.145-.384.159-.145.384-.145t.37.145q.159.16.159.384m6.879 4.233h-3.704v-1.058h1.587l-.661-1.31.913-.542 1.865 2.91" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_181: {
        type: "crosshair",
        name: "Style 181",
        rarity: 1,
        texture: "crosshair181.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M12.7 8.467q0 1.746-1.244 2.99-1.243 1.243-2.99 1.243-1.759 0-3.002-1.244-1.23-1.243-1.23-2.99 0-1.759 1.23-3.002 1.243-1.23 3.003-1.23 1.746 0 2.99 1.23Q12.7 6.707 12.7 8.467m-1.984-2.25q-.94-.925-2.25-.925-1.322 0-2.248.926-.926.926-.926 2.249 0 1.31.926 2.249.926.926 2.249.926 1.31 0 2.249-.926.926-.94.926-2.25 0-1.322-.926-2.248m-.133 2.249q0 .873-.621 1.495-.622.621-1.495.621-.873 0-1.495-.621-.622-.622-.622-1.495 0-.873.622-1.495.622-.622 1.495-.622.873 0 1.495.622.621.622.621 1.495m-.992-1.125q-.463-.463-1.124-.463-.662 0-1.125.463-.463.463-.463 1.125 0 .661.463 1.124.463.463 1.125.463.661 0 1.124-.463.463-.463.463-1.124 0-.662-.463-1.125" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    },
    crosshair_184: {
        type: "crosshair",
        name: "Style 184",
        rarity: 1,
        texture: "crosshair184.img",
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16.933 16.933"><path d="M7.937 3.704h1.059V6.88H7.937V3.704M6.88 7.937v1.059H3.704V7.937H6.88m4.207-2.103q.688.688.953 1.574H10.9q-.185-.45-.556-.82-.37-.37-.82-.556V4.908q.873.251 1.561.926m-5.252.013l.013-.013q.688-.675 1.561-.926v1.124q-.436.186-.807.543l-.013.013-.013.013q-.357.37-.542.807H4.908q.251-.873.926-1.56m0 5.238q-.675-.688-.926-1.561h1.125q.185.45.555.82.37.37.82.556v1.138q-.886-.265-1.574-.953m3.162-2.62q0 .226-.159.371-.145.159-.37.159t-.384-.159q-.146-.145-.146-.37t.146-.384q.159-.146.384-.146t.37.146q.159.159.159.384m1.058.529V7.937h3.175v1.059h-3.175m1.032 2.09q-.688.688-1.561.94V10.9q.437-.185.807-.556l.013-.013q.37-.37.556-.807h1.124q-.251.873-.939 1.561m-3.149-1.032h1.059v3.175H7.937v-3.175" fill="white" stroke="black" stroke-width=".5" stroke-linecap="square"/></svg>'
    }
};
