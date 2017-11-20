/*
 * Player Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
let PlayerLoader = {};

/*
 * Handles Ajax requests
 */
PlayerLoader.ajax = {};

/*
 * The ajax handler for handling filters
 */
PlayerLoader.ajax.filter = {
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
        let self = PlayerLoader.ajax.filter;

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

    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function(baseUrl, filterTypes) {
        let self = PlayerLoader.ajax.filter;

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
        let ajax = PlayerLoader.ajax;
        let self = PlayerLoader.ajax.filter;

        let data = PlayerLoader.data;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#playerloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];

                /*
                 * Empty dynamically filled containers
                 */

                /*
                 * Heroloader Container
                 */
                $('#playerloader-container').removeClass('initial-load');

                /*
                 * Initial matches
                 */
                let ajaxMatches = ajax.matches;
                ajaxMatches.internal.offset = 0;
                ajaxMatches.internal.limit = json.limits.matches;


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
                //Disable Processing Indicator
                $('.heroloader-processing').remove();

                self.internal.loading = false;
            });

        return self;
    }
};

PlayerLoader.ajax.matches = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
        offset: 0, //Matches offset
        limit: 5, //Matches limit
    },
    generateUrl: function() {
        let self = PlayerLoader.ajax.matches;

        return Routing.generate("playerdata_pagedata_player_recentmatches", {
            player: player_id,
            offset: self.internal.offset,
            limit: self.internal.limit,
            season: PlayerLoader.ajax.filter.getSeason()
        });
    },
    /*
     * Loads {limit} recent matches offset by {offset} from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = PlayerLoader.ajax;
        let self = PlayerLoader.ajax.matches;

        let data = PlayerLoader.data;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];

                /*
                 * Empty dynamically filled containers
                 */


                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();
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
PlayerLoader.data = {
    matches: {
        generateMatchWidget: function() {
            //Generates the small match bar with simple info
        },
        generateFullMatchPane: function() {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view
        },
        generate: function(matches) {
            //Generates the matches pane and fills with initial offering of match widgets
        },
        empty: function() {
            //Empties the matches pane (will probably never need)
            $('#pl-recentmatches-container').empty();
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_player', {player: player_id});

    let filterTypes = ["season"];
    let filterAjax = PlayerLoader.ajax.filter;

    filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });
});