//Begin hotstatus definitions
(function ($) {
    let Hotstatus = {
        advertising: {
            internal: {
                generated: false,
                generateByDefault: true
            },
            generateAdvertising: function () {
                let self = Hotstatus.advertising;

                if (!self.internal.generated) {
                    //Enable/Disable ad classes
                    if (document.documentElement.clientWidth >= 1200) {
                        $('.adslot_vertical').addClass('adsbygoogle');
                    }

                    //Google Ads Define
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    }
                    catch (e) {
                        //Google ad exception -- fail quietly
                    }

                    self.internal.generated = true;
                }
            }
        }
    };
    window.Hotstatus = Hotstatus;

    let HotstatusFilter = {
        validFilters: false,
        /*
         * Validates the selectors of the given filter types, if their current selections are invalid, then
         * disable the given submit element and add a filter-error class to the invalid selectors. Returns
         * true if all selectors were valid, false if any selector was invalid
         */
        validateSelectors: function(filterSubmitElement, filter_types) {
            let self = HotstatusFilter;

            let invalid = false;

            for (let type of filter_types) {
                let fvals = self.getSelectorValues(type);
                let fcount = self.countSelectorOptions(type);

                if (fvals === null || fvals.length <= 0) {
                    //Toggle filter-error on
                    self.setSelectorError(type, true);
                    invalid = true;
                }
                else {
                    //Make sure filter-error is toggled off
                    self.setSelectorError(type, false);
                }
            }

            if (invalid) {
                if (filterSubmitElement !== null) filterSubmitElement.prop("disabled", true);
                self.validFilters = false;
                return false;
            }
            else {
                if (filterSubmitElement !== null) filterSubmitElement.prop("disabled", false);
                self.validFilters = true;
                return true;
            }
        },
        /*
         * Generates a url with filter query parameters given a baseUrl and the filter types to look for.
         *
         * Filter types is an array of strings describing the types of filters in use
         * to generate a url for. EX: ['map', 'rank', 'gameType']
         */
        generateUrl: function(baseUrl, filter_types) {
            let self = HotstatusFilter;

            let filterFragments = {};

            //Check filters
            let filterCount = 0;
            for (let type of filter_types) {
                //Check if filter fragment has been set yet
                if (!(filterFragments.hasOwnProperty(type))) {
                    //Attempt to find the filter and get its values
                    let fvals = self.getSelectorValues(type);

                    if (typeof fvals === "string" || fvals instanceof String) {
                        filterFragments[type] = type + '=' + fvals;
                        filterCount++;
                    }
                    else if (fvals !== null && fvals.length > 0) {
                        //Construct filter fragment for these values
                        filterFragments[type] = type + '=' + fvals.join(',');
                        filterCount++;
                    }
                }
            }

            if (filterCount > 0) {
                let url = baseUrl + '?';

                Object.keys(filterFragments).forEach(function(key,index) {
                    url += filterFragments[key];

                    if (index < filterCount - 1) {
                        url += '&';
                    }
                });

                url = encodeURI(url);

                return url;
            }
            else {
                return encodeURI(baseUrl);
            }
        },
        setSelectorError: function(selector_type, bool) {
            let selector = $('div.filter-selector-' + selector_type + ' > .dropdown-toggle').first();

            if (bool) {
                selector.addClass('filter-error');
            }
            else {
                selector.removeClass('filter-error');
            }
        },
        getSelectorValues: function(selector_type) {
            let selector = $('select.filter-selector-' + selector_type).first();
            if (selector.length) {
                return selector.val();
            }
            else {
                return null;
            }
        },
        countSelectorOptions: function(selector_type) {
            return $('select.filter-selector-' + selector_type).first().find('option').length;
        }
    };
    window.HotstatusFilter = HotstatusFilter;
})(jQuery);