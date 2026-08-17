const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const openModalStack: symbol[] = [];

/**
 * Whether the event target is an editable field where letter keybinds
 * should not run.
 *
 * @param event Keyboard event to inspect
 * @returns True when the user is typing in an input-like element
 */
export function isTypingTarget(event: KeyboardEvent): boolean {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (TYPING_TAGS.has(target.tagName)) {
        return true;
    }

    if (target.isContentEditable) {
        return true;
    }

    return false;
}

/**
 * Whether a keyboard event matches a key name such as `"s"` or `"Escape"`.
 * Letter keys are case-insensitive and ignore Ctrl, Alt and Meta.
 *
 * @param event Keyboard event to inspect
 * @param key Expected key name
 * @returns True when the event matches the key
 */
export function matchesKey(event: KeyboardEvent, key: string): boolean {
    if (event.defaultPrevented) {
        return false;
    }

    if (key === "Escape") {
        return event.key === "Escape";
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
        return false;
    }

    return event.key.toLowerCase() === key.toLowerCase();
}

/**
 * Push an open modal onto the Escape-handling stack.
 *
 * @param id Unique layer id for the modal instance
 */
export function pushModalLayer(id: symbol): void {
    if (openModalStack.includes(id)) {
        return;
    }

    openModalStack.push(id);
}

/**
 * Remove a modal from the Escape-handling stack.
 *
 * @param id Unique layer id for the modal instance
 */
export function popModalLayer(id: symbol): void {
    const index = openModalStack.lastIndexOf(id);

    if (index >= 0) {
        openModalStack.splice(index, 1);
    }
}

/**
 * Whether this modal is the topmost open layer (should receive Escape).
 *
 * @param id Unique layer id for the modal instance
 * @returns True when this id is last in the stack
 */
export function isTopModalLayer(id: symbol): boolean {
    return openModalStack[openModalStack.length - 1] === id;
}
