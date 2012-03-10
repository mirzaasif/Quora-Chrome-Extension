function openLink(link)
{
	url = "http://www.quora.com/" + link;
	create = {"url": url};
	
	chrome.tabs.create(create)
}

function updateMenu(login)
{
	if(login)
	{
		$("#item_login").css("display", "none");
		$("#item_about").css("display", "none");
		$("#item_sign_up").css("display", "none");
		
		$("#item_notification").css("display", "block");
		$("#item_inbox").css("display", "block");
		$("#item_profile").css("display", "block");
	}else
	{
		$("#item_login").css("display", "block");
		$("#item_about").css("display", "block");
		$("#item_sign_up").css("display", "block");
		
		$("#item_notification").css("display", "none");
		$("#item_inbox").css("display", "none");
		$("#item_profile").css("display", "none");	
	}
}

function showProfile()
{
	updateMenu(false);
}

function onLoad()
{
	chrome.browserAction.setTitle({"title": "Quora Charm"})
}
