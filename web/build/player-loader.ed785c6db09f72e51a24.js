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
        var data_mmr = data.mmr;
        var data_topmaps = data.topmaps;
        var data_matches = data.matches;

        //Enable Processing Indicator
        self.internal.loading = true;

        //$('#playerloader-container').prepend('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //-- Initial Matches First Load
        $('#pl-recentmatches-loader').append('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_mmr = json.mmr;

            /*
             * Empty dynamically filled containers, reset all subajax objects
             */
            data_mmr.empty();
            ajax_matches.reset();
            ajax_topheroes.reset();
            data_topmaps.empty();
            ajax_parties.reset();

            /*
             * Heroloader Container
             */
            $('.initial-load').removeClass('initial-load');

            /*
             * MMR
             */
            data_mmr.generateMMRContainer();
            data_mmr.generateMMRBadges(json_mmr);

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
        var data_topmaps = data.topmaps;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Top Heroes Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_heroes = json.heroes;
            var json_maps = json.maps;

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

            /*
             * Process Top Maps
             */
            if (json_maps.length > 0) {
                data_topmaps.generateTopMapsContainer();

                data_topmaps.generateTopMapsTable();

                var topMapsTable = data_topmaps.getTopMapsTableConfig(json_maps.length);

                topMapsTable.data = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = json_maps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var map = _step2.value;

                        topMapsTable.data.push(data_topmaps.generateTopMapsTableData(map));
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

                data_topmaps.initTopMapsTable(topMapsTable);
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
                data_parties.generatePartiesContainer(json.last_updated);

                data_parties.generatePartiesTable();

                var partiesTable = data_parties.getPartiesTableConfig(json_parties.length);

                partiesTable.data = [];
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = json_parties[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var party = _step3.value;

                        partiesTable.data.push(data_parties.generatePartiesTableData(party));
                    }
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
        limit: 10 //Matches limit (Initial limit is set by initial loader)
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
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = json_matches[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var match = _step4.value;

                        if (!data_matches.isMatchGenerated(match.id)) {
                            data_matches.generateMatch(match);
                        }
                    }

                    //Set displayMatchLoader if we got as many matches as we asked for
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
    mmr: {
        empty: function empty() {
            $('#pl-mmr-container').remove();
        },
        generateMMRContainer: function generateMMRContainer() {
            var html = '<div id="pl-mmr-container" class="pl-mmr-container hotstatus-subcontainer margin-bottom-spacer-1 padding-left-0 padding-right-0">' + '</div>';

            $('#player-leftpane-container').append(html);
        },
        generateMMRBadges: function generateMMRBadges(mmrs) {
            self = PlayerLoader.data.mmr;

            var container = $('#pl-mmr-container');

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = mmrs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var mmr = _step5.value;

                    self.generateMMRBadge(container, mmr);
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
        },
        generateMMRBadge: function generateMMRBadge(container, mmr) {
            var self = PlayerLoader.data.mmr;

            var mmrGameTypeImage = '<img class="pl-mmr-badge-gameTypeImage" src="' + image_bpath + 'ui/gameType_icon_' + mmr.gameType_image + '.png">';
            var mmrimg = '<img class="pl-mmr-badge-image" src="' + image_bpath + 'ui/ranked_player_icon_' + mmr.rank + '.png">';
            var mmrtier = '<div class="pl-mmr-badge-tier">' + mmr.tier + '</div>';

            var html = '<div class="pl-mmr-badge">' +
            //MMR GameType Image
            '<div class="pl-mmr-badge-gameTypeImage-container">' + mmrGameTypeImage + '</div>' +
            //MMR Image
            '<div class="pl-mmr-badge-image-container">' + mmrimg + '</div>' +
            //MMR Tier
            '<div class="pl-mmr-badge-tier-container">' + mmrtier + '</div>' +
            //MMR Tooltip Area
            '<div class="pl-mmr-badge-tooltip-area" data-toggle="tooltip" data-html="true" title="' + self.generateMMRTooltip(mmr) + '"></div>' + '</div>';

            container.append(html);
        },
        generateMMRTooltip: function generateMMRTooltip(mmr) {
            return '<div>' + mmr.gameType + '</div><div>' + mmr.rating + '</div><div>' + mmr.rank + ' ' + mmr.tier + '</div>';
        }
    },
    topheroes: {
        internal: {
            heroLimit: 5 //How many heroes should be displayed at a time
        },
        empty: function empty() {
            $('#pl-topheroes-container').remove();
        },
        generateTopHeroesContainer: function generateTopHeroesContainer() {
            //let lastupdated_badge = '<div class="fa pl-lastupdated-badge">&#xf05a</div>';

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
            datatable.dom = "<'row'<'col-sm-12'tr>><'pl-leftpane-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
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
    topmaps: {
        internal: {
            mapLimit: 6 //How many top maps should be displayed at a time
        },
        empty: function empty() {
            $('#pl-topmaps-container').remove();
        },
        generateTopMapsContainer: function generateTopMapsContainer() {
            var html = '<div id="pl-topmaps-container" class="pl-topmaps-container hotstatus-subcontainer padding-left-0 padding-right-0">' + '<div class="pl-parties-title">Maps</div>' + '</div>';

            $('#player-leftpane-mid-container').append(html);
        },
        generateTopMapsTableData: function generateTopMapsTableData(map) {
            /*
             * Party
             */
            var mapimage = '<div class="pl-topmaps-mapbg" style="background-image: url(' + image_bpath + 'ui/map_icon_' + map.image + '.png);"></div>';

            var mapname = '<div class="pl-topmaps-mapname">' + map.name + '</div>';

            var mapinner = '<div class="pl-topmaps-mappane">' + mapimage + mapname + '</div>';

            /*
             * Winrate / Played
             */
            //Good winrate
            var goodwinrate = 'pl-th-wr-winrate';
            if (map.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad';
            }
            if (map.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible';
            }
            if (map.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good';
            }
            if (map.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great';
            }

            var winratefield = '<div class="pl-th-winratepane">' +
            //Winrate
            '<div class="' + goodwinrate + '"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' + map.winrate + '%' + '</span></div>' +
            //Played
            '<div class="pl-th-wr-played">' + map.played + ' played' + '</div>' + '</div>';

            return [mapinner, winratefield];
        },
        getTopMapsTableConfig: function getTopMapsTableConfig(rowLength) {
            var self = PlayerLoader.data.topmaps;

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
            datatable.pageLength = self.internal.mapLimit; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            //datatable.paging = false;
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>><'pl-leftpane-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function () {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        generateTopMapsTable: function generateTopMapsTable() {
            $('#pl-topmaps-container').append('<table id="pl-topmaps-table" class="pl-topmaps-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class="d-none"></thead></table>');
        },
        initTopMapsTable: function initTopMapsTable(dataTableConfig) {
            $('#pl-topmaps-table').DataTable(dataTableConfig);
        }
    },
    parties: {
        internal: {
            partyLimit: 4 //How many parties should be displayed at a time
        },
        empty: function empty() {
            $('#pl-parties-container').remove();
        },
        generatePartiesContainer: function generatePartiesContainer(last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            var html = '<div id="pl-parties-container" class="pl-parties-container hotstatus-subcontainer padding-left-0 padding-right-0">' + '<div class="pl-parties-title"><span style="cursor:help;" class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Last Updated: ' + date + '">Parties</span></div>' + '</div>';

            $('#player-leftpane-bot-container').append(html);
        },
        generatePartiesTableData: function generatePartiesTableData(party) {
            /*
             * Party
             */
            var partyinner = '';
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = party.players[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var player = _step6.value;

                    partyinner += '<div class="pl-p-p-player pl-p-p-player-' + party.players.length + '"><a class="pl-p-p-playername" href="' + Routing.generate("player", { id: player.id }) + '" target="_blank">' + player.name + '</a></div>';
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

            var partyfield = '<div class="pl-parties-partypane">' + partyinner + '</div>';

            /*
             * Winrate / Played
             */
            //Good winrate
            var goodwinrate = 'pl-th-wr-winrate';
            if (party.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad';
            }
            if (party.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible';
            }
            if (party.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good';
            }
            if (party.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great';
            }

            var winratefield = '<div class="pl-th-winratepane">' +
            //Winrate
            '<div class="' + goodwinrate + '"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' + party.winrate + '%' + '</span></div>' +
            //Played
            '<div class="pl-th-wr-played">' + party.played + ' played' + '</div>' + '</div>';

            return [partyfield, winratefield];
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
            //datatable.paging = false;
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>><'pl-leftpane-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
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
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = match.teams[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var team = _step7.value;

                    playershtml += '<div class="rm-sw-pp-team' + t + '">';

                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = team.players[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var player = _step8.value;

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

                    playershtml += '</div>';

                    t++;
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
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = match.teams[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var team = _step9.value;

                    //Team Container
                    fullmatch_container.append('<div id="recentmatch-fullmatch-team-container-' + matchid + '"></div>');
                    var team_container = $('#recentmatch-fullmatch-team-container-' + matchid);

                    //Team Row Header
                    self.generateFullMatchRowHeader(team_container, team, match.winner === t, match.hasBans);

                    //Loop through players for team
                    var p = 0;
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = team.players[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var player = _step10.value;

                            //Player Row
                            self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats, p % 2, partiesCounter);

                            if (player.party > 0) {
                                var partyOffset = player.party - 1;
                                partiesCounter[partyOffset]++;
                            }

                            p++;
                        }
                    } catch (err) {
                        _didIteratorError10 = true;
                        _iteratorError10 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                _iterator10.return();
                            }
                        } finally {
                            if (_didIteratorError10) {
                                throw _iteratorError10;
                            }
                        }
                    }

                    t++;
                }
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
        },
        generateFullMatchRowHeader: function generateFullMatchRowHeader(container, team, winner, hasBans) {
            var self = PlayerLoader.data.matches;

            //Victory
            var victory = winner ? '<span class="rm-fm-rh-victory">Victory</span>' : '<span class="rm-fm-rh-defeat">Defeat</span>';

            //Bans
            var bans = '';
            if (hasBans) {
                bans += 'Bans: ';
                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                    for (var _iterator11 = team.bans[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                        var ban = _step11.value;

                        bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="' + ban.image + '"></span>';
                    }
                } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }
                    } finally {
                        if (_didIteratorError11) {
                            throw _iteratorError11;
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

            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = rowstats[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    stat = _step12.value;

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
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                        _iterator12.return();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNzdhNWFjMDQ0N2Q3ODZmZGYzYmQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJqc29uX21hcHMiLCJtYXBzIiwiZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXIiLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlIiwidG9wSGVyb2VzVGFibGUiLCJnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyIsImhlcm8iLCJwdXNoIiwiZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEiLCJpbml0VG9wSGVyb2VzVGFibGUiLCJnZW5lcmF0ZVRvcE1hcHNDb250YWluZXIiLCJnZW5lcmF0ZVRvcE1hcHNUYWJsZSIsInRvcE1hcHNUYWJsZSIsImdldFRvcE1hcHNUYWJsZUNvbmZpZyIsIm1hcCIsImdlbmVyYXRlVG9wTWFwc1RhYmxlRGF0YSIsImluaXRUb3BNYXBzVGFibGUiLCJkYXRhX3BhcnRpZXMiLCJqc29uX3BhcnRpZXMiLCJnZW5lcmF0ZVBhcnRpZXNDb250YWluZXIiLCJsYXN0X3VwZGF0ZWQiLCJnZW5lcmF0ZVBhcnRpZXNUYWJsZSIsInBhcnRpZXNUYWJsZSIsImdldFBhcnRpZXNUYWJsZUNvbmZpZyIsInBhcnR5IiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhIiwiaW5pdFBhcnRpZXNUYWJsZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImlkIiwiZ2VuZXJhdGVNYXRjaCIsImdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJodG1sIiwibW1ycyIsImNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2UiLCJtbXJHYW1lVHlwZUltYWdlIiwiaW1hZ2VfYnBhdGgiLCJnYW1lVHlwZV9pbWFnZSIsIm1tcmltZyIsInJhbmsiLCJtbXJ0aWVyIiwidGllciIsImdlbmVyYXRlTU1SVG9vbHRpcCIsImdhbWVUeXBlIiwicmF0aW5nIiwiaGVyb0xpbWl0IiwiaGVyb2ZpZWxkIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwibmFtZSIsImdvb2RrZGEiLCJrZGFfcmF3Iiwia2RhIiwia2RhX2F2ZyIsImtkYWluZGl2Iiwia2lsbHNfYXZnIiwiZGVhdGhzX2F2ZyIsImFzc2lzdHNfYXZnIiwia2RhZmllbGQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVfcmF3Iiwid2lucmF0ZWZpZWxkIiwid2lucmF0ZSIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsIm1hdGNoTG9hZGVyR2VuZXJhdGVkIiwibWF0Y2hNYW5pZmVzdCIsImhhc093blByb3BlcnR5IiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJtZWRhbGh0bWwiLCJub21lZGFsaHRtbCIsImV4aXN0cyIsImRlc2Nfc2ltcGxlIiwidGFsZW50c2h0bWwiLCJpIiwidGFsZW50cyIsInRhbGVudCIsInRhbGVudHRvb2x0aXAiLCJwbGF5ZXJzaHRtbCIsInBhcnRpZXNDb3VudGVyIiwidCIsInRlYW1zIiwidGVhbSIsInBhcnR5T2Zmc2V0IiwicGFydHlDb2xvciIsInNwZWNpYWwiLCJzaWxlbmNlZCIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsImtpbGxzIiwiZGVhdGhzIiwiYXNzaXN0cyIsImNsaWNrIiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwibWF0Y2htYW4iLCJzZWxlY3RvciIsInNsaWRlRG93biIsInNsaWRlVXAiLCJmdWxsbWF0Y2hfY29udGFpbmVyIiwidGVhbV9jb250YWluZXIiLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlciIsIndpbm5lciIsImhhc0JhbnMiLCJwIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsInN0YXRzIiwidmljdG9yeSIsImJhbnMiLCJiYW4iLCJsZXZlbCIsIm9sZCIsInRlYW1Db2xvciIsIm1hdGNoU3RhdHMiLCJvZGRFdmVuIiwibWF0Y2hQbGF5ZXJJZCIsInBsYXllcm5hbWUiLCJyb3dzdGF0X3Rvb2x0aXAiLCJkZXNjIiwicm93c3RhdHMiLCJrZXkiLCJjbGFzcyIsIndpZHRoIiwidmFsdWUiLCJ2YWx1ZURpc3BsYXkiLCJzdGF0IiwibWF4IiwicGVyY2VudE9uUmFuZ2UiLCJtbXJEZWx0YVR5cGUiLCJtbXJEZWx0YVByZWZpeCIsImRlbHRhIiwibW1yRGVsdGEiLCJoZXJvX2xldmVsIiwibG9hZGVyaHRtbCIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGVBQWUsRUFBbkI7O0FBRUE7OztBQUdBQSxhQUFhQyxJQUFiLEdBQW9CO0FBQ2hCOzs7QUFHQUMsV0FBTyxlQUFTQyxZQUFULEVBQXVCQyxJQUF2QixFQUE2QjtBQUNoQ0MsbUJBQVdELElBQVgsRUFBaUJELFlBQWpCO0FBQ0g7QUFOZSxDQUFwQjs7QUFTQTs7O0FBR0FILGFBQWFDLElBQWIsQ0FBa0JLLE1BQWxCLEdBQTJCO0FBQ3ZCQyxjQUFVO0FBQ05DLGlCQUFTLEtBREgsRUFDVTtBQUNoQkMsYUFBSyxFQUZDLEVBRUc7QUFDVEMsaUJBQVMsTUFISCxDQUdXO0FBSFgsS0FEYTtBQU12Qjs7OztBQUlBRCxTQUFLLGVBQXFCO0FBQUEsWUFBWkEsSUFBWSx1RUFBTixJQUFNOztBQUN0QixZQUFJRSxPQUFPWCxhQUFhQyxJQUFiLENBQWtCSyxNQUE3Qjs7QUFFQSxZQUFJ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QyxJQUFiLENBQWtCSyxNQUFuQzs7QUFFQTtBQUNBUSxvQkFBZ0I2USxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0USxXQUF4QztBQUNBcVEsZUFBV3ZRLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBZ0IsTUFBRSx3QkFBRixFQUE0QnVQLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckQvUSx3QkFBZ0I2USxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0USxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQWdCLE1BQUUsR0FBRixFQUFPdVAsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q0osbUJBQVd2USxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLmVkNzg1YzZkYjA5ZjcyZTUxYTI0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNzdhNWFjMDQ0N2Q3ODZmZGYzYmQiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcbiAgICAgICAgbGV0IGFqYXhfbWF0Y2hlcyA9IGFqYXgubWF0Y2hlcztcclxuICAgICAgICBsZXQgYWpheF90b3BoZXJvZXMgPSBhamF4LnRvcGhlcm9lcztcclxuICAgICAgICBsZXQgYWpheF9wYXJ0aWVzID0gYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21tciA9IGRhdGEubW1yO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcG1hcHMgPSBkYXRhLnRvcG1hcHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8tLSBJbml0aWFsIE1hdGNoZXMgRmlyc3QgTG9hZFxyXG4gICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWxvYWRlcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtM3ggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21tciA9IGpzb24ubW1yO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21tci5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X3RvcGhlcm9lcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X3BhcnRpZXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogTU1SXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbW1yLmdlbmVyYXRlTU1SQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21tci5nZW5lcmF0ZU1NUkJhZGdlcyhqc29uX21tcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgbWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMuaW50ZXJuYWwubGltaXQgPSBqc29uLmxpbWl0cy5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9hZCBpbml0aWFsIG1hdGNoIHNldFxyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBUb3AgSGVyb2VzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXhfdG9waGVyb2VzLmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBQYXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXhfcGFydGllcy5sb2FkKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBsYXllcmxvYWRlci1wcm9jZXNzaW5nJykuZmFkZUluKCkuZGVsYXkoNzUwKS5xdWV1ZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfdG9waGVyb2VzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFRvcCBIZXJvZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV90b3BoZXJvZXMgPSBkYXRhLnRvcGhlcm9lcztcclxuICAgICAgICBsZXQgZGF0YV90b3BtYXBzID0gZGF0YS50b3BtYXBzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gVG9wIEhlcm9lcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9lcyA9IGpzb24uaGVyb2VzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWFwcyA9IGpzb24ubWFwcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBUb3AgSGVyb2VzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX2hlcm9lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wSGVyb2VzVGFibGUgPSBkYXRhX3RvcGhlcm9lcy5nZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyhqc29uX2hlcm9lcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhLnB1c2goZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuaW5pdFRvcEhlcm9lc1RhYmxlKHRvcEhlcm9lc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIE1hcHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWFwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcE1hcHNUYWJsZSA9IGRhdGFfdG9wbWFwcy5nZXRUb3BNYXBzVGFibGVDb25maWcoanNvbl9tYXBzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvcE1hcHNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFwIG9mIGpzb25fbWFwcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEobWFwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuaW5pdFRvcE1hcHNUYWJsZSh0b3BNYXBzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9wYXJ0aWVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFBhcnRpZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfcGFydGllcyA9IGRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFBhcnRpZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9wYXJ0aWVzID0ganNvbi5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fcGFydGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc0NvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydGllc1RhYmxlID0gZGF0YV9wYXJ0aWVzLmdldFBhcnRpZXNUYWJsZUNvbmZpZyhqc29uX3BhcnRpZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0eSBvZiBqc29uX3BhcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEucHVzaChkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhKHBhcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuaW5pdFBhcnRpZXNUYWJsZShwYXJ0aWVzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogMTAsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVNYXRjaFVybDogZnVuY3Rpb24obWF0Y2hfaWQpIHtcclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfbWF0Y2hcIiwge1xyXG4gICAgICAgICAgICBtYXRjaGlkOiBtYXRjaF9pZCxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMge2xpbWl0fSByZWNlbnQgbWF0Y2hlcyBvZmZzZXQgYnkge29mZnNldH0gZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBsZXQgZGlzcGxheU1hdGNoTG9hZGVyID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX29mZnNldHMgPSBqc29uLm9mZnNldHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9saW1pdHMgPSBqc29uLmxpbWl0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoZXMgPSBqc29uLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBuZXcgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSBqc29uX29mZnNldHMubWF0Y2hlcyArIHNlbGYuaW50ZXJuYWwubGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hdGNoIG9mIGpzb25fbWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFfbWF0Y2hlcy5pc01hdGNoR2VuZXJhdGVkKG1hdGNoLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5pbnRlcm5hbC5vZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9SZW1vdmUgaW5pdGlhbCBsb2FkXHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgdGhlIG1hdGNoIG9mIGdpdmVuIGlkIHRvIGJlIGRpc3BsYXllZCB1bmRlciBtYXRjaCBzaW1wbGV3aWRnZXRcclxuICAgICAqL1xyXG4gICAgbG9hZE1hdGNoOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSBzZWxmLmdlbmVyYXRlTWF0Y2hVcmwobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmdWxsbWF0Y2gtcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoID0ganNvbi5tYXRjaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzKG1hdGNoaWQsIGpzb25fbWF0Y2gpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZnVsbG1hdGNoLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtbXI6IHtcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1tbXItY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1tbXItY29udGFpbmVyXCIgY2xhc3M9XCJwbC1tbXItY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgbWFyZ2luLWJvdHRvbS1zcGFjZXItMSBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkJhZGdlczogZnVuY3Rpb24obW1ycykge1xyXG4gICAgICAgICAgICBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubW1yO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoJyNwbC1tbXItY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBtbXIgb2YgbW1ycykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1NUkJhZGdlKGNvbnRhaW5lciwgbW1yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJCYWRnZTogZnVuY3Rpb24oY29udGFpbmVyLCBtbXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tbXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgbW1yR2FtZVR5cGVJbWFnZSA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWdhbWVUeXBlSW1hZ2VcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9nYW1lVHlwZV9pY29uXycgKyBtbXIuZ2FtZVR5cGVfaW1hZ2UgKycucG5nXCI+JztcclxuICAgICAgICAgICAgbGV0IG1tcmltZyA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBtbXIucmFuayArJy5wbmdcIj4nO1xyXG4gICAgICAgICAgICBsZXQgbW1ydGllciA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXJcIj4nKyBtbXIudGllciArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBHYW1lVHlwZSBJbWFnZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtZ2FtZVR5cGVJbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tckdhbWVUeXBlSW1hZ2UgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgSW1hZ2VcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1yaW1nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRpZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJ0aWVyICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRvb2x0aXAgQXJlYVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtdG9vbHRpcC1hcmVhXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgc2VsZi5nZW5lcmF0ZU1NUlRvb2x0aXAobW1yKSArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJUb29sdGlwOiBmdW5jdGlvbihtbXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2PicrIG1tci5nYW1lVHlwZSArJzwvZGl2PjxkaXY+JysgbW1yLnJhdGluZyArJzwvZGl2PjxkaXY+JysgbW1yLnJhbmsgKycgJysgbW1yLnRpZXIgKyc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3BoZXJvZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBoZXJvTGltaXQ6IDUsIC8vSG93IG1hbnkgaGVyb2VzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vbGV0IGxhc3R1cGRhdGVkX2JhZGdlID0gJzxkaXYgY2xhc3M9XCJmYSBwbC1sYXN0dXBkYXRlZC1iYWRnZVwiPiYjeGYwNWE8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXRvcGhlcm9lcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBIZXJvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgaGVyb2ZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1oZXJvcGFuZVwiPjxkaXY+PGltZyBjbGFzcz1cInBsLXRoLWhwLWhlcm9pbWFnZVwiIHNyYz1cIicrIGhlcm8uaW1hZ2VfaGVybyArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGEgY2xhc3M9XCJwbC10aC1ocC1oZXJvbmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBoZXJvLm5hbWUgKyc8L2E+PC9kaXY+PC9kaXY+JztcclxuXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBLREFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBrZGEgPSAnPHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIGhlcm8ua2RhX2F2ZyArICc8L3NwYW4+IEtEQSc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhaW5kaXYgPSBoZXJvLmtpbGxzX2F2ZyArICcgLyA8c3BhbiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgaGVyby5kZWF0aHNfYXZnICsgJzwvc3Bhbj4gLyAnICsgaGVyby5hc3Npc3RzX2F2ZztcclxuXHJcbiAgICAgICAgICAgIGxldCBrZGFmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgYWN0dWFsXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1rZGFcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYSArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgaW5kaXZcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWluZGl2XCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPicgK1xyXG4gICAgICAgICAgICAgICAga2RhaW5kaXYgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5oZXJvTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9waGVyb2VzLXRhYmxlXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvcG1hcHM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXBMaW1pdDogNiwgLy9Ib3cgbWFueSB0b3AgbWFwcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BtYXBzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtdG9wbWFwcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPk1hcHM8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1taWQtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhOiBmdW5jdGlvbihtYXApIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBtYXBpbWFnZSA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBiZ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcrIGltYWdlX2JwYXRoICsndWkvbWFwX2ljb25fJysgbWFwLmltYWdlICsnLnBuZyk7XCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXBuYW1lID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcG5hbWVcIj4nKyBtYXAubmFtZSArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWFwaW5uZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwcGFuZVwiPicrIG1hcGltYWdlICsgbWFwbmFtZSArICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW21hcGlubmVyLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wTWFwc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS50b3BtYXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwubWFwTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BtYXBzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9wbWFwcy10YWJsZVwiIGNsYXNzPVwicGwtdG9wbWFwcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUb3BNYXBzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJ0aWVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgcGFydHlMaW1pdDogNCwgLy9Ib3cgbWFueSBwYXJ0aWVzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyOiBmdW5jdGlvbihsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcGFydGllcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJ1wiPlBhcnRpZXM8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtYm90LWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlRGF0YTogZnVuY3Rpb24ocGFydHkpIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWlubmVyID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiBwYXJ0eS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJ0eWlubmVyICs9ICc8ZGl2IGNsYXNzPVwicGwtcC1wLXBsYXllciBwbC1wLXAtcGxheWVyLScrIHBhcnR5LnBsYXllcnMubGVuZ3RoICsnXCI+PGEgY2xhc3M9XCJwbC1wLXAtcGxheWVybmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIHBsYXllci5uYW1lICsnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC1wYXJ0aWVzLXBhcnR5cGFuZVwiPicrIHBhcnR5aW5uZXIgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGFydHkud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwYXJ0eS5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3BhcnR5ZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRQYXJ0aWVzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5wYXJ0eUxpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXBhcnRpZXMtdGFibGVcIiBjbGFzcz1cInBsLXBhcnRpZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0UGFydGllc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsYXllci1yaWdodHBhbmUtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyIGluaXRpYWwtbG9hZCBob3RzdGF0dXMtc3ViY29udGFpbmVyIGhvcml6b250YWwtc2Nyb2xsZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsLW5vcmVjZW50bWF0Y2hlc1wiPk5vIFJlY2VudCBNYXRjaGVzIEZvdW5kLi4uPC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyBhbGwgc3ViY29tcG9uZW50cyBvZiBhIG1hdGNoIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBjb21wb25lbnQgY29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgb25lLXRpbWUgcGFydHkgY29sb3JzIGZvciBtYXRjaFxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IFsxLCAyLCAzLCA0LCA1XTsgLy9BcnJheSBvZiBjb2xvcnMgdG8gdXNlIGZvciBwYXJ0eSBhdCBpbmRleCA9IHBhcnR5SW5kZXggLSAxXHJcbiAgICAgICAgICAgIEhvdHN0YXR1cy51dGlsaXR5LnNodWZmbGUocGFydGllc0NvbG9ycyk7XHJcblxyXG4gICAgICAgICAgICAvL0xvZyBtYXRjaCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGZ1bGxHZW5lcmF0ZWQ6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaGFzIGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgICAgICAgICAgZnVsbERpc3BsYXk6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbWF0Y2hQbGF5ZXI6IG1hdGNoLnBsYXllci5pZCwgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWVzQ29sb3JzOiBwYXJ0aWVzQ29sb3JzIC8vQ29sb3JzIHRvIHVzZSBmb3IgdGhlIHBhcnR5IGluZGV4ZXNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vU3ViY29tcG9uZW50c1xyXG4gICAgICAgICAgICBzZWxmLmdlbmVyYXRlTWF0Y2hXaWRnZXQobWF0Y2gpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIHNtYWxsIG1hdGNoIGJhciB3aXRoIHNpbXBsZSBpbmZvXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggV2lkZ2V0IENvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbWF0Y2guZGF0ZTtcclxuICAgICAgICAgICAgbGV0IHJlbGF0aXZlX2RhdGUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRSZWxhdGl2ZVRpbWUodGltZXN0YW1wKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUodGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaF90aW1lID0gSG90c3RhdHVzLmRhdGUuZ2V0TWludXRlU2Vjb25kVGltZShtYXRjaC5tYXRjaF9sZW5ndGgpO1xyXG4gICAgICAgICAgICBsZXQgdmljdG9yeVRleHQgPSAobWF0Y2gucGxheWVyLndvbikgPyAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtd29uXCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1sb3N0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBtYXRjaC5wbGF5ZXIubWVkYWw7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgbm9tZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLW1lZGFsLWNvbnRhaW5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tc3ctc3AtbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXJzXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXRlYW0nICsgdCArICdcIj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LXNtIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktc20gcm0tcGFydHktc20tY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJzxhIGNsYXNzPVwiJytzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgcGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9zcGFuPicgKyBwYXJ0eSArIHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxMikgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXRcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWxlZnRwYW5lICcgKyBzZWxmLmNvbG9yX01hdGNoV29uTG9zdChtYXRjaC5wbGF5ZXIud29uKSArICdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgbWF0Y2gubWFwX2ltYWdlICsgJyk7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZS10ZXh0XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1hdGNoLm1hcCArICdcIj4nICsgbWF0Y2guZ2FtZVR5cGUgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1kYXRlXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGRhdGUgKyAnXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1kYXRlLXRleHRcIj4nICsgcmVsYXRpdmVfZGF0ZSArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC12aWN0b3J5XCI+JyArIHZpY3RvcnlUZXh0ICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1tYXRjaGxlbmd0aFwiPicgKyBtYXRjaF90aW1lICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaGVyb3BhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxpbWcgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBybS1zdy1ocC1wb3J0cmFpdFwiIHNyYz1cIicgKyBtYXRjaC5wbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1zdGF0c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3AtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtdGV4dFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBtYXRjaC5wbGF5ZXIua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIG1hdGNoLnBsYXllci5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBtYXRjaC5wbGF5ZXIuYXNzaXN0cyArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGFcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBtYXRjaC5wbGF5ZXIua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXRhbGVudHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXRwLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXBsYXllcnNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXBwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjbGljayBsaXN0ZW5lcnMgZm9yIGluc3BlY3QgcGFuZVxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUGFuZShtYXRjaC5pZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBmdWxsIG1hdGNoIHBhbmUgdGhhdCBsb2FkcyB3aGVuIGEgbWF0Y2ggd2lkZ2V0IGlzIGNsaWNrZWQgZm9yIGEgZGV0YWlsZWQgdmlldywgaWYgaXQncyBhbHJlYWR5IGxvYWRlZCwgdG9nZ2xlIGl0cyBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNobWFuID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXTtcclxuICAgICAgICAgICAgICAgIG1hdGNobWFuLmZ1bGxEaXNwbGF5ID0gIW1hdGNobWFuLmZ1bGxEaXNwbGF5O1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2htYW4uZnVsbERpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZURvd24oMjUwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlVXAoMjUwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgZnVsbCBtYXRjaCBwYW5lXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2hpZCkuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLScgKyBtYXRjaGlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9hZCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5sb2FkTWF0Y2gobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9nIGFzIGdlbmVyYXRlZCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93czogZnVuY3Rpb24obWF0Y2hpZCwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgZnVsbG1hdGNoX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0ZWFtc1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMF07IC8vQ291bnRzIGluZGV4IG9mIHBhcnR5IG1lbWJlciwgZm9yIHVzZSB3aXRoIGNyZWF0aW5nIGNvbm5lY3RvcnMsIHVwIHRvIDUgcGFydGllcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgIGZ1bGxtYXRjaF9jb250YWluZXIuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQgKydcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZWFtX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UZWFtIFJvdyBIZWFkZXJcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIodGVhbV9jb250YWluZXIsIHRlYW0sIG1hdGNoLndpbm5lciA9PT0gdCwgbWF0Y2guaGFzQmFucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggcGxheWVycyBmb3IgdGVhbVxyXG4gICAgICAgICAgICAgICAgbGV0IHAgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUGxheWVyIFJvd1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsbWF0Y2hSb3cobWF0Y2hpZCwgdGVhbV9jb250YWluZXIsIHBsYXllciwgdGVhbS5jb2xvciwgbWF0Y2guc3RhdHMsIHAgJSAyLCBwYXJ0aWVzQ291bnRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXI6IGZ1bmN0aW9uKGNvbnRhaW5lciwgdGVhbSwgd2lubmVyLCBoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vVmljdG9yeVxyXG4gICAgICAgICAgICBsZXQgdmljdG9yeSA9ICh3aW5uZXIpID8gKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnlcIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLWRlZmVhdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQmFuc1xyXG4gICAgICAgICAgICBsZXQgYmFucyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGFzQmFucykge1xyXG4gICAgICAgICAgICAgICAgYmFucyArPSAnQmFuczogJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJhbiBvZiB0ZWFtLmJhbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYW5zICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgYmFuLm5hbWUgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXJoLWJhblwiIHNyYz1cIicrIGJhbi5pbWFnZSArJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93aGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB2aWN0b3J5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBMZXZlbCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbGV2ZWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLmxldmVsICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vQmFucyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtYmFucy1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIGJhbnMgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWtkYS1jb250YWluZXJcIj5LREE8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vU3RhdGlzdGljcyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtc3RhdGlzdGljcy1jb250YWluZXJcIj5QZXJmb3JtYW5jZTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NbXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLW1tci1jb250YWluZXJcIj5NTVI6IDxzcGFuIGNsYXNzPVwicm0tZm0tcmgtbW1yXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLm1tci5vbGQucmF0aW5nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxtYXRjaFJvdzogZnVuY3Rpb24obWF0Y2hpZCwgY29udGFpbmVyLCBwbGF5ZXIsIHRlYW1Db2xvciwgbWF0Y2hTdGF0cywgb2RkRXZlbiwgcGFydGllc0NvdW50ZXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBwbGF5ZXJcclxuICAgICAgICAgICAgbGV0IG1hdGNoUGxheWVySWQgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLm1hdGNoUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllciBuYW1lXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJuYW1lID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoUGxheWVySWQpIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgcm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lICcrIHNpbGVuY2UocGxheWVyLnNpbGVuY2VkKSArJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVybmFtZSArPSBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTQpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBwbGF5ZXIubWVkYWw7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtaW5uZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLWZtLXItbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfJysgdGVhbUNvbG9yICsnLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tZm0tci10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tci10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3RhdHNcclxuICAgICAgICAgICAgbGV0IHN0YXRzID0gcGxheWVyLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRfdG9vbHRpcCA9IGZ1bmN0aW9uICh2YWwsIGRlc2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyc8YnI+JysgZGVzYztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0cyA9IFtcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVyb19kYW1hZ2VcIiwgY2xhc3M6IFwiaGVyb2RhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZXJvIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJzaWVnZV9kYW1hZ2VcIiwgY2xhc3M6IFwic2llZ2VkYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnU2llZ2UgRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcIm1lcmNfY2FtcHNcIiwgY2xhc3M6IFwibWVyY2NhbXBzXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ01lcmMgQ2FtcHMgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVhbGluZ1wiLCBjbGFzczogXCJoZWFsaW5nXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlYWxpbmcnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZGFtYWdlX3Rha2VuXCIsIGNsYXNzOiBcImRhbWFnZXRha2VuXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0RhbWFnZSBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJleHBfY29udHJpYlwiLCBjbGFzczogXCJleHBjb250cmliXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0V4cGVyaWVuY2UgQ29udHJpYnV0aW9uJ31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoc3RhdCBvZiByb3dzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IG1hdGNoU3RhdHNbc3RhdC5rZXldW1wibWF4XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50T25SYW5nZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRPblJhbmdlID0gKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIC8gKG1heCAqIDEuMDApKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQud2lkdGggPSBwZXJjZW50T25SYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlID0gc3RhdHNbc3RhdC5rZXldO1xyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSBzdGF0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9ICc8c3BhbiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyLW5vbmVcIj4nICsgc3RhdC52YWx1ZSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnRvb2x0aXAgPSByb3dzdGF0X3Rvb2x0aXAoc3RhdC52YWx1ZSwgc3RhdC50b29sdGlwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0Lmh0bWwgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHN0YXQudG9vbHRpcCArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1yb3dcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy0nKyBzdGF0LmNsYXNzICsnIHJtLWZtLXItc3RhdHMtYmFyXCIgc3R5bGU9XCJ3aWR0aDogJysgc3RhdC53aWR0aCArJyVcIj48L2Rpdj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXJcIj4nKyBzdGF0LnZhbHVlRGlzcGxheSArJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01NUlxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFUeXBlID0gXCJuZWdcIjtcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhUHJlZml4ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5tbXIuZGVsdGEgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFUeXBlID0gXCJwb3NcIjtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhUHJlZml4ID0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhID0gcGxheWVyLm1tci5yYW5rICsnICcrIHBsYXllci5tbXIudGllciArJyAoPHNwYW4gY2xhc3M9XFwncm0tZm0tci1tbXItZGVsdGEtJysgbW1yRGVsdGFUeXBlICsnXFwnPicrIG1tckRlbHRhUHJlZml4ICsgcGxheWVyLm1tci5kZWx0YSArJzwvc3Bhbj4pJztcclxuXHJcbiAgICAgICAgICAgIC8vUGFydHlcclxuICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LW1kIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1tZCBybS1wYXJ0eS1tZC1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQnVpbGQgaHRtbFxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93IHJtLWZtLXJvdy0nKyBvZGRFdmVuICsnXCI+JyArXHJcbiAgICAgICAgICAgIC8vUGFydHkgU3RyaXBlXHJcbiAgICAgICAgICAgIHBhcnR5ICtcclxuICAgICAgICAgICAgLy9IZXJvIEltYWdlIENvbnRhaW5lciAoV2l0aCBIZXJvIExldmVsKVxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2xldmVsXCI+JysgcGxheWVyLmhlcm9fbGV2ZWwgKyc8L2Rpdj48aW1nIGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2VcIiBzcmM9XCInKyBwbGF5ZXIuaW1hZ2VfaGVybyArJ1wiPjwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1BsYXllciBOYW1lIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcGxheWVybmFtZSArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NZWRhbCBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vVGFsZW50cyBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudHMtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtaW5kaXZcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPidcclxuICAgICAgICAgICAgKyBzdGF0cy5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgc3RhdHMuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgc3RhdHMuYXNzaXN0cyArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGFcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIHN0YXRzLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIE9mZmVuc2UgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1vZmZlbnNlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1swXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMV0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzJdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgVXRpbGl0eSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXV0aWxpdHktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzNdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s0XS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNV0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NTVIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItdG9vbHRpcC1hcmVhXCIgc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInKyBtbXJEZWx0YSArJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1tclwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL3JhbmtlZF9wbGF5ZXJfaWNvbl8nICsgcGxheWVyLm1tci5yYW5rICsnLnBuZ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1udW1iZXJcIj4nKyBwbGF5ZXIubW1yLnRpZXIgKyc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVyaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXJcIj5Mb2FkIE1vcmUgTWF0Y2hlcy4uLjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQobG9hZGVyaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0Lmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTF4IGZhLWZ3XCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzLmxvYWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yX01hdGNoV29uTG9zdDogZnVuY3Rpb24od29uKSB7XHJcbiAgICAgICAgICAgIGlmICh3b24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctd29uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctbG9zdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbGVudHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==