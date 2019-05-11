import { on } from "./utils";

export default class Toggle {
    el: Element;
    activeClassName: string | string[];

    constructor(el: Element, activeClassName: string | string[] = 'active') {
        this.el = el;
        this.activeClassName = activeClassName;

        this.initialize();
    }

    initialize() {
        on(this.el, 'click', () => {
            if (Array.isArray(this.activeClassName)) {
                this.activeClassName
                    .forEach(className => this.el.classList.toggle(className));
            } else {
                this.el.classList.toggle(this.activeClassName);
            }
            
        });
    }
}