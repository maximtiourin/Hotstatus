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

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#playerloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];

            /*
             * Empty dynamically filled containers, reset all subajax objects
             */
            ajax.matches.reset();

            /*
             * Heroloader Container
             */
            $('#playerloader-container').removeClass('initial-load');

            /*
             * Initial matches
             */
            var ajaxMatches = ajax.matches;
            ajaxMatches.internal.offset = 0;
            ajaxMatches.internal.limit = json.limits.matches;

            //Load initial match set
            ajaxMatches.load();

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
            //Set new offset
            self.internal.offset = json_offsets.matches + self.internal.limit;

            //Append new Match widgets for matches that aren't in the manifest
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = json_matches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var match = _step.value;

                    if (!data_matches.isMatchGenerated(match)) {
                        data_matches.generateMatch(match);
                    }
                }

                //Set displayMatchLoader if we got as many matches as we asked for
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

            if (json_matches.length >= self.internal.limit) {
                displayMatchLoader = true;
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
    matches: {
        internal: {
            matchLoaderGenerated: false,
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        generateMatch: function generateMatch(match) {
            //Generates all subcomponents of a match display
            var self = PlayerLoader.data.matches;

            //Match component container
            var html = '<div id="pl-recentmatch-container-' + match.id + '" class="pl-recentmatch-container"></div>';

            $('#pl-recentmatches-container').append(html);

            //Log match in manifest
            self.internal.matchManifest[match.id + ""] = {
                fullGenerated: false, //Whether or not the full match data has been loaded for the first time
                fullDisplay: false, //Whether or not the full match data is currently toggled to display
                matchPlayer: match.player.id //Id of the match's player for whom the match is being displayed, for use with highlighting inside of fullmatch (while decoupling mainplayer)
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
            var t = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = match.teams[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var team = _step2.value;

                    playershtml += '<div class="rm-sw-pp-team' + t + '">';

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = team.players[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var player = _step3.value;

                            var special = '<a class="' + silence(player.silenced) + '" href="' + Routing.generate("player", { id: player.id }) + '" target="_blank">';
                            if (player.id === match.player.id) {
                                special = '<a class="rm-sw-special">';
                            }

                            playershtml += '<div class="rm-sw-pp-player"><span data-toggle="tooltip" data-html="true" title="' + player.hero + '"><img class="rm-sw-pp-player-image" src="' + player.image_hero + '"></span>' + silence_image(player.silenced, 12) + special + player.name + '</a></div>';
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

                    playershtml += '</div>';

                    t++;
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
            var t = 0;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = match.teams[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var team = _step4.value;

                    //Team Container
                    fullmatch_container.append('<div id="recentmatch-fullmatch-team-container-' + matchid + '"></div>');
                    var team_container = $('#recentmatch-fullmatch-team-container-' + matchid);

                    //Team Row Header
                    self.generateFullMatchRowHeader(team_container, team, match.winner === t, match.hasBans);

                    //Loop through players for team
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = team.players[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var player = _step5.value;

                            //Player Row
                            self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats);
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
        },
        generateFullMatchRowHeader: function generateFullMatchRowHeader(container, team, winner, hasBans) {
            var self = PlayerLoader.data.matches;

            //Victory
            var victory = winner ? '<span class="rm-fm-rh-victory">Victory</span>' : '<span class="rm-fm-rh-defeat">Defeat</span>';

            //Bans
            var bans = '';
            if (hasBans) {
                bans += 'Bans: ';
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = team.bans[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var ban = _step6.value;

                        bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="' + ban.image + '"></span>';
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
            }

            var html = '<div class="rm-fm-rowheader">' +
            //Victory Container
            '<div class="rm-fm-rh-victory-container">' + victory + '</div>' +
            //Team Level Container
            '<div class="rm-fm-rh-level-container">' + team.level + '</div>' +
            //Bans Container
            '<div class="rm-fm-rh-bans-container">' + bans + '</div>' +
            //Mmr Container
            '<div class="rm-fm-rh-mmr-container">MMR: <span class="rm-fm-rh-mmr">' + team.mmr.old.rating + '</span></div>' + '</div>';

            container.append(html);
        },
        generateFullmatchRow: function generateFullmatchRow(matchid, container, player, teamColor, matchStats) {
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

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = rowstats[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    stat = _step7.value;

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

                //Build html
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

            var html = '<div class="rm-fm-row">' +
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
            '<div class="rm-fm-r-stats-utility-container">' + rowstats[3].html + rowstats[4].html + rowstats[5].html + '</div>' + '</div>';

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
        isMatchGenerated: function isMatchGenerated(matchid) {
            var self = PlayerLoader.data.matches;

            return self.internal.matchManifest.hasOwnProperty(matchid + "");
        },
        talenttooltip: function talenttooltip(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        },
        empty: function empty() {
            var self = PlayerLoader.data.matches;

            $('#pl-recentmatches-container').empty();
            self.internal.matchLoaderGenerated = false;
            self.internal.matchManifest = {};
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_pagedata_player', { player: player_id });

    var filterTypes = ["season", "gameType"];
    var filterAjax = PlayerLoader.ajax.filter;

    filterAjax.validateLoad(baseUrl);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWFmNWUxYzU2NmMzZjliOGQ2ZGQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwibWF0Y2hlcyIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJhamF4TWF0Y2hlcyIsIm9mZnNldCIsImxpbWl0IiwibGltaXRzIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJtYXRjaGxvYWRpbmciLCJtYXRjaHVybCIsImVtcHR5IiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImdlbmVyYXRlTWF0Y2hVcmwiLCJtYXRjaF9pZCIsIm1hdGNoaWQiLCJkYXRhX21hdGNoZXMiLCJkaXNwbGF5TWF0Y2hMb2FkZXIiLCJqc29uX29mZnNldHMiLCJvZmZzZXRzIiwianNvbl9saW1pdHMiLCJqc29uX21hdGNoZXMiLCJtYXRjaCIsImlzTWF0Y2hHZW5lcmF0ZWQiLCJnZW5lcmF0ZU1hdGNoIiwiZ2VuZXJhdGVfbWF0Y2hMb2FkZXIiLCJyZW1vdmVfbWF0Y2hMb2FkZXIiLCJsb2FkTWF0Y2giLCJqc29uX21hdGNoIiwiZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzIiwibWF0Y2hMb2FkZXJHZW5lcmF0ZWQiLCJtYXRjaE1hbmlmZXN0IiwiaHRtbCIsImlkIiwiYXBwZW5kIiwiZnVsbEdlbmVyYXRlZCIsImZ1bGxEaXNwbGF5IiwibWF0Y2hQbGF5ZXIiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwiZGF0ZSIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0Iiwid29uIiwibWVkYWwiLCJzaWxlbmNlIiwiaXNTaWxlbmNlZCIsInIiLCJzaWxlbmNlX2ltYWdlIiwic2l6ZSIsInMiLCJwYXRoIiwiaW1hZ2VfYnBhdGgiLCJnb29ka2RhIiwia2RhX3JhdyIsIm1lZGFsaHRtbCIsIm5vbWVkYWxodG1sIiwiZXhpc3RzIiwibmFtZSIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJ0YWxlbnRzaHRtbCIsImkiLCJ0YWxlbnRzIiwidGFsZW50IiwidGFsZW50dG9vbHRpcCIsInBsYXllcnNodG1sIiwidCIsInRlYW1zIiwidGVhbSIsInBsYXllcnMiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJoZXJvIiwiaW1hZ2VfaGVybyIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsIm1hcCIsImdhbWVUeXBlIiwiaGVyb1Byb3Blck5hbWUiLCJraWxscyIsImRlYXRocyIsImFzc2lzdHMiLCJrZGEiLCJjbGljayIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJzbGlkZVVwIiwiZnVsbG1hdGNoX2NvbnRhaW5lciIsInRlYW1fY29udGFpbmVyIiwiZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIiLCJ3aW5uZXIiLCJoYXNCYW5zIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsInN0YXRzIiwiY29udGFpbmVyIiwidmljdG9yeSIsImJhbnMiLCJiYW4iLCJsZXZlbCIsIm1tciIsIm9sZCIsInJhdGluZyIsInRlYW1Db2xvciIsIm1hdGNoU3RhdHMiLCJtYXRjaFBsYXllcklkIiwicGxheWVybmFtZSIsInJvd3N0YXRfdG9vbHRpcCIsImRlc2MiLCJyb3dzdGF0cyIsImtleSIsImNsYXNzIiwid2lkdGgiLCJ2YWx1ZSIsInZhbHVlRGlzcGxheSIsInN0YXQiLCJtYXgiLCJwZXJjZW50T25SYW5nZSIsImhlcm9fbGV2ZWwiLCJsb2FkZXJodG1sIiwiaGFzT3duUHJvcGVydHkiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsImZpbHRlckFqYXgiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsIm9uIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REE7Ozs7QUFJQSxJQUFJQSxlQUFlLEVBQW5COztBQUVBOzs7QUFHQUEsYUFBYUMsSUFBYixHQUFvQjtBQUNoQjs7O0FBR0FDLFdBQU8sZUFBU0MsWUFBVCxFQUF1QkMsSUFBdkIsRUFBNkI7QUFDaENDLG1CQUFXRCxJQUFYLEVBQWlCRCxZQUFqQjtB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QUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0FLLE1BQUUsd0JBQUYsRUFBNEJ3SixFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEckssd0JBQWdCbUssaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDNUosV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FLLE1BQUUsR0FBRixFQUFPd0osRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q0osbUJBQVc3SixZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLjUzYTg5NGQ0ZWViNDlmN2ZjYjczLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYWFmNWUxYzU2NmMzZjliOGQ2ZGQiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheC5tYXRjaGVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhNYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogNiwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHNlbGYuaW50ZXJuYWwub2Zmc2V0LFxyXG4gICAgICAgICAgICBsaW1pdDogc2VsZi5pbnRlcm5hbC5saW1pdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZU1hdGNoVXJsOiBmdW5jdGlvbihtYXRjaF9pZCkge1xyXG4gICAgICAgIHJldHVybiBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9tYXRjaFwiLCB7XHJcbiAgICAgICAgICAgIG1hdGNoaWQ6IG1hdGNoX2lkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIGxldCBkaXNwbGF5TWF0Y2hMb2FkZXIgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBvZmZzZXRcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID49IHNlbGYuaW50ZXJuYWwubGltaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWF0Y2hMb2FkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXkgbWF0Y2ggbG9hZGVyIGJ1dHRvbiBpZiBoYWROZXdNYXRjaFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlNYXRjaExvYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHRoZSBtYXRjaCBvZiBnaXZlbiBpZCB0byBiZSBkaXNwbGF5ZWQgdW5kZXIgbWF0Y2ggc2ltcGxld2lkZ2V0XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXRjaDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gc2VsZi5nZW5lcmF0ZU1hdGNoVXJsKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZnVsbG1hdGNoLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLm1hdGNodXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaCA9IGpzb24ubWF0Y2g7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlRnVsbE1hdGNoUm93cyhtYXRjaGlkLCBqc29uX21hdGNoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZ1bGxtYXRjaC1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblBsYXllckxvYWRlci5kYXRhID0ge1xyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGlzIGN1cnJlbnRseSB0b2dnbGVkIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIG1hdGNoUGxheWVyOiBtYXRjaC5wbGF5ZXIuaWQgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hXaWRnZXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIFdpZGdldCBDb250YWluZXJcclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZV9kYXRlID0gSG90c3RhdHVzLmRhdGUuZ2V0UmVsYXRpdmVUaW1lKHRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gbWF0Y2gucGxheWVyLm1lZGFsO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnX2JsdWUucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCA9IFwiPGRpdiBjbGFzcz0ncm0tc3ctc3Atb2Zmc2V0Jz48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXRwLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gbWF0Y2gucGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy10cC10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyc1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyc2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJzxhIGNsYXNzPVwiJytzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgcGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9zcGFuPicgKyBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTIpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci0nKyBtYXRjaC5pZCArJ1wiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1sZWZ0cGFuZSAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArIG1hdGNoLm1hcF9pbWFnZSArICcpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGUtdGV4dFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtYXRjaC5tYXAgKyAnXCI+JyArIG1hdGNoLmdhbWVUeXBlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZGF0ZS10ZXh0XCI+JyArIHJlbGF0aXZlX2RhdGUgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtc3RhdHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdlwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LXRleHRcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgbWF0Y2gucGxheWVyLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBtYXRjaC5wbGF5ZXIuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgbWF0Y2gucGxheWVyLmFzc2lzdHMgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgbWF0Y2gucGxheWVyLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC10YWxlbnRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy10cC10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1wbGF5ZXJzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1wcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2xpY2sgbGlzdGVuZXJzIGZvciBpbnNwZWN0IHBhbmVcclxuICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2guaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUGFuZTogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgZnVsbCBtYXRjaCBwYW5lIHRoYXQgbG9hZHMgd2hlbiBhIG1hdGNoIHdpZGdldCBpcyBjbGlja2VkIGZvciBhIGRldGFpbGVkIHZpZXcsIGlmIGl0J3MgYWxyZWFkeSBsb2FkZWQsIHRvZ2dsZSBpdHMgZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaG1hbiA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl07XHJcbiAgICAgICAgICAgICAgICBtYXRjaG1hbi5mdWxsRGlzcGxheSA9ICFtYXRjaG1hbi5mdWxsRGlzcGxheTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNobWFuLmZ1bGxEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVEb3duKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZVVwKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIGZ1bGwgbWF0Y2ggcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoaWQpLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC0nICsgbWF0Y2hpZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaFwiPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvYWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGFqYXgubG9hZE1hdGNoKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvZyBhcyBnZW5lcmF0ZWQgaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd3M6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGZ1bGxtYXRjaF9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGVhbXNcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBmdWxsbWF0Y2hfY29udGFpbmVyLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkICsnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVhbV9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGVhbSBSb3cgSGVhZGVyXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyKHRlYW1fY29udGFpbmVyLCB0ZWFtLCBtYXRjaC53aW5uZXIgPT09IHQsIG1hdGNoLmhhc0JhbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHBsYXllcnMgZm9yIHRlYW1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1BsYXllciBSb3dcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbG1hdGNoUm93KG1hdGNoaWQsIHRlYW1fY29udGFpbmVyLCBwbGF5ZXIsIHRlYW0uY29sb3IsIG1hdGNoLnN0YXRzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyOiBmdW5jdGlvbihjb250YWluZXIsIHRlYW0sIHdpbm5lciwgaGFzQmFucykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL1ZpY3RvcnlcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnkgPSAod2lubmVyKSA/ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5XCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1kZWZlYXRcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0JhbnNcclxuICAgICAgICAgICAgbGV0IGJhbnMgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgICAgIGJhbnMgKz0gJ0JhbnM6ICc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiYW4gb2YgdGVhbS5iYW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFucyArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGJhbi5uYW1lICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yaC1iYW5cIiBzcmM9XCInKyBiYW4uaW1hZ2UgKydcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd2hlYWRlclwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9WaWN0b3J5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdmljdG9yeSArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gTGV2ZWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWxldmVsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5sZXZlbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0JhbnMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWJhbnMtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBiYW5zICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTW1yIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1tbXItY29udGFpbmVyXCI+TU1SOiA8c3BhbiBjbGFzcz1cInJtLWZtLXJoLW1tclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5tbXIub2xkLnJhdGluZyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsbWF0Y2hSb3c6IGZ1bmN0aW9uKG1hdGNoaWQsIGNvbnRhaW5lciwgcGxheWVyLCB0ZWFtQ29sb3IsIG1hdGNoU3RhdHMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBwbGF5ZXJcclxuICAgICAgICAgICAgbGV0IG1hdGNoUGxheWVySWQgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLm1hdGNoUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllciBuYW1lXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJuYW1lID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoUGxheWVySWQpIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgcm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lICcrIHNpbGVuY2UocGxheWVyLnNpbGVuY2VkKSArJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVybmFtZSArPSBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTQpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWwgPSBwbGF5ZXIubWVkYWw7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtaW5uZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLWZtLXItbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfJysgdGVhbUNvbG9yICsnLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tZm0tci10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tci10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU3RhdHNcclxuICAgICAgICAgICAgbGV0IHN0YXRzID0gcGxheWVyLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bSc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRfdG9vbHRpcCA9IGZ1bmN0aW9uICh2YWwsIGRlc2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyc8YnI+JysgZGVzYztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0cyA9IFtcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVyb19kYW1hZ2VcIiwgY2xhc3M6IFwiaGVyb2RhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZXJvIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJzaWVnZV9kYW1hZ2VcIiwgY2xhc3M6IFwic2llZ2VkYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnU2llZ2UgRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcIm1lcmNfY2FtcHNcIiwgY2xhc3M6IFwibWVyY2NhbXBzXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ01lcmMgQ2FtcHMgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiaGVhbGluZ1wiLCBjbGFzczogXCJoZWFsaW5nXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlYWxpbmcnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZGFtYWdlX3Rha2VuXCIsIGNsYXNzOiBcImRhbWFnZXRha2VuXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0RhbWFnZSBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJleHBfY29udHJpYlwiLCBjbGFzczogXCJleHBjb250cmliXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0V4cGVyaWVuY2UgQ29udHJpYnV0aW9uJ31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoc3RhdCBvZiByb3dzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IG1hdGNoU3RhdHNbc3RhdC5rZXldW1wibWF4XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50T25SYW5nZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRPblJhbmdlID0gKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIC8gKG1heCAqIDEuMDApKSAqIDEwMC4wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQud2lkdGggPSBwZXJjZW50T25SYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlID0gc3RhdHNbc3RhdC5rZXldO1xyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSBzdGF0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzW3N0YXQua2V5ICsgXCJfcmF3XCJdIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9ICc8c3BhbiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyLW5vbmVcIj4nICsgc3RhdC52YWx1ZSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LnRvb2x0aXAgPSByb3dzdGF0X3Rvb2x0aXAoc3RhdC52YWx1ZSwgc3RhdC50b29sdGlwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0Lmh0bWwgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHN0YXQudG9vbHRpcCArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1yb3dcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy0nKyBzdGF0LmNsYXNzICsnIHJtLWZtLXItc3RhdHMtYmFyXCIgc3R5bGU9XCJ3aWR0aDogJysgc3RhdC53aWR0aCArJyVcIj48L2Rpdj48ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXJcIj4nKyBzdGF0LnZhbHVlRGlzcGxheSArJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0J1aWxkIGh0bWxcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd1wiPicgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVyaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXJcIj5Mb2FkIE1vcmUgTWF0Y2hlcy4uLjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQobG9hZGVyaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWpheC5pbnRlcm5hbC5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0Lmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTF4IGZhLWZ3XCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzLmxvYWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yX01hdGNoV29uTG9zdDogZnVuY3Rpb24od29uKSB7XHJcbiAgICAgICAgICAgIGlmICh3b24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctd29uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctbG9zdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTWF0Y2hHZW5lcmF0ZWQ6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShtYXRjaGlkICsgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWxlbnR0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyJywge3BsYXllcjogcGxheWVyX2lkfSk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9