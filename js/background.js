var result = null;
var lastUpdate = 0;
var lastException = null;
var updateInterval = 60000;
		
function checkLogin()
{
	url = "http://api.quora.com/api/logged_in_user?fields=inbox,notifs";
	$.ajax({
	  url: url,
	  cache: false,
	  dataType: "text",
	  success: function(html)
		  {
	   		try
			{
				result = JSON.parse(html.match(/{.*}/));
			}catch(ex)
			{
				lastException = ex;
			}finally
			{
				update();
			}  	   
		 },
	 error: function(jqXHR, textStatus, errorThrown)
	 	{
	 	},
	 timeout: 15000
	});
}
			
function live()
{
	checkLogin();
}
			
function userNotLoggedIn()
{
	//updateBadgeText("");
}
			
function userLoggedIn()
{
	if(null == result)
	{
		return; 
	}
	
	notifications = parseInt(result.notifs.unseen_aggregated_count);
	inbox = parseInt(result.inbox.unread_count);
	
	badge = "";

if(notifications > 0 && inbox > 0)
{
	badge = notifications.toString() + "/" + inbox.toString();
	}
	else if(notifications > 0)
	{
		badge = notifications.toString();	
	}
	else if (inbox > 0)
	{
		badge = inbox.toString();	
	}
	updateBadgeText(badge);
}
			
function update()
{
	d = new Date();
	now = d.getTime();
	lastUpdate = now;
	if(null == result)
	{
		userNotLoggedIn();
	}else
	{
		userLoggedIn();
	}
}
					
function createContextMenu()
{
	chrome.contextMenus.create({"title":"Post to Quora", "onclick": contextPost});
	chrome.contextMenus.create({"title":"Post this link to Quora", "onclick": contextPostUrl, "contexts":["link"]});
	chrome.contextMenus.create({"title":"Post this image to Quora", "onclick": contextPostImage, "contexts":["image"]});
	chrome.contextMenus.create({"title":"Search on Quora", "onclick": contextSearch, "contexts":['selection']});
}
			
function contextPostUrl(clickInfo, tab)
{
	if(clickInfo.linkUrl != null && clickInfo.linkUrl != "")
	{
		postToQuora(clickInfo.linkUrl);
	}
}
			
function contextPostImage(clickInfo, tab)
{
	if(clickInfo.srcUrl != null && clickInfo.srcUrl != "")
	{
		postToQuora(clickInfo.srcUrl);
	}
}
			
function contextSearch(clickInfo, tab)
{
	if(clickInfo.selectionText != null && clickInfo.selectionText != "")
	{
		searchOnQuora(clickInfo.selectionText);
	}
}
			
function contextPost(clickInfo, tab)
{
	postToQuora(tab.url);
}
			
function postToQuora(url)
{
	link = "http://www.quora.com/board/bookmarklet?v=1&url="+encodeURIComponent(url);	
	window.open(link,'_blank','toolbar=0,scrollbars=no,resizable=1,status=1,width=430,height=400');	
}


function postToQuoraWithGroupName(url, name)
{
	link = "http://www.quora.com/board/bookmarklet?v=1&url="+encodeURIComponent(url);	
	
	object = {url: link, width: 430, height: 400, focused: true, type: "popup"  };

	chrome.windows.create(object, function(win)
		{
			chrome.tabs.getSelected(win.id, function(tab) 
		    	{
		    		setTimeout(function()
		    		{
		    			request = {"request":"post", "name":name};
						chrome.tabs.sendRequest(tab.id, request, function(response)
							{
								
							}
						);
		    		}, 2000);
				}
			);
		}
	);
}
			
function searchOnQuora(topic)
{
	url = "http://www.quora.com/search?q="+encodeURIComponent(topic);
	create = {"url": url};
	chrome.tabs.create(create);
}

function getRecoomendationSuccess(data, sendResponse)
{
  	$("#result").html(data.html);
  	responseData = new Object();
  	responseData.board = [];
  	responseData.topic = [];
  	responseData.question = [];
  	responseData.profile = [];
  	responseData.all = [];
  	
  	$("#result a").each(
  		function()
  		{
  			href = $(this).attr("href");
  			text = $(this).find('.text').text();
			des = $(this).find('.desc').text();
			if(des == "")
			{
				des = $(this).find('.faded').text();
				index = text.lastIndexOf(des);
				if(index > -1)
				{
					text = text.substr(0, index - 1);
				}
			}
			img = $(this).find('img');
			if(img.length > 0)
			{
				img = img.attr("src");
			}else
			{
				img = null;
			}
			
			if(href != "" && href != "#")
			{
				obj = {"url": href, "title": text, "des": des, "img": img};
			
				type = "Etc";
				if($(this).parent().hasClass("board"))
				{
					responseData.board[responseData.board.length] = obj;
					type = "Board";
				}else if($(this).parent().hasClass("topic"))
				{
					responseData.topic[responseData.topic.length] = obj;
					type = "Topic";
				}else if($(this).parent().hasClass("question"))
				{
					responseData.question[responseData.question.length] = obj;
					type = "Question";
				}else if($(this).parent().hasClass("profile"))
				{
					responseData.profile[responseData.profile.length] = obj;
					type = "Profile";
				}
				
				if(des == "")
				{
					des = type;
				}
				
				obj = {"url": href, "title": text, "des": des, "img": img, "type": type};
				
				responseData.all[responseData.all.length] = obj;	
			}	
  		}
  	);
    sendResponse(responseData);
}

function getRecommendation(title, sendResponse)
{
	if(title == "" || title == null)
	{
		return;
	}
	
	data = checkCache("Title:"+title);
	
	if(data == null)
	{
		$.ajax({
		  url: 'http://www.quora.com/ajax/full_navigator_results?q='+encodeURIComponent(title)+'&data=%7B%7D&___W2_parentId='+Math.random()+'&___W2_windowId='+Math.random(),
		  success: function(data)
		  {
		  	getRecoomendationSuccess(data, sendResponse);
		  	updateCache("Title:"+title, data);
		  },
		  cache: false
		});
	}else
	{
		getRecoomendationSuccess(data, sendResponse);
	}
}
			
function onLoad()
{
	setInterval(live, updateInterval);
	chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) 
	{	
	    if (request.data == "login")
	    {
	      sendResponse({"result": result});
	    }
	    else if(request.data == "search")
	    {
	    	searchOnQuora(request.query);
	    	sendResponse({});
	    }
	    else if(request.data == "post")
	    {
	    	chrome.tabs.getSelected(null, function(tab) {
	    		if(request.name != undefined && request.name != null)
	    		{
	    			postToQuoraWithGroupName(tab.url, request.name);
	    		}else
	    		{
	    			postToQuora(tab.url);
	    		}
				sendResponse({});
		    });
	    }
	    else if(request.data == "recommendation")
	    {
	    	getRecommendation(request.title, sendResponse)
	    }else if(request.data == "get_settings")
	    {
	    	settings = getSettings();
	    	sendResponse({"settings": settings});
	    }else if(request.data == "save_settings")
	    {
	    	updateSettings(request.settings);
	    	sendResponse({});
	    }
	    else
	    {
	     	sendResponse({});
	    }
	});
	createContextMenu();
	checkLogin();
}