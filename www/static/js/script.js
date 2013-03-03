$(function () {

	// Notification Close Button
	$('.close-notification').click(
		function () {
			$(this).parent().fadeTo(350, 0, function () {$(this).slideUp(600);});
			return false;
		}
	);

	// jQuery Tipsy
	$('[rel=tooltip], #main-nav span, .loader').tipsy({gravity:'s', fade:true}); // Tooltip Gravity Orientation: n | w | e | s

	// jQuery Facebox Modal
	$('.open-modal').nyroModal();

	// jQuery jWYSIWYG Editor
	$('.wysiwyg').wysiwyg({ iFrameClass:'wysiwyg-iframe' });
	
	// jQuery dataTables
	$('.datatable').dataTable();

	// jQuery Custome File Input
	$('.fileupload').customFileInput();

	// jQuery DateInput
	$('.datepicker').datepick({ pickerClass: 'jq-datepicker' });

	// jQuery Data Visualize
	$('table.data').each(function() {
		var chartWidth = $(this).parent().width()*0.90; // Set chart width to 90% of its parent
		var chartType = ''; // Set chart type
			
		if ($(this).attr('data-chart')) { // If exists chart-chart attribute
			chartType = $(this).attr('data-chart'); // Get chart type from data-chart attribute
		} else {
			chartType = 'area'; // If data-chart attribute is not set, use 'area' type as default. Options: 'bar', 'area', 'pie', 'line'
		}
		
		if(chartType == 'line' || chartType == 'pie') {
			$(this).hide().visualize({
				type: chartType,
				width: chartWidth,
				height: '240px',
				lineDots: 'double',
				interaction: true,
				multiHover: 5,
				tooltip: true,
				tooltiphtml: function(data) {
					var html ='';
					for(var i=0; i<data.point.length; i++){
						html += '<p class="chart_tooltip"><strong>'+data.point[i].value+'</strong> '+data.point[i].yLabels[0]+'</p>';
					}	
					return html;
				}
			});
		} else {
			$(this).hide().visualize({
				type: chartType,
				width: chartWidth,
				height: '240px'
			});
		}
	});

	// Check all checkboxes
	$('.check-all').click(
		function(){
			$(this).parents('form').find('input:checkbox').attr('checked', $(this).is(':checked'));
		}
	)

	// IE7 doesn't support :disabled
	$('.ie7').find(':disabled').addClass('disabled');

	// Menu Dropdown
	// $('#main-nav li ul').hide(); //Hide all sub menus
	// $('#main-nav li.current a').parent().find('ul').slideToggle(0); // Slide down the current sub menu
	// $('#main-nav li a.no-submenu, #main-nav li li a').click(
	// 	function(e) {
	// 		window.location.href=(this.href); // Open link instead of a sub menu
	// 		return false;
	// 	}
	// );
	// $('#main-nav li a').each(function(index, element) {
	// 	if(!$(element).hasClass("no-submenu")) {
	// 		$(element).click(
	// 			function () {
	// 				$(this).parent().siblings().find('ul').slideUp('normal'); // Slide up all menus except the one clicked
	// 				$(this).parent().find('ul').slideToggle('normal'); // Slide down the clicked sub menu
	// 				return false;
	// 			}
	// 		);
	// 	}
	// });

	// Widget Close Button
	$('.close-widget').click(
		function () {
			$(this).parent().fadeTo(350, 0, function () {$(this).slideUp(600);}); // Hide widgets
			return false;
		}
	);

	// Table actions
	$('.table-switch').hide();
	$('.toggle-table-switch').click(
		function () {
			$(this).parent().parent().siblings().find('.toggle-table-switch').removeClass('active').next().slideUp(); // Hide all menus expect the one clicked
			$(this).toggleClass('active').next().slideToggle(); // Toggle clicked menu
			$(document).click(function() { // Hide menu when clicked outside of it
				$('.table-switch').slideUp();
				$('.toggle-table-switch').removeClass('active')
			});
			return false;
		}
	);

	// Image actions
	$('.image-frame').hover(
		function() { $(this).find('.image-actions').css('display', 'none').fadeIn('fast').css('display', 'block'); }, // Show actions menu
		function() { $(this).find('.image-actions').fadeOut(100); } // Hide actions menu
	);

		// Tickets
	$('.tickets .ticket-details').hide(); // Hide all ticket details
	$('.tickets .ticket-open-details').click( // On click hide all ticket details content and open clicked one
		function() {
			//$('.tickets .ticket-details').slideUp()
			$(this).parent().parent().parent().parent().siblings().find('.ticket-details').slideUp(); // Hide all ticket details expect the one clicked
			$(this).parent().parent().parent().parent().find('.ticket-details').slideToggle();
			return false;
		}
	);

	// Wizard
	$('.wizard-content').hide(); // Hide all steps
	$('.wizard-content:first').show(); // Show default step
	$('.wizard-steps li:first-child').find('a').addClass('current');
	$('.wizard-steps a').click(
		function() { 
			var step = $(this).attr('href'); // Set variable 'step' to the value of href of clicked wizard step
			$('.wizard-steps a').removeClass('current');
			$(this).addClass('current');
			$(this).parent().prevAll().find('a').addClass('done'); // Mark all prev steps as done
			$(this).parent().nextAll().find('a').removeClass('done'); // Mark all next steps as undone
			$(step).siblings('.wizard-content').hide(); // Hide all content divs
			$(step).fadeIn(); // Show the content div with the id equal to the id of clicked step
			return false;
		}
	);
	$('.wizard-next').click(
		function() { 
			var step = $(this).attr('href'); // Set variable 'step' to the value of href of clicked wizard step
			$('.wizard-steps a').removeClass('current');
			$('.wizard-steps a[href="'+step+'"]').addClass('current');
			$('.wizard-steps a[href="'+step+'"]').parent().prevAll().find('a').addClass('done'); // Mark all prev steps as done
			$('.wizard-steps a[href="'+step+'"]').parent().nextAll().find('a').removeClass('done'); // Mark all next steps as undone
			$(step).siblings('.wizard-content').hide(); // Hide all content divs
			$(step).fadeIn(); // Show the content div with the id equal to the id of clicked step
			return false;
		}
	);

	// Content box tabs and sidetabs
	$('.tab, .sidetab').hide(); // Hide the content divs
	$('.default-tab, .default-sidetab').show(); // Show the div with class 'default-tab'
	$('.tab-switch a.default-tab, .sidetab-switch a.default-sidetab').addClass('current'); // Set the class of the default tab link to 'current'

	if (window.location.hash && window.location.hash.match(/^#tab\d+$/)) {
		var tabID = window.location.hash;
		
		$('.tab-switch a[href='+tabID+']').addClass('current').parent().siblings().find('a').removeClass('current');
		$('div'+tabID).parent().find('.tab').hide();
		$('div'+tabID).show();
	} else if (window.location.hash && window.location.hash.match(/^#sidetab\d+$/)) {
		var sidetabID = window.location.hash;
		
		$('.sidetab-switch a[href='+sidetabID+']').addClass('current');
		$('div'+sidetabID).parent().find('.sidetab').hide();
		$('div'+sidetabID).show();
	}
	
	$('.tab-switch a').click(
		function() { 
			var tab = $(this).attr('href'); // Set variable 'tab' to the value of href of clicked tab
			if (tab.charAt(0) != '#')
				return true; // :fix: Page navigation leads to an exception
			$(this).parent().siblings().find('a').removeClass('current'); // Remove 'current' class from all tabs
			$(this).addClass('current'); // Add class 'current' to clicked tab
			$(tab).siblings('.tab').hide(); // Hide all content divs
			$(tab).show(); // Show the content div with the id equal to the id of clicked tab
			$(tab).find('.visualize').trigger('visualizeRefresh'); // Refresh jQuery Visualize
			$('.fullcalendar').fullCalendar('render'); // Refresh jQuery FullCalendar
			return false;
		}
	);

	$('.sidetab-switch a').click(
		function() { 
			var sidetab = $(this).attr('href'); // Set variable 'sidetab' to the value of href of clicked sidetab
			$(this).parent().siblings().find('a').removeClass('current'); // Remove 'current' class from all sidetabs
			$(this).addClass('current'); // Add class 'current' to clicked sidetab
			$(sidetab).siblings('.sidetab').hide(); // Hide all content divs
			$(sidetab).show(); // Show the content div with the id equal to the id of clicked tab
			$(sidetab).find('.visualize').trigger('visualizeRefresh'); // Refresh jQuery Visualize
			$('.fullcalendar').fullCalendar('render'); // Refresh jQuery FullCalendar
			
			return false;
		}
	);
	
	// Content box accordions
	$('.accordion li div').hide();
	$('.accordion li:first-child div').show();
	$('.accordion .accordion-switch').click(
		function() {
			$(this).parent().siblings().find('div').slideUp();
			$(this).next().slideToggle();
			return false;
		}
	);
	
	//Minimize Content Article
	/*
	$('article header h2').css({ 'cursor':'s-resize' }); // Minizmie is not available without javascript, so we don't change cursor style with CSS
	$('article header h2').click( // Toggle the Box Content
		function () {
			$(this).parent().find('nav').toggle();
			$(this).parent().parent().find('section, footer').toggle();
		}
	);*/
	
	// Progress bar animation
	$('.progress-bar').each(function() {
		var progress = $(this).children().width();
		$(this).children().css({ 'width':0 }).animate({width:progress},3000);
	});
	
	//jQuery Full Calendar
	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();
	
	$('.fullcalendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		},
		editable: true,
		events: [
			{
				title: 'All Day Event',
				start: new Date(y, m, 1)
			},
			{
				title: 'Long Event',
				start: new Date(y, m, d-5),
				end: new Date(y, m, d-2)
			},
			{
				id: 999,
				title: 'Repeating Event',
				start: new Date(y, m, d-3, 16, 0),
				allDay: false
			},
			{
				id: 999,
				title: 'Repeating Event',
				start: new Date(y, m, d+4, 16, 0),
				allDay: false
			},
			{
				title: 'Meeting',
				start: new Date(y, m, d, 10, 30),
				allDay: false
			},
			{
				title: 'Lunch',
				start: new Date(y, m, d, 12, 0),
				end: new Date(y, m, d, 14, 0),
				allDay: false
			},
			{
				title: 'Birthday Party',
				start: new Date(y, m, d+1, 19, 0),
				end: new Date(y, m, d+1, 22, 30),
				allDay: false
			},
			{
				title: 'Click for Walking Pixels',
				start: new Date(y, m, 28),
				end: new Date(y, m, 29),
				url: 'http://www.walkingpixels.com/'
			}
		]
	});

	//$(".chzn-select").chosen();
	
});

/** algospot customization **/
function history_revert(destination) {
	if(confirm("정말 덮어씌우시겠어요?")) {
		window.location.href = destination;
	}
}

function delete_problem(destination) {
	var choice = window.prompt("정말 삭제하시겠어요? 돌이킬 수 없습니다. 정말 삭제하시려면 'yes'를 입력하세요.", 'no');
	if(choice == 'yes') {
		console.log('choice', choice, 'dest', destination);
		window.location.href = destination;
	}
}

function history_diff(diff_path) {
	var diff1 = $('input:radio[name=diff1]:checked').val();
	var diff2 = $('input:radio[name=diff2]:checked').val();
	window.location.href = diff_path + "/" + diff1 + "/" + diff2;
}

function avatar_select(id) {
	$("#choice").val(id);
	$("#choiceform").submit();
}

function confirm_attachment_delete(table, url) {
	if(confirm("아 정말요?")) {
		$.ajax({url: url,
			success: function() {
				table.fnReloadAjax();
			},
			error: function() {
				alert("망했어요 삭제가 안돼요. 관리자에게 연락주심");
			}
		});
	}
	return false;
}

function insert_attachment_link(url) {
	var ext = url.split(".").pop().toLowerCase();
	var filename = url.split("/").pop();
	if(ext == "jpg" || ext == "png") 
		$("textarea[name=description]").insertAtCaret("![" + filename + "](" + url + ")");
	else
		$("textarea[name=description]").insertAtCaret("[" + filename + "](" + url + ")");
}

/** ace editor **/
var ace_instances = [];
var ace_theme_list = {
	chrome: 'Chrome',
	clouds: 'Clouds',
	clouds_midnight: 'Clouds Midnight',
	cobalt: 'Cobalt',
	crimson_editor: 'Crimson Editor',
	dawn: 'Dawn',
	dreamweaver: 'Dreamweaver',
	eclipse: 'Eclipse',
	idle_fingers: 'idleFingers',
	kr_theme: 'krTheme',
	merbivore: 'Merbivore',
	merbivore_soft: 'Merbivore Soft',
	mono_industrial: 'Mono Industrial',
	monokai: 'Monokai',
	pastel_on_dark: 'Pastel on dark',
	solarized_dark: 'Solarized Dark',
	solarized_light: 'Solarized Light',
	textmate: 'TextMate',
	twilight: 'Twilight',
	tomorrow: 'Tomorrow',
	tomorrow_night: 'Tomorrow Night',
	tomorrow_night_blue: 'Tomorrow Night Blue',
	tomorrow_night_bright: 'Tomorrow Night Bright',
	tomorrow_night_eighties: 'Tomorrow Night 80s',
	vibrant_ink: 'Vibrant Ink'
};
var ace_theme = new function() {
	var current_theme;
	this.get = function() { return current_theme; }
	this.set = function(new_theme)
	{
		if (current_theme == new_theme)
			return;

		current_theme = new_theme;
		var package_name = 'ace/theme/' + current_theme;
		var load_theme = function() {
			$.each(ace_instances, function(idx, elem) {
				elem.setTheme(package_name);
			});
		};
		if (!require(package_name))
			$.getScript('/static/js/ace/theme-' + current_theme + '.js', load_theme);
		else
			load_theme();

		$.cookie('editor_theme', current_theme, { path: '/', expires: 365 });
		$('.editor-theme-select').each(function() {
			$(this).val(current_theme);
		});
	};

	var last_theme = $.cookie('editor_theme');
	if (!last_theme)
		last_theme = 'chrome';
	this.set(last_theme);

	return this;
};

var delayed_event_handler = function(callback, interval) {
	var delayed = false;
	var queued = false;

	var caller = function() {
		delayed = false;
		if (!queued)
			return;
		queued = false;
		callback();
		setTimeout(caller, interval);
		delayed = true;
	};
	var resize_handler = function() {
		if (!queued)
		{
			queued = true;
			if (!delayed)
				caller();
		}
	};

	return resize_handler;
};

function aceize(textarea_id, options) {
	if ($.browser.msie && parseInt($.browser.version, 10) <= 8)
		return null; // hehehe

	options = options || {};
	
	var prev_textarea = $('#' + textarea_id);
	var div_id = textarea_id + '_aceized';
	var editor_div = 
		$('<div id="' + div_id + '" class="editor" />')
		.height(prev_textarea.height() + 30)
		.width(prev_textarea.width())
		.insertAfter(prev_textarea);

	prev_textarea.hide();
	var editor = ace.edit(div_id);
	editor.session.setValue(prev_textarea.val()); // editor.setValue() -> different behaviour wtf
	ace_instances.push(editor);

	var theme_select = $('<select class="editor-theme-select" />');
	for (var key in ace_theme_list)
	{
		if (!ace_theme_list.hasOwnProperty(key)) continue;
		var option = 
			$('<option />')
			.attr('value', key)
			.text(ace_theme_list[key])
			.appendTo(theme_select);
		if (key == ace_theme.get())
			option.attr('selected', 'selected');
	}
	var config_bar = $('<div class="editor-config"></div>')
		.insertAfter(editor_div);
	$('<label>테마: </label>')
		.append(theme_select)
		.appendTo(config_bar);

	theme_select.change(function() {
		ace_theme.set($(this).val());
	}).change();
	
	var wrap_btn = 
		$('<button type="button">줄바꿈 전환</button>')
		.prependTo(config_bar)
		.click(function(e) {
			var cur = editor.session.getUseWrapMode();
			editor.session.setUseWrapMode(!cur);
			return e.preventDefault();
		});

	editor.session.setUseSoftTabs(false);
	editor.session.setTabSize(4);
	editor.session.setUseWrapMode(true);
	editor.session.setWrapLimitRange(null, null);
	editor.renderer.setShowPrintMargin(false);
	editor.renderer.setShowGutter(!options.hide_gutter);
	editor.renderer.setShowInvisibles(true);

	var update_fn = function() {
		prev_textarea.val(editor.getValue());
	};

	editor_div.bind('keyup blur', update_fn);
	$(window).bind('beforeunload', update_fn);
	if (options.submit_handler)
		prev_textarea.closest('form').bind('submit', update_fn);

	// editor preview
	if (options.preview)
	{
		var preview_div =
			$('<div class="preview" />')
			.height(editor_div.height())
			.width(editor_div.width())
			.insertAfter(editor_div)
			.hide();
		var preview_heading = $('<header class="preview-heading"><h2>미리보기</h2></header>').appendTo(preview_div);
		var preview_inner_div = $('<div>').appendTo(preview_div);

		var is_preview = false;
		var preview_callback = function(e) {
			if (!is_preview)
			{
				editor_div.hide();
				preview_div.show();

				preview_inner_div.html(markdown(editor.getValue()));

				preview_btn.text('편집하기');
			}
			else
			{
				editor_div.show();
				preview_div.hide();

				preview_btn.text('미리보기');
			}
			is_preview = !is_preview;
			return e.preventDefault();
		};

		var preview_btn = $('<button type="button">')
			.text('미리보기')
			.prependTo(config_bar)
			.click(preview_callback);
	}

	// fullscreen editing
	if (options.fullscreen)
	{
		var fullscreen_div =
			$('<div id="' + textarea_id + '_fullscreen" class="fullscreen-editor"></div>')
			.appendTo(prev_textarea.closest('section'));
		fullscreen_div.overlay({
			closeOnClick: false,
			closeOnEsc: false,
			top: 0,
			left: 0,
			speed: 0,
			closeSpeed: 0
		});

		var button_bar = $('<form></form>')
			.append($('<button type="button" class="close">전체화면 닫기</button>'))
			.appendTo(fullscreen_div);

		if (options.cheatsheet)
		{
			var cheatsheet_on = false;
			var cheatsheet_div = 
				$('#' + options.cheatsheet)
				.clone()
				.insertBefore(button_bar)
				.hide()
				.attr('id', options.cheatsheet + '-cloned');

			var cheatsheet_btn = $('<button type="button">마크업 문법 도움말</button>')
				.prependTo(button_bar)
				.click(function(e) {
					if (!cheatsheet_on)
					{
						cheatsheet_div.show();
						if (preview_div)
							preview_div.hide();
						cheatsheet_btn.text('도움말 닫기');
					}
					else
					{
						cheatsheet_div.hide();
						if (preview_div)
							preview_div.show();
						cheatsheet_btn.text('마크업 문법 도움말');
					}
					$(window).resize();
					cheatsheet_on = !cheatsheet_on;

					return e.preventDefault();
				});
		}

		var fullscreen_wrap_btn = wrap_btn.clone(true).prependTo(button_bar);

		var fullscreen_callback = function(e) {
			$('html').css('overflow', 'hidden');

			var fullscreen_btn = $(this);
			fullscreen_btn.attr('disabled', 'disabled');
			var original_width = editor_div.width();
			var original_height = editor_div.height();

			if (options.preview && is_preview)
				preview_btn.click();

			if (options.preview)
			{
				var preview_update_fn = function() {
					preview_inner_div.html(markdown(editor.getValue()));
				};
				preview_div.prependTo(fullscreen_div).show();
				var update_handler = delayed_event_handler(preview_update_fn, 100);
				editor_div.bind('keyup change mouseup input textinput click', update_handler);
				preview_update_fn();
			}
			editor_div.prependTo(fullscreen_div);

			var queued = false;
			var delayed = false;
			var resize_elements = function() {
				if (!$.contains(fullscreen_div[0], editor_div[0]))
					return; // handling delayed jobs
				fullscreen_div.width($(window).width()).height($(window).height() - (fullscreen_div.innerHeight() - fullscreen_div.height()));
				var w = fullscreen_div.width();
				var h = fullscreen_div.height();
				if (preview_div || cheatsheet_on)
				{
					var half_w = (w - (w & 1)) / 2;
					editor_div.width(half_w).height(h);

					var delta_w = preview_div.outerWidth(true) - preview_div.width();
					var delta_h = preview_div.outerHeight(true) - preview_div.height();
					preview_div.width(half_w - delta_w).height(h - delta_h);
					cheatsheet_div.width(half_w - delta_w).height(h - delta_h);
				}
				else
					editor_div.width(w).height(h);
				editor.resize();
			};

			fullscreen_div.data('overlay').load();
			var resize_handler = delayed_event_handler(resize_elements, 100);
			$(window).resize(resize_handler).resize();

			var button = fullscreen_div.find('button.close');
			if (!button.hasClass('handler'))
			{
				button.click(function(e) {
					$(window).unbind('resize', resize_handler);
					$(fullscreen_div).data('overlay').close();
					editor_div
						.insertAfter(prev_textarea)
						.height(original_height)
						.width(original_width);
					if (preview_div)
					{
						preview_div
							.insertAfter(editor_div)
							.height(original_height)
							.width(original_width)
							.hide();
					}
					editor.resize();
					fullscreen_btn.attr('disabled', null);
					if (options.preview)
						editor_div.unbind('keyup change mouseup input textinput click', update_handler);
					$('html').css('overflow', '');

					return e.preventDefault();
				});
				button.addClass('handler');
			}

			return e.preventDefault();
		};

		$('<button type="button"></button>')
			.text('전체화면으로 편집')
			.prependTo(config_bar)
			.click(fullscreen_callback);
	}

	return editor;
}

/* insertAtCaret implementation */
$.fn.insertAtCaret = function (myValue) {
		return this.each(function(){
				//IE support
				if (document.selection) {
						this.focus();
						sel = document.selection.createRange();
						sel.text = myValue;
						this.focus();
				}
				//MOZILLA/NETSCAPE support
				else if (this.selectionStart || this.selectionStart == '0') {
						var startPos = this.selectionStart;
						var endPos = this.selectionEnd;
						var scrollTop = this.scrollTop;
						this.value = this.value.substring(0, startPos)
									  + myValue
							  + this.value.substring(endPos,
this.value.length);
						this.focus();
						this.selectionStart = startPos + myValue.length;
						this.selectionEnd = startPos + myValue.length;
						this.scrollTop = scrollTop;
				} else {
						this.value += myValue;
						this.focus();
				}
		});

};

/* spoilers */
$(function() {
	$('.spoiler').wrap('<p />');
	$('<span href="#" class="button-link show-spoiler">show spoiler</span>')
	    .insertBefore($('.spoiler'))
	    .click(function() {
	    	$(this).next().show();
	    	$(this).detach();
        });
});

/* fnReloadAjax implementation */

$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
{
	if ( typeof sNewSource != 'undefined' && sNewSource != null )
	{
		oSettings.sAjaxSource = sNewSource;
	}
	this.oApi._fnProcessingDisplay( oSettings, true );
	var that = this;
	var iStart = oSettings._iDisplayStart;
	
	oSettings.fnServerData( oSettings.sAjaxSource, [], function(json) {
		/* Clear the old information from the table */
		that.oApi._fnClearTable( oSettings );
		
		/* Got the data - add it to the table */
		for ( var i=0 ; i<json.aaData.length ; i++ )
		{
			that.oApi._fnAddData( oSettings, json.aaData[i] );
		}
		
		oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
		that.fnDraw( that );
		
		if ( typeof bStandingRedraw != 'undefined' && bStandingRedraw === true )
		{
			oSettings._iDisplayStart = iStart;
			that.fnDraw( false );
		}
		
		that.oApi._fnProcessingDisplay( oSettings, false );
		
		/* Callback user function - for event handlers etc */
		if ( typeof fnCallback == 'function' && fnCallback != null )
		{
			fnCallback( oSettings );
		}
	}, oSettings );
};

$(function() {
	function pad(str, len) {
		str = str.toString();
		while(str.length < len) {
			str = "0" + str;
		}
		return str;
	}
	var url = 'https://www.googleapis.com/calendar/v3/calendars/pl39rk6qf5h2bqvrjc7vqsqvtg%40group.calendar.google.com/events?maxResults=10&orderBy=startTime&singleEvents=true&pp=1&key=AIzaSyA2g8QdzZpfchYfJt2bFotADZAkB0EjLS8&timeMin=' + (new Date().toISOString()) + "&callback=?";
	$.getJSON(url, function(data) {
		var container = $("#calendar_events_container");
		var template = container.find(".template");
		for(var i in data.items) {
			var item = data.items[i];
			var entry = template.clone();
			entry.removeClass('template');
			if(i > 0) entry.addClass('separator');
			entry.find("a.anchor").html(item.summary).attr('href', item.htmlLink);
			// date only?
			if(item.start.date) {
				var d = new Date(item.start.date);
				entry.find('.starttime').html('(' + (d.getMonth() + 1) + '/' + d.getDate() + ')');
			}
			else {
				var d = new Date(item.start.dateTime);
				entry.find('.starttime').html('(' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + 
					pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ')');
			}

			entry.appendTo(container);
		}
	});

});
