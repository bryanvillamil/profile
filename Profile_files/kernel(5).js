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
 * The <code>CQ_Analytics.ViewedProducts</code> object is a store providing
 * most-recently-viewed product information.
 * @class CQ_Analytics.ViewedProducts
 * @singleton
 * @extends CQ_Analytics.PersistedSessionStore
 * @deprecated since 6.1; use contexthub.store.commerce.recentlyviewed instead.
 */
if (!CQ_Analytics.ViewedProducts) {
    CQ_Analytics.ViewedProducts = function() {
        this.data = null;
        this.MAX_COUNT = 20;
    };

    CQ_Analytics.ViewedProducts.prototype = new CQ_Analytics.PersistedSessionStore();

    /**
     * @cfg {String} STOREKEY
     * Store internal key
     * @final
     * @private
     */
    CQ_Analytics.ViewedProducts.prototype.STOREKEY = "VIEWEDPRODUCTS";

    /**
     * @cfg {String} STORENAME
     * Store internal name
     * @final
     * @private
     */
    CQ_Analytics.ViewedProducts.prototype.STORENAME = "viewedproducts";

    /**
     * Pushes a product onto the most-recently-viewed stack.
     * @param {String} path Product path.
     */
    CQ_Analytics.ViewedProducts.prototype.record = function(path, title, image, price) {
        if (!this.data) {
            this.init();
        }

        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].path == path) {
                this.data.splice(i, 1);
                break;
            }
        }
        if (this.data.length == this.MAX_COUNT) {
            this.data.shift();
        }
        this.data.push({'path': path, 'title': title, 'image': image, 'price': price});
        this.persist();
        this.fireEvent("update");
    };

    /**
     * Returns the most recently pushed product (irrespective of whether or not it currently
     * appears in the shopping cart).
     * @return {Object} containing 'path', 'image', 'title' and 'price' fields
     */
    CQ_Analytics.ViewedProducts.prototype.mostRecent = function() {
        if (!this.data) {
            this.init();
        }

        if (this.data.length > 0) {
            return this.data[this.data.length-1];
        } else {
            return null;
        }
    };

    /**
     * Returns the most recently viewed product which is not in the shopping cart.
     * @return {Object} containing 'path', 'image', 'title' and 'price' fields
     */
    CQ_Analytics.ViewedProducts.prototype.mostRecentNotInCart = function() {
        if (!this.data) {
            this.init();
        }

        if (!CQ_Analytics.CartMgr) {
            return this.mostRecent();
        }
        for (var i = this.data.length-1; i >= 0; i--) {
            var candidate = this.data[i];
            if (!CQ_Analytics.CartHelper.containsProduct(CQ_Analytics.CartMgr.getData(), candidate.path, 1)) {
                return candidate;
            }
        }
        return null;
    };

    /**
     * Returns the n most-recently-viewed products.
     * @param count     the number of products to return
     * @param notInCart if true, only products not already in the shopping cart will be returned
     * @return {Array} of JSON objects, each containing 'path', 'image', 'title' and 'price' fields
     */
    CQ_Analytics.ViewedProducts.prototype.recent = function(count, notInCart) {
        var result = [];

        if (!this.data) {
            this.init();
        }
        if (!CQ_Analytics.CartMgr) {
            notInCart = false;
        }

        for (var i = this.data.length-1; i >= 0 && count > 0; i--) {
            var candidate = this.data[i];
            if (notInCart && CQ_Analytics.CartHelper.containsProduct(CQ_Analytics.CartMgr.getData(), candidate.path, 1)) {
                continue;
            }
            result.push(candidate);
            count--;
        }
        return result;
    };

    //inheritDoc
    CQ_Analytics.ViewedProducts.prototype.getData = function(excluded) {
        if (!this.data) {
            this.init();
        }

        return this.data;
    };

    //inheritDoc
    CQ_Analytics.ViewedProducts.prototype.init = function() {
        var store = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});
        var value = store.get(this.getStoreKey());

        // convert to real string in case it is a "magic" globalstorage object
        value = value === null ? "" : new String(value);

        var products = value.split(";");
        this.data = [];
        for (var i = 0; i < products.length; i++) {
            var fields = products[i].split(",");
            if (fields.length >= 4) {
                this.data.push({'path': fields[0], 'title': fields[1], 'image': fields[2], 'price': fields[3]});
            } else if (fields.length >= 3) {
                this.data.push({'path': fields[0], 'title': fields[1], 'image': fields[2], 'price': undefined});
            }
        }

        this.initialized = true;
        this.fireEvent("initialize",this);
        this.fireEvent("update");
    };

    //inheritDoc
    CQ_Analytics.ViewedProducts.prototype.persist = function() {
        if (this.fireEvent("beforepersist") !== false) {
            var store = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});

            var products = [];
            for (var i = 0; i < this.data.length; i++) {
                var product = this.data[i];
                var record = product.path + "," + product.title + "," + product.image;
                if (product.price) {
                    record += "," + product.price;
                }
                products.push(record);
            }
            store.set(this.getStoreKey(), products.join(";"));

            this.fireEvent("persist");
        }
    };

    //inheritDoc
    CQ_Analytics.ViewedProducts.prototype.reset = function() {
        this.clear();
        this.fireEvent("update");
    };

    //inheritDoc
    CQ_Analytics.ViewedProducts.prototype.clear = function() {
        var store = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});
        store.remove(this.getStoreKey());
        this.data = [];
    };

    CQ_Analytics.ViewedProducts = new CQ_Analytics.ViewedProducts();
    CQ_Analytics.CCM.register(CQ_Analytics.ViewedProducts);
}