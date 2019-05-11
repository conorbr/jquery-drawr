!function(t){t.fn.drawr=function(e,o){var r=this;if(r.distance_between=function(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))},r.angle_between=function(t,e){return Math.atan2(e.x-t.x,e.y-t.y)},r.hex_to_rgb=function(t){var e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null},r.get_mouse_data=function(t,e,o){if(null!=e)var r=parseInt(window.getComputedStyle(e,null).getPropertyValue("border-top-width")),a=parseInt(window.getComputedStyle(e,null).getPropertyValue("border-left-width")),i=void 0!==o?o.scrollX:0,s=void 0!==o?o.scrollY:0,n={left:e.offsetLeft-i+a,top:e.offsetTop-s+r};else n={left:0,top:0};if("touchmove"==t.type||"touchstart"==t.type){var l=void 0!==t.originalEvent.touches[0].force?t.originalEvent.touches[0].force:1;return void 0!==t.originalEvent.touches[0].touchType&&"stylus"==t.originalEvent.touches[0].touchType?this.pen_pressure=!0:this.pen_pressure=!1,0==l&&0==this.pen_pressure&&(l=1),{x:(t.originalEvent.touches[0].pageX-n.left)/this.zoomFactor,y:(t.originalEvent.touches[0].pageY-n.top)/this.zoomFactor,pressure:l}}return{x:(t.pageX-n.left)/this.zoomFactor,y:(t.pageY-n.top)/this.zoomFactor,pressure:1}},r.draw_hsl=function(t,e){var o=e.getContext("2d");for(row=0;row<100;row++){var r=o.createLinearGradient(0,0,100,0);r.addColorStop(0,"hsl("+t+", 0%, "+(100-row)+"%)"),r.addColorStop(1,"hsl("+t+", 100%, "+(50-row/2)+"%)"),o.fillStyle=r,o.fillRect(0,row,100,1)}},r.is_dragging=!1,r.bind_draw_events=function(){var e=this,o=e.getContext("2d",{alpha:e.settings.enable_tranparency});t(e).data("is_drawing",!1),t(e).data("lastx",null),t(e).data("lasty",null),t(e).parent().on("touchstart",function(t){t.preventDefault()}),t(window).on("touchstart mousedown",function(a){var i=t(e).parent()[0],s=e.offsetLeft,n=e.offsetTop,l=t(e).parent()[0].offsetWidth-parseInt(window.getComputedStyle(i,null).getPropertyValue("border-right-width"))-parseInt(window.getComputedStyle(i,null).getPropertyValue("border-left-width")),h=t(e).parent()[0].offsetHeight-parseInt(window.getComputedStyle(i,null).getPropertyValue("border-bottom-width"))-parseInt(window.getComputedStyle(i,null).getPropertyValue("border-top-width")),c=r.get_mouse_data.call(e,a);if(e.$brushToolbox.is(":visible")&&c.x*e.zoomFactor>s&&c.x*e.zoomFactor<s+l&&c.y*e.zoomFactor>n&&c.y*e.zoomFactor<n+h&&0==r.is_dragging){c=r.get_mouse_data.call(e,a,t(e).parent()[0],e),t(e).data("is_drawing",!0),o.lineCap="round",o.lineJoin="round";var d=e.brushAlpha;1==e.active_brush.pressure_affects_alpha&&(d*=2*c.pressure)>1&&(d=1);var u=e.active_brush.size;1==e.active_brush.pressure_affects_size&&(u*=2*c.pressure)<1&&(u=1),t(e).data("positions",[{x:c.x,y:c.y}]),void 0!==e.active_brush.drawStart&&e.active_brush.drawStart.call(e,e.active_brush,o,c.x,c.y,u,d,a),void 0!==e.active_brush.drawSpot&&e.active_brush.drawSpot.call(e,e.active_brush,o,c.x,c.y,u,d,a)}}).on("touchmove mousemove",function(a){var i=r.get_mouse_data.call(e,a,t(e).parent()[0],e);if(1==t(e).data("is_drawing")){var s=t(e).data("positions"),n={x:i.x,y:i.y},l=s[s.length-1],h=r.distance_between(l,n),c=r.angle_between(l,n),d=e.brushAlpha;1==e.active_brush.pressure_affects_alpha&&(d*=2*i.pressure)>1&&(d=1);var u=e.active_brush.size;1==e.active_brush.pressure_affects_size&&(u*=2*i.pressure)<1&&(u=1);var p=u/6;p<1&&(p=1);for(var f=p;f<h;f+=p)x=l.x+Math.sin(c)*f,y=l.y+Math.cos(c)*f,void 0!==e.active_brush.drawSpot&&e.active_brush.drawSpot.call(e,e.active_brush,o,x,y,u,d,a),s.push({x:x,y:y});t(e).data("positions",s)}i=r.get_mouse_data.call(e,a),t(".drawr-toolbox").each(function(){1==t(this).data("dragging")&&t(this).offset({top:(i.y-t(this).data("offsety"))*e.zoomFactor,left:(i.x-t(this).data("offsetx"))*e.zoomFactor})})}).on("touchend mouseup",function(a){if(1==t(e).data("is_drawing")){var i=r.get_mouse_data.call(e,a,e),s=e.brushAlpha;1==e.active_brush.pressure_affects_alpha&&(s*=2*i.pressure)>1&&(s=1);var n=e.active_brush.size;1==e.active_brush.pressure_affects_size&&(n*=2*i.pressure)<1&&(n=1);var l=void 0;void 0!==e.active_brush.drawStop&&(l=e.active_brush.drawStop.call(e,e.active_brush,o,i.x,i.y,n,s,a)),void 0!==l&&(e.$undoButton.css("opacity",1),e.undoStack.push({data:e.toDataURL("image/png"),current:!0}),e.undoStack.length>e.settings.undo_max_levels+1&&e.undoStack.shift())}t(e).data("is_drawing",!1).data("lastx",null).data("lasty",null),t(".drawr-toolbox").data("dragging",!1),r.is_dragging||"INPUT"!==a.target.tagName&&a.preventDefault(),r.is_dragging=!1})},r.select_button=function(e){this.getContext("2d",{alpha:this.settings.enable_tranparency});this.$brushToolbox.find("button.type-brush").each(function(){t(this).removeClass("active"),t(this).css({background:"#eeeeee",color:"#000000"})}),t(e).css({background:"orange",color:"white"}),t(e).addClass("active"),r.activate_brush.call(this,t(e).data("data"))},r.activate_brush=function(t){var e=this.getContext("2d",{alpha:this.settings.enable_tranparency});void 0!==this.active_brush&&void 0!==this.active_brush.deactivate&&this.active_brush.deactivate.call(this,this.active_brush,e),this.active_brush=t,this.brushSize=void 0!==t.size?t.size:this.brushSize,this.brushAlpha=void 0!==t.alpha?t.alpha:this.brushAlpha,void 0!==this.$settingsToolbox&&this.$settingsToolbox.find(".slider-alpha").val(100*this.brushAlpha).trigger("input"),void 0!==this.$settingsToolbox&&this.$settingsToolbox.find(".slider-size").val(this.brushSize).trigger("input"),this.active_brush.activate.call(this,this.active_brush,e)},r.create_button=function(e,o,a,i){var s=this,n=t("<button style='float:left;display:block;margin:0px;'><i class='"+a.icon+"'></i></button>");return n.css({outline:"none","text-align":"center",padding:"0px 0px 0px 0px",width:"50%",background:"#eeeeee",color:"#000000",border:"0px","min-height":"30px","user-select":"none","text-align":"center","border-radius":"0px"}),void 0!==i&&n.css(i),n.addClass("type-"+o),n.data("data",a).data("type",o),n.on("mousedown touchstart",function(e){"brush"==t(this).data("type")&&r.select_button.call(s,this),"toggle"==t(this).data("type")&&(void 0===t(this).data("state")&&t(this).data("state",!1),t(this).data("state",!t(this).data("state")),1==t(this).data("state")?t(this).css({background:"orange",color:"white"}):t(this).css({background:"#eeeeee",color:"#000000"})),e.stopPropagation(),e.preventDefault()}),t(e).append(n),n},r.create_slider=function(e,o,r,a,i){return t(e).append('<div style="clear:both;font-weight:bold;text-align:center;padding:5px 0px 5px 0px">'+o+'</div><div style="clear:both;display: inline-block;width: 50px;height: 60px;margin-top:5px;padding: 0;"><input class="slider-'+o.toLowerCase()+'" value="'+i+'" style="background:transparent;width: 50px;height: 50px;margin: 0;transform-origin: 25px 25px;transform: rotate(90deg);" type="range" min="'+r+'" max="'+a+'" step="1" /><span>'+i+"</span></div>"),t(e).find(".slider-"+o.toLowerCase()).on("mousedown touchstart",function(t){t.stopPropagation()}).on("input",function(e){t(this).next().text(t(this).val())}),t(e).find(".slider-"+o.toLowerCase())},r.initialize_canvas=function(e,o,i){t(this).css({display:"block","user-select":"none","webkit-touch-callout":"none"}),t(this).parent().css({overflow:"hidden","user-select":"none","webkit-touch-callout":"none"}),1==this.settings.enable_tranparency&&t(this).css({"background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH4wUIDDYyGYFdggAAAC5JREFUOMtjfPXqFQNuICoqikeWiYECMKp5ZGhm/P//Px7p169fjwbYqGZKNAMA5EEI4kUyPZcAAAAASUVORK5CYII=)"}),this.width=e,this.height=o,1==i&&(this.zoomFactor=1,void 0!==this.$zoomToolbox&&this.$zoomToolbox.find("input").val(100).trigger("input"),r.apply_scroll.call(this,0,0,!1),t(this).width(e),t(this).height(o)),t(a).css({"background-size":20*this.zoomFactor+"px "+20*this.zoomFactor+"px "}),this.pen_pressure=!1;var s=this.getContext("2d",{alpha:this.settings.enable_tranparency});0==this.settings.enable_tranparency?(s.fillStyle="white",s.fillRect(0,0,e,o)):s.clearRect(0,0,e,o),(s=this.$memoryCanvas[0].getContext("2d")).fillStyle="blue",s.fillRect(0,0,e,o);var n=t(this).parent().innerWidth(),l=t(this).parent().innerHeight(),h=parseInt(window.getComputedStyle(t(this).parent()[0],null).getPropertyValue("border-top-width")),c=parseInt(window.getComputedStyle(t(this).parent()[0],null).getPropertyValue("border-left-width"));this.$memoryCanvas.css({"z-index":5,position:"absolute",width:n,height:l,top:t(this).parent().offset().top+h+"px",left:t(this).parent().offset().left+c+"px"}),this.$memoryCanvas[0].width=n,this.$memoryCanvas[0].height=l,this.$memoryCanvas.width(n),this.$memoryCanvas.height(l)},r.draw_animations=function(){var e=this.$memoryCanvas[0].getContext("2d");e.clearRect(0,0,this.$memoryCanvas[0].width,this.$memoryCanvas[0].height),void 0!==this.effectCallback&&null!==this.effectCallback&&this.effectCallback.call(this,e,this.active_brush,this.scrollX,this.scrollY,this.zoomFactor);var o=t(this).parent().width(),a=t(this).parent().height();if(e.globalAlpha=.5,e.lineWidth=1,e.lineJoin=e.lineCap="round",e.strokeStyle="black",e.beginPath(),e.moveTo(0,-1-this.scrollY),e.lineTo(this.width,-1-this.scrollY),e.stroke(),e.beginPath(),e.moveTo(0,this.height*this.zoomFactor-this.scrollY),e.lineTo(this.width,this.height*this.zoomFactor-this.scrollY),e.stroke(),e.beginPath(),e.moveTo(-1-this.scrollX,0),e.lineTo(-1-this.scrollX,this.height),e.stroke(),e.beginPath(),e.moveTo(this.width*this.zoomFactor-this.scrollX,0),e.lineTo(this.width*this.zoomFactor-this.scrollX,this.height),e.stroke(),this.scrollTimer>0){e.globalAlpha=.006*this.scrollTimer<1?.006*this.scrollTimer:.6,this.scrollTimer-=5,e.lineWidth=4,e.lineCap="square",e.beginPath();var i=o,s=o;this.scrollX<0&&(s+=this.scrollX),this.scrollX>this.width*this.zoomFactor-o&&(s-=this.scrollX-(this.width*this.zoomFactor-o)),s<0&&(s=0);var n=i/100*(100/this.width*s);(n/=this.zoomFactor)<1&&(n=1);var l=(i-n)/100*(100/(this.width*this.zoomFactor-o)*this.scrollX);l<0&&(l=0),l>o-n&&(l=o-n),e.moveTo(l,a-3),e.lineTo(l+n,a-3),e.stroke();var h=a,c=a;this.scrollY<0&&(c+=this.scrollY),this.scrollY>this.height*this.zoomFactor-a&&(c-=this.scrollY-(this.height*this.zoomFactor-a)),c<0&&(c=0);var d=h/100*(100/(this.height*this.zoomFactor)*c);d<1&&(d=1);var u=(h-d)/100*(100/(this.width*this.zoomFactor-a)*this.scrollY);u<0&&(u=0),u>a-d&&(u=a-d),e.moveTo(o-2,u),e.lineTo(o-2,u+d),e.stroke()}window.requestAnimationFrame(r.draw_animations.bind(this))},r.create_toolbox=function(e,o,a,i){var s=document.createElement("div");return s.innerHTML="<div style='padding:5px 0px 5px 0px'>"+a+"</div>",s.className="drawr-toolbox drawr-toolbox-"+e,s.ownerCanvas=this,t(s).css({position:"absolute","z-index":6,cursor:"move",width:i+"px",height:"auto",color:"#fff",padding:"2px",background:"linear-gradient(to bottom, rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%)","border-radius":"2px","box-shadow":"0px 2px 5px -2px rgba(0,0,0,0.75)","user-select":"none","font-family":"sans-serif","font-size":"12px","text-align":"center"}),t(s).insertAfter(t(this).parent()),t(s).offset(o),t(s).on("mousedown touchstart",function(e){var o=this.ownerCanvas,a=r.get_mouse_data.call(o,e,this);t(this).data("offsetx",a.x).data("offsety",a.y).data("dragging",!0),r.is_dragging=!0,e.preventDefault()}),t(s)},r.apply_scroll=function(e,o,r){t(this).css("transform","translate("+-e+"px,"+-o+"px)"),this.scrollX=e,this.scrollY=o,1==r&&(this.scrollTimer=250)},"export"==e){var a=this.first()[0],i=void 0===o?"image/png":o;return a.toDataURL(i)}if("button"==e){var s=t();return this.each(function(){var t=r.create_button.call(this,this.$brushToolbox[0],"action",o);s=s.add(t)}),s}return this.each(function(){var a=this;if("start"===e)t(".drawr-toolbox").hide(),t(".drawr-toolbox-brush").show(),t(".drawr-toolbox-palette").show(),a.$brushToolbox.find("button:first").mousedown();else if("stop"===e)a.$brushToolbox.find("button.type-toggle").each(function(){1==t(this).data("state")&&t(this).trigger("mousedown")}),t(".drawr-toolbox").hide();else if("load"===e){var i=document.createElement("img");i.crossOrigin="Anonymous",i.onload=function(){var t=a.getContext("2d",{alpha:a.settings.enable_tranparency});r.initialize_canvas.call(a,i.width,i.height,!0),a.undoStack=[{data:a.toDataURL("image/png"),current:!0}],t.drawImage(i,0,0)},i.src=o}else if("destroy"===e)alert("unimplemented");else if("object"==typeof e||void 0===e){if(t(a).hasClass("active-drawr"))return!1;a.className=a.className+" active-drawr",t(a).parent().addClass("drawr-container");var s={enable_tranparency:!0,canvas_width:t(a).parent().innerWidth(),canvas_height:t(a).parent().innerHeight(),undo_max_levels:5,color_mode:"picker"};"object"==typeof e&&(s=Object.assign(s,e)),a.settings=s,a.$memoryCanvas=t("<canvas class='sfx-canvas'></canvas>"),a.$memoryCanvas.insertBefore(a),a.plugin=r,r.initialize_canvas.call(a,s.canvas_width,s.canvas_height,!0),a.undoStack=[{data:a.toDataURL("image/png"),current:!0}];var n=a.getContext("2d",{alpha:s.enable_tranparency});if(a.brushColor={r:0,g:0,b:0},window.requestAnimationFrame(r.draw_animations.bind(a)),a.$brushToolbox=r.create_toolbox.call(a,"brush",{left:t(a).parent().offset().left,top:t(a).parent().offset().top},"Brushes",80),t.fn.drawr.availableBrushes.sort(function(t,e){return t.order>e.order?1:e.order>t.order?-1:0}),t.each(t.fn.drawr.availableBrushes,function(t,e){r.create_button.call(a,a.$brushToolbox[0],"brush",e)}),r.create_button.call(a,a.$brushToolbox[0],"toggle",{icon:"mdi mdi-palette-outline mdi-24px"}).on("touchstart mousedown",function(){a.$settingsToolbox.toggle()}),r.create_button.call(a,a.$brushToolbox[0],"toggle",{icon:"mdi mdi-magnify mdi-24px"}).on("touchstart mousedown",function(){a.$zoomToolbox.toggle()}),a.$undoButton=r.create_button.call(a,a.$brushToolbox[0],"action",{icon:"mdi mdi-undo-variant mdi-24px"}).on("touchstart mousedown",function(){if(a.undoStack.length>0){if(1==a.undoStack[a.undoStack.length-1].current&&a.undoStack.pop(),t.each(a.undoStack,function(t,e){e.current=!1}),0==a.undoStack.length)return;var e=a.undoStack.pop().data,o=document.createElement("img");o.crossOrigin="Anonymous",o.onload=function(){a.plugin.initialize_canvas.call(a,o.width,o.height,!1),n.drawImage(o,0,0)},o.src=e,0==a.undoStack.length&&(a.$undoButton.css("opacity",.5),a.undoStack.push({data:e,current:!1}))}}),a.$undoButton.css("opacity",.5),a.$settingsToolbox=r.create_toolbox.call(a,"settings",{left:t(a).parent().offset().left+t(a).parent().innerWidth()-80,top:t(a).parent().offset().top},"Settings",80),"presets"==a.settings.color_mode){t.each(["#FFFFFF","#0074D9","#2ECC40","#FFDC00","#FF4136","#111111"],function(t,e){r.create_button.call(a,a.$settingsToolbox[0],"color",{icon:""},{background:e}).on("touchstart mousedown",function(){a.brushColor=r.hex_to_rgb(e),void 0!==a.active_brush.activate&&a.active_brush.activate.call(a,a.active_brush,n),r.is_dragging=!1})})}else a.$settingsToolbox.append("<input type='text' class='color-picker'/>"),a.$settingsToolbox.find(".color-picker").drawrpalette().on("choose.drawrpalette",function(t,e){a.brushColor=r.hex_to_rgb(e),void 0!==a.active_brush.activate&&a.active_brush.activate.call(a,a.active_brush,n)});r.create_slider.call(a,a.$settingsToolbox,"alpha",0,100,parseInt(100*s.inital_brush_alpha)).on("input",function(){a.brushAlpha=parseFloat(this.value/100),a.active_brush.alpha=parseFloat(this.value/100),r.is_dragging=!1}),r.create_slider.call(a,a.$settingsToolbox,"size",2,100,s.inital_brush_size).on("input",function(){a.brushSize=this.value,a.active_brush.size=this.value,r.is_dragging=!1}),a.$zoomToolbox=r.create_toolbox.call(a,"zoom",{left:t(a).parent().offset().left+t(a).parent().innerWidth()-80,top:t(a).parent().offset().top},"Zoom",80),r.create_slider.call(a,a.$zoomToolbox,"zoom",0,400,100).on("input",function(){var e=10*Math.ceil(this.value/10);t(this).next().text(e);var o=.01*e,i=o-a.zoomFactor+1;a.zoomFactor=o,t(a).width(a.width*o),t(a).height(a.height*o),t(a).css({"background-size":20*o+"px "+20*o+"px "}),1!==i&&r.apply_scroll.call(a,a.scrollX*i,a.scrollY*i,!0)}),r.bind_draw_events.call(a)}}),this},t.fn.drawr.register=function(e){void 0===t.fn.drawr.availableBrushes&&(t.fn.drawr.availableBrushes=[]),t.fn.drawr.availableBrushes.push(e)}}(jQuery),function(t){t.fn.drawrpalette=function(e,o){var r=this;return r.offset=5,r.pickerSize=200,r.get_mouse_value=function(t,e){var o={};return"touchmove"==t.type||"touchstart"==t.type?(o.x=t.originalEvent.touches[0].pageX-e.offset().left-r.offset,o.y=t.originalEvent.touches[0].pageY-e.offset().top-r.offset):(o.x=t.pageX-e.offset().left-r.offset,o.y=t.pageY-e.offset().top-r.offset),o},r.rgb_to_hex=function(t,e,o){return"#"+(16777216+(o|e<<8|t<<16)).toString(16).slice(1)},r.hex_to_rgb=function(t){var e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null},r.hsv_to_rgb=function(t,e,o){var r,a,i,s,n,l,h,c;switch(1===arguments.length&&(e=t.s,o=t.v,t=t.h),l=o*(1-e),h=o*(1-(n=6*t-(s=Math.floor(6*t)))*e),c=o*(1-(1-n)*e),s%6){case 0:r=o,a=c,i=l;break;case 1:r=h,a=o,i=l;break;case 2:r=l,a=o,i=c;break;case 3:r=l,a=h,i=o;break;case 4:r=c,a=l,i=o;break;case 5:r=o,a=l,i=h}return{r:Math.round(255*r),g:Math.round(255*a),b:Math.round(255*i)}},r.rgb_to_hsv=function(t,e,o){1===arguments.length&&(e=t.g,o=t.b,t=t.r);var r,a=Math.max(t,e,o),i=Math.min(t,e,o),s=a-i,n=0===a?0:s/a,l=a/255;switch(a){case i:r=0;break;case t:r=e-o+s*(e<o?6:0),r/=6*s;break;case e:r=o-t+2*s,r/=6*s;break;case o:r=t-e+4*s,r/=6*s}return{h:r,s:n,v:l}},r.hsv_to_xy=function(t,e,o){return{x:e*r.pickerSize+r.offset,y:(1-o)*r.pickerSize+r.offset}},r.xy_to_hsv=function(t,e){return{s:t/r.pickerSize,v:(r.pickerSize-e)/r.pickerSize}},r.draw_hsv=function(t,e){var o=this.hsv,a=e.getContext("2d");for(a.clearRect(0,0,e.width,e.height),row=0;row<t;row++){var i=a.createLinearGradient(0,0,t,0),s=(t-row)/t,n=r.hsv_to_rgb(o.h,0,s);i.addColorStop(0,"rgb("+n.r+", "+n.g+","+n.b+")");n=r.hsv_to_rgb(o.h,1,s);i.addColorStop(1,"rgb("+n.r+", "+n.g+","+n.b+")"),a.fillStyle=i,a.fillRect(r.offset,row+r.offset,t,1)}for(row=0;row<t;row++)a.fillStyle="hsl("+360/t*row+", 100%, 50%)",a.fillRect(t+r.offset+5,row+r.offset,40,1);a.fillStyle="black",a.fillRect(t+r.offset+3,r.offset+o.h*t-3,44,6),a.fillStyle="white",a.fillRect(t+r.offset+5,r.offset+o.h*t-1,40,2);var l=r.hsv_to_xy(this.hsv.h,this.hsv.s,this.hsv.v);a.beginPath(),a.lineWidth=3,a.strokeStyle="black",a.arc(l.x,l.y,5,0,2*Math.PI),a.stroke(),a.beginPath(),a.lineWidth=2,a.strokeStyle="white",a.arc(l.x,l.y,4,0,2*Math.PI),a.stroke()},r.update_color=function(){var t=this.hsv,e=r.hsv_to_rgb(t.h,t.s,t.v),o="rgb("+e.r+","+e.g+","+e.b+")";this.$button.css("background-color",o),r.draw_hsv.call(this,r.pickerSize,this.$dropdown.find("canvas")[0])},r.update_value=function(){var e=r.hsv_to_rgb(this.hsv.h,this.hsv.s,this.hsv.v),o=r.rgb_to_hex(e.r,e.g,e.b);t(this).val(o)},r.cancel=function(){var e=r.hex_to_rgb(t(this).val()),o=r.rgb_to_hsv(e.r,e.g,e.b);this.hsv=o,r.update_color.call(this),t(this).trigger("cancel.drawrpalette",t(this).val())},this.each(function(){var o=this;if("destroy"===e){if(!t(o).hasClass("active-drawrpalette"))return!1;o.$button.off("mousedown.drawrpalette touchstart.drawrpalette"),o.$dropdown.find(".ok").off("mouseup.drawrpalette touchend.drawrpalette"),o.$dropdown.find(".cancel").off("mouseup.drawrpalette touchend.drawrpalette"),o.$dropdown.off("mousedown.drawrpalette touchstart.drawrpalette"),o.$button.off("mousedown.drawrpalette touchstart.drawrpalette"),t(window).off("mousedown.drawrpalette touchstart.drawrpalette"),t(window).off("mousemove.drawrpalette touchmove.drawrpalette"),t(window).off("mouseup.drawrpalette touchend.drawrpalette"),t(o).show(),o.$button.remove(),o.$dropdown.remove(),t(o).unwrap(),delete o.$wrapper,delete o.$button,delete o.$dropdown,delete o.hsl,delete o.slidingHue,delete o.slidingHsl,t(o).removeClass("active-drawrpalette")}else if("object"==typeof e||void 0===e){for(var a={},i=0,s=o.style.length;i<s;i++){var n=o.style[i],l=getComputedStyle(o,null).getPropertyValue(n);a[n]=l}var h=""!==o.className?o.className.split(" "):[];if(t(o).hasClass("active-drawrpalette"))return!1;o.className=o.className+" active-drawrpalette";var c={enable_alpha:!1,append_to:o};"object"==typeof e&&(c=Object.assign(c,e)),o.settings=c,o.plugin=r,t(this).wrap("<div class='drawrpallete-wrapper'></div>"),this.$wrapper=t(this).parent(),this.$wrapper.css({position:"relative",display:"inline-block"}),t(this).hide(),o.$button=t("<button>&nbsp;</button>"),o.$button.css({width:"40px",height:"40px",border:"2px solid #ccc","background-color":"#eee",cursor:"pointer","text-align":"text",padding:"0px","font-size":"2em","background-image":"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAG0lEQVR42mNgwAfKy8v/48I4FeA0AacVDFQBAP9wJkE/KhUMAAAAAElFTkSuQmCC')","background-repeat":"no-repeat","background-position":"24px 25px"}),o.$button.css(a),t.each(h,function(t,e){o.$button.addClass(e)}),this.$wrapper.append(o.$button);var d=r.pickerSize+2*r.offset,u=r.pickerSize+40+2*r.offset+5;if(o.$dropdown=t("<div><canvas style='display:block;' class='drawrpallete-canvas' width="+u+" height="+d+" style='height:"+d+"px;width:"+u+"px;'></canvas></div>"),o.$dropdown.append('<div style="height:28px;text-align:right;margin-top:-2px;padding:0px 5px;"><button class="cancel">cancel</button><button style="margin-left:5px;width:40px;" class="ok">ok</button></div>'),this.$wrapper.append(o.$dropdown),o.$dropdown.css({background:"#eee",width:u+"px",height:d+28+"px",position:"absolute","z-index":8}),o.$dropdown.find(".ok").css("color","black").on("mouseup.drawrpalette touchend.drawrpalette",function(){r.update_value.call(o),t(o).trigger("choose.drawrpalette",t(o).val()),o.$dropdown.hide(),t(o).trigger("close.drawrpalette")}),o.$dropdown.find(".cancel").css("color","black").on("mouseup.drawrpalette touchend.drawrpalette",function(){r.cancel.call(o),o.$dropdown.hide(),t(o).trigger("close.drawrpalette")}),o.$dropdown.on("mousedown.drawrpalette touchstart.drawrpalette",function(e){var a=r.get_mouse_value(e,o.$dropdown);if(a.x>0&&a.x<r.pickerSize&&a.y>0&&a.y<r.pickerSize){o.slidingHsl=!0;var i=r.xy_to_hsv(a.x,a.y);o.hsv.s=i.s,o.hsv.v=i.v,r.update_color.call(o);var s=r.hsv_to_rgb.call(o,o.hsv.h,o.hsv.s,o.hsv.v),n=r.rgb_to_hex.call(o,s.r,s.g,s.b);t(o).trigger("preview.drawrpalette",n)}else if(a.x>r.pickerSize+5&&a.x<r.pickerSize+45&&a.y>0&&a.y<r.pickerSize){o.slidingHue=!0;var l=parseFloat(1/r.pickerSize)*a.y;o.hsv.h=l,r.update_color.call(o);s=r.hsv_to_rgb.call(o,o.hsv.h,o.hsv.s,o.hsv.v),n=r.rgb_to_hex.call(o,s.r,s.g,s.b);t(o).trigger("preview.drawrpalette",n)}e.preventDefault(),e.stopPropagation()}),o.$dropdown.hide(),o.$button.on("mousedown.drawrpalette touchstart.drawrpalette",function(e){o.slidingHue=!1,o.slidingHsl=!1,o.$dropdown.show();var a=r.hex_to_rgb(t(o).val()),i=r.rgb_to_hsv(a.r,a.g,a.b);o.hsv=i,r.update_color.call(o),t(o).trigger("open.drawrpalette"),e.preventDefault(),e.stopPropagation()}),t(window).on("mousedown.drawrpalette touchstart.drawrpalette",function(){o.$dropdown.is(":visible")&&(r.cancel.call(o),o.$dropdown.hide(),t(o).trigger("close.drawrpalette"))}),t(window).on("mousemove.drawrpalette touchmove.drawrpalette",function(e){o.$dropdown.find("canvas")[0].getContext("2d");var a=r.get_mouse_value(e,o.$dropdown);if(a.y>r.pickerSize&&(a.y=r.pickerSize),a.y<0&&(a.y=0),a.x<0&&(a.x=0),1==o.slidingHsl){a.x>r.pickerSize&&(a.x=r.pickerSize);var i=r.xy_to_hsv(a.x,a.y);o.hsv.s=i.s,o.hsv.v=i.v,r.update_color.call(o);var s=r.hsv_to_rgb.call(o,o.hsv.h,o.hsv.s,o.hsv.v),n=r.rgb_to_hex.call(o,s.r,s.g,s.b);t(o).trigger("preview.drawrpalette",n)}else if(1==o.slidingHue){var l=parseFloat(1/r.pickerSize)*a.y;o.hsv.h=l,r.update_color.call(o);s=r.hsv_to_rgb.call(o,o.hsv.h,o.hsv.s,o.hsv.v),n=r.rgb_to_hex.call(o,s.r,s.g,s.b);t(o).trigger("preview.drawrpalette",n)}}),t(window).on("mouseup.drawrpalette touchend.drawrpalette",function(){o.slidingHue=!1,o.slidingHsl=!1}),""!==t(this).val()){var p=r.hex_to_rgb(t(this).val()),f=r.rgb_to_hsv(p.r,p.g,p.b);o.hsv=f,r.update_color.call(o)}else o.hsv={h:0,s:0,v:0},t(this).val("#000000"),r.update_color.call(o)}}),this}}(jQuery),jQuery.fn.drawr.register({icon:"mdi mdi-spray mdi-24px",name:"airbrush",size:40,alpha:.2,order:3,pressure_affects_alpha:!0,pressure_affects_size:!1,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",e.globalAlpha=i},drawSpot:function(t,e,o,r,a,i,s){e.globalAlpha=i;var n=e.createRadialGradient(o,r,0,o,r,this.brushSize/2);n.addColorStop(0,"rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")"),n.addColorStop(.5,"rgba("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+",0.5)"),n.addColorStop(1,"rgba("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+",0)"),e.fillStyle=n,e.fillRect(o-this.brushSize/2,r-this.brushSize/2,this.brushSize,this.brushSize)},drawStop:function(t,e,o,r,a,i,s){return!0}}),jQuery.fn.drawr.register({icon:"mdi mdi-brush mdi-24px",name:"pen",size:6,alpha:.5,order:4,pressure_affects_alpha:!0,pressure_affects_size:!0,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",e.globalAlpha=i},drawSpot:function(t,e,o,r,a,i,s){e.globalAlpha=i;var n=e.createRadialGradient(o,r,0,o,r,a/2);n.addColorStop(0,"rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")"),n.addColorStop(.5,"rgba("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+",0.5)"),n.addColorStop(1,"rgba("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+",0)"),e.fillStyle=n,e.fillRect(o-a/2,r-a/2,a,a)},drawStop:function(t,e,o,r,a,i,s){return!0}}),jQuery.fn.drawr.register({icon:"mdi mdi-eraser mdi-24px",name:"eraser",size:10,alpha:.8,order:5,pressure_affects_alpha:!0,pressure_affects_size:!0,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){1==this.settings.enable_tranparency?e.globalCompositeOperation="destination-out":e.globalCompositeOperation="source-over",e.globalAlpha=i},drawSpot:function(t,e,o,r,a,i,s){if(e.globalAlpha=i,1==this.settings.enable_tranparency){var n=e.createRadialGradient(o,r,0,o,r,a/2);n.addColorStop(0,"#000"),n.addColorStop(.5,"rgba(0,0,0,0.5)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(o-a/2,r-a/2,a,a)}else e.fillStyle="white",e.beginPath(),e.arc(o,r,a/2,0,2*Math.PI),e.fill()},drawStop:function(t,e,o,r,a,i,s){return!0}}),jQuery.fn.drawr.register({icon:"mdi mdi-eyedropper mdi-24px",name:"pen",order:6,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a){},drawSpot:function(t,e,o,r,a,i){var s=e.getImageData(o,r,1,1).data;this.brushColor={r:s[0],g:s[1],b:s[2]}}}),jQuery.fn.drawr.register({icon:"mdi mdi-square mdi-24px",name:"filledsquare",size:3,alpha:1,order:8,pressure_affects_alpha:!1,pressure_affects_size:!1,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){t.currentAlpha=i,t.startPosition={x:o,y:r},this.effectCallback=t.effectCallback,e.globalAlpha=i,e.lineWidth=a},drawStop:function(t,e,o,r,a,i,s){return e.globalAlpha=i,e.lineJoin="miter",e.lineWidth=a,e.fillStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",e.fillRect(t.startPosition.x,t.startPosition.y,t.currentPosition.x-t.startPosition.x,t.currentPosition.y-t.startPosition.y),this.effectCallback=null,!0},drawSpot:function(t,e,o,r,a,i,s){t.currentPosition={x:o,y:r}},effectCallback:function(t,e,o,r,a){t.globalAlpha=e.currentAlpha,t.lineJoin="miter",t.fillStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",t.fillRect(e.startPosition.x*a-o,e.startPosition.y*a-r,(e.currentPosition.x-e.startPosition.x)*a,(e.currentPosition.y-e.startPosition.y)*a)}}),jQuery.fn.drawr.register({icon:"mdi mdi-marker mdi-24px",name:"marker",size:15,alpha:.3,order:10,pressure_affects_alpha:!1,pressure_affects_size:!1,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",t.currentAlpha=i,t.startPosition={x:o,y:r},this.effectCallback=t.effectCallback},drawStop:function(t,e,o,r,a,i,s){e.globalAlpha=i,t.currentSize=a,t.currentAlpha=i,this.effectCallback=null,e.lineWidth=a,e.lineJoin=e.lineCap="round",e.strokeStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",e.beginPath();var n=$(this).data("positions");return $.each(n,function(t,o){t>0&&(e.moveTo(n[t-1].x,n[t-1].y),e.lineTo(o.x,o.y))}),e.stroke(),!0},drawSpot:function(t,e,o,r,a,i,s){t.currentSize=a,t.currentAlpha=i,t.currentPosition={x:o,y:r}},effectCallback:function(t,e,o,r,a){t.globalAlpha=e.currentAlpha,t.lineWidth=e.currentSize*a,t.lineJoin=t.lineCap="round",t.strokeStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",t.beginPath();var i=$(this).data("positions");$.each(i,function(e,s){e>0&&(t.moveTo(i[e-1].x*a-o,i[e-1].y*a-r),t.lineTo(s.x*a-o,s.y*a-r))}),t.stroke()}}),jQuery.fn.drawr.register({icon:"mdi mdi-cursor-move mdi-24px",name:"move",order:9,activate:function(t,e){$(this).parent().css({cursor:"move"})},deactivate:function(t,e){$(this).parent().css({cursor:"default"})},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",t.dragStartX=null,t.scrollStartX=null,t.dragStartY=null,t.scrollStartY=null,"touchmove"==s.type||"touchstart"==s.type?(o=s.originalEvent.touches[0].pageX,Y=s.originalEvent.touches[0].pageY):(o=s.pageX,r=s.pageY),t.dragStartX=o,t.scrollStartX=this.scrollX,t.dragStartY=r,t.scrollStartY=this.scrollY},drawSpot:function(t,e,o,r,a,i,s){"touchmove"==s.type||"touchstart"==s.type?(o=s.originalEvent.touches[0].pageX,Y=s.originalEvent.touches[0].pageY):(o=s.pageX,r=s.pageY);var n=parseInt(-(o-t.dragStartX)),l=parseInt(-(r-t.dragStartY));this.plugin.apply_scroll.call(this,t.scrollStartX+n,t.scrollStartY+l,!0)}}),jQuery.fn.drawr.register({icon:"mdi mdi-fountain-pen-tip mdi-24px",name:"pen",size:3,alpha:1,order:2,pressure_affects_alpha:!1,pressure_affects_size:!0,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",e.globalAlpha=i},drawSpot:function(t,e,o,r,a,i,s){e.globalAlpha=i,e.fillStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",e.beginPath(),e.arc(o,r,a/2,0,2*Math.PI),e.fill()},drawStop:function(t,e,o,r,a,i,s){return!0}}),jQuery.fn.drawr.register({icon:"mdi mdi-lead-pencil mdi-24px",name:"pencil",size:5,alpha:.8,order:1,pressure_affects_alpha:!0,pressure_affects_size:!1,activate:function(t,e){var o=this;t.brushImage=new Image,t.brushImage.crossOrigin="Anonymous",t.brushImage.onload=function(){var e=document.createElement("canvas"),r=e.getContext("2d");e.width=t.brushImage.width,e.height=t.brushImage.height,r.fillStyle="rgb("+o.brushColor.r+","+o.brushColor.g+","+o.brushColor.b+")",r.fillRect(0,0,e.width,e.height),r.globalCompositeOperation="destination-atop",r.drawImage(t.brushImage,0,0),t.brushImage=e},t.brushImage.src="images/lead-pencil.png"},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",e.globalAlpha=i},drawRotatedImage:function(t,e,o,r,a,i){t.save(),t.translate(o,r);var s=360*Math.random()+1;if(t.rotate(s*Math.PI/180),e.width>=e.height)var n=e.height/(e.width/i),l=i;else l=e.width/(e.height/i),n=i;var h=-l/2,c=-n/2;t.drawImage(e,h,c,l,n),t.restore()},drawSpot:function(t,e,o,r,a,i,s){e.globalAlpha=i,t.drawRotatedImage(e,t.brushImage,o,r,0,a)},drawStop:function(t,e,o,r,a,i,s){return!0}}),jQuery.fn.drawr.register({icon:"mdi mdi-vector-square mdi-24px",name:"square",size:3,alpha:1,order:7,pressure_affects_alpha:!1,pressure_affects_size:!1,activate:function(t,e){},deactivate:function(t,e){},drawStart:function(t,e,o,r,a,i,s){e.globalCompositeOperation="source-over",t.currentAlpha=i,t.currentSize=a,t.startPosition={x:o,y:r},this.effectCallback=t.effectCallback,e.globalAlpha=i},drawStop:function(t,e,o,r,a,i,s){return e.globalAlpha=i,e.lineJoin="miter",e.lineWidth=a,e.strokeStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",e.strokeRect(t.startPosition.x,t.startPosition.y,t.currentPosition.x-t.startPosition.x,t.currentPosition.y-t.startPosition.y),this.effectCallback=null,!0},drawSpot:function(t,e,o,r,a,i,s){t.currentPosition={x:o,y:r}},effectCallback:function(t,e,o,r,a){t.globalAlpha=e.currentAlpha,t.lineWidth=e.currentSize*a,t.lineJoin="miter",t.strokeStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",t.strokeRect(e.startPosition.x*a-o,e.startPosition.y*a-r,(e.currentPosition.x-e.startPosition.x)*a,(e.currentPosition.y-e.startPosition.y)*a)}}),jQuery.fn.drawr.register({icon:"mdi mdi-format-text mdi-24px",name:"text",size:22,alpha:1,order:22,pressure_affects_alpha:!1,pressure_affects_size:!1,activate:function(t,e){},deactivate:function(t,e){void 0!==t.$floatyBox&&(t.$floatyBox.remove(),delete t.$floatyBox)},drawStart:function(t,e,o,r,a,i,s){var n=this;if(t.currentPosition={x:o,y:r},e.globalAlpha=i,void 0===t.$floatyBox){var l=parseInt(20*n.zoomFactor);t.$floatyBox=$('<div style="z-index:6;position:absolute;width:100px;height:20px;"><input style="background:transparent;border:0px;padding:0px;font-size:'+l+'px;font-family:sans-serif;" type="text" value=""><button class="ok"><i class="mdi mdi-check"></i></button><button class="cancel"><i class="mdi mdi-close"></i></button></div>'),$(t.$floatyBox).insertAfter($(this).parent()),t.$floatyBox.css({left:$(this).parent().offset().left+o*n.zoomFactor-this.scrollX,top:$(this).parent().offset().top+r*n.zoomFactor-this.scrollY}),t.$floatyBox.find("input").on("mousedown touchstart",function(e){e.preventDefault(),e.stopPropagation(),t.$floatyBox.find("input").focus()}),t.$floatyBox.find("input").focus(),s.preventDefault(),s.stopPropagation(),t.$floatyBox.find(".ok").on("mousedown touchstart",function(o){o.preventDefault(),o.stopPropagation(),t.applyText.call(n,e,t,t.currentPosition.x,t.currentPosition.y,t.$floatyBox.find("input").val()),t.$floatyBox.remove(),delete t.$floatyBox}),t.$floatyBox.find(".cancel").on("mousedown touchstart",function(e){e.preventDefault(),e.stopPropagation(),t.$floatyBox.remove(),delete t.$floatyBox})}else t.$floatyBox.css({left:$(this).parent().offset().left+o*n.zoomFactor-this.scrollX,top:$(this).parent().offset().top+r*n.zoomFactor-this.scrollY})},applyText:function(t,e,o,r,a){t.font="20px sans-serif",t.textAlign="left",t.fillStyle="rgb("+this.brushColor.r+","+this.brushColor.g+","+this.brushColor.b+")",t.fillText(a,o-2,r+19)},drawStop:function(t,e,o,r,a,i,s){return!0},drawSpot:function(t,e,o,r,a,i,s){t.currentPosition={x:o,y:r},void 0===t.$floatyBox||t.$floatyBox.css({left:$(this).parent().offset().left+o*this.zoomFactor-this.scrollX,top:$(this).parent().offset().top+r*this.zoomFactor-this.scrollY})}});