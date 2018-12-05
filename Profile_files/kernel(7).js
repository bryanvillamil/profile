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
 * The <code>CQ_Analytics.ProfileDataMgr</code> object is a store providing surfer information, like referral keywords,
 * mouse position and browser details.
 * @class CQ_Analytics.SurferInfoMgr
 * @singleton
 * @extends CQ_Analytics.SessionStore
 * @deprecated since 6.2, use ContextHub instead
 */
if (!CQ_Analytics.SurferInfoMgr) {
    /**
     * @deprecated since 6.2, use ContextHub instead
     * @constructor
     */
    CQ_Analytics.SurferInfoMgr = function() {};

    CQ_Analytics.SurferInfoMgr.prototype = new CQ_Analytics.SessionStore();

    /**
     * @cfg {String} STOREKEY
     * Store internal key
     * @final
     * @private
     */
    CQ_Analytics.SurferInfoMgr.prototype.STOREKEY = "SURFERINFO";

    /**
     * Store internal name
     * @private
     */
    CQ_Analytics.SurferInfoMgr.prototype.STORENAME = "surferinfo";

    //inheritDoc
    CQ_Analytics.SurferInfoMgr.prototype.init = function() {
        this.data = {};
        for (var p in this.initProperty) {
            this.data[p] = this.initProperty[p];
        }
        this.initialized = true;
        this.fireEvent("initialize",this);
        this.fireEvent("update");
    };

    //inheritDoc
    CQ_Analytics.SurferInfoMgr.prototype.clear = function() {
        this.data = null;
        this.initProperty = {};
    };

    //inheritDoc
    CQ_Analytics.SurferInfoMgr.prototype.getLabel = function(name) {
        return name;
    };

    //inheritDoc
    CQ_Analytics.SurferInfoMgr.prototype.getLink = function(name) {
        return "";
    };

    CQ_Analytics.SurferInfoMgr = new CQ_Analytics.SurferInfoMgr();

    CQ_Analytics.CCM.addListener("configloaded", function() {
        //add browser info to surfer info
        var bi = CQ_Analytics.BrowserInfoInstance;
        this.addInitProperty("browserFamily", bi.getBrowserFamily());
        this.addInitProperty("browserVersion", bi.getBrowserVersion());
        this.addInitProperty("browser", "${/surferinfo/browserFamily} ${/surferinfo/browserVersion}");
        this.addInitProperty("OS", bi.getOSName());

        this.addInitProperty("resolution", bi.getScreenResolution());
        this.addInitProperty("device", bi.getDeviceType());
        this.addInitProperty("isMobile", bi.isMobile());
        this.addInitProperty("userAgent", bi.getUserAgent());

        var today = new Date();
        this.addInitProperty("day", today.getDate());
        this.addInitProperty("month", today.getMonth() + 1);
        this.addInitProperty("year", today.getFullYear());
        this.addInitProperty("hours", today.getHours());
        this.addInitProperty("minutes", today.getMinutes());

        var image = "${/surferinfo/browserFamily}";
        if( bi.isMobile() ) {
            image = "${/surferinfo/device}";
        }
        this.addInitProperty("image", image);

        var thumbnail = CQ_Analytics.ClientContextMgr.getClientContextURL("/contextstores/surferinfo/resources/${/surferinfo/image}.png");
        this.addInitProperty("thumbnail", thumbnail);

        if (window.CQ_Analytics
            && window.CQ_Analytics.MousePositionMgr) {
            CQ_Analytics.MousePositionMgr.addListener("update", function() {
                this.setProperty("mouse X", CQ_Analytics.MousePositionMgr.getProperty("x"));
                this.setProperty("mouse Y", CQ_Analytics.MousePositionMgr.getProperty("y"));
            }, this);
        }

        this.addListener("update", function() {
            //magic to maintain image property with logic
            // if( deviceType != "desktop" ) image = device
            // else image = browser
            var deviceType = this.getProperty("device");
            var image = "${/surferinfo/browserFamily}";
            if( bi.isMobile(deviceType) ) {
                image = "${/surferinfo/device}";
            }
            var currentImage = this.getProperty("image");

            //do not set if is the current value to avoid infinite loop
            if( currentImage != image) {
                this.setProperty("image", image);
            }
        }, this);

        //registers Profile Data to clickstreamcloud manager
        this.init();
        CQ_Analytics.CCM.register(this);


    }, CQ_Analytics.SurferInfoMgr);
}