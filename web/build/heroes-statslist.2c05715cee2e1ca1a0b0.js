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

            //Update last updated
            $('#statslist-lastupdated').html('<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="Last Updated: ' + date + '"><i class="fa fa-info-circle lastupdated-info" aria-hidden="true"></i></span>');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTkxNjI5NTA0YjA1NjQyMWNlYTkiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiU3RhdHNsaXN0TG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsImRhdGFfc3RhdHNsaXN0Iiwic3RhdHNsaXN0IiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9lcyIsImhlcm9lcyIsImVtcHR5IiwicmVtb3ZlQ2xhc3MiLCJsZW5ndGgiLCJnZW5lcmF0ZUNvbnRhaW5lciIsImxhc3RfdXBkYXRlZCIsImdlbmVyYXRlVGFibGUiLCJzdGF0c2xpc3RUYWJsZSIsImdldFRhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwibGFzdF91cGRhdGVkX3RpbWVzdGFtcCIsImRhdGUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJodG1sIiwiYXBwZW5kIiwiaGVyb1BvcnRyYWl0IiwiaW1hZ2VfYnBhdGgiLCJpbWFnZV9oZXJvIiwiaGVyb1Byb3Blck5hbWUiLCJSb3V0aW5nIiwiZ2VuZXJhdGUiLCJuYW1lIiwiaGVyb05hbWVTb3J0IiwibmFtZV9zb3J0IiwiaGVyb1JvbGVCbGl6emFyZCIsInJvbGVfYmxpenphcmQiLCJoZXJvUm9sZVNwZWNpZmljIiwicm9sZV9zcGVjaWZpYyIsImhlcm9QbGF5ZWQiLCJwbGF5ZWQiLCJoZXJvQmFubmVkIiwiYmFubmVkIiwiaGVyb1BvcHVsYXJpdHkiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50IiwiaGVyb1dpbnJhdGUiLCJ3aW5yYXRlX2V4aXN0cyIsImNvbG9yIiwid2lucmF0ZV9yYXciLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50IiwiaGVyb1dpbmRlbHRhIiwid2luZGVsdGFfZXhpc3RzIiwid2luZGVsdGFfcmF3Iiwid2luZGVsdGEiLCJkYXRhdGFibGUiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsImRlZmVyUmVuZGVyIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImZpeGVkSGVhZGVyIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImRhdGFUYWJsZUNvbmZpZyIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJ2YWwiLCJkcmF3IiwiY2xpY2siLCJhdHRyIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwiZmlsdGVyQWpheCIsInZhbGlkYXRlU2VsZWN0b3JzIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtB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LFFBQS9CLEVBQXlDLFVBQVNZLEtBQVQsRUFBZ0I7QUFDckR4Ryx3QkFBZ0J1RyxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N4RyxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQVEsTUFBRSxHQUFGLEVBQU9xRixFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU2EsQ0FBVCxFQUFZO0FBQ3hDSCxtQkFBV3pHLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQXRCRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuMmMwNTcxNWNlZTJlMWNhMWEwYjAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhOTE2Mjk1MDRiMDU2NDIxY2VhOSIsImxldCBTdGF0c2xpc3RMb2FkZXIgPSB7fTtcclxuXHJcblN0YXRzbGlzdExvYWRlci5hamF4ID0ge307XHJcblxyXG4vKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5TdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFN0YXRzbGlzdExvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFN0YXRzbGlzdExvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3N0YXRzbGlzdCA9IGRhdGEuc3RhdHNsaXN0O1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzbGlzdCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIERhdGF0YWJsZSBTdGF0c2xpc3RcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5nZW5lcmF0ZUNvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRzbGlzdFRhYmxlID0gZGF0YV9zdGF0c2xpc3QuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YS5wdXNoKGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmluaXRUYWJsZShzdGF0c2xpc3RUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblN0YXRzbGlzdExvYWRlci5kYXRhID0ge1xyXG4gICAgc3RhdHNsaXN0OiB7XHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdCcpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVDb250YWluZXI6IGZ1bmN0aW9uKGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cImhlcm9lcy1zdGF0c2xpc3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9VcGRhdGUgbGFzdCB1cGRhdGVkXHJcbiAgICAgICAgICAgICQoJyNzdGF0c2xpc3QtbGFzdHVwZGF0ZWQnKS5odG1sKCc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJ1wiPjxpIGNsYXNzPVwiZmEgZmEtaW5mby1jaXJjbGUgbGFzdHVwZGF0ZWQtaW5mb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgaGVyb1BvcnRyYWl0ID0gJzxpbWcgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyBoZXJvLmltYWdlX2hlcm8gKycucG5nXCIgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBoc2wtcG9ydHJhaXRcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Qcm9wZXJOYW1lID0gJzxhIGNsYXNzPVwiaHNsLWxpbmtcIiBocmVmPVwiJysgUm91dGluZy5nZW5lcmF0ZSgnaGVybycsIHtoZXJvUHJvcGVyTmFtZTogaGVyby5uYW1lfSkgKydcIj4nKyBoZXJvLm5hbWUgKyc8L2E+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvTmFtZVNvcnQgPSBoZXJvLm5hbWVfc29ydDtcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUm9sZUJsaXp6YXJkID0gaGVyby5yb2xlX2JsaXp6YXJkO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Sb2xlU3BlY2lmaWMgPSBoZXJvLnJvbGVfc3BlY2lmaWM7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1BsYXllZCA9IGhlcm8ucGxheWVkO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9CYW5uZWQgPSBoZXJvLmJhbm5lZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUG9wdWxhcml0eSA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8ucG9wdWxhcml0eSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby5wb3B1bGFyaXR5X3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGhlcm9XaW5yYXRlID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBcImhzbC1udW1iZXItd2lucmF0ZS1yZWRcIjtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUwLjApIGNvbG9yID0gXCJoc2wtbnVtYmVyLXdpbnJhdGUtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGhlcm9XaW5yYXRlID0gJzxzcGFuIGNsYXNzPVwiJyArIGNvbG9yICsgJ1wiPicrIGhlcm8ud2lucmF0ZSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ud2lucmF0ZV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1dpbmRlbHRhXHJcbiAgICAgICAgICAgIGxldCBoZXJvV2luZGVsdGEgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2luZGVsdGFfZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBcImhzbC1udW1iZXItZGVsdGEtcmVkXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGVyby53aW5kZWx0YV9yYXcgPj0gMCkgY29sb3IgPSBcImhzbC1udW1iZXItZGVsdGEtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGhlcm9XaW5kZWx0YSA9ICc8c3BhbiBjbGFzcz1cIicrIGNvbG9yICsnXCI+JysgaGVyby53aW5kZWx0YSArJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9Qb3J0cmFpdCwgaGVyb1Byb3Blck5hbWUsIGhlcm9OYW1lU29ydCwgaGVyb1JvbGVCbGl6emFyZCwgaGVyb1JvbGVTcGVjaWZpYywgaGVyb1BsYXllZCwgaGVyb0Jhbm5lZCwgaGVyb1BvcHVsYXJpdHksIGhlcm9XaW5yYXRlLCBoZXJvV2luZGVsdGFdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwiaHNsLXRhYmxlLXBvcnRyYWl0LXRkXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdHYW1lcyBQbGF5ZWQnLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgQmFubmVkJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1BvcHVsYXJpdHknLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnV2lucmF0ZScsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICclIM6UJywgXCJ3aWR0aFwiOiBcIjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX1cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbOCwgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDkgYXQgaW5kZXggOCBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnByb2Nlc3NpbmcgPSBmYWxzZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTsgLy9EZWZlcnMgcmVuZGVyaW5nIHRoZSB0YWJsZSB1bnRpbCBkYXRhIHN0YXJ0cyBjb21pbmcgaW5cclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmZpeGVkSGVhZGVyID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDUyNTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QnKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhzbC10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHBvcHVsYXRlZCBieSByb2xlIGJ1dHRvblxyXG4gICAgICAgICAgICAkKCdidXR0b24uaHNsLXJvbGVidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS5hdHRyKFwidmFsdWVcIikpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX2RhdGF0YWJsZV9oZXJvZXNfc3RhdHNsaXN0Jyk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==