/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
/**
 * The <code>CQ_Analytics.ProfileDataMgr</code> object is a store providing user profile information.
 * @class CQ_Analytics.ProfileDataMgr
 * @singleton
 * @extends CQ_Analytics.PersistedSessionStore
 * @since 5.5
 * @deprecated since 6.2, use ContextHub instead
 */
if (!CQ_Analytics.ProfileDataMgr) {
    /**
     * @deprecated since 6.2, use ContextHub instead
     * @constructor
     */
    CQ_Analytics.ProfileDataMgr = function() {
        this.addListener("beforepersist", function() {
            this.checkAuthorizableId();
        }, this);
    };

    CQ_Analytics.ProfileDataMgr.prototype = new CQ_Analytics.PersistedSessionStore();

    /**
     * @cfg {String} STOREKEY
     * Store internal key
     * @final
     * @private
     */
    CQ_Analytics.ProfileDataMgr.prototype.STOREKEY = "PROFILEDATA";

    /**
     * @cfg {String} STORENAME
     * Store internal name
     * @final
     * @private
     */
    CQ_Analytics.ProfileDataMgr.prototype.STORENAME = "profile";

    /**
     * @deprecated
     * Use PROFILE_LOADER
     */
    CQ_Analytics.ProfileDataMgr.prototype.LOADER_PATH = CQ_Analytics.Utils.externalize("/libs/cq/personalization/components/profileloader/content/load.js", true);

    /**
     * @deprecated
     * Use getLoaderURL method
     */
    CQ_Analytics.ProfileDataMgr.prototype.PROFILE_LOADER = CQ_Analytics.Utils.externalize("/libs/cq/personalization/components/profileloader/content/load.json", true);

    //inheritDoc
    CQ_Analytics.ProfileDataMgr.prototype.init = function() {
        this.persistence = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});

        var value = this.persistence.get(this.getStoreKey());
        if (!value || value == "") {
            this.data = {};
            for (var p in this.initProperty) {
                this.data[p] = this.initProperty[p];
            }
        } else {
            this.data = this.parse(value);
        }
        this.persist();
        this.initialized = true;
        this.fireEvent("initialize",this);
        this.fireEvent("update");
    };

    /**
     * Checks if authorizableId property is defined in profile data and updates the ClickstreamcloudMgr in consequence.
     * See {@link CQ_Analytics.ClientContextMgr#setVisitorId}.
     */
    CQ_Analytics.ProfileDataMgr.prototype.checkAuthorizableId = function() {
        if (!this.data) {
            this.init();
        }
        if (this.data["authorizableId"]) {
            CQ_Analytics.CCM.setVisitorId(this.data["authorizableId"]);
        } else {
            CQ_Analytics.CCM.setVisitorId("");
        }
    };

    //inheritDoc
    CQ_Analytics.ProfileDataMgr.prototype.getLabel = function(name) {
        return name;
    };

    //inheritDoc
    CQ_Analytics.ProfileDataMgr.prototype.getLink = function(name) {
        return "";
    };

    //inheritDoc
    CQ_Analytics.ProfileDataMgr.prototype.clear = function() {
        if (this.persistence) {
            this.persistence.remove(this.getStoreKey());
        }

        this.data = null;
        this.initProperty = {};
    };

    /**
     * Return the profile loader URL.
     * @return {String} The URL
     * @since 5.5
     */
    CQ_Analytics.ProfileDataMgr.prototype.getLoaderURL = function() {
        return CQ_Analytics.ClientContextMgr.getClientContextURL("/contextstores/profiledata/loader.json");
    };

    /**
     * Loads a profile based on the authoriable id of the user.
     * @param {String} authorizableId The user id
     */
    CQ_Analytics.ProfileDataMgr.prototype.loadProfile = function(authorizableId) {
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

                this.persist();
                this.fireEvent("initialize",this);
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

    CQ_Analytics.ProfileDataMgr = new CQ_Analytics.ProfileDataMgr();

    CQ_Analytics.CCM.addListener("configloaded", function() {
        this.checkAuthorizableId();

        //creates link between birthday and age
        this.addListener("update", function(event, property) {
            if (property == "birthday" || !property) {
                var birthday = this.getProperty("birthday");
                var age = this.getProperty("age");
                var newAge = "";
                if (birthday) {
                    try {
                        var getDaysBetween = function(d1, d2) {
                            var tmp = new Date(d2.getTime());
                            tmp.setUTCHours(d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds(), d1.getUTCMilliseconds());
                            var time = tmp.getTime() - d1.getTime();
                            return time / (1000 * 60 * 60 * 24);
                        };
                        var getDayOfYear = function(dob) {
                            var start = new Date(dob.getFullYear(), 0, 0);
                            return getDaysBetween(dob, start) * -1;
                        };
                        var dob = new Date(Date.parse(birthday));
                        if (!isNaN(dob.getTime())) {
                            var today = new Date();
                            //display birthday cake if birthday is today
                            if (getDayOfYear(dob) == getDayOfYear(today) &&
                                dob.getMonth() == today.getMonth()) {
                                newAge = CQ.shared.HTTP.externalize(
                                    CQ_Analytics.ClientContextMgr.getClientContextURL(
                                        "/contextstores/profiledata/resources/birthday_cake.png"));
                            } else {
                                var yearDiff = today.getFullYear() - dob.getFullYear();
                                if (getDayOfYear(dob) > getDayOfYear(today)) {
                                    newAge = yearDiff;
                                } else {
                                    newAge = Math.max(0, yearDiff - 1);
                                }
                            }
                        } else {
                            newAge = "";
                        }
                    } catch(error) {
                        newAge = "";
                    }
                }
                if (age != newAge) {
                    this.setProperty("age", newAge);
                }
            }
        });

        //registers Profile Data to clickstreamcloud manager
        CQ_Analytics.CCM.register(this);
    }, CQ_Analytics.ProfileDataMgr);
}