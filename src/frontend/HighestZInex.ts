export default function getHighestZIndex() {
    const visibleTags = [
        "div", "main", "header", "footer", "section", "article", "nav", "aside",
        "input", "textarea", "button", "select", "label", "span", "ul", "ol", "li",
        "p", "h1", "h2", "h3", "h4", "h5", "h6", "form", "table", "thead", "tbody", "tr", "td", "th",
        "img", "canvas", "video", "audio", "svg", "a", "details", "summary", "fieldset", "legend",
        "figure", "figcaption", "blockquote", "pre", "code", "progress", "meter", "output"
    ];

    let highest = Number.MIN_SAFE_INTEGER;
    let elems: Element[] = [];

    // Gather all elements of each visible tag
    visibleTags.forEach(tag => {
        elems = elems.concat(Array.from(document.getElementsByTagName(tag)));
    });

    for (let i = 0; i < elems.length; i++) {
        const style = window.getComputedStyle(elems[i], null);

        // Only count elements that are visible (display not none, visibility not hidden/collapse)
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.visibility === 'collapse'
        ) {
            continue;
        }

        const zindex = Number.parseInt(style.getPropertyValue("z-index"), 10);

        if (!isNaN(zindex) && zindex > highest) {
            highest = zindex;
        }
    }

    return highest;
}