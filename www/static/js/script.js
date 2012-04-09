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
function wiki_revert(destination) {
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

function wiki_diff(diff_path) {
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
