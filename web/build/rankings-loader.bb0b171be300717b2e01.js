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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMGVjMjUwYzViN2VkMGRlOTc3ZjUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3JhbmtpbmdzLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJSYW5raW5nc0xvYWRlciIsImFqYXgiLCJkZWxheSIsIm1pbGxpc2Vjb25kcyIsImZ1bmMiLCJzZXRUaW1lb3V0IiwiZmlsdGVyIiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwidXJsIiwiZGF0YVNyYyIsInNlbGYiLCJnZXRTZWFzb24iLCJ2YWwiLCJIb3RzdGF0dXNGaWx0ZXIiLCJnZXRTZWxlY3RvclZhbHVlcyIsInNlYXNvbiIsIlN0cmluZyIsImxlbmd0aCIsInZhbGlkYXRlTG9hZCIsImJhc2VVcmwiLCJmaWx0ZXJUeXBlcyIsInZhbGlkRmlsdGVycyIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGEiLCJkYXRhX3JhbmtzIiwicmFua3MiLCIkIiwicHJlcGVuZCIsImdldEpTT04iLCJkb25lIiwianNvblJlc3BvbnNlIiwianNvbiIsImpzb25fcmFua3MiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwiZ2VuZXJhdGVDb250YWluZXIiLCJsaW1pdHMiLCJyYW5rTGltaXQiLCJtYXRjaExpbWl0IiwibGFzdF91cGRhdGVkIiwiZ2VuZXJhdGVUYWJsZSIsInJhbmtzVGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInJhbmsiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJpbml0VGFibGUiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJkYXRlIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwiaHRtbCIsImFwcGVuZCIsInJvdyIsInBsYXllciIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsImlkIiwicGxheWVyX2lkIiwicGxheWVyX25hbWUiLCJwbGF5ZWQiLCJyYXRpbmciLCJyb3dMaW1pdCIsInJvd0xlbmd0aCIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwiZGVmZXJSZW5kZXIiLCJwYWdlTGVuZ3RoIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRhdGFUYWJsZUNvbmZpZyIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJkcmF3IiwiZG9jdW1lbnQiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGlCQUFpQixFQUFyQjs7QUFFQTs7O0FBR0FBLGVBQWVDLElBQWYsR0FBc0I7QUFDbEI7OztBQUdBQyxXQUFPLGVBQVNDLFlBQVQsRUFBdUJDLElBQXZCLEVBQTZCO0FBQ2hDQyxtQkFBV0QsSUFBWCxFQUFpQkQsWUFBakI7QUFDSDtBQU5pQixDQUF0Qjs7QUFTQTs7O0FBR0FILGVBQWVD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Qjs7QUEyRUFsRSxFQUFFbUUsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJwRSxNQUFFcUUsRUFBRixDQUFLQyxZQUFMLENBQWtCQyxRQUFsQixHQUE2QixNQUE3QixDQUR5QixDQUNZOztBQUVyQztBQUNBLFFBQUkvRSxVQUFVNEMsUUFBUUMsUUFBUixDQUFpQiw4QkFBakIsQ0FBZDs7QUFFQSxRQUFJNUMsY0FBYyxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFVBQXJCLENBQWxCO0FBQ0EsUUFBSStFLGFBQWFwRyxlQUFlQyxJQUFmLENBQW9CSyxNQUFyQzs7QUFFQTtBQUNBUSxvQkFBZ0J1RixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0NoRixXQUF4QztBQUNBK0UsZUFBV2pGLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBTyxNQUFFLHdCQUFGLEVBQTRCZ0UsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU1UsS0FBVCxFQUFnQjtBQUNyRHhGLHdCQUFnQnVGLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q2hGLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBTyxNQUFFLEdBQUYsRUFBT2dFLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTVyxDQUFULEVBQVk7QUFDeENILG1CQUFXakYsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdEJELEUiLCJmaWxlIjoicmFua2luZ3MtbG9hZGVyLmJiMGIxNzFiZTMwMDcxN2IyZTAxLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3JhbmtpbmdzLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwZWMyNTBjNWI3ZWQwZGU5NzdmNSIsIi8qXHJcbiAqIFJhbmtpbmdzIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgcGxheWVyIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBSYW5raW5nc0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5SYW5raW5nc0xvYWRlci5hamF4ID0ge1xyXG4gICAgLypcclxuICAgICAqIEV4ZWN1dGVzIGZ1bmN0aW9uIGFmdGVyIGdpdmVuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBkZWxheTogZnVuY3Rpb24obWlsbGlzZWNvbmRzLCBmdW5jKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jLCBtaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuUmFua2luZ3NMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gUmFua2luZ3NMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzZWFzb24gc2VsZWN0ZWQgYmFzZWQgb24gZmlsdGVyXHJcbiAgICAgKi9cclxuICAgIGdldFNlYXNvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IEhvdHN0YXR1c0ZpbHRlci5nZXRTZWxlY3RvclZhbHVlcyhcInNlYXNvblwiKTtcclxuXHJcbiAgICAgICAgbGV0IHNlYXNvbiA9IFwiVW5rbm93blwiO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB2YWwgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWwgIT09IG51bGwgJiYgdmFsLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2Vhc29uID0gdmFsWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNlYXNvbjtcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVMb2FkOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgICAgIGxldCBzZWxmID0gUmFua2luZ3NMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBSYW5raW5nc0xvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gUmFua2luZ3NMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gUmFua2luZ3NMb2FkZXIuZGF0YTtcclxuICAgICAgICBkYXRhX3JhbmtzID0gZGF0YS5yYW5rcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjcmFua2luZ3Nsb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vTWFpbiBGaWx0ZXIgQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9yYW5rcyA9IGpzb24ucmFua3M7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfcmFua3MuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFJhbmtpbmdzbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBHZXQgUmFua2luZ3NcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fcmFua3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcmFua3MuZ2VuZXJhdGVDb250YWluZXIoanNvbi5saW1pdHMucmFua0xpbWl0LCBqc29uLmxpbWl0cy5tYXRjaExpbWl0LCBqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcmFua3MuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmFua3NUYWJsZSA9IGRhdGFfcmFua3MuZ2V0VGFibGVDb25maWcoanNvbi5saW1pdHMucmFua0xpbWl0LCBqc29uX3JhbmtzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmtzVGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJhbmsgb2YganNvbl9yYW5rcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5rc1RhYmxlLmRhdGEucHVzaChkYXRhX3JhbmtzLmdlbmVyYXRlVGFibGVEYXRhKHJhbmspKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfcmFua3MuaW5pdFRhYmxlKHJhbmtzVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblJhbmtpbmdzTG9hZGVyLmRhdGEgPSB7XHJcbiAgICByYW5rczoge1xyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3JhbmtpbmdzLWNvbnRhaW5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVDb250YWluZXI6IGZ1bmN0aW9uKHJhbmtMaW1pdCwgbWF0Y2hMaW1pdCwgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwicmFua2luZ3MtY29udGFpbmVyXCIgY2xhc3M9XCJyYW5raW5ncy1jb250YWluZXIgaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyYW5raW5ncy1oZWFkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmFua2luZ3MtaGVhZGVyLWxlZnRcIj5QbGF5ZXJzIHJlcXVpcmUgJysgbWF0Y2hMaW1pdCArJyBtYXRjaGVzIHBsYXllZCBpbiBvcmRlciB0byBxdWFsaWZ5IGZvciBUb3AgJysgcmFua0xpbWl0ICsnIHJhbmtpbmdzLjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyYW5raW5ncy1oZWFkZXItcmlnaHRcIj5MYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKycuPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNyYW5raW5ncy1taWRkbGVwYW5lJykuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICBsZXQgcmFuayA9IHJvdy5yYW5rO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBsYXllciA9ICc8YSBjbGFzcz1cInJhbmtpbmdzLXBsYXllcm5hbWVcIiBocmVmPVwiJyArIFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJcIiwge2lkOiByb3cucGxheWVyX2lkfSkgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Jysgcm93LnBsYXllcl9uYW1lICsnPC9hPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGxheWVkID0gcm93LnBsYXllZDtcclxuXHJcbiAgICAgICAgICAgIGxldCByYXRpbmcgPSByb3cucmF0aW5nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyYW5rLCBwbGF5ZXIsIHBsYXllZCwgcmF0aW5nXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMaW1pdCwgcm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJSYW5rXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllclwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXSwgXCJzZWFyY2hhYmxlXCI6IHRydWV9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUmF0aW5nXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IHJvd0xpbWl0O1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3JhbmtpbmdzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwicmFua2luZ3MtdGFibGVcIiBjbGFzcz1cInJhbmtpbmdzLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9ICQoJyNyYW5raW5ncy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICAgICAgICAgJCgnI3JhbmtpbmdzLXNlYXJjaCcpLm9uKFwicHJvcGVydHljaGFuZ2UgY2hhbmdlIGNsaWNrIGtleXVwIGlucHV0IHBhc3RlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGFibGUuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdwbGF5ZXJkYXRhX3BhZ2VkYXRhX3JhbmtpbmdzJyk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wicmVnaW9uXCIsIFwic2Vhc29uXCIsIFwiZ2FtZVR5cGVcIl07XHJcbiAgICBsZXQgZmlsdGVyQWpheCA9IFJhbmtpbmdzTG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9yYW5raW5ncy1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9