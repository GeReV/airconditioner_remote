import { on, $ } from "./utils";
import Toggle from "./toggle";

import '../scss/index.scss';

on(document, 'DOMContentLoaded', () => {
    new Toggle($('#power'), 'active');
});