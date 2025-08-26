function KeyPad(pre_edit1){  
	const about		= "Editor.html";
	const datetime	= "12/5/2024";
	
	var edit1 = null, keypad = null, bt_open, user1, pass1;
	var edit_active = null;
	var tab1 = null;
	//-----------------------------
	//***************************************************	
	function add(element, id=0, text=0, class1=0, type=0, placeholder=0, title=0){
		element = document.createElement(element);
		if (id) element.setAttribute("id", id);
		if (type) element.setAttribute("type", type);
		if (class1) element.setAttribute("class", class1);
		if (placeholder) element.setAttribute("placeholder", placeholder);
		if (title) element.setAttribute("title", title);
		if (text) element.textContent = text;
		element.add = add;
		this.appendChild(element);
		return element;
	}
	
	//______________________________________________________________________________________
	var saveInfo = new function saveInfo(){
		const INFO_SAVE = "<infosave66>";
		const CH_KEYS  =  '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
		const STR_CODE = '$♪Ẵ&ỲÝỴÁJKL/,ỶỸỳỵÚỬỮưự*82=B!ệỨợCỰwq<ỚỢỞrty}ốộ^dfkMlz?ũƯỪềửẫữÍHDFồổ)ỗxcvQWă(Ệ#ụỀủấẲAS"È|ẺẼ{èé9ẹẻừ+ứẽÊ]ỄỊỈỤĨìíÉẸịỉĩ'
			+'ÒÓẳẵÂÕòóẮọỏ.õÔỐg4hj-ỔbẬẨẪnmỖôƠỜĐ@Ỡơ7ờuopaỂsởỡÀẠẢ36Ãà1áZXN[ậẩV~ạỒảãĂGUIặđ%ằTÌeEỘRO>P5ẶớầỦŨ:êỷỹÙếẦiẤâỌýỎểẰắY0ễùúẾ'
			+"	' _;" + String.fromCharCode(10);
		const MAX_CODE = STR_CODE.length;
		const MAX_KEY  = CH_KEYS.length;
		//----------------------------------------------------------
		
		function text_random(len){
			var text = ""; var index;
			for (var i= 1; i <= len; i++){
				index = Math.round(Math.random() * MAX_KEY) - 1;
				text += CH_KEYS.charAt(index);
			}
			return text;
		}	

		function getNextSymple(text,pass,isNext){
			var len = text.length; var lenPass = pass.length;
			var A,B, X, ch; var p2= Math.floor(0.3 * lenPass); var p3= 2*p2;
			var result = ""; var keyN= 0; 
			
			for (var i=0; i<len; i++){
				ch =  text.charAt(i); 
				A  = STR_CODE.indexOf(ch,0);
				if (A < 0) {result+= ch; continue;}
				
				X  =  pass.charCodeAt(keyN % lenPass);
				X += pass.charCodeAt((keyN + p2) % lenPass);
				X += pass.charCodeAt((keyN + p3) % lenPass);
				
				B = isNext? (A+X):(A-X);
				B = B % MAX_CODE; if (B<0) B += MAX_CODE;
				result += STR_CODE.charAt(B);
				keyN++;
			}
			return result;
		}

		function getNext(text,pass,isNext){
			const len = text.length;
			const okpass = getNextSymple(STR_CODE+STR_CODE,pass,true);
			
			if (isNext) {
				var len_random = Math.round(Math.random()*100); if (len<300) len_random+= (len<200)? 300 : 200; 
				var str_random = text_random(len_random);
				text+= INFO_SAVE+pass+INFO_SAVE +str_random;
				text = getNextSymple(text, okpass, true);
				text = INFO_SAVE+text;
			} else {		//--unlock---------------------
				const find  = text.indexOf(INFO_SAVE,0);
				const saved = (find >= 0);
				if (!saved) return {complete: false, textContent: "Không thể mở file này.."};
				text = text.substring(find+INFO_SAVE.length,text.length); 
				text = getNextSymple(text, okpass, false);
				pass = text.indexOf(INFO_SAVE + pass + INFO_SAVE, 0);
				if (pass < 0) return {complete: false, textContent: "Sai mật khẩu.."};
				text = text.substring(0,pass);
			}
			return {complete: true, textContent: text};
		}

		this.unlock = function(text,pass){
			return getNext(text,pass,false);
		}
	}	//saveInfo().


	//________________________________________________________________________________________		
	function complete_edit1(){
		edit1.opened = 0;
		//----------------------
		edit1.check_pass = function(){
			if (user1.value.length < 5) return "User cannot..";
			if (pass1.value.length < 8) return "Pass cannot..";
			if (this.value.length  < 8) return "Text is short..";
			return true;
		};
		
		
		edit1.open = function(){
			if (edit1.opened >= 2) return alert("Sai mật khẩu..");
			
			var ok_pass = this.check_pass(); if (!(ok_pass === true)) return alert(ok_pass);
			var pass    = user1.value + pass1.value;
			var info = saveInfo.unlock(this.value, pass); 
			
			if (info.complete === true) {
				tab1.innerHTML = info.textContent;
			} else {
				edit1.opened++; 
				alert(info.textContent);
			}
		};
	
	}

	//______________________________________________________________________________________	
	function complete_keypad(){
		//---------------------------
		
		keypad.oncontextmenu = function(){
			return false; // no popup khi right click
		};
		
		keypad.caplock = function(){
			var upper = (this.keys[11].textContent === "q");
			for (var i=11; i<this.keys.length; i++){
				var text = this.keys[i].textContent;
				this.keys[i].textContent = upper? text.toUpperCase() : text.toLowerCase();
			}
		};
	}
	
	//__________________________________________________________________________
	function key_insert(key){
		var edit  = edit_active;
		if (edit == edit1 && edit1.locked) return alert("edit1 is locked..");
		
		var start = edit.selectionStart;
		var end   = edit.selectionEnd;
		var len   = 1;
		
		if (key == "<") {
			if (start == 0 && end == 0) return;
			if (start == end) start--;
			key = ""; len = 0; 
		}
		const text	 = edit.value;
		const before = text.substring(0, start);
		const after	 = text.substring(end, text.length);
		
		edit.value = (before + key + after);
		edit.selectionStart = edit.selectionEnd = start + len;
		edit.focus();
	}
	
	//__________________________________________________________________________
	this.create = function(){
		//-------------------------------
		edit1 = document.getElementById(pre_edit1); 
		if (!edit1) return;
		tab1 = edit1.parentElement;
		tab1.add = add;
		
		edit1.locked = true;
		complete_edit1();
		
		keypad	= tab1.add("div","keypad");
		bt_show	= tab1.add("div","bt_show","📖");
		bt_show.style.visibility = "hidden";
		keypad.keys		= new Array();
		complete_keypad();
						
		var wrap1 = keypad.add("div","wrap1");
		var wrap2 = keypad.add("div","wrap2");
		
		user1 = wrap1.add("input","user1",0,0,"text", "Username..");
		pass1 = wrap1.add("input","pass1",0,0,"password", "Password..");
		
		const str ='1234567890<qwertyuiopasdfghjklzxcvbnm';
		for (var i=0; i<str.length; i++){
			const ch  = str.charAt(i);
			const class_view = (i <= 10)? "keypad-keys keypad-line-1" : "keypad-keys";
			var   key = wrap2.add("button", "key-" + ch, ch, class_view);
			key.onclick = function(){key_insert(this.textContent);};
			if (i>10) key.oncontextmenu = function(){key_insert(this.textContent.toUpperCase());};
			
			switch (ch){
				case "<": wrap2.add("br"); break;
				case "p": var bt_caplock = wrap2.add("button","bt_caplock","Caps","keypad-keys"); wrap2.add("br"); break;
				case "l": wrap2.add("br"); break;
				default: break;
			}
			keypad.keys[i] = key;
		}
		
		bt_open  = wrap2.add("button","bt_open","📁Opened","keypad-keys"); 
		bt_open.onclick = function(){edit1.open();};
		bt_caplock.onclick	= function(){keypad.caplock();};
		
		var get_edit = function(){edit_active = this; this.focus();};
		user1.onmousedown = get_edit;
		pass1.onmousedown = get_edit;
		edit_active = user1;
	}//create().
}