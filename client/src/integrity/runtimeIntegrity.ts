interface RuntimeSnapshot {
    fetch: typeof window.fetch;
    requestAnimationFrame: typeof window.requestAnimationFrame;
    addEventListener: typeof EventTarget.prototype.addEventListener;
}

let snapshot: RuntimeSnapshot | undefined;

// A startup baseline, not proof of a pristine runtime or an authoritative cheat signal.
// Changes made before initialization (including by imported modules) are not detected.
export function createRuntimeSnapshot(): void {
    if (snapshot) return;

    snapshot = {
        fetch: window.fetch,
        requestAnimationFrame: window.requestAnimationFrame,
        addEventListener: EventTarget.prototype.addEventListener,
    };
}

export function checkRuntimeIntegrity(): boolean {
    if (!snapshot) return false;

    return (
        window.fetch === snapshot.fetch
        && window.requestAnimationFrame === snapshot.requestAnimationFrame
        && EventTarget.prototype.addEventListener === snapshot.addEventListener
    );
}
