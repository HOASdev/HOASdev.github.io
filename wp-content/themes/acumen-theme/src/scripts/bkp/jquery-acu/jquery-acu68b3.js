(function (window, document, $, undefined) {

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Plugin Variables
	 *
	** -------------------------------------------------------------------------*/

	// plugin variable
	var plugin = function(){};
	var version = "1.0.0";

	plugin.click_event = 'click';
	plugin.img_url = $('body').attr('data-images_url_path');
	plugin.ajax_url = $('body').attr('data-ajax_url');

	plugin.min_width = 1200;
	plugin.nav_height = 67;
	plugin.big_nav_height = 155;
	plugin.nav_offset = 0;

	plugin.angle_tan = 0.2867454;

	plugin.init_done = false;

	plugin.animation_time = 600;
	plugin.animation_easing = 'easeOutCubic';

	// Disable enhanced animation by default
	$.toggleDisabledByDefault();

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Environment
	 *
	** -------------------------------------------------------------------------*/

	plugin.init = function()
	{
		plugin.click_event = $.bw.touch.get_click_event();

		$(document).on( 'envchange', plugin.envchange_handler );

		$(document).ready(function() {
			plugin.ready(false);

			$('html,body').scrollTop(0);

		});


		plugin.scrolling_init();
		plugin.history_init();
		// plugin.animations_init();

		plugin.actions_init();
		plugin.analytics_init();
		// plugin.init_applyNow();


		$(document).ready(function() {

			plugin.animations_init();

			$('#nav li.drop > ul.sub-menu').each(function() {
				var offset = 0;
				$(this).children('li').each(function() {
					$(this).css('left', offset);
					offset += 10;
				});
			});

			if ( $('html').hasClass('ie9') || $('html').hasClass('ie8') )
				$(document).ready(plugin.initializePlaceholder);

		});

		$(document).on('afterreplacecontent', plugin.initializePlaceholder);

		$(document).ready(plugin.scroll_to_anchor);

		$(document).ready(plugin.ready__removeElementsForBlogHome);

		$(document).ready(plugin.ready__openYearEndCampaignPopup);
		$(document).on('afterstatechange', plugin.afterstatechange__closeLightbox);

		// wizehive setup
		// this.listenTo(App.Events, 'page:ready', this.wizehiveInit);
		// $(document).on('aftershowcontent', this.wizehiveInit);
		$(window).on('message', plugin.wizehiveOnMessage);

	};


	/**
	 * @internal Missing Description
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param
	 * @return null
	 */

	plugin.ready__removeElementsForBlogHome = function (  )
	{
		var aHtml, aText;
		if( $( '#carousel-list-square.content-block' ) )
		{
			$( '.content-heading' ).addClass('carousel-heading');
			$( '#carousel-list-square .inner div' ).each(function()
			{
				if ( $(this).hasClass('clear') )
				{
					$(this).remove();
				}

				aText = $(this).find('.read-more-button a').text();

				if( aText !== '' )
				{
					aText = aText.split(' +');
					aText = '[' + aText[0] + ']';

					$(this).find('.content a').html(aText);

					aHtml = $(this).find('.read-more-button').html();
					$(this).find('.content p').append(aHtml);
					$(this).find('.read-more-button').remove();
				}
			});

			$( '#carousel-list-square .image-overlay' ).remove();
			$( '#carousel-list-square .image-overlay-icon' ).remove();
		}

	};/*ready__removeElementsForBlogHome() */


	/**
	 * Get height from iframe as postMessage. Then set the height of said iframe
	 *
	 * This is the code that needs to be pasted into the iframe:
	 *
	 *

		<script type="text/javascript">// <![CDATA[
		if( self !== top ) {

		// Create browser compatible event handler.
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

		// Listen for a message from the parent. This is used to set the width.
		eventer(messageEvent, function(e) {
		if (e.origin !== 'http://acumen.ale' && e.origin !== 'http://acumen.org' && e.origin !== 'https://acumen.org') return;
		document.getElementsByTagName('html')[0].style.width = parseInt(e.data, 10) + 'px';
		}, false);

		if( typeof parent.postMessage !== 'undefined' )
		parent.postMessage((document.body.offsetHeight + 300) + '', '*');

		}
		// ]]></script>

	 *
	 *
	 */
	plugin.wizehiveOnMessage = function (event)
	{

		if ( $('.wizehive-frame-wrapper').length === 0 )
			return;

		if ( event.originalEvent.origin !== 'https://app.wizehive.com' )
			return;

		this.wizehiveWrapper = $('.wizehive-frame-wrapper')[0];

		// set the height of the frame
		$(this.wizehiveWrapper).css('height', (parseInt( event.originalEvent.data, 10) ) + 'px' );

		// scroll to the top of iframe
		// var scrolltop = $(this.wizehiveWrapper).offset().top - 50;
		// if ( scrolltop < 1 )
		// 	scrolltop = 1;

		// window.scrollTo(0, scrolltop );

		// if, it's mobile, send back the width
		if ( $('html').hasClass('mobile') && $('html').hasClass('safari') ) {

			var width = $(this.wizehiveWrapper).css('width');

			// add 50px cause of padding
			width = parseInt(width, 10) + 50;

			// // force a max width of 325px
			// if ( parseInt(width, 10) < 325)
			//  width = 325;

			if ( typeof event.originalEvent.source.postMessage !== 'undefined' )
				event.originalEvent.source.postMessage( width + '', '*' );
		}

	};



	/**
	 * Initialize defaultValue plugin to display input placeholder on older browsers
	 *
	 * @author Alessandro Biavati <@alebiavati>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param
	 * @return null
	 */

	plugin.initializePlaceholder = function ()
	{
		$('input[placeholder],textarea[placeholder]').each( function (index, item) {

			if ( $(item).parents('#gform_wrapper_3').length > 0 )
				return true; // continue

			$(item).defaultValue();

		});

	};/* initializePlaceholder*/


	plugin.actions_init = function() {

		$(document).on('submit', '.ajax-search', function(event) {

			var History = window.History;
			if ( !History.enabled ) return true;

			event.preventDefault();

			var title = $(this).attr('data-title') + ' | ' + $('body').attr('data-blog_name');
			var url = $(this).attr('action') + '?' + $(this).serialize();
			var data = { 'type' : $(this).attr('data-ajax_type') };

			History.pushState(data,title,url);
			return false;

		}).on(plugin.click_event, '#trigger-nav-search', function(event) {

			event.preventDefault();

			if ( $('#nav-search').is(':visible') ) {
				$('#nav-search').hide();
			} else {
				$('#nav-search').fadeIn(250);
			}

		}).on('mouseenter', '.bricks-container.overlay-bar li.brick', function() {
			$(this).find('.brick-text-more').stop().slideDown(300, plugin.animation_easing).parent('.brick-text').stop().animate({
				'opacity' : 1
			}, 300);

		}).on('mouseleave', '.bricks-container.overlay-bar li.brick', function() {
			$(this).find('.brick-text-more').stop().slideUp(200, plugin.animation_easing).parent('.brick-text').stop().animate({
				'opacity' : 0.9
			}, 200);

		}).on(plugin.click_event, '.dropdown a', function(event) {
			$(this).parents('.dropdown').children('.drophead').children('.selected').show().html($(this).html()).siblings('.default').hide();

		}).on('submit', '#bricks-filter-form', function(event) {

			var History = window.History;
			if ( !History.enabled ) return true;

			event.preventDefault();

			var title = $(this).attr('data-title') + ' | ' + $('body').attr('data-blog_name');
			var url = $(this).attr('action') + '?' + $(this).serialize();
			var data = { 'type' : $(this).attr('data-ajax_type') };

			History.pushState(data,title,url);
			return false;

		}).on(plugin.click_event, '.content-block .content-drawer-trigger', function(event) {

			event.preventDefault();

			var $block = $(this).parents('.content-block').next('.content-block.drawer');


			$block.slideDown(plugin.animation_time, plugin.animation_easing);

			$('html,body').animate({
				'scrollTop' : $block.offset().top - plugin.nav_height
			}, plugin.animation_time, plugin.animation_easing);

		}).on(plugin.click_event, '.content-block .content-drawer-close', function(event) {

			event.preventDefault();

			var $block = $(this).parents('.content-block');

			$block.slideUp(plugin.animation_time, plugin.animation_easing);

			$('html,body').animate({
				'scrollTop' : $block.prev('.content-block').offset().top - plugin.nav_height
			}, plugin.animation_time, plugin.animation_easing);


		}).on(plugin.click_event, '.content-block .drawer-trigger a', function(event) {

			event.preventDefault();

			var $drawer = $(this).parents('.content-block').find('.more-content');

			if ( $(this).hasClass('on') ) {
				var label = $(this).attr('data-label');
				$(this).removeClass('on').children('span').text(label).siblings('strong').html('+');
				$drawer.slideUp(400, plugin.animation_easing);

				$('html,body').animate({
					'scrollTop' : $(this).parents('.content-block').offset().top - plugin.nav_height
				}, 400, plugin.animation_easing);

			} else {
				$(this).addClass('on').children('span').text('Close').siblings('strong').html('&times;');
				$drawer.slideDown(400, plugin.animation_easing);

				$('html,body').animate({
					'scrollTop' : $drawer.offset().top - plugin.nav_height
				}, 400, plugin.animation_easing);

			}

		}).on(plugin.click_event, '#bricks-overlay', function() {
			$('.brick-drawer .close-drawer').click();
		});


		$(document).on(plugin.click_event, '.scrollto', plugin.scroll_to_anchor)
			.on(plugin.click_event, '.tabs a:not(.history)', plugin.tabs_handler)
			.on(plugin.click_event, '.tabs-container a.nav', plugin.tabs_handler)
			.on(plugin.click_event, '.special-tabs a.nav', plugin.special_tabs_handler)
			.on(plugin.click_event, 'a.applyNow', plugin.scroll_to_anchor);

	};

	plugin.ready = function(is_ajax) {

		// UA detection
		if( typeof $.ua !== 'undefined' )
		{
			var bodyClass = '';

			// add device class (mobile or tablet)
			if( typeof $.ua.device !== 'undefined' && typeof $.ua.device.type !== 'undefined' )
				bodyClass += ' ' + $.ua.device.type;

			// add browser class (only safari for now)
			if( typeof $.ua.browser !== 'undefined' && typeof $.ua.browser.name !== 'undefined' )
				bodyClass += ' ' + $.ua.browser.name.toLowerCase().replace(' ', '-');

			// add class to HTML tag
			$('html').addClass( bodyClass );
		}

		plugin.is_home = $('body').hasClass('home');
		plugin.is_tablet = $('html').hasClass('tablet');

		plugin.is_regionalFellows = $('body').hasClass('page-template-templatestemplate-regional-fellows-php');
		plugin.is_globalFellows = $('body').hasClass('page-template-templatestemplate-global-fellows-php');

		plugin.fit_images();

		plugin.formatting_init();

		// center the images in the ideas carousel
		plugin.ready__centerImage();

		plugin.load_animation(is_ajax);

		// load social plugins
		if (!is_ajax) {

			plugin.skewed_text();
			plugin.carousel_init();
			plugin.carousel_init_slick();
			plugin.carousel_resize();

			setTimeout(function () {
				require([
					window.socialInitScriptUrl,
					'http://platform.linkedin.com/in.js',
					'http://widgets.twimg.com/j/2/widget.js',
					// 'http://support.acumenfund.org/api/ConvioApi.js'
				], function () {
					// console.log('initializing now...');
					$.bw.social.init();
					if ( $('body').hasClass('single-post') ) plugin.load_tweets();
				});


			}, 0);
		} else {

		}

	};

	plugin.formatting_init = function() {

		$('.button.add-span').append('<span></span>').removeClass('add-span').parent('p').css('text-align', 'center');
		$('.add-strong').append('<strong></strong>').removeClass('add-strong');

		$('.post-content iframe').each(function() {

			// skip wizehive iframes
			if ( $(this).hasClass('wizehive-frame') )
				return true;

			var r = $(this).attr('height') / $(this).attr('width');
			var w = $(this).parent().width();
			$(this).css({
				'width' : w,
				'height' : w * r
			});
		});

		plugin.form_style_init();

	};

	plugin.after_init = function() {

		plugin.init_done = true;

		plugin.skewed_text();
		plugin.carousel_init();
		plugin.carousel_init_slick();
		plugin.tabs_init();
		plugin.special_tabs_init();
		plugin.bricks_init();

		plugin.lazyload_init();

		plugin.load_video();

		plugin.formatting_init();

		$.bw.set_env();

		if ( $('#big-map').length > 0 ) {
			plugin.big_map_init();
		}

		// $('body').removeClass('loading').addClass('loaded');



		$('#loading-indicator:visible').fadeOut(400);



		$('.play-video').fancybox({
			type : 'iframe',
			//minWidth : plugin.min_width,
			padding: 0,
			margin: 40,
			//autoSize: false,
			//fitToView: false,
			aspectRatio: true,
			width: 1280,
			height: 720
		});

		$('.term-icons ul').each(function() {
			var offset = 0;
			$(this).find('li').each(function() {
				$(this).css('left', offset);
				offset += 10;
			});
		});

	};


	plugin.ajax_reload = function() {

		plugin.ready(true);

		plugin.tabs_init();
		plugin.bricks_init();

		plugin.reload_social();

	};

	plugin.load_animation = function(is_ajax) {

		// $('body').addClass('loading');

		var $nav = $('#nav');

		$('#content, #footer, #header').show().css({
			'visibility' : 'visible'
		});

		if ( plugin.is_home ) {

			/*
$nav.css({
				'top' : -200
			});
*/

			$nav.hide();

			$('#header').css({
				'top' : -50,
				'opacity' : 0
			}).find('h1').css({
				'top' : -400,
				'opacity' : 0
			});

			$('#home-nav').css({
				'top' : 100,
				'opacity' : 0
			});

			$('.campaign-content').css({
				'top' : 100,
				'opacity' : 0
			});



			// plugin.fit_header_banner();


		} else {

			$nav.show();

			$('#content, #footer').css({
				'opacity' : 0
			});

		}

		if ( is_ajax ) {
			plugin.load_animation_after(true);
		} else {
			$(window).load(function() {
				plugin.load_animation_after(false);
			});
		}



	};

	plugin.load_animation_after = function(is_ajax) {

		var $nav = $('#nav');

		if ( plugin.is_home ) {


			$('#header').animate({
				'top' : 0,
				'opacity' : 1
			}, plugin.animation_time, plugin.animation_easing);

			$('#header h1').animate({
				'top' : 0,
				'opacity' : 1
			}, plugin.animation_time, plugin.animation_easing, function () {

				plugin.after_init();

			});


			if ( $( '.home-video-popup-container' ).length > 0 )
			{
				plugin.showPopUpWithVideo();
			}

			if ( $('#home-nav').length > 0 ) {

				$('#home-nav').delay(200).animate({
					'top' : 0,
					'opacity' : 1
				}, plugin.animation_time, plugin.animation_easing, function() {

					// show scroll icon
					$('#scroll-to-content').animate({
						top: 0
					}, plugin.animation_time, plugin.animation_easing, function() {

						// start pulsating

						$('#scroll-to-content').pulse('destroy');
						$('#scroll-to-content').pulse({
							top: '6px'
						}, {
							duration : 1000,
							pulses   : -1
						});

					});

				});

			}else{

				// show header content
				var showContent = function (argument) {

					$('.campaign-content').delay(200).animate({
						'top' : 0,
						'opacity' : 1
					}, plugin.animation_time, plugin.animation_easing, function() {

						// show scroll icon
						$('#scroll-to-content').animate({
							bottom: '40px'
						}, plugin.animation_time, plugin.animation_easing, function() {

							// start pulsating

							$('#scroll-to-content').pulse('destroy');
							$('#scroll-to-content').pulse({
								bottom: '30px'
							}, {
								duration : 1000,
								pulses   : -1
							});

						});

					});

					$('.header-overlay').delay(200).fadeIn(500)

				};

				plugin.showHeaderVideo( $('.home-header-video-intro'), showContent, function () {

					setTimeout( showContent, 1800 );

					// setTimeout( function () {

					// 	plugin.showHeaderVideo( $('.home-header-video-loop'), null, function () {

					// 		// console.log("showing second video");

					// 	});

					// }, 14000 );

				});

			}

		} else {

			if ( is_ajax ) {
				$('#content, #footer').show().animate({
					'opacity' : 1
				}, plugin.animation_time, plugin.animation_easing);
				plugin.after_init();



			} else {
				$nav.animate({
					'opacity' : 1
				}, plugin.animation_time, plugin.animation_easing, function() {

					$('#content, #footer').animate({
						'opacity' : 1
					}, plugin.animation_time, plugin.animation_easing);

					plugin.after_init();
				});
			}

		}

	};


	/**
	 * Show a video given its container
	 *
	 * @author Alessandro Biavati <ale@briteweb.com>
	 * @package briteweb/package
	 * @since 1.0.0
	 * @param (jQuery) $videoContainer - Container of the video to be shown
	 * @return null
	 */

	plugin.showHeaderVideo = function ( $videoContainer, callback, playCallback )
	{

		if ( $('html').hasClass('tablet') || !Modernizr.video || $videoContainer.length == 0 || typeof $videoContainer.data('video') == 'undefined' ) {

			if ( typeof callback == 'function' )
				callback();

			return;
		}

		var videoUri = $videoContainer.data('video');
		var resourcesUrl = $videoContainer.data('resources');
		var videoAttrs = $videoContainer.data('attrs');
		var flashvars = $videoContainer.data('flashvars');

		if ( typeof videoAttrs == 'undefined' || videoAttrs == null )
			videoAttrs = '';

		if ( $('html').hasClass('tablet') )
			videoAttrs += ' controls';

		if ( typeof flashvars == 'undefined' || flashvars == null )
			flashvars = '';

		if ( typeof flashvars != 'undefined' && flashvars != '' )
			flashvars += '&amp;';

		var videoHTML = '<video class="video" width="1280" height="720" autobuffer preload="auto"' + videoAttrs + '> \
							<source type="video/webm" src="' + resourcesUrl + videoUri + '.webm"> \
							<source type="video/mp4" src="' + resourcesUrl + videoUri + '.mp4"> \
							<source type="video/ogg" src="' + resourcesUrl + videoUri + '.ogv"> \
							<object class="video" type="application/x-shockwave-flash" data="http://player.longtailvideo.com/player.swf" width="640" height="360"> \
								<param name="movie" value="http://player.longtailvideo.com/player.swf" /> \
								<param name="allowFullScreen" value="false" /> \
								<param name="wmode" value="transparent" /> \
								<param name="flashVars" value="' + flashvars + 'controlbar=none&amp;file=' + encodeURIComponent( resourcesUrl ) + videoUri + '.mp4" /> \
							</object> \
						</video>';

		$videoContainer.html( videoHTML );

		plugin.fit_video_in_window( $videoContainer.find('.video') );

		var video = $videoContainer.find('.video')[0];

		var videoLoadedCallback = function () {

			video.play();

			if ( typeof playCallback == 'function' )
				$videoContainer.fadeIn( 800, playCallback );
			else
				$videoContainer.fadeIn( 800 );


		};

		if ( video.readyState === 4 ) {

			videoLoadedCallback();

		}else{

			$videoContainer.find('.video').on( 'canplay', videoLoadedCallback);

		}


	};/* showHeaderVideo() */


	plugin.showPopUpWithVideo = function()
	{
		$.fancybox( $( '.home-video-popup-container' ).html(), {
			wrapCSS: 'home-video-popup-container-fancybox',
			padding: [ 60, 10, 20, 10 ],
			margin: [10, 70, 10, 70],
			tpl:
			{
				closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:void();"></a>',
			},
			afterShow: function() {
				plugin.add_tracking('popup', 'show', 'Show Popup');
			}
		});

	}

	$( document ).on( 'click', '.home-video-popup-container-fancybox .popup-video-container, .home-video-popup-container-fancybox .play-icon', function( event ) {

		// log this event
		plugin.add_tracking('popup', 'click', 'Popup Video');

		var $videoContainer = $( event.currentTarget ).parents( '.home-video-popup' );

		var videoService = $videoContainer.attr( 'data-video-service' );
		var videoID = $videoContainer.attr( 'data-video-id' );

		if ( videoService === 'youtube')
		{

			$videoContainer
				.find('.popup-video-container')
				.addClass('open')
				.append('<iframe class="youtube_vid" id="youtube_player" src="http://www.youtube.com/embed/' + videoID + '?enablejsapi=1&autoplay=1&rel=0&modestbranding=1&controls=1&HD=1&showinfo=0&wmode=transparent&vq=hd720" frameborder="0" allowfullscreen wmode="transparent"></iframe>')
				.fadeIn(400, function(){
					$.bw.videoHelpers.injectYoutubeAPI('youtube_player', videoID, 'in-place');
				});

		}
		else
		{
			$.bw.videoHelpers.bindVimeoEvents('in-place');
			$videoContainer
				.find('.popup-video-container')
				.addClass('open')
				.append('<iframe src="http://player.vimeo.com/video/' + videoID + '/?autoplay=1&api=1" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen wmode="transparent"></iframe>')
				.fadeIn(400);

		}

		setTimeout(function() {
			$videoContainer.find( '.video-thumbnail' ).fadeOut( 600 );
			$videoContainer.find( '.popup-video-container' ).fadeIn(600);
		}, 200);

		event.preventDefault();

	} );

	$( document ).on( 'click', '.home-video-popup-container-fancybox .close-button', function( event ){

		$( '.home-video-popup .popup-video-container' ).removeClass( 'open' ).find( 'iframe' ).remove();
		$.fancybox.close();

	} );

	plugin.gform_button_init = function()
	{


	};


	plugin.envchange_handler = function(event) {
		plugin.env = event.env;

		if ( plugin.env.w < 1280 ) plugin.min_width = 1000;
		else plugin.min_width = 1200;

		if ( plugin.env.w < plugin.min_width ) plugin.env.w = plugin.min_width;

		if ( ! plugin.init_done ) return;

		plugin.fit_header_banner();
		plugin.fit_images();
		plugin.carousel_resize();

		plugin.bricks_resize();

		//plugin.bricks_isotope_init();
	};

	plugin.load_video = function() {

		return;

		if ( ! plugin.is_home ) return;

		var $video = $('#header-video');
		if ( $video.length == 0 || $video.hasClass('loaded') ) return;

		var id = $video.attr('data-id');
		$video.append('<iframe width="1280" height="720" src="http://www.youtube.com/embed/' + id + '?loop=1&autoplay=1&controls=0&showinfo=0&autohide=1&wmode=transparent&hd=1&playlist=' + id + '&modestbranding=1&rel=1" frameborder="0" allowfullscreen></iframe>').addClass('loaded');

		plugin.fit_video();

	};

	plugin.reload_social = function() {

		//if ( $target.find('.social').length == 0 ) return;

		FB.XFBML.parse();
		twttr.widgets.load();
		IN.parse();

		//plugin.load_tweets();
	};

	plugin.load_tweets = function() {

		if ( $('#tweets-widget').length == 0 ) return;

		var s = $('#tweets-widget').attr('data-search');

		new TWTR.Widget({
		  id: 'tweets-widget',
		  version: 2,
		  type: 'search',
		  search: s,
		  interval: 10000,
		  title: '',
		  subject: '',
		  width: 'auto',
		  height: 500,
		  theme: {
			shell: {
			  background: 'transparent',
			  color: '#696969'
			},
			tweets: {
			  background: 'transparent',
			  color: '#696969',
			  links: '#002f71'
			}
		  },
		  features: {
			scrollbar: true,
			loop: false,
			live: false,
			hashtags: true,
			timestamp: true,
			avatars: true,
			toptweets: true,
			behavior: 'default'
		  }
		}).render().start();

	}

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Ideas Slider
	 *
	 * ---------------------------------------------------------------------------
	 */

	/**
	 * center the thumbnail image for the ideas carousel
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param arguments
	 * @return null
	 */

	plugin.ready__centerImage = function ( arguments )
	{
		var imgWidth, imgHeight, imgRatio,
			widthDiff, heightDiff;
		var containerHeight = $('.ideas-slides .carousel-img').height();
		var containerWidth = $('.ideas-slides .carousel-img').width();

		var containerRatio = containerWidth / containerHeight;

		$('.ideas-slides .carousel-img > img').each(function()
		{
			imgWidth = parseInt($(this).attr('width'));
			imgHeight = parseInt($(this).attr('height'));

			imgRatio = imgWidth / imgHeight;

			if ( imgRatio > containerRatio )
			{
				widthDiff = ((imgRatio * containerHeight) - containerWidth) / 2;
				$(this).css({
					'margin-left': -widthDiff,
					height: '100%',
					width: 'auto'
				});
			} else
			{
				$(this).css({
					height: 'auto',
					width: '100%'
				});
			}
		});

	};/* ready__centerImage() */


	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Ideas Pagination
	 *
	** -------------------------------------------------------------------------*/


	/**
	 * when clicking on a page for the pagination, scroll it to the top of the div
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param
	 * @return null
	 */

	$(document).on('click', '.ideas-content .pagination a', function()
	{
		$(document).on('afterreplacecontent', function()
		{
			if ( $( '.ideas-content' ).length == 0 )
				return;

			var offset = $( '.ideas-content' ).offset();

			if ( typeof offset.top == 'undefined' )
				return;

			var scrollTop = offset.top;

			$( 'html, body' ).animate({
				scrollTop: scrollTop
			});
		});
	});



	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Carousel
	 *
	** -------------------------------------------------------------------------*/

	plugin.carousel_init_slick = function() {

		if ( $( '.slickcarousel' ).length <= 0 )
			return;

		$( '.slickcarousel' ).each( function() {

			$( this ).slick({
				slide: '.slide',
				slidesToShow: 4,
				slidesToScroll: 2,
				nextArrow: '<div class="slick-button slick-next"><span class="icon"></span></div>',
				prevArrow: '<div class="slick-button slick-prev"><span class="icon"></span></div>',
				centerMode: true,
			});

		});

	}

	plugin.carousel_init = function() {

		//plugin.carousel_resize();

		$('.carousel').each(function() {
			var $this = $(this);
			if ( $this.hasClass('loaded') ) return false;

			if ( $this.hasClass('narrow') ) var narrow = true;
			else var narrow = false;

			var $slide = $this.find('.slide');

			var count = $slide.length;
			var offset = Math.ceil(count / 2);
			$this.data('slides', {
				'count' : count,
				'offset' : offset
			});

			var sw = $slide.first().width();
			$(this).find('.slides').width(1200 * count);

			if ( narrow ) {

				var num = Math.floor( plugin.env.w / sw );

				if ( $this.find('.slide.current').length == 0 ) {


					$this.find('.slide').slice(0,num).addClass('current');
				}

				if ( count > num ) $this.find('.prev, .next').show();
				else $this.find('.prev, .next').hide();

			} else {

				if ( $this.find('.slide.current').length == 0 ) {
					$this.find('.slide').first().addClass('current');
					$this.find('.slide').last().prependTo($this.find('.slides'));
				}

			}

			var $current = $this.find('.slide.current');

			$this.find('.slide').removeClass('cover');

			$current.find('.slide-content').show();

			$current.find('.slide-skew').children('.overlay').hide().siblings('.bar').show();

			$this.find('.slide').not('.current').removeClass('cover').find('.slide-content').hide();
			$this.find('.slide').not('.current').find('.slide-skew').children('.overlay').show().siblings('.bar').hide();

			if ( ! narrow ) {
				var id = $current.attr('data-id');
				$this.find('.slides-content li[data-id="' + id + '"]').show().siblings('li').not('.bar').hide();
				$this.find('.slide-content').show();
			}

			$current.last().nextAll('.slide').addClass('cover');

		});

		$('.carousel .next, .carousel .prev').click(plugin.carousel_trigger);

		$('.carousel .slide .overlay').click(function() {
			var $carousel = $(this).parents('.carousel');
			var i = $(this).parents('.slide').index();

			if ( i > $carousel.find('.slide.current').index() ) var dir = true;
			else var dir = false;

			plugin.carousel_move($carousel, dir);
		});

	};

	plugin.carousel_resize = function() {

		$('.carousel').each(function() {
			var $this = $(this);

			//var data = $this.data('slides');

			var offset = plugin.get_carousel_offset($this);

			$this.data('offset', offset).find('.slides').css({
				'margin-left' : -offset
			});

		});

	};

	plugin.get_carousel_offset = function($el) {

		var width = plugin.env.w;

		if ( $el.hasClass('narrow') ) var narrow = true;
		else var narrow = false;

		slide_width = $el.find('.slide').first().width();
		$el.data('slide_width', slide_width);

		/*
if ( $el.hasClass('narrow') )
			var slide_width = plugin.min_width / 3;
		else
			var slide_width = plugin.min_width;
*/

		if ( narrow ) {

			var count = $el.find('.slide').length;

			var num = Math.floor( width / slide_width );
			$el.find('.slide.current').first().nextAll().removeClass('current').slice(0,num - 1).addClass('current').removeClass('cover');

			$el.find('.slide.current').addClass('current').find('.overlay').hide();
			$el.find('.slide.current').find('.bar, .slide-content').show();

			var $other_slides = $el.find('.slide').not('.current');

			$other_slides.find('.overlay').filter(':hidden').show();
			$other_slides.find('.bar, .slide-content').filter(':visible').hide();

			if ( count > num ) $el.find('.prev, .next').show();
			else $el.find('.prev, .next').hide();

			$el.data('show', num);
		}


		var cur_index = $el.find('.slide.current').first().index();

		if ( narrow )
			var l = (cur_index * slide_width) - ((width - (slide_width * num)) / 2) - 5;
		else
			var l = (cur_index * slide_width) - ((width - slide_width) / 2);

		return l;

	};

	plugin.carousel_trigger = function(event) {

		event.preventDefault();

		var $carousel = $(this).parents('.carousel');
		if ( $(this).hasClass('prev') ) var dir = false;
		else var dir = true;

		plugin.carousel_move($carousel, dir);

	};

	plugin.carousel_moving = false;

	plugin.carousel_move = function($el, dir) {

		if ( plugin.carousel_moving ) return;

		if ( $el.hasClass('narrow') ) plugin.carousel_narrow_move($el, dir);
		else plugin.carousel_wide_move($el, dir);


	};

	plugin.carousel_wide_move = function($el, dir) {

		var offset = $el.data('offset');
		var slide_width = $el.data('slide_width');
		var slide_margin = parseInt($el.css('margin'));

		if ( ! dir ) {
			$el.find('.slide').last().prependTo($el.find('.slides'));
			offset = offset + (slide_width + slide_margin);
			$el.find('.slides').css({
				'margin-left' : -offset
			});
		}

		$el.find('.slide').removeClass('cover');

		var $cur_slide = $el.find('.slide.current');

		if ( dir ) {
			var l = offset + (slide_width + slide_margin);
			$target_slide = $cur_slide.next('.slide');
		} else {
			var l = offset - (slide_width + slide_margin);
			$target_slide = $cur_slide.prev('.slide');
		}

		var id = $target_slide.attr('data-id');

		$cur_slide.removeClass('current').find('.overlay').fadeIn(400);
		$el.find('.slides-content li:visible').not('.bar').fadeOut(400);

		$target_slide.nextAll().not('.also-current').addClass('cover');

		$target_slide.addClass('current').find('.overlay').fadeOut(400);
		$el.find('.slides-content li[data-id="' + id + '"]').fadeIn(400);

		$cur_slide.removeClass('current');

		$target_slide.addClass('current').nextAll().addClass('cover');

		plugin.carousel_moving = true;

		$el.children('.slides').animate({
			'margin-left' : -l
		}, plugin.animation_time, plugin.animation_easing, function() {

			offset = l;

			if ( dir ) {

				$el.find('.slide').first().hide().appendTo($el.children('.slides')).fadeIn(200);

				//var offset = plugin.get_carousel_offset($el);

				offset = offset - (slide_width + slide_margin);

				$el.children('.slides').css({
					'margin-left' : -offset
				});
			}


			$el.data('offset', offset);


			$target_slide.nextAll().not('.also-current').addClass('cover');

			plugin.carousel_moving = false;

		});

		plugin.skewed_text();

	};

	plugin.carousel_narrow_move = function($el, dir) {

		var offset = $el.data('offset');
		var slide_width = $el.data('slide_width');

		if ( ! dir ) {
			$el.find('.slide').last().prependTo($el.find('.slides'));
			offset = offset + slide_width - 2;
			$el.find('.slides').css({
				'margin-left' : -offset
			});
		}


		$el.find('.slide').removeClass('cover');

		var $cur_slides = $el.find('.slide.current').removeClass('current');

		var num = $el.data('show');

		if ( dir ) {
			var l = offset + slide_width;
			//$target_slide = $cur_slides.next('.slide');

			$target_slides = $cur_slides.nextAll().slice(0,num);

			//$add_cur = $cur_slide.prev('.slide').removeClass('also-current');
			//$add_target = $target_slide.next('.slide').addClass('also-current');

		} else {
			var l = offset - slide_width;
			//$target_slide = $cur_slide.prev('.slide');

			$target_slides = $cur_slides.prev().nextAll().andSelf().slice(0,num);

			//$add_cur = $cur_slide.next('.slide').removeClass('also-current');
			//$add_target = $target_slide.prev('.slide').addClass('also-current');


		}


		$cur_slides.removeClass('current');

		$target_slides.addClass('current').find('.overlay').fadeOut(400);
		$target_slides.find('.bar, .slide-content').fadeIn(400);

		var $other_slides = $el.find('.slide').not('.current');

		$other_slides.find('.overlay').filter(':hidden').fadeIn(400);
		$other_slides.find('.bar, .slide-content').filter(':visible').fadeOut(400);

		plugin.carousel_moving = true;

		$el.children('.slides').animate({
			'margin-left' : -l
		}, plugin.animation_time, plugin.animation_easing, function() {

			offset = l;

			if ( dir && $el.find('.slide.current').first().index() > 1 ) {

				$el.find('.slide').first().appendTo($el.children('.slides'));

				//var offset = plugin.get_carousel_offset($el);

				offset = offset - slide_width + 5;

				$el.children('.slides').css({
					'margin-left' : -offset
				});
			}

			$el.data('offset', offset);


			$target_slides.last().nextAll('.slide').addClass('cover');

			plugin.carousel_moving = false;

		});

	};



	/*
plugin.carousel_move = function($el, dir) {

		if ( plugin.carousel_moving ) return;

		if ( $el.hasClass('narrow') ) var narrow = true;
		else var narrow = false;

		var offset = $el.data('offset');
		var slide_width = $el.data('slide_width');

		if ( ! dir ) {
			$el.find('.slide').last().prependTo($el.find('.slides'));
			offset = offset + slide_width - 2;
			$el.find('.slides').css({
				'margin-left' : -offset
			});
		}


		$el.find('.slide').removeClass('cover');

		var $cur_slide = $el.find('.slide.current');

		var $add_cur, $add_target;

		if ( dir ) {
			var l = offset + slide_width;
			$target_slide = $cur_slide.next('.slide');

			if ( narrow ) {
				$add_cur = $cur_slide.prev('.slide').removeClass('also-current');
				$add_target = $target_slide.next('.slide').addClass('also-current');
			}

		} else {
			var l = offset - slide_width;
			$target_slide = $cur_slide.prev('.slide');

			if ( narrow ) {
				$add_cur = $cur_slide.next('.slide').removeClass('also-current');
				$add_target = $target_slide.prev('.slide').addClass('also-current');
			}

		}

		if ( narrow ) {
			$cur_slide.removeClass('current').addClass('also-current');
			$add_cur.find('.overlay').fadeIn(400);
			$add_cur.find('.bar, .slide-content').fadeOut(400);
		} else {
			$cur_slide.removeClass('current').add($add_cur).find('.overlay').fadeIn(400);
			$cur_slide.add($add_cur).find('.slides-content li').fadeOut(400);
		}


		$target_slide.nextAll().not('.also-current').addClass('cover');

		if ( narrow ) {
			$target_slide.addClass('current').add($add_target).find('.overlay').fadeOut(400);
			$target_slide.add($add_target).find('.bar, .slide-content').fadeIn(400);
		} else {
			$target_slide.addClass('current').add($add_target).find('.overlay').fadeOut(400);
			$target_slide.add($add_target).find('.slides-content li').fadeIn(400);
		}

		plugin.carousel_moving = true;

		$el.children('.slides').animate({
			'margin-left' : -l
		}, plugin.animation_time, plugin.animation_easing, function() {

			offset = l;

			if ( dir ) {

				$el.find('.slide').first().appendTo($el.children('.slides'));

				//var offset = plugin.get_carousel_offset($el);

				offset = offset - slide_width + 5;

				$el.children('.slides').css({
					'margin-left' : -offset
				});
			}

			$el.data('offset', offset);


			$target_slide.nextAll().not('.also-current').addClass('cover');

			plugin.carousel_moving = false;

		});

	};
*/

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * BRICKS
	 *
	** -------------------------------------------------------------------------*/

	plugin.lazyload_init = function() {

	/*
	$('.bricks-container').each(function() {
			var $img = $(this).find('img.lazy');

			$img.lazyload({
				effect : 'fadeIn',
				failure_limit : Math.max($img.length - 1, 0)
			});
		});

*/


		$('img.lazy').lazyload({
			effect : 'fadeIn',
			skip_invisible : false,
			failure_limit : 50,
			threshold : 200
		});

		$(window).trigger('scroll');


	};

	plugin.bricks_init = function() {

		plugin.bricks_isotope_init();

		plugin.open_brick_drawer(false);
		plugin.bricks_filter_init();

		plugin.bricks_resize();


	};

	plugin.bricks_isotope_init = function($container) {

		plugin.bricks_container = $('.bricks-container');

		$container = typeof $container !== 'undefined' ? $container : plugin.bricks_container;

		$container.bwMasonry();

		return;

		//var w = 300;

		setTimeout(function() {

			var w = $container.innerWidth() / 4;

			$container.isotope({
				masonry : {
					columnWidth: w
				},
				transformsEnabled : false,
				itemPositionDataEnabled : true,
				itemSelector : '.brick',
				animationEngine : 'css',
				resizable: false
			});
		}, 200);

		//setTimeout(plugin.bricks_isotope_relayout, 100);

	};

	plugin.bricks_isotope_relayout = function($container) {

		$container = $('.bricks-container')

		var w = Math.round($container.innerWidth() / 4);

		//var w = 300;
		$container.isotope('reLayout');

	};

	plugin.bricks_resize = function() {

		$('.bricks-container.overlay-round li.brick .brick-text').each(function() {

			var margin = $(this).innerHeight() / 2;
			$(this).css('margin-top', -margin);

		});

	};

	plugin.bricks_filter_init = function() {

		return;

		$(document).on(plugin.click_event, '.dropdown a', function(event) {
			$(this).parents('.dropdown').children('.drophead').children('.selected').show().html($(this).html()).siblings('.default').hide();

		});



	};

	plugin.bricks_replace = function($bricks) {

		//var $old_bricks = plugin.bricks_container.find('li.brick');

		plugin.bricks_container.html($bricks).bwMasonry();

		//plugin.bricks_container.isotope('remove', $old_bricks).isotope('insert', $bricks);

	};

	plugin.open_brick_drawer = function(is_ajax) {

		if ( is_ajax != true && ! $('body').hasClass('single-idea') && ! $('body').hasClass('single-story') ) return;

		var $brick = plugin.bricks_container.find('li.brick.current');
		if ( $brick.length == 0 ) return;

		//plugin.bricks_container.find('.brick').fadeTo(400, 0.25);

		var $drawer = plugin.bricks_container.find('li.brick-drawer');

		var pos = plugin.get_brick_drawer_position($brick);

		$('html,body').animate({
			'scrollTop' : plugin.bricks_container.offset().top + pos.top - 100
		}, 400);

		if ( pos.side == 'left' ) {
			var drawer_css = {
				'left' : 0,
				'right' : 'auto'
			};
		} else {
			var drawer_css = {
				'left' : 'auto',
				'right' : 0
			};
		}

		drawer_css.top = pos.top;

		$drawer.hide().css(drawer_css);

		if ( is_ajax ) {
			$drawer.fadeIn(400, function() {
				plugin.reload_social();
				plugin.formatting_init();
			});
		} else {
			$drawer.show();
			plugin.reload_social();
			plugin.formatting_init();
		}

		$('#bricks-overlay').fadeTo(400,0.7);


	};

	plugin.close_brick_drawer = function() {
		plugin.bricks_container.find('li.brick-drawer').fadeOut(400, function() {
			$(this).empty();

		});

		$('#bricks-overlay').fadeOut(400);

		//plugin.bricks_container.find('.brick').fadeTo(400, 1);

	};

	plugin.get_brick_drawer_position = function($brick) {

		if ( $brick.length == 0 ) return false;

		var bricks_width = plugin.bricks_container.width();
		var half = bricks_width / 2;
		var brick_pos = $brick.data('brick-position');

		var pos = {
			'top' : brick_pos.y,
			'bricks_width' : bricks_width
		};

		if (brick_pos.x < half ) pos.side = 'left';
		else pos.side = 'right';

		return pos;

	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Blog
	 *
	** -------------------------------------------------------------------------*/

	plugin.open_post = function($post, relative_url) {

		$('.post-list .ajax-single-content:visible').hide().siblings('.ajax-list-content').show();
		$('.post-list .side-ajax-single-content:visible').hide().siblings('.side-ajax-list-content').show();

		var $original = $('.post-list[data-ajax_url="/' + relative_url + '"]');

		if ( $original.length != 0 ) {
			$('html,body').animate({
				'scrollTop' : $original.offset().top - plugin.nav_height - 30
			}, 400, plugin.animation_easing);
		}

		var $content = $original.find('.ajax-content');
		var $list_content = $original.find('.ajax-list-content');
		var $single_content = $post.find('.ajax-single-content');

		// console.log( $post, $single_content, relative_url );

		var $side_list_content = $original.find('.side-ajax-list-content');
		var $side_single_content = $post.find('.side-ajax-single-content');

		var h = $single_content.hide().insertBefore($list_content).height();
		$single_content.find('.load-after').hide();
		$single_content = $original.find('.ajax-single-content');

		$side_single_content.insertBefore($side_list_content);

		$content.css({
			'position' : 'relative',
			'height' : plugin.env.h
		});

		$single_content.css({
			'position' : 'absolute',
			'top' : -40,
			'opacity' : 0
		}).show().animate({
			'top' : 0,
			'opacity' : 1
		}, 800, plugin.animation_easing, function() {
			$single_content.css({
				'position' : 'static'
			});

			plugin.reload_social();

			if ( $('body').hasClass('single-post') ) plugin.load_tweets();

			$single_content.find('.load-after').fadeIn(400);
			$single_content.css('display', 'block');
			// $single_content.slideDown();

			$content.animate({
				'height' : $single_content.height(),
			}, 400, plugin.animation_easing, function() {
				$content.css('height', 'auto');
			});

		});

		$list_content.fadeOut(400, plugin.animation_easing);



	};

	plugin.replace_posts = function($posts) {

		$target = $('.posts');
		$parent = $target.parent('.main').height($target.height());

		$('html,body').animate({
			'scrollTop' : $parent.offset().top - plugin.nav_height - 30
		}, 400, plugin.animation_easing);

		$target.fadeOut(400, function() {

			$target.hide().html($posts.html());
			plugin.reload_social();

			var h = $target.height();

			$parent.animate({
				'height' : h
			}, 400, plugin.animation_easing, function() {
				$parent.css('height', 'auto');
			});

			$target.css({
				'opacity' : 0,
				'position' : 'relative',
				'top' : -40
			}).show().animate({
				'opacity' : 1,
				'top' : 0
			}, 400, plugin.animation_easing, function() {
				$(this).css({
					'position' : 'static'
				});

				plugin.ajax_reload();
			});

		});

	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Angles
	 *
	** -------------------------------------------------------------------------*/

	plugin.skewed_text = function($text) {

		var eh = 15;
		var eo = eh * plugin.angle_tan;

		if ( typeof $text == 'undefined' ) $text = $('.skew-text');

		$text.each(function() {


			$(this).find('.skewed').remove();
			if ( $(this).hasClass('no-right') ) var right = false;
			else var right = true;

			if ( $(this).hasClass('big-skew') ) var t = 1.5;
			else var t = 1.2;

			var height;

			// fix for the hippocampus learning centre text in the features
			if ( $('body').hasClass('postid-899') ) {

				height = 351 * t;
				$(this).css('width', 320);
			}
			else {
				height = $(this).height() * t;
			}

			var	num = Math.ceil(height / eh),
				left_offset = 0,
				right_offset = num * eo,
				spans = '';

			if ( right ) right_offset -= 30;
			if ( right_offset < 0 ) right_offset = 0;
			for ( var i = 0; i <= num; i++ ) {

				spans += '<span class="skewed fl" style="width:' + left_offset + 'px;" />';
				spans += '<span class="skewed fr" style="width:' + right_offset + 'px;" />';

				left_offset += eo;
				right_offset -= eo;

				if ( right_offset < 0 ) right_offset = 0;

			}

			$(this).prepend(spans);

			var $img = $(this).siblings('.has-img');
			if ( $img.length > 0 ) {
				$img.css({
					'margin-left' : left_offset + 15
				});
			}

		});

	};


	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Tabs
	 *
	** -------------------------------------------------------------------------*/

	plugin.tabs_init = function() {

		$('.tab.has-bricks').css({
			'overflow' : 'hidden',
			'height' : 0
		}).each(function() {
			var $container = $(this).find('.bricks-container');
			$container.bwMasonry();
		});

		setTimeout(function() {

			$('.tab.has-bricks').css({
				'overflow' 	: 'visible',
				'height' 	: 'auto',
				'position' 	: 'absolute',
				'top' 		: 0
			});

			$(window).trigger('scroll');

		}, 50);

		setTimeout(function() {

			$('.tab.has-bricks').css({
				'position' 	: 'static',
				'top' 		: 'auto'
			});

			$('.tabs-container').each(function() {

				var $this = $(this);
				var $li = $this.find('.tabs li');

				if ( $li.filter('.load-active').length == 0 )
					$li.first().addClass('load-active');

				$li.filter('.load-active').addClass('active');

				var id = $li.filter('.active').children('a').attr('data-tab_target');

				$this.find('.tab[data-tab="' + id + '"]').show().siblings('.tab').hide();
			});



		}, 100);






	};

	plugin.tabs_changing = false;
	plugin.tabs_handler = function(event) {

		event.preventDefault();

		if ( plugin.tabs_changing ) return;
		plugin.tabs_changing = true;

		var dir = 'right';

		if ( $(this).hasClass('nav') ) {

			var $tabs = $(this).parent('.tab-content').siblings('.tabs').find('li');
			var $cur = $tabs.filter('.active');
			var n = $tabs.length;

			if ( $(this).hasClass('next') ) {
				var $new = $cur.next();
				if ( $new.length == 0 ) $new = $tabs.first();
			} else if ( $(this).hasClass('prev') ) {
				var $new = $cur.prev();
				if ( $new.length == 0 ) $new = $tabs.last();
				dir = 'left';
			}

			if ( $new.length == 0 ) return false;
			var $nav = $new.children('a');

			var trigger = 'arrow';

		} else {
			var $nav = $(this);

			var current_index = $nav.parent('li').siblings('li.active').index();
			var target_index = $nav.parent('li').index();

			if ( target_index < current_index ) dir = 'left';

			var trigger = 'tab';

		}

		if ( $nav.parent('li').hasClass('active') ) return;


		var $tab_content = $nav.parents('.tabs').siblings('.tab-content');
		var $tab = $tab_content.children('.tab');

		var id = $nav.attr('data-tab_target');
		$nav.parent('li').addClass('active').siblings('li').removeClass('active');

		$target_tab = $tab.filter('.tab[data-tab="' + id + '"]');

		var h = $target_tab.height();

		$tab_content.css('height', $tab_content.height()).animate({
			'height' : h
		}, plugin.animation_time, plugin.animation_easing);

		$tab.css({
			'position' : 'absolute',
			'left' : 0,
			'top' : 0
		}).filter(':visible').fadeOut(300);

		if ( dir == 'left' ) var target_left = -100;
		else target_left = 100;



		$target_tab.css({
			'left' : target_left,
			'opacity' : 0,
			'display' : 'block'
		});

		$target_tab.animate({
			'left' : 0,
			'opacity' : 1
		}, plugin.animation_time, plugin.animation_easing, function() {

			$tab_content.css({
				'height' : 'auto'
			});

			$tab.css({
				'position' : 'static'
			});

			$(window).trigger('scroll');

			if ( plugin.tab_is_history ) {
				plugin.skewed_text();
				plugin.bricks_init();
				plugin.lazyload_init();
				plugin.tab_is_history = false;
			}

			plugin.tabs_changing = false;

		});

		var st = $target_tab.parents('.tabs-container').offset().top - plugin.nav_height;
		$('html,body').animate({
			scrollTop: st
		}, plugin.animation_time, plugin.animation_easing);

		var title = $(this).attr('data-title');
		if ( title == '' ) title = $(this).attr('data-tab_target');

		// if ( trigger == 'arrow' )
		// 	plugin.add_tracking('tab', 'click', title);
		// else
		// 	plugin.add_tracking('tab arrow', 'click', title);


	};

	plugin.replace_tab = function($tab, relative_url) {

		if( relative_url.indexOf('/') === 0 )
			relative_url = relative_url.substring(1);

		$('.tab[data-ajax_url="' + relative_url + '"]').html($tab.html());
		plugin.tab_is_history = true;
		$('.tabs a[data-ajax_url="' + relative_url + '"]').removeClass('history').click().addClass('history');
	};

	plugin.special_tabs_init = function () {

		$('.special-tabs').each(function() {

			var $tabs = $(this).find('.special-tab');

			plugin.skewed_text($tabs.find('.skew-text'));

			$tabs.first().find('.image-link .photo').each(function() {
				$(this).hide().attr('src', $(this).attr('data-src')).removeAttr('data-src').load(function() {
					$(this).fadeIn(200);
				});
			});

			$tabs.not(':first').hide();

		});

	};

	plugin.special_tabs_handler = function(event) {

		event.preventDefault();

		if ( plugin.tabs_changing ) return;
		plugin.tabs_changing = true;

		var dir = 'right';

		var $tab_container = $(this).parents('.special-tabs');
		var $tabs = $tab_container.find('.special-tab');
		var $cur = $tabs.filter(':visible');
		var n = $tabs.length;

		if ( $(this).hasClass('next') ) {
			var $new = $cur.next('.special-tab');
			if ( $new.length == 0 ) $new = $tabs.first();
		} else if ( $(this).hasClass('prev') ) {
			var $new = $cur.prev('.special-tab');
			if ( $new.length == 0 ) $new = $tabs.last();
			dir = 'left';
		}

		if ( $new.length == 0 ) return false;

		var $target_tab = $new;

		var h = $target_tab.height();

		$tab_container.css('height', $tab_container.height()).animate({
			'height' : h
		}, plugin.animation_time, plugin.animation_easing);

		$tabs.css({
			'position' : 'absolute',
			'left' : 0,
			'top' : 0
		}).filter(':visible').fadeOut(300);

		if ( dir == 'left' ) var target_left = -100;
		else target_left = 100;

		$target_tab.css({
			'left' : target_left,
			'opacity' : 0,
			'display' : 'block'
		});

		$target_tab.find('.image-link .photo').each(function() {
			if ( $(this).attr('data-src') ) {
				$(this).hide().attr('src', $(this).attr('data-src')).removeAttr('data-src').load(function() {
					$(this).fadeIn(200);
				});
			} else {
				$(this).filter(':hidden').fadeIn(200);
			}
		});

		$target_tab.animate({
			'left' : 0,
			'opacity' : 1
		}, plugin.animation_time, plugin.animation_easing, function() {

			$tab_container.css({
				'height' : 'auto'
			});

			$tabs.css({
				'position' : 'static'
			});

			//$(window).trigger('scroll');

			plugin.tabs_changing = false;

		});
		/*

		var st = $tab_container.offset().top - plugin.nav_height;
		$('html,body').animate({
			scrollTop: st
		}, plugin.animation_time, plugin.animation_easing);
*/

	};

	 /**
	 * ---------------------------------------------------------------------------
	 *
	 * AJAX Loading & Caching
	 *
	** -------------------------------------------------------------------------*/

	plugin.remember_scroll = null;

	plugin.get_cache_key = function(url)
	{
		return url.replace(/^\/|\/$/g, '').replace('/','-');
	};

	plugin.ajax_call = null;
	plugin.data = '';
	plugin.load_content = function()
	{

		var state = History.getState();
		var type = state.data.type;

		switch (type) {
			case 'open-plain-list-item' :
			case 'close-plain-list-item' :
				return;
			default: break;
		 }

		plugin.data = '';
		var relative_url = plugin.get_relative_url();

		if (relative_url == undefined) {
			if (plugin.ajax_call == null)
				$(document).trigger('afterreplacecontent');
			return;
		}

		if (plugin.ajax_call != null){
			plugin.ajax_call.abort();
			plugin.ajax_call = null;
		}

		plugin.start_loading_indicator();
		$('#nav-search:visible').hide();

		var type = state.data.type;

		//if ( relative_url.indexOf( 'blog/' ) != -1 ) type = 'open-post';

		var scroll = false;

		switch (type) {

			case 'replace-bricks' :
			case 'replace-all-bricks' :
			case 'filter-ideas-list' :


				break;
			case 'replace-tab' :
			case 'open-brick-drawer' :

				$('.bricks-container .brick[data-content_url="'+relative_url+'"]').addClass('loading');

			case 'open-brick-page' :

				plugin.remember_scroll = $(window).scrollTop();

			case 'filter-plain-list' :
			case 'open-plain-list-item' :
			case 'close-plain-list-item' :
			case 'open-post' :
			case 'replace-posts' :
				break;

			case 'close-brick-drawer' :
				plugin.close_brick_drawer();
				plugin.replace_content();
				return;
				break;

			default :
				$('#loading-indicator').fadeIn(200);
				// $('#content, #footer').hide();
				scroll = true;
		}


		var ajax_params = {
			url: relative_url,
			type: 'GET',
			dataType: 'html',
			// data: { 'bw_history' : 'true' },

			complete: function(xhr, textStatus) {
				//if (typeof xhr.responseText !== 'undefined') return;

				if ( textStatus == 'abort' || textStatus == 'error' ) {

					if ( scroll ) $('html,body').scrollTop(0);
					plugin.ajax_reload();
					plugin.stop_loading_indicator();

					return;
				}

				var html = xhr.responseText;


				if ( $.bw.is_ie() ) {
					$( 'body' ).append( '<div id="newContent" />' );
					document.getElementById( 'newContent' ).innerHTML = html;
					var newBodyClasses = $( '#newContent #body-classes' ).attr( 'class' );
					data = $( '#newContent' );
				}else{
					data = $('<div>').append( html );
				}


				plugin.replace_content(data, relative_url);
				return;

				if ( plugin.animation_lock ) {
					$(document).off('replacecontent').on('replacecontent',function(){
						plugin.replace_content(data, relative_url);
					});
				}else{
					plugin.replace_content(data, relative_url);
				}

			},
			success: function(data, textStatus, xhr) {

			},
			error: function(xhr, textStatus, errorThrown) {
				//called when there is an error
			}
		};

		if ( $.bw.browser_has_local_storage() ) {
			ajax_params.cacheJStorage = true;
			ajax_params.cacheKey = plugin.get_cache_key( relative_url );
			ajax_params.cacheTTL = 60;
			ajax_params.isCacheValid = function(){
				return true;
			};
		}

		plugin.ajax_call = $.ajax(ajax_params);

	};


	plugin.replace_content = function(data, relative_url)
	{

		var state = History.getState();

		// replace body classes
		$('body').attr('class', $(data).find('#body-classes').attr('class'));

		var title = $(data).find('#head-title').text();
		$(document).attr('title', title);

		// replace menu items classes
		$('.menu-item').each(function(index, item) {
			$(item).removeClass('current-menu-item current-menu-parent current-menu-ancestor current-page-ancestor current_page_parent current_page_ancestor');

			$new_item = $(data).find( '#' + $(item).attr('id') + '.menu-item');
			if ( $new_item.hasClass('current-menu-item') ) $(item).addClass('current-menu-item');
			else if ( $new_item.hasClass('current-menu-parent') ) $(item).addClass('current-menu-parent');
			else if ( $new_item.hasClass('current-menu-ancestor') ) $(item).addClass('current-menu-ancestor');
			else if ( $new_item.hasClass('current-page-ancestor') ) $(item).addClass('current-page-ancestor');
			else if ( $new_item.hasClass('current_page_parent') ) $(item).addClass('current_page_parent');
			else if ( $new_item.hasClass('current_page_ancestor') ) $(item).addClass('current_page_ancestor');

		});

		//if ( relative_url == '/' || relative_url == '' ) {

		plugin.new_data = data;
		$(document).trigger('afterloadcontent');

		var $ajax_contents = $(data).find('#content'),
			$target = $('#content');

		/*
var $ajax_bricks = $ajax_contents.find('.bricks-container')
			$target_bricks = $target.find('.bricks-container');

		if ( $ajax_bricks.length > 0 && $target_bricks.length > 0 ) {
			$ajax_bricks.replaceWith($target_bricks);
		}
*/

		var type = state.data.type;


		// Detect filtering bricks on single
		if ( type == 'replace-bricks' && $('body').hasClass('single') && ! $(data).find('#body-classes').hasClass('single') ) {
			type = '';
		}

		// if ( relative_url.indexOf( 'blog/' ) != -1 ) type = 'open-post';

		if( relative_url.indexOf('/') === 0 )
			relative_url = relative_url.substring(1);

		switch (type) {
			case 'replace-all-bricks' :
				$('h3.more-investments').hide();
			case 'replace-bricks' :
				var $new_bricks = $ajax_contents.find('.bricks-container > li');
				plugin.bricks_replace($new_bricks);
				$target.find('.filters').html($ajax_contents.find('.filters').html()).show();
				$target.find('.list-drawers').hide();

				if ( type == 'replace-all-bricks' ) {

					if ( $('.bricks-container').parents('.tab').length > 0 ) {
						$('html,body').animate({
							scrollTop: $('.bricks-container').parents('.tab').offset().top - plugin.nav_height
						}, plugin.animation_time, plugin.animation_easing);
					}

				}

				plugin.ajax_reload();

				break;
			case 'replace-tab' :

				var $tab = $ajax_contents.find('.tab[data-ajax_url="' + relative_url + '"]');
				plugin.replace_tab($tab, relative_url);

				break;
			case 'filter-plain-list' :
				$target.find('.plain-list').hide().html($ajax_contents.find('.plain-list')).fadeIn(400);
				$target.find('.filters').html($ajax_contents.find('.filters').html());

				plugin.ajax_reload();

				break;
			case 'filter-ideas-list' :
				var new_list_content = $ajax_contents.find('.content-block[data-tab="ideas"]').html();
				$target.find('.content-block[data-tab="ideas"]').html( new_list_content );

				// $target.find('.filters').html($ajax_contents.find('.filters').html()).show();
				// $target.find('.list-drawers').hide();

				// if ( type == 'replace-all-bricks' ) {

				// if ( $('.ideas-list').parents('.content-block[data-tab="ideas"]').length > 0 ) {
				// 	$('html,body').animate({
				// 		scrollTop: $('.ideas-list').parents('.content-block[data-tab="ideas"]').offset().top - plugin.nav_height
				// 	}, plugin.animation_time, plugin.animation_easing);
				// }

				// }

				plugin.ajax_reload();

				break;
			case 'open-plain-list-item' :
			case 'close-plain-list-item' :
			case 'close-brick-drawer' :
				break;
			case 'open-brick-drawer' :

				$('.bricks-container .brick').removeClass('current loading').filter('[data-content_url="'+relative_url+'"]').addClass('current');
				if ( $('.bricks-container .brick-drawer').is(':visible') ) {
					$('.bricks-container .brick-drawer').fadeOut(400, function() {
						$('.bricks-container .brick-drawer').replaceWith($ajax_contents.find('.bricks-container .brick-drawer'));
						plugin.open_brick_drawer(true);
					});
				} else {
					$('.bricks-container .brick-drawer').replaceWith($ajax_contents.find('.bricks-container .brick-drawer'));
					plugin.open_brick_drawer(true);
				}

				break;
			case 'open-post' :
				// var $post = $ajax_contents.find('.post-list[data-ajax_url="/' + relative_url + '"]');
				var $post = $ajax_contents.find('.post-single[data-ajax_url="/' + relative_url + '"]');

				// console.log( "ajax_contents", $ajax_contents.html() );

				plugin.open_post($post, relative_url);
				break;

			case 'replace-posts' :
				var $posts = $ajax_contents.find('.posts');
				plugin.replace_posts($posts);
				break;

			case 'open-brick-page' :
			default :
				$('html,body').scrollTop(0);
				$target.html($ajax_contents.html());

				$('#footer').html($(data).find('#footer').html());

				plugin.ajax_reload();

				if ( $('body').hasClass('all-investments') ) {
					if ( plugin.remember_scroll != null ) {
						$('html,body').scrollTop(plugin.remember_scroll);
						plugin.remember_scroll = null;
					}
				} else if ( type != 'open-brick-page' ) {
					plugin.remember_scroll = null;
				}

		}


		$('#admin-edit').attr('href', $(data).find('#admin-edit').attr('href'));

		plugin.ready__removeElementsForBlogHome();
		plugin.stop_loading_indicator();
		$('#loading-indicator:visible').fadeOut(400);
		$(document).trigger('afterreplacecontent').trigger('aftershowcontent');

		plugin.add_pageview(relative_url, title);
		plugin.logQuantcastUrl(relative_url);

		/*
var $AJAX_CONTENTS = $(data).find('.ajax-content');
		var $CONTENTS_TO_REPLACE = $('.ajax-content');

		var ajax_replace_ids = [];
		$AJAX_CONTENTS.each(function(index,item){
			var ajax_replace_id = $(item).attr('data-ajax_replace_id');

			// check if id is found or it was already replaced
			if (ajax_replace_id == undefined || ajax_replace_id == '') return true;

			for (var i=0; i < ajax_replace_ids.length; i++) {
				if(ajax_replace_ids[i] == ajax_replace_id) return true;
			};

			// save in ids array
			ajax_replace_ids.push(ajax_replace_id);

			// check if container is specified
			var $ajax_container = [];
			var ajax_container_selector = $(item).attr('data-ajax_container_selector');

			if (ajax_container_selector != undefined)
				$ajax_container = $( ajax_container_selector );

			// if no container was found fallback to #center > .inner
			if ($ajax_container.length == 0)
				$ajax_container = $('#center > .inner');

			// check if we need to remove previous content
			var $CONTENT_TO_REPLACE = $CONTENTS_TO_REPLACE.filter('[data-ajax_replace_id="' + ajax_replace_id + '"]')
			if ($CONTENT_TO_REPLACE.length > 0) {
				var ajax_replace_lock = $CONTENT_TO_REPLACE.attr('data-ajax_replace_lock');
				if (ajax_replace_lock == 'true') return true;
				$CONTENT_TO_REPLACE.remove();
			}

			// append to container at right position
			if ($ajax_container.children('.ajax-content').length > 0) {
				$ajax_container.children('.ajax-content').last().after($(item).hide());
			}else{
				$ajax_container.prepend($(item).hide());
			}

		});

		$CONTENTS_TO_REPLACE.each(function(index,item){
			var ajax_replace_id = $(item).attr('data-ajax_replace_id');
			i
			for (var i=0; i < ajax_replace_ids.length; i++) {
				if(ajax_replace_ids[i] == ajax_replace_id) return true;
			};
			$(item).remove();
		});
*/

		/**
		 * Remove the data div from the bottom of the body
		 * when we are done replacing the content.
		 * This is an IE fix
		 */
		if ( $.bw.is_ie() )
			$(data).remove();


	}

	/**
	 * matches URLs with their titles and fires a Quantcast event
	 *
	 * @author Alessandro Biavati <@alebiavati>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param fragment
	 * @return null
	 */

	plugin.logQuantcastUrl = function ( fragment )
	{
		title = '';

		switch( fragment ) {
			case '':
			case '/':
				title = "Home page";
				break;

			case '/donate/':
				title = "Donation";
				break;

			case '/partner/':
				title = "Partner";
				break;

			case '/investments/apply-for-investment/':
				title = "Apply for investment";
				break;

			case '/leaders/regional-fellows/india/':
				title = "Regional Fellow - India";
				break;

			case '/leaders/regional-fellows/east-africa/':
				title = "Regional Fellow - East Africa";
				break;

			case '/leaders/regional-fellows/pakistan/':
				title = "Regional Fellow - Pakistan";
				break;

			case '/leaders/plusacumen/':
				title = "+Acumen";
				break;

			case '/manifesto/':
				title = "Manifesto";
				break;

			default:
				return;
		}

		if (title === '')
			return;

		plugin.logQuantcast( title );

	};/* logQuantcastUrl() */


	/**
	 * Log Quantcast tags for certain pages
	 *
	 * @author Alessandro Biavati <@alebiavati>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param title
	 * @return null
	 */

	plugin.logQuantcast = function ( title )
	{
		if (typeof title === 'undefined' || title === null || title === '')
			return;

		var _qevents = _qevents || [];

		// console.log('Quantcast Log: ' + title);
		// _qevents.push({ qacct:"p-aFJtULt9DfJhp", labels: '_fp.event.' + title });

		title = encodeURI(title);
		$('body').append('<img src="//pixel.quantserve.com/pixel/p-aFJtULt9DfJhp.gif?labels=_fp.event.' + title + '" style="display: none;" border="0" height="1" width="1" alt="Quantcast" />');

	};/* logQuantcast() */


	/**
	 * @internal Missing Description
	 *
	 * @author Alessandro Biavati <@alebiavati>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param arguments
	 * @return null
	 */

	plugin.quantcastTag = function ( arguments )
	{


	};/* quantcastTag() */


	plugin.nav_logo = $('#nav h1 img');

	plugin.start_loading_indicator = function() {

		// plugin.nav_logo.animate({
		// 	'opacity' : 0
		// }, 400, function() {
		// 	plugin.nav_logo.animate({
		// 		'opacity' : 1
		// 	}, 400, function() {
		// 		plugin.start_loading_indicator();
		// 	});
		// });

		$( '.loading-bar' )
			.stop(0,0)
			.css({
				width: 0,
				opacity: 1
			})
			.show()
			.animate({
				width: $.bw.env.w
			}, 6000, 'easeOutCubic' );

	}

	plugin.stop_loading_indicator = function() {

		// plugin.nav_logo.stop().animate({
		// 	'opacity' : 1
		// }, 400);

		$('.loading-bar').stop(0,0);
		var loadingBarWidth = $('.loading-bar').width()

		if (loadingBarWidth < 100)
		{
			$('.loading-bar').hide();
		}
		else
		{
			$('.loading-bar')
				.css({
					width: parseInt(loadingBarWidth, 10) + 'px'
				}).animate({
					width: $.bw.env.w + 20
				}, 400, 'easeOutCubic', function(){

					$('.loading-bar')
						.fadeOut( 600, function(){

							$('.loading-bar').css({
								width: 0,
								opacity: 1
							})
						});
				});

		}

	}

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Preload init
	 *
	** -------------------------------------------------------------------------*/
	plugin.preload_count = 0;
	plugin.preload_limit = 3;
	plugin.preloaded_urls = [];

	plugin.preload_init = function()
	{
		$(document).on('afterstatechange', function() {
			plugin.preload_count = 0;
		});
		$(document).on('afterreplacecontent.preload', plugin.preload_next_page);

		plugin.preload_next_page();
	}

	plugin.preload_next_page = function(event)
	{
		if (plugin.preload_count >= plugin.preload_limit) return;

		var current_relative_url = plugin.get_relative_url();
		if (current_relative_url == undefined) return;

		if (current_relative_url == '/') {
			var current_relative_url_root = current_relative_url;
		}else{
			var current_relative_url_root = current_relative_url.split('/');
			current_relative_url_root = '/' + current_relative_url_root[1] + '/';
		}

		$('a:internal:not(.no-ajax), a[data-internal_href]:not(.no-ajax)').each(function(index, anchor) {

			var url = '';
			if ( $(anchor).attr('data-internal_href') != undefined && $(anchor).attr('data-internal_href') != 'javascript:void(0);' ) {
				url = $(anchor).attr('data-internal_href').replace(/([^\/])$/, '$1/');
			}else if($(anchor).attr('href') != undefined && $(anchor).attr('href') != 'javascript:void(0);' ) {
				url = $(anchor).attr('href').replace(/([^\/])$/, '$1/').replace(plugin.get_root_url(),'');
			}

			if (url == '' || url == undefined || current_relative_url == url) return;

			var url_preloaded = false;
			for (var i=0; i < plugin.preloaded_urls.length; i++) {
				if (plugin.preloaded_urls[i] == url)
					url_preloaded = true;
			}

			if ( !url_preloaded ) {
				plugin.preload_url(url);
				return false;
			}

		});

	};

	plugin.preload_url = function(url_to_preload)
	{
		plugin.preload_count++;
		plugin.preloaded_urls.push(url_to_preload);

		var ajax_params = {
			url: url_to_preload,
			type: 'GET',
			dataType: 'html',
			// data: {'bw_history' : 'true'},

			success: function(data, textStatus, xhr) {
				$(document).trigger('afterreplacecontent.preload');
			}

		};

		if ( !$.bw.is_ie() ) {
			ajax_params.cacheJStorage = true;
			ajax_params.cacheKey = plugin.get_cache_key( url_to_preload );
			ajax_params.cacheTTL = 60;
			ajax_params.isCacheValid = function(){
				return true;
			};
		}

		$.ajax(ajax_params);
	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * History plugin
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

	plugin.history_init = function()
	{
		var History = window.History;
		if ( !History.enabled ) return false;

		plugin.get_relative_url(true);

		// Internal Helper
		$.expr[':'].internal = function(obj, index, meta, stack){
			// Prepare
			var $THIS = $(obj);
			if ( $THIS.attr('target') === '_blank' ) return false;

			var url = $THIS.attr('href')||'';

			if (url == '' || url == undefined) return false;
			var isInternalLink;

			// Check link
			isInternalLink = url.substring(0,plugin.get_root_url().length) === plugin.get_root_url() || url.indexOf(':') === -1;

			if ( url.indexOf('.pdf') !== -1 ) isInternalLink = false;

			// Ignore or Keep
			return isInternalLink;
		};

		if ( $.bw.is_touch_screen() ) {
			$(window).on('touchstart', plugin.history_touchstart_handler);
			$(window).on('touchend', plugin.history_touchend_handler);
			$(window).on('touchcancel', plugin.history_touchend_handler);
			$(document).on('click', 'a:internal:not(.no-ajax), a[data-internal_href]', function(event){
				event.preventDefault();
				return false;
			});
			$(document).on('aftershowcontent', function(){
				$('a[data-internal_href]').each(function(index,link) {
					var $LINK = $(link);
					$LINK.attr('href', $LINK.attr('data-internal_href') );
					$LINK.removeAttr('data-internal_href');
				});

			});

			// touch menu
			$('#menu-main-nav > .menu-item > a').each(function (index, el) {
				var href = $(el).attr('href');
				$(el).addClass('no-ajax');
				$(el).attr('href', 'javascript:void(0);');
				$(el).after(
					$('<a />')
						.addClass('link-clone')
						.attr('href', href)
						.hide()
						.click(plugin.history_click_handler)
				);
			});

			$(document).on(plugin.click_event, '#menu-main-nav > .menu-item > a.no-ajax', function (event) {
				event.preventDefault();
				if ( $(this).parents('.menu-item').hasClass('hover') ) {
					$(this).siblings('.link-clone').click();
				}else{
					$("#menu-main-nav .hover").removeClass('hover');
					$(this).parents('.menu-item').addClass('hover');
				}
				return false;
			});

			$(document).on('afterstatechange', function (event) {
				$("#menu-main-nav .hover").removeClass('hover');
			});


			/**
			 * Hide menu dropdown if clicking anywhere else
			**/
			$(document).on('click tap', function(event){
				if ( $(event.target).parents('#menu-main-nav').length > 0 ) return;
				$("#menu-main-nav .hover").removeClass('hover');
			});

		}else{
			$(document).on('click', 'a:internal:not(.no-ajax)', plugin.history_click_handler);
			$('html').addClass('no-touch');
		}

		$(document).on('afterstatechange', plugin.load_content);

		$(document).on('replacecontent', function(event){
			$(document).trigger('afterreplacecontent');
		});

		$(document).on('replacecontent.animation_unlock', function(event){
			plugin.animation_lock = false;
		});

		$(window).on('statechange.replace_urls', function(event){

			// update previous url
			plugin.previous_relative_url = plugin.get_relative_url();
			plugin.relative_url = plugin.get_relative_url(true);

			// lock environment during animation
			plugin.animation_lock = true;

			// unbind previous handlers
			$(document).off('replacecontent');

			// send google analytics event
			if (window._gaq != undefined){
				window._gaq.push(['_trackPageview', plugin.relative_url ]);
			}

			// change menu items
			var relative_url_root = plugin.relative_url.split('/');
			relative_url_root = '/' + relative_url_root[1] + '/';

			$(document).trigger('afterstatechange');
		});

		// // scroll page to top when replacing content to avoid scrolling problems
		// $(document).on('afterreplacecontent', function(event){
		//     var relative_url_root = plugin.relative_url.split('/');
		//     relative_url_root = '/' + relative_url_root[1] + '/';
		//     if (relative_url_root != '/live/')
		//         $('body').animate({scrollTop: 0}, 0);
		// });

		// reset environment after content is shown
		$(document).on('aftershowcontent', function(event){
			//plugin.set_env();
		});

	};

	/**
	 * Check if any keys were pressed while an event happened
	 *
	 * @author Alessandro Biavati <ale@briteweb.com>
	 * @package briteweb/package
	 * @since 1.0.0
	 * @param (event) event - Event to check keys in
	 * @return (boolean) True if key was pressed
	 */

	plugin.keyPressed = function ( event )
	{
		var keyPressed = false;

		var keys = [ 'ctrlKey', 'altKey', 'shiftKey', 'metaKey' ];

		$.each( keys, function(index, key ){

			if ( typeof event[ key ] != 'undefined' && event[ key ] )
				keyPressed = true;

		});

		return keyPressed;

	};/* keyPressed() */


	plugin.history_click_handler = function(event){

		// check if we are pressing any key
		if ( plugin.keyPressed( event ) )
			return;

		var History = window.History;
		if ( !History.enabled ) return false;

		if (event instanceof jQuery) {
			$LINK = $(event);
		}else{
			event.preventDefault();
			// Prepare
			var $LINK = $(event.target); // Find the node the drag started from
			if ($LINK.attr('href') == undefined || $LINK.attr('href') == '')
				$LINK = $LINK.closest('a');
		}

		if ( $LINK.attr('data-internal_href') != undefined && $LINK.attr('data-internal_href') != 'javascript:void(0);' ) {
			var url = $LINK.attr('data-internal_href').replace(/([^\/][\/])$/, '$1');
		}else{
			var url = $LINK.attr('href').replace(/([^\/][\/])$/, '$1');
		}

		var title = $LINK.attr('data-title');

		if (title == undefined || title == '') {
			title = $LINK.attr('title');
			if (title != undefined && title != '') title += ' | ' + $('body').attr('data-blog_name');
		};

		// Continue as normal for cmd clicks etc
		if ( event.which == 2 || event.metaKey ) { return true; }

		var data = {};
		if ( $LINK.attr('data-ajax_type') != '' ) {
			data.type = $LINK.attr('data-ajax_type');
		}

		// Ajaxify this link
		History.pushState(data,title,url);
		return false;
	};


	plugin.history_touchstart_handler = function(event)
	{
		if(event.originalEvent.changedTouches.length != 1) return; // Only deal with one finger

		var touch = event.originalEvent.changedTouches[0];  // Get the information for finger #1
		var $LINK = $(touch.target); // Find the node the drag started from
		if ($LINK.attr('href') == undefined || $LINK.attr('href') == '')
			$LINK = $LINK.closest('a');

		if ( !$LINK.is('a:internal:not(.no-ajax)') ) return;

		if ( $LINK.hasClass('hover-hold') ) {
			if ( $LINK.hasClass('hold') ) {
				$LINK.removeClass('hold');
			} else {
				$LINK.addClass('hold');
				$('.hover-hold').not($LINK).removeClass('hold');
				return;
			}
		}

		$LINK.data('touchstart_x', touch.pageX);
		$LINK.data('touchstart_y', touch.pageY);
		$LINK.data('touchstart_timestamp', event.originalEvent.timeStamp);

	};

	plugin.history_touchend_handler = function(event)
	{
		if(event.originalEvent.changedTouches.length != 1) return; // Only deal with one finger

		var touch = event.originalEvent.changedTouches[0];  // Get the information for finger #1
		var $LINK = $(touch.target); // Find the node the drag started from
		if ($LINK.attr('href') == undefined || $LINK.attr('href') == '')
			$LINK = $LINK.closest('a');

		if ( !$LINK.is('a:internal:not(.no-ajax)') ) return;

		var touchstart_x = $LINK.data('touchstart_x');
		var touchstart_y = $LINK.data('touchstart_y');
		var touchstart_timestamp = $LINK.data('touchstart_timestamp');

		var distance_x = touch.pageX - touchstart_x;
		var distance_y = touch.pageY - touchstart_y;

		var time = ( event.originalEvent.timeStamp - touchstart_timestamp ); // in msec
		var distance_threshold = 5; // px
		var time_threshold = 500; // ms

		if (distance_x < distance_threshold && distance_x > -distance_threshold && distance_y < distance_threshold && distance_y > -distance_threshold) {
			if (time < time_threshold) {
				event.preventDefault();
				if ( $LINK.attr('href') != 'javascript:void(0);' )
					$LINK.attr('data-internal_href', $LINK.attr('href') );
				$LINK.attr('href','javascript:void(0);');
				plugin.history_click_handler(event);
				return false;
			}
		}

	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Utility functions
	 *
	** -------------------------------------------------------------------------*/

	plugin.fit_header_banner = function() {


		if ( ! plugin.is_home ) return;

		var h = plugin.env.h;

		if ( $('#home-nav').length > 0 ) {

			h -= plugin.big_nav_height;

			if ( h < 460 ) h = 460;

			if ( plugin.is_tablet )
			{
				h += 60;
			}

		}else{

		}

		$('#header, #header-banner, #header-spacer, #header-content').height(h);

		plugin.fit_images($('#header-banner img'));

		plugin.nav_offset = h + plugin.big_nav_height;

		//plugin.fit_video();
		//

		plugin.fit_home_header_video();

	};

	/**
	 * Fit the video in the home headers to the window
	 *
	 * @author Alessandro Biavati <ale@briteweb.com>
	 * @package briteweb/acu-theme
	 * @since 1.0.0
	 * @return null
	 */

	plugin.fit_home_header_video = function ()
	{
		$('.home-header-video .video').each(function(index, video) {

			plugin.fit_video_in_window( $(video) );

		});


	};/* fit_home_header_video() */

	plugin.fit_video_in_window = function ( $video ) {

		var videoWidth = parseInt( $video.attr('width'), 10 );
		var videoHeight = parseInt( $video.attr('height'), 10 );
		var videoRatio = videoWidth / videoHeight;

		var envRatio = $.bw.env.w / $.bw.env.h;

		if ( envRatio > videoRatio) {

			$video.css({
				width: '100%',
				height: 'auto',
			});

		}else{

			$video.css({
				width: 'auto',
				height: '100%',
			});

		}

	};

	plugin.fit_video = function() {

		var $video = $('#header-video iframe');
		if ( $video.length == 0 ) return;

		var $parent = $video.parent(),
			w = $video.attr('width'),
			h = $video.attr('height'),
			pw = $parent.width(),
			ph = $parent.height(),
			ratio = w / h,
			parent_ratio = pw / ph;

		if ( ratio > parent_ratio ) {

			var new_width = ph * ratio;
			var ml = ((ph * ratio) - pw) / 2;

			$video.css({
				'height' : '100%',
				'width' : new_width,
				'margin-top' : 0,
				'margin-left' : -ml
			});

		} else {

			var new_height = pw / ratio;
			var mt = ((pw / ratio) - ph) / 2;

			$video.css({
				'width' : '100%',
				'height' : new_height,
				'margin-left' : 0,
				'margin-top' : -mt
			});
		}


	};

	plugin.fit_images = function($img) {

		//if ( plugin.is_mobile ) return;

		if ( typeof $img != 'undefined' ) $images = $img;
		else $images = $('.fit-img');

		$images.each(function() {
			var $img = $(this),
				$parent = $img.parent(),
				w = $img.attr('width'),
				h = $img.attr('height'),
				pw = $parent.width(),
				ph = $parent.height(),
				ratio = w / h,
				parent_ratio = pw / ph;

			if ( ratio > parent_ratio ) {

				var new_width = ph * ratio;
				var ml = ((ph * ratio) - pw) / 2;

				$img.css({
					'height' : '100%',
					'width' : 'auto',
					'margin-top' : 0,
					'margin-left' : -ml
				});

			} else {

				var new_height = pw / ratio;
				var mt = ((pw / ratio) - ph) / 2;

				$img.css({
					'width' : '100%',
					'height' : 'auto',
					'margin-left' : 0,
					'margin-top' : -mt
				});
			}

		});

	};


	plugin.fade_in_sequence = function($elements, fade_time, time_between, callback)
	{
		// fade in sequence
		var count = $elements.length;

		if (count == 0) {
			if (callback != undefined) callback();
			return;
		};

		$elements.each(function(index, item) {
			if (index < (count - 1) ) {
				$(item).delay(index * time_between).fadeIn(fade_time);
			}else{
				$(item).delay(index * time_between).fadeIn(fade_time, function() {
					if (callback != undefined) callback();
				});
			}
		});
	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Scrolling
	 *
	** -------------------------------------------------------------------------*/
	plugin.home_already_scrolled = false;

	plugin.scrolling_init = function()
	{

		if ( plugin.is_mobile ) return;

		$(window).scroll(plugin.scrolling_handler);
		$(window).on('touchmove', plugin.scrolling_handler);
		$(document).on('envchange', plugin.scrolling_handler);

		$(document).on('aftershowcontent', function(event){
			plugin.home_already_scrolled = false;
		});
	};

	plugin.scrolling_handler = function() {

		//if ( plugin.is_tablet ) return;

		var win_scroll = $.bw.get_scroll_top();
		if ( win_scroll < 0 ) win_scroll = 0;
		var new_scroll = win_scroll;

		plugin.parallax_photos(new_scroll);

		if ( plugin.is_home ) {

			plugin.scroll_home_header(new_scroll);

		}

		if( plugin.is_regionalFellows || plugin.is_globalFellows )
		{
			plugin.fixApplyBtn();
		}

	};

	/**
	 * Fix the apply button one it has reached a certain scroll position
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param
	 * @return null
	 */

	plugin.fixApplyBtn = function (  )
	{

		if( $( '.circle-link.scrollto' ).length == 0 )
			return;

		var win_scroll = $.bw.get_scroll_top();

		var slidesHeight = $( '.slides-fixed' ).height() + 21;
		var navHeight = $( '.header-nav' ).height();
		var contentHeight = $( '#content' ).height();

		var footer = $( '#footer' ).offset().top;

		if( win_scroll > slidesHeight )
		{
			$( '.circle-link.scrollto' ).addClass('sticky');

			if ( (win_scroll + 300) > footer )
			{
				$( '.circle-link.scrollto' ).css({
					'opacity': 0
				});
			} else if ( (win_scroll + 300) < footer && win_scroll < slidesHeight )
			{
				$( '.circle-link.scrollto' ).css({
					'top': 40 + navHeight,
					'opacity': 1
				});
			} else
			{
				$( '.circle-link.scrollto' ).css({
					'top': 40 + navHeight,
					'opacity': 1
				});
			}

		} else {

			$( '.circle-link.scrollto' ).removeClass('sticky');
			$( '.circle-link.scrollto' ).css({
				'top': 0
			});
		}

	},/* plugin.fixApplyBtn() */


	plugin.scroll_home_header = function(scroll) {

		var nav_offset = plugin.nav_offset - plugin.big_nav_height - 1;

		var scroll_offset = scroll - 100;
		if ( scroll_offset < 0 ) scroll_offset = 0;

		var o = 1 - (scroll_offset / (nav_offset - 400));
		if ( o < 0 ) o = 0;

		$('#header-content').css('opacity', o);

		var nav_offset = plugin.nav_offset - plugin.big_nav_height - 100 - plugin.nav_height - 2,
			nav_distance = 100,
			nav_ratio = 1 - (scroll_offset / nav_offset);

		if ( nav_ratio < 0 ) nav_ratio = 0;
		var nav_height = plugin.big_nav_height * nav_ratio;

		var opacity_ratio = 1 - (scroll_offset / (nav_offset * 0.75));
		if ( opacity_ratio < 0 ) opacity_ratio = 0;

		$('#home-nav').css({
			'height' : 	nav_height
		});


		$('#home-nav li.menu-item, #scroll-to-content').css({
			'opacity' :	opacity_ratio
		});

		if ( nav_height > 80 ) nav_height = 80;

		$('#home-nav .main-nav').css({
			'height' : 		nav_height,
			'line-height' :	nav_height + 'px'
		});

		var $nav = $('#nav');

		// pre(nav_height);

		if ( nav_height == 0 && !$nav.hasClass('visible') ) {
			if (!plugin.home_already_scrolled) {
				plugin.add_tracking('scroll', 'click', 'Homepage Scroll');
				plugin.home_already_scrolled = true;
			}

			if ( plugin.is_tablet ) $nav.show().addClass('visible');
			else $nav.hide().stop(true,true).fadeIn(400).addClass('visible');
		} else if ( nav_height > 0 && $nav.hasClass('visible') ) {
			if ( plugin.is_tablet ) $nav.show().hide().removeClass('visible');
			else $nav.show().stop(true,true).fadeOut(400).removeClass('visible');
		}


	};

	plugin.parallax_photos = function(scroll) {


		$('.plax').each(function() {

			var top = $(this).offset().top;

			var start = top - plugin.env.h;
			var end = top + 300;
			var dif = end - start;

			if ( scroll >= start && scroll <= end ) {

				var scroll_area = scroll - start;
				var p = scroll_area / dif

				//var h = $(this).find('.banner-img img').height() - 300;
				var h = 200;

				var top = Math.round(top = (1 - p) * h);

				$(this).css('background-position', 'center -' + top +'px');

			}

		});

	};

	plugin.scroll_to_anchor = function(event) {

		// event.preventDefault();

  //       var hash = $(this).attr('href');
		// var st = $(hash).offset().top - plugin.nav_height - 30;
		// $('html,body').animate({
		// 	scrollTop: st
		// }, plugin.animation_time, plugin.animation_easing);

  //       return false;


		var hash, st = 0;
		var url, tag, tab, tab_container, tabs_height, tabs_content_height;

		if ( event.type === 'click' ) {

			event.preventDefault();

			hash = $(this).attr('href');
			st = $(hash).offset().top - plugin.nav_height - 30;

		}
		// else {

		// 	url = document.URL;
		// 	tag = url.split('#');
		// 	tab = 0;

		// 	// tabs_content_height = $('.tab').height();// + $('ul.tabs').height();
		// 	// console.log( tabs_content_height );

		// 	// console.log( $('.tab').height() );
		// 	// console.log( 'tab' + tab );

		// 	// tabs_height = $('ul.tabs').height();
		// 	// tab_content_height = tab_container - tabs_height;

		// 	// console.log( 'tab height' + tab_content_height );

		// 	hash = '#' + tag[1]; console.log( hash );
		// 	st = $(hash).offset().top - plugin.nav_height - 30;
		// 	console.log( st );
		// }
		else {

			url = document.URL;
			tag = url.split('#');
			tab = 0;

			if (tag.length > 1) {

				$('ul.tabs li').each(function()
				{
					tab = tab + 1;
				});

				tab_container_height = $('.tabs-container').height() / tab;
				tabs_height = $('ul.tabs').height();
				tab_height = tab_container_height - tabs_height;

				hash = '#' + tag[1];
				// st = $(hash).offset().top - tab_height - plugin.nav_height - 30;

			}

		}

		if (st > 0) {

			$('html,body').animate({
				scrollTop: st
			}, plugin.animation_time, plugin.animation_easing);

		}

		return false;
	};


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
		}).parents('li.gfield').addClass('has-radio');

		$('input[type="checkbox"]:not(.styled_input)').each(function(index,input){
			$(input).addClass('styled_input');
			$(input).siblings('label').addClass('label_checkbox');
			plugin.update_check_label($(input));
		}).parents('li.gfield').addClass('has-radio');

		if (!plugin.form_style_initiated) {
			$(document).on( 'change', 'input.styled_input', plugin.update_check_label );
			$(document).on( 'focus', 'input.styled_input', plugin.update_check_label );
			$(document).on( 'blur', 'input.styled_input', plugin.update_check_label );
			$(document).on('gform_post_render', plugin.form_style_init);
			plugin.form_style_initiated = true;
		};

		$('.gfield select').each(function() {

			var $container = $(this).parent();
			if ( $container.hasClass('fancy-drop') ) return;

			var label = $(this).children('option:selected').text();

			if ( label != '' ) {
			} else if ( $container.parents('.gfield').hasClass('fancy-dropdown') ) {
				if ( $container.hasClass('ginput_container') ) var $label = $container.siblings('label');
				else $label = $container.children('label');
				var label = $label.html();
			}



			$(this).after('<label class="drop-label">' + label + '<span class="icon"></span></label>');
			$container.addClass('fancy-drop has').find('label.drop-label').data('label', label);




		});

		$(document).on('change', '.gfield .fancy-drop select', function(e) {
			var $label = $(this).siblings('label.drop-label');
			var text = $(this).children('option:selected').html();
			var val = $(this).val();
			if ( val == 0 || val == '' || val == '0' ) $(this).parent().addClass('gfield_error').removeClass('gfield_valid');
			else $(this).parent().removeClass('gfield_error').addClass('gfield_valid');

			$label.html(text + '<span class="icon"></span>');
		});

		//if ( ! plugin.is_mobile ) $('.fancy-dropdown select').selectBox();

	};

	plugin.update_check_label = function(event)
	{
		if (event instanceof $) {
			var $input = $(event);
		}else{
			var $input = $(event.target);
		}

		var input_name = $input.attr('name');
		$input.parents('form').find('[name="' + input_name + '"]').each(function(index, input) {
			var $label = $(input).siblings('label');
			switch (event.type){
				case 'focusin':
					$label.addClass('focus');
					break;
				case 'focusout':
					$label.removeClass('focus');
					break;
				default:
					if ( $(input).is(':checked') ) {
						$label.addClass('on');
					}else{
						$label.removeClass('on');
					}
					break;
			}
		});

	};


	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Map
	 *
	** -------------------------------------------------------------------------*/
	var dx = 0, zdx = 0;
	var marker = {};

	plugin.done_big_map_init = false;
	plugin.big_map_init = function() {

		var $map = $('#big-map'),
			$markers = $('#big-map a.marker'),
			$drawer = $('#map-drawer'),
			$drawer_content = $('#map-drawer .drawer-inner').hide();

		$markers.hide().fadeInSequence(200,-100);

		if ( plugin.done_big_map_init ) return;
		plugin.done_big_map_init = true;


		$(document).on(plugin.click_event, '#big-map a.zoom',function(e) {
			e.preventDefault();

			var $zoom_drawer = $('#zoom-drawer');
			var $zoom_drawer_content = $('#zoom-drawer .drawer-inner');

			zdx = $(this).position().left + 120;

			if ( $zoom_drawer.hasClass('open') ) {
				//$zoom_drawer_content.fadeOut(250).empty();
				//$zoom_drawer.animate({ 'left': zdx }, 250).addClass('loading');
			} else {
				$zoom_drawer_content.hide().empty();
				var dw = '290px';

				$zoom_drawer.addClass('loading').css({ left : zdx, width : 0 }).show().animate({ width : dw }, 400, function() {
					//$(this).addClass('loading');
				});

				$zoom_drawer_content.addClass('drawer-zoom').html($('#drawer-zoom-content').html()).fadeIn(250);
				$zoom_drawer.removeClass('loading').addClass('open');
			}

		});


		// Close map drawer
		$(document).on(plugin.click_event, '#zoom-drawer a.close-drawer',function(e) {
			e.preventDefault();
		//  $('#zoom-drawer .drawer-inner').removeClass('drawer-zoom').fadeOut(250, function() {
				$('#zoom-drawer').animate({ width : 0 }, 400, function() {
					$(this).hide().removeClass('open');
				});
			//});

		});

		$(document).on('mouseenter', '#big-map a.marker', function(e) {
			$(this).css('z-index', 2).siblings('a.marker').css('z-index',1);
			var tw = $(this).children('span.tip').outerWidth();
			var l = (tw / 2) - 10;
			//$(this).css('overflow', 'visible').children('span.tip').css({ 'left' : -l, 'display' : 'inline-block' });
			$(this).children('span.tip').css('left', '-'+l+'px' ).stop().fadeTo(250, 1, function() { $(this).css('display','block'); });
		}).on('mouseleave', '#big-map a.marker', function(e) {
			//$(this).css('overflow', 'hidden').children('span.tip').css( 'display', 'none' );
			$(this).children('span.tip').stop().fadeOut(0);
		}).on(plugin.click_event, '#big-map a.marker', function(event) {

			event.preventDefault();

			marker = $(this).position();
			dx = marker.left;

			if ( $('#zoom-drawer').hasClass('open') ) {
				dx = zdx;
			}else{
				if ( dx < 560 ) dx = dx + 40;
				else dx = dx - 290 - 40;
			}

			var data = {
				action: 	'bw_get_map_drawer',
				blog_id:	$(this).attr('data-id')
			};

			$('#big-map a.marker').removeClass('open');
			$(this).addClass('open');

			$drawer_content.removeClass('drawer-zoom');

			if ( $drawer.hasClass('open') ) {
				$drawer_content.fadeOut(250).empty();
				$drawer.animate({ 'left': dx }, plugin.animation_time, plugin.animation_easing).addClass('loading');
			} else {
				$drawer_content.hide().empty();
				$drawer.addClass('loading').css({ left :  dx, width : 0 }).show().animate({ width : 290 }, plugin.animation_time, plugin.animation_easing, function() {
					//$(this).addClass('loading');
				});
			}

			// Ajax action
			$.post( plugin.ajax_url, data, function(response) {

				$drawer_content.html(response).fadeIn(250);
				$drawer.removeClass('loading').addClass('open');

			});

		}).on(plugin.click_event, '#big-map a.close-drawer', function(event) {
			event.preventDefault();

			$drawer_content.removeClass('drawer-zoom').fadeOut(250);
			$drawer.animate({ width : 0 }, plugin.animation_time, plugin.animation_easing, function() {
				$(this).hide().removeClass('open');
			});

			$('#big-map a.marker').removeClass('open');

		});

	};

	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Animations
	 *
	** -------------------------------------------------------------------------*/

	plugin.done_animations_init = false;
	plugin.animations_init = function() {

		if ( !plugin.is_tablet ) {

			$(document).on('mouseover', '#nav li.menu-item.drop', function() {
				$(this).find('.sub-menu').stop(true,true).fadeIn(400);
			});

			$(document).on('mouseleave', '#nav li.menu-item.drop', function() {
				$(this).find('.sub-menu').stop(true,true).hide();
			});

		} else {

			//$('#nav > ul > li > a').addClass('no-ajax');

		}

		if ( plugin.done_animations_init ) return;
		plugin.done_animations_init = true;

		$(document).on(plugin.click_event, '#scroll-to-content', function(event) {
			event.preventDefault();
			$('html,body').animate({
				'scrollTop' : plugin.nav_offset - plugin.big_nav_height - plugin.nav_height + 1
			}, plugin.animation_time, plugin.animation_easing);
		});

		/*
if ( $('body').hasClass('tablet') ) {

			$(window).on('touchstart', '#nav > ul > li > a', function(e) {

				var $li = $(this).parent('li');

				if ( ! $(this).parent('li').hasClass('hover') ) {
					event.preventDefault();

					$(this).removeClass('no-ajax').parent('li').addClass('hover').siblings('li').removeClass('hover').children('a').addClass('no-ajax');
				} else {
					$(this).addClass('no-ajax').parent('li').removeClass('hover');
				}

			});

		}
*/

		if ( ! $('html').hasClass('ie8') ) {

			$(document).on('mouseenter', '.carousel.narrow li.slide', function() {
				$(this).find('.slide-text').animate({
					'opacity' : 1
				}, 250, plugin.animation_easing).siblings('.slide-text-bg').animate({
					'opacity' : 1,
					'width': '100%',
					'height' : '100%',
					'left' : 0,
					'top' : 0
				}, 250, plugin.animation_easing);
			}).on('mouseleave', '.carousel.narrow li.slide', function() {
				$(this).find('.slide-text').animate({
					'opacity' : 0
				}, 250, plugin.animation_easing).siblings('.slide-text-bg').animate({
					'opacity' : 0,
					'width' : '110%',
					'height' : '110%',
					'left' : '-5%',
					'top' : '-5%'
				}, 250, plugin.animation_easing);
			});



			$(document).on('mouseenter', '.image-link', function() {
				$(this).find('.image-overlay-icon').stop(0,0).css('left', -140).animate({
					'opacity' : 1,
					'left' : 0
				}, 250, plugin.animation_easing);
			}).on('mouseleave', '.image-link', function() {
				$(this).find('.image-overlay-icon').stop(0,0).animate({
					'opacity' : 0,
					'left' : 140
				}, 250, plugin.animation_easing);
			});

		}

		// open current list item on load
		$(document).ready(plugin.plain_list_init);
		$(document).ready(plugin.ready_and_onclick__adjustExpandDiv);

		$(document).ready(plugin.ready__changeWidthOfExpandForVideo);

		/**
		 * adjust the width of the expand div for the videon on ready
		 *
		 * @author Ynah Pantig <@aynspantig>
		 * @package jquery-acu.js
		 * @since 1.0
		 * @param
		 * @return null
		 */

		plugin.ready__changeWidthOfExpandForVideo = function ( )
		{

			$( '.ideas-content .expand.video' ).each(function()
			{
				// $( this ).parents('.single-idea').find('a.img-wrapper').css({
				// 	display: 'none'
				// });
				plugin.helperFunc_adjustWidthOfExpandDivForVideo();
			});

			if ( $( '.ideas-list li' ).hasClass('single-idea') )
			{
				if ( $( '.ideas-list li.single-idea .expand').hasClass('video') )
				{
					$( '.ideas-list li.single-idea a.img-wrapper').css({
						display: 'none'
					});
				}

				$( '.ideas-list li.single-idea .title').css({
					display: 'block'
				});
			}

		};/* ready__changeWidthOfExpandForVideo() */


		$(document).on(plugin.click_event, '.plain-list .trigger-expand, .ideas-slides .trigger-expand, .single-idea .trigger-expand', function(event) {

			// // Prevent from firing in ideas carousel
			// if ( $( this ).parents( '.carousel.ideas' ).length > 0 )
			// {
			// 	return;
			// }


			event.preventDefault();

			var $target = $(this).parents('li');
			var postTitle;

			if ( $target.hasClass('open') ) return;

			plugin.open_plain_list_item( $target );

			// var title = $target.find('title').html() + ' | ' + $('body').attr('data-blog_name');
			var url = $target.find('.trigger-expand').attr('href');
			var data = { 'type' : 'open-plain-list-item' };

			if ( $target.hasClass('slide') )
			{
				$target.addClass('single-slide');
			}

			$target.find( '.pre-content' ).css(
			{
				display: 'none',
				opacity: 0
			});
			$target.find('.expand').animate({
				opacity: 1
			});

			plugin.ready_and_onclick__adjustExpandDiv();


			if( $('[data-tab=staff]') )
			{
				postTitle = $(this).attr('data-title');

				if ( postTitle == undefined )
					postTitle = $(this).html();

				title = postTitle + ' | ' + $('body').attr('data-blog_name');
			}

			if ( $target.hasClass('slide') )
				return;

			History.pushState(data,title,url);

		}).on(plugin.click_event, '.plain-list .trigger-close, .ideas-slides .trigger-close, .single-idea .trigger-close', function(event) {

			event.preventDefault();
			var $target = $(this).parents('li');

			if ( $target.hasClass('single-slide') )
				$target.removeClass('single-slide');
			else
				$target.removeClass('current');

			$target.find('.post-content > .title, .pre-content, a.img-wrapper img, a.img-wrapper, .play-icon').animate(
			{
				opacity: 1
			}, 400, function()
			{
				$target.find('.post-content > .title, .pre-content, a.img-wrapper img, a.img-wrapper, .play-icon').css({
					display: 'block'
				});
			});

			$target.find('.trigger-close').fadeOut(400);
			$target.find('.read-more').show();

			if ( $( '.non-expanded' ).length > 0 )
			{
				$target.find('.expand').slideUp(400, plugin.animation_easing).siblings('.bg').fadeTo(400, 0, function(){
					$target.find( '.non-expanded' ).fadeIn( 200 );
				});

			}
			else
			{
				$target.find('.expand').slideUp(400, plugin.animation_easing).siblings('.bg').fadeTo(400, 0);
			}

			// $target.find('.expand').slideUp(400, plugin.animation_easing).siblings('.bg').fadeTo(400, 0);


			var title = $target.parents('.tabs-container').find('.tabs li.active a').data('title') + ' | ' + $('body').attr('data-blog_name');;

			var url = $target.parents('.tab').attr('data-ajax_url');
			var data = { 'type' : 'close-plain-list-item' };

			if ( $target.parents('.content-block').hasClass('ideas-content') )
			{
				url = $target.parents('.content-block').attr('data-ajax_url');
				title = $target.parents('.content-block').attr('data-title') + ' | ' + $('body').attr('data-blog_name');
			}

			var plainListUrl = $( '.plain-list' ).attr( 'data-ajax_url' );
			if ( typeof plainListUrl != 'undefined' && plainListUrl !== null && plainListUrl != '' )
			{
				url = plainListUrl;
				title = $( '.content-heading h3' ).html();
			}

			if ( $target.hasClass('slide') )
				return;

			if ( typeof url != 'undefined' && url !== null )
			{
				first = url.substring(0,1);
				if( first !== '' && first !== '/' )
					url = '/' + url;
			}

			History.pushState(data,title,url);

		});

		$(document).on(plugin.click_event, '.list-drawers .trigger-drawer', function(event) {

			event.preventDefault();

			var $target = $(this).parents('.list-drawers').find('.drawer').filter('[data-drawer="' + $(this).attr('data-drawer_target') + '"]');

			$target.siblings('.drawer:visible').slideUp(400, plugin.animation_easing);

			if ( $target.is(':visible') ) {
				$(this).parents('.list-drawers').find('.button').removeClass('off');
				$target.slideUp(400, plugin.animation_easing).parents('.tab').find('.bricks-container').fadeTo(400, 1);
			} else {
				$(this).removeClass('off').siblings('.button').addClass('off');
				$target.slideDown(400, plugin.animation_easing).siblings('.drawer').parents('.tab').find('.bricks-container').fadeTo(400, 0.4);
			}

		});

		$(document).on(plugin.click_event, '#footer-social .open-drawer, #footer-social .cta-drawer .close-drawer', function(event) {

			event.preventDefault();
			var $target = $('#footer-social .cta-drawer');

			if ( $target.is(':visible') ) {
				$('#footer-social .cta').fadeTo(400, 1);
				$target.slideUp(400, plugin.animation_easing);
			} else {
				$(this).siblings('.cta').fadeTo(400, 0.5);
				$target.slideDown(400, plugin.animation_easing);

				$('html,body').animate({
					'scrollTop' : $target.offset().top - plugin.nav_height - 30
				}, 400, plugin.animation_easing);

			}

		});

	};

	/**
	 * adjust the width of the expand div for the ideas page for the video
	 * this function is also called when the user clicked on the read more button
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param arguments
	 * @return null
	 */

	plugin.ready_and_onclick__adjustExpandDiv = function ( event )
	{
		if( $('[data-tab=ideas]') || $( '.ideas-slides li.slide' ).hasClass('single-slide') )
		{
			var thumbnailWidth, excerptHeight, titleHeight;
			var iFrameHeight = $( '.expand iframe' ).attr('height');
			var iFrameWidth = $( '.expand iframe' ).attr('width');

			var $target;

			if ( $('[data-tab=ideas]') ) {
				$target = $( '[data-tab=ideas] .expand.video' ).parents('li.current');
			} else if ( $( '.ideas-slides li.slide' ).hasClass('single-slide') )
			{
				$target = $( '.ideas-slides .expand' ).parents('li.single-slide');
			} else
				return;


			excerptHeight = $target.find('.pre-content').height();
			titleHeight = $target.find('.title').height();

			$target.find('.pre-content').animate(
			{
				opacity: 0
			}, 440, function()
			{
				$target.find('.pre-content').css({
					// display: 'none'
				});
			});

			if ( $target.find('.expand').hasClass('.slide-expand') )
			{
				return;
			}

			if ( $target.find('.expand').hasClass('video') )
			{
				plugin.helperFunc_adjustWidthOfExpandDivForVideo();

			} else {
				$target.find('.pre-content').css({
					display: 'none'
				});
			}

			$( '.expand iframe' ).height(iFrameHeight);
			$( '.expand iframe' ).width(iFrameWidth - 50);

		}

	};/* ready_and_onclick__adjustExpandDiv() */


	/**
	 * adjust the width of the expand div so when an idea with a video is loaded,
	 * won't need to animate the video in position
	 *
	 * @author Ynah Pantig <@aynspantig>
	 * @package jquery-acu.js
	 * @since 1.0
	 * @param
	 * @return null
	 */

	plugin.helperFunc_adjustWidthOfExpandDivForVideo = function (  )
	{
		var thumbnailWidth = $('a.img-wrapper img').width() + 20;
		var $target = $( '[data-tab=ideas] .expand.video' ).parents('li.current');

		$target.find('.post-content > .title, .pre-content, a.img-wrapper img, a.img-wrapper, .play-icon').css({
			display: 'none'
		});

		$( '.expand.video' ).css(
		{
			'margin-left': -thumbnailWidth,
			'margin-top': 0
		});

	};/* helperFunc_adjustWidthOfExpandDivForVideo() */



	plugin.plain_list_init = function($target) {
		plugin.open_plain_list_item();
	};


	plugin.open_plain_list_item = function($target) {

		if (typeof $target === 'undefined') {
			$target = $('.plain-list').find('li.plain-list-item.current');
		}else{
			$target.addClass('current');
		}

		if ( $target.length == 0 )
			return;

		$target.find('.read-more').hide();
		$target.find('.trigger-close').fadeIn(400);

		if ( $( '.non-expanded' ).length > 0 )
			$target.find( '.non-expanded' ).hide();

		$target.find('.expand').slideDown(400, plugin.animation_easing).siblings('.bg').fadeTo(400, 1);

		$('html, body').animate({
			scrollTop : $target.offset().top - plugin.nav_height - 30
		}, plugin.animation_time, plugin.animation_easing);

	};



	/**
	 * ---------------------------------------------------------------------------
	 *
	 * Analytics
	 *
	** -------------------------------------------------------------------------*/


	plugin.analytics_init = function() {
		var $link = $(this);

		// "Donate Main Nav" - We want to track anytime someone clicks the 'Donate' button in the main nav.
		$(document).on(plugin.click_event, '.header-donate', function() {
			plugin.add_tracking('nav', 'click', 'Donate Main Nav');
		});

		// "Tab Click Throughs" - Wherever tabs appear, we want to track if people click through them. (Question: Can we track whether they're using the tab titles or the arrows?)
		$(document).on(plugin.click_event, '.tabs-container .tabs > li > a', function() {
			plugin.add_tracking('tabs', 'click', 'Tab Click Throughs - Tabs');
		});

		$(document).on(plugin.click_event, '.tabs-container .tab-content > .nav', function() {
			plugin.add_tracking('tabs', 'click', 'Tab Click Throughs - Arrows');
		});

		// "Impact & People Shares" - Track shares on the Impact stats or people quotes
		$(document).on(plugin.click_event, '.impacts .impact .social-links a', function() {
			plugin.add_tracking('social', 'click', 'Impact & People Shares');
		});

		// "Social Links Main Nav" - Track clicks on the Facebook & Twitter links in the main nav.
		$(document).on(plugin.click_event, '#nav .button.fb, #nav .button.tw', function() {
			plugin.add_tracking('social', 'click', 'Social Links Main Nav');
		});

		// "Social Links Footer" - Track clicks on the Facebook & Twitter links in the footer.
		$(document).on(plugin.click_event, '#footer-social .cta.fb, #footer-social .cta.tw', function() {
			plugin.add_tracking('social', 'click', 'Social Links Footer');
		});

		// "Home Header Play Video" - Track Main Nav clicks on homepage
		$(document).on(plugin.click_event, '#header-content .campaign-content .play-video', 'click', function() {
			plugin.add_tracking('home-header', 'click', 'Home Header Play Video');
		});

		// "Home Header Apply Now" - Track Main Nav clicks on homepage
		$(document).on(plugin.click_event, '#header-content .campaign-content .learn-more-button', 'click', function() {
			plugin.add_tracking('home-header', 'click', 'Home Header Apply Now');
		});

		// "Home Nav Clicks" - Track Main Nav clicks on homepage
		$(document).on(plugin.click_event, '#home-nav > ul > li > a', 'click', function() {
			plugin.add_tracking('nav', 'click', 'Home Nav Clicks');
		});

		// "Main Nav Clicks" - Track Main Nav clicks (not drop down items)
		$(document).on(plugin.click_event, '#nav > ul > li > a', 'click', function() {
			plugin.add_tracking('nav', 'click', 'Main Nav Clicks');
		});

		// "First Menu Dropdown" - Track first drop down item clicks
		$(document).on(plugin.click_event, '#nav ul.sub-menu li:first-child a', 'click', function() {
			plugin.add_tracking('nav', 'click', 'First Menu Dropdown');
		});

		// "Feature Story Watches" - Feature Stories > track watches
		$(document).on(plugin.click_event, '.carousel .play-video', function() {
			plugin.add_tracking('carousel', 'play', 'Feature Story Watches');
		});

		// "Feature Story Gallery" - Featured Stories > track clicks through them.
		$(document).on(plugin.click_event, '.carousel .next, .carousel .prev', function() {
			plugin.add_tracking('carousel', 'click', 'Feature Story Gallery');
		});

		// "Page Heading Shares" - Page Headings > track when people click the Facebook and Twitter share links below these titles
		$(document).on(plugin.click_event, '.page-heading .social-links a', function() {
			plugin.add_tracking('social', 'click', 'Page Heading Shares');
		});

		// "Homepage Scroll" -  Track anytime someone clicks the down arrow (anchored to the bottom) or scrolls down.
		$(document).on(plugin.click_event, '#scroll-to-content', function() {
			plugin.add_tracking('scroll', 'click', 'Homepage Scroll');
		});

		// "+Acumen Map Cities" - track if people are clicking the cities on the map.
		$(document).on(plugin.click_event, '#big-map a.marker', function() {
			plugin.add_tracking('plusacumen', 'click', '+Acumen Map Cities');
		});

		// "Sruthi" - Sruthi's Page > clicks 'Find a +Acumen Chapter in Your City' button at the bottom of the page.
		$(document).on(plugin.click_event, '.page-id-8972 .content-block .button', function() {
			if ( $(this).attr('href').indexOf('plusacumen.org') >= 0 ) {
				plugin.add_tracking('link', 'click', 'Sruthi');
			}
		});

		// "Partner Circle CTA" - track if people are clicking the 'Partner with Acumen' circular button next to the page heading.
		$(document).on(plugin.click_event, 'body.page-id-424 .page-heading .circle-link', function() {
			plugin.add_tracking('partner', 'click', 'Partner Circle CTA');
		});

		// "Partner Contact Button" - track when people click the 'Contact Us About Partnership' button in the Partner with Us section.
		$(document).on(plugin.click_event, '#partner-contact', function() {
			plugin.add_tracking('partner', 'click', 'Partner Contact Button');
		});

		// "Partner Team Emails" - track when people click either Batool or Vinay's email addresses.
		$(document).on(plugin.click_event, '.partner-email', function() {
			plugin.add_tracking('partner', 'click', 'Partner Team Emails');
		});

		// "Apply Now" - track when people click the apply now button.
		$(document).on(plugin.click_event, '.apply-button', function( e ) {
			pageTitle = $( e.currentTarget ).attr( 'data-page-title' );
			plugin.add_tracking('apply', 'click', 'RF - ' + pageTitle + ' - Apply Now');
		});

		// Click the donate button inside the popup
		$(document).on(plugin.click_event, '.home-video-popup-container-fancybox .header-donate', function( e ) {
			plugin.add_tracking('popup', 'click', 'Donate');
		});

		// Quantcast init
		$(document).ready(function() {

			// get current url
			var relative_url = plugin.get_relative_url();

			// log quantcast event
			plugin.logQuantcastUrl(relative_url);

		});


		// "YE 2013 Donate Button" - YE 2013 > track donate button clicks.
		$(document).on(plugin.click_event, '.year-end-campaign-2013-fancybox .ye-popup-ca .button', function() {
			plugin.add_tracking('YE 2013', 'click', 'YE 2013 Donate Button');
		});


	};

	plugin.add_social_tracking = function(network, action, url, path) {

		$.bw.log_social(network, action, url, path);

		//console.log('social - ' + network + ' - ' + action + ' - ' + path);
	}

	plugin.add_tracking = function(category, action, label, value) {

		$.bw.log_event(category, action, label, value);

		//console.log('event - ' + category + ' - ' + action + ' - ' + label);
	}

	plugin.add_pageview = function(url, title) {

		$.bw.log_page_view(url, title);

		//pre('pageview - ' + url);
	}


	plugin.load_script = function(src, callback)
	{
		 // adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src = url;

		// then bind the event to the callback function
		// there are several events for cross browser compatibility
		if (callback != undefined) {
			script.onreadystatechange = callback;
			script.onload = callback;
		};

		// fire the loading
		head.appendChild(script);
	};

	/**
	 * Open the year end popup
	 *
	 * @author Alessandro Biavati <ale@briteweb.com>
	 * @package briteweb/package
	 * @since 1.0.0
	 * @return null
	 */

	plugin.ready__openYearEndCampaignPopup = function (  )
	{

		// check if year end block is printed on page
		if ( $('.year-end-campaign-2013').length <= 0 )
			return;

		// check cookie to see if user has already seen this today
		var cookieDomain = $('body').attr('data-domain');
		var cookieId = '_ye_2013_seen';
		var cookieOptions = {
			expires: 30,
			domain: cookieDomain,
			path: '/'
		};

		var fetchedCookieContent = $.cookie( cookieId );

		if ( typeof fetchedCookieContent === 'undefined' || fetchedCookieContent === null || !fetchedCookieContent )
		{
			// planting the cookie
			var serverTime = $('body').attr('data-server_time');
			$.cookie( cookieId, serverTime, cookieOptions );

			// showing the lightbox
			$.fancybox( $('.year-end-campaign-2013').html(), {
				wrapCSS: 'year-end-campaign-2013-fancybox',
				padding: 0,
				margin: [10, 70, 10, 70]
			});

			// log event to GA
			// "YE 2013 Lightbox" - YE 2013 > how many times the lightbox is shown.
			plugin.add_tracking('YE 2013', 'show', 'YE 2013 Lightbox');

		}

	};/* ready__openYearEndCampaignPopup() */


	/**
	 * Remove lightbox when a new state is loaded on the page
	 *
	 * @author Alessandro Biavati <ale@briteweb.com>
	 * @package briteweb/package
	 * @since 1.0.0
	 * @return null
	 */

	plugin.afterstatechange__closeLightbox = function ()
	{
		$.fancybox.close();

	};/* afterstatechange__closeLightbox() */


	/**
	 * Set plugin as attribute to the jQuery namespace
	**/
	$.acu = plugin;

}(window, document, jQuery));

pre = function(v) {
  if(this.console) {
	console.log(v);
  }
};
