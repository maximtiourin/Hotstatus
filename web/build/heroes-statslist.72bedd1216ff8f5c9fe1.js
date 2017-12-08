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
StatlistLoader.data = {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2I1MGM5ZGJhZWZhMmU4ODJjNzAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiU3RhdHNsaXN0TG9hZGVyIiwiYWpheCIsImZpbHRlciIsImludGVybmFsIiwibG9hZGluZyIsInVybCIsImRhdGFTcmMiLCJzZWxmIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YSIsImRhdGFfc3RhdHNsaXN0Iiwic3RhdHNsaXN0IiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9lcyIsImhlcm9lcyIsImVtcHR5IiwicmVtb3ZlQ2xhc3MiLCJsZW5ndGgiLCJnZW5lcmF0ZUNvbnRhaW5lciIsImxhc3RfdXBkYXRlZCIsImdlbmVyYXRlVGFibGUiLCJzdGF0c2xpc3RUYWJsZSIsImdldFRhYmxlQ29uZmlnIiwiaGVybyIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwiU3RhdGxpc3RMb2FkZXIiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImh0bWwiLCJhcHBlbmQiLCJoZXJvUG9ydHJhaXQiLCJpbWFnZV9icGF0aCIsImltYWdlX2hlcm8iLCJoZXJvUHJvcGVyTmFtZSIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsIm5hbWUiLCJoZXJvTmFtZVNvcnQiLCJuYW1lX3NvcnQiLCJoZXJvUm9sZUJsaXp6YXJkIiwicm9sZV9ibGl6emFyZCIsImhlcm9Sb2xlU3BlY2lmaWMiLCJyb2xlX3NwZWNpZmljIiwiaGVyb1BsYXllZCIsInBsYXllZCIsImhlcm9CYW5uZWQiLCJiYW5uZWQiLCJoZXJvUG9wdWxhcml0eSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnQiLCJoZXJvV2lucmF0ZSIsIndpbnJhdGVfZXhpc3RzIiwiY29sb3IiLCJ3aW5yYXRlX3JhdyIsIndpbnJhdGUiLCJ3aW5yYXRlX3BlcmNlbnQiLCJoZXJvV2luZGVsdGEiLCJ3aW5kZWx0YV9leGlzdHMiLCJ3aW5kZWx0YV9yYXciLCJ3aW5kZWx0YSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJvcmRlciIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZml4ZWRIZWFkZXIiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiZGF0YVRhYmxlQ29uZmlnIiwidGFibGUiLCJEYXRhVGFibGUiLCJvbiIsInNlYXJjaCIsInZhbCIsImRyYXciLCJjbGljayIsImF0dHIiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxlRXh0Iiwic0Vyck1vZGUiLCJmaWx0ZXJBamF4IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FB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QUFPc0YsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNhLENBQVQsRUFBWTtBQUN4Q0gsbUJBQVcxRyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjcyYmVkZDEyMTZmZjhmNWM5ZmUxLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgN2I1MGM5ZGJhZWZhMmU4ODJjNzAiLCIvKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5TdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFN0YXRzbGlzdExvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFN0YXRzbGlzdExvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3N0YXRzbGlzdCA9IGRhdGEuc3RhdHNsaXN0O1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzbGlzdCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIERhdGF0YWJsZSBTdGF0c2xpc3RcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5nZW5lcmF0ZUNvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRzbGlzdFRhYmxlID0gZGF0YV9zdGF0c2xpc3QuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YS5wdXNoKGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmluaXRUYWJsZShzdGF0c2xpc3RUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblN0YXRsaXN0TG9hZGVyLmRhdGEgPSB7XHJcbiAgICBzdGF0c2xpc3Q6IHtcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0JykucmVtb3ZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUNvbnRhaW5lcjogZnVuY3Rpb24obGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiaGVyb2VzLXN0YXRzbGlzdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdC1jb250YWluZXInKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgaGVyb1BvcnRyYWl0ID0gJzxpbWcgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyBoZXJvLmltYWdlX2hlcm8gKycucG5nXCIgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBoc2wtcG9ydHJhaXRcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Qcm9wZXJOYW1lID0gJzxhIGNsYXNzPVwiaHNsLWxpbmtcIiBocmVmPVwiJysgUm91dGluZy5nZW5lcmF0ZSgnaGVybycsIHtoZXJvUHJvcGVyTmFtZTogaGVyby5uYW1lfSkgKydcIj4nKyBoZXJvLm5hbWUgKyc8L2E+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvTmFtZVNvcnQgPSBoZXJvLm5hbWVfc29ydDtcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUm9sZUJsaXp6YXJkID0gaGVyby5yb2xlX2JsaXp6YXJkO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Sb2xlU3BlY2lmaWMgPSBoZXJvLnJvbGVfc3BlY2lmaWM7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1BsYXllZCA9IGhlcm8ucGxheWVkO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9CYW5uZWQgPSBoZXJvLmJhbm5lZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUG9wdWxhcml0eSA9ICc8c3BhbiBjbGFzcz1cImhzbC1udW1iZXItcG9wdWxhcml0eVwiPicrIGhlcm8ucG9wdWxhcml0eSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JysgaGVyby5wb3B1bGFyaXR5X3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvL1dpbnJhdGVcclxuICAgICAgICAgICAgbGV0IGhlcm9XaW5yYXRlID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBcImhzbC1udW1iZXItd2lucmF0ZS1yZWRcIjtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvLndpbnJhdGVfcmF3ID49IDUwLjApIGNvbG9yID0gXCJoc2wtbnVtYmVyLXdpbnJhdGUtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGhlcm9XaW5yYXRlID0gJzxzcGFuIGNsYXNzPVwiJyArIGNvbG9yICsgJ1wiPicrIGhlcm8ud2lucmF0ZSArJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ud2lucmF0ZV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1dpbmRlbHRhXHJcbiAgICAgICAgICAgIGxldCBoZXJvV2luZGVsdGEgPSAnJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ud2luZGVsdGFfZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBcImhzbC1udW1iZXItZGVsdGEtcmVkXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGVyby53aW5kZWx0YV9yYXcgPj0gMCkgY29sb3IgPSBcImhzbC1udW1iZXItZGVsdGEtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGhlcm9XaW5kZWx0YSA9ICc8c3BhbiBjbGFzcz1cIicrIGNvbG9yICsnXCI+JysgaGVyby53aW5kZWx0YSArJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2hlcm9Qb3J0cmFpdCwgaGVyb1Byb3Blck5hbWUsIGhlcm9OYW1lU29ydCwgaGVyb1JvbGVCbGl6emFyZCwgaGVyb1JvbGVTcGVjaWZpYywgaGVyb1BsYXllZCwgaGVyb0Jhbm5lZCwgaGVyb1BvcHVsYXJpdHksIGhlcm9XaW5yYXRlLCBoZXJvV2luZGVsdGFdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwiaHNsLXRhYmxlLXBvcnRyYWl0LXRkXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdHYW1lcyBQbGF5ZWQnLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgQmFubmVkJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1BvcHVsYXJpdHknLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnV2lucmF0ZScsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICclIM6UJywgXCJ3aWR0aFwiOiBcIjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX1cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbOCwgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDkgYXQgaW5kZXggOCBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnByb2Nlc3NpbmcgPSBmYWxzZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTsgLy9EZWZlcnMgcmVuZGVyaW5nIHRoZSB0YWJsZSB1bnRpbCBkYXRhIHN0YXJ0cyBjb21pbmcgaW5cclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmZpeGVkSGVhZGVyID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDUyNTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QnKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhzbC10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHBvcHVsYXRlZCBieSByb2xlIGJ1dHRvblxyXG4gICAgICAgICAgICAkKCdidXR0b24uaHNsLXJvbGVidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS5hdHRyKFwidmFsdWVcIikpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX2RhdGF0YWJsZV9oZXJvZXNfc3RhdHNsaXN0Jyk7XHJcblxyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIGxldCBmaWx0ZXJBamF4ID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgIC8vZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCk7XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmlsdGVyQWpheC52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==