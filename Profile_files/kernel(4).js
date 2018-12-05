/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

/**
 * The <code>CQ_Analytics.CampaignMetadataMgr</code> object is a store connecting to an Adobe Campaign instance.
 */
if (CQ_Analytics && !CQ_Analytics.CampaignMetadataMgr) {

    CQ_Analytics.CampaignMetadataMgr = CQ_Analytics.JSONStore.registerNewInstance(
        "campaignmetadata", {});

    CQ_Analytics.CampaignMetadataMgr.SERVICE_PATH = "/_jcr_content.campaign.metadata.json";

    CQ_Analytics.CampaignMetadataMgr.setNLIntegrationURL = function(baseURL) {
        this.baseURL = CQ_Analytics.Utils.externalize(baseURL);
        this.serviceURL = baseURL + this.SERVICE_PATH;
        $CQ.post(this.serviceURL, {}, function(data) {
            CQ_Analytics.CampaignMetadataMgr.initJSON(data);
            CQ_Analytics.CampaignMetadataMgr.init();
            CQ_Analytics.CampaignMetadataMgr._isDataAvailable = true;

            // check if we're on an author system
            if (CQ && CQ.WCM) {
                // CQ-16403
                // for all editables that have already been rendered...
                var editables = CQ.WCM.getEditables();
                for (var key in editables) {
                    if (editables.hasOwnProperty(key)) {
                        // ...redo the variable replacement
                        var element = editables[key].element;
                        CQ.personalization.variables.Variables.injectSpans(element, CQ.personalization.variables.Variables.SCANNED_TAGS, "cq-variable-code");
                        CQ.personalization.variables.Variables.updateVariables(element, CQ_Analytics.CampaignSeedMgr.getData());
                    }
                }
            }

            if (CQ_Analytics.CampaignMetadataMgr._onDataAvailable) {
                var fct = CQ_Analytics.CampaignMetadataMgr._onDataAvailable.fct;
                fct(CQ_Analytics.CampaignMetadataMgr._onDataAvailable.data);
                CQ_Analytics.CampaignMetadataMgr._onDataAvailable = null;
            }
        });
    };

    CQ_Analytics.CampaignMetadataMgr._isDataAvailable = false;

    CQ_Analytics.CampaignMetadataMgr._onDataAvailable = null;

    /**
     * Ensures the specified function is executed after metadata is actually available.
     * @param fct The function
     * @param data The data that is passed as first parameter to the function
     */
    CQ_Analytics.CampaignMetadataMgr.whenDataAvailable = function(fct, data) {
        if (CQ_Analytics.CampaignMetadataMgr._isDataAvailable) {
            fct(data);
        } else {
            CQ_Analytics.CampaignMetadataMgr._onDataAvailable = {
                fct: fct,
                data: data
            }
        }
    };

    CQ_Analytics.CampaignMetadataMgr.rawJSON = undefined;

    CQ_Analytics.CampaignMetadataMgr.getRawJSON = function() {
        return this.rawJSON;
    };

    CQ_Analytics.CampaignMetadataMgr.initJSON = function(jsonData, doNotClear) {
        if( !doNotClear ) {
            this.initProperty = {};
        }

        // adds an object that is part of a property
        function addValueObject(target, prefix, obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var el = obj[key];
                    var propPath = prefix + "/" + key;
                    if (!$CQ.isPlainObject(el)) {
                        target[propPath] = el;
                    } else {
                        addValueObject(target, propPath, el);
                    }
                }
            }
        }

        // resolves the JSON representation into path-based properties as required by
        // the client context
        function propertyToPaths(target, prefix, obj) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var el = obj[p];
                    if (el.hasOwnProperty("type") && el.type) {
                        for (var key in el) {
                            if (el.hasOwnProperty(key)) {
                                var sp = p + "/" + key;
                                var path = prefix ? prefix + "/" + sp : sp;
                                if (!$CQ.isPlainObject(el[key])) {
                                    target[path] = el[key];
                                } else {
                                    addValueObject(target, path, el[key])
                                }
                            }
                        }
                    }
                    if (el.hasOwnProperty("content")) {
                        propertyToPaths(target, prefix ? prefix + "/" + p : p, el.content);
                    }
                }
            }
        }

        propertyToPaths(this.initProperty, null, jsonData);
        this.rawJSON = jsonData;
    };

}
