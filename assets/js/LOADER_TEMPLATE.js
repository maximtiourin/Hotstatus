/*
 * Rankings Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
let RankingsLoader = {};

/*
 * Handles Ajax requests
 */
RankingsLoader.ajax = {
    /*
     * Executes function after given milliseconds
     */
    delay: function(milliseconds, func) {
        setTimeout(func, milliseconds);
    }
};

/*
 * The ajax handler for handling filters
 */
RankingsLoader.ajax.filter = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function(url = null) {
        let self = RankingsLoader.ajax.filter;

        if (url === null) {
            return self.internal.url;
        }
        else {
            self.internal.url = url;
            return self;
        }
    },
    /*
     * Returns the current season selected based on filter
     */
    getSeason: function() {
        let val = HotstatusFilter.getSelectorValues("season");

        let season = "Unknown";

        if (typeof val === "string" || val instanceof String) {
            season = val;
        }
        else if (val !== null && val.length > 0) {
            season = val[0];
        }

        return season;
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function(baseUrl, filterTypes) {
        let self = RankingsLoader.ajax.filter;

        if (!self.internal.loading && HotstatusFilter.validFilters) {
            let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

            if (url !== self.url()) {
                self.url(url).load();
            }
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = RankingsLoader.ajax;
        let self = RankingsLoader.ajax.filter;

        let data = RankingsLoader.data;

        //Enable Processing Indicator
        self.internal.loading = true;

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];

                /*
                 * Empty dynamically filled containers, reset all subajax objects
                 */

                /*
                 * Heroloader Container
                 */
                $('.initial-load').removeClass('initial-load');

                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();

                /*
                 * Enable advertising
                 */
                Hotstatus.advertising.generateAdvertising();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                self.internal.loading = false;
            });

        return self;
    }
};

/*
 * Handles binding data to the page
 */
RankingsLoader.data = {

};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    /*let baseUrl = Routing.generate('playerdata_pagedata_player', {player: player_id});

    let filterTypes = ["season", "gameType"];
    let filterAjax = RankingsLoader.ajax.filter;

    //filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });*/
});