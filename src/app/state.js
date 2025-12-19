const initialState = {
    view: "boot",
    isLoading: false,
    stats: null,
    error: null,
};

let state = { ...initialState };
const listeners = new Set();

export function getState() {
    return state;
}

export function setState(updater) {
    const updates = typeof updater === "function" ? updater(state) : updater;
    state = { ...state, ...updates };
    listeners.forEach((fn) => fn(state));
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function resetState() {
    state = { ...initialState };
    listeners.forEach((fn) => fn(state));
}
