(function (window, document, $, undefined) {


	var plugin = function(){};
	var version = "1.0.0";

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * BW JS FRAMEWORK INIT
	 *
	** -------------------------------------------------------------------------*/
	plugin.init = function()
	{
		// detect touch screens
		plugin.detect_touchscreen();

		// add orientation class to body
		plugin.mobile_orientation_class_init();

		// initialize mobile compatibility scroll
		plugin.mobile_scroll_init();

		// initialize mobile compatibility scroll
		plugin.debug_init();



		/**
		 * Setup Environment.. this starts all the animations
		**/
		plugin.env_init();

	};


	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Environment detect
	 *
	** -------------------------------------------------------------------------*/

	plugin.env = {};
	plugin.env_init = function()
	{
		// bind to throttled resize event

		// OPTION 1 /////
		// set threshold
		$.event.special.throttledresize.threshold = 1;
		var resize_event = 'throttledresize';
		if (plugin.is_mobile())
			resize_event = 'debouncedresize';
		$(window).on( resize_event, plugin.set_env );
		$(document).on( 'bw_env_set', plugin.set_env );


		// //// OPTION 2 /////
		// $.resize.delay = 50; // speed up resize event triggering
		// $(window).unbind('resize').bind('resize', plugin.set_env);

		// update environment right away
		plugin.set_env();

	};

	plugin.set_env = function(event)
	{
		if (plugin.mobile_ios && plugin.safari) {
			// alert('here');
			// iOS reliably returns the innerWindow size for documentElement.clientHeight
			// but window.innerHeight is sometimes the wrong value after rotating
			// the orientation
			var height = document.documentElement.clientHeight;
			plugin.env.h_raw = height;

			// Only add extra padding to the height on iphone / ipod, since the ipad
			// browser doesn't scroll off the location bar.
			if (plugin.mobile_iphone && !plugin.mobile_rawscreen && height != 320) height += 60;

			// fix detection script for iOS 7
			if ( navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i) ) {
				// console.log("IOS 7");
				height = window.innerHeight + 1;
			}

			plugin.env.h_full = plugin.env.h = height;

		} else if (plugin.mobile_android) {
			var height = window.innerHeight;
			plugin.env.h_raw = height;
			// The stock Android browser has a location bar height of 56 pixels, but
			// this very likely could be broken in other Android browsers.
			plugin.env.h_full = height + 56;
			// Android's browser adds the scroll position to the innerHeight, just to
			// make this really fucking difficult. Thus, we save the raw value of
			// the height in the env array, while the full height will be used for
			// scrolling on load to hide the nav bar.
			plugin.env.h = plugin.env.h_raw;
		}else{
			plugin.env.h_raw = $(window).height();
			plugin.env.h = plugin.env.h_full = plugin.env.h_raw;
		}

		// console.log("plugin.env.h", plugin.env.h);

		plugin.env.w = $(window).width();

		// calculate center coords
		plugin.env.center = {
			l: plugin.env.w / 2,
			t: plugin.env.h / 2
		};

		$(document).trigger({type:'envchange', env: plugin.env});
	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Browser support
	 *
	** -------------------------------------------------------------------------*/

	plugin.is_ie = function()
	{
		if (plugin.ie == undefined) {
			if ($('html').hasClass('ie7') || $('html').hasClass('ie8')) plugin.ie = true;
			else plugin.ie = false;
		}

		return plugin.ie;
	}

	plugin.browser_can = function(property)
	{
		if (plugin.browser == undefined) plugin.browser = {};

		if (plugin.browser[property] != undefined)
			return plugin.browser[property];

		var css_checks = [];
		switch(property){
			case 'transform':
				css_checks = [
					'WebkitTransform',
					'MozTransform',
					'OTransform',
					'transform'
				];
				break;

			case 'background-size':
				css_checks = [
					'WebkitBackgroundSize',
					'MozBackgroundSize',
					'OBackgroundSize',
					'backgroundSize'
				];
				break;

			case 'background-attachment-fixed':
				css_checks = [
					'WebkitBackgroundAttachment',
					'MozBackgroundAttachment',
					'OBackgroundAttachment',
					'backgroundAttachment'
				];
				break;

			default: break;
		};

		if ( css_checks.length > 0 ) {
			plugin.browser[property] = false;
			for (var i=0; i < css_checks.length; i++) {
				if (document.body.style[css_checks[i]] != undefined) {
					plugin.browser[property] = true;
					break;
				}
			}
		}else plugin.browser[property] = true;

		return plugin.browser[property];
	};

	plugin.get_scroll_top = function()
	{
		if( typeof pageYOffset != "undefined" ){
			//most browsers
			return pageYOffset;
		}else{
			var B= document.body; //IE 'quirks'
			var D= document.documentElement; //IE with doctype
			D= (D.clientHeight)? D: B;
			return D.scrollTop;
		}
	};

	plugin.browser_has_local_storage = function()
	{
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
		}catch(e){
			return false;
		}
		return true;
	};

	plugin.is_mobile = function()
	{
		return $('html').hasClass('mobile');
	}

	plugin.ios_detect = function()
	{
		plugin.ios = false;
		plugin.ios1 = false;
		plugin.ios2 = false;
		plugin.ios3 = false;
		plugin.ios4 = false;
		plugin.ios5 = false;
		plugin.ios6 = false;
		plugin.ios2_4 = false;
		plugin.ios5_up = false;
		plugin.ios6_up = false;
		if(/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
			plugin.ios = true;
			if(/OS 2_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 2 so Do Something
				plugin.ios2 = true;
				plugin.ios2_4 = true;
			} else if(/OS 3_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 3 so Do Something
				plugin.ios3 = true;
				plugin.ios2_4 = true;
			} else if(/OS 4_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 4 so Do Something
				plugin.ios4 = true;
				plugin.ios2_4 = true;
			} else if(/OS 5_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 5 so Do Something
				plugin.ios5 = true;
				plugin.ios5_up = true;
			} else if(/OS 6_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 6 so Do Something
				plugin.ios6 = true;
				plugin.ios5_up = true;
				plugin.ios6_up = true;
			} else if(/CPU like Mac OS X/i.test(navigator.userAgent)) {
				// iOS 1 so Do Something
				plugin.ios1 = true;
			} else {
				// iOS 6 or Newer so Do Nothing
				plugin.ios5_up = true;
			}
		}
	};

	plugin.is_ios = function()
	{
		if (plugin.ios == undefined) plugin.ios_detect();
		return plugin.ios;
	};

	plugin.is_ios1 = function()
	{
		if (plugin.ios1 == undefined) plugin.ios_detect();
		return plugin.ios1;
	};

	plugin.is_ios2 = function()
	{
		if (plugin.ios2 == undefined) plugin.ios_detect();
		return plugin.ios2;
	};

	plugin.is_ios3 = function()
	{
		if (plugin.ios3 == undefined) plugin.ios_detect();
		return plugin.ios3;
	};

	plugin.is_ios4 = function()
	{
		if (plugin.ios4 == undefined) plugin.ios_detect();
		return plugin.ios4;
	};

	plugin.is_ios2_4 = function()
	{
		if (plugin.ios2_4 == undefined) plugin.ios_detect();
		return plugin.ios2_4;
	};

	plugin.is_ios5 = function()
	{
		if (plugin.ios5 == undefined) plugin.ios_detect();
		return plugin.ios5;
	};

	plugin.is_ios5_up = function()
	{
		if (plugin.ios5_up == undefined) plugin.ios_detect();
		return plugin.ios5_up;
	};

	plugin.is_ios6 = function()
	{
		if (plugin.ios6 == undefined) plugin.ios_detect();
		return plugin.ios6;
	};

	plugin.is_ios6_up = function()
	{
		if (plugin.ios6_up == undefined) plugin.ios_detect();
		return plugin.ios6_up;
	};

	/**
	 * detect touch screen
	**/
	plugin.is_touch_screen = function()
	{
		if (plugin.touch_screen == undefined)
			 plugin.touch_screen = document.documentElement.ontouchstart === undefined ? false : true;

		return plugin.touch_screen;
	}

	plugin.ios_fixes = function()
	{
		if ( $.bw.is_ios5_up() ) {
			$(document).on('afterreplacecontent', plugin.ios5_fix_map_links);
			plugin.ios5_fix_map_links();
		};
	};

	plugin.ios5_fix_map_links = function()
	{
		$('a[href^="http://maps.google.com"]').each(function(index,link){
			var google_map_link = $(link).attr('href');
			var apple_map_link = google_map_link.replace('maps.google.com','maps.apple.com');
			$(link).attr('href', apple_map_link);
		});
	};

	plugin.detect_touchscreen = function()
	{
		if ( plugin.is_touch_screen() ) {
			$('html').attr('data-touchscreen', true);
		}
	};


	plugin.window_loaded = false;
	plugin.window_padding = {};
	plugin.window_adjustments = {};

	plugin.mobile_scroll_init = function()
	{
		plugin.mobile_page = $('body');
		var ua = navigator.userAgent;
		plugin.safari =  ~ua.indexOf('Safari') != 0 && ~ua.indexOf('Chrome') == 0;
		plugin.mobile_iphone = ~ua.indexOf('iPhone') != 0 || ~ua.indexOf('iPod') != 0;
		plugin.mobile_ipad = ~ua.indexOf('iPad') != 0;
		plugin.mobile_ios = plugin.mobile_iphone || plugin.mobile_ipad;

		// Detect if this is running as a fullscreen app from the homescreen
		plugin.mobile_rawscreen = window.navigator.standalone;
		plugin.mobile_android = ~ua.indexOf('Android') != 0;

		if (plugin.mobile_android || (plugin.mobile_ios && plugin.safari) ) {
			$(document).on('afterorientationchange', function(){
				plugin.mobile_scroll();
			});
		}

	};

	plugin.mobile_scroll = function() {
		plugin.mobile_page.height(plugin.env.h_full);
		window.scrollTo(0, 1);
	};


	plugin.mobile_orientation_class_init = function()
	{
		$(document).on('envchange', plugin.mobile_orientation_class_event_handler);
	};

	plugin.mobile_orientation_class_event_handler = function(event) {
		if (plugin.prev_env_w == plugin.env.w) return;
		plugin.prev_env_w = plugin.env.w;

		if (event != undefined)
			$(document).trigger('beforeorientationchange')

		if( plugin.env.w > plugin.env.h ) {
			$('html').attr('data-orientation','landscape');
		}else{
			$('html').attr('data-orientation','portrait');
		}

		if (event != undefined)
			setTimeout(function(){
				$(document).trigger('afterorientationchange')
			}, 700);
	};

	/**
	 * mobile wrapper
	**/
	plugin.mobile_wrapper;
	plugin.mobile_wrapper_init = function(mobile_wrapper)
	{
		if (!mobile_wrapper) return;
		plugin.mobile_wrapper = $(mobile_wrapper);

		if ( plugin.is_mobile() ) {
			$(plugin.mobile_wrapper).css({
				'position': 'absolute',
				'top': '50%',
				'left': '50%'
			});
		}else{
			$(plugin.mobile_wrapper).css({
				'position': 'relative'
			});
		}

		$(document).on('envchange', plugin.mobile_wrapper_handler);
	};


	var default_padding = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};


	plugin.mobile_wrapper_handler = function(event)
	{
		var height, width, margin_top, margin_left;
		var padding = $.extend({}, default_padding, plugin.window_padding);
		var env = plugin.get_env();

		if ( plugin.is_mobile() ) {
			if ( !$('html').hasClass('rotate-lock') || env.h > env.w) { // portrait
				width = env.w - (padding.right + padding.left);
				height = env.h - (padding.bottom + padding.top);
				margin_top = -((env.h_raw - (padding.bottom + padding.top)) / 2);
				margin_left = -((env.w - (padding.right + padding.left)) / 2);
			}else{ // landscape
				height = env.w - (padding.bottom + padding.top);
				width = env.h - (padding.right + padding.left);
				margin_top = -((env.w - (env.h - env.h_raw) - (padding.bottom + padding.top)) / 2);
				margin_left = -((env.h - (padding.right + padding.left)) / 2);
			}
		}else{
			width = env.w - (padding.right + padding.left);
			height = env.h - (padding.bottom + padding.top);
			margin_left = padding.left;
			margin_top = padding.top;
		}


		$(plugin.mobile_wrapper).css({
			'width': width + 'px',
			'height': height + 'px',
			'margin-top': margin_top + 'px',
			'margin-left': margin_left + 'px'
		});

	};

	/**
	 * some analytics functions
	**/
	plugin.max_events = 400;
	plugin.event_count = 0;
	plugin.log_click_event = function(event)
	{
		var category = $(this).attr('data-category');
		var action = $(this).attr('data-action');
		var label = $(this).attr('data-label');
		var value = $(this).attr('data-value');

		if (category == undefined) category = 'Click Targets';
		if (action == undefined) action = 'click';
		if (label == undefined) label = $(this).text();

		plugin.log_event(category, action, label, value);
	};

	plugin.log_social = function(network, action, url, path) {
		if (plugin.event_count >= plugin.max_events) return;
		plugin.event_count++

		//console.log('social - ' + network + ' - ' + action);


		if ( typeof ga === 'function' )
			ga('send', 'social', network, action, url, { page: path });
		else if( typeof _gaq !== 'undefined' )
			_gaq.push(['_trackSocial', network, action, url, path]);
	}

	plugin.log_event = function(category, action, label, value) {
		if (plugin.event_count >= plugin.max_events) return;
		plugin.event_count++

		if ( typeof ga === 'function' )
			ga('send', 'event', category, action, label, value);
		else if( typeof _gaq !== 'undefined' )
			_gaq.push(['_trackEvent', category, action, label, value, true]);
	}

	plugin.log_page_view = function(url, title) {
		plugin.event_count = 0;

		if ( typeof ga === 'function' )
			ga('send', 'pageview', { 'page': url, 'title': title });
		else if( typeof _gaq !== 'undefined' )
			_gaq.push(['_trackPageview', url]);
	}

	plugin.array_to_url = function(base_url, args)
	{
		var url = base_url;
		var index = 0;
		var first_separator = base_url.indexOf('?') == -1 ? '?' : '&';
		$.each(args, function(key, val) {
			if (val == undefined || val == '') return true;
			if (index == 0) url += first_separator;
			else url += '&';
			url += key + '=' + val;
			index++;
		});
		return url;
	};

	plugin.debug_init = function()
	{
		// debug key
		$(window).on('keydown', plugin.debug_keydown_handler);
		$(document).on('envchange', plugin.update_debug_win);

		var scrolltop;
		if ( $(plugin.scroll_wrapper).is('body') ) {
			$(window).on('scroll', plugin.update_debug_win);
		}else{
			plugin.scroll_wrapper.on('scroll', plugin.update_debug_win);
		}

	};

	plugin.debug_keydown_handler = function(event)
	{
		if(event.keyCode == 192) {
			plugin.toggleDebug();
			plugin.update_debug_win();
		}
	};

	plugin.scroll_wrapper = $(window);
	plugin.update_debug_win = function(event)
	{
		if (toggleDebugSettings.debugId) {
			var env = plugin.get_env();
			$('#bw-debug-window .window-size .inner-text').html(env.w + ' x ' + env.h);

			var scrolltop;
			if ( $(plugin.scroll_wrapper).is('body') ) {
				scrolltop = plugin.scroll_wrapper.scrollTop();
			}else{
				scrolltop = -plugin.scroll_wrapper.children().first().position().top;
			}

			$('#bw-debug-window .window-scroll .inner-text').html(scrolltop);
		};
	};


	var toggleDebugSettings = {};
	plugin.toggleDebug = function()
	{
		if ($('#bw-debug-window').length == 0) {

			var $debug_win = $('<div id="bw-debug-window" />').hide().css({
				'position': 'fixed',
				'overflow': 'hidden',
				'z-index': '20010',
				'bottom': '100px',
				'right': '10px',
				'padding': '10px 10px 5px 10px',
				'width': '180px',
				'font-family': 'helvetica, arial, sans-serif',
				'font-size': '14px',
				'color': '#313131',
				'text-transform': 'uppercase',
				'background-color': 'rgba(255, 255, 255, 0.9)'
			});

			var $window_size = $('<div class="window-size" />').css({
				'color': 'red',
				'height': '20px',
				'color': '#313131',
				'margin-bottom': '2px'
			}).append($('<span class="label" />').html('Size:').css({
				'display': 'block',
				'float': 'left',
				'color': '#858585',
				'text-align': 'right',
				'width': '70px',
				'margin-right': '10px'
			})).append('<span class="inner-text" />');

			var $window_scroll = $('<div class="window-scroll" />').css({
				'color': 'red',
				'height': '20px',
				'color': '#313131',
				'margin-bottom': '2px'
			}).append($('<span class="label" />').html('Scroll:').css({
				'display': 'block',
				'float': 'left',
				'color': '#858585',
				'text-align': 'right',
				'width': '70px',
				'margin-right': '10px'
			})).append('<span class="inner-text" />');

			$debug_win
				.append($window_size)
				.append($window_scroll);

			$('body').append($debug_win);
		}

		if (toggleDebugSettings.debugId == false || toggleDebugSettings.debugId == undefined) {
			// console.log('debug on');
			toggleDebugSettings.debugId=true;
			$('#bw-debug-window').show();
		} else {
			// console.log('debug off');
			toggleDebugSettings.debugId=false;
			$('#bw-debug-window').hide();
		}

	};

	plugin.get_env = function()
	{
		var env = $.extend({}, plugin.env);
		var adjusted = false;

		if (plugin.window_adjustments.width != undefined){
			env.w += plugin.window_adjustments.width;
			env.w_full += plugin.window_adjustments.width;
			env.w_raw += plugin.window_adjustments.width;
			adjusted = true;
		}

		if (plugin.window_adjustments.height != undefined) {
			env.h += plugin.window_adjustments.height;
			env.h_raw += plugin.window_adjustments.height;
			env.h_full += plugin.window_adjustments.height;
			adjusted = true;
		}

		if (adjusted)
			env.center = {
				l: env.w / 2,
				t: env.h / 2
			};

		return env;
	};

	/**
	 * Set plugin as attribute to the jQuery namespace
	**/
	$.bw = plugin;

}(window, document, jQuery));
