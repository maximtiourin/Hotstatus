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
        data_ranks = data.ranks;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#rankingsloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_ranks = json.ranks;

                /*
                 * Empty dynamically filled containers, reset all subajax objects
                 */
                data_ranks.empty();
                
                /*
                 * Rankingsloader Container
                 */
                $('.initial-load').removeClass('initial-load');

                /*
                 * Get Rankings
                 */
                if (json_ranks.length > 0) {
                    data_ranks.generateContainer(json.limits.rankLimit, json.limits.matchLimit, json.last_updated);

                    data_ranks.generateTable();

                    let ranksTable = data_ranks.getTableConfig(json.limits.rankLimit, json_ranks.length);

                    ranksTable.data = [];
                    for (let rank of json_ranks) {
                        ranksTable.data.push(data_ranks.generateTableData(rank));
                    }

                    data_ranks.initTable(ranksTable);
                }

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
RankingsLoader.data = {
    ranks: {
        empty: function() {
            $('#rankings-container').remove();
        },
        generateContainer: function(rankLimit, matchLimit, last_updated_timestamp) {
            let date = (new Date(last_updated_timestamp * 1000)).toLocaleString();

            let html = '<div id="rankings-container" class="rankings-container hotstatus-subcontainer">' +
                '<div class="rankings-header">' +
                '<div class="rankings-header-left">Players require '+ matchLimit +' matches played in order to qualify for Top '+ rankLimit +' rankings.</div>' +
                '<div class="rankings-header-right">Last Updated: '+ date +'.</div>' +
                '</div>' +
                '</div>';

            $('#rankings-middlepane').append(html);
        },
        generateTableData: function(row) {
            let rank = row.rank;

            let player = '<a class="rankings-playername" href="' + Routing.generate("player", {id: row.player_id}) + '" target="_blank">'+ row.player_name +'</a>';

            let played = row.played;

            let rating = row.rating;

            return [rank, player, played, rating];
        },
        getTableConfig: function(rowLimit, rowLength) {
            let datatable = {};

            //Columns definition
            datatable.columns = [
                {"title": "Rank", "sClass": "sortIcon_Number", "orderSequence": ['asc', 'desc'], "searchable": false},
                {"title": "Player", "sClass": "sortIcon_Text", "orderSequence": ['asc', 'desc'], "searchable": true},
                {"title": "Played", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'], "searchable": false},
                {"title": "Rating", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'], "searchable": false},
            ];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[0, 'asc']];

            datatable.deferRender = true;
            datatable.pageLength = rowLimit;
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            //datatable.pagingType = "simple_numbers";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        generateTable: function() {
            $('#rankings-container').append('<table id="rankings-table" class="rankings-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead></thead></table>');
        },
        initTable: function(dataTableConfig) {
            let table = $('#rankings-table').DataTable(dataTableConfig);

            //Search the table for the new value typed in by user
            $('#rankings-search').on("propertychange change click keyup input paste", function() {
                table.search($(this).val()).draw();
            });
        }
    }
};


$(document).ready(function() {
    //$.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_rankings');

    let filterTypes = ["region", "season", "gameType"];
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
    });
});