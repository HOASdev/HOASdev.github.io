(function (window, document, $, undefined) {

    // plugin variable
    var plugin = function(){};

    var version = "1.0.0";

    plugin.init = function() 
    {
        // plugin.fbEnsureInit(function (twttr) {
        //     FB.Event.subscribe('message.send', plugin.after_facebook_share);
        // });
        
        // twttr.ready(function (twttr) {
        //     twttr.events.bind('tweet', plugin.after_tweet);
        // });

        // bind to facebook init
        plugin.fbEnsureInit(plugin.fbEnsureInitCallback);

        // bind to twitter init
        plugin.twttrEnsureInit(plugin.twttrEnsureInitCallback);
        
        $(document).on('click', 'a.tweet, .social-links .tweet a, .social-links .tweet-custom a, .social-links .retweet a', plugin.tweet);
        $(document).on('click', 'a.fb-share, .social-links .facebook-share a, .social-links .facebook-like-custom a', plugin.facebook_share);
        
    };


    plugin.fbEnsureInitCallback = function () {
        window.FB.Event.subscribe('message.send', plugin.after_facebook_share);
    };

    plugin.twttrEnsureInitCallback = function () {
        window.twttr.ready(plugin.twitterReady);
    };

    plugin.twitterReady = function (twttr) {
        twttr.events.bind('tweet', plugin.after_tweet);
    };

    plugin.fbEnsureInit = function(callback) {
        if(typeof window.FB === 'undefined' || typeof window.FB.Event === 'undefined'){
            setTimeout(function() {
                plugin.fbEnsureInit( callback );
            }, 100);
        }else if(typeof callback === 'function') {
            callback.call();
        }
    };

    plugin.twttrEnsureInit = function(callback) {
        if(typeof window.twttr === 'undefined' || typeof window.twttr.ready === 'undefined'){
            setTimeout(function() {
                plugin.twttrEnsureInit( callback );
            }, 100);
        }else if(typeof callback === 'function') {
            callback.call();
        }
    };


    
    plugin.after_facebook_share = function(url) 
    {
        // check if the original_url was set
        if (plugin.original_url != undefined && plugin.original_url != null) {
            url = plugin.original_url;
            plugin.original_url = null;
        };

        var path = url.replace(plugin.get_root_url(), '');
        $.bw.log_social('facebook', 'share', url, path);
    };
    
    plugin.after_tweet = function(intent_event) 
    {
        $('.tweet_initialized').removeClass('tweet_initialized');
        
        if (intent_event) {
            var url;
            
            // if (intent_event.target && intent_event.target.nodeName == 'IFRAME')
            //     url = extractParamFromUri(intent_event.target.src, 'url');
            
            // check if the original_url was set
            if (plugin.original_url != undefined && plugin.original_url != null) {
                url = plugin.original_url;
                plugin.original_url = null;
            };
            
            var path = url.replace(plugin.get_root_url(), '');
            $.bw.log_social('twitter', 'tweet', url, path);
        }
    };

    plugin.tweet = function(event) 
    {
        plugin.original_url = null;
        
        if ($(this).attr('data-original_url') != undefined) 
            plugin.original_url = $(this).attr('data-original_url');
        
        var url = '';
        if( $(this).attr('data-url') != undefined && $(this).attr('data-url') != '' ){
            url = $(this).attr('data-url');
        }else{
            url = plugin.get_full_url(true);
        }
        
        var related = $(this).attr('data-related');
        var via = $(this).attr('data-via');
        var hashtags = $(this).attr('data-hashtags');
        
        var text = '';
        if( $(this).attr('data-text') != undefined && $(this).attr('data-text') != '' ){
            text = $(this).attr('data-text');
        }else{
            text = plugin.get_url_title(true);
            if (text == '') text = document.title;
        }
        
        if ( $.bw.is_ios5_up() ) {
            var base_url = 'twitter://post';
            var tweet_url = base_url + '?text=' + encodeURIComponent(text + ' ' + url);
            if (typeof stringValue == 'string')
                tweet_url += ' #' + hashtags.replace(',', ' #');
        }else{
            var base_url = 'https://twitter.com/intent/tweet';
            var args = {
                'url': encodeURIComponent(url),
                'text': encodeURIComponent(text),
                'related': related,
                'via' : via,
                'hashtags': hashtags
            };
            var tweet_url = $.bw.array_to_url( base_url, args);
        }

        $(this).attr('href', tweet_url);
        
    };
    
    plugin.facebook_share = function(event) 
    {
        event.preventDefault();

        plugin.original_url = null;
        if ($(this).attr('data-original_url') != undefined) 
            plugin.original_url = $(this).attr('data-original_url');

        var url = '';
        if( $(this).attr('data-url') != undefined && $(this).attr('data-url') != '' ){
            url = $(this).attr('data-url');
        }else{
            url = plugin.get_full_url(true);
        }

        var title = '';
        if( $(this).attr('data-title') != undefined && $(this).attr('data-title') != '' ){
            title = $(this).attr('data-title');
        }else{
            title = plugin.get_url_title(true);
            if (title == '') title = document.title;
        }

        var picture = '';
        if( $(this).attr('data-img') != undefined && $(this).attr('data-img') != '' ){
            picture = $(this).attr('data-img');
        }else if( $('body').data('logo') != undefined ){
            picture = $('body').data('logo');
        }

        var description = '';
        if( $(this).attr('data-description') != undefined && $(this).attr('data-description') != '' ){
            description = $(this).attr('data-description');
        }else if( $('#container .level2 .post-content').length > 0 ){
            description = $('#container .level2 .post-content').first().text();
        }else if( $('#container [data-ajax_replace_id="content-single"] .main .post-content').length > 0 ){
            description = $('#container [data-ajax_replace_id="content-single"] .main .post-content').first().text();
        }else{
            description = $('body').attr('data-blog_description');
        }

        var obj = {
            method: 'feed',
            link: url,
            picture: picture,
            caption: $('body').attr('data-blog_name'),
            name: title,
            description: description,
            display: 'popup'
        };
        
        FB.ui(obj, function(response) {
            if (response && response.post_id) {
                // alert('Post was published.');
                plugin.after_facebook_share(plugin.original_url);
            } else {
                // alert('Post was not published.');

            }
        });
        
        return false;
    };
    
    
    
    plugin.tweet_old = function(event) 
    {
        event.preventDefault();

        var related = $(this).attr('data-related');
        
        var State = History.getState();
        var url = '';
        if ( $(this).parents('.retweet').length > 0 ) {
            url = '';
        }else if( $(this).attr('data-url') != undefined && $(this).attr('data-url') != '' ){
            url = $(this).attr('data-url');
        }else{
            url = State.url.replace(/([^\/])$/, '$1/').replace(/\/\#([^\/]*)\/$/, '/$1/').replace('./', '');
        }

        var text = '';
        if( $(this).attr('data-text') != undefined && $(this).attr('data-text') != '' ){
            text = $(this).attr('data-text');
        }else{
            text = encodeURIComponent(State.title.replace(' | ' + $('body').attr('data-blog_name'), ''));
        }

        var tweet_win_url = 'https://twitter.com/share?url=' + url + '&text=' + text;
        if (related != undefined && related != '') {
            tweet_win_url += '&related=' + related;
        };

        var  screenX    = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
             screenY    = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
             outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
             outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
             width    = 500,
             height   = 300,
             left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
             top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
             features = (
                'width=' + width +
                ',height=' + height +
                ',left=' + left +
                ',top=' + top
             );

        var tweet_win = window.open(tweet_win_url,'Tweet',features);

        if (window.focus) {
            tweet_win.focus()
        }

        return false;
    };
    
    
    /** 
     * ---------------------------------------------------------------------------
     * 
     * History utilities
     * 
    ** -------------------------------------------------------------------------*/
    
    plugin.get_root_url = function() 
    {
        if (plugin.root_url == undefined) {
            return plugin.root_url = History.getRootUrl().replace(/\/$/, '').replace(/\/\#([^\/]*)[\/]?$/, '');
        }else return plugin.root_url;
    };

    plugin.get_full_url = function(get_new) 
    {
        if (plugin.full_url == undefined || get_new) {
            var State = History.getState();
            var url = State.url.replace(/([^\/])$/, '$1/').replace(/\/\#([^\/]*)\/$/, '/$1/').replace('./', '');
            return plugin.full_url = url;
        }else return plugin.full_url;
    };

    plugin.get_relative_url = function(get_new) 
    {
        if (plugin.relative_url == undefined || get_new) {
            var url = plugin.get_full_url(get_new);
            url = url.replace(plugin.get_root_url(), '');
            if (url == '') url = '/';
            return plugin.relative_url = url;
        }else return plugin.relative_url;
    };

    plugin.get_url_title = function(get_new) 
    {
        if (plugin.url_title == undefined || get_new) {
            var State = History.getState();
            return plugin.url_title = State.title;
        }else return plugin.url_title;
    };


    /**
     * Set plugin as attribute to the jQuery namespace
    **/
    $.bw = $.bw || function(){};
    $.bw.social = plugin;

}(window, document, jQuery));