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
            //Disable processing indicator
            setTimeout(function () {
                $('.playerloader-processing').fadeIn().delay(750).queue(function () {
                    $(this).remove();
                });
            });

            console.log('test');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjkyNjZiNjE5YjFkZDcxY2Y2MWUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsIiQiLCJhcHBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsImZhZGVJbiIsInF1ZXVlIiwicmVtb3ZlIiwiY29uc29sZSIsImxvZyIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZW1wdHkiLCJiVXJsIiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRhdGFfbWF0Y2hlcyIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImlkIiwiZ2VuZXJhdGVNYXRjaCIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJtYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJoYXNPd25Qcm9wZXJ0eSIsImh0bWwiLCJwYXJ0aWVzQ29sb3JzIiwidXRpbGl0eSIsInNodWZmbGUiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJtYXRjaFBsYXllciIsImdlbmVyYXRlTWF0Y2hXaWRnZXQiLCJ0aW1lc3RhbXAiLCJkYXRlIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJpbWFnZV9icGF0aCIsImdvb2RrZGEiLCJrZGFfcmF3IiwibWVkYWxodG1sIiwibm9tZWRhbGh0bWwiLCJleGlzdHMiLCJuYW1lIiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInRhbGVudHNodG1sIiwiaSIsInRhbGVudHMiLCJ0YWxlbnQiLCJ0YWxlbnR0b29sdGlwIiwicGxheWVyc2h0bWwiLCJwYXJ0aWVzQ291bnRlciIsInQiLCJ0ZWFtcyIsInRlYW0iLCJwbGF5ZXJzIiwicGFydHkiLCJwYXJ0eU9mZnNldCIsInBhcnR5Q29sb3IiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJoZXJvIiwiaW1hZ2VfaGVybyIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsIm1hcCIsImdhbWVUeXBlIiwiaGVyb1Byb3Blck5hbWUiLCJraWxscyIsImRlYXRocyIsImFzc2lzdHMiLCJrZGEiLCJjbGljayIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJzbGlkZVVwIiwiZnVsbG1hdGNoX2NvbnRhaW5lciIsInRlYW1fY29udGFpbmVyIiwiZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIiLCJ3aW5uZXIiLCJoYXNCYW5zIiwicCIsImdlbmVyYXRlRnVsbG1hdGNoUm93IiwiY29sb3IiLCJzdGF0cyIsImNvbnRhaW5lciIsInZpY3RvcnkiLCJiYW5zIiwiYmFuIiwibGV2ZWwiLCJtbXIiLCJvbGQiLCJyYXRpbmciLCJ0ZWFtQ29sb3IiLCJtYXRjaFN0YXRzIiwib2RkRXZlbiIsIm1hdGNoUGxheWVySWQiLCJwbGF5ZXJuYW1lIiwicm93c3RhdF90b29sdGlwIiwiZGVzYyIsInJvd3N0YXRzIiwia2V5IiwiY2xhc3MiLCJ3aWR0aCIsInZhbHVlIiwidmFsdWVEaXNwbGF5Iiwic3RhdCIsIm1heCIsInBlcmNlbnRPblJhbmdlIiwibW1yRGVsdGFUeXBlIiwibW1yRGVsdGFQcmVmaXgiLCJkZWx0YSIsIm1tckRlbHRhIiwicmFuayIsInRpZXIiLCJoZXJvX2xldmVsIiwibG9hZGVyaHRtbCIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFF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QVNQLElBQVQsRUFBZTJELElBQWYsRUFBcUI7QUFDaEMsbUJBQU8sNkNBQTZDM0QsSUFBN0MsR0FBb0QsYUFBcEQsR0FBb0UyRCxJQUEzRTtBQUNIO0FBcmdCSTtBQURPLENBQXBCOztBQTJnQkFsSixFQUFFb0ssUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJySyxNQUFFc0ssRUFBRixDQUFLQyxZQUFMLENBQWtCQyxRQUFsQixHQUE2QixNQUE3QixDQUR5QixDQUNZOztBQUVyQztBQUNBLFFBQUk5SyxVQUFVa0MsUUFBUUMsUUFBUixDQUFpQiw0QkFBakIsRUFBK0MsRUFBQ0MsUUFBUUMsU0FBVCxFQUEvQyxDQUFkOztBQUVBLFFBQUlwQyxjQUFjLENBQUMsUUFBRCxFQUFXLFVBQVgsQ0FBbEI7QUFDQSxRQUFJOEssYUFBYW5NLGFBQWFDLElBQWIsQ0FBa0JLLE1BQW5DOztBQUVBNkwsZUFBV2hMLFlBQVgsQ0FBd0JDLE9BQXhCO0FBQ0FOLG9CQUFnQnNMLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Qy9LLFdBQXhDO0FBQ0E4SyxlQUFXaEwsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0FLLE1BQUUsd0JBQUYsRUFBNEIySyxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEeEwsd0JBQWdCc0wsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDL0ssV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FLLE1BQUUsR0FBRixFQUFPMkssRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q0osbUJBQVdoTCxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLjQzNDJkYWViMjgyZjk1Yzc1ODVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNjkyNjZiNjE5YjFkZDcxY2Y2MWUiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8kKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJwbGF5ZXJsb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vLS0gSW5pdGlhbCBNYXRjaGVzIEZpcnN0IExvYWRcclxuICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1sb2FkZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwbGF5ZXJsb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTN4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXgubWF0Y2hlcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBhamF4TWF0Y2hlcyA9IGFqYXgubWF0Y2hlcztcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5pbnRlcm5hbC5saW1pdCA9IGpzb24ubGltaXRzLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgbWF0Y2ggc2V0XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5sb2FkKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBsYXllcmxvYWRlci1wcm9jZXNzaW5nJykuZmFkZUluKCkuZGVsYXkoNzUwKS5xdWV1ZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Rlc3QnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICBtYXRjaGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgZnVsbG1hdGNoIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBtYXRjaHVybDogJycsIC8vdXJsIHRvIGdldCBhIGZ1bGxtYXRjaCByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICAgICAgb2Zmc2V0OiAwLCAvL01hdGNoZXMgb2Zmc2V0XHJcbiAgICAgICAgbGltaXQ6IDYsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVNYXRjaFVybDogZnVuY3Rpb24obWF0Y2hfaWQpIHtcclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfbWF0Y2hcIiwge1xyXG4gICAgICAgICAgICBtYXRjaGlkOiBtYXRjaF9pZCxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMge2xpbWl0fSByZWNlbnQgbWF0Y2hlcyBvZmZzZXQgYnkge29mZnNldH0gZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBsZXQgZGlzcGxheU1hdGNoTG9hZGVyID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX29mZnNldHMgPSBqc29uLm9mZnNldHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9saW1pdHMgPSBqc29uLmxpbWl0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoZXMgPSBqc29uLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1NldCBuZXcgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IGpzb25fb2Zmc2V0cy5tYXRjaGVzICsgc2VsZi5pbnRlcm5hbC5saW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0FwcGVuZCBuZXcgTWF0Y2ggd2lkZ2V0cyBmb3IgbWF0Y2hlcyB0aGF0IGFyZW4ndCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1hdGNoIG9mIGpzb25fbWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YV9tYXRjaGVzLmlzTWF0Y2hHZW5lcmF0ZWQobWF0Y2guaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU1hdGNoKG1hdGNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgZGlzcGxheU1hdGNoTG9hZGVyIGlmIHdlIGdvdCBhcyBtYW55IG1hdGNoZXMgYXMgd2UgYXNrZWQgZm9yXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGNoTG9hZGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5IG1hdGNoIGxvYWRlciBidXR0b24gaWYgaGFkTmV3TWF0Y2hcclxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TWF0Y2hMb2FkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB0aGUgbWF0Y2ggb2YgZ2l2ZW4gaWQgdG8gYmUgZGlzcGxheWVkIHVuZGVyIG1hdGNoIHNpbXBsZXdpZGdldFxyXG4gICAgICovXHJcbiAgICBsb2FkTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9IHNlbGYuZ2VuZXJhdGVNYXRjaFVybChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZ1bGxtYXRjaC1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC5tYXRjaHVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2ggPSBqc29uLm1hdGNoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZUZ1bGxNYXRjaFJvd3MobWF0Y2hpZCwganNvbl9tYXRjaCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5mdWxsbWF0Y2gtcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuZGF0YSA9IHtcclxuICAgIG1hdGNoZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXRjaExvYWRlckdlbmVyYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIG1hdGNoTWFuaWZlc3Q6IHt9IC8vS2VlcHMgdHJhY2sgb2Ygd2hpY2ggbWF0Y2ggaWRzIGFyZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkLCB0byBwcmV2ZW50IG9mZnNldCByZXF1ZXN0cyBmcm9tIHJlcGVhdGluZyBtYXRjaGVzIG92ZXIgbGFyZ2UgcGVyaW9kcyBvZiB0aW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgYWxsIHN1YmNvbXBvbmVudHMgb2YgYSBtYXRjaCBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggY29tcG9uZW50IGNvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lclwiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0dlbmVyYXRlIG9uZS10aW1lIHBhcnR5IGNvbG9ycyBmb3IgbWF0Y2hcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBbMSwgMiwgMywgNCwgNV07IC8vQXJyYXkgb2YgY29sb3JzIHRvIHVzZSBmb3IgcGFydHkgYXQgaW5kZXggPSBwYXJ0eUluZGV4IC0gMVxyXG4gICAgICAgICAgICBIb3RzdGF0dXMudXRpbGl0eS5zaHVmZmxlKHBhcnRpZXNDb2xvcnMpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGlzIGN1cnJlbnRseSB0b2dnbGVkIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIG1hdGNoUGxheWVyOiBtYXRjaC5wbGF5ZXIuaWQsIC8vSWQgb2YgdGhlIG1hdGNoJ3MgcGxheWVyIGZvciB3aG9tIHRoZSBtYXRjaCBpcyBiZWluZyBkaXNwbGF5ZWQsIGZvciB1c2Ugd2l0aCBoaWdobGlnaHRpbmcgaW5zaWRlIG9mIGZ1bGxtYXRjaCAod2hpbGUgZGVjb3VwbGluZyBtYWlucGxheWVyKVxyXG4gICAgICAgICAgICAgICAgcGFydGllc0NvbG9yczogcGFydGllc0NvbG9ycyAvL0NvbG9ycyB0byB1c2UgZm9yIHRoZSBwYXJ0eSBpbmRleGVzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hXaWRnZXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIFdpZGdldCBDb250YWluZXJcclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZV9kYXRlID0gSG90c3RhdHVzLmRhdGUuZ2V0UmVsYXRpdmVUaW1lKHRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gbWF0Y2gucGxheWVyLm1lZGFsO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnX2JsdWUucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCA9IFwiPGRpdiBjbGFzcz0ncm0tc3ctc3Atb2Zmc2V0Jz48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXRwLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gbWF0Y2gucGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy10cC10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyc1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyc2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvdW50ZXIgPSBbMCwgMCwgMCwgMCwgMF07IC8vQ291bnRzIGluZGV4IG9mIHBhcnR5IG1lbWJlciwgZm9yIHVzZSB3aXRoIGNyZWF0aW5nIGNvbm5lY3RvcnMsIHVwIHRvIDUgcGFydGllcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC10ZWFtJyArIHQgKyAnXCI+JztcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnR5ID0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eSBybS1wYXJ0eS1zbSBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LXNtIHJtLXBhcnR5LXNtLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3BlY2lhbCA9ICc8YSBjbGFzcz1cIicrc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09IG1hdGNoLnBsYXllci5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tc3ctc3BlY2lhbFwiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPGRpdiBjbGFzcz1cInJtLXN3LXBwLXBsYXllclwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctcHAtcGxheWVyLWltYWdlXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIHBsYXllci5pbWFnZV9oZXJvICsgJ1wiPjwvc3Bhbj4nICsgcGFydHkgKyBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTIpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci0nKyBtYXRjaC5pZCArJ1wiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1sZWZ0cGFuZSAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArIG1hdGNoLm1hcF9pbWFnZSArICcpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGUtdGV4dFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtYXRjaC5tYXAgKyAnXCI+JyArIG1hdGNoLmdhbWVUeXBlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZGF0ZS10ZXh0XCI+JyArIHJlbGF0aXZlX2RhdGUgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtc3RhdHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdlwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LXRleHRcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgbWF0Y2gucGxheWVyLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBtYXRjaC5wbGF5ZXIuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgbWF0Y2gucGxheWVyLmFzc2lzdHMgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgbWF0Y2gucGxheWVyLmtkYSArICc8L3NwYW4+IEtEQTwvZGl2Pjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC10YWxlbnRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy10cC10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1wbGF5ZXJzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1wcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2xpY2sgbGlzdGVuZXJzIGZvciBpbnNwZWN0IHBhbmVcclxuICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2guaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUGFuZTogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgZnVsbCBtYXRjaCBwYW5lIHRoYXQgbG9hZHMgd2hlbiBhIG1hdGNoIHdpZGdldCBpcyBjbGlja2VkIGZvciBhIGRldGFpbGVkIHZpZXcsIGlmIGl0J3MgYWxyZWFkeSBsb2FkZWQsIHRvZ2dsZSBpdHMgZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaG1hbiA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl07XHJcbiAgICAgICAgICAgICAgICBtYXRjaG1hbi5mdWxsRGlzcGxheSA9ICFtYXRjaG1hbi5mdWxsRGlzcGxheTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNobWFuLmZ1bGxEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVEb3duKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5zbGlkZVVwKDI1MCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIGZ1bGwgbWF0Y2ggcGFuZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoaWQpLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC0nICsgbWF0Y2hpZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaFwiPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvYWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGFqYXgubG9hZE1hdGNoKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0xvZyBhcyBnZW5lcmF0ZWQgaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd3M6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGZ1bGxtYXRjaF9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGVhbXNcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBmdWxsbWF0Y2hfY29udGFpbmVyLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkICsnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVhbV9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGVhbSBSb3cgSGVhZGVyXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyKHRlYW1fY29udGFpbmVyLCB0ZWFtLCBtYXRjaC53aW5uZXIgPT09IHQsIG1hdGNoLmhhc0JhbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHBsYXllcnMgZm9yIHRlYW1cclxuICAgICAgICAgICAgICAgIGxldCBwID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1BsYXllciBSb3dcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbG1hdGNoUm93KG1hdGNoaWQsIHRlYW1fY29udGFpbmVyLCBwbGF5ZXIsIHRlYW0uY29sb3IsIG1hdGNoLnN0YXRzLCBwICUgMiwgcGFydGllc0NvdW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLnBhcnR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWVzQ291bnRlcltwYXJ0eU9mZnNldF0rKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHArKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyOiBmdW5jdGlvbihjb250YWluZXIsIHRlYW0sIHdpbm5lciwgaGFzQmFucykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL1ZpY3RvcnlcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnkgPSAod2lubmVyKSA/ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5XCI+VmljdG9yeTwvc3Bhbj4nKSA6ICgnPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1kZWZlYXRcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0JhbnNcclxuICAgICAgICAgICAgbGV0IGJhbnMgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgICAgIGJhbnMgKz0gJ0JhbnM6ICc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiYW4gb2YgdGVhbS5iYW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFucyArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGJhbi5uYW1lICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yaC1iYW5cIiBzcmM9XCInKyBiYW4uaW1hZ2UgKydcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd2hlYWRlclwiPicgK1xyXG4gICAgICAgICAgICAgICAgLy9WaWN0b3J5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC12aWN0b3J5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdmljdG9yeSArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gTGV2ZWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWxldmVsLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5sZXZlbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0JhbnMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLWJhbnMtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBiYW5zICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1rZGEtY29udGFpbmVyXCI+S0RBPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL1N0YXRpc3RpY3MgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXN0YXRpc3RpY3MtY29udGFpbmVyXCI+UGVyZm9ybWFuY2U8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vTW1yIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1tbXItY29udGFpbmVyXCI+TU1SOiA8c3BhbiBjbGFzcz1cInJtLWZtLXJoLW1tclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGVhbS5tbXIub2xkLnJhdGluZyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsbWF0Y2hSb3c6IGZ1bmN0aW9uKG1hdGNoaWQsIGNvbnRhaW5lciwgcGxheWVyLCB0ZWFtQ29sb3IsIG1hdGNoU3RhdHMsIG9kZEV2ZW4sIHBhcnRpZXNDb3VudGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggcGxheWVyXHJcbiAgICAgICAgICAgIGxldCBtYXRjaFBsYXllcklkID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5tYXRjaFBsYXllcjtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBsZXQgcGxheWVybmFtZSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc3BlY2lhbCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaFBsYXllcklkKSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lIHJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSAnKyBzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkgKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgKz0gc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDE0KSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+JztcclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gcGxheWVyLm1lZGFsO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWlubmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnXycrIHRlYW1Db2xvciArJy5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLWZtLXItdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBwbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItdGFsZW50XCIgc3JjPVwiJyArIHRhbGVudC5pbWFnZSArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1N0YXRzXHJcbiAgICAgICAgICAgIGxldCBzdGF0cyA9IHBsYXllci5zdGF0cztcclxuXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RhdHMua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByb3dzdGF0X3Rvb2x0aXAgPSBmdW5jdGlvbiAodmFsLCBkZXNjKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsICsnPGJyPicrIGRlc2M7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdHMgPSBbXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlcm9fZGFtYWdlXCIsIGNsYXNzOiBcImhlcm9kYW1hZ2VcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVybyBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwic2llZ2VfZGFtYWdlXCIsIGNsYXNzOiBcInNpZWdlZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ1NpZWdlIERhbWFnZSd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJtZXJjX2NhbXBzXCIsIGNsYXNzOiBcIm1lcmNjYW1wc1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdNZXJjIENhbXBzIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImhlYWxpbmdcIiwgY2xhc3M6IFwiaGVhbGluZ1wiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdIZWFsaW5nJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImRhbWFnZV90YWtlblwiLCBjbGFzczogXCJkYW1hZ2V0YWtlblwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdEYW1hZ2UgVGFrZW4nfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwiZXhwX2NvbnRyaWJcIiwgY2xhc3M6IFwiZXhwY29udHJpYlwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdFeHBlcmllbmNlIENvbnRyaWJ1dGlvbid9XHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKHN0YXQgb2Ygcm93c3RhdHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXggPSBtYXRjaFN0YXRzW3N0YXQua2V5XVtcIm1heFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGVyY2VudE9uUmFuZ2UgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1heCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50T25SYW5nZSA9IChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSAvIChtYXggKiAxLjAwKSkgKiAxMDAuMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGF0LndpZHRoID0gcGVyY2VudE9uUmFuZ2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC52YWx1ZSA9IHN0YXRzW3N0YXQua2V5XTtcclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gc3RhdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0c1tzdGF0LmtleSArIFwiX3Jhd1wiXSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdC52YWx1ZURpc3BsYXkgPSAnPHNwYW4gY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlci1ub25lXCI+JyArIHN0YXQudmFsdWUgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC50b29sdGlwID0gcm93c3RhdF90b29sdGlwKHN0YXQudmFsdWUsIHN0YXQudG9vbHRpcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC5odG1sID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzdGF0LnRvb2x0aXAgKyAnXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtcm93XCI+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtJysgc3RhdC5jbGFzcyArJyBybS1mbS1yLXN0YXRzLWJhclwiIHN0eWxlPVwid2lkdGg6ICcrIHN0YXQud2lkdGggKyclXCI+PC9kaXY+PGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtbnVtYmVyXCI+Jysgc3RhdC52YWx1ZURpc3BsYXkgKyc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9NTVJcclxuICAgICAgICAgICAgbGV0IG1tckRlbHRhVHlwZSA9IFwibmVnXCI7XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVByZWZpeCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIubW1yLmRlbHRhID49IDApIHtcclxuICAgICAgICAgICAgICAgIG1tckRlbHRhVHlwZSA9IFwicG9zXCI7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVByZWZpeCA9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YSA9IHBsYXllci5tbXIucmFuayArJyAnKyBwbGF5ZXIubW1yLnRpZXIgKycgKDxzcGFuIGNsYXNzPVxcJ3JtLWZtLXItbW1yLWRlbHRhLScrIG1tckRlbHRhVHlwZSArJ1xcJz4nKyBtbXJEZWx0YVByZWZpeCArIHBsYXllci5tbXIuZGVsdGEgKyc8L3NwYW4+KSc7XHJcblxyXG4gICAgICAgICAgICAvL1BhcnR5XHJcbiAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgcGFydGllc0NvbG9ycyA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ucGFydGllc0NvbG9ycztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlDb2xvciA9IHBhcnRpZXNDb2xvcnNbcGFydHlPZmZzZXRdO1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcnR5ID0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eSBybS1wYXJ0eS1tZCBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnR5ICs9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHktbWQgcm0tcGFydHktbWQtY29ubmVjdGVyIHJtLXBhcnR5LScrIHBhcnR5Q29sb3IgKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0J1aWxkIGh0bWxcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvdyBybS1mbS1yb3ctJysgb2RkRXZlbiArJ1wiPicgK1xyXG4gICAgICAgICAgICAvL1BhcnR5IFN0cmlwZVxyXG4gICAgICAgICAgICBwYXJ0eSArXHJcbiAgICAgICAgICAgIC8vSGVybyBJbWFnZSBDb250YWluZXIgKFdpdGggSGVybyBMZXZlbClcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLWhlcm9sZXZlbFwiPicrIHBsYXllci5oZXJvX2xldmVsICsnPC9kaXY+PGltZyBjbGFzcz1cInJtLWZtLXItaGVyb2ltYWdlXCIgc3JjPVwiJysgcGxheWVyLmltYWdlX2hlcm8gKydcIj48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9QbGF5ZXIgTmFtZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTWVkYWwgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1RhbGVudHMgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnRzLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vS0RBIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhLWluZGl2XCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj4nXHJcbiAgICAgICAgICAgICsgc3RhdHMua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIHN0YXRzLmRlYXRocyArICc8L3NwYW4+IC8gJyArIHN0YXRzLmFzc2lzdHMgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXIta2RhXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6aGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtdGV4dFwiPjxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBzdGF0cy5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBPZmZlbnNlIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtb2ZmZW5zZS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzFdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1syXS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL1N0YXRzIFV0aWxpdHkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1zdGF0cy11dGlsaXR5LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1szXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbNF0uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzVdLmh0bWwgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vTU1SIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLXRvb2x0aXAtYXJlYVwiIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJysgbW1yRGVsdGEgKydcIj48aW1nIGNsYXNzPVwicm0tZm0tci1tbXJcIiBzcmM9XCInKyBpbWFnZV9icGF0aCArICd1aS9yYW5rZWRfcGxheWVyX2ljb25fJyArIHBsYXllci5tbXIucmFuayArJy5wbmdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1tbXItbnVtYmVyXCI+JysgcGxheWVyLm1tci50aWVyICsnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlX21hdGNoTG9hZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlcmh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyXCI+TG9hZCBNb3JlIE1hdGNoZXMuLi48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGxvYWRlcmh0bWwpO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFqYXguaW50ZXJuYWwubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0xeCBmYS1md1wiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcy5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xvcl9NYXRjaFdvbkxvc3Q6IGZ1bmN0aW9uKHdvbikge1xyXG4gICAgICAgICAgICBpZiAod29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLXdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLWxvc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWxlbnR0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyJywge3BsYXllcjogcGxheWVyX2lkfSk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9