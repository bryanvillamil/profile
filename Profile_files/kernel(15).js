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
 * The <code>CQ_Analytics.CampaignMgr</code> object is a store providing campaign information
 * 
 * This store exposes the following properties:
 * 
 * <ol>
 *  <li>name: the name of the campaign</li>
 *  <li>path: the path of the campaign page in the CQ repository</li>
 *  <li>id: the id the campaign page in Adobe Target</li>
 *  <li>recipe/name</li>
 *  <li>recipe/path</li>
 *  <li>recipe/id</li>
 * </ol>
 * 
 * @class CQ_Analytics.CampaignMgr
 * @singleton
 * @extends CQ_Analytics.SessionStore
 * @deprecated since 6.2, use ContextHub instead
 */
if (!CQ_Analytics.CampaignMgr) {
    /**
     * @deprecated since 6.2, use ContextHub instead
     * @constructor
     */
    CQ_Analytics.CampaignMgr = function() {};

    CQ_Analytics.CampaignMgr.prototype = new CQ_Analytics.PersistedSessionStore();

    /**
     * @cfg {String} STOREKEY
     * Store internal key
     * @final
     * @private
     */
    CQ_Analytics.CampaignMgr.prototype.STOREKEY = "CAMPAIGN";

    /**
     * Store internal name
     * @private
     */
    CQ_Analytics.CampaignMgr.prototype.STORENAME = "campaign";

    /**
     * String identifying the default experience (only used for editing).
     * All experience paths start with a slash, so there can be no collision.
     * @final
     * @private
     */
    CQ_Analytics.CampaignMgr.prototype.DEFAULT_EXPERIENCE = "DEFAULT";

    //inheritDoc
    CQ_Analytics.CampaignMgr.prototype.init = function() {
        var p;

        this.persistence = new CQ_Analytics.SessionPersistence({'container': 'ClientContext'});
        var value = this.persistence.get(this.getStoreKey());
        if (!this.data) {
            this.data = {};
        }

        if (!value || value === "") {
            for (p in this.initProperty) {
                if (this.initProperty.hasOwnProperty(p)) {
                    this.data[p] = this.initProperty[p];
                }
            }
        } else {
            this.data = this.parse(value);
            // campaigns are not persisted
            var campaigns = this.getInitProperty('campaigns');
            if ( campaigns ) {
                this.data.campaigns = campaigns;
            }
        }
        this.validate();

        this.persist();
        this.initialized = true;
        this.fireEvent("initialize",this);
        this.fireEvent("update");
    };

    CQ_Analytics.CampaignMgr.prototype.validate = function() {
        // only check if we have the list of all campaigns
        if (this.data.campaigns) {
            if (!this.getCampaignBy("path", this.data.path) && !this.getCampaignBy("id", this.data.id)) {
                // campaign not found
                this.setCampaign(null);
            }
            if (this.data["recipe/path"] !== CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {
                if (!this.getExperienceBy("path", this.data["recipe/path"]) && !this.getExperienceBy("id", this.data["recipe/id"])) {
                    // experience not found
                    this.setExperience(null);
                }
            }
        }
    };

    CQ_Analytics.CampaignMgr.prototype.getCampaignBy = function(prop, value) {
        if (!this.data || !this.data.campaigns) {
            return null;
        }
        var i, campaigns = this.data.campaigns;
        for ( i = 0 ; i < campaigns.length; i++ ) {
            var campaign = campaigns[i];
            if ( campaign[prop] === value ) {
                return campaign;
            }
        }
        return null;
    };

    CQ_Analytics.CampaignMgr.prototype.getExperienceBy = function(prop, value) {
        if (!this.data || !this.data.campaigns) {
            return null;
        }
        var i, campaigns = this.data.campaigns;
        for ( i = 0 ; i < campaigns.length; i++ ) {
            var campaign = campaigns[i];
            for ( var j = 0 ; j < campaign.experiences.length ; j++ ) {
                var experience = campaign.experiences[j];
                if ( experience[prop] === value ) {
                    return experience;
                }
            }
        }
        return null;
    };

    CQ_Analytics.CampaignMgr.prototype.setCampaign = function(campaign) {
        // update all the campaign properties
        this.setProperties({
            'name': campaign ? campaign.title : "",
            'path': campaign ? campaign.path  : "",
            'id'  : campaign ? campaign.id    : "",

            'recipe/name' :  campaign ? CQ.I18n.getMessage("(default)") : "",
            'recipe/path' :  campaign ? this.DEFAULT_EXPERIENCE : "",
            'recipe/id'   :  campaign ? this.DEFAULT_EXPERIENCE : ""
        });
    };

    CQ_Analytics.CampaignMgr.prototype.setExperience = function(experience) {
        this.setProperties({
            'recipe/name' :  experience ? experience.title : "",
            'recipe/path' :  experience ? experience.path : "",
            'recipe/id'   :  experience ? experience.id : ""
        });
    };

    CQ_Analytics.CampaignMgr.prototype.setProperty = function(name, value) {
        // certain properties must update co-properties as well
        if (name === "id" || name === "path") {
            // campaigns: path and id are unique
            this.setCampaign(this.getCampaignBy(name, value));
            return;

        } else if (name === "recipe/id" || name === "recipe/path") {
            if (value !== CQ_Analytics.CampaignMgr.DEFAULT_EXPERIENCE) {
                // experiences: path and id are unique
                this.setExperience(this.getExperienceBy(name.substring("recipe/".length), value));
                return;
            }
        }

        // otherwise update individually
        CQ_Analytics.PersistedSessionStore.prototype.setProperty.call(this, name, value);
    };
    
    CQ_Analytics.CampaignMgr.prototype.isCampaignSelected = function() {
        
        return this.getProperty("path") !== '';
    };

    //inheritDoc
    CQ_Analytics.CampaignMgr.prototype.clear = function() {
        this.data = null;
        this.initProperty = {};
    };

    //inheritDoc
    CQ_Analytics.CampaignMgr.prototype.getLabel = function(name) {
        return name;
    };

    //inheritDoc
    CQ_Analytics.CampaignMgr.prototype.getLink = function(name) {
        return "";
    };

    CQ_Analytics.CampaignMgr = new CQ_Analytics.CampaignMgr();
    CQ_Analytics.CCM.register(CQ_Analytics.CampaignMgr);
}