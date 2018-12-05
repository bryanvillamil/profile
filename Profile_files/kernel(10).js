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
 *
 * -------------------
 *
 * The <code>CQ_Analytics.RelatedProducts</code> object is a store providing related product information.
 *
 * NB: A ClientContext store MUST be used to communicate the relationships so that the remainder of the page
 * can be served from the dispatcher cache.  The relationships will be rendered by the ClientContext http
 * request, which is not served from the cache.
 * 
 * @class CQ_Analytics.RelatedProducts
 * @singleton
 * @extends CQ_Analytics.SessionStore
 */
if (!CQ_Analytics.RelatedProducts) {
    CQ_Analytics.RelatedProducts = function() {
        this.data = null;
    };

    CQ_Analytics.RelatedProducts.prototype = new CQ_Analytics.SessionStore();

    CQ_Analytics.RelatedProducts.prototype.STOREKEY = "RELATEDPRODUCTS";
    CQ_Analytics.RelatedProducts.prototype.STORENAME = "relatedproducts";

    /**
     * Returns all relations of a particular type.
     * @returns {Object} containing at least 'path', 'image' and 'title' fields
     */
    CQ_Analytics.RelatedProducts.prototype.products = function(count, relationshipType) {
        var result = [];

        if (!this.data) {
            this.init();
        }

        for (var i = 0; i < this.data.length && count > 0; i++) {
            var candidate = this.data[i];
            if (candidate['relationshipType'] === relationshipType) {
                result.push(candidate);
                count--;
            }
        }

        return result;
    };

    //inheritDoc
    CQ_Analytics.RelatedProducts.prototype.getData = function(excluded) {
        if (!this.data) {
            this.init();
        }

        return this.data;
    };

    //inheritDoc
    CQ_Analytics.RelatedProducts.prototype.init = function() {
        if (!this.data) {
            this.data = {};
        } else {
            this.fireEvent("initialize", this);
            this.fireEvent("update");
        }
    };

    CQ_Analytics.RelatedProducts = new CQ_Analytics.RelatedProducts();
    CQ_Analytics.CCM.register(CQ_Analytics.RelatedProducts);
}