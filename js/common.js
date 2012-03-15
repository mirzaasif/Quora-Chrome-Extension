function sendMessage(message, response)
{
	chrome.extension.sendRequest(message, response);
}

function updateBadgeText(text)
{
	chrome.browserAction.setBadgeText({"text": text})
}