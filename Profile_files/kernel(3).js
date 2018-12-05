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
 * The <code>CQ_Analytics.CampaignSeedMgr</code> object is a store providing seed user's profile information.
 */
if (CQ_Analytics && !CQ_Analytics.CampaignSeedMgr) {

    CQ_Analytics.CampaignSeedMgr = CQ_Analytics.JSONStore.registerNewInstance(
            "campaignseed", {});

    CQ_Analytics.CampaignSeedMgr.SERVICE_PATH = "/_jcr_content.campaign.seeddata.json/{seed}";


    CQ_Analytics.CCM.addListener("configloaded", function() {
        CQ_Analytics.ProfileDataMgr.addListener("update", function() {
            var uid = CQ_Analytics.ProfileDataMgr.getProperty("authorizableId");
            if (uid != this.lastUid) {
                this.lastUid = uid;
                this.clear();
                this.fireEvent("update");
            }
        }, CQ_Analytics.CampaignSeedMgr);
    }, CQ_Analytics.CampaignSeedMgr);
}
