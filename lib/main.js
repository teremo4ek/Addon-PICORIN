/*The Low Level Module (XPCOM)*/
var {Cu, Cc, Ci} = require("chrome");

/*The UI Module*/
var panel 	= require("panel");
var widget 	= require("widget");
var tabs	= require("tabs");
var pageMod	= require("page-mod");
var notif	= require("notifications");

/*The Storage Module*/
var ss 		= require("simple-storage");

/*The Data Module*/
var self	= require("self");
var data	= self.data;

/*The Password Module*/
var pass	= require("passwords");

/*The Properties Needed*/
var uname = "picorin";				//Username for the password module (have to be included since password module need user
var isBeingFiltered = true;			//Triggering the bayes filtering on / off

var filterBayesian = null;			//The page-mod handler for bayesian filtering
var filterBlacklist= null;			//The page-mod handler for blacklisted website
var filterWhitelist= null;			//The page-mod handler for whitelisted website

var blackWebsite = ["http://www.redtube.com/*", "http://www.tube8.com/*"];
var whiteWebsite = ["http://www.google.com/*" , "http://www.yahoo.com/*"];

/*The Storage which is being used*/
if(!ss.storage.identificationInformation)
	ss.storage.identificationInformation = null;
	
if(!ss.storage.websiteBlacklisted)
	ss.storage.websiteBlacklisted = [];
	
if(!ss.storage.websiteWhitelisted)
	ss.storage.websiteWhitelisted = [];

/*Main Panel*/
var mainPanel =
	panel.Panel ({
		width: 200,
		height: 165,
		contentURL: data.url("pages/html/mainPanel.html"),
		contentScriptFile: [data.url("jquery-ui/js/jquery.min.js"),
                            data.url("jquery-ui/js/jquery-ui.min.js"),
                            data.url("pages/js/mainPanel.js")],
		contentScriptWhen: "ready"
	});

/*Widget on the right bottom side*/
var theWidget = 
	widget.Widget({
		id: "picorin-widget",
		label: "Personal Internet Content Filtering",
		contentURL: "http://www.mozilla.org/favicon.ico",
		panel: mainPanel
	});

/*Filter Toggle Button*/
var bayesFilter = function(toggleCondition) {
	console.log("panel toggleFilter");
	if(toggleCondition == "Off")
		isBeingFiltered = false;
	else
		isBeingFiltered = true;
	
	if(isBeingFiltered) {
		filterBayesian = pageMod.PageMod ({
			include: ["http://*", "https://*"],
			contentScriptWhen: "ready",
			contentScriptFile: [data.url("blocking/bayesian.js")],
			contentStyle: "head, title, link, meta, style, script, body, element {display: none; !important}"
		});
	}
	else {
		if(filterBayesian != null) {
			filterBayesian.destroy();
		}
	}
};

mainPanel.port.on("toggleFilter", function(toggleCondition) {	
	bayesFilter(toggleCondition);
});

/*Black List Button onClick*/
var openBlackPage = function() {
	console.log("panel blackPage");
	tabs.open({
		url:data.url("pages/html/blackPage.html"),
		onReady: function onReady(tab) {
			var worker = tab.attach({
				contentScriptFile: [data.url("jquery-ui/js/jquery.min.js"),
                            data.url("jquery-ui/js/jquery-ui.min.js"),
                            data.url("pages/js/blackPage.js")],
				contentScriptWhen: "ready"
			});
			
			worker.port.on("blackListRetrieve", function() {
				websiteBlacklisted = ss.storage.websiteBlacklisted;
			
				if(websiteBlacklisted.length == 0)
					websiteBlacklisted = blackWebsite;
					
				console.log("Black List Set value to " + websiteBlacklisted);
				
				worker.port.emit("blackListRetrieved", websiteBlacklisted);
			});
			
			worker.port.on("blackListSave", function(websiteBlacklisted) {
				console.log("blackListSave event START");
				
				tempArray = websiteBlacklisted.split("\n");
				dupeArray = new Array();
				
				for(var i=0; i<tempArray.length; i++) {
					if(tempArray[i] != "\n" && tempArray[i] != "" && tempArray[i] != null) {
						dupeArray.push(tempArray[i]);
					}
				}
				
				ss.storage.websiteBlacklisted = dupeArray;
				
				for(var i = 0; i < ss.storage.websiteBlacklisted.length; i++) {
					console.log(i + " blacklisted web is " + ss.storage.websiteBlacklisted[i]);
				}
				
				if(filterBlacklist != null)
					filterBlacklist.destroy();
				
				filterBlacklist = require("page-mod").PageMod ({
					include: ss.storage.websiteBlacklisted,
					contentScriptWhen: "ready",
					contentScriptFile: [data.url("blocking/blacklist.js")],
					contentStyle: "head, title, link, meta, style, script, body, element {display: none; background-color: #FFCCFF!important}"
				});
				
				console.log("blackListSave event END");
			});
		}
	})
}

mainPanel.port.on("blackPage", function() {
	openBlackPage();
	theWidget.panel.hide();
});

/*White List Button onClick*/
var openWhitePage = function() {
	console.log("panel whitePage");
	tabs.open({
		url:data.url("pages/html/whitePage.html"),
		onReady: function onReady(tab) {
			var worker = tab.attach({
				contentScriptFile: [data.url("jquery-ui/js/jquery.min.js"),
                            data.url("jquery-ui/js/jquery-ui.min.js"),
                            data.url("pages/js/whitePage.js")],
				contentScriptWhen: "ready"
			})
			
			worker.port.on("whiteListRetrieve", function() {
				websiteWhitelisted = ss.storage.websiteWhitelisted;
			
				if(websiteWhitelisted.length == 0)
					websiteWhitelisted = whiteWebsite;
					
				console.log("White List Set value to " + websiteWhitelisted);
				
				worker.port.emit("whiteListRetrieved", websiteWhitelisted);
			});
			
			worker.port.on("whiteListSave", function(websiteWhitelisted) {
				console.log("whiteListSave event START");
			
				tempArray = websiteWhitelisted.split('\n');
				dupeArray = new Array();
				
				for(var i=0; i<tempArray.length; i++) {
					if(tempArray[i] != "\n" && tempArray[i] != "" && tempArray[i] != null) {
						dupeArray.push(tempArray[i]);
					}
				}
			
				ss.storage.websiteWhitelisted = dupeArray;
				
				for(var i = 0; i < ss.storage.websiteWhitelisted.length; i++) {
					console.log(i + " whitelisted web is " + ss.storage.websiteWhitelisted[i]);
				}
				
				if(filterWhitelist != null)
					filterWhitelist.destroy();
					
				filterWhitelist = require("page-mod").PageMod ({
					include: ss.storage.websiteWhitelisted,
					contentScriptWhen: "ready"
				});
				
				console.log("whiteListSave event END");
			});
		}
	})
}

mainPanel.port.on("whitePage", function() {
	openWhitePage();
	theWidget.panel.hide();
});

/*Login Information Popup*/
if(ss.storage.identificationInformation == null) {
  console.log("login popup");
	var firstLoginMod = 
		pageMod.PageMod({
			include: data.url('pages/html/firstLogin.html'),
			contentScriptWhen: "ready",
			contentScriptFile: [data.url("jquery-ui/js/jquery.min.js"),
								data.url("jquery-ui/js/jquery-ui.min.js"),
								data.url("pages/js/firstLogin.js")],
			onAttach: function(worker) {
				console.log("pm attached");
				worker.port.on("storeUserInformation", function(upass) {
					pass.store({
						realm: "User Information",
						username: uname,
						password: upass,
						onComplete: function(credentials) {
							console.log("password stored");
							worker.port.emit("successStoreInformation");
							bayesFilter("On");
							/*
							notif.notify({
								title: "(PICORIN) Password has been set !",
								text: "Setup the Blacklist Page",
								onClick: function(data) {
									openBlackPage();
								}
							});
							notif.notify({
								title: "(PICORIN) Password has been set !",
								text: "Setup the Whitelist Page",
								onClick: function(data) {
									openWhitePage();
								}
							})
							*/
						}
					});
					
					/*-------------------------------------------------
					Used for debugging password
					
					pass.search({
						username: uname,
						onComplete: function onComplete(credentials) {
							credentials.forEach(function(credential) {
								console.log(credential.username);
								console.log(credential.password);
							});
						}
					})
					-------------------------------------------------*/
					
					ss.storage.identificationInformation = 1;
				});
				
				worker.port.on("blankPage", function() {
					tabs.activeTab.url = "about:blank";
					console.log("page mod blankPage");
				});
			}
		});
	console.log("opening login page");
	tabs.activeTab.url = data.url('pages/html/firstLogin.html');
}
