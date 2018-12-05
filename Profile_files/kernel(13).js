/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
//AdobePatentID="2441US01"
if (!CQ_Analytics.GeolocationUtils) {
    /**
     * A helper class providing a set of utility methods to manage a geolocation store.
     * <br>
     * @static
     * @singleton
     * @class CQ_Analytics.GeolocationUtils
     * @deprecated since 6.2, use ContextHub instead
     */
    CQ_Analytics.GeolocationUtils = new function() {
        var storeName;
        var isReady;
        var onReadyCallbacks = [];

        var storeIsReady = function() {
            isReady = true;
            for(var i=0;i<onReadyCallbacks.length;i++) {
                if (onReadyCallbacks[i]) {
                    onReadyCallbacks[i].call(this, CQ_Analytics.GeolocationUtils.getStore());
                }
            }
        };

        return {
            /**
             * Initializes a persisted json store that contains the geolocation.
             * @param {String} sn Name of the store
             */
            init: function(sn) {
                storeName = sn;
                var geoloc;
                try {
                    geoloc = navigator.geolocation;
                } catch(e) {
                }

                var createStore = function(defaultData) {
                    var store = CQ_Analytics.PersistedJSONStore.registerNewInstance(storeName, defaultData);
                    store.addListener("update", function(event, property) {
                        var latitude = CQ_Analytics.ClientContext.get(storeName + "/latitude");
                        var longitude = CQ_Analytics.ClientContext.get(storeName + "/longitude");

                        if (!latitude || !longitude) {
                            if (property != "generatedThumbnail") {
                                store.setProperty("generatedThumbnail", CQ_Analytics.GeolocationUtils.THUMBNAILS.fallback);
                            } else {
                                //if not lat or lng, display the fallback thumbnail
                                if (store.getProperty(property, true) != CQ_Analytics.GeolocationUtils.THUMBNAILS.fallback) {
                                    store.setProperty(property, CQ_Analytics.GeolocationUtils.THUMBNAILS.fallback);
                                }
                            }
                        } else {
                            //if lat or lng, restore initial thumbnail if was set to the fallback
                            if (store.getProperty("generatedThumbnail", true) == CQ_Analytics.GeolocationUtils.THUMBNAILS.fallback) {
                                store.setProperty("generatedThumbnail", store.getInitProperty("generatedThumbnail"));
                            }
                        }
                    });
                    storeIsReady();
                };

                var initGeolocationStore = function(data, skipValues) {
                    var store = CQ_Analytics.StoreRegistry.getStore(storeName);
                    if (store) {
                        var setDefaults = true;

                        if (data) {
                            var latitude = parseInt(data.latitude * 1000000) / 1000000;
                            var longitude = parseInt(data.longitude * 1000000) / 1000000;

                            setDefaults = !(isFinite(latitude) && (typeof(latitude) === 'number') && isFinite(longitude) && (typeof(longitude) === 'number'));
                        }

                        /* if latitude or longitude was not set, use default values */
                        if (setDefaults) {
                            data = CQ_Analytics.GeolocationUtils.DEFAULTS;
                        }

                        //backup thumbnail
                        var gt = data["generatedThumbnail"] = store.getInitProperty("generatedThumbnail");
                        store.initJSON(data);

                        if (!skipValues) {
                            store.init();
                            //re set because it gets lost during init
                            store.setProperty("generatedThumbnail", gt);
                        }
                    } else {
                        createStore(data);
                    }
                };

                createStore();
                if (geoloc) {
                    geoloc.getCurrentPosition(
                        function(data) {
                            var d = {
                                "longitude": parseInt(data.coords.longitude * 1000000) / 1000000,
                                "latitude": parseInt(data.coords.latitude * 1000000) / 1000000
                            };

                            if (data.address) {
                                d["address"] = data.address
                            }

                            initGeolocationStore(d, CQ_Analytics.CCM.areStoresInitialized);
                        }, function(error) {
                            if (!CQ_Analytics.CCM.areStoresInitialized) {
                                var msg = "Error";
                                if( CQ_Analytics.isUIAvailable ) {
                                    //code = 3 default is timeout
                                    msg = CQ.I18n.getMessage("Connection timeout", null, "timeout while connecting geolocation service");
                                    if (error.code == 1) {
                                        msg = CQ.I18n.getMessage("Permission denied", null, "permission denied message from goelocation service");
                                    } else {
                                        if (error.code == 2) {
                                            msg = CQ.I18n.getMessage("Position unavailable", null, "geolocation service couldn't find location");
                                        }
                                    }
                                }

                                var d = {
                                    "address": {
                                        "country": msg
                                    }
                                };

                                initGeolocationStore(d, CQ_Analytics.CCM.areStoresInitialized);
                            }
                        }
                    );
                } else {
                    initGeolocationStore();
                }
            },
            onReady: function(callback) {
                if (isReady) {
                    callback.call(this,CQ_Analytics.GeolocationUtils.getStore());
                } else {
                    onReadyCallbacks.push(callback);
                }
            },

            getStore: function() {
                return CQ_Analytics.StoreRegistry.getStore(storeName);
            }
        }
    }();

    //defines the default location if current one could not be resolved (defaults to Adobe HQ)
    CQ_Analytics.GeolocationUtils.DEFAULTS = {
        "latitude": 37.331375,//= Adobe HQ // 47.554995, = basel
        "longitude": -121.893992//= Adobe HQ // 7.589998 = basel
    };

    //fallback thumbnail on California max zoom
    CQ_Analytics.GeolocationUtils.THUMBNAILS = {
        "fallback": document.location.protocol + "//maps.googleapis.com/maps/api/staticmap?center=37,-121&zoom=0&size=80x80&sensor=false" +
            "&client=gme-adobesystemsincorporated&channel=clientcontext&signature=wqNolKQ144hypPUiTmIypxPc1s8="
    }
}

