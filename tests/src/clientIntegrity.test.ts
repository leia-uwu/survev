import { afterEach, beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.stubGlobal("window", {
        fetch: vi.fn(),
        requestAnimationFrame: vi.fn(),
        setInterval,
        clearInterval,
    });
    vi.stubGlobal(
        "EventTarget",
        class {
            addEventListener() {}
        },
    );
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

test("requires a baseline and leaves unchanged runtime references intact", async () => {
    const { createRuntimeSnapshot, checkRuntimeIntegrity } = await import(
        "../../client/src/integrity/runtimeIntegrity.ts"
    );
    expect(checkRuntimeIntegrity()).toBe(false);
    createRuntimeSnapshot();
    expect(checkRuntimeIntegrity()).toBe(true);
});

test.each(["fetch", "requestAnimationFrame", "addEventListener"] as const)(
    "detects replacement of %s without overwriting the baseline",
    async (key) => {
        const { createRuntimeSnapshot, checkRuntimeIntegrity } = await import(
            "../../client/src/integrity/runtimeIntegrity.ts"
        );
        createRuntimeSnapshot();
        const target = key === "addEventListener" ? EventTarget.prototype : window;
        const original = Object.getOwnPropertyDescriptor(target, key)!;
        Object.defineProperty(target, key, { ...original, value: vi.fn() });
        expect(checkRuntimeIntegrity()).toBe(false);
        createRuntimeSnapshot();
        expect(checkRuntimeIntegrity()).toBe(false);
        Object.defineProperty(target, key, original);
        expect(checkRuntimeIntegrity()).toBe(true);
    },
);

test.each([true, false])("initializes once with DEV=%s", async (dev) => {
    vi.stubEnv("DEV", dev);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { initializeClientIntegrity } = await import("../../client/src/integrity/index.ts");
    initializeClientIntegrity();
    initializeClientIntegrity();
    expect(vi.getTimerCount()).toBe(dev ? 1 : 0);
    vi.advanceTimersByTime(5000);
    expect(warn).not.toHaveBeenCalled();
    window.fetch = vi.fn();
    vi.advanceTimersByTime(10000);
    expect(warn).toHaveBeenCalledTimes(dev ? 1 : 0);
    expect(vi.getTimerCount()).toBe(0);
});
