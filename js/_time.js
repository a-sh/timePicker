(function($, window, document, undefined) {

    /**
     *
     * @param element
     * @param options - Date-объект или объект вида {hours:XX, minutes: XX}
     * @constructor
     */
    function Timepicker(element, options) {
        var self = this;
        var $this = $(element);
        var elem;
        var input;
        var hours, minutes, seconds;
        var currHours, currMinutes, currSeconds;
        var subButton;
        var secondsEnabled = false;
        var hm = /^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)$/; // hours, minutes
        var hms = /^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)(:[0-5]\d)$/; // hours, minutes, seconds
        var lastCorrectTime = '';

        $(self).on('timeChanged', function(e) {
            console.log(e.value);
        });

        drawHTML();

        /**
         *
         * @param newTime новое (или нет?) время
         * @param zZz булево значение. true - "спим" и не вызываем событие, false - "огонь" =)
         */
        this.setTime = function(newTime, zZz) {
            parseTime(newTime);

            /* Изменилось ли время? обновляем, если да */
            if(currHours != hours || currMinutes != minutes || currSeconds != seconds) {
                if(subButton.attr('disabled')) subButton.attr('disabled', false);
                currHours = hours;
                currMinutes = minutes;
                currSeconds = seconds;
                input.val(makeTimeString());
            } else {
                subButton.attr('disabled', true); /* блокируем кнопку, если время не менялось */
            }

            if(!zZz) {
                lastCorrectTime = makeTimeString();
                $(self).triggerHandler({
                    type: "timeChanged",
                    value: new Date(2012, 11, 16, hours, minutes, seconds)
                });
            }
        };

        /**
         * Возвращает время
         * @return {String}
         */
        this.getTime = function() {
            return makeTimeString();
        };


        self.setTime(options);

        /**
         *
         * @param time - Date-объект или объект вида {hours:XX, minutes: XX}
         */
        function parseTime(time) {
            if(time instanceof Date) {
                hours   = time.getHours();
                minutes = time.getMinutes();
                seconds = time.getSeconds();
            } else if(typeof time === 'string') {
                hours   = +time.slice(0, 2);
                minutes = +time.slice(3, 5);
                seconds = +time.slice(6, 8);
            } else {
                hours   = time.hours;
                minutes = time.minutes;
                seconds = time.seconds || 0;
            }
        }
        /**
         * Проверяет валидность введенного времени, возвращает булево значение
         *
         * @param time
         * @return {*}
         */
        function isValidTime(time) {
            if(secondsEnabled) {
                return time.match(hms);
            }
            return time.match(hm);
        }


        function validateTime(time, zzz) {
            var incorrectTime = $('.error');
            if(time == ''){
                console.warn('Время не задано');
                if(incorrectTime.is(':visible')) incorrectTime.slideUp();
                return;
            }
            if(!isValidTime(time)){
                if(!incorrectTime.length){
                    $('<div>', {
                        'class': 'error',
                        text: 'Введено некорректное время'
                    }).insertBefore(input).slideDown();
                }
                incorrectTime.slideDown();
                console.log('Последнее корректно введенное время: ' + lastCorrectTime);
            } else {
                if(incorrectTime.length && incorrectTime.is(':visible')){
                    incorrectTime.slideUp();
                }
                self.setTime(time, zzz);
            }
        }

        /**
         * создает форму вывода заданного времени в поле
         * @return {String}
         */
        function makeTimeString() {
            var sec;

            if(secondsEnabled) {
                sec = seconds < 10 ? ':0' + seconds : ':' + seconds;
            } else {
                sec = '';
            }

            return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + sec;
        }

        function showTimepicker () {
            elem.fadeIn();
        }

        function hideTimepicker () {
            elem.fadeOut();
        }

        /**
         * Создает элементы и добавляет их в DOM
         */
        function drawHTML() {
            if (!elem) {
                elem = $('<div>', {
                    'class': 'timePicker-body'
                }).on('click', '.timePicker__item', onTimeElemClick);

                input = $('<input>', {
                    'class':'time',
                    type: 'text',
                    placeholder: 'hh:mm'
                }).on('keyup', function() {
                    validateTime(this.value);
                });

                var clockButton = $('<span>', {
                    'class': 'clockButton'
                }).on('click', showTimepicker);

                var secondsTickLabel = $('<label>', {
                   'class': 'sec-switcher-wrap',
                    text: 'Показать секунды'
                });

                var secondsTick = $('<input>', {
                   type: 'checkbox',
                   'class': 'sec-switcher'
                }).on('click', function(){
                    if(secondsEnabled = this.checked) {
                        timePickerBodySeconds.fadeIn();
                        input.attr('placeholder', 'hh:mm:ss');
                        if(input.val()){
                            input.val(input.val() + ':' + (seconds || '00'))
                        }
                    } else {
                        timePickerBodySeconds.fadeOut();
                        input.attr('placeholder', 'hh:mm');
                        if(input.val()) {
                            input.val(input.val().slice(0, 5))
                        }
                    }
                });

                var timePickerBodyHours = $('<div>', {
                    'class': 'timePicker-hours'
                });

                var timePickerBodyMinutes = $('<div>', {
                    'class': 'timePicker-minutes'
                });

                var timePickerBodySeconds = $('<div>', {
                    'class': 'timePicker-seconds'
                });

                subButton = $('<button>', {
                    'class': 'timePicker-setTimeButton',
                    text: 'ok',
                    disabled: 'true'
                }).on('click', function(e) {
                    var time = input.val();
                    var hours = +time.slice(0,2);
                    var minutes = +time.slice(3,5);
                    self.setTime({
                        hours: hours,
                        minutes: minutes,
                        seconds: seconds
                    });
                    hideTimepicker();
                });

                var closeButton = $('<span>',{
                    'class': 'timePicker-closeButton',
                    text: '×'
                }).on('click', function() {
                        hideTimepicker();
                        input.val(lastCorrectTime);
                });

                createElements(24, 1, timePickerBodyHours, 'timePicker-hours__item');
                createElements(60, 5, timePickerBodyMinutes, 'timePicker-minutes__item');
                createElements(60, 5, timePickerBodySeconds, 'timePicker-seconds__item');
                secondsTick.prependTo(secondsTickLabel);
                elem.append(closeButton, timePickerBodyHours, timePickerBodyMinutes, timePickerBodySeconds, subButton);
                $this.append(input, clockButton, secondsTickLabel, elem);
            }
        }

        /**
         * Изменяет значение часов/минут и устанавливает время
         *
         * @param e - событие
         */
        function onTimeElemClick(e) {
            var target = $(e.target);
            if(target.hasClass('timePicker-hours__item')) {
                hours = +target.text();
            }

            if(target.hasClass('timePicker-minutes__item')) {
                minutes = +target.text();
            }

            if(target.hasClass('timePicker-seconds__item')) {
                seconds = +target.text();
            }
            validateTime(makeTimeString(), true);

            /*self.setTime({
                hours: hours,
                minutes: minutes,
                seconds: seconds
            }, true);*/
        }

        /**
         * Функция создает элементы и добавляет их к указанному родителю
         *
         * @param doTill - условие цикла
         * @param step - шаг
         * @param parent - элемент-родитель, к которому добавляюется созданные элементы
         * @param className - css-класс, который присваивается элементу
         */
        function createElements(doTill, step, parent, className) {
            for(var i = 0; i < doTill; i += step) {
                $('<span></span>', {'class':'timePicker__item ' + className})
                    .appendTo(parent)
                    .text(i < 10 ? '0' + i : i);
            }
        }

    }

    $.fn.time = function(options) {
        return this.each(function() {
            var elem = $(this);
            if(elem.data('timePicker')) return;
            var timePicker = new Timepicker(this, options);
            elem.data('timePicker', timePicker);
        });
    };
})(jQuery, window, document);

