(function (window, document, $, undefined) {

    // plugin variable
    var plugin = function(){};

    /**
     * ---------------------------------------------------------------------------
     *
     * private vars
     *
    ** -------------------------------------------------------------------------*/
    var version = "1.0.0";

    plugin.init = function()
    {
        plugin.gesture_events_init();
        plugin.get_click_event();
    }

    plugin.get_click_event = function() {
        if (plugin.click_event != undefined) return plugin.click_event;

        if ( $.bw.is_touch_screen() ) {
            $('html').attr('data-touchscreen', true);
            plugin.click_event = 'tap';
        }else{
            plugin.click_event = 'click';
        }

        return plugin.click_event;
    };

    plugin.gesture_events_init = function()
    {
        $(window).on('touchstart', function(event){

            if(event.originalEvent.changedTouches.length != 1) return; // Only deal with one finger

            var touch = event.originalEvent.changedTouches[0];  // Get the information for finger #1
            var $TARGET = $(touch.target); // Find the node the drag started from

            $TARGET.addClass('tapped');

            $TARGET.data('touchstart_x', touch.pageX);
            $TARGET.data('touchstart_y', touch.pageY);
            $TARGET.data('touchstart_timestamp', event.originalEvent.timeStamp);
        });

        $(window).on('touchmove', function(event) {

        });

        $(window).on('touchend', function(event) {

            if(event.originalEvent.changedTouches.length != 1) return; // Only deal with one finger

            var touch = event.originalEvent.changedTouches[0];  // Get the information for finger #1
            var $TARGET = $(touch.target); // Find the node the drag started from

            $('.tapped').removeClass('tapped');

            var touchstart_x = $TARGET.data('touchstart_x');
            var touchstart_y = $TARGET.data('touchstart_y');
            var touchstart_timestamp = $TARGET.data('touchstart_timestamp');

            var distance_x = touch.pageX - touchstart_x;
            var distance_y = touch.pageY - touchstart_y;

            var time = ( event.originalEvent.timeStamp - touchstart_timestamp ); // in msec
            var distance_threshold = 5; // px
            var time_threshold = 500; // ms

            if (distance_x < distance_threshold && distance_x > -distance_threshold && distance_y < distance_threshold && distance_y > -distance_threshold) {
                if (time < time_threshold) {
                    $TARGET.trigger('tap');
                }
            }

        });

    };


    /**
     * Set plugin as attribute to the jQuery namespace
    **/
    $.bw = $.bw || function(){};
    $.bw.touch = plugin;

}(window, document, jQuery));
