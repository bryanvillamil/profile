/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2011 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

if (!CQ_Analytics.ClientContext) {
    /**
     * The <code>ClientContext</code> object is a facade to access / update the session stores and
     * their properties contained in the {@link CQ_Analytics.ClientContextMgr}.
     * <br>
     * @static
     * @singleton
     * @class CQ_Analytics.ClientContext
     * @since 5.5
     * @deprecated since 6.2, use ContextHub instead
     */
    CQ_Analytics.ClientContext = new function() {
        return {
            /**
             * Returns a store or the value of a property from a store loaded in the ClientContext
             * @param {String} path Format: /"storeName" or /"storeName"/"propertyName". E.g.: /profile, /profile/email
             * or /geolocation/address/city. First / can be omitted - "profile" or profile/email would work too.
             * @param {Boolean} resolveVariables True to resolves the variables contained in the value (defaults to false).
             * @return {Object/String} a store or a property value. Null if not found.
             */
            get: function(path, resolveVariables) {
                if( path ) {
                    if( path.indexOf("/") != 0) {
                        path = "/" + path;
                    }

                    var storeName = path.split("/")[1];
                    var propertyName = path.substring(path.indexOf("/" + storeName) + storeName.length + 2, path.length);
                    var store = CQ_Analytics.CCM.getRegisteredStore(storeName);
                    if( store ) {
                        if( propertyName ) {
                            var value = store.getProperty(propertyName);
                            if( value && resolveVariables ) {
                                value = CQ_Analytics.Variables.replaceVariables(value);
                            }
                            return value;
                        }
                        return store;
                    }
                }
                return null;
            },

            /**
             * Sets the value of a property from a store loaded in the ClientContext
             * @param {String} path Format: /"storeName" or /"storeName"/"propertyName". E.g.: /profile, /profile/email
             * or /geolocation/address/city. First / can be omitted - "profile" or profile/email would work too.
             * @param {String} value New value of the property
             *
             */
            set: function(path, value) {
                if( path ) {
                    if( path.indexOf("/") != 0) {
                        path = "/" + path;
                    }

                    var storeName = path.split("/")[1];
                    var propertyName = path.substring(path.indexOf("/" + storeName) + storeName.length + 2, path.length);
                    var store = CQ_Analytics.CCM.getRegisteredStore(storeName);
                    if( store ) {
                        if( propertyName ) {
                            store.setProperty(propertyName,value);
                        }
                    }
                }
            },

            /**
             * Clears all the stores loaded in the ClientContext (removes properties and values)
             */
            clear: function() {
                var stores = CQ_Analytics.CCM.getStores();
                if( stores ) {
                    for(var s in stores) {
                        if( stores[s].clear ) {
                            stores[s].clear();
                        }
                    }
                }
            },

            /**
             * Resets all the stores loaded in the ClientContext (reset to initial values)
             */
            reset: function() {
                var stores = CQ_Analytics.CCM.getStores();
                if( stores ) {
                    for(var s in stores) {
                        if( stores[s].reset ) {
                            stores[s].reset();
                        }
                    }
                }
            },

            /**
             * Persists the full ClientContext content or the specified store.
             * @param {String} storeName Name of the store to persist.
             */
            persist: function(storeName) {
                CQ_Analytics.ClientContextMgr.ServerStorage.post(storeName, true);
            }
        }
    }();

    /**
     * Shortcut for the {@link CQ_Analytics.ClientContext}.
     * <br>
     * @static
     * @singleton
     * @class ClientContext
     * @since 5.5
     * @deprecated since 6.2, use ContextHub instead
     */
    window.ClientContext = CQ_Analytics.ClientContext;
    //just kept for compatibility with internal name during 5.5 dev
    /**
     * @deprecated since 6.2, use ContextHub instead
     */
    window.ContextCloud = CQ_Analytics.ClientContext;
}