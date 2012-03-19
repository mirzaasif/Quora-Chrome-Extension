var pageTitle = null;
var urlBlock = false;

function onLoad()
{
	$(document).ready(function() {
		closeIcon = chrome.extension.getURL("images/close.png");
		blockIcon = chrome.extension.getURL("images/block.png");
		$("body").append("<div class='charm_quora' id='charm_quora'><div class='title'>Recommended Board at Quora</div><div id='result' class='result'></div><div style='text-align:center; padding-bottom:4px;'><img src='"+closeIcon+"' width='16' title='Hide' style='cursor:pointer;' id='charm_hide'/>&nbsp;&nbsp;<img src='"+blockIcon+"' width='16' title='Never show recommendations on this site.' style='cursor:pointer;' id='charm_block'/></div><div style='text-align:center; color:#666; font-size:10px; clear:both;'>Charm for Quora</div></div>");
		left = (parseInt($(window).width())-150);
		$("#charm_quora").css("left", left);
		$("#charm_block").click(blockSite);
		$("#charm_hide").click(hide);
		
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
		
		sendMessage({"data":"get_settings"}, function(response)
			{
				settings = response.settings;
				urlBlock = isURLBlocked(settings);
				
				if(!urlBlock)
				{
						
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
			if(!urlBlock && pageTitle != null)
			{
				response = {"response":pageTitle}
				sendResponse(response);	
			}
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
			hide();		
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

