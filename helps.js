		const readonly = textarea1.hasAttribute("readonly");
		const falock   = bt_setpass.classList.contains("fa-lock");
		
		if (this.locked){
			if (!readonly) this.setAttribute("readonly","yes");
			if (!falock) bt_setpass.classList.add("fa-lock");
			bt_open.textContent= "Open";
		} else {
			if (readonly) this.removeAttribute("readonly");
			if (falock) bt_setpass.classList.remove("fa-lock");
			bt_open.textContent= "Lock";
		}
