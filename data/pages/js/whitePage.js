tempString = "";

self.port.emit("whiteListRetrieve");

self.port.on("whiteListRetrieved", function(whiteListedWebsite) {

	if($.isArray(whiteListedWebsite)) {
		for(ctr = 0; ctr < whiteListedWebsite.length; ctr++) {
			tempString += whiteListedWebsite[ctr] + "\n";
		}
		$("#textWhitelist").val(tempString);
	}
	else
		$("#textWhitelist").val("Not Array");
});

$("#btnAddWhitelist")
    .button()
    .click(function(event){
        event.stopPropagation();
        event.preventDefault();

        self.port.emit("whiteListSave", $("#textWhitelist").val());
    });