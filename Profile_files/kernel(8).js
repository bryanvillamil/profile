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

if (!CQ_Analytics.SocialGraphMgr) {
    /**
     * Social graph JSONP store. Gets the social graph of the current loaded user and renders it.
     * @class CQ_Analytics.SocialGraphMgr
     * @singleton
     * @since 5.5
     * @deprecated since 6.2, use ContextHub instead
     */
    CQ_Analytics.SocialGraphMgr = CQ_Analytics.JSONPStore.registerNewInstance("socialgraph");

    CQ_Analytics.CCM.addListener("configloaded", function() {
        CQ_Analytics.ProfileDataMgr.addListener("update", function() {
            var uid = CQ_Analytics.ProfileDataMgr.getProperty("authorizableId");
            if (uid != this.lastUid) {
                this.fireEvent("update");
            }
        }, CQ_Analytics.SocialGraphMgr);
    }, CQ_Analytics.SocialGraphMgr);
}