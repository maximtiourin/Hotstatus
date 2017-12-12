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
                data_topheroes.generateTopHeroesContainer(json.matches_winrate, json.matches_winrate_raw, json.matches_played, json.mvp_medals_percentage);

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
        generateTopHeroesContainer: function generateTopHeroesContainer(winrate, winrate_raw, matchesplayed, mvppercent) {
            //Good winrate
            var goodwinrate = 'pl-th-wr-winrate';
            if (winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad';
            }
            if (winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible';
            }
            if (winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good';
            }
            if (winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great';
            }

            var winrateText = '<span data-toggle="tooltip" data-html="true" title="Winrate"><div class="d-inline-block topheroes-inline-winrate ' + goodwinrate + '">' + winrate + '%' + '</div></span>';

            var matchesplayedcontainer = '<div class="pl-topheroes-matchesplayed-container topheroes-special-data"><span class="topheroes-special-data-label">Played:</span> ' + matchesplayed + ' (' + winrateText + ')</div>';

            var mvppercentcontainer = '<div class="pl-topheroes-mvppercent-container topheroes-special-data"><img class="pl-topheroes-mvppercent-image" src="' + image_bpath + 'storm_ui_scorescreen_mvp_mvp_blue.png"><span class="topheroes-special-data-label">MVP:</span> ' + mvppercent + '%</div>';

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
                partiesColors: partiesColors, //Colors to use for the party indexes
                shown: true //Whether or not the matchsimplewidget is expected to be shown inside viewport
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
                medalhtml = '<div class="rm-sw-sp-medal-container"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>' + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-sw-sp-medal" src="' + image_bpath + medal.image + '_blue.png"></span></div>';
            } else {
                nomedalhtml = "<div class='rm-sw-sp-offset'></div>";
            }

            //Talents
            var talentshtml = "";
            for (var i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-sw-tp-talent-bg'>";

                if (match.player.talents.length > i) {
                    var talent = match.player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-sw-tp-talent" src="' + image_bpath + talent.image + '.png"></span>';
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

            var html = '<div id="recentmatch-container-' + match.id + '"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' + '<div id="recentmatch-simplewidget-outline-container-' + match.id + '" class="recentmatch-simplewidget-outline-container">' + //Hide inner contents container
            '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + image_bpath + match.map_image + '.png);">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + image_bpath + match.player.image_hero + '.png"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("playerhero", { id: player_id, heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + match.player.kda + '</span> KDA</div></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div></div>';

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Create click listeners for inspect pane
            $('#recentmatch-simplewidget-inspect-' + match.id).click(function () {
                var t = $(this);

                self.generateFullMatchPane(match.id);
            });

            //Create scroll listener for hiding outside of viewport
            $(window).on("resize scroll hotstatus.matchtoggle", function (e) {
                var manifest = PlayerLoader.data.matches.internal.matchManifest;

                if ($('#recentmatch-simplewidget-' + match.id).isOnScreen()) {
                    var sel = $('#recentmatch-simplewidget-outline-container-' + match.id);

                    if (!manifest[match.id + ""].shown) {
                        sel.show();
                        manifest[match.id + ""].shown = true;
                    }
                } else {
                    var _sel = $('#recentmatch-simplewidget-outline-container-' + match.id);

                    if (manifest[match.id + ""].shown) {
                        _sel.hide();
                        manifest[match.id + ""].shown = false;
                    }
                }
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
                    $(window).trigger("hotstatus.matchtoggle");
                } else {
                    selector.slideUp(250);
                    $(window).trigger("hotstatus.matchtoggle");
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

    //Jquery isOnScreen (Returns whether or not the calling selector is inside the viewport + padded zone for scroll smoothness)
    $.fn.isOnScreen = function () {
        var win = $(window);

        var padSize = 600;

        var viewport = {
            top: win.scrollTop() - padSize,
            left: win.scrollLeft() - padSize
        };
        viewport.right = viewport.left + win.width() + 2 * padSize;
        viewport.bottom = viewport.top + win.height() + 2 * padSize;

        var bounds = this.offset();

        if (!bounds) return false; //Catch undefined bounds caused by jquery animations of objects outside of the viewport

        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
    };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmUxNjQwZjI1MDIzZTk1OWRmYmYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJqc29uX21hcHMiLCJtYXBzIiwiZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXIiLCJtYXRjaGVzX3dpbnJhdGUiLCJtYXRjaGVzX3dpbnJhdGVfcmF3IiwibWF0Y2hlc19wbGF5ZWQiLCJtdnBfbWVkYWxzX3BlcmNlbnRhZ2UiLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlIiwidG9wSGVyb2VzVGFibGUiLCJnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyIsImhlcm8iLCJwdXNoIiwiZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEiLCJpbml0VG9wSGVyb2VzVGFibGUiLCJnZW5lcmF0ZVRvcE1hcHNDb250YWluZXIiLCJnZW5lcmF0ZVRvcE1hcHNUYWJsZSIsInRvcE1hcHNUYWJsZSIsImdldFRvcE1hcHNUYWJsZUNvbmZpZyIsIm1hcCIsImdlbmVyYXRlVG9wTWFwc1RhYmxlRGF0YSIsImluaXRUb3BNYXBzVGFibGUiLCJkYXRhX3BhcnRpZXMiLCJqc29uX3BhcnRpZXMiLCJnZW5lcmF0ZVBhcnRpZXNDb250YWluZXIiLCJsYXN0X3VwZGF0ZWQiLCJnZW5lcmF0ZVBhcnRpZXNUYWJsZSIsInBhcnRpZXNUYWJsZSIsImdldFBhcnRpZXNUYWJsZUNvbmZpZyIsInBhcnR5IiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhIiwiaW5pdFBhcnRpZXNUYWJsZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImlkIiwiZ2VuZXJhdGVNYXRjaCIsImdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJodG1sIiwibW1ycyIsImNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2UiLCJtbXJHYW1lVHlwZUltYWdlIiwiaW1hZ2VfYnBhdGgiLCJnYW1lVHlwZV9pbWFnZSIsIm1tcmltZyIsInJhbmsiLCJtbXJ0aWVyIiwidGllciIsImdlbmVyYXRlTU1SVG9vbHRpcCIsImdhbWVUeXBlIiwicmF0aW5nIiwiaGVyb0xpbWl0Iiwid2lucmF0ZSIsIndpbnJhdGVfcmF3IiwibWF0Y2hlc3BsYXllZCIsIm12cHBlcmNlbnQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVUZXh0IiwibWF0Y2hlc3BsYXllZGNvbnRhaW5lciIsIm12cHBlcmNlbnRjb250YWluZXIiLCJoZXJvZmllbGQiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJuYW1lIiwiZ29vZGtkYSIsImtkYV9yYXciLCJrZGEiLCJrZGFfYXZnIiwia2RhaW5kaXYiLCJraWxsc19hdmciLCJkZWF0aHNfYXZnIiwiYXNzaXN0c19hdmciLCJrZGFmaWVsZCIsIndpbnJhdGVmaWVsZCIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsIm1hdGNoTG9hZGVyR2VuZXJhdGVkIiwibWF0Y2hNYW5pZmVzdCIsImhhc093blByb3BlcnR5IiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJzaG93biIsImdlbmVyYXRlTWF0Y2hXaWRnZXQiLCJ0aW1lc3RhbXAiLCJyZWxhdGl2ZV9kYXRlIiwiZ2V0UmVsYXRpdmVUaW1lIiwibWF0Y2hfdGltZSIsImdldE1pbnV0ZVNlY29uZFRpbWUiLCJtYXRjaF9sZW5ndGgiLCJ2aWN0b3J5VGV4dCIsIndvbiIsIm1lZGFsIiwic2lsZW5jZSIsImlzU2lsZW5jZWQiLCJyIiwic2lsZW5jZV9pbWFnZSIsInNpemUiLCJzIiwicGF0aCIsIm1lZGFsaHRtbCIsIm5vbWVkYWxodG1sIiwiZXhpc3RzIiwiZGVzY19zaW1wbGUiLCJ0YWxlbnRzaHRtbCIsImkiLCJ0YWxlbnRzIiwidGFsZW50IiwidGFsZW50dG9vbHRpcCIsInBsYXllcnNodG1sIiwicGFydGllc0NvdW50ZXIiLCJ0IiwidGVhbXMiLCJ0ZWFtIiwicGFydHlPZmZzZXQiLCJwYXJ0eUNvbG9yIiwic3BlY2lhbCIsInNpbGVuY2VkIiwiY29sb3JfTWF0Y2hXb25Mb3N0IiwibWFwX2ltYWdlIiwia2lsbHMiLCJkZWF0aHMiLCJhc3Npc3RzIiwiY2xpY2siLCJnZW5lcmF0ZUZ1bGxNYXRjaFBhbmUiLCJ3aW5kb3ciLCJvbiIsImUiLCJtYW5pZmVzdCIsImlzT25TY3JlZW4iLCJzZWwiLCJzaG93IiwiaGlkZSIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJ0cmlnZ2VyIiwic2xpZGVVcCIsImZ1bGxtYXRjaF9jb250YWluZXIiLCJ0ZWFtX2NvbnRhaW5lciIsImdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyIiwid2lubmVyIiwiaGFzQmFucyIsInAiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbG9yIiwic3RhdHMiLCJ2aWN0b3J5IiwiYmFucyIsImJhbiIsImxldmVsIiwib2xkIiwidGVhbUNvbG9yIiwibWF0Y2hTdGF0cyIsIm9kZEV2ZW4iLCJtYXRjaFBsYXllcklkIiwicGxheWVybmFtZSIsInJvd3N0YXRfdG9vbHRpcCIsImRlc2MiLCJyb3dzdGF0cyIsImtleSIsImNsYXNzIiwid2lkdGgiLCJ2YWx1ZSIsInZhbHVlRGlzcGxheSIsInN0YXQiLCJtYXgiLCJwZXJjZW50T25SYW5nZSIsIm1tckRlbHRhVHlwZSIsIm1tckRlbHRhUHJlZml4IiwiZGVsdGEiLCJtbXJEZWx0YSIsImhlcm9fbGV2ZWwiLCJsb2FkZXJodG1sIiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJ3aW4iLCJwYWRTaXplIiwidmlld3BvcnQiLCJ0b3AiLCJzY3JvbGxUb3AiLCJsZWZ0Iiwic2Nyb2xsTGVmdCIsInJpZ2h0IiwiYm90dG9tIiwiaGVpZ2h0IiwiYm91bmRzIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwiZXZlbnQiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGVBQWUsRUFB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QUFXLFVBQVgsQ0FBbEI7QUFDQSxRQUFJcVMsYUFBYTFULGFBQWFDLElBQWIsQ0FBa0JLLE1BQW5DOztBQUVBO0FBQ0FRLG9CQUFnQjZTLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q3RTLFdBQXhDO0FBQ0FxUyxlQUFXdlMsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0FnQixNQUFFLHdCQUFGLEVBQTRCbU4sRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU29FLEtBQVQsRUFBZ0I7QUFDckQ5Uyx3QkFBZ0I2UyxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0UyxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQWdCLE1BQUUsR0FBRixFQUFPbU4sRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNDLENBQVQsRUFBWTtBQUN4Q2lFLG1CQUFXdlMsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBN0NELEUiLCJmaWxlIjoicGxheWVyLWxvYWRlci4wM2M2OTBhZTdlZWVkNGQzN2E4OC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGZlMTY0MGYyNTAyM2U5NTlkZmJmIiwiLypcclxuICogUGxheWVyIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBQbGF5ZXJMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXggPSB7XHJcbiAgICAvKlxyXG4gICAgICogRXhlY3V0ZXMgZnVuY3Rpb24gYWZ0ZXIgZ2l2ZW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIGRlbGF5OiBmdW5jdGlvbihtaWxsaXNlY29uZHMsIGZ1bmMpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmMsIG1pbGxpc2Vjb25kcyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2Vhc29uIHNlbGVjdGVkIGJhc2VkIG9uIGZpbHRlclxyXG4gICAgICovXHJcbiAgICBnZXRTZWFzb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2V0U2VsZWN0b3JWYWx1ZXMoXCJzZWFzb25cIik7XHJcblxyXG4gICAgICAgIGxldCBzZWFzb24gPSBcIlVua25vd25cIjtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsICE9PSBudWxsICYmIHZhbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWFzb247XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG4gICAgICAgIGxldCBhamF4X21hdGNoZXMgPSBhamF4Lm1hdGNoZXM7XHJcbiAgICAgICAgbGV0IGFqYXhfdG9waGVyb2VzID0gYWpheC50b3BoZXJvZXM7XHJcbiAgICAgICAgbGV0IGFqYXhfcGFydGllcyA9IGFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tbXIgPSBkYXRhLm1tcjtcclxuICAgICAgICBsZXQgZGF0YV90b3BtYXBzID0gZGF0YS50b3BtYXBzO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8kKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJwbGF5ZXJsb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vLS0gSW5pdGlhbCBNYXRjaGVzIEZpcnN0IExvYWRcclxuICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1sb2FkZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwbGF5ZXJsb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTN4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tbXIgPSBqc29uLm1tcjtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tbXIuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgYWpheF90b3BoZXJvZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfdG9wbWFwcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgYWpheF9wYXJ0aWVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJy5pbml0aWFsLWxvYWQnKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIE1NUlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21tci5nZW5lcmF0ZU1NUkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tbXIuZ2VuZXJhdGVNTVJCYWRnZXMoanNvbl9tbXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5sb2FkKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4X3RvcGhlcm9lcy5sb2FkKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgUGFydGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4X3BhcnRpZXMubG9hZCgpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wbGF5ZXJsb2FkZXItcHJvY2Vzc2luZycpLmZhZGVJbigpLmRlbGF5KDI1MCkucXVldWUoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS50b3BoZXJvZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3RvcGhlcm9lc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyBUb3AgSGVyb2VzIGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9waGVyb2VzID0gZGF0YS50b3BoZXJvZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFRvcCBIZXJvZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZXMgPSBqc29uLmhlcm9lcztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hcHMgPSBqc29uLm1hcHM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9oZXJvZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyKGpzb24ubWF0Y2hlc193aW5yYXRlLCBqc29uLm1hdGNoZXNfd2lucmF0ZV9yYXcsIGpzb24ubWF0Y2hlc19wbGF5ZWQsIGpzb24ubXZwX21lZGFsc19wZXJjZW50YWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wSGVyb2VzVGFibGUgPSBkYXRhX3RvcGhlcm9lcy5nZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyhqc29uX2hlcm9lcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhLnB1c2goZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuaW5pdFRvcEhlcm9lc1RhYmxlKHRvcEhlcm9lc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIE1hcHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWFwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcE1hcHNUYWJsZSA9IGRhdGFfdG9wbWFwcy5nZXRUb3BNYXBzVGFibGVDb25maWcoanNvbl9tYXBzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvcE1hcHNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFwIG9mIGpzb25fbWFwcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEobWFwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuaW5pdFRvcE1hcHNUYWJsZSh0b3BNYXBzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9wYXJ0aWVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFBhcnRpZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfcGFydGllcyA9IGRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFBhcnRpZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9wYXJ0aWVzID0ganNvbi5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fcGFydGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc0NvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydGllc1RhYmxlID0gZGF0YV9wYXJ0aWVzLmdldFBhcnRpZXNUYWJsZUNvbmZpZyhqc29uX3BhcnRpZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0eSBvZiBqc29uX3BhcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEucHVzaChkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhKHBhcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuaW5pdFBhcnRpZXNUYWJsZShwYXJ0aWVzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogMTAsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVNYXRjaFVybDogZnVuY3Rpb24obWF0Y2hfaWQpIHtcclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfbWF0Y2hcIiwge1xyXG4gICAgICAgICAgICBtYXRjaGlkOiBtYXRjaF9pZCxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMge2xpbWl0fSByZWNlbnQgbWF0Y2hlcyBvZmZzZXQgYnkge29mZnNldH0gZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBsZXQgZGlzcGxheU1hdGNoTG9hZGVyID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX29mZnNldHMgPSBqc29uLm9mZnNldHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9saW1pdHMgPSBqc29uLmxpbWl0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoZXMgPSBqc29uLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBuZXcgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSBqc29uX29mZnNldHMubWF0Y2hlcyArIHNlbGYuaW50ZXJuYWwubGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hdGNoIG9mIGpzb25fbWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFfbWF0Y2hlcy5pc01hdGNoR2VuZXJhdGVkKG1hdGNoLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5pbnRlcm5hbC5vZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9SZW1vdmUgaW5pdGlhbCBsb2FkXHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgdGhlIG1hdGNoIG9mIGdpdmVuIGlkIHRvIGJlIGRpc3BsYXllZCB1bmRlciBtYXRjaCBzaW1wbGV3aWRnZXRcclxuICAgICAqL1xyXG4gICAgbG9hZE1hdGNoOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSBzZWxmLmdlbmVyYXRlTWF0Y2hVcmwobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmdWxsbWF0Y2gtcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoID0ganNvbi5tYXRjaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzKG1hdGNoaWQsIGpzb25fbWF0Y2gpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZnVsbG1hdGNoLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtbXI6IHtcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1tbXItY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1tbXItY29udGFpbmVyXCIgY2xhc3M9XCJwbC1tbXItY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgbWFyZ2luLWJvdHRvbS1zcGFjZXItMSBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkJhZGdlczogZnVuY3Rpb24obW1ycykge1xyXG4gICAgICAgICAgICBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubW1yO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoJyNwbC1tbXItY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBtbXIgb2YgbW1ycykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1NUkJhZGdlKGNvbnRhaW5lciwgbW1yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJCYWRnZTogZnVuY3Rpb24oY29udGFpbmVyLCBtbXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tbXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgbW1yR2FtZVR5cGVJbWFnZSA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWdhbWVUeXBlSW1hZ2VcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9nYW1lVHlwZV9pY29uXycgKyBtbXIuZ2FtZVR5cGVfaW1hZ2UgKycucG5nXCI+JztcclxuICAgICAgICAgICAgbGV0IG1tcmltZyA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBtbXIucmFuayArJy5wbmdcIj4nO1xyXG4gICAgICAgICAgICBsZXQgbW1ydGllciA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXJcIj4nKyBtbXIudGllciArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBHYW1lVHlwZSBJbWFnZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtZ2FtZVR5cGVJbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tckdhbWVUeXBlSW1hZ2UgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgSW1hZ2VcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1yaW1nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRpZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJ0aWVyICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRvb2x0aXAgQXJlYVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtdG9vbHRpcC1hcmVhXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgc2VsZi5nZW5lcmF0ZU1NUlRvb2x0aXAobW1yKSArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJUb29sdGlwOiBmdW5jdGlvbihtbXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2PicrIG1tci5nYW1lVHlwZSArJzwvZGl2PjxkaXY+JysgbW1yLnJhdGluZyArJzwvZGl2PjxkaXY+JysgbW1yLnJhbmsgKycgJysgbW1yLnRpZXIgKyc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3BoZXJvZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBoZXJvTGltaXQ6IDUsIC8vSG93IG1hbnkgaGVyb2VzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcjogZnVuY3Rpb24od2lucmF0ZSwgd2lucmF0ZV9yYXcsIG1hdGNoZXNwbGF5ZWQsIG12cHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZVRleHQgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPjxkaXYgY2xhc3M9XCJkLWlubGluZS1ibG9jayB0b3BoZXJvZXMtaW5saW5lLXdpbnJhdGUgJysgZ29vZHdpbnJhdGUgKydcIj4nICtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1hdGNoZXNwbGF5ZWRjb250YWluZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcGhlcm9lcy1tYXRjaGVzcGxheWVkLWNvbnRhaW5lciB0b3BoZXJvZXMtc3BlY2lhbC1kYXRhXCI+PHNwYW4gY2xhc3M9XCJ0b3BoZXJvZXMtc3BlY2lhbC1kYXRhLWxhYmVsXCI+UGxheWVkOjwvc3Bhbj4gJysgbWF0Y2hlc3BsYXllZCArJyAoJysgd2lucmF0ZVRleHQgKycpPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtdnBwZXJjZW50Y29udGFpbmVyID0gJzxkaXYgY2xhc3M9XCJwbC10b3BoZXJvZXMtbXZwcGVyY2VudC1jb250YWluZXIgdG9waGVyb2VzLXNwZWNpYWwtZGF0YVwiPjxpbWcgY2xhc3M9XCJwbC10b3BoZXJvZXMtbXZwcGVyY2VudC1pbWFnZVwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsnc3Rvcm1fdWlfc2NvcmVzY3JlZW5fbXZwX212cF9ibHVlLnBuZ1wiPjxzcGFuIGNsYXNzPVwidG9waGVyb2VzLXNwZWNpYWwtZGF0YS1sYWJlbFwiPk1WUDo8L3NwYW4+ICcrIG12cHBlcmNlbnQgKyclPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVzcGxheWVkY29udGFpbmVyICtcclxuICAgICAgICAgICAgICAgIG12cHBlcmNlbnRjb250YWluZXIgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGxheWVyLWxlZnRwYW5lLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvKSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEhlcm9cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBoZXJvZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWhlcm9wYW5lXCI+PGRpdj48aW1nIGNsYXNzPVwicGwtdGgtaHAtaGVyb2ltYWdlXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgaGVyby5pbWFnZV9oZXJvICsnLnBuZ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGEgY2xhc3M9XCJwbC10aC1ocC1oZXJvbmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge2lkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBoZXJvLm5hbWUgKyc8L2E+PC9kaXY+PC9kaXY+JztcclxuXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBLREFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBrZGEgPSAnPHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIGhlcm8ua2RhX2F2ZyArICc8L3NwYW4+IEtEQSc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhaW5kaXYgPSBoZXJvLmtpbGxzX2F2ZyArICcgLyA8c3BhbiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgaGVyby5kZWF0aHNfYXZnICsgJzwvc3Bhbj4gLyAnICsgaGVyby5hc3Npc3RzX2F2ZztcclxuXHJcbiAgICAgICAgICAgIGxldCBrZGFmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgYWN0dWFsXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1rZGFcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYSArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgaW5kaXZcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWluZGl2XCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPicgK1xyXG4gICAgICAgICAgICAgICAga2RhaW5kaXYgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5oZXJvTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9waGVyb2VzLXRhYmxlXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvcG1hcHM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXBMaW1pdDogNiwgLy9Ib3cgbWFueSB0b3AgbWFwcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BtYXBzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtdG9wbWFwcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPk1hcHM8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1taWQtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhOiBmdW5jdGlvbihtYXApIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBtYXBpbWFnZSA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBiZ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcrIGltYWdlX2JwYXRoICsndWkvbWFwX2ljb25fJysgbWFwLmltYWdlICsnLnBuZyk7XCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXBuYW1lID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcG5hbWVcIj4nKyBtYXAubmFtZSArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWFwaW5uZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwcGFuZVwiPicrIG1hcGltYWdlICsgbWFwbmFtZSArICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW21hcGlubmVyLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wTWFwc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS50b3BtYXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwubWFwTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BtYXBzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9wbWFwcy10YWJsZVwiIGNsYXNzPVwicGwtdG9wbWFwcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUb3BNYXBzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJ0aWVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgcGFydHlMaW1pdDogNCwgLy9Ib3cgbWFueSBwYXJ0aWVzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyOiBmdW5jdGlvbihsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcGFydGllcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJ1wiPlBhcnRpZXM8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtYm90LWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlRGF0YTogZnVuY3Rpb24ocGFydHkpIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWlubmVyID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiBwYXJ0eS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJ0eWlubmVyICs9ICc8ZGl2IGNsYXNzPVwicGwtcC1wLXBsYXllciBwbC1wLXAtcGxheWVyLScrIHBhcnR5LnBsYXllcnMubGVuZ3RoICsnXCI+PGEgY2xhc3M9XCJwbC1wLXAtcGxheWVybmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIHBsYXllci5uYW1lICsnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC1wYXJ0aWVzLXBhcnR5cGFuZVwiPicrIHBhcnR5aW5uZXIgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGFydHkud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwYXJ0eS5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3BhcnR5ZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRQYXJ0aWVzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5wYXJ0eUxpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXBhcnRpZXMtdGFibGVcIiBjbGFzcz1cInBsLXBhcnRpZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0UGFydGllc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsYXllci1yaWdodHBhbmUtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyIGluaXRpYWwtbG9hZCBob3RzdGF0dXMtc3ViY29udGFpbmVyIGhvcml6b250YWwtc2Nyb2xsZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsLW5vcmVjZW50bWF0Y2hlc1wiPk5vIFJlY2VudCBNYXRjaGVzIEZvdW5kLi4uPC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyBhbGwgc3ViY29tcG9uZW50cyBvZiBhIG1hdGNoIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBjb21wb25lbnQgY29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgb25lLXRpbWUgcGFydHkgY29sb3JzIGZvciBtYXRjaFxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IFsxLCAyLCAzLCA0LCA1XTsgLy9BcnJheSBvZiBjb2xvcnMgdG8gdXNlIGZvciBwYXJ0eSBhdCBpbmRleCA9IHBhcnR5SW5kZXggLSAxXHJcbiAgICAgICAgICAgIEhvdHN0YXR1cy51dGlsaXR5LnNodWZmbGUocGFydGllc0NvbG9ycyk7XHJcblxyXG4gICAgICAgICAgICAvL0xvZyBtYXRjaCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGZ1bGxHZW5lcmF0ZWQ6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaGFzIGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgICAgICAgICAgZnVsbERpc3BsYXk6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbWF0Y2hQbGF5ZXI6IG1hdGNoLnBsYXllci5pZCwgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWVzQ29sb3JzOiBwYXJ0aWVzQ29sb3JzLCAvL0NvbG9ycyB0byB1c2UgZm9yIHRoZSBwYXJ0eSBpbmRleGVzXHJcbiAgICAgICAgICAgICAgICBzaG93bjogdHJ1ZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgbWF0Y2hzaW1wbGV3aWRnZXQgaXMgZXhwZWN0ZWQgdG8gYmUgc2hvd24gaW5zaWRlIHZpZXdwb3J0XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hXaWRnZXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIFdpZGdldCBDb250YWluZXJcclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZV9kYXRlID0gSG90c3RhdHVzLmRhdGUuZ2V0UmVsYXRpdmVUaW1lKHRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gbWF0Y2gucGxheWVyLm1lZGFsO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHRhbGVudC5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaC5wbGF5ZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXJcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXBwLXBsYXllci1pbWFnZVwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBpbWFnZV9icGF0aCArIHBsYXllci5pbWFnZV9oZXJvICsnLnBuZ1wiPjwvc3Bhbj4nICsgcGFydHkgKyBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTIpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci0nKyBtYXRjaC5pZCArJ1wiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXJcIj4nICsgLy9IaWRlIGlubmVyIGNvbnRlbnRzIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtbGVmdHBhbmUgJyArIHNlbGYuY29sb3JfTWF0Y2hXb25Mb3N0KG1hdGNoLnBsYXllci53b24pICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyBpbWFnZV9icGF0aCArIG1hdGNoLm1hcF9pbWFnZSArJy5wbmcpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGUtdGV4dFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtYXRjaC5tYXAgKyAnXCI+JyArIG1hdGNoLmdhbWVUeXBlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZGF0ZS10ZXh0XCI+JyArIHJlbGF0aXZlX2RhdGUgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBtYXRjaC5wbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge2lkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1zdGF0c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3AtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtdGV4dFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBtYXRjaC5wbGF5ZXIua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIG1hdGNoLnBsYXllci5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBtYXRjaC5wbGF5ZXIuYXNzaXN0cyArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGFcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBtYXRjaC5wbGF5ZXIua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXRhbGVudHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXRwLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXBsYXllcnNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXBwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjbGljayBsaXN0ZW5lcnMgZm9yIGluc3BlY3QgcGFuZVxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUGFuZShtYXRjaC5pZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgc2Nyb2xsIGxpc3RlbmVyIGZvciBoaWRpbmcgb3V0c2lkZSBvZiB2aWV3cG9ydFxyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemUgc2Nyb2xsIGhvdHN0YXR1cy5tYXRjaHRvZ2dsZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWFuaWZlc3QgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmludGVybmFsLm1hdGNoTWFuaWZlc3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkKS5pc09uU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsID0gJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKFwiaG90c3RhdHVzLm1hdGNodG9nZ2xlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKFwiaG90c3RhdHVzLm1hdGNodG9nZ2xlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJyArIG1hdGNoaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2hcIj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmxvYWRNYXRjaChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2cgYXMgZ2VuZXJhdGVkIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzOiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBmdWxsbWF0Y2hfY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRlYW1zXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZnVsbG1hdGNoX2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCArJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlYW1fY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gUm93IEhlYWRlclxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcih0ZWFtX2NvbnRhaW5lciwgdGVhbSwgbWF0Y2gud2lubmVyID09PSB0LCBtYXRjaC5oYXNCYW5zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBwbGF5ZXJzIGZvciB0ZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9QbGF5ZXIgUm93XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxtYXRjaFJvdyhtYXRjaGlkLCB0ZWFtX2NvbnRhaW5lciwgcGxheWVyLCB0ZWFtLmNvbG9yLCBtYXRjaC5zdGF0cywgcCAlIDIsIHBhcnRpZXNDb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgYmFuLmltYWdlICsnLnBuZ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93aGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB2aWN0b3J5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBMZXZlbCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbGV2ZWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLmxldmVsICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vQmFucyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtYmFucy1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIGJhbnMgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWtkYS1jb250YWluZXJcIj5LREE8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vU3RhdGlzdGljcyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtc3RhdGlzdGljcy1jb250YWluZXJcIj5QZXJmb3JtYW5jZTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NbXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLW1tci1jb250YWluZXJcIj5NTVI6IDxzcGFuIGNsYXNzPVwicm0tZm0tcmgtbW1yXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLm1tci5vbGQucmF0aW5nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxtYXRjaFJvdzogZnVuY3Rpb24obWF0Y2hpZCwgY29udGFpbmVyLCBwbGF5ZXIsIHRlYW1Db2xvciwgbWF0Y2hTdGF0cywgb2RkRXZlbiwgcGFydGllc0NvdW50ZXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBwbGF5ZXJcclxuICAgICAgICAgICAgbGV0IG1hdGNoUGxheWVySWQgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLm1hdGNoUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllciBuYW1lXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJuYW1lID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoUGxheWVySWQpIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgcm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lICcrIHNpbGVuY2UocGxheWVyLnNpbGVuY2VkKSArJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVybmFtZSArPSBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTQpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBwbGF5ZXIubWVkYWw7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtaW5uZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLWZtLXItbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBpbWFnZV9icGF0aCArIG1lZGFsLmltYWdlICsgJ18nKyB0ZWFtQ29sb3IgKycucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1mbS1yLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gcGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLXRhbGVudFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHRhbGVudC5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1N0YXRzXHJcbiAgICAgICAgICAgIGxldCBzdGF0cyA9IHBsYXllci5zdGF0cztcclxuXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0X3Rvb2x0aXAgPSBmdW5jdGlvbiAodmFsLCBkZXNjKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsICsnPGJyPicrIGRlc2M7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdHMgPSBbXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlcm9fZGFtYWdlXCIsIGNsYXNzOiBcImhlcm9kYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVybyBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwic2llZ2VfZGFtYWdlXCIsIGNsYXNzOiBcInNpZWdlZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ1NpZWdlIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJtZXJjX2NhbXBzXCIsIGNsYXNzOiBcIm1lcmNjYW1wc1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdNZXJjIENhbXBzIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlYWxpbmdcIiwgY2xhc3M6IFwiaGVhbGluZ1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZWFsaW5nJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImRhbWFnZV90YWtlblwiLCBjbGFzczogXCJkYW1hZ2V0YWtlblwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdEYW1hZ2UgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZXhwX2NvbnRyaWJcIiwgY2xhc3M6IFwiZXhwY29udHJpYlwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdFeHBlcmllbmNlIENvbnRyaWJ1dGlvbid9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKHN0YXQgb2Ygcm93c3RhdHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXggPSBtYXRjaFN0YXRzW3N0YXQua2V5XVtcIm1heFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGVyY2VudE9uUmFuZ2UgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1heCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50T25SYW5nZSA9IChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSAvIChtYXggKiAxLjAwKSkgKiAxMDAuMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LndpZHRoID0gcGVyY2VudE9uUmFuZ2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZSA9IHN0YXRzW3N0YXQua2V5XTtcclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gc3RhdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSAnPHNwYW4gY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlci1ub25lXCI+JyArIHN0YXQudmFsdWUgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC50b29sdGlwID0gcm93c3RhdF90b29sdGlwKHN0YXQudmFsdWUsIHN0YXQudG9vbHRpcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC5odG1sID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzdGF0LnRvb2x0aXAgKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtcm93XCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtJysgc3RhdC5jbGFzcyArJyBybS1mbS1yLXN0YXRzLWJhclwiIHN0eWxlPVwid2lkdGg6ICcrIHN0YXQud2lkdGggKyclXCI+PC9kaXY+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyXCI+Jysgc3RhdC52YWx1ZURpc3BsYXkgKyc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NTVJcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhVHlwZSA9IFwibmVnXCI7XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVByZWZpeCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIubW1yLmRlbHRhID49IDApIHtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhVHlwZSA9IFwicG9zXCI7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVByZWZpeCA9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YSA9IHBsYXllci5tbXIucmFuayArJyAnKyBwbGF5ZXIubW1yLnRpZXIgKycgKDxzcGFuIGNsYXNzPVxcJ3JtLWZtLXItbW1yLWRlbHRhLScrIG1tckRlbHRhVHlwZSArJ1xcJz4nKyBtbXJEZWx0YVByZWZpeCArIHBsYXllci5tbXIuZGVsdGEgKyc8L3NwYW4+KSc7XHJcblxyXG4gICAgICAgICAgICAvL1BhcnR5XHJcbiAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcnR5ID0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eSBybS1wYXJ0eS1tZCBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktbWQgcm0tcGFydHktbWQtY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0J1aWxkIGh0bWxcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvdyBybS1mbS1yb3ctJysgb2RkRXZlbiArJ1wiPicgK1xyXG4gICAgICAgICAgICAvL1BhcnR5IFN0cmlwZVxyXG4gICAgICAgICAgICBwYXJ0eSArXHJcbiAgICAgICAgICAgIC8vSGVybyBJbWFnZSBDb250YWluZXIgKFdpdGggSGVybyBMZXZlbClcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9sZXZlbFwiPicrIHBsYXllci5oZXJvX2xldmVsICsnPC9kaXY+PGltZyBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgcGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01NUiBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci10b29sdGlwLWFyZWFcIiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIG1tckRlbHRhICsnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItbW1yXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBwbGF5ZXIubW1yLnJhbmsgKycucG5nXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLW51bWJlclwiPicrIHBsYXllci5tbXIudGllciArJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZXJodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlclwiPkxvYWQgTW9yZSBNYXRjaGVzLi4uPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChsb2FkZXJodG1sKTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMXggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vSnF1ZXJ5IGlzT25TY3JlZW4gKFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGNhbGxpbmcgc2VsZWN0b3IgaXMgaW5zaWRlIHRoZSB2aWV3cG9ydCArIHBhZGRlZCB6b25lIGZvciBzY3JvbGwgc21vb3RobmVzcylcclxuICAgICQuZm4uaXNPblNjcmVlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHdpbiA9ICQod2luZG93KTtcclxuXHJcbiAgICAgICAgbGV0IHBhZFNpemUgPSA2MDA7XHJcblxyXG4gICAgICAgIGxldCB2aWV3cG9ydCA9IHtcclxuICAgICAgICAgICAgdG9wIDogd2luLnNjcm9sbFRvcCgpIC0gcGFkU2l6ZSxcclxuICAgICAgICAgICAgbGVmdCA6IHdpbi5zY3JvbGxMZWZ0KCkgLSBwYWRTaXplXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2aWV3cG9ydC5yaWdodCA9IHZpZXdwb3J0LmxlZnQgKyB3aW4ud2lkdGgoKSArICgyICogcGFkU2l6ZSk7XHJcbiAgICAgICAgdmlld3BvcnQuYm90dG9tID0gdmlld3BvcnQudG9wICsgd2luLmhlaWdodCgpICsgKDIgKiBwYWRTaXplKTtcclxuXHJcbiAgICAgICAgbGV0IGJvdW5kcyA9IHRoaXMub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgIGlmICghYm91bmRzKSByZXR1cm4gZmFsc2U7IC8vQ2F0Y2ggdW5kZWZpbmVkIGJvdW5kcyBjYXVzZWQgYnkganF1ZXJ5IGFuaW1hdGlvbnMgb2Ygb2JqZWN0cyBvdXRzaWRlIG9mIHRoZSB2aWV3cG9ydFxyXG5cclxuICAgICAgICBib3VuZHMucmlnaHQgPSBib3VuZHMubGVmdCArIHRoaXMub3V0ZXJXaWR0aCgpO1xyXG4gICAgICAgIGJvdW5kcy5ib3R0b20gPSBib3VuZHMudG9wICsgdGhpcy5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCEodmlld3BvcnQucmlnaHQgPCBib3VuZHMubGVmdCB8fCB2aWV3cG9ydC5sZWZ0ID4gYm91bmRzLnJpZ2h0IHx8IHZpZXdwb3J0LmJvdHRvbSA8IGJvdW5kcy50b3AgfHwgdmlld3BvcnQudG9wID4gYm91bmRzLmJvdHRvbSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==