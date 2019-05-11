export function $(selector: string, context: ParentNode = document) {
    return context.querySelector(selector);
}

export function $$(selector: string, context: ParentNode = document) {
    return Array.from(context.querySelectorAll(selector));
}

export function on(context: EventTarget, type: string, listener: EventListener, capture: boolean = false) {
    return context.addEventListener(type, listener, capture);
}

export function off(context: EventTarget, type: string, listener: EventListener, capture: boolean = false) {
    return context.removeEventListener(type, listener, capture);
}