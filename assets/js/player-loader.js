/*
 * Player Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
let PlayerLoader = {};

/*
 * Handles loading on valid filters, making sure to only fire once until loading is complete
 */
PlayerLoader.validateLoad = function(baseUrl/*, filterTypes*/) {
    /*if (!PlayerLoader.ajax.internal.loading && HotstatusFilter.validFilters) {
        let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== PlayerLoader.ajax.url()) {
            PlayerLoader.ajax.url(url).load();
        }
    }*/
    if (!PlayerLoader.ajax.internal.loading) {
        let url = baseUrl + '?player_id=' + player_id;

        if (url !== PlayerLoader.ajax.url()) {
            PlayerLoader.ajax.url(url).load();
        }
    }
};

/*
 * Handles Ajax requests
 */
PlayerLoader.ajax = {
    internal: {
        loading: false, //Whether or not the player loader is currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function(url = null) {
        let self = PlayerLoader.ajax;

        if (url === null) {
            return self.internal.url;
        }
        else {
            self.internal.url = url;
            return self;
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let self = PlayerLoader.ajax;

        let data = PlayerLoader.data;
        let data_matches = data.matches;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#playerloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_matches = json.matches;

                /*
                 * Empty dynamically filled containers
                 */
                data_matches.empty();

                /*
                 * Heroloader Container
                 */
                $('#playerloader-container').removeClass('initial-load');

                /*
                 * Matches
                 */
                data_matches.generate(json.matches);



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

/*
 * Handles binding data to the page
 */
PlayerLoader.data = {
    matches: {
        generate: function(matches) {
            //TODO - actually implement
            for (let match of matches) {
                $('#pl-recentmatches-container').append('<div>' + match.date + '</div>');
            }
        },
        empty: function() {
            $('#pl-recentmatches-container').empty();
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_player');
    PlayerLoader.validateLoad(baseUrl);
    /*let filterTypes = ["gameType"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    PlayerLoader.validateLoad(baseUrl, filterTypes);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        PlayerLoader.validateLoad(baseUrl, filterTypes);
    });*/
});