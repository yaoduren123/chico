/**
  * Chico-UI
  * Packer-o-matic
  * Like the pizza delivery service: "Les than 100 milisecons delivery guarantee!"
  * @components: core, positioner, object, floats, navs, controllers, watcher, sliders, carousel, dropdown, layer, modal, tabNavigator, tooltip, string, number, custom, required, helper, form, viewer, chat, expando, codelighter
  * @version 0.4
  * @autor Chico Team <chico@mercadolibre.com>
  *
  * @based on:
  * JSMin
  * @author Ryan Grove <ryan@wonko.com> 
  * @copyright 2002 Douglas Crockford <douglas@crockford.com> (jsmin.c) 
  * @copyright 2008 Ryan Grove <ryan@wonko.com> (PHP port) 
  * @link http://code.google.com/p/jsmin-php/ 
  */
;(function($){
var start = new Date().getTime();
/** 
  * @namespace
  */
var ui = window.ui = {

    version: "0.5.6",

    components: "carousel,dropdown,layer,modal,tabNavigator,tooltip,string,number,custom,required,helper,form,viewer,chat,expando,codelighter",

    internals: "positioner,object,floats,navs,controllers,watcher,sliders",

    instances: {},
    
    features: {},
 	
    init: function() { 
        // unmark the no-js flag on html tag
        $("html").removeClass("no-js");
        // check for browser support
		ui.features = ui.support();
        // check for pre-configured components
        ui.components = (window.components) ? ui.components+","+window.components : ui.components ;
        // check for pre-configured internals
        ui.internals = (window.internals) ? ui.internals+","+window.internals : ui.internals ;
        // iterate and create components               
        $(ui.components.split(",")).each(function(i,e){ ui.factory({component:e}); });
    },
/**
 *	@static Utils. Common usage functions.
 */		
    utils: {
		body: $('body'),
		html: $('html'),
		window: $(window),
		document: $(document),
		zIndex: 1000,
		index: 0 // global instantiation index
	},
/**
 *	@const Event's Map.
 */	
    events: {
        CHANGE_LAYOUT: "changeLayout"
    }    
};




/**
 *	Pre-Load function
 */	

ui.preload = function(arr) {

	if (typeof arr === "string") {
		arr = (arr.indexOf(",") > 0) ? arr.split(",") : [arr] ;
	}

	for (var i=0;i<arr.length;i++) {
				
		var o = document.createElement("object");
			o.data = arr[i]; // URL
			
		var h = document.getElementsByTagName("head")[0];
			h.appendChild(o);
			h.removeChild(o); 
	}       
};




/**
*	Factory
*/	
ui.factory = function(o) {

    /**
    *   o {
            component: "chat",
            callback: function(){},
            [script]: "http://..",
            [style]: "http://..",
            [callback]: function(){}    
    *    }
    *
    *	@return A collection of object instances
    */
    
    if (!o) { 
        alert("Factory fatal error: Need and object {component:\"\"} to configure a component."); 
        return;
    };

    if (!o.component) { 
        alert("Factory fatal error: No component defined."); 
        return;
    };

    var x = o.component;

    var create = function(x) { 

        // Send configuration to a component trough options object
        $.fn[x] = function( options ) {

            var results = [];			    
            var that = this;       

 			// Could be more than one argument
 			var _arguments = arguments;
 			
            that.each( function(i, e) {
            	
				var conf = options || {};

                var context = {};
                    context.type = x;
                    context.element = e;
                    context.$element = $(e);
                    context.uid = ui.utils.index += 1; // Global instantiation index
               
				switch(typeof conf) {
					// If argument is a number, join with the conf
					case "number":
						var num = conf;
						conf = {};
						conf.value = num;
						
						// Could come a messages as a second argument
		                if (_arguments[1]) {
		                    conf.msg = _arguments[1];
		                };
					break;
					
					// This could be a message
					case "string":						
						var msg = conf;
						conf = {};
						conf.msg = msg;
					break;
					
					// This is a condition for custom validation
					case "function":
						var func = conf;
						conf = {};
						conf.lambda = func;
						
						// Could come a messages as a second argument
		                if (_arguments[1]) {		                	
		                    conf.msg = _arguments[1];
		                };
					break;
				};
               
                // Create a component from his constructor
                var created = ui[x].call( context, conf );

				/* 
					MAPPING INSTANCES
				
    				Internal interface for avoid mapping objects
    				{
    					exists:true,
    					object: {}
    				}
				*/
				
				created = ( created.hasOwnProperty("public") ) ? created.public : created;
				
			    if (created.type) {
			        var type = created.type;		    
                    // If component don't exists in the instances map create an empty array
                    if (!ui.instances[type]) { ui.instances[type] = []; }
                         ui.instances[type].push( created );
			    }
                
                // Avoid mapping objects that already exists
				if (created.exists) {				
					// Return the inner object
					created = created.object;
				}			

			    results.push( created );
			    
            });
            
            // return the created components or component   
            return ( results.length > 1 ) ? results : results[0];
        };

        // if a callback is defined 
        if ( o.callback ) { o.callback(); }
                        
    } // end create function
    
    if ( ui[o.component] ) {
        // script already here, just create
        create(o.component);
        
    } else {
        // get resurces and call create
        ui.get({
            "method":"component",
            "component":o.component,
            "script": ( o.script )? o.script : "src/js/"+o.component+".js",
            "styles": ( o.style ) ? o.style : "src/css/"+x+".css",
            "callback":create
        });
        
        //alert("UI: " + x + " configuration error. The component do not exists");
    }
}

/**
 *  Get
 */
 
ui.get = function(o) {
    /**
    *   o {
            method: "content"|"component",
            component: "chat",
            [script]: "http://..",
            [style]: "http://..",
            [callback]: function(){}
    *    }
    */
    
    switch(o.method) {
		
		case "content":

	        var that = o.that;
	        var conf = that.conf;
			var context = ( that.controller ) ? that.controller.public : that.public;
			//Set ajax config
			//setTimeout(function(){
			
			$.ajax({
				url: conf.ajaxUrl,
				type: conf.ajaxType || 'GET',
				data: conf.ajaxParams,
				cache: true,
				async: true,
				success: function(data, textStatus, xhr){					
					that.$content.html( data ); 
					if ( conf.onContentLoad ) conf.onContentLoad.call(context);
					if ( conf.position ) ui.positioner(conf.position);
				},
				error: function(xhr, textStatus, errorThrown){
					data = (conf.hasOwnProperty("onContentError")) ? conf.onContentError.call(context, xhr, textStatus, errorThrown) : "<p>Error on ajax call </p>";
					that.$content.html( data );
					if ( conf.position ) ui.positioner(conf.position);
				}
			});
			//}, 25);
			
		break;
	        
		case "component":
	        
	        // ui.get: "Should I get a style?"
	        if ( o.style ) {
	    		var style = document.createElement('link');
	        		style.href = o.style;
	    	    	style.rel = 'stylesheet';
	            	style.type = 'text/css';
	        }
	        // ui.get: "Should I get a script?"        
	        if ( o.script ) {
	    	   	var script = document.createElement("script");
	    			script.src = o.script;
	        }
	        
	        var head = document.getElementsByTagName("head")[0] || document.documentElement;
	
			// Handle Script loading
			var done = false;
	
			// Attach handlers for all browsers
			script.onload = script.onreadystatechange = function() {
	    
	    	if ( !done && (!this.readyState || 
						this.readyState === "loaded" || this.readyState === "complete") ) {
						
					done = true;
	            
		   			// if callback is defined call it
		   	        if ( o.callback ) { o.callback( o.component ); }
										
			   		// Handle memory leak in IE
		   			script.onload = script.onreadystatechange = null;
	   			
			   		if ( head && script.parentNode ) { head.removeChild( script ); }
				}
			};
	            
			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used.
			if ( o.script ) { head.insertBefore( script, head.firstChild ); }
			if ( o.style ) { head.appendChild( style ); }
	    
		break;        
	}

}

/**
 *  Support
 */
 
ui.support = function() {
	
	// Based on: http://gist.github.com/373874
	// Verify that CSS3 transition is supported (or any of its browser-specific implementations)
	var transition = (function(){
		var thisBody = document.body || document.documentElement;
		var thisStyle = thisBody.style;

		return thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.OTransition !== undefined || thisStyle.transition !== undefined;
	})();
	
	return {
		transition: transition
		// gradient: gradient
	};
	
};


/**
 *  Cache
 */

ui.cache = {
	map: {},
	add: function(url, data) {
		ui.cache.map[url] = data;
	},
	get: function(url) {
		return ui.cache.map[url];
	},
	rem: function(url) {
		ui.cache.map[url] = null;
		delete ui.cache.map[url];
	},
	flush: function() {
		delete ui.cache.map;
		ui.cache.map = {};
	}
};


/**
 *	Clone function
 */	

ui.clon = function(o) {
	
	obj = {};
	
    for (x in o) {
    	obj[x] = o[x]; 
    };
    
    return obj;
};


$(function() { // DOM Ready
	var now = new Date().getTime();
    ui.loadTime = now - start;
});
// @arg o == configuration
/*   References
     points: x, y 
         x values: center, left, right
         y values: middle, top, bottom
         
     examples:
         "cm" = center middle
         "tl" = top left
         "tr" = top right
         "bl" = bottom left
         "br" = bottom right

    example configuration:
    {
        element: $element
        [context]: $element | viewport
        [offset]: "x y" 
        [points]: "cm cm" // default
        [hold]: false // default
        [draggable]: false // default
        
    } */
ui.positioner = function(o) {

/**
 *  Private Members
 */

	var o = o || this.conf.position;

    // Initial configuration
	var element = $(o.element);
		element.css("position","absolute");
	var context;
	var viewport;
	var parentRelative;
    
	// Default parameters 
    o.points = o.points || "cm cm";
    o.offset = o.offset || "0 0";

    // Class names
    var classReferences = {
		"lt lb": "down",
		"lb lt": "top",
		"rt rb": "down",
		"rb rt": "top",
		"lt rt": "right",
		"cm cm": "center"
	};

	// Offset parameter
    var splittedOffset = o.offset.split(" ");
   	var offset_left = parseInt(splittedOffset[0]);
	var offset_top = parseInt(splittedOffset[1]);

    // Get viewport with your configuration - Crossbrowser
    //Conditional Advance Loading method
	var getViewport = (typeof window.innerWidth != "undefined") ?
		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight 	
		function getViewport() {
			var viewport, width, height, left, top, pageX, pageY, scrollBar = 30;							
			
			viewport = window;
			width = viewport.innerWidth - scrollBar;
			height = viewport.innerHeight;
			pageX = viewport.pageXOffset;
			pageY = viewport.pageYOffset;

			// Return viewport object
			return {
				element: viewport,			
				left: 0 + offset_left + pageX - scrollBar,
				top: 0 + offset_top + pageY,
				bottom: height + pageY,
				right: width + pageX,
				width: width,
				height: height
			}
		}:		
		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		// older versions of IE - viewport = document.getElementsByTagName('body')[0];
		function getViewport(){
			var viewport, width, height, left, top, pageX, pageY, scrollBar = 30;
			
			viewport = document.documentElement;
			width = viewport.clientWidth - scrollBar;
			height = viewport.clientHeight;
			pageX = viewport.scrollLeft;
			pageY = viewport.scrollTop;
			
			// Return viewport object
			return {
				element: viewport,			
				left: 0 + offset_left + pageX,
				top: 0 + offset_top + pageY,
				bottom: height + pageY,
				right: width + pageX,
				width: width,
				height: height
			}
		};
	
 	
	// Calculate css left and top to element on context
	var getPosition = function(unitPoints) {		     
		// my_x and at_x values together
		// cache properties 
		var contextLeft = context.left;
		var contextTop = context.top;
		var contextWidth = context.width;
		var contextHeight = context.height;
		var elementWidth = element.outerWidth();
		var elementHeight = element.outerHeight();
		
		
		var xReferences = {
			ll: contextLeft,
			lr: contextLeft + contextWidth,
			rr: contextLeft + contextWidth - elementWidth,
			cc: contextLeft + contextWidth/2 - elementWidth/2
			// TODO: lc, rl, rc, cl, cr
		}
		
		// my_y and at_y values together
		var yReferences = {
			tt: contextTop,
			tb: contextTop + contextHeight,
			bt: contextTop - elementHeight,
			mm: contextTop + contextHeight/2 - elementHeight/2
			// TODO: tm, bb, bm, mt, mb
		}
		
		var axis = {
			left: xReferences[unitPoints.my_x + unitPoints.at_x],
			top: yReferences[unitPoints.my_y + unitPoints.at_y]	
		} 

		return axis;
	};
	
	// Evaluate viewport spaces and set points
	var calculatePoints = function(points, unitPoints){					
		// Default styles
        var styles = getPosition(unitPoints);
        	styles.direction = classReferences[points];
		
		// Hold behavior
		if (o.hold) return styles;

        // Check viewport limits	
		// Down to top
		if ( (points == "lt lb") && ((styles.top + parentRelative.top + element.outerHeight()) > viewport.bottom) ) { // Element bottom > Viewport bottom
			unitPoints.my_y = "b";
			unitPoints.at_y = "t";
			
			//store old styles
			stylesDown = styles;
			
			// New styles		 
			styles = getPosition(unitPoints);
			styles.direction = "top";
			styles.top -= (2 * offset_top);
		
			// Top to Down - Default again 
			if(styles.top + parentRelative.top < viewport.top){
				unitPoints.my_y = "t";
				unitPoints.at_y = "b";
				styles = stylesDown;
				styles.direction = "down";
			};
		};
		
		// Left to right
		if ( (styles.left + parentRelative.left + element.outerWidth()) > viewport.right ) { // Element right > Viewport right
			unitPoints.my_x = "r";
			unitPoints.at_x = "r";
			
			//store old styles
			stylesLeft = styles;
			
			// New styles
			var current = styles.direction;
			styles = getPosition(unitPoints);
			styles.direction = current + "-right";						
			styles.left -= (2 * offset_left);
			if(current == "top") styles.top -= (2 * offset_top);
			
			// Right to Left - Default again 
			if(styles.left < viewport.left){
				unitPoints.my_y = "l";
				unitPoints.at_y = "l";
				styles = stylesLeft;
			};
		};

		return styles;
	};
	
	
	// Set position to element on context
	var setPosition = function() {
		// Separate points config
        var splitted = o.points.split(" ");
        
        var unitPoints = {
        	my_x: splitted[0].slice(0,1),
        	my_y: splitted[0].slice(1,2),
        	at_x: splitted[1].slice(0,1),
        	at_y: splitted[1].slice(1,2)
        }
        
		var styles = calculatePoints(o.points, unitPoints);
		
		element
			.css({
				left: styles.left,
				top: styles.top
			})
			.removeClass( "ch-top ch-left ch-down ch-right ch-down-right ch-top-right  ch-right-right" )
			.addClass( "ch-" + styles.direction );
				
		if ( context.hasOwnProperty("element") && context.element !== ui.utils.window[0] ){
			$(context.element)
				.removeClass( "ch-top ch-left ch-down ch-right ch-down-right ch-top-right ch-right-right" )
				.addClass( "ch-" + styles.direction );
		};

	};	

	// Get context	
	//Conditional Advance Loading method
	var getContext = (o.context) ?		
		function getContext(){

			var contextOffset = o.context.offset();
			
		    context = {
		    	element: o.context,
				top: contextOffset.top + offset_top - parentRelative.top,
				left: contextOffset.left + offset_left - parentRelative.left,
				width: o.context.outerWidth(),
				height: o.context.outerHeight()
		    };
		    
		    return context;
		}:
		function getContext(){
			return viewport;
		};
	
	
	var getParentRelative = function(){
		var relative = {};
			relative.left = 0;
			relative.top = 0;
		
		element.parents().each(function(i, e){
			if ( $(e).css("position") != "relative" ) return;
		
			var borderLeft = ($(e).outerWidth() - $(e).width() - ( parseInt($(e).css("padding-left")) * 2 )) / 2;
			
			relative = $(e).offset();
			relative.left -= offset_left - borderLeft;
			relative.top -= offset_top;
			
			return false;
		});
		
		return {
			left: relative.left,
			top: relative.top
		};
	};
	

    var initPosition = function(){			
	    viewport = getViewport();
	    parentRelative = getParentRelative();
	    context = getContext();
	    setPosition();
    }; 
 	 
	var scrolled = false;

/**
 *  Default event delegation
 */ 

	// Init	
	initPosition();

	// Scroll and resize events
	// Tested on IE, Magic! no lag!!
	ui.utils.window.bind("resize scroll", function() {
		scrolled = true;
	});
	
	setInterval(function() {
	    if( !scrolled ) return;
		scrolled = false;
		// Hidden behavior
		if( element.css("display") === "none" ) return; 	
		initPosition();
	}, 250);
	
	return $(element);
};
/**
 *  @class Object. Represent the abstract class of all ui objects.
 *  @return {object} Object.
 */	

ui.object = function(){
	
/**
 *  Inheritance: Create a symbolic link to myself
 */
	var that = this;	
	var conf = that.conf;
	//Porque llegan las cosas que pisa el modal cuando sube... si no estan definidas todavia.
/**
 *  Public Members
 */
	that.prevent = function(event) {
		if (event && typeof event == "object") {
		    event.preventDefault();
			event.stopPropagation();
		};
		
		return that;
	};
		
	that.loadContent = function() {
		// TODO: Properties validation
		//if( self.ajax && (self.content || self.msg) ) { alert('UI: "Ajax" and "Content" can\'t live together.'); return; };
		
		if( conf.ajax === true){
			
			// Load URL from href or form action
			conf.ajaxUrl = that.$element.attr('href') || that.$element.parents('form').attr('action');
			
			// Ajax parameters
			conf.ajaxParams = 'x=x'; // TODO refactor con el header de ajax
			
			// If trigger is a form button...
			if(that.$element.attr('type') == 'submit'){
				conf.ajaxType = that.$element.parents('form').attr('method') || 'GET';
				var serialized = that.$element.parents('form').serialize();
				conf.ajaxParams = conf.ajaxParams + ((serialized != '') ? '&' + serialized : '');
			};

			// Returns ajax results

			ui.get({method:"content", that:that});
			
			return '<div class="loading"></div>';
			
		} else if ( conf.ajax || (conf.msg && conf.msg.match(/(?:(?:(https?|file):\/\/)([^\/]+)(\/(?:[^\s])+)?)|(\/(?:[^\s])+)/g)) ){
			// Set url
			conf.ajaxUrl = conf.ajax || conf.msg;

			// Ajax parameters
			conf.ajaxParams = 'x=x'; // TODO refactor con el header de ajax

			// Returns ajax results

			ui.get({method:"content", that:that});
			return '<div class="loading"></div>';
			
		} else {
			var content = conf.content || conf.msg;
			return ($(content).length > 0) ? $(content).detach().clone().show() : content ;
		};

	};

	that.callbacks = function(when){
		if( conf.hasOwnProperty(when) ) {
			var context = ( that.controller ) ? that.controller.public : that.public;
			
			return conf[when].call( context );
		};
	};
	
	that.position = function(o){
	
		switch(typeof o) {
		 
			case "object":
				conf.position.context = o.context || conf.position.context;
				conf.position.points = o.points || conf.position.points;
				conf.position.offset = o.offset || conf.position.offset;				
				conf.position.fixed = o.fixed || conf.position.fixed;
			
				ui.positioner(conf.position);
				return that.public;
				break;
		
			case "string":
				if(o != "refresh"){
					alert("ChicoUI error: position() expected to find \"refresh\" parameter.");
				};

				ui.positioner(conf.position);
				return that.public;   			
				break;
		
			case "undefined":
				return conf.position;
			    break;
		};
		
	};
	

	 
 	that.public = {};
	
	return that;
};
/**
 *  @class Floats. Represent the abstract class of all floats UI-Objects.
 *  @requires object.
 *  @returns {Object} Floats.
 */

ui.floats = function() {

/**
 *  Constructor
 */
	var that = this;
	var conf = that.conf;	
	
/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);
    
/**
 *  Private Members
 */
	var createCone = function() {
		$('<div class="ch-cone"></div>').prependTo(that.$container);
		
		return;
	};

	var createClose = function() { 
		$('<p>')
			.addClass("btn ch-close")
			.css("z-index",ui.utils.zIndex++)
			.bind('click', function(event){ that.hide(event) })
			.prependTo(that.$container);
			
		return;
	};

    var createLayout = function() {
		
        // Creo el layout del float
    	that.$container = $("<div class=\"ch-" + that.type + "\"><div class=\"ch-" + that.type + "-content\"></div></div>").appendTo("body").hide();
    	that.$content = that.$container.find(".ch-" + that.type + "-content");

		conf.position = conf.position || {};
		conf.position.element = that.$container;
		conf.position.hold = conf.hold || false;
		
		conf.cache = ( conf.hasOwnProperty("cache") ) ? conf.cache : true;
    	
    	// Visual configuration
		if( conf.closeButton ) createClose();
		if( conf.cone ) createCone();
		if( conf.classes ) that.$container.addClass(conf.classes);
		if( conf.hasOwnProperty("width") ) that.$container.css("width", conf.width);
		if( conf.hasOwnProperty("height") ) that.$container.css("height", conf.height);

		that.$content.html( that.loadContent(that) );
		that.$container
    		.css("z-index", ui.utils.zIndex++)
		    .fadeIn('fast', function(){ that.callbacks('onShow'); });

		ui.positioner.call(that);
		
		return;
    };
    

/**
 *  Protected Members
 */ 
			
/**
 *  Public Members
 */
 
	that.active = false;
	
	that.show = function(event) {
		
		if ( event ) that.prevent(event);
		
		if ( that.active ) return;
		
		that.active = true;
		
		// Show if exist, else create		
		if ( that.$container ) {
			
			// If not cache... get content! // Flush cache where?? when?? do it!
			if ( !conf.cache ) that.$content.html( that.loadContent() );
						
    		that.$container
    		    .appendTo("body")
    			.css("z-index", ui.utils.zIndex++)
			    .fadeIn('fast', function(){ 
					that.active = true;
					
					// Callback execute
					that.callbacks('onShow');
				});

			that.position("refresh");
						
			return that;
		};
		
		// If you reach here, create a float
        createLayout();
        
        return that;
	};

	that.hide = function(event) {

		if (event) that.prevent(event);

		if (!that.active) return;

		that.$container.fadeOut('fast', function(){ 
			 
			that.active = false;
			
			// Callback execute
			that.callbacks('onHide');
			
			$(this).detach();
		});
		
		return that;

	};
	
	return that;
	
};
/**
*  @static @class Navigators. Represent the abstract class of all navigators ui objects.
*  @requires PowerConstructor
*  @returns {Object} New Navigators.
*/	
ui.navs = function(){
	
/**
 *  Constructor
 */
	var that = this;
	var conf = that.conf;
/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */
 
 
/**
 *  Protected Members
 */ 

			
/**
 *  Public Members
 */ 	
	that.active = false;
		
	that.show = function(event){
		that.prevent(event);
		
		if ( that.active ) return;
		
		that.active = true;

		that.$trigger.addClass("ch-" + that.type + "-on");
		that.$content.show();
		that.callbacks("onShow");
		
		return that;
	};
	
	that.hide = function(event){
		that.prevent(event);
		
		if (!that.active) return;
		
		that.active = false;
		
		that.$trigger.removeClass("ch-" + that.type + "-on");
		that.$content.hide();
		that.callbacks("onHide");
		
		return that;
	};		
	
	return that;
}
/**
 *	Controllers
 *	@author 
 *	@Contructor
 *	@return An interface object
 */

ui.controllers = function(){

/**
 *  Constructor
 */
	var that = this;
		
/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);
	
	
/**
 *  Private Members
 */
 
 
/**
 *  Protected Members
 */ 
	
	that.children = [];
			
/**
 *  Public Members
 */	
	
	
	return that;
};
/**
 *	Field validation Watcher
 *	@return An interface object
 */

ui.watcher = function(conf) {

/**
 *  Validation
 */

    /*if ( !conf ) {
        alert("Watcher fatal error: Need a configuration object to create a validation.");
    };*/

/**
 *  Constructor
 */

	var that = this;
	
	conf = ui.clon(conf);
	that.conf = conf;	

/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);
	
	
/**
 *  Private Members
 */
	
	// Enabled
	
	
	// Get my parent or set it
	var controller = (function() {
		if ( ui.instances.hasOwnProperty("form") && ui.instances.form.length > 0 ) {	
		  var i = 0, j = ui.instances.form.length; 
		  for (i; i < j; i ++) {
				if (ui.instances.form[i].element === that.$element.parents("form")[0]) {
					return ui.instances.form[i]; // Get my parent
				};
			};
		} else {
			that.$element.parents("form").form();
			var last = (ui.instances.form.length - 1);
			return ui.instances.form[last]; // Set my parent
		};
	})();
	
 	//  Check for instances with the same trigger	
	var checkInstance = function() {
        var instance = ui.instances.watcher;
        
        if ( instance && instance.length > 0 ) {
			for (var i = 0, j = instance.length; i < j; i ++) {            	                
                
                if (instance[i].element !== that.element) continue;
        	    
        	    // Merge Validations        	    
                $.extend(instance[i].validations, that.validations);
        	    
        	    // Merge Conditions        	    
                $.extend(instance[i].conditions, that.conditions);

                // Merge Messages
                $.extend(instance[i].messages, that.messages);
                
                // Merge types
        	    instance[i].types = mergeTypes(instance[i].types);

				return { 
				    exists: true, 
				    object: instance[i] 
			    };
			    
            };
        };
    };
    
	var mergeTypes = function (types) {
        if (!types || types == "") {
            return conf.types;
        } else {
            var currentTypes = types.split(",");
            var newTypes = conf.types.split(",");

            var toMerge = [];
            // For all new types, check if don't exists
            var e = 0; g = newTypes.length;
            for (e; e < g; e++) {
                if (types.indexOf(newTypes[e]) === -1) {
                    // If is a new type, pushed to merge it with the currents
                    toMerge.push(newTypes[e]);
                };
            };
            // If are things to merge, do it.
            if (toMerge.length > 0) {
                $.merge(currentTypes, toMerge);
            };

            // Return as string
            return currentTypes.join(",");
        }    
    };
    
	// Revalidate
	var revalidate = function() {		
		that.validate();
        controller.checkStatus();  // Check everthing?
	}; 


/**
 *  Protected Members
 */ 

    // Status
	that.active = false;
	
	// Enabled
	that.enabled = true;
	
	// Reference: for the Positioner
	that.reference = (function() {
        var reference;
        // CHECKBOX, RADIO
        if ( that.$element.hasClass("options") ) {
            // Helper reference from will be fired
            // H4
            if ( that.$element.find('h4').length > 0 ) {
                var h4 = that.$element.find('h4'); // Find h4
                    h4.wrapInner('<span>'); // Wrap content with inline element
                reference = h4.children(); // Inline element in h4 like helper reference	
            // Legend
            } else if ( that.$element.prev().attr('tagName') == 'LEGEND' ) {
                reference = that.$element.prev(); // Legend like helper reference
            }
        // INPUT, SELECT, TEXTAREA
        } else {
            reference = that.$element;
        }
        return reference;
    })();

	// Validations Map - Collect validations
	that.validations = (function() {
        var collection = {};
        var types = conf.types.split(",");
        for (var i = 0, j = types.length; i < j; i ++) {
            for (var val in conf) {
                if (types[i] == val) {
                    collection[val] = conf[val];
                    // TODO: eliminar conf[val]???
                }
            }
        }

        return collection;
    })();


	// Conditions Map
	that.conditions = (function() {
        var collection = {};        
        var types = conf.types.split(",");
        for (var i = 0, j = types.length; i < j; i ++) {
            for (var val in conf) {
                if (types[i] == val) {
                    collection[val] = conf.conditions[val];
                    // TODO: eliminar conf[val]???
                }
            }
        }

        return collection;
    })();


	
    // Messages

    that.messages = ui.clon(conf.messages);
 
    // Helper
    var helper = {};
		helper.uid = that.uid + "#0";
		helper.type = "helper";
		helper.element = that.element;
		helper.$element = that.$element;
		
    that.helper = ui.helper.call(helper, that);
    
    // Validate Method
	that.validate = function() {		
		// Pre-validation: Don't validate disabled or not required & empty elements
		if ( that.$element.attr('disabled') ) { return; }
		if ( !that.validations.hasOwnProperty("required") && that.isEmpty() ) { return; }

		if ( that.enabled ) {
			
			that.callbacks('beforeValidate');

	        // Validate each type of validation
	        
			for (var type in that.validations) {
				
				// Status error (stop the flow)
				var condition = that.conditions[type];
	            var value = that.$element.val();
	            var gotError = false;
				
	            if ( type == "required" ) {
	                gotError = that.isEmpty();
	            }
	            
	            if ( condition.patt ) {
	                gotError = !condition.patt.test(value);
	            }
	            
	            if ( condition.expr ) {
	                gotError = !condition.expr((type.indexOf("Length")>-1) ? value.length : value, that.validations[type]);
	            }

	            if ( condition.func && type != "required" ) {
	                gotError = !condition.func.call(this, value); // Call validation function with 'this' as scope
	            }
				
				if ( gotError ) {
										
	    			// Field error style
					that.$element.addClass("error");

					// Show helper with message
					var text = ( that.messages.hasOwnProperty(type) ) ? that.messages[type] : 
						(controller.hasOwnProperty("messages")) ? controller.messages[type] :
						undefined;

					that.helper.show( text );

					that.active = true;

					var event = (that.tag == 'OPTIONS' || that.tag == 'SELECT') ? "change" : "blur";

					that.$element.one(event, that.validate); // Add blur or change event only one time

	                return;
				}
	        } // End for each validation
		} // End if Enabled
		
		// Status OK (with previous error)
		if ( that.active || !that.enabled ) {
		    // Remove field error style
			that.$element.removeClass("error"); 
            // Hide helper  
			that.helper.hide();
			// Public status OK
			//that.publish.status = that.status =  conf.status = true; // Status OK
			that.active = false;
			
			controller.checkStatus();
		}
        
        that.callbacks('afterValidate');
        
        return that;
	};
	
	// Reset Method
	that.reset = function() {
		//that.publish.status = that.status = conf.status = true; // Public status OK
		that.active = false;
		that.$element.removeClass("error");
		that.helper.hide(); // Hide helper
		that.$element.unbind("blur"); // Remove blur event 
		
		that.callbacks("onReset");
		
		return that;
	};
	
	// isEmpty Method
	that.isEmpty = function() {
		that.tag = ( that.$element.hasClass("options")) ? "OPTIONS" : that.element.tagName;
		switch (that.tag) {
			case 'OPTIONS':
				return that.$element.find('input:checked').length === 0;
			break;
			
			case 'SELECT':
			    var val = that.$element.val();
				return val === -1 || val === null;
			break;
			
			case 'INPUT':
			case 'TEXTAREA':
				return $.trim( that.$element.val() ).length === 0;
			break;
		};
				
	};

	
			
/**
 *  Public Members
 */	
	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = "watcher"; // Everything is a "watcher" type, no matter what interface is used
	that.public.types = conf.types;
	that.public.reference = that.reference;
	that.public.validations = that.validations;
	that.public.conditions = that.conditions;
	that.public.messages = that.messages;
	that.public.helper = that.helper;
	that.public.active = function() {
		return that.active;
	};
	
	that.public.and = function() {
		return that.$element;
	};
	
	that.public.reset = function() {
		that.reset();
		
		return that.public;
	};
	
	that.public.validate = function() {
		that.validate();
		
		return that.public;
	};
	  
	that.public.enable = function() {
		that.enabled = true;
				
		return that.public;			
	};
	
	that.public.disable = function() {
		that.enabled = false;
		
		return that.public;
	};
	
	that.public.refresh = function() { 
		return that.helper.position("refresh");
   };

	

/**
 *  Default event delegation
 */	

    // Run the instances checker        
    // TODO: Maybe is better to check this on top to avoid all the process. 
    var check = checkInstance();
    // If a match exists
    if ( check ) {
        // Create a public object and save the existing object
        // in the public object to mantain compatibility
        var that = {};
            that.public = check; 
        // ;) repleace that object with the repeated instance
    } else {
        // this is a new instance: "Come to papa!"
        controller.children.push(that.public);
    };

	return that;
};
/**
 *  @class Sliders. Represent the abstract class of all sliders UI-Objects.
 *  @requires object.
 *  @returns {Object} Sliders.
 */

ui.sliders = function() {

/**
 *  Constructor
 */
	var that = this;
	var conf = that.conf;
	
/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);
    
/**
 *  Private Members
 */
	

/**
 *  Protected Members
 */ 
			
/**
 *  Public Members
 */
 
	that.active = false;
	
	return that;
	
};/**
 *	Carousel
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.carousel = function(conf){
	
/** 
 *  Constructor
 */
	
	var that = this;
	
	that.$element.addClass('ch-carousel');
	
	// UL configuration
	that.$content = that.$element.find('.carousel')	 // TODO: wrappear el contenido para que los botones se posicionen con respecto a su contenedor
		.addClass('ch-carousel-content')
		.wrap($('<div>').addClass('ch-mask'))//gracias al que esta abajo puedo leer el $mask.width()

	conf = ui.clon(conf);
	that.conf = conf;
	
/**
 *	Inheritance
 */

    that = ui.sliders.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */
	var page = 1;
	
	// UL Width calculator
	var htmlElementMargin = (ui.utils.html.hasClass("ie6")) ? 21 : 20; // IE needs 1px more
	var extraWidth = (ui.utils.html.hasClass("ie6")) ? that.$content.children().outerWidth() : 0;
	var htmlContentWidth = that.$content.children().size() * (that.$content.children().outerWidth() + htmlElementMargin) + extraWidth;
	that.$content.css('width', htmlContentWidth);
	
	// Mask Object	
	var $mask = that.$element.find('.ch-mask');

	// Steps = (width - marginMask / elementWidth + elementMargin) 70 = total margin (see css)
	var steps = ~~( (that.$element.width() - 70) / (that.$content.children().outerWidth() + 20));
		steps = (steps == 0) ? 1 : steps;	
	var totalPages = Math.ceil(that.$content.children().size() / steps);

	// Move to... (steps in pixels)
	var moveTo = (that.$content.children().outerWidth() + 20) * steps;
	// Mask configuration
	var margin = ($mask.width()-moveTo) / 2;
	$mask.width( moveTo ).height( that.$content.children().outerHeight() + 2 ); // +2 for content with border

	var makePager = function(){
		var pager = $("<ul class=\"ch-pager\">");
		var thumbs = [];
		
		// Create each mini thumb
		for(var i = 1, j = totalPages + 1; i < j; i += 1){
			if(i == 1) thumbs.push("<li class=\"ch-pager-on\">"); else thumbs.push("<li>");
			thumbs.push(i);
			thumbs.push("</li>");
		};
		pager.append( thumbs.join("") );
		
		// Create pager
		that.$element.append( pager );
		
		// Position
		var contextWidth = pager.parent().width();
		var pagerWidth = pager.outerWidth();
		
		pager.css('left', (contextWidth - pagerWidth) / 2);
		
		// Children functionality
		pager.children().each(function(i, e){ //TODO: unificar con el for de arriba (pager)
			$(e).bind("click", function(){
				that.select(i+1);
			});
		});
		
		return pager;
	};
	

/**
 *  Protected Members
 */

	// Buttons
	that.buttons = {
		prev: {
			$element: $('<p class="ch-prev"><span>Previous</span></p>').bind('click', function(){ that.move("prev", 1) }).css('top', (that.$element.outerHeight() - 50) / 2), // 50 = button height + margin TODO usar positioner
			on: function(){ that.buttons.prev.$element.addClass("ch-prev-on") },
			off: function(){ that.buttons.prev.$element.removeClass("ch-prev-on") }
		},
		next: {
			$element: $('<p class="ch-next"><span>Next</span></p>').bind('click', function(){ that.move("next", 1) }).css('top', (that.$element.outerHeight() - 50) / 2), // 50 = button height + margin TODO usar positioner
			on: function(){ that.buttons.next.$element.addClass("ch-next-on") },
			off: function(){ that.buttons.next.$element.removeClass("ch-next-on") }
		}
	};
	


	that.move = function(direction, distance){
		var movement;
		
		switch(direction){
			case "prev":
				// Validation
				if(that.active || (page - distance) <= 0) return;
				
				// Next move
				page -= distance;
				
				// Css object
				movement = that.$content.position().left + (moveTo * distance);
				
				// Buttons behavior
				if(page == 1) that.buttons.prev.off();
				that.buttons.next.on();
			break;
			case "next":
				// Validation
				if(that.active || (page + distance) > totalPages) return;
				
				// Next move
				page += distance;
				
				// Css object
				movement = that.$content.position().left - (moveTo * distance);
				
				// Buttons behavior
				if(page == totalPages) that.buttons.next.off();
				that.buttons.prev.on();
			break;
		};
				
		// Status moving
		that.active = true;
		
		// Function executed after movement
		var afterMove = function(){
			that.active = false;
			
			// Pager behavior
			if (conf.pager) {								
				that.pager.children().removeClass("ch-pager-on");
				that.pager.children(":nth-child("+page+")").addClass("ch-pager-on");
			};

			// Callbacks
			that.callbacks("onMove");
		};
		
		// Have CSS3 Transitions feature?
		if (ui.features.transition) {
			
			// Css movement
			that.$content.css({ left: movement });
			
			// Callback
			afterMove();
			
		// Ok, let JQuery do the magic...
		} else {
			
			that.$content.animate({ left: movement }, afterMove);
		};
		
		return that;
	};
	
	
	that.select = function(pageToGo){
		//var itemPage = ~~(item / steps) + 1; // Page of "item"
		
		// Move right
		if(pageToGo > page){
			that.move("next", pageToGo - page);
		// Move left
		}else if(pageToGo < page){
	        that.move("prev", page - pageToGo);
		};
		
		if (conf.pager) {
			that.pager.children().removeClass("ch-pager-on");
			that.pager.children(":nth-child("+page+")").addClass("ch-pager-on");
		};
			
	    return that;
	};


/**
 *  Public Members
 */

   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;

	that.public.getSteps = function() { return steps; };
    that.public.getPage = function() { return page; };
    that.public.moveTo = function(page) {
    	that.select(page);

    	return that.public;
    };
    
    that.public.next = function(){
    	that.move("next", 1);

    	return that.public;
    };
    
	that.public.prev = function(){
		that.move("prev", 1);

		return that.public;
	};


/**
 *  Default event delegation
 */
 	
	// UL width configuration
	that.$content.css('width', htmlContentWidth);
 	
	// Buttons behavior
	that.$element.prepend( that.buttons.prev.$element ).append( that.buttons.next.$element ); // Append prev and next buttons
	if (htmlContentWidth > $mask.width()) that.buttons.next.on(); // Activate Next button if items amount is over carousel size

	// Create pager if it was configured
	if (conf.pager) that.pager = makePager();
 
	return that;
}
/**
 *	Dropdown
 *	@author 
 *	@Contructor
 *	@return An interface object
 */	

ui.dropdown = function(conf){

/** 
 *  Constructor
 */
	
	var that = this;

	conf = ui.clon(conf);
	conf.skin = ( that.$element.hasClass("ch-secondary") ) ? "secondary": "primary";

	that.conf = conf;
	
/**
 *	Inheritance
 */

    that = ui.navs.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */
	
	

/**
 *  Protected Members
 */ 
	that.$container = that.$element.addClass("ch-dropdown");
	
	that.$trigger = that.$container.children(":first");
	
	that.show = function(event){
		that.prevent(event);
		
		// Toggle
		if ( that.active ) {
			return that.hide(event);
		};
		
        // Reset all dropdowns
		$(ui.instances.dropdown).each(function(i, e){ e.hide(); });
		
        // Show menu
		that.$content.css('z-index', ui.utils.zIndex++);
		that.$trigger.css('z-index', ui.utils.zIndex ++); // Z-index of trigger over content		
		that.parent.show(event);		
		that.position("refresh");
		
		// Secondary behavior
		if(conf.skin == "secondary"){
			that.$container.addClass("ch-dropdown-on"); // Container ON
		};
	
		// Document events
		ui.utils.document.one('click', function(event){ that.hide(event) });
		
        return that;
    };
	
    that.hide = function(event){
    	that.prevent(event);
    	
    	if (!that.active) return;
    	
    	// Secondary behavior
		if(conf.skin == "secondary"){
			that.$container.removeClass("ch-dropdown-on"); // Container OFF
		};
		
        that.parent.hide(event);
        
        return that;
	};
	
/**
 *  Public Members
 */
   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.show = function(){
		that.show();
		
		return that.public;
	};
	
	that.public.hide = function(){
		that.hide();
		
		return that.public;
	};
	
	that.public.position = that.position;	


/**
 *  Default event delegation
 */		    
    // Trigger
	that.$trigger
		.bind("click", function(event){ that.show(event) })
		.addClass("ch-dropdown-trigger-" + conf.skin)
		.append("<span class=\"ch-down\"> &raquo;</span>");

	// Content
	that.$content = that.$trigger.next();
	that.$content
		// Prevent click on content (except links)
		.bind("click", function(event){
			event.stopPropagation();
		})
		.addClass("ch-dropdown-content-" + conf.skin)
		// Save on memory;
		.detach();
	
	// Close dropdown after click an option (link)
	that.$content.find('a').one("click", function(){ that.hide() });

	// Put content out of container
	that.$container.after( that.$content );
		
	// Position
	that.conf.position = {};
	that.conf.position.element = that.$content;
	that.conf.position.context = that.$trigger;
	that.conf.position.points = "lt lb";
	that.conf.position.offset = "0 -1";
	
	ui.positioner.call(that);
	
	return that;

};
/**
 *	Context Layer
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.layer = function(conf) {

    
/**
 *	Constructor
 *	Guardo el contexto de ejecucion (this) que viene con 3 propiedades del factory (uid, element, type).
 *	Luego, seteamos la configuracion bÃƒÂ¡sica del componente y lo guardamos en el contexto para que llegue a sus padres cuando pasamos el contexto (that.conf)
 */

	var that = this;
	
	conf = ui.clon(conf);
	conf.cone = true;
	conf.classes = "box";
	conf.position = {};
	conf.position.context = that.$element;
	conf.position.offset = conf.offset || "0 10";
	conf.position.points = conf.points || "lt lb";

	that.conf = conf;

/**
 *	Inheritance
 *		
 */

    that = ui.floats.call(that);
    that.parent = ui.clon(that);
    
/**
 *  Private Members
 */
 
    var showTime = conf.showTime || 400;
    var hideTime = conf.hideTime || 400;

	var st, ht; // showTimer and hideTimer
	
	var showTimer = function(){ st = setTimeout(that.show, showTime) };
	var hideTimer = function(){ ht = setTimeout(that.hide, hideTime) };
	
	var clearTimers = function(){ clearTimeout(st); clearTimeout(ht); };

/**
 *  Protected Members
 */
	
	that.$trigger = that.$element;
	
	that.show = function(event) {
	
		// Reset all layers
		$.each(ui.instances.layer, function(i, e){ e.hide(); });
		//conf.position.context = that.$element;
		that.parent.show(event);

		that.$container.bind('click', function(event){ event.stopPropagation() });
        
        // Click
        if (conf.event == "click") {
            $('<p class="btn ch-close">x</p>').bind('click', that.hide).prependTo(that.$container);
            // Document events
            $(document).one('click', that.hide);
            
        // Hover
        } else {      	
        	clearTimers();    
        	that.$container
        		.one("mouseenter", clearTimers)
        		.bind("mouseleave", function(event){
					var target = event.srcElement || event.target;
					var relatedTarget = event.relatedTarget || event.toElement;
					var relatedParent = relatedTarget.parentNode;
					if ( target === relatedTarget || relatedParent === null || target.nodeName === "SELECT" ) return;
					hideTimer();
        		});
        };
        
        return that;
    };

/**
 *  Public Members
 */
   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.content = conf.content || conf.ajax || conf.msg;
	that.public.show = function(){
		that.show();
		
		return that.public;
	};
	
	that.public.hide = function(){
		that.hide();
		
		return that.public;
	};
	
	that.public.position = that.position;
	
/**
 *  Default event delegation
 */
	// Click
	if(conf.event === 'click') {
		// Local configuration
		conf.closeButton = true;

		// Trigger events
		that.$trigger
			.css('cursor', 'pointer')
			.bind('click', that.show);

	// Hover
	} else {
		// Trigger events
		that.$trigger
			.css('cursor', 'default')
			.bind('mouseenter', that.show)
			.bind('mouseleave', hideTimer);
	};

    // Fix: change layout problem
    $("body").bind(ui.events.CHANGE_LAYOUT, function(){ that.position("refresh") });
 

	return that;

};
/**
 *	@class Modal. Create and manage modal windows
 *  @requires: floats.
 *	@return Public Object.
 */

ui.modal = function(conf){

/**
 *	Constructor
 *	Guardo el contexto de ejecucion (this) que viene con 3 propiedades del factory (uid, element, type).
 *	Luego, seteamos la configuracion bÃƒÂ¡sica del componente y lo guardamos en el contexto para que llegue a sus padres cuando pasamos el contexto (that.conf).
 */

	var that = this;

	conf = ui.clon(conf);
	conf.ajax = ( !conf.hasOwnProperty("ajax") && !conf.hasOwnProperty("content") && !conf.hasOwnProperty("msg") ) ? true : conf.ajax; //Default	
	conf.closeButton = (that.type == "modal") ? true : false;
	conf.classes = "box";

	that.conf = conf;

/**
 *	Inheritance
 */

    that = ui.floats.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */

	// Dimmer 2.0
	// Dimmer object
	var $dimmer = $('<div>')
			.addClass('ch-dimmer')
			.css({ height: ui.utils.window.height(), display:'block' })
			.hide();

	// Dimmer Controller
	var dimmer = {
		on: function() { //TODO: posicionar el dimmer con el positioner
			$dimmer
				.appendTo('body')
				.css("z-index",ui.utils.zIndex++)
				.fadeIn();

			if (that.type == "modal") {
				$dimmer.one("click", function(event){ that.hide(event) });
			}
			
		},
		off: function() {
			$dimmer.fadeOut('normal', function(){ 
				$dimmer.detach(); 
			});
		}
	};

/**
 *  Protected Members
 */ 
	that.$trigger = that.$element;
	
	that.show = function(event) {	
		dimmer.on();
		that.parent.show(event);		
		that.$trigger.blur();
		
		return that;
	};
	
	that.hide = function(event) {
		dimmer.off();

		// If not cache, return content to body
		if ( conf.cache == false && $(conf.content).length > 0 ) {
			that.$content.children().appendTo("body").fadeOut();
		};
		
		that.parent.hide(event);

		return that;
	};
	
/**
 *  Public Members
 */
   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.content = (conf.content) ? conf.content : ((conf.ajax === true) ? (that.$trigger.attr('href') || that.$trigger.parents('form').attr('action')) : conf.ajax );
	that.public.show = function(){
		that.show();
		
		return that.public;
	};
	
	that.public.hide = function(){
		that.hide();
		
		return that.public;
	};
	
	that.public.position = that.position;
 
/**
 *  Default event delegation
 */	
	that.$trigger
		.css('cursor', 'pointer')
		.bind('click', function(event){ that.show(event) });

	return that;
};



/**
 *	@Interface Transition
 *	@return An interface object
 

var t = $("div").transition("Aguarde mientras transiosiono");
	t.hide();
 
 */
 
ui.transition = function(conf) {
    
    conf = conf || {};
	
	conf.closeButton = false;
	conf.msg = conf.msg || "Espere por favor...";
	conf.content = "<div class=\"loading\"></div><p>"+conf.msg+"</p>";

	return ui.modal.call(this, conf);
    
}

ui.factory({ component: 'transition' });
/**
 *	Tabs Navigator
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tabNavigator = function(conf){

/** 
 *  Constructor
 */
	
	var that = this;

	that.$element.addClass('ch-tabNavigator');
		
	conf = ui.clon(conf);
	conf.selected = conf.selected || conf.value || 0;
	
	that.conf = conf;
	
/**
 *	Inheritance
 */

    that = ui.controllers.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */
	
	var ul = that.$element.children(':first').addClass('ch-tabNavigator-triggers');
	
	var hash = window.location.hash.replace("#!", "");
	
    var hashed = false;
    
    var selected = conf.selected;

/**
 *  Protected Members
 */ 
 
 	that.$trigger = ul.find('a');
	that.$content = ul.next().addClass('ch-tabNavigator-content box');
	
	that.select = function(tab){		
		
		selected = parseInt(tab);
		
		tab = that.children[selected];
		
		if(tab.active) return; // Don't click me if I'm open

		// Hide my open bro
		$.each(that.children, function(i, e){
			if( e.active ) e.hide();
		});
        
        tab.shoot();
        
        //Change location hash
		window.location.hash = "#!" + tab.$content.attr("id");		
		
		// Callback
		that.callbacks("onSelect");
		
        return that;
	};
    
/**
 *  Public Members
 */
	
	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.children = that.children;
	that.public.select = function(tab){
		that.select(tab);
		
		return that.public;
	};	
	that.public.getSelected = function(){ return selected; };
	
/**
 *  Default event delegation
 */	
    
	// Create children
	$.each(that.$trigger, function(i, e){
		var tab = {};
			tab.uid = that.uid + "#" + i;
			tab.type = "tab";
			tab.element = e;			
			tab.$element = $(e);
			
		that.children.push( ui.tab.call(tab, that) );
	});
	
	//Default: Load hash tab or Open first tab	
	for(var i = that.children.length; i--; ){
		if ( that.children[i].$content.attr("id") === hash ) {
			that.select(i);
			
			hashed = true;
			
			break;
		};
	};

	if ( !hashed ) that.children[conf.selected].shoot();

	return that;
	
};


/**
 *	Tab
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tab = function(controller){

/** 
 *  Constructor
 */
	
	var that = this;
	
	conf = {};
	if ( controller.conf.hasOwnProperty("onContentLoad") ) conf.onContentLoad = controller.conf.onContentLoad;
	if ( controller.conf.hasOwnProperty("onContentError") ) conf.onContentError = controller.conf.onContentError;	
	
	that.conf = conf;
/**
 *	Inheritance
 */

    that = ui.navs.call(that);
    that.parent = ui.clon(that);
	that.controller = controller;

/**
 *  Private Members
 */
	
	
/**
 *  Protected Members
 */ 
	
	that.$trigger = that.$element.addClass("ch-tabNavigator-trigger");
	
	that.$content = (function(){
		
		var content = controller.$element.find("#" + that.element.href.split("#")[1]);
		
		// If there are a tabContent...
		if ( content.length > 0 ) {
			
			return content;
		
		// If tabContent doesn't exists        
		} else {
			// Set ajax configuration
			conf.ajax = true;
						
			// Create tabContent
			return $("<div id=\"ch-tab" + that.uid + "\">")
				.hide()
				.appendTo( controller.$element.find(".ch-tabNavigator-content") );
		}; 

	})();
	
	// Process show event
	that.shoot = function(event){
		that.prevent(event);

		// Load my content if I'need an ajax request 
		if( that.$content.html() == "" ) that.$content.html( that.loadContent() );

		// Show me
		that.show(event);
		
		return that;
	};

/**
 *  Public Members
 */
	
	
/**
 *  Default event delegation
 */	 	
	
	// Hide my content if im inactive
	if(!that.active) that.$content.hide();

	that.$trigger.bind('click', function(event){
		that.prevent(event);
		controller.select(that.uid.split("#")[1]);
	});
	
	return that;
}
/**
 *	Tooltip
 *	@author 
 *	@Contructor
 *	@return An interface object
 *  @memberOf ui.Floats
 */

ui.tooltip = function(conf) {
    
/**
 *	Constructor
 *	Guardo el contexto de ejecucion (this) que viene con 3 propiedades del factory (uid, element, type).
 *	Luego, seteamos la configuracion bÃƒÂ¡sica del componente y lo guardamos en el contexto para que llegue a sus padres cuando pasamos el contexto (that.conf)
 */

	var that = this;
	
	conf = ui.clon(conf);
	conf.cone = true;
	conf.content = that.element.title;	
	conf.position = {};
	conf.position.context = $(that.element);
	conf.position.offset = conf.offset || "0 10";
	conf.position.points = conf.points || "lt lb";
	
	that.conf = conf;
	
/**
 *	Inheritance
 *		
 */

    that = ui.floats.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */

    
/**
 *  Protected Members
 */     
    that.$trigger = that.$element;

    that.show = function(event) {
        that.$trigger.attr('title', ''); // IE8 remembers the attribute even when is removed, so ... empty the attribute to fix the bug.
		that.parent.show(event);
		
		return that;
	};
	
    that.hide = function(event) {
		that.$trigger.attr('title', conf.content);
		that.parent.hide(event);
		
		return that;
    };

/**
 *  Public Members
 */
 	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.content = conf.content;
	that.public.show = function(){
		that.show();

		return that.public;
	};
	that.public.hide = function(){
		that.hide();

		return that.public;
	};	
	that.public.position = that.position;
    


/**
 *  Default event delegation
 */	
 	
	that.$trigger
		.bind('mouseenter', that.show)
		.bind('mouseleave', that.hide);

    // Fix: change layout problem
    $("body").bind(ui.events.CHANGE_LAYOUT, function(){ that.position("refresh") });


	return that;
};
/**
 *	@Interface String validations
 *	@return An interface object
 */

ui.string = function(conf) {

/**
 *  Constructor
 */
	conf = conf || {};
	
    conf.messages = conf.messages || {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.string = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };
    
    // $.string("message"); support
    if ( !conf.text && !conf.email && !conf.url && !conf.maxLength && !conf.minLength ) {
        conf.text = true;
    };

	// Add validation types
	conf.types = "text,email,url,minLength,maxLength";
    
    // Define the conditions of this interface
    conf.conditions = {
		text:       { patt: /^([a-zA-Z\s]+)$/ },
        email:      { patt: /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/ },
        //url:        { patt: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ },
        // TODO: Improve this expression.
        url:        { patt: /((ftp|http|https):\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ },
        minLength:  { expr: function(a,b) { return a >= b } },
        maxLength:  { expr: function(a,b) { return a <= b } }
        // Conditions map TODO: uppercase, lowercase, varchar
    };


	return ui.watcher.call(this, conf);
    
};


/**
 *	@Interface Email validations
 *	@return An interface object
 */

ui.email = function(conf) {
    
    conf = conf || {};
	
	conf.email = true;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.email = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.string.call(this, conf);
    
};

ui.factory({ component: 'email' });

/**
 *	@Interface URL validations
 *	@return An interface object
 */

ui.url = function(conf) {
    
    conf = conf || {};
	
	conf.url = true;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.url = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.string.call(this, conf);
    
};

ui.factory({ component: 'url' });

/**
 *	@Interface MinLength validations
 *	@return An interface object
 */

ui.minLength = function(conf) {
    
    conf = conf || {};
	
	conf.minLength = conf.value;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.minLength = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.string.call(this, conf);
    
};

ui.factory({ component: 'minLength' });

/**
 *	@Interface MaxLength validations
 *	@return An interface object
 */

ui.maxLength = function(conf) {
    
    conf = conf || {};
	
	conf.maxLength = conf.value;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.maxLength = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.string.call(this, conf);
    
};

ui.factory({ component: 'maxLength' });/**
 *	Number validations
 *	@author
 *	@Contructor
 *	@return An interface object
 */


ui.number = function(conf) {

/**
 *  Constructor
 */

	conf = conf || {};
	
    conf.messages = conf.messages || {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.number = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };
    
    // $.number("message"); support
	if ( !conf.number && !conf.min && !conf.max && !conf.price ) {
		conf.number = true;
	};
  
	// Add validation types
	conf.types = "number,min,max,price";
    
    // Define the conditions of this interface
    conf.conditions = {
		number: { patt: /^([0-9\s]+)$/ },
        min:    { expr: function(a,b) { return a >= b } },
        max:    { expr: function(a,b) { return a <= b } },
		price:  { patt: /^(\d+)[.,]?(\d?\d?)$/ }
		// price:  { patt: /^\d (\Z|[\.]\d )$/ }
		// float: TODO       
    };


	return ui.watcher.call(this, conf);
    
};

/**
 *	@Interface Min validations
 *	@return An interface object
 */

ui.min = function(conf) {
    
    conf = conf || {};
	
	conf.min = conf.value;
	
	conf.value = null;
	
	delete conf.value;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.min = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.number.call(this, conf);
    
};

ui.factory({ component: 'min' });

/**
 *	@Interface Max validations
 *	@return An interface object
 */
 
ui.max = function(conf) {
    
    conf = conf || {};
	
	conf.max = conf.value;
	
	conf.value = null;
	
	delete conf.value;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.max = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.number.call(this, conf);
    
}

ui.factory({ component: 'max' });


/**
 *	@Interface Price validations
 *	@return An interface object
 */
 
ui.price = function(conf) {
    
    conf = conf || {};
	
	conf.price = true;
	
	conf.value = null;
	
	delete conf.value;
	
	conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) { 
		conf.messages.price = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };

	return ui.number.call(this, conf);
    
}

ui.factory({ component: 'price' });
/**
 *	Custom validations
 *  @Extends Watcher
 *	@Interface
 */

ui.custom = function(conf) {

/**
 *  Validation
 */	
	
	if (!conf.lambda) {
        alert("Custom Validation fatal error: Need a function to evaluate, try $().custom(function(){},\"Message\");");
    };

/**
 *  Constructor
 */

	conf = conf || {};
    conf.messages = conf.messages || {};

    if ( conf.hasOwnProperty("msg") ) { 
    	conf.messages.custom = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };
    
	// Define the validation interface    
    conf.custom = true;

	// Add validation types
	conf.types = "custom";
    // Define the conditions of this interface
    conf.conditions = {
		// I don't have pre-conditions, comes within an argument 
        custom: { func: conf.lambda }       
    };


	return ui.watcher.call(this, conf);
    
};/**
 *	Required validations
 *  @Extends Watcher
 *	@Interface
 */

ui.required = function(conf) {
/**
 *  Constructor
 */
	
	conf = conf || {};
	
    conf.messages = {};

    if ( conf.hasOwnProperty("msg") ) {     	
    	conf.messages.required = conf.msg;
    	conf.msg = null;
    	delete conf.msg;
    };
    
	// Define the validation interface    
    conf.required = true;
    
    // Add validation types
	conf.types = "required";
    // Define the conditions of this interface
    conf.conditions = {
        required: 'that.isEmpty' // This pattern is diferent
    };
	
	return ui.watcher.call(this, conf);
    
};/**
 *	Helper
 */

ui.helper = function(controller){

/** 
 *  Constructor
 */
	
	var that = this;

	var conf = {};		
		conf.cone = true;
		conf.position = {};
		conf.position.context = controller.reference;
		conf.position.offset = "15 0";
		conf.position.points = "lt rt";
		conf.cache = false;
	
	that.conf = conf;

/**
 *	Inheritance
 */

    that = ui.floats.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */



/**
 *  Protected Members
 */ 
	that.$trigger = that.$element;
	
	that.show = function(text) {

		conf.content = '<p><span class="ico error">Error: </span>' + text + '</p>';

		that.parent.show();
		
		// This is a awful fix
		// TODO: We need  to update validation messages on each validation somehow
        that.$content.html( that.loadContent() );		
		
		return that;
	};

/**
 *  Public Members
 */

   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.content = conf.content || conf.ajax || conf.msg;
	that.public.show = function(text){
		that.show(text);
		
		return that.public;
	};
	
	that.public.hide = function(){
		that.hide();
		
		return that.public;
	};
	
	that.public.position = that.position;


/**
 *  Default event delegation
 */

    $("body").bind(ui.events.CHANGE_LAYOUT, function(){ 
        that.position("refresh");
    });

	 
	return that;
};
/**
 *	Form Controller
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.form = function(conf){

/**
 *  Validation
 */
	// Are there action and submit type?
	if ( this.$element.find(":submit").length == 0 || this.$element.attr("action") == "" ){ 
		alert("Form fatal error: The <input type=submit> is missing, or need to define a action attribute on the form tag.");
		return;
	};

	// Is there form in map instances?	
	if ( ui.instances.hasOwnProperty("form") && ui.instances.form.length > 0 ){
		for(var i = 0, j = ui.instances.form.length; i < j; i++){
			if(ui.instances.form[i].element === this.element){
				return { 
	                exists: true, 
	                object: ui.instances.form[i]
	            };
			};
		};
	};

/**
 *  Constructor
 */
	var that = this;
	
	conf = ui.clon(conf);
	// Create the Messages for General Error
	if ( !conf.hasOwnProperty("messages") ) conf.messages = {};
	conf.messages["general"] = conf.messages["general"] || "Check for errors.";	
	
	that.conf = conf;

/**
 *  Inheritance
 */

    that = ui.controllers.call(that);
    that.parent = ui.clon(that);
	
	
/**
 *  Private Members
 */
 
	var status = true;
	
	// General Error
	var $error = $("<p class=\"ch-validator\"><span class=\"ico error\">Error: </span>" + conf.messages["general"] + "</p>");
	
	// Create
	var createError = function(){ 
		that.$element.before( $error );		
		$("body").trigger(ui.events.CHANGE_LAYOUT);
	};
	
	// Remove
	var removeError = function(){
		$error.detach();
		$("body").trigger(ui.events.CHANGE_LAYOUT);
	};

	var checkStatus = function(){
		// Check status of my childrens
		for(var i = 0, j = that.children.length; i < j; i ++){
			// Status error (cut the flow)
			if( that.children[i].active() ){
				if ( !status ) removeError();			
				createError();
				status = false;
				return;
			};
		};

		// Status OK (with previous error)
		if ( !status ) {
			removeError();
			status = true;
		};

	};

	var validate = function(){

        that.callbacks("beforeValidate");

		// Shoot validations
		for(var i = 0, j = that.children.length; i < j; i ++){
			that.children[i].validate();
			// Issue UI-332: On validation must focus the first field with errors.
			// Doc: http://wiki.ml.com/display/ux/Mensajes+de+error
			if (i==0) that.children[i].element.focus();
		};

		checkStatus();
		
		status ? that.callbacks("onValidate") : that.callbacks("onError");  

        that.callbacks("afterValidate");
        
		return that;
	};

	var submit = function(event){

        that.prevent(event);
        
        that.callbacks("beforeSubmit");

		validate(); // Validate start
		
		if ( status ){ // Status OK
			if ( !conf.hasOwnProperty("onSubmit") ) {
				that.element.submit();
			}else{
				that.callbacks("onSubmit");
			};
		};		

        that.callbacks("afterSubmit");
        
		return that;
	};

	var clear = function(event){		
		that.prevent(event);		
		removeError();	
		for(var i = 0, j = that.children.length; i < j; i ++) that.children[i].reset(); // Reset helpers		
		
		that.callbacks("onClear");
		
		return that;
	};
	
	var reset = function(event){
		clear();
		that.element.reset(); // Reset html form native
		that.callbacks("onReset");
		
		return that;
	};


/**
 *  Protected Members
 */

	
			
/**
 *  Public Members
 */	

	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.children = that.children;
	that.public.messages = conf.messages;
	that.public.validate = function() { 
		validate(); 
		
		return that.public; 
	};
	
	that.public.submit = function() { 
		submit(); 
		
		return that.public; 
	};
	
	that.public.checkStatus = function() { 
		checkStatus(); 
		
		return that.public; 
	};
	
	that.public.getStatus = function(){
		return status;	
	};
	
	that.public.clear = function() { 
		clear(); 
		
		return that.public; 
	};
	
	that.public.reset = function() { 
		reset(); 
		
		return that.public; 
	};


/**
 *  Default event delegation
 */	

	// patch exists because the components need a trigger
	//that.$element.bind('submit', function(event){ that.prevent(event); });
	//that.$element.find(":submit").unbind('click'); // Delete all click handlers asociated to submit button >NATAN: Why?


	// Bind the submit
	that.$element.bind("submit", function(event){
		submit(event);
	});
	
	// Bind the reset
	that.$element.find(":reset, .resetForm").bind("click", function(event){ clear(event); });

	return that;
};/**
 *	Viewer
 *	@author
 *	@Contructor
 *	@return An interface object
 */
ui.viewer = function(conf){

/**
 *  Constructor
 */
	var that = this;

	conf = ui.clon(conf);
	that.conf = conf;

/**
 *  Inheritance
 */

    that = ui.controllers.call(that);
    that.parent = ui.clon(that);
	
	
/**
 *  Private Members
 */

	/**
	 * 	Viewer
	 */
	var $viewer = that.$element.addClass("ch-viewer");
	
	/**
	 * 	Showcase
	 */
	var showcase = {};
	
		showcase.wrapper = $("<div>").addClass("ch-viewer-display");
		showcase.display = $viewer.children(":first").addClass("ch-viewer-content");
		
		showcase.items = showcase.display.children();
		showcase.itemWidth = showcase.items.outerWidth();
		showcase.children = showcase.display.find("a");
		
		showcase.lens = $("<div class=\"ch-lens\">").bind("click", function(){ that.children[1].show() }).hide();
		
		showcase.wrapper
			.append( showcase.display )
			.append( showcase.lens ) // Magnifying glass
			.bind("mouseover", function(){ showcase.lens.fadeIn(400); }) // Show magnifying glass
			.bind("mouseleave", function(){ showcase.lens.fadeOut(400); }) // Hide magnifying glass			
			.appendTo( $viewer );
		
		// Position magnifying glass
		ui.positioner({
	        element: showcase.lens,
	        context: showcase.wrapper
		});
		
		// Set visual config of content
		var extraWidth = (ui.utils.html.hasClass("ie6")) ? showcase.itemWidth : 0;
		showcase.display.css("width", (showcase.children.length * showcase.itemWidth) + extraWidth );
			
		// Showcase functionality
		showcase.children.bind("click", function(event){
			that.prevent(event);
			that.children[1].show();
		});

	
	// Generic list creation
	var createList = function(type){
		var list = $("<ul>").addClass("carousel");
		
		$.each(showcase.items, function(i, e){
			var page = i + 1;
		
			var image = $("<img>").attr("src", (type == "thumb") ? $(e).children("link[rel=thumb]").attr("href") : bigImages[i]); // Thumbnails source vs. Big images source
			
			if(type == "thumb") {
				image.bind("click", function(event){
					that.prevent(event);
					that.move(page);
				});
			};
			
			$("<li>").append( image ).appendTo( list );
		});
				
		return list;
	};
		
	
	
	/**
	 * 	Thumbnails
	 */
	var thumbnails = {};
	
		thumbnails.structure = createList("thumb");
		thumbnails.children = thumbnails.structure.children();
		thumbnails.selected = 1;
		
		thumbnails.wrapper = $("<div>")
			.addClass("ch-viewer-triggers")
			.bind("mouseenter", function(){
				showcase.lens.fadeOut(400); // It hides magnifying glass
			})
			.append( thumbnails.structure )
			.appendTo( $viewer );
		
		thumbnails.carousel = that.children[0] = thumbnails.wrapper.carousel();
		
	
	
	/**
	 * 	Zoom
	 */
	var checkZoomImages = function(modal){
		
		var zoomImages = [];
		
		$.each(showcase.items, function(i, e){
			
			// Zoom image source
			var src = $(e).children("link[rel=zoom]").attr("href");
			
			// If it has not zoom, continue
			if(!src) return;
			
			var image = $("<img>")
				.attr("src", src)
				.addClass("ch-viewer-zoomed")
				.bind("click", function(){ $(this).fadeOut(); }) // Fade Out
				.bind("mousemove", function(event){ zoomMove(event); }) // Movement
				.appendTo( modal )
				.hide();
			
			var zoomMove = function(event){
				var offset = modal.offset();
				
				var diff = {
					x: image.outerWidth() / modal.outerWidth() - 1,
					y: image.outerHeight() / modal.outerHeight() - 1
				};
				
				image.css({
					left: -(event.pageX - offset.left) * diff.x + "px",
					top: -(event.pageY - offset.top) * diff.y + "px"
				});
			};
			
			// Create zoom functionality
			var zoomable = $("<a>")
				.attr("href", src)
				.addClass("ch-viewer-zoomable")
				.bind("click", function(event){
					that.prevent(event);
					zoomMove(event);
					image.fadeIn();
				}); // FadeIn
			
			// Append link to image in modal
			modal.find("img").eq(i).wrap( zoomable );
			
			// Add source to preload
			zoomImages.push(src);
		});
		
		// Preload if there are zoom images
		if(zoomImages.length > 0) ui.preload(zoomImages);
	};
	
	
	/**
	 * 	Modal
	 */
	that.children[1] = $("<div>").modal({
		content: "<div class=\"ch-viewer-modal\"></div>",
		width:600,
		onShow: function(){ // TODO: Deberia cachear el contenido para evitar recalcular todo
		
			var modalContent = $(".ch-viewer-modal");
		
			// Create list + reset position + append it
			createList("big").css("left", 0).appendTo( modalContent );
			
			// Zoom process
			checkZoomImages(modalContent);
		
			// Init carousel and move to position of item selected on thumbs
			that.children[2] = modalContent.carousel({ pager: true }).moveTo( thumbnails.selected );
			
			// Refresh modal position
			this.position("refresh");
		},
		onHide: function(){
		
			// Reset modal content
			$(".ch-viewer-modal").html("").removeClass("ch-carousel");
		
			// Thumbnails syncro (select thumb that was selected in modal)
			that.move( that.children[2].getPage() );
			
			// Delete modal instance // TODO pasar funcionalidad al object ("that.destroy"?)
			for(var i = 0, j = ui.instances.carousel.length; i < j; i += 1){
				if(ui.instances.carousel[i].element === that.children[2].element){
					ui.instances.carousel.splice(i, 1);
					return;
				};
			};
		}
	});


/**
 *  Protected Members
 */ 

	that.move = function(item){

		// Validation
		if(item > showcase.children.length || item < 1 || isNaN(item)) return that;
		
		var visibles = thumbnails.carousel.getSteps(); // Items per page
		var page = thumbnails.carousel.getPage(); // Current page
		var nextPage = Math.ceil( item / visibles ); // Page of "item"

		// Visual config
		$(thumbnails.children[thumbnails.selected - 1]).removeClass("ch-thumbnail-on"); // Disable thumbnail
		$(thumbnails.children[item - 1]).addClass("ch-thumbnail-on"); // Enable next thumbnail

		// Content movement
		var movement = { left: (-item + 1) * showcase.itemWidth };
		
		// CSS3 Transitions vs jQuery magic
		if(ui.features.transition) showcase.display.css(movement); else showcase.display.animate(movement);
		
		// Move thumbnails carousel if item selected is on another page
		if(page != nextPage) thumbnails.carousel.moveTo(nextPage);

		// Refresh selected thumb
		thumbnails.selected = item;

		// Callback
		that.callbacks("onMove");
		
		return that;
	};
	

/**
 *  Public Members
 */	

	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.children = that.children;
	that.public.moveTo = function(page){
		that.move(page);
		
		return that.public;
	};
	that.public.next = function(){
		that.move( thumbnails.selected + 1 );
		
		return that.public;
	};
	that.public.prev = function(){
		that.move( thumbnails.selected - 1 );
		
		return that.public;
	};
	
	that.public.getSelected = function(){ // Is this necesary???
		return thumbnails.selected;
	};


/**
 *  Default event delegation
 */	
	
	// Default behavior (Move to the first item and without callback)
	that.move(1);
	
	// Preload big images on document load
	var bigImages = [];
	ui.utils.window.load(function(){
		//setTimeout(function(){
			showcase.children.each(function(i, e){
				bigImages.push( $(e).attr("href") ); // Image source change
			});
			ui.preload(bigImages);
		//},250);
	});

	
	return that;
};

/**
 *	Chat Component
 *  $("#chat").chat({
 *      ruleGroupName: "",
 *      style: ["block"],
 *      template: [1],
 *      environment: "1"|"2"|"3"
 *  });
 */

ui.chat = function(conf) {
    
   	var that = ui.object(); // Inheritance

    var getDomain = function(n) {
        switch (n) {
            case "1": return "mercadolidesa.com.ar"; break;
            case "2": return "mercadolistage.com.ar"; break;
            case "3": return "mercadolibre.com.ar"; break;
        }
    }

    if (conf.msg) {
        conf.ruleGroupName = conf.msg;
    }

    that.load = function() {
        loadChatGZ(conf.ruleGroupName, conf.element.id, conf.style||"block", conf.template||"1",conf.environment||"3"); 
    }

   	ui.get({
   	    method: "component",
   	    name: "chat",
   	    script: "http://www."+getDomain(conf.environment)+"/org-img/jsapi/chat/chatRBIScript.js",
   	    callback: function() {
       	    that.load(); 
        }
   	});

    that.publish = {
    	uid: conf.uid,
		element: conf.element,
        type: conf.type
    }
    
    return that.publish;

}
/**
 *	Expando
 *	@author 
 *	@Contructor
 *	@return An interface object
 */	
ui.expando = function(conf){

/** 
 *  Constructor
 */
	
	var that = this;
	
	that.$element.addClass("ch-expando")
		.children(":first").wrapInner("<span class=\"ch-expando-trigger\"></span>");
		
    conf = ui.clon(conf);
    conf.open = conf.open || false;

	that.conf = conf;
	
/**
 *	Inheritance
 */

    that = ui.navs.call(that);
    that.parent = ui.clon(that);

/**
 *  Private Members
 */
	
	

/**
 *  Protected Members
 */ 

	that.$content = that.$element.children().eq(1);
	that.$trigger = that.$element.find(".ch-expando-trigger");
	
	that.show = function(event){
		that.prevent(event);
		
		// Toggle
		if ( that.active ) {
			return that.hide(event);
		};
		
		that.parent.show(event);
		
		return that;
	};

/**
 *  Public Members
 */
   	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;
	that.public.show = function(){
		that.show();
		
		return that.public;
	};
	
	that.public.hide = function(){
		that.hide();
		
		return that.public;
	};
	

/**
 *  Default event delegation
 */		
    
	// Trigger
	that.$trigger
		.bind('click', function(event){	that.show(event); })
		.addClass('ch-expando-trigger');
		
	// Content
	that.$content
		.bind('click', function(event){ event.stopPropagation() })		
		.addClass('ch-expando-content');

	
	// Change default behaivor (close)
	if( conf.open ) that.show();
	
    
    // Create the publish object to be returned
    conf.publish = that.publish;

	return that;

};
/**
 *	@Codelighter
 * 
 * ui.codelighter();
 * $(".xml").codeXML();
 */

ui.codelighter = function() {
/**
 *  Constructor
 */
	var that = this;
		
/**
 *  Inheritance
 */

    that = ui.controllers.call(that);
    that.parent = ui.clon(that);
	
	
/**
 *  Private Members
 */

/**
 *  Protected Members
 */ 

/**
 *  Public Members
 */
	
	that.public.uid = that.uid;
	that.public.element = that.element;
	that.public.type = that.type;	
	that.public.children = that.children;	


/**
 *  Default event delegation
 */	

	$("pre[name=code]").each(function(i, e){
		
		var codesnippet = {};
			codesnippet.uid = ui.utils.index += 1;
			codesnippet.type = "codesnippet";
			codesnippet.element = e;
			codesnippet.snippet = e.innerHTML;			

		that.children.push( ui["code" + e.className.toUpperCase()].call(codesnippet) );

	});

	ui.instances.codelighter = that.children; // Create codeligther instance
	
	return that;
};



/**
 *	@Codesnippet
 */
 
ui.codesnippet = function(conf){
/**
 *  Constructor
 */
	
	var that = this;	
	
	conf = ui.clon(conf);
	that.conf = conf;
	
		
/**
 *  Inheritance
 */

    that = ui.object.call(that);
    that.parent = ui.clon(that);
	
/**
 *  Private Members
 */

	var paint = function() {
		for (var x in conf.brush){
			if (conf.brush[ x ].test(that.paintedSnippet)) {
				that.paintedSnippet = that.paintedSnippet.replace(conf.brush[ x ], x);
			};
		};

		return that.paintedSnippet;
	};
 
/**
 *  Protected Members
 */ 

	that.paintedSnippet = that.snippet;	
			
/**
 *  Public Members
 */	

	that.public = {};
	that.public.uid = that.uid;
	that.public.type = conf.type;
	that.public.element = that.element;
	that.public.snippet = that.snippet;
	that.public.paintedSnippet = that.paintedSnippet;	

/**
 *  Default event delegation
 */		 	
	
	that.element.innerHTML = paint();
	
	return that;
};


/**
 *	@Interface xml
 *	@return An interface object
 */

ui.codeXML = function(conf) {
    
/** 
 *  Constructor: Redefine or preset component's settings
 */

	conf = conf || {};
	
	conf.type = "codeXML";

	conf.brush = {
		"&lt;": /</g, // Menor
		"&gt;": />/g , // Mayor
		"<span class='ch-comment'>$&</span>": /(\&lt;|&lt;)!--\s*.*?\s*--(\&gt;|&gt;)/g, // comments		
		"<span class='ch-attrName'>$&</span>": /(id|name|class|title|alt|value|type|style|method|href|action|lang|dir|src|tabindex|usemap|data|rel|charset|encoding|size|selected|checked|placeholder|target|required|disabled|max|min|maxlength|accesskey)=".*"/g, // Attributes name
		"<span class='ch-attrValue'>$&</span>": /".+?"/g, // Attributes
		"<span class='ch-tag'>$&</span>": /(&lt;([a-z]|\/).*?&gt;)/g, // Tag
		"    ": /\t/g // Tab
	};
    
    this.snippet = this.snippet || this.element.innerHTML;
    
    return ui.codesnippet.call(this, conf);
    
};

ui.factory({ component: 'codeXML' });



/**
 *	@Interface js
 *	@return An interface object
 */

ui.codeJS = function(conf) {
    
/** 
 *  Constructor: Redefine or preset component's settings
 */
	
	conf = conf || {};
	
	conf.type = "codeJS";
	
	conf.brush = {
		"$1 $2 $3": /(<)([a-z]|\/|.*?)(>)/g,
		"<span class='ch-operator'>$&</span>": /(\+|\-|=|\*|&|\||\%|\!|\?)/g,
		">": />amp;/g,
		"<span class='ch-atom'>$&</span>": /(false|null|true|undefined)/g,		
		"$1<span class='ch-keywords'>$2</span>$3": /(^|\s|\(|\{)(return|new|delete|throw|else|case|break|case|catch|const|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|switch|throw|try|typeof|var|void|while|with)(\s*)/g,
		"<span class='ch-attrValue'>$&</span>": /(".+?")|[0-9]/g, // Attributes & numbers
		"    ": /\t/g, // Tab
		"<span class='ch-comment'>$&</span>": /(\/\*)\s*.*\s*(\*\/)/g, // Comments
		"<span class='ch-comment'>$&</span>": /(\/\/)\s*.*\s*\n*/g // Comments
		
	};
	    
    this.snippet = this.snippet || this.element.innerHTML;
    
    return ui.codesnippet.call(this, conf);
    
};

ui.factory({ component: 'codeJS' });


/**
 *	@Interface css
 *	@return An interface object
 */

ui.codeCSS = function(conf) {
    
/** 
 *  Constructor: Redefine or preset component's settings
 */
	
	conf = conf || {};
	
	conf.type = "codeCSS";
	
	conf.brush = {
		//"<span class='ch-selector'>$&</span>": /(a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1> - <h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video|wbr|xmp)(\{*)/g, // Selectors
		"<span class='ch-comment'>$&</span>": /(\/\*)\s*.*\s*(\*\/)/g, // Comments
		"<span class='ch-attrName'>$&</span>": /(\w)\s*:".*"/g, // Attributes name
		"<span class='ch-selector'>$1$2</span>$3": /(#|\.)(\w+)({)/g, // Selectors
		"$1<span class='ch-property'>$2</span>$3": /({|;|\s)(\w*-*\w*)(\s*:)/g, // Properties
		"$1<span class='ch-attrValue'>$2</span>$3": /(:)(.+?)(;)/g, // Attributes
		"    ": /\t/g // Tab
	};
	
	this.snippet = this.snippet || this.element.innerHTML;
	
    return ui.codesnippet.call(this, conf);
    
};

ui.factory({ component: 'codeCSS' });
ui.init();
})(jQuery);