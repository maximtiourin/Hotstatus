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
            var html = '<div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget ' + self.color_MatchWonLost(match.player.won) + '"></div>';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWY5MWJhNTgwZGVkOWM2NTA2M2QiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwiZ2V0U2Vhc29uIiwidmFsIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJzZWFzb24iLCJTdHJpbmciLCJsZW5ndGgiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJ2YWxpZEZpbHRlcnMiLCJnZW5lcmF0ZVVybCIsImxvYWQiLCJkYXRhIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJtYXRjaGVzIiwicmVzZXQiLCJyZW1vdmVDbGFzcyIsImFqYXhNYXRjaGVzIiwib2Zmc2V0IiwibGltaXQiLCJsaW1pdHMiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImVtcHR5IiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwiZGF0YV9tYXRjaGVzIiwianNvbl9vZmZzZXRzIiwib2Zmc2V0cyIsImpzb25fbGltaXRzIiwianNvbl9tYXRjaGVzIiwibWF0Y2giLCJpc01hdGNoR2VuZXJhdGVkIiwiZ2VuZXJhdGVNYXRjaCIsIm1hdGNoTWFuaWZlc3QiLCJodG1sIiwiaWQiLCJhcHBlbmQiLCJnZW5lcmF0ZU1hdGNoV2lkZ2V0IiwiZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lIiwiY29sb3JfTWF0Y2hXb25Mb3N0Iiwid29uIiwibWF0Y2hpZCIsImhhc093blByb3BlcnR5IiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsZUFBZSxFQUFuQjs7QUFFQTs7O0FBR0FBLGFBQWFDLElBQWIsR0FBb0IsRUFBcEI7O0FBRUE7OztBQUdBRCxhQUFhQyxJQUFiLENBQWtCQyxNQUFsQixHQUEyQjtBQUN2QkMsY0FBVTtBQUNOQyxpQkFBUyxLQURILEVBQ1U7QUFDaEJDLGFBQUssRUFGQyxFQUVHO0FBQ1RDLGlCQUFTLE1BSEgsQ0FHVztBQUhYLEtBRGE7QUFNdkI7Ozs7QUFJQUQsU0FBSyxlQUFxQjtBQUFBLFlBQVpBLElBQVksdUVBQU4sSUFBTTs7QUFDdEIsWUFBSUUsT0FBT1AsYUFBYUMsSUFBYixDQUFrQkMsTUFBN0I7O0FBRUEsWUFBSUcsU0FBUSxJQUFaLEVBQWtCO0FBQ2QsbUJBQU9FLEtBQUtKLFFBQUwsQ0FBY0UsR0FBckI7QUFDSCxTQUZELE1BR0s7QUFDREUsaUJBQUtKLFFBQUwsQ0FBY0UsR0FBZCxHQUFvQkEsSUFBcEI7QUFDQSxtQkFBT0UsSUFBUDtBQUNIO0FBQ0osS0FwQnNCO0FBcUJ2Qjs7O0FBR0FDLGVBQVcscUJBQVc7QUFDbEIsWUFBSUMsTUFBTUMsZ0JBQWdCQyxpQkFBaEIsQ0FBa0MsUUFBbEMsQ0FBVjs7QUFFQSxZQUFJQyxTQUFTLFNBQWI7O0FBRUEsWUFBSSxPQUFPSCxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUksTUFBOUMsRUFBc0Q7QUFDbERELHFCQUFTSCxHQUFUO0FBQ0gsU0FGRCxNQUdLLElBQUlBLFFBQVEsSUFBUixJQUFnQkEsSUFBSUssTUFBSixHQUFhLENBQWpDLEVBQW9DO0FBQ3JDRixxQkFBU0gsSUFBSSxDQUFKLENBQVQ7QUFDSDs7QUFFRCxlQUFPRyxNQUFQO0FBQ0gsS0FyQ3NCO0FBc0N2Qjs7O0FBR0FHLGtCQUFjLHNCQUFTQyxPQUFULEVBQWtCQyxXQUFsQixFQUErQjtBQUN6QyxZQUFJVixPQUFPUCxhQUFhQyxJQUFiLENBQWtCQyxNQUE3Qjs7QUFFQSxZQUFJLENBQUNLLEtBQUtKLFFBQUwsQ0FBY0MsT0FBZixJQUEwQk0sZ0JBQWdCUSxZQUE5QyxFQUE0RDtBQUN4RCxnQkFBSWIsTUFBTUssZ0JBQWdCUyxXQUFoQixDQUE0QkgsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsZ0JBQUlaLFFBQVFFLEtBQUtGLEdBQUwsRUFBWixFQUF3QjtBQUNwQkUscUJBQUtGLEdBQUwsQ0FBU0EsR0FBVCxFQUFjZSxJQUFkO0FBQ0g7QUFDSjtBQUNKLEtBbkRzQjtBQW9EdkI7Ozs7QUFJQUEsVUFBTSxnQkFBVztBQUNiLFlBQUluQixPQUFPRCxhQUFhQyxJQUF4QjtBQUNBLFlBQUlNLE9BQU9QLGFBQWFDLElBQWIsQ0FBa0JDLE1BQTdCOztBQUVBLFlBQUltQixPQUFPckIsYUFBYXFCLElBQXhCOztBQUVBO0FBQ0FkLGFBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQWtCLFVBQUUseUJBQUYsRUFBNkJDLE9BQTdCLENBQXFDLG1JQUFyQzs7QUFFQTtBQUNBRCxVQUFFRSxPQUFGLENBQVVqQixLQUFLSixRQUFMLENBQWNFLEdBQXhCLEVBQ0tvQixJQURMLENBQ1UsVUFBU0MsWUFBVCxFQUF1QjtBQUN6QixnQkFBSUMsT0FBT0QsYUFBYW5CLEtBQUtKLFFBQUwsQ0FBY0csT0FBM0IsQ0FBWDs7QUFFQTs7O0FBR0FMLGlCQUFLMkIsT0FBTCxDQUFhQyxLQUFiOztBQUVBOzs7QUFHQVAsY0FBRSx5QkFBRixFQUE2QlEsV0FBN0IsQ0FBeUMsY0FBekM7O0FBRUE7OztBQUdBLGdCQUFJQyxjQUFjOUIsS0FBSzJCLE9BQXZCO0FBQ0FHLHdCQUFZNUIsUUFBWixDQUFxQjZCLE1BQXJCLEdBQThCLENBQTlCO0FBQ0FELHdCQUFZNUIsUUFBWixDQUFxQjhCLEtBQXJCLEdBQTZCTixLQUFLTyxNQUFMLENBQVlOLE9BQXpDOztBQUVBO0FBQ0FHLHdCQUFZWCxJQUFaOztBQUdBO0FBQ0FFLGNBQUUseUJBQUYsRUFBNkJhLE9BQTdCOztBQUVBOzs7QUFHQUMsc0JBQVVDLFdBQVYsQ0FBc0JDLG1CQUF0QjtBQUNILFNBaENMLEVBaUNLQyxJQWpDTCxDQWlDVSxZQUFXO0FBQ2I7QUFDSCxTQW5DTCxFQW9DS0MsTUFwQ0wsQ0FvQ1ksWUFBVztBQUNmO0FBQ0FsQixjQUFFLHdCQUFGLEVBQTRCbUIsTUFBNUI7O0FBRUFsQyxpQkFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLEtBQXhCO0FBQ0gsU0F6Q0w7O0FBMkNBLGVBQU9HLElBQVA7QUFDSDtBQWhIc0IsQ0FBM0I7O0FBbUhBUCxhQUFhQyxJQUFiLENBQWtCMkIsT0FBbEIsR0FBNEI7QUFDeEJ6QixjQUFVO0FBQ05DLGlCQUFTLEtBREgsRUFDVTtBQUNoQkMsYUFBSyxFQUZDLEVBRUc7QUFDVEMsaUJBQVMsTUFISCxFQUdXO0FBQ2pCMEIsZ0JBQVEsQ0FKRixFQUlLO0FBQ1hDLGVBQU8sQ0FMRCxDQUtJO0FBTEosS0FEYztBQVF4QkosV0FBTyxpQkFBVztBQUNkLFlBQUl0QixPQUFPUCxhQUFhQyxJQUFiLENBQWtCMkIsT0FBN0I7O0FBRUFyQixhQUFLSixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDQUcsYUFBS0osUUFBTCxDQUFjRSxHQUFkLEdBQW9CLEVBQXBCO0FBQ0FFLGFBQUtKLFFBQUwsQ0FBYzZCLE1BQWQsR0FBdUIsQ0FBdkI7QUFDQXpCLGFBQUtKLFFBQUwsQ0FBYzhCLEtBQWQsR0FBdUIsQ0FBdkI7QUFDQWpDLHFCQUFhcUIsSUFBYixDQUFrQk8sT0FBbEIsQ0FBMEJjLEtBQTFCO0FBQ0gsS0FoQnVCO0FBaUJ4QnZCLGlCQUFhLHVCQUFXO0FBQ3BCLFlBQUlaLE9BQU9QLGFBQWFDLElBQWIsQ0FBa0IyQixPQUE3Qjs7QUFFQSxlQUFPZSxRQUFRQyxRQUFSLENBQWlCLDBDQUFqQixFQUE2RDtBQUNoRUMsb0JBQVFDLFNBRHdEO0FBRWhFZCxvQkFBUXpCLEtBQUtKLFFBQUwsQ0FBYzZCLE1BRjBDO0FBR2hFQyxtQkFBTzFCLEtBQUtKLFFBQUwsQ0FBYzhCLEtBSDJDO0FBSWhFckIsb0JBQVFaLGFBQWFDLElBQWIsQ0FBa0JDLE1BQWxCLENBQXlCTSxTQUF6QjtBQUp3RCxTQUE3RCxDQUFQO0FBTUgsS0ExQnVCO0FBMkJ4Qjs7OztBQUlBWSxVQUFNLGdCQUFXO0FBQ2IsWUFBSW5CLE9BQU9ELGFBQWFDLElBQXhCO0FBQ0EsWUFBSU0sT0FBT1AsYUFBYUMsSUFBYixDQUFrQjJCLE9BQTdCOztBQUVBLFlBQUlQLE9BQU9yQixhQUFhcUIsSUFBeEI7QUFDQSxZQUFJMEIsZUFBZTFCLEtBQUtPLE9BQXhCOztBQUVBO0FBQ0FyQixhQUFLSixRQUFMLENBQWNFLEdBQWQsR0FBb0JFLEtBQUtZLFdBQUwsRUFBcEI7O0FBRUE7QUFDQVosYUFBS0osUUFBTCxDQUFjQyxPQUFkLEdBQXdCLElBQXhCOztBQUVBO0FBQ0FrQixVQUFFRSxPQUFGLENBQVVqQixLQUFLSixRQUFMLENBQWNFLEdBQXhCLEVBQ0tvQixJQURMLENBQ1UsVUFBU0MsWUFBVCxFQUF1QjtBQUN6QixnQkFBSUMsT0FBT0QsYUFBYW5CLEtBQUtKLFFBQUwsQ0FBY0csT0FBM0IsQ0FBWDtBQUNBLGdCQUFJMEMsZUFBZXJCLEtBQUtzQixPQUF4QjtBQUNBLGdCQUFJQyxjQUFjdkIsS0FBS08sTUFBdkI7QUFDQSxnQkFBSWlCLGVBQWV4QixLQUFLQyxPQUF4Qjs7QUFFQTs7O0FBR0E7QUFDQXJCLGlCQUFLSixRQUFMLENBQWM4QixLQUFkLEdBQXNCaUIsWUFBWXRCLE9BQWxDO0FBQ0FyQixpQkFBS0osUUFBTCxDQUFjNkIsTUFBZCxHQUF1QmdCLGFBQWFwQixPQUFiLEdBQXVCckIsS0FBS0osUUFBTCxDQUFjOEIsS0FBNUQ7O0FBRUE7QUFieUI7QUFBQTtBQUFBOztBQUFBO0FBY3pCLHFDQUFrQmtCLFlBQWxCLDhIQUFnQztBQUFBLHdCQUF2QkMsS0FBdUI7O0FBQzVCLHdCQUFJLENBQUNMLGFBQWFNLGdCQUFiLENBQThCRCxLQUE5QixDQUFMLEVBQTJDO0FBQ3ZDTCxxQ0FBYU8sYUFBYixDQUEyQkYsS0FBM0I7QUFDSDtBQUNKOztBQUlEO0FBdEJ5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXVCekI5QixjQUFFLHlCQUFGLEVBQTZCYSxPQUE3QjtBQUNILFNBekJMLEVBMEJLSSxJQTFCTCxDQTBCVSxZQUFXO0FBQ2I7QUFDSCxTQTVCTCxFQTZCS0MsTUE3QkwsQ0E2QlksWUFBVztBQUNmakMsaUJBQUtKLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixLQUF4QjtBQUNILFNBL0JMOztBQWlDQSxlQUFPRyxJQUFQO0FBQ0g7QUEvRXVCLENBQTVCOztBQWtGQTs7O0FBR0FQLGFBQWFxQixJQUFiLEdBQW9CO0FBQ2hCTyxhQUFTO0FBQ0x6QixrQkFBVTtBQUNOb0QsMkJBQWUsRUFEVCxDQUNZO0FBRFosU0FETDtBQUlMRCx1QkFBZSx1QkFBU0YsS0FBVCxFQUFnQjtBQUMzQjtBQUNBLGdCQUFJN0MsT0FBT1AsYUFBYXFCLElBQWIsQ0FBa0JPLE9BQTdCOztBQUVBO0FBQ0EsZ0JBQUk0QixPQUFPLHVDQUF1Q0osTUFBTUssRUFBN0MsR0FBa0QsMkNBQTdEOztBQUVBbkMsY0FBRSw2QkFBRixFQUFpQ29DLE1BQWpDLENBQXdDRixJQUF4Qzs7QUFFQTtBQUNBakQsaUJBQUtvRCxtQkFBTCxDQUF5QlAsS0FBekI7QUFDQTdDLGlCQUFLcUQscUJBQUwsQ0FBMkJSLEtBQTNCOztBQUVBO0FBQ0E3QyxpQkFBS0osUUFBTCxDQUFjb0QsYUFBZCxDQUE0QkgsTUFBTUssRUFBbEMsSUFBd0MsSUFBeEM7QUFDSCxTQW5CSTtBQW9CTEUsNkJBQXFCLDZCQUFTUCxLQUFULEVBQWdCO0FBQ2pDO0FBQ0EsZ0JBQUk3QyxPQUFPUCxhQUFhcUIsSUFBYixDQUFrQk8sT0FBN0I7O0FBRUE7QUFDQSxnQkFBSTRCLE9BQU8sdUNBQXVDSixNQUFNSyxFQUE3QyxHQUFrRCxvQ0FBbEQsR0FBeUZsRCxLQUFLc0Qsa0JBQUwsQ0FBd0JULE1BQU1QLE1BQU4sQ0FBYWlCLEdBQXJDLENBQXpGLEdBQXFJLFVBQWhKOztBQUVBeEMsY0FBRSwrQkFBK0I4QixNQUFNSyxFQUF2QyxFQUEyQ0MsTUFBM0MsQ0FBa0RGLElBQWxEO0FBQ0gsU0E1Qkk7QUE2QkxJLCtCQUF1QiwrQkFBU1IsS0FBVCxFQUFnQjtBQUNuQzs7QUFFSCxTQWhDSTtBQWlDTFMsNEJBQW9CLDRCQUFTQyxHQUFULEVBQWM7QUFDOUIsZ0JBQUlBLEdBQUosRUFBUztBQUNMLHVCQUFPLHVCQUFQO0FBQ0gsYUFGRCxNQUdLO0FBQ0QsdUJBQU8sd0JBQVA7QUFDSDtBQUNKLFNBeENJO0FBeUNMVCwwQkFBa0IsMEJBQVNVLE9BQVQsRUFBa0I7QUFDaEMsZ0JBQUl4RCxPQUFPUCxhQUFhcUIsSUFBYixDQUFrQk8sT0FBN0I7O0FBRUEsbUJBQU9yQixLQUFLSixRQUFMLENBQWNvRCxhQUFkLENBQTRCUyxjQUE1QixDQUEyQ0QsVUFBVSxFQUFyRCxDQUFQO0FBQ0gsU0E3Q0k7QUE4Q0xyQixlQUFPLGlCQUFXO0FBQ2RwQixjQUFFLDZCQUFGLEVBQWlDb0IsS0FBakM7QUFDQTFDLHlCQUFhcUIsSUFBYixDQUFrQk8sT0FBbEIsQ0FBMEJ6QixRQUExQixDQUFtQ29ELGFBQW5DLEdBQW1ELEVBQW5EO0FBQ0g7QUFqREk7QUFETyxDQUFwQjs7QUF1REFqQyxFQUFFMkMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekI1QyxNQUFFNkMsRUFBRixDQUFLQyxZQUFMLENBQWtCQyxRQUFsQixHQUE2QixNQUE3QixDQUR5QixDQUNZOztBQUVyQztBQUNBLFFBQUlyRCxVQUFVMkIsUUFBUUMsUUFBUixDQUFpQiw0QkFBakIsRUFBK0MsRUFBQ0MsUUFBUUMsU0FBVCxFQUEvQyxDQUFkOztBQUVBLFFBQUk3QixjQUFjLENBQUMsUUFBRCxDQUFsQjtBQUNBLFFBQUlxRCxhQUFhdEUsYUFBYUMsSUFBYixDQUFrQkMsTUFBbkM7O0FBRUFvRSxlQUFXdkQsWUFBWCxDQUF3QkMsT0FBeEI7QUFDQU4sb0JBQWdCNkQsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDdEQsV0FBeEM7QUFDQXFELGVBQVd2RCxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQUssTUFBRSx3QkFBRixFQUE0QmtELEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckQvRCx3QkFBZ0I2RCxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0RCxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQUssTUFBRSxHQUFGLEVBQU9rRCxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0UsQ0FBVCxFQUFZO0FBQ3hDSixtQkFBV3ZELFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQXRCRCxFIiwiZmlsZSI6InBsYXllci1sb2FkZXIuZGYwMmU0ZTljZTk2ODBkZDQ0NzMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhZjkxYmE1ODBkZWQ5YzY1MDYzZCIsIi8qXHJcbiAqIFBsYXllciBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUGxheWVyTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcblBsYXllckxvYWRlci5hamF4ID0ge307XHJcblxyXG4vKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2Vhc29uIHNlbGVjdGVkIGJhc2VkIG9uIGZpbHRlclxyXG4gICAgICovXHJcbiAgICBnZXRTZWFzb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2V0U2VsZWN0b3JWYWx1ZXMoXCJzZWFzb25cIik7XHJcblxyXG4gICAgICAgIGxldCBzZWFzb24gPSBcIlVua25vd25cIjtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsICE9PSBudWxsICYmIHZhbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWFzb247XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGFqYXgubWF0Y2hlcy5yZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcjcGxheWVybG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbCBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBhamF4TWF0Y2hlcyA9IGFqYXgubWF0Y2hlcztcclxuICAgICAgICAgICAgICAgIGFqYXhNYXRjaGVzLmludGVybmFsLm9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5pbnRlcm5hbC5saW1pdCA9IGpzb24ubGltaXRzLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb2FkIGluaXRpYWwgbWF0Y2ggc2V0XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5sb2FkKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcyA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICAgICAgb2Zmc2V0OiAwLCAvL01hdGNoZXMgb2Zmc2V0XHJcbiAgICAgICAgbGltaXQ6IDUsIC8vTWF0Y2hlcyBsaW1pdFxyXG4gICAgfSxcclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gJyc7XHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5vZmZzZXQ9ICAwO1xyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubGltaXQgPSAgNTtcclxuICAgICAgICBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzLmVtcHR5KCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgcmV0dXJuIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJkYXRhX3BhZ2VkYXRhX3BsYXllcl9yZWNlbnRtYXRjaGVzXCIsIHtcclxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWQsXHJcbiAgICAgICAgICAgIG9mZnNldDogc2VsZi5pbnRlcm5hbC5vZmZzZXQsXHJcbiAgICAgICAgICAgIGxpbWl0OiBzZWxmLmludGVybmFsLmxpbWl0LFxyXG4gICAgICAgICAgICBzZWFzb246IFBsYXllckxvYWRlci5hamF4LmZpbHRlci5nZXRTZWFzb24oKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBMb2FkcyB7bGltaXR9IHJlY2VudCBtYXRjaGVzIG9mZnNldCBieSB7b2Zmc2V0fSBmcm9tIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBQbGF5ZXJMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4Lm1hdGNoZXM7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUGxheWVyTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2hlcyA9IGRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLys9IFJlY2VudCBNYXRjaGVzIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fb2Zmc2V0cyA9IGpzb24ub2Zmc2V0cztcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2xpbWl0cyA9IGpzb24ubGltaXRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2hlcyA9IGpzb24ubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogUHJvY2VzcyBNYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU2V0IG5ldyBsaW1pdCBhbmQgb2Zmc2V0XHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxpbWl0ID0ganNvbl9saW1pdHMubWF0Y2hlcztcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwub2Zmc2V0ID0ganNvbl9vZmZzZXRzLm1hdGNoZXMgKyBzZWxmLmludGVybmFsLmxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQXBwZW5kIG5ldyBNYXRjaCB3aWRnZXRzIGZvciBtYXRjaGVzIHRoYXQgYXJlbid0IGluIHRoZSBtYW5pZmVzdFxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YganNvbl9tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhX21hdGNoZXMuaXNNYXRjaEdlbmVyYXRlZChtYXRjaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaGVzLmdlbmVyYXRlTWF0Y2gobWF0Y2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgbWF0Y2hNYW5pZmVzdDoge30gLy9LZWVwcyB0cmFjayBvZiB3aGljaCBtYXRjaCBpZHMgYXJlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQsIHRvIHByZXZlbnQgb2Zmc2V0IHJlcXVlc3RzIGZyb20gcmVwZWF0aW5nIG1hdGNoZXMgb3ZlciBsYXJnZSBwZXJpb2RzIG9mIHRpbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIGFsbCBzdWJjb21wb25lbnRzIG9mIGEgbWF0Y2ggZGlzcGxheVxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXM7XHJcblxyXG4gICAgICAgICAgICAvL01hdGNoIGNvbXBvbmVudCBjb250YWluZXJcclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInBsLXJlY2VudG1hdGNoLWNvbnRhaW5lci0nICsgbWF0Y2guaWQgKyAnXCIgY2xhc3M9XCJwbC1yZWNlbnRtYXRjaC1jb250YWluZXJcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI3BsLXJlY2VudG1hdGNoZXMtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9TdWJjb21wb25lbnRzXHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVNYXRjaFdpZGdldChtYXRjaCk7XHJcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lKG1hdGNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vTG9nIG1hdGNoIGluIG1hbmlmZXN0XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdFttYXRjaC5pZF0gPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaFdpZGdldDogZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIHNtYWxsIG1hdGNoIGJhciB3aXRoIHNpbXBsZSBpbmZvXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmRhdGEubWF0Y2hlcztcclxuXHJcbiAgICAgICAgICAgIC8vTWF0Y2ggV2lkZ2V0IENvbnRhaW5lclxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmVjZW50bWF0Y2gtc2ltcGxld2lkZ2V0LScgKyBtYXRjaC5pZCArICdcIiBjbGFzcz1cInJlY2VudG1hdGNoLXNpbXBsZXdpZGdldCAnICsgc2VsZi5jb2xvcl9NYXRjaFdvbkxvc3QobWF0Y2gucGxheWVyLndvbikgKyAnXCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaC1jb250YWluZXItJyArIG1hdGNoLmlkKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZ1bGxNYXRjaFBhbmU6IGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBmdWxsIG1hdGNoIHBhbmUgdGhhdCBsb2FkcyB3aGVuIGEgbWF0Y2ggd2lkZ2V0IGlzIGNsaWNrZWQgZm9yIGEgZGV0YWlsZWQgdmlld1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yX01hdGNoV29uTG9zdDogZnVuY3Rpb24od29uKSB7XHJcbiAgICAgICAgICAgIGlmICh3b24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctd29uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncGwtcmVjZW50bWF0Y2gtYmctbG9zdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTWF0Y2hHZW5lcmF0ZWQ6IGZ1bmN0aW9uKG1hdGNoaWQpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuZGF0YS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShtYXRjaGlkICsgXCJcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNwbC1yZWNlbnRtYXRjaGVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIFBsYXllckxvYWRlci5kYXRhLm1hdGNoZXMuaW50ZXJuYWwubWF0Y2hNYW5pZmVzdCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9