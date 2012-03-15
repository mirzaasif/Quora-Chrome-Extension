var pageTitle = null;
function onLoad()
{
	$(document).ready(function() {
		
		$("body").append("<div class='charm_quora'><div class='title'>Recommended Board at Quora</div><div id='result' class='result'></div><div style='text-align:center; padding-bottom:4px;'><a href='#' onclick='$(&quot;.charm_quora&quot;).css(&quot;display&quot;, &quot;none&quot;)'>[Hide]</a></div><div style='float:left; padding-top:4px;'><input type='checkbox' id='charm_settings1' style='float:left; width:20px;'/></div><div style='float:left;'><label for='charm_settings1'  style='width:auto; cursor:pointer;'>Don't show again</label></div></div>");
		left = (parseInt($(window).width())-150);
		$(".charm_quora").css("left", left);
		$("#charm_settings1").change(settingUpdate);
		
		try
		{
			pageTitle = $("meta[property=og\\:title]").attr("content");	
		}catch(e)
		{
			pageTitle = $(this).attr('title');
		}finally
		{
			if(pageTitle == null || pageTitle == undefined)
			{
				pageTitle = $(this).attr('title');
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
}

