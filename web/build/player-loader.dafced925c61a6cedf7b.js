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
    getSeason: function getSeason() {},
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
             * Empty dynamically filled containers
             */

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

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];

            /*
             * Empty dynamically filled containers
             */

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

/*
 * Handles binding data to the page
 */
PlayerLoader.data = {
    matches: {
        generateMatchWidget: function generateMatchWidget() {
            //Generates the small match bar with simple info
        },
        generateFullMatchPane: function generateFullMatchPane() {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view
        },
        generate: function generate(matches) {
            //Generates the matches pane and fills with initial offering of match widgets
        },
        empty: function empty() {
            //Empties the matches pane (will probably never need)
            $('#pl-recentmatches-container').empty();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNGM3MGFjMDI0NTAyMmQ5NDIzNmEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwibmFtZXMiOlsiUGxheWVyTG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwiZ2V0U2Vhc29uIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwicmVtb3ZlQ2xhc3MiLCJhamF4TWF0Y2hlcyIsIm1hdGNoZXMiLCJvZmZzZXQiLCJsaW1pdCIsImxpbWl0cyIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwiUm91dGluZyIsImdlbmVyYXRlIiwicGxheWVyIiwicGxheWVyX2lkIiwic2Vhc29uIiwiZ2VuZXJhdGVNYXRjaFdpZGdldCIsImdlbmVyYXRlRnVsbE1hdGNoUGFuZSIsImVtcHR5IiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDSCxLQUZEOztBQUlBO0FBQ0FNLE1BQUUsR0FBRixFQUFPa0MsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q0osbUJBQVd4QyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJwbGF5ZXItbG9hZGVyLmRhZmNlZDkyNWM2MWE2Y2VkZjdiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNGM3MGFjMDI0NTAyMmQ5NDIzNmEiLCIvKlxyXG4gKiBQbGF5ZXIgTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBwbGF5ZXIgZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IFBsYXllckxvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5QbGF5ZXJMb2FkZXIuYWpheCA9IHt9O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHNlYXNvbiBzZWxlY3RlZCBiYXNlZCBvbiBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0U2Vhc29uOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBsYXllckxvYWRlci5kYXRhO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNwbGF5ZXJsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnI3BsYXllcmxvYWRlci1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWwgbWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWpheE1hdGNoZXMgPSBhamF4Lm1hdGNoZXM7XHJcbiAgICAgICAgICAgICAgICBhamF4TWF0Y2hlcy5pbnRlcm5hbC5vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYWpheE1hdGNoZXMuaW50ZXJuYWwubGltaXQgPSBqc29uLmxpbWl0cy5tYXRjaGVzO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcblBsYXllckxvYWRlci5hamF4Lm1hdGNoZXMgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgICAgIG9mZnNldDogMCwgLy9NYXRjaGVzIG9mZnNldFxyXG4gICAgICAgIGxpbWl0OiA1LCAvL01hdGNoZXMgbGltaXRcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBQbGF5ZXJMb2FkZXIuYWpheC5tYXRjaGVzO1xyXG5cclxuICAgICAgICByZXR1cm4gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX3JlY2VudG1hdGNoZXNcIiwge1xyXG4gICAgICAgICAgICBwbGF5ZXI6IHBsYXllcl9pZCxcclxuICAgICAgICAgICAgb2Zmc2V0OiBzZWxmLmludGVybmFsLm9mZnNldCxcclxuICAgICAgICAgICAgbGltaXQ6IHNlbGYuaW50ZXJuYWwubGltaXQsXHJcbiAgICAgICAgICAgIHNlYXNvbjogUGxheWVyTG9hZGVyLmFqYXguZmlsdGVyLmdldFNlYXNvbigpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIExvYWRzIHtsaW1pdH0gcmVjZW50IG1hdGNoZXMgb2Zmc2V0IGJ5IHtvZmZzZXR9IGZyb20gY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFBsYXllckxvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUGxheWVyTG9hZGVyLmFqYXgubWF0Y2hlcztcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBQbGF5ZXJMb2FkZXIuZGF0YTtcclxuXHJcbiAgICAgICAgLy9HZW5lcmF0ZSB1cmwgYmFzZWQgb24gaW50ZXJuYWwgc3RhdGVcclxuICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICAgICAgICovXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUGxheWVyTG9hZGVyLmRhdGEgPSB7XHJcbiAgICBtYXRjaGVzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaFdpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vR2VuZXJhdGVzIHRoZSBzbWFsbCBtYXRjaCBiYXIgd2l0aCBzaW1wbGUgaW5mb1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGdWxsTWF0Y2hQYW5lOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy9HZW5lcmF0ZXMgdGhlIGZ1bGwgbWF0Y2ggcGFuZSB0aGF0IGxvYWRzIHdoZW4gYSBtYXRjaCB3aWRnZXQgaXMgY2xpY2tlZCBmb3IgYSBkZXRhaWxlZCB2aWV3XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24obWF0Y2hlcykge1xyXG4gICAgICAgICAgICAvL0dlbmVyYXRlcyB0aGUgbWF0Y2hlcyBwYW5lIGFuZCBmaWxscyB3aXRoIGluaXRpYWwgb2ZmZXJpbmcgb2YgbWF0Y2ggd2lkZ2V0c1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvL0VtcHRpZXMgdGhlIG1hdGNoZXMgcGFuZSAod2lsbCBwcm9iYWJseSBuZXZlciBuZWVkKVxyXG4gICAgICAgICAgICAkKCcjcGwtcmVjZW50bWF0Y2hlcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9wbGF5ZXInLCB7cGxheWVyOiBwbGF5ZXJfaWR9KTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJzZWFzb25cIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFBsYXllckxvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9