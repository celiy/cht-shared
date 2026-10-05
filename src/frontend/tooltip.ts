import { DEFAULT_DELAY, resolveShowDelay } from "./tooltipDelay.js";

type DirectiveBinding<T> = {
    value?: T;
};

let tooltipEl: HTMLElement | null = null;
let tooltipUsers = 0;

type TooltipPlacement = "top" | "bottom" | "left" | "right" | "center";
type TooltipBinding = string | TooltipOptions;
type TooltipOptions = {
    content: string;
    placement?: TooltipPlacement;
    html?: boolean;
    offset?: number;
    maxWidth?: string;
    /** Show delay in ms. Default 100. Use 0 for immediate. */
    delay?: number;
};

const DEFAULT_OFFSET = 6;

type TooltipTarget = HTMLElement & {
    _tooltipOptions?: TooltipOptions;
    _tooltipMouseEnter?: () => void;
    _tooltipMouseLeave?: () => void;
    _tooltipShowTimer?: number | null;
};

/**
 * Create tooltip
 * @param {string} maxWidth The max width of the tooltip.
 * @returns {HTMLElement} The tooltip element.
 */
function createTooltip(maxWidth = "16rem"): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("role", "tooltip");
    el.classList.add("tooltip-background");
    el.style.cssText = `
        position: fixed;
        z-index: 100000;
        max-width: ${maxWidth};
        padding: 0.35rem 0.6rem;
        font-size: 0.8125rem;
        line-height: 1.25;
        color: var(--color-secondary-foreground, #fff);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        pointer-events: none;
        white-space: normal;
        word-wrap: break-word;
        opacity: 0;
        transition: opacity 0.15s ease;
        box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -2px var(--color-shadow);
    `;
    document.body.appendChild(el);

    return el;
}

/**
 * Normalize options
 * @param {TooltipBinding} bindingValue The binding value.
 * @returns {TooltipOptions} The normalized options.
 */
function normalizeOptions(bindingValue: TooltipBinding): TooltipOptions {
    if (typeof bindingValue === "string") {
        return {
            content: bindingValue,
            placement: "top",
            html: false,
            offset: DEFAULT_OFFSET,
            maxWidth: "16rem",
            delay: DEFAULT_DELAY
        };
    }

    return {
        content: bindingValue?.content ?? "",
        placement: bindingValue?.placement ?? "top",
        html: Boolean(bindingValue?.html),
        offset: bindingValue?.offset ?? DEFAULT_OFFSET,
        maxWidth: bindingValue?.maxWidth ?? "16rem",
        delay: resolveShowDelay(bindingValue?.delay)
    };
}

/**
 * Set tooltip content
 * @param {TooltipOptions} options The options.
 */
function setTooltipContent(options: TooltipOptions) {
    if (!tooltipEl) {
        return;
    }

    if (options.html) {
        tooltipEl.innerHTML = options.content;
    } else {
        tooltipEl.textContent = options.content;
    }
}

/**
 * Show tooltip
 * @param {HTMLElement} el The element to show the tooltip for.
 * @param {TooltipOptions} options The options.
 */
function show(el: HTMLElement, options: TooltipOptions) {
    if (!options.content) {
        return;
    }

    tooltipEl = tooltipEl || createTooltip(options.maxWidth);
    tooltipEl.style.maxWidth = options.maxWidth ?? "16rem";
    setTooltipContent(options);
    void tooltipEl.offsetWidth;
    tooltipEl.style.opacity = "1";

    const rect = el.getBoundingClientRect();
    const tipRect = tooltipEl.getBoundingClientRect();
    const gap = options.offset ?? DEFAULT_OFFSET;

    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    let top = rect.top - tipRect.height - gap;

    if (options.placement === "bottom") {
        top = rect.bottom + gap;
    } else if (options.placement === "left") {
        left = rect.left - tipRect.width - gap;
        top = rect.top + rect.height / 2 - tipRect.height / 2;
    } else if (options.placement === "right") {
        left = rect.right + gap;
        top = rect.top + rect.height / 2 - tipRect.height / 2;
    } else if (options.placement === "center") {
        left = rect.left + rect.width / 2 - tipRect.width / 2;
        top = rect.top + rect.height / 2 - tipRect.height / 2;
    }

    if (left < 8) {
        left = 8;
    }

    if (left + tipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tipRect.width - 8;
    }

    if (top < 8) {
        top = rect.bottom + gap;
    }

    if (top + tipRect.height > window.innerHeight - 8) {
        top = window.innerHeight - tipRect.height - 8;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
}

/**
 * Hide tooltip
 */
function hide() {
    if (tooltipEl) {
        tooltipEl.style.opacity = "0";
    }
}

/**
 * Clear show timer
 * @param {TooltipTarget} target The target.
 */
function clearShowTimer(target: TooltipTarget) {
    if (target._tooltipShowTimer == null) {
        return;
    }

    window.clearTimeout(target._tooltipShowTimer);
    target._tooltipShowTimer = null;
}

export default {
    /**
     * Mounted
     * @param {HTMLElement} el The element to mount the tooltip for.
     * @param {DirectiveBinding<TooltipBinding>} binding The binding.
     */
    mounted(el: HTMLElement, binding: DirectiveBinding<TooltipBinding>) {
        const target = el as TooltipTarget;
        target._tooltipOptions = normalizeOptions(binding.value ?? "");

        target._tooltipMouseEnter = () => {
            clearShowTimer(target);
            const options = target._tooltipOptions ?? normalizeOptions("");
            const delay = resolveShowDelay(options.delay);

            if (delay === 0) {
                show(target, options);

                return;
            }

            target._tooltipShowTimer = window.setTimeout(() => {
                target._tooltipShowTimer = null;
                show(target, target._tooltipOptions ?? options);
            }, delay);
        };

        target._tooltipMouseLeave = () => {
            clearShowTimer(target);
            hide();
        };

        target.addEventListener("mouseenter", target._tooltipMouseEnter);
        target.addEventListener("mouseleave", target._tooltipMouseLeave);
        tooltipUsers += 1;
    },

    /**
     * Updated
     * @param {HTMLElement} el The element to update the tooltip for.
     * @param {DirectiveBinding<TooltipBinding>} binding The binding.
     */
    updated(el: HTMLElement, binding: DirectiveBinding<TooltipBinding>) {
        const target = el as TooltipTarget;
        target._tooltipOptions = normalizeOptions(binding.value ?? "");
    },

    /**
     * Unmounted
     * @param {HTMLElement} el The element to unmount the tooltip for.
     */
    unmounted(el: HTMLElement) {
        const target = el as TooltipTarget;
        clearShowTimer(target);

        if (target._tooltipMouseEnter) {
            target.removeEventListener("mouseenter", target._tooltipMouseEnter);
        }

        if (target._tooltipMouseLeave) {
            target.removeEventListener("mouseleave", target._tooltipMouseLeave);
        }

        tooltipUsers = Math.max(0, tooltipUsers - 1);

        if (tooltipUsers > 0) {
            hide();

            return;
        }

        if (tooltipEl?.parentNode) {
            tooltipEl.parentNode.removeChild(tooltipEl);
        }

        tooltipEl = null;
    }
};
