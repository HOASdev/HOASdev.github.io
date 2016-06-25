(function (window, document, $, undefined) {

    // plugin variable
    var plugin = function(){};
    var version = "1.0.0";

    
    /** 
     * ---------------------------------------------------------------------------
     * 
     * Form Checkboxes and Radio Styling
     * 
    ** -------------------------------------------------------------------------*/
    plugin.form_style_initiated = false;
    plugin.form_style_init = function() 
    {
        $('input[type="radio"]:not(.styled_input)').each(function(index,input){
            $(input).addClass('styled_input');
            $(input).siblings('label').addClass('label_radio');
            plugin.update_check_label($(input));
        });
        $('input[type="checkbox"]:not(.styled_input)').each(function(index,input){
            $(input).addClass('styled_input');
            $(input).siblings('label').addClass('label_checkbox');
            plugin.update_check_label($(input));
        });
        if (!plugin.form_style_initiated) {
            $(document).on( 'change', 'input.styled_input', plugin.update_check_label );
            $(document).on( 'focus', 'input.styled_input', plugin.update_check_label );
            $(document).on( 'blur', 'input.styled_input', plugin.update_check_label );
            $(document).on('gform_post_render', plugin.form_style_init);
            plugin.form_style_initiated = true;
        };
    };

    plugin.update_check_label = function(event) 
    {
        if (event instanceof $) {
            var $input = $(event);
        }else{
            var $input = $(event.target);
        }
        var $label = $input.siblings('label');

        switch (event.type){
            case 'focusin':
                $label.addClass('focus');
                break;
            case 'focusout':
                $label.removeClass('focus');
                break;
            default: 
                if ( $input.is(':checked') ) {
                    $label.addClass('on');
                }else{
                    $label.removeClass('on');
                }
                break;
        }
    };


    /** 
     * ---------------------------------------------------------------------------
     * 
     * HR Styles for IE
     * 
    ** -------------------------------------------------------------------------*/
    plugin.hr_style_fix = function() 
    {
        if ($.bw.is_ie()) {
            var hr_classes;
            $('hr').each(function(index,hr){
                hr_classes = $(hr).attr('class') + ' hr';
                $(hr).replaceWith('<span class="' + hr_classes + '"></span>');
            });
        }
    };


    plugin.defaultvalue_initiated = false;
    plugin.defaultvalue_init = function() {
        $('[placeholder]').defaultValue();
        if (!plugin.defaultvalue_initiated) {
            $(document).on('gform_post_render', plugin.defaultvalue_init);
            plugin.defaultvalue_initiated = true;
        };
    };

    plugin.gform_init = function() 
    {
        gform_init_functions = window.gform_init_functions;
        if (gform_init_functions == undefined) return;
        for (var i=0; i < gform_init_functions.length; i++) {
            gform_init_functions[i]();
        };
    };

    plugin.init = function() 
    {
        $(document).on('aftershowcontent', plugin.render_formatting);
        plugin.render_formatting();
    }

    plugin.render_formatting = function() 
    {
        // default value for placeholders (IE compatibility)
        plugin.defaultvalue_init();

        // style checkboxes and radios
        plugin.form_style_init();
        
        // gravity forms init
        // plugin.gform_init();

    };
    

    /**
     * Set plugin as attribute to the jQuery namespace
    **/
    $.bw = $.bw || function(){};
    $.bw.formatting = plugin;

}(window, document, jQuery));