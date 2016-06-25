(function (window, document, $, undefined) {
	'use strict';

	// plugin variable
	var plugin = function(){};
	var version = "1.0.0";

	plugin.init = function()
	{
		$(document).on('click', '.gform_wrapper form:not(#gform_3) .gform_button', plugin.gform_submit);
		$(document).on('submit', '.gform_wrapper form:not(#gform_3)', plugin.gform_submit);
	};

	plugin.gform_submit = function(event)
	{
		event.preventDefault();

		var $FORM;
		if ($(this).is('form')) $FORM = $(this);
		else $FORM = $(this).parents('form');

		var $BUTTON = $FORM.find('input[type="submit"]');

		if ( $BUTTON.hasClass('disabled') )
			return false;

		$BUTTON
			.css('width', $BUTTON.outerWidth())
			.val('')
			.addClass('disabled loading');

		$BUTTON.parents('.gform_footer')
			.addClass('disabled');

		var action = $FORM.attr('action');
		var url = (typeof action === 'string') ? $.trim(action) : '';
		url = url || window.location.href || '';
		if (url) {
		 	// clean url (don't include hash vaue)
			url = (url.match(/^([^#]+)/)||[])[1];
			url = url.replace('?bw_history=true','');
		}

		$FORM.ajaxSubmit({
			url: url,
			success: plugin.postSubmit
		});

		return false;
	};

	plugin.postSubmit = function(responseText, statusText, xhr, $FORM)
	{
		// compute form id
		var form_wrapper_hash = '#' + $FORM.parents('.gform_wrapper').attr('id');
		var form_id = form_wrapper_hash.replace('#gform_wrapper_', '');

		// get new form wrapper
		var $NEW_FORM_WRAPPER = $(xhr.responseText).find(form_wrapper_hash).first();

		// get confirmation message if the wrapper is not found
		if ($NEW_FORM_WRAPPER.length === 0)
			$NEW_FORM_WRAPPER = $(xhr.responseText).find( '.gform_confirmation_message_' + form_id ).first();

		// Maintain tabindex
		$NEW_FORM_WRAPPER.find('[tabindex]').each(function(index, input) {
			var tabindex = $FORM.find('[tabindex]').eq(index).attr('tabindex');
			$(input).attr('tabindex', tabindex);
		});

		// scroll to top of form
		var st = $FORM.parents('.gform_wrapper').parent().offset().top - 67;
		$('html,body').animate({
			'scrollTop' : st
		}, 600, 'easeOutCubic');

		// replace form
		$FORM.parents('.gform_wrapper').after( $NEW_FORM_WRAPPER );
		$FORM.parents('.gform_wrapper').remove();

		// trigger events
		$(document).trigger('gform_post_render');
		$(document).trigger('aftershowcontent');
	};

	/**
	 * Set plugin as attribute to the jQuery namespace
	**/
	$.gform_submit = plugin;

}(window, document, jQuery));
