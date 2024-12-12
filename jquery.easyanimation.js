
// Utility functions
var fnUtil = fnUtil || {};
fnUtil.lowerCase = function(c)
{
	return (c || '').toLowerCase();
};

fnUtil.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

(function($) {

	/*!
		@class EasyAnimate
		@abstract
			The primary class for the EasyAnimate plugin.
		@discussion
			Base class for jQuery.easyanimation. 
			A plugin for adding dynamic animations to web elements, including counting, text scrambling, and fade effects.
		@var element (object)
			Dom element for plugin 
		@var options (array)
			Plugin Option Defaults.
	*/

	var EasyAnimate = function(element, options)
	{
		var self = this;
		this.options = options;
		this.options.$element = $(element);

		if( this.options.finish === true ){
			if(this.options.animation == 'count'){
				this.options.finish = parseInt( this.options.$element.text() );
				this.options.$element.text(this.options.start);
			} else if(this.options.animation == 'scramble') {
				this.options.finish = this.options.$element.text();
				this.options.$element.text('');
			}
			// add slide-in/out or class A/B option(s)
		}

		if(this.initialized) return;
		this.init();
	};

	/*!
		@var EasyAnimate.defaultOptions (object)
		@abstract
			Default settings for the plugin.
	*/
	EasyAnimate.defaultOptions = {
		// global options
		animation: 'count', 
		
		finish: true,
		easing: 'swing',
		duration: 400,
		delay: 0,
		complete: '',
		inView: true,
		offset: '50',
		autoSelector: '*[data-animate]',
		
		fade: 2000,
		$element: null,
		// utility options
		animated: false,
		inTimeOut: false,
		// count options
		start: 0,
		direction: 'up',
		delimiter: ',',
		noComma: true,
		// decode options
    	stepsPerGlyph: 10,
    	codeGlyphs:    "ABCDEFGHIJKLMNOPQRSTUWVXYZ1234567890abcdefghijklmnopqrstuwvxyz",
		// slide (or Class A/B ) options

	};

	EasyAnimate.prototype = {

		init: function()
		{
			var self = this;
			this.initialized = true;

			var update = function() {
				self.check();
			};

			$(window).on('scroll.easyanimate resize.easyanimate', update);
			update();
		},

		animate: function()
		{
			var self = this;
			
			$(window).off('scroll.easyanimate resize.easyanimate');

			if(!this.options.animated){

				this.options.$element.fadeIn(this.options.fade);

				if(this.options.animation == 'count') {
					$({count: this.options.start}).animate({count: this.options.finish}, {
						duration: this.options.duration,
						easing: this.options.easing,
						step: function() {
							var mathCount = Math.ceil(this.count);
							self.options.$element.text(mathCount);
						},
						complete: function(){
							self.options.animated = true;
							self.options.$element.text(self.options.finish);
						}
					});
				} else if(this.options.animation == 'scramble') {
					var text = this.options.finish,
						scrambled = $("<span/>").addClass('scramble').fadeIn(this.options.fade).insertAfter(this.options.$element),
						interval = this.options.duration / (text.length * this.options.stepsPerGlyph),
						step = 0, length = 0,
						stepper = function () {
							if(++step % self.options.stepsPerGlyph === 0) {
								length++;
								self.options.$element.text(text.slice(0, length));
							}
							if(length <= text.length) {
								scrambled.text(self.randomString(self.options.codeGlyphs, text.length - length));
								setTimeout(stepper, interval);
							} else {
								scrambled.remove();
							}
						};

					this.options.$element.text('');
					stepper();
					this.options.animated = true;
				}
			}
		},

		check: function()
		{
			var self = this,
			scrollPos = window.pageYOffset,
			elementTop = this.options.$element.offset().top,
			elementHeight = this.options.$element.outerHeight(true),
			windowHeight = $(window).height(),
			windowBottom = scrollPos + windowHeight,
			trigger = ((100 - this.options.offset)/100);

			// Check if totally above or totally below viewport
			if (elementTop + elementHeight < scrollPos || elementTop > scrollPos + windowHeight) {
				return;
			}

			if( elementTop + (elementHeight/2) <= scrollPos + (windowHeight * trigger)) {
				if( this.options.delay ) {
					if( !this.options.inTimeOut ) {
						
						this.options.inTimeOut = setTimeout( function()
						{
							self.options.inTimeOut = false;
							self.animate();
						}, this.options.delay );
					}
				} else {
					this.animate();
				}
			}
		},

		randomString: function(set, length)
		{
			// get a random string from the given set,
			// or from the 33 - 125 ASCII range
			var string = "", i, glyph;

			for(i = 0 ; i < length ; i++) {
				glyph = Math.random() * set.length;
				string += set[glyph | 0];
			}
			return string;
		}
	};

	var oldEasyAnimate = $.fn.easyanimate;

	$.fn.easyanimate = function(option)
	{
		return this.each(function()
		{
			var self = this,
				$this = $(this),
				data = $this.data(),
				instance = $.data(this, "kr_easyanimate"),
				dataOpts = {};
				//console.log(this);
			for (var property in data)
			{
				if (data.hasOwnProperty(property) && /^animate/.test(property))
				{
					var value = data[property];
					dataOpts = value;

				}
			}
			
			var options = $.extend({}, EasyAnimate.defaultOptions, dataOpts, typeof option == 'object' && option);//
			if (!instance) $.data(this, "kr_easyanimate", (instance = new EasyAnimate( self, options )));

		});
	};

	// indicate to jQuery the constructor for the plugin
	$.fn.easyanimate.Constructor = EasyAnimate;

	$.fn.easyanimate.noConflict = function()
	{
		$.fn.easyanimate = oldEasyAnimate;
		return this;
	};

	$(document).ready(function()
	{
		$(EasyAnimate.defaultOptions.autoSelector).easyanimate();
	});

}(jQuery));