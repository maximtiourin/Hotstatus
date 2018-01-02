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
                data_ranks.generateContainer(json.limits.rankLimit, json.limits.matchLimit, json.last_updated);

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
        generateContainer: function generateContainer(rankLimit, matchLimit, last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            var html = '<div id="rankings-container" class="rankings-container hotstatus-subcontainer">' + '<div class="rankings-header">' + '<div class="rankings-header-left">Players require ' + matchLimit + ' matches played in order to qualify for Top ' + rankLimit + ' rankings.</div>' + '<div class="rankings-header-right">Last Updated: ' + date + '.</div>' + '</div>' + '</div>';

            $('#rankings-middlepane').append(html);
        },
        generateTableData: function generateTableData(row) {
            var rank = row.rank;

            var player = '<a class="rankings-playername" href="' + Routing.generate("player", { region: row.region, id: row.player_id }) + '" target="_blank">' + row.player_name + '</a>';

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
            var table = $('#rankings-table').DataTable(dataTableConfig);

            //Search the table for the new value typed in by user
            $('#rankings-search').on("propertychange change click keyup input paste", function () {
                table.search($(this).val()).draw();
            });
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

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
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTg1OTQzOWZmNzdiM2U5YmY1NzMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3JhbmtpbmdzLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJSYW5raW5nc0xvYWRlciIsImFqYXgiLCJkZWxheSIsIm1pbGxpc2Vjb25kcyIsImZ1bmMiLCJzZXRUaW1lb3V0IiwiZmlsdGVyIiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwidXJsIiwiZGF0YVNyYyIsInNlbGYiLCJnZXRTZWFzb24iLCJ2YWwiLCJIb3RzdGF0dXNGaWx0ZXIiLCJnZXRTZWxlY3RvclZhbHVlcyIsInNlYXNvbiIsIlN0cmluZyIsImxlbmd0aCIsInZhbGlkYXRlTG9hZCIsImJhc2VVcmwiLCJmaWx0ZXJUeXBlcyIsInZhbGlkRmlsdGVycyIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGEiLCJkYXRhX3JhbmtzIiwicmFua3MiLCIkIiwicHJlcGVuZCIsImdldEpTT04iLCJkb25lIiwianNvblJlc3BvbnNlIiwianNvbiIsImpzb25fcmFua3MiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwiZ2VuZXJhdGVDb250YWluZXIiLCJsaW1pdHMiLCJyYW5rTGltaXQiLCJtYXRjaExpbWl0IiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVUYWJsZSIsInJhbmtzVGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInJhbmsiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJpbml0VGFibGUiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJkYXRlIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwiaHRtbCIsImFwcGVuZCIsInJvdyIsInBsYXllciIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsInJlZ2lvbiIsImlkIiwicGxheWVyX2lkIiwicGxheWVyX25hbWUiLCJwbGF5ZWQiLCJyYXRpbmciLCJyb3dMaW1pdCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwiZGVmZXJSZW5kZXIiLCJwYWdlTGVuZ3RoIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRhdGFUYWJsZUNvbmZpZyIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJkcmF3IiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGlCQUFpQixFQUFyQjs7QUFFQTs7O0FBR0FBLGVBQWVDLElBQWYsR0FBc0I7QUFDbEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5pQixDQUF0Qjs7QUFTQTs7O0FB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QTVCO0FBQ0gsYUFGRDtBQUdIO0FBckVFO0FBRFcsQ0FBdEI7O0FBMkVBbkUsRUFBRW9FLFFBQUYsRUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCckUsTUFBRXNFLEVBQUYsQ0FBS0MsWUFBTCxDQUFrQkMsUUFBbEIsR0FBNkIsTUFBN0IsQ0FEeUIsQ0FDWTs7QUFFckM7QUFDQSxRQUFJaEYsVUFBVTRDLFFBQVFDLFFBQVIsQ0FBaUIsOEJBQWpCLENBQWQ7O0FBRUEsUUFBSTVDLGNBQWMsQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixVQUFyQixDQUFsQjtBQUNBLFFBQUlnRixhQUFhckcsZUFBZUMsSUFBZixDQUFvQkssTUFBckM7O0FBRUE7QUFDQVEsb0JBQWdCd0YsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDakYsV0FBeEM7QUFDQWdGLGVBQVdsRixZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQU8sTUFBRSx3QkFBRixFQUE0QmlFLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNVLEtBQVQsRUFBZ0I7QUFDckR6Rix3QkFBZ0J3RixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0NqRixXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQU8sTUFBRSxHQUFGLEVBQU9pRSxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU1csQ0FBVCxFQUFZO0FBQ3hDSCxtQkFBV2xGLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQXRCRCxFIiwiZmlsZSI6InJhbmtpbmdzLWxvYWRlci4xOTNmMTE0NzZjNWRiNGQ3NmQ1YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9yYW5raW5ncy1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNTg1OTQzOWZmNzdiM2U5YmY1NzMiLCIvKlxyXG4gKiBSYW5raW5ncyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIHBsYXllciBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgUmFua2luZ3NMb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuUmFua2luZ3NMb2FkZXIuYWpheCA9IHtcclxuICAgIC8qXHJcbiAgICAgKiBFeGVjdXRlcyBmdW5jdGlvbiBhZnRlciBnaXZlbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgZGVsYXk6IGZ1bmN0aW9uKG1pbGxpc2Vjb25kcywgZnVuYykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuYywgbWlsbGlzZWNvbmRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFRoZSBhamF4IGhhbmRsZXIgZm9yIGhhbmRsaW5nIGZpbHRlcnNcclxuICovXHJcblJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2Vhc29uIHNlbGVjdGVkIGJhc2VkIG9uIGZpbHRlclxyXG4gICAgICovXHJcbiAgICBnZXRTZWFzb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2V0U2VsZWN0b3JWYWx1ZXMoXCJzZWFzb25cIik7XHJcblxyXG4gICAgICAgIGxldCBzZWFzb24gPSBcIlVua25vd25cIjtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgdmFsIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsICE9PSBudWxsICYmIHZhbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXNvbiA9IHZhbFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWFzb247XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVybCAhPT0gc2VsZi51cmwoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBhamF4ID0gUmFua2luZ3NMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFJhbmtpbmdzTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgZGF0YV9yYW5rcyA9IGRhdGEucmFua3M7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI3JhbmtpbmdzbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fcmFua3MgPSBqc29uLnJhbmtzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBSYW5raW5nc2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogR2V0IFJhbmtpbmdzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX3JhbmtzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmdlbmVyYXRlQ29udGFpbmVyKGpzb24ubGltaXRzLnJhbmtMaW1pdCwganNvbi5saW1pdHMubWF0Y2hMaW1pdCwganNvbi5sYXN0X3VwZGF0ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmtzVGFibGUgPSBkYXRhX3JhbmtzLmdldFRhYmxlQ29uZmlnKGpzb24ubGltaXRzLnJhbmtMaW1pdCwganNvbl9yYW5rcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByYW5rc1RhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCByYW5rIG9mIGpzb25fcmFua3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFua3NUYWJsZS5kYXRhLnB1c2goZGF0YV9yYW5rcy5nZW5lcmF0ZVRhYmxlRGF0YShyYW5rKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3JhbmtzLmluaXRUYWJsZShyYW5rc1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5SYW5raW5nc0xvYWRlci5kYXRhID0ge1xyXG4gICAgcmFua3M6IHtcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNyYW5raW5ncy1jb250YWluZXInKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29udGFpbmVyOiBmdW5jdGlvbihyYW5rTGltaXQsIG1hdGNoTGltaXQsIGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cInJhbmtpbmdzLWNvbnRhaW5lclwiIGNsYXNzPVwicmFua2luZ3MtY29udGFpbmVyIGhvdHN0YXR1cy1zdWJjb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmFua2luZ3MtaGVhZGVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJhbmtpbmdzLWhlYWRlci1sZWZ0XCI+UGxheWVycyByZXF1aXJlICcrIG1hdGNoTGltaXQgKycgbWF0Y2hlcyBwbGF5ZWQgaW4gb3JkZXIgdG8gcXVhbGlmeSBmb3IgVG9wICcrIHJhbmtMaW1pdCArJyByYW5raW5ncy48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmFua2luZ3MtaGVhZGVyLXJpZ2h0XCI+TGFzdCBVcGRhdGVkOiAnKyBkYXRlICsnLjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjcmFua2luZ3MtbWlkZGxlcGFuZScpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmsgPSByb3cucmFuaztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSAnPGEgY2xhc3M9XCJyYW5raW5ncy1wbGF5ZXJuYW1lXCIgaHJlZj1cIicgKyBSb3V0aW5nLmdlbmVyYXRlKFwicGxheWVyXCIsIHtyZWdpb246IHJvdy5yZWdpb24sIGlkOiByb3cucGxheWVyX2lkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Jysgcm93LnBsYXllcl9uYW1lICsnPC9hPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGxheWVkID0gcm93LnBsYXllZDtcclxuXHJcbiAgICAgICAgICAgIGxldCByYXRpbmcgPSByb3cucmF0aW5nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyYW5rLCBwbGF5ZXIsIHBsYXllZCwgcmF0aW5nXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMaW1pdCwgcm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJSYW5rXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllclwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXSwgXCJzZWFyY2hhYmxlXCI6IHRydWV9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUmF0aW5nXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHJvd0xpbWl0O1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3JhbmtpbmdzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicmFua2luZ3MtdGFibGVcIiBjbGFzcz1cInJhbmtpbmdzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9ICQoJyNyYW5raW5ncy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICAgICAgICAgJCgnI3JhbmtpbmdzLXNlYXJjaCcpLm9uKFwicHJvcGVydHljaGFuZ2UgY2hhbmdlIGNsaWNrIGtleXVwIGlucHV0IHBhc3RlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGFibGUuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3JhbmtpbmdzJyk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wicmVnaW9uXCIsIFwic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9yYW5raW5ncy1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9