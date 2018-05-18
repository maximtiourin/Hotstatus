let StatslistLoader = {};

let dataTableContext = null;

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
        internal: {
            cycleColumns: {
                "Played": {
                    index: 5
                },
                "KDA": {
                    index: 7
                },
                "MVP": {
                    index: 8
                },
                "MVP Medals": {
                    index: 9
                },
                "Popularity": {
                    index: 10
                },
                "Winrate": {
                    index: 11
                },
                "Hero Dmg": {
                    index: 12
                },
                "Siege Dmg": {
                    index: 13
                },
                "Structure Dmg": {
                    index: 14
                },
                "Healing": {
                    index: 15
                },
                "Damage Taken": {
                    index: 16
                },
                "Experience": {
                    index: 17
                },
                "Merc Camps": {
                    index: 18
                },
                "Kills": {
                    index: 19
                },
                "Deaths": {
                    index: 20
                },
                "Assists": {
                    index: 21
                },
                "Best Killstreak": {
                    index: 22
                },
                "Time Dead (Seconds)": {
                    index: 23
                }
            },
            cycleOptions: [
                {
                    name: "Summary",
                    cols: {
                        "Played": {
                            visible: true,
                        },
                        "KDA": {
                            visible: true,
                        },
                        "MVP": {
                            visible: true,
                        },
                        "MVP Medals": {
                            visible: true,
                        },
                        "Popularity": {
                            visible: true,
                        },
                        "Winrate": {
                            visible: true,
                        },
                        "Hero Dmg": {
                            visible: false,
                        },
                        "Siege Dmg": {
                            visible: false,
                        },
                        "Structure Dmg": {
                            visible: false,
                        },
                        "Healing": {
                            visible: false,
                        },
                        "Damage Taken": {
                            visible: false,
                        },
                        "Experience": {
                            visible: false,
                        },
                        "Merc Camps": {
                            visible: false,
                        },
                        "Kills": {
                            visible: false,
                        },
                        "Deaths": {
                            visible: false,
                        },
                        "Assists": {
                            visible: false,
                        },
                        "Best Killstreak": {
                            visible: false,
                        },
                        "Time Dead (Seconds)": {
                            visible: false,
                        }
                    }
                },
                {
                    name: "Performance",
                    cols: {
                        "Played": {
                            visible: true,
                        },
                        "KDA": {
                            visible: false,
                        },
                        "MVP": {
                            visible: false,
                        },
                        "MVP Medals": {
                            visible: false,
                        },
                        "Popularity": {
                            visible: false,
                        },
                        "Winrate": {
                            visible: false,
                        },
                        "Hero Dmg": {
                            visible: true,
                        },
                        "Siege Dmg": {
                            visible: true,
                        },
                        "Structure Dmg": {
                            visible: true,
                        },
                        "Healing": {
                            visible: true,
                        },
                        "Damage Taken": {
                            visible: true,
                        },
                        "Experience": {
                            visible: true,
                        },
                        "Merc Camps": {
                            visible: true,
                        },
                        "Kills": {
                            visible: false,
                        },
                        "Deaths": {
                            visible: false,
                        },
                        "Assists": {
                            visible: false,
                        },
                        "Best Killstreak": {
                            visible: false,
                        },
                        "Time Dead (Seconds)": {
                            visible: false,
                        }
                    }
                },
                {
                    name: "Miscellaneous",
                    cols: {
                        "Played": {
                            visible: true,
                        },
                        "KDA": {
                            visible: true,
                        },
                        "MVP": {
                            visible: false,
                        },
                        "MVP Medals": {
                            visible: false,
                        },
                        "Popularity": {
                            visible: false,
                        },
                        "Winrate": {
                            visible: false,
                        },
                        "Hero Dmg": {
                            visible: false,
                        },
                        "Siege Dmg": {
                            visible: false,
                        },
                        "Structure Dmg": {
                            visible: false,
                        },
                        "Healing": {
                            visible: false,
                        },
                        "Damage Taken": {
                            visible: false,
                        },
                        "Experience": {
                            visible: false,
                        },
                        "Merc Camps": {
                            visible: false,
                        },
                        "Kills": {
                            visible: true,
                        },
                        "Deaths": {
                            visible: true,
                        },
                        "Assists": {
                            visible: true,
                        },
                        "Best Killstreak": {
                            visible: true,
                        },
                        "Time Dead (Seconds)": {
                            visible: true,
                        }
                    }
                }
            ],
            cycleSelected: 0,
            cycleSet: function(cycleName) {
                let self = StatslistLoader.data.statslist.internal;

                let cyclesize = self.cycleOptions.length;

                let properCycleName = cycleName.toString();

                let selectedName = self.cycleOptions[self.cycleSelected].name.toString();

                if (properCycleName !== selectedName) {
                    for (let i = 0; i < cyclesize; i++) {
                        if (self.cycleOptions[i].name === properCycleName) {
                            self.cycleSelected = i;

                            self.cycleRenderLabel();
                            self.cycleRenderTable();

                            break;
                        }
                    }
                }
            },
            cycleIncrement: function(direction) {
                let self = StatslistLoader.data.statslist.internal;

                let cyclesize = self.cycleOptions.length;

                self.cycleSelected = self.cycleSelected + direction;

                if (self.cycleSelected < 0) self.cycleSelected = cyclesize - 1;
                if (self.cycleSelected >= cyclesize) self.cycleSelected = 0;

                self.cycleRenderLabel();
                self.cycleRenderTable();
            },
            cycleRenderLabel: function() {
                let self = StatslistLoader.data.statslist.internal;

                $('#statslist-cyclelabel').html(self.cycleOptions[self.cycleSelected].name);
            },
            cycleRenderTable: function() {
                if (dataTableContext !== null) {
                    let self = StatslistLoader.data.statslist.internal;

                    let cyopt = self.cycleOptions[self.cycleSelected];

                    for (let colkey in self.cycleColumns) {
                        if (self.cycleColumns.hasOwnProperty(colkey)) {
                            let col = self.cycleColumns[colkey];

                            dataTableContext.column(col.index).visible(cyopt.cols[colkey].visible);
                        }
                    }

                    dataTableContext.draw();
                }
            }
        },
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

            let heroProperName = '<a class="hsl-link" href="'+ Routing.generate("playerhero", {region: player_region, id: player_id, heroProperName: hero.name}) +'" target="_blank">'+ hero.name +'</a>';

            let heroNameSort = hero.name_sort;

            let heroRoleBlizzard = hero.role_blizzard;

            let heroRoleSpecific = hero.role_specific;

            let heroPlayed = hero.played;

            /*
             * KDA
             */
            //Good kda
            let goodkda = 'rm-sw-sp-kda-num';
            if (hero.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good'
            }
            if (hero.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great'
            }

            let heroKDA = '<span class="'+ goodkda +'">' + hero.kda_avg + '</span>';

            //MVP Hero Percent
            let heroMVPHero = '<span class="hsl-number-mvp">'+ hero.mvp_herorate +'</span>' +
                '<div class="hsl-percentbar hsl-percentbar-mvp" style="width:'+ hero.mvp_herorate_percent +'%;"></div>';

            //MVP Total Percent
            let heroMVP = '<span class="hsl-number-mvp-medals">'+ hero.mvp_medals +'</span>' +
                '<div class="hsl-percentbar hsl-percentbar-mvp-medals" style="width:'+ hero.mvp_rate_percent +'%;"></div>';

            //Popularity
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

            let heroDmg = '<span class="hsl-number-popularity">'+ hero.hero_damage_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-herodamage" style="width:'+ hero.hero_damage_avg_percent +'%;"></div>';
            let siegeDmg = '<span class="hsl-number-popularity">'+ hero.siege_damage_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-siegedamage" style="width:'+ hero.siege_damage_avg_percent +'%;"></div>';
            let structureDmg = '<span class="hsl-number-popularity">'+ hero.structure_damage_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-structuredamage" style="width:'+ hero.structure_damage_avg_percent +'%;"></div>';
            let healing = '<span class="hsl-number-popularity">'+ hero.healing_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-healing" style="width:'+ hero.healing_avg_percent +'%;"></div>';
            let damageTaken = '<span class="hsl-number-popularity">'+ hero.damage_taken_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-damagetaken" style="width:'+ hero.damage_taken_avg_percent +'%;"></div>';
            let exp_contrib = '<span class="hsl-number-popularity">'+ hero.exp_contrib_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-expcontrib" style="width:'+ hero.exp_contrib_avg_percent +'%;"></div>';
            let merc_camps = '<span class="hsl-number-popularity">'+ hero.merc_camps_avg +'</span>' +
                '<div class="hsl-percentbar rm-fm-r-stats-merccamps" style="width:'+ hero.merc_camps_avg_percent +'%;"></div>';
            let kills = hero.kills_avg;
            let deaths = hero.deaths_avg;
            let assists = hero.assists_avg;
            let killstreak = hero.best_killstreak;
            let time_spent_dead = hero.time_spent_dead_avg;

            return [heroPortrait, heroProperName, heroNameSort, heroRoleBlizzard, heroRoleSpecific, heroPlayed, hero.kda_raw, heroKDA, heroMVPHero, heroMVP, heroPopularity, heroWinrate,
                    heroDmg, siegeDmg, structureDmg, healing, damageTaken, exp_contrib, merc_camps, kills, deaths, assists, killstreak, time_spent_dead];
        },
        getTableConfig: function() {
            let self = StatslistLoader.data.statslist;
            let internal = self.internal;
            let cyopts = internal.cycleOptions;

            let cyopt = cyopts[internal.cycleSelected];

            let datatable = {};

            datatable.columns = [
                {"width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1},
                {"title": 'Hero', "width": "15%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
                {"title": 'Hero_Sort', "visible": false, "responsivePriority": 999},
                {"title": 'Role', "visible": false, "responsivePriority": 999},
                {"title": 'Role_Specific', "visible": false, "responsivePriority": 999},
                {"title": 'Played', "visible": cyopt.cols['Played'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'KDA_Sort', "visible": false, "responsivePriority": 999},
                {"title": 'KDA', "visible": cyopt.cols['KDA'].visible, "width": "10%", "sClass": "sortIcon_Number", "iDataSort": 6, "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'MVP', "visible": cyopt.cols['MVP'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'MVP Medals', "visible": cyopt.cols['MVP Medals'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Popularity', "visible": cyopt.cols['Popularity'].visible, "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Winrate', "visible": cyopt.cols['Winrate'].visible, "width": "20%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Hero Dmg', "visible": cyopt.cols['Hero Dmg'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Siege Dmg', "visible": cyopt.cols['Siege Dmg'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Structure Dmg', "visible": cyopt.cols['Structure Dmg'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Healing', "visible": cyopt.cols['Healing'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Damage Taken', "visible": cyopt.cols['Damage Taken'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Experience', "visible": cyopt.cols['Experience'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Merc Camps', "visible": cyopt.cols['Merc Camps'].visible, "width": "14%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Kills', "visible": cyopt.cols['Kills'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Deaths', "visible": cyopt.cols['Deaths'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Assists', "visible": cyopt.cols['Assists'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Best Killstreak', "visible": cyopt.cols['Best Killstreak'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
                {"title": 'Time Dead (Seconds)', "visible": cyopt.cols['Time Dead (Seconds)'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
            ];

            datatable.order = [[5, 'desc']]; //The default ordering of the table on load => column 9 at index 8 descending
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

            dataTableContext = table;

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

    let validateCycleSelector = function() {
        let cycleSelectorVal = HotstatusFilter.getSelectorValues("playerHeroesStatslist");
        StatslistLoader.data.statslist.internal.cycleSet(cycleSelectorVal);
    };

    //filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);
    validateCycleSelector();

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);

        //Check cycle selector
        validateCycleSelector();
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });

    //Statslist Cycle buttons
    StatslistLoader.data.statslist.internal.cycleRenderLabel();
    $('.hsl-cycle-back').on('click', function(e) {
        StatslistLoader.data.statslist.internal.cycleIncrement(-1);
    });
    $('.hsl-cycle-forward').on('click', function(e) {
        StatslistLoader.data.statslist.internal.cycleIncrement(1);
    });
});