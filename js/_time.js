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
        var hours, minutes;
        var currHours, currMinutes;
        var subButton;

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
            } else {
                hours = time.hours;
                minutes = time.minutes;
            }
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

                var timePickerBodyHours = $('<div>', {
                    'class': 'timePicker-hours'
                });

                var timePickerBodyMinutes = $('<div>', {
                    'class': 'timePicker-minutes'
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
                elem.append(closeButton, timePickerBodyHours, timePickerBodyMinutes, subButton);
                $this.append(input, clockButton, elem);
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

