
            CQ_Analytics.registerAfterCallback(function(options) {
                if(!options.compatibility && $CQ.inArray( options.componentPath, CQ_Analytics.Sitecatalyst.frameworkComponents) < 0 )
                    return false;    // component not in framework, skip SC callback
                CQ_Analytics.Sitecatalyst.saveEvars();
                CQ_Analytics.Sitecatalyst.updateEvars(options);
                CQ_Analytics.Sitecatalyst.updateLinkTrackVars();
                return false;
            }, 10);
    
            CQ_Analytics.registerAfterCallback(function(options) {
                if(!options.compatibility && $CQ.inArray( options.componentPath, CQ_Analytics.Sitecatalyst.frameworkComponents) < 0 )
                    return false;    // component not in framework, skip SC callback
                s = s_gi("scentsytrainingcenterprod");
                if (s.linkTrackVars == "None") {
                    s.linkTrackVars = "events";
                } else {
                    s.linkTrackVars = s.linkTrackVars + ",events";
                }
                CQ_Analytics.Sitecatalyst.trackLink(options);
                return false;
            }, 100);
    
    
            CQ_Analytics.registerAfterCallback(function(options) {
                if(!options.compatibility && $CQ.inArray( options.componentPath, CQ_Analytics.Sitecatalyst.frameworkComponents) < 0 )
                    return false;    // component not in framework, skip SC callback
                CQ_Analytics.Sitecatalyst.restoreEvars();
                return false;
            }, 200);
    
            CQ_Analytics.adhocLinkTracking = "false";
            
    
        var s_account = "scentsytrainingcenterprod";
        var s = s_gi(s_account);
        
        s.fpCookieDomainPeriods = "3";
        s.trackDownloadLinks = true;
    s.linkDownloadFileTypes = 'exe,zip,wav,mp3,mov,mpg,avi,wmv,doc,pdf,xls';
    s.charSet = 'UTF\u002D8';
    s.linkTrackVars = 'None';
    s.linkExternalFilters = '';
    s.linkTrackEvents = 'event3';
    s.trackExternalLinks = true;
    s.linkLeaveQueryString = true;
    s.trackInlineStats = true;
    s.currencyCode = 'USD';
    s.linkInternalFilters = undefined;
    
    s.visitorNamespace = "scentsy";
    s.trackingServer = "scentsy.sc.omtrdc.net";
    s.trackingServerSecure = "scentsy.sc.omtrdc.net";
    
    


    CQ_Analytics.registerAfterCallback ( function(options) {  
        if( $CQ.inArray( options.componentPath, CQ_Analytics.Sitecatalyst.frameworkComponents) < 0 )
            return false;    // component not in framework, skip SC callback
        switch (options.event) {
            case "videoinitialize":
                s.Media.open(options.values.source, options.values.length, options.values.playerType);
                s.Media.play(options.values.source, options.values.playhead);
                break; 
            case "videoplay":
                s.Media.play(options.values.source, options.values.playhead); 
                break; 
            case "videopause":
                s.Media.stop(options.values.source, options.values.playhead);
                break;
             case "videoend":
                s.Media.stop(options.values.source, options.values.playhead);
                s.Media.close(options.values.source);
                break;  
            default:
                return false;
        }
        //restore evars after each media call since the original callback is skipped
        CQ_Analytics.Sitecatalyst.restoreEvars();
        return true;
    }, 50);
    
    /* Load and Configure Media  Modules*/
    s.loadModule("Media");
    s.Media.autoTrack=false;
    
    
    s.Media.trackVars="events,eVar58,eVar44,eVar53,eVar43";
    s.Media.trackEvents="event57,event58,event53,event54,event55,event56";
    
     
    /* Configure media mapping */
    var CQ_media_map = new Object();
    CQ_media_map["a.contentType"] = "";
    CQ_media_map["a.media.name"] = ""; 
    CQ_media_map["a.media.segment"] = "