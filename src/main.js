import "@fontsource/vt323";
import "./index.css";

import { getState, setState, subscribe } from "./app/state.js";
import { fetchGitHubStats } from "./services/githubStats.js";
import { TerminalBoot } from "./ui/TerminalBoot.js";
import { TerminalInput } from "./ui/TerminalInput.js";
import { Toast } from "./ui/Toast.js";
import { StatsCard } from "./ui/StatsCard.js";

const root = document.getElementById("root");
let cleanup = null;

async function handleSubmit(username) {
    setState({ isLoading: true, error: null });
    try {
        const stats = await fetchGitHubStats(username);
        setState({ stats, view: "stats", isLoading: false });
        Toast.success(`Loaded stats for ${stats.username}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch stats";
        setState({ error: message, isLoading: false });
        Toast.error(message);
        console.error("Error:", error);
    }
}

function handleBack() {
    setState({ stats: null, view: "input" });
}

function handleBootComplete() {
    setState({ view: "input" });
}

function renderView(state) {
    if (cleanup) {
        cleanup();
        cleanup = null;
    }
    root.innerHTML = "";

    switch (state.view) {
        case "boot":
            const boot = new TerminalBoot(root, handleBootComplete);
            boot.start();
            cleanup = () => boot.destroy();
            break;
        case "input": {
            const terminalInput = new TerminalInput(root, handleSubmit);
            terminalInput.mount();
            const unsubLoading = subscribe((newState) => {
                terminalInput.setLoading(newState.isLoading);
            });
            cleanup = () => {
                unsubLoading();
                terminalInput.destroy();
            };
            break;
        }
        case "stats": {
            if (!state.stats) {
                setState({ view: "input" });
                return;
            }
            const statsCard = new StatsCard(root, state.stats, handleBack);
            statsCard.mount();
            cleanup = () => statsCard.destroy();
            break;
        }
        default:
            console.error("Unknown view:", state.view);
    }
}

subscribe((state) => {
    renderView(state);
});

renderView(getState());

console.log("GitHub Stats Terminal loaded!");
