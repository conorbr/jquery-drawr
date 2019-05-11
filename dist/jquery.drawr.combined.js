/*!
* jquery.drawr.js
* https://github.com/lieuweprins/jquery-drawr
* Copyright (c) 2019 Lieuwe Prins
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
*/

(function( $ ) {
 
    $.fn.drawr = function( action, param ) {
    	var plugin = this;
    	var tspImg="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH4wUIDDYyGYFdggAAAC5JREFUOMtjfPXqFQNuICoqikeWiYECMKp5ZGhm/P//Px7p169fjwbYqGZKNAMA5EEI4kUyPZcAAAAASUVORK5CYII=";

    	plugin.distance_between = function(p1, p2) {
		  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
		};
		plugin.angle_between = function(p1, p2) {
		  return Math.atan2( p2.x - p1.x, p2.y - p1.y );
		};
		plugin.hex_to_rgb = function (hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? {
		        r: parseInt(result[1], 16),
		        g: parseInt(result[2], 16),
		        b: parseInt(result[3], 16)
		    } : null;
		};
		plugin.get_mouse_data = function (event,relativeTo,scrollEl) {//body event, but relative to other element extend with pressure later.
			if(typeof relativeTo!=="undefined" && relativeTo!==null){
				var borderTop = parseInt(window.getComputedStyle(relativeTo, null).getPropertyValue("border-top-width"));
				var borderLeft = parseInt(window.getComputedStyle(relativeTo, null).getPropertyValue("border-left-width"));
				var translate_x = typeof scrollEl!=="undefined" ? scrollEl.scrollX : 0;
				var translate_y = typeof scrollEl!=="undefined" ? scrollEl.scrollY : 0;

				var bounding_box = {
					left: relativeTo.offsetLeft - translate_x + borderLeft,
					top: relativeTo.offsetTop - translate_y + borderTop
				};
			} else {
				var bounding_box = {
					left: 0,
					top: 0 
				};			
			}
			if(event.type=="touchmove" || event.type=="touchstart"){
				var pressure = typeof event.originalEvent.touches[0].force!=="undefined" ? event.originalEvent.touches[0].force : 1;
				if(typeof event.originalEvent.touches[0].touchType!=="undefined" && event.originalEvent.touches[0].touchType=="stylus"){
					this.pen_pressure=true;
				} else {
					this.pen_pressure=false;
				}
				if(pressure==0 && this.pen_pressure==false) pressure = 1;
				return { x: (event.originalEvent.touches[0].pageX-bounding_box.left)/this.zoomFactor, y: (event.originalEvent.touches[0].pageY-bounding_box.top)/this.zoomFactor, pressure: pressure };
			} else {
				return { x: (event.pageX - bounding_box.left)/this.zoomFactor, y: (event.pageY-bounding_box.top)/this.zoomFactor, pressure: 1 };
			}
		};
		plugin.draw_hsl = function(hue,canvas){
			var ctx = canvas.getContext('2d');
			for(row=0; row<100; row++){
				var grad = ctx.createLinearGradient(0, 0, 100,0);
				grad.addColorStop(0, 'hsl('+hue+', 0%, '+(100-row)+'%)');
				grad.addColorStop(1, 'hsl('+hue+', 100%, '+(50-row/2)+'%)');
				ctx.fillStyle=grad;
				ctx.fillRect(0, row, 100, 1);
			}	
	    };
		plugin.is_dragging = false;

        plugin.bind_draw_events = function(){
        	var self=this;
        	var context = self.getContext("2d", { alpha: self.settings.enable_tranparency });
			$(self).data("is_drawing",false);$(self).data("lastx",null);$(self).data("lasty",null);
			$(self).parent().on("touchstart", function(e){ e.preventDefault(); });//cancel scroll.
			$(window).on("touchstart mousedown", function(e){
				var parent = $(self).parent()[0];
				var canvasRect = {
					left: self.offsetLeft,
					top: self.offsetTop,
					width: $(self).parent()[0].offsetWidth - parseInt(window.getComputedStyle(parent, null).getPropertyValue("border-right-width")) - parseInt(window.getComputedStyle(parent, null).getPropertyValue("border-left-width")),
					height: $(self).parent()[0].offsetHeight - parseInt(window.getComputedStyle(parent, null).getPropertyValue("border-bottom-width")) - parseInt(window.getComputedStyle(parent, null).getPropertyValue("border-top-width"))
				};
				var mouse_data = plugin.get_mouse_data.call(self,e);
				if(self.$brushToolbox.is(":visible") && mouse_data.x*self.zoomFactor>canvasRect.left && mouse_data.x*self.zoomFactor<(canvasRect.left + canvasRect.width) && mouse_data.y*self.zoomFactor>canvasRect.top && mouse_data.y*self.zoomFactor<(canvasRect.top + canvasRect.height)){//yay! We're drawing!
					if(plugin.is_dragging==false){
						mouse_data = plugin.get_mouse_data.call(self,e,$(self).parent()[0],self);
						$(self).data("is_drawing",true);
					//	alert(context.lineCap);
						context.lineCap = "round";context.lineJoin = 'round';

						//calculate alpha
	 					var calculatedAlpha = self.brushAlpha;
	 					if(self.active_brush.pressure_affects_alpha==true){
						 	calculatedAlpha = calculatedAlpha * (mouse_data.pressure * 2);
						 	if(calculatedAlpha>1) calculatedAlpha = 1;
						}
						var calculatedSize = self.active_brush.size;
	 					if(self.active_brush.pressure_affects_size==true){
						 	calculatedSize = calculatedSize * (mouse_data.pressure * 2);
						 	if(calculatedSize<1) calculatedSize = 1;
						}

						//context.lineWidth
	 					//context.globalAlpha = calculatedAlpha < 1 ? calculatedAlpha : 1;
						$(self).data("positions",[{x:mouse_data.x,y:mouse_data.y}]);
						if(typeof self.active_brush.drawStart!=="undefined") self.active_brush.drawStart.call(self,self.active_brush,context,mouse_data.x,mouse_data.y,calculatedSize,calculatedAlpha,e);
						if(typeof self.active_brush.drawSpot!=="undefined") self.active_brush.drawSpot.call(self,self.active_brush,context,mouse_data.x,mouse_data.y,calculatedSize,calculatedAlpha,e);
					}
				}
			}).on("touchmove mousemove", function(e){
				var mouse_data = plugin.get_mouse_data.call(self,e,$(self).parent()[0],self);
				if($(self).data("is_drawing")==true){
					var positions = $(self).data("positions");
					var currentSpot = {x:mouse_data.x,y:mouse_data.y};
					var lastSpot=positions[positions.length-1];
					var dist = plugin.distance_between(lastSpot, currentSpot);
 					var angle = plugin.angle_between(lastSpot, currentSpot);

 					var calculatedAlpha = self.brushAlpha;
 					if(self.active_brush.pressure_affects_alpha==true){
					 	calculatedAlpha = calculatedAlpha * (mouse_data.pressure * 2);
					 	if(calculatedAlpha>1) calculatedAlpha = 1;
					}
					var calculatedSize = self.active_brush.size;
 					if(self.active_brush.pressure_affects_size==true){
					 	calculatedSize = calculatedSize * (mouse_data.pressure * 2);
					 	if(calculatedSize<1) calculatedSize = 1;
					}

 					var stepSize = calculatedSize/6;

 					//var calculatedAlpha = self.brushAlpha * (mouse_data.pressure * 2);
 					//context.globalAlpha = calculatedAlpha < 1 ? calculatedAlpha : 1;

 					if(stepSize<1) stepSize = 1;
					for (var i = stepSize; i < dist; i+=stepSize) {//advance along the line between last spot and current spot using a^2 + b^2 = c^2 nonsense.
					    x = lastSpot.x + (Math.sin(angle) * i);
					    y = lastSpot.y + (Math.cos(angle) * i);
						if(typeof self.active_brush.drawSpot!=="undefined") self.active_brush.drawSpot.call(self,self.active_brush,context,x,y,calculatedSize,calculatedAlpha,e);
					    positions.push({x:x,y:y});
					}
					$(self).data("positions",positions);
				}
				mouse_data = plugin.get_mouse_data.call(self,e);
				$(".drawr-toolbox").each(function(){
	        		if($(this).data("dragging")==true){
	        			$(this).offset({
			                top: (mouse_data.y - $(this).data("offsety")) * self.zoomFactor,
			                left: (mouse_data.x - $(this).data("offsetx")) * self.zoomFactor
			            });
	        		}
	        	});
			}).on("touchend mouseup", function(e){
				if($(self).data("is_drawing")==true){
					var mouse_data = plugin.get_mouse_data.call(self,e,self);

 					var calculatedAlpha = self.brushAlpha;
 					if(self.active_brush.pressure_affects_alpha==true){
					 	calculatedAlpha = calculatedAlpha * (mouse_data.pressure * 2);
					 	if(calculatedAlpha>1) calculatedAlpha = 1;
					}
					var calculatedSize = self.active_brush.size;
 					if(self.active_brush.pressure_affects_size==true){
					 	calculatedSize = calculatedSize * (mouse_data.pressure * 2);
					 	if(calculatedSize<1) calculatedSize = 1;
					}

					var result=undefined;

					if(typeof self.active_brush.drawStop!=="undefined") result = self.active_brush.drawStop.call(self,self.active_brush,context,mouse_data.x,mouse_data.y,calculatedSize,calculatedAlpha,e);
					//if there is an action to undo
					if(typeof result!=="undefined"){
						self.$undoButton.css("opacity",1);
		      			self.undoStack.push({data: self.toDataURL("image/png"),current: true});
		      			if(self.undoStack.length>(self.settings.undo_max_levels+1)) self.undoStack.shift();
		      		}
	  
				}
				$(self).data("is_drawing",false).data("lastx",null).data("lasty",null);
				$(".drawr-toolbox").data("dragging", false);
				if(!plugin.is_dragging){
					if(e.target.tagName!=="INPUT"){
		    			e.preventDefault();
		    		}
	    		}
    			plugin.is_dragging=false;
			});

        };

        plugin.select_button = function(button){
        	var context = this.getContext("2d", { alpha: this.settings.enable_tranparency });
        	this.$brushToolbox.find("button.type-brush").each(function(){
        		$(this).removeClass("active");
        		$(this).css({ "background" : "#eeeeee", "color" : "#000000" });
        	});
        	$(button).css({ "background" : "orange","color" : "white" });
        	$(button).addClass("active");
        	plugin.activate_brush.call(this,$(button).data("data"));
        	/*if(typeof this.active_brush!=="undefined" && typeof this.active_brush.deactivate!=="undefined"){
				this.active_brush.deactivate.call(this,this.active_brush,context);
			}
        	this.active_brush = $(button).data("data");
			this.active_brush.activate.call(this,this.active_brush,context);*/
        };

        plugin.activate_brush = function(brush){
        	var context = this.getContext("2d", { alpha: this.settings.enable_tranparency });
        	if(typeof this.active_brush!=="undefined" && typeof this.active_brush.deactivate!=="undefined"){
				this.active_brush.deactivate.call(this,this.active_brush,context);
			}
        	this.active_brush = brush;
        	this.brushSize = typeof brush.size!=="undefined" ? brush.size : this.brushSize;
        	this.brushAlpha = typeof brush.alpha!=="undefined" ? brush.alpha : this.brushAlpha;
        	if(typeof this.$settingsToolbox!=="undefined") this.$settingsToolbox.find(".slider-alpha").val(this.brushAlpha*100).trigger("input");
        	if(typeof this.$settingsToolbox!=="undefined") this.$settingsToolbox.find(".slider-size").val(this.brushSize).trigger("input");
			this.active_brush.activate.call(this,this.active_brush,context);
        };

        /* Inserts a button into a toolbox */
        plugin.create_button = function(toolbox,type,data,css){
        	var self=this;
        	var el = $("<button style='float:left;display:block;margin:0px;'><i class='" + data.icon + "'></i></button>");
    	    el.css({ "outline" : "none", "text-align":"center","padding": "0px 0px 0px 0px","width" : "50%", "background" : "#eeeeee", "color" : "#000000","border":"0px","min-height":"30px","user-select": "none", "text-align": "center", "border-radius" : "0px" });
    		if(typeof css!=="undefined") el.css(css);
    		el.addClass("type-" + type);
        	el.data("data",data).data("type",type);
    		el.on("mousedown touchstart", function(e){
        		if($(this).data("type")=="brush") plugin.select_button.call(self,this);
        		if($(this).data("type")=="toggle") {//toggle data attribute and select effect
        			if(typeof $(this).data("state")=="undefined") $(this).data("state",false);
        			$(this).data("state",!$(this).data("state"));
        			if($(this).data("state")==true){
        				$(this).css({ "background" : "orange", "color" : "white" });
        			} else {
        				$(this).css({ "background" : "#eeeeee", "color" : "#000000" });
        			}
        		}
        		e.stopPropagation();
        		e.preventDefault();
        	});
        	$(toolbox).append(el);
        	return el;
        };

        /* create a slider */
        plugin.create_slider = function(toolbox,title,min,max,value){
        	var self=this;
		    $(toolbox).append('<div style="clear:both;font-weight:bold;text-align:center;padding:5px 0px 5px 0px">' + title + '</div><div style="clear:both;display: inline-block;width: 50px;height: 60px;margin-top:5px;padding: 0;"><input class="slider-' + title.toLowerCase() + '" value="' + value + '" style="background:transparent;width: 50px;height: 50px;margin: 0;transform-origin: 25px 25px;transform: rotate(90deg);" type="range" min="' + min + '" max="' + max + '" step="1" /><span>' + value + '</span></div>');
	    	$(toolbox).find(".slider-" + title.toLowerCase()).on("mousedown touchstart",function(e){
	    		e.stopPropagation();
	    	}).on("input",function(e){
	    		 $(this).next().text($(this).val());
	    	});
	    	return $(toolbox).find(".slider-" + title.toLowerCase());
        }

        //set some default settings. :)
        plugin.initialize_canvas = function(width,height,reset){
        	$(this).css({ "display" : "block", "user-select": "none", "webkit-touch-callout": "none" });
        	$(this).parent().css({	"overflow": "hidden", "user-select": "none", "webkit-touch-callout": "none" });
        	if(this.settings.enable_tranparency==true) $(this).css({"background-image" : "url(" + tspImg + ")"});
			this.width=width;
			this.height=height;
			
			if(reset==true){
				this.zoomFactor = 1;
				if(typeof this.$zoomToolbox!=="undefined") this.$zoomToolbox.find("input").val(100).trigger("input");
				plugin.apply_scroll.call(this,0,0,false);
				$(this).width(width);
				$(this).height(height);
			}

			$(currentCanvas).css({
    			"background-size": (20*this.zoomFactor) + "px " + (20*this.zoomFactor) + "px "
    		});

			//this.brushSize = this.settings.inital_brush_size;
			//this.brushAlpha = this.settings.inital_brush_alpha;
			this.pen_pressure = false;//switches mode once it detects.
			//TODO: fix zoomlevel slider value, update it
			//$(this).parent()[0].scrollLeft = 0;
			//$(this).parent()[0].scrollTop = 0;
			
			var context = this.getContext("2d", { alpha: this.settings.enable_tranparency });
    		if(this.settings.enable_tranparency==false){
    			context.fillStyle="white";
    			context.fillRect(0,0,width,height);
			} else {
    			context.clearRect(0,0,width,height);
			}
			//memory canvas
			var context = this.$memoryCanvas[0].getContext("2d");
			context.fillStyle="blue";
			context.fillRect(0,0,width,height);
			var parent_width = $(this).parent().innerWidth();
			var parent_height = $(this).parent().innerHeight();
			var borderTop = parseInt(window.getComputedStyle($(this).parent()[0], null).getPropertyValue("border-top-width"));
			var borderLeft = parseInt(window.getComputedStyle($(this).parent()[0], null).getPropertyValue("border-left-width"));

			this.$memoryCanvas.css({
				"z-index": 5,
				"position":"absolute",
				"width" : parent_width,
				"height" : parent_height,
				"top" : ($(this).parent().offset().top + borderTop) + "px",
				"left" : ($(this).parent().offset().left + borderLeft) + "px"
			});
			this.$memoryCanvas[0].width=parent_width;
			this.$memoryCanvas[0].height=parent_height;
			this.$memoryCanvas.width(parent_width);
			this.$memoryCanvas.height(parent_height);

        };

        plugin.draw_animations = function(){
        	var context = this.$memoryCanvas[0].getContext("2d");
        	context.clearRect(0,0,this.$memoryCanvas[0].width,this.$memoryCanvas[0].height);
 
        	if(typeof this.effectCallback!=="undefined" && this.effectCallback!==null){
        		this.effectCallback.call(this,context,this.active_brush,this.scrollX,this.scrollY,this.zoomFactor);
        	}

        	var container_width = $(this).parent().width();
        	var container_height = $(this).parent().height();

			context.globalAlpha = 0.5;//brush.currentAlpha;
			context.lineWidth = 1;
			context.lineJoin = context.lineCap = "round";
			context.strokeStyle = "black";

			//draw lines outlining canvas size

			context.beginPath(); 
			context.moveTo(0,-1-this.scrollY);
			context.lineTo(this.width,-1-this.scrollY);
			context.stroke();

    		context.beginPath(); 
			context.moveTo(0,(this.height*this.zoomFactor)-this.scrollY);
			context.lineTo(this.width,(this.height*this.zoomFactor)-this.scrollY);
			context.stroke();

			context.beginPath(); 
			context.moveTo(-1-this.scrollX,0);
			context.lineTo(-1-this.scrollX,this.height);
			context.stroke();

    		context.beginPath(); 
			context.moveTo((this.width*this.zoomFactor)-this.scrollX,0);
			context.lineTo((this.width*this.zoomFactor)-this.scrollX,this.height);
			context.stroke();

			//scroll indicators
			if(this.scrollTimer>0){

				context.globalAlpha = (0.6/100)*this.scrollTimer<1 ?  (0.6/100)*this.scrollTimer : 0.6;//brush.currentAlpha;

				this.scrollTimer-=5;
				context.lineWidth = 4;
				context.lineCap = 'square';
				context.beginPath(); 

				//horizontal
				var max_bar_width = container_width;
				var visible_scroll_x = container_width;
				if(this.scrollX<0) visible_scroll_x += this.scrollX;
				if(this.scrollX> (this.width*this.zoomFactor)-container_width) visible_scroll_x -= this.scrollX-((this.width*this.zoomFactor)-container_width);
				if(visible_scroll_x<0) visible_scroll_x = 0;	
				var percentage = 100/this.width * visible_scroll_x;
				var scroll_bar_width= max_bar_width / 100 * percentage;
				scroll_bar_width/=this.zoomFactor;
				if(scroll_bar_width<1) scroll_bar_width = 1;

				var position_percentage = (100/((this.width*this.zoomFactor)-container_width))*this.scrollX;	
				var posx=(((max_bar_width-scroll_bar_width)/100)*position_percentage);
				if(posx<0) posx=0;
				if(posx>container_width-scroll_bar_width) posx = container_width-scroll_bar_width;

				context.moveTo(posx,container_height-3);
				context.lineTo(posx+scroll_bar_width,container_height-3);
				context.stroke();

				//vertical
				var max_bar_height = container_height;
				var visible_scroll_y = container_height;
				if(this.scrollY<0) visible_scroll_y += this.scrollY;
				if(this.scrollY> (this.height*this.zoomFactor)-container_height) visible_scroll_y -= this.scrollY-((this.height*this.zoomFactor)-container_height);
				if(visible_scroll_y<0) visible_scroll_y = 0;	
				var percentage = 100/(this.height*this.zoomFactor) * visible_scroll_y;
				var scroll_bar_height= max_bar_height / 100 * percentage;
			//	scroll_bar_height/=this.zoomFactor;
				if(scroll_bar_height<1) scroll_bar_height = 1;

				var position_percentage = (100/((this.width*this.zoomFactor)-container_height))*this.scrollY;	
				var posy=(((max_bar_height-scroll_bar_height)/100)*position_percentage);
				if(posy<0) posy=0;
				if(posy>container_height-scroll_bar_height) posy = container_height-scroll_bar_height;

				context.moveTo(container_width-2,posy);
				context.lineTo(container_width-2,posy+scroll_bar_height);
				context.stroke();
			}

        	//window.requestAnimationFrame(plugin.draw_animations);
        	window.requestAnimationFrame(plugin.draw_animations.bind(this));
        };

        /* Create floating dialog and appends it hidden after the canvas */
        plugin.create_toolbox = function(id,position,title,width){
        	var self = this;
			var toolbox = document.createElement("div");
			toolbox.innerHTML="<div style='padding:5px 0px 5px 0px'>" + title + "</div>";
			toolbox.className = "drawr-toolbox drawr-toolbox-" + id;
			toolbox.ownerCanvas = self;
			$(toolbox).css({
				"position" : "absolute", "z-index" : 6, "cursor" : "move", "width" : width + "px", "height" : "auto", "color" : "#fff",
				"padding" : "2px", "background" : "linear-gradient(to bottom, rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%)", "border-radius" : "2px",
				"box-shadow" : "0px 2px 5px -2px rgba(0,0,0,0.75)",	"user-select": "none", "font-family" : "sans-serif", "font-size" :"12px", "text-align" : "center"
			});
			$(toolbox).insertAfter($(this).parent());
			$(toolbox).offset(position);
        	//$(toolbox).hide();
	        $(toolbox).on("mousedown touchstart", function(e){
	        	var ownerCanvas = this.ownerCanvas;
				var mouse_data = plugin.get_mouse_data.call(ownerCanvas,e,this);
	    		$(this).data("offsetx", mouse_data.x).data("offsety", mouse_data.y).data("dragging", true);
	    		plugin.is_dragging=true;
	    		e.preventDefault();
	    	});
			return $(toolbox);
        };

        plugin.apply_scroll = function(x,y,setTimer){
        	var self = this;
        	$(self).css("transform","translate(" + -x + "px," + -y + "px)");
        	self.scrollX = x;
        	self.scrollY = y;
        	if(setTimer==true){
        		self.scrollTimer= 250;
        	}
        };

    	if ( action == "export" ) {
	        var currentCanvas = this.first()[0];
	        var mime = typeof param=="undefined" ? "image/png" : param;
	        return currentCanvas.toDataURL(mime);
	    } 

	    if( action == "button" ){
	    	var collection = $();
	    	this.each(function() {
	    		var currentCanvas = this;
	    		var newButton = plugin.create_button.call(currentCanvas,currentCanvas.$brushToolbox[0],"action",param);
	    		collection=collection.add(newButton);
	    	});
	    	return collection;
	    }

        //Initialize canvas or calling of methods
		this.each(function() {

			var currentCanvas = this;	
			if ( action === "start") {
	            $(".drawr-toolbox").hide();
	            $(".drawr-toolbox-brush").show();
	            $(".drawr-toolbox-palette").show();
				currentCanvas.$brushToolbox.find("button:first").mousedown();	            
	        } else if ( action === "stop" ) {
	        	//reset togglers
	        	currentCanvas.$brushToolbox.find('button.type-toggle').each(function(){
					if($(this).data("state")==true){
						$(this).trigger("mousedown");
					}
				});
	            $(".drawr-toolbox").hide();
	        } else if ( action === "load" ) {
	        	var img = document.createElement("img");
	        	img.crossOrigin = "Anonymous";

	        	img.onload = function(){
	        		var context = currentCanvas.getContext("2d", { alpha: currentCanvas.settings.enable_tranparency });
	        		plugin.initialize_canvas.call(currentCanvas,img.width,img.height,true);
	        		currentCanvas.undoStack = [{data: currentCanvas.toDataURL("image/png"),current:true}];
        			context.drawImage(img,0,0);
	        	};
	        	img.src=param;
	        } else if ( action === "destroy" ) {
	        	alert("unimplemented");
	        	//$(currentCanvas).removeClass("active-drawr")
	        	//destroy toolboxes
	        	//unbind events
	        	//remove canvas css
	        	//remove properties stored on canvas
	        } else if ( typeof action == "object" || typeof action =="undefined" ){//not an action, but an init call
	        	
				if($(currentCanvas).hasClass("active-drawr")) return false;//prevent double init
				currentCanvas.className = currentCanvas.className + " active-drawr";
				$(currentCanvas).parent().addClass("drawr-container");

	        	//determine settings
		    	var defaultSettings = {
		    		"enable_tranparency" : true,
		    		"canvas_width" : $(currentCanvas).parent().innerWidth(),
		    		"canvas_height" : $(currentCanvas).parent().innerHeight(),
		    		"undo_max_levels" : 5,
		    		"color_mode" : "picker"
		    	};
	        	if(typeof action == "object") defaultSettings = Object.assign(defaultSettings, action);
	        	currentCanvas.settings = defaultSettings;

	        	//set up special effects layer
				currentCanvas.$memoryCanvas=$("<canvas class='sfx-canvas'></canvas>");
				currentCanvas.$memoryCanvas.insertBefore(currentCanvas);

				currentCanvas.plugin = plugin;

	        	//set up canvas
        		plugin.initialize_canvas.call(currentCanvas,defaultSettings.canvas_width,defaultSettings.canvas_height,true);
        		currentCanvas.undoStack = [{data:currentCanvas.toDataURL("image/png"),current:true}];
				var context = currentCanvas.getContext("2d", { alpha: defaultSettings.enable_tranparency });			
				currentCanvas.brushColor = { r: 0, g: 0, b: 0 };
				window.requestAnimationFrame(plugin.draw_animations.bind(currentCanvas));

				//brush dialog
        		currentCanvas.$brushToolbox = plugin.create_toolbox.call(currentCanvas,"brush",{ left: $(currentCanvas).parent().offset().left, top: $(currentCanvas).parent().offset().top },"Brushes",80);

        		$.fn.drawr.availableBrushes.sort(function(a,b) {return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0);} ); 

				$.each($.fn.drawr.availableBrushes,function(i,brush){
	    			plugin.create_button.call(currentCanvas,currentCanvas.$brushToolbox[0],"brush",brush);
				});
				//currentCanvas.$brushToolbox.append("<div style='clear:both;border-top:2px solid #000;' class='seperator'></div>");
	    		plugin.create_button.call(currentCanvas,currentCanvas.$brushToolbox[0],"toggle",{"icon":"mdi mdi-palette-outline mdi-24px"}).on("touchstart mousedown",function(){
	    			currentCanvas.$settingsToolbox.toggle();
	    		});
	    		plugin.create_button.call(currentCanvas,currentCanvas.$brushToolbox[0],"toggle",{"icon":"mdi mdi-magnify mdi-24px"}).on("touchstart mousedown",function(){
	    			currentCanvas.$zoomToolbox.toggle();
	    		});	    		
	    		currentCanvas.$undoButton=plugin.create_button.call(currentCanvas,currentCanvas.$brushToolbox[0],"action",{"icon":"mdi mdi-undo-variant mdi-24px"}).on("touchstart mousedown",function(){
				    if(currentCanvas.undoStack.length>0){
						if(currentCanvas.undoStack[currentCanvas.undoStack.length-1].current==true){
							currentCanvas.undoStack.pop();//ignore current version of canvas
						}
						$.each(currentCanvas.undoStack,function(i,stackitem){
							stackitem.current=false;
						});
						if(currentCanvas.undoStack.length==0) return;
						var undo = currentCanvas.undoStack.pop().data;
						var img = document.createElement("img");
						img.crossOrigin = "Anonymous";

						img.onload = function(){
							currentCanvas.plugin.initialize_canvas.call(currentCanvas,img.width,img.height,false);
							context.drawImage(img,0,0);
						};
						img.src=undo;
						if(currentCanvas.undoStack.length==0) {//don't allow stack to be emtpy.
							currentCanvas.$undoButton.css("opacity",0.5);
							currentCanvas.undoStack.push({data:undo,current:false});
						}
					}
	    		});
	    		currentCanvas.$undoButton.css("opacity",0.5);
				//color dialog
        		currentCanvas.$settingsToolbox = plugin.create_toolbox.call(currentCanvas,"settings",{ left: $(currentCanvas).parent().offset().left + $(currentCanvas).parent().innerWidth() - 80, top: $(currentCanvas).parent().offset().top },"Settings",80);

        		if(currentCanvas.settings.color_mode=="presets"){
        			var colors = ["#FFFFFF","#0074D9","#2ECC40","#FFDC00","#FF4136","#111111"];
		    		$.each(colors,function(i,color){
			    		plugin.create_button.call(currentCanvas,currentCanvas.$settingsToolbox[0],"color",{"icon":""},{"background":color}).on("touchstart mousedown",function(){
			    			currentCanvas.brushColor = plugin.hex_to_rgb(color);
							if(typeof currentCanvas.active_brush.activate!=="undefined") currentCanvas.active_brush.activate.call(currentCanvas,currentCanvas.active_brush,context);
							plugin.is_dragging=false;
			    		});
		    		});
        		}else {
	    			currentCanvas.$settingsToolbox.append("<input type='text' class='color-picker'/>");
					currentCanvas.$settingsToolbox.find('.color-picker').drawrpalette().on("choose.drawrpalette",function(event,hexcolor){
						currentCanvas.brushColor = plugin.hex_to_rgb(hexcolor);
						if(typeof currentCanvas.active_brush.activate!=="undefined") currentCanvas.active_brush.activate.call(currentCanvas,currentCanvas.active_brush,context);
					});
				}
	    		plugin.create_slider.call(currentCanvas, currentCanvas.$settingsToolbox,"alpha", 0,100,parseInt(100*defaultSettings.inital_brush_alpha)).on("input",function(){
		    		currentCanvas.brushAlpha = parseFloat(this.value/100);
		    		currentCanvas.active_brush.alpha = parseFloat(this.value/100);;
		    		plugin.is_dragging=false;
        		});
        		plugin.create_slider.call(currentCanvas, currentCanvas.$settingsToolbox,"size", 2,100,defaultSettings.inital_brush_size).on("input",function(){
		    		currentCanvas.brushSize = this.value;
		    		currentCanvas.active_brush.size = this.value;
		    		plugin.is_dragging=false;
        		});
	    		//size dialog
        		//zoom dialog
        		currentCanvas.$zoomToolbox = plugin.create_toolbox.call(currentCanvas,"zoom",{ left: $(currentCanvas).parent().offset().left + $(currentCanvas).parent().innerWidth() - 80, top: $(currentCanvas).parent().offset().top },"Zoom",80);
        		plugin.create_slider.call(currentCanvas, currentCanvas.$zoomToolbox,"zoom", 0,400,100).on("input",function(){
		    		//currentCanvas.brushAlpha = parseFloat(this.value/100);
		    		var cleaned = Math.ceil(this.value/10)*10;
		    		$(this).next().text(cleaned);
		    		var factor = (1/100)*cleaned;
		    		var zoomDiff=1+(factor-currentCanvas.zoomFactor);
		    		currentCanvas.zoomFactor = factor;
		    		$(currentCanvas).width(currentCanvas.width*factor);
		    		$(currentCanvas).height(currentCanvas.height*factor);
		    		$(currentCanvas).css({
		    			"background-size": (20*factor) + "px " + (20*factor) + "px "
		    		});
		    		if(zoomDiff!==1){
		    			plugin.apply_scroll.call(currentCanvas,currentCanvas.scrollX * zoomDiff,currentCanvas.scrollY * zoomDiff,true);
		    			//doesn't seem to work perfectly but it'll do for now
		    		}
        		});

				plugin.bind_draw_events.call(currentCanvas);
			}
		});
		return this;
 
    };

    /* Register a new brush */
    $.fn.drawr.register = function (brush){
		if(typeof $.fn.drawr.availableBrushes=="undefined") $.fn.drawr.availableBrushes=[];
		$.fn.drawr.availableBrushes.push(brush);
    };

    //go to center? do dis: plugin.apply_scroll.call(currentCanvas,((currentCanvas.width*currentCanvas.zoomFactor)-$(currentCanvas).parent().width())/2,((currentCanvas.height*currentCanvas.zoomFactor)-$(currentCanvas).parent().height())/2,true);
 
}( jQuery ));

/*!
* jquery.drawrpalette.js
* https://github.com/lieuweprins/jquery-drawrpalette
* Copyright (c) 2019 Lieuwe Prins
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
*/

(function( $ ) {
 
    $.fn.drawrpalette = function( action, param ) {
    
        var plugin = this;
        
        plugin.offset = 5;
        plugin.pickerSize = 200;
        
        plugin.get_mouse_value = function(event,$relativeTo){
            var mouse_data = {};
            if(event.type=="touchmove" || event.type=="touchstart"){
                mouse_data.x = event.originalEvent.touches[0].pageX-$relativeTo.offset().left - plugin.offset;
                mouse_data.y = event.originalEvent.touches[0].pageY-$relativeTo.offset().top - plugin.offset;
            } else {
                mouse_data.x = event.pageX-$relativeTo.offset().left - plugin.offset;
                mouse_data.y = event.pageY-$relativeTo.offset().top - plugin.offset;
            }
            
            return mouse_data;
        };
               
        plugin.rgb_to_hex = function(r, g, b) {
            var rgb = b | (g << 8) | (r << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1)
        };
        
        plugin.hex_to_rgb = function (hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? {
		        r: parseInt(result[1], 16),
		        g: parseInt(result[2], 16),
		        b: parseInt(result[3], 16)
		    } : null;
		};
        
        plugin.hsv_to_rgb = function (h, s, v) {
            var r, g, b, i, f, p, q, t;
            if (arguments.length === 1) {
                s = h.s, v = h.v, h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
        
        plugin.rgb_to_hsv = function (r, g, b) {
            if (arguments.length === 1) {
                g = r.g, b = r.b, r = r.r;
            }
            var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

            switch (max) {
                case min: h = 0; break;
                case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
                case g: h = (b - r) + d * 2; h /= 6 * d; break;
                case b: h = (r - g) + d * 4; h /= 6 * d; break;
            }

            return {
                h: h,
                s: s,
                v: v
                };
        }
        
        plugin.hsv_to_xy = function(h,s,v){
            var x = s * plugin.pickerSize + plugin.offset;
            var y = (1 - v) * plugin.pickerSize + plugin.offset;
            return { 'x' : x, 'y' : y };
        };
        
        plugin.xy_to_hsv = function(x,y){
            var s = x/plugin.pickerSize;
            var v = (plugin.pickerSize-y)/plugin.pickerSize;
            return { 's' : s, 'v' : v };
        };
            	
		plugin.draw_hsv = function(size,canvas){
            var hsv = this.hsv;          
			var ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);

            //draw hsl color space
			for(row=0; row<size; row++){
				var grad = ctx.createLinearGradient(0, 0, size,0);               
                var value = (size-row)/size;
                
                var rgb = plugin.hsv_to_rgb(hsv.h,0,value);
                grad.addColorStop(0, 'rgb('+rgb.r+', '+rgb.g+','+rgb.b+')');
                var rgb = plugin.hsv_to_rgb(hsv.h,1,value);
                grad.addColorStop(1, 'rgb('+rgb.r+', '+rgb.g+','+rgb.b+')');

				ctx.fillStyle=grad;
				ctx.fillRect(plugin.offset, row+plugin.offset, size, 1);
			}	
            //draw hue
            for(row=0; row<size; row++){
                ctx.fillStyle="hsl(" + ((360/size)*row) + ", 100%, 50%)";
                ctx.fillRect(size+plugin.offset+5, row+plugin.offset, 40, 1);
            }	
            
            ctx.fillStyle = "black";
            ctx.fillRect(size+plugin.offset+3,plugin.offset+(hsv.h * size)-3,44,6);
            ctx.fillStyle = "white";
            ctx.fillRect(size+plugin.offset+5,plugin.offset+(hsv.h * size)-1,40,2);
                        
            var pos = plugin.hsv_to_xy(this.hsv.h,this.hsv.s,this.hsv.v);
            
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "black";
            ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
            ctx.stroke();
	    };
        
        plugin.update_color = function(){
            var hsv = this.hsv;
            var rgb = plugin.hsv_to_rgb(hsv.h,hsv.s,hsv.v);
            var color="rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
            this.$button.css("background",color);
            if(hsv.v<0.5){
                this.$button.css("color","white");
            } else {
                this.$button.css("color","black");
            }
            plugin.draw_hsv.call(this,plugin.pickerSize,this.$dropdown.find("canvas")[0]);
        };
        
        plugin.update_value = function(){
            var rgb = plugin.hsv_to_rgb(this.hsv.h,this.hsv.s,this.hsv.v);
            var hex = plugin.rgb_to_hex(rgb.r, rgb.g, rgb.b);
            $(this).val(hex);
        };

        plugin.cancel = function(){
            var rgb = plugin.hex_to_rgb($(this).val());
            var hsv = plugin.rgb_to_hsv(rgb.r,rgb.g,rgb.b);
            this.hsv = hsv;
            plugin.update_color.call(this);
            $(this).trigger("cancel.drawrpalette",$(this).val());
        };
	
		this.each(function() {

			var currentPicker = this;	
			if ( action === "destroy") {
                if(!$(currentPicker).hasClass("active-drawrpalette")) return false;//can't destroy if not initialized.
                //remove event listeners
                currentPicker.$button.off("mousedown.drawrpalette touchstart.drawrpalette");
                currentPicker.$dropdown.find(".ok").off("mouseup.drawrpalette touchend.drawrpalette");
                currentPicker.$dropdown.find(".cancel").off("mouseup.drawrpalette touchend.drawrpalette");
                currentPicker.$dropdown.off("mousedown.drawrpalette touchstart.drawrpalette");
                currentPicker.$button.off("mousedown.drawrpalette touchstart.drawrpalette");
                $(window).off("mousedown.drawrpalette touchstart.drawrpalette");
                $(window).off("mousemove.drawrpalette touchmove.drawrpalette");
                $(window).off("mouseup.drawrpalette touchend.drawrpalette");
                //show original input
                $(currentPicker).show();
                //remove components
                currentPicker.$button.remove();
                currentPicker.$dropdown.remove();
                //remove wrapper...
                $(currentPicker).unwrap();
                delete currentPicker.$wrapper;
                delete currentPicker.$button;
                delete currentPicker.$dropdown;
                delete currentPicker.hsl;
                delete currentPicker.slidingHue;
                delete currentPicker.slidingHsl;
                $(currentPicker).removeClass("active-drawrpalette");
            } else if ( typeof action == "object" || typeof action =="undefined" ){//not an action, but an init call

                var inlineStyles = {};
                for (var i = 0, l = currentPicker.style.length; i < l; i++){
                    var styleProperty = currentPicker.style[i];
                    var styleValue = getComputedStyle(currentPicker, null).getPropertyValue(styleProperty);
                    inlineStyles[styleProperty]=styleValue;
                }
                var inlineClasses = currentPicker.className!=="" ? currentPicker.className.split(" ") : [];
	        	
				if($(currentPicker).hasClass("active-drawrpalette")) return false;//prevent double init
				currentPicker.className = currentPicker.className + " active-drawrpalette";

	        	//determine settings
		    	var defaultSettings = {
		    		"enable_alpha" : false,
                    "append_to" : currentPicker,
		    	};
	        	if(typeof action == "object") defaultSettings = Object.assign(defaultSettings, action);
	        	currentPicker.settings = defaultSettings;
				currentPicker.plugin = plugin;
                
                $(this).wrap("<div class='drawrpallete-wrapper'></div>");
                this.$wrapper = $(this).parent();
                this.$wrapper.css({"position":"relative","display":"inline-block"});

                $(this).hide();

                currentPicker.$button=$("<button><i class='mdi mdi-palette mdi-24px'></i></button>");
                currentPicker.$button.css({
                   "width" : "40px",
                   "height" : "40px",
                   "border" : "1px solid #333",
                   "background" : "#eee",
                   "cursor":"pointer",
                   "text-align" : "text",
                   "padding" : "0px"
                });
                currentPicker.$button.css(inlineStyles);
                $.each(inlineClasses,function(i,className){
                    currentPicker.$button.addClass(className);
                });
                this.$wrapper.append(currentPicker.$button);
                
                var canvas_height = plugin.pickerSize+(plugin.offset*2);
                var canvas_width = plugin.pickerSize+40+(plugin.offset*2)+5;
				currentPicker.$dropdown=$("<div><canvas style='display:block;' class='drawrpallete-canvas' width=" + canvas_width + " height=" + canvas_height + " style='height:" + canvas_height + "px;width:" + canvas_width + "px;'></canvas></div>");
                currentPicker.$dropdown.append('<div style="height:28px;text-align:right;margin-top:-2px;padding:0px 5px;"><button class="cancel">cancel</button><button style="margin-left:5px;width:40px;" class="ok">ok</button></div>');
				this.$wrapper.append(currentPicker.$dropdown);
                currentPicker.$dropdown.css({
                   "background" : "#eee",
                   "width" : canvas_width + "px",
                   "height" : (canvas_height+ 28) + "px",
                   "position" : "absolute",
                   "z-index" : 8
                });
                
                currentPicker.$dropdown.find(".ok").css("color","black").on("mouseup.drawrpalette touchend.drawrpalette",function(){
                    plugin.update_value.call(currentPicker);
                    $(currentPicker).trigger("choose.drawrpalette",$(currentPicker).val());
                    currentPicker.$dropdown.hide();
                    $(currentPicker).trigger("close.drawrpalette");
                });
                
                currentPicker.$dropdown.find(".cancel").css("color","black").on("mouseup.drawrpalette touchend.drawrpalette",function(){
                    plugin.cancel.call(currentPicker);
                    currentPicker.$dropdown.hide();
                    $(currentPicker).trigger("close.drawrpalette");
                });
                
                currentPicker.$dropdown.on("mousedown.drawrpalette touchstart.drawrpalette",function(e){
                    var mouse_data = plugin.get_mouse_value(e,currentPicker.$dropdown);
                    if(mouse_data.x>0 && mouse_data.x<plugin.pickerSize && mouse_data.y>0 && mouse_data.y<plugin.pickerSize){
                        currentPicker.slidingHsl=true;
                        var hsv = plugin.xy_to_hsv(mouse_data.x,mouse_data.y);
                        currentPicker.hsv.s=hsv.s;
                        currentPicker.hsv.v=hsv.v;
                        plugin.update_color.call(currentPicker);
                        var rgb = plugin.hsv_to_rgb.call(currentPicker,currentPicker.hsv.h,currentPicker.hsv.s,currentPicker.hsv.v);
                        var hex = plugin.rgb_to_hex.call(currentPicker,rgb.r,rgb.g,rgb.b);
                        $(currentPicker).trigger("preview.drawrpalette",hex);
                    } else if(mouse_data.x>plugin.pickerSize+5 && mouse_data.x<plugin.pickerSize+45 && mouse_data.y>0 && mouse_data.y<plugin.pickerSize){
                        currentPicker.slidingHue=true;
                        var hue=parseFloat(1/plugin.pickerSize)*(mouse_data.y);
                        currentPicker.hsv.h=hue;
                        plugin.update_color.call(currentPicker);
                        var rgb = plugin.hsv_to_rgb.call(currentPicker,currentPicker.hsv.h,currentPicker.hsv.s,currentPicker.hsv.v);
                        var hex = plugin.rgb_to_hex.call(currentPicker,rgb.r,rgb.g,rgb.b);
                        $(currentPicker).trigger("preview.drawrpalette",hex);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
				currentPicker.$dropdown.hide();
               
                currentPicker.$button.on("mousedown.drawrpalette touchstart.drawrpalette",function(e){
                    currentPicker.slidingHue=false;
                    currentPicker.slidingHsl=false;
                    currentPicker.$dropdown.show();
                    var rgb = plugin.hex_to_rgb($(currentPicker).val());
                    var hsv = plugin.rgb_to_hsv(rgb.r,rgb.g,rgb.b);
                    currentPicker.hsv = hsv;
                    plugin.update_color.call(currentPicker);
                    $(currentPicker).trigger("open.drawrpalette");
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                $(window).on("mousedown.drawrpalette touchstart.drawrpalette",function(){
                    if(currentPicker.$dropdown.is(":visible")){
                        plugin.cancel.call(currentPicker);
                        currentPicker.$dropdown.hide();
                        $(currentPicker).trigger("close.drawrpalette");    
                    }
                });

                $(window).on("mousemove.drawrpalette touchmove.drawrpalette",function(e){
                    var ctx = currentPicker.$dropdown.find("canvas")[0].getContext("2d");
                    var mouse_data = plugin.get_mouse_value(e,currentPicker.$dropdown);                   
                    if(mouse_data.y>plugin.pickerSize) mouse_data.y=plugin.pickerSize;
                    if(mouse_data.y<0) mouse_data.y=0;
                    if(mouse_data.x<0) mouse_data.x=0;
                    if(currentPicker.slidingHsl==true){
                        if(mouse_data.x>plugin.pickerSize) mouse_data.x=plugin.pickerSize;
                        var hsv = plugin.xy_to_hsv(mouse_data.x,mouse_data.y);
                        currentPicker.hsv.s=hsv.s;
                        currentPicker.hsv.v=hsv.v;
                        plugin.update_color.call(currentPicker);
                        var rgb = plugin.hsv_to_rgb.call(currentPicker,currentPicker.hsv.h,currentPicker.hsv.s,currentPicker.hsv.v);
                        var hex = plugin.rgb_to_hex.call(currentPicker,rgb.r,rgb.g,rgb.b);
                        $(currentPicker).trigger("preview.drawrpalette",hex);
                    } else if(currentPicker.slidingHue==true){
                        var hue=parseFloat(1/plugin.pickerSize)*(mouse_data.y);
                        currentPicker.hsv.h=hue;
                        plugin.update_color.call(currentPicker);
                        var rgb = plugin.hsv_to_rgb.call(currentPicker,currentPicker.hsv.h,currentPicker.hsv.s,currentPicker.hsv.v);
                        var hex = plugin.rgb_to_hex.call(currentPicker,rgb.r,rgb.g,rgb.b);
                        $(currentPicker).trigger("preview.drawrpalette",hex);
                    }
                });
                            
                $(window).on("mouseup.drawrpalette touchend.drawrpalette",function(){
                    currentPicker.slidingHue=false;
                    currentPicker.slidingHsl=false;
                });

                if($(this).val()!==""){
                    var rgb = plugin.hex_to_rgb($(this).val());
                    var hsv = plugin.rgb_to_hsv(rgb.r,rgb.g,rgb.b);
                    currentPicker.hsv = hsv;
                    plugin.update_color.call(currentPicker);
                } else {
                    currentPicker.hsv = { "h" : 0, "s" : 0, "v" : 0 };
                    $(this).val("#000000");
                    plugin.update_color.call(currentPicker);
                }
                
            }
		});
		return this;
 
    };

}( jQuery ));

jQuery.fn.drawr.register({
	icon: "mdi mdi-spray mdi-24px",
	name: "airbrush",
	size: 40,
	alpha: 0.2,
	order: 3,
	pressure_affects_alpha: true,
	pressure_affects_size: false,
	activate: function(brush,context){},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		context.globalAlpha = alpha;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		var self = this;
		context.globalAlpha = alpha;
		var radgrad = context.createRadialGradient(x,y,0,x,y,this.brushSize/2);//non zero values for the gradient break globalAlpha unfortunately.
		radgrad.addColorStop(0, 'rgb(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ')');
		radgrad.addColorStop(0.5, 'rgba(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ',0.5)');
		radgrad.addColorStop(1, 'rgba(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ',0)');
		context.fillStyle = radgrad;
		context.fillRect(x-(self.brushSize/2), y-(self.brushSize/2), self.brushSize, self.brushSize);
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-brush mdi-24px",
	name: "pen",
	size: 6,
	alpha: 0.5,
	order: 4,
	pressure_affects_alpha: true,
	pressure_affects_size: true,
	activate: function(brush,context){},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		context.globalAlpha = alpha;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		var self=  this;
		context.globalAlpha = alpha;
		var radgrad = context.createRadialGradient(x,y,0,x,y,size/2);//non zero values for the gradient break globalAlpha unfortunately.
		radgrad.addColorStop(0, 'rgb(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ')');
		radgrad.addColorStop(0.5, 'rgba(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ',0.5)');
		radgrad.addColorStop(1, 'rgba(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ',0)');
		context.fillStyle = radgrad;
		context.fillRect(x-(size/2), y-(size/2), size, size);
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-eraser mdi-24px",
	name: "eraser",
	size: 10,
	alpha: 0.8,
	order: 5,
	pressure_affects_alpha: true,
	pressure_affects_size: true,
	activate: function(brush,context){},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		if(this.settings.enable_tranparency==true){
			context.globalCompositeOperation="destination-out";
		} else {
			context.globalCompositeOperation="source-over";
		}
		context.globalAlpha = alpha;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		var self = this;
		context.globalAlpha = alpha;
		if(self.settings.enable_tranparency==true){
			var radgrad = context.createRadialGradient(x,y,0,x,y,size/2);//non zero values for the gradient break globalAlpha unfortunately.
			radgrad.addColorStop(0, '#000');
			radgrad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
			radgrad.addColorStop(1, 'rgba(0,0,0,0)');
			context.fillStyle = radgrad;
			context.fillRect(x-(size/2), y-(size/2), size, size);
		} else {
	    	context.fillStyle = 'white';
			context.beginPath();
			context.arc(x,y, size/2, 0, 2 * Math.PI);
			context.fill();
		}
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-eyedropper mdi-24px",
	name: "pen",
	order: 6,
	activate: function(brush,context){},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,event){},
	drawSpot: function(brush,context,x,y,pressure,event) {
		var self = this;
		var raw = context.getImageData(x, y, 1, 1).data; 
		self.brushColor={ r: raw[0], g: raw[1], b: raw[2]};
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-square mdi-24px",
	name: "filledsquare",
	size: 3,
	alpha: 1,
	order: 8,
	pressure_affects_alpha: false,
	pressure_affects_size: false,
	activate: function(brush,context){

	},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		brush.currentAlpha = alpha;
		brush.startPosition = {
			"x" : x,
			"y" : y
		};
		this.effectCallback = brush.effectCallback;
		context.globalAlpha=alpha;
		context.lineWidth = size;
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		context.globalAlpha=alpha;
		context.lineJoin = 'miter';
		context.lineWidth = size;
		context.fillStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";
		context.fillRect(brush.startPosition.x,brush.startPosition.y,brush.currentPosition.x-brush.startPosition.x,brush.currentPosition.y-brush.startPosition.y);

		this.effectCallback = null;
		return true;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		brush.currentPosition = {
			"x" : x,
			"y" : y
		};
	},
	effectCallback: function(context,brush,adjustx,adjusty,adjustzoom){
		context.globalAlpha=brush.currentAlpha;
		context.lineJoin = 'miter';
		//context.lineWidth = this.brushSize;
		context.fillStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";
		context.fillRect((brush.startPosition.x*adjustzoom)-adjustx,(brush.startPosition.y*adjustzoom)-adjusty,(brush.currentPosition.x-brush.startPosition.x)*adjustzoom,(brush.currentPosition.y-brush.startPosition.y)*adjustzoom);
	}
});

//effectCallback
jQuery.fn.drawr.register({
	icon: "mdi mdi-marker mdi-24px",
	name: "marker",
	size: 15,
	alpha: 0.3,
	order: 10,
	pressure_affects_alpha: false,
	pressure_affects_size: false,
	activate: function(brush,context){

	},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		brush.currentAlpha = alpha;
		brush.startPosition = {
			"x" : x,
			"y" : y
		};
		this.effectCallback = brush.effectCallback;
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		context.globalAlpha=alpha;
		
		brush.currentSize = size;
		brush.currentAlpha = alpha;

		this.effectCallback = null;
		context.lineWidth = size;
		context.lineJoin = context.lineCap = "round";
		context.strokeStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";

		context.beginPath(); 
		var positions = $(this).data("positions");
		$.each(positions,function(i,position){
			if(i>0){
				context.moveTo(positions[i-1].x,positions[i-1].y);
				context.lineTo(position.x,position.y);
			}
		});
		context.stroke();
		return true;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		brush.currentSize = size;
		brush.currentAlpha = alpha;
		brush.currentPosition = {
			"x" : x,
			"y" : y
		};
	},
	effectCallback: function(context,brush,adjustx,adjusty,adjustzoom){

		context.globalAlpha = brush.currentAlpha;//brush.currentAlpha;
		context.lineWidth = brush.currentSize*adjustzoom;
		context.lineJoin = context.lineCap = "round";
		context.strokeStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";

		context.beginPath(); 
		var positions = $(this).data("positions");
		$.each(positions,function(i,position){
			if(i>0){
				context.moveTo((positions[i-1].x*adjustzoom)-adjustx,(positions[i-1].y*adjustzoom)-adjusty);
				context.lineTo((position.x*adjustzoom)-adjustx,(position.y*adjustzoom)-adjusty);
			}
		});
		context.stroke();

	}
});

//effectCallback
jQuery.fn.drawr.register({
	icon: "mdi mdi-cursor-move mdi-24px",
	name: "move",
	order: 9,
	activate: function(brush,context){
		$(this).parent().css({"cursor":"move"});//"overflow":"scroll",
	},
	deactivate: function(brush,context){
	    $(this).parent().css({"cursor":"default"});//"overflow":"hidden",
	},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		brush.dragStartX=null;brush.scrollStartX=null;
		brush.dragStartY=null;brush.scrollStartY=null;

		if(event.type=="touchmove" || event.type=="touchstart"){
			x = event.originalEvent.touches[0].pageX;
			Y = event.originalEvent.touches[0].pageY;
		} else {
			x = event.pageX;
			y = event.pageY;
		}

		brush.dragStartX=x;
		brush.scrollStartX=this.scrollX;
		brush.dragStartY=y;
		brush.scrollStartY=this.scrollY;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		var self = this;

		if(event.type=="touchmove" || event.type=="touchstart"){
			x = event.originalEvent.touches[0].pageX;
			Y = event.originalEvent.touches[0].pageY;
		} else {
			x = event.pageX;
			y = event.pageY;
		}

		var diffx = parseInt(-(x - brush.dragStartX));
		var diffy = parseInt(-(y - brush.dragStartY));

		self.plugin.apply_scroll.call(self,brush.scrollStartX + diffx,brush.scrollStartY + diffy,true);
		//$(this).parent()[0].scrollLeft = brush.scrollStartX + diffx;
		//$(this).parent()[0].scrollTop = brush.scrollStartY + diffy;
	}
});

jQuery.fn.drawr.register({
	icon: "mdi mdi-fountain-pen-tip mdi-24px",
	name: "pen",
	size: 3,
	alpha: 1,
	order: 2,
	pressure_affects_alpha: false,
	pressure_affects_size: true,
	activate: function(brush,context){},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		context.globalAlpha=alpha;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		var self = this;
		context.globalAlpha=alpha;
    	context.fillStyle = 'rgb(' + self.brushColor.r + ',' + self.brushColor.g + ',' + self.brushColor.b + ')';
		context.beginPath();
		context.arc(x,y, size/2, 0, 2 * Math.PI);
		context.fill();
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-lead-pencil mdi-24px",
	name: "pencil",
	size: 5,
	alpha: 0.8,
	order: 1,
	pressure_affects_alpha: true,
	pressure_affects_size: false,
	activate: function(brush,context){
		var self = this;
		brush.brushImage = new Image();
	    brush.brushImage.crossOrigin = "Anonymous";
		brush.brushImage.onload = function(){
			//create offscceen buffer.
			var buffer = document.createElement('canvas');
			var bctx = buffer.getContext("2d");
			buffer.width = brush.brushImage.width;
			buffer.height = brush.brushImage.height;
			//fill buffer with color
			bctx.fillStyle = "rgb(" + self.brushColor.r + "," + self.brushColor.g + "," + self.brushColor.b + ")";
            bctx.fillRect(0,0,buffer.width,buffer.height);
            bctx.globalCompositeOperation = "destination-atop";
            bctx.drawImage(brush.brushImage,0,0);
            brush.brushImage = buffer;
		};
		brush.brushImage.src = 'images/lead-pencil.png';//'pencil.png';
	},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		context.globalAlpha = alpha;
	},
	drawRotatedImage: function (context, image, x, y, angle, size) {
		context.save();
		context.translate(x,y);
		var randomAngle = (Math.random()*360)+1;
		context.rotate(randomAngle * Math.PI / 180); 
		if(image.width>=image.height){
			var imageHeight=image.height/(image.width/size);
			var imageWidth=size;
		} else {
			var imageWidth=image.width/(image.height/size)
			var imageHeight=size;
		}
		var destx=-imageWidth/2;
		var desty=-imageHeight/2;
		context.drawImage(image,destx,desty,imageWidth,imageHeight);
	    context.restore();
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		context.globalAlpha = alpha;
		brush.drawRotatedImage(context,brush.brushImage,x,y,0,size);
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	}
});
jQuery.fn.drawr.register({
	icon: "mdi mdi-vector-square mdi-24px",
	name: "square",
	size: 3,
	alpha: 1,
	order: 7,
	pressure_affects_alpha: false,
	pressure_affects_size: false,
	activate: function(brush,context){

	},
	deactivate: function(brush,context){},
	drawStart: function(brush,context,x,y,size,alpha,event){
		context.globalCompositeOperation="source-over";
		brush.currentAlpha = alpha;
		brush.currentSize = size;
		brush.startPosition = {
			"x" : x,
			"y" : y
		};
		this.effectCallback = brush.effectCallback;
		context.globalAlpha=alpha;
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		context.globalAlpha=alpha;
		context.lineJoin = 'miter';
		context.lineWidth = size;
		context.strokeStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";
		context.strokeRect(brush.startPosition.x,brush.startPosition.y,brush.currentPosition.x-brush.startPosition.x,brush.currentPosition.y-brush.startPosition.y);

		this.effectCallback = null;
		return true;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		brush.currentPosition = {
			"x" : x,
			"y" : y
		};
	},
	effectCallback: function(context,brush,adjustx,adjusty,adjustzoom){
		context.globalAlpha = brush.currentAlpha;//brush.currentAlpha;
		context.lineWidth = brush.currentSize*adjustzoom;
		context.lineJoin = 'miter';
		context.strokeStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";
		context.strokeRect((brush.startPosition.x*adjustzoom)-adjustx,(brush.startPosition.y*adjustzoom)-adjusty,(brush.currentPosition.x-brush.startPosition.x)*adjustzoom,(brush.currentPosition.y-brush.startPosition.y)*adjustzoom);
	}
});

//effectCallback
jQuery.fn.drawr.register({
	icon: "mdi mdi-format-text mdi-24px",
	name: "text",
	size: 22,
	alpha: 1,
	order: 22,
	pressure_affects_alpha: false,
	pressure_affects_size: false,
	activate: function(brush,context){
		
	},
	deactivate: function(brush,context){
		if(typeof brush.$floatyBox!=="undefined"){
			brush.$floatyBox.remove();
			delete brush.$floatyBox;
		}
	},
	drawStart: function(brush,context,x,y,size,alpha,event){
		var self=this;
		brush.currentPosition = {
			"x" : x,
			"y" : y
		};
		context.globalAlpha=alpha
		if(typeof brush.$floatyBox=="undefined"){
			var fontSizeForDisplay= parseInt(20 * self.zoomFactor);
			brush.$floatyBox = $('<div style="z-index:6;position:absolute;width:100px;height:20px;"><input style="background:transparent;border:0px;padding:0px;font-size:' + fontSizeForDisplay + 'px;font-family:sans-serif;" type="text" value=""><button class="ok"><i class="mdi mdi-check"></i></button><button class="cancel"><i class="mdi mdi-close"></i></button></div>');
			$(brush.$floatyBox).insertAfter($(this).parent());
			brush.$floatyBox.css({
				left: $(this).parent().offset().left + (x*self.zoomFactor) - this.scrollX,
				top: $(this).parent().offset().top + (y*self.zoomFactor) - this.scrollY,
			});
			brush.$floatyBox.find("input").on("mousedown touchstart",function(e){
				e.preventDefault();
				e.stopPropagation();
				brush.$floatyBox.find("input").focus();
			});
			brush.$floatyBox.find("input").focus();
			event.preventDefault();
			event.stopPropagation();
			brush.$floatyBox.find(".ok").on("mousedown touchstart",function(e){
				e.preventDefault();
				e.stopPropagation();
				brush.applyText.call(self,context,brush,brush.currentPosition.x,brush.currentPosition.y,brush.$floatyBox.find("input").val());
				brush.$floatyBox.remove();
				delete brush.$floatyBox;
			});
			brush.$floatyBox.find(".cancel").on("mousedown touchstart",function(e){
				e.preventDefault();
				e.stopPropagation();
				brush.$floatyBox.remove();
				delete brush.$floatyBox;
			});
		} else {
			brush.$floatyBox.css({
				left: $(this).parent().offset().left + (x*self.zoomFactor) - this.scrollX,
				top: $(this).parent().offset().top + (y*self.zoomFactor) - this.scrollY,
			});
		}
	},
	applyText: function(context,brush,x,y,text){
		context.font = "20px sans-serif";
		context.textAlign = "left"; 
		context.fillStyle = "rgb(" + this.brushColor.r + "," + this.brushColor.g + "," + this.brushColor.b + ")";
		context.fillText(text, x-2, y+19);
	},
	drawStop: function(brush,context,x,y,size,alpha,event){
		return true;
	},
	drawSpot: function(brush,context,x,y,size,alpha,event) {
		brush.currentPosition = {
			"x" : x,
			"y" : y
		};
		if(typeof brush.$floatyBox=="undefined"){

		} else {
			brush.$floatyBox.css({
				left: $(this).parent().offset().left + (x*this.zoomFactor) - this.scrollX,
				top: $(this).parent().offset().top + (y*this.zoomFactor) - this.scrollY,
			});
		}
	}
});

//effectCallback