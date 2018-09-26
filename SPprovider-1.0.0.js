var App = App || {};

App.SPprovider = (function(){
	var self = this;

	self.getUserID = function(){
		var userId = _spPageContextInfo.userId;
		return userId;
	}

	self.getItems = function(listname, selectFilter, caml, oneItem, userId){
		//selectFilter = "?$select=Price,Dosage,Title,Artikelnummer";
		//selectFilter = "(idNumber)?$select=Price,Dosage,Title,Artikelnummer";

		var url =  _spPageContextInfo.webServerRelativeUrl;

		var deferred = $.Deferred();

		var requestData = "";
		var data = "";
		var method = "GET";

		if (listname == "") {
			url = url + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
		}
		else {
			if (caml != undefined) {
				requestData = { "query" :
				{"__metadata": 
				{ "type": "SP.CamlQuery" }
				, "ViewXml": caml }
			};
			url = url +"/_api/web/lists/getbytitle('"+ listname +"')/getitems";
			data = JSON.stringify(requestData);
			method = "POST";
		}	
		else { 
			if (userId != undefined) {
				url = url +"/_api/web/getuserbyid("+ userId +")";
			}
			else {
				url = url +"/_api/web/lists/getbytitle('"+ listname +"')/items"+ selectFilter;
			}
		}
	}

	var ca = $.ajax({
		url: url,
		method: method,
		data: data,
		headers: { 
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"Accept": "application/json; odata=verbose",
			"Content-type": "application/json; odata=verbose"
		},
		success: function (data) {  
			if (listname == "" || oneItem || userId != undefined){
				deferred.resolve(data.d);
			}
			else {
				deferred.resolve(data.d.results);
			} 
		},
		error: function (data) {
			deferred.reject(data);
		}
	}); 
	return deferred;
}

self.saveItems = function(listname, data, update, ID){
	var url =  _spPageContextInfo.webServerRelativeUrl;
	var deferred = $.Deferred();
	var id = "";
	var type = "POST";
	if (update){
		type = "PATCH";
		id = "("+ ID +")";
	}
	var url = url +"/_api/web/lists/getbytitle('"+ listname +"')/items"+ id;
	jQuery.ajax({
		url: url,
		type: type,
		data:  JSON.stringify(data),
		headers: { 
			"accept": "application/json;odata=verbose",
			"content-type":"application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"If-Match": "*"
		},
		success: function(data) {
			deferred.resolve(data);
		},
		error: function(data) {
			console.dir(data);
			deferred.reject(data);
		}
	}); 
	return deferred;
}  

return {
	getUserID: self.getUserID,
	getItems: self.getItems,
	saveItems: self.saveItems,
};
})();