/**
 *	Tabs Navigator
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tabNavigator = function(conf){
    var that = ui.object();
	var $triggers = $(conf.element).children(':first').find('a');
	var $htmlContent = $(conf.element).children(':first').next();
	var instances = [];

	// Global configuration
	$(conf.element).addClass('uiTabNavigator');
	$triggers.addClass('uiTrigger');
	$htmlContent.addClass('uiContent box');

	// Starts (Mother is pregnant, and her children born)
	$.each($triggers, function(i, e){
		instances.push(ui.tab(i, e, conf));
	});

	var show = function(event, tab){
		ui.instances.tabNavigator[conf.instance].tabs[tab].shoot(event);
		/* The potato is ready!!
		Use this to execute a specific tab on console (on h1 click)
		$('h1').click(function(event){
			ui.instances.tabNavigator[0].show(event, 2);
		});*/
	};

    // create the publish object to be returned

    that.publish = {
        uid: conf.id,
        element: conf.element,
        type: "ui.tabNavigator",
        tabs: instances,
        show: function(event){ show(event, tab) },
        hide: function(event){ hide(event, tab) }
    }

	return that.publish;

};


/**
 *	Tab
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tab = function(index, element, conf){
	var that = ui.navs(); // Inheritance
	var display = element.href.split('#');
	var $tabContent = $(element).parents('.uiTabNavigator').find('#' + display[1]);

	// Global configuration
	that.conf = {
		name: 'tab',
		$trigger: $(element).addClass('uiTrigger'),
		callbacks: conf.callbacks
	};

	var results = function(){
		// If there are a tabContent...
		if($tabContent.attr('id')){
			return $tabContent; 
		
		// If tabContent doesn't exists
		}else{
			// Set ajax configuration
			that.conf.content = {
				type: 'ajax',
				data: element.href
			};
			
			// Create tabContent
			var w = $('<div>').attr('id', 'uiTab' + index);
				w.hide().appendTo( that.conf.$trigger.parents('.uiTabNavigator').find('.uiContent') );
			return w;
		};
	};
	that.conf.$htmlContent = results();

	// Open first tab by default
	if(index == 0){
		that.status = true;
		that.conf.$trigger.addClass('on');
	};

	// Hide all closed tabs
	if(!that.status) that.conf.$htmlContent.hide();

	// Process show event
	that.shoot = function(event){
		that.prevent(event);
		var tabs = ui.instances.tabNavigator[conf.id].tabs; // All my bros
		if(tabs[index].status) return; // Don't click me if I'm open

		// Hide my open bro
		$.each(tabs, function(i, e){
			if(e.status) e.hide(event, e.conf);
		});

		// Load my content if I'need an ajax request
		if(that.conf.$htmlContent.html() === '') that.conf.$htmlContent.html( that.loadContent(that.conf) );

		// Show me
		that.show(event, that.conf);
	};

	// Events
	that.conf.$trigger.bind('click', that.shoot);

	return that;
}