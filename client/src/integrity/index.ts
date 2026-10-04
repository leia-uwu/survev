import { checkRuntimeIntegrity, createRuntimeSnapshot } from "./runtimeIntegrity.ts";

let initialized = false;

export function initializeClientIntegrity(): void {
    if (initialized) return;
    initialized = true;
    createRuntimeSnapshot();

    if (import.meta.env.DEV) {
        // Observe independently of the game loop, and report at most once per page load.
        const timer = window.setInterval(() => {
            if (!checkRuntimeIntegrity()) {
                console.warn("[clientIntegrity] Runtime references changed since startup.");
                window.clearInterval(timer);
            }
        }, 5000);

        import.meta.hot?.dispose(() => window.clearInterval(timer));
    }
}
