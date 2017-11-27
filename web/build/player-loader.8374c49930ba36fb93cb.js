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
PlayerLoader.ajax = {};

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

            var html = '<div id="recentmatch-container-' + match.id + '"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' + '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + match.map_image + ');">' + '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + match.player.image_hero + '"></div>' + '<div class="rm-sw-hp-heroname">' + silence_image(match.player.silenced, 16) + '<a class="' + silence(match.player.silenced) + '" href="' + Routing.generate("hero", { heroProperName: match.player.hero }) + '" target="_blank">' + match.player.hero + '</a></div>' + '</div>' + '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' + nomedalhtml + '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">' + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' + '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><span class="rm-sw-sp-kda-text"><span class="rm-sw-sp-kda-num">' + match.player.kda + '</span> KDA</span></span></div>' + medalhtml + '</div></div>' + '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' + talentshtml + '</div></div>' + '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' + playershtml + '</div></div>' + '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' + '<i class="fa fa-chevron-down" aria-hidden="true"></i>' + '</div>' + '</div></div>';

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
                    selector.slideDown(100);
                } else {
                    selector.slideUp(100);
                }
            } else {
                if (!PlayerLoader.ajax.matches.matchloading) {
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
                            self.generateFullmatchRow(matchid, team_container, player, team.color);
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
        generateFullmatchRow: function generateFullmatchRow(matchid, container, player, teamColor) {
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

            //Build html
            var html = '<div class="rm-fm-row">' +
            //Hero Image Container (With Hero Level)
            '<div class="rm-fm-r-heroimage-container">' + '<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + player.hero + '"><div class="rm-fm-r-herolevel">' + player.hero_level + '</div><img class="rm-fm-r-heroimage" src="' + player.image_hero + '"></span>' + '</div>' +
            //Player Name Container
            '<div class="rm-fm-r-playername-container">' + playername + '</div>' +
            //Medal Container
            '<div class="rm-fm-r-medal-container">' + medalhtml + '</div>' +
            //Talents Container
            '<div class="rm-fm-r-talents-container"><div class="rm-fm-r-talent-container">' + talentshtml + '</div></div>' + '</div>';

            container.append(html);
        },
        remove_matchLoader: function remove_matchLoader() {
            var self = PlayerLoader.data.matches;

            self.internal.matchLoaderGenerated = false;
            $('#pl-recentmatch-matchloader').remove();
        },
        generate_matchLoader: function generate_matchLoader() {
            var self = PlayerLoader.data.matches;

            self.remove_matchLoader();

            var loaderhtml = '<div id="pl-recentmatch-matchloader">Load More Matches...</div>';

            $('#pl-recentmatches-container').append(loaderhtml);

            $('#pl-recentmatch-matchloader').click(function () {
                if (!PlayerLoader.ajax.matches.loading) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjU3OWVkNmEwZWIzMTY4YWYzNjIiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwiZ2V0U2Vhc29uIiwidmFsIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJzZWFzb24iLCJTdHJpbmciLCJsZW5ndGgiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJ2YWxpZEZpbHRlcnMiLCJnZW5lcmF0ZVVybCIsImxvYWQiLCJkYXRhIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZW1wdHkiLCJiVXJsIiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRhdGFfbWF0Y2hlcyIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImdlbmVyYXRlTWF0Y2giLCJnZW5lcmF0ZV9tYXRjaExvYWRlciIsInJlbW92ZV9tYXRjaExvYWRlciIsImxvYWRNYXRjaCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJtYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJodG1sIiwiaWQiLCJhcHBlbmQiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJtYXRjaFBsYXllciIsImdlbmVyYXRlTWF0Y2hXaWRnZXQiLCJ0aW1lc3RhbXAiLCJkYXRlIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJpbWFnZV9icGF0aCIsIm1lZGFsaHRtbCIsIm5vbWVkYWxodG1sIiwiZXhpc3RzIiwibmFtZSIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJ0YWxlbnRzaHRtbCIsImkiLCJ0YWxlbnRzIiwidGFsZW50IiwidGFsZW50dG9vbHRpcCIsInBsYXllcnNodG1sIiwidCIsInRlYW1zIiwidGVhbSIsInBsYXllcnMiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJoZXJvIiwiaW1hZ2VfaGVybyIsImNvbG9yX01hdGNoV29uTG9zdCIsIm1hcF9pbWFnZSIsIm1hcCIsImdhbWVUeXBlIiwiaGVyb1Byb3Blck5hbWUiLCJraWxscyIsImRlYXRocyIsImFzc2lzdHMiLCJrZGEiLCJjbGljayIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsIm1hdGNobWFuIiwic2VsZWN0b3IiLCJzbGlkZURvd24iLCJzbGlkZVVwIiwiZnVsbG1hdGNoX2NvbnRhaW5lciIsInRlYW1fY29udGFpbmVyIiwiZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIiLCJ3aW5uZXIiLCJoYXNCYW5zIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsImNvbnRhaW5lciIsInZpY3RvcnkiLCJiYW5zIiwiYmFuIiwibGV2ZWwiLCJtbXIiLCJvbGQiLCJyYXRpbmciLCJ0ZWFtQ29sb3IiLCJtYXRjaFBsYXllcklkIiwicGxheWVybmFtZSIsImhlcm9fbGV2ZWwiLCJsb2FkZXJodG1sIiwiaGFzT3duUHJvcGVydHkiLCJkZXNjIiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0IsRUFBcEI7O0FBRUE7OztBQUdBRCxhQUFhQyxJQUFiLENBQWtCQyxNQUFsQixHQUEyQjtBQUN2QkMsY0FBVTtBQUNOQyxpQkFBUyxLQURILEVBQ1U7QUFDaEJDLGFBQUssRUFGQyxFQUVHO0FBQ1RDLGlCQUFTLE1BSEgsQ0FHVztBQUhYLEtBRGE7QUFNdkI7Ozs7QUFJQUQsU0FBSyxlQUFxQjtBQUFBLFlBQVpBLElBQVksdUVBQU4sSUFBTTs7QUFDdEIsWUFBSUUsT0FBT1AsYUFBYUMsSUFBYixDQUFrQkMsTUFBN0I7O0FBRUEsWUFBSUcsU0FBUSxJQUFaLEVBQWtCO0FBQ2QsbUJB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dC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDI1NzllZDZhMGViMzE2OGFmMzYyIiwiLypcclxuICogUGxheWVyIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBQbGF5ZXJMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXggPSB7fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheC5tYXRjaGVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhNYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogNiwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHNlbGYuaW50ZXJuYWwub2Zmc2V0LFxyXG4gICAgICAgICAgICBsaW1pdDogc2VsZi5pbnRlcm5hbC5saW1pdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZU1hdGNoVXJsOiBmdW5jdGlvbihtYXRjaF9pZCkge1xyXG4gICAgICAgIHJldHVybiBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9tYXRjaFwiLCB7XHJcbiAgICAgICAgICAgIG1hdGNoaWQ6IG1hdGNoX2lkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIGxldCBkaXNwbGF5TWF0Y2hMb2FkZXIgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBvZmZzZXRcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID49IHNlbGYuaW50ZXJuYWwubGltaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWF0Y2hMb2FkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXkgbWF0Y2ggbG9hZGVyIGJ1dHRvbiBpZiBoYWROZXdNYXRjaFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlNYXRjaExvYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHRoZSBtYXRjaCBvZiBnaXZlbiBpZCB0byBiZSBkaXNwbGF5ZWQgdW5kZXIgbWF0Y2ggc2ltcGxld2lkZ2V0XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXRjaDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gc2VsZi5nZW5lcmF0ZU1hdGNoVXJsKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZnVsbG1hdGNoLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLm1hdGNodXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaCA9IGpzb24ubWF0Y2g7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlRnVsbE1hdGNoUm93cyhtYXRjaGlkLCBqc29uX21hdGNoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZ1bGxtYXRjaC1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblBsYXllckxvYWRlci5kYXRhID0ge1xyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGlzIGN1cnJlbnRseSB0b2dnbGVkIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgICAgIG1hdGNoUGxheWVyOiBtYXRjaC5wbGF5ZXIuaWQgLy9JZCBvZiB0aGUgbWF0Y2gncyBwbGF5ZXIgZm9yIHdob20gdGhlIG1hdGNoIGlzIGJlaW5nIGRpc3BsYXllZCwgZm9yIHVzZSB3aXRoIGhpZ2hsaWdodGluZyBpbnNpZGUgb2YgZnVsbG1hdGNoICh3aGlsZSBkZWNvdXBsaW5nIG1haW5wbGF5ZXIpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hXaWRnZXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIFdpZGdldCBDb250YWluZXJcclxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG1hdGNoLmRhdGU7XHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZV9kYXRlID0gSG90c3RhdHVzLmRhdGUuZ2V0UmVsYXRpdmVUaW1lKHRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hfdGltZSA9IEhvdHN0YXR1cy5kYXRlLmdldE1pbnV0ZVNlY29uZFRpbWUobWF0Y2gubWF0Y2hfbGVuZ3RoKTtcclxuICAgICAgICAgICAgbGV0IHZpY3RvcnlUZXh0ID0gKG1hdGNoLnBsYXllci53b24pID8gKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLXdvblwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicGwtcmVjZW50bWF0Y2gtbG9zdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gbWF0Y2gucGxheWVyLm1lZGFsO1xyXG5cclxuICAgICAgICAgICAgLy9TaWxlbmNlXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluay10b3hpYyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHNpbGVuY2VfaW1hZ2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gaW1hZ2VfYnBhdGggKyAnL3VpL2ljb25fdG94aWMucG5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnPHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPHNwYW4gY2xhc3M9XFwncm0tc3ctbGluay10b3hpY1xcJz5TaWxlbmNlZDwvc3Bhbj5cIj48aW1nIGNsYXNzPVwicm0tc3ctdG94aWNcIiBzdHlsZT1cIndpZHRoOicgKyBzaXplICsgJ3B4O2hlaWdodDonICsgc2l6ZSArICdweDtcIiBzcmM9XCInICsgcGF0aCArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgbm9tZWRhbGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAobWVkYWwuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLW1lZGFsLWNvbnRhaW5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tc3ctc3AtbWVkYWxcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5pbWFnZSArICdfYmx1ZS5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sID0gXCI8ZGl2IGNsYXNzPSdybS1zdy1zcC1vZmZzZXQnPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1RhbGVudHNcclxuICAgICAgICAgICAgbGV0IHRhbGVudHNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPGRpdiBjbGFzcz0ncm0tc3ctdHAtdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBtYXRjaC5wbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXRwLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXJzXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC10ZWFtJyArIHQgKyAnXCI+JztcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaC5wbGF5ZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXJcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXBwLXBsYXllci1pbWFnZVwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBwbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L3NwYW4+JyArIHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxMikgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtY29udGFpbmVyLScrIG1hdGNoLmlkICsnXCI+PGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXRcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWxlZnRwYW5lICcgKyBzZWxmLmNvbG9yX01hdGNoV29uTG9zdChtYXRjaC5wbGF5ZXIud29uKSArICdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgbWF0Y2gubWFwX2ltYWdlICsgJyk7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZS10ZXh0XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1hdGNoLm1hcCArICdcIj4nICsgbWF0Y2guZ2FtZVR5cGUgKyAnPC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1kYXRlXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIGRhdGUgKyAnXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1scC1kYXRlLXRleHRcIj4nICsgcmVsYXRpdmVfZGF0ZSArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC12aWN0b3J5XCI+JyArIHZpY3RvcnlUZXh0ICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1tYXRjaGxlbmd0aFwiPicgKyBtYXRjaF90aW1lICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaGVyb3BhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2PjxpbWcgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBybS1zdy1ocC1wb3J0cmFpdFwiIHNyYz1cIicgKyBtYXRjaC5wbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctaHAtaGVyb25hbWVcIj4nK3NpbGVuY2VfaW1hZ2UobWF0Y2gucGxheWVyLnNpbGVuY2VkLCAxNikrJzxhIGNsYXNzPVwiJytzaWxlbmNlKG1hdGNoLnBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBtYXRjaC5wbGF5ZXIuaGVyb30pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBtYXRjaC5wbGF5ZXIuaGVybyArICc8L2E+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1zdGF0c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3AtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIG5vbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtdGV4dFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBtYXRjaC5wbGF5ZXIua2lsbHMgKyAnIC8gPHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIG1hdGNoLnBsYXllci5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBtYXRjaC5wbGF5ZXIuYXNzaXN0cyArICc8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGFcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCIoS2lsbHMgKyBBc3Npc3RzKSAvIERlYXRoc1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1udW1cIj4nICsgbWF0Y2gucGxheWVyLmtkYSArICc8L3NwYW4+IEtEQTwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtdGFsZW50c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctdHAtdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtcGxheWVyc3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctcHAtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgZnVsbCBtYXRjaCBwYW5lXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2hpZCkuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLScgKyBtYXRjaGlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9hZCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgYWpheC5sb2FkTWF0Y2gobWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vTG9nIGFzIGdlbmVyYXRlZCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbEdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbE1hdGNoUm93czogZnVuY3Rpb24obWF0Y2hpZCwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgZnVsbG1hdGNoX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0ZWFtc1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgIGZ1bGxtYXRjaF9jb250YWluZXIuYXBwZW5kKCc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQgKydcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZWFtX2NvbnRhaW5lciA9ICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UZWFtIFJvdyBIZWFkZXJcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXIodGVhbV9jb250YWluZXIsIHRlYW0sIG1hdGNoLndpbm5lciA9PT0gdCwgbWF0Y2guaGFzQmFucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggcGxheWVycyBmb3IgdGVhbVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUGxheWVyIFJvd1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsbWF0Y2hSb3cobWF0Y2hpZCwgdGVhbV9jb250YWluZXIsIHBsYXllciwgdGVhbS5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJysgYmFuLmltYWdlICsnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggcGxheWVyXHJcbiAgICAgICAgICAgIGxldCBtYXRjaFBsYXllcklkID0gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5tYXRjaFBsYXllcjtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9QbGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBsZXQgcGxheWVybmFtZSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc3BlY2lhbCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaFBsYXllcklkKSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWFsID0gJzxhIGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lIHJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSAnKyBzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkgKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiBwbGF5ZXIuaWR9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXllcm5hbWUgKz0gc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDE0KSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+JztcclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsID0gcGxheWVyLm1lZGFsO1xyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1lZGFsLWlubmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1mbS1yLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnXycrIHRlYW1Db2xvciArJy5wbmdcIj48L3NwYW4+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLWZtLXItdGFsZW50LWJnJz5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnRhbGVudHMubGVuZ3RoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBwbGF5ZXIudGFsZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRhbGVudHRvb2x0aXAodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSkgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItdGFsZW50XCIgc3JjPVwiJyArIHRhbGVudC5pbWFnZSArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0J1aWxkIGh0bWxcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd1wiPicgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVfbWF0Y2hMb2FkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlcmh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyXCI+TG9hZCBNb3JlIE1hdGNoZXMuLi48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGxvYWRlcmh0bWwpO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIVBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdC5odG1sKCc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0xeCBmYS1md1wiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcy5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaExvYWRlckdlbmVyYXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xvcl9NYXRjaFdvbkxvc3Q6IGZ1bmN0aW9uKHdvbikge1xyXG4gICAgICAgICAgICBpZiAod29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLXdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLWxvc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0ID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcicsIHtwbGF5ZXI6IHBsYXllcl9pZH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==