/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
 * The <code>CQ_Analytics.SalesforceProfileDataMgr</code> object is a store providing user's twitter profile information.
 */
if (CQ_Analytics && !CQ_Analytics.SalesforceProfileDataMgr) {

    CQ_Analytics.SalesforceProfileDataMgr = function() {};

    CQ_Analytics.SalesforceProfileDataMgr.prototype = new CQ_Analytics.SessionStore();

    /**
     * @cfg {String} STOREKEY
     * Store internal key
     * @final
     * @private
     */

    CQ_Analytics.SalesforceProfileDataMgr.prototype.STOREKEY = "SALESFORCEPROFILEDATA";

    /**
     * @cfg {String} STORENAME
     * Store internal name
     * @final
     * @private
     */

    CQ_Analytics.SalesforceProfileDataMgr.prototype.STORENAME = "salesforceprofile";

    CQ_Analytics.SalesforceProfileDataMgr.prototype.lastUid = "";

    /**
     * {@inheritDoc}
     */
    CQ_Analytics.SalesforceProfileDataMgr.prototype.clear = function() {
        this.data = null;
        this.initProperty = {};
    };

    CQ_Analytics.SalesforceProfileDataMgr.prototype.init = function() {
        if (!this.data) {
            this.data = {};
            for (var p in this.initProperty) {
                this.data[p] = this.initProperty[p];
            }
        }
    };

    CQ_Analytics.SalesforceProfileDataMgr.prototype.getLoaderURL = function() {
        return CQ_Analytics.ClientContextMgr.getClientContextURL("/contextstores/salesforceprofiledata/loader.json");
    };

    // When ProfileDataMgr is updated, update Salesforce Profile as well
    CQ_Analytics.SalesforceProfileDataMgr.prototype.handleUpdateProfileDataMgr = function(){

        var uid = CQ_Analytics.ProfileDataMgr.getProperty("authorizableId");
        if (uid != CQ_Analytics.SalesforceProfileDataMgr.lastUid) {
            CQ_Analytics.SalesforceProfileDataMgr.loadProfile(uid);
            CQ_Analytics.SalesforceProfileDataMgr.fireEvent("update");
        }
    };

    CQ_Analytics.SalesforceProfileDataMgr.prototype.loadProfile = function(authorizableId) {
        CQ_Analytics.SalesforceProfileDataMgr.lastUid = authorizableId;
        var url = this.getLoaderURL();
        url = CQ_Analytics.Utils.addParameter(url, "authorizableId", authorizableId);

        try {
            // the response body will be empty if the authorizableId doesn't resolve to a profile
            var object = CQ.shared.HTTP.eval(url);
            if (object) {
                this.data = {};
                for (var p in object) {
                    this.data[p] = object[p];
                }
                this.fireEvent("update");

                if (CQ_Analytics.ClickstreamcloudEditor) {
                    CQ_Analytics.ClickstreamcloudEditor.reload();
                }
                return true;
            }

        } catch(error) {
            if (console && console.log) console.log("Error during profile loading", error);
        }
        return false;
    };

    CQ_Analytics.SalesforceProfileDataMgr = new CQ_Analytics.SalesforceProfileDataMgr();
    CQ_Analytics.CCM.register(CQ_Analytics.SalesforceProfileDataMgr);
}
