(function (window, document, $, undefined) {

		// console log shim
		if (typeof window.console == 'undefined' || window.console == null) {
			window.console = {};
		}

		if (typeof window.console.log == 'undefined' || window.console.log == null) {
			window.console.log = function() {};
		}

		// plugin specific sripts
		$.acu.init();

		// Forms
		// $.convio_donate_form.pre_init();
		$.gform_submit.init();

		// History
	 // $.bw.history.init();

		// social
		//$.bw.social.init();

		// touch
		$.bw.touch.init();

		// mobile wrapper init

	 // if ($.bw.is_mobile())
				//$.bw.mobile_wrapper_init( '#page' );

		// BW JS FRAMEWORK INIT
		$.bw.init();

}(window, document, jQuery));
