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
            ajax.matches.reset();
            ajax.topheroes.reset();

            /*
             * Heroloader Container
             */
            $('#playerloader-container').removeClass('initial-load');

            /*
             * Initial matches
             */
            data_matches.generateRecentMatchesContainer();

            var ajaxMatches = ajax.matches;
            ajaxMatches.internal.offset = 0;
            ajaxMatches.internal.limit = json.limits.matches;

            //Load initial match set
            ajaxMatches.load();

            /*
             * Initial Top Heroes
             */
            var ajaxTopHeroes = ajax.topheroes;

            //Load initial top heroes
            ajaxTopHeroes.load();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDU1NjI0YjhhNTgwNzllYjU1YWYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsImRhdGFfbWF0Y2hlcyIsIm1hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwicmVzZXQiLCJ0b3BoZXJvZXMiLCJyZW1vdmVDbGFzcyIsImdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lciIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJhamF4VG9wSGVyb2VzIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJmYWRlSW4iLCJxdWV1ZSIsInJlbW92ZSIsImVtcHR5IiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lciIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGUiLCJ0b3BIZXJvZXNUYWJsZSIsImdldFRvcEhlcm9lc1RhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YSIsImluaXRUb3BIZXJvZXNUYWJsZSIsInBhcnRpZXMiLCJkYXRhX3BhcnRpZXMiLCJqc29uX3BhcnRpZXMiLCJnZW5lcmF0ZVBhcnRpZXNDb250YWluZXIiLCJnZW5lcmF0ZVBhcnRpZXNUYWJsZSIsInBhcnRpZXNUYWJsZSIsImdldFBhcnRpZXNUYWJsZUNvbmZpZyIsInBhcnR5IiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhIiwiaW5pdFBhcnRpZXNUYWJsZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImlkIiwiZ2VuZXJhdGVNYXRjaCIsImdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJoZXJvTGltaXQiLCJodG1sIiwiaGVyb2ZpZWxkIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwibmFtZSIsImdvb2RrZGEiLCJrZGFfcmF3Iiwia2RhIiwia2RhX2F2ZyIsImtkYWluZGl2Iiwia2lsbHNfYXZnIiwiZGVhdGhzX2F2ZyIsImFzc2lzdHNfYXZnIiwia2RhZmllbGQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVfcmF3Iiwid2lucmF0ZWZpZWxkIiwid2lucmF0ZSIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsInBhcnR5TGltaXQiLCJtYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJoYXNPd25Qcm9wZXJ0eSIsInBhcnRpZXNDb2xvcnMiLCJ1dGlsaXR5Iiwic2h1ZmZsZSIsImZ1bGxHZW5lcmF0ZWQiLCJmdWxsRGlzcGxheSIsIm1hdGNoUGxheWVyIiwiZ2VuZXJhdGVNYXRjaFdpZGdldCIsInRpbWVzdGFtcCIsImRhdGUiLCJyZWxhdGl2ZV9kYXRlIiwiZ2V0UmVsYXRpdmVUaW1lIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwibWF0Y2hfdGltZSIsImdldE1pbnV0ZVNlY29uZFRpbWUiLCJtYXRjaF9sZW5ndGgiLCJ2aWN0b3J5VGV4dCIsIndvbiIsIm1lZGFsIiwic2lsZW5jZSIsImlzU2lsZW5jZWQiLCJyIiwic2lsZW5jZV9pbWFnZSIsInNpemUiLCJzIiwicGF0aCIsImltYWdlX2JwYXRoIiwibWVkYWxodG1sIiwibm9tZWRhbGh0bWwiLCJleGlzdHMiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwidGFsZW50c2h0bWwiLCJpIiwidGFsZW50cyIsInRhbGVudCIsInRhbGVudHRvb2x0aXAiLCJwbGF5ZXJzaHRtbCIsInBhcnRpZXNDb3VudGVyIiwidCIsInRlYW1zIiwidGVhbSIsInBsYXllcnMiLCJwYXJ0eU9mZnNldCIsInBhcnR5Q29sb3IiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJjb2xvcl9NYXRjaFdvbkxvc3QiLCJtYXBfaW1hZ2UiLCJtYXAiLCJnYW1lVHlwZSIsImtpbGxzIiwiZGVhdGhzIiwiYXNzaXN0cyIsImNsaWNrIiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwibWF0Y2htYW4iLCJzZWxlY3RvciIsInNsaWRlRG93biIsInNsaWRlVXAiLCJmdWxsbWF0Y2hfY29udGFpbmVyIiwidGVhbV9jb250YWluZXIiLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlciIsIndpbm5lciIsImhhc0JhbnMiLCJwIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsInN0YXRzIiwiY29udGFpbmVyIiwidmljdG9yeSIsImJhbnMiLCJiYW4iLCJsZXZlbCIsIm1tciIsIm9sZCIsInJhdGluZyIsInRlYW1Db2xvciIsIm1hdGNoU3RhdHMiLCJvZGRFdmVuIiwibWF0Y2hQbGF5ZXJJZCIsInBsYXllcm5hbWUiLCJyb3dzdGF0X3Rvb2x0aXAiLCJkZXNjIiwicm93c3RhdHMiLCJrZXkiLCJjbGFzcyIsIndpZHRoIiwidmFsdWUiLCJ2YWx1ZURpc3BsYXkiLCJzdGF0IiwibWF4IiwicGVyY2VudE9uUmFuZ2UiLCJtbXJEZWx0YVR5cGUiLCJtbXJEZWx0YVByZWZpeCIsImRlbHRhIiwibW1yRGVsdGEiLCJyYW5rIiwidGllciIsImhlcm9fbGV2ZWwiLCJsb2FkZXJodG1sIiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFF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QUFxQjtBQUNoQyxtQkFBTyw2Q0FBNkM1SCxJQUE3QyxHQUFvRCxhQUFwRCxHQUFvRTRILElBQTNFO0FBQ0g7QUEzZ0JJO0FBcE5PLENBQXBCOztBQW91QkF6TSxFQUFFMk4sUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekI1TixNQUFFNk4sRUFBRixDQUFLQyxZQUFMLENBQWtCQyxRQUFsQixHQUE2QixNQUE3QixDQUR5QixDQUNZOztBQUVyQztBQUNBLFFBQUl2TyxVQUFVa0MsUUFBUUMsUUFBUixDQUFpQiw0QkFBakIsRUFBK0MsRUFBQ0MsUUFBUUMsU0FBVCxFQUEvQyxDQUFkOztBQUVBLFFBQUlwQyxjQUFjLENBQUMsUUFBRCxFQUFXLFVBQVgsQ0FBbEI7QUFDQSxRQUFJdU8sYUFBYTVQLGFBQWFDLElBQWIsQ0FBa0JLLE1BQW5DOztBQUVBO0FBQ0FRLG9CQUFnQitPLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q3hPLFdBQXhDO0FBQ0F1TyxlQUFXek8sWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0FPLE1BQUUsd0JBQUYsRUFBNEJrTyxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEalAsd0JBQWdCK08saUJBQWhCLENBQWtDLElBQWxDLEVBQXdDeE8sV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FPLE1BQUUsR0FBRixFQUFPa08sRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q0osbUJBQVd6TyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLmZlNjc3MGZlOWQ2ZDllNGE5MTc2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDU1NjI0YjhhNTgwNzllYjU1YWYiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8tLSBJbml0aWFsIE1hdGNoZXMgRmlyc3QgTG9hZFxyXG4gICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWxvYWRlcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtM3ggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheC5tYXRjaGVzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4LnRvcGhlcm9lcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYWpheE1hdGNoZXMgPSBhamF4Lm1hdGNoZXM7XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwubGltaXQgPSBqc29uLmxpbWl0cy5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9hZCBpbml0aWFsIG1hdGNoIHNldFxyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhUb3BIZXJvZXMgPSBhamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCB0b3AgaGVyb2VzXHJcbiAgICAgICAgICAgICAgICBhamF4VG9wSGVyb2VzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucGxheWVybG9hZGVyLXByb2Nlc3NpbmcnKS5mYWRlSW4oKS5kZWxheSg3NTApLnF1ZXVlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl90b3BoZXJvZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgVG9wIEhlcm9lcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcGhlcm9lcyA9IGRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gVG9wIEhlcm9lcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9lcyA9IGpzb24uaGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcGhlcm9lcy5nZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcGhlcm9lcy5nZW5lcmF0ZVRvcEhlcm9lc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3BIZXJvZXNUYWJsZSA9IGRhdGFfdG9waGVyb2VzLmdldFRvcEhlcm9lc1RhYmxlQ29uZmlnKGpzb25faGVyb2VzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvcEhlcm9lc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBoZXJvIG9mIGpzb25faGVyb2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcEhlcm9lc1RhYmxlLmRhdGEucHVzaChkYXRhX3RvcGhlcm9lcy5nZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YShoZXJvKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcGhlcm9lcy5pbml0VG9wSGVyb2VzVGFibGUodG9wSGVyb2VzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9wYXJ0aWVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFBhcnRpZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfcGFydGllcyA9IGRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFBhcnRpZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9wYXJ0aWVzID0ganNvbi5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fcGFydGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRpZXNUYWJsZSA9IGRhdGFfcGFydGllcy5nZXRQYXJ0aWVzVGFibGVDb25maWcoanNvbl9wYXJ0aWVzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydHkgb2YganNvbl9wYXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNUYWJsZS5kYXRhLnB1c2goZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc1RhYmxlRGF0YShwYXJ0eSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmluaXRQYXJ0aWVzVGFibGUocGFydGllc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICBtYXRjaGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgZnVsbG1hdGNoIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBtYXRjaHVybDogJycsIC8vdXJsIHRvIGdldCBhIGZ1bGxtYXRjaCByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICAgICAgb2Zmc2V0OiAwLCAvL01hdGNoZXMgb2Zmc2V0XHJcbiAgICAgICAgbGltaXQ6IDYsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVNYXRjaFVybDogZnVuY3Rpb24obWF0Y2hfaWQpIHtcclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfbWF0Y2hcIiwge1xyXG4gICAgICAgICAgICBtYXRjaGlkOiBtYXRjaF9pZCxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMge2xpbWl0fSByZWNlbnQgbWF0Y2hlcyBvZmZzZXQgYnkge29mZnNldH0gZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBsZXQgZGlzcGxheU1hdGNoTG9hZGVyID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX29mZnNldHMgPSBqc29uLm9mZnNldHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9saW1pdHMgPSBqc29uLmxpbWl0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoZXMgPSBqc29uLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBuZXcgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSBqc29uX29mZnNldHMubWF0Y2hlcyArIHNlbGYuaW50ZXJuYWwubGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hdGNoIG9mIGpzb25fbWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFfbWF0Y2hlcy5pc01hdGNoR2VuZXJhdGVkKG1hdGNoLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5pbnRlcm5hbC5vZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9SZW1vdmUgaW5pdGlhbCBsb2FkXHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgdGhlIG1hdGNoIG9mIGdpdmVuIGlkIHRvIGJlIGRpc3BsYXllZCB1bmRlciBtYXRjaCBzaW1wbGV3aWRnZXRcclxuICAgICAqL1xyXG4gICAgbG9hZE1hdGNoOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSBzZWxmLmdlbmVyYXRlTWF0Y2hVcmwobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmdWxsbWF0Y2gtcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoID0ganNvbi5tYXRjaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzKG1hdGNoaWQsIGpzb25fbWF0Y2gpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZnVsbG1hdGNoLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB0b3BoZXJvZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBoZXJvTGltaXQ6IDUsIC8vSG93IG1hbnkgaGVyb2VzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGE6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogSGVyb1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbGV0IGhlcm9maWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtaGVyb3BhbmVcIj48ZGl2PjxpbWcgY2xhc3M9XCJwbC10aC1ocC1oZXJvaW1hZ2VcIiBzcmM9XCInKyBoZXJvLmltYWdlX2hlcm8gKydcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxhIGNsYXNzPVwicGwtdGgtaHAtaGVyb25hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyby5uYW1lfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JysgaGVyby5uYW1lICsnPC9hPjwvZGl2PjwvZGl2Pic7XHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogS0RBXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhID0gJzxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBoZXJvLmtkYV9hdmcgKyAnPC9zcGFuPiBLREEnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGtkYWluZGl2ID0gaGVyby5raWxsc19hdmcgKyAnIC8gPHNwYW4gY2xhc3M9XCJwbC10aC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIGhlcm8uZGVhdGhzX2F2ZyArICc8L3NwYW4+IC8gJyArIGhlcm8uYXNzaXN0c19hdmc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGFjdHVhbFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC1rZGEta2RhXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGEgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGluZGl2XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdlwiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYWluZGl2ICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIGhlcm8ucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtoZXJvZmllbGQsIGtkYWZpZWxkLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wSGVyb2VzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwuaGVyb0xpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLXRvcGhlcm9lcy1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJwbC10b3BoZXJvZXMtdGFibGVcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUb3BIZXJvZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGFydGllczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIHBhcnR5TGltaXQ6IDUsIC8vSG93IG1hbnkgcGFydGllcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcGFydGllcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGE6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRQYXJ0aWVzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5wYXJ0eUxpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLXRvcGhlcm9lcy1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXBhcnRpZXMtdGFibGVcIiBjbGFzcz1cInBsLXBhcnRpZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0UGFydGllc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsYXllci1yaWdodHBhbmUtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyIGluaXRpYWwtbG9hZCBob3RzdGF0dXMtc3ViY29udGFpbmVyIGhvcml6b250YWwtc2Nyb2xsZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsLW5vcmVjZW50bWF0Y2hlc1wiPk5vIFJlY2VudCBNYXRjaGVzIEZvdW5kLi4uPC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyBhbGwgc3ViY29tcG9uZW50cyBvZiBhIG1hdGNoIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBjb21wb25lbnQgY29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgb25lLXRpbWUgcGFydHkgY29sb3JzIGZvciBtYXRjaFxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IFsxLCAyLCAzLCA0LCA1XTsgLy9BcnJheSBvZiBjb2xvcnMgdG8gdXNlIGZvciBwYXJ0eSBhdCBpbmRleCA9IHBhcnR5SW5kZXggLSAxXHJcbiAgICAgICAgICAgIEhvdHN0YXR1cy51dGlsaXR5LnNodWZmbGUocGFydGllc0NvbG9ycyk7XHJcblxyXG4gICAgICAgICAgICAvL0xvZyBtYXRjaCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGZ1bGxHZW5lcmF0ZWQ6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaGFzIGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgICAgICAgICAgZnVsbERpc3BsYXk6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbWF0Y2hQbGF5ZXI6IG1hdGNoLnBsYXllci5pZCwgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWVzQ29sb3JzOiBwYXJ0aWVzQ29sb3JzIC8vQ29sb3JzIHRvIHVzZSBmb3IgdGhlIHBhcnR5IGluZGV4ZXNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vU3ViY29tcG9uZW50c1xyXG4gICAgICAgICAgICBzZWxmLmdlbmVyYXRlTWF0Y2hXaWRnZXQobWF0Y2gpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIHNtYWxsIG1hdGNoIGJhciB3aXRoIHNpbXBsZSBpbmZvXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggV2lkZ2V0IENvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbWF0Y2guZGF0ZTtcclxuICAgICAgICAgICAgbGV0IHJlbGF0aXZlX2RhdGUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRSZWxhdGl2ZVRpbWUodGltZXN0YW1wKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUodGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaF90aW1lID0gSG90c3RhdHVzLmRhdGUuZ2V0TWludXRlU2Vjb25kVGltZShtYXRjaC5tYXRjaF9sZW5ndGgpO1xyXG4gICAgICAgICAgICBsZXQgdmljdG9yeVRleHQgPSAobWF0Y2gucGxheWVyLndvbikgPyAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtd29uXCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1sb3N0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBtYXRjaC5wbGF5ZXIubWVkYWw7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgbm9tZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLW1lZGFsLWNvbnRhaW5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tc3ctc3AtbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXJzXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXRlYW0nICsgdCArICdcIj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LXNtIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktc20gcm0tcGFydHktc20tY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJzxhIGNsYXNzPVwiJytzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgcGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9zcGFuPicgKyBwYXJ0eSArIHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxMikgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXRcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWxlZnRwYW5lICcgKyBzZWxmLmNvbG9yX01hdGNoV29uTG9zdChtYXRjaC5wbGF5ZXIud29uKSArICdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgbWF0Y2gubWFwX2ltYWdlICsgJyk7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZS10ZXh0XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1hdGNoLm1hcCArICdcIj4nICsgbWF0Y2guZ2FtZVR5cGUgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1kYXRlXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGRhdGUgKyAnXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1kYXRlLXRleHRcIj4nICsgcmVsYXRpdmVfZGF0ZSArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC12aWN0b3J5XCI+JyArIHZpY3RvcnlUZXh0ICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1tYXRjaGxlbmd0aFwiPicgKyBtYXRjaF90aW1lICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaGVyb3BhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxpbWcgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBybS1zdy1ocC1wb3J0cmFpdFwiIHNyYz1cIicgKyBtYXRjaC5wbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1zdGF0c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3AtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtdGV4dFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBtYXRjaC5wbGF5ZXIua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIG1hdGNoLnBsYXllci5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBtYXRjaC5wbGF5ZXIuYXNzaXN0cyArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGFcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBtYXRjaC5wbGF5ZXIua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXRhbGVudHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXRwLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXBsYXllcnNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXBwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjbGljayBsaXN0ZW5lcnMgZm9yIGluc3BlY3QgcGFuZVxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUGFuZShtYXRjaC5pZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBmdWxsIG1hdGNoIHBhbmUgdGhhdCBsb2FkcyB3aGVuIGEgbWF0Y2ggd2lkZ2V0IGlzIGNsaWNrZWQgZm9yIGEgZGV0YWlsZWQgdmlldywgaWYgaXQncyBhbHJlYWR5IGxvYWRlZCwgdG9nZ2xlIGl0cyBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNobWFuID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXTtcclxuICAgICAgICAgICAgICAgIG1hdGNobWFuLmZ1bGxEaXNwbGF5ID0gIW1hdGNobWFuLmZ1bGxEaXNwbGF5O1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2htYW4uZnVsbERpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZURvd24oMjUwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlVXAoMjUwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgZnVsbCBtYXRjaCBwYW5lXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2hpZCkuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLScgKyBtYXRjaGlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9hZCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5sb2FkTWF0Y2gobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9nIGFzIGdlbmVyYXRlZCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93czogZnVuY3Rpb24obWF0Y2hpZCwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgZnVsbG1hdGNoX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0ZWFtc1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMF07IC8vQ291bnRzIGluZGV4IG9mIHBhcnR5IG1lbWJlciwgZm9yIHVzZSB3aXRoIGNyZWF0aW5nIGNvbm5lY3RvcnMsIHVwIHRvIDUgcGFydGllcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgIGZ1bGxtYXRjaF9jb250YWluZXIuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQgKydcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZWFtX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UZWFtIFJvdyBIZWFkZXJcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIodGVhbV9jb250YWluZXIsIHRlYW0sIG1hdGNoLndpbm5lciA9PT0gdCwgbWF0Y2guaGFzQmFucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggcGxheWVycyBmb3IgdGVhbVxyXG4gICAgICAgICAgICAgICAgbGV0IHAgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUGxheWVyIFJvd1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsbWF0Y2hSb3cobWF0Y2hpZCwgdGVhbV9jb250YWluZXIsIHBsYXllciwgdGVhbS5jb2xvciwgbWF0Y2guc3RhdHMsIHAgJSAyLCBwYXJ0aWVzQ291bnRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXI6IGZ1bmN0aW9uKGNvbnRhaW5lciwgdGVhbSwgd2lubmVyLCBoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vVmljdG9yeVxyXG4gICAgICAgICAgICBsZXQgdmljdG9yeSA9ICh3aW5uZXIpID8gKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnlcIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLWRlZmVhdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQmFuc1xyXG4gICAgICAgICAgICBsZXQgYmFucyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGFzQmFucykge1xyXG4gICAgICAgICAgICAgICAgYmFucyArPSAnQmFuczogJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJhbiBvZiB0ZWFtLmJhbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYW5zICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgYmFuLm5hbWUgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXJoLWJhblwiIHNyYz1cIicrIGJhbi5pbWFnZSArJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93aGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB2aWN0b3J5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBMZXZlbCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbGV2ZWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLmxldmVsICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vQmFucyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtYmFucy1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIGJhbnMgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWtkYS1jb250YWluZXJcIj5LREE8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vU3RhdGlzdGljcyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtc3RhdGlzdGljcy1jb250YWluZXJcIj5QZXJmb3JtYW5jZTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NbXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLW1tci1jb250YWluZXJcIj5NTVI6IDxzcGFuIGNsYXNzPVwicm0tZm0tcmgtbW1yXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLm1tci5vbGQucmF0aW5nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxtYXRjaFJvdzogZnVuY3Rpb24obWF0Y2hpZCwgY29udGFpbmVyLCBwbGF5ZXIsIHRlYW1Db2xvciwgbWF0Y2hTdGF0cywgb2RkRXZlbiwgcGFydGllc0NvdW50ZXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBwbGF5ZXJcclxuICAgICAgICAgICAgbGV0IG1hdGNoUGxheWVySWQgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLm1hdGNoUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllciBuYW1lXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJuYW1lID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoUGxheWVySWQpIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgcm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lICcrIHNpbGVuY2UocGxheWVyLnNpbGVuY2VkKSArJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVybmFtZSArPSBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTQpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBwbGF5ZXIubWVkYWw7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtaW5uZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLWZtLXItbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfJysgdGVhbUNvbG9yICsnLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tZm0tci10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tci10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3RhdHNcclxuICAgICAgICAgICAgbGV0IHN0YXRzID0gcGxheWVyLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRfdG9vbHRpcCA9IGZ1bmN0aW9uICh2YWwsIGRlc2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyc8YnI+JysgZGVzYztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0cyA9IFtcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVyb19kYW1hZ2VcIiwgY2xhc3M6IFwiaGVyb2RhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZXJvIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJzaWVnZV9kYW1hZ2VcIiwgY2xhc3M6IFwic2llZ2VkYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnU2llZ2UgRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcIm1lcmNfY2FtcHNcIiwgY2xhc3M6IFwibWVyY2NhbXBzXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ01lcmMgQ2FtcHMgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVhbGluZ1wiLCBjbGFzczogXCJoZWFsaW5nXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlYWxpbmcnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZGFtYWdlX3Rha2VuXCIsIGNsYXNzOiBcImRhbWFnZXRha2VuXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0RhbWFnZSBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJleHBfY29udHJpYlwiLCBjbGFzczogXCJleHBjb250cmliXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0V4cGVyaWVuY2UgQ29udHJpYnV0aW9uJ31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoc3RhdCBvZiByb3dzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IG1hdGNoU3RhdHNbc3RhdC5rZXldW1wibWF4XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50T25SYW5nZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRPblJhbmdlID0gKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIC8gKG1heCAqIDEuMDApKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQud2lkdGggPSBwZXJjZW50T25SYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlID0gc3RhdHNbc3RhdC5rZXldO1xyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSBzdGF0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9ICc8c3BhbiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyLW5vbmVcIj4nICsgc3RhdC52YWx1ZSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnRvb2x0aXAgPSByb3dzdGF0X3Rvb2x0aXAoc3RhdC52YWx1ZSwgc3RhdC50b29sdGlwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0Lmh0bWwgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHN0YXQudG9vbHRpcCArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1yb3dcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy0nKyBzdGF0LmNsYXNzICsnIHJtLWZtLXItc3RhdHMtYmFyXCIgc3R5bGU9XCJ3aWR0aDogJysgc3RhdC53aWR0aCArJyVcIj48L2Rpdj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXJcIj4nKyBzdGF0LnZhbHVlRGlzcGxheSArJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01NUlxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFUeXBlID0gXCJuZWdcIjtcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhUHJlZml4ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5tbXIuZGVsdGEgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFUeXBlID0gXCJwb3NcIjtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhUHJlZml4ID0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhID0gcGxheWVyLm1tci5yYW5rICsnICcrIHBsYXllci5tbXIudGllciArJyAoPHNwYW4gY2xhc3M9XFwncm0tZm0tci1tbXItZGVsdGEtJysgbW1yRGVsdGFUeXBlICsnXFwnPicrIG1tckRlbHRhUHJlZml4ICsgcGxheWVyLm1tci5kZWx0YSArJzwvc3Bhbj4pJztcclxuXHJcbiAgICAgICAgICAgIC8vUGFydHlcclxuICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LW1kIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1tZCBybS1wYXJ0eS1tZC1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQnVpbGQgaHRtbFxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93IHJtLWZtLXJvdy0nKyBvZGRFdmVuICsnXCI+JyArXHJcbiAgICAgICAgICAgIC8vUGFydHkgU3RyaXBlXHJcbiAgICAgICAgICAgIHBhcnR5ICtcclxuICAgICAgICAgICAgLy9IZXJvIEltYWdlIENvbnRhaW5lciAoV2l0aCBIZXJvIExldmVsKVxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2xldmVsXCI+JysgcGxheWVyLmhlcm9fbGV2ZWwgKyc8L2Rpdj48aW1nIGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2VcIiBzcmM9XCInKyBwbGF5ZXIuaW1hZ2VfaGVybyArJ1wiPjwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1BsYXllciBOYW1lIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcGxheWVybmFtZSArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NZWRhbCBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vVGFsZW50cyBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudHMtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtaW5kaXZcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPidcclxuICAgICAgICAgICAgKyBzdGF0cy5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgc3RhdHMuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgc3RhdHMuYXNzaXN0cyArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGFcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIHN0YXRzLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIE9mZmVuc2UgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1vZmZlbnNlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1swXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMV0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzJdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgVXRpbGl0eSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXV0aWxpdHktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzNdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s0XS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNV0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NTVIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItdG9vbHRpcC1hcmVhXCIgc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInKyBtbXJEZWx0YSArJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1tclwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL3JhbmtlZF9wbGF5ZXJfaWNvbl8nICsgcGxheWVyLm1tci5yYW5rICsnLnBuZ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1udW1iZXJcIj4nKyBwbGF5ZXIubW1yLnRpZXIgKyc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVyaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXJcIj5Mb2FkIE1vcmUgTWF0Y2hlcy4uLjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQobG9hZGVyaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0Lmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTF4IGZhLWZ3XCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzLmxvYWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yX01hdGNoV29uTG9zdDogZnVuY3Rpb24od29uKSB7XHJcbiAgICAgICAgICAgIGlmICh3b24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctd29uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctbG9zdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbGVudHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==