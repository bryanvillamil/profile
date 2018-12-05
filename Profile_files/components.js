$CQ(document).ready(function() {

    //THIS WILL NEED TO BE A VARIABLE THAT IS SET BASED ON SITE LOCALE (EN,ES,DE,FR) HARDCODE TO EN FOR NOW
	var pathInfo = window.location.pathname;

    var site = {};
    var sitePath = "";
    var languagePath = "";


	//english;
    if(pathInfo.indexOf('scentsy-us-en') != -1){
        site.sitePath = "scentsy-us-en";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-au') != -1){
        site.sitePath = "scentsy-au";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-ca-en') != -1){
        site.sitePath = "scentsy-ca-en";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-nz') != -1){
        site.sitePath = "scentsy-nz";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-ie') != -1){
        site.sitePath = "scentsy-ie";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-uk') != -1){
        site.sitePath = "scentsy-uk";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('es-en') != -1){
        site.sitePath = "scentsy-es-en";
        site.languagePath = "en";
	};

    //french;
    if(pathInfo.indexOf('scentsy-fr') != -1){
        site.sitePath = "scentsy-fr";
        site.languagePath = "fr";
	};

    if(pathInfo.indexOf('scentsy-ca-fr') != -1){
        site.sitePath = "scentsy-ca-fr";
        site.languagePath = "fr";
	};

    //spanish;
    if(pathInfo.indexOf('scentsy-mx') != -1){
        site.sitePath = "scentsy-mx";
        site.languagePath = "es";
	};

    if(pathInfo.indexOf('es-es') != -1){
        site.sitePath = "scentsy-es-es";
        site.languagePath = "es";
	};

    if(pathInfo.indexOf('scentsy-us-es') != -1){
        site.sitePath = "scentsy-us-es";
        site.languagePath = "es";
	};

    //german;
    if(pathInfo.indexOf('scentsy-de') != -1){
        site.sitePath = "scentsy-de";
        site.languagePath = "de";
	};

    var searchResultsURL = '/content/sites/' + site.sitePath + '/' + site.languagePath + '/search-results.html'



    $('#catalog-search-text').keypress(function (e) {
  		if (e.which == 13) {


			var searchString = $('#catalog-search-text').val();
			var url = searchResultsURL;

            //SET THE COOKIE;
            $.cookie('catalog-search-text', searchString);

			window.location.replace(url);

    		return false;    
  		}
	});
});
$CQ(document).ready(function() {


	var catalogDetailsSearchText = '"' + $.cookie('catalog-search-text') + '"';
    //var catalogDetailsSearchResults = $.cookie('catalog-search-results');



    if(catalogDetailsSearchText != '"undefined"'){
		//$('#sortByFilter').css('display', 'block');

        //$('#catalog-details-search-results').text(catalogDetailsSearchResults);
    	$('#catalog-details-search-text').text(catalogDetailsSearchText);


        //REMOVE THE COOKIES;
        //$.removeCookie('catalog-search-results');
    	$.removeCookie('catalog-search-text');

    }
    else {

		//$.removeCookie('catalog-search-results');
    	$.removeCookie('catalog-search-text');
    }



});
$CQ(document).ready(function() {

    //THIS WILL NEED TO BE A VARIABLE THAT IS SET BASED ON SITE LOCALE (EN,ES,DE,FR) HARDCODE TO EN FOR NOW
	var pathInfo = window.location.pathname;

    var site = {};
    var sitePath = "";
    var languagePath = "";


	//english;
    if(pathInfo.indexOf('scentsy-us-en') != -1){
        site.sitePath = "scentsy-us-en";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-au') != -1){
        site.sitePath = "scentsy-au";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-ca-en') != -1){
        site.sitePath = "scentsy-ca-en";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-nz') != -1){
        site.sitePath = "scentsy-nz";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-ie') != -1){
        site.sitePath = "scentsy-ie";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-uk') != -1){
        site.sitePath = "scentsy-uk";
        site.languagePath = "en";
	};

    if(pathInfo.indexOf('scentsy-es-en') != -1){
        site.sitePath = "scentsy-es-en";
        site.languagePath = "en";
	};

    //french;
    if(pathInfo.indexOf('scentsy-fr') != -1){
        site.sitePath = "scentsy-fr";
        site.languagePath = "fr";
	};

    if(pathInfo.indexOf('scentsy-ca-fr') != -1){
        site.sitePath = "scentsy-ca-fr";
        site.languagePath = "fr";
	};

    //spanish;
    if(pathInfo.indexOf('scentsy-mx') != -1){
        site.sitePath = "scentsy-mx";
        site.languagePath = "es";
	};

    if(pathInfo.indexOf('scentsy-es-es') != -1){
        site.sitePath = "scentsy-es-es";
        site.languagePath = "es";
	};

    if(pathInfo.indexOf('scentsy-us-es') != -1){
        site.sitePath = "scentsy-us-es";
        site.languagePath = "es";
	};

    //german;
    if(pathInfo.indexOf('scentsy-de') != -1){
        site.sitePath = "scentsy-de";
        site.languagePath = "de";
	};

    var searchResultsURL = '/content/sites/' + site.sitePath + '/' + site.languagePath + '/search-results.html'



    $('#catalog-search-mobile-text').keypress(function (e) {
  		if (e.which == 13) {


			var searchString = $('#catalog-search-mobile-text').val();
			var url = searchResultsURL;

            //SET THE COOKIE;
            $.cookie('catalog-search-text', searchString);

			window.location.replace(url);

    		return false;    
  		}
	});
});
$CQ(document).ready(function() {

    var recentResources = [];
	var resourceCount = 0;
    var resourceList = "";

    //COOKIE EXISTS;
    if(!!$.cookie('recent-resources')){
		//READ AND PARSE THE COOKIE;
        recentResources = JSON.parse($.cookie('recent-resources')); 
		recentResources.reverse();

		resourceCount = recentResources.length;

        if(resourceCount > 3){
        	resourceCount = 3;
    	}

        if(resourceCount != 0){
        	for(var i=0;i<resourceCount;i++){
				var resource = '<li><a href="' + recentResources[i].url +'">' + recentResources[i].title + '</a></li>';
            	resourceList = resourceList + resource;
            }

            $('#recently-watched').append(resourceList);
		}
        else{
			$('#recently-watched').append('<li>No Recently Viewed</li>');
        }
	}
    //COOKIE DOES NOT EXIST;
    else {
		$('#recently-watched').append('<li>No Recently Viewed</li>');
    }

});
