import { useSyncExternalStore } from "react";
import { DESKTOP_QUERY } from "../styles/breakpoints";

function subscribe(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_QUERY);

    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
    return window.matchMedia(DESKTOP_QUERY).matches;
}

export function useIsDesktop() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
