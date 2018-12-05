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
if (!CQ_Analytics.ActivityStreamMgr) {
    /**
     * Activity stream JSON store. Receives and renders the activities of the currently loaded user.
     * @class CQ_Analytics.ActivityStreamMgr
     * @extends CQ_Analytics.JSONStore
     * @singleton
     * @since 5.5
     * @deprecated since 6.2, use ContextHub instead
     */
    CQ_Analytics.ActivityStreamMgr = CQ_Analytics.JSONStore.registerNewInstance("activitystream", {});

    /**
     * Loads and renders the activities.
     * @param {String} profilePath Path to user profile
     * @param {String} divId Id of the div to render to
     * @static
     * @private
     * @method internalRenderer
     * @member CQ_Analytics.ActivityStreamMgr
     */
    CQ_Analytics.ActivityStreamMgr.internalRenderer = function(profilePath, divId) {
        // Sample url:
        // /home/users/a/aparker@geometrixx.info/profile.form.html/etc/clientcontext/default/contextstores/activitystream.html?limit=3
        var url = profilePath + ".form.html";
        url += CQ_Analytics.ClientContextMgr.getClientContextURL("/contextstores/activitystream.html");
        url += "?limit=3";

        CQ.shared.HTTP.get(url, function(options, success, response) {
            $CQ("#" + divId).children().remove();
            if (success) {
                $CQ("#" + divId).append(response.body);
            }
        });
    };

    /**
     * Registers the <code>activityStore</code> store to profile update and delegates to
     * {@link #internalRenderer} for rendering.
     * @param {String} activityStore The activity store to render
     * @param {String} divId Id of the div to render to
     * @static
     * @method renderer
     * @member CQ_Analytics.ActivityStreamMgr
     */
    CQ_Analytics.ActivityStreamMgr.renderer = function(activityStore, divId) {
        if (!activityStore.isReady) {
            activityStore.isReady = true;

            CQ_Analytics.ClientContextUtils.onStoreRegistered("profile", function(profileStore) {
                profileStore.addListener("update", function(event, path) {
                    var profilePath = this.getProperty("path");
                    if (profilePath != CQ_Analytics.ActivityStreamMgr.currentProfilePath) {
                        CQ_Analytics.ActivityStreamMgr.currentProfilePath = profilePath;
                        CQ_Analytics.ActivityStreamMgr.internalRenderer(profilePath, divId);
                    }
                }, profileStore);

                var profilePath = profileStore.getProperty("path");
                CQ_Analytics.ActivityStreamMgr.currentProfilePath = profilePath;
                CQ_Analytics.ActivityStreamMgr.internalRenderer(profilePath, divId);
            });

        }
        return "";
    }
}