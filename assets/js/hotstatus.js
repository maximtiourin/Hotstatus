//Google Ads Define
(adsbygoogle = window.adsbygoogle || []).push({});

//Begin hotstatus definitions
(function ($) {
    let HotstatusFilter = {
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
                filterSubmitElement.prop("disabled", true);
                return false;
            }
            else {
                filterSubmitElement.prop("disabled", false);
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

                    if (fvals !== null && fvals.length > 0) {
                        //Construct filter fragment for these values
                        filterFragments[type] = type + '=' + fvals.join('+');
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
            return $('select.filter-selector-' + selector_type + ' option').length;
        }
    };

    window.HotstatusFilter = HotstatusFilter;
})(jQuery);