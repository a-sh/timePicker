/*
* TODO
     Кнопка OK на time-селекторе нефункциональна. Т.е. предполагается что по OK выбранное время сохранится в текстбоксе, но если я нажимаю крестик - происходит то же самое.        Желательно либо исправить проблему с крестиком либо убрать кнопку OK.
     Сейчас можно ввести 99:99:99
     Добавить валидацию времени, если время введено в неверном формате - выводить юзеру ошибку
     Добавить подсказку с форматом в случае когда textbox пуст.
     Добавить кнопку которая выводила бы в консоль время из компонента
     Если время в textbox-е некорректное, то компонент должен выводить в консоль последнее корректное время
     Пустое значение не должно вызвать ошибку. Если время не задано, то в консоль также нужно выводить что время не задано.
     Добавить кнопку которая выставляла бы время в 17:00
     Добавить возможность задавать секунды. Секунды должны быть опциональными.
*
* */

// ^([0-1][0-9]|[2][0-3]):([0-5][0-9])$  для валидации времени в формате чч:мм

// ^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)  для валидации времени в формате чч:мм

// ^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)(:[0-5]\d)  для валидации времени в формате чч:мм:сс

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
        var hm = /^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)/; // hours, minutes
        var hms = /^(0[0-9]|1[0-9]|2[0-3])(:[0-5]\d)(:[0-5]\d)/; // hours, minutes, seconds
        var lastCorrectTime = '';

        $(self).on('timeChanged', function(e) {
            console.log(e.value);
        });

        drawHTML();

        /**
         *
         * @param time - Date-объект или объект вида {hours:XX, minutes: XX}
         */
        function parseTime(time) {
            if(time instanceof Date) {
                hours = time.getHours();
                minutes = time.getMinutes();
                seconds = time.getSeconds() || '';
            } else {
                hours = time.hours;
                minutes = time.minutes;
                seconds = time.seconds || '';
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


        /**
         *
         * @param newTime новое (или нет?) время
         * @param zZz булево значение. true - "спим" и не вызываем событие, false - "огонь" =)
         */
        this.setTime = function(newTime, zZz) {
            parseTime(newTime);

            /* Изменилось ли время? обновляем, если да */
            if(currHours != hours || currMinutes != minutes) {
                if(subButton.attr('disabled')) subButton.attr('disabled', false);
                currHours = hours;
                currMinutes = minutes;
                input.val((hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes));
            } else {
                subButton.attr('disabled', true); /* блокируем кнопку, если время не менялось */
            }

            if(!zZz) {
                $(self).triggerHandler({
                    type: "timeChanged",
                    value: new Date(2012, 12, 16, hours, minutes)
                });
            }
        };

        self.setTime(options);

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
                    type: 'text'
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
                    (secondsEnabled = this.checked) ? timePickerBodySeconds.fadeIn() : timePickerBodySeconds.fadeOut();
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
                    text: 'ok'
                }).on('click', function(e) {
                    var time = input.val();
                    var hours = +time.slice(0,2);
                    var minutes = +time.slice(3,5);
                    self.setTime({
                        hours: hours,
                        minutes: minutes
                    });
                    hideTimepicker();
                });

                var closeButton = $('<span>',{
                    'class': 'timePicker-closeButton',
                    text: '×'
                }).on('click', hideTimepicker);

                createElements(24, 1, timePickerBodyHours, 'timePicker-hours__item');
                createElements(60, 5, timePickerBodyMinutes, 'timePicker-minutes__item');
                createElements(60, 5, timePickerBodySeconds, 'timePicker-seconds__item');
                secondsTick.appendTo(secondsTickLabel);
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

            self.setTime({
                hours: hours,
                minutes: minutes
            }, true);
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
            new Timepicker(this, options);
        });
    };
})(jQuery, window, document);

