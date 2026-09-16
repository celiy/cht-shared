type FloatingPanelEntry = {
    id: symbol;
    close: () => void;
};

const openFloatingPanels: FloatingPanelEntry[] = [];

/**
 * Closes every floating panel except the one being opened.
 */
export function closeOtherFloatingPanels(keepOpenId: symbol): void {
    for (const entry of openFloatingPanels) {
        if (entry.id !== keepOpenId) {
            entry.close();
        }
    }
}

/**
 * Tracks an open floating panel so other instances can be closed.
 */
export function registerOpenFloatingPanel(id: symbol, close: () => void): void {
    const existingIndex = openFloatingPanels.findIndex((entry) => entry.id === id);

    if (existingIndex >= 0) {
        openFloatingPanels.splice(existingIndex, 1);
    }

    openFloatingPanels.push({ id, close });
}

/**
 * Removes a panel from the open stack when it closes.
 */
export function unregisterOpenFloatingPanel(id: symbol): void {
    const index = openFloatingPanels.findIndex((entry) => entry.id === id);

    if (index >= 0) {
        openFloatingPanels.splice(index, 1);
    }
}
