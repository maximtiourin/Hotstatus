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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/player-hero-loader.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/player-hero-loader.js":
/*!*****************************************!*\
  !*** ./assets/js/player-hero-loader.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/*
 * Player Hero Loader
 * Handles retrieving hero data through ajax requests based on state of filters
 */
var HeroLoader = {};

/*
 * Handles loading on valid filters, making sure to only fire once until loading is complete
 */
HeroLoader.validateLoad = function (baseUrl, filterTypes) {
    if (!HeroLoader.ajax.internal.loading && HotstatusFilter.validFilters) {
        var url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== HeroLoader.ajax.url()) {
            HeroLoader.ajax.url(url).load();
        }
    }
};

/*
 * Handles Ajax requests
 */
HeroLoader.ajax = {
    internal: {
        loading: false, //Whether or not the hero loader is currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data' //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function url() {
        var _url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        var self = HeroLoader.ajax;

        if (_url === null) {
            return self.internal.url;
        } else {
            self.internal.url = _url;
            return self;
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function load() {
        var self = HeroLoader.ajax;

        var data = HeroLoader.data;
        var data_herodata = data.herodata;
        var data_stats = data.stats;
        var data_talents = data.talents;
        var data_builds = data.builds;
        var data_medals = data.medals;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_herodata = json['herodata'];
            var json_stats = json['stats'];
            var json_talents = json['talents'];
            var json_builds = json['builds'];
            var json_medals = json['medals'];

            /*
             * Empty dynamically filled containers
             */
            data_herodata.empty();
            data_talents.empty();
            data_builds.empty();
            data_medals.empty();

            /*
             * Heroloader Container
             */
            $('.initial-load').removeClass('initial-load');

            /*
             * Window
             */
            data.window.title(json_herodata['name']);
            data.window.url(json_herodata['name']);

            /*
             * Herodata
             */
            //Create image composite container
            data_herodata.generateImageCompositeContainer();
            //image_hero
            data_herodata.image_hero(json_herodata['image_hero']);
            //name
            data_herodata.name(json_herodata['name']);

            /*
             * Stats
             */
            //Player Hero Loader - Special Stat - Played
            data_stats.played(json_stats.played);

            //Other stats
            for (var statkey in average_stats) {
                if (average_stats.hasOwnProperty(statkey)) {
                    var stat = average_stats[statkey];

                    if (stat.type === 'avg-pmin') {
                        data_stats.avg_pmin(statkey, json_stats[statkey]['average'], json_stats[statkey]['per_minute']);
                    } else if (stat.type === 'percentage') {
                        data_stats.percentage(statkey, json_stats[statkey]);
                    } else if (stat.type === 'kda') {
                        data_stats.kda(statkey, json_stats[statkey]['average']);
                    } else if (stat.type === 'raw') {
                        data_stats.raw(statkey, json_stats[statkey]);
                    } else if (stat.type === 'time-spent-dead') {
                        data_stats.time_spent_dead(statkey, json_stats[statkey]['average']);
                    }
                }
            }

            /*
             * Talents
             */
            //Define Talents DataTable and generate table structure
            data_talents.generateTable();

            var talents_datatable = data_talents.getTableConfig();

            //Initialize talents datatable data array
            talents_datatable.data = [];

            //Collapsed object of all talents for hero, for use with displaying builds
            var talentsCollapsed = {};

            //Loop through talent table to collect talents
            for (var r = json_talents['minRow']; r <= json_talents['maxRow']; r++) {
                var rkey = r + '';
                var tier = json_talents[rkey]['tier'];

                //Build columns for Datatable
                for (var c = json_talents[rkey]['minCol']; c <= json_talents[rkey]['maxCol']; c++) {
                    var ckey = c + '';

                    var talent = json_talents[rkey][ckey];

                    //Add talent to collapsed obj
                    talentsCollapsed[talent['name_internal']] = {
                        name: talent['name'],
                        desc_simple: talent['desc_simple'],
                        image: talent['image']
                    };

                    //Create datatable row
                    talents_datatable.data.push(data_talents.generateTableData(r, c, tier, talent['name'], talent['desc_simple'], talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_percentOnRange'], talent['winrate_display']));
                }
            }

            //Init Talents Datatable
            data_talents.initTable(talents_datatable);

            /*
             * Talent Builds
             */
            //Define Builds DataTable and generate table structure
            data_builds.generateTable();

            var builds_datatable = data_builds.getTableConfig(Object.keys(json_builds).length);

            //Initialize builds datatable data array
            builds_datatable.data = [];

            //Loop through builds
            for (var bkey in json_builds) {
                if (json_builds.hasOwnProperty(bkey)) {
                    var build = json_builds[bkey];

                    //Create datatable row
                    builds_datatable.data.push(data_builds.generateTableData(talentsCollapsed, build.talents, build.pickrate, build.popularity, build.popularity_percentOnRange, build.winrate, build.winrate_percentOnRange, build.winrate_display));
                }
            }

            //Init Builds DataTable
            data_builds.initTable(builds_datatable);

            /*
             * Medals
             */
            data_medals.generateMedalsPane(json_medals);

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
HeroLoader.data = {
    window: {
        title: function title(str) {
            document.title = "Hotstat.us: " + str + " (" + player_name + "#" + player_tag + ")";
        },
        url: function url(hero) {
            var url = Routing.generate("playerhero", { id: player_id, heroProperName: hero });
            history.replaceState(hero, hero, url);
        },
        showInitialCollapse: function showInitialCollapse() {
            $('#average_stats').collapse('show');
        }
    },
    herodata: {
        generateImageCompositeContainer: function generateImageCompositeContainer() {
            $('#hl-herodata-image-hero-composite-container').append('<div id="hl-herodata-image-hero-container"></div>' + '<span id="hl-herodata-name"></span>');
        },
        name: function name(val) {
            $('#hl-herodata-name').text(val);
        },
        image_hero: function image_hero(image) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero" src="' + image_base_path + image + '.png">');
        },
        empty: function empty() {
            $('#hl-herodata-image-hero-composite-container').empty();
        }
    },
    stats: {
        played: function played(rawval) {
            $('#p-hl-stats-played').text(rawval);
        },
        avg_pmin: function avg_pmin(key, avg, pmin) {
            $('#hl-stats-' + key + '-avg').text(avg);
            $('#hl-stats-' + key + '-pmin').text(pmin);
        },
        percentage: function percentage(key, _percentage) {
            $('#hl-stats-' + key + '-percentage').html(_percentage);
        },
        kda: function kda(key, _kda) {
            $('#hl-stats-' + key + '-kda').text(_kda);
        },
        raw: function raw(key, rawval) {
            $('#hl-stats-' + key + '-raw').text(rawval);
        },
        time_spent_dead: function time_spent_dead(key, _time_spent_dead) {
            $('#hl-stats-' + key + '-time-spent-dead').text(_time_spent_dead);
        }
    },
    talents: {
        generateTable: function generateTable(rowId) {
            $('#hl-talents-container').append('<table id="hl-talents-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function generateTableData(r, c, tier, name, desc, image, pickrate, popularity, winrate, winrate_percentOnRange, winrateDisplay) {
            var self = HeroLoader.data.talents;

            var talentField = '<span data-toggle="tooltip" data-html="true" title="' + self.tooltip(name, desc) + '">' + '<span class="hl-no-wrap hl-row-height"><img class="hl-talents-talent-image" src="' + image + '">' + ' <span class="hl-talents-talent-name">' + name + '</span></span></span>';

            var pickrateField = '<span class="hl-row-height">' + pickrate + '</span>';

            var popularityField = '<span class="hl-row-height">' + popularity + '%<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + popularity + '%;"></div></span>';

            var winrateField = '';
            if (winrate > 0) {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:' + winrate_percentOnRange + '%;"></div></span>';
            } else {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '</span>';
            }

            return [r, c, tier, talentField, pickrateField, popularityField, winrateField];
        },
        initTable: function initTable(dataTableConfig) {
            $('#hl-talents-table').DataTable(dataTableConfig);
        },
        getTableConfig: function getTableConfig() {
            var datatable = {};

            //Columns definition
            datatable.columns = [{ "title": "Tier_Row", "visible": false, "bSortable": false }, { "title": "Tier_Col", "visible": false, "bSortable": false }, { "title": "Tier", "visible": false, "bSortable": false }, { "title": "Talent", "width": "40%", "bSortable": false }, { "title": "Played", "width": "20%", "bSortable": false }, { "title": "Popularity", "width": "20%", "bSortable": false }, { "title": "Winrate", "width": "20%", "bSortable": false }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[0, 'asc'], [1, 'asc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.paging = false; //Controls whether or not the table is allowed to paginate data by page length
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function (settings) {
                var api = this.api();
                var rows = api.rows({ page: 'current' }).nodes();
                var last = null;

                api.column(2, { page: 'current' }).data().each(function (group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before('<tr class="group tier"><td colspan="7">' + group + '</td></tr>');

                        last = group;
                    }
                });
            };

            return datatable;
        },
        empty: function empty() {
            $('#hl-talents-container').empty();
        },
        tooltip: function tooltip(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    },
    builds: {
        generateTable: function generateTable() {
            $('#hl-talents-builds-container').append('<table id="hl-talents-builds-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function generateTableData(talents, buildTalents, pickrate, popularity, popularity_percentOnRange, winrate, winrate_percentOnRange, winrateDisplay) {
            var self = HeroLoader.data.builds;

            var talentField = '';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = buildTalents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var talentNameInternal = _step.value;

                    if (talents.hasOwnProperty(talentNameInternal)) {
                        var talent = talents[talentNameInternal];

                        talentField += self.generateFieldTalentImage(talent.name, talent.desc_simple, talent.image);
                    }
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

            var pickrateField = '<span class="hl-row-height">' + pickrate + '</span>';

            var popularityField = '<span class="hl-row-height">' + popularity + '%<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + popularity_percentOnRange + '%;"></div></span>';

            var winrateField = '';
            if (winrate > 0) {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:' + winrate_percentOnRange + '%;"></div></span>';
            } else {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '</span>';
            }

            return [talentField, pickrateField, popularityField, winrateField];
        },
        generateFieldTalentImage: function generateFieldTalentImage(name, desc, image) {
            var that = HeroLoader.data.talents;

            return '<span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="' + that.tooltip(name, desc) + '">' + '<span class="hl-no-wrap hl-row-height"><img class="hl-builds-talent-image" src="' + image + '">' + '</span></span>';
        },
        initTable: function initTable(dataTableConfig) {
            $('#hl-talents-builds-table').DataTable(dataTableConfig);
        },
        getTableConfig: function getTableConfig(rowLength) {
            var datatable = {};

            //Columns definition
            datatable.columns = [{ "title": "Talent Build", "width": "40%", "bSortable": false }, { "title": "Played", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'] }, { "title": "Popularity", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'] }, { "title": "Winrate", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc'] }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: 'Your build data is currently limited for this hero. Play a complete build more than once to see its statistics.' //Message when table is empty regardless of filtering
            };

            datatable.order = [[1, 'desc'], [3, 'desc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            //datatable.pagingType = "simple_numbers";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function () {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        empty: function empty() {
            $('#hl-talents-builds-container').empty();
        }
    },
    medals: {
        generateMedalsPane: function generateMedalsPane(medals) {
            if (medals.length > 0) {
                var self = HeroLoader.data.medals;

                var medalRows = '';
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = medals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var medal = _step2.value;

                        medalRows += self.generateMedalRow(medal);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                $('#hl-medals-container').append('<div class="row"><div class="col"><div class="hotstatus-subcontainer">' + '<span class="hl-stats-title">Top Medals</span>' + '<div class="row"><div class="col padding-horizontal-0">' + medalRows + '</div></div>' + '</div></div></div>');
            }
        },
        generateMedalRow: function generateMedalRow(medal) {
            var self = HeroLoader.data.medals;

            return '<span data-toggle="tooltip" data-html="true" title="' + medal.desc_simple + '"><div class="row hl-medals-row"><div class="col">' + '<div class="col">' + self.generateMedalImage(medal) + '</div>' + '<div class="col hl-no-wrap">' + self.generateMedalEntry(medal) + '</div>' + '<div class="col">' + self.generateMedalEntryPercentBar(medal) + '</div>' + '</div></div></span>';
        },
        generateMedalImage: function generateMedalImage(medal) {
            return '<div class="hl-medals-line"><img class="hl-medals-image" src="' + medal.image_blue + '"></div>';
        },
        generateMedalEntry: function generateMedalEntry(medal) {
            return '<div class="hl-medals-line"><span class="hl-medals-name">' + medal.name + '</span></div>';
        },
        generateMedalEntryPercentBar: function generateMedalEntryPercentBar(medal) {
            return '<div class="hl-medals-line"><div class="hl-medals-percentbar" style="width:' + medal.value * 100 + '%"></div></div>';
        },
        empty: function empty() {
            $('#hl-medals-container').empty();
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('playerdata_pagedata_player_hero', {
        player: player_id
    });
    var filterTypes = ["season", "hero", "gameType", "map"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Show initial collapses
    //HeroLoader.data.window.showInitialCollapse();

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function (e) {
        HeroLoader.validateLoad(baseUrl, filterTypes);
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWI4NTM1NmVmMGJhMGNmN2ZjYTEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJIZXJvTG9hZGVyIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiYWpheCIsImludGVybmFsIiwibG9hZGluZyIsIkhvdHN0YXR1c0ZpbHRlciIsInZhbGlkRmlsdGVycyIsInVybCIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGFTcmMiLCJzZWxmIiwiZGF0YSIsImRhdGFfaGVyb2RhdGEiLCJoZXJvZGF0YSIsImRhdGFfc3RhdHMiLCJzdGF0cyIsImRhdGFfdGFsZW50cyIsInRhbGVudHMiLCJkYXRhX2J1aWxkcyIsImJ1aWxkcyIsImRhdGFfbWVkYWxzIiwibWVkYWxzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwianNvbl9tZWRhbHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJwbGF5ZWQiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJnZW5lcmF0ZVRhYmxlIiwidGFsZW50c19kYXRhdGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInRhbGVudHNDb2xsYXBzZWQiLCJyIiwicmtleSIsInRpZXIiLCJjIiwiY2tleSIsInRhbGVudCIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJpbml0VGFibGUiLCJidWlsZHNfZGF0YXRhYmxlIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImJrZXkiLCJidWlsZCIsInBpY2tyYXRlIiwicG9wdWxhcml0eSIsInBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGVfZGlzcGxheSIsImdlbmVyYXRlTWVkYWxzUGFuZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJwbGF5ZXJfbmFtZSIsInBsYXllcl90YWciLCJoZXJvIiwiUm91dGluZyIsImdlbmVyYXRlIiwiaWQiLCJwbGF5ZXJfaWQiLCJoZXJvUHJvcGVyTmFtZSIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJzaG93SW5pdGlhbENvbGxhcHNlIiwiY29sbGFwc2UiLCJhcHBlbmQiLCJ2YWwiLCJ0ZXh0IiwiaW1hZ2VfYmFzZV9wYXRoIiwicmF3dmFsIiwia2V5IiwiYXZnIiwicG1pbiIsImh0bWwiLCJyb3dJZCIsImRlc2MiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsImJ1aWxkVGFsZW50cyIsInRhbGVudE5hbWVJbnRlcm5hbCIsImdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSIsInRoYXQiLCJyb3dMZW5ndGgiLCJwYWdlTGVuZ3RoIiwibWVkYWxSb3dzIiwibWVkYWwiLCJnZW5lcmF0ZU1lZGFsUm93IiwiZ2VuZXJhdGVNZWRhbEltYWdlIiwiZ2VuZXJhdGVNZWRhbEVudHJ5IiwiZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhciIsImltYWdlX2JsdWUiLCJ2YWx1ZSIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsInBsYXllciIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGFBQWEsRUFBakI7O0FBRUE7OztBQUdBQSxXQUFXQyxZQUFYLEdBQTBCLFVBQVNDLE9BQVQsRUFBa0JDLFdBQWxCLEVBQStCO0FBQ3JELFFBQUksQ0FBQ0gsV0FBV0ksSUFBWCxDQUFnQkMsUUFBaEIsQ0FBeUJDLE9BQTFCLElBQXFDQyxnQkFBZ0JDLFlBQXpELEVBQXVFO0FBQ25FLFlBQUlDLE1BQU1GLGdCQUFnQkcsV0FBaEIsQ0FBNEJSLE9BQTVCLEVBQXFDQyxXQUFyQyxDQUFWOztBQUVBLFlBQUlNLFFBQVFULFdBQVdJLElBQVgsQ0FBZ0JLLEdBQWhCLEVBQVosRUFBbUM7QUFDL0JULHVCQUFXSSxJQUFYLENBQWdCSyxHQUFoQixDQUFvQkEsR0FBcEIsRUFBeUJFLElBQXpCO0FBQ0g7QUFDSjtBQUNKLENBUkQ7O0FBVUE7OztBQUdBWCxXQUFXSSxJQUFYLEdBQWtCO0FBQ2RDLGNBQVU7QUFDTkMsaUJBQVMsS0FESCxFQUNVO0FBQ2hCRyxhQUFLLEVBRkMsRUFFRztBQUNURyxpQkFBUyxNQUhILENBR1c7QUFIWCxLQURJO0FBTWQ7Ozs7QUFJQUgsU0FBSyxlQUFxQjtBQUFBLFlBQVpBLElBQVksdUVBQU4sSUFBTTs7QUFDdEIsWUFBSUksT0FBT2IsV0FBV0ksSUFBdEI7O0FBRUEsWUFBSUssU0FBUSxJQUFaLEVBQWtCO0FBQ2QsbUJBQU9JLEtBQUtSLFFBQUwsQ0FBY0ksR0FBckI7QUFDSCxTQUZELE1BR0s7QUFDREksaUJBQUtSLFFBQUwsQ0FBY0ksR0FBZCxHQUFvQkEsSUFBcEI7QUFDQSxtQkFBT0ksSUFBUDtBQUNIO0FBQ0osS0FwQmE7QUFxQmQ7Ozs7QUFJQUYsVUFBTSxnQkFBVztBQUNiLFlBQUlFLE9BQU9iLFdBQVdJLElBQXRCOztBQUVBLFlBQUlVLE9BQU9kLFdBQVdjLElBQXRCO0FBQ0EsWUFBSUMsZ0JBQWdCRCxLQUFLRSxRQUF6QjtBQUNBLFlBQUlDLGFBQWFILEtBQUtJLEtBQXRCO0FBQ0EsWUFBSUMsZUFBZUwsS0FBS00sT0FBeEI7QUFDQSxZQUFJQyxjQUFjUCxLQUFLUSxNQUF2QjtBQUNBLFlBQUlDLGNBQWNULEtBQUtVLE1BQXZCOztBQUVBO0FBQ0FYLGFBQUtSLFFBQUwsQ0FBY0MsT0FBZCxHQUF3QixJQUF4Qjs7QUFFQW1CLFVBQUUsdUJBQUYsRUFBMkJDLE9BQTNCLENBQW1DLG1JQUFuQzs7QUFFQTtBQUNBRCxVQUFFRSxPQUFGLENBQVVkLEtBQUtSLFFBQUwsQ0FBY0ksR0FBeEIsRUFDS21CLElBREwsQ0FDVSxVQUFTQyxZQUFULEVBQXVCO0FBQ3pCLGdCQUFJQyxPQUFPRCxhQUFhaEIsS0FBS1IsUUFBTCxDQUFjTyxPQUEzQixDQUFYO0FBQ0EsZ0JBQUltQixnQkFBZ0JELEtBQUssVUFBTCxDQUFwQjtBQUNBLGdCQUFJRSxhQUFhRixLQUFLLE9BQUwsQ0FBakI7QUFDQSxnQkFBSUcsZUFBZUgsS0FBSyxTQUFMLENBQW5CO0FBQ0EsZ0JBQUlJLGNBQWNKLEtBQUssUUFBTCxDQUFsQjtBQUNBLGdCQUFJSyxjQUFjTCxLQUFLLFFBQUwsQ0FBbEI7O0FBRUE7OztBQUdBZiwwQkFBY3FCLEtBQWQ7QUFDQWpCLHlCQUFhaUIsS0FBYjtBQUNBZix3QkFBWWUsS0FBWjtBQUNBYix3QkFBWWEsS0FBWjs7QUFFQTs7O0FBR0FYLGNBQUUsZUFBRixFQUFtQlksV0FBbkIsQ0FBK0IsY0FBL0I7O0FBRUE7OztBQUdBdkIsaUJBQUt3QixNQUFMLENBQVlDLEtBQVosQ0FBa0JSLGNBQWMsTUFBZCxDQUFsQjtBQUNBakIsaUJBQUt3QixNQUFMLENBQVk3QixHQUFaLENBQWdCc0IsY0FBYyxNQUFkLENBQWhCOztBQUVBOzs7QUFHQTtBQUNBaEIsMEJBQWN5QiwrQkFBZDtBQUNBO0FBQ0F6QiwwQkFBYzBCLFVBQWQsQ0FBeUJWLGNBQWMsWUFBZCxDQUF6QjtBQUNBO0FBQ0FoQiwwQkFBYzJCLElBQWQsQ0FBbUJYLGNBQWMsTUFBZCxDQUFuQjs7QUFFQTs7O0FBR0E7QUFDQWQsdUJBQVcwQixNQUFYLENBQWtCWCxXQUFXVyxNQUE3Qjs7QUFFQTtBQUNBLGlCQUFLLElBQUlDLE9BQVQsSUFBb0JDLGFBQXBCLEVBQW1DO0FBQy9CLG9CQUFJQSxjQUFjQyxjQUFkLENBQTZCRixPQUE3QixDQUFKLEVBQTJDO0FBQ3ZDLHdCQUFJRyxPQUFPRixjQUFjRCxPQUFkLENBQVg7O0FBRUEsd0JBQUlHLEtBQUtDLElBQUwsS0FBYyxVQUFsQixFQUE4QjtBQUMxQi9CLG1DQUFXZ0MsUUFBWCxDQUFvQkwsT0FBcEIsRUFBNkJaLFdBQVdZLE9BQVgsRUFBb0IsU0FBcEIsQ0FBN0IsRUFBNkRaLFdBQVdZLE9BQVgsRUFBb0IsWUFBcEIsQ0FBN0Q7QUFDSCxxQkFGRCxNQUdLLElBQUlHLEtBQUtDLElBQUwsS0FBYyxZQUFsQixFQUFnQztBQUNqQy9CLG1DQUFXaUMsVUFBWCxDQUFzQk4sT0FBdEIsRUFBK0JaLFdBQVdZLE9BQVgsQ0FBL0I7QUFDSCxxQkFGSSxNQUdBLElBQUlHLEtBQUtDLElBQUwsS0FBYyxLQUFsQixFQUF5QjtBQUMxQi9CLG1DQUFXa0MsR0FBWCxDQUFlUCxPQUFmLEVBQXdCWixXQUFXWSxPQUFYLEVBQW9CLFNBQXBCLENBQXhCO0FBQ0gscUJBRkksTUFHQSxJQUFJRyxLQUFLQyxJQUFMLEtBQWMsS0FBbEIsRUFBeUI7QUFDMUIvQixtQ0FBV21DLEdBQVgsQ0FBZVIsT0FBZixFQUF3QlosV0FBV1ksT0FBWCxDQUF4QjtBQUNILHFCQUZJLE1BR0EsSUFBSUcsS0FBS0MsSUFBTCxLQUFjLGlCQUFsQixFQUFxQztBQUN0Qy9CLG1DQUFXb0MsZUFBWCxDQUEyQlQsT0FBM0IsRUFBb0NaLFdBQVdZLE9BQVgsRUFBb0IsU0FBcEIsQ0FBcEM7QUFDSDtBQUNKO0FBQ0o7O0FBRUQ7OztBQUdBO0FBQ0F6Qix5QkFBYW1DLGFBQWI7O0FBRUEsZ0JBQUlDLG9CQUFvQnBDLGFBQWFxQyxjQUFiLEVBQXhCOztBQUVBO0FBQ0FELDhCQUFrQnpDLElBQWxCLEdBQXlCLEVBQXpCOztBQUVBO0FBQ0EsZ0JBQUkyQyxtQkFBbUIsRUFBdkI7O0FBRUE7QUFDQSxpQkFBSyxJQUFJQyxJQUFJekIsYUFBYSxRQUFiLENBQWIsRUFBcUN5QixLQUFLekIsYUFBYSxRQUFiLENBQTFDLEVBQWtFeUIsR0FBbEUsRUFBdUU7QUFDbkUsb0JBQUlDLE9BQU9ELElBQUksRUFBZjtBQUNBLG9CQUFJRSxPQUFPM0IsYUFBYTBCLElBQWIsRUFBbUIsTUFBbkIsQ0FBWDs7QUFFQTtBQUNBLHFCQUFLLElBQUlFLElBQUk1QixhQUFhMEIsSUFBYixFQUFtQixRQUFuQixDQUFiLEVBQTJDRSxLQUFLNUIsYUFBYTBCLElBQWIsRUFBbUIsUUFBbkIsQ0FBaEQsRUFBOEVFLEdBQTlFLEVBQW1GO0FBQy9FLHdCQUFJQyxPQUFPRCxJQUFJLEVBQWY7O0FBRUEsd0JBQUlFLFNBQVM5QixhQUFhMEIsSUFBYixFQUFtQkcsSUFBbkIsQ0FBYjs7QUFFQTtBQUNBTCxxQ0FBaUJNLE9BQU8sZUFBUCxDQUFqQixJQUE0QztBQUN4Q3JCLDhCQUFNcUIsT0FBTyxNQUFQLENBRGtDO0FBRXhDQyxxQ0FBYUQsT0FBTyxhQUFQLENBRjJCO0FBR3hDRSwrQkFBT0YsT0FBTyxPQUFQO0FBSGlDLHFCQUE1Qzs7QUFNQTtBQUNBUixzQ0FBa0J6QyxJQUFsQixDQUF1Qm9ELElBQXZCLENBQTRCL0MsYUFBYWdELGlCQUFiLENBQStCVCxDQUEvQixFQUFrQ0csQ0FBbEMsRUFBcUNELElBQXJDLEVBQTJDRyxPQUFPLE1BQVAsQ0FBM0MsRUFBMkRBLE9BQU8sYUFBUCxDQUEzRCxFQUN4QkEsT0FBTyxPQUFQLENBRHdCLEVBQ1BBLE9BQU8sVUFBUCxDQURPLEVBQ2FBLE9BQU8sWUFBUCxDQURiLEVBQ21DQSxPQUFPLFNBQVAsQ0FEbkMsRUFDc0RBLE9BQU8sd0JBQVAsQ0FEdEQsRUFDd0ZBLE9BQU8saUJBQVAsQ0FEeEYsQ0FBNUI7QUFFSDtBQUNKOztBQUVEO0FBQ0E1Qyx5QkFBYWlELFNBQWIsQ0FBdUJiLGlCQUF2Qjs7QUFFQTs7O0FBR0E7QUFDQWxDLHdCQUFZaUMsYUFBWjs7QUFFQSxnQkFBSWUsbUJBQW1CaEQsWUFBWW1DLGNBQVosQ0FBMkJjLE9BQU9DLElBQVAsQ0FBWXJDLFdBQVosRUFBeUJzQyxNQUFwRCxDQUF2Qjs7QUFFQTtBQUNBSCw2QkFBaUJ2RCxJQUFqQixHQUF3QixFQUF4Qjs7QUFFQTtBQUNBLGlCQUFLLElBQUkyRCxJQUFULElBQWlCdkMsV0FBakIsRUFBOEI7QUFDMUIsb0JBQUlBLFlBQVlZLGNBQVosQ0FBMkIyQixJQUEzQixDQUFKLEVBQXNDO0FBQ2xDLHdCQUFJQyxRQUFReEMsWUFBWXVDLElBQVosQ0FBWjs7QUFFQTtBQUNBSixxQ0FBaUJ2RCxJQUFqQixDQUFzQm9ELElBQXRCLENBQTJCN0MsWUFBWThDLGlCQUFaLENBQThCVixnQkFBOUIsRUFBZ0RpQixNQUFNdEQsT0FBdEQsRUFBK0RzRCxNQUFNQyxRQUFyRSxFQUErRUQsTUFBTUUsVUFBckYsRUFDdkJGLE1BQU1HLHlCQURpQixFQUNVSCxNQUFNSSxPQURoQixFQUN5QkosTUFBTUssc0JBRC9CLEVBQ3VETCxNQUFNTSxlQUQ3RCxDQUEzQjtBQUVIO0FBQ0o7O0FBRUQ7QUFDQTNELHdCQUFZK0MsU0FBWixDQUFzQkMsZ0JBQXRCOztBQUVBOzs7QUFHQTlDLHdCQUFZMEQsa0JBQVosQ0FBK0I5QyxXQUEvQjs7QUFHQTtBQUNBVixjQUFFLHlCQUFGLEVBQTZCeUQsT0FBN0I7O0FBRUE7OztBQUdBQyxzQkFBVUMsV0FBVixDQUFzQkMsbUJBQXRCO0FBQ0gsU0FsSkwsRUFtSktDLElBbkpMLENBbUpVLFlBQVc7QUFDYjtBQUNILFNBckpMLEVBc0pLQyxNQXRKTCxDQXNKWSxZQUFXO0FBQ2Y7QUFDQTlELGNBQUUsd0JBQUYsRUFBNEIrRCxNQUE1Qjs7QUFFQTNFLGlCQUFLUixRQUFMLENBQWNDLE9BQWQsR0FBd0IsS0FBeEI7QUFDSCxTQTNKTDs7QUE2SkEsZUFBT08sSUFBUDtBQUNIO0FBdk1hLENBQWxCOztBQTBNQTs7O0FBR0FiLFdBQVdjLElBQVgsR0FBa0I7QUFDZHdCLFlBQVE7QUFDSkMsZUFBTyxlQUFTa0QsR0FBVCxFQUFjO0FBQ2pCQyxxQkFBU25ELEtBQVQsR0FBaUIsaUJBQWlCa0QsR0FBakIsR0FBdUIsSUFBdkIsR0FBOEJFLFdBQTlCLEdBQTJDLEdBQTNDLEdBQWdEQyxVQUFoRCxHQUE2RCxHQUE5RTtBQUNILFNBSEc7QUFJSm5GLGFBQUssYUFBU29GLElBQVQsRUFBZTtBQUNoQixnQkFBSXBGLE1BQU1xRixRQUFRQyxRQUFSLENBQWlCLFlBQWpCLEVBQStCLEVBQUNDLElBQUlDLFNBQUwsRUFBZ0JDLGdCQUFnQkwsSUFBaEMsRUFBL0IsQ0FBVjtBQUNBTSxvQkFBUUMsWUFBUixDQUFxQlAsSUFBckIsRUFBMkJBLElBQTNCLEVBQWlDcEYsR0FBakM7QUFDSCxTQVBHO0FBUUo0Riw2QkFBcUIsK0JBQVc7QUFDNUI1RSxjQUFFLGdCQUFGLEVBQW9CNkUsUUFBcEIsQ0FBNkIsTUFBN0I7QUFDSDtBQVZHLEtBRE07QUFhZHRGLGNBQVU7QUFDTndCLHlDQUFpQywyQ0FBVztBQUN4Q2YsY0FBRSw2Q0FBRixFQUFpRDhFLE1BQWpELENBQXdELHNEQUNwRCxxQ0FESjtBQUVILFNBSks7QUFLTjdELGNBQU0sY0FBUzhELEdBQVQsRUFBYztBQUNoQi9FLGNBQUUsbUJBQUYsRUFBdUJnRixJQUF2QixDQUE0QkQsR0FBNUI7QUFDSCxTQVBLO0FBUU4vRCxvQkFBWSxvQkFBU3dCLEtBQVQsRUFBZ0I7QUFDeEJ4QyxjQUFFLG1DQUFGLEVBQXVDOEUsTUFBdkMsQ0FBOEMsOENBQThDRyxlQUE5QyxHQUFnRXpDLEtBQWhFLEdBQXdFLFFBQXRIO0FBQ0gsU0FWSztBQVdON0IsZUFBTyxpQkFBVztBQUNkWCxjQUFFLDZDQUFGLEVBQWlEVyxLQUFqRDtBQUNIO0FBYkssS0FiSTtBQTRCZGxCLFdBQU87QUFDSHlCLGdCQUFRLGdCQUFTZ0UsTUFBVCxFQUFpQjtBQUNyQmxGLGNBQUUsb0JBQUYsRUFBd0JnRixJQUF4QixDQUE2QkUsTUFBN0I7QUFDSCxTQUhFO0FBSUgxRCxrQkFBVSxrQkFBUzJELEdBQVQsRUFBY0MsR0FBZCxFQUFtQkMsSUFBbkIsRUFBeUI7QUFDL0JyRixjQUFFLGVBQWVtRixHQUFmLEdBQXFCLE1BQXZCLEVBQStCSCxJQUEvQixDQUFvQ0ksR0FBcEM7QUFDQXBGLGNBQUUsZUFBZW1GLEdBQWYsR0FBcUIsT0FBdkIsRUFBZ0NILElBQWhDLENBQXFDSyxJQUFyQztBQUNILFNBUEU7QUFRSDVELG9CQUFZLG9CQUFTMEQsR0FBVCxFQUFjMUQsV0FBZCxFQUEwQjtBQUNsQ3pCLGNBQUUsZUFBZW1GLEdBQWYsR0FBcUIsYUFBdkIsRUFBc0NHLElBQXRDLENBQTJDN0QsV0FBM0M7QUFDSCxTQVZFO0FBV0hDLGFBQUssYUFBU3lELEdBQVQsRUFBY3pELElBQWQsRUFBbUI7QUFDcEIxQixjQUFFLGVBQWVtRixHQUFmLEdBQXFCLE1BQXZCLEVBQStCSCxJQUEvQixDQUFvQ3RELElBQXBDO0FBQ0gsU0FiRTtBQWNIQyxhQUFLLGFBQVN3RCxHQUFULEVBQWNELE1BQWQsRUFBc0I7QUFDdkJsRixjQUFFLGVBQWVtRixHQUFmLEdBQXFCLE1BQXZCLEVBQStCSCxJQUEvQixDQUFvQ0UsTUFBcEM7QUFDSCxTQWhCRTtBQWlCSHRELHlCQUFpQix5QkFBU3VELEdBQVQsRUFBY3ZELGdCQUFkLEVBQStCO0FBQzVDNUIsY0FBRSxlQUFlbUYsR0FBZixHQUFxQixrQkFBdkIsRUFBMkNILElBQTNDLENBQWdEcEQsZ0JBQWhEO0FBQ0g7QUFuQkUsS0E1Qk87QUFpRGRqQyxhQUFTO0FBQ0xrQyx1QkFBZSx1QkFBUzBELEtBQVQsRUFBZ0I7QUFDM0J2RixjQUFFLHVCQUFGLEVBQTJCOEUsTUFBM0IsQ0FBa0MsdUpBQWxDO0FBQ0gsU0FISTtBQUlMcEMsMkJBQW1CLDJCQUFTVCxDQUFULEVBQVlHLENBQVosRUFBZUQsSUFBZixFQUFxQmxCLElBQXJCLEVBQTJCdUUsSUFBM0IsRUFBaUNoRCxLQUFqQyxFQUF3Q1UsUUFBeEMsRUFBa0RDLFVBQWxELEVBQThERSxPQUE5RCxFQUF1RUMsc0JBQXZFLEVBQStGbUMsY0FBL0YsRUFBK0c7QUFDOUgsZ0JBQUlyRyxPQUFPYixXQUFXYyxJQUFYLENBQWdCTSxPQUEzQjs7QUFFQSxnQkFBSStGLGNBQWMseURBQXlEdEcsS0FBS3FFLE9BQUwsQ0FBYXhDLElBQWIsRUFBbUJ1RSxJQUFuQixDQUF6RCxHQUFvRixJQUFwRixHQUNsQixtRkFEa0IsR0FDb0VoRCxLQURwRSxHQUM0RSxJQUQ1RSxHQUVsQix3Q0FGa0IsR0FFeUJ2QixJQUZ6QixHQUVnQyx1QkFGbEQ7O0FBSUEsZ0JBQUkwRSxnQkFBZ0IsaUNBQWlDekMsUUFBakMsR0FBNEMsU0FBaEU7O0FBRUEsZ0JBQUkwQyxrQkFBa0IsaUNBQWlDekMsVUFBakMsR0FBOEMsc0VBQTlDLEdBQXVIQSxVQUF2SCxHQUFvSSxtQkFBMUo7O0FBRUEsZ0JBQUkwQyxlQUFlLEVBQW5CO0FBQ0EsZ0JBQUl4QyxVQUFVLENBQWQsRUFBaUI7QUFDYndDLCtCQUFlLGlDQUFpQ0osY0FBakMsR0FBa0Qsa0VBQWxELEdBQXNIbkMsc0JBQXRILEdBQStJLG1CQUE5SjtBQUNILGFBRkQsTUFHSztBQUNEdUMsK0JBQWUsaUNBQWlDSixjQUFqQyxHQUFrRCxTQUFqRTtBQUNIOztBQUVELG1CQUFPLENBQUN4RCxDQUFELEVBQUlHLENBQUosRUFBT0QsSUFBUCxFQUFhdUQsV0FBYixFQUEwQkMsYUFBMUIsRUFBeUNDLGVBQXpDLEVBQTBEQyxZQUExRCxDQUFQO0FBQ0gsU0F4Qkk7QUF5QkxsRCxtQkFBVyxtQkFBU21ELGVBQVQsRUFBMEI7QUFDakM5RixjQUFFLG1CQUFGLEVBQXVCK0YsU0FBdkIsQ0FBaUNELGVBQWpDO0FBQ0gsU0EzQkk7QUE0QkwvRCx3QkFBZ0IsMEJBQVc7QUFDdkIsZ0JBQUlpRSxZQUFZLEVBQWhCOztBQUVBO0FBQ0FBLHNCQUFVQyxPQUFWLEdBQW9CLENBQ2hCLEVBQUMsU0FBUyxVQUFWLEVBQXNCLFdBQVcsS0FBakMsRUFBd0MsYUFBYSxLQUFyRCxFQURnQixFQUVoQixFQUFDLFNBQVMsVUFBVixFQUFzQixXQUFXLEtBQWpDLEVBQXdDLGFBQWEsS0FBckQsRUFGZ0IsRUFHaEIsRUFBQyxTQUFTLE1BQVYsRUFBa0IsV0FBVyxLQUE3QixFQUFvQyxhQUFhLEtBQWpELEVBSGdCLEVBSWhCLEVBQUMsU0FBUyxRQUFWLEVBQW9CLFNBQVMsS0FBN0IsRUFBb0MsYUFBYSxLQUFqRCxFQUpnQixFQUtoQixFQUFDLFNBQVMsUUFBVixFQUFvQixTQUFTLEtBQTdCLEVBQW9DLGFBQWEsS0FBakQsRUFMZ0IsRUFNaEIsRUFBQyxTQUFTLFlBQVYsRUFBd0IsU0FBUyxLQUFqQyxFQUF3QyxhQUFhLEtBQXJELEVBTmdCLEVBT2hCLEVBQUMsU0FBUyxTQUFWLEVBQXFCLFNBQVMsS0FBOUIsRUFBcUMsYUFBYSxLQUFsRCxFQVBnQixDQUFwQjs7QUFVQUQsc0JBQVVFLFFBQVYsR0FBcUI7QUFDakJDLDRCQUFZLEVBREssRUFDRDtBQUNoQkMsZ0NBQWdCLEdBRkMsRUFFSTtBQUNyQkMsNkJBQWEsR0FISSxFQUdDO0FBQ2xCQyw0QkFBWSxHQUpLLENBSUQ7QUFKQyxhQUFyQjs7QUFPQU4sc0JBQVVPLEtBQVYsR0FBa0IsQ0FBQyxDQUFDLENBQUQsRUFBSSxLQUFKLENBQUQsRUFBYSxDQUFDLENBQUQsRUFBSSxLQUFKLENBQWIsQ0FBbEI7O0FBRUFQLHNCQUFVUSxTQUFWLEdBQXNCLEtBQXRCO0FBQ0FSLHNCQUFVUyxXQUFWLEdBQXdCLEtBQXhCO0FBQ0FULHNCQUFVVSxNQUFWLEdBQW1CLEtBQW5CLENBekJ1QixDQXlCRztBQUMxQlYsc0JBQVVXLFVBQVYsR0FBdUIsS0FBdkIsQ0ExQnVCLENBMEJPO0FBQzlCWCxzQkFBVVksT0FBVixHQUFvQixJQUFwQixDQTNCdUIsQ0EyQkc7QUFDMUJaLHNCQUFVYSxPQUFWLEdBQW9CLEtBQXBCLENBNUJ1QixDQTRCSTtBQUMzQmIsc0JBQVVjLEdBQVYsR0FBaUIsd0JBQWpCLENBN0J1QixDQTZCb0I7QUFDM0NkLHNCQUFVZSxJQUFWLEdBQWlCLEtBQWpCLENBOUJ1QixDQThCQzs7QUFFeEJmLHNCQUFVZ0IsWUFBVixHQUF5QixVQUFTQyxRQUFULEVBQW1CO0FBQ3hDLG9CQUFJQyxNQUFNLEtBQUtBLEdBQUwsRUFBVjtBQUNBLG9CQUFJQyxPQUFPRCxJQUFJQyxJQUFKLENBQVMsRUFBQ0MsTUFBTSxTQUFQLEVBQVQsRUFBNEJDLEtBQTVCLEVBQVg7QUFDQSxvQkFBSUMsT0FBTyxJQUFYOztBQUVBSixvQkFBSUssTUFBSixDQUFXLENBQVgsRUFBYyxFQUFDSCxNQUFNLFNBQVAsRUFBZCxFQUFpQy9ILElBQWpDLEdBQXdDbUksSUFBeEMsQ0FBNkMsVUFBVUMsS0FBVixFQUFpQkMsQ0FBakIsRUFBb0I7QUFDN0Qsd0JBQUlKLFNBQVNHLEtBQWIsRUFBb0I7QUFDaEJ6SCwwQkFBRW1ILElBQUYsRUFBUVEsRUFBUixDQUFXRCxDQUFYLEVBQWNFLE1BQWQsQ0FBcUIsNENBQTRDSCxLQUE1QyxHQUFvRCxZQUF6RTs7QUFFQUgsK0JBQU9HLEtBQVA7QUFDSDtBQUNKLGlCQU5EO0FBT0gsYUFaRDs7QUFjQSxtQkFBT3pCLFNBQVA7QUFDSCxTQTNFSTtBQTRFTHJGLGVBQU8saUJBQVc7QUFDZFgsY0FBRSx1QkFBRixFQUEyQlcsS0FBM0I7QUFDSCxTQTlFSTtBQStFTDhDLGlCQUFTLGlCQUFTeEMsSUFBVCxFQUFldUUsSUFBZixFQUFxQjtBQUMxQixtQkFBTyw2Q0FBNkN2RSxJQUE3QyxHQUFvRCxhQUFwRCxHQUFvRXVFLElBQTNFO0FBQ0g7QUFqRkksS0FqREs7QUFvSWQzRixZQUFRO0FBQ0pnQyx1QkFBZSx5QkFBVztBQUN0QjdCLGNBQUUsOEJBQUYsRUFBa0M4RSxNQUFsQyxDQUF5QyxvSkFBekM7QUFDSCxTQUhHO0FBSUpwQywyQkFBbUIsMkJBQVMvQyxPQUFULEVBQWtCa0ksWUFBbEIsRUFBZ0MzRSxRQUFoQyxFQUEwQ0MsVUFBMUMsRUFBc0RDLHlCQUF0RCxFQUFpRkMsT0FBakYsRUFBMEZDLHNCQUExRixFQUFrSG1DLGNBQWxILEVBQWtJO0FBQ2pKLGdCQUFJckcsT0FBT2IsV0FBV2MsSUFBWCxDQUFnQlEsTUFBM0I7O0FBRUEsZ0JBQUk2RixjQUFjLEVBQWxCO0FBSGlKO0FBQUE7QUFBQTs7QUFBQTtBQUlqSixxQ0FBK0JtQyxZQUEvQiw4SEFBNkM7QUFBQSx3QkFBcENDLGtCQUFvQzs7QUFDekMsd0JBQUluSSxRQUFRMEIsY0FBUixDQUF1QnlHLGtCQUF2QixDQUFKLEVBQWdEO0FBQzVDLDRCQUFJeEYsU0FBUzNDLFFBQVFtSSxrQkFBUixDQUFiOztBQUVBcEMsdUNBQWV0RyxLQUFLMkksd0JBQUwsQ0FBOEJ6RixPQUFPckIsSUFBckMsRUFBMkNxQixPQUFPQyxXQUFsRCxFQUErREQsT0FBT0UsS0FBdEUsQ0FBZjtBQUNIO0FBQ0o7QUFWZ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZakosZ0JBQUltRCxnQkFBZ0IsaUNBQWlDekMsUUFBakMsR0FBNEMsU0FBaEU7O0FBRUEsZ0JBQUkwQyxrQkFBa0IsaUNBQWlDekMsVUFBakMsR0FBOEMsc0VBQTlDLEdBQXVIQyx5QkFBdkgsR0FBbUosbUJBQXpLOztBQUVBLGdCQUFJeUMsZUFBZSxFQUFuQjtBQUNBLGdCQUFJeEMsVUFBVSxDQUFkLEVBQWlCO0FBQ2J3QywrQkFBZSxpQ0FBaUNKLGNBQWpDLEdBQWtELGtFQUFsRCxHQUFzSG5DLHNCQUF0SCxHQUErSSxtQkFBOUo7QUFDSCxhQUZELE1BR0s7QUFDRHVDLCtCQUFlLGlDQUFpQ0osY0FBakMsR0FBa0QsU0FBakU7QUFDSDs7QUFFRCxtQkFBTyxDQUFDQyxXQUFELEVBQWNDLGFBQWQsRUFBNkJDLGVBQTdCLEVBQThDQyxZQUE5QyxDQUFQO0FBQ0gsU0E3Qkc7QUE4QkprQyxrQ0FBMEIsa0NBQVM5RyxJQUFULEVBQWV1RSxJQUFmLEVBQXFCaEQsS0FBckIsRUFBNEI7QUFDbEQsZ0JBQUl3RixPQUFPekosV0FBV2MsSUFBWCxDQUFnQk0sT0FBM0I7O0FBRUEsbUJBQU8sbUZBQW1GcUksS0FBS3ZFLE9BQUwsQ0FBYXhDLElBQWIsRUFBbUJ1RSxJQUFuQixDQUFuRixHQUE4RyxJQUE5RyxHQUNILGtGQURHLEdBQ2tGaEQsS0FEbEYsR0FDMEYsSUFEMUYsR0FFSCxnQkFGSjtBQUdILFNBcENHO0FBcUNKRyxtQkFBVyxtQkFBU21ELGVBQVQsRUFBMEI7QUFDakM5RixjQUFFLDBCQUFGLEVBQThCK0YsU0FBOUIsQ0FBd0NELGVBQXhDO0FBQ0gsU0F2Q0c7QUF3Q0ovRCx3QkFBZ0Isd0JBQVNrRyxTQUFULEVBQW9CO0FBQ2hDLGdCQUFJakMsWUFBWSxFQUFoQjs7QUFFQTtBQUNBQSxzQkFBVUMsT0FBVixHQUFvQixDQUNoQixFQUFDLFNBQVMsY0FBVixFQUEwQixTQUFTLEtBQW5DLEVBQTBDLGFBQWEsS0FBdkQsRUFEZ0IsRUFFaEIsRUFBQyxTQUFTLFFBQVYsRUFBb0IsU0FBUyxLQUE3QixFQUFvQyxVQUFVLGlCQUE5QyxFQUFpRSxpQkFBaUIsQ0FBQyxNQUFELEVBQVMsS0FBVCxDQUFsRixFQUZnQixFQUdoQixFQUFDLFNBQVMsWUFBVixFQUF3QixTQUFTLEtBQWpDLEVBQXdDLFVBQVUsaUJBQWxELEVBQXFFLGlCQUFpQixDQUFDLE1BQUQsRUFBUyxLQUFULENBQXRGLEVBSGdCLEVBSWhCLEVBQUMsU0FBUyxTQUFWLEVBQXFCLFNBQVMsS0FBOUIsRUFBcUMsVUFBVSxpQkFBL0MsRUFBa0UsaUJBQWlCLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBbkYsRUFKZ0IsQ0FBcEI7O0FBT0FELHNCQUFVRSxRQUFWLEdBQXFCO0FBQ2pCQyw0QkFBWSxFQURLLEVBQ0Q7QUFDaEJDLGdDQUFnQixHQUZDLEVBRUk7QUFDckJDLDZCQUFhLEdBSEksRUFHQztBQUNsQkMsNEJBQVksaUhBSkssQ0FJNkc7QUFKN0csYUFBckI7O0FBT0FOLHNCQUFVTyxLQUFWLEdBQWtCLENBQUMsQ0FBQyxDQUFELEVBQUksTUFBSixDQUFELEVBQWEsQ0FBQyxDQUFELEVBQUksTUFBSixDQUFiLENBQWxCOztBQUVBUCxzQkFBVVEsU0FBVixHQUFzQixLQUF0QjtBQUNBUixzQkFBVVMsV0FBVixHQUF3QixLQUF4QjtBQUNBVCxzQkFBVWtDLFVBQVYsR0FBdUIsQ0FBdkIsQ0F0QmdDLENBc0JOO0FBQzFCbEMsc0JBQVVVLE1BQVYsR0FBb0J1QixZQUFZakMsVUFBVWtDLFVBQTFDLENBdkJnQyxDQXVCdUI7QUFDdkQ7QUFDQWxDLHNCQUFVVyxVQUFWLEdBQXVCLEtBQXZCLENBekJnQyxDQXlCRjtBQUM5Qlgsc0JBQVVZLE9BQVYsR0FBb0IsSUFBcEIsQ0ExQmdDLENBMEJOO0FBQzFCWixzQkFBVWEsT0FBVixHQUFvQixLQUFwQixDQTNCZ0MsQ0EyQkw7QUFDM0JiLHNCQUFVYyxHQUFWLEdBQWlCLHlCQUFqQixDQTVCZ0MsQ0E0Qlk7QUFDNUNkLHNCQUFVZSxJQUFWLEdBQWlCLEtBQWpCLENBN0JnQyxDQTZCUjs7QUFFeEJmLHNCQUFVZ0IsWUFBVixHQUF5QixZQUFXO0FBQ2hDaEgsa0JBQUUsMkNBQUYsRUFBK0N5RCxPQUEvQztBQUNILGFBRkQ7O0FBSUEsbUJBQU91QyxTQUFQO0FBQ0gsU0E1RUc7QUE2RUpyRixlQUFPLGlCQUFXO0FBQ2RYLGNBQUUsOEJBQUYsRUFBa0NXLEtBQWxDO0FBQ0g7QUEvRUcsS0FwSU07QUFxTmRaLFlBQVE7QUFDSnlELDRCQUFvQiw0QkFBVXpELE1BQVYsRUFBa0I7QUFDbEMsZ0JBQUlBLE9BQU9nRCxNQUFQLEdBQWdCLENBQXBCLEVBQXVCO0FBQ25CLG9CQUFJM0QsT0FBT2IsV0FBV2MsSUFBWCxDQUFnQlUsTUFBM0I7O0FBRUEsb0JBQUlvSSxZQUFZLEVBQWhCO0FBSG1CO0FBQUE7QUFBQTs7QUFBQTtBQUluQiwwQ0FBa0JwSSxNQUFsQixtSUFBMEI7QUFBQSw0QkFBakJxSSxLQUFpQjs7QUFDdEJELHFDQUFhL0ksS0FBS2lKLGdCQUFMLENBQXNCRCxLQUF0QixDQUFiO0FBQ0g7QUFOa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTbkJwSSxrQkFBRSxzQkFBRixFQUEwQjhFLE1BQTFCLENBQWlDLDJFQUM3QixnREFENkIsR0FFN0IseURBRjZCLEdBRStCcUQsU0FGL0IsR0FFMkMsY0FGM0MsR0FHN0Isb0JBSEo7QUFJSDtBQUNKLFNBaEJHO0FBaUJKRSwwQkFBa0IsMEJBQVNELEtBQVQsRUFBZ0I7QUFDOUIsZ0JBQUloSixPQUFPYixXQUFXYyxJQUFYLENBQWdCVSxNQUEzQjs7QUFFQSxtQkFBTyx5REFBeURxSSxNQUFNN0YsV0FBL0QsR0FBNkUsb0RBQTdFLEdBQ0gsbUJBREcsR0FDbUJuRCxLQUFLa0osa0JBQUwsQ0FBd0JGLEtBQXhCLENBRG5CLEdBQ29ELFFBRHBELEdBRUgsOEJBRkcsR0FFOEJoSixLQUFLbUosa0JBQUwsQ0FBd0JILEtBQXhCLENBRjlCLEdBRStELFFBRi9ELEdBR0gsbUJBSEcsR0FHbUJoSixLQUFLb0osNEJBQUwsQ0FBa0NKLEtBQWxDLENBSG5CLEdBRzhELFFBSDlELEdBSUgscUJBSko7QUFLSCxTQXpCRztBQTBCSkUsNEJBQW9CLDRCQUFTRixLQUFULEVBQWdCO0FBQ2hDLG1CQUFPLG1FQUFtRUEsTUFBTUssVUFBekUsR0FBc0YsVUFBN0Y7QUFDSCxTQTVCRztBQTZCSkYsNEJBQW9CLDRCQUFTSCxLQUFULEVBQWdCO0FBQ2hDLG1CQUFPLDhEQUE4REEsTUFBTW5ILElBQXBFLEdBQTJFLGVBQWxGO0FBQ0gsU0EvQkc7QUFnQ0p1SCxzQ0FBOEIsc0NBQVNKLEtBQVQsRUFBZ0I7QUFDMUMsbUJBQU8sZ0ZBQWlGQSxNQUFNTSxLQUFOLEdBQWMsR0FBL0YsR0FBc0csaUJBQTdHO0FBQ0gsU0FsQ0c7QUFtQ0ovSCxlQUFPLGlCQUFXO0FBQ2RYLGNBQUUsc0JBQUYsRUFBMEJXLEtBQTFCO0FBQ0g7QUFyQ0c7QUFyTk0sQ0FBbEI7O0FBK1BBWCxFQUFFaUUsUUFBRixFQUFZMEUsS0FBWixDQUFrQixZQUFXO0FBQ3pCM0ksTUFBRTRJLEVBQUYsQ0FBS0MsWUFBTCxDQUFrQkMsUUFBbEIsR0FBNkIsTUFBN0IsQ0FEeUIsQ0FDWTs7QUFFckM7QUFDQSxRQUFJckssVUFBVTRGLFFBQVFDLFFBQVIsQ0FBaUIsaUNBQWpCLEVBQW9EO0FBQzlEeUUsZ0JBQVF2RTtBQURzRCxLQUFwRCxDQUFkO0FBR0EsUUFBSTlGLGNBQWMsQ0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixVQUFuQixFQUErQixLQUEvQixDQUFsQjtBQUNBSSxvQkFBZ0JrSyxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0SyxXQUF4QztBQUNBSCxlQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQTs7QUFFQTtBQUNBc0IsTUFBRSx3QkFBRixFQUE0QmlKLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckRwSyx3QkFBZ0JrSyxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0N0SyxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQXNCLE1BQUUsR0FBRixFQUFPaUosRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4QzVLLG1CQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F2QkQsRSIsImZpbGUiOiJwbGF5ZXItaGVyby1sb2FkZXIuMjY5NDJhMDEyMTE1OGM2MzVmNzIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvcGxheWVyLWhlcm8tbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGFiODUzNTZlZjBiYTBjZjdmY2ExIiwiLypcclxuICogUGxheWVyIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKi9cclxuSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgaWYgKCFIZXJvTG9hZGVyLmFqYXguaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgaGVybyBsb2FkZXIgaXMgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX2hlcm9kYXRhID0gZGF0YS5oZXJvZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9zdGF0cyA9IGRhdGEuc3RhdHM7XHJcbiAgICAgICAgbGV0IGRhdGFfdGFsZW50cyA9IGRhdGEudGFsZW50cztcclxuICAgICAgICBsZXQgZGF0YV9idWlsZHMgPSBkYXRhLmJ1aWxkcztcclxuICAgICAgICBsZXQgZGF0YV9tZWRhbHMgPSBkYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjaGVyb2xvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9BamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9kYXRhID0ganNvblsnaGVyb2RhdGEnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRzID0ganNvblsnc3RhdHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3RhbGVudHMgPSBqc29uWyd0YWxlbnRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9idWlsZHMgPSBqc29uWydidWlsZHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21lZGFscyA9IGpzb25bJ21lZGFscyddO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21lZGFscy5lbXB0eSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBXaW5kb3dcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudGl0bGUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnVybChqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBpbWFnZSBjb21wb3NpdGUgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXIoKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllciBIZXJvIExvYWRlciAtIFNwZWNpYWwgU3RhdCAtIFBsYXllZFxyXG4gICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wbGF5ZWQoanNvbl9zdGF0cy5wbGF5ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vT3RoZXIgc3RhdHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIFRhbGVudHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNfZGF0YXRhYmxlID0gZGF0YV90YWxlbnRzLmdldFRhYmxlQ29uZmlnKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIHRhbGVudHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbGxhcHNlZCBvYmplY3Qgb2YgYWxsIHRhbGVudHMgZm9yIGhlcm8sIGZvciB1c2Ugd2l0aCBkaXNwbGF5aW5nIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNDb2xsYXBzZWQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0YWxlbnQgdGFibGUgdG8gY29sbGVjdCB0YWxlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0ganNvbl90YWxlbnRzWydtaW5Sb3cnXTsgciA8PSBqc29uX3RhbGVudHNbJ21heFJvdyddOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmtleSA9IHIgKyAnJztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGllciA9IGpzb25fdGFsZW50c1tya2V5XVsndGllciddO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0J1aWxkIGNvbHVtbnMgZm9yIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSBqc29uX3RhbGVudHNbcmtleV1bJ21pbkNvbCddOyBjIDw9IGpzb25fdGFsZW50c1tya2V5XVsnbWF4Q29sJ107IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2tleSA9IGMgKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBqc29uX3RhbGVudHNbcmtleV1bY2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0YWxlbnQgdG8gY29sbGFwc2VkIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzQ29sbGFwc2VkW3RhbGVudFsnbmFtZV9pbnRlcm5hbCddXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhbGVudFsnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY19zaW1wbGU6IHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiB0YWxlbnRbJ2ltYWdlJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRhYmxlRGF0YShyLCBjLCB0aWVyLCB0YWxlbnRbJ25hbWUnXSwgdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IFRhbGVudHMgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuaW5pdFRhYmxlKHRhbGVudHNfZGF0YXRhYmxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50IEJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBCdWlsZHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYnVpbGRzX2RhdGF0YWJsZSA9IGRhdGFfYnVpbGRzLmdldFRhYmxlQ29uZmlnKE9iamVjdC5rZXlzKGpzb25fYnVpbGRzKS5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIGJ1aWxkc19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmtleSBpbiBqc29uX2J1aWxkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX2J1aWxkcy5oYXNPd25Qcm9wZXJ0eShia2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnVpbGQgPSBqc29uX2J1aWxkc1tia2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZURhdGEodGFsZW50c0NvbGxhcHNlZCwgYnVpbGQudGFsZW50cywgYnVpbGQucGlja3JhdGUsIGJ1aWxkLnBvcHVsYXJpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZC5wb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCBidWlsZC53aW5yYXRlLCBidWlsZC53aW5yYXRlX3BlcmNlbnRPblJhbmdlLCBidWlsZC53aW5yYXRlX2Rpc3BsYXkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IEJ1aWxkcyBEYXRhVGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmluaXRUYWJsZShidWlsZHNfZGF0YXRhYmxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogTWVkYWxzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWVkYWxzLmdlbmVyYXRlTWVkYWxzUGFuZShqc29uX21lZGFscyk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcbkhlcm9Mb2FkZXIuZGF0YSA9IHtcclxuICAgIHdpbmRvdzoge1xyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBcIkhvdHN0YXQudXM6IFwiICsgc3RyICsgXCIgKFwiICsgcGxheWVyX25hbWUgK1wiI1wiKyBwbGF5ZXJfdGFnICsgXCIpXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJwbGF5ZXJoZXJvXCIsIHtpZDogcGxheWVyX2lkLCBoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0luaXRpYWxDb2xsYXBzZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNhdmVyYWdlX3N0YXRzJykuY29sbGFwc2UoJ3Nob3cnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGVyb2RhdGE6IHtcclxuICAgICAgICBnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gaWQ9XCJobC1oZXJvZGF0YS1uYW1lXCI+PC9zcGFuPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVybzogZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyb1wiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIHBsYXllZDogZnVuY3Rpb24ocmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNwLWhsLXN0YXRzLXBsYXllZCcpLnRleHQocmF3dmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS5odG1sKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHIsIGMsIHRpZXIsIG5hbWUsIGRlc2MsIGltYWdlLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2UgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICcgPHNwYW4gY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1uYW1lXCI+JyArIG5hbWUgKyAnPC9zcGFuPjwvc3Bhbj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbciwgYywgdGllciwgdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX1Jvd1wiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Db2xcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1swLCAnYXNjJ10sIFsxLCAnYXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcGkgPSB0aGlzLmFwaSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJvd3MgPSBhcGkucm93cyh7cGFnZTogJ2N1cnJlbnQnfSkubm9kZXMoKTtcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBhcGkuY29sdW1uKDIsIHtwYWdlOiAnY3VycmVudCd9KS5kYXRhKCkuZWFjaChmdW5jdGlvbiAoZ3JvdXAsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdCAhPT0gZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChyb3dzKS5lcShpKS5iZWZvcmUoJzx0ciBjbGFzcz1cImdyb3VwIHRpZXJcIj48dGQgY29sc3Bhbj1cIjdcIj4nICsgZ3JvdXAgKyAnPC90ZD48L3RyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IGdyb3VwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZHM6IHtcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy1idWlsZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHRhbGVudHMsIGJ1aWxkVGFsZW50cywgcGlja3JhdGUsIHBvcHVsYXJpdHksIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmJ1aWxkcztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YWxlbnROYW1lSW50ZXJuYWwgb2YgYnVpbGRUYWxlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFsZW50cy5oYXNPd25Qcm9wZXJ0eSh0YWxlbnROYW1lSW50ZXJuYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHRhbGVudHNbdGFsZW50TmFtZUludGVybmFsXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50RmllbGQgKz0gc2VsZi5nZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSwgdGFsZW50LmltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFt0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlOiBmdW5jdGlvbihuYW1lLCBkZXNjLCBpbWFnZSkge1xyXG4gICAgICAgICAgICBsZXQgdGhhdCA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHRoYXQudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC1idWlsZHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50IEJ1aWxkXCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJ1lvdXIgYnVpbGQgZGF0YSBpcyBjdXJyZW50bHkgbGltaXRlZCBmb3IgdGhpcyBoZXJvLiBQbGF5IGEgY29tcGxldGUgYnVpbGQgbW9yZSB0aGFuIG9uY2UgdG8gc2VlIGl0cyBzdGF0aXN0aWNzLicgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMSwgJ2Rlc2MnXSxbMywgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1lZGFsczoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxzUGFuZTogZnVuY3Rpb24gKG1lZGFscykge1xyXG4gICAgICAgICAgICBpZiAobWVkYWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWVkYWxSb3dzID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtZWRhbCBvZiBtZWRhbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZWRhbFJvd3MgKz0gc2VsZi5nZW5lcmF0ZU1lZGFsUm93KG1lZGFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgJCgnI2hsLW1lZGFscy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sXCI+PGRpdiBjbGFzcz1cImhvdHN0YXR1cy1zdWJjb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1zdGF0cy10aXRsZVwiPlRvcCBNZWRhbHM8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sIHBhZGRpbmctaG9yaXpvbnRhbC0wXCI+JyArIG1lZGFsUm93cyArICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxSb3c6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJ1wiPjxkaXYgY2xhc3M9XCJyb3cgaGwtbWVkYWxzLXJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEltYWdlKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sIGhsLW5vLXdyYXBcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnkobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxJbWFnZTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48aW1nIGNsYXNzPVwiaGwtbWVkYWxzLWltYWdlXCIgc3JjPVwiJyArIG1lZGFsLmltYWdlX2JsdWUgKyAnXCI+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxFbnRyeTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48c3BhbiBjbGFzcz1cImhsLW1lZGFscy1uYW1lXCI+JyArIG1lZGFsLm5hbWUgKyAnPC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxkaXYgY2xhc3M9XCJobC1tZWRhbHMtcGVyY2VudGJhclwiIHN0eWxlPVwid2lkdGg6JyArIChtZWRhbC52YWx1ZSAqIDEwMCkgKyAnJVwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX2hlcm8nLCB7XHJcbiAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgIH0pO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1Nob3cgaW5pdGlhbCBjb2xsYXBzZXNcclxuICAgIC8vSGVyb0xvYWRlci5kYXRhLndpbmRvdy5zaG93SW5pdGlhbENvbGxhcHNlKCk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=