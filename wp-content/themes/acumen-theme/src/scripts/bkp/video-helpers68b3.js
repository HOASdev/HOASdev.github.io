
(function (window, document, $, undefined)
{

	var plugin = function(){};

	var version = "1.0";

	plugin.bindVimeoEvents = function(format)
	{
		if (format == null)
		{
			return;
		}

		plugin.format = format;
		_.bindAll(plugin, "post", "onReady", "onMessageReceived", "onPause", "onFinish", "onFinish", "getPlayer", "onPlayerReady", "onPlayerStateChange", "onYouTubePlayerAPIReady", "injectYoutubeAPI");

		if (window.addEventListener)
		{
			window.addEventListener('message', plugin.onMessageReceived, false);
		} else
		{
			window.attachEvent('onmessage', plugin.onMessageReceived, false);
		}
	}

	plugin.getPlayer = function()
	{
		var player;
		if ((typeof player === "undefined" || player === null) )
		{
			if ( plugin.format === 'fullscreen' )
			{
				player = $('.full-screen-video-frame iframe');
			}
			else if ( plugin.format === 'in-place' )
			{
				player = $('.popup-video-container iframe');
			}
		} else
		{

		}
	}

	plugin.post = function(action, value)
	{
		var data, player, url;
		data =
		{
			method: action
		};

		if (value != null)
		{
			data.value = value;
		}

		player = plugin.getPlayer();

		if (player == null)
		{
			setTimeout(function()
			{
				player = this.getPlayer();
			}, 1000);
		}

		url = player.attr('src').split('?')[0];
		player[0].contentWindow.postMessage(JSON.stringify(data), url);
	}

	plugin.onReady = function()
	{
		plugin.post('addEventListener', 'pause');
		plugin.post('addEventListener', 'finish');
		plugin.post('addEventListener', 'playProgress');
	}

	plugin.onMessageReceived = function(event)
	{
		var data;
		data = JSON.parse(event.data);

		switch (data.event)
		{
			case 'ready':
				plugin.onReady();

			case 'playProgress':
				plugin.onPlayProgress(data.data);

			case 'pause':
				plugin.onPause();

			case 'finish':
				plugin.onFinish();

		}
	}

	plugin.onPause = function()
	{

	}

	plugin.onFinish = function()
	{
		var player;
		player = plugin.getPlayer();

		player.parent().fadeOut(400, function()
		{
			player.parent().find('iframe').remove();
		});
	}

	plugin.onPlayProgress = function(data)
	{
		console.log('video play progress' + data.seconds);
	}

	plugin.injectYoutubeAPI = function(container, videoId, format)
	{
		var firstScriptTag, tag;

		if ($('.youtube-api').length === 0)
		{
			tag = document.createElement('script');
			tag.src = "http://www.youtube.com/player_api";
			tag.className = "youtube-api";

			firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		if ((container == null) || (videoId == null))
		{
			return;
		}

		plugin.container = container;
		plugin.videoId = videoId;
		plugin.format = format;

		plugin.youtubeEnsureInit(plugin.onYouTubePlayerAPIReady);
	}

	plugin.onYouTubePlayerAPIReady = function()
	{
		var container, that, videoId, youtubePlayer;

		if ((plugin.container == null) || (plugin.videoId == null))
		{
			return;
		}

		container = plugin.container;
		videoId = plugin.videoId;
		that = plugin;

		youtubePlayer = new window.YT.Player(container,
		{
			videoId: videoId,
			width: 356,
			height: 200,
			playerVars:
			{
				'autoplay': 1,
				'rel': 0,
				'showinfo': 0,
				'egm': 0,
				'showsearch': 0
			},
			events:
			{
				'onReady': that.onPlayerReady,
				'onStateChange': that.onPlayerStateChange
			}
		});
	}

	plugin.onPlayerReady = function(event)
	{

	}

	plugin.onPlayerStateChange = function(event, element)
	{
		var that;
		if (event.data === window.YT.PlayerState.ENDED)
		{
			that = plugin;
			return that.removeVideo(plugin.format);
		}
	}

	plugin.youtubeEnsureInit = function(callback)
	{
		var that;
		that = plugin;
		if (typeof window.YT === "undefined" || typeof window.YT.Player === "undefined")
		{
			return setTimeout(function()
			{
				return that.youtubeEnsureInit(callback);
			}, 100);
		} else
		{
			if (typeof callback === "function")
			{
				return callback.call();
			}
		}
	}

	plugin.removeVideo = function(format)
	{
		if (format == null)
		{
			return;
		}

		plugin.closeFullScreenVideo();
	}

	plugin.closeFullScreenVideo = function()
	{
		var $frame;

		$frame = $('.popup-video-container');

		$frame.fadeOut(400, function() {

			$frame.find('iframe').remove();
			$frame.removeClass('open');

		});

		$('body').removeClass('scroll-mask');
	}


	$.bw = $.bw || function(){};
	$.bw.videoHelpers = plugin;

}(window, document, jQuery));
