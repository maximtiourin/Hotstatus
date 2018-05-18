/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/hots_webapp/web/build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/player-heroes-statslist.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/player-heroes-statslist.js":
/*!**********************************************!*\
  !*** ./assets/js/player-heroes-statslist.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var StatslistLoader = {};

var dataTableContext = null;

StatslistLoader.ajax = {};

/*
 * The ajax handler for handling filters
 */
StatslistLoader.ajax.filter = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data' //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function url() {
        var _url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        var self = StatslistLoader.ajax.filter;

        if (_url === null) {
            return self.internal.url;
        } else {
            self.internal.url = _url;
            return self;
        }
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function validateLoad(baseUrl, filterTypes) {
        var self = StatslistLoader.ajax.filter;

        if (!self.internal.loading && HotstatusFilter.validFilters) {
            var url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

            if (url !== self.url()) {
                self.url(url).load();
            }
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var ajax = StatslistLoader.ajax;
        var self = StatslistLoader.ajax.filter;

        var data = StatslistLoader.data;
        var data_statslist = data.statslist;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroes-statslist-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_heroes = json.heroes;

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

                var statslistTable = data_statslist.getTableConfig();

                statslistTable.data = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = json_heroes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var hero = _step.value;

                        statslistTable.data.push(data_statslist.generateTableData(hero));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                data_statslist.initTable(statslistTable);
            }

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();

            /*
             * Enable advertising
             */
            Hotstatus.advertising.generateAdvertising();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
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
            cycleOptions: [{
                name: "Summary",
                cols: {
                    "Played": {
                        visible: true
                    },
                    "KDA": {
                        visible: true
                    },
                    "MVP": {
                        visible: true
                    },
                    "MVP Medals": {
                        visible: true
                    },
                    "Popularity": {
                        visible: true
                    },
                    "Winrate": {
                        visible: true
                    },
                    "Hero Dmg": {
                        visible: false
                    },
                    "Siege Dmg": {
                        visible: false
                    },
                    "Structure Dmg": {
                        visible: false
                    },
                    "Healing": {
                        visible: false
                    },
                    "Damage Taken": {
                        visible: false
                    },
                    "Experience": {
                        visible: false
                    },
                    "Merc Camps": {
                        visible: false
                    },
                    "Kills": {
                        visible: false
                    },
                    "Deaths": {
                        visible: false
                    },
                    "Assists": {
                        visible: false
                    },
                    "Best Killstreak": {
                        visible: false
                    },
                    "Time Dead (Seconds)": {
                        visible: false
                    }
                }
            }, {
                name: "Performance",
                cols: {
                    "Played": {
                        visible: true
                    },
                    "KDA": {
                        visible: false
                    },
                    "MVP": {
                        visible: false
                    },
                    "MVP Medals": {
                        visible: false
                    },
                    "Popularity": {
                        visible: false
                    },
                    "Winrate": {
                        visible: false
                    },
                    "Hero Dmg": {
                        visible: true
                    },
                    "Siege Dmg": {
                        visible: true
                    },
                    "Structure Dmg": {
                        visible: true
                    },
                    "Healing": {
                        visible: true
                    },
                    "Damage Taken": {
                        visible: true
                    },
                    "Experience": {
                        visible: true
                    },
                    "Merc Camps": {
                        visible: true
                    },
                    "Kills": {
                        visible: false
                    },
                    "Deaths": {
                        visible: false
                    },
                    "Assists": {
                        visible: false
                    },
                    "Best Killstreak": {
                        visible: false
                    },
                    "Time Dead (Seconds)": {
                        visible: false
                    }
                }
            }, {
                name: "Miscellaneous",
                cols: {
                    "Played": {
                        visible: true
                    },
                    "KDA": {
                        visible: true
                    },
                    "MVP": {
                        visible: false
                    },
                    "MVP Medals": {
                        visible: false
                    },
                    "Popularity": {
                        visible: false
                    },
                    "Winrate": {
                        visible: false
                    },
                    "Hero Dmg": {
                        visible: false
                    },
                    "Siege Dmg": {
                        visible: false
                    },
                    "Structure Dmg": {
                        visible: false
                    },
                    "Healing": {
                        visible: false
                    },
                    "Damage Taken": {
                        visible: false
                    },
                    "Experience": {
                        visible: false
                    },
                    "Merc Camps": {
                        visible: false
                    },
                    "Kills": {
                        visible: true
                    },
                    "Deaths": {
                        visible: true
                    },
                    "Assists": {
                        visible: true
                    },
                    "Best Killstreak": {
                        visible: true
                    },
                    "Time Dead (Seconds)": {
                        visible: true
                    }
                }
            }],
            cycleSelected: 0,
            cycleSet: function cycleSet(cycleName) {
                var self = StatslistLoader.data.statslist.internal;

                var cyclesize = self.cycleOptions.length;

                var properCycleName = cycleName.toString();

                var selectedName = self.cycleOptions[self.cycleSelected].name.toString();

                if (properCycleName !== selectedName) {
                    for (var i = 0; i < cyclesize; i++) {
                        if (self.cycleOptions[i].name === properCycleName) {
                            self.cycleSelected = i;

                            self.cycleRenderLabel();
                            self.cycleRenderTable();

                            break;
                        }
                    }
                }
            },
            cycleIncrement: function cycleIncrement(direction) {
                var self = StatslistLoader.data.statslist.internal;

                var cyclesize = self.cycleOptions.length;

                self.cycleSelected = self.cycleSelected + direction;

                if (self.cycleSelected < 0) self.cycleSelected = cyclesize - 1;
                if (self.cycleSelected >= cyclesize) self.cycleSelected = 0;

                self.cycleRenderLabel();
                self.cycleRenderTable();
            },
            cycleRenderLabel: function cycleRenderLabel() {
                var self = StatslistLoader.data.statslist.internal;

                $('#statslist-cyclelabel').html(self.cycleOptions[self.cycleSelected].name);
            },
            cycleRenderTable: function cycleRenderTable() {
                if (dataTableContext !== null) {
                    var self = StatslistLoader.data.statslist.internal;

                    var cyopt = self.cycleOptions[self.cycleSelected];

                    for (var colkey in self.cycleColumns) {
                        if (self.cycleColumns.hasOwnProperty(colkey)) {
                            var col = self.cycleColumns[colkey];

                            dataTableContext.column(col.index).visible(cyopt.cols[colkey].visible);
                        }
                    }

                    dataTableContext.draw();
                }
            }
        },
        empty: function empty() {
            $('#heroes-statslist').remove();
        },
        generateContainer: function generateContainer(last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            var html = '<div id="heroes-statslist">' + '</div>';

            $('#heroes-statslist-container').append(html);

            //Update last updated
            $('#statslist-lastupdated').html('<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="Last Updated: ' + date + '"><i class="fa fa-info-circle lastupdated-info" aria-hidden="true"></i></span>');
        },
        generateTableData: function generateTableData(hero) {
            var heroPortrait = '<img src="' + image_bpath + hero.image_hero + '.png" class="rounded-circle hsl-portrait">';

            var heroProperName = '<a class="hsl-link" href="' + Routing.generate("playerhero", { region: player_region, id: player_id, heroProperName: hero.name }) + '" target="_blank">' + hero.name + '</a>';

            var heroNameSort = hero.name_sort;

            var heroRoleBlizzard = hero.role_blizzard;

            var heroRoleSpecific = hero.role_specific;

            var heroPlayed = hero.played;

            /*
             * KDA
             */
            //Good kda
            var goodkda = 'rm-sw-sp-kda-num';
            if (hero.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good';
            }
            if (hero.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great';
            }

            var heroKDA = '<span class="' + goodkda + '">' + hero.kda_avg + '</span>';

            //MVP Hero Percent
            var heroMVPHero = '<span class="hsl-number-mvp">' + hero.mvp_herorate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-mvp" style="width:' + hero.mvp_herorate_percent + '%;"></div>';

            //MVP Total Percent
            var heroMVP = '<span class="hsl-number-mvp-medals">' + hero.mvp_medals + '</span>' + '<div class="hsl-percentbar hsl-percentbar-mvp-medals" style="width:' + hero.mvp_rate_percent + '%;"></div>';

            //Popularity
            var heroPopularity = '<span class="hsl-number-popularity">' + hero.popularity + '</span>' + '<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + hero.popularity_percent + '%;"></div>';

            //Winrate
            var heroWinrate = '';
            if (hero.winrate_exists) {
                var color = "hsl-number-winrate-red";
                if (hero.winrate_raw >= 50.0) color = "hsl-number-winrate-green";
                heroWinrate = '<span class="' + color + '">' + hero.winrate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:' + hero.winrate_percent + '%;"></div>';
            }

            var heroDmg = '<span class="hsl-number-popularity">' + hero.hero_damage_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-herodamage" style="width:' + hero.hero_damage_avg_percent + '%;"></div>';
            var siegeDmg = '<span class="hsl-number-popularity">' + hero.siege_damage_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-siegedamage" style="width:' + hero.siege_damage_avg_percent + '%;"></div>';
            var structureDmg = '<span class="hsl-number-popularity">' + hero.structure_damage_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-structuredamage" style="width:' + hero.structure_damage_avg_percent + '%;"></div>';
            var healing = '<span class="hsl-number-popularity">' + hero.healing_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-healing" style="width:' + hero.healing_avg_percent + '%;"></div>';
            var damageTaken = '<span class="hsl-number-popularity">' + hero.damage_taken_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-damagetaken" style="width:' + hero.damage_taken_avg_percent + '%;"></div>';
            var exp_contrib = '<span class="hsl-number-popularity">' + hero.exp_contrib_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-expcontrib" style="width:' + hero.exp_contrib_avg_percent + '%;"></div>';
            var merc_camps = '<span class="hsl-number-popularity">' + hero.merc_camps_avg + '</span>' + '<div class="hsl-percentbar rm-fm-r-stats-merccamps" style="width:' + hero.merc_camps_avg_percent + '%;"></div>';
            var kills = hero.kills_avg;
            var deaths = hero.deaths_avg;
            var assists = hero.assists_avg;
            var killstreak = hero.best_killstreak;
            var time_spent_dead = hero.time_spent_dead_avg;

            return [heroPortrait, heroProperName, heroNameSort, heroRoleBlizzard, heroRoleSpecific, heroPlayed, hero.kda_raw, heroKDA, heroMVPHero, heroMVP, heroPopularity, heroWinrate, heroDmg, siegeDmg, structureDmg, healing, damageTaken, exp_contrib, merc_camps, kills, deaths, assists, killstreak, time_spent_dead];
        },
        getTableConfig: function getTableConfig() {
            var self = StatslistLoader.data.statslist;
            var internal = self.internal;
            var cyopts = internal.cycleOptions;

            var cyopt = cyopts[internal.cycleSelected];

            var datatable = {};

            datatable.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "15%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Played', "visible": cyopt.cols['Played'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'KDA_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'KDA', "visible": cyopt.cols['KDA'].visible, "width": "10%", "sClass": "sortIcon_Number", "iDataSort": 6, "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'MVP', "visible": cyopt.cols['MVP'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'MVP Medals', "visible": cyopt.cols['MVP Medals'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Popularity', "visible": cyopt.cols['Popularity'].visible, "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Winrate', "visible": cyopt.cols['Winrate'].visible, "width": "20%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Hero Dmg', "visible": cyopt.cols['Hero Dmg'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Siege Dmg', "visible": cyopt.cols['Siege Dmg'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Structure Dmg', "visible": cyopt.cols['Structure Dmg'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Healing', "visible": cyopt.cols['Healing'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Damage Taken', "visible": cyopt.cols['Damage Taken'].visible, "width": "12%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Experience', "visible": cyopt.cols['Experience'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Merc Camps', "visible": cyopt.cols['Merc Camps'].visible, "width": "14%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Kills', "visible": cyopt.cols['Kills'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Deaths', "visible": cyopt.cols['Deaths'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Assists', "visible": cyopt.cols['Assists'].visible, "width": "8%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Best Killstreak', "visible": cyopt.cols['Best Killstreak'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Time Dead (Seconds)', "visible": cyopt.cols['Time Dead (Seconds)'].visible, "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

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
            datatable.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.fixedHeader = document.documentElement.clientWidth >= 525;

            return datatable;
        },
        generateTable: function generateTable() {
            $('#heroes-statslist').append('<table id="hsl-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        initTable: function initTable(dataTableConfig) {
            var table = $('#hsl-table').DataTable(dataTableConfig);

            dataTableContext = table;

            //Search the table for the new value typed in by user
            $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
                table.search($(this).val()).draw();
            });

            //Search the table for the new value populated by role button
            $('button.hsl-rolebutton').click(function () {
                table.search($(this).attr("value")).draw();
            });
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_datatable_heroes_statslist', {
        region: player_region,
        player: player_id
    });

    var filterTypes = ["season", "gameType", "map"];
    var filterAjax = StatslistLoader.ajax.filter;

    var validateCycleSelector = function validateCycleSelector() {
        var cycleSelectorVal = HotstatusFilter.getSelectorValues("playerHeroesStatslist");
        StatslistLoader.data.statslist.internal.cycleSet(cycleSelectorVal);
    };

    //filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);
    validateCycleSelector();

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event) {
        HotstatusFilter.validateSelectors(null, filterTypes);

        //Check cycle selector
        validateCycleSelector();
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function (e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });

    //Statslist Cycle buttons
    StatslistLoader.data.statslist.internal.cycleRenderLabel();
    $('.hsl-cycle-back').on('click', function (e) {
        StatslistLoader.data.statslist.internal.cycleIncrement(-1);
    });
    $('.hsl-cycle-forward').on('click', function (e) {
        StatslistLoader.data.statslist.internal.cycleIncrement(1);
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTE4MWJjM2I2ODMxYjUwOTdkYzAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1oZXJvZXMtc3RhdHNsaXN0LmpzIl0sIm5hbWVzIjpbIlN0YXRzbGlzdExvYWRlciIsImRhdGFUYWJsZUNvbnRleHQiLCJhamF4IiwiZmlsdGVyIiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwidXJsIiwiZGF0YVNyYyIsInNlbGYiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJIb3RzdGF0dXNGaWx0ZXIiLCJ2YWxpZEZpbHRlcnMiLCJnZW5lcmF0ZVVybCIsImxvYWQiLCJkYXRhIiwiZGF0YV9zdGF0c2xpc3QiLCJzdGF0c2xpc3QiLCIkIiwicHJlcGVuZCIsImdldEpTT04iLCJkb25lIiwianNvblJlc3BvbnNlIiwianNvbiIsImpzb25faGVyb2VzIiwiaGVyb2VzIiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsImxlbmd0aCIsImdlbmVyYXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVUYWJsZSIsInN0YXRzbGlzdFRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJoZXJvIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiaW5pdFRhYmxlIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJjeWNsZUNvbHVtbnMiLCJpbmRleCIsImN5Y2xlT3B0aW9ucyIsIm5hbWUiLCJjb2xzIiwidmlzaWJsZSIsImN5Y2xlU2VsZWN0ZWQiLCJjeWNsZVNldCIsImN5Y2xlTmFtZSIsImN5Y2xlc2l6ZSIsInByb3BlckN5Y2xlTmFtZSIsInRvU3RyaW5nIiwic2VsZWN0ZWROYW1lIiwiaSIsImN5Y2xlUmVuZGVyTGFiZWwiLCJjeWNsZVJlbmRlclRhYmxlIiwiY3ljbGVJbmNyZW1lbnQiLCJkaXJlY3Rpb24iLCJodG1sIiwiY3lvcHQiLCJjb2xrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbCIsImNvbHVtbiIsImRyYXciLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImFwcGVuZCIsImhlcm9Qb3J0cmFpdCIsImltYWdlX2JwYXRoIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwiUm91dGluZyIsImdlbmVyYXRlIiwicmVnaW9uIiwicGxheWVyX3JlZ2lvbiIsImlkIiwicGxheWVyX2lkIiwiaGVyb05hbWVTb3J0IiwibmFtZV9zb3J0IiwiaGVyb1JvbGVCbGl6emFyZCIsInJvbGVfYmxpenphcmQiLCJoZXJvUm9sZVNwZWNpZmljIiwicm9sZV9zcGVjaWZpYyIsImhlcm9QbGF5ZWQiLCJwbGF5ZWQiLCJnb29ka2RhIiwia2RhX3JhdyIsImhlcm9LREEiLCJrZGFfYXZnIiwiaGVyb01WUEhlcm8iLCJtdnBfaGVyb3JhdGUiLCJtdnBfaGVyb3JhdGVfcGVyY2VudCIsImhlcm9NVlAiLCJtdnBfbWVkYWxzIiwibXZwX3JhdGVfcGVyY2VudCIsImhlcm9Qb3B1bGFyaXR5IiwicG9wdWxhcml0eSIsInBvcHVsYXJpdHlfcGVyY2VudCIsImhlcm9XaW5yYXRlIiwid2lucmF0ZV9leGlzdHMiLCJjb2xvciIsIndpbnJhdGVfcmF3Iiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudCIsImhlcm9EbWciLCJoZXJvX2RhbWFnZV9hdmciLCJoZXJvX2RhbWFnZV9hdmdfcGVyY2VudCIsInNpZWdlRG1nIiwic2llZ2VfZGFtYWdlX2F2ZyIsInNpZWdlX2RhbWFnZV9hdmdfcGVyY2VudCIsInN0cnVjdHVyZURtZyIsInN0cnVjdHVyZV9kYW1hZ2VfYXZnIiwic3RydWN0dXJlX2RhbWFnZV9hdmdfcGVyY2VudCIsImhlYWxpbmciLCJoZWFsaW5nX2F2ZyIsImhlYWxpbmdfYXZnX3BlcmNlbnQiLCJkYW1hZ2VUYWtlbiIsImRhbWFnZV90YWtlbl9hdmciLCJkYW1hZ2VfdGFrZW5fYXZnX3BlcmNlbnQiLCJleHBfY29udHJpYiIsImV4cF9jb250cmliX2F2ZyIsImV4cF9jb250cmliX2F2Z19wZXJjZW50IiwibWVyY19jYW1wcyIsIm1lcmNfY2FtcHNfYXZnIiwibWVyY19jYW1wc19hdmdfcGVyY2VudCIsImtpbGxzIiwia2lsbHNfYXZnIiwiZGVhdGhzIiwiZGVhdGhzX2F2ZyIsImFzc2lzdHMiLCJhc3Npc3RzX2F2ZyIsImtpbGxzdHJlYWsiLCJiZXN0X2tpbGxzdHJlYWsiLCJ0aW1lX3NwZW50X2RlYWQiLCJ0aW1lX3NwZW50X2RlYWRfYXZnIiwiY3lvcHRzIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJmaXhlZEhlYWRlciIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJkYXRhVGFibGVDb25maWciLCJ0YWJsZSIsIkRhdGFUYWJsZSIsIm9uIiwic2VhcmNoIiwidmFsIiwiY2xpY2siLCJhdHRyIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwicGxheWVyIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlQ3ljbGVTZWxlY3RvciIsImN5Y2xlU2VsZWN0b3JWYWwiLCJnZXRTZWxlY3RvclZhbHVlcyIsInZhbGlkYXRlU2VsZWN0b3JzIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtB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V0FBeEM7O0FBRUE7QUFDQXVLO0FBQ0gsS0FMRDs7QUFPQTtBQUNBL0osTUFBRSxHQUFGLEVBQU9vSixFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU2dCLENBQVQsRUFBWTtBQUN4Q04sbUJBQVd4SyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEOztBQUlBO0FBQ0FYLG9CQUFnQmdCLElBQWhCLENBQXFCRSxTQUFyQixDQUErQmQsUUFBL0IsQ0FBd0N3RCxnQkFBeEM7QUFDQXpDLE1BQUUsaUJBQUYsRUFBcUJvSixFQUFyQixDQUF3QixPQUF4QixFQUFpQyxVQUFTZ0IsQ0FBVCxFQUFZO0FBQ3pDdkwsd0JBQWdCZ0IsSUFBaEIsQ0FBcUJFLFNBQXJCLENBQStCZCxRQUEvQixDQUF3QzBELGNBQXhDLENBQXVELENBQUMsQ0FBeEQ7QUFDSCxLQUZEO0FBR0EzQyxNQUFFLG9CQUFGLEVBQXdCb0osRUFBeEIsQ0FBMkIsT0FBM0IsRUFBb0MsVUFBU2dCLENBQVQsRUFBWTtBQUM1Q3ZMLHdCQUFnQmdCLElBQWhCLENBQXFCRSxTQUFyQixDQUErQmQsUUFBL0IsQ0FBd0MwRCxjQUF4QyxDQUF1RCxDQUF2RDtBQUNILEtBRkQ7QUFHSCxDQTNDRCxFIiwiZmlsZSI6InBsYXllci1oZXJvZXMtc3RhdHNsaXN0LjcwOThiMGUwN2M5MDZkMTQ2OWQ2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1oZXJvZXMtc3RhdHNsaXN0LmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDUxODFiYzNiNjgzMWI1MDk3ZGMwIiwibGV0IFN0YXRzbGlzdExvYWRlciA9IHt9O1xyXG5cclxubGV0IGRhdGFUYWJsZUNvbnRleHQgPSBudWxsO1xyXG5cclxuU3RhdHNsaXN0TG9hZGVyLmFqYXggPSB7fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gU3RhdHNsaXN0TG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gU3RhdHNsaXN0TG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHNsaXN0ID0gZGF0YS5zdGF0c2xpc3Q7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZXMgPSBqc29uLmhlcm9lcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9zdGF0c2xpc3QuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNsaXN0IENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRGF0YXRhYmxlIFN0YXRzbGlzdFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9oZXJvZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlQ29udGFpbmVyKGpzb24ubGFzdF91cGRhdGVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0c2xpc3QuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHNsaXN0VGFibGUgPSBkYXRhX3N0YXRzbGlzdC5nZXRUYWJsZUNvbmZpZygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdGF0c2xpc3RUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0c2xpc3RUYWJsZS5kYXRhLnB1c2goZGF0YV9zdGF0c2xpc3QuZ2VuZXJhdGVUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0c2xpc3QuaW5pdFRhYmxlKHN0YXRzbGlzdFRhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuU3RhdHNsaXN0TG9hZGVyLmRhdGEgPSB7XHJcbiAgICBzdGF0c2xpc3Q6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBjeWNsZUNvbHVtbnM6IHtcclxuICAgICAgICAgICAgICAgIFwiUGxheWVkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogNVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiS0RBXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogN1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiTVZQXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogOFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiTVZQIE1lZGFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDlcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIlBvcHVsYXJpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAxMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiV2lucmF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDExXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJIZXJvIERtZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDEyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJTaWVnZSBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAxM1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiU3RydWN0dXJlIERtZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDE0XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJIZWFsaW5nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogMTVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIkRhbWFnZSBUYWtlblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDE2XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJFeHBlcmllbmNlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogMTdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIk1lcmMgQ2FtcHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAxOFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiS2lsbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAxOVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiRGVhdGhzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogMjBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIkFzc2lzdHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAyMVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiQmVzdCBLaWxsc3RyZWFrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogMjJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIlRpbWUgRGVhZCAoU2Vjb25kcylcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAyM1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjeWNsZU9wdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlN1bW1hcnlcIixcclxuICAgICAgICAgICAgICAgICAgICBjb2xzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUGxheWVkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiS0RBXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTVZQXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTVZQIE1lZGFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlBvcHVsYXJpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJXaW5yYXRlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVybyBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU2llZ2UgRG1nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlN0cnVjdHVyZSBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVhbGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJEYW1hZ2UgVGFrZW5cIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRXhwZXJpZW5jZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXJjIENhbXBzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIktpbGxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkRlYXRoc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJlc3QgS2lsbHN0cmVha1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaW1lIERlYWQgKFNlY29uZHMpXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlBlcmZvcm1hbmNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlBsYXllZFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIktEQVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNVlBcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTVZQIE1lZGFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJQb3B1bGFyaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIldpbnJhdGVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVybyBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTaWVnZSBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTdHJ1Y3R1cmUgRG1nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVhbGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkRhbWFnZSBUYWtlblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkV4cGVyaWVuY2VcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXJjIENhbXBzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiS2lsbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRGVhdGhzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFzc2lzdHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmVzdCBLaWxsc3RyZWFrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRpbWUgRGVhZCAoU2Vjb25kcylcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTWlzY2VsbGFuZW91c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGF5ZWRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJLREFcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNVlBcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTVZQIE1lZGFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJQb3B1bGFyaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIldpbnJhdGVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVybyBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU2llZ2UgRG1nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlN0cnVjdHVyZSBEbWdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSGVhbGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJEYW1hZ2UgVGFrZW5cIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRXhwZXJpZW5jZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXJjIENhbXBzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIktpbGxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRGVhdGhzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0c1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJlc3QgS2lsbHN0cmVha1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRpbWUgRGVhZCAoU2Vjb25kcylcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgY3ljbGVTZWxlY3RlZDogMCxcclxuICAgICAgICAgICAgY3ljbGVTZXQ6IGZ1bmN0aW9uKGN5Y2xlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuZGF0YS5zdGF0c2xpc3QuaW50ZXJuYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN5Y2xlc2l6ZSA9IHNlbGYuY3ljbGVPcHRpb25zLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVyQ3ljbGVOYW1lID0gY3ljbGVOYW1lLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkTmFtZSA9IHNlbGYuY3ljbGVPcHRpb25zW3NlbGYuY3ljbGVTZWxlY3RlZF0ubmFtZS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJDeWNsZU5hbWUgIT09IHNlbGVjdGVkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3ljbGVzaXplOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuY3ljbGVPcHRpb25zW2ldLm5hbWUgPT09IHByb3BlckN5Y2xlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jeWNsZVNlbGVjdGVkID0gaTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmN5Y2xlUmVuZGVyTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY3ljbGVSZW5kZXJUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjeWNsZUluY3JlbWVudDogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5kYXRhLnN0YXRzbGlzdC5pbnRlcm5hbDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY3ljbGVzaXplID0gc2VsZi5jeWNsZU9wdGlvbnMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuY3ljbGVTZWxlY3RlZCA9IHNlbGYuY3ljbGVTZWxlY3RlZCArIGRpcmVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5jeWNsZVNlbGVjdGVkIDwgMCkgc2VsZi5jeWNsZVNlbGVjdGVkID0gY3ljbGVzaXplIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmN5Y2xlU2VsZWN0ZWQgPj0gY3ljbGVzaXplKSBzZWxmLmN5Y2xlU2VsZWN0ZWQgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuY3ljbGVSZW5kZXJMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jeWNsZVJlbmRlclRhYmxlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGN5Y2xlUmVuZGVyTGFiZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuZGF0YS5zdGF0c2xpc3QuaW50ZXJuYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnI3N0YXRzbGlzdC1jeWNsZWxhYmVsJykuaHRtbChzZWxmLmN5Y2xlT3B0aW9uc1tzZWxmLmN5Y2xlU2VsZWN0ZWRdLm5hbWUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjeWNsZVJlbmRlclRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhVGFibGVDb250ZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuZGF0YS5zdGF0c2xpc3QuaW50ZXJuYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjeW9wdCA9IHNlbGYuY3ljbGVPcHRpb25zW3NlbGYuY3ljbGVTZWxlY3RlZF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbGtleSBpbiBzZWxmLmN5Y2xlQ29sdW1ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5jeWNsZUNvbHVtbnMuaGFzT3duUHJvcGVydHkoY29sa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbCA9IHNlbGYuY3ljbGVDb2x1bW5zW2NvbGtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVRhYmxlQ29udGV4dC5jb2x1bW4oY29sLmluZGV4KS52aXNpYmxlKGN5b3B0LmNvbHNbY29sa2V5XS52aXNpYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVRhYmxlQ29udGV4dC5kcmF3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QnKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29udGFpbmVyOiBmdW5jdGlvbihsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJoZXJvZXMtc3RhdHNsaXN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vVXBkYXRlIGxhc3QgdXBkYXRlZFxyXG4gICAgICAgICAgICAkKCcjc3RhdHNsaXN0LWxhc3R1cGRhdGVkJykuaHRtbCgnPHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJMYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKydcIj48aSBjbGFzcz1cImZhIGZhLWluZm8tY2lyY2xlIGxhc3R1cGRhdGVkLWluZm9cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9zcGFuPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IGhlcm9Qb3J0cmFpdCA9ICc8aW1nIHNyYz1cIicrIGltYWdlX2JwYXRoICsgaGVyby5pbWFnZV9oZXJvICsnLnBuZ1wiIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgaHNsLXBvcnRyYWl0XCI+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUHJvcGVyTmFtZSA9ICc8YSBjbGFzcz1cImhzbC1saW5rXCIgaHJlZj1cIicrIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtyZWdpb246IHBsYXllcl9yZWdpb24sIGlkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIGhlcm8ubmFtZSArJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9OYW1lU29ydCA9IGhlcm8ubmFtZV9zb3J0O1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Sb2xlQmxpenphcmQgPSBoZXJvLnJvbGVfYmxpenphcmQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1JvbGVTcGVjaWZpYyA9IGhlcm8ucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUGxheWVkID0gaGVyby5wbGF5ZWQ7XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBLREFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvS0RBID0gJzxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBoZXJvLmtkYV9hdmcgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICAvL01WUCBIZXJvIFBlcmNlbnRcclxuICAgICAgICAgICAgbGV0IGhlcm9NVlBIZXJvID0gJzxzcGFuIGNsYXNzPVwiaHNsLW51bWJlci1tdnBcIj4nKyBoZXJvLm12cF9oZXJvcmF0ZSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItbXZwXCIgc3R5bGU9XCJ3aWR0aDonKyBoZXJvLm12cF9oZXJvcmF0ZV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLy9NVlAgVG90YWwgUGVyY2VudFxyXG4gICAgICAgICAgICBsZXQgaGVyb01WUCA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItbXZwLW1lZGFsc1wiPicrIGhlcm8ubXZwX21lZGFscyArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItbXZwLW1lZGFsc1wiIHN0eWxlPVwid2lkdGg6JysgaGVyby5tdnBfcmF0ZV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLy9Qb3B1bGFyaXR5XHJcbiAgICAgICAgICAgIGxldCBoZXJvUG9wdWxhcml0eSA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8ucG9wdWxhcml0eSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby5wb3B1bGFyaXR5X3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGhlcm9XaW5yYXRlID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBcImhzbC1udW1iZXItd2lucmF0ZS1yZWRcIjtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUwLjApIGNvbG9yID0gXCJoc2wtbnVtYmVyLXdpbnJhdGUtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGhlcm9XaW5yYXRlID0gJzxzcGFuIGNsYXNzPVwiJyArIGNvbG9yICsgJ1wiPicrIGhlcm8ud2lucmF0ZSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ud2lucmF0ZV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb0RtZyA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8uaGVyb19kYW1hZ2VfYXZnICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBybS1mbS1yLXN0YXRzLWhlcm9kYW1hZ2VcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8uaGVyb19kYW1hZ2VfYXZnX3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIGxldCBzaWVnZURtZyA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8uc2llZ2VfZGFtYWdlX2F2ZyArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgcm0tZm0tci1zdGF0cy1zaWVnZWRhbWFnZVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby5zaWVnZV9kYW1hZ2VfYXZnX3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIGxldCBzdHJ1Y3R1cmVEbWcgPSAnPHNwYW4gY2xhc3M9XCJoc2wtbnVtYmVyLXBvcHVsYXJpdHlcIj4nKyBoZXJvLnN0cnVjdHVyZV9kYW1hZ2VfYXZnICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBybS1mbS1yLXN0YXRzLXN0cnVjdHVyZWRhbWFnZVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby5zdHJ1Y3R1cmVfZGFtYWdlX2F2Z19wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICBsZXQgaGVhbGluZyA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8uaGVhbGluZ19hdmcgKyc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIHJtLWZtLXItc3RhdHMtaGVhbGluZ1wiIHN0eWxlPVwid2lkdGg6JysgaGVyby5oZWFsaW5nX2F2Z19wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICBsZXQgZGFtYWdlVGFrZW4gPSAnPHNwYW4gY2xhc3M9XCJoc2wtbnVtYmVyLXBvcHVsYXJpdHlcIj4nKyBoZXJvLmRhbWFnZV90YWtlbl9hdmcgKyc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIHJtLWZtLXItc3RhdHMtZGFtYWdldGFrZW5cIiBzdHlsZT1cIndpZHRoOicrIGhlcm8uZGFtYWdlX3Rha2VuX2F2Z19wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICBsZXQgZXhwX2NvbnRyaWIgPSAnPHNwYW4gY2xhc3M9XCJoc2wtbnVtYmVyLXBvcHVsYXJpdHlcIj4nKyBoZXJvLmV4cF9jb250cmliX2F2ZyArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgcm0tZm0tci1zdGF0cy1leHBjb250cmliXCIgc3R5bGU9XCJ3aWR0aDonKyBoZXJvLmV4cF9jb250cmliX2F2Z19wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICBsZXQgbWVyY19jYW1wcyA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8ubWVyY19jYW1wc19hdmcgKyc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIHJtLWZtLXItc3RhdHMtbWVyY2NhbXBzXCIgc3R5bGU9XCJ3aWR0aDonKyBoZXJvLm1lcmNfY2FtcHNfYXZnX3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIGxldCBraWxscyA9IGhlcm8ua2lsbHNfYXZnO1xyXG4gICAgICAgICAgICBsZXQgZGVhdGhzID0gaGVyby5kZWF0aHNfYXZnO1xyXG4gICAgICAgICAgICBsZXQgYXNzaXN0cyA9IGhlcm8uYXNzaXN0c19hdmc7XHJcbiAgICAgICAgICAgIGxldCBraWxsc3RyZWFrID0gaGVyby5iZXN0X2tpbGxzdHJlYWs7XHJcbiAgICAgICAgICAgIGxldCB0aW1lX3NwZW50X2RlYWQgPSBoZXJvLnRpbWVfc3BlbnRfZGVhZF9hdmc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9Qb3J0cmFpdCwgaGVyb1Byb3Blck5hbWUsIGhlcm9OYW1lU29ydCwgaGVyb1JvbGVCbGl6emFyZCwgaGVyb1JvbGVTcGVjaWZpYywgaGVyb1BsYXllZCwgaGVyby5rZGFfcmF3LCBoZXJvS0RBLCBoZXJvTVZQSGVybywgaGVyb01WUCwgaGVyb1BvcHVsYXJpdHksIGhlcm9XaW5yYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlcm9EbWcsIHNpZWdlRG1nLCBzdHJ1Y3R1cmVEbWcsIGhlYWxpbmcsIGRhbWFnZVRha2VuLCBleHBfY29udHJpYiwgbWVyY19jYW1wcywga2lsbHMsIGRlYXRocywgYXNzaXN0cywga2lsbHN0cmVhaywgdGltZV9zcGVudF9kZWFkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuZGF0YS5zdGF0c2xpc3Q7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcm5hbCA9IHNlbGYuaW50ZXJuYWw7XHJcbiAgICAgICAgICAgIGxldCBjeW9wdHMgPSBpbnRlcm5hbC5jeWNsZU9wdGlvbnM7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3lvcHQgPSBjeW9wdHNbaW50ZXJuYWwuY3ljbGVTZWxlY3RlZF07XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwiaHNsLXRhYmxlLXBvcnRyYWl0LXRkXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snUGxheWVkJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnS0RBX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnS0RBJywgXCJ2aXNpYmxlXCI6IGN5b3B0LmNvbHNbJ0tEQSddLnZpc2libGUsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJpRGF0YVNvcnRcIjogNiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdNVlAnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snTVZQJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ01WUCBNZWRhbHMnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snTVZQIE1lZGFscyddLnZpc2libGUsIFwid2lkdGhcIjogXCIxMiVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQb3B1bGFyaXR5JywgXCJ2aXNpYmxlXCI6IGN5b3B0LmNvbHNbJ1BvcHVsYXJpdHknXS52aXNpYmxlLCBcIndpZHRoXCI6IFwiMTUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnV2lucmF0ZScsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydXaW5yYXRlJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm8gRG1nJywgXCJ2aXNpYmxlXCI6IGN5b3B0LmNvbHNbJ0hlcm8gRG1nJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1NpZWdlIERtZycsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydTaWVnZSBEbWcnXS52aXNpYmxlLCBcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnU3RydWN0dXJlIERtZycsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydTdHJ1Y3R1cmUgRG1nJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjEyJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlYWxpbmcnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snSGVhbGluZyddLnZpc2libGUsIFwid2lkdGhcIjogXCI4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0RhbWFnZSBUYWtlbicsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydEYW1hZ2UgVGFrZW4nXS52aXNpYmxlLCBcIndpZHRoXCI6IFwiMTIlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRXhwZXJpZW5jZScsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydFeHBlcmllbmNlJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ01lcmMgQ2FtcHMnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snTWVyYyBDYW1wcyddLnZpc2libGUsIFwid2lkdGhcIjogXCIxNCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdLaWxscycsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydLaWxscyddLnZpc2libGUsIFwid2lkdGhcIjogXCI4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0RlYXRocycsIFwidmlzaWJsZVwiOiBjeW9wdC5jb2xzWydEZWF0aHMnXS52aXNpYmxlLCBcIndpZHRoXCI6IFwiOCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdBc3Npc3RzJywgXCJ2aXNpYmxlXCI6IGN5b3B0LmNvbHNbJ0Fzc2lzdHMnXS52aXNpYmxlLCBcIndpZHRoXCI6IFwiOCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdCZXN0IEtpbGxzdHJlYWsnLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snQmVzdCBLaWxsc3RyZWFrJ10udmlzaWJsZSwgXCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1RpbWUgRGVhZCAoU2Vjb25kcyknLCBcInZpc2libGVcIjogY3lvcHQuY29sc1snVGltZSBEZWFkIChTZWNvbmRzKSddLnZpc2libGUsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNSwgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDkgYXQgaW5kZXggOCBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnByb2Nlc3NpbmcgPSBmYWxzZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTsgLy9EZWZlcnMgcmVuZGVyaW5nIHRoZSB0YWJsZSB1bnRpbCBkYXRhIHN0YXJ0cyBjb21pbmcgaW5cclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmZpeGVkSGVhZGVyID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDUyNTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QnKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhzbC10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG5cclxuICAgICAgICAgICAgZGF0YVRhYmxlQ29udGV4dCA9IHRhYmxlO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHBvcHVsYXRlZCBieSByb2xlIGJ1dHRvblxyXG4gICAgICAgICAgICAkKCdidXR0b24uaHNsLXJvbGVidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS5hdHRyKFwidmFsdWVcIikpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfZGF0YXRhYmxlX2hlcm9lc19zdGF0c2xpc3QnLCB7XHJcbiAgICAgICAgcmVnaW9uOiBwbGF5ZXJfcmVnaW9uLFxyXG4gICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIGxldCB2YWxpZGF0ZUN5Y2xlU2VsZWN0b3IgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgY3ljbGVTZWxlY3RvclZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInBsYXllckhlcm9lc1N0YXRzbGlzdFwiKTtcclxuICAgICAgICBTdGF0c2xpc3RMb2FkZXIuZGF0YS5zdGF0c2xpc3QuaW50ZXJuYWwuY3ljbGVTZXQoY3ljbGVTZWxlY3RvclZhbCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgdmFsaWRhdGVDeWNsZVNlbGVjdG9yKCk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAvL0NoZWNrIGN5Y2xlIHNlbGVjdG9yXHJcbiAgICAgICAgdmFsaWRhdGVDeWNsZVNlbGVjdG9yKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vU3RhdHNsaXN0IEN5Y2xlIGJ1dHRvbnNcclxuICAgIFN0YXRzbGlzdExvYWRlci5kYXRhLnN0YXRzbGlzdC5pbnRlcm5hbC5jeWNsZVJlbmRlckxhYmVsKCk7XHJcbiAgICAkKCcuaHNsLWN5Y2xlLWJhY2snKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgU3RhdHNsaXN0TG9hZGVyLmRhdGEuc3RhdHNsaXN0LmludGVybmFsLmN5Y2xlSW5jcmVtZW50KC0xKTtcclxuICAgIH0pO1xyXG4gICAgJCgnLmhzbC1jeWNsZS1mb3J3YXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIFN0YXRzbGlzdExvYWRlci5kYXRhLnN0YXRzbGlzdC5pbnRlcm5hbC5jeWNsZUluY3JlbWVudCgxKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvcGxheWVyLWhlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9