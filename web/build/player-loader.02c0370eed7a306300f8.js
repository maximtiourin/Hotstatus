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
                //Ensure disabled default social pane
                $('.social-pane').hide();

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

                //Ensure backup social pane
                $('.social-pane').show();
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

            //Control Panel match loader
            data_matches.generateControlPanelMatchLoader();

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
            controlPanelMatchLoaderGenerated: false,
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
            self.internal.controlPanelMatchLoaderGenerated = false;
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
        generateControlPanelMatchLoader: function generateControlPanelMatchLoader() {
            var self = PlayerLoader.data.matches;
            var ajax = PlayerLoader.ajax.matches;

            if (self.internal.controlPanelGenerated) {
                var sel = $('#pl-rm-cp-loadmorepane');

                if (self.internal.matchLoaderGenerated) {
                    var html = '<div style="cursor:pointer;" data-toggle="tooltip" class="cleartip d-inline-block" title="Load More Matches..."><i class="fa fa-chain fa-2x" aria-hidden="true"></i></div>';

                    sel.html(html);

                    if (!self.internal.controlPanelMatchLoaderGenerated) {
                        sel.click(function () {
                            if (!ajax.internal.loading) {
                                ajax.internal.loading = true;

                                var t = $(this);

                                t.html('<i class="fa fa-refresh fa-spin fa-2x fa-fw"></i>');

                                PlayerLoader.ajax.matches.load();
                            }
                        });

                        self.internal.controlPanelMatchLoaderGenerated = true;
                    }
                } else {
                    $('.tooltip').tooltip('hide');

                    sel.html('');

                    sel.off('click');

                    self.internal.controlPanelMatchLoaderGenerated = false;
                }
            }
        },
        generateRecentMatchesControlPanel: function generateRecentMatchesControlPanel() {
            var self = PlayerLoader.data.matches;

            if (!self.internal.controlPanelGenerated) {
                var container = $('#pl-recentmatches-container');

                //Compact Mode
                var compact = 'fa-align-justify';
                if (self.internal.compactView) {
                    compact = 'fa-th-list';
                }

                var html = '<div class="pl-recentmatch-controlpanel">' +
                //Winrate Graph
                '<div class="pl-rm-cp-winrate-chart-container">' + '<div id="pl-rm-cp-winrate-percent"></div>' + '<canvas id="pl-rm-cp-winrate-chart"></canvas>' + '</div>' +
                //Recent Matches # + Winrate longtext
                '<div class="pl-rm-cp-winrate-longtext-container">' + '<div id="pl-rm-cp-winrate-lt-title"></div>' + '<div id="pl-rm-cp-winrate-lt-numbers"></div>' + '</div>' +
                //Social pane
                '<div class="pl-rm-cp-socialpane">' + '<div data-toggle="tooltip" class="d-inline-block social-button st-custom-button" data-network="facebook" title="Share on Facebook"><i class="fa fa-facebook-square fa-3x" aria-hidden="true"></i></div>' + '<div data-toggle="tooltip" class="d-inline-block social-button st-custom-button" data-network="twitter" title="Share on Twitter"><i class="fa fa-twitter-square fa-3x" aria-hidden="true"></i></div>' + '<div data-toggle="tooltip" class="d-inline-block social-button st-custom-button" data-network="reddit" title="Share on Reddit"><i class="fa fa-reddit-square fa-3x" aria-hidden="true"></i></div>' + '<div data-toggle="tooltip" class="d-inline-block social-button st-custom-button" data-network="googleplus" title="Share on Google+"><i class="fa fa-google-plus-square fa-3x" aria-hidden="true"></i></div>' + '</div>' +
                //Load More pane
                '<div id="pl-rm-cp-loadmorepane" class="pl-rm-cp-loadmorepane">' + '</div>' +
                //Compact pane
                '<div id="pl-rm-cp-compactpane" class="pl-rm-cp-compactpane">' + '<div id="pl-rm-cp-compactpane-inner" style="cursor:pointer;" data-toggle="tooltip" class="d-inline-block" title="Toggle Display Mode"><i class="fa ' + compact + ' fa-2x" aria-hidden="true"></i></div>' + '</div>' + '</div>';

                container.append(html);

                //Generate share this after load
                window.__sharethis__.initialize();

                //Generate graphs
                self.generateGraphRecentMatchesWinrate();

                //Compact Pane button
                $('#pl-rm-cp-compactpane').click(function () {
                    var internal = PlayerLoader.data.matches.internal;

                    var sel = $('#pl-rm-cp-compactpane-inner');

                    if (internal.compactView) {
                        sel.html('<i class="fa fa-align-justify fa-2x" aria-hidden="true"></i>');
                        internal.compactView = false;
                    } else {
                        sel.html('<i class="fa fa-th-list fa-2x" aria-hidden="true"></i>');
                        internal.compactView = true;
                    }
                });

                self.internal.controlPanelGenerated = true;
            }
        },
        generateGraphRecentMatchesWinrate: function generateGraphRecentMatchesWinrate() {
            var self = PlayerLoader.data.matches;

            var data = {
                datasets: [{
                    data: [1], //Empty initial data
                    backgroundColor: ["#cd2e2d", "#3be159"],
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
                var played = chartdata[0] + chartdata[1];
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
                $('#pl-rm-cp-winrate-lt-title').html('Recent ' + played + ' Matches');
                $('#pl-rm-cp-winrate-lt-numbers').html('<div class="pl-rm-cp-winrate-lt-number d-inline-block pl-recentmatch-won">' + wins + 'W</div> ' + '<div class="pl-rm-cp-winrate-lt-number d-inline-block pl-recentmatch-lost">' + losses + 'L</div>');

                //Set new data
                chart.data.datasets[0].data = [chartdata[1], chartdata[0]]; //Flip wins/losses so that wins appear on the left side of the doughnut

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOWMwMmQwNGMzYzAwNDhjNTAxNGEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInJlZ2lvbiIsInBsYXllcl9yZWdpb24iLCJwbGF5ZXIiLCJwbGF5ZXJfaWQiLCJkYXRhX3RvcGhlcm9lcyIsImpzb25faGVyb2VzIiwiaGVyb2VzIiwianNvbl9tYXBzIiwibWFwcyIsImdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyIiwibWF0Y2hlc193aW5yYXRlIiwibWF0Y2hlc193aW5yYXRlX3JhdyIsIm1hdGNoZXNfcGxheWVkIiwibXZwX21lZGFsc19wZXJjZW50YWdlIiwiZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSIsInRvcEhlcm9lc1RhYmxlIiwiZ2V0VG9wSGVyb2VzVGFibGVDb25maWciLCJoZXJvIiwicHVzaCIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhIiwiaW5pdFRvcEhlcm9lc1RhYmxlIiwiZ2VuZXJhdGVUb3BNYXBzQ29udGFpbmVyIiwiZ2VuZXJhdGVUb3BNYXBzVGFibGUiLCJ0b3BNYXBzVGFibGUiLCJnZXRUb3BNYXBzVGFibGVDb25maWciLCJtYXAiLCJnZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEiLCJpbml0VG9wTWFwc1RhYmxlIiwiZGF0YV9wYXJ0aWVzIiwianNvbl9wYXJ0aWVzIiwiZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGUiLCJwYXJ0aWVzVGFibGUiLCJnZXRQYXJ0aWVzVGFibGVDb25maWciLCJwYXJ0eSIsImdlbmVyYXRlUGFydGllc1RhYmxlRGF0YSIsImluaXRQYXJ0aWVzVGFibGUiLCJtYXRjaGxvYWRpbmciLCJtYXRjaHVybCIsImdlbmVyYXRlTWF0Y2hVcmwiLCJtYXRjaF9pZCIsIm1hdGNoaWQiLCJkaXNwbGF5TWF0Y2hMb2FkZXIiLCJqc29uX29mZnNldHMiLCJvZmZzZXRzIiwianNvbl9saW1pdHMiLCJqc29uX21hdGNoZXMiLCJoaWRlIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udHJvbFBhbmVsIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiaWQiLCJnZW5lcmF0ZU1hdGNoIiwiZ3JhcGhkYXRhX3dpbnJhdGUiLCJjaGFydGRhdGFfd2lucmF0ZSIsInVwZGF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGUiLCJnZW5lcmF0ZU5vTWF0Y2hlc01lc3NhZ2UiLCJzaG93IiwiZ2VuZXJhdGVfbWF0Y2hMb2FkZXIiLCJyZW1vdmVfbWF0Y2hMb2FkZXIiLCJnZW5lcmF0ZUNvbnRyb2xQYW5lbE1hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJodG1sIiwibW1ycyIsImNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2UiLCJtbXJHYW1lVHlwZUltYWdlIiwiaW1hZ2VfYnBhdGgiLCJnYW1lVHlwZV9pbWFnZSIsIm1tcmltZyIsInJhbmsiLCJtbXJ0aWVyIiwidGllciIsImdlbmVyYXRlTU1SVG9vbHRpcCIsImdhbWVUeXBlIiwicmF0aW5nIiwiaGVyb0xpbWl0Iiwid2lucmF0ZSIsIndpbnJhdGVfcmF3IiwibWF0Y2hlc3BsYXllZCIsIm12cHBlcmNlbnQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVUZXh0IiwibWF0Y2hlc3BsYXllZGNvbnRhaW5lciIsIm12cHBlcmNlbnRjb250YWluZXIiLCJoZXJvZmllbGQiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJuYW1lIiwiZ29vZGtkYSIsImtkYV9yYXciLCJrZGEiLCJrZGFfYXZnIiwia2RhaW5kaXYiLCJraWxsc19hdmciLCJkZWF0aHNfYXZnIiwiYXNzaXN0c19hdmciLCJrZGFmaWVsZCIsIndpbnJhdGVmaWVsZCIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsImNvbXBhY3RWaWV3IiwibWF0Y2hMb2FkZXJHZW5lcmF0ZWQiLCJjaGFydHMiLCJjb250cm9sUGFuZWxHZW5lcmF0ZWQiLCJjb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJjaGFydGtleSIsImhhc093blByb3BlcnR5IiwiY2hhcnQiLCJkZXN0cm95Iiwic2VsIiwiY2xpY2siLCJ0Iiwib2ZmIiwiY29tcGFjdCIsIndpbmRvdyIsIl9fc2hhcmV0aGlzX18iLCJpbml0aWFsaXplIiwiZ2VuZXJhdGVHcmFwaFJlY2VudE1hdGNoZXNXaW5yYXRlIiwiZGF0YXNldHMiLCJiYWNrZ3JvdW5kQ29sb3IiLCJib3JkZXJDb2xvciIsImJvcmRlcldpZHRoIiwib3B0aW9ucyIsImFuaW1hdGlvbiIsIm1haW50YWluQXNwZWN0UmF0aW8iLCJsZWdlbmQiLCJkaXNwbGF5IiwidG9vbHRpcHMiLCJlbmFibGVkIiwiaG92ZXIiLCJtb2RlIiwiQ2hhcnQiLCJ0eXBlIiwiY2hhcnRkYXRhIiwid2lucyIsImxvc3NlcyIsIndpbnJhdGVfZGlzcGxheSIsInRvRml4ZWQiLCJ1cGRhdGUiLCJwYXJ0aWVzQ29sb3JzIiwidXRpbGl0eSIsInNodWZmbGUiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJtYXRjaFBsYXllciIsInNob3duIiwic2hvd0NvbXBhY3QiLCJ3b24iLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJtZWRhbGh0bWwiLCJub21lZGFsaHRtbCIsImV4aXN0cyIsImRlc2Nfc2ltcGxlIiwidGFsZW50c2h0bWwiLCJpIiwidGFsZW50cyIsInRhbGVudCIsInRhbGVudHRvb2x0aXAiLCJwbGF5ZXJzaHRtbCIsInBhcnRpZXNDb3VudGVyIiwidGVhbXMiLCJ0ZWFtIiwicGFydHlPZmZzZXQiLCJwYXJ0eUNvbG9yIiwic3BlY2lhbCIsInNpbGVuY2VkIiwiY29sb3JfTWF0Y2hXb25Mb3N0IiwibWFwX2ltYWdlIiwia2lsbHMiLCJkZWF0aHMiLCJhc3Npc3RzIiwiZ2VuZXJhdGVDb21wYWN0Vmlld01hdGNoV2lkZ2V0IiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwib24iLCJlIiwibWFuaWZlc3QiLCJpc09uU2NyZWVuIiwiZ2FtZVR5cGVfZGlzcGxheSIsInNob3duQ29tcGFjdCIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJ0cmlnZ2VyIiwic2xpZGVVcCIsImZ1bGxtYXRjaF9jb250YWluZXIiLCJ0ZWFtX2NvbnRhaW5lciIsImdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyIiwid2lubmVyIiwiaGFzQmFucyIsInAiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbG9yIiwic3RhdHMiLCJ2aWN0b3J5IiwiYmFucyIsImJhbiIsImxldmVsIiwib2xkIiwibWF0Y2hyZWdpb24iLCJ0ZWFtQ29sb3IiLCJtYXRjaFN0YXRzIiwib2RkRXZlbiIsIm1hdGNoUGxheWVySWQiLCJwbGF5ZXJuYW1lIiwicm93c3RhdF90b29sdGlwIiwiZGVzYyIsInJvd3N0YXRzIiwia2V5IiwiY2xhc3MiLCJ3aWR0aCIsInZhbHVlIiwidmFsdWVEaXNwbGF5Iiwic3RhdCIsIm1heCIsInBlcmNlbnRPblJhbmdlIiwibW1yRGVsdGFUeXBlIiwibW1yRGVsdGFQcmVmaXgiLCJkZWx0YSIsIm1tckRlbHRhIiwiaGVyb19sZXZlbCIsImxvYWRlcmh0bWwiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsIndpbiIsInBhZFNpemUiLCJ2aWV3cG9ydCIsInRvcCIsInNjcm9sbFRvcCIsImxlZnQiLCJzY3JvbGxMZWZ0IiwicmlnaHQiLCJib3R0b20iLCJoZWlnaHQiLCJib3VuZHMiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0I7QUFDaEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5lLENBQXBCOztBQVNBOzs7QUFHQUgsYUFBYUMsSUFBYixDQUFrQkssTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURhO0FBTXZCOzs7O0FBSUFELFNBQUssZUFBcUI7QUFBQSxZQUFaQSxJQUFZLHVFQUFOLElBQU07O0FBQ3RCLFlBQUlFLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0JLLE1BQTdCOztBQUVBLFlBQUlHLFNBQVEsSUFBWixFQUFrQjtBQUNkLG1CQUFPRSxLQUFLSixRQUFMLENBQWNFLEdBQXJCO0FBQ0gsU0FGRCxNQUdLO0FBQ0RFLGlCQUFLSixRQUFMLENBQWNFLEdBQWQsR0FBb0JBLElBQXBCO0FBQ0EsbUJBQU9FLElBQVA7QUFDSDtBQUNKLEtBcEJzQjtBQXFCdkI7OztBQUdBQyxlQUFXLHFCQUFXO0FBQ2xCLFlBQUlDLE1BQU1DLGdCQUFnQkMsaUJBQWhCLENBQWtDLFFBQWxDLENBQVY7O0FBRUEsWUFBSUMsU0FBUyxTQUFiOztBQUVBLFlBQUksT0FBT0gsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVJLE1BQTlDLEVBQXNEO0FBQ2xERCxxQkFBU0gsR0FBVDtBQUNILFNBRkQsTUFHSyxJQUFJQSxRQUFRLElBQVIsSUFBZ0JBLElBQUlLLE1BQUosR0FBYSxDQUFqQyxFQUFvQztBQUNyQ0YscUJBQVNILElBQUksQ0FBSixDQUFUO0FBQ0g7O0FBRUQsZUFBT0csTUFBUDtBQUNILEtBckNzQjtBQXNDdkI7OztBQUdBRyxrQkFBYyxzQkFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDekMsWUFBSVYsT0FBT1gsYUFBYUMsSUFBYixDQUFrQkssTUFBN0I7O0FBRUEsWUFBSSxDQUFDSyxLQUFLSixRQUFMLENBQWNDLE9BQWYsSUFBMEJNLGdCQUFnQlEsWUFBOUMsRUFBNEQ7QUFDeEQsZ0JBQUliLE1BQU1LLGdCQUFnQlMsV0FBaEIsQ0FBNEJILE9BQTVCLEVBQXFDQyxXQUFyQyxDQUFWOztBQUVBLGdCQUFJWixRQUFRRSxLQUFLRixHQUFMLEVBQVosRUFBd0I7QUFDcEJFLHFCQUFLRixHQUFMLENBQVNBLEdBQVQsRUFBY2UsSUFBZDtBQUNIO0FBQ0o7QUFDSixLQW5Ec0I7QUFvRHZCOzs7O0FBSUFBLFVBQU0sZ0JBQVc7QUFDYixZQUFJdkIsT0FBT0QsYUFBYUMsSUFBeEI7QUFDQSxZQUFJVSxPQUFPWCxhQUFhQyxJQUFiLENBQWtCSyxNQUE3QjtBQUNBLFlBQUltQixlQUFleEIsS0FBS3lCLE9BQXhCO0FBQ0EsWUFBSUMsaUJBQWlCMUIsS0FBSzJCLFNBQTFCO0FBQ0EsWUFBSUMsZUFBZTVCLEtBQUs2QixPQUF4Qjs7QUFFQSxZQUFJQyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUMsV0FBV0QsS0FBS0UsR0FBcEI7QUFDQSxZQUFJQyxlQUFlSCxLQUFLSSxPQUF4QjtBQUNBLFlBQUlDLGVBQWVMLEtBQUtMLE9BQXhCOztBQUVBO0FBQ0FmLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQTs7QUFFQTtBQUNBNkIsVUFBRSwwQkFBRixFQUE4QkMsTUFBOUIsQ0FBcUMscUlBQXJDOztBQUVBO0FBQ0FELFVBQUVFLE9BQUYsQ0FBVTVCLEtBQUtKLFFBQUwsQ0FBY0UsR0FBeEIsRUFDSytCLElBREwsQ0FDVSxVQUFTQyxZQUFULEVBQXVCO0FBQ3pCLGdCQUFJQyxPQUFPRCxhQUFhOUIsS0FBS0osUUFBTCxDQUFjRyxPQUEzQixDQUFYO0FBQ0EsZ0JBQUlpQyxXQUFXRCxLQUFLVCxHQUFwQjs7QUFFQTs7O0FBR0FELHFCQUFTWSxLQUFUO0FBQ0FuQix5QkFBYW9CLEtBQWI7QUFDQWxCLDJCQUFla0IsS0FBZjtBQUNBWCx5QkFBYVUsS0FBYjtBQUNBZix5QkFBYWdCLEtBQWI7O0FBRUE7OztBQUdBUixjQUFFLGVBQUYsRUFBbUJTLFdBQW5CLENBQStCLGNBQS9COztBQUVBOzs7QUFHQSxnQkFBSUgsU0FBU3pCLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDckJjLHlCQUFTZSxvQkFBVDtBQUNBZix5QkFBU2dCLGlCQUFULENBQTJCTCxRQUEzQjtBQUNIOztBQUVEOzs7QUFHQVAseUJBQWFhLDhCQUFiOztBQUVBeEIseUJBQWFsQixRQUFiLENBQXNCMkMsTUFBdEIsR0FBK0IsQ0FBL0I7QUFDQXpCLHlCQUFhbEIsUUFBYixDQUFzQjRDLEtBQXRCLEdBQThCVCxLQUFLVSxNQUFMLENBQVkxQixPQUExQzs7QUFFQTtBQUNBRCx5QkFBYUQsSUFBYjs7QUFFQTs7O0FBR0FHLDJCQUFlSCxJQUFmOztBQUVBOzs7QUFHQUsseUJBQWFMLElBQWI7O0FBR0E7QUFDQWEsY0FBRSx5QkFBRixFQUE2QmdCLE9BQTdCOztBQUVBOzs7QUFHQUMsc0JBQVVDLFdBQVYsQ0FBc0JDLG1CQUF0QjtBQUNILFNBeERMLEVBeURLQyxJQXpETCxDQXlEVSxZQUFXO0FBQ2I7QUFDSCxTQTNETCxFQTRES0MsTUE1REwsQ0E0RFksWUFBVztBQUNmO0FBQ0FyRCx1QkFBVyxZQUFXO0FBQ2xCZ0Msa0JBQUUsMEJBQUYsRUFBOEJzQixNQUE5QixHQUF1Q3pELEtBQXZDLENBQTZDLEdBQTdDLEVBQWtEMEQsS0FBbEQsQ0FBd0QsWUFBVTtBQUM5RHZCLHNCQUFFLElBQUYsRUFBUXdCLE1BQVI7QUFDSCxpQkFGRDtBQUdILGFBSkQ7O0FBTUFsRCxpQkFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0gsU0FyRUw7O0FBdUVBLGVBQU9HLElBQVA7QUFDSDtBQXJKc0IsQ0FBM0I7O0FBd0pBWCxhQUFhQyxJQUFiLENBQWtCMkIsU0FBbEIsR0FBOEI7QUFDMUJyQixjQUFVO0FBQ05DLGlCQUFTLEtBREgsRUFDVTtBQUNoQkMsYUFBSyxFQUZDLEVBRUc7QUFDVEMsaUJBQVMsTUFISCxDQUdXO0FBSFgsS0FEZ0I7QUFNMUJtQyxXQUFPLGlCQUFXO0FBQ2QsWUFBSWxDLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0IyQixTQUE3Qjs7QUFFQWpCLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixLQUF4QjtBQUNBRyxhQUFLSixRQUFMLENBQWNFLEdBQWQsR0FBb0IsRUFBcEI7QUFDQVQscUJBQWErQixJQUFiLENBQWtCSCxTQUFsQixDQUE0QmdCLEtBQTVCO0FBQ0gsS0FaeUI7QUFhMUJyQixpQkFBYSx1QkFBVztBQUNwQixZQUFJWixPQUFPWCxhQUFhQyxJQUFiLENBQWtCMkIsU0FBN0I7O0FBRUEsWUFBSWtDLE9BQU9DLFFBQVFDLFFBQVIsQ0FBaUIsc0NBQWpCLEVBQXlEO0FBQ2hFQyxvQkFBUUMsYUFEd0Q7QUFFaEVDLG9CQUFRQztBQUZ3RCxTQUF6RCxDQUFYOztBQUtBLGVBQU90RCxnQkFBZ0JTLFdBQWhCLENBQTRCdUMsSUFBNUIsRUFBa0MsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQyxDQUFQO0FBQ0gsS0F0QnlCO0FBdUIxQjs7OztBQUlBdEMsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUsyQixTQUFoQjs7QUFFQSxZQUFJRyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSXNDLGlCQUFpQnRDLEtBQUtILFNBQTFCO0FBQ0EsWUFBSU0sZUFBZUgsS0FBS0ksT0FBeEI7O0FBRUE7QUFDQXhCLGFBQUtKLFFBQUwsQ0FBY0UsR0FBZCxHQUFvQkUsS0FBS1ksV0FBTCxFQUFwQjs7QUFFQTtBQUNBWixhQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsSUFBeEI7O0FBRUE7QUFDQTZCLFVBQUVFLE9BQUYsQ0FBVTVCLEtBQUtKLFFBQUwsQ0FBY0UsR0FBeEIsRUFDSytCLElBREwsQ0FDVSxVQUFTQyxZQUFULEVBQXVCO0FBQ3pCLGdCQUFJQyxPQUFPRCxhQUFhOUIsS0FBS0osUUFBTCxDQUFjRyxPQUEzQixDQUFYO0FBQ0EsZ0JBQUk0RCxjQUFjNUIsS0FBSzZCLE1BQXZCO0FBQ0EsZ0JBQUlDLFlBQVk5QixLQUFLK0IsSUFBckI7O0FBRUE7OztBQUdBLGdCQUFJSCxZQUFZcEQsTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUN4Qm1ELCtCQUFlSywwQkFBZixDQUEwQ2hDLEtBQUtpQyxlQUEvQyxFQUFnRWpDLEtBQUtrQyxtQkFBckUsRUFBMEZsQyxLQUFLbUMsY0FBL0YsRUFBK0duQyxLQUFLb0MscUJBQXBIOztBQUVBVCwrQkFBZVUsc0JBQWY7O0FBRUEsb0JBQUlDLGlCQUFpQlgsZUFBZVksdUJBQWYsQ0FBdUNYLFlBQVlwRCxNQUFuRCxDQUFyQjs7QUFFQThELCtCQUFlakQsSUFBZixHQUFzQixFQUF0QjtBQVB3QjtBQUFBO0FBQUE7O0FBQUE7QUFReEIseUNBQWlCdUMsV0FBakIsOEhBQThCO0FBQUEsNEJBQXJCWSxJQUFxQjs7QUFDMUJGLHVDQUFlakQsSUFBZixDQUFvQm9ELElBQXBCLENBQXlCZCxlQUFlZSwwQkFBZixDQUEwQ0YsSUFBMUMsQ0FBekI7QUFDSDtBQVZ1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVl4QmIsK0JBQWVnQixrQkFBZixDQUFrQ0wsY0FBbEM7QUFDSDs7QUFFRDs7O0FBR0EsZ0JBQUlSLFVBQVV0RCxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO0FBQ3RCZ0IsNkJBQWFvRCx3QkFBYjs7QUFFQXBELDZCQUFhcUQsb0JBQWI7O0FBRUEsb0JBQUlDLGVBQWV0RCxhQUFhdUQscUJBQWIsQ0FBbUNqQixVQUFVdEQsTUFBN0MsQ0FBbkI7O0FBRUFzRSw2QkFBYXpELElBQWIsR0FBb0IsRUFBcEI7QUFQc0I7QUFBQTtBQUFBOztBQUFBO0FBUXRCLDBDQUFnQnlDLFNBQWhCLG1JQUEyQjtBQUFBLDRCQUFsQmtCLEdBQWtCOztBQUN2QkYscUNBQWF6RCxJQUFiLENBQWtCb0QsSUFBbEIsQ0FBdUJqRCxhQUFheUQsd0JBQWIsQ0FBc0NELEdBQXRDLENBQXZCO0FBQ0g7QUFWcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZdEJ4RCw2QkFBYTBELGdCQUFiLENBQThCSixZQUE5QjtBQUNIOztBQUVEO0FBQ0FuRCxjQUFFLHlCQUFGLEVBQTZCZ0IsT0FBN0I7QUFDSCxTQTVDTCxFQTZDS0ksSUE3Q0wsQ0E2Q1UsWUFBVztBQUNiO0FBQ0gsU0EvQ0wsRUFnREtDLE1BaERMLENBZ0RZLFlBQVc7QUFDZi9DLGlCQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDSCxTQWxETDs7QUFvREEsZUFBT0csSUFBUDtBQUNIO0FBL0Z5QixDQUE5Qjs7QUFrR0FYLGFBQWFDLElBQWIsQ0FBa0I2QixPQUFsQixHQUE0QjtBQUN4QnZCLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURjO0FBTXhCbUMsV0FBTyxpQkFBVztBQUNkLFlBQUlsQyxPQUFPWCxhQUFhQyxJQUFiLENBQWtCNkIsT0FBN0I7O0FBRUFuQixhQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDQUcsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CLEVBQXBCO0FBQ0FULHFCQUFhK0IsSUFBYixDQUFrQkQsT0FBbEIsQ0FBMEJjLEtBQTFCO0FBQ0gsS0FadUI7QUFheEJyQixpQkFBYSx1QkFBVztBQUNwQixZQUFJWixPQUFPWCxhQUFhQyxJQUFiLENBQWtCNkIsT0FBN0I7O0FBRUEsWUFBSWdDLE9BQU9DLFFBQVFDLFFBQVIsQ0FBaUIsb0NBQWpCLEVBQXVEO0FBQzlEQyxvQkFBUUMsYUFEc0Q7QUFFOURDLG9CQUFRQztBQUZzRCxTQUF2RCxDQUFYOztBQUtBLGVBQU90RCxnQkFBZ0JTLFdBQWhCLENBQTRCdUMsSUFBNUIsRUFBa0MsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQyxDQUFQO0FBQ0gsS0F0QnVCO0FBdUJ4Qjs7OztBQUlBdEMsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUs2QixPQUFoQjs7QUFFQSxZQUFJQyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSThELGVBQWU5RCxLQUFLRCxPQUF4Qjs7QUFFQTtBQUNBbkIsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CRSxLQUFLWSxXQUFMLEVBQXBCOztBQUVBO0FBQ0FaLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQTtBQUNBNkIsVUFBRUUsT0FBRixDQUFVNUIsS0FBS0osUUFBTCxDQUFjRSxHQUF4QixFQUNLK0IsSUFETCxDQUNVLFVBQVNDLFlBQVQsRUFBdUI7QUFDekIsZ0JBQUlDLE9BQU9ELGFBQWE5QixLQUFLSixRQUFMLENBQWNHLE9BQTNCLENBQVg7QUFDQSxnQkFBSW9GLGVBQWVwRCxLQUFLWixPQUF4Qjs7QUFFQTs7O0FBR0EsZ0JBQUlnRSxhQUFhNUUsTUFBYixHQUFzQixDQUExQixFQUE2QjtBQUN6QjJFLDZCQUFhRSx3QkFBYixDQUFzQ3JELEtBQUtzRCxZQUEzQzs7QUFFQUgsNkJBQWFJLG9CQUFiOztBQUVBLG9CQUFJQyxlQUFlTCxhQUFhTSxxQkFBYixDQUFtQ0wsYUFBYTVFLE1BQWhELENBQW5COztBQUVBZ0YsNkJBQWFuRSxJQUFiLEdBQW9CLEVBQXBCO0FBUHlCO0FBQUE7QUFBQTs7QUFBQTtBQVF6QiwwQ0FBa0IrRCxZQUFsQixtSUFBZ0M7QUFBQSw0QkFBdkJNLEtBQXVCOztBQUM1QkYscUNBQWFuRSxJQUFiLENBQWtCb0QsSUFBbEIsQ0FBdUJVLGFBQWFRLHdCQUFiLENBQXNDRCxLQUF0QyxDQUF2QjtBQUNIO0FBVndCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBWXpCUCw2QkFBYVMsZ0JBQWIsQ0FBOEJKLFlBQTlCO0FBQ0g7O0FBRUQ7QUFDQTdELGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBekJMLEVBMEJLSSxJQTFCTCxDQTBCVSxZQUFXO0FBQ2I7QUFDSCxTQTVCTCxFQTZCS0MsTUE3QkwsQ0E2QlksWUFBVztBQUNmL0MsaUJBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixLQUF4QjtBQUNILFNBL0JMOztBQWlDQSxlQUFPRyxJQUFQO0FBQ0g7QUEzRXVCLENBQTVCOztBQThFQVgsYUFBYUMsSUFBYixDQUFrQnlCLE9BQWxCLEdBQTRCO0FBQ3hCbkIsY0FBVTtBQUNOQyxpQkFBUyxLQURILEVBQ1U7QUFDaEIrRixzQkFBYyxLQUZSLEVBRWU7QUFDckI5RixhQUFLLEVBSEMsRUFHRztBQUNUK0Ysa0JBQVUsRUFKSixFQUlRO0FBQ2Q5RixpQkFBUyxNQUxILEVBS1c7QUFDakJ3QyxnQkFBUSxDQU5GLEVBTUs7QUFDWEMsZUFBTyxFQVBELENBT0s7QUFQTCxLQURjO0FBVXhCTixXQUFPLGlCQUFXO0FBQ2QsWUFBSWxDLE9BQU9YLGFBQWFDLElBQWIsQ0FBa0J5QixPQUE3Qjs7QUFFQWYsYUFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0FHLGFBQUtKLFFBQUwsQ0FBY2dHLFlBQWQsR0FBNkIsS0FBN0I7QUFDQTVGLGFBQUtKLFFBQUwsQ0FBY0UsR0FBZCxHQUFvQixFQUFwQjtBQUNBRSxhQUFLSixRQUFMLENBQWNpRyxRQUFkLEdBQXlCLEVBQXpCO0FBQ0E3RixhQUFLSixRQUFMLENBQWMyQyxNQUFkLEdBQXVCLENBQXZCO0FBQ0FsRCxxQkFBYStCLElBQWIsQ0FBa0JMLE9BQWxCLENBQTBCa0IsS0FBMUI7QUFDSCxLQW5CdUI7QUFvQnhCckIsaUJBQWEsdUJBQVc7QUFDcEIsWUFBSVosT0FBT1gsYUFBYUMsSUFBYixDQUFrQnlCLE9BQTdCOztBQUVBLFlBQUlvQyxPQUFPQyxRQUFRQyxRQUFSLENBQWlCLDBDQUFqQixFQUE2RDtBQUNwRUMsb0JBQVFDLGFBRDREO0FBRXBFQyxvQkFBUUMsU0FGNEQ7QUFHcEVsQixvQkFBUXZDLEtBQUtKLFFBQUwsQ0FBYzJDLE1BSDhDO0FBSXBFQyxtQkFBT3hDLEtBQUtKLFFBQUwsQ0FBYzRDO0FBSitDLFNBQTdELENBQVg7O0FBT0EsZUFBT3JDLGdCQUFnQlMsV0FBaEIsQ0FBNEJ1QyxJQUE1QixFQUFrQyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxDLENBQVA7QUFDSCxLQS9CdUI7QUFnQ3hCMkMsc0JBQWtCLDBCQUFTQyxRQUFULEVBQW1CO0FBQ2pDLGVBQU8zQyxRQUFRQyxRQUFSLENBQWlCLDJCQUFqQixFQUE4QztBQUNqRDJDLHFCQUFTRDtBQUR3QyxTQUE5QyxDQUFQO0FBR0gsS0FwQ3VCO0FBcUN4Qjs7OztBQUlBbEYsVUFBTSxnQkFBVztBQUNiLFlBQUl2QixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUt5QixPQUFoQjs7QUFFQSxZQUFJSyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUssZUFBZUwsS0FBS0wsT0FBeEI7O0FBRUE7QUFDQWYsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CRSxLQUFLWSxXQUFMLEVBQXBCOztBQUVBO0FBQ0EsWUFBSXFGLHFCQUFxQixLQUF6QjtBQUNBakcsYUFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLElBQXhCOztBQUVBO0FBQ0E2QixVQUFFRSxPQUFGLENBQVU1QixLQUFLSixRQUFMLENBQWNFLEdBQXhCLEVBQ0srQixJQURMLENBQ1UsVUFBU0MsWUFBVCxFQUF1QjtBQUN6QixnQkFBSUMsT0FBT0QsYUFBYTlCLEtBQUtKLFFBQUwsQ0FBY0csT0FBM0IsQ0FBWDtBQUNBLGdCQUFJbUcsZUFBZW5FLEtBQUtvRSxPQUF4QjtBQUNBLGdCQUFJQyxjQUFjckUsS0FBS1UsTUFBdkI7QUFDQSxnQkFBSTRELGVBQWV0RSxLQUFLaEIsT0FBeEI7O0FBRUE7OztBQUdBLGdCQUFJc0YsYUFBYTlGLE1BQWIsR0FBc0IsQ0FBMUIsRUFBNkI7QUFDekI7QUFDQW1CLGtCQUFFLGNBQUYsRUFBa0I0RSxJQUFsQjs7QUFFQTtBQUNBN0UsNkJBQWE4RSxpQ0FBYjs7QUFFQTtBQUNBdkcscUJBQUtKLFFBQUwsQ0FBYzJDLE1BQWQsR0FBdUIyRCxhQUFhbkYsT0FBYixHQUF1QmYsS0FBS0osUUFBTCxDQUFjNEMsS0FBNUQ7O0FBRUE7QUFWeUI7QUFBQTtBQUFBOztBQUFBO0FBV3pCLDBDQUFrQjZELFlBQWxCLG1JQUFnQztBQUFBLDRCQUF2QkcsS0FBdUI7O0FBQzVCLDRCQUFJLENBQUMvRSxhQUFhZ0YsZ0JBQWIsQ0FBOEJELE1BQU1FLEVBQXBDLENBQUwsRUFBOEM7QUFDMUNqRix5Q0FBYWtGLGFBQWIsQ0FBMkJILEtBQTNCO0FBQ0g7QUFDSjs7QUFFRDtBQWpCeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFrQnpCLG9CQUFJSSxvQkFBb0IsQ0FDcEJuRixhQUFhN0IsUUFBYixDQUFzQmlILGlCQUF0QixDQUF3QyxHQUF4QyxDQURvQixFQUVwQnBGLGFBQWE3QixRQUFiLENBQXNCaUgsaUJBQXRCLENBQXdDLEdBQXhDLENBRm9CLENBQXhCO0FBSUFwRiw2QkFBYXFGLCtCQUFiLENBQTZDRixpQkFBN0M7O0FBRUE7QUFDQSxvQkFBSVAsYUFBYTlGLE1BQWIsSUFBdUJQLEtBQUtKLFFBQUwsQ0FBYzRDLEtBQXpDLEVBQWdEO0FBQzVDeUQseUNBQXFCLElBQXJCO0FBQ0g7QUFDSixhQTVCRCxNQTZCSyxJQUFJakcsS0FBS0osUUFBTCxDQUFjMkMsTUFBZCxLQUF5QixDQUE3QixFQUFnQztBQUNqQ2QsNkJBQWFzRix3QkFBYjs7QUFFQTtBQUNBckYsa0JBQUUsY0FBRixFQUFrQnNGLElBQWxCO0FBQ0g7O0FBRUQ7QUFDQXRGLGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBaERMLEVBaURLSSxJQWpETCxDQWlEVSxZQUFXO0FBQ2I7QUFDSCxTQW5ETCxFQW9ES0MsTUFwREwsQ0FvRFksWUFBVztBQUNmO0FBQ0EsZ0JBQUlrRCxrQkFBSixFQUF3QjtBQUNwQnhFLDZCQUFhd0Ysb0JBQWI7QUFDSCxhQUZELE1BR0s7QUFDRHhGLDZCQUFheUYsa0JBQWI7QUFDSDs7QUFFRDtBQUNBekYseUJBQWEwRiwrQkFBYjs7QUFFQTtBQUNBekYsY0FBRSw2QkFBRixFQUFpQ1MsV0FBakMsQ0FBNkMsY0FBN0M7O0FBRUFuQyxpQkFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0gsU0FwRUw7O0FBc0VBLGVBQU9HLElBQVA7QUFDSCxLQS9IdUI7QUFnSXhCOzs7QUFHQW9ILGVBQVcsbUJBQVNwQixPQUFULEVBQWtCO0FBQ3pCLFlBQUkxRyxPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlVLE9BQU9WLEtBQUt5QixPQUFoQjs7QUFFQSxZQUFJSyxPQUFPL0IsYUFBYStCLElBQXhCO0FBQ0EsWUFBSUssZUFBZUwsS0FBS0wsT0FBeEI7O0FBRUE7QUFDQWYsYUFBS0osUUFBTCxDQUFjaUcsUUFBZCxHQUF5QjdGLEtBQUs4RixnQkFBTCxDQUFzQkUsT0FBdEIsQ0FBekI7O0FBRUE7QUFDQWhHLGFBQUtKLFFBQUwsQ0FBY2dHLFlBQWQsR0FBNkIsSUFBN0I7O0FBRUFsRSxVQUFFLDRCQUEyQnNFLE9BQTdCLEVBQXNDcUIsT0FBdEMsQ0FBOEMsa0lBQTlDOztBQUVBO0FBQ0EzRixVQUFFRSxPQUFGLENBQVU1QixLQUFLSixRQUFMLENBQWNpRyxRQUF4QixFQUNLaEUsSUFETCxDQUNVLFVBQVNDLFlBQVQsRUFBdUI7QUFDekIsZ0JBQUlDLE9BQU9ELGFBQWE5QixLQUFLSixRQUFMLENBQWNHLE9BQTNCLENBQVg7QUFDQSxnQkFBSXVILGFBQWF2RixLQUFLeUUsS0FBdEI7O0FBRUE7OztBQUdBL0UseUJBQWE4RixxQkFBYixDQUFtQ3ZCLE9BQW5DLEVBQTRDc0IsVUFBNUM7O0FBR0E7QUFDQTVGLGNBQUUseUJBQUYsRUFBNkJnQixPQUE3QjtBQUNILFNBYkwsRUFjS0ksSUFkTCxDQWNVLFlBQVc7QUFDYjtBQUNILFNBaEJMLEVBaUJLQyxNQWpCTCxDQWlCWSxZQUFXO0FBQ2ZyQixjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7O0FBRUFsRCxpQkFBS0osUUFBTCxDQUFjZ0csWUFBZCxHQUE2QixLQUE3QjtBQUNILFNBckJMOztBQXVCQSxlQUFPNUYsSUFBUDtBQUNIO0FBM0t1QixDQUE1Qjs7QUE4S0E7OztBQUdBWCxhQUFhK0IsSUFBYixHQUFvQjtBQUNoQkUsU0FBSztBQUNEVyxlQUFPLGlCQUFXO0FBQ2RQLGNBQUUsbUJBQUYsRUFBdUJ3QixNQUF2QjtBQUNILFNBSEE7QUFJRGQsOEJBQXNCLGdDQUFXO0FBQzdCLGdCQUFJb0YsT0FBTyxzSUFDUCxRQURKOztBQUdBOUYsY0FBRSx5QkFBRixFQUE2QkMsTUFBN0IsQ0FBb0M2RixJQUFwQztBQUNILFNBVEE7QUFVRG5GLDJCQUFtQiwyQkFBU29GLElBQVQsRUFBZTtBQUM5QnpILG1CQUFPWCxhQUFhK0IsSUFBYixDQUFrQkUsR0FBekI7O0FBRUEsZ0JBQUlvRyxZQUFZaEcsRUFBRSxtQkFBRixDQUFoQjs7QUFIOEI7QUFBQTtBQUFBOztBQUFBO0FBSzlCLHNDQUFnQitGLElBQWhCLG1JQUFzQjtBQUFBLHdCQUFibkcsR0FBYTs7QUFDbEJ0Qix5QkFBSzJILGdCQUFMLENBQXNCRCxTQUF0QixFQUFpQ3BHLEdBQWpDO0FBQ0g7QUFQNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFqQyxTQWxCQTtBQW1CRHFHLDBCQUFrQiwwQkFBU0QsU0FBVCxFQUFvQnBHLEdBQXBCLEVBQXlCO0FBQ3ZDLGdCQUFJdEIsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JFLEdBQTdCOztBQUVBLGdCQUFJc0csbUJBQW1CLGtEQUFpREMsV0FBakQsR0FBK0QsbUJBQS9ELEdBQXFGdkcsSUFBSXdHLGNBQXpGLEdBQXlHLFFBQWhJO0FBQ0EsZ0JBQUlDLFNBQVMsMENBQXlDRixXQUF6QyxHQUF1RCx3QkFBdkQsR0FBa0Z2RyxJQUFJMEcsSUFBdEYsR0FBNEYsUUFBekc7QUFDQSxnQkFBSUMsVUFBVSxvQ0FBbUMzRyxJQUFJNEcsSUFBdkMsR0FBNkMsUUFBM0Q7O0FBRUEsZ0JBQUlWLE9BQU87QUFDUDtBQUNBLGdFQUZPLEdBR1BJLGdCQUhPLEdBSVAsUUFKTztBQUtQO0FBQ0Esd0RBTk8sR0FPUEcsTUFQTyxHQVFQLFFBUk87QUFTUDtBQUNBLHVEQVZPLEdBV1BFLE9BWE8sR0FZUCxRQVpPO0FBYVA7QUFDQSxtR0FkTyxHQWNrRmpJLEtBQUttSSxrQkFBTCxDQUF3QjdHLEdBQXhCLENBZGxGLEdBY2dILFVBZGhILEdBZVAsUUFmSjs7QUFpQkFvRyxzQkFBVS9GLE1BQVYsQ0FBaUI2RixJQUFqQjtBQUNILFNBNUNBO0FBNkNEVyw0QkFBb0IsNEJBQVM3RyxHQUFULEVBQWM7QUFDOUIsbUJBQU8sVUFBU0EsSUFBSThHLFFBQWIsR0FBdUIsYUFBdkIsR0FBc0M5RyxJQUFJK0csTUFBMUMsR0FBa0QsYUFBbEQsR0FBaUUvRyxJQUFJMEcsSUFBckUsR0FBMkUsR0FBM0UsR0FBZ0YxRyxJQUFJNEcsSUFBcEYsR0FBMEYsUUFBakc7QUFDSDtBQS9DQSxLQURXO0FBa0RoQmpILGVBQVc7QUFDUHJCLGtCQUFVO0FBQ04wSSx1QkFBVyxDQURMLENBQ1E7QUFEUixTQURIO0FBSVByRyxlQUFPLGlCQUFXO0FBQ2RQLGNBQUUseUJBQUYsRUFBNkJ3QixNQUE3QjtBQUNILFNBTk07QUFPUGEsb0NBQTRCLG9DQUFTd0UsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0JDLGFBQS9CLEVBQThDQyxVQUE5QyxFQUEwRDtBQUNsRjtBQUNBLGdCQUFJQyxjQUFjLGtCQUFsQjtBQUNBLGdCQUFJSCxlQUFlLEVBQW5CLEVBQXVCO0FBQ25CRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUlILGVBQWUsRUFBbkIsRUFBdUI7QUFDbkJHLDhCQUFjLDJCQUFkO0FBQ0g7QUFDRCxnQkFBSUgsZUFBZSxFQUFuQixFQUF1QjtBQUNuQkcsOEJBQWMsdUJBQWQ7QUFDSDtBQUNELGdCQUFJSCxlQUFlLEVBQW5CLEVBQXVCO0FBQ25CRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJQyxjQUFjLHNIQUFxSEQsV0FBckgsR0FBa0ksSUFBbEksR0FDZEosT0FEYyxHQUNKLEdBREksR0FFZCxlQUZKOztBQUlBLGdCQUFJTSx5QkFBeUIsd0lBQXVJSixhQUF2SSxHQUFzSixJQUF0SixHQUE0SkcsV0FBNUosR0FBeUssU0FBdE07O0FBRUEsZ0JBQUlFLHNCQUFzQiwySEFBMEhqQixXQUExSCxHQUF1SSxnR0FBdkksR0FBeU9hLFVBQXpPLEdBQXFQLFNBQS9ROztBQUVBLGdCQUFJbEIsT0FBTywySEFDUHFCLHNCQURPLEdBRVBDLG1CQUZPLEdBR1AsUUFISjs7QUFLQXBILGNBQUUsK0JBQUYsRUFBbUNDLE1BQW5DLENBQTBDNkYsSUFBMUM7QUFDSCxTQXJDTTtBQXNDUC9DLG9DQUE0QixvQ0FBU0YsSUFBVCxFQUFlO0FBQ3ZDOzs7QUFHQSxnQkFBSXdFLFlBQVksMkVBQTJFbEIsV0FBM0UsR0FBeUZ0RCxLQUFLeUUsVUFBOUYsR0FBMEcsY0FBMUcsR0FDWiwwQ0FEWSxHQUNpQzVGLFFBQVFDLFFBQVIsQ0FBaUIsWUFBakIsRUFBK0IsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3Qm1ELElBQUlqRCxTQUE1QixFQUF1Q3dGLGdCQUFnQjFFLEtBQUsyRSxJQUE1RCxFQUEvQixDQURqQyxHQUNxSSxvQkFEckksR0FDMkozRSxLQUFLMkUsSUFEaEssR0FDc0ssa0JBRHRMOztBQUlBOzs7QUFHQTtBQUNBLGdCQUFJQyxVQUFVLGtCQUFkO0FBQ0EsZ0JBQUk1RSxLQUFLNkUsT0FBTCxJQUFnQixDQUFwQixFQUF1QjtBQUNuQkQsMEJBQVUsdUJBQVY7QUFDSDtBQUNELGdCQUFJNUUsS0FBSzZFLE9BQUwsSUFBZ0IsQ0FBcEIsRUFBdUI7QUFDbkJELDBCQUFVLHdCQUFWO0FBQ0g7O0FBRUQsZ0JBQUlFLE1BQU0sa0JBQWlCRixPQUFqQixHQUEwQixJQUExQixHQUFpQzVFLEtBQUsrRSxPQUF0QyxHQUFnRCxhQUExRDs7QUFFQSxnQkFBSUMsV0FBV2hGLEtBQUtpRixTQUFMLEdBQWlCLDBDQUFqQixHQUE4RGpGLEtBQUtrRixVQUFuRSxHQUFnRixZQUFoRixHQUErRmxGLEtBQUttRixXQUFuSDs7QUFFQSxnQkFBSUMsV0FBVztBQUNYO0FBQ0EsbUpBRlcsR0FHWE4sR0FIVyxHQUlYLGVBSlc7QUFLWDtBQUNBLG1KQU5XLEdBT1hFLFFBUFcsR0FRWCxlQVJXLEdBU1gsUUFUSjs7QUFXQTs7O0FBR0E7QUFDQSxnQkFBSVosY0FBYyxrQkFBbEI7QUFDQSxnQkFBSXBFLEtBQUtpRSxXQUFMLElBQW9CLEVBQXhCLEVBQTRCO0FBQ3hCRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUlwRSxLQUFLaUUsV0FBTCxJQUFvQixFQUF4QixFQUE0QjtBQUN4QkcsOEJBQWMsMkJBQWQ7QUFDSDtBQUNELGdCQUFJcEUsS0FBS2lFLFdBQUwsSUFBb0IsRUFBeEIsRUFBNEI7QUFDeEJHLDhCQUFjLHVCQUFkO0FBQ0g7QUFDRCxnQkFBSXBFLEtBQUtpRSxXQUFMLElBQW9CLEVBQXhCLEVBQTRCO0FBQ3hCRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJaUIsZUFBZTtBQUNmO0FBQ0EsMEJBRmUsR0FFQ2pCLFdBRkQsR0FFYywyRkFGZCxHQUdmcEUsS0FBS2dFLE9BSFUsR0FHQSxHQUhBLEdBSWYsZUFKZTtBQUtmO0FBQ0EsMkNBTmUsR0FPZmhFLEtBQUtzRixNQVBVLEdBT0QsU0FQQyxHQVFmLFFBUmUsR0FTZixRQVRKOztBQVdBLG1CQUFPLENBQUNkLFNBQUQsRUFBWVksUUFBWixFQUFzQkMsWUFBdEIsQ0FBUDtBQUNILFNBdkdNO0FBd0dQdEYsaUNBQXlCLGlDQUFTd0YsU0FBVCxFQUFvQjtBQUN6QyxnQkFBSTlKLE9BQU9YLGFBQWErQixJQUFiLENBQWtCSCxTQUE3Qjs7QUFFQSxnQkFBSThJLFlBQVksRUFBaEI7O0FBRUE7QUFDQUEsc0JBQVVDLE9BQVYsR0FBb0IsQ0FDaEIsRUFEZ0IsRUFFaEIsRUFGZ0IsRUFHaEIsRUFIZ0IsQ0FBcEI7O0FBTUFELHNCQUFVRSxRQUFWLEdBQXFCO0FBQ2pCQyw0QkFBWSxFQURLLEVBQ0Q7QUFDaEJDLGdDQUFnQixHQUZDLEVBRUk7QUFDckJDLDZCQUFhLEdBSEksRUFHQztBQUNsQkMsNEJBQVksR0FKSyxDQUlEO0FBSkMsYUFBckI7O0FBT0FOLHNCQUFVTyxPQUFWLEdBQW9CLEtBQXBCO0FBQ0FQLHNCQUFVUSxTQUFWLEdBQXNCLEtBQXRCO0FBQ0FSLHNCQUFVUyxXQUFWLEdBQXdCLEtBQXhCO0FBQ0FULHNCQUFVVSxVQUFWLEdBQXVCekssS0FBS0osUUFBTCxDQUFjMEksU0FBckMsQ0F0QnlDLENBc0JPO0FBQ2hEeUIsc0JBQVVXLE1BQVYsR0FBb0JaLFlBQVlDLFVBQVVVLFVBQTFDLENBdkJ5QyxDQXVCYztBQUN2RFYsc0JBQVVZLFVBQVYsR0FBdUIsUUFBdkI7QUFDQVosc0JBQVVhLFVBQVYsR0FBdUIsS0FBdkIsQ0F6QnlDLENBeUJYO0FBQzlCYixzQkFBVWMsT0FBVixHQUFvQixJQUFwQixDQTFCeUMsQ0EwQmY7QUFDMUJkLHNCQUFVZSxPQUFWLEdBQW9CLEtBQXBCLENBM0J5QyxDQTJCZDtBQUMzQmYsc0JBQVVnQixHQUFWLEdBQWlCLG1EQUFqQixDQTVCeUMsQ0E0QjZCO0FBQ3RFaEIsc0JBQVVpQixJQUFWLEdBQWlCLEtBQWpCLENBN0J5QyxDQTZCakI7O0FBRXhCakIsc0JBQVVrQixZQUFWLEdBQXlCLFlBQVc7QUFDaEN2SixrQkFBRSwyQ0FBRixFQUErQ2dCLE9BQS9DO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT3FILFNBQVA7QUFDSCxTQTVJTTtBQTZJUDNGLGdDQUF3QixrQ0FBVztBQUMvQjFDLGNBQUUseUJBQUYsRUFBNkJDLE1BQTdCLENBQW9DLHdLQUFwQztBQUNILFNBL0lNO0FBZ0pQK0MsNEJBQW9CLDRCQUFTd0csZUFBVCxFQUEwQjtBQUMxQ3hKLGNBQUUscUJBQUYsRUFBeUJ5SixTQUF6QixDQUFtQ0QsZUFBbkM7QUFDSDtBQWxKTSxLQWxESztBQXNNaEIxSixhQUFTO0FBQ0w1QixrQkFBVTtBQUNOd0wsc0JBQVUsQ0FESixDQUNPO0FBRFAsU0FETDtBQUlMbkosZUFBTyxpQkFBVztBQUNkUCxjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7QUFDSCxTQU5JO0FBT0x5QixrQ0FBMEIsb0NBQVc7QUFDakMsZ0JBQUk2QyxPQUFPLHVIQUNQLDBDQURPLEdBRVAsUUFGSjs7QUFJQTlGLGNBQUUsZ0NBQUYsRUFBb0NDLE1BQXBDLENBQTJDNkYsSUFBM0M7QUFDSCxTQWJJO0FBY0x4QyxrQ0FBMEIsa0NBQVNELEdBQVQsRUFBYztBQUNwQzs7O0FBR0EsZ0JBQUlzRyxXQUFXLGdFQUErRHhELFdBQS9ELEdBQTRFLGNBQTVFLEdBQTRGOUMsSUFBSXVHLEtBQWhHLEdBQXVHLGdCQUF0SDs7QUFFQSxnQkFBSUMsVUFBVSxxQ0FBb0N4RyxJQUFJbUUsSUFBeEMsR0FBOEMsUUFBNUQ7O0FBRUEsZ0JBQUlzQyxXQUFXLHFDQUFvQ0gsUUFBcEMsR0FBK0NFLE9BQS9DLEdBQXlELFFBQXhFOztBQUVBOzs7QUFHQTtBQUNBLGdCQUFJNUMsY0FBYyxrQkFBbEI7QUFDQSxnQkFBSTVELElBQUl5RCxXQUFKLElBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCRyw4QkFBYyxzQkFBZDtBQUNIO0FBQ0QsZ0JBQUk1RCxJQUFJeUQsV0FBSixJQUFtQixFQUF2QixFQUEyQjtBQUN2QkcsOEJBQWMsMkJBQWQ7QUFDSDtBQUNELGdCQUFJNUQsSUFBSXlELFdBQUosSUFBbUIsRUFBdkIsRUFBMkI7QUFDdkJHLDhCQUFjLHVCQUFkO0FBQ0g7QUFDRCxnQkFBSTVELElBQUl5RCxXQUFKLElBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCRyw4QkFBYyx3QkFBZDtBQUNIOztBQUVELGdCQUFJaUIsZUFBZTtBQUNmO0FBQ0EsMEJBRmUsR0FFQ2pCLFdBRkQsR0FFYywyRkFGZCxHQUdmNUQsSUFBSXdELE9BSFcsR0FHRCxHQUhDLEdBSWYsZUFKZTtBQUtmO0FBQ0EsMkNBTmUsR0FPZnhELElBQUk4RSxNQVBXLEdBT0YsU0FQRSxHQVFmLFFBUmUsR0FTZixRQVRKOztBQVdBLG1CQUFPLENBQUMyQixRQUFELEVBQVc1QixZQUFYLENBQVA7QUFDSCxTQXRESTtBQXVETDlFLCtCQUF1QiwrQkFBU2dGLFNBQVQsRUFBb0I7QUFDdkMsZ0JBQUk5SixPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkksT0FBN0I7O0FBRUEsZ0JBQUl1SSxZQUFZLEVBQWhCOztBQUVBO0FBQ0FBLHNCQUFVQyxPQUFWLEdBQW9CLENBQ2hCLEVBRGdCLEVBRWhCLEVBRmdCLENBQXBCOztBQUtBRCxzQkFBVUUsUUFBVixHQUFxQjtBQUNqQkMsNEJBQVksRUFESyxFQUNEO0FBQ2hCQyxnQ0FBZ0IsR0FGQyxFQUVJO0FBQ3JCQyw2QkFBYSxHQUhJLEVBR0M7QUFDbEJDLDRCQUFZLEdBSkssQ0FJRDtBQUpDLGFBQXJCOztBQU9BTixzQkFBVU8sT0FBVixHQUFvQixLQUFwQjtBQUNBUCxzQkFBVVEsU0FBVixHQUFzQixLQUF0QjtBQUNBUixzQkFBVVMsV0FBVixHQUF3QixLQUF4QjtBQUNBVCxzQkFBVVUsVUFBVixHQUF1QnpLLEtBQUtKLFFBQUwsQ0FBY3dMLFFBQXJDLENBckJ1QyxDQXFCUTtBQUMvQ3JCLHNCQUFVVyxNQUFWLEdBQW9CWixZQUFZQyxVQUFVVSxVQUExQyxDQXRCdUMsQ0FzQmdCO0FBQ3ZEO0FBQ0FWLHNCQUFVWSxVQUFWLEdBQXVCLFFBQXZCO0FBQ0FaLHNCQUFVYSxVQUFWLEdBQXVCLEtBQXZCLENBekJ1QyxDQXlCVDtBQUM5QmIsc0JBQVVjLE9BQVYsR0FBb0IsSUFBcEIsQ0ExQnVDLENBMEJiO0FBQzFCZCxzQkFBVWUsT0FBVixHQUFvQixLQUFwQixDQTNCdUMsQ0EyQlo7QUFDM0JmLHNCQUFVZ0IsR0FBVixHQUFpQixtREFBakIsQ0E1QnVDLENBNEIrQjtBQUN0RWhCLHNCQUFVaUIsSUFBVixHQUFpQixLQUFqQixDQTdCdUMsQ0E2QmY7O0FBRXhCakIsc0JBQVVrQixZQUFWLEdBQXlCLFlBQVc7QUFDaEN2SixrQkFBRSwyQ0FBRixFQUErQ2dCLE9BQS9DO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT3FILFNBQVA7QUFDSCxTQTNGSTtBQTRGTG5GLDhCQUFzQixnQ0FBVztBQUM3QmxELGNBQUUsdUJBQUYsRUFBMkJDLE1BQTNCLENBQWtDLG9LQUFsQztBQUNILFNBOUZJO0FBK0ZMc0QsMEJBQWtCLDBCQUFTaUcsZUFBVCxFQUEwQjtBQUN4Q3hKLGNBQUUsbUJBQUYsRUFBdUJ5SixTQUF2QixDQUFpQ0QsZUFBakM7QUFDSDtBQWpHSSxLQXRNTztBQXlTaEIvSixhQUFTO0FBQ0x2QixrQkFBVTtBQUNONkwsd0JBQVksQ0FETixDQUNTO0FBRFQsU0FETDtBQUlMeEosZUFBTyxpQkFBVztBQUNkUCxjQUFFLHVCQUFGLEVBQTJCd0IsTUFBM0I7QUFDSCxTQU5JO0FBT0xrQyxrQ0FBMEIsa0NBQVNzRyxzQkFBVCxFQUFpQztBQUN2RCxnQkFBSUMsT0FBUSxJQUFJQyxJQUFKLENBQVNGLHlCQUF5QixJQUFsQyxDQUFELENBQTBDRyxjQUExQyxFQUFYOztBQUVBLGdCQUFJckUsT0FBTyx1SEFDUCxpSkFETyxHQUM0SW1FLElBRDVJLEdBQ2tKLHdCQURsSixHQUVQLFFBRko7O0FBSUFqSyxjQUFFLGdDQUFGLEVBQW9DQyxNQUFwQyxDQUEyQzZGLElBQTNDO0FBQ0gsU0FmSTtBQWdCTDlCLGtDQUEwQixrQ0FBU0QsS0FBVCxFQUFnQjtBQUN0Qzs7O0FBR0EsZ0JBQUlxRyxhQUFhLEVBQWpCO0FBSnNDO0FBQUE7QUFBQTs7QUFBQTtBQUt0QyxzQ0FBbUJyRyxNQUFNc0csT0FBekIsbUlBQWtDO0FBQUEsd0JBQXpCdkksTUFBeUI7O0FBQzlCc0ksa0NBQWMsNkNBQTRDckcsTUFBTXNHLE9BQU4sQ0FBY3hMLE1BQTFELEdBQWtFLHVDQUFsRSxHQUE0RzZDLFFBQVFDLFFBQVIsQ0FBaUIsUUFBakIsRUFBMkIsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3Qm1ELElBQUlsRCxPQUFPa0QsRUFBbkMsRUFBM0IsQ0FBNUcsR0FBaUwsb0JBQWpMLEdBQXVNbEQsT0FBTzBGLElBQTlNLEdBQW9OLFlBQWxPO0FBQ0g7QUFQcUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTdEMsZ0JBQUk4QyxhQUFhLHVDQUFzQ0YsVUFBdEMsR0FBa0QsUUFBbkU7O0FBRUE7OztBQUdBO0FBQ0EsZ0JBQUluRCxjQUFjLGtCQUFsQjtBQUNBLGdCQUFJbEQsTUFBTStDLFdBQU4sSUFBcUIsRUFBekIsRUFBNkI7QUFDekJHLDhCQUFjLHNCQUFkO0FBQ0g7QUFDRCxnQkFBSWxELE1BQU0rQyxXQUFOLElBQXFCLEVBQXpCLEVBQTZCO0FBQ3pCRyw4QkFBYywyQkFBZDtBQUNIO0FBQ0QsZ0JBQUlsRCxNQUFNK0MsV0FBTixJQUFxQixFQUF6QixFQUE2QjtBQUN6QkcsOEJBQWMsdUJBQWQ7QUFDSDtBQUNELGdCQUFJbEQsTUFBTStDLFdBQU4sSUFBcUIsRUFBekIsRUFBNkI7QUFDekJHLDhCQUFjLHdCQUFkO0FBQ0g7O0FBRUQsZ0JBQUlpQixlQUFlO0FBQ2Y7QUFDQSwwQkFGZSxHQUVDakIsV0FGRCxHQUVjLDJGQUZkLEdBR2ZsRCxNQUFNOEMsT0FIUyxHQUdDLEdBSEQsR0FJZixlQUplO0FBS2Y7QUFDQSwyQ0FOZSxHQU9mOUMsTUFBTW9FLE1BUFMsR0FPQSxTQVBBLEdBUWYsUUFSZSxHQVNmLFFBVEo7O0FBV0EsbUJBQU8sQ0FBQ21DLFVBQUQsRUFBYXBDLFlBQWIsQ0FBUDtBQUNILFNBekRJO0FBMERMcEUsK0JBQXVCLCtCQUFTc0UsU0FBVCxFQUFvQjtBQUN2QyxnQkFBSTlKLE9BQU9YLGFBQWErQixJQUFiLENBQWtCRCxPQUE3Qjs7QUFFQSxnQkFBSTRJLFlBQVksRUFBaEI7O0FBRUE7QUFDQUEsc0JBQVVDLE9BQVYsR0FBb0IsQ0FDaEIsRUFEZ0IsRUFFaEIsRUFGZ0IsQ0FBcEI7O0FBS0FELHNCQUFVRSxRQUFWLEdBQXFCO0FBQ2pCQyw0QkFBWSxFQURLLEVBQ0Q7QUFDaEJDLGdDQUFnQixHQUZDLEVBRUk7QUFDckJDLDZCQUFhLEdBSEksRUFHQztBQUNsQkMsNEJBQVksR0FKSyxDQUlEO0FBSkMsYUFBckI7O0FBT0FOLHNCQUFVTyxPQUFWLEdBQW9CLEtBQXBCO0FBQ0FQLHNCQUFVUSxTQUFWLEdBQXNCLEtBQXRCO0FBQ0FSLHNCQUFVUyxXQUFWLEdBQXdCLEtBQXhCO0FBQ0FULHNCQUFVVSxVQUFWLEdBQXVCekssS0FBS0osUUFBTCxDQUFjNkwsVUFBckMsQ0FyQnVDLENBcUJVO0FBQ2pEMUIsc0JBQVVXLE1BQVYsR0FBb0JaLFlBQVlDLFVBQVVVLFVBQTFDLENBdEJ1QyxDQXNCZ0I7QUFDdkQ7QUFDQVYsc0JBQVVZLFVBQVYsR0FBdUIsUUFBdkI7QUFDQVosc0JBQVVhLFVBQVYsR0FBdUIsS0FBdkIsQ0F6QnVDLENBeUJUO0FBQzlCYixzQkFBVWMsT0FBVixHQUFvQixJQUFwQixDQTFCdUMsQ0EwQmI7QUFDMUJkLHNCQUFVZSxPQUFWLEdBQW9CLEtBQXBCLENBM0J1QyxDQTJCWjtBQUMzQmYsc0JBQVVnQixHQUFWLEdBQWlCLG1EQUFqQixDQTVCdUMsQ0E0QitCO0FBQ3RFaEIsc0JBQVVpQixJQUFWLEdBQWlCLEtBQWpCLENBN0J1QyxDQTZCZjs7QUFFeEJqQixzQkFBVWtCLFlBQVYsR0FBeUIsWUFBVztBQUNoQ3ZKLGtCQUFFLDJDQUFGLEVBQStDZ0IsT0FBL0M7QUFDSCxhQUZEOztBQUlBLG1CQUFPcUgsU0FBUDtBQUNILFNBOUZJO0FBK0ZMekUsOEJBQXNCLGdDQUFXO0FBQzdCNUQsY0FBRSx1QkFBRixFQUEyQkMsTUFBM0IsQ0FBa0Msb0tBQWxDO0FBQ0gsU0FqR0k7QUFrR0xnRSwwQkFBa0IsMEJBQVN1RixlQUFULEVBQTBCO0FBQ3hDeEosY0FBRSxtQkFBRixFQUF1QnlKLFNBQXZCLENBQWlDRCxlQUFqQztBQUNIO0FBcEdJLEtBelNPO0FBK1loQm5LLGFBQVM7QUFDTG5CLGtCQUFVO0FBQ05xTSx5QkFBYSxLQURQLEVBQ2M7QUFDcEJDLGtDQUFzQixLQUZoQjtBQUdOckYsK0JBQW1CO0FBQ2YscUJBQUssQ0FEVTtBQUVmLHFCQUFLO0FBRlUsYUFIYjtBQU9Oc0Ysb0JBQVEsRUFQRixFQU9NO0FBQ1pDLG1DQUF1QixLQVJqQjtBQVNOQyw4Q0FBa0MsS0FUNUI7QUFVTkMsMkJBQWUsRUFWVCxDQVVZO0FBVlosU0FETDtBQWFMckssZUFBTyxpQkFBVztBQUNkLGdCQUFJakMsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCOztBQUVBO0FBQ0FmLGlCQUFLSixRQUFMLENBQWNpSCxpQkFBZCxHQUFrQztBQUM5QixxQkFBSyxDQUR5QjtBQUU5QixxQkFBSztBQUZ5QixhQUFsQzs7QUFLQTtBQUNBLGlCQUFLLElBQUkwRixRQUFULElBQXFCdk0sS0FBS0osUUFBTCxDQUFjdU0sTUFBbkMsRUFBMkM7QUFDdkMsb0JBQUluTSxLQUFLSixRQUFMLENBQWN1TSxNQUFkLENBQXFCSyxjQUFyQixDQUFvQ0QsUUFBcEMsQ0FBSixFQUFtRDtBQUMvQyx3QkFBSUUsUUFBUXpNLEtBQUtKLFFBQUwsQ0FBY3VNLE1BQWQsQ0FBcUJJLFFBQXJCLENBQVo7QUFDQUUsMEJBQU1DLE9BQU47QUFDSDtBQUNKOztBQUVEMU0saUJBQUtKLFFBQUwsQ0FBY3VNLE1BQWQsR0FBdUIsRUFBdkI7O0FBRUF6SyxjQUFFLDZCQUFGLEVBQWlDd0IsTUFBakM7QUFDQTtBQUNBbEQsaUJBQUtKLFFBQUwsQ0FBY3dNLHFCQUFkLEdBQXNDLEtBQXRDO0FBQ0FwTSxpQkFBS0osUUFBTCxDQUFjeU0sZ0NBQWQsR0FBaUQsS0FBakQ7QUFDQXJNLGlCQUFLSixRQUFMLENBQWNzTSxvQkFBZCxHQUFxQyxLQUFyQztBQUNBbE0saUJBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsR0FBOEIsRUFBOUI7QUFDSCxTQXRDSTtBQXVDTDdGLDBCQUFrQiwwQkFBU1QsT0FBVCxFQUFrQjtBQUNoQyxnQkFBSWhHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxtQkFBT2YsS0FBS0osUUFBTCxDQUFjME0sYUFBZCxDQUE0QkUsY0FBNUIsQ0FBMkN4RyxVQUFVLEVBQXJELENBQVA7QUFDSCxTQTNDSTtBQTRDTDFELHdDQUFnQywwQ0FBVztBQUN2Q1osY0FBRSw2QkFBRixFQUFpQ0MsTUFBakMsQ0FBd0Msd0lBQXhDO0FBQ0gsU0E5Q0k7QUErQ0xvRixrQ0FBMEIsb0NBQVc7QUFDakNyRixjQUFFLDZCQUFGLEVBQWlDQyxNQUFqQyxDQUF3QyxrRUFBeEM7QUFDSCxTQWpESTtBQWtETHdGLHlDQUFpQywyQ0FBVztBQUN4QyxnQkFBSW5ILE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3QjtBQUNBLGdCQUFJekIsT0FBT0QsYUFBYUMsSUFBYixDQUFrQnlCLE9BQTdCOztBQUVBLGdCQUFJZixLQUFLSixRQUFMLENBQWN3TSxxQkFBbEIsRUFBeUM7QUFDckMsb0JBQUlPLE1BQU1qTCxFQUFFLHdCQUFGLENBQVY7O0FBRUEsb0JBQUkxQixLQUFLSixRQUFMLENBQWNzTSxvQkFBbEIsRUFBd0M7QUFDcEMsd0JBQUkxRSxPQUFPLDRLQUFYOztBQUVBbUYsd0JBQUluRixJQUFKLENBQVNBLElBQVQ7O0FBRUEsd0JBQUksQ0FBQ3hILEtBQUtKLFFBQUwsQ0FBY3lNLGdDQUFuQixFQUFxRDtBQUNqRE0sNEJBQUlDLEtBQUosQ0FBVSxZQUFZO0FBQ2xCLGdDQUFJLENBQUN0TixLQUFLTSxRQUFMLENBQWNDLE9BQW5CLEVBQTRCO0FBQ3hCUCxxQ0FBS00sUUFBTCxDQUFjQyxPQUFkLEdBQXdCLElBQXhCOztBQUVBLG9DQUFJZ04sSUFBSW5MLEVBQUUsSUFBRixDQUFSOztBQUVBbUwsa0NBQUVyRixJQUFGLENBQU8sbURBQVA7O0FBRUFuSSw2Q0FBYUMsSUFBYixDQUFrQnlCLE9BQWxCLENBQTBCRixJQUExQjtBQUNIO0FBQ0oseUJBVkQ7O0FBWUFiLDZCQUFLSixRQUFMLENBQWN5TSxnQ0FBZCxHQUFpRCxJQUFqRDtBQUNIO0FBQ0osaUJBcEJELE1BcUJLO0FBQ0QzSyxzQkFBRSxVQUFGLEVBQWNnQixPQUFkLENBQXNCLE1BQXRCOztBQUVBaUssd0JBQUluRixJQUFKLENBQVMsRUFBVDs7QUFFQW1GLHdCQUFJRyxHQUFKLENBQVEsT0FBUjs7QUFFQTlNLHlCQUFLSixRQUFMLENBQWN5TSxnQ0FBZCxHQUFpRCxLQUFqRDtBQUNIO0FBQ0o7QUFDSixTQXhGSTtBQXlGTDlGLDJDQUFtQyw2Q0FBVztBQUMxQyxnQkFBSXZHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxnQkFBSSxDQUFDZixLQUFLSixRQUFMLENBQWN3TSxxQkFBbkIsRUFBMEM7QUFDdEMsb0JBQUkxRSxZQUFZaEcsRUFBRSw2QkFBRixDQUFoQjs7QUFFQTtBQUNBLG9CQUFJcUwsVUFBVSxrQkFBZDtBQUNBLG9CQUFJL00sS0FBS0osUUFBTCxDQUFjcU0sV0FBbEIsRUFBK0I7QUFDM0JjLDhCQUFVLFlBQVY7QUFDSDs7QUFFRCxvQkFBSXZGLE9BQU87QUFDWDtBQUNBLGdFQUZXLEdBR1gsMkNBSFcsR0FJWCwrQ0FKVyxHQUtYLFFBTFc7QUFNWDtBQUNBLG1FQVBXLEdBUVgsNENBUlcsR0FTWCw4Q0FUVyxHQVVYLFFBVlc7QUFXWDtBQUNBLG1EQVpXLEdBYVgseU1BYlcsR0FjWCxzTUFkVyxHQWVYLG1NQWZXLEdBZ0JYLDZNQWhCVyxHQWlCWCxRQWpCVztBQWtCWDtBQUNBLGdGQW5CVyxHQW9CWCxRQXBCVztBQXFCWDtBQUNBLDhFQXRCVyxHQXVCWCxxSkF2QlcsR0F1QjRJdUYsT0F2QjVJLEdBdUJxSix1Q0F2QnJKLEdBd0JYLFFBeEJXLEdBeUJYLFFBekJBOztBQTJCQXJGLDBCQUFVL0YsTUFBVixDQUFpQjZGLElBQWpCOztBQUVBO0FBQ0F3Rix1QkFBT0MsYUFBUCxDQUFxQkMsVUFBckI7O0FBRUE7QUFDQWxOLHFCQUFLbU4saUNBQUw7O0FBRUE7QUFDQXpMLGtCQUFFLHVCQUFGLEVBQTJCa0wsS0FBM0IsQ0FBaUMsWUFBWTtBQUN6Qyx3QkFBSWhOLFdBQVdQLGFBQWErQixJQUFiLENBQWtCTCxPQUFsQixDQUEwQm5CLFFBQXpDOztBQUVBLHdCQUFJK00sTUFBTWpMLEVBQUUsNkJBQUYsQ0FBVjs7QUFFQSx3QkFBSTlCLFNBQVNxTSxXQUFiLEVBQTBCO0FBQ3RCVSw0QkFBSW5GLElBQUosQ0FBUyw4REFBVDtBQUNBNUgsaUNBQVNxTSxXQUFULEdBQXVCLEtBQXZCO0FBQ0gscUJBSEQsTUFJSztBQUNEVSw0QkFBSW5GLElBQUosQ0FBUyx3REFBVDtBQUNBNUgsaUNBQVNxTSxXQUFULEdBQXVCLElBQXZCO0FBQ0g7QUFDSixpQkFiRDs7QUFlQWpNLHFCQUFLSixRQUFMLENBQWN3TSxxQkFBZCxHQUFzQyxJQUF0QztBQUNIO0FBQ0osU0ExSkk7QUEySkxlLDJDQUFtQyw2Q0FBVztBQUMxQyxnQkFBSW5OLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQSxnQkFBSUssT0FBTztBQUNQZ00sMEJBQVUsQ0FDTjtBQUNJaE0sMEJBQU0sQ0FBQyxDQUFELENBRFYsRUFDZTtBQUNYaU0scUNBQWlCLENBQ2IsU0FEYSxFQUViLFNBRmEsQ0FGckI7QUFNSUMsaUNBQWEsQ0FDVCxTQURTLEVBRVQsU0FGUyxDQU5qQjtBQVVJQyxpQ0FBYSxDQUNULENBRFMsRUFFVCxDQUZTO0FBVmpCLGlCQURNO0FBREgsYUFBWDs7QUFvQkEsZ0JBQUlDLFVBQVU7QUFDVkMsMkJBQVcsS0FERDtBQUVWQyxxQ0FBcUIsS0FGWDtBQUdWQyx3QkFBUTtBQUNKQyw2QkFBUztBQURMLGlCQUhFO0FBTVZDLDBCQUFVO0FBQ05DLDZCQUFTO0FBREgsaUJBTkE7QUFTVkMsdUJBQU87QUFDSEMsMEJBQU07QUFESDtBQVRHLGFBQWQ7O0FBY0FoTyxpQkFBS0osUUFBTCxDQUFjdU0sTUFBZCxDQUFxQixTQUFyQixJQUFrQyxJQUFJOEIsS0FBSixDQUFVdk0sRUFBRSx5QkFBRixDQUFWLEVBQXdDO0FBQ3RFd00sc0JBQU0sVUFEZ0U7QUFFdEU5TSxzQkFBTUEsSUFGZ0U7QUFHdEVvTSx5QkFBU0E7QUFINkQsYUFBeEMsQ0FBbEM7QUFLSCxTQXJNSTtBQXNNTDFHLHlDQUFpQyx5Q0FBU3FILFNBQVQsRUFBb0I7QUFDakQsZ0JBQUluTyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUEsZ0JBQUkwTCxRQUFRek0sS0FBS0osUUFBTCxDQUFjdU0sTUFBZCxDQUFxQjVELE9BQWpDOztBQUVBLGdCQUFJa0UsS0FBSixFQUFXO0FBQ1A7QUFDQSxvQkFBSTVDLFNBQVNzRSxVQUFVLENBQVYsSUFBZUEsVUFBVSxDQUFWLENBQTVCO0FBQ0Esb0JBQUlDLE9BQU9ELFVBQVUsQ0FBVixJQUFlLEdBQTFCO0FBQ0Esb0JBQUlFLFNBQVNGLFVBQVUsQ0FBVixJQUFlLEdBQTVCO0FBQ0Esb0JBQUk1RixVQUFVLEtBQWQ7QUFDQSxvQkFBSStGLGtCQUFrQi9GLE9BQXRCO0FBQ0Esb0JBQUk4RixTQUFTLENBQWIsRUFBZ0I7QUFDWjlGLDhCQUFXNkYsUUFBUUEsT0FBT0MsTUFBZixDQUFELEdBQTJCLEtBQXJDO0FBQ0FDLHNDQUFrQi9GLE9BQWxCO0FBQ0ErRixzQ0FBa0JBLGdCQUFnQkMsT0FBaEIsQ0FBd0IsQ0FBeEIsQ0FBbEI7QUFDSDs7QUFFRCxvQkFBSTVGLGNBQWMsa0JBQWxCO0FBQ0Esb0JBQUlKLFdBQVcsRUFBZixFQUFtQjtBQUNmSSxrQ0FBYyxzQkFBZDtBQUNIO0FBQ0Qsb0JBQUlKLFdBQVcsRUFBZixFQUFtQjtBQUNmSSxrQ0FBYywyQkFBZDtBQUNIO0FBQ0Qsb0JBQUlKLFdBQVcsRUFBZixFQUFtQjtBQUNmSSxrQ0FBYyx1QkFBZDtBQUNIO0FBQ0Qsb0JBQUlKLFdBQVcsRUFBZixFQUFtQjtBQUNmSSxrQ0FBYyx3QkFBZDtBQUNIOztBQUVELG9CQUFJaUIsZUFDQSxpQkFBZ0JqQixXQUFoQixHQUE2QixJQUE3QixHQUNBMkYsZUFEQSxHQUNrQixHQURsQixHQUVBLFFBSEo7O0FBS0E1TSxrQkFBRSwyQkFBRixFQUErQjhGLElBQS9CLENBQW9Db0MsWUFBcEM7QUFDQWxJLGtCQUFFLDRCQUFGLEVBQWdDOEYsSUFBaEMsQ0FBcUMsWUFBV3FDLE1BQVgsR0FBb0IsVUFBekQ7QUFDQW5JLGtCQUFFLDhCQUFGLEVBQWtDOEYsSUFBbEMsQ0FBdUMsK0VBQThFNEcsSUFBOUUsR0FBb0YsVUFBcEYsR0FDbkMsNkVBRG1DLEdBQzRDQyxNQUQ1QyxHQUNvRCxTQUQzRjs7QUFHQTtBQUNBNUIsc0JBQU1yTCxJQUFOLENBQVdnTSxRQUFYLENBQW9CLENBQXBCLEVBQXVCaE0sSUFBdkIsR0FBOEIsQ0FBQytNLFVBQVUsQ0FBVixDQUFELEVBQWVBLFVBQVUsQ0FBVixDQUFmLENBQTlCLENBdENPLENBc0NxRDs7QUFFNUQ7QUFDQTFCLHNCQUFNK0IsTUFBTjtBQUNIO0FBQ0osU0F0UEk7QUF1UEw3SCx1QkFBZSx1QkFBU0gsS0FBVCxFQUFnQjtBQUMzQjtBQUNBLGdCQUFJeEcsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCOztBQUVBO0FBQ0EsZ0JBQUl5RyxPQUFPLHVDQUF1Q2hCLE1BQU1FLEVBQTdDLEdBQWtELDJDQUE3RDs7QUFFQWhGLGNBQUUsNkJBQUYsRUFBaUNDLE1BQWpDLENBQXdDNkYsSUFBeEM7O0FBRUE7QUFDQSxnQkFBSWlILGdCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQXBCLENBVjJCLENBVVU7QUFDckM5TCxzQkFBVStMLE9BQVYsQ0FBa0JDLE9BQWxCLENBQTBCRixhQUExQjs7QUFFQTtBQUNBek8saUJBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsQ0FBNEI5RixNQUFNRSxFQUFOLEdBQVcsRUFBdkMsSUFBNkM7QUFDekNrSSwrQkFBZSxLQUQwQixFQUNuQjtBQUN0QkMsNkJBQWEsS0FGNEIsRUFFckI7QUFDcEJDLDZCQUFhdEksTUFBTWhELE1BQU4sQ0FBYWtELEVBSGUsRUFHWDtBQUM5QitILCtCQUFlQSxhQUowQixFQUlYO0FBQzlCTSx1QkFBTyxJQUxrQyxFQUs1QjtBQUNiQyw2QkFBYSxJQU40QixDQU10QjtBQU5zQixhQUE3Qzs7QUFTQTtBQUNBLGdCQUFJeEksTUFBTWhELE1BQU4sQ0FBYXlMLEdBQWpCLEVBQXNCO0FBQ2xCalAscUJBQUtKLFFBQUwsQ0FBY2lILGlCQUFkLENBQWdDLEdBQWhDO0FBQ0gsYUFGRCxNQUdLO0FBQ0Q3RyxxQkFBS0osUUFBTCxDQUFjaUgsaUJBQWQsQ0FBZ0MsR0FBaEM7QUFDSDs7QUFFRDtBQUNBN0csaUJBQUtrUCxtQkFBTCxDQUF5QjFJLEtBQXpCO0FBQ0gsU0F4Ukk7QUF5UkwwSSw2QkFBcUIsNkJBQVMxSSxLQUFULEVBQWdCO0FBQ2pDO0FBQ0EsZ0JBQUl4RyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUE7QUFDQSxnQkFBSW9PLFlBQVkzSSxNQUFNbUYsSUFBdEI7QUFDQSxnQkFBSXlELGdCQUFnQnpNLFVBQVVnSixJQUFWLENBQWUwRCxlQUFmLENBQStCRixTQUEvQixDQUFwQjtBQUNBLGdCQUFJeEQsT0FBUSxJQUFJQyxJQUFKLENBQVN1RCxZQUFZLElBQXJCLENBQUQsQ0FBNkJ0RCxjQUE3QixFQUFYO0FBQ0EsZ0JBQUl5RCxhQUFhM00sVUFBVWdKLElBQVYsQ0FBZTRELG1CQUFmLENBQW1DL0ksTUFBTWdKLFlBQXpDLENBQWpCO0FBQ0EsZ0JBQUlDLGNBQWVqSixNQUFNaEQsTUFBTixDQUFheUwsR0FBZCxHQUFzQixpREFBdEIsR0FBNEUsaURBQTlGO0FBQ0EsZ0JBQUlTLFFBQVFsSixNQUFNaEQsTUFBTixDQUFha00sS0FBekI7O0FBRUE7QUFDQSxnQkFBSUMsVUFBVSxTQUFWQSxPQUFVLENBQVNDLFVBQVQsRUFBcUI7QUFDL0Isb0JBQUlDLElBQUksRUFBUjs7QUFFQSxvQkFBSUQsVUFBSixFQUFnQjtBQUNaQyx3QkFBSSxrQkFBSjtBQUNILGlCQUZELE1BR0s7QUFDREEsd0JBQUksWUFBSjtBQUNIOztBQUVELHVCQUFPQSxDQUFQO0FBQ0gsYUFYRDs7QUFhQSxnQkFBSUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTRixVQUFULEVBQXFCRyxJQUFyQixFQUEyQjtBQUMzQyxvQkFBSUMsSUFBSSxFQUFSOztBQUVBLG9CQUFJSixVQUFKLEVBQWdCO0FBQ1osd0JBQUlHLE9BQU8sQ0FBWCxFQUFjO0FBQ1YsNEJBQUlFLE9BQU9wSSxjQUFjLG1CQUF6QjtBQUNBbUksNkJBQUssdUtBQXVLRCxJQUF2SyxHQUE4SyxZQUE5SyxHQUE2TEEsSUFBN0wsR0FBb00sWUFBcE0sR0FBbU5FLElBQW5OLEdBQTBOLFdBQS9OO0FBQ0g7QUFDSjs7QUFFRCx1QkFBT0QsQ0FBUDtBQUNILGFBWEQ7O0FBYUE7QUFDQSxnQkFBSTdHLFVBQVUsa0JBQWQ7QUFDQSxnQkFBSTNDLE1BQU1oRCxNQUFOLENBQWE0RixPQUFiLElBQXdCLENBQTVCLEVBQStCO0FBQzNCRCwwQkFBVSx1QkFBVjtBQUNIO0FBQ0QsZ0JBQUkzQyxNQUFNaEQsTUFBTixDQUFhNEYsT0FBYixJQUF3QixDQUE1QixFQUErQjtBQUMzQkQsMEJBQVUsd0JBQVY7QUFDSDs7QUFFRDtBQUNBLGdCQUFJK0csWUFBWSxFQUFoQjtBQUNBLGdCQUFJQyxjQUFjLEVBQWxCO0FBQ0EsZ0JBQUlULE1BQU1VLE1BQVYsRUFBa0I7QUFDZEYsNEJBQVksNEpBQ05SLE1BQU14RyxJQURBLEdBQ08sYUFEUCxHQUN1QndHLE1BQU1XLFdBRDdCLEdBQzJDLDJDQUQzQyxHQUVOeEksV0FGTSxHQUVRNkgsTUFBTXBFLEtBRmQsR0FFc0IsMEJBRmxDO0FBR0gsYUFKRCxNQUtLO0FBQ0Q2RSw4QkFBYyxxQ0FBZDtBQUNIOztBQUVEO0FBQ0EsZ0JBQUlHLGNBQWMsRUFBbEI7QUFDQSxpQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksQ0FBcEIsRUFBdUJBLEdBQXZCLEVBQTRCO0FBQ3hCRCwrQkFBZSxrQ0FBZjs7QUFFQSxvQkFBSTlKLE1BQU1oRCxNQUFOLENBQWFnTixPQUFiLENBQXFCalEsTUFBckIsR0FBOEJnUSxDQUFsQyxFQUFxQztBQUNqQyx3QkFBSUUsU0FBU2pLLE1BQU1oRCxNQUFOLENBQWFnTixPQUFiLENBQXFCRCxDQUFyQixDQUFiOztBQUVBRCxtQ0FBZSx5REFBeUR0USxLQUFLMFEsYUFBTCxDQUFtQkQsT0FBT3ZILElBQTFCLEVBQWdDdUgsT0FBT0osV0FBdkMsQ0FBekQsR0FBK0csc0NBQS9HLEdBQXdKeEksV0FBeEosR0FBc0s0SSxPQUFPbkYsS0FBN0ssR0FBb0wsZUFBbk07QUFDSDs7QUFFRGdGLCtCQUFlLFFBQWY7QUFDSDs7QUFFRDtBQUNBLGdCQUFJSyxjQUFjLEVBQWxCO0FBQ0EsZ0JBQUlDLGlCQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQXJCLENBNUVpQyxDQTRFSztBQUN0QyxnQkFBSW5DLGdCQUFnQnpPLEtBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsQ0FBNEI5RixNQUFNRSxFQUFOLEdBQVcsRUFBdkMsRUFBMkMrSCxhQUEvRDtBQUNBLGdCQUFJNUIsSUFBSSxDQUFSO0FBOUVpQztBQUFBO0FBQUE7O0FBQUE7QUErRWpDLHNDQUFpQnJHLE1BQU1xSyxLQUF2QixtSUFBOEI7QUFBQSx3QkFBckJDLElBQXFCOztBQUMxQkgsbUNBQWUsOEJBQThCOUQsQ0FBOUIsR0FBa0MsSUFBakQ7O0FBRDBCO0FBQUE7QUFBQTs7QUFBQTtBQUcxQiw4Q0FBbUJpRSxLQUFLL0UsT0FBeEIsbUlBQWlDO0FBQUEsZ0NBQXhCdkksTUFBd0I7O0FBQzdCLGdDQUFJaUMsUUFBUSxFQUFaO0FBQ0EsZ0NBQUlqQyxPQUFPaUMsS0FBUCxHQUFlLENBQW5CLEVBQXNCO0FBQ2xCLG9DQUFJc0wsY0FBY3ZOLE9BQU9pQyxLQUFQLEdBQWUsQ0FBakM7QUFDQSxvQ0FBSXVMLGFBQWF2QyxjQUFjc0MsV0FBZCxDQUFqQjs7QUFFQXRMLHdDQUFRLCtDQUE4Q3VMLFVBQTlDLEdBQTBELFVBQWxFOztBQUVBLG9DQUFJSixlQUFlRyxXQUFmLElBQThCLENBQWxDLEVBQXFDO0FBQ2pDdEwsNkNBQVMsNERBQTJEdUwsVUFBM0QsR0FBdUUsVUFBaEY7QUFDSDs7QUFFREosK0NBQWVHLFdBQWY7QUFDSDs7QUFFRCxnQ0FBSUUsVUFBVSxlQUFhdEIsUUFBUW5NLE9BQU8wTixRQUFmLENBQWIsR0FBc0MsVUFBdEMsR0FBbUQ5TixRQUFRQyxRQUFSLENBQWlCLFFBQWpCLEVBQTJCLEVBQUNDLFFBQVFrRCxNQUFNbEQsTUFBZixFQUF1Qm9ELElBQUlsRCxPQUFPa0QsRUFBbEMsRUFBM0IsQ0FBbkQsR0FBdUgsb0JBQXJJO0FBQ0EsZ0NBQUlsRCxPQUFPa0QsRUFBUCxLQUFjRixNQUFNaEQsTUFBTixDQUFha0QsRUFBL0IsRUFBbUM7QUFDL0J1SywwQ0FBVSwyQkFBVjtBQUNIOztBQUVETiwyQ0FBZSxzRkFBc0ZuTixPQUFPZSxJQUE3RixHQUFvRyw0Q0FBcEcsR0FDVHNELFdBRFMsR0FDS3JFLE9BQU93RixVQURaLEdBQ3dCLGVBRHhCLEdBQzBDdkQsS0FEMUMsR0FDa0RxSyxjQUFjdE0sT0FBTzBOLFFBQXJCLEVBQStCLEVBQS9CLENBRGxELEdBQ3VGRCxPQUR2RixHQUNpR3pOLE9BQU8wRixJQUR4RyxHQUMrRyxZQUQ5SDtBQUVIO0FBekJ5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTJCMUJ5SCxtQ0FBZSxRQUFmOztBQUVBOUQ7QUFDSDtBQTdHZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUErR2pDLGdCQUFJckYsT0FBTyxvQ0FBbUNoQixNQUFNRSxFQUF6QyxHQUE2QyxzQ0FBN0MsR0FBc0ZGLE1BQU1FLEVBQTVGLEdBQWlHLHFDQUFqRyxHQUNQLHNEQURPLEdBQ2tERixNQUFNRSxFQUR4RCxHQUM2RCx1REFEN0QsR0FDdUg7QUFDOUgsNERBRk8sR0FFNEMxRyxLQUFLbVIsa0JBQUwsQ0FBd0IzSyxNQUFNaEQsTUFBTixDQUFheUwsR0FBckMsQ0FGNUMsR0FFd0YsaUNBRnhGLEdBRTRIcEgsV0FGNUgsR0FFMElyQixNQUFNNEssU0FGaEosR0FFMkosVUFGM0osR0FHUCxvSEFITyxHQUdnSDVLLE1BQU16QixHQUh0SCxHQUc0SCxJQUg1SCxHQUdtSXlCLE1BQU00QixRQUh6SSxHQUdvSixlQUhwSixHQUlQLGlGQUpPLEdBSTZFdUQsSUFKN0UsR0FJb0YscUNBSnBGLEdBSTRIeUQsYUFKNUgsR0FJNEksc0JBSjVJLEdBS1AsZ0NBTE8sR0FLNEJLLFdBTDVCLEdBSzBDLFFBTDFDLEdBTVAsb0NBTk8sR0FNZ0NILFVBTmhDLEdBTTZDLFFBTjdDLEdBT1AsUUFQTyxHQVFQLGlEQVJPLEdBU1AsMERBVE8sR0FTc0R6SCxXQVR0RCxHQVNvRXJCLE1BQU1oRCxNQUFOLENBQWF3RixVQVRqRixHQVM2RixjQVQ3RixHQVVQLGlDQVZPLEdBVTJCOEcsY0FBY3RKLE1BQU1oRCxNQUFOLENBQWEwTixRQUEzQixFQUFxQyxFQUFyQyxDQVYzQixHQVVvRSxZQVZwRSxHQVVpRnZCLFFBQVFuSixNQUFNaEQsTUFBTixDQUFhME4sUUFBckIsQ0FWakYsR0FVZ0gsVUFWaEgsR0FVNkg5TixRQUFRQyxRQUFSLENBQWlCLFlBQWpCLEVBQStCLEVBQUNDLFFBQVFrRCxNQUFNbEQsTUFBZixFQUF1Qm9ELElBQUlqRCxTQUEzQixFQUFzQ3dGLGdCQUFnQnpDLE1BQU1oRCxNQUFOLENBQWFlLElBQW5FLEVBQS9CLENBVjdILEdBVXdPLG9CQVZ4TyxHQVUrUGlDLE1BQU1oRCxNQUFOLENBQWFlLElBVjVRLEdBVW1SLFlBVm5SLEdBV1AsUUFYTyxHQVlQLDhFQVpPLEdBYVA0TCxXQWJPLEdBY1Asc0pBZE8sR0FlRzNKLE1BQU1oRCxNQUFOLENBQWE2TixLQWZoQixHQWV3Qiw2Q0FmeEIsR0Fld0U3SyxNQUFNaEQsTUFBTixDQUFhOE4sTUFmckYsR0FlOEYsWUFmOUYsR0FlNkc5SyxNQUFNaEQsTUFBTixDQUFhK04sT0FmMUgsR0Flb0ksc0JBZnBJLEdBZ0JQLHdKQWhCTyxHQWdCbUpwSSxPQWhCbkosR0FnQjRKLElBaEI1SixHQWdCbUszQyxNQUFNaEQsTUFBTixDQUFhNkYsR0FoQmhMLEdBZ0JzTCxnQ0FoQnRMLEdBaUJQNkcsU0FqQk8sR0FrQlAsY0FsQk8sR0FtQlAsMkZBbkJPLEdBb0JQSSxXQXBCTyxHQXFCUCxjQXJCTyxHQXNCUCxnRkF0Qk8sR0F1QlBLLFdBdkJPLEdBd0JQLGNBeEJPLEdBeUJQLDRDQXpCTyxHQXlCd0NuSyxNQUFNRSxFQXpCOUMsR0F5Qm1ELDZDQXpCbkQsR0EwQlAsdURBMUJPLEdBMkJQLFFBM0JPLEdBNEJQLG9CQTVCSjs7QUE4QkFoRixjQUFFLCtCQUErQjhFLE1BQU1FLEVBQXZDLEVBQTJDL0UsTUFBM0MsQ0FBa0Q2RixJQUFsRDs7QUFFQTtBQUNBeEgsaUJBQUt3Uiw4QkFBTCxDQUFvQ2hMLEtBQXBDOztBQUVBO0FBQ0E5RSxjQUFFLHVDQUF1QzhFLE1BQU1FLEVBQS9DLEVBQW1Ea0csS0FBbkQsQ0FBeUQsWUFBVztBQUNoRSxvQkFBSUMsSUFBSW5MLEVBQUUsSUFBRixDQUFSOztBQUVBMUIscUJBQUt5UixxQkFBTCxDQUEyQmpMLE1BQU1FLEVBQWpDO0FBQ0gsYUFKRDs7QUFNQTtBQUNBaEYsY0FBRXNMLE1BQUYsRUFBVTBFLEVBQVYsQ0FBYSw2REFBYixFQUE0RSxVQUFTQyxDQUFULEVBQVk7QUFDcEYsb0JBQUlDLFdBQVd2UyxhQUFhK0IsSUFBYixDQUFrQkwsT0FBbEIsQ0FBMEJuQixRQUExQixDQUFtQzBNLGFBQWxEOztBQUVBLG9CQUFJc0YsU0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixDQUFKLEVBQTZCO0FBQ3pCLHdCQUFJaEYsRUFBRSwrQkFBK0I4RSxNQUFNRSxFQUF2QyxFQUEyQ21MLFVBQTNDLEVBQUosRUFBNkQ7QUFDekQsNEJBQUlsRixNQUFNakwsRUFBRSxpREFBaUQ4RSxNQUFNRSxFQUF6RCxDQUFWOztBQUVBLDRCQUFJLENBQUNrTCxTQUFTcEwsTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCcUksS0FBN0IsRUFBb0M7QUFDaENwQyxnQ0FBSTNGLElBQUo7QUFDQTRLLHFDQUFTcEwsTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCcUksS0FBeEIsR0FBZ0MsSUFBaEM7QUFDSDtBQUNKLHFCQVBELE1BUUs7QUFDRCw0QkFBSXBDLE9BQU1qTCxFQUFFLGlEQUFpRDhFLE1BQU1FLEVBQXpELENBQVY7O0FBRUEsNEJBQUlrTCxTQUFTcEwsTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCcUksS0FBNUIsRUFBbUM7QUFDL0JwQyxpQ0FBSXJHLElBQUo7QUFDQXNMLHFDQUFTcEwsTUFBTUUsRUFBTixHQUFXLEVBQXBCLEVBQXdCcUksS0FBeEIsR0FBZ0MsS0FBaEM7QUFDSDtBQUNKO0FBQ0o7QUFDSixhQXJCRDtBQXNCSCxTQXpjSTtBQTBjTHlDLHdDQUFnQyx3Q0FBU2hMLEtBQVQsRUFBZ0I7QUFDNUMsZ0JBQUl4RyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUEsZ0JBQUlvTyxZQUFZM0ksTUFBTW1GLElBQXRCO0FBQ0EsZ0JBQUlBLE9BQVEsSUFBSUMsSUFBSixDQUFTdUQsWUFBWSxJQUFyQixDQUFELENBQTZCdEQsY0FBN0IsRUFBWDtBQUNBLGdCQUFJeUQsYUFBYTNNLFVBQVVnSixJQUFWLENBQWU0RCxtQkFBZixDQUFtQy9JLE1BQU1nSixZQUF6QyxDQUFqQjtBQUNBLGdCQUFJQyxjQUFlakosTUFBTWhELE1BQU4sQ0FBYXlMLEdBQWQsR0FBc0IsaURBQXRCLEdBQTRFLGlEQUE5Rjs7QUFFQTtBQUNBLGdCQUFJVSxVQUFVLFNBQVZBLE9BQVUsQ0FBU0MsVUFBVCxFQUFxQjtBQUMvQixvQkFBSUMsSUFBSSxFQUFSOztBQUVBLG9CQUFJRCxVQUFKLEVBQWdCO0FBQ1pDLHdCQUFJLGtCQUFKO0FBQ0gsaUJBRkQsTUFHSztBQUNEQSx3QkFBSSxZQUFKO0FBQ0g7O0FBRUQsdUJBQU9BLENBQVA7QUFDSCxhQVhEOztBQWFBLGdCQUFJQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQVNGLFVBQVQsRUFBcUJHLElBQXJCLEVBQTJCO0FBQzNDLG9CQUFJQyxJQUFJLEVBQVI7O0FBRUEsb0JBQUlKLFVBQUosRUFBZ0I7QUFDWix3QkFBSUcsT0FBTyxDQUFYLEVBQWM7QUFDViw0QkFBSUUsT0FBT3BJLGNBQWMsbUJBQXpCO0FBQ0FtSSw2QkFBSyx1S0FBdUtELElBQXZLLEdBQThLLFlBQTlLLEdBQTZMQSxJQUE3TCxHQUFvTSxZQUFwTSxHQUFtTkUsSUFBbk4sR0FBME4sV0FBL047QUFDSDtBQUNKOztBQUVELHVCQUFPRCxDQUFQO0FBQ0gsYUFYRDs7QUFhQTtBQUNBLGdCQUFJNUgsV0FBVzVCLE1BQU00QixRQUFyQjtBQUNBLGdCQUFJMEosbUJBQW1CMUosUUFBdkI7QUFDQSxnQkFBSUEsYUFBYSxhQUFqQixFQUFnQztBQUM1QjBKLG1DQUFtQixnRkFBbkI7QUFDSCxhQUZELE1BR0ssSUFBSTFKLGFBQWEsYUFBakIsRUFBZ0M7QUFDakMwSixtQ0FBbUIsZ0ZBQW5CO0FBQ0gsYUFGSSxNQUdBLElBQUkxSixhQUFhLGdCQUFqQixFQUFtQztBQUNwQzBKLG1DQUFtQixnRkFBbkI7QUFDSCxhQUZJLE1BR0EsSUFBSTFKLGFBQWEsYUFBakIsRUFBZ0M7QUFDakMwSixtQ0FBbUIsZ0ZBQW5CO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBSXZOLE9BQU9pQyxNQUFNaEQsTUFBTixDQUFhZSxJQUF4Qjs7QUFFQSxnQkFBSWlELE9BQU8sNENBQTJDaEIsTUFBTUUsRUFBakQsR0FBcUQsOENBQXJELEdBQXNHRixNQUFNRSxFQUE1RyxHQUFpSCw2Q0FBakgsR0FDUCw4REFETyxHQUMwREYsTUFBTUUsRUFEaEUsR0FDcUUsK0RBRHJFLEdBQ3VJO0FBQzlJO0FBQ0EscURBSE8sR0FJUCx3Q0FKTyxHQUltQytJLFdBSm5DLEdBSWdELFFBSmhELEdBS1AsUUFMTztBQU1QO0FBQ0Esc0RBUE8sR0FRUHFDLGdCQVJPLEdBU1AsUUFUTztBQVVQO0FBQ0Esa0RBWE8sR0FZUCx1REFaTyxHQVlpRGhDLGNBQWN0SixNQUFNaEQsTUFBTixDQUFhME4sUUFBM0IsRUFBcUMsRUFBckMsQ0FaakQsR0FZMEYsWUFaMUYsR0FZdUd2QixRQUFRbkosTUFBTWhELE1BQU4sQ0FBYTBOLFFBQXJCLENBWnZHLEdBWXNJLFVBWnRJLEdBWW1KOU4sUUFBUUMsUUFBUixDQUFpQixZQUFqQixFQUErQixFQUFDQyxRQUFRa0QsTUFBTWxELE1BQWYsRUFBdUJvRCxJQUFJakQsU0FBM0IsRUFBc0N3RixnQkFBZ0J6QyxNQUFNaEQsTUFBTixDQUFhZSxJQUFuRSxFQUEvQixDQVpuSixHQVk4UCxvQkFaOVAsR0FZcVJpQyxNQUFNaEQsTUFBTixDQUFhZSxJQVpsUyxHQVl5UyxZQVp6UyxHQWFQLFFBYk87QUFjUDtBQUNBLGlEQWZPLEdBZ0JQLG9DQWhCTyxHQWdCK0JpQyxNQUFNekIsR0FoQnJDLEdBZ0IwQyxRQWhCMUMsR0FpQlAsUUFqQk87QUFrQlA7QUFDQSx5REFuQk8sR0FvQlAsNkNBcEJPLEdBb0J3Q3VLLFVBcEJ4QyxHQW9Cb0QsUUFwQnBELEdBcUJQLFFBckJPO0FBc0JQO0FBQ0Esa0RBdkJPLEdBd0JQLHFDQXhCTyxHQXdCZ0MzRCxJQXhCaEMsR0F3QnNDLFFBeEJ0QyxHQXlCUCxRQXpCTztBQTBCUDtBQUNBLGdFQTNCTyxHQTJCZ0RuRixNQUFNRSxFQTNCdEQsR0EyQjJELHFEQTNCM0QsR0E0QlAsdURBNUJPLEdBNkJQLFFBN0JPLEdBOEJQLG9CQTlCSjs7QUFnQ0FoRixjQUFFLDRCQUE0QjhFLE1BQU1FLEVBQXBDLEVBQXdDL0UsTUFBeEMsQ0FBK0M2RixJQUEvQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0E5RixjQUFFLCtDQUErQzhFLE1BQU1FLEVBQXZELEVBQTJEa0csS0FBM0QsQ0FBaUUsWUFBVztBQUN4RSxvQkFBSUMsSUFBSW5MLEVBQUUsSUFBRixDQUFSOztBQUVBMUIscUJBQUt5UixxQkFBTCxDQUEyQmpMLE1BQU1FLEVBQWpDO0FBQ0gsYUFKRDs7QUFNQTtBQUNBaEYsY0FBRXNMLE1BQUYsRUFBVTBFLEVBQVYsQ0FBYSw2REFBYixFQUE0RSxVQUFTQyxDQUFULEVBQVk7QUFDcEYsb0JBQUkvUixXQUFXUCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBbEIsQ0FBMEJuQixRQUF6QztBQUNBLG9CQUFJZ1MsV0FBV2hTLFNBQVMwTSxhQUF4Qjs7QUFFQSxvQkFBSTFNLFNBQVNxTSxXQUFULElBQXdCMkYsU0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixDQUE1QixFQUFxRDtBQUNqRCx3QkFBSWhGLEVBQUUsdUNBQXVDOEUsTUFBTUUsRUFBL0MsRUFBbURtTCxVQUFuRCxFQUFKLEVBQXFFO0FBQ2pFLDRCQUFJbEYsTUFBTWpMLEVBQUUseURBQXlEOEUsTUFBTUUsRUFBakUsQ0FBVjs7QUFFQSw0QkFBSSxDQUFDa0wsU0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QnFMLFlBQTdCLEVBQTJDO0FBQ3ZDcEYsZ0NBQUkzRixJQUFKO0FBQ0E0SyxxQ0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QnFMLFlBQXhCLEdBQXVDLElBQXZDO0FBQ0g7QUFDSixxQkFQRCxNQVFLO0FBQ0QsNEJBQUlwRixRQUFNakwsRUFBRSx5REFBeUQ4RSxNQUFNRSxFQUFqRSxDQUFWOztBQUVBLDRCQUFJa0wsU0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QnFMLFlBQTVCLEVBQTBDO0FBQ3RDcEYsa0NBQUlyRyxJQUFKO0FBQ0FzTCxxQ0FBU3BMLE1BQU1FLEVBQU4sR0FBVyxFQUFwQixFQUF3QnFMLFlBQXhCLEdBQXVDLEtBQXZDO0FBQ0g7QUFDSjtBQUNKO0FBQ0osYUF0QkQ7QUF1QkgsU0Fwa0JJO0FBcWtCTE4sK0JBQXVCLCtCQUFTekwsT0FBVCxFQUFrQjtBQUNyQztBQUNBLGdCQUFJaEcsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCO0FBQ0EsZ0JBQUl6QixPQUFPRCxhQUFhQyxJQUFiLENBQWtCeUIsT0FBN0I7O0FBRUEsZ0JBQUlmLEtBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsQ0FBNEJ0RyxVQUFVLEVBQXRDLEVBQTBDNEksYUFBOUMsRUFBNkQ7QUFDekQ7QUFDQSxvQkFBSW9ELFdBQVdoUyxLQUFLSixRQUFMLENBQWMwTSxhQUFkLENBQTRCdEcsVUFBVSxFQUF0QyxDQUFmO0FBQ0FnTSx5QkFBU25ELFdBQVQsR0FBdUIsQ0FBQ21ELFNBQVNuRCxXQUFqQztBQUNBLG9CQUFJb0QsV0FBV3ZRLEVBQUUsNEJBQTJCc0UsT0FBN0IsQ0FBZjs7QUFFQSxvQkFBSWdNLFNBQVNuRCxXQUFiLEVBQTBCO0FBQ3RCb0QsNkJBQVNDLFNBQVQsQ0FBbUIsR0FBbkI7QUFDQXhRLHNCQUFFc0wsTUFBRixFQUFVbUYsT0FBVixDQUFrQix1QkFBbEI7QUFDSCxpQkFIRCxNQUlLO0FBQ0RGLDZCQUFTRyxPQUFULENBQWlCLEdBQWpCO0FBQ0ExUSxzQkFBRXNMLE1BQUYsRUFBVW1GLE9BQVYsQ0FBa0IsdUJBQWxCO0FBQ0g7QUFDSixhQWRELE1BZUs7QUFDRCxvQkFBSSxDQUFDN1MsS0FBS00sUUFBTCxDQUFjZ0csWUFBbkIsRUFBaUM7QUFDN0J0Ryx5QkFBS00sUUFBTCxDQUFjZ0csWUFBZCxHQUE2QixJQUE3Qjs7QUFFQTtBQUNBbEUsc0JBQUUsNEJBQTRCc0UsT0FBOUIsRUFBdUNyRSxNQUF2QyxDQUE4QyxvQ0FBb0NxRSxPQUFwQyxHQUE4Qyx3Q0FBNUY7O0FBRUE7QUFDQTFHLHlCQUFLOEgsU0FBTCxDQUFlcEIsT0FBZjs7QUFFQTtBQUNBaEcseUJBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsQ0FBNEJ0RyxVQUFVLEVBQXRDLEVBQTBDNEksYUFBMUMsR0FBMEQsSUFBMUQ7QUFDQTVPLHlCQUFLSixRQUFMLENBQWMwTSxhQUFkLENBQTRCdEcsVUFBVSxFQUF0QyxFQUEwQzZJLFdBQTFDLEdBQXdELElBQXhEO0FBQ0g7QUFDSjtBQUNKLFNBeG1CSTtBQXltQkx0SCwrQkFBdUIsK0JBQVN2QixPQUFULEVBQWtCUSxLQUFsQixFQUF5QjtBQUM1QyxnQkFBSXhHLE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3QjtBQUNBLGdCQUFJc1Isc0JBQXNCM1EsRUFBRSw0QkFBMkJzRSxPQUE3QixDQUExQjs7QUFFQTtBQUNBLGdCQUFJNEssaUJBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FBckIsQ0FMNEMsQ0FLTjtBQUN0QyxnQkFBSS9ELElBQUksQ0FBUjtBQU40QztBQUFBO0FBQUE7O0FBQUE7QUFPNUMsc0NBQWlCckcsTUFBTXFLLEtBQXZCLG1JQUE4QjtBQUFBLHdCQUFyQkMsSUFBcUI7O0FBQzFCO0FBQ0F1Qix3Q0FBb0IxUSxNQUFwQixDQUEyQixtREFBa0RxRSxPQUFsRCxHQUEyRCxVQUF0RjtBQUNBLHdCQUFJc00saUJBQWlCNVEsRUFBRSwyQ0FBMENzRSxPQUE1QyxDQUFyQjs7QUFFQTtBQUNBaEcseUJBQUt1UywwQkFBTCxDQUFnQ0QsY0FBaEMsRUFBZ0R4QixJQUFoRCxFQUFzRHRLLE1BQU1nTSxNQUFOLEtBQWlCM0YsQ0FBdkUsRUFBMEVyRyxNQUFNaU0sT0FBaEY7O0FBRUE7QUFDQSx3QkFBSUMsSUFBSSxDQUFSO0FBVDBCO0FBQUE7QUFBQTs7QUFBQTtBQVUxQiwrQ0FBbUI1QixLQUFLL0UsT0FBeEIsd0lBQWlDO0FBQUEsZ0NBQXhCdkksTUFBd0I7O0FBQzdCO0FBQ0F4RCxpQ0FBSzJTLG9CQUFMLENBQTBCM00sT0FBMUIsRUFBbUNRLE1BQU1sRCxNQUF6QyxFQUFpRGdQLGNBQWpELEVBQWlFOU8sTUFBakUsRUFBeUVzTixLQUFLOEIsS0FBOUUsRUFBcUZwTSxNQUFNcU0sS0FBM0YsRUFBa0dILElBQUksQ0FBdEcsRUFBeUc5QixjQUF6Rzs7QUFFQSxnQ0FBSXBOLE9BQU9pQyxLQUFQLEdBQWUsQ0FBbkIsRUFBc0I7QUFDbEIsb0NBQUlzTCxjQUFjdk4sT0FBT2lDLEtBQVAsR0FBZSxDQUFqQztBQUNBbUwsK0NBQWVHLFdBQWY7QUFDSDs7QUFFRDJCO0FBQ0g7QUFwQnlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBc0IxQjdGO0FBQ0g7QUE5QjJDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUErQi9DLFNBeG9CSTtBQXlvQkwwRixvQ0FBNEIsb0NBQVM3SyxTQUFULEVBQW9Cb0osSUFBcEIsRUFBMEIwQixNQUExQixFQUFrQ0MsT0FBbEMsRUFBMkM7QUFDbkUsZ0JBQUl6UyxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUE7QUFDQSxnQkFBSStSLFVBQVdOLE1BQUQsR0FBWSwrQ0FBWixHQUFnRSw2Q0FBOUU7O0FBRUE7QUFDQSxnQkFBSU8sT0FBTyxFQUFYO0FBQ0EsZ0JBQUlOLE9BQUosRUFBYTtBQUNUTSx3QkFBUSxRQUFSO0FBRFM7QUFBQTtBQUFBOztBQUFBO0FBRVQsMkNBQWdCakMsS0FBS2lDLElBQXJCLHdJQUEyQjtBQUFBLDRCQUFsQkMsR0FBa0I7O0FBQ3ZCRCxnQ0FBUSx5REFBeURDLElBQUk5SixJQUE3RCxHQUFvRSxtQ0FBcEUsR0FBMEdyQixXQUExRyxHQUF3SG1MLElBQUkxSCxLQUE1SCxHQUFtSSxlQUEzSTtBQUNIO0FBSlE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtaOztBQUVELGdCQUFJOUQsT0FBTztBQUNQO0FBQ0Esc0RBRk8sR0FHUHNMLE9BSE8sR0FJUCxRQUpPO0FBS1A7QUFDQSxvREFOTyxHQU9QaEMsS0FBS21DLEtBUEUsR0FRUCxRQVJPO0FBU1A7QUFDQSxtREFWTyxHQVdQRixJQVhPLEdBWVAsUUFaTztBQWFQO0FBQ0EsMkRBZE87QUFlUDtBQUNBLDBFQWhCTztBQWlCUDtBQUNBLGtGQWxCTyxHQW1CUGpDLEtBQUt4UCxHQUFMLENBQVM0UixHQUFULENBQWE3SyxNQW5CTixHQW9CUCxlQXBCTyxHQXFCUCxRQXJCSjs7QUF1QkFYLHNCQUFVL0YsTUFBVixDQUFpQjZGLElBQWpCO0FBQ0gsU0FockJJO0FBaXJCTG1MLDhCQUFzQiw4QkFBUzNNLE9BQVQsRUFBa0JtTixXQUFsQixFQUErQnpMLFNBQS9CLEVBQTBDbEUsTUFBMUMsRUFBa0Q0UCxTQUFsRCxFQUE2REMsVUFBN0QsRUFBeUVDLE9BQXpFLEVBQWtGMUMsY0FBbEYsRUFBa0c7QUFDcEgsZ0JBQUk1USxPQUFPWCxhQUFhK0IsSUFBYixDQUFrQkwsT0FBN0I7O0FBRUE7QUFDQSxnQkFBSXdTLGdCQUFnQnZULEtBQUtKLFFBQUwsQ0FBYzBNLGFBQWQsQ0FBNEJ0RyxVQUFVLEVBQXRDLEVBQTBDOEksV0FBOUQ7O0FBRUE7QUFDQSxnQkFBSWEsVUFBVSxTQUFWQSxPQUFVLENBQVNDLFVBQVQsRUFBcUI7QUFDL0Isb0JBQUlDLElBQUksRUFBUjs7QUFFQSxvQkFBSUQsVUFBSixFQUFnQjtBQUNaQyx3QkFBSSxrQkFBSjtBQUNILGlCQUZELE1BR0s7QUFDREEsd0JBQUksWUFBSjtBQUNIOztBQUVELHVCQUFPQSxDQUFQO0FBQ0gsYUFYRDs7QUFhQSxnQkFBSUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTRixVQUFULEVBQXFCRyxJQUFyQixFQUEyQjtBQUMzQyxvQkFBSUMsSUFBSSxFQUFSOztBQUVBLG9CQUFJSixVQUFKLEVBQWdCO0FBQ1osd0JBQUlHLE9BQU8sQ0FBWCxFQUFjO0FBQ1YsNEJBQUlFLE9BQU9wSSxjQUFjLG1CQUF6QjtBQUNBbUksNkJBQUssdUtBQXVLRCxJQUF2SyxHQUE4SyxZQUE5SyxHQUE2TEEsSUFBN0wsR0FBb00sWUFBcE0sR0FBbU5FLElBQW5OLEdBQTBOLFdBQS9OO0FBQ0g7QUFDSjs7QUFFRCx1QkFBT0QsQ0FBUDtBQUNILGFBWEQ7O0FBYUE7QUFDQSxnQkFBSXdELGFBQWEsRUFBakI7QUFDQSxnQkFBSXZDLFVBQVUsRUFBZDtBQUNBLGdCQUFJek4sT0FBT2tELEVBQVAsS0FBYzZNLGFBQWxCLEVBQWlDO0FBQzdCdEMsMEJBQVUsOENBQVY7QUFDSCxhQUZELE1BR0s7QUFDREEsMEJBQVUsa0NBQWlDdEIsUUFBUW5NLE9BQU8wTixRQUFmLENBQWpDLEdBQTJELFVBQTNELEdBQXdFOU4sUUFBUUMsUUFBUixDQUFpQixRQUFqQixFQUEyQixFQUFDQyxRQUFRNlAsV0FBVCxFQUFzQnpNLElBQUlsRCxPQUFPa0QsRUFBakMsRUFBM0IsQ0FBeEUsR0FBMkksb0JBQXJKO0FBQ0g7QUFDRDhNLDBCQUFjMUQsY0FBY3RNLE9BQU8wTixRQUFyQixFQUErQixFQUEvQixJQUFxQ0QsT0FBckMsR0FBK0N6TixPQUFPMEYsSUFBdEQsR0FBNkQsTUFBM0U7O0FBRUE7QUFDQSxnQkFBSXdHLFFBQVFsTSxPQUFPa00sS0FBbkI7QUFDQSxnQkFBSVEsWUFBWSxFQUFoQjtBQUNBLGdCQUFJUixNQUFNVSxNQUFWLEVBQWtCO0FBQ2RGLDRCQUFZLHVKQUNOUixNQUFNeEcsSUFEQSxHQUNPLGFBRFAsR0FDdUJ3RyxNQUFNVyxXQUQ3QixHQUMyQywwQ0FEM0MsR0FFTnhJLFdBRk0sR0FFUTZILE1BQU1wRSxLQUZkLEdBRXNCLEdBRnRCLEdBRTJCOEgsU0FGM0IsR0FFc0MscUJBRmxEO0FBR0g7O0FBRUQ7QUFDQSxnQkFBSTlDLGNBQWMsRUFBbEI7QUFDQSxpQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksQ0FBcEIsRUFBdUJBLEdBQXZCLEVBQTRCO0FBQ3hCRCwrQkFBZSxpQ0FBZjs7QUFFQSxvQkFBSTlNLE9BQU9nTixPQUFQLENBQWVqUSxNQUFmLEdBQXdCZ1EsQ0FBNUIsRUFBK0I7QUFDM0Isd0JBQUlFLFNBQVNqTixPQUFPZ04sT0FBUCxDQUFlRCxDQUFmLENBQWI7O0FBRUFELG1DQUFlLHlEQUF5RHRRLEtBQUswUSxhQUFMLENBQW1CRCxPQUFPdkgsSUFBMUIsRUFBZ0N1SCxPQUFPSixXQUF2QyxDQUF6RCxHQUErRyxxQ0FBL0csR0FBdUp4SSxXQUF2SixHQUFxSzRJLE9BQU9uRixLQUE1SyxHQUFtTCxlQUFsTTtBQUNIOztBQUVEZ0YsK0JBQWUsUUFBZjtBQUNIOztBQUVEO0FBQ0EsZ0JBQUl1QyxRQUFRclAsT0FBT3FQLEtBQW5COztBQUVBLGdCQUFJMUosVUFBVSxrQkFBZDtBQUNBLGdCQUFJMEosTUFBTXpKLE9BQU4sSUFBaUIsQ0FBckIsRUFBd0I7QUFDcEJELDBCQUFVLHVCQUFWO0FBQ0g7QUFDRCxnQkFBSTBKLE1BQU16SixPQUFOLElBQWlCLENBQXJCLEVBQXdCO0FBQ3BCRCwwQkFBVSx3QkFBVjtBQUNIOztBQUVELGdCQUFJc0ssa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFVdlQsR0FBVixFQUFld1QsSUFBZixFQUFxQjtBQUN2Qyx1QkFBT3hULE1BQUssTUFBTCxHQUFhd1QsSUFBcEI7QUFDSCxhQUZEOztBQUlBLGdCQUFJQyxXQUFXLENBQ1gsRUFBQ0MsS0FBSyxhQUFOLEVBQXFCQyxPQUFPLFlBQTVCLEVBQTBDQyxPQUFPLENBQWpELEVBQW9EQyxPQUFPLEVBQTNELEVBQStEQyxjQUFjLEVBQTdFLEVBQWlGeE0sTUFBTSxFQUF2RixFQUEyRjlFLFNBQVMsYUFBcEcsRUFEVyxFQUVYLEVBQUNrUixLQUFLLGNBQU4sRUFBc0JDLE9BQU8sYUFBN0IsRUFBNENDLE9BQU8sQ0FBbkQsRUFBc0RDLE9BQU8sRUFBN0QsRUFBaUVDLGNBQWMsRUFBL0UsRUFBbUZ4TSxNQUFNLEVBQXpGLEVBQTZGOUUsU0FBUyxjQUF0RyxFQUZXLEVBR1gsRUFBQ2tSLEtBQUssWUFBTixFQUFvQkMsT0FBTyxXQUEzQixFQUF3Q0MsT0FBTyxDQUEvQyxFQUFrREMsT0FBTyxFQUF6RCxFQUE2REMsY0FBYyxFQUEzRSxFQUErRXhNLE1BQU0sRUFBckYsRUFBeUY5RSxTQUFTLGtCQUFsRyxFQUhXLEVBSVgsRUFBQ2tSLEtBQUssU0FBTixFQUFpQkMsT0FBTyxTQUF4QixFQUFtQ0MsT0FBTyxDQUExQyxFQUE2Q0MsT0FBTyxFQUFwRCxFQUF3REMsY0FBYyxFQUF0RSxFQUEwRXhNLE1BQU0sRUFBaEYsRUFBb0Y5RSxTQUFTLFNBQTdGLEVBSlcsRUFLWCxFQUFDa1IsS0FBSyxjQUFOLEVBQXNCQyxPQUFPLGFBQTdCLEVBQTRDQyxPQUFPLENBQW5ELEVBQXNEQyxPQUFPLEVBQTdELEVBQWlFQyxjQUFjLEVBQS9FLEVBQW1GeE0sTUFBTSxFQUF6RixFQUE2RjlFLFNBQVMsY0FBdEcsRUFMVyxFQU1YLEVBQUNrUixLQUFLLGFBQU4sRUFBcUJDLE9BQU8sWUFBNUIsRUFBMENDLE9BQU8sQ0FBakQsRUFBb0RDLE9BQU8sRUFBM0QsRUFBK0RDLGNBQWMsRUFBN0UsRUFBaUZ4TSxNQUFNLEVBQXZGLEVBQTJGOUUsU0FBUyx5QkFBcEcsRUFOVyxDQUFmOztBQWxGb0g7QUFBQTtBQUFBOztBQUFBO0FBMkZwSCx1Q0FBYWlSLFFBQWIsd0lBQXVCO0FBQWxCTSx3QkFBa0I7O0FBQ25CLHdCQUFJQyxNQUFNYixXQUFXWSxLQUFLTCxHQUFoQixFQUFxQixLQUFyQixDQUFWOztBQUVBLHdCQUFJTyxpQkFBaUIsQ0FBckI7QUFDQSx3QkFBSUQsTUFBTSxDQUFWLEVBQWE7QUFDVEMseUNBQWtCdEIsTUFBTW9CLEtBQUtMLEdBQUwsR0FBVyxNQUFqQixLQUE0Qk0sTUFBTSxJQUFsQyxDQUFELEdBQTRDLEtBQTdEO0FBQ0g7O0FBRURELHlCQUFLSCxLQUFMLEdBQWFLLGNBQWI7O0FBRUFGLHlCQUFLRixLQUFMLEdBQWFsQixNQUFNb0IsS0FBS0wsR0FBWCxDQUFiO0FBQ0FLLHlCQUFLRCxZQUFMLEdBQW9CQyxLQUFLRixLQUF6QjtBQUNBLHdCQUFJbEIsTUFBTW9CLEtBQUtMLEdBQUwsR0FBVyxNQUFqQixLQUE0QixDQUFoQyxFQUFtQztBQUMvQkssNkJBQUtELFlBQUwsR0FBb0IsNkNBQTZDQyxLQUFLRixLQUFsRCxHQUEwRCxTQUE5RTtBQUNIOztBQUVERSx5QkFBS3ZSLE9BQUwsR0FBZStRLGdCQUFnQlEsS0FBS0YsS0FBckIsRUFBNEJFLEtBQUt2UixPQUFqQyxDQUFmOztBQUVBdVIseUJBQUt6TSxJQUFMLEdBQVkseURBQXlEeU0sS0FBS3ZSLE9BQTlELEdBQXdFLDZEQUF4RSxHQUF1SXVSLEtBQUtKLEtBQTVJLEdBQW1KLG9DQUFuSixHQUF5TEksS0FBS0gsS0FBOUwsR0FBcU0sNkNBQXJNLEdBQW9QRyxLQUFLRCxZQUF6UCxHQUF1USxxQkFBblI7QUFDSDs7QUFFRDtBQWhIb0g7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpSHBILGdCQUFJSSxlQUFlLEtBQW5CO0FBQ0EsZ0JBQUlDLGlCQUFpQixFQUFyQjtBQUNBLGdCQUFJN1EsT0FBT2xDLEdBQVAsQ0FBV2dULEtBQVgsSUFBb0IsQ0FBeEIsRUFBMkI7QUFDdkJGLCtCQUFlLEtBQWY7QUFDQUMsaUNBQWlCLEdBQWpCO0FBQ0g7QUFDRCxnQkFBSUUsV0FBVy9RLE9BQU9sQyxHQUFQLENBQVcwRyxJQUFYLEdBQWlCLEdBQWpCLEdBQXNCeEUsT0FBT2xDLEdBQVAsQ0FBVzRHLElBQWpDLEdBQXVDLG9DQUF2QyxHQUE2RWtNLFlBQTdFLEdBQTJGLEtBQTNGLEdBQWtHQyxjQUFsRyxHQUFtSDdRLE9BQU9sQyxHQUFQLENBQVdnVCxLQUE5SCxHQUFxSSxVQUFwSjs7QUFFQTtBQUNBLGdCQUFJN08sUUFBUSxFQUFaO0FBQ0EsZ0JBQUlnSixnQkFBZ0J6TyxLQUFLSixRQUFMLENBQWMwTSxhQUFkLENBQTRCdEcsVUFBVSxFQUF0QyxFQUEwQ3lJLGFBQTlEO0FBQ0EsZ0JBQUlqTCxPQUFPaUMsS0FBUCxHQUFlLENBQW5CLEVBQXNCO0FBQ2xCLG9CQUFJc0wsY0FBY3ZOLE9BQU9pQyxLQUFQLEdBQWUsQ0FBakM7QUFDQSxvQkFBSXVMLGFBQWF2QyxjQUFjc0MsV0FBZCxDQUFqQjs7QUFFQXRMLHdCQUFRLCtDQUE4Q3VMLFVBQTlDLEdBQTBELFVBQWxFOztBQUVBLG9CQUFJSixlQUFlRyxXQUFmLElBQThCLENBQWxDLEVBQXFDO0FBQ2pDdEwsNkJBQVMsNERBQTJEdUwsVUFBM0QsR0FBdUUsVUFBaEY7QUFDSDtBQUNKOztBQUVEO0FBQ0EsZ0JBQUl4SixPQUFPLHFDQUFvQzhMLE9BQXBDLEdBQTZDLElBQTdDO0FBQ1g7QUFDQTdOLGlCQUZXO0FBR1g7QUFDQSx1REFKVyxHQUtYLDJFQUxXLEdBS21FakMsT0FBT2UsSUFMMUUsR0FLaUYsbUNBTGpGLEdBS3NIZixPQUFPZ1IsVUFMN0gsR0FLeUksNENBTHpJLEdBS3dMM00sV0FMeEwsR0FLc01yRSxPQUFPd0YsVUFMN00sR0FLeU4sZUFMek4sR0FNWCxRQU5XO0FBT1g7QUFDQSx3REFSVyxHQVNYd0ssVUFUVyxHQVVYLFFBVlc7QUFXWDtBQUNBLG1EQVpXLEdBYVh0RCxTQWJXLEdBY1gsUUFkVztBQWVYO0FBQ0EsMkZBaEJXLEdBaUJYSSxXQWpCVyxHQWtCWCxjQWxCVztBQW1CWDtBQUNBLGlEQXBCVyxHQXFCWCxvSUFyQlcsR0FzQlR1QyxNQUFNeEIsS0F0QkcsR0FzQkssNkNBdEJMLEdBc0JxRHdCLE1BQU12QixNQXRCM0QsR0FzQm9FLFlBdEJwRSxHQXNCbUZ1QixNQUFNdEIsT0F0QnpGLEdBc0JtRyxlQXRCbkcsR0F1QlgsNEtBdkJXLEdBdUJtS3BJLE9BdkJuSyxHQXVCNEssSUF2QjVLLEdBdUJtTDBKLE1BQU14SixHQXZCekwsR0F1QitMLGdDQXZCL0wsR0F3QlgsUUF4Qlc7QUF5Qlg7QUFDQSwyREExQlcsR0EyQlhzSyxTQUFTLENBQVQsRUFBWW5NLElBM0JELEdBNEJYbU0sU0FBUyxDQUFULEVBQVluTSxJQTVCRCxHQTZCWG1NLFNBQVMsQ0FBVCxFQUFZbk0sSUE3QkQsR0E4QlgsUUE5Qlc7QUErQlg7QUFDQSwyREFoQ1csR0FpQ1htTSxTQUFTLENBQVQsRUFBWW5NLElBakNELEdBa0NYbU0sU0FBUyxDQUFULEVBQVluTSxJQWxDRCxHQW1DWG1NLFNBQVMsQ0FBVCxFQUFZbk0sSUFuQ0QsR0FvQ1gsUUFwQ1c7QUFxQ1g7QUFDQSxpREF0Q1csR0F1Q1gsMkdBdkNXLEdBdUNrRytNLFFBdkNsRyxHQXVDNEcsa0NBdkM1RyxHQXVDZ0oxTSxXQXZDaEosR0F1QzhKLHdCQXZDOUosR0F1Q3lMckUsT0FBT2xDLEdBQVAsQ0FBVzBHLElBdkNwTSxHQXVDME0sd0NBdkMxTSxHQXVDb1B4RSxPQUFPbEMsR0FBUCxDQUFXNEcsSUF2Qy9QLEdBdUNxUSxjQXZDclEsR0F3Q1gsUUF4Q1csR0F5Q1gsUUF6Q0E7O0FBMkNBUixzQkFBVS9GLE1BQVYsQ0FBaUI2RixJQUFqQjtBQUNILFNBcjJCSTtBQXMyQkxOLDRCQUFvQiw4QkFBVztBQUMzQixnQkFBSWxILE9BQU9YLGFBQWErQixJQUFiLENBQWtCTCxPQUE3Qjs7QUFFQWYsaUJBQUtKLFFBQUwsQ0FBY3NNLG9CQUFkLEdBQXFDLEtBQXJDO0FBQ0F4SyxjQUFFLDZCQUFGLEVBQWlDd0IsTUFBakM7QUFDSCxTQTMyQkk7QUE0MkJMK0QsOEJBQXNCLGdDQUFXO0FBQzdCLGdCQUFJakgsT0FBT1gsYUFBYStCLElBQWIsQ0FBa0JMLE9BQTdCO0FBQ0EsZ0JBQUl6QixPQUFPRCxhQUFhQyxJQUFiLENBQWtCeUIsT0FBN0I7O0FBRUFmLGlCQUFLa0gsa0JBQUw7O0FBRUEsZ0JBQUl1TixhQUFhLGlFQUFqQjs7QUFFQS9TLGNBQUUsNkJBQUYsRUFBaUNDLE1BQWpDLENBQXdDOFMsVUFBeEM7O0FBRUEvUyxjQUFFLDZCQUFGLEVBQWlDa0wsS0FBakMsQ0FBdUMsWUFBVztBQUM5QyxvQkFBSSxDQUFDdE4sS0FBS00sUUFBTCxDQUFjQyxPQUFuQixFQUE0QjtBQUN4QlAseUJBQUtNLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQSx3QkFBSWdOLElBQUluTCxFQUFFLElBQUYsQ0FBUjs7QUFFQW1MLHNCQUFFckYsSUFBRixDQUFPLG1EQUFQOztBQUVBbkksaUNBQWFDLElBQWIsQ0FBa0J5QixPQUFsQixDQUEwQkYsSUFBMUI7QUFDSDtBQUNKLGFBVkQ7O0FBWUFiLGlCQUFLSixRQUFMLENBQWNzTSxvQkFBZCxHQUFxQyxJQUFyQztBQUNILFNBbjRCSTtBQW80QkxpRiw0QkFBb0IsNEJBQVNsQyxHQUFULEVBQWM7QUFDOUIsZ0JBQUlBLEdBQUosRUFBUztBQUNMLHVCQUFPLHVCQUFQO0FBQ0gsYUFGRCxNQUdLO0FBQ0QsdUJBQU8sd0JBQVA7QUFDSDtBQUNKLFNBMzRCSTtBQTQ0Qkx5Qix1QkFBZSx1QkFBU3hILElBQVQsRUFBZXdLLElBQWYsRUFBcUI7QUFDaEMsbUJBQU8sNkNBQTZDeEssSUFBN0MsR0FBb0QsYUFBcEQsR0FBb0V3SyxJQUEzRTtBQUNIO0FBOTRCSTtBQS9ZTyxDQUFwQjs7QUFreUNBaFMsRUFBRWdULFFBQUYsRUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCalQsTUFBRWtULEVBQUYsQ0FBS0MsWUFBTCxDQUFrQkMsUUFBbEIsR0FBNkIsTUFBN0IsQ0FEeUIsQ0FDWTs7QUFFckM7QUFDQXBULE1BQUVrVCxFQUFGLENBQUsvQyxVQUFMLEdBQWtCLFlBQVU7QUFDeEIsWUFBSWtELE1BQU1yVCxFQUFFc0wsTUFBRixDQUFWOztBQUVBLFlBQUlnSSxVQUFVLEdBQWQ7O0FBRUEsWUFBSUMsV0FBVztBQUNYQyxpQkFBTUgsSUFBSUksU0FBSixLQUFrQkgsT0FEYjtBQUVYSSxrQkFBT0wsSUFBSU0sVUFBSixLQUFtQkw7QUFGZixTQUFmO0FBSUFDLGlCQUFTSyxLQUFULEdBQWlCTCxTQUFTRyxJQUFULEdBQWdCTCxJQUFJakIsS0FBSixFQUFoQixHQUErQixJQUFJa0IsT0FBcEQ7QUFDQUMsaUJBQVNNLE1BQVQsR0FBa0JOLFNBQVNDLEdBQVQsR0FBZUgsSUFBSVMsTUFBSixFQUFmLEdBQStCLElBQUlSLE9BQXJEOztBQUVBLFlBQUlTLFNBQVMsS0FBS2xULE1BQUwsRUFBYjs7QUFFQSxZQUFJLENBQUNrVCxNQUFMLEVBQWEsT0FBTyxLQUFQLENBZFcsQ0FjRzs7QUFFM0JBLGVBQU9ILEtBQVAsR0FBZUcsT0FBT0wsSUFBUCxHQUFjLEtBQUtNLFVBQUwsRUFBN0I7QUFDQUQsZUFBT0YsTUFBUCxHQUFnQkUsT0FBT1AsR0FBUCxHQUFhLEtBQUtTLFdBQUwsRUFBN0I7O0FBRUEsZUFBUSxFQUFFVixTQUFTSyxLQUFULEdBQWlCRyxPQUFPTCxJQUF4QixJQUFnQ0gsU0FBU0csSUFBVCxHQUFnQkssT0FBT0gsS0FBdkQsSUFBZ0VMLFNBQVNNLE1BQVQsR0FBa0JFLE9BQU9QLEdBQXpGLElBQWdHRCxTQUFTQyxHQUFULEdBQWVPLE9BQU9GLE1BQXhILENBQVI7QUFDSCxLQXBCRDs7QUFzQkE7QUFDQSxRQUFJOVUsVUFBVTJDLFFBQVFDLFFBQVIsQ0FBaUIsNEJBQWpCLEVBQStDLEVBQUNDLFFBQVFDLGFBQVQsRUFBd0JDLFFBQVFDLFNBQWhDLEVBQS9DLENBQWQ7O0FBRUEsUUFBSS9DLGNBQWMsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQjtBQUNBLFFBQUlrVixhQUFhdlcsYUFBYUMsSUFBYixDQUFrQkssTUFBbkM7O0FBRUE7QUFDQVEsb0JBQWdCMFYsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDblYsV0FBeEM7QUFDQWtWLGVBQVdwVixZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQWdCLE1BQUUsd0JBQUYsRUFBNEJnUSxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTb0UsS0FBVCxFQUFnQjtBQUNyRDNWLHdCQUFnQjBWLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q25WLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBZ0IsTUFBRSxHQUFGLEVBQU9nUSxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0MsQ0FBVCxFQUFZO0FBQ3hDaUUsbUJBQVdwVixZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0E3Q0QsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLjAyYzAzNzBlZWQ3YTMwNjMwMGY4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgOWMwMmQwNGMzYzAwNDhjNTAxNGEiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcbiAgICAgICAgbGV0IGFqYXhfbWF0Y2hlcyA9IGFqYXgubWF0Y2hlcztcclxuICAgICAgICBsZXQgYWpheF90b3BoZXJvZXMgPSBhamF4LnRvcGhlcm9lcztcclxuICAgICAgICBsZXQgYWpheF9wYXJ0aWVzID0gYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21tciA9IGRhdGEubW1yO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcG1hcHMgPSBkYXRhLnRvcG1hcHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8tLSBJbml0aWFsIE1hdGNoZXMgRmlyc3QgTG9hZFxyXG4gICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWxvYWRlcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBsYXllcmxvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtM3ggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21tciA9IGpzb24ubW1yO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21tci5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X3RvcGhlcm9lcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X3BhcnRpZXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogTU1SXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21tci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tbXIuZ2VuZXJhdGVNTVJDb250YWluZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21tci5nZW5lcmF0ZU1NUkJhZGdlcyhqc29uX21tcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgbWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMuaW50ZXJuYWwubGltaXQgPSBqc29uLmxpbWl0cy5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9hZCBpbml0aWFsIG1hdGNoIHNldFxyXG4gICAgICAgICAgICAgICAgYWpheF9tYXRjaGVzLmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBUb3AgSGVyb2VzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXhfdG9waGVyb2VzLmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBQYXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXhfcGFydGllcy5sb2FkKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBsYXllcmxvYWRlci1wcm9jZXNzaW5nJykuZmFkZUluKCkuZGVsYXkoMjUwKS5xdWV1ZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfdG9waGVyb2VzXCIsIHtcclxuICAgICAgICAgICAgcmVnaW9uOiBwbGF5ZXJfcmVnaW9uLFxyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgVG9wIEhlcm9lcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcGhlcm9lcyA9IGRhdGEudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBkYXRhX3RvcG1hcHMgPSBkYXRhLnRvcG1hcHM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBUb3AgSGVyb2VzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXBzID0ganNvbi5tYXBzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcGhlcm9lcy5nZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lcihqc29uLm1hdGNoZXNfd2lucmF0ZSwganNvbi5tYXRjaGVzX3dpbnJhdGVfcmF3LCBqc29uLm1hdGNoZXNfcGxheWVkLCBqc29uLm12cF9tZWRhbHNfcGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcEhlcm9lc1RhYmxlID0gZGF0YV90b3BoZXJvZXMuZ2V0VG9wSGVyb2VzVGFibGVDb25maWcoanNvbl9oZXJvZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wSGVyb2VzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmluaXRUb3BIZXJvZXNUYWJsZSh0b3BIZXJvZXNUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFRvcCBNYXBzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3BNYXBzVGFibGUgPSBkYXRhX3RvcG1hcHMuZ2V0VG9wTWFwc1RhYmxlQ29uZmlnKGpzb25fbWFwcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hcCBvZiBqc29uX21hcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wTWFwc1RhYmxlLmRhdGEucHVzaChkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhKG1hcCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmluaXRUb3BNYXBzVGFibGUodG9wTWFwc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgucGFydGllcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5wYXJ0aWVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcGFydGllc1wiLCB7XHJcbiAgICAgICAgICAgIHJlZ2lvbjogcGxheWVyX3JlZ2lvbixcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFBhcnRpZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfcGFydGllcyA9IGRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFBhcnRpZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9wYXJ0aWVzID0ganNvbi5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fcGFydGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc0NvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydGllc1RhYmxlID0gZGF0YV9wYXJ0aWVzLmdldFBhcnRpZXNUYWJsZUNvbmZpZyhqc29uX3BhcnRpZXMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0eSBvZiBqc29uX3BhcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc1RhYmxlLmRhdGEucHVzaChkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzVGFibGVEYXRhKHBhcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuaW5pdFBhcnRpZXNUYWJsZShwYXJ0aWVzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogMTAsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICByZWdpb246IHBsYXllcl9yZWdpb24sXHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHNlbGYuaW50ZXJuYWwub2Zmc2V0LFxyXG4gICAgICAgICAgICBsaW1pdDogc2VsZi5pbnRlcm5hbC5saW1pdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZU1hdGNoVXJsOiBmdW5jdGlvbihtYXRjaF9pZCkge1xyXG4gICAgICAgIHJldHVybiBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9tYXRjaFwiLCB7XHJcbiAgICAgICAgICAgIG1hdGNoaWQ6IG1hdGNoX2lkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIGxldCBkaXNwbGF5TWF0Y2hMb2FkZXIgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vRW5zdXJlIGRpc2FibGVkIGRlZmF1bHQgc29jaWFsIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcuc29jaWFsLXBhbmUnKS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vRW5zdXJlIGNvbnRyb2wgcGFuZWxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udHJvbFBhbmVsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBvZmZzZXRcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IGpzb25fb2Zmc2V0cy5tYXRjaGVzICsgc2VsZi5pbnRlcm5hbC5saW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgbmV3IE1hdGNoIHdpZGdldHMgZm9yIG1hdGNoZXMgdGhhdCBhcmVuJ3QgaW4gdGhlIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YV9tYXRjaGVzLmlzTWF0Y2hHZW5lcmF0ZWQobWF0Y2guaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVNYXRjaChtYXRjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vVXBkYXRlIENvbnRyb2wgUGFuZWwgZ3JhcGhzIGFmdGVyIG1hdGNoIGdlbmVyYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZ3JhcGhkYXRhX3dpbnJhdGUgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5pbnRlcm5hbC5jaGFydGRhdGFfd2lucmF0ZVtcIldcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5pbnRlcm5hbC5jaGFydGRhdGFfd2lucmF0ZVtcIkxcIl1cclxuICAgICAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy51cGRhdGVHcmFwaFJlY2VudE1hdGNoZXNXaW5yYXRlKGdyYXBoZGF0YV93aW5yYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9TZXQgZGlzcGxheU1hdGNoTG9hZGVyIGlmIHdlIGdvdCBhcyBtYW55IG1hdGNoZXMgYXMgd2UgYXNrZWQgZm9yXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPj0gc2VsZi5pbnRlcm5hbC5saW1pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWF0Y2hMb2FkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNlbGYuaW50ZXJuYWwub2Zmc2V0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTm9NYXRjaGVzTWVzc2FnZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0Vuc3VyZSBiYWNrdXAgc29jaWFsIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcuc29jaWFsLXBhbmUnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db250cm9sIFBhbmVsIG1hdGNoIGxvYWRlclxyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlQ29udHJvbFBhbmVsTWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1JlbW92ZSBpbml0aWFsIGxvYWRcclxuICAgICAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB0aGUgbWF0Y2ggb2YgZ2l2ZW4gaWQgdG8gYmUgZGlzcGxheWVkIHVuZGVyIG1hdGNoIHNpbXBsZXdpZGdldFxyXG4gICAgICovXHJcbiAgICBsb2FkTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9IHNlbGYuZ2VuZXJhdGVNYXRjaFVybChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZ1bGxtYXRjaC1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC5tYXRjaHVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2ggPSBqc29uLm1hdGNoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZUZ1bGxNYXRjaFJvd3MobWF0Y2hpZCwganNvbl9tYXRjaCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5mdWxsbWF0Y2gtcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuZGF0YSA9IHtcclxuICAgIG1tcjoge1xyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLW1tci1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLW1tci1jb250YWluZXJcIiBjbGFzcz1cInBsLW1tci1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBtYXJnaW4tYm90dG9tLXNwYWNlci0xIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtbW1yLWNvbnRhaW5lci1mcmFtZScpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SQmFkZ2VzOiBmdW5jdGlvbihtbXJzKSB7XHJcbiAgICAgICAgICAgIHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tbXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gJCgnI3BsLW1tci1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG1tciBvZiBtbXJzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlTU1SQmFkZ2UoY29udGFpbmVyLCBtbXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUkJhZGdlOiBmdW5jdGlvbihjb250YWluZXIsIG1tcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1tcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBtbXJHYW1lVHlwZUltYWdlID0gJzxpbWcgY2xhc3M9XCJwbC1tbXItYmFkZ2UtZ2FtZVR5cGVJbWFnZVwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL2dhbWVUeXBlX2ljb25fJyArIG1tci5nYW1lVHlwZV9pbWFnZSArJy5wbmdcIj4nO1xyXG4gICAgICAgICAgICBsZXQgbW1yaW1nID0gJzxpbWcgY2xhc3M9XCJwbC1tbXItYmFkZ2UtaW1hZ2VcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9yYW5rZWRfcGxheWVyX2ljb25fJyArIG1tci5yYW5rICsnLnBuZ1wiPic7XHJcbiAgICAgICAgICAgIGxldCBtbXJ0aWVyID0gJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtdGllclwiPicrIG1tci50aWVyICsnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2VcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIEdhbWVUeXBlIEltYWdlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS1nYW1lVHlwZUltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1yR2FtZVR5cGVJbWFnZSArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBJbWFnZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJpbWcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgVGllclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1tbXItYmFkZ2UtdGllci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tcnRpZXIgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgVG9vbHRpcCBBcmVhXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS10b29sdGlwLWFyZWFcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInKyBzZWxmLmdlbmVyYXRlTU1SVG9vbHRpcChtbXIpICsnXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1NUlRvb2x0aXA6IGZ1bmN0aW9uKG1tcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXY+JysgbW1yLmdhbWVUeXBlICsnPC9kaXY+PGRpdj4nKyBtbXIucmF0aW5nICsnPC9kaXY+PGRpdj4nKyBtbXIucmFuayArJyAnKyBtbXIudGllciArJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvcGhlcm9lczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGhlcm9MaW1pdDogNSwgLy9Ib3cgbWFueSBoZXJvZXMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyOiBmdW5jdGlvbih3aW5yYXRlLCB3aW5yYXRlX3JhdywgbWF0Y2hlc3BsYXllZCwgbXZwcGVyY2VudCkge1xyXG4gICAgICAgICAgICAvL0dvb2Qgd2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZSc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlVGV4dCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+PGRpdiBjbGFzcz1cImQtaW5saW5lLWJsb2NrIHRvcGhlcm9lcy1pbmxpbmUtd2lucmF0ZSAnKyBnb29kd2lucmF0ZSArJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hlc3BsYXllZGNvbnRhaW5lciA9ICc8ZGl2IGNsYXNzPVwicGwtdG9waGVyb2VzLW1hdGNoZXNwbGF5ZWQtY29udGFpbmVyIHRvcGhlcm9lcy1zcGVjaWFsLWRhdGFcIj48c3BhbiBjbGFzcz1cInRvcGhlcm9lcy1zcGVjaWFsLWRhdGEtbGFiZWxcIj5QbGF5ZWQ6PC9zcGFuPiAnKyBtYXRjaGVzcGxheWVkICsnICgnKyB3aW5yYXRlVGV4dCArJyk8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG12cHBlcmNlbnRjb250YWluZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcGhlcm9lcy1tdnBwZXJjZW50LWNvbnRhaW5lciB0b3BoZXJvZXMtc3BlY2lhbC1kYXRhXCI+PGltZyBjbGFzcz1cInBsLXRvcGhlcm9lcy1tdnBwZXJjZW50LWltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKydzdG9ybV91aV9zY29yZXNjcmVlbl9tdnBfbXZwX2JsdWUucG5nXCI+PHNwYW4gY2xhc3M9XCJ0b3BoZXJvZXMtc3BlY2lhbC1kYXRhLWxhYmVsXCI+TVZQOjwvc3Bhbj4gJysgbXZwcGVyY2VudCArJyU8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXRvcGhlcm9lcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hdGNoZXNwbGF5ZWRjb250YWluZXIgK1xyXG4gICAgICAgICAgICAgICAgbXZwcGVyY2VudGNvbnRhaW5lciArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC10b3BoZXJvZXMtY29udGFpbmVyLWZyYW1lJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGE6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogSGVyb1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbGV0IGhlcm9maWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtaGVyb3BhbmVcIj48ZGl2PjxpbWcgY2xhc3M9XCJwbC10aC1ocC1oZXJvaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBoZXJvLmltYWdlX2hlcm8gKycucG5nXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48YSBjbGFzcz1cInBsLXRoLWhwLWhlcm9uYW1lXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyaGVyb1wiLCB7cmVnaW9uOiBwbGF5ZXJfcmVnaW9uLCBpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogaGVyby5uYW1lfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JysgaGVyby5uYW1lICsnPC9hPjwvZGl2PjwvZGl2Pic7XHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogS0RBXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhID0gJzxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBoZXJvLmtkYV9hdmcgKyAnPC9zcGFuPiBLREEnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGtkYWluZGl2ID0gaGVyby5raWxsc19hdmcgKyAnIC8gPHNwYW4gY2xhc3M9XCJwbC10aC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIGhlcm8uZGVhdGhzX2F2ZyArICc8L3NwYW4+IC8gJyArIGhlcm8uYXNzaXN0c19hdmc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGFjdHVhbFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC1rZGEta2RhXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGEgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGluZGl2XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdlwiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYWluZGl2ICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIGhlcm8ucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtoZXJvZmllbGQsIGtkYWZpZWxkLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wSGVyb2VzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwuaGVyb0xpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcGhlcm9lcy10YWJsZVwiIGNsYXNzPVwicGwtdG9waGVyb2VzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3BtYXBzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWFwTGltaXQ6IDYsIC8vSG93IG1hbnkgdG9wIG1hcHMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcG1hcHMtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtdG9wbWFwcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcG1hcHMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXBhcnRpZXMtdGl0bGVcIj5NYXBzPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtbWlkLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc1RhYmxlRGF0YTogZnVuY3Rpb24obWFwKSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFBhcnR5XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgbWFwaW1hZ2UgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwYmdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnKyBpbWFnZV9icGF0aCArJ3VpL21hcF9pY29uXycrIG1hcC5pbWFnZSArJy5wbmcpO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWFwbmFtZSA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBuYW1lXCI+JysgbWFwLm5hbWUgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1hcGlubmVyID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcHBhbmVcIj4nKyBtYXBpbWFnZSArIG1hcG5hbWUgKyAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFdpbnJhdGUgLyBQbGF5ZWRcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3ID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hcC53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXAud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtYXAucGxheWVkICsgJyBwbGF5ZWQnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFttYXBpbm5lciwgd2lucmF0ZWZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRvcE1hcHNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9wbWFwcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSBzZWxmLmludGVybmFsLm1hcExpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcG1hcHMtdGFibGVcIiBjbGFzcz1cInBsLXRvcG1hcHMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VG9wTWFwc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcG1hcHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGFydGllczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIHBhcnR5TGltaXQ6IDQsIC8vSG93IG1hbnkgcGFydGllcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc0NvbnRhaW5lcjogZnVuY3Rpb24obGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcGFydGllcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXBhcnRpZXMtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXIgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXBhcnRpZXMtdGl0bGVcIj48c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJMYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKydcIj5QYXJ0aWVzPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGxheWVyLWxlZnRwYW5lLWJvdC1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGE6IGZ1bmN0aW9uKHBhcnR5KSB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFBhcnR5XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgcGFydHlpbm5lciA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgcGFydHkucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgcGFydHlpbm5lciArPSAnPGRpdiBjbGFzcz1cInBsLXAtcC1wbGF5ZXIgcGwtcC1wLXBsYXllci0nKyBwYXJ0eS5wbGF5ZXJzLmxlbmd0aCArJ1wiPjxhIGNsYXNzPVwicGwtcC1wLXBsYXllcm5hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge3JlZ2lvbjogcGxheWVyX3JlZ2lvbiwgaWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIHBsYXllci5uYW1lICsnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC1wYXJ0aWVzLXBhcnR5cGFuZVwiPicrIHBhcnR5aW5uZXIgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtYmFkJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHkud2lucmF0ZV9yYXcgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLXdpbnJhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiV2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGFydHkud2lucmF0ZSArICclJyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9QbGF5ZWRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgtd3ItcGxheWVkXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwYXJ0eS5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3BhcnR5ZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRQYXJ0aWVzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5wYXJ0eUxpbWl0OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+PCdwbC1sZWZ0cGFuZS1wYWdpbmF0aW9uJ3A+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXBhcnRpZXMtdGFibGVcIiBjbGFzcz1cInBsLXBhcnRpZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0UGFydGllc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXBhcnRpZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNvbXBhY3RWaWV3OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgY29tcGFjdCB2aWV3IGlzIGVuYWJsZWQgZm9yIHJlY2VudCBtYXRjaGVzXHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgY2hhcnRkYXRhX3dpbnJhdGU6IHtcclxuICAgICAgICAgICAgICAgIFwiV1wiOiAwLFxyXG4gICAgICAgICAgICAgICAgXCJMXCI6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNoYXJ0czoge30sIC8vT2JqZWN0IG9mIGFsbCBjaGFydGpzIGdyYXBocyByZWxhdGVkIHRvIG1hdGNoZXNcclxuICAgICAgICAgICAgY29udHJvbFBhbmVsR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udHJvbFBhbmVsTWF0Y2hMb2FkZXJHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBtYXRjaE1hbmlmZXN0OiB7fSAvL0tlZXBzIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGlkcyBhcmUgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZCwgdG8gcHJldmVudCBvZmZzZXQgcmVxdWVzdHMgZnJvbSByZXBlYXRpbmcgbWF0Y2hlcyBvdmVyIGxhcmdlIHBlcmlvZHMgb2YgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL1Jlc2V0IGNoYXJ0ZGF0YVxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlID0ge1xyXG4gICAgICAgICAgICAgICAgXCJXXCI6IDAsXHJcbiAgICAgICAgICAgICAgICBcIkxcIjogMCxcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vQ2xlYXIgY2hhcnRzIG9iamVjdFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydGtleSBpbiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwuY2hhcnRzLmhhc093blByb3BlcnR5KGNoYXJ0a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGFydCA9IHNlbGYuaW50ZXJuYWwuY2hhcnRzW2NoYXJ0a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzID0ge307XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgLy9jb21wYWN0VmlldzogbGVhdmUgdGhlIHNldHRpbmcgdG8gd2hhdGV2ZXIgaXQgaXMgY3VycmVudGx5IGluIGJldHdlZW4gZmlsdGVyIGxvYWRzXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29udHJvbFBhbmVsR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29udHJvbFBhbmVsTWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QgPSB7fTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTWF0Y2hHZW5lcmF0ZWQ6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShtYXRjaGlkICsgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGxheWVyLXJpZ2h0cGFuZS1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXIgaW5pdGlhbC1sb2FkIGhvdHN0YXR1cy1zdWJjb250YWluZXIgaG9yaXpvbnRhbC1zY3JvbGxlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGwtbm9yZWNlbnRtYXRjaGVzXCI+Tm8gUmVjZW50IE1hdGNoZXMgRm91bmQuLi48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29udHJvbFBhbmVsTWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbEdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNwbC1ybS1jcC1sb2FkbW9yZXBhbmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBjbGFzcz1cImNsZWFydGlwIGQtaW5saW5lLWJsb2NrXCIgdGl0bGU9XCJMb2FkIE1vcmUgTWF0Y2hlcy4uLlwiPjxpIGNsYXNzPVwiZmEgZmEtY2hhaW4gZmEtMnhcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWwuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMnggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29udHJvbFBhbmVsTWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy50b29sdGlwJykudG9vbHRpcCgnaGlkZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWwuaHRtbCgnJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbC5vZmYoJ2NsaWNrJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29udHJvbFBhbmVsTWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udHJvbFBhbmVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbEdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ29tcGFjdCBNb2RlXHJcbiAgICAgICAgICAgICAgICBsZXQgY29tcGFjdCA9ICdmYS1hbGlnbi1qdXN0aWZ5JztcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbXBhY3RWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdCA9ICdmYS10aC1saXN0JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udHJvbHBhbmVsXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgR3JhcGhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1jaGFydC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3Atd2lucmF0ZS1wZXJjZW50XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cInBsLXJtLWNwLXdpbnJhdGUtY2hhcnRcIj48L2NhbnZhcz4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUmVjZW50IE1hdGNoZXMgIyArIFdpbnJhdGUgbG9uZ3RleHRcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1sb25ndGV4dC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3Atd2lucmF0ZS1sdC10aXRsZVwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJwbC1ybS1jcC13aW5yYXRlLWx0LW51bWJlcnNcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vU29jaWFsIHBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atc29jaWFscGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgY2xhc3M9XCJkLWlubGluZS1ibG9jayBzb2NpYWwtYnV0dG9uIHN0LWN1c3RvbS1idXR0b25cIiBkYXRhLW5ldHdvcms9XCJmYWNlYm9va1wiIHRpdGxlPVwiU2hhcmUgb24gRmFjZWJvb2tcIj48aSBjbGFzcz1cImZhIGZhLWZhY2Vib29rLXNxdWFyZSBmYS0zeFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGNsYXNzPVwiZC1pbmxpbmUtYmxvY2sgc29jaWFsLWJ1dHRvbiBzdC1jdXN0b20tYnV0dG9uXCIgZGF0YS1uZXR3b3JrPVwidHdpdHRlclwiIHRpdGxlPVwiU2hhcmUgb24gVHdpdHRlclwiPjxpIGNsYXNzPVwiZmEgZmEtdHdpdHRlci1zcXVhcmUgZmEtM3hcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBjbGFzcz1cImQtaW5saW5lLWJsb2NrIHNvY2lhbC1idXR0b24gc3QtY3VzdG9tLWJ1dHRvblwiIGRhdGEtbmV0d29yaz1cInJlZGRpdFwiIHRpdGxlPVwiU2hhcmUgb24gUmVkZGl0XCI+PGkgY2xhc3M9XCJmYSBmYS1yZWRkaXQtc3F1YXJlIGZhLTN4XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgY2xhc3M9XCJkLWlubGluZS1ibG9jayBzb2NpYWwtYnV0dG9uIHN0LWN1c3RvbS1idXR0b25cIiBkYXRhLW5ldHdvcms9XCJnb29nbGVwbHVzXCIgdGl0bGU9XCJTaGFyZSBvbiBHb29nbGUrXCI+PGkgY2xhc3M9XCJmYSBmYS1nb29nbGUtcGx1cy1zcXVhcmUgZmEtM3hcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgTW9yZSBwYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInBsLXJtLWNwLWxvYWRtb3JlcGFuZVwiIGNsYXNzPVwicGwtcm0tY3AtbG9hZG1vcmVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0NvbXBhY3QgcGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJwbC1ybS1jcC1jb21wYWN0cGFuZVwiIGNsYXNzPVwicGwtcm0tY3AtY29tcGFjdHBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3AtY29tcGFjdHBhbmUtaW5uZXJcIiBzdHlsZT1cImN1cnNvcjpwb2ludGVyO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGNsYXNzPVwiZC1pbmxpbmUtYmxvY2tcIiB0aXRsZT1cIlRvZ2dsZSBEaXNwbGF5IE1vZGVcIj48aSBjbGFzcz1cImZhICcrIGNvbXBhY3QgKycgZmEtMnhcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgc2hhcmUgdGhpcyBhZnRlciBsb2FkXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuX19zaGFyZXRoaXNfXy5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBncmFwaHNcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVHcmFwaFJlY2VudE1hdGNoZXNXaW5yYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db21wYWN0IFBhbmUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcm0tY3AtY29tcGFjdHBhbmUnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGludGVybmFsID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5pbnRlcm5hbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNwbC1ybS1jcC1jb21wYWN0cGFuZS1pbm5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWwuY29tcGFjdFZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtYWxpZ24tanVzdGlmeSBmYS0yeFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWwuY29tcGFjdFZpZXcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXRoLWxpc3QgZmEtMnhcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVybmFsLmNvbXBhY3RWaWV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFsxXSwgLy9FbXB0eSBpbml0aWFsIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNjZDJlMmRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIzNiZTE1OVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjMWMyMjIzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiMxYzIyMjNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0c1tcIndpbnJhdGVcIl0gPSBuZXcgQ2hhcnQoJCgnI3BsLXJtLWNwLXdpbnJhdGUtY2hhcnQnKSwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvdWdobnV0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZTogZnVuY3Rpb24oY2hhcnRkYXRhKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IHNlbGYuaW50ZXJuYWwuY2hhcnRzLndpbnJhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgIC8vVXBkYXRlIHdpbnJhdGUgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllZCA9IGNoYXJ0ZGF0YVswXSArIGNoYXJ0ZGF0YVsxXTtcclxuICAgICAgICAgICAgICAgIGxldCB3aW5zID0gY2hhcnRkYXRhWzBdICogMS4wO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvc3NlcyA9IGNoYXJ0ZGF0YVsxXSAqIDEuMDtcclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlID0gMTAwLjA7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZTtcclxuICAgICAgICAgICAgICAgIGlmIChsb3NzZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZSA9ICh3aW5zIC8gKHdpbnMgKyBsb3NzZXMpKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbnJhdGVfZGlzcGxheSA9IHdpbnJhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZV9kaXNwbGF5LnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPVxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICB3aW5yYXRlX2Rpc3BsYXkgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJyNwbC1ybS1jcC13aW5yYXRlLXBlcmNlbnQnKS5odG1sKHdpbnJhdGVmaWVsZCk7XHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcm0tY3Atd2lucmF0ZS1sdC10aXRsZScpLmh0bWwoJ1JlY2VudCAnKyBwbGF5ZWQgKyAnIE1hdGNoZXMnKTtcclxuICAgICAgICAgICAgICAgICQoJyNwbC1ybS1jcC13aW5yYXRlLWx0LW51bWJlcnMnKS5odG1sKCc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1sdC1udW1iZXIgZC1pbmxpbmUtYmxvY2sgcGwtcmVjZW50bWF0Y2gtd29uXCI+Jysgd2lucyArJ1c8L2Rpdj4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1ybS1jcC13aW5yYXRlLWx0LW51bWJlciBkLWlubGluZS1ibG9jayBwbC1yZWNlbnRtYXRjaC1sb3N0XCI+JysgbG9zc2VzICsnTDwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBkYXRhXHJcbiAgICAgICAgICAgICAgICBjaGFydC5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBbY2hhcnRkYXRhWzFdLCBjaGFydGRhdGFbMF1dOyAvL0ZsaXAgd2lucy9sb3NzZXMgc28gdGhhdCB3aW5zIGFwcGVhciBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBkb3VnaG51dFxyXG5cclxuICAgICAgICAgICAgICAgIC8vVXBkYXRlIGNoYXJ0IChkdXJhdGlvbjogMCA9IG1lYW5zIG5vIGFuaW1hdGlvbilcclxuICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyBhbGwgc3ViY29tcG9uZW50cyBvZiBhIG1hdGNoIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBjb21wb25lbnQgY29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgb25lLXRpbWUgcGFydHkgY29sb3JzIGZvciBtYXRjaFxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IFsxLCAyLCAzLCA0LCA1XTsgLy9BcnJheSBvZiBjb2xvcnMgdG8gdXNlIGZvciBwYXJ0eSBhdCBpbmRleCA9IHBhcnR5SW5kZXggLSAxXHJcbiAgICAgICAgICAgIEhvdHN0YXR1cy51dGlsaXR5LnNodWZmbGUocGFydGllc0NvbG9ycyk7XHJcblxyXG4gICAgICAgICAgICAvL0xvZyBtYXRjaCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGZ1bGxHZW5lcmF0ZWQ6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaGFzIGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgICAgICAgICAgZnVsbERpc3BsYXk6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbWF0Y2hQbGF5ZXI6IG1hdGNoLnBsYXllci5pZCwgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWVzQ29sb3JzOiBwYXJ0aWVzQ29sb3JzLCAvL0NvbG9ycyB0byB1c2UgZm9yIHRoZSBwYXJ0eSBpbmRleGVzXHJcbiAgICAgICAgICAgICAgICBzaG93bjogdHJ1ZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgbWF0Y2hzaW1wbGV3aWRnZXQgaXMgZXhwZWN0ZWQgdG8gYmUgc2hvd24gaW5zaWRlIHZpZXdwb3J0XHJcbiAgICAgICAgICAgICAgICBzaG93Q29tcGFjdDogdHJ1ZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgY29tcGFjdCBtYXRjaHNpbXBsZXdpZGdldCBpcyBleHBlY3RlZCB0byBiZSBzaG93biBpbnNpZGUgdmlld3BvcnQgd2hlbiBjb21wYWN0IG1vZGUgaXMgb25cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vVHJhY2sgd2lucmF0ZSBmb3IgZ3JhcGhzXHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIud29uKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiV1wiXSsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydGRhdGFfd2lucmF0ZVtcIkxcIl0rKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJ3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHRhbGVudC5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtyZWdpb246IG1hdGNoLnJlZ2lvbiwgaWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBwbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L3NwYW4+JyArIHBhcnR5ICsgc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDEyKSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1jb250YWluZXItJysgbWF0Y2guaWQgKydcIj48ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyXCI+JyArIC8vSGlkZSBpbm5lciBjb250ZW50cyBjb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWxlZnRwYW5lICcgKyBzZWxmLmNvbG9yX01hdGNoV29uTG9zdChtYXRjaC5wbGF5ZXIud29uKSArICdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgaW1hZ2VfYnBhdGggKyBtYXRjaC5tYXBfaW1hZ2UgKycucG5nKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGVcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlLXRleHRcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWF0Y2gubWFwICsgJ1wiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWRhdGVcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgZGF0ZSArICdcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWRhdGUtdGV4dFwiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLXZpY3RvcnlcIj4nICsgdmljdG9yeVRleHQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLW1hdGNobGVuZ3RoXCI+JyArIG1hdGNoX3RpbWUgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGltZyBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIHJtLXN3LWhwLXBvcnRyYWl0XCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtyZWdpb246IG1hdGNoLnJlZ2lvbiwgaWQ6IHBsYXllcl9pZCwgaGVyb1Byb3Blck5hbWU6IG1hdGNoLnBsYXllci5oZXJvfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvYT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXN0YXRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXZcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi10ZXh0XCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIG1hdGNoLnBsYXllci5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgbWF0Y2gucGxheWVyLmRlYXRocyArICc8L3NwYW4+IC8gJyArIG1hdGNoLnBsYXllci5hc3Npc3RzICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIG1hdGNoLnBsYXllci5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtdGFsZW50c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctdHAtdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtcGxheWVyc3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctcHAtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgaGlkZGVuIGNvbXBhY3QgdmlldyB3aWRnZXRcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUNvbXBhY3RWaWV3TWF0Y2hXaWRnZXQobWF0Y2gpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2xpY2sgbGlzdGVuZXJzIGZvciBpbnNwZWN0IHBhbmVcclxuICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2guaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIHNjcm9sbCBsaXN0ZW5lciBmb3IgaGlkaW5nIG91dHNpZGUgb2Ygdmlld3BvcnRcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKFwicmVzaXplIHNjcm9sbCBob3RzdGF0dXMubWF0Y2h0b2dnbGUgaG90c3RhdHVzLmNvbXBhY3R0b2dnbGVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hbmlmZXN0ID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkKS5pc09uU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93bikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsID0gJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVDb21wYWN0Vmlld01hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbWF0Y2guZGF0ZTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUodGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaF90aW1lID0gSG90c3RhdHVzLmRhdGUuZ2V0TWludXRlU2Vjb25kVGltZShtYXRjaC5tYXRjaF9sZW5ndGgpO1xyXG4gICAgICAgICAgICBsZXQgdmljdG9yeVRleHQgPSAobWF0Y2gucGxheWVyLndvbikgPyAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtd29uXCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1sb3N0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAndWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vR2FtZVR5cGVcclxuICAgICAgICAgICAgbGV0IGdhbWVUeXBlID0gbWF0Y2guZ2FtZVR5cGU7XHJcbiAgICAgICAgICAgIGxldCBnYW1lVHlwZV9kaXNwbGF5ID0gZ2FtZVR5cGU7XHJcbiAgICAgICAgICAgIGlmIChnYW1lVHlwZSA9PT0gXCJIZXJvIExlYWd1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBnYW1lVHlwZV9kaXNwbGF5ID0gJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZSBybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZS1obFwiPkhMPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChnYW1lVHlwZSA9PT0gXCJUZWFtIExlYWd1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBnYW1lVHlwZV9kaXNwbGF5ID0gJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZSBybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZS10bFwiPlRMPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChnYW1lVHlwZSA9PT0gXCJVbnJhbmtlZCBEcmFmdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnYW1lVHlwZV9kaXNwbGF5ID0gJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZSBybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZS11ZFwiPlVEPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChnYW1lVHlwZSA9PT0gXCJRdWljayBNYXRjaFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnYW1lVHlwZV9kaXNwbGF5ID0gJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZSBybS1zdy1jb21wYWN0LWd0cC1nYW1lVHlwZS1xbVwiPlFNPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9IZXJvXHJcbiAgICAgICAgICAgIGxldCBoZXJvID0gbWF0Y2gucGxheWVyLmhlcm87XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLWNvbXBhY3QtJysgbWF0Y2guaWQgKydcIj48ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWNvbXBhY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWNvbXBhY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLWNvbXBhY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLWNvbXBhY3RcIj4nICsgLy9IaWRlIGlubmVyIGNvbnRlbnRzIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgLy9WaWN0b3J5IFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC12aWN0b3J5cGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LXZwLXZpY3RvcnlcIj4nKyB2aWN0b3J5VGV4dCArJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9HYW1lVHlwZSBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtZ2FtZXR5cGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICBnYW1lVHlwZV9kaXNwbGF5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vSGVybyBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtaGVyb3BhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ocC1oZXJvIHBsLXRoLWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtyZWdpb246IG1hdGNoLnJlZ2lvbiwgaWQ6IHBsYXllcl9pZCwgaGVyb1Byb3Blck5hbWU6IG1hdGNoLnBsYXllci5oZXJvfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvYT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTWFwIFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1tYXBwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtbXAtbWFwXCI+JysgbWF0Y2gubWFwICsnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01hdGNoIExlbmd0aCBQYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtbWF0Y2hsZW5ndGhwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtbWxwLW1hdGNobGVuZ3RoXCI+JysgbWF0Y2hfdGltZSArJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9EYXRlIFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1kYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWRwLWRhdGVcIj4nKyBkYXRlICsnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0luc3BlY3RcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtY29tcGFjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC1jb21wYWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0hpZGUgYnkgZGVmYXVsdFxyXG4gICAgICAgICAgICAvLyQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItY29tcGFjdC0nICsgbWF0Y2guaWQpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC1jb21wYWN0LScgKyBtYXRjaC5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2guaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIHNjcm9sbCBsaXN0ZW5lciBmb3IgaGlkaW5nIG91dHNpZGUgb2Ygdmlld3BvcnRcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKFwicmVzaXplIHNjcm9sbCBob3RzdGF0dXMubWF0Y2h0b2dnbGUgaG90c3RhdHVzLmNvbXBhY3R0b2dnbGVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGludGVybmFsID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5pbnRlcm5hbDtcclxuICAgICAgICAgICAgICAgIGxldCBtYW5pZmVzdCA9IGludGVybmFsLm1hdGNoTWFuaWZlc3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGludGVybmFsLmNvbXBhY3RWaWV3ICYmIG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1jb21wYWN0LScgKyBtYXRjaC5pZCkuaXNPblNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLWNvbXBhY3QtJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93bkNvbXBhY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duQ29tcGFjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLWNvbXBhY3QtJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duQ29tcGFjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd25Db21wYWN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBmdWxsIG1hdGNoIHBhbmUgdGhhdCBsb2FkcyB3aGVuIGEgbWF0Y2ggd2lkZ2V0IGlzIGNsaWNrZWQgZm9yIGEgZGV0YWlsZWQgdmlldywgaWYgaXQncyBhbHJlYWR5IGxvYWRlZCwgdG9nZ2xlIGl0cyBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNobWFuID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXTtcclxuICAgICAgICAgICAgICAgIG1hdGNobWFuLmZ1bGxEaXNwbGF5ID0gIW1hdGNobWFuLmZ1bGxEaXNwbGF5O1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2htYW4uZnVsbERpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZURvd24oMjUwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcihcImhvdHN0YXR1cy5tYXRjaHRvZ2dsZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlVXAoMjUwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcihcImhvdHN0YXR1cy5tYXRjaHRvZ2dsZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgZnVsbCBtYXRjaCBwYW5lXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2hpZCkuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLScgKyBtYXRjaGlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9hZCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5sb2FkTWF0Y2gobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9nIGFzIGdlbmVyYXRlZCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93czogZnVuY3Rpb24obWF0Y2hpZCwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgZnVsbG1hdGNoX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0ZWFtc1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMF07IC8vQ291bnRzIGluZGV4IG9mIHBhcnR5IG1lbWJlciwgZm9yIHVzZSB3aXRoIGNyZWF0aW5nIGNvbm5lY3RvcnMsIHVwIHRvIDUgcGFydGllcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgIGZ1bGxtYXRjaF9jb250YWluZXIuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQgKydcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZWFtX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UZWFtIFJvdyBIZWFkZXJcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIodGVhbV9jb250YWluZXIsIHRlYW0sIG1hdGNoLndpbm5lciA9PT0gdCwgbWF0Y2guaGFzQmFucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggcGxheWVycyBmb3IgdGVhbVxyXG4gICAgICAgICAgICAgICAgbGV0IHAgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUGxheWVyIFJvd1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsbWF0Y2hSb3cobWF0Y2hpZCwgbWF0Y2gucmVnaW9uLCB0ZWFtX2NvbnRhaW5lciwgcGxheWVyLCB0ZWFtLmNvbG9yLCBtYXRjaC5zdGF0cywgcCAlIDIsIHBhcnRpZXNDb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgYmFuLmltYWdlICsnLnBuZ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93aGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB2aWN0b3J5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBMZXZlbCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbGV2ZWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLmxldmVsICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vQmFucyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtYmFucy1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIGJhbnMgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWtkYS1jb250YWluZXJcIj5LREE8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vU3RhdGlzdGljcyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtc3RhdGlzdGljcy1jb250YWluZXJcIj5QZXJmb3JtYW5jZTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NbXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLW1tci1jb250YWluZXJcIj5NTVI6IDxzcGFuIGNsYXNzPVwicm0tZm0tcmgtbW1yXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLm1tci5vbGQucmF0aW5nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxtYXRjaFJvdzogZnVuY3Rpb24obWF0Y2hpZCwgbWF0Y2hyZWdpb24sIGNvbnRhaW5lciwgcGxheWVyLCB0ZWFtQ29sb3IsIG1hdGNoU3RhdHMsIG9kZEV2ZW4sIHBhcnRpZXNDb3VudGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggcGxheWVyXHJcbiAgICAgICAgICAgIGxldCBtYXRjaFBsYXllcklkID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5tYXRjaFBsYXllcjtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJ3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllciBuYW1lXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJuYW1lID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoUGxheWVySWQpIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgcm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lICcrIHNpbGVuY2UocGxheWVyLnNpbGVuY2VkKSArJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7cmVnaW9uOiBtYXRjaHJlZ2lvbiwgaWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVybmFtZSArPSBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTQpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBwbGF5ZXIubWVkYWw7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtaW5uZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLWZtLXItbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBpbWFnZV9icGF0aCArIG1lZGFsLmltYWdlICsgJ18nKyB0ZWFtQ29sb3IgKycucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1mbS1yLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gcGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLXRhbGVudFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHRhbGVudC5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1N0YXRzXHJcbiAgICAgICAgICAgIGxldCBzdGF0cyA9IHBsYXllci5zdGF0cztcclxuXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0X3Rvb2x0aXAgPSBmdW5jdGlvbiAodmFsLCBkZXNjKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsICsnPGJyPicrIGRlc2M7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdHMgPSBbXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlcm9fZGFtYWdlXCIsIGNsYXNzOiBcImhlcm9kYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVybyBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwic2llZ2VfZGFtYWdlXCIsIGNsYXNzOiBcInNpZWdlZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ1NpZWdlIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJtZXJjX2NhbXBzXCIsIGNsYXNzOiBcIm1lcmNjYW1wc1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdNZXJjIENhbXBzIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlYWxpbmdcIiwgY2xhc3M6IFwiaGVhbGluZ1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZWFsaW5nJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImRhbWFnZV90YWtlblwiLCBjbGFzczogXCJkYW1hZ2V0YWtlblwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdEYW1hZ2UgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZXhwX2NvbnRyaWJcIiwgY2xhc3M6IFwiZXhwY29udHJpYlwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdFeHBlcmllbmNlIENvbnRyaWJ1dGlvbid9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKHN0YXQgb2Ygcm93c3RhdHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXggPSBtYXRjaFN0YXRzW3N0YXQua2V5XVtcIm1heFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGVyY2VudE9uUmFuZ2UgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1heCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50T25SYW5nZSA9IChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSAvIChtYXggKiAxLjAwKSkgKiAxMDAuMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LndpZHRoID0gcGVyY2VudE9uUmFuZ2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZSA9IHN0YXRzW3N0YXQua2V5XTtcclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gc3RhdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSAnPHNwYW4gY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlci1ub25lXCI+JyArIHN0YXQudmFsdWUgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC50b29sdGlwID0gcm93c3RhdF90b29sdGlwKHN0YXQudmFsdWUsIHN0YXQudG9vbHRpcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC5odG1sID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzdGF0LnRvb2x0aXAgKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtcm93XCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtJysgc3RhdC5jbGFzcyArJyBybS1mbS1yLXN0YXRzLWJhclwiIHN0eWxlPVwid2lkdGg6ICcrIHN0YXQud2lkdGggKyclXCI+PC9kaXY+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyXCI+Jysgc3RhdC52YWx1ZURpc3BsYXkgKyc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NTVJcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhVHlwZSA9IFwibmVnXCI7XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVByZWZpeCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIubW1yLmRlbHRhID49IDApIHtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhVHlwZSA9IFwicG9zXCI7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVByZWZpeCA9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YSA9IHBsYXllci5tbXIucmFuayArJyAnKyBwbGF5ZXIubW1yLnRpZXIgKycgKDxzcGFuIGNsYXNzPVxcJ3JtLWZtLXItbW1yLWRlbHRhLScrIG1tckRlbHRhVHlwZSArJ1xcJz4nKyBtbXJEZWx0YVByZWZpeCArIHBsYXllci5tbXIuZGVsdGEgKyc8L3NwYW4+KSc7XHJcblxyXG4gICAgICAgICAgICAvL1BhcnR5XHJcbiAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcnR5ID0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eSBybS1wYXJ0eS1tZCBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktbWQgcm0tcGFydHktbWQtY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0J1aWxkIGh0bWxcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvdyBybS1mbS1yb3ctJysgb2RkRXZlbiArJ1wiPicgK1xyXG4gICAgICAgICAgICAvL1BhcnR5IFN0cmlwZVxyXG4gICAgICAgICAgICBwYXJ0eSArXHJcbiAgICAgICAgICAgIC8vSGVybyBJbWFnZSBDb250YWluZXIgKFdpdGggSGVybyBMZXZlbClcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9sZXZlbFwiPicrIHBsYXllci5oZXJvX2xldmVsICsnPC9kaXY+PGltZyBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlXCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgcGxheWVyLmltYWdlX2hlcm8gKycucG5nXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01NUiBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci10b29sdGlwLWFyZWFcIiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIG1tckRlbHRhICsnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItbW1yXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBwbGF5ZXIubW1yLnJhbmsgKycucG5nXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLW51bWJlclwiPicrIHBsYXllci5tbXIudGllciArJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZXJodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlclwiPkxvYWQgTW9yZSBNYXRjaGVzLi4uPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChsb2FkZXJodG1sKTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMXggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vSnF1ZXJ5IGlzT25TY3JlZW4gKFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGNhbGxpbmcgc2VsZWN0b3IgaXMgaW5zaWRlIHRoZSB2aWV3cG9ydCArIHBhZGRlZCB6b25lIGZvciBzY3JvbGwgc21vb3RobmVzcylcclxuICAgICQuZm4uaXNPblNjcmVlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHdpbiA9ICQod2luZG93KTtcclxuXHJcbiAgICAgICAgbGV0IHBhZFNpemUgPSA2MDA7XHJcblxyXG4gICAgICAgIGxldCB2aWV3cG9ydCA9IHtcclxuICAgICAgICAgICAgdG9wIDogd2luLnNjcm9sbFRvcCgpIC0gcGFkU2l6ZSxcclxuICAgICAgICAgICAgbGVmdCA6IHdpbi5zY3JvbGxMZWZ0KCkgLSBwYWRTaXplXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2aWV3cG9ydC5yaWdodCA9IHZpZXdwb3J0LmxlZnQgKyB3aW4ud2lkdGgoKSArICgyICogcGFkU2l6ZSk7XHJcbiAgICAgICAgdmlld3BvcnQuYm90dG9tID0gdmlld3BvcnQudG9wICsgd2luLmhlaWdodCgpICsgKDIgKiBwYWRTaXplKTtcclxuXHJcbiAgICAgICAgbGV0IGJvdW5kcyA9IHRoaXMub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgIGlmICghYm91bmRzKSByZXR1cm4gZmFsc2U7IC8vQ2F0Y2ggdW5kZWZpbmVkIGJvdW5kcyBjYXVzZWQgYnkganF1ZXJ5IGFuaW1hdGlvbnMgb2Ygb2JqZWN0cyBvdXRzaWRlIG9mIHRoZSB2aWV3cG9ydFxyXG5cclxuICAgICAgICBib3VuZHMucmlnaHQgPSBib3VuZHMubGVmdCArIHRoaXMub3V0ZXJXaWR0aCgpO1xyXG4gICAgICAgIGJvdW5kcy5ib3R0b20gPSBib3VuZHMudG9wICsgdGhpcy5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCEodmlld3BvcnQucmlnaHQgPCBib3VuZHMubGVmdCB8fCB2aWV3cG9ydC5sZWZ0ID4gYm91bmRzLnJpZ2h0IHx8IHZpZXdwb3J0LmJvdHRvbSA8IGJvdW5kcy50b3AgfHwgdmlld3BvcnQudG9wID4gYm91bmRzLmJvdHRvbSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cmVnaW9uOiBwbGF5ZXJfcmVnaW9uLCBwbGF5ZXI6IHBsYXllcl9pZH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgLy9maWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9