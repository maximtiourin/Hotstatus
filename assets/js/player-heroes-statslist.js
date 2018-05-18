let StatslistLoader = {};

StatslistLoader.ajax = {};

/*
 * The ajax handler for handling filters
 */
StatslistLoader.ajax.filter = {
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
        let self = StatslistLoader.ajax.filter;

        if (url === null) {
            return self.internal.url;
        }
        else {
            self.internal.url = url;
            return self;
        }
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function(baseUrl, filterTypes) {
        let self = StatslistLoader.ajax.filter;

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
        let ajax = StatslistLoader.ajax;
        let self = StatslistLoader.ajax.filter;

        let data = StatslistLoader.data;
        let data_statslist = data.statslist;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroes-statslist-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_heroes = json.heroes;

                /*
                 * Empty dynamically filled containers, reset all subajax objects
                 */
                data_statslist.empty();

                /*
                 * Statslist Container
                 */
                $('.initial-load').removeClass('initial-load');
                
                /*
                 * Datatable Statslist
                 */
                if (json_heroes.length > 0) {
                    data_statslist.generateContainer(json.last_updated);

                    data_statslist.generateTable();

                    let statslistTable = data_statslist.getTableConfig();

                    statslistTable.data = [];
                    for (let hero of json_heroes) {
                        statslistTable.data.push(data_statslist.generateTableData(hero));
                    }

                    data_statslist.initTable(statslistTable);
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
StatslistLoader.data = {
    statslist: {
        empty: function() {
            $('#heroes-statslist').remove();
        },
        generateContainer: function(last_updated_timestamp) {
            let date = (new Date(last_updated_timestamp * 1000)).toLocaleString();

            let html = '<div id="heroes-statslist">' +
                '</div>';

            $('#heroes-statslist-container').append(html);

            //Update last updated
            $('#statslist-lastupdated').html('<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="Last Updated: '+ date +'"><i class="fa fa-info-circle lastupdated-info" aria-hidden="true"></i></span>');
        },
        generateTableData: function(hero) {
            let heroPortrait = '<img src="'+ image_bpath + hero.image_hero +'.png" class="rounded-circle hsl-portrait">';

            let heroProperName = '<a class="hsl-link" href="'+ Routing.generate('hero', {heroProperName: hero.name}) +'">'+ hero.name +'</a>';

            let heroNameSort = hero.name_sort;

            let heroRoleBlizzard = hero.role_blizzard;

            let heroRoleSpecific = hero.role_specific;

            let heroPlayed = hero.played;

            let heroBanned = hero.banned;

            let heroPopularity = '<span class="hsl-number-popularity">'+ hero.popularity +'</span>' +
                '<div class="hsl-percentbar hsl-percentbar-popularity" style="width:'+ hero.popularity_percent +'%;"></div>';

            //Winrate
            let heroWinrate = '';
            if (hero.winrate_exists) {
                let color = "hsl-number-winrate-red";
                if (hero.winrate_raw >= 50.0) color = "hsl-number-winrate-green";
                heroWinrate = '<span class="' + color + '">'+ hero.winrate +'</span>' +
                    '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:'+ hero.winrate_percent +'%;"></div>';
            }

            //Windelta
            let heroWindelta = '';
            if (hero.windelta_exists) {
                let color = "hsl-number-delta-red";
                if (hero.windelta_raw >= 0) color = "hsl-number-delta-green";
                heroWindelta = '<span class="'+ color +'">'+ hero.windelta +'</span>';
            }

            return [heroPortrait, heroProperName, heroNameSort, heroRoleBlizzard, heroRoleSpecific, heroPlayed, heroBanned, heroPopularity, heroWinrate, heroWindelta];
        },
        getTableConfig: function() {
            let datatable = {};

            datatable.columns = [
                {"width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1},
                {"title": 'Hero', "width": "17%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
                {"title": 'Hero_Sort', "visible": false, "responsivePriority": 999},
                {"title": 'Role', "visible": false, "responsivePriority": 999},
                {"title": 'Role_Specific', "visible": false, "responsivePriority": 999},
                {"title": 'Games Played', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Games Banned', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Popularity', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Winrate', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1}
            ];

            datatable.order = [[8, 'desc']]; //The default ordering of the table on load => column 9 at index 8 descending
            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };
            datatable.processing = false; //Displays an indicator whenever the table is processing data
            datatable.deferRender = false; //Defers rendering the table until data starts coming in

            datatable.paging = false; //Controls whether or not the table is allowed to paginate data by page length
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.fixedHeader = document.documentElement.clientWidth >= 525;

            return datatable;
        },
        generateTable: function() {
            $('#heroes-statslist').append('<table id="hsl-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        initTable: function(dataTableConfig) {
            let table = $('#hsl-table').DataTable(dataTableConfig);

            //Search the table for the new value typed in by user
            $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function() {
                table.search($(this).val()).draw();
            });

            //Search the table for the new value populated by role button
            $('button.hsl-rolebutton').click(function () {
                table.search($(this).attr("value")).draw();
            });
        }
    }
};

$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_datatable_heroes_statslist', {
        region: player_region,
        player: player_id
    });

    let filterTypes = ["season", "gameType", "map"];
    let filterAjax = StatslistLoader.ajax.filter;

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