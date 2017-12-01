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

                    if (!data_matches.isMatchGenerated(match.id)) {
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
        empty: function empty() {
            var self = PlayerLoader.data.matches;

            $('#pl-recentmatches-container').empty();
            self.internal.matchLoaderGenerated = false;
            self.internal.matchManifest = {};
        },
        isMatchGenerated: function isMatchGenerated(matchid) {
            var self = PlayerLoader.data.matches;

            return self.internal.matchManifest.hasOwnProperty(matchid + "");
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
            var partiesCounter = [0, 0, 0, 0, 0]; //Counts index of party member, for use with creating connectors, up to 5 parties possible
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
                    var p = 0;
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = team.players[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var player = _step5.value;

                            //Player Row
                            self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats, p % 2, partiesCounter);

                            if (player.party > 0) {
                                var partyOffset = player.party - 1;
                                partiesCounter[partyOffset]++;
                            }

                            p++;
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

                //MMR
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZWYyMzQ0NjYyNWUzMmQ4MTQ3NjUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwibWF0Y2hlcyIsInJlc2V0IiwicmVtb3ZlQ2xhc3MiLCJhamF4TWF0Y2hlcyIsIm9mZnNldCIsImxpbWl0IiwibGltaXRzIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJtYXRjaGxvYWRpbmciLCJtYXRjaHVybCIsImVtcHR5IiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImdlbmVyYXRlTWF0Y2hVcmwiLCJtYXRjaF9pZCIsIm1hdGNoaWQiLCJkYXRhX21hdGNoZXMiLCJkaXNwbGF5TWF0Y2hMb2FkZXIiLCJqc29uX29mZnNldHMiLCJvZmZzZXRzIiwianNvbl9saW1pdHMiLCJqc29uX21hdGNoZXMiLCJtYXRjaCIsImlzTWF0Y2hHZW5lcmF0ZWQiLCJpZCIsImdlbmVyYXRlTWF0Y2giLCJnZW5lcmF0ZV9tYXRjaExvYWRlciIsInJlbW92ZV9tYXRjaExvYWRlciIsImxvYWRNYXRjaCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJtYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJoYXNPd25Qcm9wZXJ0eSIsImh0bWwiLCJhcHBlbmQiLCJwYXJ0aWVzQ29sb3JzIiwidXRpbGl0eSIsInNodWZmbGUiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJtYXRjaFBsYXllciIsImdlbmVyYXRlTWF0Y2hXaWRnZXQiLCJ0aW1lc3RhbXAiLCJkYXRlIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJpbWFnZV9icGF0aCIsImdvb2RrZGEiLCJrZGFfcmF3IiwibWVkYWxodG1sIiwibm9tZWRhbGh0bWwiLCJleGlzdHMiLCJuYW1lIiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInRhbGVudHNodG1sIiwiaSIsInRhbGVudHMiLCJ0YWxlbnQiLCJ0YWxlbnR0b29sdGlwIiwicGxheWVyc2h0bWwiLCJwYXJ0aWVzQ291bnRlciIsInQiLCJ0ZWFtcyIsInRlYW0iLCJwbGF5ZXJzIiwicGFydHkiLCJwYXJ0eU9mZnNldCIsInBhcnR5Q29sb3IiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJoZXJvIiwiaW1hZ2VfaGVybyIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsIm1hcCIsImdhbWVUeXBlIiwiaGVyb1Byb3Blck5hbWUiLCJraWxscyIsImRlYXRocyIsImFzc2lzdHMiLCJrZGEiLCJjbGljayIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJzbGlkZVVwIiwiZnVsbG1hdGNoX2NvbnRhaW5lciIsInRlYW1fY29udGFpbmVyIiwiZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIiLCJ3aW5uZXIiLCJoYXNCYW5zIiwicCIsImdlbmVyYXRlRnVsbG1hdGNoUm93IiwiY29sb3IiLCJzdGF0cyIsImNvbnRhaW5lciIsInZpY3RvcnkiLCJiYW5zIiwiYmFuIiwibGV2ZWwiLCJtbXIiLCJvbGQiLCJyYXRpbmciLCJ0ZWFtQ29sb3IiLCJtYXRjaFN0YXRzIiwib2RkRXZlbiIsIm1hdGNoUGxheWVySWQiLCJwbGF5ZXJuYW1lIiwicm93c3RhdF90b29sdGlwIiwiZGVzYyIsInJvd3N0YXRzIiwia2V5IiwiY2xhc3MiLCJ3aWR0aCIsInZhbHVlIiwidmFsdWVEaXNwbGF5Iiwic3RhdCIsIm1heCIsInBlcmNlbnRPblJhbmdlIiwibW1yRGVsdGFUeXBlIiwibW1yRGVsdGFQcmVmaXgiLCJkZWx0YSIsIm1tckRlbHRhIiwicmFuayIsInRpZXIiLCJoZXJvX2xldmVsIiwibG9hZGVyaHRtbCIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7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LENBRHlCLENBQ1k7O0FBRXJDO0FBQ0EsUUFBSTFLLFVBQVU4QixRQUFRQyxRQUFSLENBQWlCLDRCQUFqQixFQUErQyxFQUFDQyxRQUFRQyxTQUFULEVBQS9DLENBQWQ7O0FBRUEsUUFBSWhDLGNBQWMsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUFsQjtBQUNBLFFBQUkwSyxhQUFhL0wsYUFBYUMsSUFBYixDQUFrQkssTUFBbkM7O0FBRUF5TCxlQUFXNUssWUFBWCxDQUF3QkMsT0FBeEI7QUFDQU4sb0JBQWdCa0wsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDM0ssV0FBeEM7QUFDQTBLLGVBQVc1SyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQUssTUFBRSx3QkFBRixFQUE0QnVLLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckRwTCx3QkFBZ0JrTCxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0MzSyxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQUssTUFBRSxHQUFGLEVBQU91SyxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0UsQ0FBVCxFQUFZO0FBQ3hDSixtQkFBVzVLLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQXRCRCxFIiwiZmlsZSI6InBsYXllci1sb2FkZXIuZGQ2ODE3MjI3NWE3MDE5ZThjYmIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlZjIzNDQ2NjI1ZTMyZDgxNDc2NSIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgdmFsID0gSG90c3RhdHVzRmlsdGVyLmdldFNlbGVjdG9yVmFsdWVzKFwic2Vhc29uXCIpO1xyXG5cclxuICAgICAgICBsZXQgc2Vhc29uID0gXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiIHx8IHZhbCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzZWFzb24gPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vhc29uO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4Lm1hdGNoZXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgbWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWpheE1hdGNoZXMgPSBhamF4Lm1hdGNoZXM7XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwubGltaXQgPSBqc29uLmxpbWl0cy5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9hZCBpbml0aWFsIG1hdGNoIHNldFxyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMubG9hZCgpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgbWF0Y2hsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIGZ1bGxtYXRjaCByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgbWF0Y2h1cmw6ICcnLCAvL3VybCB0byBnZXQgYSBmdWxsbWF0Y2ggcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgICAgIG9mZnNldDogMCwgLy9NYXRjaGVzIG9mZnNldFxyXG4gICAgICAgIGxpbWl0OiA2LCAvL01hdGNoZXMgbGltaXQgKEluaXRpYWwgbGltaXQgaXMgc2V0IGJ5IGluaXRpYWwgbG9hZGVyKVxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgYlVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9yZWNlbnRtYXRjaGVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWQsXHJcbiAgICAgICAgICAgIG9mZnNldDogc2VsZi5pbnRlcm5hbC5vZmZzZXQsXHJcbiAgICAgICAgICAgIGxpbWl0OiBzZWxmLmludGVybmFsLmxpbWl0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYlVybCwgW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl0pO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlTWF0Y2hVcmw6IGZ1bmN0aW9uKG1hdGNoX2lkKSB7XHJcbiAgICAgICAgcmV0dXJuIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX21hdGNoXCIsIHtcclxuICAgICAgICAgICAgbWF0Y2hpZDogbWF0Y2hfaWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSBzZWxmLmdlbmVyYXRlVXJsKCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRpc3BsYXlNYXRjaExvYWRlciA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9vZmZzZXRzID0ganNvbi5vZmZzZXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbGltaXRzID0ganNvbi5saW1pdHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaGVzID0ganNvbi5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9TZXQgbmV3IG9mZnNldFxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSBqc29uX29mZnNldHMubWF0Y2hlcyArIHNlbGYuaW50ZXJuYWwubGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9BcHBlbmQgbmV3IE1hdGNoIHdpZGdldHMgZm9yIG1hdGNoZXMgdGhhdCBhcmVuJ3QgaW4gdGhlIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBqc29uX21hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFfbWF0Y2hlcy5pc01hdGNoR2VuZXJhdGVkKG1hdGNoLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVNYXRjaChtYXRjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IGRpc3BsYXlNYXRjaExvYWRlciBpZiB3ZSBnb3QgYXMgbWFueSBtYXRjaGVzIGFzIHdlIGFza2VkIGZvclxyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2hlcy5sZW5ndGggPj0gc2VsZi5pbnRlcm5hbC5saW1pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNYXRjaExvYWRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9Ub2dnbGUgZGlzcGxheSBtYXRjaCBsb2FkZXIgYnV0dG9uIGlmIGhhZE5ld01hdGNoXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU1hdGNoTG9hZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMgdGhlIG1hdGNoIG9mIGdpdmVuIGlkIHRvIGJlIGRpc3BsYXllZCB1bmRlciBtYXRjaCBzaW1wbGV3aWRnZXRcclxuICAgICAqL1xyXG4gICAgbG9hZE1hdGNoOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSBzZWxmLmdlbmVyYXRlTWF0Y2hVcmwobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmdWxsbWF0Y2gtcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoID0ganNvbi5tYXRjaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzKG1hdGNoaWQsIGpzb25fbWF0Y2gpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZnVsbG1hdGNoLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWF0Y2hMb2FkZXJHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBtYXRjaE1hbmlmZXN0OiB7fSAvL0tlZXBzIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGlkcyBhcmUgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZCwgdG8gcHJldmVudCBvZmZzZXQgcmVxdWVzdHMgZnJvbSByZXBlYXRpbmcgbWF0Y2hlcyBvdmVyIGxhcmdlIHBlcmlvZHMgb2YgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNNYXRjaEdlbmVyYXRlZDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0Lmhhc093blByb3BlcnR5KG1hdGNoaWQgKyBcIlwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9HZW5lcmF0ZSBvbmUtdGltZSBwYXJ0eSBjb2xvcnMgZm9yIG1hdGNoXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gWzEsIDIsIDMsIDQsIDVdOyAvL0FycmF5IG9mIGNvbG9ycyB0byB1c2UgZm9yIHBhcnR5IGF0IGluZGV4ID0gcGFydHlJbmRleCAtIDFcclxuICAgICAgICAgICAgSG90c3RhdHVzLnV0aWxpdHkuc2h1ZmZsZShwYXJ0aWVzQ29sb3JzKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9nIG1hdGNoIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdID0ge1xyXG4gICAgICAgICAgICAgICAgZnVsbEdlbmVyYXRlZDogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBoYXMgYmVlbiBsb2FkZWQgZm9yIHRoZSBmaXJzdCB0aW1lXHJcbiAgICAgICAgICAgICAgICBmdWxsRGlzcGxheTogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBpcyBjdXJyZW50bHkgdG9nZ2xlZCB0byBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBtYXRjaFBsYXllcjogbWF0Y2gucGxheWVyLmlkLCAvL0lkIG9mIHRoZSBtYXRjaCdzIHBsYXllciBmb3Igd2hvbSB0aGUgbWF0Y2ggaXMgYmVpbmcgZGlzcGxheWVkLCBmb3IgdXNlIHdpdGggaGlnaGxpZ2h0aW5nIGluc2lkZSBvZiBmdWxsbWF0Y2ggKHdoaWxlIGRlY291cGxpbmcgbWFpbnBsYXllcilcclxuICAgICAgICAgICAgICAgIHBhcnRpZXNDb2xvcnM6IHBhcnRpZXNDb2xvcnMgLy9Db2xvcnMgdG8gdXNlIGZvciB0aGUgcGFydHkgaW5kZXhlc1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBub21lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctc3AtbWVkYWwtY29udGFpbmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1zdy1zcC1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ19ibHVlLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXNwLW9mZnNldCc+PC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1zdy10cC10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IG1hdGNoLnBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctdHAtdGFsZW50XCIgc3JjPVwiJyArIHRhbGVudC5pbWFnZSArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaC5wbGF5ZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXJcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXBwLXBsYXllci1pbWFnZVwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBwbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L3NwYW4+JyArIHBhcnR5ICsgc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDEyKSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1jb250YWluZXItJysgbWF0Y2guaWQgKydcIj48ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtbGVmdHBhbmUgJyArIHNlbGYuY29sb3JfTWF0Y2hXb25Mb3N0KG1hdGNoLnBsYXllci53b24pICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyBtYXRjaC5tYXBfaW1hZ2UgKyAnKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGVcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlLXRleHRcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWF0Y2gubWFwICsgJ1wiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWRhdGVcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgZGF0ZSArICdcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWRhdGUtdGV4dFwiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLXZpY3RvcnlcIj4nICsgdmljdG9yeVRleHQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLW1hdGNobGVuZ3RoXCI+JyArIG1hdGNoX3RpbWUgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGltZyBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIHJtLXN3LWhwLXBvcnRyYWl0XCIgc3JjPVwiJyArIG1hdGNoLnBsYXllci5pbWFnZV9oZXJvICsgJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1ocC1oZXJvbmFtZVwiPicrc2lsZW5jZV9pbWFnZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQsIDE2KSsnPGEgY2xhc3M9XCInK3NpbGVuY2UobWF0Y2gucGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwiaGVyb1wiLCB7aGVyb1Byb3Blck5hbWU6IG1hdGNoLnBsYXllci5oZXJvfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvYT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXN0YXRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXZcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi10ZXh0XCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIG1hdGNoLnBsYXllci5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgbWF0Y2gucGxheWVyLmRlYXRocyArICc8L3NwYW4+IC8gJyArIG1hdGNoLnBsYXllci5hc3Npc3RzICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIG1hdGNoLnBsYXllci5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtdGFsZW50c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctdHAtdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtcGxheWVyc3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctcHAtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJyArIG1hdGNoaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2hcIj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmxvYWRNYXRjaChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2cgYXMgZ2VuZXJhdGVkIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzOiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBmdWxsbWF0Y2hfY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRlYW1zXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZnVsbG1hdGNoX2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCArJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlYW1fY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gUm93IEhlYWRlclxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcih0ZWFtX2NvbnRhaW5lciwgdGVhbSwgbWF0Y2gud2lubmVyID09PSB0LCBtYXRjaC5oYXNCYW5zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBwbGF5ZXJzIGZvciB0ZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9QbGF5ZXIgUm93XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxtYXRjaFJvdyhtYXRjaGlkLCB0ZWFtX2NvbnRhaW5lciwgcGxheWVyLCB0ZWFtLmNvbG9yLCBtYXRjaC5zdGF0cywgcCAlIDIsIHBhcnRpZXNDb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJysgYmFuLmltYWdlICsnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgta2RhLWNvbnRhaW5lclwiPktEQTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0aXN0aWNzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1zdGF0aXN0aWNzLWNvbnRhaW5lclwiPlBlcmZvcm1hbmNlPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yLCBtYXRjaFN0YXRzLCBvZGRFdmVuLCBwYXJ0aWVzQ291bnRlcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hQbGF5ZXJJZCA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ubWF0Y2hQbGF5ZXI7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyIG5hbWVcclxuICAgICAgICAgICAgbGV0IHBsYXllcm5hbWUgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnJztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2hQbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSBybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgJysgc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpICsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICs9IHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxNCkgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPic7XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IHBsYXllci5tZWRhbDtcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1pbm5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tZm0tci1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ18nKyB0ZWFtQ29sb3IgKycucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1mbS1yLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gcGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdGF0c1xyXG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBwbGF5ZXIuc3RhdHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdF90b29sdGlwID0gZnVuY3Rpb24gKHZhbCwgZGVzYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArJzxicj4nKyBkZXNjO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRzID0gW1xyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZXJvX2RhbWFnZVwiLCBjbGFzczogXCJoZXJvZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlcm8gRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcInNpZWdlX2RhbWFnZVwiLCBjbGFzczogXCJzaWVnZWRhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdTaWVnZSBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwibWVyY19jYW1wc1wiLCBjbGFzczogXCJtZXJjY2FtcHNcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnTWVyYyBDYW1wcyBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZWFsaW5nXCIsIGNsYXNzOiBcImhlYWxpbmdcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVhbGluZyd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJkYW1hZ2VfdGFrZW5cIiwgY2xhc3M6IFwiZGFtYWdldGFrZW5cIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRGFtYWdlIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImV4cF9jb250cmliXCIsIGNsYXNzOiBcImV4cGNvbnRyaWJcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRXhwZXJpZW5jZSBDb250cmlidXRpb24nfVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChzdGF0IG9mIHJvd3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gbWF0Y2hTdGF0c1tzdGF0LmtleV1bXCJtYXhcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBlcmNlbnRPblJhbmdlID0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChtYXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudE9uUmFuZ2UgPSAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gLyAobWF4ICogMS4wMCkpICogMTAwLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC53aWR0aCA9IHBlcmNlbnRPblJhbmdlO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWUgPSBzdGF0c1tzdGF0LmtleV07XHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9IHN0YXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gJzxzcGFuIGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXItbm9uZVwiPicgKyBzdGF0LnZhbHVlICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudG9vbHRpcCA9IHJvd3N0YXRfdG9vbHRpcChzdGF0LnZhbHVlLCBzdGF0LnRvb2x0aXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQuaHRtbCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc3RhdC50b29sdGlwICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXJvd1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLScrIHN0YXQuY2xhc3MgKycgcm0tZm0tci1zdGF0cy1iYXJcIiBzdHlsZT1cIndpZHRoOiAnKyBzdGF0LndpZHRoICsnJVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlclwiPicrIHN0YXQudmFsdWVEaXNwbGF5ICsnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTU1SXHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVR5cGUgPSBcIm5lZ1wiO1xyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLm1tci5kZWx0YSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVR5cGUgPSBcInBvc1wiO1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFQcmVmaXggPSBcIitcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGEgPSBwbGF5ZXIubW1yLnJhbmsgKycgJysgcGxheWVyLm1tci50aWVyICsnICg8c3BhbiBjbGFzcz1cXCdybS1mbS1yLW1tci1kZWx0YS0nKyBtbXJEZWx0YVR5cGUgKydcXCc+JysgbW1yRGVsdGFQcmVmaXggKyBwbGF5ZXIubW1yLmRlbHRhICsnPC9zcGFuPiknO1xyXG5cclxuICAgICAgICAgICAgLy9QYXJ0eVxyXG4gICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktbWQgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LW1kIHJtLXBhcnR5LW1kLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9CdWlsZCBodG1sXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3cgcm0tZm0tcm93LScrIG9kZEV2ZW4gKydcIj4nICtcclxuICAgICAgICAgICAgLy9QYXJ0eSBTdHJpcGVcclxuICAgICAgICAgICAgcGFydHkgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01NUiBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci10b29sdGlwLWFyZWFcIiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIG1tckRlbHRhICsnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItbW1yXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBwbGF5ZXIubW1yLnJhbmsgKycucG5nXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLW51bWJlclwiPicrIHBsYXllci5tbXIudGllciArJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZXJodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlclwiPkxvYWQgTW9yZSBNYXRjaGVzLi4uPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChsb2FkZXJodG1sKTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMXggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcicsIHtwbGF5ZXI6IHBsYXllcl9pZH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==