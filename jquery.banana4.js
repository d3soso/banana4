
/* --------------------------------------------------------

	jQuery::Banana4 Ver.0.9.100 (β)

	(C)usosake.net / d3soso
	http://usosake.net/banana4/

	Released under the MIT license
	https://github.com/d3soso/banana4/blob/master/LICENSE

--------------------------------------------------------- */

;(function($) {
	$.fn.banana4 = function(args) {

		var _obj = {};
		var _obj_count = 0;

		var _list = [];
		var _args = args;
		var _debug = false;

		var _default_length = 0;

		var _serial = 0; // 設置したliの通し番号
		var _current = {
			current : 0,
			prev : 0,
			next : 0
		};

		var _drag = false;
		var _drag_x_init = 0;
		var _drag_x_move = 0;
		var _drag_x_offset = [];

		var _timer;


		function INIT() {
			if(checkQuery(this)) {
				var t = this;
				initQuery(this);
				initList(this);
				css(this);
				interfarce(this);
				$(window).resize(function() { RESIZE(t); });
				drag(this);
				animation(this, "next");

				_obj[_obj_count] = {
					id : $(this).prop("id")
				};
				_obj_count++;

			}
		}

		function RESIZE(obj) {
			css(obj);
			if(_args.navi) cssNavi(obj);
		}


		function getSize(obj) {
			var s = {};
			s.outer_w = $(obj).width();
			s.inner_w = $(obj).find("ul li").width();
			s.left = (s.outer_w - s.inner_w) / 2;
			return s;
		}

		function getCount(c) {
			if(c < 0) return _default_length + c;
			else if(c >= _default_length) return c % _default_length;
			else return c;
		}

		function setListPosition(obj, d, i) {

			// d == "next" の時は右端のバナーを基準にそれ以外のバナー位置決定
			// d == "prev" の時は左端の　　　　〃

			var s = getSize(obj);

			if(d=="prev") {
				return i * s.inner_w - s.inner_w * 2 + s.left;
			}else if(d=="next") {
				var len = $(obj).find("ul li").length - 1;
				return -1 *(len - i) * s.inner_w + s.inner_w * 2 + s.left;
			}
		}

		/* --------------------

		    Public Methods

		--------------------- */

		$.banana4 = {};

		$.banana4.prev = function(r) {
			var obj = r;
			animation(obj, setCurrent(obj, _current["current"] - 1));
		}

		$.banana4.next = function(r) {
			var obj = r;
			animation(obj, setCurrent(obj, _current["current"] + 1));
		}

		$.banana4.jump = function(r, c) {
			var obj = r;
			animation(obj, setCurrent(obj, c));
		}

		$.banana4.remove = function(r) {
			var obj = r;
			removeDragevent(r);
		}


		/* --------------------

		        INTERFACE

		--------------------- */

		function interfarce(obj) {
			if(_args.navi) navi(obj);
			if(_args.pager) pager(obj);
		}

		function pager(obj) {

			var p = '<div class="banana4_pager">';
			for(var i=0; i<_default_length; i++) {
				var cls = (i==0) ? " banana4_pager_on" : "";
				p += '<a href="javascript:void(0);" class="banana4_pager' + i +  cls + '">&nbsp;</a>';
			}
			p += '</div>';
			$(obj).append(p);
			cssPager(obj);
			eventPager(obj);

		}

		function cssPager(obj) {

			var t = $(obj).find(".banana4_pager a");
			$(obj).find(".banana4_pager").css({
				minWidth : "1px",
				position : "absolute",
				left : "50%",
				top : "100%"
			});
			$(obj).find(".banana4_pager").css({
				margin : "-" + $(obj).find(".banana4_pager").height() * 2 + "px 0 0 -" + $(obj).find(".banana4_pager").width() / 2 + "px"
			});

		}

		function eventPager(obj) {

			$(obj).find(".banana4_pager a").each(function(c) {
				$(this).on("click", function() {
					animation(obj, setCurrent(obj, c));
				})
			});
		}


		function navi(obj) {

			setNavi(obj, "next");
			setNavi(obj, "prev");
			cssNavi(obj);
			eventNavi(obj, "next");
			eventNavi(obj, "prev");

		}

		function setNavi(obj, d) {
			var navi = '<div class="banana4_navi banana4_navi_' + d + '">';
			navi += '<a href="javascript:void(0);">&nbsp;</a>'
			navi += '</div>';
			$(obj).append(navi);
		}

		function cssNavi(obj) {

			var s = getSize(obj);
			$(obj).find(".banana4_navi").css({
				display : "block",
				position : "absolute",
				top : 0,
				width : s.left + "px",
				height : _args.inner_height
			});
			$(obj).find(".banana4_navi_next").css({
				left : s.left + s.inner_w + "px"
			});
			$(obj).find(".banana4_navi a").css({
				display : "block",
				position : "absolute",
				top : 0,
				left:0,
				width : "100%",
				height : _args.inner_height
			});
		}

		function eventNavi(obj, d) {
			$(obj).find(".banana4_navi_" + d + " a").on("click", function() {
				var c = (d=="next") ? _current["current"] + 1 : _current["current"] - 1 ;
				setCurrent(obj, c);
				animation(obj, d);
			});
		}


		/* --------------------

		        SWIPE / DRAG

		--------------------- */

		function drag(obj) {
			/*
			$(obj).find("ul li").each(function(i) {
				dragevent(obj, this);
			});
			*/
			//dragevent(obj, $(obj));
			dragevent(obj, $(obj));
		}

		function dragevent(obj, li) {
			$(li).on({
				//'mousedown'  : function() { dragstart(obj, event, "mouse"); },
				'touchstart' : function() { dragstart(obj, event, "touch"); },
				//'mousemove'  : function() { dragmove(obj, event, "mouse"); },
				'touchmove'  : function() { dragmove(obj, event, "touch"); },
				//'mouseup'    : function() { dragend(obj); },
				'touchend'   : function() { dragend(obj); }
			})
		}

		function removeDragevent(li) {
			$(li).off('touchstart');
			$(li).off('touchmove');
			$(li).off('touchend');
		}

		function dragstart(obj, e, type) {
			_drag = true;
			clearTimeout(_timer);
			_drag_x_init = (type=="touch") ? e.changedTouches[0].pageX : e.pageX;
			_drag_x_init = Math.floor(_drag_x_init) - 0;

			$(obj).find("ul li").each(function(i){
				if($(obj).velocity) $(this).velocity("stop");
				else $(this).stop();
				_drag_x_offset.push($(this).css("left").slice(0, -2) - 0);
			});

		}

		function dragmove(obj, e, type) {
			if(_drag) {
				if(type=="touch") e.preventDefault();
				_drag_x_move = (type=="touch") ? e.changedTouches[0].pageX : e.pageX;
				_drag_x_move = Math.floor(_drag_x_move) - 0;

				$(obj).find("ul li").each(function(i) {
					$(this).css("left", _drag_x_offset[i] + (_drag_x_move - _drag_x_init) + "px");
					//console.log("move" + i + " : " + _drag_x_offset[i] + (_drag_x_move - _drag_x_init));
				})

			}
		}

		function dragend(obj) {

			var s = getSize(obj);
			if(Math.abs(_drag_x_move - _drag_x_init) >= s.inner_w * 0.3) {
				var c = (_drag_x_move - _drag_x_init < 0) ? _current["current"] + 1 : _current["current"] - 1;
				var d = setCurrent(obj, c)
				animation(obj, d)
			}else {
				animation(obj, "next");
			}
			_drag = false;
			_drag_x_init = 0;
			_drag_x_move = 0;
			_drag_x_offset = [];
		}




		/* --------------------

		        ANIMATION

		--------------------- */

		function animation(obj, d) {

			if($(obj).velocity) {
				animateVelocity(obj, d);
			}else if($(obj).transit) {
				animateTransit(obj, d);
			}else {
				animateJquery(obj, d);
			}
		}

		function animateTransit(obj, d) {

			$(obj).find("ul li").each(function(i){
				var t = this;
				$(this).stop();
				$(this).transition({
					left : setListPosition(obj, d, i) + "px",
					duration : _args.duration,
					easing : _args.easing
				},
				function() {
					removeList(obj, t);
					if(_args.auto && i==0) animateComplete(obj, "next");
				})
			})
		}

		function animateVelocity(obj, d) {

			$(obj).find("ul li").each(function(i) {
				var t = this;
				$(this).velocity("stop");
				$(this).velocity({
					left : setListPosition(obj, d, i) + "px"
				}, {
					duration : _args.duration,
					easing : _args.easing,
					complete : function() {
						removeList(obj, t);
						if(_args.auto && i==0) animateComplete(obj, "next");
					}
				});
			})

		}

		function animateJquery(obj, d) {

			$(obj).find("ul li").each(function(i) {
				var t = this;
				$(this).stop();
				$(this).animate({
					left : setListPosition(obj, d, i) + "px"
				},
				_args.duration,
				_args.easing,
				function() {
					removeList(obj, t);
					if(_args.auto && i==0) animateComplete(obj, "next");
				})
			})

		}

		function animateComplete(obj, d) {
			_timer = setTimeout(function() {
				setCurrent(obj, _current["current"]+1);
				animation(obj, d);
			}, _args.delay)
		}

		function removeList(obj, t) {
			var buffer = 1.1;
			var s = getSize(obj);
			var left = $(t).css("left").slice(0, -2) - 0;
			if(left < -1 * s.inner_w * 2 * buffer + s.left) {
				$(t).remove();
				_current["prev"] = getCount(_current["prev"]+1);
			}else if(left > s.inner_w * 2 * buffer + s.left) {
				$(t).remove();
				_current["next"] = getCount(_current["next"]-1)
			}
		}


		function setCurrent(obj, c) {

			clearTimeout(_timer);

			var def = c - _current["current"];
			var d = (def > 0) ? "next" : "prev";
			var init = (d=="next") ? _current["next"] + 1 : _current["prev"] + def;
			var last = (d=="next") ? _current["next"] + def : _current["prev"] - 1;
			var s = getSize(obj);

			var left = 0;
			var i = 0;
			if(d=="next") {
				for(i=init; i<=last; i++) {
					left = ($(obj).find("ul li:last").css("left").slice(0, -2) - 0) + $(obj).find("ul li:last").width();
					$(obj).find("ul").append('<li class="banana4_li_' + _serial + '">' + _list[getCount(i)] + '</li>');
					setListCSS(obj, left);
					//dragevent(obj, $(obj).find('.banana4_li_' + _serial));
					_serial++;
				}
			}else if(d=="prev") {
				for(i=last; i>=init; i--) {
					left = ($(obj).find("ul li:first").css("left").slice(0, -2) - 0);
					$(obj).find("ul").prepend('<li class="banana4_li_' + _serial + '">' + _list[getCount(i)] + '</li>');
					setListCSS(obj, left);
					//dragevent(obj, $(obj).find('.banana4_li_' + _serial));
					_serial++;
				}
			}

			_current["current"] = getCount(c);
			_current[d] = (d=="next") ? getCount(last) : getCount(init) ;

			if(_args.pager && $(obj).find(".banana4_pager").length > 0) {
				$(obj).find(".banana4_pager_on").removeClass("banana4_pager_on");
				$(obj).find(".banana4_pager a:eq(" + _current["current"] + ")").addClass("banana4_pager_on");
			}

			return d;
		}

		function setListCSS(obj, left) {
			//$(obj).find("li.banana4_li_" + _serial).css(cssList());
			cssList($(obj).find("li.banana4_li_" + _serial));
			$(obj).find("li.banana4_li_" + _serial).css({
				left : left + "px"
			});
		}


		/* --------------------

		        CSS

		--------------------- */

		function css(obj) {
			var css_position = ($(obj).css("position") && $(obj).css("position")!="static") ? $(obj).css("position") : "relative";

			var strlen = _args.outer_width.length;
			var outer_w;
			if(_args.outer_width.substr(-2, 2)=="px") {
				var outer_width = _args.outer_width.substr(0, strlen-2);
				outer_w = (_args.responsive && $(window).width() < outer_width) ? "100%" : _args.outer_width;
			}else {
				outer_w = _args.outer_width;
			}

			$(obj).css({
				width : outer_w,
				height : _args.outer_height,
				overflow : "hidden",
				position : css_position
			});
			//$(obj).find("ul li").css(cssList());
			cssList($(obj).find("ul li"));
			$(obj).find("ul li").each(function(i) {
				$(this).css({
					left : setListPosition(obj, "next", i) + "px"
				})
			});
		}

		function cssList(obj) {

			var strlen = _args.inner_width.length;
			var inner_w;
			var responsive = false;
			if(_args.inner_width.substr(-2, 2)=="px") {
				var inner_width = _args.inner_width.substr(0, strlen-2);
				inner_w = (_args.responsive && $(window).width() < inner_width) ? "100%" : _args.inner_width;
				responsive = true;
			}else {
				inner_w = _args.inner_width;
				responsive = false;
			}

			obj.css({
				display : "block",
				width : inner_w,
				height : _args.inner_height,
				textAlign : "center",
				position : "absolute",
				top : 0
			});

			obj.find("img").css({
				width : inner_w
			})

		}

		/*
		function cssList() {

			var strlen = _args.inner_width.length;
			var inner_w;
			if(_args.inner_width.substr(-2, 2)=="px") {
				var inner_width = _args.inner_width.substr(0, strlen-2);
				inner_w = (_args.responsive && $(window).width() < inner_width) ? "100%" : _args.inner_width;
			}else {
				inner_w = _args.inner_width;
			}

			return {
				display : "block",
				width : inner_w,
				height : _args.inner_height,
				textAlign : "center",
				position : "absolute",
				top : 0
			};
		}
		*/



		/* --------------------

		        Query

		--------------------- */

		function checkQuery(obj) {
			var error = [];

			if(error.length == 0) {
				return true;
			}else {
				alertError(error);
				return false;
			}
		}

		function alertError(error) {
			for(var i=0; i<error.length; i++) {
				alert("ERROR : " + error[i]["message"]);
			}
		}

		/* デフォルトの_argsを設定する */

		function initQuery(obj) {
			if(!_args.inner_height) _args.inner_height = "auto";
			if(!_args.outer_width) _args.outer_width = "100%";
			if(!_args.outer_height) _args.outer_height = $(obj).find("ul li").height() + "px";
			if(!_args.inner_width) _args.inner_width = $(obj).width() + "px";
			if(_args.duration != 0) {
				if(!_args.duration) _args.duration = 500;
			}
			if(!_args.easing) _args.easing = "linear";

			if(!_args.navi) _args.navi = false;
			if(!_args.pager) _args.pager = false;

			if(_args.delay != 0) {
				if(!_args.delay) _args.delay = 5000;
			}
			if(_args.auto != false) _args.auto = true;
			if(_args.responsive != false) _args.responsive = true;
		}

		function initList(obj) {

			_default_length = $(obj).find("ul li").length;

			$(obj).find("ul li").each(function() {
				_list.push($(this).html());
				$(this).remove();
			});

			for(var i=0; i<5; i++) {
				$(obj).find("ul").append('<li class="banana4_li_' + _serial + '">' + _list[getCount(_list.length + i - 2)] + '</li>');
				_serial++;
			}
			_current = {
				current : 0,
				prev : getCount(-2),
				next : getCount(2)
			};
		}

		return this.each(INIT);

	}
})(jQuery);
