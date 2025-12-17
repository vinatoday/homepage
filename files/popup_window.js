//__________________________________________________________________________
class ContextMenu {
	constructor(element_context, runView=null){
		this.root = new DomNode(document.body);
		this.menu = this.root.add("context-menu", {class : "noselect", style : "visibility:hidden"});
		this.attachTo(element_context, runView);
	}
	
	attachTo(element_context, runView){
		const onMousedown = (event) => {
			let tab = (event.target.matches("context-menu") || event.target.matches("context-item"));
			if (!tab) this.close(); // else for click on item
		}
		const onScroll = () => { this.close(); }
		const onResize = () => { this.close(); }
		const add_events = () => {
			window.addEventListener("mousedown",	onMousedown);
			window.addEventListener("scroll",		onScroll, true);
			window.addEventListener("resize",		onResize);
		};
		
		this.remove_events = () => {
			window.removeEventListener("mousedown",	onMousedown);
			window.removeEventListener("scroll",	onScroll, true);
			window.removeEventListener("resize",	onResize);
		};
		element_context.element.oncontextmenu = (event) => {
			event.stopPropagation();
			add_events();
			this.open(event);
			if (runView) runView();
			return false;
		};
	}
	
	add(caption, runClick=null){
		var item = this.menu.add("context-item", {text : caption});
		item.onclick((element) => {
			this.close();
			if (runClick) runClick();
		});
	}
	
	open(event) {
		const mouse = screen1.getMouse(event); //from out
		const size  = screen1.getSize();
		const Rect    = this.menu.element.getBoundingClientRect();
		var x = mouse.x; if (x + Rect.width  > size.width)  x = size.width  - Rect.width  - 10;
		var y = mouse.y; if (y + Rect.height > size.height) y = size.height - Rect.height - 10;
		Object.assign(this.menu.element.style, {left: `${x}px`, top: `${y}px`, visibility: "visible"});
	}
	
	close() {
		this.remove_events();
		this.menu.element.style.visibility = "hidden";
	}

	destroy(){
		this.close(); // đảm bảo gỡ sự kiện
		this.root.element.removeChild(this.menu.element);
	}
};



//______________________________________________________________________________________
class PopupWindow {
	constructor(data = {}){ //caption, icon, id_item ..
		this.data = data;
		this.tabPopup   = null;
		this.tabTaskbar = null;
		this.initTabs();
		
		this.popup		= this.tabPopup.add("div",{class : "popup-window"});
		this.status		= "normal";	
		this.order		= this.tabPopup.length;
		this.active		= false;
		this.btnTaskbar = null;	
		this.popupIsMax = false; 
		
		this.popup.element._this = this;
		this.popup.element.style.zIndex	  = this.order;
		this.popup.element.style.position = "fixed";
		
		this.caption		= null;
		this.iframe			= null;
		this.resize			= null;
		this.locked			= null;
		this.url_opened		= null;
		this.size_changed	= false;
		
		this.create_window();
		this.setting_move_and_resize();
		this.setting_taskbar_contextmenu();
		this.setWindowSize(data.size); 
	}
	
	initTabs(){
		if (typeof document.body.tabPopup == "undefined"){
			const root		= new DomNode(document.body);
			this.tabPopup	= root.add("div", { id : "tabPopup",   class : "noselect" });
			this.tabTaskbar	= root.add("div", { id : "tabTaskbar", class : "noselect" });
			document.body.tabPopup   = this.tabPopup;
			document.body.tabTaskbar = this.tabTaskbar;
		} else {
			this.tabPopup   = document.body.tabPopup;
			this.tabTaskbar = document.body.tabTaskbar;
		}
	}
	
	setWindowSize(size){
		size = size ? size : {width : 600, height : 300, left : 100, top : 100};
		if (screen1.width < 820) return;
		this.iframe.element.style.width		= size.width	+ "px";
		this.iframe.element.style.height	= size.height	+ "px";
		this.popup.element.style.left		= size.left		+ "px";
		this.popup.element.style.top		= size.top		+ "px";
	}
	
	save_windowsize(){
		if (this.size_changed && this.data.owner) {
			if (this.data.xmlRequest.running) return;
			if (this.popupIsMax) return;
			
			const size1 = this.popup.element.getBoundingClientRect();
			const size2 = this.iframe.element.getBoundingClientRect();
			const callback = (response) => {
				if (response.OK){this.size_changed = false;} else {alert(response.msg);}
			};
			this.data.xmlRequest.startForm("save_windowsize", callback);
			this.data.xmlRequest.add("id_item", this.data.id_item);
			this.data.xmlRequest.add("width",  Math.floor(size2.width));
			this.data.xmlRequest.add("height", Math.floor(size2.height));
			this.data.xmlRequest.add("left",   Math.floor(size1.left));
			this.data.xmlRequest.add("top",    Math.floor(size1.top));
			this.data.xmlRequest.send(); 
		}
	}
	
	
	
	setting_taskbar_contextmenu(){
		var menu = new ContextMenu(this.btnTaskbar);
		menu.add(this.data.caption);
		menu.add("🌄 Normal️",	(event) => { this.normal();	});
		menu.add("🌄 Mini",		(event) => { this.mini();	});
		menu.add("😔 Close",	(event) => { this.close();	});
	}
	
	checkPopup(){
		const size = this.popup.element.getBoundingClientRect();
		const screenWidth  = screen1.width;
		const screenHeight = screen1.height;
		
		let left	= size.left;
		let top		= size.top;
		let width	= size.width;
		let height	= size.height;
		
		if (left + width  > screenWidth) left = screenWidth  - width;
		if (top  + height > screenHeight) top = screenHeight - height;
		if (left<0) left = 0;
		if (top <0) top  = 0;
		
		this.popup.element.style.left = left + "px";
		this.popup.element.style.top  = top  + "px";
	}

	
	setting_move_and_resize(){
		var onMouseMove	= null;
		//------------------------------
		const onMouseUp = (event) => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
			this.locked.element.style.display = "none";
			this.checkPopup();
		};
		
		const addEvents = () => {
			window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
		};
		
		this.caption.element.onmousedown = (event) => {
			if (event.target.matches("button")) return;
			this.setActive();
			this.locked.element.style.display = "block";
			var start_drag  = this.popup.element.getBoundingClientRect();
			var start_mouse = screen1.getMouse(event); //from out
			
			// window.onmousemove finish from out  
			onMouseMove = (event) => { //call by window.onmousemove()
				var new_mouse = screen1.getMouse(event);
				var x = start_drag.left + (new_mouse.x - start_mouse.x);
				var y = start_drag.top  + (new_mouse.y - start_mouse.y);
				this.popup.element.style.left = x + "px";
				this.popup.element.style.top  = y + "px";
				this.size_changed = true;
			};
			addEvents();
		};
		
		this.resize.element.onmousedown = (event) => {
			this.setActive();
			this.locked.element.style.display = "block";
			var start_mouse = screen1.getMouse(event);
			var start_size  = this.iframe.element.getBoundingClientRect();
			
			onMouseMove = (event) => {
				var new_mouse = screen1.getMouse(event);
				var w = start_size.width  + (new_mouse.x - start_mouse.x);
				var h = start_size.height + (new_mouse.y - start_mouse.y);
				if ( w < 200 ) w = 200;
				if ( h < 100 ) h = 100;
				if ( w > screen1.width )  w = screen1.width;
				if ( h > screen1.height ) h = screen1.height;
				this.iframe.element.style.width  = w + "px";
				this.iframe.element.style.height = h + "px";
				this.size_changed = true;
			};
			addEvents();
		};
	}
	
	setWindow(status = "normal"){
		this.status = status;
		this.popup.setAttr("status_window", status);
		this.btnTaskbar.setAttr("status_window", status);
	}
	
	setActive(){
		if (this.active) return;
		this.setWindow("normal");
		var max_index	= this.tabPopup.length;
		var vitri		= this.order; //Xô về vị trí này..
		
		this.tabPopup.map((item, index, arr) => {
			var new_active	= (item == this.popup.element);
			var order2		= item._this.order;
			var new_index	= new_active ? max_index : ((order2 > vitri)? (order2-1) : order2);
			item._this.order	= new_index;
			item._this.active	= new_active; new_active = new_active ? "yes"  : "no"; 
			item.style.zIndex	= new_index; //hien_thi
			item.setAttribute("status_active",new_active); //hien_thi
			item._this.btnTaskbar.setAttr("status_active", new_active); //hien_thi
		});
	}
	
	open(url = null){
		if (url && url != this.url_opened) {
			this.iframe.element.src	= url;
			this.url_opened = url;
		}
		this.normal();
	}
	
	close(){
		this.save_windowsize();
		this.active	= false;
		this.url_opened	= null;
		this.iframe.src	= "";
		this.setWindow("close");
		this.find_other_active();
	}
	
	normal(){
		this.setActive();
	}
		
	max(){
		this.setActive();
		this.popupIsMax = !this.popupIsMax;
		if (this.popupIsMax) {
			const size1		= this.popup.element.getBoundingClientRect();
			const size2		= this.iframe.element.getBoundingClientRect();
			this.sizeNormal	= {width : size2.width, height: size2.height, left : size1.left, top : size1.top};
			if (this.sizeNormal.width  > (screen1.width  - 200)) this.sizeNormal.width  = screen1.width  - 200;
			if (this.sizeNormal.height > (screen1.height - 100)) this.sizeNormal.height = screen1.height - 100;
			this.setWindowSize({width : screen1.width, height: screen1.height, left : 0, top : 0});
		} else {
			this.setWindowSize(this.sizeNormal);
		}
	}
	
	mini(){
		this.active  = false;
		this.setWindow("mini");
		this.find_other_active();
	}
	
	find_other_active(){
		var find = null; 
		var max  = 0;
		this.tabPopup.map((item, index, arr) => {
			if (item._this.status == "normal" && item._this.order > max) {
				max  = item._this.order; 
				find = item;
			}
		});
		if (find) find._this.setActive();
	}

	create_window(){
		this.caption = this.popup.add("div", {class : "popup-caption"});
			var wrap = this.caption.add("div", {class : "caption-wrap-center"});
			wrap.add("div", {class : "caption-icon img-icons"}).setAttr("style", "background-image:url('"+this.data.icon+"')");
			wrap.add("div", {text : this.data.caption, class : "caption-text"}); // for change from other
			wrap = wrap.add("div", {class : "caption-wrap-right"});
			wrap.add("button", {text : "-", class : "caption-btn-mini"}).onclick(()	=> { this.mini();	});
			wrap.add("button", {text : "□", class : "caption-btn-max"}).onclick(()	=> { this.max();	});
			wrap.add("button", {text : "X", class : "caption-btn-close"}).onclick(()=> { this.close();	});
		var content = this.popup.add("div", {class : "popup-content"});
			this.iframe  = content.add("iframe", {class : "popup-iframe"});
			this.locked  = content.add("div", {class : "popup-locked"});
			this.resize  = content.add("div", {class : "popup-resize"});
		this.btnTaskbar  = this.tabTaskbar.add("div", {class : "taskbar-button", title : this.data.caption}); 
			this.btnTaskbar.onclick((event) => {
				if (event.target.matches("button")) return this.close();
				if (this.active) this.mini(); else this.normal();
			});
			this.btnTaskbar.add("span", {class : "taskbar-icon img-icons"}).setAttr("style","background-image:url('"+this.data.icon+"')");
			this.btnTaskbar.add("span", {text : this.data.caption, class : "taskbar-text"});
			this.btnTaskbar.add("button", {text : "[x]", class : "taskbar-btn-close"});
	}
	
	

	destroy(){
		this.tabPopup.map((item, index, arr) => {
			if (item._this.order > this.order) item._this.order -= 1;
		});
		this.tabPopup.element.removeChild(this.popup.element);
		this.tabTaskbar.element.removeChild(this.btnTaskbar.element);
	}		
}


//______________________________________________________________________________________
class Selector {
    constructor(listview){
		this.listview	= listview;
		this.items		= []; // {data, element, ..}
		this.selects	= []; // {data, element, ..}
		this.startIndex = -1; // for shiftKey
        this.initEvents();
    }

    initEvents() {
		const selector	= new DomNode(document.body).add("div", { 
			id:		"selector1", 
			style:	"visibility: hidden; position: fixed; z-index:999; background: rgba(0,0,255,.25); border: 1px solid #9933FF;" 
		});
        var selected	= null;
		var startMouse	= null;
		//-------------------------------
		const checkInSelector = () => {
			if (!selected) return;
			this.selects =[];
			this.items.forEach((item) => {
				const rect = item.element.getBoundingClientRect();
				const inSelector =
					rect.left < selected.left + selected.width  && rect.left + rect.width  > selected.left &&
					rect.top  < selected.top  + selected.height && rect.top  + rect.height > selected.top;
				if (inSelector) { this.selects.push(item); item.element.setAttribute("selected", "yes"); }
			});
		};
		
		const dragSelect = (e) => {
			const newPoint = screen1.getMouse(e);
			const x = Math.min(startMouse.x, newPoint.x);
			const y = Math.min(startMouse.y, newPoint.y);
			const w = Math.abs(newPoint.x - startMouse.x);
			const h = Math.abs(newPoint.y - startMouse.y);
			Object.assign(selector.element.style, {left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, visibility: "visible"});
			selected = { left: x, top: y, width: w, height: h };
		};
		const endSlect = (e) => {
			window.removeEventListener("mousemove", dragSelect);
			window.removeEventListener("mouseup",   endSlect);
			checkInSelector();
			selector.element.style.visibility = "hidden";
			selected = null;
		};
		//startSelect
		const parent = this;
		this.listview.element.onmousedown = function onMousedown(event){
            if (event.button !== 0 || event.target !== this) return;
            parent.unSelectAll();
			startMouse = screen1.getMouse(event);
            window.addEventListener("mousemove", dragSelect);
            window.addEventListener("mouseup",   endSlect);
        };
    }
	
	getList(inCase = null){
		if (!inCase) return this.selects;
		if (this.selects.length < 1) return [];
		var list = [];
		this.selects.forEach((item) => {
			switch (inCase){
				case "file-write":	if (item.data.only_read)  return; break;
				case "file-read":	if(!item.data.only_read)  return; break;
				case "only-file":	if (item.data.file_ext == "folder") return; break;
				case "file-tozip":	if (item.data.file_ext == "zip") return; break;
				case "file-zip":	if (item.data.file_ext != "zip") return; break;
				default: break;
			}
			list.push(item);
        });
		return list;
	};

    unSelectAll() {
		this.startIndex = -1;
        if (this.selects.length > 0){
			this.selects.forEach((item) => { item.element.removeAttribute("selected"); });
			this.selects = [];
		}
    }

    selectAll() {
		if (this.selects.length == this.items.length) return;
		this.selects = [];
        this.items.forEach((item) => {
            item.element.setAttribute("selected", "yes");
			this.selects.push(item);
        });
    }

    selectItem(thisItem, event = null) {
		 if (event && event.ctrlKey) {
			if (thisItem.element.hasAttribute("selected")) thisItem.element.removeAttribute("selected");
				else thisItem.element.setAttribute("selected", "yes");
			this.selects = [];
			this.items.forEach((item) => { if (item.element.hasAttribute("selected")) this.selects.push(item); });
		 } else if (event && event.shiftKey && this.startIndex >= 0){
			const endIndex	 = this.items.indexOf(thisItem);
			const [From, To] = this.startIndex < endIndex ? [this.startIndex, endIndex] : [endIndex, this.startIndex];
			this.selects = [];
			
			this.items.forEach((item) => { item.element.removeAttribute("selected"); });
			
			for (var i = From; i<= To; i++){
				const item = this.items[i];
				item.element.setAttribute("selected", "yes");
				this.selects.push(item);
			}
		 } else {
			this.unSelectAll();
			this.selects = [];
			thisItem.element.setAttribute("selected", "yes");
			this.selects.push(thisItem);
			this.startIndex = this.items.indexOf(thisItem);
		 }
    }
}


//______________________________________________________________________________________
class Listview extends Selector {
	constructor(info){
		super(info.listview); // [this.listview, this.iems, ..] in Selector()
		this.info			= info;
		this.item_drag		= null;
		this.order_changed	= false;
		this.view_album		= false;
		this.start_listview()
	}
	
	add_item(item){
		// add info.items
	}
	
	
	sort_items(column = "filename", increase = true){
		var n1, n2; const upon = "******";
		this.listview.setAttr("orderby", (column == "date") ? column : ((column == "size") ? column : "filename"));
		this.items.sort((a,b) => {
			var dir1 = (a.data.file_ext == "folder");
			var dir2 = (b.data.file_ext == "folder");
			switch (column){
				case "date": n1 = a.data.file_date; n2 = b.data.file_date; break;
				case "size": n1 = a.data.file_size;	n2 = b.data.file_size; break;
				case "ext":  
					n1 = dir1 ? upon+a.data.filename.toLowerCase() : a.data.file_ext;  
					n2 = dir2 ? upon+b.data.filename.toLowerCase() : b.data.file_ext;  
				break;
				default:
					n1 = dir1 ? upon+a.data.filename.toLowerCase() : a.data.filename.toLowerCase();
					n2 = dir2 ? upon+b.data.filename.toLowerCase() : b.data.filename.toLowerCase();
				break;
			}
			return increase ? ((n1 > n2)? 1 : -1) : ((n1 < n2)? 1 : -1);
		});
		this.items.forEach((item, index) => { item.element.style = "order:" + index; });
	}
	
	
	
	start_listview(){
		this.info.items.forEach((item) => { this.add_item(item); });
		this.sort_items();
	}
}