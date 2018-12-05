/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 * AdobePatentID="2884US01"
 */

if (!CQ_Analytics.OrderHistoryMgr) {
    CQ_Analytics.OrderHistoryMgr = new CQ_Analytics.SessionStore();
    CQ_Analytics.OrderHistoryMgr.STOREKEY = "ORDERHISTORY";
    CQ_Analytics.OrderHistoryMgr.STORENAME = "orderhistory";

    CQ_Analytics.OrderHistoryMgr.init = function() {
        if (!this.data) {
            this.data = {};
        } else {
            this.fireEvent("initialize", this);
            this.fireEvent("update");
        }
    };

    CQ_Analytics.CCM.addListener("configloaded", function() {

        CQ_Analytics.CCM.register(this);

    }, CQ_Analytics.OrderHistoryMgr);

}