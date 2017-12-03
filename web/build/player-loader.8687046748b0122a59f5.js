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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/player-loader.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/player-loader.js":
/*!************************************!*\
  !*** ./assets/js/player-loader.js ***!
  \************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/*
 * Player Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
var PlayerLoader = {};

/*
 * Handles Ajax requests
 */
PlayerLoader.ajax = {
    /*
     * Executes function after given milliseconds
     */
    delay: function delay(milliseconds, func) {
        setTimeout(func, milliseconds);
    }
};

/*
 * The ajax handler for handling filters
 */
PlayerLoader.ajax.filter = {
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

        var self = PlayerLoader.ajax.filter;

        if (_url === null) {
            return self.internal.url;
        } else {
            self.internal.url = _url;
            return self;
        }
    },
    /*
     * Returns the current season selected based on filter
     */
    getSeason: function getSeason() {
        var val = HotstatusFilter.getSelectorValues("season");

        var season = "Unknown";

        if (typeof val === "string" || val instanceof String) {
            season = val;
        } else if (val !== null && val.length > 0) {
            season = val[0];
        }

        return season;
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function validateLoad(baseUrl, filterTypes) {
        var self = PlayerLoader.ajax.filter;

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
        var ajax = PlayerLoader.ajax;
        var self = PlayerLoader.ajax.filter;
        var ajax_matches = ajax.matches;
        var ajax_topheroes = ajax.topheroes;
        var ajax_parties = ajax.parties;

        var data = PlayerLoader.data;
        var data_matches = data.matches;

        //Enable Processing Indicator
        self.internal.loading = true;

        //$('#playerloader-container').prepend('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //-- Initial Matches First Load
        $('#pl-recentmatches-loader').append('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];

            /*
             * Empty dynamically filled containers, reset all subajax objects
             */
            ajax_matches.reset();
            ajax_topheroes.reset();
            ajax_parties.reset();

            /*
             * Heroloader Container
             */
            $('#playerloader-container').removeClass('initial-load');

            /*
             * Initial matches
             */
            data_matches.generateRecentMatchesContainer();

            ajax_matches.internal.offset = 0;
            ajax_matches.internal.limit = json.limits.matches;

            //Load initial match set
            ajax_matches.load();

            /*
             * Initial Top Heroes
             */
            ajax_topheroes.load();

            /*
             * Initial Parties
             */
            ajax_parties.load();

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();

            /*
             * Enable advertising
             */
            Hotstatus.advertising.generateAdvertising();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            //Disable processing indicator
            setTimeout(function () {
                $('.playerloader-processing').fadeIn().delay(750).queue(function () {
                    $(this).remove();
                });
            });

            self.internal.loading = false;
        });

        return self;
    }
};

PlayerLoader.ajax.topheroes = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data' //The array of data is found in .data field
    },
    reset: function reset() {
        var self = PlayerLoader.ajax.topheroes;

        self.internal.loading = false;
        self.internal.url = '';
        PlayerLoader.data.topheroes.empty();
    },
    generateUrl: function generateUrl() {
        var self = PlayerLoader.ajax.topheroes;

        var bUrl = Routing.generate("playerdata_pagedata_player_topheroes", {
            player: player_id
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    /*
     * Loads Top Heroes from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var ajax = PlayerLoader.ajax;
        var self = ajax.topheroes;

        var data = PlayerLoader.data;
        var data_topheroes = data.topheroes;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Top Heroes Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_heroes = json.heroes;

            /*
             * Process Top Heroes
             */
            if (json_heroes.length > 0) {
                data_topheroes.generateTopHeroesContainer();

                data_topheroes.generateTopHeroesTable();

                var topHeroesTable = data_topheroes.getTopHeroesTableConfig(json_heroes.length);

                topHeroesTable.data = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = json_heroes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var hero = _step.value;

                        topHeroesTable.data.push(data_topheroes.generateTopHeroesTableData(hero));
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

                data_topheroes.initTopHeroesTable(topHeroesTable);
            }

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            self.internal.loading = false;
        });

        return self;
    }
};

PlayerLoader.ajax.parties = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data' //The array of data is found in .data field
    },
    reset: function reset() {
        var self = PlayerLoader.ajax.parties;

        self.internal.loading = false;
        self.internal.url = '';
        PlayerLoader.data.parties.empty();
    },
    generateUrl: function generateUrl() {
        var self = PlayerLoader.ajax.parties;

        var bUrl = Routing.generate("playerdata_pagedata_player_parties", {
            player: player_id
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    /*
     * Loads Parties from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var ajax = PlayerLoader.ajax;
        var self = ajax.parties;

        var data = PlayerLoader.data;
        var data_parties = data.parties;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Parties Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_parties = json.parties;

            /*
             * Process Parties
             */
            if (json_parties.length > 0) {
                data_parties.generatePartiesContainer();

                data_parties.generatePartiesTable();

                var partiesTable = data_parties.getPartiesTableConfig(json_parties.length);

                partiesTable.data = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = json_parties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var party = _step2.value;

                        partiesTable.data.push(data_parties.generatePartiesTableData(party));
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                data_parties.initPartiesTable(partiesTable);
            }

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            self.internal.loading = false;
        });

        return self;
    }
};

PlayerLoader.ajax.matches = {
    internal: {
        loading: false, //Whether or not currently loading a result
        matchloading: false, //Whether or not currently loading a fullmatch result
        url: '', //url to get a response from
        matchurl: '', //url to get a fullmatch response from
        dataSrc: 'data', //The array of data is found in .data field
        offset: 0, //Matches offset
        limit: 6 //Matches limit (Initial limit is set by initial loader)
    },
    reset: function reset() {
        var self = PlayerLoader.ajax.matches;

        self.internal.loading = false;
        self.internal.matchloading = false;
        self.internal.url = '';
        self.internal.matchurl = '';
        self.internal.offset = 0;
        PlayerLoader.data.matches.empty();
    },
    generateUrl: function generateUrl() {
        var self = PlayerLoader.ajax.matches;

        var bUrl = Routing.generate("playerdata_pagedata_player_recentmatches", {
            player: player_id,
            offset: self.internal.offset,
            limit: self.internal.limit
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    generateMatchUrl: function generateMatchUrl(match_id) {
        return Routing.generate("playerdata_pagedata_match", {
            matchid: match_id
        });
    },
    /*
     * Loads {limit} recent matches offset by {offset} from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var ajax = PlayerLoader.ajax;
        var self = ajax.matches;

        var data = PlayerLoader.data;
        var data_matches = data.matches;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        var displayMatchLoader = false;
        self.internal.loading = true;

        //+= Recent Matches Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_offsets = json.offsets;
            var json_limits = json.limits;
            var json_matches = json.matches;

            /*
             * Process Matches
             */
            if (json_matches.length > 0) {
                //Set new offset
                self.internal.offset = json_offsets.matches + self.internal.limit;

                //Append new Match widgets for matches that aren't in the manifest
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = json_matches[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var match = _step3.value;

                        if (!data_matches.isMatchGenerated(match.id)) {
                            data_matches.generateMatch(match);
                        }
                    }

                    //Set displayMatchLoader if we got as many matches as we asked for
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                if (json_matches.length >= self.internal.limit) {
                    displayMatchLoader = true;
                }
            } else if (self.internal.offset === 0) {
                data_matches.generateNoMatchesMessage();
            }

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            //Toggle display match loader button if hadNewMatch
            if (displayMatchLoader) {
                data_matches.generate_matchLoader();
            } else {
                data_matches.remove_matchLoader();
            }

            //Remove initial load
            $('#pl-recentmatches-container').removeClass('initial-load');

            self.internal.loading = false;
        });

        return self;
    },
    /*
     * Loads the match of given id to be displayed under match simplewidget
     */
    loadMatch: function loadMatch(matchid) {
        var ajax = PlayerLoader.ajax;
        var self = ajax.matches;

        var data = PlayerLoader.data;
        var data_matches = data.matches;

        //Generate url based on internal state
        self.internal.matchurl = self.generateMatchUrl(matchid);

        //Enable Processing Indicator
        self.internal.matchloading = true;

        $('#recentmatch-fullmatch-' + matchid).prepend('<div class="fullmatch-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //+= Recent Matches Ajax Request
        $.getJSON(self.internal.matchurl).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_match = json.match;

            /*
             * Process Match
             */
            data_matches.generateFullMatchRows(matchid, json_match);

            //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
            $('[data-toggle="tooltip"]').tooltip();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            $('.fullmatch-processing').remove();

            self.internal.matchloading = false;
        });

        return self;
    }
};

/*
 * Handles binding data to the page
 */
PlayerLoader.data = {
    topheroes: {
        internal: {
            heroLimit: 5 //How many heroes should be displayed at a time
        },
        empty: function empty() {
            $('#pl-topheroes-container').remove();
        },
        generateTopHeroesContainer: function generateTopHeroesContainer() {
            var html = '<div id="pl-topheroes-container" class="pl-topheroes-container hotstatus-subcontainer padding-left-0 padding-right-0">' + '</div>';

            $('#player-leftpane-container').append(html);
        },
        generateTopHeroesTableData: function generateTopHeroesTableData(hero) {
            /*
             * Hero
             */
            var herofield = '<div class="pl-th-heropane"><div><img class="pl-th-hp-heroimage" src="' + hero.image_hero + '"></div>' + '<div><a class="pl-th-hp-heroname" href="' + Routing.generate("hero", { heroProperName: hero.name }) + '" target="_blank">' + hero.name + '</a></div></div>';

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

            var kda = '<span class="' + goodkda + '">' + hero.kda_avg + '</span> KDA';

            var kdaindiv = hero.kills_avg + ' / <span class="pl-th-kda-indiv-deaths">' + hero.deaths_avg + '</span> / ' + hero.assists_avg;

            var kdafield = '<div class="pl-th-kdapane">' +
            //KDA actual
            '<div class="pl-th-kda-kda"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths">' + kda + '</span></div>' +
            //KDA indiv
            '<div class="pl-th-kda-indiv"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists">' + kdaindiv + '</span></div>' + '</div>';

            /*
             * Winrate / Played
             */
            //Good winrate
            var goodwinrate = 'pl-th-wr-winrate';
            if (hero.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad';
            }
            if (hero.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible';
            }
            if (hero.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good';
            }
            if (hero.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great';
            }

            var winratefield = '<div class="pl-th-winratepane">' +
            //Winrate
            '<div class="' + goodwinrate + '"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' + hero.winrate + '%' + '</span></div>' +
            //Played
            '<div class="pl-th-wr-played">' + hero.played + ' played' + '</div>' + '</div>';

            return [herofield, kdafield, winratefield];
        },
        getTopHeroesTableConfig: function getTopHeroesTableConfig(rowLength) {
            var self = PlayerLoader.data.topheroes;

            var datatable = {};

            //Columns definition
            datatable.columns = [{}, {}, {}];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.sorting = false;
            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = self.internal.heroLimit; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>><'pl-topheroes-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function () {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        generateTopHeroesTable: function generateTopHeroesTable() {
            $('#pl-topheroes-container').append('<table id="pl-topheroes-table" class="pl-topheroes-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class="d-none"></thead></table>');
        },
        initTopHeroesTable: function initTopHeroesTable(dataTableConfig) {
            $('#pl-topheroes-table').DataTable(dataTableConfig);
        }
    },
    parties: {
        internal: {
            partyLimit: 5 //How many parties should be displayed at a time
        },
        empty: function empty() {
            $('#pl-parties-container').remove();
        },
        generatePartiesContainer: function generatePartiesContainer() {
            var html = '<div id="pl-parties-container" class="pl-parties-container hotstatus-subcontainer padding-left-0 padding-right-0">' + '</div>';

            $('#player-leftpane-container').append(html);
        },
        generatePartiesTableData: function generatePartiesTableData(hero) {
            /*
             * Winrate / Played
             */
            //Good winrate
            var goodwinrate = 'pl-th-wr-winrate';
            if (hero.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad';
            }
            if (hero.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible';
            }
            if (hero.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good';
            }
            if (hero.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great';
            }

            var winratefield = '<div class="pl-th-winratepane">' +
            //Winrate
            '<div class="' + goodwinrate + '"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' + hero.winrate + '%' + '</span></div>' +
            //Played
            '<div class="pl-th-wr-played">' + hero.played + ' played' + '</div>' + '</div>';

            return [herofield, kdafield, winratefield];
        },
        getPartiesTableConfig: function getPartiesTableConfig(rowLength) {
            var self = PlayerLoader.data.parties;

            var datatable = {};

            //Columns definition
            datatable.columns = [{}, {}];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.sorting = false;
            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = self.internal.partyLimit; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>><'pl-topheroes-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function () {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        generatePartiesTable: function generatePartiesTable() {
            $('#pl-parties-container').append('<table id="pl-parties-table" class="pl-parties-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class="d-none"></thead></table>');
        },
        initPartiesTable: function initPartiesTable(dataTableConfig) {
            $('#pl-parties-table').DataTable(dataTableConfig);
        }
    },
    matches: {
        internal: {
            matchLoaderGenerated: false,
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        empty: function empty() {
            var self = PlayerLoader.data.matches;

            $('#pl-recentmatches-container').remove();
            self.internal.matchLoaderGenerated = false;
            self.internal.matchManifest = {};
        },
        isMatchGenerated: function isMatchGenerated(matchid) {
            var self = PlayerLoader.data.matches;

            return self.internal.matchManifest.hasOwnProperty(matchid + "");
        },
        generateRecentMatchesContainer: function generateRecentMatchesContainer() {
            $('#player-rightpane-container').append('<div id="pl-recentmatches-container" class="pl-recentmatches-container initial-load hotstatus-subcontainer horizontal-scroller"></div>');
        },
        generateNoMatchesMessage: function generateNoMatchesMessage() {
            $('#pl-recentmatches-container').append('<div class="pl-norecentmatches">No Recent Matches Found...</div>');
        },
        generateMatch: function generateMatch(match) {
            //Generates all subcomponents of a match display
            var self = PlayerLoader.data.matches;

            //Match component container
            var html = '<div id="pl-recentmatch-container-' + match.id + '" class="pl-recentmatch-container"></div>';

            $('#pl-recentmatches-container').append(html);

            //Generate one-time party colors for match
            var partiesColors = [1, 2, 3, 4, 5]; //Array of colors to use for party at index = partyIndex - 1
            Hotstatus.utility.shuffle(partiesColors);

            //Log match in manifest
            self.internal.matchManifest[match.id + ""] = {
                fullGenerated: false, //Whether or not the full match data has been loaded for the first time
                fullDisplay: false, //Whether or not the full match data is currently toggled to display
                matchPlayer: match.player.id, //Id of the match's player for whom the match is being displayed, for use with highlighting inside of fullmatch (while decoupling mainplayer)
                partiesColors: partiesColors //Colors to use for the party indexes
            };

            //Subcomponents
            self.generateMatchWidget(match);
        },
        generateMatchWidget: function generateMatchWidget(match) {
            //Generates the small match bar with simple info
            var self = PlayerLoader.data.matches;

            //Match Widget Container
            var timestamp = match.date;
            var relative_date = Hotstatus.date.getRelativeTime(timestamp);
            var date = new Date(timestamp * 1000).toLocaleString();
            var match_time = Hotstatus.date.getMinuteSecondTime(match.match_length);
            var victoryText = match.player.won ? '<span class="pl-recentmatch-won">Victory</span>' : '<span class="pl-recentmatch-lost">Defeat</span>';
            var medal = match.player.medal;

            //Silence
            var silence = function silence(isSilenced) {
                var r = '';

                if (isSilenced) {
                    r = 'rm-sw-link-toxic';
                } else {
                    r = 'rm-sw-link';
                }

                return r;
            };

            var silence_image = function silence_image(isSilenced, size) {
                var s = '';

                if (isSilenced) {
                    if (size > 0) {
                        var path = image_bpath + '/ui/icon_toxic.png';
                        s += '<span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<span class=\'rm-sw-link-toxic\'>Silenced</span>"><img class="rm-sw-toxic" style="width:' + size + 'px;height:' + size + 'px;" src="' + path + '"></span>';
                    }
                }

                return s;
            };

            //Good kda
            var goodkda = 'rm-sw-sp-kda-num';
            if (match.player.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good';
            }
            if (match.player.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great';
            }

            //Medal
            var medalhtml = "";
            var nomedalhtml = "";
            if (medal.exists) {
                medalhtml = '<div class="rm-sw-sp-medal-container"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>' + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-sw-sp-medal" src="' + medal.image + '_blue.png"></span></div>';
            } else {
                nomedalhtml = "<div class='rm-sw-sp-offset'></div>";
            }

            //Talents
            var talentshtml = "";
            for (var i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-sw-tp-talent-bg'>";

                if (match.player.talents.length > i) {
                    var talent = match.player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-sw-tp-talent" src="' + talent.image + '"></span>';
                }

                talentshtml += "</div>";
            }

            //Players
            var playershtml = "";
            var partiesCounter = [0, 0, 0, 0, 0]; //Counts index of party member, for use with creating connectors, up to 5 parties possible
            var partiesColors = self.internal.matchManifest[match.id + ""].partiesColors;
            var t = 0;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = match.teams[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var team = _step4.value;

                    playershtml += '<div class="rm-sw-pp-team' + t + '">';

                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = team.players[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var player = _step5.value;

                            var party = '';
                            if (player.party > 0) {
                                var partyOffset = player.party - 1;
                                var partyColor = partiesColors[partyOffset];

                                party = '<div class="rm-party rm-party-sm rm-party-' + partyColor + '"></div>';

                                if (partiesCounter[partyOffset] > 0) {
                                    party += '<div class="rm-party-sm rm-party-sm-connecter rm-party-' + partyColor + '"></div>';
                                }

                                partiesCounter[partyOffset]++;
                            }

                            var special = '<a class="' + silence(player.silenced) + '" href="' + Routing.generate("player", { id: player.id }) + '" target="_blank">';
                            if (player.id === match.player.id) {
                                special = '<a class="rm-sw-special">';
                            }

                            playershtml += '<div class="rm-sw-pp-player"><span data-toggle="tooltip" data-html="true" title="' + player.hero + '"><img class="rm-sw-pp-player-image" src="' + player.image_hero + '"></span>' + party + silence_image(player.silenced, 12) + special + player.name + '</a></div>';
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
                    }

                    playershtml += '</div>';

                    t++;
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var html = '<div id="recentmatch-container-' + match.id + '"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' + '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + match.map_image + ');">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + match.player.image_hero + '"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("hero", { heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + match.player.kda + '</span> KDA</div></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div>';

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Create click listeners for inspect pane
            $('#recentmatch-simplewidget-inspect-' + match.id).click(function () {
                var t = $(this);

                self.generateFullMatchPane(match.id);
            });
        },
        generateFullMatchPane: function generateFullMatchPane(matchid) {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view, if it's already loaded, toggle its display
            var self = PlayerLoader.data.matches;
            var ajax = PlayerLoader.ajax.matches;

            if (self.internal.matchManifest[matchid + ""].fullGenerated) {
                //Toggle display
                var matchman = self.internal.matchManifest[matchid + ""];
                matchman.fullDisplay = !matchman.fullDisplay;
                var selector = $('#recentmatch-fullmatch-' + matchid);

                if (matchman.fullDisplay) {
                    selector.slideDown(250);
                } else {
                    selector.slideUp(250);
                }
            } else {
                if (!ajax.internal.matchloading) {
                    ajax.internal.matchloading = true;

                    //Generate full match pane
                    $('#recentmatch-container-' + matchid).append('<div id="recentmatch-fullmatch-' + matchid + '" class="recentmatch-fullmatch"></div>');

                    //Load data
                    ajax.loadMatch(matchid);

                    //Log as generated in manifest
                    self.internal.matchManifest[matchid + ""].fullGenerated = true;
                    self.internal.matchManifest[matchid + ""].fullDisplay = true;
                }
            }
        },
        generateFullMatchRows: function generateFullMatchRows(matchid, match) {
            var self = PlayerLoader.data.matches;
            var fullmatch_container = $('#recentmatch-fullmatch-' + matchid);

            //Loop through teams
            var partiesCounter = [0, 0, 0, 0, 0]; //Counts index of party member, for use with creating connectors, up to 5 parties possible
            var t = 0;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = match.teams[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var team = _step6.value;

                    //Team Container
                    fullmatch_container.append('<div id="recentmatch-fullmatch-team-container-' + matchid + '"></div>');
                    var team_container = $('#recentmatch-fullmatch-team-container-' + matchid);

                    //Team Row Header
                    self.generateFullMatchRowHeader(team_container, team, match.winner === t, match.hasBans);

                    //Loop through players for team
                    var p = 0;
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = team.players[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var player = _step7.value;

                            //Player Row
                            self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats, p % 2, partiesCounter);

                            if (player.party > 0) {
                                var partyOffset = player.party - 1;
                                partiesCounter[partyOffset]++;
                            }

                            p++;
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    t++;
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        },
        generateFullMatchRowHeader: function generateFullMatchRowHeader(container, team, winner, hasBans) {
            var self = PlayerLoader.data.matches;

            //Victory
            var victory = winner ? '<span class="rm-fm-rh-victory">Victory</span>' : '<span class="rm-fm-rh-defeat">Defeat</span>';

            //Bans
            var bans = '';
            if (hasBans) {
                bans += 'Bans: ';
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = team.bans[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var ban = _step8.value;

                        bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="' + ban.image + '"></span>';
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }
            }

            var html = '<div class="rm-fm-rowheader">' +
            //Victory Container
            '<div class="rm-fm-rh-victory-container">' + victory + '</div>' +
            //Team Level Container
            '<div class="rm-fm-rh-level-container">' + team.level + '</div>' +
            //Bans Container
            '<div class="rm-fm-rh-bans-container">' + bans + '</div>' +
            //KDA Container
            '<div class="rm-fm-rh-kda-container">KDA</div>' +
            //Statistics Container
            '<div class="rm-fm-rh-statistics-container">Performance</div>' +
            //Mmr Container
            '<div class="rm-fm-rh-mmr-container">MMR: <span class="rm-fm-rh-mmr">' + team.mmr.old.rating + '</span></div>' + '</div>';

            container.append(html);
        },
        generateFullmatchRow: function generateFullmatchRow(matchid, container, player, teamColor, matchStats, oddEven, partiesCounter) {
            var self = PlayerLoader.data.matches;

            //Match player
            var matchPlayerId = self.internal.matchManifest[matchid + ""].matchPlayer;

            //Silence
            var silence = function silence(isSilenced) {
                var r = '';

                if (isSilenced) {
                    r = 'rm-sw-link-toxic';
                } else {
                    r = 'rm-sw-link';
                }

                return r;
            };

            var silence_image = function silence_image(isSilenced, size) {
                var s = '';

                if (isSilenced) {
                    if (size > 0) {
                        var path = image_bpath + '/ui/icon_toxic.png';
                        s += '<span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<span class=\'rm-sw-link-toxic\'>Silenced</span>"><img class="rm-sw-toxic" style="width:' + size + 'px;height:' + size + 'px;" src="' + path + '"></span>';
                    }
                }

                return s;
            };

            //Player name
            var playername = '';
            var special = '';
            if (player.id === matchPlayerId) {
                special = '<a class="rm-fm-r-playername rm-sw-special">';
            } else {
                special = '<a class="rm-fm-r-playername ' + silence(player.silenced) + '" href="' + Routing.generate("player", { id: player.id }) + '" target="_blank">';
            }
            playername += silence_image(player.silenced, 14) + special + player.name + '</a>';

            //Medal
            var medal = player.medal;
            var medalhtml = "";
            if (medal.exists) {
                medalhtml = '<div class="rm-fm-r-medal-inner"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>' + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-fm-r-medal" src="' + medal.image + '_' + teamColor + '.png"></span></div>';
            }

            //Talents
            var talentshtml = "";
            for (var i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-fm-r-talent-bg'>";

                if (player.talents.length > i) {
                    var talent = player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-fm-r-talent" src="' + talent.image + '"></span>';
                }

                talentshtml += "</div>";
            }

            //Stats
            var stats = player.stats;

            var goodkda = 'rm-sw-sp-kda-num';
            if (stats.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good';
            }
            if (stats.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great';
            }

            var rowstat_tooltip = function rowstat_tooltip(val, desc) {
                return val + '<br>' + desc;
            };

            var rowstats = [{ key: "hero_damage", class: "herodamage", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Hero Damage' }, { key: "siege_damage", class: "siegedamage", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Siege Damage' }, { key: "merc_camps", class: "merccamps", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Merc Camps Taken' }, { key: "healing", class: "healing", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Healing' }, { key: "damage_taken", class: "damagetaken", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Damage Taken' }, { key: "exp_contrib", class: "expcontrib", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Experience Contribution' }];

            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = rowstats[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    stat = _step9.value;

                    var max = matchStats[stat.key]["max"];

                    var percentOnRange = 0;
                    if (max > 0) {
                        percentOnRange = stats[stat.key + "_raw"] / (max * 1.00) * 100.0;
                    }

                    stat.width = percentOnRange;

                    stat.value = stats[stat.key];
                    stat.valueDisplay = stat.value;
                    if (stats[stat.key + "_raw"] <= 0) {
                        stat.valueDisplay = '<span class="rm-fm-r-stats-number-none">' + stat.value + '</span>';
                    }

                    stat.tooltip = rowstat_tooltip(stat.value, stat.tooltip);

                    stat.html = '<span data-toggle="tooltip" data-html="true" title="' + stat.tooltip + '"><div class="rm-fm-r-stats-row"><div class="rm-fm-r-stats-' + stat.class + ' rm-fm-r-stats-bar" style="width: ' + stat.width + '%"></div><div class="rm-fm-r-stats-number">' + stat.valueDisplay + '</div></div></span>';
                }

                //MMR
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            var mmrDeltaType = "neg";
            var mmrDeltaPrefix = "";
            if (player.mmr.delta >= 0) {
                mmrDeltaType = "pos";
                mmrDeltaPrefix = "+";
            }
            var mmrDelta = player.mmr.rank + ' ' + player.mmr.tier + ' (<span class=\'rm-fm-r-mmr-delta-' + mmrDeltaType + '\'>' + mmrDeltaPrefix + player.mmr.delta + '</span>)';

            //Party
            var party = '';
            var partiesColors = self.internal.matchManifest[matchid + ""].partiesColors;
            if (player.party > 0) {
                var partyOffset = player.party - 1;
                var partyColor = partiesColors[partyOffset];

                party = '<div class="rm-party rm-party-md rm-party-' + partyColor + '"></div>';

                if (partiesCounter[partyOffset] > 0) {
                    party += '<div class="rm-party-md rm-party-md-connecter rm-party-' + partyColor + '"></div>';
                }
            }

            //Build html
            var html = '<div class="rm-fm-row rm-fm-row-' + oddEven + '">' +
            //Party Stripe
            party +
            //Hero Image Container (With Hero Level)
            '<div class="rm-fm-r-heroimage-container">' + '<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + player.hero + '"><div class="rm-fm-r-herolevel">' + player.hero_level + '</div><img class="rm-fm-r-heroimage" src="' + player.image_hero + '"></span>' + '</div>' +
            //Player Name Container
            '<div class="rm-fm-r-playername-container">' + playername + '</div>' +
            //Medal Container
            '<div class="rm-fm-r-medal-container">' + medalhtml + '</div>' +
            //Talents Container
            '<div class="rm-fm-r-talents-container"><div class="rm-fm-r-talent-container">' + talentshtml + '</div></div>' +
            //KDA Container
            '<div class="rm-fm-r-kda-container">' + '<div class="rm-fm-r-kda-indiv"><span style="cursor:help;" data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists">' + stats.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + stats.deaths + '</span> / ' + stats.assists + '</span></div>' + '<div class="rm-fm-r-kda"><span style="cursor:help;" data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + stats.kda + '</span> KDA</div></span></div>' + '</div>' +
            //Stats Offense Container
            '<div class="rm-fm-r-stats-offense-container">' + rowstats[0].html + rowstats[1].html + rowstats[2].html + '</div>' +
            //Stats Utility Container
            '<div class="rm-fm-r-stats-utility-container">' + rowstats[3].html + rowstats[4].html + rowstats[5].html + '</div>' +
            //MMR Container
            '<div class="rm-fm-r-mmr-container">' + '<div class="rm-fm-r-mmr-tooltip-area" style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + mmrDelta + '"><img class="rm-fm-r-mmr" src="' + image_bpath + 'ui/ranked_player_icon_' + player.mmr.rank + '.png"><div class="rm-fm-r-mmr-number">' + player.mmr.tier + '</div></div>' + '</div>' + '</div>';

            container.append(html);
        },
        remove_matchLoader: function remove_matchLoader() {
            var self = PlayerLoader.data.matches;

            self.internal.matchLoaderGenerated = false;
            $('#pl-recentmatch-matchloader').remove();
        },
        generate_matchLoader: function generate_matchLoader() {
            var self = PlayerLoader.data.matches;
            var ajax = PlayerLoader.ajax.matches;

            self.remove_matchLoader();

            var loaderhtml = '<div id="pl-recentmatch-matchloader">Load More Matches...</div>';

            $('#pl-recentmatches-container').append(loaderhtml);

            $('#pl-recentmatch-matchloader').click(function () {
                if (!ajax.internal.loading) {
                    ajax.internal.loading = true;

                    var t = $(this);

                    t.html('<i class="fa fa-refresh fa-spin fa-1x fa-fw"></i>');

                    PlayerLoader.ajax.matches.load();
                }
            });

            self.internal.matchLoaderGenerated = true;
        },
        color_MatchWonLost: function color_MatchWonLost(won) {
            if (won) {
                return 'pl-recentmatch-bg-won';
            } else {
                return 'pl-recentmatch-bg-lost';
            }
        },
        talenttooltip: function talenttooltip(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_pagedata_player', { player: player_id });

    var filterTypes = ["season", "gameType"];
    var filterAjax = PlayerLoader.ajax.filter;

    //filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function (e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTdjNDgzYjlkMjFhOTI1ZDM2ODIiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lciIsIm9mZnNldCIsImxpbWl0IiwibGltaXRzIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJmYWRlSW4iLCJxdWV1ZSIsInJlbW92ZSIsImVtcHR5IiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lciIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGUiLCJ0b3BIZXJvZXNUYWJsZSIsImdldFRvcEhlcm9lc1RhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YSIsImluaXRUb3BIZXJvZXNUYWJsZSIsImRhdGFfcGFydGllcyIsImpzb25fcGFydGllcyIsImdlbmVyYXRlUGFydGllc0NvbnRhaW5lciIsImdlbmVyYXRlUGFydGllc1RhYmxlIiwicGFydGllc1RhYmxlIiwiZ2V0UGFydGllc1RhYmxlQ29uZmlnIiwicGFydHkiLCJnZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGEiLCJpbml0UGFydGllc1RhYmxlIiwibWF0Y2hsb2FkaW5nIiwibWF0Y2h1cmwiLCJnZW5lcmF0ZU1hdGNoVXJsIiwibWF0Y2hfaWQiLCJtYXRjaGlkIiwiZGlzcGxheU1hdGNoTG9hZGVyIiwianNvbl9vZmZzZXRzIiwib2Zmc2V0cyIsImpzb25fbGltaXRzIiwianNvbl9tYXRjaGVzIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiaWQiLCJnZW5lcmF0ZU1hdGNoIiwiZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlIiwiZ2VuZXJhdGVfbWF0Y2hMb2FkZXIiLCJyZW1vdmVfbWF0Y2hMb2FkZXIiLCJsb2FkTWF0Y2giLCJwcmVwZW5kIiwianNvbl9tYXRjaCIsImdlbmVyYXRlRnVsbE1hdGNoUm93cyIsImhlcm9MaW1pdCIsImh0bWwiLCJoZXJvZmllbGQiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJuYW1lIiwiZ29vZGtkYSIsImtkYV9yYXciLCJrZGEiLCJrZGFfYXZnIiwia2RhaW5kaXYiLCJraWxsc19hdmciLCJkZWF0aHNfYXZnIiwiYXNzaXN0c19hdmciLCJrZGFmaWVsZCIsImdvb2R3aW5yYXRlIiwid2lucmF0ZV9yYXciLCJ3aW5yYXRlZmllbGQiLCJ3aW5yYXRlIiwicGxheWVkIiwicm93TGVuZ3RoIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwic29ydGluZyIsInNlYXJjaGluZyIsImRlZmVyUmVuZGVyIiwicGFnZUxlbmd0aCIsInBhZ2luZyIsInBhZ2luZ1R5cGUiLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwicGFydHlMaW1pdCIsIm1hdGNoTG9hZGVyR2VuZXJhdGVkIiwibWF0Y2hNYW5pZmVzdCIsImhhc093blByb3BlcnR5IiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwiZGF0ZSIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0Iiwid29uIiwibWVkYWwiLCJzaWxlbmNlIiwiaXNTaWxlbmNlZCIsInIiLCJzaWxlbmNlX2ltYWdlIiwic2l6ZSIsInMiLCJwYXRoIiwiaW1hZ2VfYnBhdGgiLCJtZWRhbGh0bWwiLCJub21lZGFsaHRtbCIsImV4aXN0cyIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJ0YWxlbnRzaHRtbCIsImkiLCJ0YWxlbnRzIiwidGFsZW50IiwidGFsZW50dG9vbHRpcCIsInBsYXllcnNodG1sIiwicGFydGllc0NvdW50ZXIiLCJ0IiwidGVhbXMiLCJ0ZWFtIiwicGxheWVycyIsInBhcnR5T2Zmc2V0IiwicGFydHlDb2xvciIsInNwZWNpYWwiLCJzaWxlbmNlZCIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsIm1hcCIsImdhbWVUeXBlIiwia2lsbHMiLCJkZWF0aHMiLCJhc3Npc3RzIiwiY2xpY2siLCJnZW5lcmF0ZUZ1bGxNYXRjaFBhbmUiLCJtYXRjaG1hbiIsInNlbGVjdG9yIiwic2xpZGVEb3duIiwic2xpZGVVcCIsImZ1bGxtYXRjaF9jb250YWluZXIiLCJ0ZWFtX2NvbnRhaW5lciIsImdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyIiwid2lubmVyIiwiaGFzQmFucyIsInAiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbG9yIiwic3RhdHMiLCJjb250YWluZXIiLCJ2aWN0b3J5IiwiYmFucyIsImJhbiIsImxldmVsIiwibW1yIiwib2xkIiwicmF0aW5nIiwidGVhbUNvbG9yIiwibWF0Y2hTdGF0cyIsIm9kZEV2ZW4iLCJtYXRjaFBsYXllcklkIiwicGxheWVybmFtZSIsInJvd3N0YXRfdG9vbHRpcCIsImRlc2MiLCJyb3dzdGF0cyIsImtleSIsImNsYXNzIiwid2lkdGgiLCJ2YWx1ZSIsInZhbHVlRGlzcGxheSIsInN0YXQiLCJtYXgiLCJwZXJjZW50T25SYW5nZSIsIm1tckRlbHRhVHlwZSIsIm1tckRlbHRhUHJlZml4IiwiZGVsdGEiLCJtbXJEZWx0YSIsInJhbmsiLCJ0aWVyIiwiaGVyb19sZXZlbCIsImxvYWRlcmh0bWwiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsImZpbHRlckFqYXgiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsIm9uIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4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QXhnQkk7QUF5Z0JMbUIsdUJBQWUsdUJBQVM3RSxJQUFULEVBQWU0SCxJQUFmLEVBQXFCO0FBQ2hDLG1CQUFPLDZDQUE2QzVILElBQTdDLEdBQW9ELGFBQXBELEdBQW9FNEgsSUFBM0U7QUFDSDtBQTNnQkk7QUFwTk8sQ0FBcEI7O0FBb3VCQXJNLEVBQUV1TixRQUFGLEVBQVlDLEtBQVosQ0FBa0IsWUFBVztBQUN6QnhOLE1BQUV5TixFQUFGLENBQUtDLFlBQUwsQ0FBa0JDLFFBQWxCLEdBQTZCLE1BQTdCLENBRHlCLENBQ1k7O0FBRXJDO0FBQ0EsUUFBSXhPLFVBQVVvQyxRQUFRQyxRQUFSLENBQWlCLDRCQUFqQixFQUErQyxFQUFDQyxRQUFRQyxTQUFULEVBQS9DLENBQWQ7O0FBRUEsUUFBSXRDLGNBQWMsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQjtBQUNBLFFBQUl3TyxhQUFhN1AsYUFBYUMsSUFBYixDQUFrQkssTUFBbkM7O0FBRUE7QUFDQVEsb0JBQWdCZ1AsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDek8sV0FBeEM7QUFDQXdPLGVBQVcxTyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQVksTUFBRSx3QkFBRixFQUE0QjhOLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckRsUCx3QkFBZ0JnUCxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N6TyxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQVksTUFBRSxHQUFGLEVBQU84TixFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0UsQ0FBVCxFQUFZO0FBQ3hDSixtQkFBVzFPLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQXRCRCxFIiwiZmlsZSI6InBsYXllci1sb2FkZXIuODY4NzA0Njc0OGIwMTIyYTU5ZjUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA5N2M0ODNiOWQyMWE5MjVkMzY4MiIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgdmFsID0gSG90c3RhdHVzRmlsdGVyLmdldFNlbGVjdG9yVmFsdWVzKFwic2Vhc29uXCIpO1xyXG5cclxuICAgICAgICBsZXQgc2Vhc29uID0gXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vhc29uO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuICAgICAgICBsZXQgYWpheF9tYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgIGxldCBhamF4X3RvcGhlcm9lcyA9IGFqYXgudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBhamF4X3BhcnRpZXMgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8tLSBJbml0aWFsIE1hdGNoZXMgRmlyc3QgTG9hZFxyXG4gICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWxvYWRlcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtM3ggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X3RvcGhlcm9lcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgYWpheF9wYXJ0aWVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5sb2FkKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4X3RvcGhlcm9lcy5sb2FkKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgUGFydGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4X3BhcnRpZXMubG9hZCgpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wbGF5ZXJsb2FkZXItcHJvY2Vzc2luZycpLmZhZGVJbigpLmRlbGF5KDc1MCkucXVldWUoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS50b3BoZXJvZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3RvcGhlcm9lc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyBUb3AgSGVyb2VzIGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9waGVyb2VzID0gZGF0YS50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBUb3AgSGVyb2VzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9oZXJvZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcEhlcm9lc1RhYmxlID0gZGF0YV90b3BoZXJvZXMuZ2V0VG9wSGVyb2VzVGFibGVDb25maWcoanNvbl9oZXJvZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmluaXRUb3BIZXJvZXNUYWJsZSh0b3BIZXJvZXNUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4LnBhcnRpZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEucGFydGllcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3BhcnRpZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgUGFydGllcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9wYXJ0aWVzID0gZGF0YS5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUGFydGllcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3BhcnRpZXMgPSBqc29uLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgUGFydGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9wYXJ0aWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydGllc1RhYmxlID0gZGF0YV9wYXJ0aWVzLmdldFBhcnRpZXNUYWJsZUNvbmZpZyhqc29uX3BhcnRpZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0eSBvZiBqc29uX3BhcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEucHVzaChkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhKHBhcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuaW5pdFBhcnRpZXNUYWJsZShwYXJ0aWVzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogNiwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHNlbGYuaW50ZXJuYWwub2Zmc2V0LFxyXG4gICAgICAgICAgICBsaW1pdDogc2VsZi5pbnRlcm5hbC5saW1pdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZU1hdGNoVXJsOiBmdW5jdGlvbihtYXRjaF9pZCkge1xyXG4gICAgICAgIHJldHVybiBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9tYXRjaFwiLCB7XHJcbiAgICAgICAgICAgIG1hdGNoaWQ6IG1hdGNoX2lkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIGxldCBkaXNwbGF5TWF0Y2hMb2FkZXIgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBvZmZzZXRcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IGpzb25fb2Zmc2V0cy5tYXRjaGVzICsgc2VsZi5pbnRlcm5hbC5saW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgbmV3IE1hdGNoIHdpZGdldHMgZm9yIG1hdGNoZXMgdGhhdCBhcmVuJ3QgaW4gdGhlIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YV9tYXRjaGVzLmlzTWF0Y2hHZW5lcmF0ZWQobWF0Y2guaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVNYXRjaChtYXRjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vU2V0IGRpc3BsYXlNYXRjaExvYWRlciBpZiB3ZSBnb3QgYXMgbWFueSBtYXRjaGVzIGFzIHdlIGFza2VkIGZvclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID49IHNlbGYuaW50ZXJuYWwubGltaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGNoTG9hZGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzZWxmLmludGVybmFsLm9mZnNldCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU5vTWF0Y2hlc01lc3NhZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5IG1hdGNoIGxvYWRlciBidXR0b24gaWYgaGFkTmV3TWF0Y2hcclxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TWF0Y2hMb2FkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1JlbW92ZSBpbml0aWFsIGxvYWRcclxuICAgICAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB0aGUgbWF0Y2ggb2YgZ2l2ZW4gaWQgdG8gYmUgZGlzcGxheWVkIHVuZGVyIG1hdGNoIHNpbXBsZXdpZGdldFxyXG4gICAgICovXHJcbiAgICBsb2FkTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9IHNlbGYuZ2VuZXJhdGVNYXRjaFVybChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZ1bGxtYXRjaC1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC5tYXRjaHVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2ggPSBqc29uLm1hdGNoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZUZ1bGxNYXRjaFJvd3MobWF0Y2hpZCwganNvbl9tYXRjaCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5mdWxsbWF0Y2gtcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuZGF0YSA9IHtcclxuICAgIHRvcGhlcm9lczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGhlcm9MaW1pdDogNSwgLy9Ib3cgbWFueSBoZXJvZXMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXRvcGhlcm9lcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBIZXJvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgaGVyb2ZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1oZXJvcGFuZVwiPjxkaXY+PGltZyBjbGFzcz1cInBsLXRoLWhwLWhlcm9pbWFnZVwiIHNyYz1cIicrIGhlcm8uaW1hZ2VfaGVybyArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGEgY2xhc3M9XCJwbC10aC1ocC1oZXJvbmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBoZXJvLm5hbWUgKyc8L2E+PC9kaXY+PC9kaXY+JztcclxuXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBLREFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBrZGEgPSAnPHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIGhlcm8ua2RhX2F2ZyArICc8L3NwYW4+IEtEQSc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhaW5kaXYgPSBoZXJvLmtpbGxzX2F2ZyArICcgLyA8c3BhbiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgaGVyby5kZWF0aHNfYXZnICsgJzwvc3Bhbj4gLyAnICsgaGVyby5hc3Npc3RzX2F2ZztcclxuXHJcbiAgICAgICAgICAgIGxldCBrZGFmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgYWN0dWFsXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1rZGFcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYSArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgaW5kaXZcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWluZGl2XCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPicgK1xyXG4gICAgICAgICAgICAgICAga2RhaW5kaXYgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5oZXJvTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtdG9waGVyb2VzLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcGhlcm9lcy10YWJsZVwiIGNsYXNzPVwicGwtdG9waGVyb2VzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJ0aWVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgcGFydHlMaW1pdDogNSwgLy9Ib3cgbWFueSBwYXJ0aWVzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXBhcnRpZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGxheWVyLWxlZnRwYW5lLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBXaW5yYXRlIC8gUGxheWVkXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qgd2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIGhlcm8ud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLnBsYXllZCArICcgcGxheWVkJyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbaGVyb2ZpZWxkLCBrZGFmaWVsZCwgd2lucmF0ZWZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFBhcnRpZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSBzZWxmLmludGVybmFsLnBhcnR5TGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtdG9waGVyb2VzLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtcGFydGllcy10YWJsZVwiIGNsYXNzPVwicGwtcGFydGllcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWF0Y2hMb2FkZXJHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBtYXRjaE1hbmlmZXN0OiB7fSAvL0tlZXBzIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGlkcyBhcmUgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZCwgdG8gcHJldmVudCBvZmZzZXQgcmVxdWVzdHMgZnJvbSByZXBlYXRpbmcgbWF0Y2hlcyBvdmVyIGxhcmdlIHBlcmlvZHMgb2YgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QgPSB7fTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTWF0Y2hHZW5lcmF0ZWQ6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShtYXRjaGlkICsgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGxheWVyLXJpZ2h0cGFuZS1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXIgaW5pdGlhbC1sb2FkIGhvdHN0YXR1cy1zdWJjb250YWluZXIgaG9yaXpvbnRhbC1zY3JvbGxlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGwtbm9yZWNlbnRtYXRjaGVzXCI+Tm8gUmVjZW50IE1hdGNoZXMgRm91bmQuLi48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9HZW5lcmF0ZSBvbmUtdGltZSBwYXJ0eSBjb2xvcnMgZm9yIG1hdGNoXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gWzEsIDIsIDMsIDQsIDVdOyAvL0FycmF5IG9mIGNvbG9ycyB0byB1c2UgZm9yIHBhcnR5IGF0IGluZGV4ID0gcGFydHlJbmRleCAtIDFcclxuICAgICAgICAgICAgSG90c3RhdHVzLnV0aWxpdHkuc2h1ZmZsZShwYXJ0aWVzQ29sb3JzKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9nIG1hdGNoIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdID0ge1xyXG4gICAgICAgICAgICAgICAgZnVsbEdlbmVyYXRlZDogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBoYXMgYmVlbiBsb2FkZWQgZm9yIHRoZSBmaXJzdCB0aW1lXHJcbiAgICAgICAgICAgICAgICBmdWxsRGlzcGxheTogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBpcyBjdXJyZW50bHkgdG9nZ2xlZCB0byBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBtYXRjaFBsYXllcjogbWF0Y2gucGxheWVyLmlkLCAvL0lkIG9mIHRoZSBtYXRjaCdzIHBsYXllciBmb3Igd2hvbSB0aGUgbWF0Y2ggaXMgYmVpbmcgZGlzcGxheWVkLCBmb3IgdXNlIHdpdGggaGlnaGxpZ2h0aW5nIGluc2lkZSBvZiBmdWxsbWF0Y2ggKHdoaWxlIGRlY291cGxpbmcgbWFpbnBsYXllcilcclxuICAgICAgICAgICAgICAgIHBhcnRpZXNDb2xvcnM6IHBhcnRpZXNDb2xvcnMgLy9Db2xvcnMgdG8gdXNlIGZvciB0aGUgcGFydHkgaW5kZXhlc1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBub21lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctc3AtbWVkYWwtY29udGFpbmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1zdy1zcC1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ19ibHVlLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXNwLW9mZnNldCc+PC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1zdy10cC10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IG1hdGNoLnBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctdHAtdGFsZW50XCIgc3JjPVwiJyArIHRhbGVudC5pbWFnZSArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaC5wbGF5ZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXJcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXBwLXBsYXllci1pbWFnZVwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBwbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L3NwYW4+JyArIHBhcnR5ICsgc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDEyKSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1jb250YWluZXItJysgbWF0Y2guaWQgKydcIj48ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtbGVmdHBhbmUgJyArIHNlbGYuY29sb3JfTWF0Y2hXb25Mb3N0KG1hdGNoLnBsYXllci53b24pICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyBtYXRjaC5tYXBfaW1hZ2UgKyAnKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGVcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlLXRleHRcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWF0Y2gubWFwICsgJ1wiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWRhdGVcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgZGF0ZSArICdcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWRhdGUtdGV4dFwiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLXZpY3RvcnlcIj4nICsgdmljdG9yeVRleHQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLW1hdGNobGVuZ3RoXCI+JyArIG1hdGNoX3RpbWUgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGltZyBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIHJtLXN3LWhwLXBvcnRyYWl0XCIgc3JjPVwiJyArIG1hdGNoLnBsYXllci5pbWFnZV9oZXJvICsgJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1ocC1oZXJvbmFtZVwiPicrc2lsZW5jZV9pbWFnZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQsIDE2KSsnPGEgY2xhc3M9XCInK3NpbGVuY2UobWF0Y2gucGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwiaGVyb1wiLCB7aGVyb1Byb3Blck5hbWU6IG1hdGNoLnBsYXllci5oZXJvfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvYT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXN0YXRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXZcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi10ZXh0XCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIG1hdGNoLnBsYXllci5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgbWF0Y2gucGxheWVyLmRlYXRocyArICc8L3NwYW4+IC8gJyArIG1hdGNoLnBsYXllci5hc3Npc3RzICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIG1hdGNoLnBsYXllci5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtdGFsZW50c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctdHAtdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtcGxheWVyc3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctcHAtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJyArIG1hdGNoaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2hcIj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmxvYWRNYXRjaChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2cgYXMgZ2VuZXJhdGVkIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzOiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBmdWxsbWF0Y2hfY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRlYW1zXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZnVsbG1hdGNoX2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCArJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlYW1fY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gUm93IEhlYWRlclxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcih0ZWFtX2NvbnRhaW5lciwgdGVhbSwgbWF0Y2gud2lubmVyID09PSB0LCBtYXRjaC5oYXNCYW5zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBwbGF5ZXJzIGZvciB0ZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9QbGF5ZXIgUm93XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxtYXRjaFJvdyhtYXRjaGlkLCB0ZWFtX2NvbnRhaW5lciwgcGxheWVyLCB0ZWFtLmNvbG9yLCBtYXRjaC5zdGF0cywgcCAlIDIsIHBhcnRpZXNDb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJysgYmFuLmltYWdlICsnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgta2RhLWNvbnRhaW5lclwiPktEQTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0aXN0aWNzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1zdGF0aXN0aWNzLWNvbnRhaW5lclwiPlBlcmZvcm1hbmNlPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yLCBtYXRjaFN0YXRzLCBvZGRFdmVuLCBwYXJ0aWVzQ291bnRlcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hQbGF5ZXJJZCA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ubWF0Y2hQbGF5ZXI7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyIG5hbWVcclxuICAgICAgICAgICAgbGV0IHBsYXllcm5hbWUgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnJztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2hQbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSBybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgJysgc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpICsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICs9IHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxNCkgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPic7XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IHBsYXllci5tZWRhbDtcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1pbm5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tZm0tci1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ18nKyB0ZWFtQ29sb3IgKycucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1mbS1yLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gcGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdGF0c1xyXG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBwbGF5ZXIuc3RhdHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdF90b29sdGlwID0gZnVuY3Rpb24gKHZhbCwgZGVzYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArJzxicj4nKyBkZXNjO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRzID0gW1xyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZXJvX2RhbWFnZVwiLCBjbGFzczogXCJoZXJvZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlcm8gRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcInNpZWdlX2RhbWFnZVwiLCBjbGFzczogXCJzaWVnZWRhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdTaWVnZSBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwibWVyY19jYW1wc1wiLCBjbGFzczogXCJtZXJjY2FtcHNcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnTWVyYyBDYW1wcyBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZWFsaW5nXCIsIGNsYXNzOiBcImhlYWxpbmdcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVhbGluZyd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJkYW1hZ2VfdGFrZW5cIiwgY2xhc3M6IFwiZGFtYWdldGFrZW5cIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRGFtYWdlIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImV4cF9jb250cmliXCIsIGNsYXNzOiBcImV4cGNvbnRyaWJcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRXhwZXJpZW5jZSBDb250cmlidXRpb24nfVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChzdGF0IG9mIHJvd3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gbWF0Y2hTdGF0c1tzdGF0LmtleV1bXCJtYXhcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBlcmNlbnRPblJhbmdlID0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChtYXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudE9uUmFuZ2UgPSAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gLyAobWF4ICogMS4wMCkpICogMTAwLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC53aWR0aCA9IHBlcmNlbnRPblJhbmdlO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWUgPSBzdGF0c1tzdGF0LmtleV07XHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9IHN0YXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gJzxzcGFuIGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXItbm9uZVwiPicgKyBzdGF0LnZhbHVlICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudG9vbHRpcCA9IHJvd3N0YXRfdG9vbHRpcChzdGF0LnZhbHVlLCBzdGF0LnRvb2x0aXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQuaHRtbCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc3RhdC50b29sdGlwICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXJvd1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLScrIHN0YXQuY2xhc3MgKycgcm0tZm0tci1zdGF0cy1iYXJcIiBzdHlsZT1cIndpZHRoOiAnKyBzdGF0LndpZHRoICsnJVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlclwiPicrIHN0YXQudmFsdWVEaXNwbGF5ICsnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTU1SXHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVR5cGUgPSBcIm5lZ1wiO1xyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLm1tci5kZWx0YSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVR5cGUgPSBcInBvc1wiO1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFQcmVmaXggPSBcIitcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGEgPSBwbGF5ZXIubW1yLnJhbmsgKycgJysgcGxheWVyLm1tci50aWVyICsnICg8c3BhbiBjbGFzcz1cXCdybS1mbS1yLW1tci1kZWx0YS0nKyBtbXJEZWx0YVR5cGUgKydcXCc+JysgbW1yRGVsdGFQcmVmaXggKyBwbGF5ZXIubW1yLmRlbHRhICsnPC9zcGFuPiknO1xyXG5cclxuICAgICAgICAgICAgLy9QYXJ0eVxyXG4gICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktbWQgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LW1kIHJtLXBhcnR5LW1kLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9CdWlsZCBodG1sXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3cgcm0tZm0tcm93LScrIG9kZEV2ZW4gKydcIj4nICtcclxuICAgICAgICAgICAgLy9QYXJ0eSBTdHJpcGVcclxuICAgICAgICAgICAgcGFydHkgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01NUiBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci10b29sdGlwLWFyZWFcIiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIG1tckRlbHRhICsnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItbW1yXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBwbGF5ZXIubW1yLnJhbmsgKycucG5nXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLW51bWJlclwiPicrIHBsYXllci5tbXIudGllciArJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZXJodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlclwiPkxvYWQgTW9yZSBNYXRjaGVzLi4uPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChsb2FkZXJodG1sKTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMXggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcicsIHtwbGF5ZXI6IHBsYXllcl9pZH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgLy9maWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9