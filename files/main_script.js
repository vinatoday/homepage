window.onerror = function(msg,url,line) {alert(msg + ", " + url + "(" + line + ")");}
const strToInt   = (s) => { var num = parseInt(s);   return (isNaN(num))? 0 : num; };
const strToFloat = (s) => { var num = parseFloat(s); return (isNaN(num))? 0 : num; };
const gotoLink = (url) => { document.location.href = url; };
const nocontext = (event) => { event.stopPropagation(); return false; };
const about = () => { alert("Datetime: 20/6/2020"); };
//=====================================================================================================


class ComputerScreen {
	constructor() {}
	get width() { return window.innerWidth;  }
	get height(){ return window.innerHeight; }
	
	getSize(){ return { width : window.innerWidth, height : window.innerHeight }; }
	getMouse(event){ return {x : event.clientX, y : event.clientY}; }
	
	setCookie(name, value, expiredays = 365){
		const exdate = new Date();
		exdate.setDate(exdate.getDate() + expiredays); //cong them so ngay het han
		document.cookie = (name + "=" + escape(value))
			+ ";expires=" + exdate.toGMTString();
	}

	getCookie(name){
		if (document.cookie.length <= 0) return "";
		var start, end;
		start = document.cookie.indexOf(name + "=");  if (start == -1) return "";
		start = start + name.length + 1; 
		end   = document.cookie.indexOf(";", start);   
		if (end == -1) end = document.cookie.length;   
		return unescape(document.cookie.substring(start, end));
	}
	
	cookie(name, value = null, expiredays = 365){
		if (value === null) return this.getCookie(name);
			else { this.setCookie = (name, value, expiredays); return this; }
	}
	
	deleteCookie(name){
		this.setCookie(name, "", -365);
	}
}


//______________________________________________________________________________________
class DomNode {
	constructor(el) {
		this.element = el;
	}
	add(tagName, options = {}, addon = "end") {
		const el = document.createElement(tagName);
		if (options.id)				el.id			= options.id;
		if (options.name)			el.name			= options.name;
		if (options.value)			el.value		= options.value;
		if (options.text)			el.textContent	= options.text;
		if (options.class)			el.className	= options.class;
		if (options.type)			el.type			= options.type;
		if (options.placeholder)	el.placeholder	= options.placeholder;
		if (options.title)			el.title		= options.title;
		if (options.style)			el.style		= options.style;
		if (options.href)			el.href			= options.href;
		if (options.onclick)		el.onclick		= options.onclick;
		if (addon === "before") this.element.insertBefore(el, this.element.childNodes[0]);
			else this.element.appendChild(el);
		return new DomNode(el);
	}
	
	html(text = null){
		if (text === null) return this.element.innerHTML;
			else { this.element.innerHTML = text; return this; }
	}
	
	text(content = null){
		if (content === null) return this.element.textContent;
			else { this.element.textContent = content; return this; }
	}
	
	setText(text){
		this.element.textContent = text;
		return this;
	}
	
	attr(name, value = null){
		if (value === null) return this.element.getAttribute(name);
			else { this.element.setAttribute(name, value); return this; }
	}
	
	setAttr(name, value){
		this.element.setAttribute(name, value);
		return this;
	}
	
	click(callback = null){
		if (callback) this.element.onclick = callback;
			else this.element.click();
	}
	
	onclick(callback){
		this.element.onclick = callback;
		return this;
	}
	
	get length(){
		return this.element.childNodes.length;
	}
	
	map(callback){
		Array.from(this.element.childNodes).forEach((item, index, arr) => {
			callback(item, index, arr);
		});
	}
	
	forEach(callback){
		Array.from(this.element.childNodes).forEach((item, index, arr) => {
			item = new DomNode(item);
			callback(item, index, arr);
		});
	}
	
	query(str){
		const result = this.element.querySelector(str);
		return new DomNode(result);
	}
	
	scrollHere(){
		const pageHtml	= (document.documentElement || document.body);
		const height	= pageHtml.clientHeight;
		const element	= this.element.getBoundingClientRect();
		const scrolled	= document.documentElement.scrollTop || window.pageYOffset;
		var scrollTo	= scrolled + element.top;
		if (element.height < height){ let center = (height - element.height) / 2; scrollTo -= center; }
		pageHtml.scrollTop = scrollTo;
	}
	
}



//______________________________________________________________________________________
class UserUpdate {
	constructor(){
		this.xml  = new XmlRequest("blog_request.php");
	}
	
	logout_item(el,id) {
		if (this.xml.running) return alert("Đang gửi Data..");
		if (!confirm("Thoát đăng nhập này?")) return;
		
		const item		= el.parentElement.parentElement.parentElement.parentElement;
		const id_item	= item.getAttribute("id_item");
		
		this.xml.startForm("logout_item", (response) => {
			if (response.OK) item.style.display='none'; else alert(response.msg);
		});
		this.xml.add("id_item",id_item);
		this.xml.send();
	}
}


//______________________________________________________________________________________
class XmlRequest {
	constructor(urlRequest){
		this.urlRequest	= urlRequest;
		this.xml		= new XMLHttpRequest();
		this.callback	= null;
		this.data		= null;
		this.running	= false;
		this.xml.onerror = () => { this.running = false; };
		this.xml.onload  = () => {
			this.running = false;
			const result = this.getResult(this.xml.responseText);
			this.callback(result);
		};
	}
	
	getResult(text){
		try {
			return JSON.parse(text);
		} catch(e){
			return {OK : false, msg : text};
		}
	}

	startForm(formName, callback, progress = null){
		if (this.running) return alert("Đang gửi...");
		this.data = new FormData();
		this.data.append("xml_send", formName);
		this.callback  = callback;
		this.xml.onprogress = progress;
	}

	add(item, value){
		if (this.running) return alert("Đang gửi...");
		this.data.append(item, value);
	}

	abort(){
		if (this.running) {
			this.xml.abort();
			this.running = false;
		}
	}
	
	send(){
		if (this.running) return alert("Đang gửi..."); else this.running = true;
		this.xml.open("POST", this.urlRequest);
		this.xml.send(this.data);
	}
}


//===================================================================
const screen1 = new ComputerScreen();