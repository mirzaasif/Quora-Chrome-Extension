var result = null;

function openLink(link)
{
	url = "http://www.quora.com" + link;
	create = {"url": url};
	chrome.tabs.create(create);
	//setTimeout("hide();", 300);
	hide();
}

function openFullLink(link)
{
	create = {"url": link};
	chrome.tabs.create(create);
	hide();
}

function postThisPage()
{
	sendMessage({"data":"post"}, function(){});	
	hide();
}

function hide()
{
	$("#search_suggestion").css("display", "none");
	
	var views = chrome.extension.getViews({});
    for (var corey = 0; corey < views.length; corey++) 
    {		//Find pop.html in all of those pages
        if (views[corey].location.href == chrome.extension.getURL('popup.html')) 
        {
        	views[corey].close();																
        }
    }
}

function hideNotification()
{
	$("#notifications").css('display','none');
	//$("#recommendations").slideDown("fast");
	$("#recommendations").css("display", "block");
}

function showNotification()
{
	$("#recommendations").css('display','none');
	//$("#notifications").slideDown("fast");
	$("#notifications").css("display", "block");
}

function search()
{
	query = $("#search_input").val();
	if(query == "")
	{
		return;
	}
	
	element = $(".selected");
	if(element.length > 0)
	{
		element.click();
	}else
	{
		sendMessage({"data":"search", "query":query}, function(){});
		hide();
	}
}

function update()
{
	if(result != null)
	{
		$("#item_login").css("display", "none");
		$("#item_about").css("display", "none");
		$("#item_sign_up").css("display", "none");
		
		$("#item_notification").css("display", "block");
		$("#item_inbox").css("display", "block");
		$("#item_profile").css("display", "block");
		
		name = result.name.split(" ")[0];
		$("#item_profile a").html(name);
		
		notification = parseInt(result.notifs.unseen_aggregated_count);
		inbox = parseInt(result.inbox.unread_count);
				
		if(inbox > 0)
		{
			$("#item_inbox_count").css("display", "block");
			$("#item_inbox_count").text(inbox);
		}else
		{
			$("#item_inbox_count").css("display", "none");	
		}
		
		if(notification > 0)
		{
			$("#item_notification_count").css("display", "block");
			$("#item_notification_count").text(notification);
			showNotifications();
			
		}else
		{
			$("#item_notification_count").css("display", "none");
			$("#notifications").css("display", "none");
		}
		
	}else
	{
		$("#item_login").css("display", "block");
		$("#item_about").css("display", "block");
		$("#item_sign_up").css("display", "block");
		
		$("#item_notification").css("display", "none");
		$("#item_inbox").css("display", "none");
		$("#item_profile").css("display", "none");
		
		$("#item_profile a").html();
		
		$("#item_notification_count").css("display", "none");
		$("#item_inbox_count").css("display", "none");	
	}
}

function showNotifications()
{
	var html = "";
	var count = 0;
	for (i = 0; i < result.notifs.unseen.length; i++)
	{
		html += "<div class='separator'>&nbsp;</div>";	
		html += "<div>"+result.notifs.unseen[i]+"</div>";
		html += "<div class='separator'>&nbsp;</div>";
		html += "<div class='separator'>&nbsp;</div>";
		html += "<div class='separator' style='border-top:1px solid #C7C7C7;'>&nbsp;</div>";
		count++;
	}	
	
	if (count > 0)
	{
		$("#notification_content").html(html);
		$("#notification_content a").each(
			function()
			{
				if($(this).attr("href") == "#") //this element for action button. we dont need it in extension
				{
					$(this).remove();
				}else
				{
					$(this).click(function(){openFullLink($(this).attr("href"))});	
				}
			}
		);
	}else
	{
		html = "<div>There aren't any notifications at this moment.</div>";
		$("#notification_content").html(html);	
	}
}

function showProfile()
{
	if(result != null)
	{
		create = {"url": result.link};
		chrome.tabs.create(create);
		hide();	
	}
}

function showRecommendationLink()
{
	chrome.tabs.getSelected(null, function(tab) {
		request = {"request":"title"}
		chrome.tabs.sendRequest(tab.id, request, function(response)
		{
			title = response.response;
			try
			{
				message = {"data" : "recommendation", "title" : title};
				sendMessage(message, function(response)
					{
						count = 0;
						html = "";
							
						for (i = 0; i < response.all.length; i++)
						{
							if(response.all[i].title != "")
							{
								url = "http://www.quora.com"+response.all[i].url;
							
								html += "<div class='separator'>&nbsp;</div>";	
								//html += "<div style='font-size:11px;'>"+response.all[i].des+"</div>";
								html += "<div class='separator'>&nbsp;</div>";
								html += "<div>"+response.all[i].des+": <a href='#' onclick='openLink(&quot;"+response.all[i].url+"&quot;)'>"+response.all[i].title+"</a></div>";		
								html += "<div class='separator'>&nbsp;</div>";
								
								count++;	
							}			
						}

						if(count > 0)
						{
							$("#recommendation_content").html(html);
							//$("#recommendations").slideDown("fast");
							$("#recommendations").css("display", "block");	
						}
					}
				);	
			}catch(e)
			{
				alert(e.toString());
			}
			
		});
	});
}

function onLoad()
{
	sendMessage({"data": "login"}, function(response) {
  		result = response.result;
	  	update();
	  	showRecommendationLink();
	  	sendMessage({"data":"get_settings"}, function(response)
		{
			if(response.settings.setting1)
			{
				$("#settings1").attr("checked", "checked");
			}else
			{
				$("#settings1").removeAttr("checked");
			}
			
			if(response.settings.setting2)
			{
				$("#settings2").attr("checked", "checked");
			}else
			{
				$("#settings2").removeAttr("checked");
			}
			
			$("#block_url").val(response.settings.block_url);
			
		});	
	});
}

function handleArrows(code)
{
	var done = false;
	$(".suggestion_item").each(
		function()
		{
			if($(this).hasClass("selected") && !done)
			{
				if(code == 38)
				{
					next = $(this).prev();
				}else if(code == 40)
				{
					next = $(this).next();	
				}
				
				if(next.hasClass("suggestion_item"))
				{
					$(this).removeClass("selected");
					next.addClass("selected");
					item = document.getElementById(next.attr("id"));
					item.scrollIntoView(false);
				}
				
				done = true;
			}
		}
	);
}

searchTimer = null;
searchValue = null;

function focusSearch()
{
	$('#search_suggestion').slideDown("fast");
	searchTimer = setInterval("fetchSearchSuggesion();", 300)
}

function blurSearch()
{
	hideSuggestion();
	if(searchTimer != null)
	{
		clearInterval(searchTimer);	
		searchTimer = null;
	}
}

function fetchSearchSuggesion()
{
	query = $("#search_input").val().trim();
	
	if(query == searchValue)
	{
		return;
	}
	
	if(query == "")
	{
		searchValue = query;
		html = {"html":""};
		showSearchSuggestion(html);
		return;
	}
	
	searchValue = query;
	 
	d = new Date();
	time = d.getTime();
	$.ajax({
	  url: 'http://www.quora.com/ajax/full_navigator_results?q='+encodeURIComponent(query)+'&data=%7B%7D&___W2_parentId='+Math.random()+'&___W2_windowId='+Math.random(),
	  success: function( data ) {
	    showSearchSuggestion(data, time, query.toString());
	  },
	  cache: false
	});
}

lastUpdateTime = 0;

function showSearchSuggestion(data, time, query)
{
	
	if(time != null && time != undefined)
	{
		if(lastUpdateTime >= time)
		{
			return;
		}
	}else
	{
		d = new Date();
		time = d.getTime();
	}
	
	lastUpdateTime = time;
	
	
	$("#search_suggestion_original").html(data.html);
	
	$("#search_suggestion").html("");
	//link = array();
	count = 0;
	$("#search_suggestion_original a").each(
		function()
		{
			
			url = $(this).attr("href");
			text = $(this).find('.text');
			if(url != "#" && text.text() != "")
			{
				text = $(this).find('.text');
				des = $(this).find('.desc');
				img = $(this).find('img');
				if(count == 0)
				{
					div = "<div id='item_"+count+"' onclick='openLink(&quot;"+url+"&quot;)' class='suggestion_item selected'>";	
				}else
				{
					div = "<div id='item_"+count+"' onclick='openLink(&quot;"+url+"&quot;)' class='suggestion_item'>";
				}
				
				if(img.attr("src") != null)
				{
					div += "<div style='float:right;'><img src='"+img.attr("src")+"'/></div>"
				}
				div += "<div class='title'>"+text.html()+"</div>";
				div += "<div class='des'>"+des.text()+"</div>";
				div += "</div>";
				$("#search_suggestion").append(div);
				count++;
			}
		}
	);
	if(count == 0)
	{
		div = "<div class='note'>Find Questions, Boards, Topics and People</div>"
		$("#search_suggestion").append(div);
	}else
	{	
		if(query != null && query != undefined)
		{
			url = "/search?q="+query;
			div = "<div id='item_-1' onclick='openLink(&quot;"+url+"&quot;)' class='suggestion_item'>";
			div += "<div class='title'>Search: "+query+" on Quora</div>";
			div += "<div class='des'></div>";
			div += "</div>";
			$("#search_suggestion").append(div);
		}
	}
	
	$(".suggestion_item").each(
		function()
		{
			$(this).mouseover(
				function()
				{
					$(".selected").removeClass("selected");
					$(this).addClass("selected");
				}
			);
		}
	);
}

function hideSuggestion()
{
	$("#search_suggestion").slideUp("fast");
}


function onKeydown(e)
{
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	
	if(code == 38 || code == 40  || code == 37 || code == 39)
	{
		if(code == 38 || code == 40)
		{
			handleArrows(code);
			e.preventDefault();
			return true;
		}
	}
	return true;
}

function showSettings()
{
	$("#settings").slideDown("fast");
}

function hideSettings()
{
	$("#settings").slideUp("fast");
}

function changeSettings()
{
	blockUrls = $("#block_url").val().trim();
	
	if($("#settings1").attr('checked') == "checked")
	{
		setting1 = true;
	}else
	{
		setting1 = false;
	}
	
	if($("#settings2").attr('checked') == "checked")
	{
		setting2 = true;
	}else
	{
		setting2 = false;
	}
	
	settings = {"setting1" : setting1, "setting2": setting2, "block_url" : blockUrls};
	
	sendMessage({"data":"save_settings", "settings" : settings}, function(){});	
	
	$("#update_status").fadeIn().delay(3000).fadeOut();
}
