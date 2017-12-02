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
            ajax.topheroes.reset();

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

            /*
             * Initial Top Heroes
             */
            var ajaxTopHeroes = ajax.topheroes;

            //Load initial top heroes
            ajaxTopHeroes.load();

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

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Top Heroes Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_heroes = json.heroes;

            /*
             * Process Top Heroes
             */
            if (json_heroes.length > 0) {
                data_topheroes.generateTopHeroesContainer();

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
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = json_matches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var match = _step2.value;

                    if (!data_matches.isMatchGenerated(match.id)) {
                        data_matches.generateMatch(match);
                    }
                }

                //Set displayMatchLoader if we got as many matches as we asked for
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
    topheroes: {
        internal: {
            heroLimit: 5 //How many heroes should be displayed at a time
        },
        empty: function empty() {
            $('#pl-topheroes-container').remove();
        },
        generateTopHeroesContainer: function generateTopHeroesContainer() {
            var html = '<div id="pl-topheroes-container" class="pl-topheroes-container hotstatus-subcontainer padding-left-0 padding-right-0">' + '</div>';

            $('#player-leftpane-container').append(html);
        },
        generateTopHeroesTableData: function generateTopHeroesTableData(hero) {
            var herofield = '<div class="pl-th-heropane"><div><img class="pl-th-hp-heroimage" src="' + hero.image_hero + '"></div>' + '<div><a class="pl-th-hp-heroname" href="' + Routing.generate("hero", { heroProperName: hero.name }) + '" target="_blank">' + hero.name + '</a></div></div>';

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
            '<div class="pl-th-kda-kda">' + kda + '</div>' +
            //KDA indiv
            '<div class="pl-th-kda-indiv">' + kdaindiv + '</div>' + '</div>';

            var winratefield = hero.winrate;

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
            datatable.dom = "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
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
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = match.teams[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var team = _step3.value;

                    playershtml += '<div class="rm-sw-pp-team' + t + '">';

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = team.players[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var player = _step4.value;

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

                    playershtml += '</div>';

                    t++;
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
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = match.teams[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var team = _step5.value;

                    //Team Container
                    fullmatch_container.append('<div id="recentmatch-fullmatch-team-container-' + matchid + '"></div>');
                    var team_container = $('#recentmatch-fullmatch-team-container-' + matchid);

                    //Team Row Header
                    self.generateFullMatchRowHeader(team_container, team, match.winner === t, match.hasBans);

                    //Loop through players for team
                    var p = 0;
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = team.players[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var player = _step6.value;

                            //Player Row
                            self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats, p % 2, partiesCounter);

                            if (player.party > 0) {
                                var partyOffset = player.party - 1;
                                partiesCounter[partyOffset]++;
                            }

                            p++;
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

                    t++;
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
        generateFullMatchRowHeader: function generateFullMatchRowHeader(container, team, winner, hasBans) {
            var self = PlayerLoader.data.matches;

            //Victory
            var victory = winner ? '<span class="rm-fm-rh-victory">Victory</span>' : '<span class="rm-fm-rh-defeat">Defeat</span>';

            //Bans
            var bans = '';
            if (hasBans) {
                bans += 'Bans: ';
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = team.bans[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var ban = _step7.value;

                        bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="' + ban.image + '"></span>';
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

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = rowstats[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    stat = _step8.value;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTQwMmQ2NDNiYjhiNDI0NGI5YWMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImRlbGF5IiwibWlsbGlzZWNvbmRzIiwiZnVuYyIsInNldFRpbWVvdXQiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImdldFNlYXNvbiIsInZhbCIsIkhvdHN0YXR1c0ZpbHRlciIsImdldFNlbGVjdG9yVmFsdWVzIiwic2Vhc29uIiwiU3RyaW5nIiwibGVuZ3RoIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsIiQiLCJhcHBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJ0b3BoZXJvZXMiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJhamF4VG9wSGVyb2VzIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJmYWRlSW4iLCJxdWV1ZSIsInJlbW92ZSIsImVtcHR5IiwiYlVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInBsYXllciIsInBsYXllcl9pZCIsImRhdGFfdG9waGVyb2VzIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJnZW5lcmF0ZVRvcEhlcm9lc0NvbnRhaW5lciIsImdlbmVyYXRlVG9wSGVyb2VzVGFibGUiLCJ0b3BIZXJvZXNUYWJsZSIsImdldFRvcEhlcm9lc1RhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YSIsImluaXRUb3BIZXJvZXNUYWJsZSIsIm1hdGNobG9hZGluZyIsIm1hdGNodXJsIiwiZ2VuZXJhdGVNYXRjaFVybCIsIm1hdGNoX2lkIiwibWF0Y2hpZCIsImRhdGFfbWF0Y2hlcyIsImRpc3BsYXlNYXRjaExvYWRlciIsImpzb25fb2Zmc2V0cyIsIm9mZnNldHMiLCJqc29uX2xpbWl0cyIsImpzb25fbWF0Y2hlcyIsIm1hdGNoIiwiaXNNYXRjaEdlbmVyYXRlZCIsImlkIiwiZ2VuZXJhdGVNYXRjaCIsImdlbmVyYXRlX21hdGNoTG9hZGVyIiwicmVtb3ZlX21hdGNoTG9hZGVyIiwibG9hZE1hdGNoIiwicHJlcGVuZCIsImpzb25fbWF0Y2giLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd3MiLCJoZXJvTGltaXQiLCJodG1sIiwiaGVyb2ZpZWxkIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwibmFtZSIsImdvb2RrZGEiLCJrZGFfcmF3Iiwia2RhIiwia2RhX2F2ZyIsImtkYWluZGl2Iiwia2lsbHNfYXZnIiwiZGVhdGhzX2F2ZyIsImFzc2lzdHNfYXZnIiwia2RhZmllbGQiLCJ3aW5yYXRlZmllbGQiLCJ3aW5yYXRlIiwicm93TGVuZ3RoIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwic29ydGluZyIsInNlYXJjaGluZyIsImRlZmVyUmVuZGVyIiwicGFnZUxlbmd0aCIsInBhZ2luZyIsInBhZ2luZ1R5cGUiLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwibWF0Y2hMb2FkZXJHZW5lcmF0ZWQiLCJtYXRjaE1hbmlmZXN0IiwiaGFzT3duUHJvcGVydHkiLCJwYXJ0aWVzQ29sb3JzIiwidXRpbGl0eSIsInNodWZmbGUiLCJmdWxsR2VuZXJhdGVkIiwiZnVsbERpc3BsYXkiLCJtYXRjaFBsYXllciIsImdlbmVyYXRlTWF0Y2hXaWRnZXQiLCJ0aW1lc3RhbXAiLCJkYXRlIiwicmVsYXRpdmVfZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoX3RpbWUiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwibWF0Y2hfbGVuZ3RoIiwidmljdG9yeVRleHQiLCJ3b24iLCJtZWRhbCIsInNpbGVuY2UiLCJpc1NpbGVuY2VkIiwiciIsInNpbGVuY2VfaW1hZ2UiLCJzaXplIiwicyIsInBhdGgiLCJpbWFnZV9icGF0aCIsIm1lZGFsaHRtbCIsIm5vbWVkYWxodG1sIiwiZXhpc3RzIiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInRhbGVudHNodG1sIiwiaSIsInRhbGVudHMiLCJ0YWxlbnQiLCJ0YWxlbnR0b29sdGlwIiwicGxheWVyc2h0bWwiLCJwYXJ0aWVzQ291bnRlciIsInQiLCJ0ZWFtcyIsInRlYW0iLCJwbGF5ZXJzIiwicGFydHkiLCJwYXJ0eU9mZnNldCIsInBhcnR5Q29sb3IiLCJzcGVjaWFsIiwic2lsZW5jZWQiLCJjb2xvcl9NYXRjaFdvbkxvc3QiLCJtYXBfaW1hZ2UiLCJtYXAiLCJnYW1lVHlwZSIsImtpbGxzIiwiZGVhdGhzIiwiYXNzaXN0cyIsImNsaWNrIiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwibWF0Y2htYW4iLCJzZWxlY3RvciIsInNsaWRlRG93biIsInNsaWRlVXAiLCJmdWxsbWF0Y2hfY29udGFpbmVyIiwidGVhbV9jb250YWluZXIiLCJnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlciIsIndpbm5lciIsImhhc0JhbnMiLCJwIiwiZ2VuZXJhdGVGdWxsbWF0Y2hSb3ciLCJjb2xvciIsInN0YXRzIiwiY29udGFpbmVyIiwidmljdG9yeSIsImJhbnMiLCJiYW4iLCJsZXZlbCIsIm1tciIsIm9sZCIsInJhdGluZyIsInRlYW1Db2xvciIsIm1hdGNoU3RhdHMiLCJvZGRFdmVuIiwibWF0Y2hQbGF5ZXJJZCIsInBsYXllcm5hbWUiLCJyb3dzdGF0X3Rvb2x0aXAiLCJkZXNjIiwicm93c3RhdHMiLCJrZXkiLCJjbGFzcyIsIndpZHRoIiwidmFsdWUiLCJ2YWx1ZURpc3BsYXkiLCJzdGF0IiwibWF4IiwicGVyY2VudE9uUmFuZ2UiLCJtbXJEZWx0YVR5cGUiLCJtbXJEZWx0YVByZWZpeCIsImRlbHRhIiwibW1yRGVsdGEiLCJyYW5rIiwidGllciIsImhlcm9fbGV2ZWwiLCJsb2FkZXJodG1sIiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0I7QUFDaEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5lLENBQXBCOztBQVNBOzs7QUFHQUgsYUFBYUMsSUFBYixDQUFrQkssTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMs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RUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCL00sTUFBRWdOLEVBQUYsQ0FBS0MsWUFBTCxDQUFrQkMsUUFBbEIsR0FBNkIsTUFBN0IsQ0FEeUIsQ0FDWTs7QUFFckM7QUFDQSxRQUFJeE4sVUFBVWdDLFFBQVFDLFFBQVIsQ0FBaUIsNEJBQWpCLEVBQStDLEVBQUNDLFFBQVFDLFNBQVQsRUFBL0MsQ0FBZDs7QUFFQSxRQUFJbEMsY0FBYyxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQWxCO0FBQ0EsUUFBSXdOLGFBQWE3TyxhQUFhQyxJQUFiLENBQWtCSyxNQUFuQzs7QUFFQTtBQUNBUSxvQkFBZ0JnTyxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N6TixXQUF4QztBQUNBd04sZUFBVzFOLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBSyxNQUFFLHdCQUFGLEVBQTRCcU4sRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRGxPLHdCQUFnQmdPLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q3pOLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBSyxNQUFFLEdBQUYsRUFBT3FOLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENKLG1CQUFXMU4sWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdEJELEUiLCJmaWxlIjoicGxheWVyLWxvYWRlci45OTc2ZTdiNTk4MjdiYmFlMTE4Ni5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDE0MDJkNjQzYmI4YjQyNDRiOWFjIiwiLypcclxuICogUGxheWVyIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBQbGF5ZXJMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXggPSB7XHJcbiAgICAvKlxyXG4gICAgICogRXhlY3V0ZXMgZnVuY3Rpb24gYWZ0ZXIgZ2l2ZW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIGRlbGF5OiBmdW5jdGlvbihtaWxsaXNlY29uZHMsIGZ1bmMpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmMsIG1pbGxpc2Vjb25kcyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2Vhc29uIHNlbGVjdGVkIGJhc2VkIG9uIGZpbHRlclxyXG4gICAgICovXHJcbiAgICBnZXRTZWFzb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2V0U2VsZWN0b3JWYWx1ZXMoXCJzZWFzb25cIik7XHJcblxyXG4gICAgICAgIGxldCBzZWFzb24gPSBcIlVua25vd25cIjtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsICE9PSBudWxsICYmIHZhbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWFzb247XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvLy0tIEluaXRpYWwgTWF0Y2hlcyBGaXJzdCBMb2FkXHJcbiAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtbG9hZGVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGxheWVybG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS0zeCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhamF4Lm1hdGNoZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIGFqYXgudG9waGVyb2VzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhNYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBUb3AgSGVyb2VzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBhamF4VG9wSGVyb2VzID0gYWpheC50b3BoZXJvZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgdG9wIGhlcm9lc1xyXG4gICAgICAgICAgICAgICAgYWpheFRvcEhlcm9lcy5sb2FkKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBsYXllcmxvYWRlci1wcm9jZXNzaW5nJykuZmFkZUluKCkuZGVsYXkoNzUwKS5xdWV1ZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgudG9waGVyb2VzO1xyXG5cclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLnRvcGhlcm9lcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgbGV0IGJVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXJfdG9waGVyb2VzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIFRvcCBIZXJvZXMgZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4LnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV90b3BoZXJvZXMgPSBkYXRhLnRvcGhlcm9lcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFRvcCBIZXJvZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZXMgPSBqc29uLmhlcm9lcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBUb3AgSGVyb2VzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX2hlcm9lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wSGVyb2VzVGFibGUgPSBkYXRhX3RvcGhlcm9lcy5nZXRUb3BIZXJvZXNUYWJsZUNvbmZpZyhqc29uX2hlcm9lcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGVybyBvZiBqc29uX2hlcm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BIZXJvZXNUYWJsZS5kYXRhLnB1c2goZGF0YV90b3BoZXJvZXMuZ2VuZXJhdGVUb3BIZXJvZXNUYWJsZURhdGEoaGVybykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV90b3BoZXJvZXMuaW5pdFRvcEhlcm9lc1RhYmxlKHRvcEhlcm9lc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICBtYXRjaGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgZnVsbG1hdGNoIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBtYXRjaHVybDogJycsIC8vdXJsIHRvIGdldCBhIGZ1bGxtYXRjaCByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICAgICAgb2Zmc2V0OiAwLCAvL01hdGNoZXMgb2Zmc2V0XHJcbiAgICAgICAgbGltaXQ6IDYsIC8vTWF0Y2hlcyBsaW1pdCAoSW5pdGlhbCBsaW1pdCBpcyBzZXQgYnkgaW5pdGlhbCBsb2FkZXIpXHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9ICcnO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2h1cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcy5lbXB0eSgpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBiVXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiVXJsLCBbXCJzZWFzb25cIiwgXCJnYW1lVHlwZVwiXSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVNYXRjaFVybDogZnVuY3Rpb24obWF0Y2hfaWQpIHtcclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfbWF0Y2hcIiwge1xyXG4gICAgICAgICAgICBtYXRjaGlkOiBtYXRjaF9pZCxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogTG9hZHMge2xpbWl0fSByZWNlbnQgbWF0Y2hlcyBvZmZzZXQgYnkge29mZnNldH0gZnJvbSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBhamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBsZXQgZGlzcGxheU1hdGNoTG9hZGVyID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX29mZnNldHMgPSBqc29uLm9mZnNldHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9saW1pdHMgPSBqc29uLmxpbWl0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNoZXMgPSBqc29uLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFByb2Nlc3MgTWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1NldCBuZXcgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldCA9IGpzb25fb2Zmc2V0cy5tYXRjaGVzICsgc2VsZi5pbnRlcm5hbC5saW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0FwcGVuZCBuZXcgTWF0Y2ggd2lkZ2V0cyBmb3IgbWF0Y2hlcyB0aGF0IGFyZW4ndCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1hdGNoIG9mIGpzb25fbWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YV9tYXRjaGVzLmlzTWF0Y2hHZW5lcmF0ZWQobWF0Y2guaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZU1hdGNoKG1hdGNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgZGlzcGxheU1hdGNoTG9hZGVyIGlmIHdlIGdvdCBhcyBtYW55IG1hdGNoZXMgYXMgd2UgYXNrZWQgZm9yXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaGVzLmxlbmd0aCA+PSBzZWxmLmludGVybmFsLmxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGNoTG9hZGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5IG1hdGNoIGxvYWRlciBidXR0b24gaWYgaGFkTmV3TWF0Y2hcclxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TWF0Y2hMb2FkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB0aGUgbWF0Y2ggb2YgZ2l2ZW4gaWQgdG8gYmUgZGlzcGxheWVkIHVuZGVyIG1hdGNoIHNpbXBsZXdpZGdldFxyXG4gICAgICovXHJcbiAgICBsb2FkTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNoZXMgPSBkYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgIC8vR2VuZXJhdGUgdXJsIGJhc2VkIG9uIGludGVybmFsIHN0YXRlXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaHVybCA9IHNlbGYuZ2VuZXJhdGVNYXRjaFVybChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLm1hdGNobG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJysgbWF0Y2hpZCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZ1bGxtYXRjaC1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy8rPSBSZWNlbnQgTWF0Y2hlcyBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC5tYXRjaHVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2ggPSBqc29uLm1hdGNoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2hlcy5nZW5lcmF0ZUZ1bGxNYXRjaFJvd3MobWF0Y2hpZCwganNvbl9tYXRjaCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5mdWxsbWF0Y2gtcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuZGF0YSA9IHtcclxuICAgIHRvcGhlcm9lczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGhlcm9MaW1pdDogNSwgLy9Ib3cgbWFueSBoZXJvZXMgc2hvdWxkIGJlIGRpc3BsYXllZCBhdCBhIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVG9wSGVyb2VzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXRvcGhlcm9lcy1jb250YWluZXJcIiBjbGFzcz1cInBsLXRvcGhlcm9lcy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lciBwYWRkaW5nLWxlZnQtMCBwYWRkaW5nLXJpZ2h0LTBcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsYXllci1sZWZ0cGFuZS1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgaGVyb2ZpZWxkID0gJzxkaXYgY2xhc3M9XCJwbC10aC1oZXJvcGFuZVwiPjxkaXY+PGltZyBjbGFzcz1cInBsLXRoLWhwLWhlcm9pbWFnZVwiIHNyYz1cIicrIGhlcm8uaW1hZ2VfaGVybyArJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGEgY2xhc3M9XCJwbC10aC1ocC1oZXJvbmFtZVwiIGhyZWY9XCInICsgUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nKyBoZXJvLm5hbWUgKyc8L2E+PC9kaXY+PC9kaXY+JztcclxuXHJcblxyXG4gICAgICAgICAgICAvL0dvb2Qga2RhXHJcbiAgICAgICAgICAgIGxldCBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0nO1xyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChoZXJvLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhID0gJzxzcGFuIGNsYXNzPVwiJysgZ29vZGtkYSArJ1wiPicgKyBoZXJvLmtkYV9hdmcgKyAnPC9zcGFuPiBLREEnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGtkYWluZGl2ID0gaGVyby5raWxsc19hdmcgKyAnIC8gPHNwYW4gY2xhc3M9XCJwbC10aC1rZGEtaW5kaXYtZGVhdGhzXCI+JyArIGhlcm8uZGVhdGhzX2F2ZyArICc8L3NwYW4+IC8gJyArIGhlcm8uYXNzaXN0c19hdmc7XHJcblxyXG4gICAgICAgICAgICBsZXQga2RhZmllbGQgPSAnPGRpdiBjbGFzcz1cInBsLXRoLWtkYXBhbmVcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vS0RBIGFjdHVhbFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbC10aC1rZGEta2RhXCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGEgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9LREEgaW5kaXZcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGwtdGgta2RhLWluZGl2XCI+JyArXHJcbiAgICAgICAgICAgICAgICBrZGFpbmRpdiArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlZmllbGQgPSBoZXJvLndpbnJhdGU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9maWVsZCwga2RhZmllbGQsIHdpbnJhdGVmaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUb3BIZXJvZXNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEudG9waGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgICAgICAge31cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gc2VsZi5pbnRlcm5hbC5oZXJvTGltaXQ7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInBsLXRvcGhlcm9lcy10YWJsZVwiIGNsYXNzPVwicGwtdG9waGVyb2VzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiZC1ub25lXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRvcEhlcm9lc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI3BsLXRvcGhlcm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWF0Y2hMb2FkZXJHZW5lcmF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBtYXRjaE1hbmlmZXN0OiB7fSAvL0tlZXBzIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGlkcyBhcmUgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZCwgdG8gcHJldmVudCBvZmZzZXQgcmVxdWVzdHMgZnJvbSByZXBlYXRpbmcgbWF0Y2hlcyBvdmVyIGxhcmdlIHBlcmlvZHMgb2YgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTG9hZGVyR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNNYXRjaEdlbmVyYXRlZDogZnVuY3Rpb24obWF0Y2hpZCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0Lmhhc093blByb3BlcnR5KG1hdGNoaWQgKyBcIlwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9HZW5lcmF0ZSBvbmUtdGltZSBwYXJ0eSBjb2xvcnMgZm9yIG1hdGNoXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ29sb3JzID0gWzEsIDIsIDMsIDQsIDVdOyAvL0FycmF5IG9mIGNvbG9ycyB0byB1c2UgZm9yIHBhcnR5IGF0IGluZGV4ID0gcGFydHlJbmRleCAtIDFcclxuICAgICAgICAgICAgSG90c3RhdHVzLnV0aWxpdHkuc2h1ZmZsZShwYXJ0aWVzQ29sb3JzKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9nIG1hdGNoIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZCArIFwiXCJdID0ge1xyXG4gICAgICAgICAgICAgICAgZnVsbEdlbmVyYXRlZDogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBoYXMgYmVlbiBsb2FkZWQgZm9yIHRoZSBmaXJzdCB0aW1lXHJcbiAgICAgICAgICAgICAgICBmdWxsRGlzcGxheTogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGZ1bGwgbWF0Y2ggZGF0YSBpcyBjdXJyZW50bHkgdG9nZ2xlZCB0byBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBtYXRjaFBsYXllcjogbWF0Y2gucGxheWVyLmlkLCAvL0lkIG9mIHRoZSBtYXRjaCdzIHBsYXllciBmb3Igd2hvbSB0aGUgbWF0Y2ggaXMgYmVpbmcgZGlzcGxheWVkLCBmb3IgdXNlIHdpdGggaGlnaGxpZ2h0aW5nIGluc2lkZSBvZiBmdWxsbWF0Y2ggKHdoaWxlIGRlY291cGxpbmcgbWFpbnBsYXllcilcclxuICAgICAgICAgICAgICAgIHBhcnRpZXNDb2xvcnM6IHBhcnRpZXNDb2xvcnMgLy9Db2xvcnMgdG8gdXNlIGZvciB0aGUgcGFydHkgaW5kZXhlc1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IG1hdGNoLnBsYXllci5tZWRhbDtcclxuXHJcbiAgICAgICAgICAgIC8vU2lsZW5jZVxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCByID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gJ3JtLXN3LWxpbmstdG94aWMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaWxlbmNlX2ltYWdlID0gZnVuY3Rpb24oaXNTaWxlbmNlZCwgc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHMgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTaWxlbmNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGltYWdlX2JwYXRoICsgJy91aS9pY29uX3RveGljLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gJzxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxzcGFuIGNsYXNzPVxcJ3JtLXN3LWxpbmstdG94aWNcXCc+U2lsZW5jZWQ8L3NwYW4+XCI+PGltZyBjbGFzcz1cInJtLXN3LXRveGljXCIgc3R5bGU9XCJ3aWR0aDonICsgc2l6ZSArICdweDtoZWlnaHQ6JyArIHNpemUgKyAncHg7XCIgc3JjPVwiJyArIHBhdGggKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKG1hdGNoLnBsYXllci5rZGFfcmF3ID49IDMpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1nb29kJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIua2RhX3JhdyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ3JlYXQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTWVkYWxcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGxldCBub21lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tc3ctc3AtbWVkYWwtY29udGFpbmVyXCI+PHNwYW4gc3R5bGU9XCJjdXJzb3I6IGhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyBtZWRhbC5uYW1lICsgJzwvZGl2PjxkaXY+JyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJzwvZGl2PlwiPjxpbWcgY2xhc3M9XCJybS1zdy1zcC1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ19ibHVlLnBuZ1wiPjwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgPSBcIjxkaXYgY2xhc3M9J3JtLXN3LXNwLW9mZnNldCc+PC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1zdy10cC10YWxlbnQtYmcnPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5wbGF5ZXIudGFsZW50cy5sZW5ndGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IG1hdGNoLnBsYXllci50YWxlbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudGFsZW50dG9vbHRpcCh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlKSArICdcIj48aW1nIGNsYXNzPVwicm0tc3ctdHAtdGFsZW50XCIgc3JjPVwiJyArIHRhbGVudC5pbWFnZSArICdcIj48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzaHRtbCArPSBcIjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1BsYXllcnNcclxuICAgICAgICAgICAgbGV0IHBsYXllcnNodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb3VudGVyID0gWzAsIDAsIDAsIDAsIDBdOyAvL0NvdW50cyBpbmRleCBvZiBwYXJ0eSBtZW1iZXIsIGZvciB1c2Ugd2l0aCBjcmVhdGluZyBjb25uZWN0b3JzLCB1cCB0byA1IHBhcnRpZXMgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2guaWQgKyBcIlwiXS5wYXJ0aWVzQ29sb3JzO1xyXG4gICAgICAgICAgICBsZXQgdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgbWF0Y2gudGVhbXMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICs9ICc8ZGl2IGNsYXNzPVwicm0tc3ctcHAtdGVhbScgKyB0ICsgJ1wiPic7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRlYW0ucGxheWVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eU9mZnNldCA9IHBsYXllci5wYXJ0eSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0eUNvbG9yID0gcGFydGllc0NvbG9yc1twYXJ0eU9mZnNldF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktc20gcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHkgKz0gJzxkaXYgY2xhc3M9XCJybS1wYXJ0eS1zbSBybS1wYXJ0eS1zbS1jb25uZWN0ZXIgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnPGEgY2xhc3M9XCInK3NpbGVuY2UocGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSBtYXRjaC5wbGF5ZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLXN3LXNwZWNpYWxcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyc2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJybS1zdy1wcC1wbGF5ZXJcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgcGxheWVyLmhlcm8gKyAnXCI+PGltZyBjbGFzcz1cInJtLXN3LXBwLXBsYXllci1pbWFnZVwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBwbGF5ZXIuaW1hZ2VfaGVybyArICdcIj48L3NwYW4+JyArIHBhcnR5ICsgc2lsZW5jZV9pbWFnZShwbGF5ZXIuc2lsZW5jZWQsIDEyKSArIHNwZWNpYWwgKyBwbGF5ZXIubmFtZSArICc8L2E+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJzaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICAgICB0Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1jb250YWluZXItJysgbWF0Y2guaWQgKydcIj48ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtbGVmdHBhbmUgJyArIHNlbGYuY29sb3JfTWF0Y2hXb25Mb3N0KG1hdGNoLnBsYXllci53b24pICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyBtYXRjaC5tYXBfaW1hZ2UgKyAnKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZ2FtZVR5cGVcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWdhbWVUeXBlLXRleHRcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWF0Y2gubWFwICsgJ1wiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLWRhdGVcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgZGF0ZSArICdcIj48c3BhbiBjbGFzcz1cInJtLXN3LWxwLWRhdGUtdGV4dFwiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLXZpY3RvcnlcIj4nICsgdmljdG9yeVRleHQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWxwLW1hdGNobGVuZ3RoXCI+JyArIG1hdGNoX3RpbWUgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1oZXJvcGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXY+PGltZyBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIHJtLXN3LWhwLXBvcnRyYWl0XCIgc3JjPVwiJyArIG1hdGNoLnBsYXllci5pbWFnZV9oZXJvICsgJ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1ocC1oZXJvbmFtZVwiPicrc2lsZW5jZV9pbWFnZShtYXRjaC5wbGF5ZXIuc2lsZW5jZWQsIDE2KSsnPGEgY2xhc3M9XCInK3NpbGVuY2UobWF0Y2gucGxheWVyLnNpbGVuY2VkKSsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwiaGVyb1wiLCB7aGVyb1Byb3Blck5hbWU6IG1hdGNoLnBsYXllci5oZXJvfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvYT48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LXN0YXRzcGFuZVwiPjxkaXYgY2xhc3M9XCJybS1zdy1zcC1pbm5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgbm9tZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1zcC1rZGEtaW5kaXZcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCJLaWxscyAvIERlYXRocyAvIEFzc2lzdHNcIj48c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi10ZXh0XCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArIG1hdGNoLnBsYXllci5raWxscyArICcgLyA8c3BhbiBjbGFzcz1cInJtLXN3LXNwLWtkYS1pbmRpdi1kZWF0aHNcIj4nICsgbWF0Y2gucGxheWVyLmRlYXRocyArICc8L3NwYW4+IC8gJyArIG1hdGNoLnBsYXllci5hc3Npc3RzICsgJzwvc3Bhbj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIihLaWxscyArIEFzc2lzdHMpIC8gRGVhdGhzXCI+PGRpdiBjbGFzcz1cInJtLXN3LXNwLWtkYS10ZXh0XCI+PHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIG1hdGNoLnBsYXllci5rZGEgKyAnPC9zcGFuPiBLREE8L2Rpdj48L3NwYW4+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBtZWRhbGh0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtdGFsZW50c3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctdHAtdGFsZW50LWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtcGxheWVyc3BhbmVcIj48ZGl2IGNsYXNzPVwicm0tc3ctcHAtaW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHBsYXllcnNodG1sICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3QtJyArIG1hdGNoLmlkICsgJ1wiIGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWluc3BlY3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNsaWNrIGxpc3RlbmVycyBmb3IgaW5zcGVjdCBwYW5lXHJcbiAgICAgICAgICAgICQoJyNyZWNlbnRtYXRjaC1zaW1wbGV3aWRnZXQtaW5zcGVjdC0nICsgbWF0Y2guaWQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoLmlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3LCBpZiBpdCdzIGFscmVhZHkgbG9hZGVkLCB0b2dnbGUgaXRzIGRpc3BsYXlcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG4gICAgICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RvZ2dsZSBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2htYW4gPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2htYW4uZnVsbERpc3BsYXkgPSAhbWF0Y2htYW4uZnVsbERpc3BsYXk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCcjcmVjZW50bWF0Y2gtZnVsbG1hdGNoLScrIG1hdGNoaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaG1hbi5mdWxsRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLnNsaWRlRG93bigyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3Iuc2xpZGVVcCgyNTApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLm1hdGNobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXguaW50ZXJuYWwubWF0Y2hsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBmdWxsIG1hdGNoIHBhbmVcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaGlkKS5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtJyArIG1hdGNoaWQgKyAnXCIgY2xhc3M9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2hcIj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2FkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmxvYWRNYXRjaChtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2cgYXMgZ2VuZXJhdGVkIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoaWQgKyBcIlwiXS5mdWxsR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hSb3dzOiBmdW5jdGlvbihtYXRjaGlkLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBmdWxsbWF0Y2hfY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRlYW1zXHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWVzQ291bnRlciA9IFswLCAwLCAwLCAwLCAwXTsgLy9Db3VudHMgaW5kZXggb2YgcGFydHkgbWVtYmVyLCBmb3IgdXNlIHdpdGggY3JlYXRpbmcgY29ubmVjdG9ycywgdXAgdG8gNSBwYXJ0aWVzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCB0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBtYXRjaC50ZWFtcykge1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZnVsbG1hdGNoX2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgaWQ9XCJyZWNlbnRtYXRjaC1mdWxsbWF0Y2gtdGVhbS1jb250YWluZXItJysgbWF0Y2hpZCArJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlYW1fY29udGFpbmVyID0gJCgnI3JlY2VudG1hdGNoLWZ1bGxtYXRjaC10ZWFtLWNvbnRhaW5lci0nKyBtYXRjaGlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RlYW0gUm93IEhlYWRlclxyXG4gICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcih0ZWFtX2NvbnRhaW5lciwgdGVhbSwgbWF0Y2gud2lubmVyID09PSB0LCBtYXRjaC5oYXNCYW5zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBwbGF5ZXJzIGZvciB0ZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGVhbS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9QbGF5ZXIgUm93XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxtYXRjaFJvdyhtYXRjaGlkLCB0ZWFtX2NvbnRhaW5lciwgcGxheWVyLCB0ZWFtLmNvbG9yLCBtYXRjaC5zdGF0cywgcCAlIDIsIHBhcnRpZXNDb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5wYXJ0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnR5T2Zmc2V0ID0gcGxheWVyLnBhcnR5IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGllc0NvdW50ZXJbcGFydHlPZmZzZXRdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFJvd0hlYWRlcjogZnVuY3Rpb24oY29udGFpbmVyLCB0ZWFtLCB3aW5uZXIsIGhhc0JhbnMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9WaWN0b3J5XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5ID0gKHdpbm5lcikgPyAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeVwiPlZpY3Rvcnk8L3NwYW4+JykgOiAoJzxzcGFuIGNsYXNzPVwicm0tZm0tcmgtZGVmZWF0XCI+RGVmZWF0PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgLy9CYW5zXHJcbiAgICAgICAgICAgIGxldCBiYW5zID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoYXNCYW5zKSB7XHJcbiAgICAgICAgICAgICAgICBiYW5zICs9ICdCYW5zOiAnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmFuIG9mIHRlYW0uYmFucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhbnMgKz0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBiYW4ubmFtZSArICdcIj48aW1nIGNsYXNzPVwicm0tZm0tcmgtYmFuXCIgc3JjPVwiJysgYmFuLmltYWdlICsnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3doZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIC8vVmljdG9yeSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtdmljdG9yeS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHZpY3RvcnkgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9UZWFtIExldmVsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1sZXZlbC1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubGV2ZWwgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9CYW5zIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1iYW5zLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgYmFucyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgta2RhLWNvbnRhaW5lclwiPktEQTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0aXN0aWNzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yaC1zdGF0aXN0aWNzLWNvbnRhaW5lclwiPlBlcmZvcm1hbmNlPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAvL01tciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tcmgtbW1yLWNvbnRhaW5lclwiPk1NUjogPHNwYW4gY2xhc3M9XCJybS1mbS1yaC1tbXJcIj4nICtcclxuICAgICAgICAgICAgICAgIHRlYW0ubW1yLm9sZC5yYXRpbmcgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRnVsbG1hdGNoUm93OiBmdW5jdGlvbihtYXRjaGlkLCBjb250YWluZXIsIHBsYXllciwgdGVhbUNvbG9yLCBtYXRjaFN0YXRzLCBvZGRFdmVuLCBwYXJ0aWVzQ291bnRlcikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgbWF0Y2hQbGF5ZXJJZCA9IHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaGlkICsgXCJcIl0ubWF0Y2hQbGF5ZXI7XHJcblxyXG4gICAgICAgICAgICAvL1NpbGVuY2VcclxuICAgICAgICAgICAgbGV0IHNpbGVuY2UgPSBmdW5jdGlvbihpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbGVuY2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9ICdybS1zdy1saW5rLXRveGljJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSAncm0tc3ctbGluayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2lsZW5jZV9pbWFnZSA9IGZ1bmN0aW9uKGlzU2lsZW5jZWQsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lsZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBpbWFnZV9icGF0aCArICcvdWkvaWNvbl90b3hpYy5wbmcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICc8c3BhbiBzdHlsZT1cImN1cnNvcjogaGVscDtcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8c3BhbiBjbGFzcz1cXCdybS1zdy1saW5rLXRveGljXFwnPlNpbGVuY2VkPC9zcGFuPlwiPjxpbWcgY2xhc3M9XCJybS1zdy10b3hpY1wiIHN0eWxlPVwid2lkdGg6JyArIHNpemUgKyAncHg7aGVpZ2h0OicgKyBzaXplICsgJ3B4O1wiIHNyYz1cIicgKyBwYXRoICsgJ1wiPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vUGxheWVyIG5hbWVcclxuICAgICAgICAgICAgbGV0IHBsYXllcm5hbWUgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNwZWNpYWwgPSAnJztcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gbWF0Y2hQbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lhbCA9ICc8YSBjbGFzcz1cInJtLWZtLXItcGxheWVybmFtZSBybS1zdy1zcGVjaWFsXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwZWNpYWwgPSAnPGEgY2xhc3M9XCJybS1mbS1yLXBsYXllcm5hbWUgJysgc2lsZW5jZShwbGF5ZXIuc2lsZW5jZWQpICsnXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcGxheWVyLmlkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICs9IHNpbGVuY2VfaW1hZ2UocGxheWVyLnNpbGVuY2VkLCAxNCkgKyBzcGVjaWFsICsgcGxheWVyLm5hbWUgKyAnPC9hPic7XHJcblxyXG4gICAgICAgICAgICAvL01lZGFsXHJcbiAgICAgICAgICAgIGxldCBtZWRhbCA9IHBsYXllci5tZWRhbDtcclxuICAgICAgICAgICAgbGV0IG1lZGFsaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbC5leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIG1lZGFsaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm0tZm0tci1tZWRhbC1pbm5lclwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIjxkaXYgY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgbWVkYWwubmFtZSArICc8L2Rpdj48ZGl2PicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICc8L2Rpdj5cIj48aW1nIGNsYXNzPVwicm0tZm0tci1tZWRhbFwiIHNyYz1cIidcclxuICAgICAgICAgICAgICAgICAgICArIG1lZGFsLmltYWdlICsgJ18nKyB0ZWFtQ29sb3IgKycucG5nXCI+PC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vVGFsZW50c1xyXG4gICAgICAgICAgICBsZXQgdGFsZW50c2h0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8ZGl2IGNsYXNzPSdybS1mbS1yLXRhbGVudC1iZyc+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci50YWxlbnRzLmxlbmd0aCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gcGxheWVyLnRhbGVudHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudHNodG1sICs9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50YWxlbnR0b29sdGlwKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUpICsgJ1wiPjxpbWcgY2xhc3M9XCJybS1mbS1yLXRhbGVudFwiIHNyYz1cIicgKyB0YWxlbnQuaW1hZ2UgKyAnXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFsZW50c2h0bWwgKz0gXCI8L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TdGF0c1xyXG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBwbGF5ZXIuc3RhdHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gMykge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdvb2QnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN0YXRzLmtkYV9yYXcgPj0gNikge1xyXG4gICAgICAgICAgICAgICAgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtLWdyZWF0J1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcm93c3RhdF90b29sdGlwID0gZnVuY3Rpb24gKHZhbCwgZGVzYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArJzxicj4nKyBkZXNjO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHJvd3N0YXRzID0gW1xyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZXJvX2RhbWFnZVwiLCBjbGFzczogXCJoZXJvZGFtYWdlXCIsIHdpZHRoOiAwLCB2YWx1ZTogXCJcIiwgdmFsdWVEaXNwbGF5OiBcIlwiLCBodG1sOiAnJywgdG9vbHRpcDogJ0hlcm8gRGFtYWdlJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcInNpZWdlX2RhbWFnZVwiLCBjbGFzczogXCJzaWVnZWRhbWFnZVwiLCB3aWR0aDogMCwgdmFsdWU6IFwiXCIsIHZhbHVlRGlzcGxheTogXCJcIiwgaHRtbDogJycsIHRvb2x0aXA6ICdTaWVnZSBEYW1hZ2UnfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6IFwibWVyY19jYW1wc1wiLCBjbGFzczogXCJtZXJjY2FtcHNcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnTWVyYyBDYW1wcyBUYWtlbid9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJoZWFsaW5nXCIsIGNsYXNzOiBcImhlYWxpbmdcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnSGVhbGluZyd9LFxyXG4gICAgICAgICAgICAgICAge2tleTogXCJkYW1hZ2VfdGFrZW5cIiwgY2xhc3M6IFwiZGFtYWdldGFrZW5cIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRGFtYWdlIFRha2VuJ30sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiBcImV4cF9jb250cmliXCIsIGNsYXNzOiBcImV4cGNvbnRyaWJcIiwgd2lkdGg6IDAsIHZhbHVlOiBcIlwiLCB2YWx1ZURpc3BsYXk6IFwiXCIsIGh0bWw6ICcnLCB0b29sdGlwOiAnRXhwZXJpZW5jZSBDb250cmlidXRpb24nfVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChzdGF0IG9mIHJvd3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gbWF0Y2hTdGF0c1tzdGF0LmtleV1bXCJtYXhcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBlcmNlbnRPblJhbmdlID0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChtYXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudE9uUmFuZ2UgPSAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gLyAobWF4ICogMS4wMCkpICogMTAwLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhdC53aWR0aCA9IHBlcmNlbnRPblJhbmdlO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudmFsdWUgPSBzdGF0c1tzdGF0LmtleV07XHJcbiAgICAgICAgICAgICAgICBzdGF0LnZhbHVlRGlzcGxheSA9IHN0YXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHNbc3RhdC5rZXkgKyBcIl9yYXdcIl0gPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXQudmFsdWVEaXNwbGF5ID0gJzxzcGFuIGNsYXNzPVwicm0tZm0tci1zdGF0cy1udW1iZXItbm9uZVwiPicgKyBzdGF0LnZhbHVlICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQudG9vbHRpcCA9IHJvd3N0YXRfdG9vbHRpcChzdGF0LnZhbHVlLCBzdGF0LnRvb2x0aXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXQuaHRtbCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc3RhdC50b29sdGlwICsgJ1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLXJvd1wiPjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLScrIHN0YXQuY2xhc3MgKycgcm0tZm0tci1zdGF0cy1iYXJcIiBzdHlsZT1cIndpZHRoOiAnKyBzdGF0LndpZHRoICsnJVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW51bWJlclwiPicrIHN0YXQudmFsdWVEaXNwbGF5ICsnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vTU1SXHJcbiAgICAgICAgICAgIGxldCBtbXJEZWx0YVR5cGUgPSBcIm5lZ1wiO1xyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGFQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLm1tci5kZWx0YSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBtbXJEZWx0YVR5cGUgPSBcInBvc1wiO1xyXG4gICAgICAgICAgICAgICAgbW1yRGVsdGFQcmVmaXggPSBcIitcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbW1yRGVsdGEgPSBwbGF5ZXIubW1yLnJhbmsgKycgJysgcGxheWVyLm1tci50aWVyICsnICg8c3BhbiBjbGFzcz1cXCdybS1mbS1yLW1tci1kZWx0YS0nKyBtbXJEZWx0YVR5cGUgKydcXCc+JysgbW1yRGVsdGFQcmVmaXggKyBwbGF5ZXIubW1yLmRlbHRhICsnPC9zcGFuPiknO1xyXG5cclxuICAgICAgICAgICAgLy9QYXJ0eVxyXG4gICAgICAgICAgICBsZXQgcGFydHkgPSAnJztcclxuICAgICAgICAgICAgbGV0IHBhcnRpZXNDb2xvcnMgPSBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3RbbWF0Y2hpZCArIFwiXCJdLnBhcnRpZXNDb2xvcnM7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucGFydHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFydHlPZmZzZXQgPSBwbGF5ZXIucGFydHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnR5Q29sb3IgPSBwYXJ0aWVzQ29sb3JzW3BhcnR5T2Zmc2V0XTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJ0eSA9ICc8ZGl2IGNsYXNzPVwicm0tcGFydHkgcm0tcGFydHktbWQgcm0tcGFydHktJysgcGFydHlDb2xvciArJ1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRpZXNDb3VudGVyW3BhcnR5T2Zmc2V0XSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0eSArPSAnPGRpdiBjbGFzcz1cInJtLXBhcnR5LW1kIHJtLXBhcnR5LW1kLWNvbm5lY3RlciBybS1wYXJ0eS0nKyBwYXJ0eUNvbG9yICsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9CdWlsZCBodG1sXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJybS1mbS1yb3cgcm0tZm0tcm93LScrIG9kZEV2ZW4gKydcIj4nICtcclxuICAgICAgICAgICAgLy9QYXJ0eSBTdHJpcGVcclxuICAgICAgICAgICAgcGFydHkgK1xyXG4gICAgICAgICAgICAvL0hlcm8gSW1hZ2UgQ29udGFpbmVyIChXaXRoIEhlcm8gTGV2ZWwpXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvaW1hZ2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBwbGF5ZXIuaGVybyArICdcIj48ZGl2IGNsYXNzPVwicm0tZm0tci1oZXJvbGV2ZWxcIj4nKyBwbGF5ZXIuaGVyb19sZXZlbCArJzwvZGl2PjxpbWcgY2xhc3M9XCJybS1mbS1yLWhlcm9pbWFnZVwiIHNyYz1cIicrIHBsYXllci5pbWFnZV9oZXJvICsnXCI+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vUGxheWVyIE5hbWUgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tZm0tci1wbGF5ZXJuYW1lLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICBwbGF5ZXJuYW1lICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01lZGFsIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItbWVkYWwtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIG1lZGFsaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9UYWxlbnRzIENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItdGFsZW50cy1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm0tZm0tci10YWxlbnQtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHRhbGVudHNodG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL0tEQSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYS1pbmRpdlwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiS2lsbHMgLyBEZWF0aHMgLyBBc3Npc3RzXCI+J1xyXG4gICAgICAgICAgICArIHN0YXRzLmtpbGxzICsgJyAvIDxzcGFuIGNsYXNzPVwicm0tc3ctc3Ata2RhLWluZGl2LWRlYXRoc1wiPicgKyBzdGF0cy5kZWF0aHMgKyAnPC9zcGFuPiAvICcgKyBzdGF0cy5hc3Npc3RzICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLWtkYVwiPjxzcGFuIHN0eWxlPVwiY3Vyc29yOmhlbHA7XCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiKEtpbGxzICsgQXNzaXN0cykgLyBEZWF0aHNcIj48ZGl2IGNsYXNzPVwicm0tc3ctc3Ata2RhLXRleHRcIj48c3BhbiBjbGFzcz1cIicrIGdvb2RrZGEgKydcIj4nICsgc3RhdHMua2RhICsgJzwvc3Bhbj4gS0RBPC9kaXY+PC9zcGFuPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgIC8vU3RhdHMgT2ZmZW5zZSBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLXN0YXRzLW9mZmVuc2UtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzBdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1sxXS5odG1sICtcclxuICAgICAgICAgICAgcm93c3RhdHNbMl0uaHRtbCArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgLy9TdGF0cyBVdGlsaXR5IENvbnRhaW5lclxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLWZtLXItc3RhdHMtdXRpbGl0eS1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgcm93c3RhdHNbM10uaHRtbCArXHJcbiAgICAgICAgICAgIHJvd3N0YXRzWzRdLmh0bWwgK1xyXG4gICAgICAgICAgICByb3dzdGF0c1s1XS5odG1sICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAvL01NUiBDb250YWluZXJcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci1jb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1mbS1yLW1tci10b29sdGlwLWFyZWFcIiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicrIG1tckRlbHRhICsnXCI+PGltZyBjbGFzcz1cInJtLWZtLXItbW1yXCIgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyAndWkvcmFua2VkX3BsYXllcl9pY29uXycgKyBwbGF5ZXIubW1yLnJhbmsgKycucG5nXCI+PGRpdiBjbGFzcz1cInJtLWZtLXItbW1yLW51bWJlclwiPicrIHBsYXllci5tbXIudGllciArJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoLW1hdGNobG9hZGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZV9tYXRjaExvYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuICAgICAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVfbWF0Y2hMb2FkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZXJodG1sID0gJzxkaXYgaWQ9XCJwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlclwiPkxvYWQgTW9yZSBNYXRjaGVzLi4uPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmFwcGVuZChsb2FkZXJodG1sKTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1tYXRjaGxvYWRlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhamF4LmludGVybmFsLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhamF4LmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtMXggZmEtZndcIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hMb2FkZXJHZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sb3JfTWF0Y2hXb25Mb3N0OiBmdW5jdGlvbih3b24pIHtcclxuICAgICAgICAgICAgaWYgKHdvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy13b24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdwbC1yZWNlbnRtYXRjaC1iZy1sb3N0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFsZW50dG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcicsIHtwbGF5ZXI6IHBsYXllcl9pZH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgLy9maWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9