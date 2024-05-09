function KeyPad(element="edit1"){
	var edit1 =  document.getElementById(element);
		edit1.classList.add("textarea1");
	
	var add = function(el,text=0,id=0,cl=0,type=0){
		var obj = document.createElement(el);
		if (text) if (el == "input") obj.setAttribute("value",text); else obj.innerText = text;
		if (id) obj.setAttribute("id",id);
		if (cl) obj.setAttribute("class",cl);
		if (type) obj.setAttribute("type", type);
		this.appendChild(obj);
		return obj;
	};
	
	var tab =  edit1.parentElement; tab.add= add;
	var bt_show = tab.add("div",0,"bt_show","fa fa-keypad");
	
	var keypad  = tab.add("div",0,"keypad"); keypad.add= add;
	var caption = keypad.add("div",0,"caption"); caption.add= add;
	var caption1= caption.add("b",0,"caption1");
	var bt_close= caption.add("button","X","bt_close");

	var start_drag, start_mouse;
	function get_mouse(e){
		e = e || window.event;
		var x = e.pageX || e.clientX;
		var y = e.pageY || e.clientY;
		return {x: x, y: y};
	}
	function move(e){
		var new_mouse= get_mouse(e);
		var x = start_drag.left + (new_mouse.x - start_mouse.x);
		var y = start_drag.top  + (new_mouse.y - start_mouse.y);
		keypad.setAttribute("style","left:"+x+"px;top:"+y+"px");
		//if document.body.clientWidth ..
	}
	function drag(e){
		if (e.target.matches('input') || e.target.matches('button')) return;
		start_drag  = keypad.getBoundingClientRect();
		start_mouse = get_mouse(e);
		window.onmousemove= move;
	}
	function drop(){window.onmousemove= null;}
	keypad.onmousedown= drag;
	keypad.onmouseup=   drop;
	
	var form  = keypad.add("div",0,"form-wrap"); form.add= add;
	var user1 = form.add("input",0,"username1",0,"text"); form.add("br");
	var pass1 = form.add("input",0,"password1",0,"password");
	var bt_reset  = form.add("button","Reset",0,"keys keys2");
	var edit_active = pass1; pass1.focus();
	
	function key_insert(key){
		var el= edit_active;
		var start= el.selectionStart;
		var end= el.selectionEnd;
		var len= 1;
		el.focus();
		if (key=="<") {
			if (start==0 && end==0) return;
			if (start==end) start--;
			key= ""; len=0; 
		}
		const text= el.value;
		const before= text.substring(0, start);
		const after= text.substring(end, text.length);
		el.value= (before+key+after);
		el.selectionStart= el.selectionEnd= start+len;
	}
	
	var keys_wrap = keypad.add("div",0,"keys-wrap"); keys_wrap.add= add;
	function add_keys(ch){return keys_wrap.add("input",ch,"key-"+ch,"items-keypad","button");}
	
	user1.setAttribute("placeholder","Username..");
	pass1.setAttribute("placeholder","Password..");
	
	user1.onmousedown = function(){edit_active = this; this.focus();}
	pass1.onmousedown = function(){edit_active = this; this.focus();}
	
	keypad.setAttribute("style","display:none");
	keypad.visible = false;
	keypad.open= function(){
		this.setAttribute("style","display:block"); 
		this.visible = true; 
		bt_show.setAttribute("style","display:none");
	}
	keypad.close = function(){
		if (!this.visible) return; 
		this.setAttribute("style","display:none"); 
		this.visible= false;
		bt_show.setAttribute("style","display:block");
	}
	bt_close.onclick= function(){keypad.close();}

	var str ='1234567890<qwertyuiopasdfghjklzxcvbnm';
	var key,ch,classview; var keys= new Array();
	for (var i=0; i<str.length; i++){
		ch= str.charAt(i);
		key= add_keys(ch);
		classview= (i <= 10)? "keys keys1":"keys";
		key.setAttribute("class",classview);
		
		key.onclick= function(){key_insert(this.value);};
		if (i>10) key.oncontextmenu= function(){key_insert(this.value.toUpperCase());};
		
		if (ch=="<") {
			keys_wrap.add("br");
		} else if (ch=="p") {
			var bt_html= keys_wrap.add("button","Html",0,"keys keys2 fa fa-spin");
			keys_wrap.add("br");
		} else if (ch=="l"){
			var bt_caplock= keys_wrap.add("button","Caps Lock",0,"keys keys2");
			keys_wrap.add("br");
		}
		keys[i]= key;
	}
	
	bt_caplock.onclick = function(){
		var upper = (keys[11].value === "q");
		for (var i=11; i<keys.length; i++){
			var text = keys[i].value;
			text = upper? text.toUpperCase():text.toLowerCase();
			keys[i].value = text;
		}
	};
	
	var bt_check	= keys_wrap.add("button","*",0,"keys keys2");
	var bt_setpass	= keys_wrap.add("button","@",0,"keys keys2 fa");
	var bt_open		= keys_wrap.add("button","Open",0,"keys keys2");
	
	bt_html.setAttribute("title","View text in html.");
	bt_setpass.setAttribute("title","Set Password.");
	bt_check.setAttribute("title","Check keys and text.");
	bt_open.setAttribute("title","Open file.");
	bt_reset.onclick = function(){user1.value= ""; pass1.value= "";}
	keypad.oncontextmenu = function(){return false;}
	bt_check.onclick = function(){info1.check(edit1.value);};



	//____________________________________________________
	var info1 = new SaveInfo();
	edit1.locked = false;
	
	
	edit1.change = function(){
		const readonly= this.hasAttribute("readonly");
		const falock= bt_setpass.classList.contains("fa-lock");
		
		if (this.locked){
			if (!readonly) this.setAttribute("readonly","yes");
			if (!falock) bt_setpass.classList.add("fa-lock");
			bt_open.textContent= "Open";
		} else {
			if (readonly) this.removeAttribute("readonly");
			if (falock) bt_setpass.classList.remove("fa-lock");
			bt_open.textContent= "Lock";
		}
	};
	
	
	function view_html(text){
		tab.innerHTML=  "";
		var ifrw= tab.add("iframe",0,"notepad-iframe");
		ifrw = ifrw.contentWindow || ifrw.contentDocument.document || ifrw.contentDocument;
		ifrw.document.open();
		ifrw.document.write(text);
		ifrw.document.close();		
	}
	
	
	bt_html.onclick = function(){
		if (!edit1.locked) return;
		if (confirm("View Text in Html ?")) view_html(edit1.value);
	}
	
	bt_open.onclick = function(){
		if (user1.value.length<5) return alert("User cannot..");
		if (pass1.value.length<8) return alert("Pass cannot..");
		if (edit1.value.length<8) return alert("Text is short..");
		
		var text= edit1.value;
		var pass= user1.value + pass1.value;
		keypad.close();
		text= edit1.locked? info1.unlock(text,pass):info1.lock(text,pass);
		if (text === null) {user1.value=""; pass1.value=""; return;}
		
		edit1.locked= !edit1.locked;
		if (!edit1.locked && edit1.getAttribute("viewhtml")=="yes") return view_html(text);
		edit1.change();
		edit1.setAttribute("style","display:block");
		edit1.value= text;
	};
	
	
	//============================================
	caption1.textContent = "KeyPad.";
	user1.value = "Admin";
	
	edit1.setAttribute("placeholder","Edit content..");
	edit1.locked = (edit1.value=="")? false : (edit1.value.indexOf(INFO_SAVE,0) >= 0);
	edit1.change();
	edit1.setAttribute("style",(edit1.locked ? "display:none" : "display:block"));
	bt_show.onclick = function(){keypad.open();}
	bt_show.setAttribute("title","Show Keypad.");
	keypad.open();
} //ends class.	