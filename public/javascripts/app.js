!(function() {
    'use strict';

    function setState(state) {
        $('#power')
          .toggleClass('active', state.on)
          .attr('data-command', 'power-' + (state.on ? 'off' : 'on'));

        $('.temperature .digital').spinner('update', state.temp);

        $('.mode-' + state.mode).button('toggle');

        $('.fan-' + state.fan).button('toggle');

        $('.timer-on .info').toggleClass('hidden', !state.timerOn);
        $('.timer-on .label').html('Timer set for ' + formatTime(state.timerOn));

        $('.timer-off .info').toggleClass('hidden', !state.timerOff);
        $('.timer-off .label').html('Timer set for ' + formatTime(state.timerOff));

    }

    function formatTime(date) {
        if (!date) {
          return;
        }

        var now = new Date(),
            mins = Math.round((new Date(date).getTime() - now.getTime()) / 1000 / 60);

        return mins + ' minute' + (mins === 1 ? '' : 's') + ' from now';
    }

    function showAlert() {
        var alert = $('.alert');

        alert.removeClass('alert-hidden');

        setTimeout(function () {
            alert.addClass('alert-hidden');
        }, 2000);
    }

    function sendCommand(url, data) {
        $.post(url, data)
          .done(setState)
          .done(showAlert);
    }

    $(function () {

      $.fastButton('button', function () {
        $(this).trigger('click');
        return false;
      });

      $('.temperature .digital')
        .on('spin', $.debounce(300, function (e, value) {
          sendCommand('remote/temp-' + value);
        }))
        .spinner({
          up: '.temperature .up',
          down: '.temperature .down',
          start: 25,
          min: 12,
          max: 32
        });

      var timerOptions = {
        start: 0,
        min: 0,
        max: 60,
        step: 5,
        format: function (v) {
          return v < 10 ? '0' + v : v;
        }
      };

      $('.timer-on .digital').spinner($.extend(timerOptions, {
        up: '.timer-on .up',
        down: '.timer-on .down',
      }));

      $('.timer-off .digital').spinner($.extend(timerOptions, {
        up: '.timer-off .up',
        down: '.timer-off .down'
      }));

      $('.timer-set').on('click', function () {
          parent = $(this).closest('.timer');

          var match = /timer-(on|off)/.exec(parent.get(0).className)[1];

          sendCommand('remote/timer/' + match, { time: parent.find('.digital').html() }); // How do I get the value correctly?
      });

      $('.timer-clear').on('click', function () {
          parent = $(this).closest('.timer');

          var match = /timer-(on|off)/.exec(parent.get(0).className)[1];

          sendCommand('remote/timer/' + match + '/clear');
      });

      $('[data-command]').on('click', function() {
        sendCommand('remote/' + $(this).attr('data-command'));
      });

      $.getJSON('remote').done(setState);
  });
})();
