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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/rankings-loader.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/rankings-loader.js":
/*!**************************************!*\
  !*** ./assets/js/rankings-loader.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/*
 * Rankings Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
var RankingsLoader = {};

/*
 * Handles Ajax requests
 */
RankingsLoader.ajax = {
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
RankingsLoader.ajax.filter = {
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

        var self = RankingsLoader.ajax.filter;

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
        var self = RankingsLoader.ajax.filter;

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
        var ajax = RankingsLoader.ajax;
        var self = RankingsLoader.ajax.filter;

        var data = RankingsLoader.data;
        data_ranks = data.ranks;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#rankingsloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_ranks = json.ranks;

            /*
             * Empty dynamically filled containers, reset all subajax objects
             */
            data_ranks.empty();

            /*
             * Rankingsloader Container
             */
            $('.initial-load').removeClass('initial-load');

            /*
             * Get Rankings
             */
            if (json_ranks.length > 0) {
                data_ranks.generateContainer(json.limits.matchLimit, json.last_updated);

                data_ranks.generateTable();

                var ranksTable = data_ranks.getTableConfig(json.limits.rankLimit, json_ranks.length);

                ranksTable.data = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = json_ranks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var rank = _step.value;

                        ranksTable.data.push(data_ranks.generateTableData(rank));
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

                data_ranks.initTable(ranksTable);
            }

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

/*
 * Handles binding data to the page
 */
RankingsLoader.data = {
    ranks: {
        empty: function empty() {
            $('#rankings-container').remove();
        },
        generateContainer: function generateContainer(matchLimit, last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            var html = '<div id="rankings-container" class="rankings-container hotstatus-subcontainer">' + '<div class="rankings-header">' + '<div class="rankings-header-left">Players require ' + matchLimit + ' matches played in order to qualify for rankings.</div>' + '<div class="rankings-header-right">Last Updated: ' + date + '.</div>' + '</div>' + '</div>';

            $('#rankings-middlepane').append(html);
        },
        generateTableData: function generateTableData(row) {
            var rank = row.rank;

            var player = '<a class="rankings-playername" href="' + Routing.generate("player", { id: row.player_id }) + '" target="_blank">' + row.player_name + '</a>';

            var played = row.played;

            var rating = row.rating;

            return [rank, player, played, rating];
        },
        getTableConfig: function getTableConfig(rowLimit, rowLength) {
            var datatable = {};

            //Columns definition
            datatable.columns = [{ "title": "Rank", "sClass": "sortIcon_Number", "orderSequence": ['asc', 'desc'], "searchable": false }, { "title": "Player", "sClass": "sortIcon_Text", "orderSequence": ['asc', 'desc'], "searchable": true }, { "title": "Played", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'], "searchable": false }, { "title": "Rating", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'], "searchable": false }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[0, 'asc']];

            datatable.deferRender = true;
            datatable.pageLength = rowLimit;
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            //datatable.pagingType = "simple_numbers";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        generateTable: function generateTable() {
            $('#rankings-container').append('<table id="rankings-table" class="rankings-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead></thead></table>');
        },
        initTable: function initTable(dataTableConfig) {
            $('#rankings-table').DataTable(dataTableConfig);
        }
    }
};

$(document).ready(function () {
    //$.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_pagedata_rankings');

    var filterTypes = ["region", "season", "gameType"];
    var filterAjax = RankingsLoader.ajax.filter;

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

    //Search the table for the new value typed in by user
    $('#rankings-search').on("propertychange change click keyup input paste", function () {
        $('#rankings-table').search($(this).val()).draw();
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODU2YzJiMDk4ZjAyYTg2YjgxZmUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3JhbmtpbmdzLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJSYW5raW5nc0xvYWRlciIsImFqYXgiLCJkZWxheSIsIm1pbGxpc2Vjb25kcyIsImZ1bmMiLCJzZXRUaW1lb3V0IiwiZmlsdGVyIiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwidXJsIiwiZGF0YVNyYyIsInNlbGYiLCJnZXRTZWFzb24iLCJ2YWwiLCJIb3RzdGF0dXNGaWx0ZXIiLCJnZXRTZWxlY3RvclZhbHVlcyIsInNlYXNvbiIsIlN0cmluZyIsImxlbmd0aCIsInZhbGlkYXRlTG9hZCIsImJhc2VVcmwiLCJmaWx0ZXJUeXBlcyIsInZhbGlkRmlsdGVycyIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGEiLCJkYXRhX3JhbmtzIiwicmFua3MiLCIkIiwicHJlcGVuZCIsImdldEpTT04iLCJkb25lIiwianNvblJlc3BvbnNlIiwianNvbiIsImpzb25fcmFua3MiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwiZ2VuZXJhdGVDb250YWluZXIiLCJsaW1pdHMiLCJtYXRjaExpbWl0IiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVUYWJsZSIsInJhbmtzVGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInJhbmtMaW1pdCIsInJhbmsiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJpbml0VGFibGUiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJkYXRlIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwiaHRtbCIsImFwcGVuZCIsInJvdyIsInBsYXllciIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsImlkIiwicGxheWVyX2lkIiwicGxheWVyX25hbWUiLCJwbGF5ZWQiLCJyYXRpbmciLCJyb3dMaW1pdCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwiZGVmZXJSZW5kZXIiLCJwYWdlTGVuZ3RoIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRvY3VtZW50IiwicmVhZHkiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSIsInNlYXJjaCIsImRyYXciXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGlCQUFpQixFQUFyQjs7QUFFQTs7O0FBR0FBLGVBQWVDLElBQWYsR0FBc0I7QUFDbEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5pQixDQUF0Qjs7QUFTQTs7O0FBR0FILGVBQWVDLElBQWYsQ0FBb0JLLE1BQXBCLEdBQTZCO0FBQ3pCQyxjQUFVO0FB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LGVBQVcxRSxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQU8sTUFBRSx3QkFBRixFQUE0Qm1FLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckRsRix3QkFBZ0JnRixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N6RSxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQU8sTUFBRSxHQUFGLEVBQU9tRSxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0UsQ0FBVCxFQUFZO0FBQ3hDSixtQkFBVzFFLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7O0FBSUE7QUFDQU8sTUFBRSxrQkFBRixFQUFzQm1FLEVBQXRCLENBQXlCLCtDQUF6QixFQUEwRSxZQUFXO0FBQ2pGbkUsVUFBRSxpQkFBRixFQUFxQnNFLE1BQXJCLENBQTRCdEUsRUFBRSxJQUFGLEVBQVFmLEdBQVIsRUFBNUIsRUFBMkNzRixJQUEzQztBQUNILEtBRkQ7QUFHSCxDQTNCRCxFIiwiZmlsZSI6InJhbmtpbmdzLWxvYWRlci5lZjJkOTgzNjNjMWZiZjhjMjUwZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9yYW5raW5ncy1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgODU2YzJiMDk4ZjAyYTg2YjgxZmUiLCIvKlxyXG4gKiBSYW5raW5ncyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUmFua2luZ3NMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUmFua2luZ3NMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2Vhc29uIHNlbGVjdGVkIGJhc2VkIG9uIGZpbHRlclxyXG4gICAgICovXHJcbiAgICBnZXRTZWFzb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2V0U2VsZWN0b3JWYWx1ZXMoXCJzZWFzb25cIik7XHJcblxyXG4gICAgICAgIGxldCBzZWFzb24gPSBcIlVua25vd25cIjtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsICE9PSBudWxsICYmIHZhbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWFzb247XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUmFua2luZ3NMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFJhbmtpbmdzTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgZGF0YV9yYW5rcyA9IGRhdGEucmFua3M7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JhbmtpbmdzbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fcmFua3MgPSBqc29uLnJhbmtzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBSYW5raW5nc2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogR2V0IFJhbmtpbmdzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX3JhbmtzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmdlbmVyYXRlQ29udGFpbmVyKGpzb24ubGltaXRzLm1hdGNoTGltaXQsIGpzb24ubGFzdF91cGRhdGVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9yYW5rcy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5rc1RhYmxlID0gZGF0YV9yYW5rcy5nZXRUYWJsZUNvbmZpZyhqc29uLmxpbWl0cy5yYW5rTGltaXQsIGpzb25fcmFua3MubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmFua3NUYWJsZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcmFuayBvZiBqc29uX3JhbmtzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmtzVGFibGUuZGF0YS5wdXNoKGRhdGFfcmFua3MuZ2VuZXJhdGVUYWJsZURhdGEocmFuaykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9yYW5rcy5pbml0VGFibGUocmFua3NUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuUmFua2luZ3NMb2FkZXIuZGF0YSA9IHtcclxuICAgIHJhbmtzOiB7XHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjcmFua2luZ3MtY29udGFpbmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUNvbnRhaW5lcjogZnVuY3Rpb24obWF0Y2hMaW1pdCwgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmFua2luZ3MtY29udGFpbmVyXCIgY2xhc3M9XCJyYW5raW5ncy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyYW5raW5ncy1oZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmFua2luZ3MtaGVhZGVyLWxlZnRcIj5QbGF5ZXJzIHJlcXVpcmUgJysgbWF0Y2hMaW1pdCArJyBtYXRjaGVzIHBsYXllZCBpbiBvcmRlciB0byBxdWFsaWZ5IGZvciByYW5raW5ncy48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmFua2luZ3MtaGVhZGVyLXJpZ2h0XCI+TGFzdCBVcGRhdGVkOiAnKyBkYXRlICsnLjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcmFua2luZ3MtbWlkZGxlcGFuZScpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmsgPSByb3cucmFuaztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSAnPGEgY2xhc3M9XCJyYW5raW5ncy1wbGF5ZXJuYW1lXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtpZDogcm93LnBsYXllcl9pZH0pICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicrIHJvdy5wbGF5ZXJfbmFtZSArJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBsYXllZCA9IHJvdy5wbGF5ZWQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgcmF0aW5nID0gcm93LnJhdGluZztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbcmFuaywgcGxheWVyLCBwbGF5ZWQsIHJhdGluZ107XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGltaXQsIHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUmFua1wiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInNlYXJjaGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZXJcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9UZXh0XCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwic2VhcmNoYWJsZVwiOiB0cnVlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlJhdGluZ1wiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInNlYXJjaGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1swLCAnYXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSByb3dMaW1pdDtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVfbnVtYmVyc1wiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNyYW5raW5ncy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cInJhbmtpbmdzLXRhYmxlXCIgY2xhc3M9XCJyYW5raW5ncy10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZD48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjcmFua2luZ3MtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9wYWdlZGF0YV9yYW5raW5ncycpO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInJlZ2lvblwiLCBcInNlYXNvblwiLCBcImdhbWVUeXBlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBSYW5raW5nc0xvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAvL2ZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwpO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGZpbHRlckFqYXgudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vU2VhcmNoIHRoZSB0YWJsZSBmb3IgdGhlIG5ldyB2YWx1ZSB0eXBlZCBpbiBieSB1c2VyXHJcbiAgICAkKCcjcmFua2luZ3Mtc2VhcmNoJykub24oXCJwcm9wZXJ0eWNoYW5nZSBjaGFuZ2UgY2xpY2sga2V5dXAgaW5wdXQgcGFzdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3JhbmtpbmdzLXRhYmxlJykuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvcmFua2luZ3MtbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==