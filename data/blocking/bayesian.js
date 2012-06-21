document.body.style.display = "block"; 

document.getElementsByTagName('head').item(0).innerHTML= "<title>Website Blocked</title>";

if(document.getElementsByTagName('script').item(0) != null) {
	for (x in document.getElementsByTagName('script')) {
		document.getElementsByTagName('script')[x].innerHTML = "";
	}
}

document.getElementsByTagName('body').item(0).innerHTML= "<h1>this page has been eaten</h1>";

if(document.getElementsByTagName('div').item(0) != null)
	document.getElementsByTagName('div').item(0).innerHTML = "";

if(document.getElementsByTagName('span').item(0) != null)
	document.getElementsByTagName('span').item(0).innerHTML = "";

