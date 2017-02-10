$(document).ready(function(){

	var sketch = document.querySelector('#sketch');
	var canvas = document.querySelector('#canvas');
	var tmp_canvas = document.createElement('canvas');
	//$('#paint-modal').css('visibility', 'hidden').show();
	canvas.width = $(sketch).width();
	canvas.height = $(sketch).height();
	//$('#paint-modal').css('visibility', 'visible').hide();
	tmp_canvas.width = canvas.width;
	tmp_canvas.height = canvas.height;

	var undo_canvas = [];
	var undo_canvas_len = 7;
	for (var i=0; i<undo_canvas_len; ++i) {
		var ucan = document.createElement('canvas');
		ucan.width = canvas.width;
		ucan.height = canvas.height;
		var uctx = ucan.getContext('2d');
		undo_canvas.push({'ucan':ucan, 'uctx':uctx, 'redoable':false});
	}

	var undo_canvas_top = 0; 

	var ctx = canvas.getContext('2d');
	var tmp_ctx = tmp_canvas.getContext('2d');
	tmp_canvas.id = 'tmp_canvas';
	sketch.appendChild(tmp_canvas);

	var mouse = {x: 0, y: 0};
	var start_mouse = {x:0, y:0};
	var eraser_width = 10; // deault eraser width
	var fontSize = '14px'; // default font size
	
	// Pencil Points
	var ppts = [];

	var something_selected = 0; // If tool is crop but there is no mouse move

	function hide_selection() {
		//console.log('hide selection');
		croparea.style.display = 'none';
		$('#crop-cancel-button').css('display', 'none');
		something_selected = 0;
	}

	var chosen_size = 2; // by default
	/* Drawing on Paint App */
	tmp_ctx.lineWidth = 3; // default
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';
	tmp_ctx.strokeStyle = 'black'; // default color
	tmp_ctx.fillStyle = 'black';

	// paint functions
	var paint_pencil = function(e) {

		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		//console.log(mouse.x + " "+mouse.y);
		// Saving all the points in an array
		ppts.push({x: mouse.x, y: mouse.y});

		if (ppts.length < 3) {
			var b = ppts[0];
			tmp_ctx.beginPath();
			//ctx.moveTo(b.x, b.y);
			//ctx.lineTo(b.x+50, b.y+50);
			tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx.fill();
			tmp_ctx.closePath();
			return;
		}
		
		// Tmp canvas is always cleared up before drawing.
		// This clearing is happening continuously, every time the mouse changes its position while drawing
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		tmp_ctx.beginPath();
		tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
		
		for (var i = 0; i < ppts.length; i++) 
			tmp_ctx.lineTo(ppts[i].x, ppts[i].y);
		
		tmp_ctx.stroke();
		
	};
	
	var paint_line = function(e) {

		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	tmp_ctx.beginPath();
    	tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
    	tmp_ctx.lineTo(mouse.x, mouse.y);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
	}

	var paint_square = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 		tmp_ctx.beginPath();
    	tmp_ctx.moveTo(start_mouse.x, start_mouse.y);

		var x = Math.min(mouse.x, start_mouse.x);
		var y = Math.min(mouse.y, start_mouse.y);
		var width = Math.abs(mouse.x - start_mouse.x);
		var height = Math.abs(mouse.y - start_mouse.y);
		tmp_ctx.strokeRect(x, y, width, height);
		tmp_ctx.closePath();
	}

	var paint_circle = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	var x = (mouse.x + start_mouse.x) / 2;
    	var y = (mouse.y + start_mouse.y) / 2;
 
    	//var radius = Math.max(Math.abs(mouse.x - start_mouse.x), Math.abs(mouse.y - start_mouse.y)) / 2;
    	var a = mouse.x - start_mouse.x;
    	var b = mouse.y - start_mouse.y;
    	var r = Math.sqrt(a*a + b*b);
 
	    tmp_ctx.beginPath();
    	//tmp_ctx.arc(x, y, radius, 0, Math.PI*2, false);
    	tmp_ctx.arc(start_mouse.x, start_mouse.y, r, 0, 2*Math.PI);
    	// tmp_ctx.arc(x, y, 5, 0, Math.PI*2, false);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
	}

	var paint_ellipse = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	var x = start_mouse.x;
    	var y = start_mouse.y;
    	var w = (mouse.x - x);
    	var h = (mouse.y - y);
 		
  		tmp_ctx.save(); // save state
        tmp_ctx.beginPath();

        tmp_ctx.translate(x, y);
        tmp_ctx.scale(w/2, h/2);
        tmp_ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);

        tmp_ctx.restore(); // restore to original state
        tmp_ctx.stroke();
        tmp_ctx.closePath();

	}

	var move_eraser = function(e){
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		var tmp_lw = tmp_ctx.lineWidth;
		var tmp_ss = tmp_ctx.strokeStyle;
		tmp_ctx.lineWidth = 1;
		tmp_ctx.strokeStyle = 'black';
		tmp_ctx.beginPath();
    	tmp_ctx.strokeRect(mouse.x, mouse.y, eraser_width, eraser_width);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
    	// restore linewidth
    	tmp_ctx.lineWidth = tmp_lw; // previous tool could be pencil or circle or whatever
    	tmp_ctx.strokeStyle = tmp_ss; // recollect the previous color and font size
	}

	var paint_text = function(e) {
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
     	mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	

    	var x = Math.min(mouse.x, start_mouse.x);
    	var y = Math.min(mouse.y, start_mouse.y);
    	var width = Math.abs(mouse.x - start_mouse.x);
    	var height = Math.abs(mouse.y - start_mouse.y);
     
    	textarea.style.left = x + 'px';
    	textarea.style.top = y + 'px';
    	textarea.style.width = width + 'px';
    	textarea.style.height = height + 'px';
     
    	textarea.style.display = 'block'; // change from none to block to make it visible
	}

	var paint_crop = function (e) {
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
     	mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	

    	var x = Math.min(mouse.x, start_mouse.x);
    	var y = Math.min(mouse.y, start_mouse.y);
    	var width = Math.abs(mouse.x - start_mouse.x);
    	var height = Math.abs(mouse.y - start_mouse.y);
     
    	croparea.style.left = x + 'px';
    	croparea.style.top = y + 'px';
    	croparea.style.width = width + 'px';
    	croparea.style.height = height + 'px';
     
    	croparea.style.display = 'block'; // change from none to block to make it visible

    	something_selected = 1;
	}

	var paint_eraser = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// erase from the main ctx
    	ctx.clearRect(mouse.x, mouse.y, eraser_width, eraser_width);
    	// tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	}

	
	// Choose tool
	tool = 'pencil';
	tools_func = {'pencil':paint_pencil, 'line':paint_line, 'square':paint_square, 
					'circle':paint_circle, 'ellipse':paint_ellipse, 'eraser':paint_eraser,
					'text':paint_text, 'crop':paint_crop};

	$('#tool-panel').on('click', function(event){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		// remove the mouse down eventlistener if any
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);

		var target = event.target,
			tagName = target.tagName.toLowerCase();
		
		if(target && tagName != 'button'){
			target = target.parentNode;
        	tagName = target.tagName.toLowerCase();
		}

		if(target && tagName === 'button'){
			tool = $(target).data('divbtn');

			if (tool === 'eraser') {
				tmp_canvas.addEventListener('mousemove', move_eraser, false);
				$(tmp_canvas).css('cursor', 'none');
			}
			else {
				tmp_canvas.removeEventListener('mousemove', move_eraser, false);	
				$(tmp_canvas).css('cursor', 'crosshair');
				tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
			}
		}
	});
	
	// Change color
	$('#color-panel').on('click', function(event){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		// remove the mouse down eventlistener if any
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);

		var target = event.target,
			tagName = target.tagName.toLowerCase();
		
		if(target && tagName != 'button'){
			target = target.parentNode;
        	tagName = target.tagName.toLowerCase();
		}

		if(target && tagName === 'button'){
			tmp_ctx.strokeStyle =  $(target).data('color');
			tmp_ctx.fillStyle =  $(target).data('color');
		}
	});


	// Mouse-Down 
	tmp_canvas.addEventListener('mousedown', function(e) {
		
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		start_mouse.x = mouse.x;
    	start_mouse.y = mouse.y;	
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

		if (tool === 'pencil') {
			tmp_canvas.addEventListener('mousemove', paint_pencil, false);
			ppts.push({x: mouse.x, y: mouse.y});
			paint_pencil(e);
		}
		
		if (tool === 'line') {
			tmp_canvas.addEventListener('mousemove', paint_line, false);
    	}

		if (tool === 'square') {
			tmp_canvas.addEventListener('mousemove', paint_square, false);	
		}
		
		if (tool === 'circle') {
			tmp_canvas.addEventListener('mousemove', paint_circle, false);
    		// Mark the center
    		
    		tmp_ctx.beginPath();
			//ctx.moveTo(b.x, b.y);
			//ctx.lineTo(b.x+50, b.y+50);
			tmp_ctx.arc(start_mouse.x, start_mouse.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx.fill();
			tmp_ctx.closePath();
			// copy to real canvas
			ctx.drawImage(tmp_canvas, 0, 0);	
		}

		if (tool === 'ellipse') {
			tmp_canvas.addEventListener('mousemove', paint_ellipse, false);
    	}

    	if (tool === 'text') {
    		tmp_canvas.addEventListener('mousemove', paint_text, false);
    		textarea.style.display = 'none'; // important to hide when clicked outside
    	}

    	if (tool === 'eraser') {
    		ctx.clearRect(mouse.x, mouse.y, eraser_width, eraser_width); // for single click erase	
    		tmp_canvas.addEventListener('mousemove', paint_eraser, false); // for mousedown erase
    		// erase from the main ctx
    		
    	}

    	if (tool === 'crop') {
    		tmp_canvas.addEventListener('mousemove', paint_crop, false);
    		//console.log('addEventListener paint_crop');
    	}
    	// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();
    	
	}, false);
		
	
	// crop-tool
	var croparea = document.createElement('textarea');
	croparea.id = 'crop_area';
	croparea.setAttribute('readonly', 'readonly');
	sketch.appendChild(croparea);

	// text-tool
	var textarea = document.createElement('textarea');
	textarea.id = 'text_tool';
	sketch.appendChild(textarea);


	textarea.addEventListener('mouseup', function(e) {
		tmp_canvas.removeEventListener('mousemove', paint_text, false);
	}, false);

	// set the color
	textarea.addEventListener('mousedown', function(e){
		textarea.style.color = tmp_ctx.strokeStyle;
		textarea.style['font-size'] = fontSize;
	}, false);
	

	textarea.addEventListener('blur', function(e) {
		var lines = textarea.value.split('\n');
		var ta_comp_style = getComputedStyle(textarea);
		var fs = ta_comp_style.getPropertyValue('font-size');
		
		var ff = ta_comp_style.getPropertyValue('font-family');

		tmp_ctx.font = fs + ' ' + ff;
		tmp_ctx.textBaseline = 'hanging';
 
		for (var n = 0; n < lines.length; n++) {
    		var line = lines[n];
     
    		tmp_ctx.fillText(
        		line,
        		parseInt(textarea.style.left),
        		parseInt(textarea.style.top) + n*parseInt(fs)
    		);    		
		}
 
		// Writing down to real canvas now
		ctx.drawImage(tmp_canvas, 0, 0);
		textarea.style.display = 'none';
		textarea.value = '';
		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

		// keep the image in the undo_canvas
		undo_canvas_top = next_undo_canvas(undo_canvas_top);
		var uctx = undo_canvas[undo_canvas_top]['uctx'];
		uctx.clearRect(0, 0, canvas.width, canvas.height);
		uctx.drawImage(canvas, 0, 0);
		undo_canvas[undo_canvas_top]['redoable'] = false;
	});

	// When resized by dragging the bottom-right dashed lines in the text area, the size of selection changes
	croparea.addEventListener('mouseup', function(e) {
		//console.log('removeEventListener paint_crop');
		tmp_canvas.removeEventListener('mousemove', paint_crop, false);
	}, false);

	croparea.addEventListener('blur', function(e) {
		//console.log('blur');
		hide_selection();
	}, false);



	tmp_canvas.addEventListener('mouseup', function() {
		// console.log('mouse up');
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);
		
		// Writing down to real canvas now
		// text-tool is managed when textarea.blur() event
		
		if (tool !=='text' && tool !== 'crop') {
			if (tool != 'eraser')
			  ctx.drawImage(tmp_canvas, 0, 0); // don't write in the case of eraser, coz we delete directly from the ctx
			// keep the image in the undo_canvas
			undo_canvas_top = next_undo_canvas(undo_canvas_top);
			var uctx = undo_canvas[undo_canvas_top]['uctx'];
			uctx.clearRect(0, 0, canvas.width, canvas.height);
			uctx.drawImage(canvas, 0, 0);
			undo_canvas[undo_canvas_top]['redoable'] = false;
		}

		if (tool === 'crop') {
			//console.log('removeEventListener paint_crop');
			// show crop-cancel-button only if there was a movemove previously, not a single mouse click
			if (something_selected) 
				$('#crop-cancel-button').css('display','block');
		}

		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		// Emptying up Pencil Points
		ppts = [];
	}, false);
	
	var next_undo_canvas = function(top) {
		if (top === undo_canvas_len-1)
			return 0;
		else
			return top+1;
	}

	var prev_undo_canvas = function(top) {
		if (top === 0) 
			return undo_canvas_len-1;
		else
			return  top-1;
	}

	// clear paint area
	$('#paint-clear').click(function(){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		// keep the image in the undo_canvas
		undo_canvas_top = next_undo_canvas(undo_canvas_top);
		var uctx = undo_canvas[undo_canvas_top]['uctx'];
		uctx.clearRect(0, 0, canvas.width, canvas.height);
		uctx.drawImage(canvas, 0, 0);
		undo_canvas[undo_canvas_top]['redoable'] = false;
	});


	// Change Size
	$('#choose-size .radio-group').on('click', function(){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		var s = $('input[name=size]:checked', '#choose-size').val();
		if (s==='1') {
			tmp_ctx.lineWidth = 1;
			eraser_width = 5;
			fontSize = '10px';
		}
		if (s==='2') {
			tmp_ctx.lineWidth = 3;
			eraser_width = 10;
			fontSize = '14px';
		}
		if (s==='3') {
			tmp_ctx.lineWidth = 6;
			eraser_width = 15;
			fontSize = '18px';
		}
		if (s==='4') {
			tmp_ctx.lineWidth = 10;
			eraser_width = 20;
			fontSize = '22px';
		}
	});

	// undo-redo tools
	$('#undo-tool').on('click', function(){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		var prev = prev_undo_canvas(undo_canvas_top);
		if (!undo_canvas[prev].redoable) {
			console.log(undo_canvas_top+' prev='+prev);
			var ucan = undo_canvas[prev]['ucan'];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(ucan, 0, 0);
			undo_canvas[undo_canvas_top].redoable = true;
			undo_canvas_top = prev;
		}
	});
	
	$('#redo-tool').on('click', function(){
		// very important to hide the croparea. Othewise clicking outside won't hide it.
    	hide_selection();

		var next = next_undo_canvas(undo_canvas_top);
		if (undo_canvas[next].redoable) {
			console.log(undo_canvas_top);
			var ucan = undo_canvas[next]['ucan'];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(ucan, 0, 0);
			undo_canvas[next].redoable = false;
			undo_canvas_top = next;
		}
	});

	$('#cancel-button').on('click', function() {
		hide_selection();
	});

	var crop_canvas = document.createElement('canvas');
	crop_canvas.id = 'crop_canvas';
	sketch.appendChild(crop_canvas);
	var c_ctx = crop_canvas.getContext('2d');	

	// Also called copy button
	$('#crop-button').on('click', function() {
		// Reset the Canvas! 
		
		var w = parseInt(croparea.style.width, 10); // selection width
		var h = parseInt(croparea.style.height, 10); // selection height
		var t = parseInt(croparea.style.top, 10);
		var l = parseInt(croparea.style.left, 10);
		crop_canvas.width = w;
		crop_canvas.height = h;
		
		c_ctx.drawImage(canvas, l, t, w, h, 0, 0, w, h);
		
		// Remove the selection text area
		hide_selection();
		
		// Copy selected image to the clipboard
		var dataURL = crop_canvas.toDataURL();
		// window.open(dataURL, '_blank');
		
		// To Copy to the clipboard
		// Create a textarea and set its contents to the text you want copied to the clipboard.
		// Append the textarea to the DOM.
		// Select the text in the textarea.
		// Call document.execCommand("copy")
		// Remove the textarea from the dom.
		var clipboard_textarea = document.createElement('textarea');
		clipboard_textarea.id = 'cliparea';
		sketch.appendChild(clipboard_textarea);
		$('#cliparea').val(dataURL);
		document.getElementById("cliparea").select();
		document.execCommand('copy');
		sketch.removeChild(clipboard_textarea);
		
		
		// Show the alert that content has been copied!
		$('#alert-bottom').addClass('in');
		// Remove the alert after 1.8s
		setTimeout(function(){
			$('#alert-bottom').removeClass('in');
		}, 1800);
	});

});