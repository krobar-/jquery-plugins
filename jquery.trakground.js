/*
Background with video and or Parallax and image replacement
Based on jquery.bgvideo.js by Siebe Van Dijck and backgroundVideo.js by Sam Linnett
Note: requires Modernizr (https://modernizr.com/)
*/

;(function ( $, window, document, undefined ) {
	"use strict";

	var defaults = {
		// from backgroundVideo
		$element 				: null,
		$outerWrap				: $(window),							// left for future use
		$window 				: $(window),
		minimumVideoWidth		: 400,
		preventContextMenu		: false,
		parallax 				: true,
		parallaxOptions			: {
									effect: 1.5
								  },
		pauseVideoOnViewLoss	: false,
		// from bgvideo
		mp4Src					: false,								// mp4 video source
		webmSrc					: false,								// webm codec source for browsers that don't support mp4
		capSrc					: false,								// webvtt file for caption track
		imgSrc					: false,								// image file for video replacement
		videoOptions			: 'autoplay="autoplay" loop="loop" muted="muted"',	// options for generated video element
		mobileVideo				: false,								// minimum width for video display

		setWrapWidth			: false,
		setWrapHeight			: false,
		bkgdZindex				: '-1',
		bkgdPositioning			: 'absolute',
		bkgdYPos				: '0',
		bkgdCentered			: true,
		useTrans3D				: true,

		wrapID					: 'bgvideo-wrap',
		bkgdID					: 'video-bkgd',
		useVideo				: true,
		toggleControl			: false,								// id of element to turn on/off video playback

		debug 					: false
	};

	function TrkGnd(element, options)
	{
		var self = this;
		this.$element = $(element);
		this.options = $.extend( {}, defaults, options );
		this.options.elYpos = this.$element.offset().top;
		this._defaults = defaults;
		this.options.tfrmCSS = this.prefixIt('transform').css;
		this.options.vidTimeoutID = null;
		this.shimRAF();
		this.options.csstransforms3d = Modernizr.csstransforms3d;
		
		if ( !Modernizr.video ||
				( this.options.mobileVideo && ( $(window).width() <= this.options.mobileVideo )) ||
				(!this.options.mp4Src && !this.options.webmSrc )
			) this.options.useVideo = false;

		this.setBkgdProperties(this.options.useVideo);

		if(this.options.useVideo)
		{
			// in some cases video will never be ready, so we want to show
			// the fallback image after 2 sec anyway.
			this.options.vidTimeoutID = setTimeout(vidReadyCallback, 2000);

			this.options.$bkgdVideo.on('canplay canplaythrough', vidReadyCallback);
			// If video is cached, the video will already be ready
			// so canplay/canplaythrough may not fire.
			if (this.options.$bkgdVideo[0].readyState > 3) vidReadyCallback();

		} else {
			var altImg = $("#" + this.options.bkgdID + " .vb-sub-image")[0]; // Get my img elem

			if( this.options.toggleControl ) $('#' + this.options.toggleControl).addClass('img-only');
			
			$("<img/>") // Make in memory copy of image to avoid css issues
				.attr("src", $(altImg).attr("src"))
				.load(function() {
					if (self.options.debug) console.log('loading image into memory');
					self.options.originalWidth = this.width;   // Note: $(this).width() will not
					self.options.originalHeight = this.height; // work for in memory images.
					
					self.options.$bkgdTrans.css({ 'display' : 'block' });
					if(self.initialized) return;
					self.init();
					setTimeout( function(){ self.scaleObject(); }, 1000 );
				});
		}
		
		function vidReadyCallback() {
			clearTimeout(self.options.vidTimeoutID);
			self.options.originalWidth = self.options.$bkgdVideo[0].videoWidth;
			self.options.originalHeight = self.options.$bkgdVideo[0].videoHeight;
			if ( Cookies.get('trakground') ) {
				$('#' + self.options.toggleControl).addClass('no-video');
				//self.options.$bkgdVideo.css({ 'display' : 'none' });
				self.options.$bkgdVideo.get(0).pause();
				self.options.$bkgdImage.css({ 'display' : 'block' });
			} else {
				self.options.$bkgdTrans.css({ 'display' : 'block' });
			}
			

			//$('.vb-fallback-image').css({'display' : 'block'});
			if(self.initialized) return;
			self.init();
			setTimeout(function(){
				self.scaleObject();
			}, 1000);
		}
	}

	TrkGnd.prototype = {

		init: function()
		{
			var self = this;
			this.initialized = true;
			
			// Pause video when the video goes out of the browser view
			if(this.options.pauseVideoOnViewLoss) {
				this.playPauseVideo();
			}

			// Prevent context menu on right click for object
			if(this.options.preventContextMenu) {
				this.options.$bkgdVideo.on('contextmenu', function() { return false; });
			}

			if (this.options.toggleControl && this.options.useVideo) {
				// video toggle control
				$('#' + this.options.toggleControl).on('click.trackground', function( ev ){
					ev.stopPropagation();
					ev.preventDefault();
					self.toggleVideo();
				});
			}

			this.update();

			if (this.options.debug) console.log('initialized');
		},

		update: function()
		{
			var self = this,
				ticking = false;

			var update = function() {
				self.positionObject();
				ticking = false;
			};

			var requestTick = function() {
				if (!ticking) {
					window.requestAnimationFrame(update);
					ticking = true;
				}
			};

			if(this.options.parallax) {
				this.options.$window.on('scroll.trakground', requestTick);
			}

			//this.options.$window.on('resize.trakground', requestTick);
			this.options.$window.on('resize.trakground', function(){
				self.scaleObject();
				requestTick();
			});
			this.scaleObject();
			requestTick();
		},

		scaleObject: function()
		{
			var self = this,
				heightScale, widthScale, scaleFactor;

			if(this.options.useVideo){

			}
			widthScale = this.options.$bkgdWrap.width() / this.options.originalWidth;
			heightScale = this.options.$bkgdWrap.height() / this.options.originalHeight;

			scaleFactor = heightScale > widthScale ? heightScale : widthScale;

			if (scaleFactor * this.options.originalWidth < this.options.minimumVideoWidth) {
				scaleFactor = this.options.minimumVideoWidth / this.options.originalWidth;
			}

			if(this.options.parallax) {
				scaleFactor = scaleFactor + this.options.parallaxOptions.effect;
			}

			this.options.$bkgdTrans.width(scaleFactor * this.options.originalWidth);
			this.options.$bkgdTrans.height(scaleFactor * this.options.originalHeight);

			this.options.xPos = -(parseInt(this.options.$bkgdTrans.width() - this.options.$bkgdWrap.width()) / 2);
			this.options.yPos = -( parseInt( (this.options.$bkgdTrans.height() - this.options.$bkgdWrap.height()) / 2 ));
			this.positionObject();
		},

		positionObject: function()
		{
			var self = this,
				scrollPos = window.pageYOffset,

				xPos = this.options.xPos,
				yPos = this.options.yPos,

				top = this.options.$bkgdWrap.offset().top,
				height = this.options.$bkgdWrap.outerHeight(true),
				windowHeight = this.options.$window.height();


			// Check if totally above or totally below viewport
			if (top + height < scrollPos || top > scrollPos + windowHeight) {
				return;
			}

			// Check for parallax
			if(this.options.parallax) {
				// Prevent parallax when scroll position is negative to the window
				if(scrollPos >= 0) {
					yPos = Math.round(yPos + ((scrollPos - this.options.elYpos) * this.options.parallaxOptions.effect));
					if (this.options.debug) console.log('yPos:' + yPos + ' calc yPos:' + this.options.yPos + ' orig top:' + this.options.elYpos);
				} else {
					//yPos = this.calculateYPos(yPos, 0);
					yPos = Math.round(yPos + ((0 - this.options.elYpos) * this.options.parallaxOptions.effect));
				}
			}

			// Check for 3dtransforms
			if(Modernizr.csstransforms3d && this.options.useTrans3D ) {
				this.options.$bkgdTrans.css(this.options.tfrmCSS, 'translate3d('+ xPos +'px, ' + yPos + 'px, 0)');
				//this.options.$bkgd.css('transform', 'translate3d('+ xPos +'px, ' + yPos + 'px, 0)');
			} else {
				this.options.$bkgdTrans.css(this.options.tfrmCSS, 'translate('+ xPos +'px, ' + yPos + 'px)');
				//this.options.$bkgd.css('transform', 'translate('+ xPos +'px, ' + yPos + 'px)');
			}
		},

		calculateYPos: function (yPos, scrollPos)
		{
			var itemPosition, itemOffset;

			itemPosition = parseInt(this.options.$bkgdWrap.offset().top);
			itemOffset = itemPosition - scrollPos;
			if (this.options.debug) console.log('Scroll:' + scrollPos + ' Offset:' + itemOffset + ' yPos:' + yPos);
			//yPos = (itemOffset / this.options.parallaxOptions.effect) + yPos;

			return yPos;
		},

		toggleVideo: function ()
		{
			var self = this;

			if ( this.options.$bkgdVideo.is(':visible') ) {

				this.options.$bkgdVideo.fadeOut(400).get(0).pause();

				if ( !Cookies.get('trakground')) {
					Cookies.set('trakground', 'true', { expires: 365 });
				}
				$('#' + this.options.toggleControl).addClass('no-video');
				
			} else {

				this.options.$bkgdVideo.fadeIn(400, function() {
					this.play(); // play after the fade is complete
				});

				Cookies.remove('trakground');
				$('#' + this.options.toggleControl).removeClass('no-video');
			}
		},

		playPauseVideo: function ()
		{
			var self = this;

			this.options.$window.on('scroll.trakgroundPlayPause', function () {
				// Play/Pause video depending on where the user is in the browser
				if(self.options.$window.scrollTop() < self.options.$bkgdWrap.height()) {
					self.options.$bkgdVideo.get(0).play();
				} else {
					self.options.$bkgdVideo.get(0).pause();
				}
			});
		},

		disableParallax: function ()
		{
			this.options.$window.unbind('.trakgroundParallax');
		},

		setBkgdProperties: function(useVideo)
		{
			this.$element.append("<div id='" + this.options.wrapID + "'></div>\n");
			this.options.$bkgdWrap = $('#' + this.options.wrapID);

			var content = '';

			if (useVideo)
			{
				content += "\t<video id='" + this.options.bkgdID + "' class='vb-video vb-transform' " + this.options.videoOptions + " role='presentation'>\n";
				content += (this.options.mp4Src) ? "\t\t<source class='vb-mp4-src vb-src' src='" + this.options.mp4Src + "' type='video/mp4;codecs=\"avc1.42E01E, mp4a.40.2\"' />\n" : '';
				content += (this.options.webmSrc) ? "\t\t<source class='vb-webm-src vb-src' src='" + this.options.webmSrc + "' type='video/webm;codecs=\"vp8, vorbis\"' />\n" : '';
				content += (this.options.capSrc) ? "\t\t<track kind='captions' src='" + this.options.capSrc + "' srclang='en'></track>\n" : '';
				content += "\t</video>\n";
			
				content += (this.options.imgSrc) ? "\t\t<img id='" + this.options.bkgdID + "-alt-img' src='"+ this.options.imgSrc +"' class='vb-fallback-image vb-transform' alt='background image' role='presentation' />\n" : '';
			} else {
				content += "\t<div id='" + this.options.bkgdID + "' class='vb-transform'>";
				content += (this.options.imgSrc) ? "\t\t<img src='"+ this.options.imgSrc +"' class='vb-sub-image' role='presentation' alt='background image' />\n" : '';
				content += "\t</div>";
			}

			this.options.$bkgdWrap.append(content);
			this.options.$bkgdVideo = $('#' + this.options.bkgdID);
			this.options.$bkgdImage = $('#' + this.options.bkgdID + '-alt-img');
			this.options.$bkgdTrans = $('.vb-transform');

			// Parent of background must be relatively positioned for parallax to work
			this.$element.css({'position':'relative'});

			// Default wrap styles
			this.options.$bkgdWrap.css({
				'position'	: this.options.bkgdPositioning,
				'top'		: this.options.bkgdYPos,
				'overflow'	: 'hidden',
				'z-index'	: this.options.bkgdZindex
			});

			// Set object default styles
			this.options.$bkgdTrans.css({
				'position'	: 'absolute',
				'display'	: 'none'
			});

			// Set Video z-index
			this.options.$bkgdVideo.css({
				'z-index'	: '1'
			});

			$('.vb-fallback-image').css({'display' : 'none'});
		},

		shimRAF: function()
		{
			var vendors = ['webkit', 'moz'];
			for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i)
			{
				var vp = vendors[i];
				window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
				window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
			}
			if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame)
			{
				var lastTime = 0;
				window.requestAnimationFrame = function(callback)
				{
					var now = Date.now();
					var nextTime = Math.max(lastTime + 16, now);
					return setTimeout( function(){ callback(lastTime = nextTime); }, nextTime - now);
				};
				window.cancelAnimationFrame = clearTimeout;
			}
		},

		prefixIt: function(property)
		{
			function up(p, a)
			{
				return a.toUpperCase();
			}

			var div = document.createElement('div'),
				x = 'Khtml Moz Webkit O ms '.split(' '),
				prefix = null,
				result = { css : '', js : '' },
				i;

			for (i = x.length - 1; i >= 0; i--)
			{
				if (((x[i] ? x[i] + '-' : '') + property).replace(/\-(\w)/g, up) in div.style) {
					prefix = x[i] ? x[i] : ''; // empty string, if it works without prefix
				}
			}

			if (null !== prefix)
			{
				prefix = ('' === prefix) ? prefix : '-' + prefix + '-';
				property = prefix + property;
				result.css = property;
				result.js = property.replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); });
			} else {
				result = null;
			}

			return (result);
		}
	};

	$.fn.trakground = function(options)
	{
		return this.each(function()
		{
			if (!$.data(this, "plugin_trakground"))
			{
				$.data(this, "plugin_trakground", new TrkGnd( this, options ));
			}
		});
	};

})( jQuery, window, document );