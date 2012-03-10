var result = null;

function openLink(link)
{
	url = "http://www.quora.com/" + link;
	create = {"url": url};
	chrome.tabs.create(create);
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
	var views = chrome.extension.getViews({});
    for (var corey = 0; corey < views.length; corey++) 
    {		//Find pop.html in all of those pages
        if (views[corey].location.href == chrome.extension.getURL('popup.html')) 
        {
        	views[corey].close();					
         	break;												
        }
    }
}

function search()
{
	query = $("#searchInput").val();
	if(query == "")
	{
		return;
	}
	
	sendMessage({"data":"search", "query":query}, function(){});
	hide();
}

function showNotifications()
{
	
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
			$(".notifications").css("display", "none");
			$("#notification_content").html("");
		}
		
	}else
	{
		$("#item_login").css("display", "block");
		$("#item_about").css("display", "block");
		$("#item_sign_up").css("display", "block");
		
		$("#item_notification").css("display", "none");
		$("#item_inbox").css("display", "none");
		$("#item_profile").css("display", "none");
		
		$("#item_notification_count").css("display", "none");
		$("#item_inbox_count").css("display", "none");	
	}
}

function showNotifications()
{
	var html = "";
	for (i = 0; i < result.notifs.unseen.length && i < 2; i++)
	{
		html += "<div class='separator'>&nbsp;</div>";
		html += "<div>"+result.notifs.unseen[i]+"</div>";
		html += "<div class='separator'>&nbsp;</div>";
	}	
	
	$("#notification_content").html(html);
	$(".notifications").css("display", "block");
	
	$("#notification_content a").each(
		function()
		{
			$(this).click(function(){openFullLink($(this).attr("href"))});
		}
	);
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

function sendMessage(message, response)
{
	chrome.extension.sendRequest(message, response);
}

function onLoad()
{
	sendMessage({"data": "login"}, function(response) {
  		result = response.result;
	  	update();
	});
	chrome.browserAction.setTitle({"title": "Quora Charm"})
}