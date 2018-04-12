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
                    var html = '<div style="cursor:pointer;" class="d-inline-block" title="Load More Matches..."><i class="fa fa-chain fa-2x" aria-hidden="true"></i></div>';

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
                        $('.recentmatch-container-compact-collapsable').hide();
                        $('.recentmatch-container-collapsable').show();
                        $(window).trigger('hotstatus.compacttoggle');

                        sel.html('<i class="fa fa-align-justify fa-2x" aria-hidden="true"></i>');
                        internal.compactView = false;
                    } else {
                        $('.recentmatch-container-compact-collapsable').show();
                        $('.recentmatch-container-collapsable').hide();
                        $(window).trigger('hotstatus.compacttoggle');

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

            var html = '<div id="recentmatch-container-' + match.id + '" class="recentmatch-container-collapsable"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' + '<div id="recentmatch-simplewidget-outline-container-' + match.id + '" class="recentmatch-simplewidget-outline-container">' + //Hide inner contents container
            '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + image_bpath + match.map_image + '.png);">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + image_bpath + match.player.image_hero + '.png"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("playerhero", { region: match.region, id: player_id, heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="' + goodkda + '">' + match.player.kda + '</span> KDA</div></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div></div>';

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Hide base on compact state
            if (self.internal.compactView) {
                $('#recentmatch-container-' + match.id).hide();
            }

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

            var html = '<div id="recentmatch-container-compact-' + match.id + '" class="recentmatch-container-compact-collapsable"><div id="recentmatch-simplewidget-compact-' + match.id + '" class="recentmatch-simplewidget-compact">' + '<div id="recentmatch-simplewidget-outline-container-compact-' + match.id + '" class="recentmatch-simplewidget-outline-container-compact">' + //Hide inner contents container
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

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Hide base on compact state
            if (!self.internal.compactView) {
                $('#recentmatch-container-compact-' + match.id).hide();
            }

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
                    $('#pl-recentmatch-container-' + matchid).append('<div id="recentmatch-fullmatch-' + matchid + '" class="recentmatch-fullmatch"></div>');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTBkOGU1MjVlOGM0ODQ2NDk5MDciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiYWpheF9tYXRjaGVzIiwibWF0Y2hlcyIsImFqYXhfdG9waGVyb2VzIiwidG9waGVyb2VzIiwiYWpheF9wYXJ0aWVzIiwicGFydGllcyIsImRhdGEiLCJkYXRhX21tciIsIm1tciIsImRhdGFfdG9wbWFwcyIsInRvcG1hcHMiLCJkYXRhX21hdGNoZXMiLCIkIiwiYXBwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9tbXIiLCJlbXB0eSIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJnZW5lcmF0ZU1NUkNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2VzIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udGFpbmVyIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInJlZ2lvbiIsInBsYXllcl9yZWdpb24iLCJwbGF5ZXIiLCJwbGF5ZXJfaWQiLCJkYXRhX3RvcGhlcm9lcyIsImpzb25faGVyb2VzIiwiaGVyb2VzIiwianNvbl9tYXBzIiwibWFwcyIsImdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyIiwibWF0Y2hlc193aW5yYXRlIiwibWF0Y2hlc193aW5yYXRlX3JhdyIsIm1hdGNoZXNfcGxheWVkIiwibXZwX21lZGFsc19wZXJjZW50YWdlIiwiZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSIsInRvcEhlcm9lc1RhYmxlIiwiZ2V0VG9wSGVyb2VzVGFibGVDb25maWciLCJoZXJvIiwicHVzaCIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGVEYXRhIiwiaW5pdFRvcEhlcm9lc1RhYmxlIiwiZ2VuZXJhdGVUb3BNYXBzQ29udGFpbmVyIiwiZ2VuZXJhdGVUb3BNYXBzVGFibGUiLCJ0b3BNYXBzVGFibGUiLCJnZXRUb3BNYXBzVGFibGVDb25maWciLCJtYXAiLCJnZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEiLCJpbml0VG9wTWFwc1RhYmxlIiwiZGF0YV9wYXJ0aWVzIiwianNvbl9wYXJ0aWVzIiwiZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVQYXJ0aWVzVGFibGUiLCJwYXJ0aWVzVGFibGUiLCJnZXRQYXJ0aWVzVGFibGVDb25maWciLCJwYXJ0eSIsImdlbmVyYXRlUGFydGllc1RhYmxlRGF0YSIsImluaXRQYXJ0aWVzVGFibGUiLCJtYXRjaGxvYWRpbmciLCJtYXRjaHVybCIsImdlbmVyYXRlTWF0Y2hVcmwiLCJtYXRjaF9pZCIsIm1hdGNoaWQiLCJkaXNwbGF5TWF0Y2hMb2FkZXIiLCJqc29uX29mZnNldHMiLCJvZmZzZXRzIiwianNvbl9saW1pdHMiLCJqc29uX21hdGNoZXMiLCJoaWRlIiwiZ2VuZXJhdGVSZWNlbnRNYXRjaGVzQ29udHJvbFBhbmVsIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiaWQiLCJnZW5lcmF0ZU1hdGNoIiwiZ3JhcGhkYXRhX3dpbnJhdGUiLCJjaGFydGRhdGFfd2lucmF0ZSIsInVwZGF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGUiLCJnZW5lcmF0ZU5vTWF0Y2hlc01lc3NhZ2UiLCJzaG93IiwiZ2VuZXJhdGVfbWF0Y2hMb2FkZXIiLCJyZW1vdmVfbWF0Y2hMb2FkZXIiLCJnZW5lcmF0ZUNvbnRyb2xQYW5lbE1hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJodG1sIiwibW1ycyIsImNvbnRhaW5lciIsImdlbmVyYXRlTU1SQmFkZ2UiLCJtbXJHYW1lVHlwZUltYWdlIiwiaW1hZ2VfYnBhdGgiLCJnYW1lVHlwZV9pbWFnZSIsIm1tcmltZyIsInJhbmsiLCJtbXJ0aWVyIiwidGllciIsImdlbmVyYXRlTU1SVG9vbHRpcCIsImdhbWVUeXBlIiwicmF0aW5nIiwiaGVyb0xpbWl0Iiwid2lucmF0ZSIsIndpbnJhdGVfcmF3IiwibWF0Y2hlc3BsYXllZCIsIm12cHBlcmNlbnQiLCJnb29kd2lucmF0ZSIsIndpbnJhdGVUZXh0IiwibWF0Y2hlc3BsYXllZGNvbnRhaW5lciIsIm12cHBlcmNlbnRjb250YWluZXIiLCJoZXJvZmllbGQiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJuYW1lIiwiZ29vZGtkYSIsImtkYV9yYXciLCJrZGEiLCJrZGFfYXZnIiwia2RhaW5kaXYiLCJraWxsc19hdmciLCJkZWF0aHNfYXZnIiwiYXNzaXN0c19hdmciLCJrZGFmaWVsZCIsIndpbnJhdGVmaWVsZCIsInBsYXllZCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsInNvcnRpbmciLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2VMZW5ndGgiLCJwYWdpbmciLCJwYWdpbmdUeXBlIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsIm1hcExpbWl0IiwibWFwaW1hZ2UiLCJpbWFnZSIsIm1hcG5hbWUiLCJtYXBpbm5lciIsInBhcnR5TGltaXQiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInBhcnR5aW5uZXIiLCJwbGF5ZXJzIiwicGFydHlmaWVsZCIsImNvbXBhY3RWaWV3IiwibWF0Y2hMb2FkZXJHZW5lcmF0ZWQiLCJjaGFydHMiLCJjb250cm9sUGFuZWxHZW5lcmF0ZWQiLCJjb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJjaGFydGtleSIsImhhc093blByb3BlcnR5IiwiY2hhcnQiLCJkZXN0cm95Iiwic2VsIiwiY2xpY2siLCJ0Iiwib2ZmIiwiY29tcGFjdCIsIndpbmRvdyIsIl9fc2hhcmV0aGlzX18iLCJpbml0aWFsaXplIiwiZ2VuZXJhdGVHcmFwaFJlY2VudE1hdGNoZXNXaW5yYXRlIiwidHJpZ2dlciIsImRhdGFzZXRzIiwiYmFja2dyb3VuZENvbG9yIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJtYWludGFpbkFzcGVjdFJhdGlvIiwibGVnZW5kIiwiZGlzcGxheSIsInRvb2x0aXBzIiwiZW5hYmxlZCIsImhvdmVyIiwibW9kZSIsIkNoYXJ0IiwidHlwZSIsImNoYXJ0ZGF0YSIsIndpbnMiLCJsb3NzZXMiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJ0b0ZpeGVkIiwidXBkYXRlIiwicGFydGllc0NvbG9ycyIsInV0aWxpdHkiLCJzaHVmZmxlIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJzaG93biIsInNob3dDb21wYWN0Iiwid29uIiwiZ2VuZXJhdGVNYXRjaFdpZGdldCIsInRpbWVzdGFtcCIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0IiwibWVkYWwiLCJzaWxlbmNlIiwiaXNTaWxlbmNlZCIsInIiLCJzaWxlbmNlX2ltYWdlIiwic2l6ZSIsInMiLCJwYXRoIiwibWVkYWxodG1sIiwibm9tZWRhbGh0bWwiLCJleGlzdHMiLCJkZXNjX3NpbXBsZSIsInRhbGVudHNodG1sIiwiaSIsInRhbGVudHMiLCJ0YWxlbnQiLCJ0YWxlbnR0b29sdGlwIiwicGxheWVyc2h0bWwiLCJwYXJ0aWVzQ291bnRlciIsInRlYW1zIiwidGVhbSIsInBhcnR5T2Zmc2V0IiwicGFydHlDb2xvciIsInNwZWNpYWwiLCJzaWxlbmNlZCIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsImtpbGxzIiwiZGVhdGhzIiwiYXNzaXN0cyIsImdlbmVyYXRlQ29tcGFjdFZpZXdNYXRjaFdpZGdldCIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIm9uIiwiZSIsIm1hbmlmZXN0IiwiaXNPblNjcmVlbiIsImdhbWVUeXBlX2Rpc3BsYXkiLCJzaG93bkNvbXBhY3QiLCJtYXRjaG1hbiIsInNlbGVjdG9yIiwic2xpZGVEb3duIiwic2xpZGVVcCIsImZ1bGxtYXRjaF9jb250YWluZXIiLCJ0ZWFtX2NvbnRhaW5lciIsImdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyIiwid2lubmVyIiwiaGFzQmFucyIsInAiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbG9yIiwic3RhdHMiLCJ2aWN0b3J5IiwiYmFucyIsImJhbiIsImxldmVsIiwib2xkIiwibWF0Y2hyZWdpb24iLCJ0ZWFtQ29sb3IiLCJtYXRjaFN0YXRzIiwib2RkRXZlbiIsIm1hdGNoUGxheWVySWQiLCJwbGF5ZXJuYW1lIiwicm93c3RhdF90b29sdGlwIiwiZGVzYyIsInJvd3N0YXRzIiwia2V5IiwiY2xhc3MiLCJ3aWR0aCIsInZhbHVlIiwidmFsdWVEaXNwbGF5Iiwic3RhdCIsIm1heCIsInBlcmNlbnRPblJhbmdlIiwibW1yRGVsdGFUeXBlIiwibW1yRGVsdGFQcmVmaXgiLCJkZWx0YSIsIm1tckRlbHRhIiwiaGVyb19sZXZlbCIsImxvYWRlcmh0bWwiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsIndpbiIsInBhZFNpemUiLCJ2aWV3cG9ydCIsInRvcCIsInNjcm9sbFRvcCIsImxlZnQiLCJzY3JvbGxMZWZ0IiwicmlnaHQiLCJib3R0b20iLCJoZWlnaHQiLCJib3VuZHMiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0I7QUFDaEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5lLENBQXBCOztBQVNBOzs7QUFHQUgsYUFBYUMsSUFBYixDQUFrQkssTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNV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LFNBQVNLLEtBQVQsR0FBaUJHLE9BQU9MLElBQXhCLElBQWdDSCxTQUFTRyxJQUFULEdBQWdCSyxPQUFPSCxLQUF2RCxJQUFnRUwsU0FBU00sTUFBVCxHQUFrQkUsT0FBT1AsR0FBekYsSUFBZ0dELFNBQVNDLEdBQVQsR0FBZU8sT0FBT0YsTUFBeEgsQ0FBUjtBQUNILEtBcEJEOztBQXNCQTtBQUNBLFFBQUk5VSxVQUFVMkMsUUFBUUMsUUFBUixDQUFpQiw0QkFBakIsRUFBK0MsRUFBQ0MsUUFBUUMsYUFBVCxFQUF3QkMsUUFBUUMsU0FBaEMsRUFBL0MsQ0FBZDs7QUFFQSxRQUFJL0MsY0FBYyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxCO0FBQ0EsUUFBSWtWLGFBQWF2VyxhQUFhQyxJQUFiLENBQWtCSyxNQUFuQzs7QUFFQTtBQUNBUSxvQkFBZ0IwVixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0NuVixXQUF4QztBQUNBa1YsZUFBV3BWLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBZ0IsTUFBRSx3QkFBRixFQUE0QmlRLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNtRSxLQUFULEVBQWdCO0FBQ3JEM1Ysd0JBQWdCMFYsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDblYsV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FnQixNQUFFLEdBQUYsRUFBT2lRLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTQyxDQUFULEVBQVk7QUFDeENnRSxtQkFBV3BWLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQTdDRCxFIiwiZmlsZSI6InBsYXllci1sb2FkZXIuNmVjZjU3MGViNDUzNzAyMmVkOGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlMGQ4ZTUyNWU4YzQ4NDY0OTkwNyIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgdmFsID0gSG90c3RhdHVzRmlsdGVyLmdldFNlbGVjdG9yVmFsdWVzKFwic2Vhc29uXCIpO1xyXG5cclxuICAgICAgICBsZXQgc2Vhc29uID0gXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vhc29uO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuICAgICAgICBsZXQgYWpheF9tYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgIGxldCBhamF4X3RvcGhlcm9lcyA9IGFqYXgudG9waGVyb2VzO1xyXG4gICAgICAgIGxldCBhamF4X3BhcnRpZXMgPSBhamF4LnBhcnRpZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbW1yID0gZGF0YS5tbXI7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLy0tIEluaXRpYWwgTWF0Y2hlcyBGaXJzdCBMb2FkXHJcbiAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtbG9hZGVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0zeCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbW1yID0ganNvbi5tbXI7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbW1yLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfdG9waGVyb2VzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGFqYXhfcGFydGllcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNTVJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbW1yLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21tci5nZW5lcmF0ZU1NUkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbW1yLmdlbmVyYXRlTU1SQmFkZ2VzKGpzb25fbW1yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhfbWF0Y2hlcy5pbnRlcm5hbC5saW1pdCA9IGpzb24ubGltaXRzLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgbWF0Y2ggc2V0XHJcbiAgICAgICAgICAgICAgICBhamF4X21hdGNoZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFRvcCBIZXJvZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF90b3BoZXJvZXMubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIFBhcnRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheF9wYXJ0aWVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucGxheWVybG9hZGVyLXByb2Nlc3NpbmcnKS5mYWRlSW4oKS5kZWxheSgyNTApLnF1ZXVlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl90b3BoZXJvZXNcIiwge1xyXG4gICAgICAgICAgICByZWdpb246IHBsYXllcl9yZWdpb24sXHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyBUb3AgSGVyb2VzIGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9waGVyb2VzID0gZGF0YS50b3BoZXJvZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdG9wbWFwcyA9IGRhdGEudG9wbWFwcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFRvcCBIZXJvZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZXMgPSBqc29uLmhlcm9lcztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hcHMgPSBqc29uLm1hcHM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIEhlcm9lc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9oZXJvZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdG9waGVyb2VzLmdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyKGpzb24ubWF0Y2hlc193aW5yYXRlLCBqc29uLm1hdGNoZXNfd2lucmF0ZV9yYXcsIGpzb24ubWF0Y2hlc19wbGF5ZWQsIGpzb24ubXZwX21lZGFsc19wZXJjZW50YWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wSGVyb2VzVGFibGUgPSBkYXRhX3RvcGhlcm9lcy5nZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyhqc29uX2hlcm9lcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhLnB1c2goZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuaW5pdFRvcEhlcm9lc1RhYmxlKHRvcEhlcm9lc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgVG9wIE1hcHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWFwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BtYXBzLmdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuZ2VuZXJhdGVUb3BNYXBzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcE1hcHNUYWJsZSA9IGRhdGFfdG9wbWFwcy5nZXRUb3BNYXBzVGFibGVDb25maWcoanNvbl9tYXBzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvcE1hcHNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFwIG9mIGpzb25fbWFwcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BNYXBzVGFibGUuZGF0YS5wdXNoKGRhdGFfdG9wbWFwcy5nZW5lcmF0ZVRvcE1hcHNUYWJsZURhdGEobWFwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3RvcG1hcHMuaW5pdFRvcE1hcHNUYWJsZSh0b3BNYXBzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnBhcnRpZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5wYXJ0aWVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9wYXJ0aWVzXCIsIHtcclxuICAgICAgICAgICAgcmVnaW9uOiBwbGF5ZXJfcmVnaW9uLFxyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgUGFydGllcyBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgucGFydGllcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9wYXJ0aWVzID0gZGF0YS5wYXJ0aWVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUGFydGllcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3BhcnRpZXMgPSBqc29uLnBhcnRpZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgUGFydGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9wYXJ0aWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3BhcnRpZXMuZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyKGpzb24ubGFzdF91cGRhdGVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9wYXJ0aWVzLmdlbmVyYXRlUGFydGllc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0aWVzVGFibGUgPSBkYXRhX3BhcnRpZXMuZ2V0UGFydGllc1RhYmxlQ29uZmlnKGpzb25fcGFydGllcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnR5IG9mIGpzb25fcGFydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzVGFibGUuZGF0YS5wdXNoKGRhdGFfcGFydGllcy5nZW5lcmF0ZVBhcnRpZXNUYWJsZURhdGEocGFydHkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcGFydGllcy5pbml0UGFydGllc1RhYmxlKHBhcnRpZXNUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgbWF0Y2hsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIGZ1bGxtYXRjaCByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgbWF0Y2h1cmw6ICcnLCAvL3VybCB0byBnZXQgYSBmdWxsbWF0Y2ggcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgICAgIG9mZnNldDogMCwgLy9NYXRjaGVzIG9mZnNldFxyXG4gICAgICAgIGxpbWl0OiAxMCwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHJlZ2lvbjogcGxheWVyX3JlZ2lvbixcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWQsXHJcbiAgICAgICAgICAgIG9mZnNldDogc2VsZi5pbnRlcm5hbC5vZmZzZXQsXHJcbiAgICAgICAgICAgIGxpbWl0OiBzZWxmLmludGVybmFsLmxpbWl0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlTWF0Y2hVcmw6IGZ1bmN0aW9uKG1hdGNoX2lkKSB7XHJcbiAgICAgICAgcmV0dXJuIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX21hdGNoXCIsIHtcclxuICAgICAgICAgICAgbWF0Y2hpZDogbWF0Y2hfaWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRpc3BsYXlNYXRjaExvYWRlciA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9vZmZzZXRzID0ganNvbi5vZmZzZXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbGltaXRzID0ganNvbi5saW1pdHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaGVzID0ganNvbi5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9FbnN1cmUgZGlzYWJsZWQgZGVmYXVsdCBzb2NpYWwgcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5zb2NpYWwtcGFuZScpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9FbnN1cmUgY29udHJvbCBwYW5lbFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZVJlY2VudE1hdGNoZXNDb250cm9sUGFuZWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9TZXQgbmV3IG9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0FwcGVuZCBuZXcgTWF0Y2ggd2lkZ2V0cyBmb3IgbWF0Y2hlcyB0aGF0IGFyZW4ndCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBqc29uX21hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU1hdGNoKG1hdGNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9VcGRhdGUgQ29udHJvbCBQYW5lbCBncmFwaHMgYWZ0ZXIgbWF0Y2ggZ2VuZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBncmFwaGRhdGFfd2lucmF0ZSA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiV1wiXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiTFwiXVxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnVwZGF0ZUdyYXBoUmVjZW50TWF0Y2hlc1dpbnJhdGUoZ3JhcGhkYXRhX3dpbnJhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5pbnRlcm5hbC5vZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVOb01hdGNoZXNNZXNzYWdlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vRW5zdXJlIGJhY2t1cCBzb2NpYWwgcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5zb2NpYWwtcGFuZScpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5IG1hdGNoIGxvYWRlciBidXR0b24gaWYgaGFkTmV3TWF0Y2hcclxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TWF0Y2hMb2FkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbnRyb2wgUGFuZWwgbWF0Y2ggbG9hZGVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVDb250cm9sUGFuZWxNYXRjaExvYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vUmVtb3ZlIGluaXRpYWwgbG9hZFxyXG4gICAgICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHRoZSBtYXRjaCBvZiBnaXZlbiBpZCB0byBiZSBkaXNwbGF5ZWQgdW5kZXIgbWF0Y2ggc2ltcGxld2lkZ2V0XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXRjaDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gc2VsZi5nZW5lcmF0ZU1hdGNoVXJsKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZnVsbG1hdGNoLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLm1hdGNodXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaCA9IGpzb24ubWF0Y2g7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlRnVsbE1hdGNoUm93cyhtYXRjaGlkLCBqc29uX21hdGNoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZ1bGxtYXRjaC1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblBsYXllckxvYWRlci5kYXRhID0ge1xyXG4gICAgbW1yOiB7XHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtbW1yLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtbW1yLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtbW1yLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIG1hcmdpbi1ib3R0b20tc3BhY2VyLTEgcGFkZGluZy1sZWZ0LTAgcGFkZGluZy1yaWdodC0wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1tbXItY29udGFpbmVyLWZyYW1lJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNTVJCYWRnZXM6IGZ1bmN0aW9uKG1tcnMpIHtcclxuICAgICAgICAgICAgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1tcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250YWluZXIgPSAkKCcjcGwtbW1yLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbW1yIG9mIG1tcnMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNTVJCYWRnZShjb250YWluZXIsIG1tcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SQmFkZ2U6IGZ1bmN0aW9uKGNvbnRhaW5lciwgbW1yKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubW1yO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1tckdhbWVUeXBlSW1hZ2UgPSAnPGltZyBjbGFzcz1cInBsLW1tci1iYWRnZS1nYW1lVHlwZUltYWdlXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvZ2FtZVR5cGVfaWNvbl8nICsgbW1yLmdhbWVUeXBlX2ltYWdlICsnLnBuZ1wiPic7XHJcbiAgICAgICAgICAgIGxldCBtbXJpbWcgPSAnPGltZyBjbGFzcz1cInBsLW1tci1iYWRnZS1pbWFnZVwiIHNyYz1cIicrIGltYWdlX2JwYXRoICsgJ3VpL3JhbmtlZF9wbGF5ZXJfaWNvbl8nICsgbW1yLnJhbmsgKycucG5nXCI+JztcclxuICAgICAgICAgICAgbGV0IG1tcnRpZXIgPSAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS10aWVyXCI+JysgbW1yLnRpZXIgKyc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9NTVIgR2FtZVR5cGUgSW1hZ2VcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLWdhbWVUeXBlSW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBtbXJHYW1lVHlwZUltYWdlICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTU1SIEltYWdlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS1pbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG1tcmltZyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBUaWVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLW1tci1iYWRnZS10aWVyLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbW1ydGllciArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01NUiBUb29sdGlwIEFyZWFcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtbW1yLWJhZGdlLXRvb2x0aXAtYXJlYVwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIHNlbGYuZ2VuZXJhdGVNTVJUb29sdGlwKG1tcikgKydcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTU1SVG9vbHRpcDogZnVuY3Rpb24obW1yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdj4nKyBtbXIuZ2FtZVR5cGUgKyc8L2Rpdj48ZGl2PicrIG1tci5yYXRpbmcgKyc8L2Rpdj48ZGl2PicrIG1tci5yYW5rICsnICcrIG1tci50aWVyICsnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG9waGVyb2VzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgaGVyb0xpbWl0OiA1LCAvL0hvdyBtYW55IGhlcm9lcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXI6IGZ1bmN0aW9uKHdpbnJhdGUsIHdpbnJhdGVfcmF3LCBtYXRjaGVzcGxheWVkLCBtdnBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIC8vR29vZCB3aW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVUZXh0ID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj48ZGl2IGNsYXNzPVwiZC1pbmxpbmUtYmxvY2sgdG9waGVyb2VzLWlubGluZS13aW5yYXRlICcrIGdvb2R3aW5yYXRlICsnXCI+JyArXHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXRjaGVzcGxheWVkY29udGFpbmVyID0gJzxkaXYgY2xhc3M9XCJwbC10b3BoZXJvZXMtbWF0Y2hlc3BsYXllZC1jb250YWluZXIgdG9waGVyb2VzLXNwZWNpYWwtZGF0YVwiPjxzcGFuIGNsYXNzPVwidG9waGVyb2VzLXNwZWNpYWwtZGF0YS1sYWJlbFwiPlBsYXllZDo8L3NwYW4+ICcrIG1hdGNoZXNwbGF5ZWQgKycgKCcrIHdpbnJhdGVUZXh0ICsnKTwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbXZwcGVyY2VudGNvbnRhaW5lciA9ICc8ZGl2IGNsYXNzPVwicGwtdG9waGVyb2VzLW12cHBlcmNlbnQtY29udGFpbmVyIHRvcGhlcm9lcy1zcGVjaWFsLWRhdGFcIj48aW1nIGNsYXNzPVwicGwtdG9waGVyb2VzLW12cHBlcmNlbnQtaW1hZ2VcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArJ3N0b3JtX3VpX3Njb3Jlc2NyZWVuX212cF9tdnBfYmx1ZS5wbmdcIj48c3BhbiBjbGFzcz1cInRvcGhlcm9lcy1zcGVjaWFsLWRhdGEtbGFiZWxcIj5NVlA6PC9zcGFuPiAnKyBtdnBwZXJjZW50ICsnJTwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtdG9waGVyb2VzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtdG9waGVyb2VzLWNvbnRhaW5lciBob3RzdGF0dXMtc3ViY29udGFpbmVyIHBhZGRpbmctbGVmdC0wIHBhZGRpbmctcmlnaHQtMFwiPicgK1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hlc3BsYXllZGNvbnRhaW5lciArXHJcbiAgICAgICAgICAgICAgICBtdnBwZXJjZW50Y29udGFpbmVyICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXItZnJhbWUnKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBIZXJvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgaGVyb2ZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1oZXJvcGFuZVwiPjxkaXY+PGltZyBjbGFzcz1cInBsLXRoLWhwLWhlcm9pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIGhlcm8uaW1hZ2VfaGVybyArJy5wbmdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxhIGNsYXNzPVwicGwtdGgtaHAtaGVyb25hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtyZWdpb246IHBsYXllcl9yZWdpb24sIGlkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBoZXJvLm5hbWUgKyc8L2E+PC9kaXY+PC9kaXY+JztcclxuXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBLREFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8vR29vZCBrZGFcclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBrZGEgPSAnPHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIGhlcm8ua2RhX2F2ZyArICc8L3NwYW4+IEtEQSc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhaW5kaXYgPSBoZXJvLmtpbGxzX2F2ZyArICcgLyA8c3BhbiBjbGFzcz1cInBsLXRoLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgaGVyby5kZWF0aHNfYXZnICsgJzwvc3Bhbj4gLyAnICsgaGVyby5hc3Npc3RzX2F2ZztcclxuXHJcbiAgICAgICAgICAgIGxldCBrZGFmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgYWN0dWFsXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYS1rZGFcIj48c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj4nICtcclxuICAgICAgICAgICAgICAgIGtkYSArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgaW5kaXZcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWluZGl2XCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPicgK1xyXG4gICAgICAgICAgICAgICAga2RhaW5kaXYgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtdGVycmlibGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBoZXJvLndpbnJhdGUgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vUGxheWVkXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXRoLXdyLXBsYXllZFwiPicgK1xyXG4gICAgICAgICAgICAgICAgaGVyby5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5oZXJvTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PjwncGwtbGVmdHBhbmUtcGFnaW5hdGlvbidwPlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9waGVyb2VzLXRhYmxlXCIgY2xhc3M9XCJwbC10b3BoZXJvZXMtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJkLW5vbmVcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VG9wSGVyb2VzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9waGVyb2VzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvcG1hcHM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXBMaW1pdDogNiwgLy9Ib3cgbWFueSB0b3AgbWFwcyBzaG91bGQgYmUgZGlzcGxheWVkIGF0IGEgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wTWFwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC10b3BtYXBzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtdG9wbWFwcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPk1hcHM8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1taWQtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3BNYXBzVGFibGVEYXRhOiBmdW5jdGlvbihtYXApIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBtYXBpbWFnZSA9ICc8ZGl2IGNsYXNzPVwicGwtdG9wbWFwcy1tYXBiZ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcrIGltYWdlX2JwYXRoICsndWkvbWFwX2ljb25fJysgbWFwLmltYWdlICsnLnBuZyk7XCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXBuYW1lID0gJzxkaXYgY2xhc3M9XCJwbC10b3BtYXBzLW1hcG5hbWVcIj4nKyBtYXAubmFtZSArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWFwaW5uZXIgPSAnPGRpdiBjbGFzcz1cInBsLXRvcG1hcHMtbWFwcGFuZVwiPicrIG1hcGltYWdlICsgbWFwbmFtZSArICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogV2lucmF0ZSAvIFBsYXllZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIHdpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXAud2lucmF0ZV9yYXcgPj0gNTEpIHtcclxuICAgICAgICAgICAgICAgIGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUtZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFwLndpbnJhdGVfcmF3ID49IDYwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZWZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC13aW5yYXRlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicrIGdvb2R3aW5yYXRlICsnXCI+PHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIldpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIG1hcC5wbGF5ZWQgKyAnIHBsYXllZCcgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW21hcGlubmVyLCB3aW5yYXRlZmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VG9wTWFwc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS50b3BtYXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc29ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHNlbGYuaW50ZXJuYWwubWFwTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcE1hcHNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC10b3BtYXBzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtdG9wbWFwcy10YWJsZVwiIGNsYXNzPVwicGwtdG9wbWFwcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUb3BNYXBzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtdG9wbWFwcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJ0aWVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgcGFydHlMaW1pdDogNCwgLy9Ib3cgbWFueSBwYXJ0aWVzIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXQgYSB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVQYXJ0aWVzQ29udGFpbmVyOiBmdW5jdGlvbihsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1wYXJ0aWVzLWNvbnRhaW5lclwiIGNsYXNzPVwicGwtcGFydGllcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtcGFydGllcy10aXRsZVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJ1wiPlBhcnRpZXM8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItbGVmdHBhbmUtYm90LWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUGFydGllc1RhYmxlRGF0YTogZnVuY3Rpb24ocGFydHkpIHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUGFydHlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBwYXJ0eWlubmVyID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiBwYXJ0eS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJ0eWlubmVyICs9ICc8ZGl2IGNsYXNzPVwicGwtcC1wLXBsYXllciBwbC1wLXAtcGxheWVyLScrIHBhcnR5LnBsYXllcnMubGVuZ3RoICsnXCI+PGEgY2xhc3M9XCJwbC1wLXAtcGxheWVybmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7cmVnaW9uOiBwbGF5ZXJfcmVnaW9uLCBpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JysgcGxheWVyLm5hbWUgKyc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBhcnR5ZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXBhcnRpZXMtcGFydHlwYW5lXCI+JysgcGFydHlpbm5lciArJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBXaW5yYXRlIC8gUGxheWVkXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvL0dvb2Qgd2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZSc7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1iYWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnR5LndpbnJhdGVfcmF3IDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLXRlcnJpYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA+PSA1MSkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0eS53aW5yYXRlX3JhdyA+PSA2MCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVmaWVsZCA9ICc8ZGl2IGNsYXNzPVwicGwtdGgtd2lucmF0ZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCInKyBnb29kd2lucmF0ZSArJ1wiPjxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJXaW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwYXJ0eS53aW5yYXRlICsgJyUnICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllZFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC13ci1wbGF5ZWRcIj4nICtcclxuICAgICAgICAgICAgICAgIHBhcnR5LnBsYXllZCArICcgcGxheWVkJyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbcGFydHlmaWVsZCwgd2lucmF0ZWZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFBhcnRpZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEucGFydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSBzZWxmLmludGVybmFsLnBhcnR5TGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj48J3BsLWxlZnRwYW5lLXBhZ2luYXRpb24ncD5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVBhcnRpZXNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1wYXJ0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicGwtcGFydGllcy10YWJsZVwiIGNsYXNzPVwicGwtcGFydGllcy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cImQtbm9uZVwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRQYXJ0aWVzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcGwtcGFydGllcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgY29tcGFjdFZpZXc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBjb21wYWN0IHZpZXcgaXMgZW5hYmxlZCBmb3IgcmVjZW50IG1hdGNoZXNcclxuICAgICAgICAgICAgbWF0Y2hMb2FkZXJHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBjaGFydGRhdGFfd2lucmF0ZToge1xyXG4gICAgICAgICAgICAgICAgXCJXXCI6IDAsXHJcbiAgICAgICAgICAgICAgICBcIkxcIjogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2hhcnRzOiB7fSwgLy9PYmplY3Qgb2YgYWxsIGNoYXJ0anMgZ3JhcGhzIHJlbGF0ZWQgdG8gbWF0Y2hlc1xyXG4gICAgICAgICAgICBjb250cm9sUGFuZWxHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIG1hdGNoTWFuaWZlc3Q6IHt9IC8vS2VlcHMgdHJhY2sgb2Ygd2hpY2ggbWF0Y2ggaWRzIGFyZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkLCB0byBwcmV2ZW50IG9mZnNldCByZXF1ZXN0cyBmcm9tIHJlcGVhdGluZyBtYXRjaGVzIG92ZXIgbGFyZ2UgcGVyaW9kcyBvZiB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vUmVzZXQgY2hhcnRkYXRhXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRkYXRhX3dpbnJhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICBcIldcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiTFwiOiAwLFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9DbGVhciBjaGFydHMgb2JqZWN0XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXJ0a2V5IGluIHNlbGYuaW50ZXJuYWwuY2hhcnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5jaGFydHMuaGFzT3duUHJvcGVydHkoY2hhcnRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoYXJ0ID0gc2VsZi5pbnRlcm5hbC5jaGFydHNbY2hhcnRrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAvL2NvbXBhY3RWaWV3OiBsZWF2ZSB0aGUgc2V0dGluZyB0byB3aGF0ZXZlciBpdCBpcyBjdXJyZW50bHkgaW4gYmV0d2VlbiBmaWx0ZXIgbG9hZHNcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNNYXRjaEdlbmVyYXRlZDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0Lmhhc093blByb3BlcnR5KG1hdGNoaWQgKyBcIlwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbGF5ZXItcmlnaHRwYW5lLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lciBpbml0aWFsLWxvYWQgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBob3Jpem9udGFsLXNjcm9sbGVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU5vTWF0Y2hlc01lc3NhZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwbC1ub3JlY2VudG1hdGNoZXNcIj5ObyBSZWNlbnQgTWF0Y2hlcyBGb3VuZC4uLjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVDb250cm9sUGFuZWxNYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwuY29udHJvbFBhbmVsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsID0gJCgnI3BsLXJtLWNwLWxvYWRtb3JlcGFuZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBzdHlsZT1cImN1cnNvcjpwb2ludGVyO1wiIGNsYXNzPVwiZC1pbmxpbmUtYmxvY2tcIiB0aXRsZT1cIkxvYWQgTW9yZSBNYXRjaGVzLi4uXCI+PGkgY2xhc3M9XCJmYSBmYS1jaGFpbiBmYS0yeFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWwuaHRtbChodG1sKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbE1hdGNoTG9hZGVyR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0yeCBmYS1md1wiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcy5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxNYXRjaExvYWRlckdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsLmh0bWwoJycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWwub2ZmKCdjbGljaycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbE1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlUmVjZW50TWF0Y2hlc0NvbnRyb2xQYW5lbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb250cm9sUGFuZWxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250YWluZXIgPSAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbXBhY3QgTW9kZVxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbXBhY3QgPSAnZmEtYWxpZ24tanVzdGlmeSc7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5jb21wYWN0Vmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3QgPSAnZmEtdGgtbGlzdCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWNvbnRyb2xwYW5lbFwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlIEdyYXBoXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXJtLWNwLXdpbnJhdGUtY2hhcnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInBsLXJtLWNwLXdpbnJhdGUtcGVyY2VudFwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJwbC1ybS1jcC13aW5yYXRlLWNoYXJ0XCI+PC9jYW52YXM+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1JlY2VudCBNYXRjaGVzICMgKyBXaW5yYXRlIGxvbmd0ZXh0XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXJtLWNwLXdpbnJhdGUtbG9uZ3RleHQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInBsLXJtLWNwLXdpbnJhdGUtbHQtdGl0bGVcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3Atd2lucmF0ZS1sdC1udW1iZXJzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1NvY2lhbCBwYW5lXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsLXJtLWNwLXNvY2lhbHBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGNsYXNzPVwiZC1pbmxpbmUtYmxvY2sgc29jaWFsLWJ1dHRvbiBzdC1jdXN0b20tYnV0dG9uXCIgZGF0YS1uZXR3b3JrPVwiZmFjZWJvb2tcIiB0aXRsZT1cIlNoYXJlIG9uIEZhY2Vib29rXCI+PGkgY2xhc3M9XCJmYSBmYS1mYWNlYm9vay1zcXVhcmUgZmEtM3hcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBjbGFzcz1cImQtaW5saW5lLWJsb2NrIHNvY2lhbC1idXR0b24gc3QtY3VzdG9tLWJ1dHRvblwiIGRhdGEtbmV0d29yaz1cInR3aXR0ZXJcIiB0aXRsZT1cIlNoYXJlIG9uIFR3aXR0ZXJcIj48aSBjbGFzcz1cImZhIGZhLXR3aXR0ZXItc3F1YXJlIGZhLTN4XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgY2xhc3M9XCJkLWlubGluZS1ibG9jayBzb2NpYWwtYnV0dG9uIHN0LWN1c3RvbS1idXR0b25cIiBkYXRhLW5ldHdvcms9XCJyZWRkaXRcIiB0aXRsZT1cIlNoYXJlIG9uIFJlZGRpdFwiPjxpIGNsYXNzPVwiZmEgZmEtcmVkZGl0LXNxdWFyZSBmYS0zeFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGNsYXNzPVwiZC1pbmxpbmUtYmxvY2sgc29jaWFsLWJ1dHRvbiBzdC1jdXN0b20tYnV0dG9uXCIgZGF0YS1uZXR3b3JrPVwiZ29vZ2xlcGx1c1wiIHRpdGxlPVwiU2hhcmUgb24gR29vZ2xlK1wiPjxpIGNsYXNzPVwiZmEgZmEtZ29vZ2xlLXBsdXMtc3F1YXJlIGZhLTN4XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIE1vcmUgcGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJwbC1ybS1jcC1sb2FkbW9yZXBhbmVcIiBjbGFzcz1cInBsLXJtLWNwLWxvYWRtb3JlcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9Db21wYWN0IHBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicGwtcm0tY3AtY29tcGFjdHBhbmVcIiBjbGFzcz1cInBsLXJtLWNwLWNvbXBhY3RwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInBsLXJtLWNwLWNvbXBhY3RwYW5lLWlubmVyXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBjbGFzcz1cImQtaW5saW5lLWJsb2NrXCIgdGl0bGU9XCJUb2dnbGUgRGlzcGxheSBNb2RlXCI+PGkgY2xhc3M9XCJmYSAnKyBjb21wYWN0ICsnIGZhLTJ4XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIHNoYXJlIHRoaXMgYWZ0ZXIgbG9hZFxyXG4gICAgICAgICAgICAgICAgd2luZG93Ll9fc2hhcmV0aGlzX18uaW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgZ3JhcGhzXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ29tcGFjdCBQYW5lIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgJCgnI3BsLXJtLWNwLWNvbXBhY3RwYW5lJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbnRlcm5hbCA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuaW50ZXJuYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSAkKCcjcGwtcm0tY3AtY29tcGFjdHBhbmUtaW5uZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsLmNvbXBhY3RWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5yZWNlbnRtYXRjaC1jb250YWluZXItY29tcGFjdC1jb2xsYXBzYWJsZScpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnJlY2VudG1hdGNoLWNvbnRhaW5lci1jb2xsYXBzYWJsZScpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2hvdHN0YXR1cy5jb21wYWN0dG9nZ2xlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWwuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1hbGlnbi1qdXN0aWZ5IGZhLTJ4XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbC5jb21wYWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnJlY2VudG1hdGNoLWNvbnRhaW5lci1jb21wYWN0LWNvbGxhcHNhYmxlJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcucmVjZW50bWF0Y2gtY29udGFpbmVyLWNvbGxhcHNhYmxlJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignaG90c3RhdHVzLmNvbXBhY3R0b2dnbGUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXRoLWxpc3QgZmEtMnhcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVybmFsLmNvbXBhY3RWaWV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbnRyb2xQYW5lbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFsxXSwgLy9FbXB0eSBpbml0aWFsIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNjZDJlMmRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIzNiZTE1OVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjMWMyMjIzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiMxYzIyMjNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0c1tcIndpbnJhdGVcIl0gPSBuZXcgQ2hhcnQoJCgnI3BsLXJtLWNwLXdpbnJhdGUtY2hhcnQnKSwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvdWdobnV0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlR3JhcGhSZWNlbnRNYXRjaGVzV2lucmF0ZTogZnVuY3Rpb24oY2hhcnRkYXRhKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IHNlbGYuaW50ZXJuYWwuY2hhcnRzLndpbnJhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgIC8vVXBkYXRlIHdpbnJhdGUgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllZCA9IGNoYXJ0ZGF0YVswXSArIGNoYXJ0ZGF0YVsxXTtcclxuICAgICAgICAgICAgICAgIGxldCB3aW5zID0gY2hhcnRkYXRhWzBdICogMS4wO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvc3NlcyA9IGNoYXJ0ZGF0YVsxXSAqIDEuMDtcclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlID0gMTAwLjA7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZTtcclxuICAgICAgICAgICAgICAgIGlmIChsb3NzZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZSA9ICh3aW5zIC8gKHdpbnMgKyBsb3NzZXMpKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbnJhdGVfZGlzcGxheSA9IHdpbnJhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lucmF0ZV9kaXNwbGF5ID0gd2lucmF0ZV9kaXNwbGF5LnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGdvb2R3aW5yYXRlID0gJ3BsLXRoLXdyLXdpbnJhdGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWJhZCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS10ZXJyaWJsZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlID49IDUxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZHdpbnJhdGUgPSAncGwtdGgtd3Itd2lucmF0ZS1nb29kJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGUgPj0gNjApIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29kd2lucmF0ZSA9ICdwbC10aC13ci13aW5yYXRlLWdyZWF0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPVxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiJysgZ29vZHdpbnJhdGUgKydcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICB3aW5yYXRlX2Rpc3BsYXkgKyAnJScgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJyNwbC1ybS1jcC13aW5yYXRlLXBlcmNlbnQnKS5odG1sKHdpbnJhdGVmaWVsZCk7XHJcbiAgICAgICAgICAgICAgICAkKCcjcGwtcm0tY3Atd2lucmF0ZS1sdC10aXRsZScpLmh0bWwoJ1JlY2VudCAnKyBwbGF5ZWQgKyAnIE1hdGNoZXMnKTtcclxuICAgICAgICAgICAgICAgICQoJyNwbC1ybS1jcC13aW5yYXRlLWx0LW51bWJlcnMnKS5odG1sKCc8ZGl2IGNsYXNzPVwicGwtcm0tY3Atd2lucmF0ZS1sdC1udW1iZXIgZC1pbmxpbmUtYmxvY2sgcGwtcmVjZW50bWF0Y2gtd29uXCI+Jysgd2lucyArJ1c8L2Rpdj4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC1ybS1jcC13aW5yYXRlLWx0LW51bWJlciBkLWlubGluZS1ibG9jayBwbC1yZWNlbnRtYXRjaC1sb3N0XCI+JysgbG9zc2VzICsnTDwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBkYXRhXHJcbiAgICAgICAgICAgICAgICBjaGFydC5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBbY2hhcnRkYXRhWzFdLCBjaGFydGRhdGFbMF1dOyAvL0ZsaXAgd2lucy9sb3NzZXMgc28gdGhhdCB3aW5zIGFwcGVhciBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBkb3VnaG51dFxyXG5cclxuICAgICAgICAgICAgICAgIC8vVXBkYXRlIGNoYXJ0IChkdXJhdGlvbjogMCA9IG1lYW5zIG5vIGFuaW1hdGlvbilcclxuICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyBhbGwgc3ViY29tcG9uZW50cyBvZiBhIG1hdGNoIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBjb21wb25lbnQgY29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGUgb25lLXRpbWUgcGFydHkgY29sb3JzIGZvciBtYXRjaFxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IFsxLCAyLCAzLCA0LCA1XTsgLy9BcnJheSBvZiBjb2xvcnMgdG8gdXNlIGZvciBwYXJ0eSBhdCBpbmRleCA9IHBhcnR5SW5kZXggLSAxXHJcbiAgICAgICAgICAgIEhvdHN0YXR1cy51dGlsaXR5LnNodWZmbGUocGFydGllc0NvbG9ycyk7XHJcblxyXG4gICAgICAgICAgICAvL0xvZyBtYXRjaCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGZ1bGxHZW5lcmF0ZWQ6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaGFzIGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgICAgICAgICAgZnVsbERpc3BsYXk6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgbWF0Y2hQbGF5ZXI6IG1hdGNoLnBsYXllci5pZCwgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWVzQ29sb3JzOiBwYXJ0aWVzQ29sb3JzLCAvL0NvbG9ycyB0byB1c2UgZm9yIHRoZSBwYXJ0eSBpbmRleGVzXHJcbiAgICAgICAgICAgICAgICBzaG93bjogdHJ1ZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgbWF0Y2hzaW1wbGV3aWRnZXQgaXMgZXhwZWN0ZWQgdG8gYmUgc2hvd24gaW5zaWRlIHZpZXdwb3J0XHJcbiAgICAgICAgICAgICAgICBzaG93Q29tcGFjdDogdHJ1ZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgY29tcGFjdCBtYXRjaHNpbXBsZXdpZGdldCBpcyBleHBlY3RlZCB0byBiZSBzaG93biBpbnNpZGUgdmlld3BvcnQgd2hlbiBjb21wYWN0IG1vZGUgaXMgb25cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vVHJhY2sgd2lucmF0ZSBmb3IgZ3JhcGhzXHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIud29uKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0ZGF0YV93aW5yYXRlW1wiV1wiXSsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydGRhdGFfd2lucmF0ZVtcIkxcIl0rKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJ3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyBpbWFnZV9icGF0aCArIHRhbGVudC5pbWFnZSArJy5wbmdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtyZWdpb246IG1hdGNoLnJlZ2lvbiwgaWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgaW1hZ2VfYnBhdGggKyBwbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L3NwYW4+JyArIHBhcnR5ICsgc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDEyKSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1jb250YWluZXItJysgbWF0Y2guaWQgKydcIiBjbGFzcz1cInJlY2VudG1hdGNoLWNvbnRhaW5lci1jb2xsYXBzYWJsZVwiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1vdXRsaW5lLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXJcIj4nICsgLy9IaWRlIGlubmVyIGNvbnRlbnRzIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtbGVmdHBhbmUgJyArIHNlbGYuY29sb3JfTWF0Y2hXb25Mb3N0KG1hdGNoLnBsYXllci53b24pICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyBpbWFnZV9icGF0aCArIG1hdGNoLm1hcF9pbWFnZSArJy5wbmcpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGUtdGV4dFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtYXRjaC5tYXAgKyAnXCI+JyArIG1hdGNoLmdhbWVUeXBlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZGF0ZS10ZXh0XCI+JyArIHJlbGF0aXZlX2RhdGUgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBtYXRjaC5wbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge3JlZ2lvbjogbWF0Y2gucmVnaW9uLCBpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtc3RhdHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdlwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LXRleHRcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgbWF0Y2gucGxheWVyLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBtYXRjaC5wbGF5ZXIuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgbWF0Y2gucGxheWVyLmFzc2lzdHMgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgbWF0Y2gucGxheWVyLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC10YWxlbnRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy10cC10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1wbGF5ZXJzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1wcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9IaWRlIGJhc2Ugb24gY29tcGFjdCBzdGF0ZVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5jb21wYWN0Vmlldykge1xyXG4gICAgICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLWNvbnRhaW5lci0nKyBtYXRjaC5pZCkuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0dlbmVyYXRlIGhpZGRlbiBjb21wYWN0IHZpZXcgd2lkZ2V0XHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVDb21wYWN0Vmlld01hdGNoV2lkZ2V0KG1hdGNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBzY3JvbGwgbGlzdGVuZXIgZm9yIGhpZGluZyBvdXRzaWRlIG9mIHZpZXdwb3J0XHJcbiAgICAgICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZSBzY3JvbGwgaG90c3RhdHVzLm1hdGNodG9nZ2xlIGhvdHN0YXR1cy5jb21wYWN0dG9nZ2xlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYW5pZmVzdCA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCkuaXNPblNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LW91dGxpbmUtY29udGFpbmVyLScgKyBtYXRjaC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItJyArIG1hdGNoLmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29tcGFjdFZpZXdNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJ3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dhbWVUeXBlXHJcbiAgICAgICAgICAgIGxldCBnYW1lVHlwZSA9IG1hdGNoLmdhbWVUeXBlO1xyXG4gICAgICAgICAgICBsZXQgZ2FtZVR5cGVfZGlzcGxheSA9IGdhbWVUeXBlO1xyXG4gICAgICAgICAgICBpZiAoZ2FtZVR5cGUgPT09IFwiSGVybyBMZWFndWVcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtaGxcIj5ITDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiVGVhbSBMZWFndWVcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtdGxcIj5UTDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiVW5yYW5rZWQgRHJhZnRcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtdWRcIj5VRDwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZVR5cGUgPT09IFwiUXVpY2sgTWF0Y2hcIikge1xyXG4gICAgICAgICAgICAgICAgZ2FtZVR5cGVfZGlzcGxheSA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUgcm0tc3ctY29tcGFjdC1ndHAtZ2FtZVR5cGUtcW1cIj5RTTwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vSGVyb1xyXG4gICAgICAgICAgICBsZXQgaGVybyA9IG1hdGNoLnBsYXllci5oZXJvO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci1jb21wYWN0LScrIG1hdGNoLmlkICsnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1jb250YWluZXItY29tcGFjdC1jb2xsYXBzYWJsZVwiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtY29tcGFjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtY29tcGFjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItY29tcGFjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItY29tcGFjdFwiPicgKyAvL0hpZGUgaW5uZXIgY29udGVudHMgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LXZpY3RvcnlwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtdnAtdmljdG9yeVwiPicrIHZpY3RvcnlUZXh0ICsnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0dhbWVUeXBlIFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1nYW1ldHlwZXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIGdhbWVUeXBlX2Rpc3BsYXkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9IZXJvIFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWhwLWhlcm8gcGwtdGgtaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge3JlZ2lvbjogbWF0Y2gucmVnaW9uLCBpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NYXAgUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LW1hcHBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1tcC1tYXBcIj4nKyBtYXRjaC5tYXAgKyc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTWF0Y2ggTGVuZ3RoIFBhbmVcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1tYXRjaGxlbmd0aHBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctY29tcGFjdC1tbHAtbWF0Y2hsZW5ndGhcIj4nKyBtYXRjaF90aW1lICsnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0RhdGUgUGFuZVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1jb21wYWN0LWRhdGVwYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWNvbXBhY3QtZHAtZGF0ZVwiPicrIGRhdGUgKyc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vSW5zcGVjdFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC1jb21wYWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LWNvbXBhY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vSGlkZSBiYXNlIG9uIGNvbXBhY3Qgc3RhdGVcclxuICAgICAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmNvbXBhY3RWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLWNvbXBhY3QtJysgbWF0Y2guaWQpLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2xpY2sgbGlzdGVuZXJzIGZvciBpbnNwZWN0IHBhbmVcclxuICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LWNvbXBhY3QtJyArIG1hdGNoLmlkKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUGFuZShtYXRjaC5pZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgc2Nyb2xsIGxpc3RlbmVyIGZvciBoaWRpbmcgb3V0c2lkZSBvZiB2aWV3cG9ydFxyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemUgc2Nyb2xsIGhvdHN0YXR1cy5tYXRjaHRvZ2dsZSBob3RzdGF0dXMuY29tcGFjdHRvZ2dsZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW50ZXJuYWwgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmludGVybmFsO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hbmlmZXN0ID0gaW50ZXJuYWwubWF0Y2hNYW5pZmVzdDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWwuY29tcGFjdFZpZXcgJiYgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWNvbXBhY3QtJyArIG1hdGNoLmlkKS5pc09uU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItY29tcGFjdC0nICsgbWF0Y2guaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnNob3duQ29tcGFjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd25Db21wYWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbCA9ICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtb3V0bGluZS1jb250YWluZXItY29tcGFjdC0nICsgbWF0Y2guaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0uc2hvd25Db21wYWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5zaG93bkNvbXBhY3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKFwiaG90c3RhdHVzLm1hdGNodG9nZ2xlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKFwiaG90c3RhdHVzLm1hdGNodG9nZ2xlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJyArIG1hdGNoaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2hcIj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmxvYWRNYXRjaChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2cgYXMgZ2VuZXJhdGVkIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzOiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBmdWxsbWF0Y2hfY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRlYW1zXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZnVsbG1hdGNoX2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCArJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlYW1fY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gUm93IEhlYWRlclxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcih0ZWFtX2NvbnRhaW5lciwgdGVhbSwgbWF0Y2gud2lubmVyID09PSB0LCBtYXRjaC5oYXNCYW5zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBwbGF5ZXJzIGZvciB0ZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9QbGF5ZXIgUm93XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxtYXRjaFJvdyhtYXRjaGlkLCBtYXRjaC5yZWdpb24sIHRlYW1fY29udGFpbmVyLCBwbGF5ZXIsIHRlYW0uY29sb3IsIG1hdGNoLnN0YXRzLCBwICUgMiwgcGFydGllc0NvdW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHArKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyOiBmdW5jdGlvbihjb250YWluZXIsIHRlYW0sIHdpbm5lciwgaGFzQmFucykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL1ZpY3RvcnlcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnkgPSAod2lubmVyKSA/ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5XCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1kZWZlYXRcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0JhbnNcclxuICAgICAgICAgICAgbGV0IGJhbnMgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgICAgIGJhbnMgKz0gJ0JhbnM6ICc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiYW4gb2YgdGVhbS5iYW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFucyArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGJhbi5uYW1lICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yaC1iYW5cIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBiYW4uaW1hZ2UgKycucG5nXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgta2RhLWNvbnRhaW5lclwiPktEQTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0aXN0aWNzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1zdGF0aXN0aWNzLWNvbnRhaW5lclwiPlBlcmZvcm1hbmNlPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaHJlZ2lvbiwgY29udGFpbmVyLCBwbGF5ZXIsIHRlYW1Db2xvciwgbWF0Y2hTdGF0cywgb2RkRXZlbiwgcGFydGllc0NvdW50ZXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBwbGF5ZXJcclxuICAgICAgICAgICAgbGV0IG1hdGNoUGxheWVySWQgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLm1hdGNoUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAndWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyIG5hbWVcclxuICAgICAgICAgICAgbGV0IHBsYXllcm5hbWUgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnJztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2hQbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSBybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgJysgc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpICsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtyZWdpb246IG1hdGNocmVnaW9uLCBpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICs9IHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxNCkgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPic7XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IHBsYXllci5tZWRhbDtcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1pbm5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tZm0tci1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIGltYWdlX2JwYXRoICsgbWVkYWwuaW1hZ2UgKyAnXycrIHRlYW1Db2xvciArJy5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLWZtLXItdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBwbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItdGFsZW50XCIgc3JjPVwiJyArIGltYWdlX2JwYXRoICsgdGFsZW50LmltYWdlICsnLnBuZ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3RhdHNcclxuICAgICAgICAgICAgbGV0IHN0YXRzID0gcGxheWVyLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRfdG9vbHRpcCA9IGZ1bmN0aW9uICh2YWwsIGRlc2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyc8YnI+JysgZGVzYztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0cyA9IFtcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVyb19kYW1hZ2VcIiwgY2xhc3M6IFwiaGVyb2RhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZXJvIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJzaWVnZV9kYW1hZ2VcIiwgY2xhc3M6IFwic2llZ2VkYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnU2llZ2UgRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcIm1lcmNfY2FtcHNcIiwgY2xhc3M6IFwibWVyY2NhbXBzXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ01lcmMgQ2FtcHMgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVhbGluZ1wiLCBjbGFzczogXCJoZWFsaW5nXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlYWxpbmcnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZGFtYWdlX3Rha2VuXCIsIGNsYXNzOiBcImRhbWFnZXRha2VuXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0RhbWFnZSBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJleHBfY29udHJpYlwiLCBjbGFzczogXCJleHBjb250cmliXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0V4cGVyaWVuY2UgQ29udHJpYnV0aW9uJ31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoc3RhdCBvZiByb3dzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IG1hdGNoU3RhdHNbc3RhdC5rZXldW1wibWF4XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50T25SYW5nZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRPblJhbmdlID0gKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIC8gKG1heCAqIDEuMDApKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQud2lkdGggPSBwZXJjZW50T25SYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlID0gc3RhdHNbc3RhdC5rZXldO1xyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSBzdGF0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9ICc8c3BhbiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyLW5vbmVcIj4nICsgc3RhdC52YWx1ZSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnRvb2x0aXAgPSByb3dzdGF0X3Rvb2x0aXAoc3RhdC52YWx1ZSwgc3RhdC50b29sdGlwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0Lmh0bWwgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHN0YXQudG9vbHRpcCArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1yb3dcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy0nKyBzdGF0LmNsYXNzICsnIHJtLWZtLXItc3RhdHMtYmFyXCIgc3R5bGU9XCJ3aWR0aDogJysgc3RhdC53aWR0aCArJyVcIj48L2Rpdj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXJcIj4nKyBzdGF0LnZhbHVlRGlzcGxheSArJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL01NUlxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFUeXBlID0gXCJuZWdcIjtcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhUHJlZml4ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5tbXIuZGVsdGEgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFUeXBlID0gXCJwb3NcIjtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhUHJlZml4ID0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhID0gcGxheWVyLm1tci5yYW5rICsnICcrIHBsYXllci5tbXIudGllciArJyAoPHNwYW4gY2xhc3M9XFwncm0tZm0tci1tbXItZGVsdGEtJysgbW1yRGVsdGFUeXBlICsnXFwnPicrIG1tckRlbHRhUHJlZml4ICsgcGxheWVyLm1tci5kZWx0YSArJzwvc3Bhbj4pJztcclxuXHJcbiAgICAgICAgICAgIC8vUGFydHlcclxuICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFydHkgPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5IHJtLXBhcnR5LW1kIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1tZCBybS1wYXJ0eS1tZC1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQnVpbGQgaHRtbFxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93IHJtLWZtLXJvdy0nKyBvZGRFdmVuICsnXCI+JyArXHJcbiAgICAgICAgICAgIC8vUGFydHkgU3RyaXBlXHJcbiAgICAgICAgICAgIHBhcnR5ICtcclxuICAgICAgICAgICAgLy9IZXJvIEltYWdlIENvbnRhaW5lciAoV2l0aCBIZXJvIExldmVsKVxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItaGVyb2xldmVsXCI+JysgcGxheWVyLmhlcm9fbGV2ZWwgKyc8L2Rpdj48aW1nIGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYnBhdGggKyBwbGF5ZXIuaW1hZ2VfaGVybyArJy5wbmdcIj48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9QbGF5ZXIgTmFtZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTWVkYWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1RhbGVudHMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnRzLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vS0RBIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWluZGl2XCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nXHJcbiAgICAgICAgICAgICsgc3RhdHMua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIHN0YXRzLmRlYXRocyArICc8L3NwYW4+IC8gJyArIHN0YXRzLmFzc2lzdHMgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBzdGF0cy5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBPZmZlbnNlIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtb2ZmZW5zZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzFdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1syXS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIFV0aWxpdHkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy11dGlsaXR5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1szXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzVdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTU1SIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLXRvb2x0aXAtYXJlYVwiIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgbW1yRGVsdGEgKydcIj48aW1nIGNsYXNzPVwicm0tZm0tci1tbXJcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9yYW5rZWRfcGxheWVyX2ljb25fJyArIHBsYXllci5tbXIucmFuayArJy5wbmdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItbnVtYmVyXCI+JysgcGxheWVyLm1tci50aWVyICsnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlcmh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyXCI+TG9hZCBNb3JlIE1hdGNoZXMuLi48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGxvYWRlcmh0bWwpO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0xeCBmYS1md1wiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcy5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xvcl9NYXRjaFdvbkxvc3Q6IGZ1bmN0aW9uKHdvbikge1xyXG4gICAgICAgICAgICBpZiAod29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLXdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLWxvc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWxlbnR0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9KcXVlcnkgaXNPblNjcmVlbiAoUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgY2FsbGluZyBzZWxlY3RvciBpcyBpbnNpZGUgdGhlIHZpZXdwb3J0ICsgcGFkZGVkIHpvbmUgZm9yIHNjcm9sbCBzbW9vdGhuZXNzKVxyXG4gICAgJC5mbi5pc09uU2NyZWVuID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgd2luID0gJCh3aW5kb3cpO1xyXG5cclxuICAgICAgICBsZXQgcGFkU2l6ZSA9IDYwMDtcclxuXHJcbiAgICAgICAgbGV0IHZpZXdwb3J0ID0ge1xyXG4gICAgICAgICAgICB0b3AgOiB3aW4uc2Nyb2xsVG9wKCkgLSBwYWRTaXplLFxyXG4gICAgICAgICAgICBsZWZ0IDogd2luLnNjcm9sbExlZnQoKSAtIHBhZFNpemVcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZpZXdwb3J0LnJpZ2h0ID0gdmlld3BvcnQubGVmdCArIHdpbi53aWR0aCgpICsgKDIgKiBwYWRTaXplKTtcclxuICAgICAgICB2aWV3cG9ydC5ib3R0b20gPSB2aWV3cG9ydC50b3AgKyB3aW4uaGVpZ2h0KCkgKyAoMiAqIHBhZFNpemUpO1xyXG5cclxuICAgICAgICBsZXQgYm91bmRzID0gdGhpcy5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgaWYgKCFib3VuZHMpIHJldHVybiBmYWxzZTsgLy9DYXRjaCB1bmRlZmluZWQgYm91bmRzIGNhdXNlZCBieSBqcXVlcnkgYW5pbWF0aW9ucyBvZiBvYmplY3RzIG91dHNpZGUgb2YgdGhlIHZpZXdwb3J0XHJcblxyXG4gICAgICAgIGJvdW5kcy5yaWdodCA9IGJvdW5kcy5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgYm91bmRzLmJvdHRvbSA9IGJvdW5kcy50b3AgKyB0aGlzLm91dGVySGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoISh2aWV3cG9ydC5yaWdodCA8IGJvdW5kcy5sZWZ0IHx8IHZpZXdwb3J0LmxlZnQgPiBib3VuZHMucmlnaHQgfHwgdmlld3BvcnQuYm90dG9tIDwgYm91bmRzLnRvcCB8fCB2aWV3cG9ydC50b3AgPiBib3VuZHMuYm90dG9tKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcicsIHtyZWdpb246IHBsYXllcl9yZWdpb24sIHBsYXllcjogcGxheWVyX2lkfSk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAvL2ZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwpO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=