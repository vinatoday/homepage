function create_albums(shared=1){
	document.write('<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>');

	var pswpElement = document.querySelectorAll('.pswp')[0];
	//====================================================================================



	function album_blog(tab){
		var images = tab.querySelectorAll('img');
		var len   = images.length; if (len<1) return;
		var items =[];
		function map(f) {for (var i=0; i<len; i++) f(i,images[i]);};
		
		function initPhotoSwipe(){ //add click for <img>
			var imgIndex = strToInt(event.target.getAttribute("data-index")); // = first image
			var options  = {
				index: imgIndex, // start at first slide
				getThumbBoundsFn: function (index) {
					// get window scroll Y, optionally get horizontal scroll
					var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

					// get position of element relative to viewport
					var thumbnail = images[index];
					var rect = thumbnail.getBoundingClientRect();

					// w = width
					return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };

					// Good guide on how to get element coordinates:
					// http://javascript.info/tutorial/coordinates
				}
			};
			var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
		}
		
		
		map(function(i,el){
			if (!shared) el.oncontextmenu = function(){return false;};
			el.onclick = initPhotoSwipe;
			el.setAttribute("data-index",i);
			
			var caption = el.parentElement.querySelector("figcaption"); caption= caption? caption.textContent : "";
			var img  =  el.getAttribute("data-original"); if (!img) img= el.src;
			items[i] = {
				src: img,
				w: el.getAttribute("data-width"),
				h: el.getAttribute("data-height"),
				title: caption
			};
		});
	} // ends album_blog().
	  //____________________________________________




	function get_data_images(tab){
		var data= tab.getAttribute("data");
		if (data) return JSON.parse(data); //old..
		
		data= new Array();
		var items= tab.querySelectorAll("input");
		var len= items.length;
		
		for (i=0; i < len; i++){
			var el= items[i];
			data[i]= { //Get [link, width, height] of image
				src: el.value,
				w: strToInt(el.getAttribute("w")), 
				h: strToInt(el.getAttribute("h"))
			};
		}
		return data;
	}
	
	

	function get_option(thumb){ //thumb for zoom in and out
		var first_img = thumb.index;
		var zoom = function(index) {
			var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
			var rect = thumb.getBoundingClientRect();
			return {x:rect.left, y:rect.top+pageYScroll, w:rect.width};
		};
		return {index: first_img, getThumbBoundsFn: zoom};
	}



	//__________________________________________________
	function album_images(tab){
		var data   = get_data_images(tab);
		var thumbs = tab.querySelectorAll('.thumbs');
		
		for (i=0; i<thumbs.length; i++){
			var thumb = thumbs[i]; 
			thumb.index = i;
			thumb.onclick  = function(){
				var option = get_option(this);
				var gallery= new PhotoSwipe(pswpElement,PhotoSwipeUI_Default,data,option);
				gallery.init();
			};
			if (i==0) view_album = function(thumb,first_img){
				thumb.index = first_img;
				var option  = get_option(thumb);
				var gallery = new PhotoSwipe(pswpElement,PhotoSwipeUI_Default,data,option);
				gallery.init();
			};
			if (!shared) thumb.oncontextmenu= function(){return false;};
		}
	}

	var no_album = function(thumb,index){
		// thumb la the <img>, 
		// index bat dau thu may..
		alert("Album không được khởi tạo qua đây..");
	}


	//=======================MAIN========================================
	if (!shared) {
		pswpElement.querySelector(".pswp__button--share").style = "display:none";
		pswpElement.oncontextmenu = function(){return false;};
	}
	var items	= document.querySelectorAll('.image-albums');
	var len		= items.length;
	function map(f) {for (var i=0; i<len; i++) f(items[i]);};
	//-----------------------------------

	map(function(item){
		switch (item.getAttribute('album')){
			case "blog": new album_blog(item);   break;
			default:     new album_images(item); break;
		}
	});
	
	this.view_album = (view_album === null)? no_album : view_album; //call any where
} //ends class create_albums.

var view_album = null; //call any where view_album();