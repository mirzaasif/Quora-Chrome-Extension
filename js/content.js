var pageTitle = null;
function checkbox()
{
	if($("#charm_settings1").attr("checked") == "checked")
	{
		$("#charm_settings1").removeAttr("checked");
	}else
	{
		$("#charm_settings1").attr("checked", "checked");
	}
	settingUpdate();
}

function onLoad()
{
	$(document).ready(function() {
		
		$("body").append("<div class='charm_quora' id='charm_quora'><div class='title'>Recommended Board at Quora</div><div id='result' class='result'></div><div style='text-align:center; padding-bottom:4px;'><div style='cursor:pointer;' id='charm_hide'>[Hide]</div></div><div style='padding-top:5px;' id='charm_set'><input type='checkbox' id='charm_settings1'/><div style='cursor:pointer; float:right; padding-right:10px;' id='charm_label'>Don't show again</div></div></div>");
		left = (parseInt($(window).width())-150);
		$("#charm_quora").css("left", left);
		$("#charm_settings1").change(settingUpdate);
		$("#charm_label").click(checkbox);
		$("#charm_hide").click(function(){$("#charm_quora").css("display", "none");});
		
		try
		{
			pageTitle = $("meta[property=og\\:title]").attr("content");	
		}catch(e)
		{
			pageTitle = $(this).attr('title');
			index = pageTitle.lastIndexOf("-");
			if(index > - 1)
			{
				pageTitle = pageTitle.subString(0, index-1);
			}
		}finally
		{
			if(pageTitle == null || pageTitle == undefined)
			{
				pageTitle = $(this).attr('title');
				index = pageTitle.lastIndexOf("-");
				if(index > - 1)
				{
					pageTitle = pageTitle.substr(0, index-1);
				}
			}
		}
		
		message = {"data" : "recommendation", "title" : pageTitle};
		sendMessage(message, function(response)
			{
				documentUrl = document.location;
				
				count = 0;
				for (i = 0; i < response.board.length; i++)
				{
					url = "http://www.quora.com"+response.board[i].url;
					
					if(url.toString().toLowerCase() != documentUrl.toString().toLowerCase())
					{
						div = "<a href='"+url+"' target='_blank'><div class='result_item'>"+response.board[i].title+"</div></a>";
						$(".charm_quora #result").append(div);
						count++;	
					}	
				}
				
				if(count > 0)
				{
					sendMessage({"data":"get_settings"}, function(response)
					{
						if(response.settings.setting1)
						{
							$(".charm_quora").css("display", "block");
						}
					});	
				}
			}
		);
	});
}

onLoad();
chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
	{
		if(request.request == "title")
		{
			response = {"response":pageTitle}
			sendResponse(response);
		}
	}
);

function settingUpdate()
{
	if($("#charm_settings1").attr('checked') == "checked")
	{
		settings = {"setting1" : false};
	}else
	{
		settings = {"setting1" : true};
	}
	sendMessage({"data":"save_settings", "settings" : settings}, function(){});	
	return false;
}

