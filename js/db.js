function checkCache(title)
{
	key = hex_md5(title);
	try
	{
		item = window.sessionStorage.getItem(key);
		
		if(item == null)
		{
			return null;
		}
		
		item = JSON.parse(item);
		
		date = new Date();
		time = date.getTime();
		
		if(item.time < (time - (1000 * 3600)))
		{
			return null;
		}else
		{
			item.data;	
		}	
	}catch(e)
	{
		console.log(e.toString());
	}
	
	return null;
}

function getSettings()
{
	item = window.localStorage.getItem("settings");
	if(item != null)
	{
		item = JSON.parse(item);
	}else
	{
		settins1 = true;
		setting2 = true;
		block_url = "*.google.com\n*.quora.com\n*.live.com\nmail.yahoo.com";
		item = {"setting1": settins1, "setting2": setting2, "block_url": block_url};
	}
	
	return item;
}

function updateSettings(item)
{
	item = JSON.stringify(item);
	window.localStorage.removeItem("settings");
	window.localStorage.setItem("settings", item);		
}

function updateCache(title, data)
{
	try
	{
		key = hex_md5(title);
		date = new Date();
		time = date.getTime();
		
		obj = {"data": data, "time": time};
		window.sessionStorage.removeItem(key);
		window.sessionStorage.setItem(key, JSON.stringify(obj));	
	}catch(e)
	{
		console.log(e.toString());
	}
}
