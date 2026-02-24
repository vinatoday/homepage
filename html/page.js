new function PageCalendar(){
	const calendar	= document.getElementById("calendar");
	let prevPage	= document.getElementById("prev");
	let currentPage	= document.getElementById("current");
	let nextPage	= document.getElementById("next");

	let currentDate		= new Date();
	let width			= window.innerWidth;
	let baseTranslate	= -width;

	let startX		= 0;
	let currentX	= 0;
	let startTime	= 0;
	let isDragging	= false;
	let direction	= 0; //<Hướng move (-1 = prev, 1 = next)




	/* ===== Render ===== */
		function setTranslate(x) {
		calendar.style.transform = "translateX(" + x + "px)";
	}


	function viewPage(page, date) {
		const date1  = date.toLocaleDateString("vi-VN");
		const weekly = date.toLocaleDateString("vi-VN", { weekday: "long" });
		page.innerHTML = '<div class="date">'   + date1  +'</div>'
						+'<div class="weekday">'+ weekly +'</div>';
	}


	function initPages() { //Khởi tạo ban đầu
		const prevDate = new Date(currentDate);
		const nextDate = new Date(currentDate);
		prevDate.setDate(prevDate.getDate() - 1);
		nextDate.setDate(nextDate.getDate() + 1);
		
		viewPage(prevPage, prevDate);
		viewPage(currentPage, currentDate);
		viewPage(nextPage, nextDate);
		
		setTranslate(baseTranslate);
	}

	initPages();
	
	
	



	/* ===== Swipe logic ===== */
	function getClientX(e) {
		if (e.touches && e.touches.length) {
			return e.touches[0].clientX;
		}
		if (e.changedTouches && e.changedTouches.length) {
			return e.changedTouches[0].clientX;
		}
		return e.clientX;
	}
	
	function setOrders(p, c, n){
		p.style.order = 0;
		c.style.order = 1;
		n.style.order = 2;
	}

	function touchStart(e){
		isDragging = true;
		startX = getClientX(e);
		currentX = startX;
		startTime = Date.now();
		calendar.style.transition = "none";
	}

	function touchMove(e){
		if (!isDragging) return;
		currentX = getClientX(e);
		const delta = currentX - startX;
		setTranslate(baseTranslate + delta);
	}

	function touchEnd(e){
		if (!isDragging) return;
		isDragging = false;

		currentX = getClientX(e);
		const delta = currentX - startX;
		const duration = Date.now() - startTime;
		const velocity = delta / duration;
		const shouldChange = Math.abs(delta) > width / 3 || Math.abs(velocity) > 0.5;
		calendar.style.transition = "transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)";
		if (shouldChange) {
			if (delta < 0) {
				direction = 1;
				setTranslate(-2 * width);
			} else {
				direction = -1;
				setTranslate(0);
			}
		} else {
			direction = 0;
			setTranslate(baseTranslate);
		}
	}
	
	
	
	calendar.addEventListener("transitionend", () => { //After animation
		if(direction === 0) return;
		calendar.style.transition = "none";

		if(direction === 1){ // NEXT
			currentDate.setDate(currentDate.getDate() + 1);
			const newNextDate = new Date(currentDate);
			newNextDate.setDate(newNextDate.getDate() + 1);
			viewPage(prevPage, newNextDate);

			// rotate order
			const temp = prevPage;
			prevPage = currentPage;
			currentPage = nextPage;
			nextPage = temp;

		} else { // PREV
			currentDate.setDate(currentDate.getDate() - 1);
			const newPrevDate = new Date(currentDate);
			newPrevDate.setDate(newPrevDate.getDate() - 1);
			viewPage(nextPage, newPrevDate);

			const temp = nextPage;
			nextPage = currentPage;
			currentPage = prevPage;
			prevPage = temp;
		}

		setOrders(prevPage, currentPage, nextPage);
		setTranslate(baseTranslate);
		direction = 0;
	});	

	
	if (window.PointerEvent) {
		calendar.addEventListener("pointerdown", touchStart);
		calendar.addEventListener("pointermove", touchMove);
		calendar.addEventListener("pointerup", touchEnd);
		calendar.addEventListener("pointercancel", touchEnd);
	} else {
		calendar.addEventListener("touchstart", touchStart, { passive: true });
		calendar.addEventListener("touchmove", touchMove, { passive: true });
		calendar.addEventListener("touchend", touchEnd);
		calendar.addEventListener("touchcancel", touchEnd);
	}	
	
	
	





	/* ===== Resize ===== */
	window.addEventListener("resize", () => {
		width = window.innerWidth;
		baseTranslate = -width;
		setTranslate(baseTranslate);
	});
}