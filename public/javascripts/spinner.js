!(function ($) {
    'use strict';

    var Spinner = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.spinner.defaults, options);
        
        this.value = this.options.start;
    };

    Spinner.prototype.init = function () {
        $(this.options.up).on('click', function () {
            this.value = Math.min(this.value + this.options.step, this.options.max);

            this.$element.trigger('spin', this.value);

            this.update();
        }.bind(this));

        $(this.options.down).on('click', function () {
            this.value = Math.max(this.value - this.options.step, this.options.min);

            this.$element.trigger('spin', this.value);

            this.update();
        }.bind(this));
    };

    Spinner.prototype.update = function () {
        this.$element.html(this.options.format(this.value));
    };

    Spinner.prototype.val = function () {
        return this.value;
    };

    $.fn.spinner = function (method, options) {
        if (typeof method === 'object') {
            options = method;
            method = null;
        }

        return this.each(function () {
            var $this = $(this),
                data = $this.data('spinner');

            if (!data) {
                $this.data('spinner', (data = new Spinner(this, options)));
            }

            if (data[method]) {
                return data[method].apply(data, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return data.init.apply(data, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.spinner');
            }
        });
    };

    $.fn.spinner.defaults = {
        up: null,
        down: null,
        step: 1,
        start: 0,
        min: Infinity,
        max: Infinity,
        format: function (value) {
            return value.toString();
        }
    };
})(window.jQuery);