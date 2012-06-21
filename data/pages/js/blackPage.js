tempString = "";

self.port.emit("blackListRetrieve");

self.port.on("blackListRetrieved", function(blackListedWebsite) {

	if($.isArray(blackListedWebsite)) {
		for(ctr = 0; ctr < blackListedWebsite.length; ctr++) {
			tempString += blackListedWebsite[ctr] + "\n";
		}
		$("#textBlacklist").val(tempString);
	}
	else
		$("#textBlacklist").val("Not Array");
});

$("#btnAddBlacklist")
    .button()
    .click(function(event){
        event.stopPropagation();
        event.preventDefault();
		
		self.port.emit("blackListSave", $("#textBlacklist").val());
    });