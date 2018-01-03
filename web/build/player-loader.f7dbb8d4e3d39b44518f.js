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
            if (json_mmr.length > 0) {
                data_mmr.generateMMRContainer();
                data_mmr.generateMMRBadges(json_mmr);
            }

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
            region: player_region,
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
            region: player_region,
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
            region: player_region,
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
                //Ensure control panel
                data_matches.generateRecentMatchesControlPanel();

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

                    //Update Control Panel graphs after match generation
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

                var graphdata_winrate = [data_matches.internal.chartdata_winrate["W"], data_matches.internal.chartdata_winrate["L"]];
                data_matches.updateGraphRecentMatchesWinrate(graphdata_winrate);

                //Set displayMatchLoader if we got as many matches as we asked for
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

            $('#pl-mmr-container-frame').append(html);
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

            $('#pl-topheroes-container-frame').append(html);
        },
        generateTopHeroesTableData: function generateTopHeroesTableData(hero) {
            /*
             * Hero
             */
            var herofield = '<div class="pl-th-heropane"><div><img class="pl-th-hp-heroimage" src="' + image_bpath + hero.image_hero + '.png"></div>' + '<div><a class="pl-th-hp-heroname" href="' + Routing.generate("playerhero", { region: player_region, id: player_id, heroProperName: hero.name }) + '" target="_blank">' + hero.name + '</a></div></div>';

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

                    partyinner += '<div class="pl-p-p-player pl-p-p-player-' + party.players.length + '"><a class="pl-p-p-playername" href="' + Routing.generate("player", { region: player_region, id: player.id }) + '" target="_blank">' + player.name + '</a></div>';
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
            compactView: false, //Whether or not the compact view is enabled for recent matches
            matchLoaderGenerated: false,
            chartdata_winrate: {
                "W": 0,
                "L": 0
            },
            charts: {}, //Object of all chartjs graphs related to matches
            controlPanelGenerated: false,
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        empty: function empty() {
            var self = PlayerLoader.data.matches;

            //Reset chartdata
            self.internal.chartdata_winrate = {
                "W": 0,
                "L": 0
            };

            //Clear charts object
            for (var chartkey in self.internal.charts) {
                if (self.internal.charts.hasOwnProperty(chartkey)) {
                    var chart = self.internal.charts[chartkey];
                    chart.destroy();
                }
            }

            self.internal.charts = {};

            $('#pl-recentmatches-container').remove();
            //compactView: leave the setting to whatever it is currently in between filter loads
            self.internal.controlPanelGenerated = false;
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
        generateRecentMatchesControlPanel: function generateRecentMatchesControlPanel() {
            var self = PlayerLoader.data.matches;

            if (!self.internal.controlPanelGenerated) {
                var container = $('#pl-recentmatches-container');

                var html = '<div class="pl-recentmatch-controlpanel">' +
                //Winrate Graph
                '<div class="pl-rm-cp-winrate-chart-container">' + '<div id="pl-rm-cp-winrate-percent"></div>' + '<canvas id="pl-rm-cp-winrate-chart"></canvas>' + '</div>' + '<div class="pl-rm-cp-winrate-longtext-container">' + 'testing123' + '</div>' + '</div>';

                container.append(html);

                //Generate graphs
                self.generateGraphRecentMatchesWinrate();

                self.internal.controlPanelGenerated = true;
            }
        },
        generateGraphRecentMatchesWinrate: function generateGraphRecentMatchesWinrate() {
            var self = PlayerLoader.data.matches;

            var data = {
                datasets: [{
                    data: [1], //Empty initial data
                    backgroundColor: ["#3be159", "#cd2e2d"],
                    borderColor: ["#1c2223", "#1c2223"],
                    borderWidth: [1, 1]
                }]
            };

            var options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                hover: {
                    mode: null
                }
            };

            self.internal.charts["winrate"] = new Chart($('#pl-rm-cp-winrate-chart'), {
                type: 'doughnut',
                data: data,
                options: options
            });
        },
        updateGraphRecentMatchesWinrate: function updateGraphRecentMatchesWinrate(chartdata) {
            var self = PlayerLoader.data.matches;

            var chart = self.internal.charts.winrate;

            if (chart) {
                //Update winrate display
                var wins = chartdata[0] * 1.0;
                var losses = chartdata[1] * 1.0;
                var winrate = 100.0;
                var winrate_display = winrate;
                if (losses > 0) {
                    winrate = wins / (wins + losses) * 100.0;
                    winrate_display = winrate;
                    winrate_display = winrate_display.toFixed(0);
                }

                var goodwinrate = 'pl-th-wr-winrate';
                if (winrate <= 49) {
                    goodwinrate = 'pl-th-wr-winrate-bad';
                }
                if (winrate <= 40) {
                    goodwinrate = 'pl-th-wr-winrate-terrible';
                }
                if (winrate >= 51) {
                    goodwinrate = 'pl-th-wr-winrate-good';
                }
                if (winrate >= 60) {
                    goodwinrate = 'pl-th-wr-winrate-great';
                }

                var winratefield = '<div class="' + goodwinrate + '">' + winrate_display + '%' + '</div>';

                $('#pl-rm-cp-winrate-percent').html(winratefield);

                //Set new data
                chart.data.datasets[0].data = chartdata;

                //Update chart (duration: 0 = means no animation)
                chart.update();
            }
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
                shown: true, //Whether or not the matchsimplewidget is expected to be shown inside viewport
                showCompact: true //Whether or not the compact matchsimplewidget is expected to be shown inside viewport when compact mode is on
            };

            //Track winrate for graphs
            if (match.player.won) {
                self.internal.chartdata_winrate["W"]++;
            } else {
                self.internal.chartdata_winrate["L"]++;
            }

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
                        var path = image_bpath + 'ui/icon_toxic.png';
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

                            var special = '<a class="' + silence(player.silenced) + '" href="' + Routing.generate("player", { region: match.region, id: player.id }) + '" target="_blank">';
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
            '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + image_bpath + match.map_image + '.png);">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + image_bpath + match.player.image_hero + '.png"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("playerhero", { region: match.region, id: player_id, heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + match.player.kda + '</span> KDA</div></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div></div>';

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Generate hidden compact view widget
            self.generateCompactViewMatchWidget(match);

            //Create click listeners for inspect pane
            $('#recentmatch-simplewidget-inspect-' + match.id).click(function () {
                var t = $(this);

                self.generateFullMatchPane(match.id);
            });

            //Create scroll listener for hiding outside of viewport
            $(window).on("resize scroll hotstatus.matchtoggle hotstatus.compacttoggle", function (e) {
                var manifest = PlayerLoader.data.matches.internal.matchManifest;

                if (manifest[match.id + ""]) {
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
                }
            });
        },
        generateCompactViewMatchWidget: function generateCompactViewMatchWidget(match) {
            var self = PlayerLoader.data.matches;

            var timestamp = match.date;
            var date = new Date(timestamp * 1000).toLocaleString();
            var match_time = Hotstatus.date.getMinuteSecondTime(match.match_length);
            var victoryText = match.player.won ? '<span class="pl-recentmatch-won">Victory</span>' : '<span class="pl-recentmatch-lost">Defeat</span>';

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
                        var path = image_bpath + 'ui/icon_toxic.png';
                        s += '<span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<span class=\'rm-sw-link-toxic\'>Silenced</span>"><img class="rm-sw-toxic" style="width:' + size + 'px;height:' + size + 'px;" src="' + path + '"></span>';
                    }
                }

                return s;
            };

            //GameType
            var gameType = match.gameType;
            var gameType_display = gameType;
            if (gameType === "Hero League") {
                gameType_display = '<div class="rm-sw-compact-gtp-gameType rm-sw-compact-gtp-gameType-hl">HL</div>';
            } else if (gameType === "Team League") {
                gameType_display = '<div class="rm-sw-compact-gtp-gameType rm-sw-compact-gtp-gameType-tl">TL</div>';
            } else if (gameType === "Unranked Draft") {
                gameType_display = '<div class="rm-sw-compact-gtp-gameType rm-sw-compact-gtp-gameType-ud">UD</div>';
            } else if (gameType === "Quick Match") {
                gameType_display = '<div class="rm-sw-compact-gtp-gameType rm-sw-compact-gtp-gameType-qm">QM</div>';
            }

            //Hero
            var hero = match.player.hero;

            var html = '<div id="recentmatch-container-compact-' + match.id + '"><div id="recentmatch-simplewidget-compact-' + match.id + '" class="recentmatch-simplewidget-compact">' + '<div id="recentmatch-simplewidget-outline-container-compact-' + match.id + '" class="recentmatch-simplewidget-outline-container-compact">' + //Hide inner contents container
            //Victory Pane
            '<div class="rm-sw-compact-victorypane">' + '<div class="rm-sw-compact-vp-victory">' + victoryText + '</div>' + '</div>' +
            //GameType Pane
            '<div class="rm-sw-compact-gametypepane">' + gameType_display + '</div>' +
            //Hero Pane
            '<div class="rm-sw-compact-heropane">' + '<div class="rm-sw-compact-hp-hero pl-th-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("playerhero", { region: match.region, id: player_id, heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' +
            //Map Pane
            '<div class="rm-sw-compact-mappane">' + '<div class="rm-sw-compact-mp-map">' + match.map + '</div>' + '</div>' +
            //Match Length Pane
            '<div class="rm-sw-compact-matchlengthpane">' + '<div class="rm-sw-compact-mlp-matchlength">' + match_time + '</div>' + '</div>' +
            //Date Pane
            '<div class="rm-sw-compact-datepane">' + '<div class="rm-sw-compact-dp-date">' + date + '</div>' + '</div>' +
            //Inspect
            '<div id="recentmatch-simplewidget-inspect-compact-' + match.id + '" class="recentmatch-simplewidget-inspect-compact">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div></div>';

            $('#recentmatch-container-' + match.id).append(html);

            //Hide by default
            //$('#recentmatch-simplewidget-outline-container-compact-' + match.id).hide();

            //Create click listeners for inspect pane
            $('#recentmatch-simplewidget-inspect-compact-' + match.id).click(function () {
                var t = $(this);

                self.generateFullMatchPane(match.id);
            });

            //Create scroll listener for hiding outside of viewport
            $(window).on("resize scroll hotstatus.matchtoggle hotstatus.compacttoggle", function (e) {
                var internal = PlayerLoader.data.matches.internal;
                var manifest = internal.matchManifest;

                if (internal.compactView && manifest[match.id + ""]) {
                    if ($('#recentmatch-simplewidget-compact-' + match.id).isOnScreen()) {
                        var sel = $('#recentmatch-simplewidget-outline-container-compact-' + match.id);

                        if (!manifest[match.id + ""].shownCompact) {
                            sel.show();
                            manifest[match.id + ""].shownCompact = true;
                        }
                    } else {
                        var _sel2 = $('#recentmatch-simplewidget-outline-container-compact-' + match.id);

                        if (manifest[match.id + ""].shownCompact) {
                            _sel2.hide();
                            manifest[match.id + ""].shownCompact = false;
                        }
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
                            self.generateFullmatchRow(matchid, match.region, team_container, player, team.color, match.stats, p % 2, partiesCounter);

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
        generateFullmatchRow: function generateFullmatchRow(matchid, matchregion, container, player, teamColor, matchStats, oddEven, partiesCounter) {
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
                        var path = image_bpath + 'ui/icon_toxic.png';
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
                special = '<a class="rm-fm-r-playername ' + silence(player.silenced) + '" href="' + Routing.generate("player", { region: matchregion, id: player.id }) + '" target="_blank">';
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
    var baseUrl = Routing.generate('playerdata_pagedata_player', { region: player_region, player: player_id });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTZlYjNlYWQ3ZGQ4MDljZWRkMDQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInJlZ2lvbiIsInBsYXllcl9yZWdpb24iLCJwbGF5ZXIiLCJwbGF5ZXJfaWQiLCJkYXRhX3RvcGhlcm9lcyIsImpzb25faGVyb2VzIiwiaGVyb2VzIiwianNvbl9tYXBzIiwibWFwcyIsImdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyIiwibWF0Y2hlc193aW5yYXRlIiwibWF0Y2hlc193aW5yYXRlX3JhdyIsIm1hdGNoZXNfcGxheWVkIiwibXZwX21lZGFsc19wZXJjZW50YWdlIiwiZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSIsInRvcEhlcm9lc1RhYmxlIiwiZ2V0VG9wSGVyb2VzVGFibGVDb25maWciLCJoZXJvIiwicHVzaCIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhIiwiaW5pdFRvcEhlcm9lc1RhYmxlIiwiZ2VuZXJhdGVUb3BNYXBzQ29udGFpbmVyIiwiZ2VuZXJhdGVUb3BNYXBzVGFibGUiLCJ0b3BNYXBzVGFibGUiLCJnZXRUb3BNYXBzVGFibGVDb25maWciLCJtYXAiLCJnZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEiLCJpbml0VG9wTWFwc1RhYmxlIiwiZGF0YV9wYXJ0aWVzIiwianNvbl9wYXJ0aWVzIiwiZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGUiLCJwYXJ0aWVzVGFibGUiLCJnZXRQYXJ0aWVzVGFibGVDb25maWciLCJwYXJ0eSIsImdlbmVyYXRlUGFydGllc1RhYmxlRGF0YSIsImluaXRQYXJ0aWVzVGFibGUiLCJtYXRjaGxvYWRpbmciLCJtYXRjaHVybCIsImdlbmVyYXRlTWF0Y2hVcmwiLCJtYXRjaF9pZCIsIm1hdGNoaWQiLCJkaXNwbGF5TWF0Y2hMb2FkZXIiLCJqc29uX29mZnNldHMiLCJvZmZzZXRzIiwianNvbl9saW1pdHMiLCJqc29uX21hdGNoZXMiLCJnZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250cm9sUGFuZWwiLCJtYXRjaCIsImlzTWF0Y2hHZW5lcmF0ZWQiLCJpZCIsImdlbmVyYXRlTWF0Y2giLCJncmFwaGRhdGFfd2lucmF0ZSIsImNoYXJ0ZGF0YV93aW5yYXRlIiwidXBkYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZSIsImdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJodG1sIiwibW1ycyIsImNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2UiLCJtbXJHYW1lVHlwZUltYWdlIiwiaW1hZ2VfYnBhdGgiLCJnYW1lVHlwZV9pbWFnZSIsIm1tcmltZyIsInJhbmsiLCJtbXJ0aWVyIiwidGllciIsImdlbmVyYXRlTU1SVG9vbHRpcCIsImdhbWVUeXBlIiwicmF0aW5nIiwiaGVyb0xpbWl0Iiwid2lucmF0ZSIsIndpbnJhdGVfcmF3IiwibWF0Y2hlc3BsYXllZCIsIm12cHBlcmNlbnQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVUZXh0IiwibWF0Y2hlc3BsYXllZGNvbnRhaW5lciIsIm12cHBlcmNlbnRjb250YWluZXIiLCJoZXJvZmllbGQiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJuYW1lIiwiZ29vZGtkYSIsImtkYV9yYXciLCJrZGEiLCJrZGFfYXZnIiwia2RhaW5kaXYiLCJraWxsc19hdmciLCJkZWF0aHNfYXZnIiwiYXNzaXN0c19hdmciLCJrZGFmaWVsZCIsIndpbnJhdGVmaWVsZCIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsImNvbXBhY3RWaWV3IiwibWF0Y2hMb2FkZXJHZW5lcmF0ZWQiLCJjaGFydHMiLCJjb250cm9sUGFuZWxHZW5lcmF0ZWQiLCJtYXRjaE1hbmlmZXN0IiwiY2hhcnRrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImNoYXJ0IiwiZGVzdHJveSIsImdlbmVyYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZSIsImRhdGFzZXRzIiwiYmFja2dyb3VuZENvbG9yIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJtYWludGFpbkFzcGVjdFJhdGlvIiwibGVnZW5kIiwiZGlzcGxheSIsInRvb2x0aXBzIiwiZW5hYmxlZCIsImhvdmVyIiwibW9kZSIsIkNoYXJ0IiwidHlwZSIsImNoYXJ0ZGF0YSIsIndpbnMiLCJsb3NzZXMiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJ0b0ZpeGVkIiwidXBkYXRlIiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJzaG93biIsInNob3dDb21wYWN0Iiwid29uIiwiZ2VuZXJhdGVNYXRjaFdpZGdldCIsInRpbWVzdGFtcCIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0IiwibWVkYWwiLCJzaWxlbmNlIiwiaXNTaWxlbmNlZCIsInIiLCJzaWxlbmNlX2ltYWdlIiwic2l6ZSIsInMiLCJwYXRoIiwibWVkYWxodG1sIiwibm9tZWRhbGh0bWwiLCJleGlzdHMiLCJkZXNjX3NpbXBsZSIsInRhbGVudHNodG1sIiwiaSIsInRhbGVudHMiLCJ0YWxlbnQiLCJ0YWxlbnR0b29sdGlwIiwicGxheWVyc2h0bWwiLCJwYXJ0aWVzQ291bnRlciIsInQiLCJ0ZWFtcyIsInRlYW0iLCJwYXJ0eU9mZnNldCIsInBhcnR5Q29sb3IiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJjb2xvcl9NYXRjaFdvbkxvc3QiLCJtYXBfaW1hZ2UiLCJraWxscyIsImRlYXRocyIsImFzc2lzdHMiLCJnZW5lcmF0ZUNvbXBhY3RWaWV3TWF0Y2hXaWRnZXQiLCJjbGljayIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIndpbmRvdyIsIm9uIiwiZSIsIm1hbmlmZXN0IiwiaXNPblNjcmVlbiIsInNlbCIsInNob3ciLCJoaWRlIiwiZ2FtZVR5cGVfZGlzcGxheSIsInNob3duQ29tcGFjdCIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJ0cmlnZ2VyIiwic2xpZGVVcCIsImZ1bGxtYXRjaF9jb250YWluZXIiLCJ0ZWFtX2NvbnRhaW5lciIsImdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyIiwid2lubmVyIiwiaGFzQmFucyIsInAiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbG9yIiwic3RhdHMiLCJ2aWN0b3J5IiwiYmFucyIsImJhbiIsImxldmVsIiwib2xkIiwibWF0Y2hyZWdpb24iLCJ0ZWFtQ29sb3IiLCJtYXRjaFN0YXRzIiwib2RkRXZlbiIsIm1hdGNoUGxheWVySWQiLCJwbGF5ZXJuYW1lIiwicm93c3RhdF90b29sdGlwIiwiZGVzYyIsInJvd3N0YXRzIiwia2V5IiwiY2xhc3MiLCJ3aWR0aCIsInZhbHVlIiwidmFsdWVEaXNwbGF5Iiwic3RhdCIsIm1heCIsInBlcmNlbnRPblJhbmdlIiwibW1yRGVsdGFUeXBlIiwibW1yRGVsdGFQcmVmaXgiLCJkZWx0YSIsIm1tckRlbHRhIiwiaGVyb19sZXZlbCIsImxvYWRlcmh0bWwiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsIndpbiIsInBhZFNpemUiLCJ2aWV3cG9ydCIsInRvcCIsInNjcm9sbFRvcCIsImxlZnQiLCJzY3JvbGxMZWZ0IiwicmlnaHQiLCJib3R0b20iLCJoZWlnaHQiLCJib3VuZHMiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0I7QUFDaEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5lLENBQXBCOztBQVNBOzs7QUFHQUgsYUFBYUMsSUFBYixDQUFrQkssTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURhO0FBTXZCOzs7O0FBSUFELFNBQUssZUFBcUI7QUFBQSxZQUFaQSxJQUFZLHVFQUFOLElBQU07O0FBQ3RCLFlBQUlFLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0JLLE1BQTdCOztBQUVBLFlBQUlHLFNBQVEsSUFBWixFQUFrQjtBQUNkLG1CQUFPRSxLQUFLSixRQUFMLENBQWNFLEdBQXJCO0FBQ0gsU0FGRCxNQUdLO0FBQ0RFLGlCQUFLSixRQUFMLENBQWNFLEdBQWQsR0FBb0JBLElBQXBCO0FBQ0EsbUJBQU9FLElBQVA7QUFDSDtBQUNKLEtBcEJzQjtBQXFCdkI7OztBQUdBQyxlQUFXLHFCQUFXO0FBQ2xCLFlBQUlDLE1BQU1DLGdCQUFnQkMsaUJBQWhCLENBQWtDLFFBQWxDLENBQVY7O0FBRUEsWUFBSUMsU0FBUyxTQUFiOztBQUVBLFlBQUksT0FBT0gsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVJLE1BQTlDLEVBQXNEO0FBQ2xERCxxQkFBU0gsR0FBVDtBQUNILFNBRkQsTUFHSyxJQUFJQSxRQUFRLElBQVIsSUFBZ0JBLElBQUlLLE1BQUosR0FBYSxDQUFqQyxFQUFvQztBQUNyQ0YscUJBQVNILElBQUksQ0FBSixDQUFUO0FBQ0g7O0FBRUQsZUFBT0csTUFBUDtBQUNILEtBckNzQjtBQXNDdkI7OztBQUdBRyxrQkFBYyxzQkFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDekMsWUFBSVYsT0FBT1gsYUFBYUMsSUFBYixDQUFrQkssTUFBN0I7O0FBRUEsWUFBSSxDQUFDSyxLQUFLSixRQUFMLENBQWNDLE9BQWYsSUFBMEJNLGdCQUFnQlEsWUFBOUMsRUFBNEQ7QUFDeEQsZ0JBQUliLE1BQU1LLGdCQUFnQlMsV0FBaEIsQ0FBNEJILE9BQTVCLEVBQXFDQyxXQUFyQyxDQUFWOztBQUVBLGdCQUFJWixRQUFRRSxLQUFLRixHQUFMLEVBQVosRUFBd0I7QUFDcEJFLHFCQUFLRixHQUFMLENBQVNBLEdBQVQsRUFBY2UsSUFBZDtBQUNIO0FBQ0o7QUFDSixLQW5Ec0I7QUFvRHZCOzs7O0FBSUFBLFVBQU0sZ0JBQVc7QUFDYixZQUFJdkIsT0FBT0QsYUFBYUMsSUFBeEI7QUFDQSxZQUFJVSxPQUFPWCxhQUFhQyxJQUFiLENBQWtCSyxNQUE3QjtBQUNBLFlBQUltQixlQUFleEIsS0FBS3lCLE9BQXhCO0FBQ0EsWUFBSUMsaUJBQWlCMUIsS0FBSzJCLFNBQTFCO0FBQ0EsWUFBSUMsZUFBZTVCLEtBQUs2QixPQUF4Qjs7QUFFQSxZQUFJQyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUMsV0FBV0QsS0FBS0UsR0FBcEI7QUFDQSxZQUFJQyxlQUFlSCxLQUFLSSxPQUF4QjtBQUNBLFlBQUlDLGVBQWVMLEtBQUtMLE9BQXhCOztBQUVBO0FBQ0FmLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQTs7QUFFQTtBQUNBNkIsVUFBRSwwQkFBRixFQUE4QkMsTUFBOUIsQ0FBcUMscUlBQXJDOztBQUVBO0FBQ0FELFVBQUVFLE9BQUYsQ0FBVTVCLEtBQUtKLFFBQUwsQ0FBY0UsR0FBeEIsRUFDSytCLElBREwsQ0FDVSxVQUFTQyxZQUFULEVBQXVCO0FBQ3pCLGdCQUFJQyxPQUFPRCxhQUFhOUIsS0FBS0osUUFBTCxDQUFjRyxPQUEzQixDQUFYO0FBQ0EsZ0JBQUlpQyxXQUFXRCxLQUFLVCxHQUFwQjs7QUFFQTs7O0FBR0FELHFCQUFTWSxLQUFUO0FBQ0FuQix5QkFBYW9CLEtBQWI7QUFDQWxCLDJCQUFla0IsS0FBZjtBQUNBWCx5QkFBYVUsS0FBYjtBQUNBZix5QkFBYWdCLEtBQWI7O0FBRUE7OztBQUdBUixjQUFFLGVBQUYsRUFBbUJTLFdBQW5CLENBQStCLGNBQS9COztBQUVBOzs7QUFHQSxnQkFBSUgsU0FBU3pCLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDckJjLHlCQUFTZSxvQkFBVDtBQUNBZix5QkFBU2dCLGlCQUFULENBQTJCTCxRQUEzQjtBQUNIOztBQUVEOzs7QUFHQVAseUJBQWFhLDhCQUFiOztBQUVBeEIseUJBQWFsQixRQUFiLENBQXNCMkMsTUFBdEIsR0FBK0IsQ0FBL0I7QUFDQXpCLHlCQUFhbEIsUUFBYixDQUFzQjRDLEtBQXRCLEdBQThCVCxLQUFLVSxNQUFMLENBQVkxQixPQUExQzs7QUFFQTtBQUNBRCx5QkFBYUQsSUFBYjs7QUFFQTs7O0FBR0FHLDJCQUFlSCxJQUFmOztBQUVBOzs7QUFHQUsseUJBQWFMLElBQWI7O0FBR0E7QUFDQWEsY0FBRSx5QkFBRixFQUE2QmdCLE9BQTdCOztBQUVBOzs7QUFHQUMsc0JBQVVDLFdBQVYsQ0FBc0JDLG1CQUF0QjtBQUNILFNBeERMLEVBeURLQyxJQXpETCxDQXlEVSxZQUFXO0FBQ2I7QUFDSCxTQTNETCxFQTRES0MsTUE1REwsQ0E0RFksWUFBVztBQUNmO0FBQ0FyRCx1QkFBVyxZQUFXO0FBQ2xCZ0Msa0JBQUUsMEJBQUYsRUFBOEJzQixNQUE5QixHQUF1Q3pELEtBQXZDLENBQTZDLEdBQTdDLEVBQWtEMEQsS0FBbEQsQ0FBd0QsWUFBVTtBQUM5RHZCLHNCQUFFLElBQUYsRUFBUXdCLE1BQVI7QUFDSCxpQkFGRDtBQUdILGFBSkQ7O0FBTUFsRCxpQkFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0gsU0FyRUw7O0FBdUVBLGVBQU9HLElBQVA7QUFDSDtBQXJKc0IsQ0FBM0I7O0FBd0pBWCxhQUFhQyxJQUFiLENBQWtCMkIsU0FBbEIsR0FBOEI7QUFDMUJyQixjQUFVO0FBQ05DLGlCQUFTLEtBREgsRUFDVTtBQUNoQkMsYUFBSyxFQUZDLEVBRUc7QUFDVEMsaUJBQVMsTUFISCxDQUdXO0FBSFgsS0FEZ0I7QUFNMUJtQyxXQUFPLGlCQUFXO0FBQ2QsWUFBSWxDLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0IyQixTQUE3Qjs7QUFFQWpCLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixLQUF4QjtBQUNBRyxhQUFLSixRQUFMLENBQWNFLEdBQWQsR0FBb0IsRUFBcEI7QUFDQVQscUJBQWErQixJQUFiLENBQWtCSCxTQUFsQixDQUE0QmdCLEtBQTVCO0FBQ0gsS0FaeUI7QUFhMUJyQixpQkFBYSx1QkFBVztBQUNwQixZQUFJWixPQUFPWCxhQUFhQyxJQUFiLENBQWtCMkIsU0FBN0I7O0FBRUEsWUFBSWtDLE9BQU9DLFFBQVFDLFFBQVIsQ0FBaUIsc0NBQWpCLEVBQXlEO0FBQ2hFQyxvQkFBUUMsYUFEd0Q7QUFFaEVDLG9CQUFRQztBQUZ3RCxTQUF6RCxDQUFYOztBQUtBLGVBQU90RCxnQkFBZ0JTLFdBQWhCLENBQTRCdUMsSUFBNUIsRUFBa0MsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQyxDQUFQO0FBQ0gsS0F0QnlCO0FBdUIxQjs7OztBQUlBdEMsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUsyQixTQUFoQjs7QUFFQSxZQUFJRyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSXNDLGlCQUFpQnRDLEtBQUtILFNBQTFCO0FBQ0EsWUFBSU0sZUFBZUgsS0FBS0ksT0FBeEI7O0FBRUE7QUFDQXhCLGFBQUtKLFFBQUwsQ0FBY0UsR0FBZCxHQUFvQkUsS0FBS1ksV0FBTCxFQUFwQjs7QUFFQTtBQUNBWixhQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsSUFBeEI7O0FBRUE7QUFDQTZCLFVBQUVFLE9BQUYsQ0FBVTVCLEtBQUtKLFFBQUwsQ0FBY0UsR0FBeEIsRUFDSytCLElBREwsQ0FDVSxVQUFTQyxZQUFULEVBQXVCO0FBQ3pCLGdCQUFJQyxPQUFPRCxhQUFhOUIsS0FBS0osUUFBTCxDQUFjRyxPQUEzQixDQUFYO0FBQ0EsZ0JBQUk0RCxjQUFjNUIsS0FBSzZCLE1BQXZCO0FBQ0EsZ0JBQUlDLFlBQVk5QixLQUFLK0IsSUFBckI7O0FBRUE7OztBQUdBLGdCQUFJSCxZQUFZcEQsTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUN4Qm1ELCtCQUFlSywwQkFBZixDQUEwQ2hDLEtBQUtpQyxlQUEvQyxFQUFnRWpDLEtBQUtrQyxtQkFBckUsRUFBMEZsQyxLQUFLbUMsY0FBL0YsRUFBK0duQyxLQUFLb0MscUJBQXBIOztBQUVBVCwrQkFBZVUsc0JBQWY7O0FBRUEsb0JBQUlDLGlCQUFpQlgsZUFBZVksdUJBQWYsQ0FBdUNYLFlBQVlwRCxNQUFuRCxDQUFyQjs7QUFFQThELCtCQUFlakQsSUFBZixHQUFzQixFQUF0QjtBQVB3QjtBQUFBO0FBQUE7O0FBQUE7QUFReEIseUNBQWlCdUMsV0FBakIsOEhBQThCO0FBQUEsNEJBQXJCWSxJQUFxQjs7QUFDMUJGLHVDQUFlakQsSUFBZixDQUFvQm9ELElBQXBCLENBQXlCZCxlQUFlZSwwQkFBZixDQUEwQ0YsSUFBMUMsQ0FBekI7QUFDSDtBQVZ1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVl4QmIsK0JBQWVnQixrQkFBZixDQUFrQ0wsY0FBbEM7QUFDSDs7QUFFRDs7O0FBR0EsZ0JBQUlSLFVBQVV0RCxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO0FBQ3RCZ0IsNkJBQWFvRCx3QkFBYjs7QUFFQXBELDZCQUFhcUQsb0JBQWI7O0FBRUEsb0JBQUlDLGVBQWV0RCxhQUFhdUQscUJBQWIsQ0FBbUNqQixVQUFVdEQsTUFBN0MsQ0FBbkI7O0FBRUFzRSw2QkFBYXpELElBQWIsR0FBb0IsRUFBcEI7QUFQc0I7QUFBQTtBQUFBOztBQUFBO0FBUXRCLDBDQUFnQnlDLFNBQWhCLG1JQUEyQjtBQUFBLDRCQUFsQmtCLEdBQWtCOztBQUN2QkYscUNBQWF6RCxJQUFiLENBQWtCb0QsSUFBbEIsQ0FBdUJqRCxhQUFheUQsd0JBQWIsQ0FBc0NELEdBQXRDLENBQXZCO0FBQ0g7QUFWcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZdEJ4RCw2QkFBYTBELGdCQUFiLENBQThCSixZQUE5QjtBQUNIOztBQUVEO0FBQ0FuRCxjQUFFLHlCQUFGLEVBQTZCZ0IsT0FBN0I7QUFDSCxTQTVDTCxFQTZDS0ksSUE3Q0wsQ0E2Q1UsWUFBVztBQUNiO0FBQ0gsU0EvQ0wsRUFnREtDLE1BaERMLENBZ0RZLFlBQVc7QUFDZi9DLGlCQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDSCxTQWxETDs7QUFvREEsZUFBT0csSUFBUDtBQUNIO0FBL0Z5QixDQUE5Qjs7QUFrR0FYLGFBQWFDLElBQWIsQ0FBa0I2QixPQUFsQixHQUE0QjtBQUN4QnZCLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURjO0FBTXhCbUMsV0FBTyxpQkFBVztBQUNkLFlBQUlsQyxPQUFPWCxhQUFhQyxJQUFiLENBQWtCNkIsT0FBN0I7O0FBRUFuQixhQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDQUcsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CLEVBQXBCO0FBQ0FULHFCQUFhK0IsSUFBYixDQUFrQkQsT0FBbEIsQ0FBMEJjLEtBQTFCO0FBQ0gsS0FadUI7QUFheEJyQixpQkFBYSx1QkFBVztBQUNwQixZQUFJWixPQUFPWCxhQUFhQyxJQUFiLENBQWtCNkIsT0FBN0I7O0FBRUEsWUFBSWdDLE9BQU9DLFFBQVFDLFFBQVIsQ0FBaUIsb0NBQWpCLEVBQXVEO0FBQzlEQyxvQkFBUUMsYUFEc0Q7QUFFOURDLG9CQUFRQztBQUZzRCxTQUF2RCxDQUFYOztBQUtBLGVBQU90RCxnQkFBZ0JTLFdBQWhCLENBQTRCdUMsSUFBNUIsRUFBa0MsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQyxDQUFQO0FBQ0gsS0F0QnVCO0FBdUJ4Qjs7OztBQUlBdEMsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUs2QixPQUFoQjs7QUFFQSxZQUFJQyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSThELGVBQWU5RCxLQUFLRCxPQUF4Qjs7QUFFQTtBQUNBbkIsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CRSxLQUFLWSxXQUFMLEVBQXBCOztBQUVBO0FBQ0FaLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQTtBQUNBNkIsVUFBRUUsT0FBRixDQUFVNUIsS0FBS0osUUFBTCxDQUFjRSxHQUF4QixFQUNLK0IsSUFETCxDQUNVLFVBQVNDLFlBQVQsRUFBdUI7QUFDekIsZ0JBQUlDLE9BQU9ELGFBQWE5QixLQUFLSixRQUFMLENBQWNHLE9BQTNCLENBQVg7QUFDQSxnQkFBSW9GLGVBQWVwRCxLQUFLWixPQUF4Qjs7QUFFQTs7O0FBR0EsZ0JBQUlnRSxhQUFhNUUsTUFBYixHQUFzQixDQUExQixFQUE2QjtBQUN6QjJFLDZCQUFhRSx3QkFBYixDQUFzQ3JELEtBQUtzRCxZQUEzQzs7QUFFQUgsNkJBQWFJLG9CQUFiOztBQUVBLG9CQUFJQyxlQUFlTCxhQUFhTSxxQkFBYixDQUFtQ0wsYUFBYTVFLE1BQWhELENBQW5COztBQUVBZ0YsNkJBQWFuRSxJQUFiLEdBQW9CLEVBQXBCO0FBUHlCO0FBQUE7QUFBQTs7QUFBQTtBQVF6QiwwQ0FBa0IrRCxZQUFsQixtSUFBZ0M7QUFBQSw0QkFBdkJNLEtBQXVCOztBQUM1QkYscUNBQWFuRSxJQUFiLENBQWtCb0QsSUFBbEIsQ0FBdUJVLGFBQWFRLHdCQUFiLENBQXNDRCxLQUF0QyxDQUF2QjtBQUNIO0FBVndCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBWXpCUCw2QkFBYVMsZ0JBQWIsQ0FBOEJKLFlBQTlCO0FBQ0g7O0FBRUQ7QUFDQTdELGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBekJMLEVBMEJLSSxJQTFCTCxDQTBCVSxZQUFXO0FBQ2I7QUFDSCxTQTVCTCxFQTZCS0MsTUE3QkwsQ0E2QlksWUFBVztBQUNmL0MsaUJBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixLQUF4QjtBQUNILFNBL0JMOztBQWlDQSxlQUFPRyxJQUFQO0FBQ0g7QUEzRXVCLENBQTVCOztBQThFQVgsYUFBYUMsSUFBYixDQUFrQnlCLE9BQWxCLEdBQTRCO0FBQ3hCbkIsY0FBVTtBQUNOQyxpQkFBUyxLQURILEVBQ1U7QUFDaEIrRixzQkFBYyxLQUZSLEVBRWU7QUFDckI5RixhQUFLLEVBSEMsRUFHRztBQUNUK0Ysa0JBQVUsRUFKSixFQUlRO0FBQ2Q5RixpQkFBUyxNQUxILEVBS1c7QUFDakJ3QyxnQkFBUSxDQU5GLEVBTUs7QUFDWEMsZUFBTyxFQVBELENBT0s7QUFQTCxLQURjO0FBVXhCTixXQUFPLGlCQUFXO0FBQ2QsWUFBSWxDLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0J5QixPQUE3Qjs7QUFFQWYsYUFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0FHLGFBQUtKLFFBQUwsQ0FBY2dHLFlBQWQsR0FBNkIsS0FBN0I7QUFDQTVGLGFBQUtKLFFBQUwsQ0FBY0UsR0FBZCxHQUFvQixFQUFwQjtBQUNBRSxhQUFLSixRQUFMLENBQWNpRyxRQUFkLEdBQXlCLEVBQXpCO0FBQ0E3RixhQUFLSixRQUFMLENBQWMyQyxNQUFkLEdBQXVCLENBQXZCO0FBQ0FsRCxxQkFBYStCLElBQWIsQ0FBa0JMLE9BQWxCLENBQTBCa0IsS0FBMUI7QUFDSCxLQW5CdUI7QUFvQnhCckIsaUJBQWEsdUJBQVc7QUFDcEIsWUFBSVosT0FBT1gsYUFBYUMsSUFBYixDQUFrQnlCLE9BQTdCOztBQUVBLFlBQUlvQyxPQUFPQyxRQUFRQyxRQUFSLENBQWlCLDBDQUFqQixFQUE2RDtBQUNwRUMsb0JBQVFDLGFBRDREO0FBRXBFQyxvQkFBUUMsU0FGNEQ7QUFHcEVsQixvQkFBUXZDLEtBQUtKLFFBQUwsQ0FBYzJDLE1BSDhDO0FBSXBFQyxtQkFBT3hDLEtBQUtKLFFBQUwsQ0FBYzRDO0FBSitDLFNBQTdELENBQVg7O0FBT0EsZUFBT3JDLGdCQUFnQlMsV0FBaEIsQ0FBNEJ1QyxJQUE1QixFQUFrQyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxDLENBQVA7QUFDSCxLQS9CdUI7QUFnQ3hCMkMsc0JBQWtCLDBCQUFTQyxRQUFULEVBQW1CO0FBQ2pDLGVBQU8zQyxRQUFRQyxRQUFSLENBQWlCLDJCQUFqQixFQUE4QztBQUNqRDJDLHFCQUFTRDtBQUR3QyxTQUE5QyxDQUFQO0FBR0gsS0FwQ3VCO0FBcUN4Qjs7OztBQUlBbEYsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUt5QixPQUFoQjs7QUFFQSxZQUFJSyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUssZUFBZUwsS0FBS0wsT0FBeEI7O0FBRUE7QUFDQWYsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CRSxLQUFLWSxXQUFMLEVBQXBCOztBQUVBO0FBQ0EsWUFBSXFGLHFCQUFxQixLQUF6QjtBQUNBakcsYUFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLElBQXhCOztBQUVBO0FBQ0E2QixVQUFFRSxPQUFGLENBQVU1QixLQUFLSixRQUFMLENBQWNFLEdBQXhCLEVBQ0srQixJQURMLENBQ1UsVUFBU0MsWUFBVCxFQUF1QjtBQUN6QixnQkFBSUMsT0FBT0QsYUFBYTlCLEtBQUtKLFFBQUwsQ0FBY0csT0FBM0IsQ0FBWDtBQUNBLGdCQUFJbUcsZUFBZW5FLEtBQUtvRSxPQUF4QjtBQUNBLGdCQUFJQyxjQUFjckUsS0FBS1UsTUFBdkI7QUFDQSxnQkFBSTRELGVBQWV0RSxLQUFLaEIsT0FBeEI7O0FBRUE7OztBQUdBLGdCQUFJc0YsYUFBYTlGLE1BQWIsR0FBc0IsQ0FBMUIsRUFBNkI7QUFDekI7QUFDQWtCLDZCQUFhNkUsaUNBQWI7O0FBRUE7QUFDQXRHLHFCQUFLSixRQUFMLENBQWMyQyxNQUFkLEdBQXVCMkQsYUFBYW5GLE9BQWIsR0FBdUJmLEtBQUtKLFFBQUwsQ0FBYzRDLEtBQTVEOztBQUVBO0FBUHlCO0FBQUE7QUFBQTs7QUFBQTtBQVF6QiwwQ0FBa0I2RCxZQUFsQixtSUFBZ0M7QUFBQSw0QkFBdkJFLEtBQXVCOztBQUM1Qiw0QkFBSSxDQUFDOUUsYUFBYStFLGdCQUFiLENBQThCRCxNQUFNRSxFQUFwQyxDQUFMLEVBQThDO0FBQzFDaEYseUNBQWFpRixhQUFiLENBQTJCSCxLQUEzQjtBQUNIO0FBQ0o7O0FBRUQ7QUFkeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFlekIsb0JBQUlJLG9CQUFvQixDQUNwQmxGLGFBQWE3QixRQUFiLENBQXNCZ0gsaUJBQXRCLENBQXdDLEdBQXhDLENBRG9CLEVBRXBCbkYsYUFBYTdCLFFBQWIsQ0FBc0JnSCxpQkFBdEIsQ0FBd0MsR0FBeEMsQ0FGb0IsQ0FBeEI7QUFJQW5GLDZCQUFhb0YsK0JBQWIsQ0FBNkNGLGlCQUE3Qzs7QUFFQTtBQUNBLG9CQUFJTixhQUFhOUYsTUFBYixJQUF1QlAsS0FBS0osUUFBTCxDQUFjNEMsS0FBekMsRUFBZ0Q7QUFDNUN5RCx5Q0FBcUIsSUFBckI7QUFDSDtBQUNKLGFBekJELE1BMEJLLElBQUlqRyxLQUFLSixRQUFMLENBQWMyQyxNQUFkLEtBQXlCLENBQTdCLEVBQWdDO0FBQ2pDZCw2QkFBYXFGLHdCQUFiO0FBQ0g7O0FBRUQ7QUFDQXBGLGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBMUNMLEVBMkNLSSxJQTNDTCxDQTJDVSxZQUFXO0FBQ2I7QUFDSCxTQTdDTCxFQThDS0MsTUE5Q0wsQ0E4Q1ksWUFBVztBQUNmO0FBQ0EsZ0JBQUlrRCxrQkFBSixFQUF3QjtBQUNwQnhFLDZCQUFhc0Ysb0JBQWI7QUFDSCxhQUZELE1BR0s7QUFDRHRGLDZCQUFhdUYsa0JBQWI7QUFDSDs7QUFFRDtBQUNBdEYsY0FBRSw2QkFBRixFQUFpQ1MsV0FBakMsQ0FBNkMsY0FBN0M7O0FBRUFuQyxpQkFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0gsU0EzREw7O0FBNkRBLGVBQU9HLElBQVA7QUFDSCxLQXRIdUI7QUF1SHhCOzs7QUFHQWlILGVBQVcsbUJBQVNqQixPQUFULEVBQWtCO0FBQ3pCLFlBQUkxRyxPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUt5QixPQUFoQjs7QUFFQSxZQUFJSyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUssZUFBZUwsS0FBS0wsT0FBeEI7O0FBRUE7QUFDQWYsYUFBS0osUUFBTCxDQUFjaUcsUUFBZCxHQUF5QjdGLEtBQUs4RixnQkFBTCxDQUFzQkUsT0FBdEIsQ0FBekI7O0FBRUE7QUFDQWhHLGFBQUtKLFFBQUwsQ0FBY2dHLFlBQWQsR0FBNkIsSUFBN0I7O0FBRUFsRSxVQUFFLDRCQUEyQnNFLE9BQTdCLEVBQXNDa0IsT0FBdEMsQ0FBOEMsa0lBQTlDOztBQUVBO0FBQ0F4RixVQUFFRSxPQUFGLENBQVU1QixLQUFLSixRQUFMLENBQWNpRyxRQUF4QixFQUNLaEUsSUFETCxDQUNVLFVBQVNDLFlBQVQsRUFBdUI7QUFDekIsZ0JBQUlDLE9BQU9ELGFBQWE5QixLQUFLSixRQUFMLENBQWNHLE9BQTNCLENBQVg7QUFDQSxnQkFBSW9ILGFBQWFwRixLQUFLd0UsS0FBdEI7O0FBRUE7OztBQUdBOUUseUJBQWEyRixxQkFBYixDQUFtQ3BCLE9BQW5DLEVBQTRDbUIsVUFBNUM7O0FBR0E7QUFDQXpGLGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBYkwsRUFjS0ksSUFkTCxDQWNVLFlBQVc7QUFDYjtBQUNILFNBaEJMLEVBaUJLQyxNQWpCTCxDQWlCWSxZQUFXO0FBQ2ZyQixjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7O0FBRUFsRCxpQkFBS0osUUFBTCxDQUFjZ0csWUFBZCxHQUE2QixLQUE3QjtBQUNILFNBckJMOztBQXVCQSxlQUFPNUYsSUFBUDtBQUNIO0FBbEt1QixDQUE1Qjs7QUFxS0E7OztBQUdBWCxhQUFhK0IsSUFBYixHQUFvQjtBQUNoQkUsU0FBSztBQUNEVyxlQUFPLGlCQUFXO0FBQ2RQLGNBQUUsbUJBQUYsRUFBdUJ3QixNQUF2QjtBQUNILFNBSEE7QUFJRGQsOEJBQXNCLGdDQUFXO0FBQzdCLGdCQUFJaUYsT0FBTyxzSUFDUCxRQURKOztBQUdBM0YsY0FBRSx5QkFBRixFQUE2QkMsTUFBN0IsQ0FBb0MwRixJQUFwQztBQUNILFNBVEE7QUFVRGhGLDJCQUFtQiwyQkFBU2lGLElBQVQsRUFBZTtBQUM5QnRILG1CQUFPWCxhQUFhK0IsSUFBYixDQUFrQkUsR0FBekI7O0FBRUEsZ0JBQUlpRyxZQUFZN0YsRUFBRSxtQkFBRixDQUFoQjs7QUFIOEI7QUFBQTtBQUFBOztBQUFBO0FBSzlCLHNDQUFnQjRGLElBQWhCLG1JQUFzQjtBQUFBLHdCQUFiaEcsR0FBYTs7QUFDbEJ0Qix5QkFBS3dILGdCQUFMLENBQXNCRCxTQUF0QixFQUFpQ2pHLEdBQWpDO0FBQ0g7QUFQNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFqQyxTQWxCQTtBQW1CRGtHLDBCQUFrQiwwQkFBU0QsU0FBVCxFQUFvQmpHLEdBQXBCLEVBQXlCO0FBQ3ZDLGdCQUFJdEIsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JFLEdBQTdCOztBQUVBLGdCQUFJbUcsbUJBQW1CLGtEQUFpREMsV0FBakQsR0FBK0QsbUJBQS9ELEdBQXFGcEcsSUFBSXFHLGNBQXpGLEdBQXlHLFFBQWhJO0FBQ0EsZ0JBQUlDLFNBQVMsMENBQXlDRixXQUF6QyxHQUF1RCx3QkFBdkQsR0FBa0ZwRyxJQUFJdUcsSUFBdEYsR0FBNEYsUUFBekc7QUFDQSxnQkFBSUMsVUFBVSxvQ0FBbUN4RyxJQUFJeUcsSUFBdkMsR0FBNkMsUUFBM0Q7O0FBRUEsZ0JBQUlWLE9BQU87QUFDUDtBQUNBLGdFQUZPLEdBR1BJLGdCQUhPLEdBSVAsUUFKTztBQUtQO0FBQ0Esd0RBTk8sR0FPUEcsTUFQTyxHQVFQLFFBUk87QUFTUDtBQUNBLHVEQVZPLEdBV1BFLE9BWE8sR0FZUCxRQVpPO0FBYVA7QUFDQSxtR0FkTyxHQWNrRjlILEtBQUtnSSxrQkFBTCxDQUF3QjFHLEdBQXhCLENBZGxGLEdBY2dILFVBZGhILEdBZVAsUUFmSjs7QUFpQkFpRyxzQkFBVTVGLE1BQVYsQ0FBaUIwRixJQUFqQjtBQUNILFNBNUNBO0FBNkNEVyw0QkFBb0IsNEJBQVMxRyxHQUFULEVBQWM7QUFDOUIsbUJBQU8sVUFBU0EsSUFBSTJHLFFBQWIsR0FBdUIsYUFBdkIsR0FBc0MzRyxJQUFJNEcsTUFBMUMsR0FBa0QsYUFBbEQsR0FBaUU1RyxJQUFJdUcsSUFBckUsR0FBMkUsR0FBM0UsR0FBZ0Z2RyxJQUFJeUcsSUFBcEYsR0FBMEYsUUFBakc7QUFDSDtBQS9DQSxLQURXO0FBa0RoQjlHLGVBQVc7QUFDUHJCLGtCQUFVO0FBQ051SSx1QkFBVyxDQURMLENBQ1E7QUFEUixTQURIO0FBSVBsRyxlQUFPLGlCQUFXO0FBQ2RQLGNBQUUseUJBQUYsRUFBNkJ3QixNQUE3QjtBQUNILFNBTk07QUFPUGEsb0NBQTRCLG9DQUFTcUUsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0JDLGFBQS9CLEVBQThDQyxVQUE5QyxFQUEwRDtBQUNsRjtBQUNBLGdCQUFJQyxjQUFjLGtCQUFsQjtBQUNBLGdCQUFJSCxlQUFlLEVBQW5CLEVBQXVCO0FBQ25CRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUlILGVBQWUsRUFBbkIsRUFBdUI7QUFDbkJHLDhCQUFjLDJCQUFkO0FBQ0g7QUFDRCxnQkFBSUgsZUFBZSxFQUFuQixFQUF1QjtBQUNuQkcsOEJBQWMsdUJBQWQ7QUFDSDtBQUNELGdCQUFJSCxlQUFlLEVBQW5CLEVBQXVCO0FBQ25CRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJQyxjQUFjLHNIQUFxSEQsV0FBckgsR0FBa0ksSUFBbEksR0FDZEosT0FEYyxHQUNKLEdBREksR0FFZCxlQUZKOztBQUlBLGdCQUFJTSx5QkFBeUIsd0lBQXVJSixhQUF2SSxHQUFzSixJQUF0SixHQUE0SkcsV0FBNUosR0FBeUssU0FBdE07O0FBRUEsZ0JBQUlFLHNCQUFzQiwySEFBMEhqQixXQUExSCxHQUF1SSxnR0FBdkksR0FBeU9hLFVBQXpPLEdBQXFQLFNBQS9ROztBQUVBLGdCQUFJbEIsT0FBTywySEFDUHFCLHNCQURPLEdBRVBDLG1CQUZPLEdBR1AsUUFISjs7QUFLQWpILGNBQUUsK0JBQUYsRUFBbUNDLE1BQW5DLENBQTBDMEYsSUFBMUM7QUFDSCxTQXJDTTtBQXNDUDVDLG9DQUE0QixvQ0FBU0YsSUFBVCxFQUFlO0FBQ3ZDOzs7QUFHQSxnQkFBSXFFLFlBQVksMkVBQTJFbEIsV0FBM0UsR0FBeUZuRCxLQUFLc0UsVUFBOUYsR0FBMEcsY0FBMUcsR0FDWiwwQ0FEWSxHQUNpQ3pGLFFBQVFDLFFBQVIsQ0FBaUIsWUFBakIsRUFBK0IsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3QmtELElBQUloRCxTQUE1QixFQUF1Q3FGLGdCQUFnQnZFLEtBQUt3RSxJQUE1RCxFQUEvQixDQURqQyxHQUNxSSxvQkFEckksR0FDMkp4RSxLQUFLd0UsSUFEaEssR0FDc0ssa0JBRHRMOztBQUlBOzs7QUFHQTtBQUNBLGdCQUFJQyxVQUFVLGtCQUFkO0FBQ0EsZ0JBQUl6RSxLQUFLMEUsT0FBTCxJQUFnQixDQUFwQixFQUF1QjtBQUNuQkQsMEJBQVUsdUJBQVY7QUFDSDtBQUNELGdCQUFJekUsS0FBSzBFLE9BQUwsSUFBZ0IsQ0FBcEIsRUFBdUI7QUFDbkJELDBCQUFVLHdCQUFWO0FBQ0g7O0FBRUQsZ0JBQUlFLE1BQU0sa0JBQWlCRixPQUFqQixHQUEwQixJQUExQixHQUFpQ3pFLEtBQUs0RSxPQUF0QyxHQUFnRCxhQUExRDs7QUFFQSxnQkFBSUMsV0FBVzdFLEtBQUs4RSxTQUFMLEdBQWlCLDBDQUFqQixHQUE4RDlFLEtBQUsrRSxVQUFuRSxHQUFnRixZQUFoRixHQUErRi9FLEtBQUtnRixXQUFuSDs7QUFFQSxnQkFBSUMsV0FBVztBQUNYO0FBQ0EsbUpBRlcsR0FHWE4sR0FIVyxHQUlYLGVBSlc7QUFLWDtBQUNBLG1KQU5XLEdBT1hFLFFBUFcsR0FRWCxlQVJXLEdBU1gsUUFUSjs7QUFXQTs7O0FBR0E7QUFDQSxnQkFBSVosY0FBYyxrQkFBbEI7QUFDQSxnQkFBSWpFLEtBQUs4RCxXQUFMLElBQW9CLEVBQXhCLEVBQTRCO0FBQ3hCRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUlqRSxLQUFLOEQsV0FBTCxJQUFvQixFQUF4QixFQUE0QjtBQUN4QkcsOEJBQWMsMkJBQWQ7QUFDSDtBQUNELGdCQUFJakUsS0FBSzhELFdBQUwsSUFBb0IsRUFBeEIsRUFBNEI7QUFDeEJHLDhCQUFjLHVCQUFkO0FBQ0g7QUFDRCxnQkFBSWpFLEtBQUs4RCxXQUFMLElBQW9CLEVBQXhCLEVBQTRCO0FBQ3hCRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJaUIsZUFBZTtBQUNmO0FBQ0EsMEJBRmUsR0FFQ2pCLFdBRkQsR0FFYywyRkFGZCxHQUdmakUsS0FBSzZELE9BSFUsR0FHQSxHQUhBLEdBSWYsZUFKZTtBQUtmO0FBQ0EsMkNBTmUsR0FPZjdELEtBQUttRixNQVBVLEdBT0QsU0FQQyxHQVFmLFFBUmUsR0FTZixRQVRKOztBQVdBLG1CQUFPLENBQUNkLFNBQUQsRUFBWVksUUFBWixFQUFzQkMsWUFBdEIsQ0FBUDtBQUNILFNBdkdNO0FBd0dQbkYsaUNBQXlCLGlDQUFTcUYsU0FBVCxFQUFvQjtBQUN6QyxnQkFBSTNKLE9BQU9YLGFBQWErQixJQUFiLENBQWtCSCxTQUE3Qjs7QUFFQSxnQkFBSTJJLFlBQVksRUFBaEI7O0FBRUE7QUFDQUEsc0JBQVVDLE9BQVYsR0FBb0IsQ0FDaEIsRUFEZ0IsRUFFaEIsRUFGZ0IsRUFHaEIsRUFIZ0IsQ0FBcEI7O0FBTUFELHNCQUFVRSxRQUFWLEdBQXFCO0FBQ2pCQyw0QkFBWSxFQURLLEVBQ0Q7QUFDaEJDLGdDQUFnQixHQUZDLEVBRUk7QUFDckJDLDZCQUFhLEdBSEksRUFHQztBQUNsQkMsNEJBQVksR0FKSyxDQUlEO0FBSkMsYUFBckI7O0FBT0FOLHNCQUFVTyxPQUFWLEdBQW9CLEtBQXBCO0FBQ0FQLHNCQUFVUSxTQUFWLEdBQXNCLEtBQXRCO0FBQ0FSLHNCQUFVUyxXQUFWLEdBQXdCLEtBQXhCO0FBQ0FULHNCQUFVVSxVQUFWLEdBQXVCdEssS0FBS0osUUFBTCxDQUFjdUksU0FBckMsQ0F0QnlDLENBc0JPO0FBQ2hEeUIsc0JBQVVXLE1BQVYsR0FBb0JaLFlBQVlDLFVBQVVVLFVBQTFDLENBdkJ5QyxDQXVCYztBQUN2RFYsc0JBQVVZLFVBQVYsR0FBdUIsUUFBdkI7QUFDQVosc0JBQVVhLFVBQVYsR0FBdUIsS0FBdkIsQ0F6QnlDLENBeUJYO0FBQzlCYixzQkFBVWMsT0FBVixHQUFvQixJQUFwQixDQTFCeUMsQ0EwQmY7QUFDMUJkLHNCQUFVZSxPQUFWLEdBQW9CLEtBQXBCLENBM0J5QyxDQTJCZDtBQUMzQmYsc0JBQVVnQixHQUFWLEdBQWlCLG1EQUFqQixDQTVCeUMsQ0E0QjZCO0FBQ3RFaEIsc0JBQVVpQixJQUFWLEdBQWlCLEtBQWpCLENBN0J5QyxDQTZCakI7O0FBRXhCakIsc0JBQVVrQixZQUFWLEdBQXlCLFlBQVc7QUFDaENwSixrQkFBRSwyQ0FBRixFQUErQ2dCLE9BQS9DO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT2tILFNBQVA7QUFDSCxTQTVJTTtBQTZJUHhGLGdDQUF3QixrQ0FBVztBQUMvQjFDLGNBQUUseUJBQUYsRUFBNkJDLE1BQTdCLENBQW9DLHdLQUFwQztBQUNILFNBL0lNO0FBZ0pQK0MsNEJBQW9CLDRCQUFTcUcsZUFBVCxFQUEwQjtBQUMxQ3JKLGNBQUUscUJBQUYsRUFBeUJzSixTQUF6QixDQUFtQ0QsZUFBbkM7QUFDSDtBQWxKTSxLQWxESztBQXNNaEJ2SixhQUFTO0FBQ0w1QixrQkFBVTtBQUNOcUwsc0JBQVUsQ0FESixDQUNPO0FBRFAsU0FETDtBQUlMaEosZUFBTyxpQkFBVztBQUNkUCxjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7QUFDSCxTQU5JO0FBT0x5QixrQ0FBMEIsb0NBQVc7QUFDakMsZ0JBQUkwQyxPQUFPLHVIQUNQLDBDQURPLEdBRVAsUUFGSjs7QUFJQTNGLGNBQUUsZ0NBQUYsRUFBb0NDLE1BQXBDLENBQTJDMEYsSUFBM0M7QUFDSCxTQWJJO0FBY0xyQyxrQ0FBMEIsa0NBQVNELEdBQVQsRUFBYztBQUNwQzs7O0FBR0EsZ0JBQUltRyxXQUFXLGdFQUErRHhELFdBQS9ELEdBQTRFLGNBQTVFLEdBQTRGM0MsSUFBSW9HLEtBQWhHLEdBQXVHLGdCQUF0SDs7QUFFQSxnQkFBSUMsVUFBVSxxQ0FBb0NyRyxJQUFJZ0UsSUFBeEMsR0FBOEMsUUFBNUQ7O0FBRUEsZ0JBQUlzQyxXQUFXLHFDQUFvQ0gsUUFBcEMsR0FBK0NFLE9BQS9DLEdBQXlELFFBQXhFOztBQUVBOzs7QUFHQTtBQUNBLGdCQUFJNUMsY0FBYyxrQkFBbEI7QUFDQSxnQkFBSXpELElBQUlzRCxXQUFKLElBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUl6RCxJQUFJc0QsV0FBSixJQUFtQixFQUF2QixFQUEyQjtBQUN2QkcsOEJBQWMsMkJBQWQ7QUFDSDtBQUNELGdCQUFJekQsSUFBSXNELFdBQUosSUFBbUIsRUFBdkIsRUFBMkI7QUFDdkJHLDhCQUFjLHVCQUFkO0FBQ0g7QUFDRCxnQkFBSXpELElBQUlzRCxXQUFKLElBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJaUIsZUFBZTtBQUNmO0FBQ0EsMEJBRmUsR0FFQ2pCLFdBRkQsR0FFYywyRkFGZCxHQUdmekQsSUFBSXFELE9BSFcsR0FHRCxHQUhDLEdBSWYsZUFKZTtBQUtmO0FBQ0EsMkNBTmUsR0FPZnJELElBQUkyRSxNQVBXLEdBT0YsU0FQRSxHQVFmLFFBUmUsR0FTZixRQVRKOztBQVdBLG1CQUFPLENBQUMyQixRQUFELEVBQVc1QixZQUFYLENBQVA7QUFDSCxTQXRESTtBQXVETDNFLCtCQUF1QiwrQkFBUzZFLFNBQVQsRUFBb0I7QUFDdkMsZ0JBQUkzSixPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkksT0FBN0I7O0FBRUEsZ0JBQUlvSSxZQUFZLEVBQWhCOztBQUVBO0FBQ0FBLHNCQUFVQyxPQUFWLEdBQW9CLENBQ2hCLEVBRGdCLEVBRWhCLEVBRmdCLENBQXBCOztBQUtBRCxzQkFBVUUsUUFBVixHQUFxQjtBQUNqQkMsNEJBQVksRUFESyxFQUNEO0FBQ2hCQyxnQ0FBZ0IsR0FGQyxFQUVJO0FBQ3JCQyw2QkFBYSxHQUhJLEVBR0M7QUFDbEJDLDRCQUFZLEdBSkssQ0FJRDtBQUpDLGFBQXJCOztBQU9BTixzQkFBVU8sT0FBVixHQUFvQixLQUFwQjtBQUNBUCxzQkFBVVEsU0FBVixHQUFzQixLQUF0QjtBQUNBUixzQkFBVVMsV0FBVixHQUF3QixLQUF4QjtBQUNBVCxzQkFBVVUsVUFBVixHQUF1QnRLLEtBQUtKLFFBQUwsQ0FBY3FMLFFBQXJDLENBckJ1QyxDQXFCUTtBQUMvQ3JCLHNCQUFVVyxNQUFWLEdBQW9CWixZQUFZQyxVQUFVVSxVQUExQyxDQXRCdUMsQ0FzQmdCO0FBQ3ZEO0FBQ0FWLHNCQUFVWSxVQUFWLEdBQXVCLFFBQXZCO0FBQ0FaLHNCQUFVYSxVQUFWLEdBQXVCLEtBQXZCLENBekJ1QyxDQXlCVDtBQUM5QmIsc0JBQVVjLE9BQVYsR0FBb0IsSUFBcEIsQ0ExQnVDLENBMEJiO0FBQzFCZCxzQkFBVWUsT0FBVixHQUFvQixLQUFwQixDQTNCdUMsQ0EyQlo7QUFDM0JmLHNCQUFVZ0IsR0FBVixHQUFpQixtREFBakIsQ0E1QnVDLENBNEIrQjtBQUN0RWhCLHNCQUFVaUIsSUFBVixHQUFpQixLQUFqQixDQTdCdUMsQ0E2QmY7O0FBRXhCakIsc0JBQVVrQixZQUFWLEdBQXlCLFlBQVc7QUFDaENwSixrQkFBRSwyQ0FBRixFQUErQ2dCLE9BQS9DO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT2tILFNBQVA7QUFDSCxTQTNGSTtBQTRGTGhGLDhCQUFzQixnQ0FBVztBQUM3QmxELGNBQUUsdUJBQUYsRUFBMkJDLE1BQTNCLENBQWtDLG9LQUFsQztBQUNILFNBOUZJO0FBK0ZMc0QsMEJBQWtCLDBCQUFTOEYsZUFBVCxFQUEwQjtBQUN4Q3JKLGNBQUUsbUJBQUYsRUFBdUJzSixTQUF2QixDQUFpQ0QsZUFBakM7QUFDSDtBQWpHSSxLQXRNTztBQXlTaEI1SixhQUFTO0FBQ0x2QixrQkFBVTtBQUNOMEwsd0JBQVksQ0FETixDQUNTO0FBRFQsU0FETDtBQUlMckosZUFBTyxpQkFBVztBQUNkUCxjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7QUFDSCxTQU5JO0FBT0xrQyxrQ0FBMEIsa0NBQVNtRyxzQkFBVCxFQUFpQztBQUN2RCxnQkFBSUMsT0FBUSxJQUFJQyxJQUFKLENBQVNGLHlCQUF5QixJQUFsQyxDQUFELENBQTBDRyxjQUExQyxFQUFYOztBQUVBLGdCQUFJckUsT0FBTyx1SEFDUCxpSkFETyxHQUM0SW1FLElBRDVJLEdBQ2tKLHdCQURsSixHQUVQLFFBRko7O0FBSUE5SixjQUFFLGdDQUFGLEVBQW9DQyxNQUFwQyxDQUEyQzBGLElBQTNDO0FBQ0gsU0FmSTtBQWdCTDNCLGtDQUEwQixrQ0FBU0QsS0FBVCxFQUFnQjtBQUN0Qzs7O0FBR0EsZ0JBQUlrRyxhQUFhLEVBQWpCO0FBSnNDO0FBQUE7QUFBQTs7QUFBQTtBQUt0QyxzQ0FBbUJsRyxNQUFNbUcsT0FBekIsbUlBQWtDO0FBQUEsd0JBQXpCcEksTUFBeUI7O0FBQzlCbUksa0NBQWMsNkNBQTRDbEcsTUFBTW1HLE9BQU4sQ0FBY3JMLE1BQTFELEdBQWtFLHVDQUFsRSxHQUE0RzZDLFFBQVFDLFFBQVIsQ0FBaUIsUUFBakIsRUFBMkIsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3QmtELElBQUlqRCxPQUFPaUQsRUFBbkMsRUFBM0IsQ0FBNUcsR0FBaUwsb0JBQWpMLEdBQXVNakQsT0FBT3VGLElBQTlNLEdBQW9OLFlBQWxPO0FBQ0g7QUFQcUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTdEMsZ0JBQUk4QyxhQUFhLHVDQUFzQ0YsVUFBdEMsR0FBa0QsUUFBbkU7O0FBRUE7OztBQUdBO0FBQ0EsZ0JBQUluRCxjQUFjLGtCQUFsQjtBQUNBLGdCQUFJL0MsTUFBTTRDLFdBQU4sSUFBcUIsRUFBekIsRUFBNkI7QUFDekJHLDhCQUFjLHNCQUFkO0FBQ0g7QUFDRCxnQkFBSS9DLE1BQU00QyxXQUFOLElBQXFCLEVBQXpCLEVBQTZCO0FBQ3pCRyw4QkFBYywyQkFBZDtBQUNIO0FBQ0QsZ0JBQUkvQyxNQUFNNEMsV0FBTixJQUFxQixFQUF6QixFQUE2QjtBQUN6QkcsOEJBQWMsdUJBQWQ7QUFDSDtBQUNELGdCQUFJL0MsTUFBTTRDLFdBQU4sSUFBcUIsRUFBekIsRUFBNkI7QUFDekJHLDhCQUFjLHdCQUFkO0FBQ0g7O0FBRUQsZ0JBQUlpQixlQUFlO0FBQ2Y7QUFDQSwwQkFGZSxHQUVDakIsV0FGRCxHQUVjLDJGQUZkLEdBR2YvQyxNQUFNMkMsT0FIUyxHQUdDLEdBSEQsR0FJZixlQUplO0FBS2Y7QUFDQSwyQ0FOZSxHQU9mM0MsTUFBTWlFLE1BUFMsR0FPQSxTQVBBLEdBUWYsUUFSZSxHQVNmLFFBVEo7O0FBV0EsbUJBQU8sQ0FBQ21DLFVBQUQsRUFBYXBDLFlBQWIsQ0FBUDtBQUNILFNBekRJO0FBMERMakUsK0JBQXVCLCtCQUFTbUUsU0FBVCxFQUFvQjtBQUN2QyxnQkFBSTNKLE9BQU9YLGFBQWErQixJQUFiLENBQWtCRCxPQUE3Qjs7QUFFQSxnQkFBSXlJLFlBQVksRUFBaEI7O0FBRUE7QUFDQUEsc0JBQVVDLE9BQVYsR0FBb0IsQ0FDaEIsRUFEZ0IsRUFFaEIsRUFGZ0IsQ0FBcEI7O0FBS0FELHNCQUFVRSxRQUFWLEdBQXFCO0FBQ2pCQyw0QkFBWSxFQURLLEVBQ0Q7QUFDaEJDLGdDQUFnQixHQUZDLEVBRUk7QUFDckJDLDZCQUFhLEdBSEksRUFHQztBQUNsQkMsNEJBQVksR0FKSyxDQUlEO0FBSkMsYUFBckI7O0FBT0FOLHNCQUFVTyxPQUFWLEdBQW9CLEtBQXBCO0FBQ0FQLHNCQUFVUSxTQUFWLEdBQXNCLEtBQXRCO0FBQ0FSLHNCQUFVUyxXQUFWLEdBQXdCLEtBQXhCO0FBQ0FULHNCQUFVVSxVQUFWLEdBQXVCdEssS0FBS0osUUFBTCxDQUFjMEwsVUFBckMsQ0FyQnVDLENBcUJVO0FBQ2pEMUIsc0JBQVVXLE1BQVYsR0FBb0JaLFlBQVlDLFVBQVVVLFVBQTFDLENBdEJ1QyxDQXNCZ0I7QUFDdkQ7QUFDQVYsc0JBQVVZLFVBQVYsR0FBdUIsUUFBdkI7QUFDQVosc0JBQVVhLFVBQVYsR0FBdUIsS0FBdkIsQ0F6QnVDLENBeUJUO0FBQzlCYixzQkFBVWMsT0FBVixHQUFvQixJQUFwQixDQTFCdUMsQ0EwQmI7QUFDMUJkLHNCQUFVZSxPQUFWLEdBQW9CLEtBQXBCLENBM0J1QyxDQTJCWjtBQUMzQmYsc0JBQVVnQixHQUFWLEdBQWlCLG1EQUFqQixDQTVCdUMsQ0E0QitCO0FBQ3RFaEIsc0JBQVVpQixJQUFWLEdBQWlCLEtBQWpCLENBN0J1QyxDQTZCZjs7QUFFeEJqQixzQkFBVWtCLFlBQVYsR0FBeUIsWUFBVztBQUNoQ3BKLGtCQUFFLDJDQUFGLEVBQStDZ0IsT0FBL0M7QUFDSCxhQUZEOztBQUlBLG1CQUFPa0gsU0FBUDtBQUNILFNBOUZJO0FBK0ZMdEUsOEJBQXNCLGdDQUFXO0FBQzdCNUQsY0FBRSx1QkFBRixFQUEyQkMsTUFBM0IsQ0FBa0Msb0tBQWxDO0FBQ0gsU0FqR0k7QUFrR0xnRSwwQkFBa0IsMEJBQVNvRixlQUFULEVBQTBCO0FBQ3hDckosY0FBRSxtQkFBRixFQUF1QnNKLFNBQXZCLENBQWlDRCxlQUFqQztBQUNIO0FBcEdJLEtBelNPO0FBK1loQmhLLGFBQVM7QUFDTG5CLGtCQUFVO0FBQ05rTSx5QkFBYSxLQURQLEVBQ2M7QUFDcEJDLGtDQUFzQixLQUZoQjtBQUdObkYsK0JBQW1CO0FBQ2YscUJBQUssQ0FEVTtBQUVmLHFCQUFLO0FBRlUsYUFIYjtBQU9Ob0Ysb0JBQVEsRUFQRixFQU9NO0FBQ1pDLG1DQUF1QixLQVJqQjtBQVNOQywyQkFBZSxFQVRULENBU1k7QUFUWixTQURMO0FBWUxqSyxlQUFPLGlCQUFXO0FBQ2QsZ0JBQUlqQyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUE7QUFDQWYsaUJBQUtKLFFBQUwsQ0FBY2dILGlCQUFkLEdBQWtDO0FBQzlCLHFCQUFLLENBRHlCO0FBRTlCLHFCQUFLO0FBRnlCLGFBQWxDOztBQUtBO0FBQ0EsaUJBQUssSUFBSXVGLFFBQVQsSUFBcUJuTSxLQUFLSixRQUFMLENBQWNvTSxNQUFuQyxFQUEyQztBQUN2QyxvQkFBSWhNLEtBQUtKLFFBQUwsQ0FBY29NLE1BQWQsQ0FBcUJJLGNBQXJCLENBQW9DRCxRQUFwQyxDQUFKLEVBQW1EO0FBQy9DLHdCQUFJRSxRQUFRck0sS0FBS0osUUFBTCxDQUFjb00sTUFBZCxDQUFxQkcsUUFBckIsQ0FBWjtBQUNBRSwwQkFBTUMsT0FBTjtBQUNIO0FBQ0o7O0FBRUR0TSxpQkFBS0osUUFBTCxDQUFjb00sTUFBZCxHQUF1QixFQUF2Qjs7QUFFQXRLLGNBQUUsNkJBQUYsRUFBaUN3QixNQUFqQztBQUNBO0FBQ0FsRCxpQkFBS0osUUFBTCxDQUFjcU0scUJBQWQsR0FBc0MsS0FBdEM7QUFDQWpNLGlCQUFLSixRQUFMLENBQWNtTSxvQkFBZCxHQUFxQyxLQUFyQztBQUNBL0wsaUJBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsR0FBOEIsRUFBOUI7QUFDSCxTQXBDSTtBQXFDTDFGLDBCQUFrQiwwQkFBU1IsT0FBVCxFQUFrQjtBQUNoQyxnQkFBSWhHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxtQkFBT2YsS0FBS0osUUFBTCxDQUFjc00sYUFBZCxDQUE0QkUsY0FBNUIsQ0FBMkNwRyxVQUFVLEVBQXJELENBQVA7QUFDSCxTQXpDSTtBQTBDTDFELHdDQUFnQywwQ0FBVztBQUN2Q1osY0FBRSw2QkFBRixFQUFpQ0MsTUFBakMsQ0FBd0Msd0lBQXhDO0FBQ0gsU0E1Q0k7QUE2Q0xtRixrQ0FBMEIsb0NBQVc7QUFDakNwRixjQUFFLDZCQUFGLEVBQWlDQyxNQUFqQyxDQUF3QyxrRUFBeEM7QUFDSCxTQS9DSTtBQWdETDJFLDJDQUFtQyw2Q0FBVztBQUMxQyxnQkFBSXRHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxnQkFBSSxDQUFDZixLQUFLSixRQUFMLENBQWNxTSxxQkFBbkIsRUFBMEM7QUFDdEMsb0JBQUkxRSxZQUFZN0YsRUFBRSw2QkFBRixDQUFoQjs7QUFFQSxvQkFBSTJGLE9BQU87QUFDWDtBQUNBLGdFQUZXLEdBR1gsMkNBSFcsR0FJWCwrQ0FKVyxHQUtYLFFBTFcsR0FNWCxtREFOVyxHQU9ILFlBUEcsR0FRWCxRQVJXLEdBU1gsUUFUQTs7QUFXQUUsMEJBQVU1RixNQUFWLENBQWlCMEYsSUFBakI7O0FBRUE7QUFDQXJILHFCQUFLdU0saUNBQUw7O0FBRUF2TSxxQkFBS0osUUFBTCxDQUFjcU0scUJBQWQsR0FBc0MsSUFBdEM7QUFDSDtBQUNKLFNBeEVJO0FBeUVMTSwyQ0FBbUMsNkNBQVc7QUFDMUMsZ0JBQUl2TSxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUEsZ0JBQUlLLE9BQU87QUFDUG9MLDBCQUFVLENBQ047QUFDSXBMLDBCQUFNLENBQUMsQ0FBRCxDQURWLEVBQ2U7QUFDWHFMLHFDQUFpQixDQUNiLFNBRGEsRUFFYixTQUZhLENBRnJCO0FBTUlDLGlDQUFhLENBQ1QsU0FEUyxFQUVULFNBRlMsQ0FOakI7QUFVSUMsaUNBQWEsQ0FDVCxDQURTLEVBRVQsQ0FGUztBQVZqQixpQkFETTtBQURILGFBQVg7O0FBb0JBLGdCQUFJQyxVQUFVO0FBQ1ZDLDJCQUFXLEtBREQ7QUFFVkMscUNBQXFCLEtBRlg7QUFHVkMsd0JBQVE7QUFDSkMsNkJBQVM7QUFETCxpQkFIRTtBQU1WQywwQkFBVTtBQUNOQyw2QkFBUztBQURILGlCQU5BO0FBU1ZDLHVCQUFPO0FBQ0hDLDBCQUFNO0FBREg7QUFURyxhQUFkOztBQWNBcE4saUJBQUtKLFFBQUwsQ0FBY29NLE1BQWQsQ0FBcUIsU0FBckIsSUFBa0MsSUFBSXFCLEtBQUosQ0FBVTNMLEVBQUUseUJBQUYsQ0FBVixFQUF3QztBQUN0RTRMLHNCQUFNLFVBRGdFO0FBRXRFbE0sc0JBQU1BLElBRmdFO0FBR3RFd0wseUJBQVNBO0FBSDZELGFBQXhDLENBQWxDO0FBS0gsU0FuSEk7QUFvSEwvRix5Q0FBaUMseUNBQVMwRyxTQUFULEVBQW9CO0FBQ2pELGdCQUFJdk4sT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCOztBQUVBLGdCQUFJc0wsUUFBUXJNLEtBQUtKLFFBQUwsQ0FBY29NLE1BQWQsQ0FBcUI1RCxPQUFqQzs7QUFFQSxnQkFBSWlFLEtBQUosRUFBVztBQUNQO0FBQ0Esb0JBQUltQixPQUFPRCxVQUFVLENBQVYsSUFBZSxHQUExQjtBQUNBLG9CQUFJRSxTQUFTRixVQUFVLENBQVYsSUFBZSxHQUE1QjtBQUNBLG9CQUFJbkYsVUFBVSxLQUFkO0FBQ0Esb0JBQUlzRixrQkFBa0J0RixPQUF0QjtBQUNBLG9CQUFJcUYsU0FBUyxDQUFiLEVBQWdCO0FBQ1pyRiw4QkFBV29GLFFBQVFBLE9BQU9DLE1BQWYsQ0FBRCxHQUEyQixLQUFyQztBQUNBQyxzQ0FBa0J0RixPQUFsQjtBQUNBc0Ysc0NBQWtCQSxnQkFBZ0JDLE9BQWhCLENBQXdCLENBQXhCLENBQWxCO0FBQ0g7O0FBRUQsb0JBQUluRixjQUFjLGtCQUFsQjtBQUNBLG9CQUFJSixXQUFXLEVBQWYsRUFBbUI7QUFDZkksa0NBQWMsc0JBQWQ7QUFDSDtBQUNELG9CQUFJSixXQUFXLEVBQWYsRUFBbUI7QUFDZkksa0NBQWMsMkJBQWQ7QUFDSDtBQUNELG9CQUFJSixXQUFXLEVBQWYsRUFBbUI7QUFDZkksa0NBQWMsdUJBQWQ7QUFDSDtBQUNELG9CQUFJSixXQUFXLEVBQWYsRUFBbUI7QUFDZkksa0NBQWMsd0JBQWQ7QUFDSDs7QUFFRCxvQkFBSWlCLGVBQ0EsaUJBQWdCakIsV0FBaEIsR0FBNkIsSUFBN0IsR0FDQWtGLGVBREEsR0FDa0IsR0FEbEIsR0FFQSxRQUhKOztBQUtBaE0sa0JBQUUsMkJBQUYsRUFBK0IyRixJQUEvQixDQUFvQ29DLFlBQXBDOztBQUVBO0FBQ0E0QyxzQkFBTWpMLElBQU4sQ0FBV29MLFFBQVgsQ0FBb0IsQ0FBcEIsRUFBdUJwTCxJQUF2QixHQUE4Qm1NLFNBQTlCOztBQUVBO0FBQ0FsQixzQkFBTXVCLE1BQU47QUFDSDtBQUNKLFNBaEtJO0FBaUtMbEgsdUJBQWUsdUJBQVNILEtBQVQsRUFBZ0I7QUFDM0I7QUFDQSxnQkFBSXZHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQTtBQUNBLGdCQUFJc0csT0FBTyx1Q0FBdUNkLE1BQU1FLEVBQTdDLEdBQWtELDJDQUE3RDs7QUFFQS9FLGNBQUUsNkJBQUYsRUFBaUNDLE1BQWpDLENBQXdDMEYsSUFBeEM7O0FBRUE7QUFDQSxnQkFBSXdHLGdCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQXBCLENBVjJCLENBVVU7QUFDckNsTCxzQkFBVW1MLE9BQVYsQ0FBa0JDLE9BQWxCLENBQTBCRixhQUExQjs7QUFFQTtBQUNBN04saUJBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsQ0FBNEIzRixNQUFNRSxFQUFOLEdBQVcsRUFBdkMsSUFBNkM7QUFDekN1SCwrQkFBZSxLQUQwQixFQUNuQjtBQUN0QkMsNkJBQWEsS0FGNEIsRUFFckI7QUFDcEJDLDZCQUFhM0gsTUFBTS9DLE1BQU4sQ0FBYWlELEVBSGUsRUFHWDtBQUM5Qm9ILCtCQUFlQSxhQUowQixFQUlYO0FBQzlCTSx1QkFBTyxJQUxrQyxFQUs1QjtBQUNiQyw2QkFBYSxJQU40QixDQU10QjtBQU5zQixhQUE3Qzs7QUFTQTtBQUNBLGdCQUFJN0gsTUFBTS9DLE1BQU4sQ0FBYTZLLEdBQWpCLEVBQXNCO0FBQ2xCck8scUJBQUtKLFFBQUwsQ0FBY2dILGlCQUFkLENBQWdDLEdBQWhDO0FBQ0gsYUFGRCxNQUdLO0FBQ0Q1RyxxQkFBS0osUUFBTCxDQUFjZ0gsaUJBQWQsQ0FBZ0MsR0FBaEM7QUFDSDs7QUFFRDtBQUNBNUcsaUJBQUtzTyxtQkFBTCxDQUF5Qi9ILEtBQXpCO0FBQ0gsU0FsTUk7QUFtTUwrSCw2QkFBcUIsNkJBQVMvSCxLQUFULEVBQWdCO0FBQ2pDO0FBQ0EsZ0JBQUl2RyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUE7QUFDQSxnQkFBSXdOLFlBQVloSSxNQUFNaUYsSUFBdEI7QUFDQSxnQkFBSWdELGdCQUFnQjdMLFVBQVU2SSxJQUFWLENBQWVpRCxlQUFmLENBQStCRixTQUEvQixDQUFwQjtBQUNBLGdCQUFJL0MsT0FBUSxJQUFJQyxJQUFKLENBQVM4QyxZQUFZLElBQXJCLENBQUQsQ0FBNkI3QyxjQUE3QixFQUFYO0FBQ0EsZ0JBQUlnRCxhQUFhL0wsVUFBVTZJLElBQVYsQ0FBZW1ELG1CQUFmLENBQW1DcEksTUFBTXFJLFlBQXpDLENBQWpCO0FBQ0EsZ0JBQUlDLGNBQWV0SSxNQUFNL0MsTUFBTixDQUFhNkssR0FBZCxHQUFzQixpREFBdEIsR0FBNEUsaURBQTlGO0FBQ0EsZ0JBQUlTLFFBQVF2SSxNQUFNL0MsTUFBTixDQUFhc0wsS0FBekI7O0FBRUE7QUFDQSxnQkFBSUMsVUFBVSxTQUFWQSxPQUFVLENBQVNDLFVBQVQsRUFBcUI7QUFDL0Isb0JBQUlDLElBQUksRUFBUjs7QUFFQSxvQkFBSUQsVUFBSixFQUFnQjtBQUNaQyx3QkFBSSxrQkFBSjtBQUNILGlCQUZELE1BR0s7QUFDREEsd0JBQUksWUFBSjtBQUNIOztBQUVELHVCQUFPQSxDQUFQO0FBQ0gsYUFYRDs7QUFhQSxnQkFBSUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTRixVQUFULEVBQXFCRyxJQUFyQixFQUEyQjtBQUMzQyxvQkFBSUMsSUFBSSxFQUFSOztBQUVBLG9CQUFJSixVQUFKLEVBQWdCO0FBQ1osd0JBQUlHLE9BQU8sQ0FBWCxFQUFjO0FBQ1YsNEJBQUlFLE9BQU8zSCxjQUFjLG1CQUF6QjtBQUNBMEgsNkJBQUssdUtBQXVLRCxJQUF2SyxHQUE4SyxZQUE5SyxHQUE2TEEsSUFBN0wsR0FBb00sWUFBcE0sR0FBbU5FLElBQW5OLEdBQTBOLFdBQS9OO0FBQ0g7QUFDSjs7QUFFRCx1QkFBT0QsQ0FBUDtBQUNILGFBWEQ7O0FBYUE7QUFDQSxnQkFBSXBHLFVBQVUsa0JBQWQ7QUFDQSxnQkFBSXpDLE1BQU0vQyxNQUFOLENBQWF5RixPQUFiLElBQXdCLENBQTVCLEVBQStCO0FBQzNCRCwwQkFBVSx1QkFBVjtBQUNIO0FBQ0QsZ0JBQUl6QyxNQUFNL0MsTUFBTixDQUFheUYsT0FBYixJQUF3QixDQUE1QixFQUErQjtBQUMzQkQsMEJBQVUsd0JBQVY7QUFDSDs7QUFFRDtBQUNBLGdCQUFJc0csWUFBWSxFQUFoQjtBQUNBLGdCQUFJQyxjQUFjLEVBQWxCO0FBQ0EsZ0JBQUlULE1BQU1VLE1BQVYsRUFBa0I7QUFDZEYsNEJBQVksNEpBQ05SLE1BQU0vRixJQURBLEdBQ08sYUFEUCxHQUN1QitGLE1BQU1XLFdBRDdCLEdBQzJDLDJDQUQzQyxHQUVOL0gsV0FGTSxHQUVRb0gsTUFBTTNELEtBRmQsR0FFc0IsMEJBRmxDO0FBR0gsYUFKRCxNQUtLO0FBQ0RvRSw4QkFBYyxxQ0FBZDtBQUNIOztBQUVEO0FBQ0EsZ0JBQUlHLGNBQWMsRUFBbEI7QUFDQSxpQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksQ0FBcEIsRUFBdUJBLEdBQXZCLEVBQTRCO0FBQ3hCRCwrQkFBZSxrQ0FBZjs7QUFFQSxvQkFBSW5KLE1BQU0vQyxNQUFOLENBQWFvTSxPQUFiLENBQXFCclAsTUFBckIsR0FBOEJvUCxDQUFsQyxFQUFxQztBQUNqQyx3QkFBSUUsU0FBU3RKLE1BQU0vQyxNQUFOLENBQWFvTSxPQUFiLENBQXFCRCxDQUFyQixDQUFiOztBQUVBRCxtQ0FBZSx5REFBeUQxUCxLQUFLOFAsYUFBTCxDQUFtQkQsT0FBTzlHLElBQTFCLEVBQWdDOEcsT0FBT0osV0FBdkMsQ0FBekQsR0FBK0csc0NBQS9HLEdBQXdKL0gsV0FBeEosR0FBc0ttSSxPQUFPMUUsS0FBN0ssR0FBb0wsZUFBbk07QUFDSDs7QUFFRHVFLCtCQUFlLFFBQWY7QUFDSDs7QUFFRDtBQUNBLGdCQUFJSyxjQUFjLEVBQWxCO0FBQ0EsZ0JBQUlDLGlCQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQXJCLENBNUVpQyxDQTRFSztBQUN0QyxnQkFBSW5DLGdCQUFnQjdOLEtBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsQ0FBNEIzRixNQUFNRSxFQUFOLEdBQVcsRUFBdkMsRUFBMkNvSCxhQUEvRDtBQUNBLGdCQUFJb0MsSUFBSSxDQUFSO0FBOUVpQztBQUFBO0FBQUE7O0FBQUE7QUErRWpDLHNDQUFpQjFKLE1BQU0ySixLQUF2QixtSUFBOEI7QUFBQSx3QkFBckJDLElBQXFCOztBQUMxQkosbUNBQWUsOEJBQThCRSxDQUE5QixHQUFrQyxJQUFqRDs7QUFEMEI7QUFBQTtBQUFBOztBQUFBO0FBRzFCLDhDQUFtQkUsS0FBS3ZFLE9BQXhCLG1JQUFpQztBQUFBLGdDQUF4QnBJLE1BQXdCOztBQUM3QixnQ0FBSWlDLFFBQVEsRUFBWjtBQUNBLGdDQUFJakMsT0FBT2lDLEtBQVAsR0FBZSxDQUFuQixFQUFzQjtBQUNsQixvQ0FBSTJLLGNBQWM1TSxPQUFPaUMsS0FBUCxHQUFlLENBQWpDO0FBQ0Esb0NBQUk0SyxhQUFheEMsY0FBY3VDLFdBQWQsQ0FBakI7O0FBRUEzSyx3Q0FBUSwrQ0FBOEM0SyxVQUE5QyxHQUEwRCxVQUFsRTs7QUFFQSxvQ0FBSUwsZUFBZUksV0FBZixJQUE4QixDQUFsQyxFQUFxQztBQUNqQzNLLDZDQUFTLDREQUEyRDRLLFVBQTNELEdBQXVFLFVBQWhGO0FBQ0g7O0FBRURMLCtDQUFlSSxXQUFmO0FBQ0g7O0FBRUQsZ0NBQUlFLFVBQVUsZUFBYXZCLFFBQVF2TCxPQUFPK00sUUFBZixDQUFiLEdBQXNDLFVBQXRDLEdBQW1Ebk4sUUFBUUMsUUFBUixDQUFpQixRQUFqQixFQUEyQixFQUFDQyxRQUFRaUQsTUFBTWpELE1BQWYsRUFBdUJtRCxJQUFJakQsT0FBT2lELEVBQWxDLEVBQTNCLENBQW5ELEdBQXVILG9CQUFySTtBQUNBLGdDQUFJakQsT0FBT2lELEVBQVAsS0FBY0YsTUFBTS9DLE1BQU4sQ0FBYWlELEVBQS9CLEVBQW1DO0FBQy9CNkosMENBQVUsMkJBQVY7QUFDSDs7QUFFRFAsMkNBQWUsc0ZBQXNGdk0sT0FBT2UsSUFBN0YsR0FBb0csNENBQXBHLEdBQ1RtRCxXQURTLEdBQ0tsRSxPQUFPcUYsVUFEWixHQUN3QixlQUR4QixHQUMwQ3BELEtBRDFDLEdBQ2tEeUosY0FBYzFMLE9BQU8rTSxRQUFyQixFQUErQixFQUEvQixDQURsRCxHQUN1RkQsT0FEdkYsR0FDaUc5TSxPQUFPdUYsSUFEeEcsR0FDK0csWUFEOUg7QUFFSDtBQXpCeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUEyQjFCZ0gsbUNBQWUsUUFBZjs7QUFFQUU7QUFDSDtBQTdHZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUErR2pDLGdCQUFJNUksT0FBTyxvQ0FBbUNkLE1BQU1FLEVBQXpDLEdBQTZDLHNDQUE3QyxHQUFzRkYsTUFBTUUsRUFBNUYsR0FBaUcscUNBQWpHLEdBQ1Asc0RBRE8sR0FDa0RGLE1BQU1FLEVBRHhELEdBQzZELHVEQUQ3RCxHQUN1SDtBQUM5SCw0REFGTyxHQUU0Q3pHLEtBQUt3USxrQkFBTCxDQUF3QmpLLE1BQU0vQyxNQUFOLENBQWE2SyxHQUFyQyxDQUY1QyxHQUV3RixpQ0FGeEYsR0FFNEgzRyxXQUY1SCxHQUUwSW5CLE1BQU1rSyxTQUZoSixHQUUySixVQUYzSixHQUdQLG9IQUhPLEdBR2dIbEssTUFBTXhCLEdBSHRILEdBRzRILElBSDVILEdBR21Jd0IsTUFBTTBCLFFBSHpJLEdBR29KLGVBSHBKLEdBSVAsaUZBSk8sR0FJNkV1RCxJQUo3RSxHQUlvRixxQ0FKcEYsR0FJNEhnRCxhQUo1SCxHQUk0SSxzQkFKNUksR0FLUCxnQ0FMTyxHQUs0QkssV0FMNUIsR0FLMEMsUUFMMUMsR0FNUCxvQ0FOTyxHQU1nQ0gsVUFOaEMsR0FNNkMsUUFON0MsR0FPUCxRQVBPLEdBUVAsaURBUk8sR0FTUCwwREFUTyxHQVNzRGhILFdBVHRELEdBU29FbkIsTUFBTS9DLE1BQU4sQ0FBYXFGLFVBVGpGLEdBUzZGLGNBVDdGLEdBVVAsaUNBVk8sR0FVMkJxRyxjQUFjM0ksTUFBTS9DLE1BQU4sQ0FBYStNLFFBQTNCLEVBQXFDLEVBQXJDLENBVjNCLEdBVW9FLFlBVnBFLEdBVWlGeEIsUUFBUXhJLE1BQU0vQyxNQUFOLENBQWErTSxRQUFyQixDQVZqRixHQVVnSCxVQVZoSCxHQVU2SG5OLFFBQVFDLFFBQVIsQ0FBaUIsWUFBakIsRUFBK0IsRUFBQ0MsUUFBUWlELE1BQU1qRCxNQUFmLEVBQXVCbUQsSUFBSWhELFNBQTNCLEVBQXNDcUYsZ0JBQWdCdkMsTUFBTS9DLE1BQU4sQ0FBYWUsSUFBbkUsRUFBL0IsQ0FWN0gsR0FVd08sb0JBVnhPLEdBVStQZ0MsTUFBTS9DLE1BQU4sQ0FBYWUsSUFWNVEsR0FVbVIsWUFWblIsR0FXUCxRQVhPLEdBWVAsOEVBWk8sR0FhUGdMLFdBYk8sR0FjUCxzSkFkTyxHQWVHaEosTUFBTS9DLE1BQU4sQ0FBYWtOLEtBZmhCLEdBZXdCLDZDQWZ4QixHQWV3RW5LLE1BQU0vQyxNQUFOLENBQWFtTixNQWZyRixHQWU4RixZQWY5RixHQWU2R3BLLE1BQU0vQyxNQUFOLENBQWFvTixPQWYxSCxHQWVvSSxzQkFmcEksR0FnQlAsd0pBaEJPLEdBZ0JtSjVILE9BaEJuSixHQWdCNEosSUFoQjVKLEdBZ0JtS3pDLE1BQU0vQyxNQUFOLENBQWEwRixHQWhCaEwsR0FnQnNMLGdDQWhCdEwsR0FpQlBvRyxTQWpCTyxHQWtCUCxjQWxCTyxHQW1CUCwyRkFuQk8sR0FvQlBJLFdBcEJPLEdBcUJQLGNBckJPLEdBc0JQLGdGQXRCTyxHQXVCUEssV0F2Qk8sR0F3QlAsY0F4Qk8sR0F5QlAsNENBekJPLEdBeUJ3Q3hKLE1BQU1FLEVBekI5QyxHQXlCbUQsNkNBekJuRCxHQTBCUCx1REExQk8sR0EyQlAsUUEzQk8sR0E0QlAsb0JBNUJKOztBQThCQS9FLGNBQUUsK0JBQStCNkUsTUFBTUUsRUFBdkMsRUFBMkM5RSxNQUEzQyxDQUFrRDBGLElBQWxEOztBQUVBO0FBQ0FySCxpQkFBSzZRLDhCQUFMLENBQW9DdEssS0FBcEM7O0FBRUE7QUFDQTdFLGNBQUUsdUNBQXVDNkUsTUFBTUUsRUFBL0MsRUFBbURxSyxLQUFuRCxDQUF5RCxZQUFXO0FBQ2hFLG9CQUFJYixJQUFJdk8sRUFBRSxJQUFGLENBQVI7O0FBRUExQixxQkFBSytRLHFCQUFMLENBQTJCeEssTUFBTUUsRUFBakM7QUFDSCxhQUpEOztBQU1BO0FBQ0EvRSxjQUFFc1AsTUFBRixFQUFVQyxFQUFWLENBQWEsNkRBQWIsRUFBNEUsVUFBU0MsQ0FBVCxFQUFZO0FBQ3BGLG9CQUFJQyxXQUFXOVIsYUFBYStCLElBQWIsQ0FBa0JMLE9BQWxCLENBQTBCbkIsUUFBMUIsQ0FBbUNzTSxhQUFsRDs7QUFFQSxvQkFBSWlGLFNBQVM1SyxNQUFNRSxFQUFOLEdBQVcsRUFBcEIsQ0FBSixFQUE2QjtBQUN6Qix3QkFBSS9FLEVBQUUsK0JBQStCNkUsTUFBTUUsRUFBdkMsRUFBMkMySyxVQUEzQyxFQUFKLEVBQTZEO0FBQ3pELDRCQUFJQyxNQUFNM1AsRUFBRSxpREFBaUQ2RSxNQUFNRSxFQUF6RCxDQUFWOztBQUVBLDRCQUFJLENBQUMwSyxTQUFTNUssTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCMEgsS0FBN0IsRUFBb0M7QUFDaENrRCxnQ0FBSUMsSUFBSjtBQUNBSCxxQ0FBUzVLLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QjBILEtBQXhCLEdBQWdDLElBQWhDO0FBQ0g7QUFDSixxQkFQRCxNQVFLO0FBQ0QsNEJBQUlrRCxPQUFNM1AsRUFBRSxpREFBaUQ2RSxNQUFNRSxFQUF6RCxDQUFWOztBQUVBLDRCQUFJMEssU0FBUzVLLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QjBILEtBQTVCLEVBQW1DO0FBQy9Ca0QsaUNBQUlFLElBQUo7QUFDQUoscUNBQVM1SyxNQUFNRSxFQUFOLEdBQVcsRUFBcEIsRUFBd0IwSCxLQUF4QixHQUFnQyxLQUFoQztBQUNIO0FBQ0o7QUFDSjtBQUNKLGFBckJEO0FBc0JILFNBblhJO0FBb1hMMEMsd0NBQWdDLHdDQUFTdEssS0FBVCxFQUFnQjtBQUM1QyxnQkFBSXZHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxnQkFBSXdOLFlBQVloSSxNQUFNaUYsSUFBdEI7QUFDQSxnQkFBSUEsT0FBUSxJQUFJQyxJQUFKLENBQVM4QyxZQUFZLElBQXJCLENBQUQsQ0FBNkI3QyxjQUE3QixFQUFYO0FBQ0EsZ0JBQUlnRCxhQUFhL0wsVUFBVTZJLElBQVYsQ0FBZW1ELG1CQUFmLENBQW1DcEksTUFBTXFJLFlBQXpDLENBQWpCO0FBQ0EsZ0JBQUlDLGNBQWV0SSxNQUFNL0MsTUFBTixDQUFhNkssR0FBZCxHQUFzQixpREFBdEIsR0FBNEUsaURBQTlGOztBQUVBO0FBQ0EsZ0JBQUlVLFVBQVUsU0FBVkEsT0FBVSxDQUFTQyxVQUFULEVBQXFCO0FBQy9CLG9CQUFJQyxJQUFJLEVBQVI7O0FBRUEsb0JBQUlELFVBQUosRUFBZ0I7QUFDWkMsd0JBQUksa0JBQUo7QUFDSCxpQkFGRCxNQUdLO0FBQ0RBLHdCQUFJLFlBQUo7QUFDSDs7QUFFRCx1QkFBT0EsQ0FBUDtBQUNILGFBWEQ7O0FBYUEsZ0JBQUlDLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBU0YsVUFBVCxFQUFxQkcsSUFBckIsRUFBMkI7QUFDM0Msb0JBQUlDLElBQUksRUFBUjs7QUFFQSxvQkFBSUosVUFBSixFQUFnQjtBQUNaLHdCQUFJRyxPQUFPLENBQVgsRUFBYztBQUNWLDRCQUFJRSxPQUFPM0gsY0FBYyxtQkFBekI7QUFDQTBILDZCQUFLLHVLQUF1S0QsSUFBdkssR0FBOEssWUFBOUssR0FBNkxBLElBQTdMLEdBQW9NLFlBQXBNLEdBQW1ORSxJQUFuTixHQUEwTixXQUEvTjtBQUNIO0FBQ0o7O0FBRUQsdUJBQU9ELENBQVA7QUFDSCxhQVhEOztBQWFBO0FBQ0EsZ0JBQUluSCxXQUFXMUIsTUFBTTBCLFFBQXJCO0FBQ0EsZ0JBQUl1SixtQkFBbUJ2SixRQUF2QjtBQUNBLGdCQUFJQSxhQUFhLGFBQWpCLEVBQWdDO0FBQzVCdUosbUNBQW1CLGdGQUFuQjtBQUNILGFBRkQsTUFHSyxJQUFJdkosYUFBYSxhQUFqQixFQUFnQztBQUNqQ3VKLG1DQUFtQixnRkFBbkI7QUFDSCxhQUZJLE1BR0EsSUFBSXZKLGFBQWEsZ0JBQWpCLEVBQW1DO0FBQ3BDdUosbUNBQW1CLGdGQUFuQjtBQUNILGFBRkksTUFHQSxJQUFJdkosYUFBYSxhQUFqQixFQUFnQztBQUNqQ3VKLG1DQUFtQixnRkFBbkI7QUFDSDs7QUFFRDtBQUNBLGdCQUFJak4sT0FBT2dDLE1BQU0vQyxNQUFOLENBQWFlLElBQXhCOztBQUVBLGdCQUFJOEMsT0FBTyw0Q0FBMkNkLE1BQU1FLEVBQWpELEdBQXFELDhDQUFyRCxHQUFzR0YsTUFBTUUsRUFBNUcsR0FBaUgsNkNBQWpILEdBQ1AsOERBRE8sR0FDMERGLE1BQU1FLEVBRGhFLEdBQ3FFLCtEQURyRSxHQUN1STtBQUM5STtBQUNBLHFEQUhPLEdBSVAsd0NBSk8sR0FJbUNvSSxXQUpuQyxHQUlnRCxRQUpoRCxHQUtQLFFBTE87QUFNUDtBQUNBLHNEQVBPLEdBUVAyQyxnQkFSTyxHQVNQLFFBVE87QUFVUDtBQUNBLGtEQVhPLEdBWVAsdURBWk8sR0FZaUR0QyxjQUFjM0ksTUFBTS9DLE1BQU4sQ0FBYStNLFFBQTNCLEVBQXFDLEVBQXJDLENBWmpELEdBWTBGLFlBWjFGLEdBWXVHeEIsUUFBUXhJLE1BQU0vQyxNQUFOLENBQWErTSxRQUFyQixDQVp2RyxHQVlzSSxVQVp0SSxHQVltSm5OLFFBQVFDLFFBQVIsQ0FBaUIsWUFBakIsRUFBK0IsRUFBQ0MsUUFBUWlELE1BQU1qRCxNQUFmLEVBQXVCbUQsSUFBSWhELFNBQTNCLEVBQXNDcUYsZ0JBQWdCdkMsTUFBTS9DLE1BQU4sQ0FBYWUsSUFBbkUsRUFBL0IsQ0FabkosR0FZOFAsb0JBWjlQLEdBWXFSZ0MsTUFBTS9DLE1BQU4sQ0FBYWUsSUFabFMsR0FZeVMsWUFaelMsR0FhUCxRQWJPO0FBY1A7QUFDQSxpREFmTyxHQWdCUCxvQ0FoQk8sR0FnQitCZ0MsTUFBTXhCLEdBaEJyQyxHQWdCMEMsUUFoQjFDLEdBaUJQLFFBakJPO0FBa0JQO0FBQ0EseURBbkJPLEdBb0JQLDZDQXBCTyxHQW9Cd0MySixVQXBCeEMsR0FvQm9ELFFBcEJwRCxHQXFCUCxRQXJCTztBQXNCUDtBQUNBLGtEQXZCTyxHQXdCUCxxQ0F4Qk8sR0F3QmdDbEQsSUF4QmhDLEdBd0JzQyxRQXhCdEMsR0F5QlAsUUF6Qk87QUEwQlA7QUFDQSxnRUEzQk8sR0EyQmdEakYsTUFBTUUsRUEzQnRELEdBMkIyRCxxREEzQjNELEdBNEJQLHVEQTVCTyxHQTZCUCxRQTdCTyxHQThCUCxvQkE5Qko7O0FBZ0NBL0UsY0FBRSw0QkFBNEI2RSxNQUFNRSxFQUFwQyxFQUF3QzlFLE1BQXhDLENBQStDMEYsSUFBL0M7O0FBRUE7QUFDQTs7QUFFQTtBQUNBM0YsY0FBRSwrQ0FBK0M2RSxNQUFNRSxFQUF2RCxFQUEyRHFLLEtBQTNELENBQWlFLFlBQVc7QUFDeEUsb0JBQUliLElBQUl2TyxFQUFFLElBQUYsQ0FBUjs7QUFFQTFCLHFCQUFLK1EscUJBQUwsQ0FBMkJ4SyxNQUFNRSxFQUFqQztBQUNILGFBSkQ7O0FBTUE7QUFDQS9FLGNBQUVzUCxNQUFGLEVBQVVDLEVBQVYsQ0FBYSw2REFBYixFQUE0RSxVQUFTQyxDQUFULEVBQVk7QUFDcEYsb0JBQUl0UixXQUFXUCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBbEIsQ0FBMEJuQixRQUF6QztBQUNBLG9CQUFJdVIsV0FBV3ZSLFNBQVNzTSxhQUF4Qjs7QUFFQSxvQkFBSXRNLFNBQVNrTSxXQUFULElBQXdCcUYsU0FBUzVLLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixDQUE1QixFQUFxRDtBQUNqRCx3QkFBSS9FLEVBQUUsdUNBQXVDNkUsTUFBTUUsRUFBL0MsRUFBbUQySyxVQUFuRCxFQUFKLEVBQXFFO0FBQ2pFLDRCQUFJQyxNQUFNM1AsRUFBRSx5REFBeUQ2RSxNQUFNRSxFQUFqRSxDQUFWOztBQUVBLDRCQUFJLENBQUMwSyxTQUFTNUssTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCZ0wsWUFBN0IsRUFBMkM7QUFDdkNKLGdDQUFJQyxJQUFKO0FBQ0FILHFDQUFTNUssTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCZ0wsWUFBeEIsR0FBdUMsSUFBdkM7QUFDSDtBQUNKLHFCQVBELE1BUUs7QUFDRCw0QkFBSUosUUFBTTNQLEVBQUUseURBQXlENkUsTUFBTUUsRUFBakUsQ0FBVjs7QUFFQSw0QkFBSTBLLFNBQVM1SyxNQUFNRSxFQUFOLEdBQVcsRUFBcEIsRUFBd0JnTCxZQUE1QixFQUEwQztBQUN0Q0osa0NBQUlFLElBQUo7QUFDQUoscUNBQVM1SyxNQUFNRSxFQUFOLEdBQVcsRUFBcEIsRUFBd0JnTCxZQUF4QixHQUF1QyxLQUF2QztBQUNIO0FBQ0o7QUFDSjtBQUNKLGFBdEJEO0FBdUJILFNBOWVJO0FBK2VMViwrQkFBdUIsK0JBQVMvSyxPQUFULEVBQWtCO0FBQ3JDO0FBQ0EsZ0JBQUloRyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7QUFDQSxnQkFBSXpCLE9BQU9ELGFBQWFDLElBQWIsQ0FBa0J5QixPQUE3Qjs7QUFFQSxnQkFBSWYsS0FBS0osUUFBTCxDQUFjc00sYUFBZCxDQUE0QmxHLFVBQVUsRUFBdEMsRUFBMENnSSxhQUE5QyxFQUE2RDtBQUN6RDtBQUNBLG9CQUFJMEQsV0FBVzFSLEtBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsQ0FBNEJsRyxVQUFVLEVBQXRDLENBQWY7QUFDQTBMLHlCQUFTekQsV0FBVCxHQUF1QixDQUFDeUQsU0FBU3pELFdBQWpDO0FBQ0Esb0JBQUkwRCxXQUFXalEsRUFBRSw0QkFBMkJzRSxPQUE3QixDQUFmOztBQUVBLG9CQUFJMEwsU0FBU3pELFdBQWIsRUFBMEI7QUFDdEIwRCw2QkFBU0MsU0FBVCxDQUFtQixHQUFuQjtBQUNBbFEsc0JBQUVzUCxNQUFGLEVBQVVhLE9BQVYsQ0FBa0IsdUJBQWxCO0FBQ0gsaUJBSEQsTUFJSztBQUNERiw2QkFBU0csT0FBVCxDQUFpQixHQUFqQjtBQUNBcFEsc0JBQUVzUCxNQUFGLEVBQVVhLE9BQVYsQ0FBa0IsdUJBQWxCO0FBQ0g7QUFDSixhQWRELE1BZUs7QUFDRCxvQkFBSSxDQUFDdlMsS0FBS00sUUFBTCxDQUFjZ0csWUFBbkIsRUFBaUM7QUFDN0J0Ryx5QkFBS00sUUFBTCxDQUFjZ0csWUFBZCxHQUE2QixJQUE3Qjs7QUFFQTtBQUNBbEUsc0JBQUUsNEJBQTRCc0UsT0FBOUIsRUFBdUNyRSxNQUF2QyxDQUE4QyxvQ0FBb0NxRSxPQUFwQyxHQUE4Qyx3Q0FBNUY7O0FBRUE7QUFDQTFHLHlCQUFLMkgsU0FBTCxDQUFlakIsT0FBZjs7QUFFQTtBQUNBaEcseUJBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsQ0FBNEJsRyxVQUFVLEVBQXRDLEVBQTBDZ0ksYUFBMUMsR0FBMEQsSUFBMUQ7QUFDQWhPLHlCQUFLSixRQUFMLENBQWNzTSxhQUFkLENBQTRCbEcsVUFBVSxFQUF0QyxFQUEwQ2lJLFdBQTFDLEdBQXdELElBQXhEO0FBQ0g7QUFDSjtBQUNKLFNBbGhCSTtBQW1oQkw3RywrQkFBdUIsK0JBQVNwQixPQUFULEVBQWtCTyxLQUFsQixFQUF5QjtBQUM1QyxnQkFBSXZHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3QjtBQUNBLGdCQUFJZ1Isc0JBQXNCclEsRUFBRSw0QkFBMkJzRSxPQUE3QixDQUExQjs7QUFFQTtBQUNBLGdCQUFJZ0ssaUJBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FBckIsQ0FMNEMsQ0FLTjtBQUN0QyxnQkFBSUMsSUFBSSxDQUFSO0FBTjRDO0FBQUE7QUFBQTs7QUFBQTtBQU81QyxzQ0FBaUIxSixNQUFNMkosS0FBdkIsbUlBQThCO0FBQUEsd0JBQXJCQyxJQUFxQjs7QUFDMUI7QUFDQTRCLHdDQUFvQnBRLE1BQXBCLENBQTJCLG1EQUFrRHFFLE9BQWxELEdBQTJELFVBQXRGO0FBQ0Esd0JBQUlnTSxpQkFBaUJ0USxFQUFFLDJDQUEwQ3NFLE9BQTVDLENBQXJCOztBQUVBO0FBQ0FoRyx5QkFBS2lTLDBCQUFMLENBQWdDRCxjQUFoQyxFQUFnRDdCLElBQWhELEVBQXNENUosTUFBTTJMLE1BQU4sS0FBaUJqQyxDQUF2RSxFQUEwRTFKLE1BQU00TCxPQUFoRjs7QUFFQTtBQUNBLHdCQUFJQyxJQUFJLENBQVI7QUFUMEI7QUFBQTtBQUFBOztBQUFBO0FBVTFCLCtDQUFtQmpDLEtBQUt2RSxPQUF4Qix3SUFBaUM7QUFBQSxnQ0FBeEJwSSxNQUF3Qjs7QUFDN0I7QUFDQXhELGlDQUFLcVMsb0JBQUwsQ0FBMEJyTSxPQUExQixFQUFtQ08sTUFBTWpELE1BQXpDLEVBQWlEME8sY0FBakQsRUFBaUV4TyxNQUFqRSxFQUF5RTJNLEtBQUttQyxLQUE5RSxFQUFxRi9MLE1BQU1nTSxLQUEzRixFQUFrR0gsSUFBSSxDQUF0RyxFQUF5R3BDLGNBQXpHOztBQUVBLGdDQUFJeE0sT0FBT2lDLEtBQVAsR0FBZSxDQUFuQixFQUFzQjtBQUNsQixvQ0FBSTJLLGNBQWM1TSxPQUFPaUMsS0FBUCxHQUFlLENBQWpDO0FBQ0F1SywrQ0FBZUksV0FBZjtBQUNIOztBQUVEZ0M7QUFDSDtBQXBCeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFzQjFCbkM7QUFDSDtBQTlCMkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQStCL0MsU0FsakJJO0FBbWpCTGdDLG9DQUE0QixvQ0FBUzFLLFNBQVQsRUFBb0I0SSxJQUFwQixFQUEwQitCLE1BQTFCLEVBQWtDQyxPQUFsQyxFQUEyQztBQUNuRSxnQkFBSW5TLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQTtBQUNBLGdCQUFJeVIsVUFBV04sTUFBRCxHQUFZLCtDQUFaLEdBQWdFLDZDQUE5RTs7QUFFQTtBQUNBLGdCQUFJTyxPQUFPLEVBQVg7QUFDQSxnQkFBSU4sT0FBSixFQUFhO0FBQ1RNLHdCQUFRLFFBQVI7QUFEUztBQUFBO0FBQUE7O0FBQUE7QUFFVCwyQ0FBZ0J0QyxLQUFLc0MsSUFBckIsd0lBQTJCO0FBQUEsNEJBQWxCQyxHQUFrQjs7QUFDdkJELGdDQUFRLHlEQUF5REMsSUFBSTNKLElBQTdELEdBQW9FLG1DQUFwRSxHQUEwR3JCLFdBQTFHLEdBQXdIZ0wsSUFBSXZILEtBQTVILEdBQW1JLGVBQTNJO0FBQ0g7QUFKUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS1o7O0FBRUQsZ0JBQUk5RCxPQUFPO0FBQ1A7QUFDQSxzREFGTyxHQUdQbUwsT0FITyxHQUlQLFFBSk87QUFLUDtBQUNBLG9EQU5PLEdBT1ByQyxLQUFLd0MsS0FQRSxHQVFQLFFBUk87QUFTUDtBQUNBLG1EQVZPLEdBV1BGLElBWE8sR0FZUCxRQVpPO0FBYVA7QUFDQSwyREFkTztBQWVQO0FBQ0EsMEVBaEJPO0FBaUJQO0FBQ0Esa0ZBbEJPLEdBbUJQdEMsS0FBSzdPLEdBQUwsQ0FBU3NSLEdBQVQsQ0FBYTFLLE1BbkJOLEdBb0JQLGVBcEJPLEdBcUJQLFFBckJKOztBQXVCQVgsc0JBQVU1RixNQUFWLENBQWlCMEYsSUFBakI7QUFDSCxTQTFsQkk7QUEybEJMZ0wsOEJBQXNCLDhCQUFTck0sT0FBVCxFQUFrQjZNLFdBQWxCLEVBQStCdEwsU0FBL0IsRUFBMEMvRCxNQUExQyxFQUFrRHNQLFNBQWxELEVBQTZEQyxVQUE3RCxFQUF5RUMsT0FBekUsRUFBa0ZoRCxjQUFsRixFQUFrRztBQUNwSCxnQkFBSWhRLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQTtBQUNBLGdCQUFJa1MsZ0JBQWdCalQsS0FBS0osUUFBTCxDQUFjc00sYUFBZCxDQUE0QmxHLFVBQVUsRUFBdEMsRUFBMENrSSxXQUE5RDs7QUFFQTtBQUNBLGdCQUFJYSxVQUFVLFNBQVZBLE9BQVUsQ0FBU0MsVUFBVCxFQUFxQjtBQUMvQixvQkFBSUMsSUFBSSxFQUFSOztBQUVBLG9CQUFJRCxVQUFKLEVBQWdCO0FBQ1pDLHdCQUFJLGtCQUFKO0FBQ0gsaUJBRkQsTUFHSztBQUNEQSx3QkFBSSxZQUFKO0FBQ0g7O0FBRUQsdUJBQU9BLENBQVA7QUFDSCxhQVhEOztBQWFBLGdCQUFJQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQVNGLFVBQVQsRUFBcUJHLElBQXJCLEVBQTJCO0FBQzNDLG9CQUFJQyxJQUFJLEVBQVI7O0FBRUEsb0JBQUlKLFVBQUosRUFBZ0I7QUFDWix3QkFBSUcsT0FBTyxDQUFYLEVBQWM7QUFDViw0QkFBSUUsT0FBTzNILGNBQWMsbUJBQXpCO0FBQ0EwSCw2QkFBSyx1S0FBdUtELElBQXZLLEdBQThLLFlBQTlLLEdBQTZMQSxJQUE3TCxHQUFvTSxZQUFwTSxHQUFtTkUsSUFBbk4sR0FBME4sV0FBL047QUFDSDtBQUNKOztBQUVELHVCQUFPRCxDQUFQO0FBQ0gsYUFYRDs7QUFhQTtBQUNBLGdCQUFJOEQsYUFBYSxFQUFqQjtBQUNBLGdCQUFJNUMsVUFBVSxFQUFkO0FBQ0EsZ0JBQUk5TSxPQUFPaUQsRUFBUCxLQUFjd00sYUFBbEIsRUFBaUM7QUFDN0IzQywwQkFBVSw4Q0FBVjtBQUNILGFBRkQsTUFHSztBQUNEQSwwQkFBVSxrQ0FBaUN2QixRQUFRdkwsT0FBTytNLFFBQWYsQ0FBakMsR0FBMkQsVUFBM0QsR0FBd0VuTixRQUFRQyxRQUFSLENBQWlCLFFBQWpCLEVBQTJCLEVBQUNDLFFBQVF1UCxXQUFULEVBQXNCcE0sSUFBSWpELE9BQU9pRCxFQUFqQyxFQUEzQixDQUF4RSxHQUEySSxvQkFBcko7QUFDSDtBQUNEeU0sMEJBQWNoRSxjQUFjMUwsT0FBTytNLFFBQXJCLEVBQStCLEVBQS9CLElBQXFDRCxPQUFyQyxHQUErQzlNLE9BQU91RixJQUF0RCxHQUE2RCxNQUEzRTs7QUFFQTtBQUNBLGdCQUFJK0YsUUFBUXRMLE9BQU9zTCxLQUFuQjtBQUNBLGdCQUFJUSxZQUFZLEVBQWhCO0FBQ0EsZ0JBQUlSLE1BQU1VLE1BQVYsRUFBa0I7QUFDZEYsNEJBQVksdUpBQ05SLE1BQU0vRixJQURBLEdBQ08sYUFEUCxHQUN1QitGLE1BQU1XLFdBRDdCLEdBQzJDLDBDQUQzQyxHQUVOL0gsV0FGTSxHQUVRb0gsTUFBTTNELEtBRmQsR0FFc0IsR0FGdEIsR0FFMkIySCxTQUYzQixHQUVzQyxxQkFGbEQ7QUFHSDs7QUFFRDtBQUNBLGdCQUFJcEQsY0FBYyxFQUFsQjtBQUNBLGlCQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFDeEJELCtCQUFlLGlDQUFmOztBQUVBLG9CQUFJbE0sT0FBT29NLE9BQVAsQ0FBZXJQLE1BQWYsR0FBd0JvUCxDQUE1QixFQUErQjtBQUMzQix3QkFBSUUsU0FBU3JNLE9BQU9vTSxPQUFQLENBQWVELENBQWYsQ0FBYjs7QUFFQUQsbUNBQWUseURBQXlEMVAsS0FBSzhQLGFBQUwsQ0FBbUJELE9BQU85RyxJQUExQixFQUFnQzhHLE9BQU9KLFdBQXZDLENBQXpELEdBQStHLHFDQUEvRyxHQUF1Si9ILFdBQXZKLEdBQXFLbUksT0FBTzFFLEtBQTVLLEdBQW1MLGVBQWxNO0FBQ0g7O0FBRUR1RSwrQkFBZSxRQUFmO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBSTZDLFFBQVEvTyxPQUFPK08sS0FBbkI7O0FBRUEsZ0JBQUl2SixVQUFVLGtCQUFkO0FBQ0EsZ0JBQUl1SixNQUFNdEosT0FBTixJQUFpQixDQUFyQixFQUF3QjtBQUNwQkQsMEJBQVUsdUJBQVY7QUFDSDtBQUNELGdCQUFJdUosTUFBTXRKLE9BQU4sSUFBaUIsQ0FBckIsRUFBd0I7QUFDcEJELDBCQUFVLHdCQUFWO0FBQ0g7O0FBRUQsZ0JBQUltSyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQVVqVCxHQUFWLEVBQWVrVCxJQUFmLEVBQXFCO0FBQ3ZDLHVCQUFPbFQsTUFBSyxNQUFMLEdBQWFrVCxJQUFwQjtBQUNILGFBRkQ7O0FBSUEsZ0JBQUlDLFdBQVcsQ0FDWCxFQUFDQyxLQUFLLGFBQU4sRUFBcUJDLE9BQU8sWUFBNUIsRUFBMENDLE9BQU8sQ0FBakQsRUFBb0RDLE9BQU8sRUFBM0QsRUFBK0RDLGNBQWMsRUFBN0UsRUFBaUZyTSxNQUFNLEVBQXZGLEVBQTJGM0UsU0FBUyxhQUFwRyxFQURXLEVBRVgsRUFBQzRRLEtBQUssY0FBTixFQUFzQkMsT0FBTyxhQUE3QixFQUE0Q0MsT0FBTyxDQUFuRCxFQUFzREMsT0FBTyxFQUE3RCxFQUFpRUMsY0FBYyxFQUEvRSxFQUFtRnJNLE1BQU0sRUFBekYsRUFBNkYzRSxTQUFTLGNBQXRHLEVBRlcsRUFHWCxFQUFDNFEsS0FBSyxZQUFOLEVBQW9CQyxPQUFPLFdBQTNCLEVBQXdDQyxPQUFPLENBQS9DLEVBQWtEQyxPQUFPLEVBQXpELEVBQTZEQyxjQUFjLEVBQTNFLEVBQStFck0sTUFBTSxFQUFyRixFQUF5RjNFLFNBQVMsa0JBQWxHLEVBSFcsRUFJWCxFQUFDNFEsS0FBSyxTQUFOLEVBQWlCQyxPQUFPLFNBQXhCLEVBQW1DQyxPQUFPLENBQTFDLEVBQTZDQyxPQUFPLEVBQXBELEVBQXdEQyxjQUFjLEVBQXRFLEVBQTBFck0sTUFBTSxFQUFoRixFQUFvRjNFLFNBQVMsU0FBN0YsRUFKVyxFQUtYLEVBQUM0USxLQUFLLGNBQU4sRUFBc0JDLE9BQU8sYUFBN0IsRUFBNENDLE9BQU8sQ0FBbkQsRUFBc0RDLE9BQU8sRUFBN0QsRUFBaUVDLGNBQWMsRUFBL0UsRUFBbUZyTSxNQUFNLEVBQXpGLEVBQTZGM0UsU0FBUyxjQUF0RyxFQUxXLEVBTVgsRUFBQzRRLEtBQUssYUFBTixFQUFxQkMsT0FBTyxZQUE1QixFQUEwQ0MsT0FBTyxDQUFqRCxFQUFvREMsT0FBTyxFQUEzRCxFQUErREMsY0FBYyxFQUE3RSxFQUFpRnJNLE1BQU0sRUFBdkYsRUFBMkYzRSxTQUFTLHlCQUFwRyxFQU5XLENBQWY7O0FBbEZvSDtBQUFBO0FBQUE7O0FBQUE7QUEyRnBILHVDQUFhMlEsUUFBYix3SUFBdUI7QUFBbEJNLHdCQUFrQjs7QUFDbkIsd0JBQUlDLE1BQU1iLFdBQVdZLEtBQUtMLEdBQWhCLEVBQXFCLEtBQXJCLENBQVY7O0FBRUEsd0JBQUlPLGlCQUFpQixDQUFyQjtBQUNBLHdCQUFJRCxNQUFNLENBQVYsRUFBYTtBQUNUQyx5Q0FBa0J0QixNQUFNb0IsS0FBS0wsR0FBTCxHQUFXLE1BQWpCLEtBQTRCTSxNQUFNLElBQWxDLENBQUQsR0FBNEMsS0FBN0Q7QUFDSDs7QUFFREQseUJBQUtILEtBQUwsR0FBYUssY0FBYjs7QUFFQUYseUJBQUtGLEtBQUwsR0FBYWxCLE1BQU1vQixLQUFLTCxHQUFYLENBQWI7QUFDQUsseUJBQUtELFlBQUwsR0FBb0JDLEtBQUtGLEtBQXpCO0FBQ0Esd0JBQUlsQixNQUFNb0IsS0FBS0wsR0FBTCxHQUFXLE1BQWpCLEtBQTRCLENBQWhDLEVBQW1DO0FBQy9CSyw2QkFBS0QsWUFBTCxHQUFvQiw2Q0FBNkNDLEtBQUtGLEtBQWxELEdBQTBELFNBQTlFO0FBQ0g7O0FBRURFLHlCQUFLalIsT0FBTCxHQUFleVEsZ0JBQWdCUSxLQUFLRixLQUFyQixFQUE0QkUsS0FBS2pSLE9BQWpDLENBQWY7O0FBRUFpUix5QkFBS3RNLElBQUwsR0FBWSx5REFBeURzTSxLQUFLalIsT0FBOUQsR0FBd0UsNkRBQXhFLEdBQXVJaVIsS0FBS0osS0FBNUksR0FBbUosb0NBQW5KLEdBQXlMSSxLQUFLSCxLQUE5TCxHQUFxTSw2Q0FBck0sR0FBb1BHLEtBQUtELFlBQXpQLEdBQXVRLHFCQUFuUjtBQUNIOztBQUVEO0FBaEhvSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWlIcEgsZ0JBQUlJLGVBQWUsS0FBbkI7QUFDQSxnQkFBSUMsaUJBQWlCLEVBQXJCO0FBQ0EsZ0JBQUl2USxPQUFPbEMsR0FBUCxDQUFXMFMsS0FBWCxJQUFvQixDQUF4QixFQUEyQjtBQUN2QkYsK0JBQWUsS0FBZjtBQUNBQyxpQ0FBaUIsR0FBakI7QUFDSDtBQUNELGdCQUFJRSxXQUFXelEsT0FBT2xDLEdBQVAsQ0FBV3VHLElBQVgsR0FBaUIsR0FBakIsR0FBc0JyRSxPQUFPbEMsR0FBUCxDQUFXeUcsSUFBakMsR0FBdUMsb0NBQXZDLEdBQTZFK0wsWUFBN0UsR0FBMkYsS0FBM0YsR0FBa0dDLGNBQWxHLEdBQW1IdlEsT0FBT2xDLEdBQVAsQ0FBVzBTLEtBQTlILEdBQXFJLFVBQXBKOztBQUVBO0FBQ0EsZ0JBQUl2TyxRQUFRLEVBQVo7QUFDQSxnQkFBSW9JLGdCQUFnQjdOLEtBQUtKLFFBQUwsQ0FBY3NNLGFBQWQsQ0FBNEJsRyxVQUFVLEVBQXRDLEVBQTBDNkgsYUFBOUQ7QUFDQSxnQkFBSXJLLE9BQU9pQyxLQUFQLEdBQWUsQ0FBbkIsRUFBc0I7QUFDbEIsb0JBQUkySyxjQUFjNU0sT0FBT2lDLEtBQVAsR0FBZSxDQUFqQztBQUNBLG9CQUFJNEssYUFBYXhDLGNBQWN1QyxXQUFkLENBQWpCOztBQUVBM0ssd0JBQVEsK0NBQThDNEssVUFBOUMsR0FBMEQsVUFBbEU7O0FBRUEsb0JBQUlMLGVBQWVJLFdBQWYsSUFBOEIsQ0FBbEMsRUFBcUM7QUFDakMzSyw2QkFBUyw0REFBMkQ0SyxVQUEzRCxHQUF1RSxVQUFoRjtBQUNIO0FBQ0o7O0FBRUQ7QUFDQSxnQkFBSWhKLE9BQU8scUNBQW9DMkwsT0FBcEMsR0FBNkMsSUFBN0M7QUFDWDtBQUNBdk4saUJBRlc7QUFHWDtBQUNBLHVEQUpXLEdBS1gsMkVBTFcsR0FLbUVqQyxPQUFPZSxJQUwxRSxHQUtpRixtQ0FMakYsR0FLc0hmLE9BQU8wUSxVQUw3SCxHQUt5SSw0Q0FMekksR0FLd0x4TSxXQUx4TCxHQUtzTWxFLE9BQU9xRixVQUw3TSxHQUt5TixlQUx6TixHQU1YLFFBTlc7QUFPWDtBQUNBLHdEQVJXLEdBU1hxSyxVQVRXLEdBVVgsUUFWVztBQVdYO0FBQ0EsbURBWlcsR0FhWDVELFNBYlcsR0FjWCxRQWRXO0FBZVg7QUFDQSwyRkFoQlcsR0FpQlhJLFdBakJXLEdBa0JYLGNBbEJXO0FBbUJYO0FBQ0EsaURBcEJXLEdBcUJYLG9JQXJCVyxHQXNCVDZDLE1BQU03QixLQXRCRyxHQXNCSyw2Q0F0QkwsR0FzQnFENkIsTUFBTTVCLE1BdEIzRCxHQXNCb0UsWUF0QnBFLEdBc0JtRjRCLE1BQU0zQixPQXRCekYsR0FzQm1HLGVBdEJuRyxHQXVCWCw0S0F2QlcsR0F1Qm1LNUgsT0F2Qm5LLEdBdUI0SyxJQXZCNUssR0F1Qm1MdUosTUFBTXJKLEdBdkJ6TCxHQXVCK0wsZ0NBdkIvTCxHQXdCWCxRQXhCVztBQXlCWDtBQUNBLDJEQTFCVyxHQTJCWG1LLFNBQVMsQ0FBVCxFQUFZaE0sSUEzQkQsR0E0QlhnTSxTQUFTLENBQVQsRUFBWWhNLElBNUJELEdBNkJYZ00sU0FBUyxDQUFULEVBQVloTSxJQTdCRCxHQThCWCxRQTlCVztBQStCWDtBQUNBLDJEQWhDVyxHQWlDWGdNLFNBQVMsQ0FBVCxFQUFZaE0sSUFqQ0QsR0FrQ1hnTSxTQUFTLENBQVQsRUFBWWhNLElBbENELEdBbUNYZ00sU0FBUyxDQUFULEVBQVloTSxJQW5DRCxHQW9DWCxRQXBDVztBQXFDWDtBQUNBLGlEQXRDVyxHQXVDWCwyR0F2Q1csR0F1Q2tHNE0sUUF2Q2xHLEdBdUM0RyxrQ0F2QzVHLEdBdUNnSnZNLFdBdkNoSixHQXVDOEosd0JBdkM5SixHQXVDeUxsRSxPQUFPbEMsR0FBUCxDQUFXdUcsSUF2Q3BNLEdBdUMwTSx3Q0F2QzFNLEdBdUNvUHJFLE9BQU9sQyxHQUFQLENBQVd5RyxJQXZDL1AsR0F1Q3FRLGNBdkNyUSxHQXdDWCxRQXhDVyxHQXlDWCxRQXpDQTs7QUEyQ0FSLHNCQUFVNUYsTUFBVixDQUFpQjBGLElBQWpCO0FBQ0gsU0Evd0JJO0FBZ3hCTEwsNEJBQW9CLDhCQUFXO0FBQzNCLGdCQUFJaEgsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCOztBQUVBZixpQkFBS0osUUFBTCxDQUFjbU0sb0JBQWQsR0FBcUMsS0FBckM7QUFDQXJLLGNBQUUsNkJBQUYsRUFBaUN3QixNQUFqQztBQUNILFNBcnhCSTtBQXN4Qkw2RCw4QkFBc0IsZ0NBQVc7QUFDN0IsZ0JBQUkvRyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7QUFDQSxnQkFBSXpCLE9BQU9ELGFBQWFDLElBQWIsQ0FBa0J5QixPQUE3Qjs7QUFFQWYsaUJBQUtnSCxrQkFBTDs7QUFFQSxnQkFBSW1OLGFBQWEsaUVBQWpCOztBQUVBelMsY0FBRSw2QkFBRixFQUFpQ0MsTUFBakMsQ0FBd0N3UyxVQUF4Qzs7QUFFQXpTLGNBQUUsNkJBQUYsRUFBaUNvUCxLQUFqQyxDQUF1QyxZQUFXO0FBQzlDLG9CQUFJLENBQUN4UixLQUFLTSxRQUFMLENBQWNDLE9BQW5CLEVBQTRCO0FBQ3hCUCx5QkFBS00sUUFBTCxDQUFjQyxPQUFkLEdBQXdCLElBQXhCOztBQUVBLHdCQUFJb1EsSUFBSXZPLEVBQUUsSUFBRixDQUFSOztBQUVBdU8sc0JBQUU1SSxJQUFGLENBQU8sbURBQVA7O0FBRUFoSSxpQ0FBYUMsSUFBYixDQUFrQnlCLE9BQWxCLENBQTBCRixJQUExQjtBQUNIO0FBQ0osYUFWRDs7QUFZQWIsaUJBQUtKLFFBQUwsQ0FBY21NLG9CQUFkLEdBQXFDLElBQXJDO0FBQ0gsU0E3eUJJO0FBOHlCTHlFLDRCQUFvQiw0QkFBU25DLEdBQVQsRUFBYztBQUM5QixnQkFBSUEsR0FBSixFQUFTO0FBQ0wsdUJBQU8sdUJBQVA7QUFDSCxhQUZELE1BR0s7QUFDRCx1QkFBTyx3QkFBUDtBQUNIO0FBQ0osU0FyekJJO0FBc3pCTHlCLHVCQUFlLHVCQUFTL0csSUFBVCxFQUFlcUssSUFBZixFQUFxQjtBQUNoQyxtQkFBTyw2Q0FBNkNySyxJQUE3QyxHQUFvRCxhQUFwRCxHQUFvRXFLLElBQTNFO0FBQ0g7QUF4ekJJO0FBL1lPLENBQXBCOztBQTRzQ0ExUixFQUFFMFMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekIzUyxNQUFFNFMsRUFBRixDQUFLQyxZQUFMLENBQWtCQyxRQUFsQixHQUE2QixNQUE3QixDQUR5QixDQUNZOztBQUVyQztBQUNBOVMsTUFBRTRTLEVBQUYsQ0FBS2xELFVBQUwsR0FBa0IsWUFBVTtBQUN4QixZQUFJcUQsTUFBTS9TLEVBQUVzUCxNQUFGLENBQVY7O0FBRUEsWUFBSTBELFVBQVUsR0FBZDs7QUFFQSxZQUFJQyxXQUFXO0FBQ1hDLGlCQUFNSCxJQUFJSSxTQUFKLEtBQWtCSCxPQURiO0FBRVhJLGtCQUFPTCxJQUFJTSxVQUFKLEtBQW1CTDtBQUZmLFNBQWY7QUFJQUMsaUJBQVNLLEtBQVQsR0FBaUJMLFNBQVNHLElBQVQsR0FBZ0JMLElBQUlqQixLQUFKLEVBQWhCLEdBQStCLElBQUlrQixPQUFwRDtBQUNBQyxpQkFBU00sTUFBVCxHQUFrQk4sU0FBU0MsR0FBVCxHQUFlSCxJQUFJUyxNQUFKLEVBQWYsR0FBK0IsSUFBSVIsT0FBckQ7O0FBRUEsWUFBSVMsU0FBUyxLQUFLNVMsTUFBTCxFQUFiOztBQUVBLFlBQUksQ0FBQzRTLE1BQUwsRUFBYSxPQUFPLEtBQVAsQ0FkVyxDQWNHOztBQUUzQkEsZUFBT0gsS0FBUCxHQUFlRyxPQUFPTCxJQUFQLEdBQWMsS0FBS00sVUFBTCxFQUE3QjtBQUNBRCxlQUFPRixNQUFQLEdBQWdCRSxPQUFPUCxHQUFQLEdBQWEsS0FBS1MsV0FBTCxFQUE3Qjs7QUFFQSxlQUFRLEVBQUVWLFNBQVNLLEtBQVQsR0FBaUJHLE9BQU9MLElBQXhCLElBQWdDSCxTQUFTRyxJQUFULEdBQWdCSyxPQUFPSCxLQUF2RCxJQUFnRUwsU0FBU00sTUFBVCxHQUFrQkUsT0FBT1AsR0FBekYsSUFBZ0dELFNBQVNDLEdBQVQsR0FBZU8sT0FBT0YsTUFBeEgsQ0FBUjtBQUNILEtBcEJEOztBQXNCQTtBQUNBLFFBQUl4VSxVQUFVMkMsUUFBUUMsUUFBUixDQUFpQiw0QkFBakIsRUFBK0MsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3QkMsUUFBUUMsU0FBaEMsRUFBL0MsQ0FBZDs7QUFFQSxRQUFJL0MsY0FBYyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxCO0FBQ0EsUUFBSTRVLGFBQWFqVyxhQUFhQyxJQUFiLENBQWtCSyxNQUFuQzs7QUFFQTtBQUNBUSxvQkFBZ0JvVixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0M3VSxXQUF4QztBQUNBNFUsZUFBVzlVLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBZ0IsTUFBRSx3QkFBRixFQUE0QnVQLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVN1RSxLQUFULEVBQWdCO0FBQ3JEclYsd0JBQWdCb1YsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDN1UsV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FnQixNQUFFLEdBQUYsRUFBT3VQLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTQyxDQUFULEVBQVk7QUFDeENvRSxtQkFBVzlVLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQTdDRCxFIiwiZmlsZSI6InBsYXllci1sb2FkZXIuZjdkYmI4ZDRlM2QzOWI0NDUxOGYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAxNmViM2VhZDdkZDgwOWNlZGQwNCIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgdmFsID0gSG90c3RhdHVzRmlsdGVyLmdldFNlbGVjdG9yVmFsdWVzKFwic2Vhc29uXCIpO1xyXG5cclxuICAgICAgICBsZXQgc2Vhc29uID0gXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vhc29uO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuICAgICAgICBsZXQgYWpheF9tYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgIGxldCBhamF4X3RvcGhlcm9lcyA9IGFqYXgudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBhamF4X3BhcnRpZXMgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbW1yID0gZGF0YS5tbXI7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLy0tIEluaXRpYWwgTWF0Y2hlcyBGaXJzdCBMb2FkXHJcbiAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtbG9hZGVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0zeCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbW1yID0ganNvbi5tbXI7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbW1yLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfdG9waGVyb2VzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfcGFydGllcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNTVJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbW1yLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21tci5nZW5lcmF0ZU1NUkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbW1yLmdlbmVyYXRlTU1SQmFkZ2VzKGpzb25fbW1yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5pbnRlcm5hbC5saW1pdCA9IGpzb24ubGltaXRzLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgbWF0Y2ggc2V0XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF90b3BoZXJvZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF9wYXJ0aWVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucGxheWVybG9hZGVyLXByb2Nlc3NpbmcnKS5mYWRlSW4oKS5kZWxheSgyNTApLnF1ZXVlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl90b3BoZXJvZXNcIiwge1xyXG4gICAgICAgICAgICByZWdpb246IHBsYXllcl9yZWdpb24sXHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyBUb3AgSGVyb2VzIGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9waGVyb2VzID0gZGF0YS50b3BoZXJvZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFRvcCBIZXJvZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZXMgPSBqc29uLmhlcm9lcztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hcHMgPSBqc29uLm1hcHM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9oZXJvZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyKGpzb24ubWF0Y2hlc193aW5yYXRlLCBqc29uLm1hdGNoZXNfd2lucmF0ZV9yYXcsIGpzb24ubWF0Y2hlc19wbGF5ZWQsIGpzb24ubXZwX21lZGFsc19wZXJjZW50YWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wSGVyb2VzVGFibGUgPSBkYXRhX3RvcGhlcm9lcy5nZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyhqc29uX2hlcm9lcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhLnB1c2goZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuaW5pdFRvcEhlcm9lc1RhYmxlKHRvcEhlcm9lc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIE1hcHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWFwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcE1hcHNUYWJsZSA9IGRhdGFfdG9wbWFwcy5nZXRUb3BNYXBzVGFibGVDb25maWcoanNvbl9tYXBzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvcE1hcHNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFwIG9mIGpzb25fbWFwcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEobWFwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuaW5pdFRvcE1hcHNUYWJsZSh0b3BNYXBzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9wYXJ0aWVzXCIsIHtcclxuICAgICAgICAgICAgcmVnaW9uOiBwbGF5ZXJfcmVnaW9uLFxyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgUGFydGllcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9wYXJ0aWVzID0gZGF0YS5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUGFydGllcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3BhcnRpZXMgPSBqc29uLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgUGFydGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9wYXJ0aWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyKGpzb24ubGFzdF91cGRhdGVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0aWVzVGFibGUgPSBkYXRhX3BhcnRpZXMuZ2V0UGFydGllc1RhYmxlQ29uZmlnKGpzb25fcGFydGllcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnR5IG9mIGpzb25fcGFydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzVGFibGUuZGF0YS5wdXNoKGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGEocGFydHkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5pbml0UGFydGllc1RhYmxlKHBhcnRpZXNUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgbWF0Y2hsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIGZ1bGxtYXRjaCByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgbWF0Y2h1cmw6ICcnLCAvL3VybCB0byBnZXQgYSBmdWxsbWF0Y2ggcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgICAgIG9mZnNldDogMCwgLy9NYXRjaGVzIG9mZnNldFxyXG4gICAgICAgIGxpbWl0OiAxMCwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHJlZ2lvbjogcGxheWVyX3JlZ2lvbixcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWQsXHJcbiAgICAgICAgICAgIG9mZnNldDogc2VsZi5pbnRlcm5hbC5vZmZzZXQsXHJcbiAgICAgICAgICAgIGxpbWl0OiBzZWxmLmludGVybmFsLmxpbWl0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlTWF0Y2hVcmw6IGZ1bmN0aW9uKG1hdGNoX2lkKSB7XHJcbiAgICAgICAgcmV0dXJuIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX21hdGNoXCIsIHtcclxuICAgICAgICAgICAgbWF0Y2hpZDogbWF0Y2hfaWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRpc3BsYXlNYXRjaExvYWRlciA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9vZmZzZXRzID0ganNvbi5vZmZzZXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbGltaXRzID0ganNvbi5saW1pdHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaGVzID0ganNvbi5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9FbnN1cmUgY29udHJvbCBwYW5lbFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250cm9sUGFuZWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9TZXQgbmV3IG9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0FwcGVuZCBuZXcgTWF0Y2ggd2lkZ2V0cyBmb3IgbWF0Y2hlcyB0aGF0IGFyZW4ndCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBqc29uX21hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU1hdGNoKG1hdGNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9VcGRhdGUgQ29udHJvbCBQYW5lbCBncmFwaHMgYWZ0ZXIgbWF0Y2ggZ2VuZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBncmFwaGRhdGFfd2lucmF0ZSA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiV1wiXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiTFwiXVxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnVwZGF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGUoZ3JhcGhkYXRhX3dpbnJhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5pbnRlcm5hbC5vZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9SZW1vdmUgaW5pdGlhbCBsb2FkXHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgdGhlIG1hdGNoIG9mIGdpdmVuIGlkIHRvIGJlIGRpc3BsYXllZCB1bmRlciBtYXRjaCBzaW1wbGV3aWRnZXRcclxuICAgICAqL1xyXG4gICAgbG9hZE1hdGNoOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSBzZWxmLmdlbmVyYXRlTWF0Y2hVcmwobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmdWxsbWF0Y2gtcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoID0ganNvbi5tYXRjaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzKG1hdGNoaWQsIGpzb25fbWF0Y2gpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZnVsbG1hdGNoLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtbXI6IHtcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1tbXItY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1tbXItY29udGFpbmVyXCIgY2xhc3M9XCJwbC1tbXItY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgbWFyZ2luLWJvdHRvbS1zcGFjZXItMSBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLW1tci1jb250YWluZXItZnJhbWUnKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkJhZGdlczogZnVuY3Rpb24obW1ycykge1xyXG4gICAgICAgICAgICBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubW1yO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoJyNwbC1tbXItY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBtbXIgb2YgbW1ycykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1NUkJhZGdlKGNvbnRhaW5lciwgbW1yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJCYWRnZTogZnVuY3Rpb24oY29udGFpbmVyLCBtbXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tbXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgbW1yR2FtZVR5cGVJbWFnZSA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWdhbWVUeXBlSW1hZ2VcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9nYW1lVHlwZV9pY29uXycgKyBtbXIuZ2FtZVR5cGVfaW1hZ2UgKycucG5nXCI+JztcclxuICAgICAgICAgICAgbGV0IG1tcmltZyA9ICc8aW1nIGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBtbXIucmFuayArJy5wbmdcIj4nO1xyXG4gICAgICAgICAgICBsZXQgbW1ydGllciA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXJcIj4nKyBtbXIudGllciArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBHYW1lVHlwZSBJbWFnZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtZ2FtZVR5cGVJbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tckdhbWVUeXBlSW1hZ2UgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgSW1hZ2VcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLWltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1yaW1nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRpZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRpZXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJ0aWVyICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIFRvb2x0aXAgQXJlYVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtdG9vbHRpcC1hcmVhXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgc2VsZi5nZW5lcmF0ZU1NUlRvb2x0aXAobW1yKSArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJUb29sdGlwOiBmdW5jdGlvbihtbXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2PicrIG1tci5nYW1lVHlwZSArJzwvZGl2PjxkaXY+JysgbW1yLnJhdGluZyArJzwvZGl2PjxkaXY+JysgbW1yLnJhbmsgKycgJysgbW1yLnRpZXIgKyc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3BoZXJvZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBoZXJvTGltaXQ6IDUsIC8vSG93IG1hbnkgaGVyb2VzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcjogZnVuY3Rpb24od2lucmF0ZSwgd2lucmF0ZV9yYXcsIG1hdGNoZXNwbGF5ZWQsIG12cHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZVRleHQgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPjxkaXYgY2xhc3M9XCJkLWlubGluZS1ibG9jayB0b3BoZXJvZXMtaW5saW5lLXdpbnJhdGUgJysgZ29vZHdpbnJhdGUgKydcIj4nICtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1hdGNoZXNwbGF5ZWRjb250YWluZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcGhlcm9lcy1tYXRjaGVzcGxheWVkLWNvbnRhaW5lciB0b3BoZXJvZXMtc3BlY2lhbC1kYXRhXCI+PHNwYW4gY2xhc3M9XCJ0b3BoZXJvZXMtc3BlY2lhbC1kYXRhLWxhYmVsXCI+UGxheWVkOjwvc3Bhbj4gJysgbWF0Y2hlc3BsYXllZCArJyAoJysgd2lucmF0ZVRleHQgKycpPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtdnBwZXJjZW50Y29udGFpbmVyID0gJzxkaXYgY2xhc3M9XCJwbC10b3BoZXJvZXMtbXZwcGVyY2VudC1jb250YWluZXIgdG9waGVyb2VzLXNwZWNpYWwtZGF0YVwiPjxpbWcgY2xhc3M9XCJwbC10b3BoZXJvZXMtbXZwcGVyY2VudC1pbWFnZVwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsnc3Rvcm1fdWlfc2NvcmVzY3JlZW5fbXZwX212cF9ibHVlLnBuZ1wiPjxzcGFuIGNsYXNzPVwidG9waGVyb2VzLXNwZWNpYWwtZGF0YS1sYWJlbFwiPk1WUDo8L3NwYW4+ICcrIG12cHBlcmNlbnQgKyclPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVzcGxheWVkY29udGFpbmVyICtcclxuICAgICAgICAgICAgICAgIG12cHBlcmNlbnRjb250YWluZXIgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lci1mcmFtZScpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvKSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEhlcm9cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBoZXJvZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWhlcm9wYW5lXCI+PGRpdj48aW1nIGNsYXNzPVwicGwtdGgtaHAtaGVyb2ltYWdlXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgaGVyby5pbWFnZV9oZXJvICsnLnBuZ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGEgY2xhc3M9XCJwbC10aC1ocC1oZXJvbmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge3JlZ2lvbjogcGxheWVyX3JlZ2lvbiwgaWQ6IHBsYXllcl9pZCwgaGVyb1Byb3Blck5hbWU6IGhlcm8ubmFtZX0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIGhlcm8ubmFtZSArJzwvYT48L2Rpdj48L2Rpdj4nO1xyXG5cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEtEQVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGtkYSA9ICc8c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgaGVyby5rZGFfYXZnICsgJzwvc3Bhbj4gS0RBJztcclxuXHJcbiAgICAgICAgICAgIGxldCBrZGFpbmRpdiA9IGhlcm8ua2lsbHNfYXZnICsgJyAvIDxzcGFuIGNsYXNzPVwicGwtdGgta2RhLWluZGl2LWRlYXRoc1wiPicgKyBoZXJvLmRlYXRoc19hdmcgKyAnPC9zcGFuPiAvICcgKyBoZXJvLmFzc2lzdHNfYXZnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGtkYWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1rZGFwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBhY3R1YWxcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWtkYVwiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPicgK1xyXG4gICAgICAgICAgICAgICAga2RhICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBpbmRpdlxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC1rZGEtaW5kaXZcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGFpbmRpdiArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBXaW5yYXRlIC8gUGxheWVkXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qgd2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIGhlcm8ud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLnBsYXllZCArICcgcGxheWVkJyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbaGVyb2ZpZWxkLCBrZGFmaWVsZCwgd2lucmF0ZWZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRvcEhlcm9lc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSBzZWxmLmludGVybmFsLmhlcm9MaW1pdDsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJwbC10b3BoZXJvZXMtdGFibGVcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUb3BIZXJvZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG9wbWFwczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hcExpbWl0OiA2LCAvL0hvdyBtYW55IHRvcCBtYXBzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BtYXBzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXRvcG1hcHMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC10b3BtYXBzLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1wYXJ0aWVzLXRpdGxlXCI+TWFwczwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGxheWVyLWxlZnRwYW5lLW1pZC1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGE6IGZ1bmN0aW9uKG1hcCkge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBQYXJ0eVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbGV0IG1hcGltYWdlID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcGJnXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJysgaW1hZ2VfYnBhdGggKyd1aS9tYXBfaWNvbl8nKyBtYXAuaW1hZ2UgKycucG5nKTtcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1hcG5hbWUgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwbmFtZVwiPicrIG1hcC5uYW1lICsnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXBpbm5lciA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBwYW5lXCI+JysgbWFwaW1hZ2UgKyBtYXBuYW1lICsgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBXaW5yYXRlIC8gUGxheWVkXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qgd2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZSc7XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgbWFwLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgbWFwLnBsYXllZCArICcgcGxheWVkJyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbbWFwaW5uZXIsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BNYXBzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnRvcG1hcHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5tYXBMaW1pdDsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcG1hcHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJwbC10b3BtYXBzLXRhYmxlXCIgY2xhc3M9XCJwbC10b3BtYXBzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRvcE1hcHNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BtYXBzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBhcnRpZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBwYXJ0eUxpbWl0OiA0LCAvL0hvdyBtYW55IHBhcnRpZXMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNDb250YWluZXI6IGZ1bmN0aW9uKGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXBhcnRpZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1wYXJ0aWVzLXRpdGxlXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiTGFzdCBVcGRhdGVkOiAnKyBkYXRlICsnXCI+UGFydGllczwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1ib3QtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhOiBmdW5jdGlvbihwYXJ0eSkge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBQYXJ0eVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbGV0IHBhcnR5aW5uZXIgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHBhcnR5LnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgIHBhcnR5aW5uZXIgKz0gJzxkaXYgY2xhc3M9XCJwbC1wLXAtcGxheWVyIHBsLXAtcC1wbGF5ZXItJysgcGFydHkucGxheWVycy5sZW5ndGggKydcIj48YSBjbGFzcz1cInBsLXAtcC1wbGF5ZXJuYW1lXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtyZWdpb246IHBsYXllcl9yZWdpb24sIGlkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBwbGF5ZXIubmFtZSArJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcGFydHlmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy1wYXJ0eXBhbmVcIj4nKyBwYXJ0eWlubmVyICsnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIHBhcnR5LndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGFydHkucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0eWZpZWxkLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0UGFydGllc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwucGFydHlMaW1pdDsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJwbC1wYXJ0aWVzLXRhYmxlXCIgY2xhc3M9XCJwbC1wYXJ0aWVzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFBhcnRpZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hdGNoZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBjb21wYWN0VmlldzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGNvbXBhY3QgdmlldyBpcyBlbmFibGVkIGZvciByZWNlbnQgbWF0Y2hlc1xyXG4gICAgICAgICAgICBtYXRjaExvYWRlckdlbmVyYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGNoYXJ0ZGF0YV93aW5yYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBcIldcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiTFwiOiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjaGFydHM6IHt9LCAvL09iamVjdCBvZiBhbGwgY2hhcnRqcyBncmFwaHMgcmVsYXRlZCB0byBtYXRjaGVzXHJcbiAgICAgICAgICAgIGNvbnRyb2xQYW5lbEdlbmVyYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIG1hdGNoTWFuaWZlc3Q6IHt9IC8vS2VlcHMgdHJhY2sgb2Ygd2hpY2ggbWF0Y2ggaWRzIGFyZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkLCB0byBwcmV2ZW50IG9mZnNldCByZXF1ZXN0cyBmcm9tIHJlcGVhdGluZyBtYXRjaGVzIG92ZXIgbGFyZ2UgcGVyaW9kcyBvZiB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vUmVzZXQgY2hhcnRkYXRhXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRkYXRhX3dpbnJhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICBcIldcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiTFwiOiAwLFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9DbGVhciBjaGFydHMgb2JqZWN0XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXJ0a2V5IGluIHNlbGYuaW50ZXJuYWwuY2hhcnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5jaGFydHMuaGFzT3duUHJvcGVydHkoY2hhcnRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoYXJ0ID0gc2VsZi5pbnRlcm5hbC5jaGFydHNbY2hhcnRrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAvL2NvbXBhY3RWaWV3OiBsZWF2ZSB0aGUgc2V0dGluZyB0byB3aGF0ZXZlciBpdCBpcyBjdXJyZW50bHkgaW4gYmV0d2VlbiBmaWx0ZXIgbG9hZHNcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QgPSB7fTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTWF0Y2hHZW5lcmF0ZWQ6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShtYXRjaGlkICsgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGxheWVyLXJpZ2h0cGFuZS1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXIgaW5pdGlhbC1sb2FkIGhvdHN0YXR1cy1zdWJjb250YWluZXIgaG9yaXpvbnRhbC1zY3JvbGxlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGwtbm9yZWNlbnRtYXRjaGVzXCI+Tm8gUmVjZW50IE1hdGNoZXMgRm91bmQuLi48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRyb2xQYW5lbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250YWluZXIgPSAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udHJvbHBhbmVsXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgR3JhcGhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1jaGFydC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3Atd2lucmF0ZS1wZXJjZW50XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cInBsLXJtLWNwLXdpbnJhdGUtY2hhcnRcIj48L2NhbnZhcz4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1sb25ndGV4dC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Rlc3RpbmcxMjMnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBncmFwaHNcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVHcmFwaFJlY2VudE1hdGNoZXNXaW5yYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbMV0sIC8vRW1wdHkgaW5pdGlhbCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjM2JlMTU5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNjZDJlMmRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIzFjMjIyM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjMWMyMjIzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0b29sdGlwczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaG92ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHNbXCJ3aW5yYXRlXCJdID0gbmV3IENoYXJ0KCQoJyNwbC1ybS1jcC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdkb3VnaG51dCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGU6IGZ1bmN0aW9uKGNoYXJ0ZGF0YSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBzZWxmLmludGVybmFsLmNoYXJ0cy53aW5yYXRlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAvL1VwZGF0ZSB3aW5yYXRlIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGxldCB3aW5zID0gY2hhcnRkYXRhWzBdICogMS4wO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvc3NlcyA9IGNoYXJ0ZGF0YVsxXSAqIDEuMDtcclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlID0gMTAwLjA7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZTtcclxuICAgICAgICAgICAgICAgIGlmIChsb3NzZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZSA9ICh3aW5zIC8gKHdpbnMgKyBsb3NzZXMpKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbnJhdGVfZGlzcGxheSA9IHdpbnJhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZV9kaXNwbGF5LnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPVxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICB3aW5yYXRlX2Rpc3BsYXkgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJyNwbC1ybS1jcC13aW5yYXRlLXBlcmNlbnQnKS5odG1sKHdpbnJhdGVmaWVsZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgbmV3IGRhdGFcclxuICAgICAgICAgICAgICAgIGNoYXJ0LmRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGNoYXJ0ZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1VwZGF0ZSBjaGFydCAoZHVyYXRpb246IDAgPSBtZWFucyBubyBhbmltYXRpb24pXHJcbiAgICAgICAgICAgICAgICBjaGFydC51cGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgYWxsIHN1YmNvbXBvbmVudHMgb2YgYSBtYXRjaCBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggY29tcG9uZW50IGNvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lclwiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0dlbmVyYXRlIG9uZS10aW1lIHBhcnR5IGNvbG9ycyBmb3IgbWF0Y2hcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBbMSwgMiwgMywgNCwgNV07IC8vQXJyYXkgb2YgY29sb3JzIHRvIHVzZSBmb3IgcGFydHkgYXQgaW5kZXggPSBwYXJ0eUluZGV4IC0gMVxyXG4gICAgICAgICAgICBIb3RzdGF0dXMudXRpbGl0eS5zaHVmZmxlKHBhcnRpZXNDb2xvcnMpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGlzIGN1cnJlbnRseSB0b2dnbGVkIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIG1hdGNoUGxheWVyOiBtYXRjaC5wbGF5ZXIuaWQsIC8vSWQgb2YgdGhlIG1hdGNoJ3MgcGxheWVyIGZvciB3aG9tIHRoZSBtYXRjaCBpcyBiZWluZyBkaXNwbGF5ZWQsIGZvciB1c2Ugd2l0aCBoaWdobGlnaHRpbmcgaW5zaWRlIG9mIGZ1bGxtYXRjaCAod2hpbGUgZGVjb3VwbGluZyBtYWlucGxheWVyKVxyXG4gICAgICAgICAgICAgICAgcGFydGllc0NvbG9yczogcGFydGllc0NvbG9ycywgLy9Db2xvcnMgdG8gdXNlIGZvciB0aGUgcGFydHkgaW5kZXhlc1xyXG4gICAgICAgICAgICAgICAgc2hvd246IHRydWUsIC8vV2hldGhlciBvciBub3QgdGhlIG1hdGNoc2ltcGxld2lkZ2V0IGlzIGV4cGVjdGVkIHRvIGJlIHNob3duIGluc2lkZSB2aWV3cG9ydFxyXG4gICAgICAgICAgICAgICAgc2hvd0NvbXBhY3Q6IHRydWUsIC8vV2hldGhlciBvciBub3QgdGhlIGNvbXBhY3QgbWF0Y2hzaW1wbGV3aWRnZXQgaXMgZXhwZWN0ZWQgdG8gYmUgc2hvd24gaW5zaWRlIHZpZXdwb3J0IHdoZW4gY29tcGFjdCBtb2RlIGlzIG9uXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1RyYWNrIHdpbnJhdGUgZm9yIGdyYXBoc1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLndvbikge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydGRhdGFfd2lucmF0ZVtcIldcIl0rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRkYXRhX3dpbnJhdGVbXCJMXCJdKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3ViY29tcG9uZW50c1xyXG4gICAgICAgICAgICBzZWxmLmdlbmVyYXRlTWF0Y2hXaWRnZXQobWF0Y2gpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIHNtYWxsIG1hdGNoIGJhciB3aXRoIHNpbXBsZSBpbmZvXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggV2lkZ2V0IENvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbWF0Y2guZGF0ZTtcclxuICAgICAgICAgICAgbGV0IHJlbGF0aXZlX2RhdGUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRSZWxhdGl2ZVRpbWUodGltZXN0YW1wKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUodGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaF90aW1lID0gSG90c3RhdHVzLmRhdGUuZ2V0TWludXRlU2Vjb25kVGltZShtYXRjaC5tYXRjaF9sZW5ndGgpO1xyXG4gICAgICAgICAgICBsZXQgdmljdG9yeVRleHQgPSAobWF0Y2gucGxheWVyLndvbikgPyAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtd29uXCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1sb3N0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBtYXRjaC5wbGF5ZXIubWVkYWw7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICd1aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBub21lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctc3AtbWVkYWwtY29udGFpbmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1zdy1zcC1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIGltYWdlX2JwYXRoICsgbWVkYWwuaW1hZ2UgKyAnX2JsdWUucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCA9IFwiPGRpdiBjbGFzcz0ncm0tc3ctc3Atb2Zmc2V0Jz48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXRwLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gbWF0Y2gucGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy10cC10YWxlbnRcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyB0YWxlbnQuaW1hZ2UgKycucG5nXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXJzXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXRlYW0nICsgdCArICdcIj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LXNtIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktc20gcm0tcGFydHktc20tY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJzxhIGNsYXNzPVwiJytzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7cmVnaW9uOiBtYXRjaC5yZWdpb24sIGlkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoLnBsYXllci5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXBsYXllclwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctcHAtcGxheWVyLWltYWdlXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIGltYWdlX2JwYXRoICsgcGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9zcGFuPicgKyBwYXJ0eSArIHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxMikgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXRcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lclwiPicgKyAvL0hpZGUgaW5uZXIgY29udGVudHMgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1sZWZ0cGFuZSAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArIGltYWdlX2JwYXRoICsgbWF0Y2gubWFwX2ltYWdlICsnLnBuZyk7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZS10ZXh0XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1hdGNoLm1hcCArICdcIj4nICsgbWF0Y2guZ2FtZVR5cGUgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1kYXRlXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGRhdGUgKyAnXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1kYXRlLXRleHRcIj4nICsgcmVsYXRpdmVfZGF0ZSArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC12aWN0b3J5XCI+JyArIHZpY3RvcnlUZXh0ICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1tYXRjaGxlbmd0aFwiPicgKyBtYXRjaF90aW1lICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaGVyb3BhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxpbWcgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBybS1zdy1ocC1wb3J0cmFpdFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIG1hdGNoLnBsYXllci5pbWFnZV9oZXJvICsnLnBuZ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1ocC1oZXJvbmFtZVwiPicrc2lsZW5jZV9pbWFnZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQsIDE2KSsnPGEgY2xhc3M9XCInK3NpbGVuY2UobWF0Y2gucGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyaGVyb1wiLCB7cmVnaW9uOiBtYXRjaC5yZWdpb24sIGlkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1zdGF0c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3AtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtdGV4dFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBtYXRjaC5wbGF5ZXIua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIG1hdGNoLnBsYXllci5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBtYXRjaC5wbGF5ZXIuYXNzaXN0cyArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGFcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBtYXRjaC5wbGF5ZXIua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXRhbGVudHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXRwLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXBsYXllcnNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXBwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0dlbmVyYXRlIGhpZGRlbiBjb21wYWN0IHZpZXcgd2lkZ2V0XHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVDb21wYWN0Vmlld01hdGNoV2lkZ2V0KG1hdGNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBzY3JvbGwgbGlzdGVuZXIgZm9yIGhpZGluZyBvdXRzaWRlIG9mIHZpZXdwb3J0XHJcbiAgICAgICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZSBzY3JvbGwgaG90c3RhdHVzLm1hdGNodG9nZ2xlIGhvdHN0YXR1cy5jb21wYWN0dG9nZ2xlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYW5pZmVzdCA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCkuaXNPblNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLScgKyBtYXRjaC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29tcGFjdFZpZXdNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJ3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dhbWVUeXBlXHJcbiAgICAgICAgICAgIGxldCBnYW1lVHlwZSA9IG1hdGNoLmdhbWVUeXBlO1xyXG4gICAgICAgICAgICBsZXQgZ2FtZVR5cGVfZGlzcGxheSA9IGdhbWVUeXBlO1xyXG4gICAgICAgICAgICBpZiAoZ2FtZVR5cGUgPT09IFwiSGVybyBMZWFndWVcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtaGxcIj5ITDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiVGVhbSBMZWFndWVcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtdGxcIj5UTDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiVW5yYW5rZWQgRHJhZnRcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtdWRcIj5VRDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiUXVpY2sgTWF0Y2hcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtcW1cIj5RTTwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vSGVyb1xyXG4gICAgICAgICAgICBsZXQgaGVybyA9IG1hdGNoLnBsYXllci5oZXJvO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci1jb21wYWN0LScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1jb21wYWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1jb21wYWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci1jb21wYWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci1jb21wYWN0XCI+JyArIC8vSGlkZSBpbm5lciBjb250ZW50cyBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtdmljdG9yeXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC12cC12aWN0b3J5XCI+JysgdmljdG9yeVRleHQgKyc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vR2FtZVR5cGUgUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWdhbWV0eXBlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0hlcm8gUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtaHAtaGVybyBwbC10aC1ocC1oZXJvbmFtZVwiPicrc2lsZW5jZV9pbWFnZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQsIDE2KSsnPGEgY2xhc3M9XCInK3NpbGVuY2UobWF0Y2gucGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyaGVyb1wiLCB7cmVnaW9uOiBtYXRjaC5yZWdpb24sIGlkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01hcCBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtbWFwcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LW1wLW1hcFwiPicrIG1hdGNoLm1hcCArJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NYXRjaCBMZW5ndGggUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LW1hdGNobGVuZ3RocGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LW1scC1tYXRjaGxlbmd0aFwiPicrIG1hdGNoX3RpbWUgKyc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vRGF0ZSBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtZGF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1kcC1kYXRlXCI+JysgZGF0ZSArJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9JbnNwZWN0XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LWNvbXBhY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtY29tcGFjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9IaWRlIGJ5IGRlZmF1bHRcclxuICAgICAgICAgICAgLy8kKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLWNvbXBhY3QtJyArIG1hdGNoLmlkKS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjbGljayBsaXN0ZW5lcnMgZm9yIGluc3BlY3QgcGFuZVxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtY29tcGFjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBzY3JvbGwgbGlzdGVuZXIgZm9yIGhpZGluZyBvdXRzaWRlIG9mIHZpZXdwb3J0XHJcbiAgICAgICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZSBzY3JvbGwgaG90c3RhdHVzLm1hdGNodG9nZ2xlIGhvdHN0YXR1cy5jb21wYWN0dG9nZ2xlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnRlcm5hbCA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuaW50ZXJuYWw7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWFuaWZlc3QgPSBpbnRlcm5hbC5tYXRjaE1hbmlmZXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbC5jb21wYWN0VmlldyAmJiBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtY29tcGFjdC0nICsgbWF0Y2guaWQpLmlzT25TY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsID0gJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci1jb21wYWN0LScgKyBtYXRjaC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd25Db21wYWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWwuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93bkNvbXBhY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsID0gJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci1jb21wYWN0LScgKyBtYXRjaC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93bkNvbXBhY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duQ29tcGFjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUGFuZTogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgZnVsbCBtYXRjaCBwYW5lIHRoYXQgbG9hZHMgd2hlbiBhIG1hdGNoIHdpZGdldCBpcyBjbGlja2VkIGZvciBhIGRldGFpbGVkIHZpZXcsIGlmIGl0J3MgYWxyZWFkeSBsb2FkZWQsIHRvZ2dsZSBpdHMgZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaG1hbiA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl07XHJcbiAgICAgICAgICAgICAgICBtYXRjaG1hbi5mdWxsRGlzcGxheSA9ICFtYXRjaG1hbi5mdWxsRGlzcGxheTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNobWFuLmZ1bGxEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVEb3duKDI1MCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJob3RzdGF0dXMubWF0Y2h0b2dnbGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZVVwKDI1MCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJob3RzdGF0dXMubWF0Y2h0b2dnbGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIGZ1bGwgbWF0Y2ggcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoaWQpLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC0nICsgbWF0Y2hpZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaFwiPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvYWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGFqYXgubG9hZE1hdGNoKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvZyBhcyBnZW5lcmF0ZWQgaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd3M6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGZ1bGxtYXRjaF9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGVhbXNcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBmdWxsbWF0Y2hfY29udGFpbmVyLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkICsnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVhbV9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGVhbSBSb3cgSGVhZGVyXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyKHRlYW1fY29udGFpbmVyLCB0ZWFtLCBtYXRjaC53aW5uZXIgPT09IHQsIG1hdGNoLmhhc0JhbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHBsYXllcnMgZm9yIHRlYW1cclxuICAgICAgICAgICAgICAgIGxldCBwID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1BsYXllciBSb3dcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbG1hdGNoUm93KG1hdGNoaWQsIG1hdGNoLnJlZ2lvbiwgdGVhbV9jb250YWluZXIsIHBsYXllciwgdGVhbS5jb2xvciwgbWF0Y2guc3RhdHMsIHAgJSAyLCBwYXJ0aWVzQ291bnRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXI6IGZ1bmN0aW9uKGNvbnRhaW5lciwgdGVhbSwgd2lubmVyLCBoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vVmljdG9yeVxyXG4gICAgICAgICAgICBsZXQgdmljdG9yeSA9ICh3aW5uZXIpID8gKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnlcIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLWRlZmVhdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQmFuc1xyXG4gICAgICAgICAgICBsZXQgYmFucyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGFzQmFucykge1xyXG4gICAgICAgICAgICAgICAgYmFucyArPSAnQmFuczogJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJhbiBvZiB0ZWFtLmJhbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYW5zICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgYmFuLm5hbWUgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXJoLWJhblwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIGJhbi5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd2hlYWRlclwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9WaWN0b3J5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdmljdG9yeSArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gTGV2ZWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWxldmVsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5sZXZlbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0JhbnMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWJhbnMtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBiYW5zICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1rZGEtY29udGFpbmVyXCI+S0RBPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1N0YXRpc3RpY3MgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXN0YXRpc3RpY3MtY29udGFpbmVyXCI+UGVyZm9ybWFuY2U8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTW1yIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1tbXItY29udGFpbmVyXCI+TU1SOiA8c3BhbiBjbGFzcz1cInJtLWZtLXJoLW1tclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5tbXIub2xkLnJhdGluZyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsbWF0Y2hSb3c6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNocmVnaW9uLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yLCBtYXRjaFN0YXRzLCBvZGRFdmVuLCBwYXJ0aWVzQ291bnRlcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hQbGF5ZXJJZCA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ubWF0Y2hQbGF5ZXI7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICd1aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBsZXQgcGxheWVybmFtZSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc3BlY2lhbCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaFBsYXllcklkKSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lIHJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSAnKyBzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkgKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge3JlZ2lvbjogbWF0Y2hyZWdpb24sIGlkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgKz0gc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDE0KSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+JztcclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gcGxheWVyLm1lZGFsO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWlubmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBtZWRhbC5pbWFnZSArICdfJysgdGVhbUNvbG9yICsnLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tZm0tci10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tci10YWxlbnRcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyB0YWxlbnQuaW1hZ2UgKycucG5nXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdGF0c1xyXG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBwbGF5ZXIuc3RhdHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdF90b29sdGlwID0gZnVuY3Rpb24gKHZhbCwgZGVzYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArJzxicj4nKyBkZXNjO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRzID0gW1xyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZXJvX2RhbWFnZVwiLCBjbGFzczogXCJoZXJvZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlcm8gRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcInNpZWdlX2RhbWFnZVwiLCBjbGFzczogXCJzaWVnZWRhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdTaWVnZSBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwibWVyY19jYW1wc1wiLCBjbGFzczogXCJtZXJjY2FtcHNcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnTWVyYyBDYW1wcyBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZWFsaW5nXCIsIGNsYXNzOiBcImhlYWxpbmdcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVhbGluZyd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJkYW1hZ2VfdGFrZW5cIiwgY2xhc3M6IFwiZGFtYWdldGFrZW5cIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRGFtYWdlIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImV4cF9jb250cmliXCIsIGNsYXNzOiBcImV4cGNvbnRyaWJcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRXhwZXJpZW5jZSBDb250cmlidXRpb24nfVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChzdGF0IG9mIHJvd3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gbWF0Y2hTdGF0c1tzdGF0LmtleV1bXCJtYXhcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBlcmNlbnRPblJhbmdlID0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChtYXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudE9uUmFuZ2UgPSAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gLyAobWF4ICogMS4wMCkpICogMTAwLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC53aWR0aCA9IHBlcmNlbnRPblJhbmdlO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWUgPSBzdGF0c1tzdGF0LmtleV07XHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9IHN0YXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gJzxzcGFuIGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXItbm9uZVwiPicgKyBzdGF0LnZhbHVlICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudG9vbHRpcCA9IHJvd3N0YXRfdG9vbHRpcChzdGF0LnZhbHVlLCBzdGF0LnRvb2x0aXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQuaHRtbCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc3RhdC50b29sdGlwICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXJvd1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLScrIHN0YXQuY2xhc3MgKycgcm0tZm0tci1zdGF0cy1iYXJcIiBzdHlsZT1cIndpZHRoOiAnKyBzdGF0LndpZHRoICsnJVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlclwiPicrIHN0YXQudmFsdWVEaXNwbGF5ICsnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTU1SXHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVR5cGUgPSBcIm5lZ1wiO1xyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLm1tci5kZWx0YSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVR5cGUgPSBcInBvc1wiO1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFQcmVmaXggPSBcIitcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGEgPSBwbGF5ZXIubW1yLnJhbmsgKycgJysgcGxheWVyLm1tci50aWVyICsnICg8c3BhbiBjbGFzcz1cXCdybS1mbS1yLW1tci1kZWx0YS0nKyBtbXJEZWx0YVR5cGUgKydcXCc+JysgbW1yRGVsdGFQcmVmaXggKyBwbGF5ZXIubW1yLmRlbHRhICsnPC9zcGFuPiknO1xyXG5cclxuICAgICAgICAgICAgLy9QYXJ0eVxyXG4gICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktbWQgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LW1kIHJtLXBhcnR5LW1kLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9CdWlsZCBodG1sXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3cgcm0tZm0tcm93LScrIG9kZEV2ZW4gKydcIj4nICtcclxuICAgICAgICAgICAgLy9QYXJ0eSBTdHJpcGVcclxuICAgICAgICAgICAgcGFydHkgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHBsYXllci5pbWFnZV9oZXJvICsnLnBuZ1wiPjwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1BsYXllciBOYW1lIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcGxheWVybmFtZSArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NZWRhbCBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vVGFsZW50cyBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudHMtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGEtaW5kaXZcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPidcclxuICAgICAgICAgICAgKyBzdGF0cy5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgc3RhdHMuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgc3RhdHMuYXNzaXN0cyArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1rZGFcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIHN0YXRzLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIE9mZmVuc2UgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1vZmZlbnNlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1swXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMV0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzJdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgVXRpbGl0eSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXV0aWxpdHktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzNdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s0XS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNV0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9NTVIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItdG9vbHRpcC1hcmVhXCIgc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInKyBtbXJEZWx0YSArJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1tclwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL3JhbmtlZF9wbGF5ZXJfaWNvbl8nICsgcGxheWVyLm1tci5yYW5rICsnLnBuZ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1udW1iZXJcIj4nKyBwbGF5ZXIubW1yLnRpZXIgKyc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVyaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXJcIj5Mb2FkIE1vcmUgTWF0Y2hlcy4uLjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQobG9hZGVyaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0Lmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTF4IGZhLWZ3XCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzLmxvYWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yX01hdGNoV29uTG9zdDogZnVuY3Rpb24od29uKSB7XHJcbiAgICAgICAgICAgIGlmICh3b24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctd29uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctbG9zdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbGVudHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL0pxdWVyeSBpc09uU2NyZWVuIChSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBjYWxsaW5nIHNlbGVjdG9yIGlzIGluc2lkZSB0aGUgdmlld3BvcnQgKyBwYWRkZWQgem9uZSBmb3Igc2Nyb2xsIHNtb290aG5lc3MpXHJcbiAgICAkLmZuLmlzT25TY3JlZW4gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGxldCB3aW4gPSAkKHdpbmRvdyk7XHJcblxyXG4gICAgICAgIGxldCBwYWRTaXplID0gNjAwO1xyXG5cclxuICAgICAgICBsZXQgdmlld3BvcnQgPSB7XHJcbiAgICAgICAgICAgIHRvcCA6IHdpbi5zY3JvbGxUb3AoKSAtIHBhZFNpemUsXHJcbiAgICAgICAgICAgIGxlZnQgOiB3aW4uc2Nyb2xsTGVmdCgpIC0gcGFkU2l6ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmlld3BvcnQucmlnaHQgPSB2aWV3cG9ydC5sZWZ0ICsgd2luLndpZHRoKCkgKyAoMiAqIHBhZFNpemUpO1xyXG4gICAgICAgIHZpZXdwb3J0LmJvdHRvbSA9IHZpZXdwb3J0LnRvcCArIHdpbi5oZWlnaHQoKSArICgyICogcGFkU2l6ZSk7XHJcblxyXG4gICAgICAgIGxldCBib3VuZHMgPSB0aGlzLm9mZnNldCgpO1xyXG5cclxuICAgICAgICBpZiAoIWJvdW5kcykgcmV0dXJuIGZhbHNlOyAvL0NhdGNoIHVuZGVmaW5lZCBib3VuZHMgY2F1c2VkIGJ5IGpxdWVyeSBhbmltYXRpb25zIG9mIG9iamVjdHMgb3V0c2lkZSBvZiB0aGUgdmlld3BvcnRcclxuXHJcbiAgICAgICAgYm91bmRzLnJpZ2h0ID0gYm91bmRzLmxlZnQgKyB0aGlzLm91dGVyV2lkdGgoKTtcclxuICAgICAgICBib3VuZHMuYm90dG9tID0gYm91bmRzLnRvcCArIHRoaXMub3V0ZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICghKHZpZXdwb3J0LnJpZ2h0IDwgYm91bmRzLmxlZnQgfHwgdmlld3BvcnQubGVmdCA+IGJvdW5kcy5yaWdodCB8fCB2aWV3cG9ydC5ib3R0b20gPCBib3VuZHMudG9wIHx8IHZpZXdwb3J0LnRvcCA+IGJvdW5kcy5ib3R0b20pKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyJywge3JlZ2lvbjogcGxheWVyX3JlZ2lvbiwgcGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==