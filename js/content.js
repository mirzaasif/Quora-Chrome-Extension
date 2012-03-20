var pageTitle = null;
var urlBlock = false;
var boardRecommendation = new Array();
var count = 0;

function onLoad()
{
	$(document).ready(function() {
		closeIcon = chrome.extension.getURL("images/close.png");
		blockIcon = chrome.extension.getURL("images/block.png");
		//$("body").append("<div class='charm_quora' id='charm_quora'><div class='title'>Recommended Boards on Quora</div><div id='result' class='result'></div><div style='text-align:center; padding-bottom:4px;'><img src='"+closeIcon+"' width='16' title='Hide' style='cursor:pointer;' id='charm_hide'/>&nbsp;&nbsp;<img src='"+blockIcon+"' width='16' title='Never show recommendations on this site.' style='cursor:pointer;' id='charm_block'/></div><div style='text-align:center; color:#666; font-size:10px; clear:both;'>Charm for Quora</div></div>");
		$("body").append("<div class='charm_quora' id='charm_quora'><div class='title'>Recommended Boards on Quora</div><div id='result' class='result'></div><div style='text-align:center; padding-bottom:4px;'><label id='charm_post' class='link' style=' cursor:pointer;'>[Post]</label>&nbsp;&nbsp;<label id='charm_hide' class='link' style=' cursor:pointer;'>[Hide]</label></div><div style='text-align:center; padding-bottom:4px; cursor:pointer;' class='link' id='charm_block'>[Block for this site]</div><div style='text-align:center; color:#666; font-size:10px; clear:both;'>Charm for Quora</div></div>");
		left = (parseInt($(window).width())-150);
		$("#charm_quora").css("left", left);
		$("#charm_block").click(blockSite);
		$("#charm_hide").click(hide);
		$("#charm_post").click(postQuora);
		
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
		
		sendMessage({"data":"get_settings"}, function(response)
			{
				settings = response.settings;
				urlBlock = isURLBlocked(settings);
				
				if(!urlBlock)
				{
					message = {"data" : "recommendation", "title" : pageTitle};
					sendMessage(message, function(response)
						{
							if(settings.setting1)
							{
								handleBoardRecommendationResponse(response);
								getBoardRecommendationAdvaced(pageTitle);	
							}
						}
					);
				}
			}
		);	
	});
}

function handleBoardRecommendationResponse(response)
{
	documentUrl = document.location;
	
	for (var i = 0; i < response.board.length; i++)
	{
		var key = response.board[i].url;
		if(boardRecommendation[key] == null || boardRecommendation[key] == undefined)
		{
			boardRecommendation[key] = key;
			var url = "http://www.quora.com"+response.board[i].url;
			var name = response.board[i].title;
		
			if(url.toString().toLowerCase() != documentUrl.toString().toLowerCase())
			{
				div = "<a href='"+url+"' target='_blank' title='Open "+name+" in a separate tab'><div class='result_item' id='result_item_"+count+"' data-name='"+name+"'>"+name+"</div></a>";
				$(".charm_quora #result").append(div);
				//$("#result_item_"+count).click(function(event){postQuora(event);});
				count++;	
			}		
		}
	}
	
	if(count > 0 && $(".charm_quora").css("display") == "none")
	{
		$(".charm_quora").css("display", "block");
	}
}

function postQuora()
{
	//name = $(event.currentTarget).attr("data-name");
	sendMessage({"data":"post"}, function(){});	
}

function getBoardRecommendationAdvaced(title)
{
	var words = title.match(/\b[\w]+\b/g);
	
	for (var i = 0; i < words.length; i++)
	{
		var word = words[i].trim();
		if(!isStopWord(word))
		{
			var message = {"data" : "recommendation", "title" : word.toString()};
			sendMessage(message, function(response)
				{
					handleBoardRecommendationResponse(response);	
				}
			);		
		}
	}
}

onLoad();
chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
	{
		if(request.request == "title")
		{
			if(!urlBlock && pageTitle != null)
			{
				response = {"response":pageTitle};
				sendResponse(response);	
			}else
			{
				response = {"response":""};
				sendResponse(response);	
			}
		}else if(request.request == "post")
		{
			
		}
	}
);

function blockSite()
{
	domain = location.hostname;
	sendMessage({"data":"get_settings"}, function(response)
		{
			settings = response.settings;
			settings.block_url = domain + "\n" + settings.block_url;
			sendMessage({"data":"save_settings", "settings" : settings}, function(){});
			$(".charm_quora #result").append(domain+" has been blocked. You can undo this action from settings.");
			setTimeout("hide()", 10000);		
		} 
	);	
}

function hide()
{
	$("#charm_quora").fadeOut();
}

function isURLBlocked(settings)
{
	url = location.host;
	if(location.protocol == "https:" && settings.setting2 == true)
	{
		return true;
	}
	
	domain = location.hostname;
	
	domain = domain.replace(/www./i, "");
	
	domain2 = "\\*."+domain;
	
	split = domain.split(".");
	
	domain3 = domain.replace(split[0], "\\*");
	
	blockUrls = settings.block_url.replace(/www./i, "");
	blockUrls = blockUrls.replace(/http:/gi, "");
	blockUrls = blockUrls.replace(/https:/gi, "");
	blockUrls = blockUrls.replace(/\//g, "");
	
	
	//domain = domain.replace(/\./g, "\\.");
	domain2 = domain2.replace(/\./g, "\\.");
	domain3 = domain3.replace(/\./g, "\\.");
	
	
	try
	{
		var regex1 = new RegExp("^"+domain+"$","im");
		var regex2 = new RegExp("^"+domain2+"$","im");
		var regex3 = new RegExp("^"+domain3+"$","im");
		
		
		if((blockUrls.match(regex1) != null) || (blockUrls.match(regex2) != null) || (blockUrls.match(regex3) != null))
		{
			return true;
		}
	
		return false;
	}catch(e)
	{
		return true;
	}
}

