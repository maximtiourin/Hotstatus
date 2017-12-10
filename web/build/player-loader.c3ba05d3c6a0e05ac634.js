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
                $('.playerloader-processing').fadeIn().delay(250).queue(function () {
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
                data_topheroes.generateTopHeroesContainer(json.matches_played, json.mvp_medals_percentage);

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
        generateTopHeroesContainer: function generateTopHeroesContainer(matchesplayed, mvppercent) {
            var matchesplayedcontainer = '<div class="pl-topheroes-matchesplayed-container">Total Played: ' + matchesplayed + '</div>';

            var mvppercentcontainer = '<div class="pl-topheroes-mvppercent-container"><img class="pl-topheroes-mvppercent-image" src="' + image_bpath + 'storm_ui_scorescreen_mvp_mvp_blue.png">MVP: ' + mvppercent + '%</div>';

            var html = '<div id="pl-topheroes-container" class="pl-topheroes-container hotstatus-subcontainer padding-left-0 padding-right-0">' + matchesplayedcontainer + mvppercentcontainer + '</div>';

            $('#player-leftpane-container').append(html);
        },
        generateTopHeroesTableData: function generateTopHeroesTableData(hero) {
            /*
             * Hero
             */
            var herofield = '<div class="pl-th-heropane"><div><img class="pl-th-hp-heroimage" src="' + image_bpath + hero.image_hero + '.png"></div>' + '<div><a class="pl-th-hp-heroname" href="' + Routing.generate("playerhero", { id: player_id, heroProperName: hero.name }) + '" target="_blank">' + hero.name + '</a></div></div>';

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

                            playershtml += '<div class="rm-sw-pp-player"><span data-toggle="tooltip" data-html="true" title="' + player.hero + '"><img class="rm-sw-pp-player-image" src="' + image_bpath + player.image_hero + '.png"></span>' + party + silence_image(player.silenced, 12) + special + player.name + '</a></div>';
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

            var html = '<div id="recentmatch-container-' + match.id + '"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' + '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + image_bpath + match.map_image + '.png);">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + image_bpath + match.player.image_hero + '.png"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("playerhero", { id: player_id, heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + match.player.kda + '</span> KDA</div></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div>';

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

                        bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="' + image_bpath + ban.image + '.png"></span>';
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
                medalhtml = '<div class="rm-fm-r-medal-inner"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>' + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-fm-r-medal" src="' + image_bpath + medal.image + '_' + teamColor + '.png"></span></div>';
            }

            //Talents
            var talentshtml = "";
            for (var i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-fm-r-talent-bg'>";

                if (player.talents.length > i) {
                    var talent = player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-fm-r-talent" src="' + image_bpath + talent.image + '.png"></span>';
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
            '<div class="rm-fm-r-heroimage-container">' + '<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + player.hero + '"><div class="rm-fm-r-herolevel">' + player.hero_level + '</div><img class="rm-fm-r-heroimage" src="' + image_bpath + player.image_hero + '.png"></span>' + '</div>' +
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2FkOGQyNWU0NjQxNDJhZTVkMzQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJqc29uX21hcHMiLCJtYXBzIiwiZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXIiLCJtYXRjaGVzX3BsYXllZCIsIm12cF9tZWRhbHNfcGVyY2VudGFnZSIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGUiLCJ0b3BIZXJvZXNUYWJsZSIsImdldFRvcEhlcm9lc1RhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YSIsImluaXRUb3BIZXJvZXNUYWJsZSIsImdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lciIsImdlbmVyYXRlVG9wTWFwc1RhYmxlIiwidG9wTWFwc1RhYmxlIiwiZ2V0VG9wTWFwc1RhYmxlQ29uZmlnIiwibWFwIiwiZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhIiwiaW5pdFRvcE1hcHNUYWJsZSIsImRhdGFfcGFydGllcyIsImpzb25fcGFydGllcyIsImdlbmVyYXRlUGFydGllc0NvbnRhaW5lciIsImxhc3RfdXBkYXRlZCIsImdlbmVyYXRlUGFydGllc1RhYmxlIiwicGFydGllc1RhYmxlIiwiZ2V0UGFydGllc1RhYmxlQ29uZmlnIiwicGFydHkiLCJnZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGEiLCJpbml0UGFydGllc1RhYmxlIiwibWF0Y2hsb2FkaW5nIiwibWF0Y2h1cmwiLCJnZW5lcmF0ZU1hdGNoVXJsIiwibWF0Y2hfaWQiLCJtYXRjaGlkIiwiZGlzcGxheU1hdGNoTG9hZGVyIiwianNvbl9vZmZzZXRzIiwib2Zmc2V0cyIsImpzb25fbGltaXRzIiwianNvbl9tYXRjaGVzIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiaWQiLCJnZW5lcmF0ZU1hdGNoIiwiZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlIiwiZ2VuZXJhdGVfbWF0Y2hMb2FkZXIiLCJyZW1vdmVfbWF0Y2hMb2FkZXIiLCJsb2FkTWF0Y2giLCJwcmVwZW5kIiwianNvbl9tYXRjaCIsImdlbmVyYXRlRnVsbE1hdGNoUm93cyIsImh0bWwiLCJtbXJzIiwiY29udGFpbmVyIiwiZ2VuZXJhdGVNTVJCYWRnZSIsIm1tckdhbWVUeXBlSW1hZ2UiLCJpbWFnZV9icGF0aCIsImdhbWVUeXBlX2ltYWdlIiwibW1yaW1nIiwicmFuayIsIm1tcnRpZXIiLCJ0aWVyIiwiZ2VuZXJhdGVNTVJUb29sdGlwIiwiZ2FtZVR5cGUiLCJyYXRpbmciLCJoZXJvTGltaXQiLCJtYXRjaGVzcGxheWVkIiwibXZwcGVyY2VudCIsIm1hdGNoZXNwbGF5ZWRjb250YWluZXIiLCJtdnBwZXJjZW50Y29udGFpbmVyIiwiaGVyb2ZpZWxkIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwibmFtZSIsImdvb2RrZGEiLCJrZGFfcmF3Iiwia2RhIiwia2RhX2F2ZyIsImtkYWluZGl2Iiwia2lsbHNfYXZnIiwiZGVhdGhzX2F2ZyIsImFzc2lzdHNfYXZnIiwia2RhZmllbGQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVfcmF3Iiwid2lucmF0ZWZpZWxkIiwid2lucmF0ZSIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsIm1hdGNoTG9hZGVyR2VuZXJhdGVkIiwibWF0Y2hNYW5pZmVzdCIsImhhc093blByb3BlcnR5IiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJtZWRhbGh0bWwiLCJub21lZGFsaHRtbCIsImV4aXN0cyIsImRlc2Nfc2ltcGxlIiwidGFsZW50c2h0bWwiLCJpIiwidGFsZW50cyIsInRhbGVudCIsInRhbGVudHRvb2x0aXAiLCJwbGF5ZXJzaHRtbCIsInBhcnRpZXNDb3VudGVyIiwidCIsInRlYW1zIiwidGVhbSIsInBhcnR5T2Zmc2V0IiwicGFydHlDb2xvciIsInNwZWNpYWwiLCJzaWxlbmNlZCIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsImtpbGxzIiwiZGVhdGhzIiwiYXNzaXN0cyIsImNsaWNrIiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwibWF0Y2htYW4iLCJzZWxlY3RvciIsInNsaWRlRG93biIsInNsaWRlVXAiLCJmdWxsbWF0Y2hfY29udGFpbmVyIiwidGVhbV9jb250YWluZXIiLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlciIsIndpbm5lciIsImhhc0JhbnMiLCJwIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsInN0YXRzIiwidmljdG9yeSIsImJhbnMiLCJiYW4iLCJsZXZlbCIsIm9sZCIsInRlYW1Db2xvciIsIm1hdGNoU3RhdHMiLCJvZGRFdmVuIiwibWF0Y2hQbGF5ZXJJZCIsInBsYXllcm5hbWUiLCJyb3dzdGF0X3Rvb2x0aXAiLCJkZXNjIiwicm93c3RhdHMiLCJrZXkiLCJjbGFzcyIsIndpZHRoIiwidmFsdWUiLCJ2YWx1ZURpc3BsYXkiLCJzdGF0IiwibWF4IiwicGVyY2VudE9uUmFuZ2UiLCJtbXJEZWx0YVR5cGUiLCJtbXJEZWx0YVByZWZpeCIsImRlbHRhIiwibW1yRGVsdGEiLCJoZXJvX2xldmVsIiwibG9hZGVyaHRtbCIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGVBQWUsRUFBbkI7O0FBRUE7OztBQUdBQSxhQUFhQyxJQUFiLEdBQW9CO0FBQ2hCOzs7QUFHQUMsV0FBTyxlQUFTQyxZQUFULEVBQXVCQyxJQUF2QixFQUE2QjtBQUNoQ0MsbUJBQVdELElBQVgsRUFBaUJELFlBQWpCO0FBQ0g7QUFOZSxDQUFwQjs7QUFTQTs7O0FBR0FILGFBQWFDLElBQWIsQ0FBa0JLLE1BQWxCLEdBQTJCO0FBQ3ZCQyxjQUFVO0FBQ05DLGlCQUFTLEtBREgsRUFDVTtBQUNoQkMsYUFBSyxFQUZDLEVBRUc7QUFDVEMsaUJBQVMsTUFISCxDQUdX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ZDNjNmEwZTA1YWM2MzQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBjYWQ4ZDI1ZTQ2NDE0MmFlNWQzNCIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgdmFsID0gSG90c3RhdHVzRmlsdGVyLmdldFNlbGVjdG9yVmFsdWVzKFwic2Vhc29uXCIpO1xyXG5cclxuICAgICAgICBsZXQgc2Vhc29uID0gXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vhc29uO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuICAgICAgICBsZXQgYWpheF9tYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgIGxldCBhamF4X3RvcGhlcm9lcyA9IGFqYXgudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBhamF4X3BhcnRpZXMgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbW1yID0gZGF0YS5tbXI7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLy0tIEluaXRpYWwgTWF0Y2hlcyBGaXJzdCBMb2FkXHJcbiAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtbG9hZGVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0zeCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbW1yID0ganNvbi5tbXI7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbW1yLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfdG9waGVyb2VzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfcGFydGllcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNTVJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tbXIuZ2VuZXJhdGVNTVJDb250YWluZXIoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfbW1yLmdlbmVyYXRlTU1SQmFkZ2VzKGpzb25fbW1yKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5pbnRlcm5hbC5saW1pdCA9IGpzb24ubGltaXRzLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgbWF0Y2ggc2V0XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF90b3BoZXJvZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF9wYXJ0aWVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucGxheWVybG9hZGVyLXByb2Nlc3NpbmcnKS5mYWRlSW4oKS5kZWxheSgyNTApLnF1ZXVlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl90b3BoZXJvZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgVG9wIEhlcm9lcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcGhlcm9lcyA9IGRhdGEudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcG1hcHMgPSBkYXRhLnRvcG1hcHM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBUb3AgSGVyb2VzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXBzID0ganNvbi5tYXBzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcGhlcm9lcy5nZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcihqc29uLm1hdGNoZXNfcGxheWVkLCBqc29uLm12cF9tZWRhbHNfcGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcEhlcm9lc1RhYmxlID0gZGF0YV90b3BoZXJvZXMuZ2V0VG9wSGVyb2VzVGFibGVDb25maWcoanNvbl9oZXJvZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmluaXRUb3BIZXJvZXNUYWJsZSh0b3BIZXJvZXNUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFRvcCBNYXBzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3BNYXBzVGFibGUgPSBkYXRhX3RvcG1hcHMuZ2V0VG9wTWFwc1RhYmxlQ29uZmlnKGpzb25fbWFwcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hcCBvZiBqc29uX21hcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wTWFwc1RhYmxlLmRhdGEucHVzaChkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhKG1hcCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmluaXRUb3BNYXBzVGFibGUodG9wTWFwc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgucGFydGllcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5wYXJ0aWVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcGFydGllc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyBQYXJ0aWVzIGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3BhcnRpZXMgPSBkYXRhLnBhcnRpZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBQYXJ0aWVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fcGFydGllcyA9IGpzb24ucGFydGllcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBQYXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX3BhcnRpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNDb250YWluZXIoanNvbi5sYXN0X3VwZGF0ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRpZXNUYWJsZSA9IGRhdGFfcGFydGllcy5nZXRQYXJ0aWVzVGFibGVDb25maWcoanNvbl9wYXJ0aWVzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydHkgb2YganNvbl9wYXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNUYWJsZS5kYXRhLnB1c2goZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc1RhYmxlRGF0YShwYXJ0eSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmluaXRQYXJ0aWVzVGFibGUocGFydGllc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICBtYXRjaGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgZnVsbG1hdGNoIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBtYXRjaHVybDogJycsIC8vdXJsIHRvIGdldCBhIGZ1bGxtYXRjaCByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICAgICAgb2Zmc2V0OiAwLCAvL01hdGNoZXMgb2Zmc2V0XHJcbiAgICAgICAgbGltaXQ6IDEwLCAvL01hdGNoZXMgbGltaXQgKEluaXRpYWwgbGltaXQgaXMgc2V0IGJ5IGluaXRpYWwgbG9hZGVyKVxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9yZWNlbnRtYXRjaGVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWQsXHJcbiAgICAgICAgICAgIG9mZnNldDogc2VsZi5pbnRlcm5hbC5vZmZzZXQsXHJcbiAgICAgICAgICAgIGxpbWl0OiBzZWxmLmludGVybmFsLmxpbWl0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlTWF0Y2hVcmw6IGZ1bmN0aW9uKG1hdGNoX2lkKSB7XHJcbiAgICAgICAgcmV0dXJuIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX21hdGNoXCIsIHtcclxuICAgICAgICAgICAgbWF0Y2hpZDogbWF0Y2hfaWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRpc3BsYXlNYXRjaExvYWRlciA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9vZmZzZXRzID0ganNvbi5vZmZzZXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbGltaXRzID0ganNvbi5saW1pdHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaGVzID0ganNvbi5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9TZXQgbmV3IG9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0FwcGVuZCBuZXcgTWF0Y2ggd2lkZ2V0cyBmb3IgbWF0Y2hlcyB0aGF0IGFyZW4ndCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBqc29uX21hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU1hdGNoKG1hdGNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9TZXQgZGlzcGxheU1hdGNoTG9hZGVyIGlmIHdlIGdvdCBhcyBtYW55IG1hdGNoZXMgYXMgd2UgYXNrZWQgZm9yXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPj0gc2VsZi5pbnRlcm5hbC5saW1pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWF0Y2hMb2FkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNlbGYuaW50ZXJuYWwub2Zmc2V0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXkgbWF0Y2ggbG9hZGVyIGJ1dHRvbiBpZiBoYWROZXdNYXRjaFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlNYXRjaExvYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vUmVtb3ZlIGluaXRpYWwgbG9hZFxyXG4gICAgICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHRoZSBtYXRjaCBvZiBnaXZlbiBpZCB0byBiZSBkaXNwbGF5ZWQgdW5kZXIgbWF0Y2ggc2ltcGxld2lkZ2V0XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXRjaDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gc2VsZi5nZW5lcmF0ZU1hdGNoVXJsKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZnVsbG1hdGNoLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLm1hdGNodXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaCA9IGpzb24ubWF0Y2g7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlRnVsbE1hdGNoUm93cyhtYXRjaGlkLCBqc29uX21hdGNoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZ1bGxtYXRjaC1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblBsYXllckxvYWRlci5kYXRhID0ge1xyXG4gICAgbW1yOiB7XHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtbW1yLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtbW1yLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtbW1yLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIG1hcmdpbi1ib3R0b20tc3BhY2VyLTEgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJCYWRnZXM6IGZ1bmN0aW9uKG1tcnMpIHtcclxuICAgICAgICAgICAgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1tcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250YWluZXIgPSAkKCcjcGwtbW1yLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbW1yIG9mIG1tcnMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNTVJCYWRnZShjb250YWluZXIsIG1tcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SQmFkZ2U6IGZ1bmN0aW9uKGNvbnRhaW5lciwgbW1yKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubW1yO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1tckdhbWVUeXBlSW1hZ2UgPSAnPGltZyBjbGFzcz1cInBsLW1tci1iYWRnZS1nYW1lVHlwZUltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvZ2FtZVR5cGVfaWNvbl8nICsgbW1yLmdhbWVUeXBlX2ltYWdlICsnLnBuZ1wiPic7XHJcbiAgICAgICAgICAgIGxldCBtbXJpbWcgPSAnPGltZyBjbGFzcz1cInBsLW1tci1iYWRnZS1pbWFnZVwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL3JhbmtlZF9wbGF5ZXJfaWNvbl8nICsgbW1yLnJhbmsgKycucG5nXCI+JztcclxuICAgICAgICAgICAgbGV0IG1tcnRpZXIgPSAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS10aWVyXCI+JysgbW1yLnRpZXIgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgR2FtZVR5cGUgSW1hZ2VcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLWdhbWVUeXBlSW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJHYW1lVHlwZUltYWdlICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIEltYWdlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS1pbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tcmltZyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBUaWVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS10aWVyLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1ydGllciArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBUb29sdGlwIEFyZWFcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRvb2x0aXAtYXJlYVwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIHNlbGYuZ2VuZXJhdGVNTVJUb29sdGlwKG1tcikgKydcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SVG9vbHRpcDogZnVuY3Rpb24obW1yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdj4nKyBtbXIuZ2FtZVR5cGUgKyc8L2Rpdj48ZGl2PicrIG1tci5yYXRpbmcgKyc8L2Rpdj48ZGl2PicrIG1tci5yYW5rICsnICcrIG1tci50aWVyICsnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG9waGVyb2VzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgaGVyb0xpbWl0OiA1LCAvL0hvdyBtYW55IGhlcm9lcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXI6IGZ1bmN0aW9uKG1hdGNoZXNwbGF5ZWQsIG12cHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgbGV0IG1hdGNoZXNwbGF5ZWRjb250YWluZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcGhlcm9lcy1tYXRjaGVzcGxheWVkLWNvbnRhaW5lclwiPlRvdGFsIFBsYXllZDogJysgbWF0Y2hlc3BsYXllZCArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbXZwcGVyY2VudGNvbnRhaW5lciA9ICc8ZGl2IGNsYXNzPVwicGwtdG9waGVyb2VzLW12cHBlcmNlbnQtY29udGFpbmVyXCI+PGltZyBjbGFzcz1cInBsLXRvcGhlcm9lcy1tdnBwZXJjZW50LWltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKydzdG9ybV91aV9zY29yZXNjcmVlbl9tdnBfbXZwX2JsdWUucG5nXCI+TVZQOiAnKyBtdnBwZXJjZW50ICsnJTwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtdG9waGVyb2VzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtdG9waGVyb2VzLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hlc3BsYXllZGNvbnRhaW5lciArXHJcbiAgICAgICAgICAgICAgICBtdnBwZXJjZW50Y29udGFpbmVyICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBIZXJvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgaGVyb2ZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1oZXJvcGFuZVwiPjxkaXY+PGltZyBjbGFzcz1cInBsLXRoLWhwLWhlcm9pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIGhlcm8uaW1hZ2VfaGVybyArJy5wbmdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxhIGNsYXNzPVwicGwtdGgtaHAtaGVyb25hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogaGVyby5uYW1lfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JysgaGVyby5uYW1lICsnPC9hPjwvZGl2PjwvZGl2Pic7XHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogS0RBXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhID0gJzxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBoZXJvLmtkYV9hdmcgKyAnPC9zcGFuPiBLREEnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGtkYWluZGl2ID0gaGVyby5raWxsc19hdmcgKyAnIC8gPHNwYW4gY2xhc3M9XCJwbC10aC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIGhlcm8uZGVhdGhzX2F2ZyArICc8L3NwYW4+IC8gJyArIGhlcm8uYXNzaXN0c19hdmc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGFjdHVhbFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC1rZGEta2RhXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGEgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGluZGl2XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdlwiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYWluZGl2ICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIGhlcm8ucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtoZXJvZmllbGQsIGtkYWZpZWxkLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wSGVyb2VzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwuaGVyb0xpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcGhlcm9lcy10YWJsZVwiIGNsYXNzPVwicGwtdG9waGVyb2VzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3BtYXBzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWFwTGltaXQ6IDYsIC8vSG93IG1hbnkgdG9wIG1hcHMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcG1hcHMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtdG9wbWFwcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcG1hcHMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXBhcnRpZXMtdGl0bGVcIj5NYXBzPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtbWlkLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc1RhYmxlRGF0YTogZnVuY3Rpb24obWFwKSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFBhcnR5XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgbWFwaW1hZ2UgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwYmdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnKyBpbWFnZV9icGF0aCArJ3VpL21hcF9pY29uXycrIG1hcC5pbWFnZSArJy5wbmcpO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWFwbmFtZSA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBuYW1lXCI+JysgbWFwLm5hbWUgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1hcGlubmVyID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcHBhbmVcIj4nKyBtYXBpbWFnZSArIG1hcG5hbWUgKyAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXAud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXAucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFttYXBpbm5lciwgd2lucmF0ZWZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRvcE1hcHNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9wbWFwcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSBzZWxmLmludGVybmFsLm1hcExpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcG1hcHMtdGFibGVcIiBjbGFzcz1cInBsLXRvcG1hcHMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VG9wTWFwc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcG1hcHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGFydGllczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIHBhcnR5TGltaXQ6IDQsIC8vSG93IG1hbnkgcGFydGllcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc0NvbnRhaW5lcjogZnVuY3Rpb24obGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcGFydGllcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXBhcnRpZXMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXBhcnRpZXMtdGl0bGVcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJMYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKydcIj5QYXJ0aWVzPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGxheWVyLWxlZnRwYW5lLWJvdC1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGE6IGZ1bmN0aW9uKHBhcnR5KSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFBhcnR5XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgcGFydHlpbm5lciA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgcGFydHkucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgcGFydHlpbm5lciArPSAnPGRpdiBjbGFzcz1cInBsLXAtcC1wbGF5ZXIgcGwtcC1wLXBsYXllci0nKyBwYXJ0eS5wbGF5ZXJzLmxlbmd0aCArJ1wiPjxhIGNsYXNzPVwicGwtcC1wLXBsYXllcm5hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBwbGF5ZXIubmFtZSArJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcGFydHlmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy1wYXJ0eXBhbmVcIj4nKyBwYXJ0eWlubmVyICsnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIHBhcnR5LndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGFydHkucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0eWZpZWxkLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0UGFydGllc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwucGFydHlMaW1pdDsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJwbC1wYXJ0aWVzLXRhYmxlXCIgY2xhc3M9XCJwbC1wYXJ0aWVzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFBhcnRpZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hdGNoZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXRjaExvYWRlckdlbmVyYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIG1hdGNoTWFuaWZlc3Q6IHt9IC8vS2VlcHMgdHJhY2sgb2Ygd2hpY2ggbWF0Y2ggaWRzIGFyZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkLCB0byBwcmV2ZW50IG9mZnNldCByZXF1ZXN0cyBmcm9tIHJlcGVhdGluZyBtYXRjaGVzIG92ZXIgbGFyZ2UgcGVyaW9kcyBvZiB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNNYXRjaEdlbmVyYXRlZDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0Lmhhc093blByb3BlcnR5KG1hdGNoaWQgKyBcIlwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItcmlnaHRwYW5lLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lciBpbml0aWFsLWxvYWQgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBob3Jpem9udGFsLXNjcm9sbGVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU5vTWF0Y2hlc01lc3NhZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwbC1ub3JlY2VudG1hdGNoZXNcIj5ObyBSZWNlbnQgTWF0Y2hlcyBGb3VuZC4uLjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgYWxsIHN1YmNvbXBvbmVudHMgb2YgYSBtYXRjaCBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggY29tcG9uZW50IGNvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lclwiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0dlbmVyYXRlIG9uZS10aW1lIHBhcnR5IGNvbG9ycyBmb3IgbWF0Y2hcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBbMSwgMiwgMywgNCwgNV07IC8vQXJyYXkgb2YgY29sb3JzIHRvIHVzZSBmb3IgcGFydHkgYXQgaW5kZXggPSBwYXJ0eUluZGV4IC0gMVxyXG4gICAgICAgICAgICBIb3RzdGF0dXMudXRpbGl0eS5zaHVmZmxlKHBhcnRpZXNDb2xvcnMpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGlzIGN1cnJlbnRseSB0b2dnbGVkIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIG1hdGNoUGxheWVyOiBtYXRjaC5wbGF5ZXIuaWQsIC8vSWQgb2YgdGhlIG1hdGNoJ3MgcGxheWVyIGZvciB3aG9tIHRoZSBtYXRjaCBpcyBiZWluZyBkaXNwbGF5ZWQsIGZvciB1c2Ugd2l0aCBoaWdobGlnaHRpbmcgaW5zaWRlIG9mIGZ1bGxtYXRjaCAod2hpbGUgZGVjb3VwbGluZyBtYWlucGxheWVyKVxyXG4gICAgICAgICAgICAgICAgcGFydGllc0NvbG9yczogcGFydGllc0NvbG9ycyAvL0NvbG9ycyB0byB1c2UgZm9yIHRoZSBwYXJ0eSBpbmRleGVzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hXaWRnZXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIFdpZGdldCBDb250YWluZXJcclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZV9kYXRlID0gSG90c3RhdHVzLmRhdGUuZ2V0UmVsYXRpdmVUaW1lKHRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gbWF0Y2gucGxheWVyLm1lZGFsO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnX2JsdWUucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCA9IFwiPGRpdiBjbGFzcz0ncm0tc3ctc3Atb2Zmc2V0Jz48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXRwLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gbWF0Y2gucGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy10cC10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyc1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyc2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMF07IC8vQ291bnRzIGluZGV4IG9mIHBhcnR5IG1lbWJlciwgZm9yIHVzZSB3aXRoIGNyZWF0aW5nIGNvbm5lY3RvcnMsIHVwIHRvIDUgcGFydGllcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC10ZWFtJyArIHQgKyAnXCI+JztcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnR5ID0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eSBybS1wYXJ0eS1zbSBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LXNtIHJtLXBhcnR5LXNtLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3BlY2lhbCA9ICc8YSBjbGFzcz1cIicrc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoLnBsYXllci5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXBsYXllclwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctcHAtcGxheWVyLWltYWdlXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIGltYWdlX2JwYXRoICsgcGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9zcGFuPicgKyBwYXJ0eSArIHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxMikgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXRcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWxlZnRwYW5lICcgKyBzZWxmLmNvbG9yX01hdGNoV29uTG9zdChtYXRjaC5wbGF5ZXIud29uKSArICdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgaW1hZ2VfYnBhdGggKyBtYXRjaC5tYXBfaW1hZ2UgKycucG5nKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGVcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlLXRleHRcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWF0Y2gubWFwICsgJ1wiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWRhdGVcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgZGF0ZSArICdcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWRhdGUtdGV4dFwiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLXZpY3RvcnlcIj4nICsgdmljdG9yeVRleHQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLW1hdGNobGVuZ3RoXCI+JyArIG1hdGNoX3RpbWUgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGltZyBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIHJtLXN3LWhwLXBvcnRyYWl0XCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtc3RhdHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdlwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LXRleHRcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgbWF0Y2gucGxheWVyLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBtYXRjaC5wbGF5ZXIuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgbWF0Y2gucGxheWVyLmFzc2lzdHMgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgbWF0Y2gucGxheWVyLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC10YWxlbnRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy10cC10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1wbGF5ZXJzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1wcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2xpY2sgbGlzdGVuZXJzIGZvciBpbnNwZWN0IHBhbmVcclxuICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2guaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUGFuZTogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgZnVsbCBtYXRjaCBwYW5lIHRoYXQgbG9hZHMgd2hlbiBhIG1hdGNoIHdpZGdldCBpcyBjbGlja2VkIGZvciBhIGRldGFpbGVkIHZpZXcsIGlmIGl0J3MgYWxyZWFkeSBsb2FkZWQsIHRvZ2dsZSBpdHMgZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaG1hbiA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl07XHJcbiAgICAgICAgICAgICAgICBtYXRjaG1hbi5mdWxsRGlzcGxheSA9ICFtYXRjaG1hbi5mdWxsRGlzcGxheTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNobWFuLmZ1bGxEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVEb3duKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZVVwKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIGZ1bGwgbWF0Y2ggcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoaWQpLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC0nICsgbWF0Y2hpZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaFwiPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvYWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGFqYXgubG9hZE1hdGNoKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvZyBhcyBnZW5lcmF0ZWQgaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd3M6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGZ1bGxtYXRjaF9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGVhbXNcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBmdWxsbWF0Y2hfY29udGFpbmVyLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkICsnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVhbV9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGVhbSBSb3cgSGVhZGVyXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyKHRlYW1fY29udGFpbmVyLCB0ZWFtLCBtYXRjaC53aW5uZXIgPT09IHQsIG1hdGNoLmhhc0JhbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHBsYXllcnMgZm9yIHRlYW1cclxuICAgICAgICAgICAgICAgIGxldCBwID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1BsYXllciBSb3dcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbG1hdGNoUm93KG1hdGNoaWQsIHRlYW1fY29udGFpbmVyLCBwbGF5ZXIsIHRlYW0uY29sb3IsIG1hdGNoLnN0YXRzLCBwICUgMiwgcGFydGllc0NvdW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHArKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyOiBmdW5jdGlvbihjb250YWluZXIsIHRlYW0sIHdpbm5lciwgaGFzQmFucykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL1ZpY3RvcnlcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnkgPSAod2lubmVyKSA/ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5XCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1kZWZlYXRcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0JhbnNcclxuICAgICAgICAgICAgbGV0IGJhbnMgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgICAgIGJhbnMgKz0gJ0JhbnM6ICc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiYW4gb2YgdGVhbS5iYW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFucyArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGJhbi5uYW1lICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yaC1iYW5cIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBiYW4uaW1hZ2UgKycucG5nXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgta2RhLWNvbnRhaW5lclwiPktEQTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0aXN0aWNzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1zdGF0aXN0aWNzLWNvbnRhaW5lclwiPlBlcmZvcm1hbmNlPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yLCBtYXRjaFN0YXRzLCBvZGRFdmVuLCBwYXJ0aWVzQ291bnRlcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hQbGF5ZXJJZCA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ubWF0Y2hQbGF5ZXI7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyIG5hbWVcclxuICAgICAgICAgICAgbGV0IHBsYXllcm5hbWUgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnJztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2hQbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSBybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgJysgc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpICsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICs9IHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxNCkgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPic7XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IHBsYXllci5tZWRhbDtcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1pbm5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tZm0tci1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIGltYWdlX2JwYXRoICsgbWVkYWwuaW1hZ2UgKyAnXycrIHRlYW1Db2xvciArJy5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLWZtLXItdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBwbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItdGFsZW50XCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgdGFsZW50LmltYWdlICsnLnBuZ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3RhdHNcclxuICAgICAgICAgICAgbGV0IHN0YXRzID0gcGxheWVyLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRfdG9vbHRpcCA9IGZ1bmN0aW9uICh2YWwsIGRlc2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyc8YnI+JysgZGVzYztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0cyA9IFtcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVyb19kYW1hZ2VcIiwgY2xhc3M6IFwiaGVyb2RhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZXJvIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJzaWVnZV9kYW1hZ2VcIiwgY2xhc3M6IFwic2llZ2VkYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnU2llZ2UgRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcIm1lcmNfY2FtcHNcIiwgY2xhc3M6IFwibWVyY2NhbXBzXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ01lcmMgQ2FtcHMgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVhbGluZ1wiLCBjbGFzczogXCJoZWFsaW5nXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlYWxpbmcnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZGFtYWdlX3Rha2VuXCIsIGNsYXNzOiBcImRhbWFnZXRha2VuXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0RhbWFnZSBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJleHBfY29udHJpYlwiLCBjbGFzczogXCJleHBjb250cmliXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0V4cGVyaWVuY2UgQ29udHJpYnV0aW9uJ31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoc3RhdCBvZiByb3dzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IG1hdGNoU3RhdHNbc3RhdC5rZXldW1wibWF4XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50T25SYW5nZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRPblJhbmdlID0gKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIC8gKG1heCAqIDEuMDApKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQud2lkdGggPSBwZXJjZW50T25SYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlID0gc3RhdHNbc3RhdC5rZXldO1xyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSBzdGF0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9ICc8c3BhbiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyLW5vbmVcIj4nICsgc3RhdC52YWx1ZSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnRvb2x0aXAgPSByb3dzdGF0X3Rvb2x0aXAoc3RhdC52YWx1ZSwgc3RhdC50b29sdGlwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0Lmh0bWwgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHN0YXQudG9vbHRpcCArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1yb3dcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy0nKyBzdGF0LmNsYXNzICsnIHJtLWZtLXItc3RhdHMtYmFyXCIgc3R5bGU9XCJ3aWR0aDogJysgc3RhdC53aWR0aCArJyVcIj48L2Rpdj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXJcIj4nKyBzdGF0LnZhbHVlRGlzcGxheSArJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01NUlxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFUeXBlID0gXCJuZWdcIjtcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhUHJlZml4ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5tbXIuZGVsdGEgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFUeXBlID0gXCJwb3NcIjtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhUHJlZml4ID0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhID0gcGxheWVyLm1tci5yYW5rICsnICcrIHBsYXllci5tbXIudGllciArJyAoPHNwYW4gY2xhc3M9XFwncm0tZm0tci1tbXItZGVsdGEtJysgbW1yRGVsdGFUeXBlICsnXFwnPicrIG1tckRlbHRhUHJlZml4ICsgcGxheWVyLm1tci5kZWx0YSArJzwvc3Bhbj4pJztcclxuXHJcbiAgICAgICAgICAgIC8vUGFydHlcclxuICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LW1kIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1tZCBybS1wYXJ0eS1tZC1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQnVpbGQgaHRtbFxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93IHJtLWZtLXJvdy0nKyBvZGRFdmVuICsnXCI+JyArXHJcbiAgICAgICAgICAgIC8vUGFydHkgU3RyaXBlXHJcbiAgICAgICAgICAgIHBhcnR5ICtcclxuICAgICAgICAgICAgLy9IZXJvIEltYWdlIENvbnRhaW5lciAoV2l0aCBIZXJvIExldmVsKVxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2xldmVsXCI+JysgcGxheWVyLmhlcm9fbGV2ZWwgKyc8L2Rpdj48aW1nIGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBwbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9QbGF5ZXIgTmFtZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTWVkYWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1RhbGVudHMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnRzLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vS0RBIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWluZGl2XCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nXHJcbiAgICAgICAgICAgICsgc3RhdHMua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIHN0YXRzLmRlYXRocyArICc8L3NwYW4+IC8gJyArIHN0YXRzLmFzc2lzdHMgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBzdGF0cy5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBPZmZlbnNlIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtb2ZmZW5zZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzFdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1syXS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIFV0aWxpdHkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy11dGlsaXR5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1szXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzVdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTU1SIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLXRvb2x0aXAtYXJlYVwiIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgbW1yRGVsdGEgKydcIj48aW1nIGNsYXNzPVwicm0tZm0tci1tbXJcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9yYW5rZWRfcGxheWVyX2ljb25fJyArIHBsYXllci5tbXIucmFuayArJy5wbmdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItbnVtYmVyXCI+JysgcGxheWVyLm1tci50aWVyICsnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlcmh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyXCI+TG9hZCBNb3JlIE1hdGNoZXMuLi48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGxvYWRlcmh0bWwpO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0xeCBmYS1md1wiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcy5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xvcl9NYXRjaFdvbkxvc3Q6IGZ1bmN0aW9uKHdvbikge1xyXG4gICAgICAgICAgICBpZiAod29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLXdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLWxvc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWxlbnR0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyJywge3BsYXllcjogcGxheWVyX2lkfSk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAvL2ZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwpO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=