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
            data_herodata.generateImageCompositeContainer(json.last_updated);
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

                    var oldtalent = json_talents[rkey][ckey];

                    if (oldtalent.hasOwnProperty("name")) {
                        var talent = json_talents[rkey][ckey];

                        //Add talent to collapsed obj
                        talentsCollapsed[talent['name_internal']] = {
                            name: talent['name'],
                            desc_simple: talent['desc_simple'],
                            image: talent['image']
                        };

                        //Create datatable row
                        talents_datatable.data.push(data_talents.generateTableData(r, c, tier, talent['name'], talent['desc_simple'], talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_percentOnRange'], talent['winrate_display']));
                    } else {
                        for (var cinner = 0; cinner < json_talents[rkey][ckey].length; cinner++) {
                            var _talent = json_talents[rkey][ckey][cinner];

                            //Add talent to collapsed obj
                            talentsCollapsed[_talent['name_internal']] = {
                                name: _talent['name'],
                                desc_simple: _talent['desc_simple'],
                                image: _talent['image']
                            };

                            //Create datatable row
                            talents_datatable.data.push(data_talents.generateTableData(r, c, tier, _talent['name'], _talent['desc_simple'], _talent['image'], _talent['pickrate'], _talent['popularity'], _talent['winrate'], _talent['winrate_percentOnRange'], _talent['winrate_display']));
                        }
                    }
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
        generateImageCompositeContainer: function generateImageCompositeContainer(last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-html="true" title="<div class=\'lastupdated-text\'>Last Updated: ' + date + '.</div>"><div id="hl-herodata-image-hero-container"></div>' + '<span id="hl-herodata-name"></span></span>');
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

            var talentField = '<span data-toggle="tooltip" data-html="true" title="' + self.tooltip(name, desc) + '">' + '<span class="hl-no-wrap hl-row-height"><img class="hl-talents-talent-image" src="' + image_base_path + image + '.png">' + ' <span class="hl-talents-talent-name">' + name + '</span></span></span>';

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

            return '<span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="' + that.tooltip(name, desc) + '">' + '<span class="hl-no-wrap hl-row-height"><img class="hl-builds-talent-image" src="' + image_base_path + image + '.png">' + '</span></span>';
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
            return '<div class="hl-medals-line"><img class="hl-medals-image" src="' + image_base_path + medal.image_blue + '.png"></div>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDlkNDQ5MzY1ZGM3ZTYzYjk0ODciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJIZXJvTG9hZGVyIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiYWpheCIsImludGVybmFsIiwibG9hZGluZyIsIkhvdHN0YXR1c0ZpbHRlciIsInZhbGlkRmlsdGVycyIsInVybCIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGFTcmMiLCJzZWxmIiwiZGF0YSIsImRhdGFfaGVyb2RhdGEiLCJoZXJvZGF0YSIsImRhdGFfc3RhdHMiLCJzdGF0cyIsImRhdGFfdGFsZW50cyIsInRhbGVudHMiLCJkYXRhX2J1aWxkcyIsImJ1aWxkcyIsImRhdGFfbWVkYWxzIiwibWVkYWxzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwianNvbl9tZWRhbHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJwbGF5ZWQiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJnZW5lcmF0ZVRhYmxlIiwidGFsZW50c19kYXRhdGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInRhbGVudHNDb2xsYXBzZWQiLCJyIiwicmtleSIsInRpZXIiLCJjIiwiY2tleSIsIm9sZHRhbGVudCIsInRhbGVudCIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJjaW5uZXIiLCJsZW5ndGgiLCJpbml0VGFibGUiLCJidWlsZHNfZGF0YXRhYmxlIiwiT2JqZWN0Iiwia2V5cyIsImJrZXkiLCJidWlsZCIsInBpY2tyYXRlIiwicG9wdWxhcml0eSIsInBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGVfZGlzcGxheSIsImdlbmVyYXRlTWVkYWxzUGFuZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJwbGF5ZXJfbmFtZSIsInBsYXllcl90YWciLCJoZXJvIiwiUm91dGluZyIsImdlbmVyYXRlIiwiaWQiLCJwbGF5ZXJfaWQiLCJoZXJvUHJvcGVyTmFtZSIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJzaG93SW5pdGlhbENvbGxhcHNlIiwiY29sbGFwc2UiLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImFwcGVuZCIsInZhbCIsInRleHQiLCJpbWFnZV9iYXNlX3BhdGgiLCJyYXd2YWwiLCJrZXkiLCJhdmciLCJwbWluIiwiaHRtbCIsInJvd0lkIiwiZGVzYyIsIndpbnJhdGVEaXNwbGF5IiwidGFsZW50RmllbGQiLCJwaWNrcmF0ZUZpZWxkIiwicG9wdWxhcml0eUZpZWxkIiwid2lucmF0ZUZpZWxkIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwib3JkZXIiLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJkcmF3Q2FsbGJhY2siLCJzZXR0aW5ncyIsImFwaSIsInJvd3MiLCJwYWdlIiwibm9kZXMiLCJsYXN0IiwiY29sdW1uIiwiZWFjaCIsImdyb3VwIiwiaSIsImVxIiwiYmVmb3JlIiwiYnVpbGRUYWxlbnRzIiwidGFsZW50TmFtZUludGVybmFsIiwiZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlIiwidGhhdCIsInJvd0xlbmd0aCIsInBhZ2VMZW5ndGgiLCJtZWRhbFJvd3MiLCJtZWRhbCIsImdlbmVyYXRlTWVkYWxSb3ciLCJnZW5lcmF0ZU1lZGFsSW1hZ2UiLCJnZW5lcmF0ZU1lZGFsRW50cnkiLCJnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyIiwiaW1hZ2VfYmx1ZSIsInZhbHVlIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwicGxheWVyIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLFlBQVgsR0FBMEIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDckQsUUFBSSxDQUFDSCxXQUFXSSxJQUFY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QWxDLEVBQXdDN0ssV0FBeEM7QUFDQUgsZUFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQXNCLE1BQUUsd0JBQUYsRUFBNEJ3SixFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEM0ssd0JBQWdCeUssaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDN0ssV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FzQixNQUFFLEdBQUYsRUFBT3dKLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENuTCxtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdkJELEUiLCJmaWxlIjoicGxheWVyLWhlcm8tbG9hZGVyLjNjMTllY2VlOTViNWYzNWZmNzUwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwOWQ0NDkzNjVkYzdlNjNiOTQ4NyIsIi8qXHJcbiAqIFBsYXllciBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWVkYWxzID0gZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYnVpbGRzID0ganNvblsnYnVpbGRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tZWRhbHMgPSBqc29uWydtZWRhbHMnXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgaW1hZ2UgY29tcG9zaXRlIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5nZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyKGpzb24ubGFzdF91cGRhdGVkKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllciBIZXJvIExvYWRlciAtIFNwZWNpYWwgU3RhdCAtIFBsYXllZFxyXG4gICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wbGF5ZWQoanNvbl9zdGF0cy5wbGF5ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vT3RoZXIgc3RhdHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIFRhbGVudHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNfZGF0YXRhYmxlID0gZGF0YV90YWxlbnRzLmdldFRhYmxlQ29uZmlnKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIHRhbGVudHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbGxhcHNlZCBvYmplY3Qgb2YgYWxsIHRhbGVudHMgZm9yIGhlcm8sIGZvciB1c2Ugd2l0aCBkaXNwbGF5aW5nIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNDb2xsYXBzZWQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0YWxlbnQgdGFibGUgdG8gY29sbGVjdCB0YWxlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0ganNvbl90YWxlbnRzWydtaW5Sb3cnXTsgciA8PSBqc29uX3RhbGVudHNbJ21heFJvdyddOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmtleSA9IHIgKyAnJztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGllciA9IGpzb25fdGFsZW50c1tya2V5XVsndGllciddO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0J1aWxkIGNvbHVtbnMgZm9yIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSBqc29uX3RhbGVudHNbcmtleV1bJ21pbkNvbCddOyBjIDw9IGpzb25fdGFsZW50c1tya2V5XVsnbWF4Q29sJ107IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2tleSA9IGMgKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvbGR0YWxlbnQgPSBqc29uX3RhbGVudHNbcmtleV1bY2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkdGFsZW50Lmhhc093blByb3BlcnR5KFwibmFtZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0YWxlbnQgdG8gY29sbGFwc2VkIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY19zaW1wbGU6IHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY2lubmVyID0gMDsgY2lubmVyIDwganNvbl90YWxlbnRzW3JrZXldW2NrZXldLmxlbmd0aDsgY2lubmVyKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldW2Npbm5lcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhbGVudFsnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNZWRhbHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZ2VuZXJhdGVNZWRhbHNQYW5lKGpzb25fbWVkYWxzKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHIgKyBcIiAoXCIgKyBwbGF5ZXJfbmFtZSArXCIjXCIrIHBsYXllcl90YWcgKyBcIilcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge2lkOiBwbGF5ZXJfaWQsIGhlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93SW5pdGlhbENvbGxhcHNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2F2ZXJhZ2Vfc3RhdHMnKS5jb2xsYXBzZSgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiPGRpdiBjbGFzcz1cXCdsYXN0dXBkYXRlZC10ZXh0XFwnPkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJy48L2Rpdj5cIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PC9zcGFuPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVybzogZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyb1wiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIHBsYXllZDogZnVuY3Rpb24ocmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNwLWhsLXN0YXRzLXBsYXllZCcpLnRleHQocmF3dmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS5odG1sKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHIsIGMsIHRpZXIsIG5hbWUsIGRlc2MsIGltYWdlLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAnIDxzcGFuIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtbmFtZVwiPicgKyBuYW1lICsgJzwvc3Bhbj48L3NwYW4+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHkgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3IsIGMsIHRpZXIsIHRhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Sb3dcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfQ29sXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMCwgJ2FzYyddLCBbMSwgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXBpID0gdGhpcy5hcGkoKTtcclxuICAgICAgICAgICAgICAgIGxldCByb3dzID0gYXBpLnJvd3Moe3BhZ2U6ICdjdXJyZW50J30pLm5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgYXBpLmNvbHVtbigyLCB7cGFnZTogJ2N1cnJlbnQnfSkuZGF0YSgpLmVhY2goZnVuY3Rpb24gKGdyb3VwLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgIT09IGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQocm93cykuZXEoaSkuYmVmb3JlKCc8dHIgY2xhc3M9XCJncm91cCB0aWVyXCI+PHRkIGNvbHNwYW49XCI3XCI+JyArIGdyb3VwICsgJzwvdGQ+PC90cj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBncm91cDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtYnVpbGRzLXRhYmxlXCIgY2xhc3M9XCJob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbih0YWxlbnRzLCBidWlsZFRhbGVudHMsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5idWlsZHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFsZW50TmFtZUludGVybmFsIG9mIGJ1aWxkVGFsZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhbGVudHMuaGFzT3duUHJvcGVydHkodGFsZW50TmFtZUludGVybmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSB0YWxlbnRzW3RhbGVudE5hbWVJbnRlcm5hbF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUsIHRhbGVudC5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZTogZnVuY3Rpb24obmFtZSwgZGVzYywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRoYXQgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyB0aGF0LnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtYnVpbGRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnQgQnVpbGRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnWW91ciBidWlsZCBkYXRhIGlzIGN1cnJlbnRseSBsaW1pdGVkIGZvciB0aGlzIGhlcm8uIFBsYXkgYSBjb21wbGV0ZSBidWlsZCBtb3JlIHRoYW4gb25jZSB0byBzZWUgaXRzIHN0YXRpc3RpY3MuJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1sxLCAnZGVzYyddLFszLCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlX251bWJlcnNcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgbWVkYWxzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbHNQYW5lOiBmdW5jdGlvbiAobWVkYWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtZWRhbFJvd3MgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1lZGFsIG9mIG1lZGFscykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lZGFsUm93cyArPSBzZWxmLmdlbmVyYXRlTWVkYWxSb3cobWVkYWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj48ZGl2IGNsYXNzPVwiaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLXN0YXRzLXRpdGxlXCI+VG9wIE1lZGFsczwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wgcGFkZGluZy1ob3Jpem9udGFsLTBcIj4nICsgbWVkYWxSb3dzICsgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbFJvdzogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnXCI+PGRpdiBjbGFzcz1cInJvdyBobC1tZWRhbHMtcm93XCI+PGRpdiBjbGFzcz1cImNvbFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsSW1hZ2UobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wgaGwtbm8td3JhcFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeShtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXIobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEltYWdlOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxpbWcgY2xhc3M9XCJobC1tZWRhbHMtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgbWVkYWwuaW1hZ2VfYmx1ZSArICcucG5nXCI+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxFbnRyeTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48c3BhbiBjbGFzcz1cImhsLW1lZGFscy1uYW1lXCI+JyArIG1lZGFsLm5hbWUgKyAnPC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxkaXYgY2xhc3M9XCJobC1tZWRhbHMtcGVyY2VudGJhclwiIHN0eWxlPVwid2lkdGg6JyArIChtZWRhbC52YWx1ZSAqIDEwMCkgKyAnJVwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX2hlcm8nLCB7XHJcbiAgICAgICAgcGxheWVyOiBwbGF5ZXJfaWRcclxuICAgIH0pO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wic2Vhc29uXCIsIFwiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1Nob3cgaW5pdGlhbCBjb2xsYXBzZXNcclxuICAgIC8vSGVyb0xvYWRlci5kYXRhLndpbmRvdy5zaG93SW5pdGlhbENvbGxhcHNlKCk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=