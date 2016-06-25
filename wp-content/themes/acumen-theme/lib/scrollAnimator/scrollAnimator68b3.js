/* Author: 

*/

var ScrollAnimator = function() {
	var settings = {},
		page,
		started = false;

	// counters etc
	var	w = $(window),
		d = $(document),
		touch = false,					// is touch device
		touchStart = { x: 0, y: 0 },	// vars for touch
		scrollStart = 0,				// vars for scroll
		scrollTopTweened = scrollTop = 0,
		scrollTopDir = false;
		
	
	// --------------------------------------------------
	// ANIMATION
	// --------------------------------------------------
	function animationLoop() {
        // console.log('loop');
		requestAnimFrame(animationLoop);

        // if (Math.ceil(scrollTopTweened) !== Math.floor(scrollTop) && Math.floor(scrollTopTweened) !== Math.ceil(scrollTop)) {
        if (Math.ceil(scrollTopTweened) !== Math.floor(scrollTop)) {
            
            // calculate direction
			scrollTopDir = scrollTop - scrollTopTweened > 0;

			// smooth out scrolling action
			scrollTopTweened += settings.tweenSpeed * (scrollTop - scrollTopTweened);

			// update status
			if (settings.debugId)
			    $('#status .scroll-top').html( scrollTop );

			// run through animations
			for (var i in animation) {
				var anim = animation[i];

				// check if animation is in range
                // console.log(anim.endAt + ' >=' + scrollTopTweened + ' >= ' + anim.startAt);
                if (scrollTopTweened >= anim.startAt && scrollTopTweened <= anim.endAt) {
					startAnimatable( anim );
					render( anim );
                } else {
                    stopAnimatable( anim );
                }
			}

			// onAnimate callback
			if (typeof settings.onUpdate === 'function') settings.onUpdate();
		};	
	};

    

	function render( anim ) {
		// figure out where we are within the scroll
		var progress = (anim.startAt - scrollTopTweened) / (anim.startAt - anim.endAt);

		var properties = {};

		// check and run keyframes within scroll range
		if (anim.keyframes) {
			for ( i = 1; i < anim.keyframes.length; i++ ) {
				var keyframe = anim.keyframes[ i ],
					lastkeyframe = anim.keyframes[ i - 1 ],
					keyframeProgress = ( lastkeyframe.position - progress ) / ( lastkeyframe.position - keyframe.position );
				
				if ( keyframeProgress > 0 && keyframeProgress < 1 ) {
					if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {
						//console.log(keyframe.position, keyframeProgress, keyframe);
						keyframe.onProgress( anim, keyframeProgress );
					};

					for ( property in keyframe.properties ) {
						properties[ property ] = getTweenedValue( lastkeyframe.properties[property], keyframe.properties[property], keyframeProgress, 1, keyframe.ease );
					}
				}
			}
		}

		// apply styles
		anim._elem.css( properties );
		
		// onProgress callback
		if (anim.onProgress && typeof anim.onProgress === 'function') {
			anim.onProgress.call(anim, progress );
		}
		
	}

	/* run before animation starts when animation is in range */
	function startAnimatable( anim ) {
		// apply start properties
		if (!anim._started) {
			if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {
				anim.onStartAnimate.call( anim );
			} else {
                anim._elem.css('display', 'block');
			}
			
			//console.log('starting', anim.selector);
			anim._started = true;
			
		}
	}

	/* run after animation is out of range  */
	function stopAnimatable( anim ) {
		// apply end properties
		if (anim._started && anim.endAt < scrollTopTweened || anim._started && anim.startAt > scrollTopTweened ) {
			if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {
				anim.onEndAnimate.call( anim );
			} else {
                anim._elem.css('display', 'none');
			}
			//console.log('stopping', anim.selector);
			anim._started = false;
			
		}
	}

	/* 
	sets up all the start and end parameters for each animation 
	this will run when our page is loaded and on resizing
	*/
	function setAnimatable() {
		for (var i in animation) {
			var anim = animation[i];

			// grab dom element
			if (anim._elem == undefined) {
				anim._elem = $(anim.selector);
			}

			// iterate through keyframes
			for (var k in anim.keyframes) {
				var keyframe = anim.keyframes[k];

				/*	// default starting properties
					startProperties = { 
						display: 'none',
						position: 'absolute'
					};
				
				// apply starting properties
				if (keyframe.position == 0) {
					anim._elem.css( $.extend( startProperties, keyframe.properties ) );
				};*/
				
				// setup keyframe 0
				if (keyframe.position == 0) {
					var nKeyframe = anim.keyframes[Number(k)+1];	// next keyframe
					for (property in nKeyframe.properties) {
						if (keyframe.properties[ property ] == undefined) {
							// grab current offset and load into properties for keyframe 0
							if (/left|top/.test(property)) {
								keyframe.properties[ property ] = anim._elem.position()[ property ];
							}

							// todo: width & height
						}
					}
				}
				
				// fill in properties from current element
				// find missing properties from last occurance of property
				var bIndex = Number(k); // start 1 back from current

				while (bIndex > 0) {
					var bKeyframe = anim.keyframes[ bIndex ];

					for (var property in bKeyframe.properties) {
						if ( keyframe.properties[ property ] == undefined) {
							keyframe.properties[ property ] = bKeyframe.properties[ property ];
						}
					}

					bIndex--;
				};


				// onInit callback
				if (typeof keyframe.onInit == 'function') keyframe.onInit( anim );
				
				// reorganize if relative

				
			}
		
		}
		
	}
	
	function resize() {
		// onResize
		if (settings.onResize && typeof settings.onResize === 'function') settings.onResize();
		
	    resetAnimatable();
        setAnimatable();
        start();
	}
	
	// resets animations
	function resetAnimatable() {
		for (var i in animation) {
			var anim = animation[i];
		
			if (anim._started) {
				delete anim._elem;
				delete anim._started;
			}
		}
	}


	// --------------------------------------------------
	// EVENT HANDLERS
	// --------------------------------------------------

	// window resize 
	function resizeHandler(e) 
	{
    	var container = settings.container;
    	var containerInner = settings.containerInner;
        
        if (settings.autoMaxScroll) {
            var env = $.bw.get_env();
            var maxScroll = Math.round(containerInner.outerHeight() - env.h + 1);
            if (maxScroll < 0) maxScroll = 0;

            $.each(animation, function(index, anim) {
                if (anim != undefined && anim.autoEndAt != undefined && anim.autoEndAt) {
                    anim.endAt = maxScroll;
                };
            });

            settings.animation = animation;
            settings.maxScroll = maxScroll;

            checkScrollExtents();
            
            if (Math.ceil(scrollTopTweened) > Math.floor(scrollTop) ) {
                // force scrollTopTweened to follow scrolltop
                scrollTopTweened = scrollTop - 1;
            };
            
        };
        
        
        // if (!started) {
		    resetAnimatable();
            setAnimatable();
            start();
        // }
		
        d.trigger('scroll_animator_after_resize');
	}

	
	// touch
	function touchStartHandler(e) {
		//e.preventDefault();
		touchStart.x = e.touches[0].pageX;

		// Store the position of finger on swipe begin:
		touchStart.y = e.touches[0].pageY;

		// Store scroll val on swipe begin:
		scrollStart = scrollTop;
	};

	function touchEndHandler(e) {
		
	}
	
    var previous_site_scroll = 0;
    function touchMoveHandler(e) {
        var site_scrol = Math.floor(getScrollTop());
        if (previous_site_scroll != site_scrol)
            window.scrollTo(0, 1);
        previous_site_scroll = site_scrol;

		offset = {};
		offset.x = touchStart.x - e.touches[0].pageX;

		// Get distance finger has moved since swipe begin:
		offset.y = touchStart.y - e.touches[0].pageY;	

        var previous_scroll_top = scrollTop;
		// Add finger move dist to original scroll value
		scrollTop = Math.max(0, scrollStart + offset.y);
		
		if ( scrollTop > 0) e.preventDefault();

		checkScrollExtents();
	}

	// scrollwheel
	function wheelHandler(e, delta, deltaX, deltaY) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            e.preventDefault();
            scrollTop -= delta * settings.scrollSpeed;
            if ( scrollTop < 0) scrollTop = 0;
            checkScrollExtents();
        }
	};

	function checkScrollExtents() {
		if (scrollTop < 0) scrollTop = 0;
		else if (scrollTop > settings.maxScroll) scrollTop = settings.maxScroll;
	};

    
    function keydown_handler(e) {
        if(e.keyCode == 192) {
            toggleDebug();
        };
        if (e.keyCode == 32) { // space bar
            
            // check if we are typing inside something
            if ($(':focus').length > 0) return;
            
            var env = $.bw.get_env();
            var currentScroll = getScrollTop();
            var targetScroll = currentScroll + env.h - 35;
            if (targetScroll > getMaxScroll()) {
                targetScroll = getMaxScroll();
            }
            scrollTo(targetScroll);
            
        };
        if (e.keyCode == 40 || e.keyCode == 39) {
            var currentScroll = getScrollTop();
            var targetScroll = currentScroll + 35;
            if (e.metaKey || e.ctrlKey || targetScroll > getMaxScroll()) {
                targetScroll = getMaxScroll();
            }
            scrollTo(targetScroll);
    
        };
        if (e.keyCode == 38 || e.keyCode == 37) {
            var currentScroll = getScrollTop();
            var targetScroll = currentScroll - 35;
            if (e.metaKey || e.ctrlKey || targetScroll < 0) {
                targetScroll = 0;
            }
            scrollTo(targetScroll);
    
        };
    };
    
    

	// clicks
	// keyboard
	// touch
	// orientation
	// mouse
	// intro
	// loading
	// app loop

	
	// --------------------------------------------------
	// HELPERS
	// --------------------------------------------------
	

	// get tweened values
	function getTweenedValue(start, end, currentTime, totalTime, tweener) {
	    var delta = end - start;
	    var percentComplete = currentTime/totalTime;
	    if (!tweener) tweener = TWEEN.Easing.Linear.None;

	    return tweener(percentComplete) * delta + start
	}
	
	// dected if touch events
	function isTouch() {
		return 'ontouchstart' in window;
	}


    // --------------------------------------------------
    // PUBLIC
    // --------------------------------------------------
    function init( opts ) {
        var defaults = {
                maxScroll: 1000,
                tickSpeed: 30,
                scrollSpeed: 20,
                useRAF: true,
                tweenSpeed: .3,
                freezeTouchScroll: false
            };

        settings = $.extend( defaults, opts );
        
        animation = settings.animation;
        touch = isTouch();

        if (touch) {
            
            // var container = settings.container[0];
            // container.addEventListener('touchstart', touchStartHandler, true);
            // container.addEventListener('touchmove', touchMoveHandler, true);
            // container.addEventListener('touchend', touchEndHandler, true);
            
            document.body.addEventListener('touchstart', touchStartHandler, true);
            document.body.addEventListener('touchmove', touchMoveHandler, true);
            document.body.addEventListener('touchend', touchEndHandler, true);
            
        }
        d.on('mousewheel', wheelHandler);
        w.on('keydown', keydown_handler);
        
        // BW Framework needed here..
        d.on('envchange', resizeHandler);

        // settings.container.resize(resizeHandler);
        // settings.containerInner.resize(resizeHandler);
        
        settings.container.css({
            'overflow': 'hidden'
        });
        
        settings.containerInner.css({
            'position': 'relative'
        });
        
        // animation loop
        window.requestAnimFrame = (function(){
            if (settings.useRAF) {
                return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function( callback ){
                    window.setTimeout(callback, settings.tickSpeed);
                };
            } else {
                return function( callback ){
                    window.setTimeout( callback, settings.tickSpeed);
                }
            };
        })();

        return this;
    };
    
    // --------------------------------------------------
    // PUBLIC
    // --------------------------------------------------
    function update_settings( opts ) {

        settings = $.extend( settings, opts );
        
        if (opts.animation != undefined)
            animation = opts.animation;

        return this;
    };
    
	// start
	function start() {
		//console.log('start', settings.startAt);
		if (!started && settings.startAt) scrollTopTweened = scrollTop = settings.startAt;
		
		if (!started) {
    		scrollTop++;
			animationLoop();
			started=true;
		};

		if (settings.onStart && typeof settings.onStart === 'function') {
			settings.onStart();
		}
	};

	function getPageInfo() {
		return page;
	};

    function getScrollTop() {
        return scrollTopTweened;
    };

    function getScrollDir() {
        return scrollTopDir;
    };

	function getMaxScroll() {
		return settings.maxScroll;
	};

    function scrollTo( scroll, no_animation ) {
        scrollTop = scroll;
        if (no_animation) scrollTopTweened = scroll;
    };

    function scrollToCheck( scroll, time, callback ) 
    {
        if (time && time > 0) {
            var currentScroll = getScrollTop();
            var dist = scroll - currentScroll;
            var tics = time / settings.tickSpeed; // tickSpeed is actually a tick length (ms)

            settings.originalTweenSpeed = settings.tweenSpeed;
            settings.tweenSpeed = 1 - Math.pow(1 / dist,1 / tics);

            setTimeout(function() {
                settings.tweenSpeed = settings.originalTweenSpeed;
                if (callback) callback();
            }, time);
        };

        scrollTop = scroll;
        checkScrollExtents();
        
    };

	function autoScroll() {
		setInterval( aScroll, 100  );
	}

	function aScroll() {
		scrollTop+= 5;
		if (scrollTop > settings.maxScroll) scrollTop = scrollTopTweened = 0;
	}

	function stopScroll() {
		scrollTopTweened = scrollTop;
	}

	function freezeTouchScroll() {
		settings.freezeTouchScroll = true;
	}

    function unfreezeTouchScroll() {
        settings.freezeTouchScroll = false;
    }

    function getContainerInner() {
        return settings.containerInner;
    }

    function getContainer() {
        return settings.container;
    }

	function toggleDebug() {
	    if ($('#status').length == 0) {
	        $('body').append($('<div id="status" />').hide().css({
	            'position': 'fixed',
	            'overflow': 'hidden',
                'z-index': '20010',
                'bottom': '10px',
                'right': '10px',
                'padding': '10px',
                'width': '130px',
                'height': '34px',
                'background-color': 'rgba(255, 255, 255, 0.9)'
	        }).append($('<div class="scroll-top" />').css({
	            'color': 'red',
	            'height': '20px'
	        })).append($('<a href="javascript:void(0);" class="toggle-borders" />').html('Show borders').css({
	            'display': 'block',
	            'position': 'absolute',
	            'bottom': '8px',
	            'font-family': 'Arial, "Helvetica Neue", Helvetica, sans-serif',
	            'font-size': '12px',
	            'text-decoration': 'none',
                'color': 'red'
	        })));
	        
	        $(document).on('click','#status .toggle-borders', function(event) {
    			if (settings.borderDebugId == false || settings.borderDebugId == undefined) {
    			    settings.borderDebugId=true;
                }else{
    			    settings.borderDebugId=false;
                }
                
                for (var i in animation) {
        			var anim = animation[i];

        			if (settings.borderDebugId == true) {
        			    anim._elem.css({
        				    'border': '1px dashed red'
        				});
                        anim._elem.prepend($('<div class="debugid" />').html(anim.selector).css({
            	            'font-family': 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                            'font-size': '14px',
                            'line-height': '16px',
                            'color': 'red',
                            'position': 'absolute',
                            'top': '0',
                            'left': '0'
                        }));
        			} else {
        				anim._elem.css({
        				    'border': ''
        				});
                        $('body').find('.debugid').remove();
        			}
        		}
	        });
        }
	    
		if (settings.debugId == false || settings.debugId == undefined) {
            // console.log('debug on');
			settings.debugId=true;
			$('#status').show();
		} else {
            // console.log('debug off');
			settings.debugId=false;
			$('#status').hide();
		}
		
		for (var i in animation) {
			var anim = animation[i];

			if (settings.borderDebugId == true && settings.debugId == true) {
			    anim._elem.css({
				    'border': '1px dashed red'
				});
                anim._elem.prepend($('<div class="debugid" />').html(anim.selector).css({
                    'position': 'absolute',
                    'top': '0',
                    'left': '0'
                }));
			} else {
				anim._elem.css({
				    'border': ''
				});
                $('body').find('.debugid').remove();
			}
		}
		
	};

	function isDebug() {
		return settings.debug;
	};

    function getOffset(hash) 
    {
        var currentScroll = getScrollTop();
        var offset = $(hash).offset().top + currentScroll;
        return offset;
    };

	return {
		init: init,
		start: start,
		getPageInfo: getPageInfo,
		getScrollTop: getScrollTop,
		getScrollDir: getScrollDir,
		getMaxScroll: getMaxScroll,
		autoScroll: autoScroll,
		stopScroll: stopScroll,
		scrollTo: scrollTo,
		scrollToCheck: scrollToCheck,
		freezeTouchScroll: freezeTouchScroll,
		unfreezeTouchScroll: unfreezeTouchScroll,
		isDebug: isDebug,
		toggleDebug: toggleDebug,
		update_settings: update_settings,
		getOffset: getOffset,
		getContainer: getContainer,
		getContainerInner: getContainerInner
	}
};

	

