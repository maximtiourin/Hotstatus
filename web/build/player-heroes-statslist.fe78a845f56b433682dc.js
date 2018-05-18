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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/player-heroes-statslist.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/player-heroes-statslist.js":
/*!**********************************************!*\
  !*** ./assets/js/player-heroes-statslist.js ***!
  \**********************************************/
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

            var heroProperName = '<a class="hsl-link" href="' + Routing.generate("playerhero", { region: player_region, id: player_id, heroProperName: hero.name }) + '">' + hero.name + '</a>';

            var heroNameSort = hero.name_sort;

            var heroRoleBlizzard = hero.role_blizzard;

            var heroRoleSpecific = hero.role_specific;

            var heroPlayed = hero.played;

            /*
             * KDA
             */
            //Good kda
            var goodkda = 'rm-sw-sp-kda-num';
            if (hero.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good';
            }
            if (hero.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great';
            }

            var heroKDA = '<span class="' + goodkda + '">' + hero.kda_avg + '</span>';

            //MVP Hero Percent
            var heroMVPHero = '<span class="hsl-number-mvp">' + hero.mvp_herorate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-mvp" style="width:' + hero.mvp_herorate_percent + '%;"></div>';

            //MVP Total Percent
            var heroMVP = '<span class="hsl-number-mvp">' + hero.mvp_rate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-mvp" style="width:' + hero.mvp_rate_percent + '%;"></div>';

            //Popularity
            var heroPopularity = '<span class="hsl-number-popularity">' + hero.popularity + '</span>' + '<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + hero.popularity_percent + '%;"></div>';

            //Winrate
            var heroWinrate = '';
            if (hero.winrate_exists) {
                var color = "hsl-number-winrate-red";
                if (hero.winrate_raw >= 50.0) color = "hsl-number-winrate-green";
                heroWinrate = '<span class="' + color + '">' + hero.winrate + '</span>' + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:' + hero.winrate_percent + '%;"></div>';
            }

            return [heroPortrait, heroProperName, heroNameSort, heroRoleBlizzard, heroRoleSpecific, heroPlayed, hero.kda_raw, heroKDA, heroMVPHero, heroMVP, heroPopularity, heroWinrate];
        },
        getTableConfig: function getTableConfig() {
            var datatable = {};

            datatable.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "15%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Games Played', "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'KDA_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'KDA', "width": "15%", "sClass": "sortIcon_Number", "iDataSort": 6, "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'MVP', "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'MVP Total', "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Popularity', "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Winrate', "width": "15%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

            datatable.order = [[10, 'desc']]; //The default ordering of the table on load => column 9 at index 8 descending
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
    var baseUrl = Routing.generate('playerdata_datatable_heroes_statslist', {
        region: player_region,
        player: player_id
    });

    var filterTypes = ["season", "gameType", "map"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTI1OTg2NGE4ZTg3OThlMmJmMTAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1oZXJvZXMtc3RhdHNsaXN0LmpzIl0sIm5hbWVzIjpbIlN0YXRzbGlzdExvYWRlciIsImFqYXgiLCJmaWx0ZXIiLCJpbnRlcm5hbCIsImxvYWRpbmciLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsInZhbGlkYXRlTG9hZCIsImJhc2VVcmwiLCJmaWx0ZXJUeXBlcyIsIkhvdHN0YXR1c0ZpbHRlciIsInZhbGlkRmlsdGVycyIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGEiLCJkYXRhX3N0YXRzbGlzdCIsInN0YXRzbGlzdCIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9oZXJvZXMiLCJoZXJvZXMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwibGVuZ3RoIiwiZ2VuZXJhdGVDb250YWluZXIiLCJsYXN0X3VwZGF0ZWQiLCJnZW5lcmF0ZVRhYmxlIiwic3RhdHNsaXN0VGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsImhlcm8iLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJpbml0VGFibGUiLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJkYXRlIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwiaHRtbCIsImFwcGVuZCIsImhlcm9Qb3J0cmFpdCIsImltYWdlX2JwYXRoIiwiaW1hZ2VfaGVybyIsImhlcm9Qcm9wZXJOYW1lIiwiUm91dGluZyIsImdlbmVyYXRlIiwicmVnaW9uIiwicGxheWVyX3JlZ2lvbiIsImlkIiwicGxheWVyX2lkIiwibmFtZSIsImhlcm9OYW1lU29ydCIsIm5hbWVfc29ydCIsImhlcm9Sb2xlQmxpenphcmQiLCJyb2xlX2JsaXp6YXJkIiwiaGVyb1JvbGVTcGVjaWZpYyIsInJvbGVfc3BlY2lmaWMiLCJoZXJvUGxheWVkIiwicGxheWVkIiwiZ29vZGtkYSIsImtkYV9yYXciLCJoZXJvS0RBIiwia2RhX2F2ZyIsImhlcm9NVlBIZXJvIiwibXZwX2hlcm9yYXRlIiwibXZwX2hlcm9yYXRlX3BlcmNlbnQiLCJoZXJvTVZQIiwibXZwX3JhdGUiLCJtdnBfcmF0ZV9wZXJjZW50IiwiaGVyb1BvcHVsYXJpdHkiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50IiwiaGVyb1dpbnJhdGUiLCJ3aW5yYXRlX2V4aXN0cyIsImNvbG9yIiwid2lucmF0ZV9yYXciLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50IiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJmaXhlZEhlYWRlciIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJkYXRhVGFibGVDb25maWciLCJ0YWJsZSIsIkRhdGFUYWJsZSIsIm9uIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsInBsYXllciIsImZpbHRlckFqYXgiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7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bGlzdC5mZTc4YTg0NWY1NmI0MzM2ODJkYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9wbGF5ZXItaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAxMjU5ODY0YThlODc5OGUyYmYxMCIsImxldCBTdGF0c2xpc3RMb2FkZXIgPSB7fTtcclxuXHJcblN0YXRzbGlzdExvYWRlci5hamF4ID0ge307XHJcblxyXG4vKlxyXG4gKiBUaGUgYWpheCBoYW5kbGVyIGZvciBoYW5kbGluZyBmaWx0ZXJzXHJcbiAqL1xyXG5TdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXIgPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlTG9hZDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IFN0YXRzbGlzdExvYWRlci5hamF4LmZpbHRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmwgIT09IHNlbGYudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgYWpheCA9IFN0YXRzbGlzdExvYWRlci5hamF4O1xyXG4gICAgICAgIGxldCBzZWxmID0gU3RhdHNsaXN0TG9hZGVyLmFqYXguZmlsdGVyO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFN0YXRzbGlzdExvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3N0YXRzbGlzdCA9IGRhdGEuc3RhdHNsaXN0O1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL01haW4gRmlsdGVyIEFqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2VzID0ganNvbi5oZXJvZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzLCByZXNldCBhbGwgc3ViYWpheCBvYmplY3RzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzbGlzdCBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIERhdGF0YWJsZSBTdGF0c2xpc3RcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25faGVyb2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzbGlzdC5nZW5lcmF0ZUNvbnRhaW5lcihqc29uLmxhc3RfdXBkYXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRzbGlzdFRhYmxlID0gZGF0YV9zdGF0c2xpc3QuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhlcm8gb2YganNvbl9oZXJvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHNsaXN0VGFibGUuZGF0YS5wdXNoKGRhdGFfc3RhdHNsaXN0LmdlbmVyYXRlVGFibGVEYXRhKGhlcm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHNsaXN0LmluaXRUYWJsZShzdGF0c2xpc3RUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcblN0YXRzbGlzdExvYWRlci5kYXRhID0ge1xyXG4gICAgc3RhdHNsaXN0OiB7XHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdCcpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVDb250YWluZXI6IGZ1bmN0aW9uKGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBpZD1cImhlcm9lcy1zdGF0c2xpc3RcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtY29udGFpbmVyJykuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgLy9VcGRhdGUgbGFzdCB1cGRhdGVkXHJcbiAgICAgICAgICAgICQoJyNzdGF0c2xpc3QtbGFzdHVwZGF0ZWQnKS5odG1sKCc8c3BhbiBzdHlsZT1cImN1cnNvcjpoZWxwO1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJ1wiPjxpIGNsYXNzPVwiZmEgZmEtaW5mby1jaXJjbGUgbGFzdHVwZGF0ZWQtaW5mb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgaGVyb1BvcnRyYWl0ID0gJzxpbWcgc3JjPVwiJysgaW1hZ2VfYnBhdGggKyBoZXJvLmltYWdlX2hlcm8gKycucG5nXCIgY2xhc3M9XCJyb3VuZGVkLWNpcmNsZSBoc2wtcG9ydHJhaXRcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Qcm9wZXJOYW1lID0gJzxhIGNsYXNzPVwiaHNsLWxpbmtcIiBocmVmPVwiJysgUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge3JlZ2lvbjogcGxheWVyX3JlZ2lvbiwgaWQ6IHBsYXllcl9pZCwgaGVyb1Byb3Blck5hbWU6IGhlcm8ubmFtZX0pICsnXCI+JysgaGVyby5uYW1lICsnPC9hPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb05hbWVTb3J0ID0gaGVyby5uYW1lX3NvcnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb1JvbGVCbGl6emFyZCA9IGhlcm8ucm9sZV9ibGl6emFyZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvUm9sZVNwZWNpZmljID0gaGVyby5yb2xlX3NwZWNpZmljO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9QbGF5ZWQgPSBoZXJvLnBsYXllZDtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEtEQVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLy9Hb29kIGtkYVxyXG4gICAgICAgICAgICBsZXQgZ29vZGtkYSA9ICdybS1zdy1zcC1rZGEtbnVtJztcclxuICAgICAgICAgICAgaWYgKGhlcm8ua2RhX3JhdyA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBnb29ka2RhID0gJ3JtLXN3LXNwLWtkYS1udW0tZ29vZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVyby5rZGFfcmF3ID49IDYpIHtcclxuICAgICAgICAgICAgICAgIGdvb2RrZGEgPSAncm0tc3ctc3Ata2RhLW51bS1ncmVhdCdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9LREEgPSAnPHNwYW4gY2xhc3M9XCInKyBnb29ka2RhICsnXCI+JyArIGhlcm8ua2RhX2F2ZyArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIC8vTVZQIEhlcm8gUGVyY2VudFxyXG4gICAgICAgICAgICBsZXQgaGVyb01WUEhlcm8gPSAnPHNwYW4gY2xhc3M9XCJoc2wtbnVtYmVyLW12cFwiPicrIGhlcm8ubXZwX2hlcm9yYXRlICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1tdnBcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ubXZwX2hlcm9yYXRlX3BlcmNlbnQgKyclO1wiPjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAvL01WUCBUb3RhbCBQZXJjZW50XHJcbiAgICAgICAgICAgIGxldCBoZXJvTVZQID0gJzxzcGFuIGNsYXNzPVwiaHNsLW51bWJlci1tdnBcIj4nKyBoZXJvLm12cF9yYXRlICsnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1tdnBcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ubXZwX3JhdGVfcGVyY2VudCArJyU7XCI+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIC8vUG9wdWxhcml0eVxyXG4gICAgICAgICAgICBsZXQgaGVyb1BvcHVsYXJpdHkgPSAnPHNwYW4gY2xhc3M9XCJoc2wtbnVtYmVyLXBvcHVsYXJpdHlcIj4nKyBoZXJvLnBvcHVsYXJpdHkgKyc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicrIGhlcm8ucG9wdWxhcml0eV9wZXJjZW50ICsnJTtcIj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgLy9XaW5yYXRlXHJcbiAgICAgICAgICAgIGxldCBoZXJvV2lucmF0ZSA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX2V4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9yID0gXCJoc2wtbnVtYmVyLXdpbnJhdGUtcmVkXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGVyby53aW5yYXRlX3JhdyA+PSA1MC4wKSBjb2xvciA9IFwiaHNsLW51bWJlci13aW5yYXRlLWdyZWVuXCI7XHJcbiAgICAgICAgICAgICAgICBoZXJvV2lucmF0ZSA9ICc8c3BhbiBjbGFzcz1cIicgKyBjb2xvciArICdcIj4nKyBoZXJvLndpbnJhdGUgKyc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyBoZXJvLndpbnJhdGVfcGVyY2VudCArJyU7XCI+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtoZXJvUG9ydHJhaXQsIGhlcm9Qcm9wZXJOYW1lLCBoZXJvTmFtZVNvcnQsIGhlcm9Sb2xlQmxpenphcmQsIGhlcm9Sb2xlU3BlY2lmaWMsIGhlcm9QbGF5ZWQsIGhlcm8ua2RhX3JhdywgaGVyb0tEQSwgaGVyb01WUEhlcm8sIGhlcm9NVlAsIGhlcm9Qb3B1bGFyaXR5LCBoZXJvV2lucmF0ZV07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1wid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJoc2wtdGFibGUtcG9ydHJhaXQtdGRcIiwgXCJiU29ydGFibGVcIjogZmFsc2UsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVybycsIFwid2lkdGhcIjogXCIxNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9UZXh0XCIsIFwiaURhdGFTb3J0XCI6IDIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LCAvL2lEYXRhU29ydCB0ZWxscyB3aGljaCBjb2x1bW4gc2hvdWxkIGJlIHVzZWQgYXMgdGhlIHNvcnQgdmFsdWUsIGluIHRoaXMgY2FzZSBIZXJvX1NvcnRcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0dhbWVzIFBsYXllZCcsIFwid2lkdGhcIjogXCIxNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdLREFfU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdLREEnLCBcIndpZHRoXCI6IFwiMTUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwiaURhdGFTb3J0XCI6IDYsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnTVZQJywgXCJ3aWR0aFwiOiBcIjE1JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ01WUCBUb3RhbCcsIFwid2lkdGhcIjogXCIxNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQb3B1bGFyaXR5JywgXCJ3aWR0aFwiOiBcIjE1JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1dpbnJhdGUnLCBcIndpZHRoXCI6IFwiMTUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzEwLCAnZGVzYyddXTsgLy9UaGUgZGVmYXVsdCBvcmRlcmluZyBvZiB0aGUgdGFibGUgb24gbG9hZCA9PiBjb2x1bW4gOSBhdCBpbmRleCA4IGRlc2NlbmRpbmdcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucHJvY2Vzc2luZyA9IGZhbHNlOyAvL0Rpc3BsYXlzIGFuIGluZGljYXRvciB3aGVuZXZlciB0aGUgdGFibGUgaXMgcHJvY2Vzc2luZyBkYXRhXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlOyAvL0RlZmVycyByZW5kZXJpbmcgdGhlIHRhYmxlIHVudGlsIGRhdGEgc3RhcnRzIGNvbWluZyBpblxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZml4ZWRIZWFkZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gNTI1O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdCcpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaHNsLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICBsZXQgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgdHlwZWQgaW4gYnkgdXNlclxyXG4gICAgICAgICAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdC10b29sYmFyLXNlYXJjaCcpLm9uKFwicHJvcGVydHljaGFuZ2UgY2hhbmdlIGNsaWNrIGtleXVwIGlucHV0IHBhc3RlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGFibGUuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgcG9wdWxhdGVkIGJ5IHJvbGUgYnV0dG9uXHJcbiAgICAgICAgICAgICQoJ2J1dHRvbi5oc2wtcm9sZWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgncGxheWVyZGF0YV9kYXRhdGFibGVfaGVyb2VzX3N0YXRzbGlzdCcsIHtcclxuICAgICAgICByZWdpb246IHBsYXllcl9yZWdpb24sXHJcbiAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImdhbWVUeXBlXCIsIFwibWFwXCJdO1xyXG4gICAgbGV0IGZpbHRlckFqYXggPSBTdGF0c2xpc3RMb2FkZXIuYWpheC5maWx0ZXI7XHJcblxyXG4gICAgLy9maWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsKTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaWx0ZXJBamF4LnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==