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

if (!CQ_Analytics.CartMgr) {
    CQ_Analytics.CartMgr = new CQ_Analytics.SessionStore();
    CQ_Analytics.CartMgr.STOREKEY = "CART";
    CQ_Analytics.CartMgr.STORENAME = "cart";

    CQ_Analytics.CartMgr.init = function() {
        if (!this.data) {
            this.data = {};
        } else {
            var store = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});
            var simulationString = store.get(this.STOREKEY);
            if (simulationString) {
                var parts = simulationString.split(";");
                if (parts[0]) {
                    var referenceAndTotal = parts[0].split("=");
                    if (referenceAndTotal.length == 2) {
                        this.referenceTotalPrice = referenceAndTotal[0];
                        this.simulatedTotalPrice = referenceAndTotal[1];
                        this.updateSimulatedPrice();
                    }
                }
                if (parts[1]) {
                    this.simulatedPromotions = [];
                    var promotions = parts[1].split(",");
                    for (var i = 0; i < promotions.length; i++) {
                        var pathAndTitle = promotions[i].split("=");
                        if (pathAndTitle.length == 2) {
                            this.simulatedPromotions.push({path: pathAndTitle[0], title: pathAndTitle[1]});
                        }
                    }
                }
            }

            this.initialized = true;
            this.fireEvent("initialize", this);
            this.fireEvent("update");
        }
    };

    //
    // A simulated total is the one thing we persist
    //
    CQ_Analytics.CartMgr.persist = function() {
        if (this.fireEvent("beforepersist") !== false) {
            var store = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});
            var simulationString = "";
            if (this.referenceTotalPrice && this.simulatedTotalPrice) {
                simulationString = this.referenceTotalPrice + "=" + this.simulatedTotalPrice;
            }
            simulationString += ";";
            if (this.simulatedPromotions) {
                for (var i = 0; i < this.simulatedPromotions.length; i++) {
                    if (i > 0) {
                        simulationString += ",";
                    }
                    simulationString += this.simulatedPromotions[i].path + "=" + this.simulatedPromotions[i].title;
                }
            }
            store.set(this.STOREKEY, simulationString);
            this.fireEvent("persist");
        }
    };

    //
    // Check to see if a simulation is still valid (ie: the reference value underneath it
    // hasn't changed), and if so, apply it to the store.
    //
    CQ_Analytics.CartMgr.updateSimulatedPrice = function() {
        if (this.simulatedTotalPrice && this.referenceTotalPrice == this.data["totalPriceFloat"]) {
            this.data["totalPriceFloat"] = this.simulatedTotalPrice;
            this.data["totalPrice"] = this.data["totalPrice"].replace(/[0-9]+\.[0-9]+/, parseFloat(this.simulatedTotalPrice).toFixed(2));
        } else {
            this.simulatedTotalPrice = null;
            this.persist();
        }
    };

    //
    // Register that the user has simulated a total price.
    //
    CQ_Analytics.CartMgr.registerSimulatedPrice = function(value) {
        if (this.simulatedTotalPrice) {
            // already in a simulation; just update the value
            this.simulatedTotalPrice = value;
            this.data["totalPrice"] = this.data["totalPrice"].replace(/[0-9]+\.[0-9]+/, parseFloat(this.simulatedTotalPrice).toFixed(2));
        } else {
            // new simulation; store the reference price and simulated value
            this.referenceTotalPrice = this.data["totalPriceFloat"];
            this.simulatedTotalPrice = value;
        }
        this.persist();
    };

    //
    // Add a promotion to the list of simulated promotions.
    //
    CQ_Analytics.CartMgr.addSimulatedPromotion = function(path, title) {
        this.simulatedPromotions = this.simulatedPromotions || [];
        var found = false;
        for (var i = 0; i < this.simulatedPromotions.length; i++) {
            if (this.simulatedPromotions[i].path == path) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.simulatedPromotions.push({path: path, title: title});
            if (this.resolvePromotions()) {
                this.update();
            }
        }
    };

    //
    // Remove a promotion from the list of simulated promotions.
    //
    CQ_Analytics.CartMgr.removeSimulatedPromotion = function(path) {
        var found = -1;
        for (var i = 0; this.simulatedPromotions && i < this.simulatedPromotions.length; i++) {
            if (this.simulatedPromotions[i].path == path) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            this.simulatedPromotions.splice(found, 1);
            if (this.resolvePromotions()) {
                this.update();
            }
        }
    };

    //
    // Return the list of simulated promotions.
    //
    CQ_Analytics.CartMgr.getSimulatedPromotions = function() {
        return this.simulatedPromotions;
    };

    //
    // Override getProperty/setProperty to handle JSON data.
    //
    CQ_Analytics.CartMgr.getProperty = function(name, raw) {
        if (!this.data) {
            this.init();
        }

        var obj = this.data;
        try {
            var parts = name.split(".");
            for (var i = 0; i < parts.length-1; i++) {
                var part = parts[i];
                var indexPos = part.indexOf("[");
                var index = -1;
                if (indexPos > 0) {
                    index = parseInt(part.substring(indexPos+1, part.length-1));
                    part = part.substring(0, indexPos);
                }
                obj = obj[part];

                if (index >= 0) {
                    obj = obj[index];
                }
            }

            var finalPart = parts[parts.length-1];
            if (!raw) {
                var xssName = CQ.shared.XSS.getXSSPropertyName(finalPart);
                if (obj[xssName]) {
                    return obj[xssName];
                }
            }
            return obj[finalPart];
        } catch(e) {
            return undefined;
        }
    };

    CQ_Analytics.CartMgr.validate = function(name, value) {
        if (name == "totalPriceFloat") {
            var price = parseFloat(value);
            return price >= 0;                  // will return false for NaN
        } else if (name.indexOf(".quantity") > 0) {
            var quantity = parseInt(value);
            return quantity >= 0;               // will return false for NaN
        }
        return true;
    };

    CQ_Analytics.CartMgr.setProperty = function(name, value) {
        if (!this.data) {
            this.init();
        }

        if (!this.validate(name, value)) {
            this.fireEvent("change", name);     // reset UI to current value
            return;
        }

        if (name == "totalPriceFloat") {
            this.registerSimulatedPrice(value);
        }

        var obj = this.data;

        var parts = name.split(".");
        for (var i = 0; i < parts.length-1; i++) {
            var part = parts[i];
            var indexPos = part.indexOf("[");
            var index = -1;
            if (indexPos > 0) {
                index = parseInt(part.substring(indexPos+1, part.length-1));
                part = part.substring(0, indexPos);
            }

            if (!obj[part]) {
                obj[part] = {};
            }
            obj = obj[part];

            if (index >= 0) {
                if (!obj[index]) {
                    obj[index] = {};
                }
                obj = obj[index];
            }
        }

        var finalPart = parts[parts.length-1];
        obj[finalPart] = value;
        var xssName = CQ.shared.XSS.getXSSPropertyName(finalPart);
        this.data[xssName] = CQ.shared.XSS.getXSSValue(value);
        this.fireEvent("change", name);
    };

    CQ_Analytics.CartMgr.addProductToCart = function(productPath, pagePath, title, image, price) {
        this.data.entries = this.data.entries || [];
        this.data.entries.push({
            title: CQ.shared.XSS.getXSSValue(title),
            quantity: 1,
            path: CQ.shared.XSS.getXSSValue(productPath),
            pagePath: CQ.shared.XSS.getXSSValue(pagePath),
            thumbnail: CQ.shared.XSS.getXSSValue(image),
            priceFormatted: CQ.shared.XSS.getXSSValue(price)
        });
        this.fireEvent("change", "entries");
    };

    CQ_Analytics.CartMgr.addVoucher = function(voucherCode) {
        this.data.vouchers = this.data.vouchers || [];
        var found = false;
        for (var i = 0; i < this.data.vouchers.length; i++) {
            if (this.data.vouchers[i].code == voucherCode) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.data.vouchers.push({code: voucherCode});
            this.fireEvent("change", "vouchers");
        }
    };

    CQ_Analytics.CartMgr.removeVoucher = function(voucherPath) {
        var found = -1;
        for (var i = 0; this.data.vouchers && i < this.data.vouchers.length; i++) {
            if (this.data.vouchers[i].path == voucherPath) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            this.data.vouchers.splice(found, 1);
            this.fireEvent("change", "vouchers");
        }
    };

    CQ_Analytics.CartMgr.addListener("change", function(eventName, propName) {
        var store = this;

        // Send any changed data up to the server for recalculation (and persistence):
        if (propName && propName != "totalPrice") {

            // No sense having to update twice if our changes result in changes to
            // the resolved promotions.
            this.resolvePromotions();

            if (window.CQ_Analytics
                && window.CQ_Analytics.CartMgr
                && window.CQ_Analytics.CartMgr.refreshTimeout) {
                clearTimeout(CQ_Analytics.CartMgr.refreshTimeout);
            }

            CQ_Analytics.CartMgr.refreshTimeout = setTimeout(function() {
                store.update();
            }, 50);
        }
    });

    //
    // Round-trip store to the server for recalculation and persistence
    //
    CQ_Analytics.CartMgr.update = function() {
        var store = this;

        if (window.ContextHub && ContextHub.getStore("cart")) {
            // ContextHub and ClientContext will fight if they both try to update the cart....
            return;
        }

        if (this.updateUrl) {
            $CQ.ajax({
                url: this.updateUrl,
                type: "POST",
                data: {
                    "cart": JSON.stringify(store.data)
                },
                externalize: false,
                encodePath: false,
                hook: true,
                success: function(jsonData) {
                    store.data = jsonData;
                    store.updateSimulatedPrice();
                    CQ_Analytics.ClientContextUtils.renderStore(CQ_Analytics.CartMgr.divId, CQ_Analytics.CartMgr.STORENAME);
                    store.fireEvent("updatecomplete");
                    store.fireEvent("update");
                }
            });

        }
    };

    CQ_Analytics.CartMgr.clear = function() {
        if (this.data["entries"]) {
            this.data["entries"] = [];
        }
        if (this.data["vouchers"]) {
            this.data["vouchers"] = [];
        }
        this.data["totalPrice"] = "0";

        this.referenceTotalPrice = null;
        this.simulatedTotalPrice = null;

        this.simulatedPromotions = null;
    };

    CQ_Analytics.CartMgr.reset = function() {
        this.clear();
        this.fireEvent("update");

        // persist changes locally
        this.persist();

        // and push them up to server
        this.update();
    };

    CQ_Analytics.CartMgr.resolvePromotions = function() {
        if (!this.promotionsMap) {
            return false;
        }
        if (!this.data.promotions) {
            this.data.promotions = [];
        }
        if (!CQ_Analytics.SegmentMgr.areSegmentsLoaded) {
            return false;
        }
        var resolvedSegments = CQ_Analytics.SegmentMgr.getResolved();

        var resolvedPromoPaths = [];
        var i, j, path, found;

        for (i = 0; i < this.promotionsMap.length; i++) {
            var testPromotionMap = this.promotionsMap[i];
            var testSegments = testPromotionMap.segments.split(",");
            for (found = false, j = 0; j < testSegments.length; j++) {
                if ($CQ.inArray(testSegments[j], resolvedSegments) >= 0) {
                    found = true;
                    break;
                }
            }
            if (found) {
                resolvedPromoPaths.push(testPromotionMap.path);
            }
        }

        var simulatedPromotions = this.simulatedPromotions || [];
        for (i = 0; i < simulatedPromotions.length; i++) {
            if ($CQ.inArray(simulatedPromotions[i].path, resolvedPromoPaths) < 0) {
                resolvedPromoPaths.push(simulatedPromotions[i].path);
            }
        }

        var changed = false;

        //
        // Check existing promotions to see if they're no longer resolved:
        //
        for (i = 0; i < this.data.promotions.length; i++) {
            path = this.data.promotions[i]["path"];
            for (found = false, j = 0; j < resolvedPromoPaths.length; j++) {
                if (resolvedPromoPaths[j] == path) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.data.promotions.splice(i--, 1);  // remove
                changed = true;
            }
        }

        //
        // See if there are any new promotions that have just been resolved:
        //
        for (i = 0; i < resolvedPromoPaths.length; i++) {
            path = resolvedPromoPaths[i];
            for (found = false, j = 0; j < this.data.promotions.length; j++) {
                if (this.data.promotions[j]["path"] == path) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var promo = { "path": path };
                this.data.promotions.push(promo);
                changed = true;
            }
        }

        return changed;
    };

    CQ_Analytics.CartMgr.resolveServerPromotions = function() {
        if (!this.serverPromotionsMap) {
            return false;
        }
        if (!this.data.promotions) {
            this.data.promotions = [];
        }
        if (!CQ_Analytics.SegmentMgr.areSegmentsLoaded) {
            return false;
        }
        var resolvedSegments = CQ_Analytics.SegmentMgr.getResolved();

        var resolvedPromoPaths = [];
        var i, j, path, found;

        for (i = 0; i < this.serverPromotionsMap.length; i++) {
            var testPromotionMap = this.serverPromotionsMap[i];
            var testSegments = testPromotionMap.segments.split(",");
            for (found = false, j = 0; j < testSegments.length; j++) {
                if ($CQ.inArray(testSegments[j], resolvedSegments) >= 0) {
                    found = true;
                    break;
                }
            }
            if (found) {
                resolvedPromoPaths.push(testPromotionMap.path);
            }
        }

        var changed = false;

        //
        // Check existing promotions to see if they're no longer resolved:
        //
        for (i = 0; i < this.data.promotions.length; i++) {
            if (!this.data.promotions[i]["resolve"])
                continue;

            path = this.data.promotions[i]["path"];
            for (found = false, j = 0; j < resolvedPromoPaths.length; j++) {
                if (resolvedPromoPaths[j] == path) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.data.promotions.splice(i--, 1);  // remove
                changed = true;
            }
        }

        //
        // See if there are any new promotions that have just been resolved:
        //
        for (i = 0; i < resolvedPromoPaths.length; i++) {
            path = resolvedPromoPaths[i];
            for (found = false, j = 0; j < this.data.promotions.length; j++) {
                if (this.data.promotions[j]["path"] == path) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var promo = { "path": path };
                this.data.promotions.push(promo);
                changed = true;
            }
        }

        return changed;
    };

    CQ_Analytics.CCM.addListener("configloaded", function() {

        CQ_Analytics.CCM.register(this);

        CQ_Analytics.SegmentMgr.addListener("update", function() {
            if (this.resolvePromotions()) {
                this.update();
            }
        }, CQ_Analytics.CartMgr);

        CQ_Analytics.SegmentMgr.addListener("update", function() {
            if (this.resolveServerPromotions()) {
                this.update();
            }
        }, CQ_Analytics.CartMgr);

    }, CQ_Analytics.CartMgr);
}


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
 */

if(!CQ_Analytics.CartHelper) {
    CQ_Analytics.CartHelper = (function() {
        return {

            containsProduct: function(data, product, quantity) {
                var productPagePath = product ? product.substring(0, product.lastIndexOf("#")) : null;
                for (var i = 0; data.entries && i < data.entries.length; i++) {
                    var entry = data.entries[i];
                    var entryPagePath = entry.page.substring(0, entry.page.lastIndexOf("#"));
                    if ((!product || entryPagePath == productPagePath) && (!quantity || entry.quantity >= quantity)) {
                        return true;
                    }
                }
                return false;
            },

            containsPromotion: function(data, promotion, status, operator) {
                if (!promotion)
                    return false;

                if (!status)
                    return false;

                if (!operator)
                    return false;

                function mainPart(s) {
                    if(s) {
                        var i = s.lastIndexOf("#");
                        if (i > -1) {
                            s = s.substring(0, i);
                        }
                    }
                    return s;
                }

                function promotionInCart(data, promotion, status){
                    var promotionPath = mainPart(promotion);
                    var promotions = data.promotions;
                    for (var i = 0; promotions && i < promotions.length; i++) {
                        var cartPromotion = promotions[i];
                        var entryPath = mainPart(cartPromotion.path);
                        if (entryPath == promotionPath && status == cartPromotion.status) {
                            return true;
                        }
                    }
                    return false;
                }

                if (operator == "contains") {
                    return promotionInCart(data, promotion, status);
                } else if (operator == "notcontains") {
                    return !promotionInCart(data, promotion, status);
                } else {
                    return false;
                }
            }
        };
    })();
}

