class start_window extends Listview {
	constructor(info){
		const mainTab    = new DomNode(document.body).add("div", {id: "mainTab", class : "noselect"});
		const container  = mainTab.add("div",   {id: "container"});
		const addressBar = container.add("div", {id: "addressBar"});
		const listview   = container.add("div", {id: "listview"});
		info.listview    = listview;
		super(info);
		
		this.about = "Update: 22/7/2024";
		this.xmlRequest = new XmlRequest("links/edit_request.php");
		this.setup_background(mainTab);
		this.setup_addressbar(addressBar);
	}
	//__________________________________________________________________________
	setup_background(mainTab){
		var select_file;
		//-----------------------------------
		const save_background = (picture) => {
			if (!this.info.owner || !confirm("Save background ?")) return;
			//var url_temp = URL.createObjectURL(picture);
			//body.style = 'background-image: url("'+url_temp+'")';
			
			var callback = (response) => {
				if (response.OK) location.reload(); 
					else alert(response.msg);
			};
			
			this.xmlRequest.startForm("save_background", callback);
			this.xmlRequest.add("picture",picture);
			this.xmlRequest.send(); 
		};
		
		const save_order = () => {
			if (!this.info.owner || !this.order_changed) return;
			if (!confirm("Save items on order ?")) return;
			var items_send = null;
			
			this.listview.map((item, index, arr) => {
				var id_item = item.getAttribute("id_item");
				if (items_send === null) items_send =  id_item + ""; else items_send += "|" + id_item;
			});
			var callback = (response) => {
				if (response.OK) {
					this.order_changed = false;
					alert("Ok, Order Is Saved.");
				} else alert(response.msg);
			};
			this.xmlRequest.startForm("save_order_items", callback);
			this.xmlRequest.add("id_items",items_send);
			this.xmlRequest.send(); 
		};
		
		
		const set_contextmenu = () => {
			var menu = new ContextMenu(mainTab);
			menu.add("MENU TABLINK");
			menu.add("📝 Add New",		() => { document.location.href = "links/edit.html?form=homepage"; });
			menu.add("💾 Save Order",	() => { save_order(); });
			menu.add("🌄 Background",	() => { if (this.info.owner) select_file.element.click(); });
			menu.add("🌏 About",		() => { alert(this.about); });
		};
		//------------------------------------------------------
		var bg = this.info.bg_color || "files/bg.jpg";
		mainTab.element.style = "background-image: url('" + bg + "')";
		
		set_contextmenu();
		select_file = new DomNode(document.body).add("input", { type : "file" });
		select_file.attr("accept","image/*"); //setAttribute("multiple","yes");
		select_file.attr("style","display:none");
		select_file.element.onchange = function(event){ save_background(this.files[0]); };	
		
		// extends Selector
		this.listview.element.parentElement.onmousedown = this.listview.element.onmousedown;
		this.listview.element.parentElement.parentElement.onmousedown = this.listview.element.onmousedown;
	}
	
	//__________________________________________________________________________
	setup_addressbar(addressBar) {
		var site_name	= addressBar.add("h1", {text : "🏡" + this.info.sitename, class : "addressbar-sitename noselect"});
		var btn_owner	= addressBar.add("a", {href : "links/edit.html?label=home", class : "addressbar-btn-owner noselect"});
		var wrap_edit	= addressBar.add("div",  {class : "addressbar-wrap-edit"});
		var edit		= wrap_edit.add("input", {class : "addressbar-edit", type : "text", placeholder : "Typing url.."});
		var btn_go		= wrap_edit.add("button", {text : "GO", class : "addressbar-btn-go"});
		const google	= "https://www.google.com/";
		
		site_name.onclick((event) => { edit_open(); });
		btn_go.onclick((event) => { goto_website(edit.element.value); });
		edit.element.addEventListener("keypress", (event) => {
			if (event.keyCode === 13){
				const search = edit.element.value;
				event.preventDefault();
				goto_website(search);
			}
		
		});
		
		var menu = new ContextMenu(site_name);
		menu.add("AddressBar");
		menu.add("📝 Typing url",		() => {edit_open();});
		menu.add("🌏 Google search",	() => {document.location.href = google;});
		
		const goto_website = (url) => {
			if (!url) return;
			var is_url = (/\.[a-zA-Z]{2,6}$/.test(url));
			var http = (/^(http)s*\:\/\//i.test(url));
			if (is_url || http){
				url = http ? url : "https://" + url;
			} else {
				url = google + "search?q=" + url;
			}
			document.location.href = url;
		};
		
		const edit_open = () => {
			wrap_edit.element.style.display = "block";
			window.addEventListener("mousedown", edit_close);
		};
		
		const edit_close = (event) => { // === body.onmousedown
			var on_edit = (event.target == edit.element || event.target == btn_go.element);
			if (!on_edit) {
				wrap_edit.element.style.display = "none";
			}
		};
		
		
	}
	
	//_____________________________________________________________________________________________________
	add_item(data){
		var popup = null;
		function ThisItem(data, element, parent){
		  this.data		= data;
		  this.element	= element;
		  this.remove	= () => {
			  if (popup) popup.destroy();
			  parent.listview.element.removeChild(element);
			  parent.items.splice(parent.items.indexOf(this), 1); //xoa no trong mang 
		  };
		}
		const newItem = this.listview.add("div", {class : "tablink-icons", title : data.name});
		newItem.attr("id_item", data.id_item);
		this.items.push(new ThisItem(data, newItem.element, this));
		//----------------------------------------------------
		
		
		const openLink = (new_window) => {
			if (new_window){
				if (!popup) {
					popup = new PopupWindow({
						icon		: data.icon, 
						caption		: data.name,
						size		: data.window_size,
						id_item		: data.id_item,
						xmlRequest	: this.xmlRequest,
						owner		: this.info.owner
					});
				}
				popup.open(data.url);
			} 
				else document.location.href = data.url;
		};
		
		const setting_item_ondrag = () => {
			newItem.element.draggable   = true;
			newItem.element.ondragstart = (event) => { this.item_drag = newItem.element; };
			newItem.element.ondragend   = (event) => { this.item_drag = null; };
			newItem.element.ondragover  = (event) => { if (this.item_drag) event.preventDefault(); };
			newItem.element.ondrop = (event) => {
				if (this.item_drag && this.item_drag != newItem.element){
					event.preventDefault();
					event.stopPropagation();
					this.listview.element.insertBefore(this.item_drag, newItem.element);
					this.order_changed = true;
					// nếu cần, cập nhật lại this.items ở đây.
				}
				this.item_drag = null;
			};
		};
		
		const setting_contextmenu = () => {
			var menu = new ContextMenu(newItem, () => {this.selectItem(newItem);}); 
			menu.add(data.name);
			menu.add("📚️ Open link",  (event) => {document.location.href = data.url;});
			menu.add("📚️ New Window", (event) => {openLink(true);});
			menu.add("📝 Edit link",  (event) => {document.location.href = "links/edit.html?form="+data.id_item;});
		};
		
		
		//------------------------------------------------------
		if (data.view_tbao) newItem.add("i", {text : data.view_tbao});
		newItem.add("span", {id : "img"}).attr("style", "background-image: url('"+data.icon+"')");
		newItem.add("span", {text : data.name});
		setting_item_ondrag();
		setting_contextmenu();
		newItem.onclick(() => { openLink(data.new_window); });
	}
	
	start_listview(){ //Call in Listview()
		this.info.items.forEach((item) => { this.add_item(item); });
	}
	
} //class.