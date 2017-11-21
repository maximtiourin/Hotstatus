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
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
        offset: 0, //Matches offset
        limit: 5 //Matches limit
    },
    reset: function reset() {
        var self = PlayerLoader.ajax.matches;

        self.internal.loading = false;
        self.internal.url = '';
        self.internal.offset = 0;
        self.internal.limit = 5;
        PlayerLoader.data.matches.empty();
    },
    generateUrl: function generateUrl() {
        var self = PlayerLoader.ajax.matches;

        return Routing.generate("playerdata_pagedata_player_recentmatches", {
            player: player_id,
            offset: self.internal.offset,
            limit: self.internal.limit,
            season: PlayerLoader.ajax.filter.getSeason()
        });
    },
    /*
     * Loads {limit} recent matches offset by {offset} from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var ajax = PlayerLoader.ajax;
        var self = PlayerLoader.ajax.matches;

        var data = PlayerLoader.data;
        var data_matches = data.matches;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
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
            //Set new limit and offset
            self.internal.limit = json_limits.matches;
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

                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
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

            $('[data-toggle="tooltip"]').tooltip();
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            self.internal.loading = false;
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
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        generateMatch: function generateMatch(match) {
            //Generates all subcomponents of a match display
            var self = PlayerLoader.data.matches;

            //Match component container
            var html = '<div id="pl-recentmatch-container-' + match.id + '" class="pl-recentmatch-container"></div>';

            $('#pl-recentmatches-container').append(html);

            //Subcomponents
            self.generateMatchWidget(match);
            self.generateFullMatchPane(match);

            //Log match in manifest
            self.internal.matchManifest[match.id] = true;
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

            var html = '<div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget ' + self.color_MatchWonLost(match.player.won) + '">' + '<div class="recentmatch-simplewidget-leftpane">' + '<div class="rm-sw-lp-gameType">' + match.gameType + '</div>' + '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '">' + relative_date + '</span></div>' + '<div class="rm-sw-lp-victory">' + victoryText + '</div>' + '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' + '</div>' + '<div class="recentmatch-simplewidget-heropane">' + '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + match.player.image_hero + '"></div>' + '<div class="rm-sw-hp-heroname">' + match.player.hero + '</div>' + '</div>' + '</div>';

            $('#pl-recentmatch-container-' + match.id).append(html);
        },
        generateFullMatchPane: function generateFullMatchPane(match) {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view

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
        empty: function empty() {
            $('#pl-recentmatches-container').empty();
            PlayerLoader.data.matches.internal.matchManifest = {};
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_pagedata_player', { player: player_id });

    var filterTypes = ["season"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjE2YmY1Yzc3ODU2ZTk4MmYxNzkiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwiZ2V0U2Vhc29uIiwidmFsIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJzZWFzb24iLCJTdHJpbmciLCJsZW5ndGgiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJ2YWxpZEZpbHRlcnMiLCJnZW5lcmF0ZVVybCIsImxvYWQiLCJkYXRhIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImVtcHR5IiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwiZGF0YV9tYXRjaGVzIiwianNvbl9vZmZzZXRzIiwib2Zmc2V0cyIsImpzb25fbGltaXRzIiwianNvbl9tYXRjaGVzIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiZ2VuZXJhdGVNYXRjaCIsIm1hdGNoTWFuaWZlc3QiLCJodG1sIiwiaWQiLCJhcHBlbmQiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwidGltZXN0YW1wIiwiZGF0ZSIsInJlbGF0aXZlX2RhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJtYXRjaF90aW1lIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsIm1hdGNoX2xlbmd0aCIsInZpY3RvcnlUZXh0Iiwid29uIiwiY29sb3JfTWF0Y2hXb25Mb3N0IiwiZ2FtZVR5cGUiLCJpbWFnZV9oZXJvIiwiaGVybyIsIm1hdGNoaWQiLCJoYXNPd25Qcm9wZXJ0eSIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGVBQWUsRUFBbkI7O0FBRUE7OztBQUdBQSxhQUFhQyxJQUFiLEdBQW9CLEVBQXBCOztBQUVBOzs7QUFHQUQsYUFBYUMsSUFBYixDQUFrQkMsTUFBbEIsR0FBMkI7QUFDdkJDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCQyxhQUFLLEVBRkMsRUFFRztBQUNUQyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURhO0FBTXZCOzs7O0FBSUFELFNBQUssZUFBcUI7QUFBQSxZQUFaQSxJQUFZLHVFQUFOLElBQU07O0FBQ3RCLFlBQUlFLE9BQU9QLGFBQWFDLElBQWIsQ0FBa0JDLE1BQTdCOztBQUVBLFlBQUlHLFNBQVEsSUFB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QUtDLFlBQUwsQ0FBa0JDLFFBQWxCLEdBQTZCLE1BQTdCLENBRHlCLENBQ1k7O0FBRXJDO0FBQ0EsUUFBSWxFLFVBQVUyQixRQUFRQyxRQUFSLENBQWlCLDRCQUFqQixFQUErQyxFQUFDQyxRQUFRQyxTQUFULEVBQS9DLENBQWQ7O0FBRUEsUUFBSTdCLGNBQWMsQ0FBQyxRQUFELENBQWxCO0FBQ0EsUUFBSWtFLGFBQWFuRixhQUFhQyxJQUFiLENBQWtCQyxNQUFuQzs7QUFFQWlGLGVBQVdwRSxZQUFYLENBQXdCQyxPQUF4QjtBQUNBTixvQkFBZ0IwRSxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0NuRSxXQUF4QztBQUNBa0UsZUFBV3BFLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBSyxNQUFFLHdCQUFGLEVBQTRCK0QsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRDVFLHdCQUFnQjBFLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q25FLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBSyxNQUFFLEdBQUYsRUFBTytELEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENKLG1CQUFXcEUsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdEJELEUiLCJmaWxlIjoicGxheWVyLWxvYWRlci41MmQ0NWQ2NjllNjJmYWY5N2Y0My5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGYxNmJmNWM3Nzg1NmU5ODJmMTc5IiwiLypcclxuICogUGxheWVyIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBQbGF5ZXJMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXggPSB7fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4LmZpbHRlciA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUGxheWVyTG9hZGVyLmFqYXg7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnMsIHJlc2V0IGFsbCBzdWJhamF4IG9iamVjdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgYWpheC5tYXRjaGVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBJbml0aWFsIG1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFqYXhNYXRjaGVzID0gYWpheC5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLmxpbWl0ID0ganNvbi5saW1pdHMubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvYWQgaW5pdGlhbCBtYXRjaCBzZXRcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmxvYWQoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgICAgICBvZmZzZXQ6IDAsIC8vTWF0Y2hlcyBvZmZzZXRcclxuICAgICAgICBsaW1pdDogNSwgLy9NYXRjaGVzIGxpbWl0XHJcbiAgICB9LFxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSAnJztcclxuICAgICAgICBzZWxmLmludGVybmFsLm9mZnNldD0gIDA7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5saW1pdCA9ICA1O1xyXG4gICAgICAgIFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuZW1wdHkoKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXQsXHJcbiAgICAgICAgICAgIHNlYXNvbjogUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyLmdldFNlYXNvbigpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaGVzID0gZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAvL0dlbmVyYXRlIHVybCBiYXNlZCBvbiBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gc2VsZi5nZW5lcmF0ZVVybCgpO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vKz0gUmVjZW50IE1hdGNoZXMgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9vZmZzZXRzID0ganNvbi5vZmZzZXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbGltaXRzID0ganNvbi5saW1pdHM7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaGVzID0ganNvbi5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBQcm9jZXNzIE1hdGNoZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9TZXQgbmV3IGxpbWl0IGFuZCBvZmZzZXRcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubGltaXQgPSBqc29uX2xpbWl0cy5tYXRjaGVzO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQgPSBqc29uX29mZnNldHMubWF0Y2hlcyArIHNlbGYuaW50ZXJuYWwubGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9BcHBlbmQgbmV3IE1hdGNoIHdpZGdldHMgZm9yIG1hdGNoZXMgdGhhdCBhcmVuJ3QgaW4gdGhlIG1hbmlmZXN0XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBqc29uX21hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFfbWF0Y2hlcy5pc01hdGNoR2VuZXJhdGVkKG1hdGNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNoZXMuZ2VuZXJhdGVNYXRjaChtYXRjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuZGF0YSA9IHtcclxuICAgIG1hdGNoZXM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBtYXRjaE1hbmlmZXN0OiB7fSAvL0tlZXBzIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGlkcyBhcmUgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZCwgdG8gcHJldmVudCBvZmZzZXQgcmVxdWVzdHMgZnJvbSByZXBlYXRpbmcgbWF0Y2hlcyBvdmVyIGxhcmdlIHBlcmlvZHMgb2YgdGltZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgYWxsIHN1YmNvbXBvbmVudHMgb2YgYSBtYXRjaCBkaXNwbGF5XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggY29tcG9uZW50IGNvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lclwiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICAvL1N1YmNvbXBvbmVudHNcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZU1hdGNoV2lkZ2V0KG1hdGNoKTtcclxuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUZ1bGxNYXRjaFBhbmUobWF0Y2gpO1xyXG5cclxuICAgICAgICAgICAgLy9Mb2cgbWF0Y2ggaW4gbWFuaWZlc3RcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5tYXRjaE1hbmlmZXN0W21hdGNoLmlkXSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoV2lkZ2V0OiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgc21hbGwgbWF0Y2ggYmFyIHdpdGggc2ltcGxlIGluZm9cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgLy9NYXRjaCBXaWRnZXQgQ29udGFpbmVyXHJcbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBtYXRjaC5kYXRlO1xyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVfZGF0ZSA9IEhvdHN0YXR1cy5kYXRlLmdldFJlbGF0aXZlVGltZSh0aW1lc3RhbXApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoX3RpbWUgPSBIb3RzdGF0dXMuZGF0ZS5nZXRNaW51dGVTZWNvbmRUaW1lKG1hdGNoLm1hdGNoX2xlbmd0aCk7XHJcbiAgICAgICAgICAgIGxldCB2aWN0b3J5VGV4dCA9IChtYXRjaC5wbGF5ZXIud29uKSA/ICgnPHNwYW4gY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC13b25cIj5WaWN0b3J5PC9zcGFuPicpIDogKCc8c3BhbiBjbGFzcz1cInBsLXJlY2VudG1hdGNoLWxvc3RcIj5EZWZlYXQ8L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldCAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldC1sZWZ0cGFuZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJybS1zdy1scC1nYW1lVHlwZVwiPicgKyBtYXRjaC5nYW1lVHlwZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtZGF0ZVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBkYXRlICsgJ1wiPicgKyByZWxhdGl2ZV9kYXRlICsgJzwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtdmljdG9yeVwiPicgKyB2aWN0b3J5VGV4dCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm0tc3ctbHAtbWF0Y2hsZW5ndGhcIj4nICsgbWF0Y2hfdGltZSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LWhlcm9wYW5lXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48aW1nIGNsYXNzPVwicm91bmRlZC1jaXJjbGUgcm0tc3ctaHAtcG9ydHJhaXRcIiBzcmM9XCInICsgbWF0Y2gucGxheWVyLmltYWdlX2hlcm8gKyAnXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJtLXN3LWhwLWhlcm9uYW1lXCI+JyArIG1hdGNoLnBsYXllci5oZXJvICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2gtY29udGFpbmVyLScgKyBtYXRjaC5pZCkuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lOiBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgZnVsbCBtYXRjaCBwYW5lIHRoYXQgbG9hZHMgd2hlbiBhIG1hdGNoIHdpZGdldCBpcyBjbGlja2VkIGZvciBhIGRldGFpbGVkIHZpZXdcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xvcl9NYXRjaFdvbkxvc3Q6IGZ1bmN0aW9uKHdvbikge1xyXG4gICAgICAgICAgICBpZiAod29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLXdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BsLXJlY2VudG1hdGNoLWJnLWxvc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc01hdGNoR2VuZXJhdGVkOiBmdW5jdGlvbihtYXRjaGlkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLm1hdGNoTWFuaWZlc3QuaGFzT3duUHJvcGVydHkobWF0Y2hpZCArIFwiXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmludGVybmFsLm1hdGNoTWFuaWZlc3QgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyJywge3BsYXllcjogcGxheWVyX2lkfSk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==