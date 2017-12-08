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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/heroes-statslist.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/heroes-statslist.js":
/*!***************************************!*\
  !*** ./assets/js/heroes-statslist.js ***!
  \***************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var StatslistLoader = {};

StatslistLoader.ajax = {};

/*
 * The ajax handler for handling filters
 */
StatslistLoader.ajax.filter = {
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

        var self = StatslistLoader.ajax.filter;

        if (_url === null) {
            return self.internal.url;
        } else {
            self.internal.url = _url;
            return self;
        }
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function validateLoad(baseUrl, filterTypes) {
        var self = StatslistLoader.ajax.filter;

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
        var ajax = StatslistLoader.ajax;
        var self = StatslistLoader.ajax.filter;

        var data = StatslistLoader.data;
        var data_statslist = data.statslist;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroes-statslist-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_heroes = json.heroes;

            /*
             * Empty dynamically filled containers, reset all subajax objects
             */
            data_statslist.empty();

            /*
             * Statslist Container
             */
            $('.initial-load').removeClass('initial-load');

            /*
             * Datatable Statslist
             */
            if (json_heroes.length > 0) {
                data_statslist.generateContainer(json.last_updated);

                data_statslist.generateTable();

                var statslistTable = data_statslist.getTableConfig();

                statslistTable.data = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = json_heroes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var hero = _step.value;

                        statslistTable.data.push(data_statslist.generateTableData(hero));
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

                data_statslist.initTable(statslistTable);
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
StatslistLoader.data = {
    statslist: {
        empty: function empty() {
            $('#heroes-statslist').remove();
        },
        generateContainer: function generateContainer(last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            var html = '<div id="heroes-statslist">' + '</div>';

            $('#heroes-statslist-container').append(html);
        },
        generateTableData: function generateTableData(hero) {
            var heroPortrait = '<img src="' + image_bpath + hero.image_hero + '.png" class="rounded-circle hsl-portrait">';

            var heroProperName = '<a class="hsl-link" href="' + Routing.generate('hero', { heroProperName: hero.name }) + '">' + hero.name + '</a>';

            var heroNameSort = hero.name_sort;

            var heroRoleBlizzard = hero.role_blizzard;

            var heroRoleSpecific = hero.role_specific;

            var heroPlayed = hero.played;

            var heroBanned = hero.banned;

            var heroPopularity = '<span class="hsl-number-popularity">' + hero.popularity + '</span>' + '<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + hero.popularity_percent + '%;"></div>';

            //Winrate
            var heroWinrate = '';
            if (hero.winrate_exists) {
                var color = "hsl-number-winrate-red";
                if (hero.winrate_raw >= 50.0) color = "hsl-number-winrate-green";
                heroWinrate = '<span class="' + color + '">' + hero.winrate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:' + hero.winrate_percent + '%;"></div>';
            }

            //Windelta
            var heroWindelta = '';
            if (hero.windelta_exists) {
                var _color = "hsl-number-delta-red";
                if (hero.windelta_raw >= 0) _color = "hsl-number-delta-green";
                heroWindelta = '<span class="' + _color + '">' + hero.windelta + '</span>';
            }

            return [heroPortrait, heroProperName, heroNameSort, heroRoleBlizzard, heroRoleSpecific, heroPlayed, heroBanned, heroPopularity, heroWinrate, heroWindelta];
        },
        getTableConfig: function getTableConfig() {
            var datatable = {};

            datatable.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "17%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Games Played', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Games Banned', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Popularity', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Winrate', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

            datatable.order = [[8, 'desc']]; //The default ordering of the table on load => column 9 at index 8 descending
            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };
            datatable.processing = false; //Displays an indicator whenever the table is processing data
            datatable.deferRender = false; //Defers rendering the table until data starts coming in

            datatable.paging = false; //Controls whether or not the table is allowed to paginate data by page length
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.fixedHeader = document.documentElement.clientWidth >= 525;

            return datatable;
        },
        generateTable: function generateTable() {
            $('#heroes-statslist').append('<table id="hsl-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        initTable: function initTable(dataTableConfig) {
            var table = $('#hsl-table').DataTable(dataTableConfig);

            //Search the table for the new value typed in by user
            $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
                table.search($(this).val()).draw();
            });

            //Search the table for the new value populated by role button
            $('button.hsl-rolebutton').click(function () {
                table.search($(this).attr("value")).draw();
            });
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('herodata_datatable_heroes_statslist');

    var filterTypes = ["gameType", "map", "rank", "date"];
    var filterAjax = StatslistLoader.ajax.filter;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmNjMmUzNzRiNTY2M2IzMzk1MzYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiU3RhdHNsaXN0TG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsImRhdGFfc3RhdHNsaXN0Iiwic3RhdHNsaXN0IiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9lcyIsImhlcm9lcyIsImVtcHR5IiwicmVtb3ZlQ2xhc3MiLCJsZW5ndGgiLCJnZW5lcmF0ZUNvbnRhaW5lciIsImxhc3RfdXBkYXRlZCIsImdlbmVyYXRlVGFibGUiLCJzdGF0c2xpc3RUYWJsZSIsImdldFRhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwibGFzdF91cGRhdGVkX3RpbWVzdGFtcCIsImRhdGUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJodG1sIiwiYXBwZW5kIiwiaGVyb1BvcnRyYWl0IiwiaW1hZ2VfYnBhdGgiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJSb3V0aW5nIiwiZ2VuZXJhdGUiLCJuYW1lIiwiaGVyb05hbWVTb3J0IiwibmFtZV9zb3J0IiwiaGVyb1JvbGVCbGl6emFyZCIsInJvbGVfYmxpenphcmQiLCJoZXJvUm9sZVNwZWNpZmljIiwicm9sZV9zcGVjaWZpYyIsImhlcm9QbGF5ZWQiLCJwbGF5ZWQiLCJoZXJvQmFubmVkIiwiYmFubmVkIiwiaGVyb1BvcHVsYXJpdHkiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50IiwiaGVyb1dpbnJhdGUiLCJ3aW5yYXRlX2V4aXN0cyIsImNvbG9yIiwid2lucmF0ZV9yYXciLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50IiwiaGVyb1dpbmRlbHRhIiwid2luZGVsdGFfZXhpc3RzIiwid2luZGVsdGFfcmF3Iiwid2luZGVsdGEiLCJkYXRhdGFibGUiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsImRlZmVyUmVuZGVyIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImZpeGVkSGVhZGVyIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImRhdGFUYWJsZUNvbmZpZyIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJ2YWwiLCJkcmF3IiwiY2xpY2siLCJhdHRyIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtB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eEcsV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FRLE1BQUUsR0FBRixFQUFPcUYsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNhLENBQVQsRUFBWTtBQUN4Q0gsbUJBQVd6RyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjZiYmI0YWM3NzgxOGZiOTQxMWVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYmNjMmUzNzRiNTY2M2IzMzk1MzYiLCJsZXQgU3RhdHNsaXN0TG9hZGVyID0ge307XHJcblxyXG5TdGF0c2xpc3RMb2FkZXIuYWpheCA9IHt9O1xyXG5cclxuLypcclxuICogVGhlIGFqYXggaGFuZGxlciBmb3IgaGFuZGxpbmcgZmlsdGVyc1xyXG4gKi9cclxuU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZUxvYWQ6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBTdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBzZWxmLnVybCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGFqYXggPSBTdGF0c2xpc3RMb2FkZXIuYWpheDtcclxuICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBTdGF0c2xpc3RMb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9zdGF0c2xpc3QgPSBkYXRhLnN0YXRzbGlzdDtcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdC1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9NYWluIEZpbHRlciBBamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9lcyA9IGpzb24uaGVyb2VzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVycywgcmVzZXQgYWxsIHN1YmFqYXggb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c2xpc3QgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJy5pbml0aWFsLWxvYWQnKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBEYXRhdGFibGUgU3RhdHNsaXN0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX2hlcm9lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0c2xpc3QuZ2VuZXJhdGVDb250YWluZXIoanNvbi5sYXN0X3VwZGF0ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGF0c2xpc3RUYWJsZSA9IGRhdGFfc3RhdHNsaXN0LmdldFRhYmxlQ29uZmlnKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzbGlzdFRhYmxlLmRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBoZXJvIG9mIGpzb25faGVyb2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzbGlzdFRhYmxlLmRhdGEucHVzaChkYXRhX3N0YXRzbGlzdC5nZW5lcmF0ZVRhYmxlRGF0YShoZXJvKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5pbml0VGFibGUoc3RhdHNsaXN0VGFibGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5TdGF0c2xpc3RMb2FkZXIuZGF0YSA9IHtcclxuICAgIHN0YXRzbGlzdDoge1xyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QnKS5yZW1vdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlQ29udGFpbmVyOiBmdW5jdGlvbihsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCJoZXJvZXMtc3RhdHNsaXN0XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LWNvbnRhaW5lcicpLmFwcGVuZChodG1sKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvKSB7XHJcbiAgICAgICAgICAgIGxldCBoZXJvUG9ydHJhaXQgPSAnPGltZyBzcmM9XCInKyBpbWFnZV9icGF0aCArIGhlcm8uaW1hZ2VfaGVybyArJy5wbmdcIiBjbGFzcz1cInJvdW5kZWQtY2lyY2xlIGhzbC1wb3J0cmFpdFwiPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1Byb3Blck5hbWUgPSAnPGEgY2xhc3M9XCJoc2wtbGlua1wiIGhyZWY9XCInKyBSb3V0aW5nLmdlbmVyYXRlKCdoZXJvJywge2hlcm9Qcm9wZXJOYW1lOiBoZXJvLm5hbWV9KSArJ1wiPicrIGhlcm8ubmFtZSArJzwvYT4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9OYW1lU29ydCA9IGhlcm8ubmFtZV9zb3J0O1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Sb2xlQmxpenphcmQgPSBoZXJvLnJvbGVfYmxpenphcmQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1JvbGVTcGVjaWZpYyA9IGhlcm8ucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUGxheWVkID0gaGVyby5wbGF5ZWQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb0Jhbm5lZCA9IGhlcm8uYmFubmVkO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Qb3B1bGFyaXR5ID0gJzxzcGFuIGNsYXNzPVwiaHNsLW51bWJlci1wb3B1bGFyaXR5XCI+JysgaGVyby5wb3B1bGFyaXR5ICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonKyBoZXJvLnBvcHVsYXJpdHlfcGVyY2VudCArJyU7XCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8vV2lucmF0ZVxyXG4gICAgICAgICAgICBsZXQgaGVyb1dpbnJhdGUgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb2xvciA9IFwiaHNsLW51bWJlci13aW5yYXRlLXJlZFwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhlcm8ud2lucmF0ZV9yYXcgPj0gNTAuMCkgY29sb3IgPSBcImhzbC1udW1iZXItd2lucmF0ZS1ncmVlblwiO1xyXG4gICAgICAgICAgICAgICAgaGVyb1dpbnJhdGUgPSAnPHNwYW4gY2xhc3M9XCInICsgY29sb3IgKyAnXCI+JysgaGVyby53aW5yYXRlICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby53aW5yYXRlX3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vV2luZGVsdGFcclxuICAgICAgICAgICAgbGV0IGhlcm9XaW5kZWx0YSA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5kZWx0YV9leGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb2xvciA9IFwiaHNsLW51bWJlci1kZWx0YS1yZWRcIjtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvLndpbmRlbHRhX3JhdyA+PSAwKSBjb2xvciA9IFwiaHNsLW51bWJlci1kZWx0YS1ncmVlblwiO1xyXG4gICAgICAgICAgICAgICAgaGVyb1dpbmRlbHRhID0gJzxzcGFuIGNsYXNzPVwiJysgY29sb3IgKydcIj4nKyBoZXJvLndpbmRlbHRhICsnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbaGVyb1BvcnRyYWl0LCBoZXJvUHJvcGVyTmFtZSwgaGVyb05hbWVTb3J0LCBoZXJvUm9sZUJsaXp6YXJkLCBoZXJvUm9sZVNwZWNpZmljLCBoZXJvUGxheWVkLCBoZXJvQmFubmVkLCBoZXJvUG9wdWxhcml0eSwgaGVyb1dpbnJhdGUsIGhlcm9XaW5kZWx0YV07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1wid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJoc2wtdGFibGUtcG9ydHJhaXQtdGRcIiwgXCJiU29ydGFibGVcIjogZmFsc2UsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVybycsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9UZXh0XCIsIFwiaURhdGFTb3J0XCI6IDIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LCAvL2lEYXRhU29ydCB0ZWxscyB3aGljaCBjb2x1bW4gc2hvdWxkIGJlIHVzZWQgYXMgdGhlIHNvcnQgdmFsdWUsIGluIHRoaXMgY2FzZSBIZXJvX1NvcnRcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0dhbWVzIFBsYXllZCcsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdHYW1lcyBCYW5uZWQnLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUG9wdWxhcml0eScsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5yYXRlJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJyUgzpQnLCBcIndpZHRoXCI6IFwiNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfVxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1s4LCAnZGVzYyddXTsgLy9UaGUgZGVmYXVsdCBvcmRlcmluZyBvZiB0aGUgdGFibGUgb24gbG9hZCA9PiBjb2x1bW4gOSBhdCBpbmRleCA4IGRlc2NlbmRpbmdcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucHJvY2Vzc2luZyA9IGZhbHNlOyAvL0Rpc3BsYXlzIGFuIGluZGljYXRvciB3aGVuZXZlciB0aGUgdGFibGUgaXMgcHJvY2Vzc2luZyBkYXRhXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlOyAvL0RlZmVycyByZW5kZXJpbmcgdGhlIHRhYmxlIHVudGlsIGRhdGEgc3RhcnRzIGNvbWluZyBpblxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZml4ZWRIZWFkZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gNTI1O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdCcpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaHNsLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICBsZXQgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgdHlwZWQgaW4gYnkgdXNlclxyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdC10b29sYmFyLXNlYXJjaCcpLm9uKFwicHJvcGVydHljaGFuZ2UgY2hhbmdlIGNsaWNrIGtleXVwIGlucHV0IHBhc3RlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGFibGUuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgcG9wdWxhdGVkIGJ5IHJvbGUgYnV0dG9uXHJcbiAgICAgICAgICAgICQoJ2J1dHRvbi5oc2wtcm9sZWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfZGF0YXRhYmxlX2hlcm9lc19zdGF0c2xpc3QnKTtcclxuXHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBTdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgLy9maWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9