/**
 * Floating panels
 * This file is used to manage floating panels.
 */

/**
 * Floating panel entry
 * @param {symbol} id The id of the floating panel.
 * @param {() => void} close The function to close the floating panel.
 */
type FloatingPanelEntry = {
    id: symbol;
    close: () => void;
};

/**
 * Open floating panels
 * @type {FloatingPanelEntry[]} The open floating panels.
 */
const openFloatingPanels: FloatingPanelEntry[] = [];

/**
 * Closes every floating panel except the one being opened.
 * @param {symbol} keepOpenId The id of the floating panel to keep open.
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
 * @param {symbol} id The id of the floating panel.
 * @param {() => void} close The function to close the floating panel.
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
 * @param {symbol} id The id of the floating panel.
 */
export function unregisterOpenFloatingPanel(id: symbol): void {
    const index = openFloatingPanels.findIndex((entry) => entry.id === id);

    if (index >= 0) {
        openFloatingPanels.splice(index, 1);
    }
}
