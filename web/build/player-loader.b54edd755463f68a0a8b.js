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
                fullDisplay: false //Whether or not the full match data is currently toggled to display
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

                console.log("click");

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
                //Generate full match pane
                $('#recentmatch-container-' + matchid).append('<div id="recentmatch-fullmatch-' + matchid + '" class="recentmatch-fullmatch"></div>');

                //Load data
                ajax.loadMatch(matchid);

                //Log as generated in manifest
                self.internal.matchManifest[matchid + ""].fullGenerated = true;
                self.internal.matchManifest[matchid + ""].fullDisplay = true;
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
                            self.generateFullmatchRow(team_container, player);
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
        generateFullmatchRow: function generateFullmatchRow(container, player) {
            var self = PlayerLoader.data.matches;

            var html = '<div class="rm-fm-row">' +
            //Hero Image Container (With Hero Level)
            '<div class="rm-fm-r-heroimage-container">' + '<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + player.hero + '"><div class="rm-fm-r-herolevel">' + player.hero_level + '</div><img class="rm-fm-r-heroimage" src="' + player.image_hero + '"></span>' + '</div>' + '</div>';

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
                var t = $(this);

                t.html('<i class="fa fa-refresh fa-spin fa-1x fa-fw"></i>');

                PlayerLoader.ajax.matches.load();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDFiNzI5MDczN2VjN2Q4NTE2YTQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwiZ2V0U2Vhc29uIiwidmFsIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJzZWFzb24iLCJTdHJpbmciLCJsZW5ndGgiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJ2YWxpZEZpbHRlcnMiLCJnZW5lcmF0ZVVybCIsImxvYWQiLCJkYXRhIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZW1wdHkiLCJiVXJsIiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRhdGFfbWF0Y2hlcyIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImdlbmVyYXRlTWF0Y2giLCJnZW5lcmF0ZV9tYXRjaExvYWRlciIsInJlbW92ZV9tYXRjaExvYWRlciIsImxvYWRNYXRjaCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJtYXRjaExvYWRlckdlbmVyYXRlZCIsIm1hdGNoTWFuaWZlc3QiLCJodG1sIiwiaWQiLCJhcHBlbmQiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwidGltZXN0YW1wIiwiZGF0ZSIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0Iiwid29uIiwibWVkYWwiLCJzaWxlbmNlIiwiaXNTaWxlbmNlZCIsInIiLCJzaWxlbmNlX2ltYWdlIiwic2l6ZSIsInMiLCJwYXRoIiwiaW1hZ2VfYnBhdGgiLCJtZWRhbGh0bWwiLCJub21lZGFsaHRtbCIsImV4aXN0cyIsIm5hbWUiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwidGFsZW50c2h0bWwiLCJpIiwidGFsZW50cyIsInRhbGVudCIsInRhbGVudHRvb2x0aXAiLCJwbGF5ZXJzaHRtbCIsInQiLCJ0ZWFtcyIsInRlYW0iLCJwbGF5ZXJzIiwic3BlY2lhbCIsInNpbGVuY2VkIiwiaGVybyIsImltYWdlX2hlcm8iLCJjb2xvcl9NYXRjaFdvbkxvc3QiLCJtYXBfaW1hZ2UiLCJtYXAiLCJnYW1lVHlwZSIsImhlcm9Qcm9wZXJOYW1lIiwia2lsbHMiLCJkZWF0aHMiLCJhc3Npc3RzIiwia2RhIiwiY2xpY2siLCJjb25zb2xlIiwibG9nIiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwibWF0Y2htYW4iLCJzZWxlY3RvciIsInNsaWRlRG93biIsInNsaWRlVXAiLCJmdWxsbWF0Y2hfY29udGFpbmVyIiwidGVhbV9jb250YWluZXIiLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlciIsIndpbm5lciIsImhhc0JhbnMiLCJnZW5lcmF0ZUZ1bGxtYXRjaFJvdyIsImNvbnRhaW5lciIsInZpY3RvcnkiLCJiYW5zIiwiYmFuIiwibGV2ZWwiLCJtbXIiLCJvbGQiLCJyYXRpbmciLCJoZXJvX2xldmVsIiwibG9hZGVyaHRtbCIsImhhc093blByb3BlcnR5IiwiZGVzYyIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGVBQWUsRUFBbkI7O0FBRUE7OztBQUdBQSxhQUFhQyxJQUFiLEdBQW9CLEVBQXBCOztBQUVBOzs7QUFHQUQsYUFBYUMsSUFBYixDQUFrQkMsTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURhO0FBTXZCOzs7O0FBSUFELFNBQUssZUFBcUI7QUFBQSxZQUFaQSxJQUFZLHVFQUFOLElBQU07O0FBQ3RCLFlBQUlFLE9BQU9QLGFBQWFDLElBQWIsQ0FBa0JDLE1BQTdCOztBQUVBLFlBQUlHLFNBQVEsSUFBWixFQUFrQjtBQUNkLG1CQUFPRSxLQUFLSixRQUFMLENBQWNFLEdBQXJCO0FBQ0gsU0FGRCxNQUdLO0FBQ0RF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TCxDQUFjaUUsYUFBZCxHQUE4QixFQUE5QjtBQUNIO0FBelNJO0FBRE8sQ0FBcEI7O0FBK1NBOUMsRUFBRWdJLFFBQUYsRUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCakksTUFBRWtJLEVBQUYsQ0FBS0MsWUFBTCxDQUFrQkMsUUFBbEIsR0FBNkIsTUFBN0IsQ0FEeUIsQ0FDWTs7QUFFckM7QUFDQSxRQUFJMUksVUFBVThCLFFBQVFDLFFBQVIsQ0FBaUIsNEJBQWpCLEVBQStDLEVBQUNDLFFBQVFDLFNBQVQsRUFBL0MsQ0FBZDs7QUFFQSxRQUFJaEMsY0FBYyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxCO0FBQ0EsUUFBSTBJLGFBQWEzSixhQUFhQyxJQUFiLENBQWtCQyxNQUFuQzs7QUFFQXlKLGVBQVc1SSxZQUFYLENBQXdCQyxPQUF4QjtBQUNBTixvQkFBZ0JrSixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0MzSSxXQUF4QztBQUNBMEksZUFBVzVJLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBSyxNQUFFLHdCQUFGLEVBQTRCdUksRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRHBKLHdCQUFnQmtKLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3QzNJLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBSyxNQUFFLEdBQUYsRUFBT3VJLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENKLG1CQUFXNUksWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdEJELEUiLCJmaWxlIjoicGxheWVyLWxvYWRlci5iNTRlZGQ3NTU0NjNmNjhhMGE4Yi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGQxYjcyOTA3MzdlYzdkODUxNmE0IiwiLypcclxuICogUGxheWVyIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBQbGF5ZXJMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXggPSB7fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheC5tYXRjaGVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhNYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIG1hdGNobG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSBmdWxsbWF0Y2ggcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIG1hdGNodXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgZnVsbG1hdGNoIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogNiwgLy9NYXRjaGVzIGxpbWl0IChJbml0aWFsIGxpbWl0IGlzIHNldCBieSBpbml0aWFsIGxvYWRlcilcclxuICAgIH0sXHJcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfcmVjZW50bWF0Y2hlc1wiLCB7XHJcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyX2lkLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHNlbGYuaW50ZXJuYWwub2Zmc2V0LFxyXG4gICAgICAgICAgICBsaW1pdDogc2VsZi5pbnRlcm5hbC5saW1pdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJVcmwsIFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZU1hdGNoVXJsOiBmdW5jdGlvbihtYXRjaF9pZCkge1xyXG4gICAgICAgIHJldHVybiBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9tYXRjaFwiLCB7XHJcbiAgICAgICAgICAgIG1hdGNoaWQ6IG1hdGNoX2lkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IGFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIGxldCBkaXNwbGF5TWF0Y2hMb2FkZXIgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBvZmZzZXRcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCBkaXNwbGF5TWF0Y2hMb2FkZXIgaWYgd2UgZ290IGFzIG1hbnkgbWF0Y2hlcyBhcyB3ZSBhc2tlZCBmb3JcclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNoZXMubGVuZ3RoID49IHNlbGYuaW50ZXJuYWwubGltaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWF0Y2hMb2FkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGRpc3BsYXkgbWF0Y2ggbG9hZGVyIGJ1dHRvbiBpZiBoYWROZXdNYXRjaFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlNYXRjaExvYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLnJlbW92ZV9tYXRjaExvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHRoZSBtYXRjaCBvZiBnaXZlbiBpZCB0byBiZSBkaXNwbGF5ZWQgdW5kZXIgbWF0Y2ggc2ltcGxld2lkZ2V0XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXRjaDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNodXJsID0gc2VsZi5nZW5lcmF0ZU1hdGNoVXJsKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZnVsbG1hdGNoLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLm1hdGNodXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaCA9IGpzb24ubWF0Y2g7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlRnVsbE1hdGNoUm93cyhtYXRjaGlkLCBqc29uX21hdGNoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZ1bGxtYXRjaC1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblBsYXllckxvYWRlci5kYXRhID0ge1xyXG4gICAgbWF0Y2hlczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIG1hdGNoTG9hZGVyR2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkICsgXCJcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsR2VuZXJhdGVkOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgZnVsbCBtYXRjaCBkYXRhIGhhcyBiZWVuIGxvYWRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgICAgIGZ1bGxEaXNwbGF5OiBmYWxzZSAvL1doZXRoZXIgb3Igbm90IHRoZSBmdWxsIG1hdGNoIGRhdGEgaXMgY3VycmVudGx5IHRvZ2dsZWQgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9NZWRhbFxyXG4gICAgICAgICAgICBsZXQgbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IG5vbWVkYWxodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKG1lZGFsLmV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sID0gJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1tZWRhbC1jb250YWluZXJcIj48c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLm5hbWUgKyAnPC9kaXY+PGRpdj4nICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnPC9kaXY+XCI+PGltZyBjbGFzcz1cInJtLXN3LXNwLW1lZGFsXCIgc3JjPVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwuaW1hZ2UgKyAnX2JsdWUucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCA9IFwiPGRpdiBjbGFzcz0ncm0tc3ctc3Atb2Zmc2V0Jz48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9UYWxlbnRzXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRzaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXRwLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gbWF0Y2gucGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy10cC10YWxlbnRcIiBzcmM9XCInICsgdGFsZW50LmltYWdlICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9IFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyc1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyc2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcGVjaWFsID0gJzxhIGNsYXNzPVwiJytzaWxlbmNlKHBsYXllci5zaWxlbmNlZCkrJ1wiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcInBsYXllclwiLCB7aWQ6IHBsYXllci5pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2gucGxheWVyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtcGxheWVyXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHBsYXllci5oZXJvICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXItaW1hZ2VcIiBzcmM9XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgcGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9zcGFuPicgKyBzaWxlbmNlX2ltYWdlKHBsYXllci5zaWxlbmNlZCwgMTIpICsgc3BlY2lhbCArIHBsYXllci5uYW1lICsgJzwvYT48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJlY2VudG1hdGNoLWNvbnRhaW5lci0nKyBtYXRjaC5pZCArJ1wiPjxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1sZWZ0cGFuZSAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArIG1hdGNoLm1hcF9pbWFnZSArICcpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGUtdGV4dFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtYXRjaC5tYXAgKyAnXCI+JyArIG1hdGNoLmdhbWVUeXBlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctbHAtZGF0ZS10ZXh0XCI+JyArIHJlbGF0aXZlX2RhdGUgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JytzaWxlbmNlX2ltYWdlKG1hdGNoLnBsYXllci5zaWxlbmNlZCwgMTYpKyc8YSBjbGFzcz1cIicrc2lsZW5jZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQpKydcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogbWF0Y2gucGxheWVyLmhlcm99KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgbWF0Y2gucGxheWVyLmhlcm8gKyAnPC9hPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtc3RhdHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBub21lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdlwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIktpbGxzIC8gRGVhdGhzIC8gQXNzaXN0c1wiPjxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LXRleHRcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgbWF0Y2gucGxheWVyLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBtYXRjaC5wbGF5ZXIuZGVhdGhzICsgJzwvc3Bhbj4gLyAnICsgbWF0Y2gucGxheWVyLmFzc2lzdHMgKyAnPC9zcGFuPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhXCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCJybS1zdy1zcC1rZGEtbnVtXCI+JyArIG1hdGNoLnBsYXllci5rZGEgKyAnPC9zcGFuPiBLREE8L3NwYW4+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgbWVkYWxodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXRhbGVudHNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXRwLXRhbGVudC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXBsYXllcnNwYW5lXCI+PGRpdiBjbGFzcz1cInJtLXN3LXBwLWlubmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1pbnNwZWN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjbGljayBsaXN0ZW5lcnMgZm9yIGluc3BlY3QgcGFuZVxyXG4gICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1jb250YWluZXItJyttYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCArJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtZnVsbG1hdGNoXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgIGFqYXgubG9hZE1hdGNoKG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9nIGFzIGdlbmVyYXRlZCBpbiBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0uZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd3M6IGZ1bmN0aW9uKG1hdGNoaWQsIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGZ1bGxtYXRjaF9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGVhbXNcclxuICAgICAgICAgICAgbGV0IHQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIG1hdGNoLnRlYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBmdWxsbWF0Y2hfY29udGFpbmVyLmFwcGVuZCgnPGRpdiBpZD1cInJlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkICsnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVhbV9jb250YWluZXIgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLXRlYW0tY29udGFpbmVyLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGVhbSBSb3cgSGVhZGVyXHJcbiAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbE1hdGNoUm93SGVhZGVyKHRlYW1fY29udGFpbmVyLCB0ZWFtLCBtYXRjaC53aW5uZXIgPT09IHQsIG1hdGNoLmhhc0JhbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHBsYXllcnMgZm9yIHRlYW1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0ZWFtLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1BsYXllciBSb3dcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdlbmVyYXRlRnVsbG1hdGNoUm93KHRlYW1fY29udGFpbmVyLCBwbGF5ZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dIZWFkZXI6IGZ1bmN0aW9uKGNvbnRhaW5lciwgdGVhbSwgd2lubmVyLCBoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vVmljdG9yeVxyXG4gICAgICAgICAgICBsZXQgdmljdG9yeSA9ICh3aW5uZXIpID8gKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnlcIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInJtLWZtLXJoLWRlZmVhdFwiPkRlZmVhdDwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQmFuc1xyXG4gICAgICAgICAgICBsZXQgYmFucyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGFzQmFucykge1xyXG4gICAgICAgICAgICAgICAgYmFucyArPSAnQmFuczogJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJhbiBvZiB0ZWFtLmJhbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYW5zICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgYmFuLm5hbWUgKyAnXCI+PGltZyBjbGFzcz1cInJtLWZtLXJoLWJhblwiIHNyYz1cIicrIGJhbi5pbWFnZSArJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tcm93aGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAvL1ZpY3RvcnkgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLXZpY3RvcnktY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB2aWN0b3J5ICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vVGVhbSBMZXZlbCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbGV2ZWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLmxldmVsICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIC8vQmFucyBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtYmFucy1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIGJhbnMgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9NbXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXJoLW1tci1jb250YWluZXJcIj5NTVI6IDxzcGFuIGNsYXNzPVwicm0tZm0tcmgtbW1yXCI+JyArXHJcbiAgICAgICAgICAgICAgICB0ZWFtLm1tci5vbGQucmF0aW5nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxtYXRjaFJvdzogZnVuY3Rpb24oY29udGFpbmVyLCBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInJtLWZtLXJvd1wiPicgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlX21hdGNoTG9hZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVyaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXJcIj5Mb2FkIE1vcmUgTWF0Y2hlcy4uLjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQobG9hZGVyaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtbWF0Y2hsb2FkZXInKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0Lmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTF4IGZhLWZ3XCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNNYXRjaEdlbmVyYXRlZDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0Lmhhc093blByb3BlcnR5KG1hdGNoaWQgKyBcIlwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbGVudHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwpO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=