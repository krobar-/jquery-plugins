(function($)
{
	"use strict";

	/*!
		@class Tabby
		@abstract
			The primary class for the Tabby plugin.
		@discussion
			Base class for jQuery.tabby. 
			A plugin for formatting elements as tabbed items.
			Tab labels are specified with the data-tabby-label attribute.
		@var element (object)
			Dom element for plugin 
		@var options (array)
			Plugin Option Defaults.
	*/
	var Tabby = function(element, options)
	{
		var that = this;
		this.$container = $(element);
		this.$panes = this.$container.find(options.paneSelector);
		this.options = options;

		var paneContainer = this.$container.wrapInner($(this.options.paneContainerHtml).addClass(this.options.paneContainerClass).css(this.options.paneContainerCss));
		this.$lastPane = this.$panes.eq(this.options.firstPane - 1).addClass(this.options.paneActiveClass);
		this.$lastTab = null;
		this.$tabContainer = $(this.options.tabContainerHtml).prependTo(this.$container);
		this.$tabContainer.addClass(this.options.tabContainerClass);

		var minHeight = 0;
		// build tabs
		this.$panes.each(function(index, el)
		{
			$(el).css(that.options.paneCss);
			var $tabLink = $(that.options.tabHtml).css(
			{
				'cursor': 'pointer'
			}).appendTo(that.$tabContainer);
			// get label from data-label instead of id
			var tabLabel = $(el).data('tabby-label');
			var anchor = "";

			if( $(el).attr('id') )
			{
				anchor = $(el).attr('id');
			} else {
				anchor = tabLabel.toLowerCase();
				anchor = anchor.replace(/\s/g, "-");
				$(el).attr('id', anchor);
			}

			$tabLink.html('<a href="#' + anchor + '">' + tabLabel + '</a>');
			if ($(el).hasClass(that.options.paneActiveClass)) that.$lastTab = $tabLink.addClass(that.options.tabActiveClass);
			$tabLink.on('click', function(e)
			{
				e.preventDefault();
				if ($(this).hasClass(that.options.tabActiveClass)) return;
				$(this).addClass(that.options.tabActiveClass);
				that.$lastTab.removeClass(that.options.tabActiveClass);
				that.$lastTab = $(this);
				that.activate(index);
			});
		});

		// set minimum height for pane-container (in a timeout so the heights can be calculated correctly)
		setTimeout( function()
		{
			that.$panes.each( function(index, el)
			{
				minHeight = ( $(el).outerHeight() > minHeight ) ? $(el).outerHeight() : minHeight;
			});
			$('.' + that.options.paneContainerClass).css({'min-height': minHeight +'px'});
		}, 0);

		// prevent default link action (not working? - need to add a '.' in front of class name)
		$(this.options.tabContainerClass + ' a').on('click', function(e)
		{
			e.preventDefault();
		});
	};

	/*!
		@var Tabby.defaultOptions (object)
		@abstract
			Default settings for the plugin.
		@textblock
			tabContainerClass	|| data-tabby-tab-container-class	= css selector to be applied to the generated tab container
			tabContainerHtml	|| data-tabby-tab-container-html	= html tags to wrap all tag elements
			tabHtml				|| data-tabby-tab-html				= html tags for individual tabs
			tabActiveClass		|| data-tabby-tab-active-class		= css selector for active tab 
			paneContainerClass	|| data-tabby-pane-container-class	= css selector applied to the pane container
			paneContainerHtml	|| data-tabby-pane-container-html	= html tags to wrap all panes
			paneContainerCss	|| data-tabby-pane-container-css	= css styles applied to the pane container
			paneActiveClass		|| data-tabby-pane-active-class		= css selector for active pane
			paneCss				|| data-tabby-pane-css				= css styles applied to each pane
			paneSelector		|| data-tabby-pane-selector			= css selector for determining which elements should be considered panes
			firstPane			|| data-tabby-first-pane			= the initial pane to display, non-zero based
			effect				|| data-tabby-effect				= transition effect between pane selections

			alternately data-tabby can be used for setting all options
			ie. data-tabby="{paneCss: 'width:100px;', effect: 'fade'}"
		@/textblock
	*/
	Tabby.defaultOptions = {
		tabContainerClass: 'tabby-tabs',
		tabContainerHtml: '<ul></ul>',
		tabHtml: '<li></li>',
		tabActiveClass: 'tab-active',
		paneContainerClass: 'tabby-panes',
		paneContainerHtml: '<div></div>',
		paneContainerCss:
		{
			'position': 'relative'
		},

		paneActiveClass: 'pane-active',
		paneCss:
		{
			'position': 'absolute',
			'top': '0',
			'left': '0'
		},

		paneSelector: '> div',
		firstPane: 1,
		effect: 'fade'
	};

	/*!
		@var Tabby.prototype.activate (object)
		@abstract
			Present the pane specified by a tab
		@param pane (integer)
			zero base index of pane to show.
	*/
	Tabby.prototype.activate = function(pane)
	{
		var $pane = this.$panes.eq(pane);
		if ($pane.hasClass(this.options.paneActiveClass)) return;
		if ('fade' == this.options.effect)
		{
			$pane.fadeToggle().addClass(this.options.paneActiveClass);
			this.$lastPane.fadeToggle().removeClass(this.options.paneActiveClass);
		}
		else
		{
			$pane.addClass(this.options.paneActiveClass);
			this.$lastPane.removeClass(this.options.paneActiveClass);
		}
		this.$lastPane = $pane;
	};
	// create a duplicate to help prevent conflicts, used in $.fn.tabby.noConflict
	var oldTabby = $.fn.tabby;

	/*!
		@var $.fn.tabby
		@abstract
			Plugin definition.
		@var option (array)
			Plugin Options. 
	*/
	$.fn.tabby = function(option)
	{
		return this.each(function()
		{
			var $this = $(this),
				data = $this.data(),
				instance = $this.data('kr.tabby'),
				dataOpts = {};

			for (var property in data)
			{
				if (data.hasOwnProperty(property) && /^tabby$/.test(property))
				{
					dataOpts = data[property];
				}
				else if (data.hasOwnProperty(property) && /^tabby[A-Z]+/.test(property))
				{
					var value = data[property];
					var optName = property.match(/^tabby(.*)/)[1].replace(/^[A-Z]/, fnUtil.lowerCase);
					dataOpts[optName] = value;
				}
			}

			var options = $.extend(
			{}, Tabby.defaultOptions, dataOpts, typeof option == 'object' && option);
			if (!instance) $this.data('kr.tabby', (instance = new Tabby(this, options)));
		});
	};
	// indicate to jQuery the contructor for the plugin
	$.fn.tabby.Constructor = Tabby;

	/*!
		@var $.fn.tabby.noConflict(object)
		@abstract
			Object juggling to avoid conficts.
	*/
	$.fn.tabby.noConflict = function()
	{
		$.fn.tabby = oldTabby;
		return this;
	};

	/*!
		@var $(document).ready (object)
		@abstract
			Automatically find and format tabs using a elements tag data attribute
	*/
	$(document).ready(function()
	{
		$('.tabby[data-tabby-auto!=false]').tabby();
	});

}(jQuery));