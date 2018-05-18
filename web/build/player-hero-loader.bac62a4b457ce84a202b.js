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
            var url = Routing.generate("playerhero", { region: player_region, id: player_id, heroProperName: hero });
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
                    } else {
                        talentField += self.generateFieldTalentImage(talentNameInternal, "Talent no longer exists...", "storm_ui_icon_monk_trait1");
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
        region: player_region,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOGYzODUyMDYwNWFkODNiNTliZjIiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qcyJdLCJuYW1lcyI6WyJIZXJvTG9hZGVyIiwidmFsaWRhdGVMb2FkIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiYWpheCIsImludGVybmFsIiwibG9hZGluZyIsIkhvdHN0YXR1c0ZpbHRlciIsInZhbGlkRmlsdGVycyIsInVybCIsImdlbmVyYXRlVXJsIiwibG9hZCIsImRhdGFTcmMiLCJzZWxmIiwiZGF0YSIsImRhdGFfaGVyb2RhdGEiLCJoZXJvZGF0YSIsImRhdGFfc3RhdHMiLCJzdGF0cyIsImRhdGFfdGFsZW50cyIsInRhbGVudHMiLCJkYXRhX2J1aWxkcyIsImJ1aWxkcyIsImRhdGFfbWVkYWxzIiwibWVkYWxzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwianNvbl9tZWRhbHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJwbGF5ZWQiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJnZW5lcmF0ZVRhYmxlIiwidGFsZW50c19kYXRhdGFibGUiLCJnZXRUYWJsZUNvbmZpZyIsInRhbGVudHNDb2xsYXBzZWQiLCJyIiwicmtleSIsInRpZXIiLCJjIiwiY2tleSIsIm9sZHRhbGVudCIsInRhbGVudCIsImRlc2Nfc2ltcGxlIiwiaW1hZ2UiLCJwdXNoIiwiZ2VuZXJhdGVUYWJsZURhdGEiLCJjaW5uZXIiLCJsZW5ndGgiLCJpbml0VGFibGUiLCJidWlsZHNfZGF0YXRhYmxlIiwiT2JqZWN0Iiwia2V5cyIsImJrZXkiLCJidWlsZCIsInBpY2tyYXRlIiwicG9wdWxhcml0eSIsInBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlIiwid2lucmF0ZV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGVfZGlzcGxheSIsImdlbmVyYXRlTWVkYWxzUGFuZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJwbGF5ZXJfbmFtZSIsInBsYXllcl90YWciLCJoZXJvIiwiUm91dGluZyIsImdlbmVyYXRlIiwicmVnaW9uIiwicGxheWVyX3JlZ2lvbiIsImlkIiwicGxheWVyX2lkIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwic2hvd0luaXRpYWxDb2xsYXBzZSIsImNvbGxhcHNlIiwibGFzdF91cGRhdGVkX3RpbWVzdGFtcCIsImRhdGUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJhcHBlbmQiLCJ2YWwiLCJ0ZXh0IiwiaW1hZ2VfYmFzZV9wYXRoIiwicmF3dmFsIiwia2V5IiwiYXZnIiwicG1pbiIsImh0bWwiLCJyb3dJZCIsImRlc2MiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsImJ1aWxkVGFsZW50cyIsInRhbGVudE5hbWVJbnRlcm5hbCIsImdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSIsInRoYXQiLCJyb3dMZW5ndGgiLCJwYWdlTGVuZ3RoIiwibWVkYWxSb3dzIiwibWVkYWwiLCJnZW5lcmF0ZU1lZGFsUm93IiwiZ2VuZXJhdGVNZWRhbEltYWdlIiwiZ2VuZXJhdGVNZWRhbEVudHJ5IiwiZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhciIsImltYWdlX2JsdWUiLCJ2YWx1ZSIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsInBsYXllciIsInZhbGlkYXRlU2VsZWN0b3JzIiwib24iLCJldmVudCIsImUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTs7OztBQUlBLElBQUlBLGFBQWEsRUFBakI7O0FBRUE7OztBQUdBQSxXQUFXQyxZQUFYLEdBQTBCLFVBQVNDLE9BQVQsRUFBa0JDLFdBQWxCLEVBQStCO0FB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b0Q7QUFDOURDLGdCQUFRQyxhQURzRDtBQUU5RDZFLGdCQUFRM0U7QUFGc0QsS0FBcEQsQ0FBZDtBQUlBLFFBQUluRyxjQUFjLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsVUFBbkIsRUFBK0IsS0FBL0IsQ0FBbEI7QUFDQUksb0JBQWdCMkssaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDL0ssV0FBeEM7QUFDQUgsZUFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQXNCLE1BQUUsd0JBQUYsRUFBNEIwSixFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEN0ssd0JBQWdCMkssaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDL0ssV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0FzQixNQUFFLEdBQUYsRUFBTzBKLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENyTCxtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBeEJELEUiLCJmaWxlIjoicGxheWVyLWhlcm8tbG9hZGVyLmJhYzYyYTRiNDU3Y2U4NGEyMDJiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL3BsYXllci1oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA4ZjM4NTIwNjA1YWQ4M2I1OWJmMiIsIi8qXHJcbiAqIFBsYXllciBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWVkYWxzID0gZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYnVpbGRzID0ganNvblsnYnVpbGRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tZWRhbHMgPSBqc29uWydtZWRhbHMnXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgaW1hZ2UgY29tcG9zaXRlIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5nZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyKGpzb24ubGFzdF91cGRhdGVkKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1BsYXllciBIZXJvIExvYWRlciAtIFNwZWNpYWwgU3RhdCAtIFBsYXllZFxyXG4gICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wbGF5ZWQoanNvbl9zdGF0cy5wbGF5ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vT3RoZXIgc3RhdHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIFRhbGVudHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNfZGF0YXRhYmxlID0gZGF0YV90YWxlbnRzLmdldFRhYmxlQ29uZmlnKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIHRhbGVudHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbGxhcHNlZCBvYmplY3Qgb2YgYWxsIHRhbGVudHMgZm9yIGhlcm8sIGZvciB1c2Ugd2l0aCBkaXNwbGF5aW5nIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNDb2xsYXBzZWQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0YWxlbnQgdGFibGUgdG8gY29sbGVjdCB0YWxlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0ganNvbl90YWxlbnRzWydtaW5Sb3cnXTsgciA8PSBqc29uX3RhbGVudHNbJ21heFJvdyddOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmtleSA9IHIgKyAnJztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGllciA9IGpzb25fdGFsZW50c1tya2V5XVsndGllciddO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0J1aWxkIGNvbHVtbnMgZm9yIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSBqc29uX3RhbGVudHNbcmtleV1bJ21pbkNvbCddOyBjIDw9IGpzb25fdGFsZW50c1tya2V5XVsnbWF4Q29sJ107IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2tleSA9IGMgKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvbGR0YWxlbnQgPSBqc29uX3RhbGVudHNbcmtleV1bY2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkdGFsZW50Lmhhc093blByb3BlcnR5KFwibmFtZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0YWxlbnQgdG8gY29sbGFwc2VkIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY19zaW1wbGU6IHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY2lubmVyID0gMDsgY2lubmVyIDwganNvbl90YWxlbnRzW3JrZXldW2NrZXldLmxlbmd0aDsgY2lubmVyKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldW2Npbm5lcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhbGVudFsnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNZWRhbHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZ2VuZXJhdGVNZWRhbHNQYW5lKGpzb25fbWVkYWxzKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHIgKyBcIiAoXCIgKyBwbGF5ZXJfbmFtZSArXCIjXCIrIHBsYXllcl90YWcgKyBcIilcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcInBsYXllcmhlcm9cIiwge3JlZ2lvbjogcGxheWVyX3JlZ2lvbiwgaWQ6IHBsYXllcl9pZCwgaGVyb1Byb3Blck5hbWU6IGhlcm99KTtcclxuICAgICAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoaGVybywgaGVybywgdXJsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3dJbml0aWFsQ29sbGFwc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYXZlcmFnZV9zdGF0cycpLmNvbGxhcHNlKCdzaG93Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhlcm9kYXRhOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lcjogZnVuY3Rpb24obGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb21wb3NpdGUtY29udGFpbmVyJykuYXBwZW5kKCc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCI8ZGl2IGNsYXNzPVxcJ2xhc3R1cGRhdGVkLXRleHRcXCc+TGFzdCBVcGRhdGVkOiAnKyBkYXRlICsnLjwvZGl2PlwiPjxkaXYgaWQ9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbnRhaW5lclwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGlkPVwiaGwtaGVyb2RhdGEtbmFtZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvOiBmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXInKS5hcHBlbmQoJzxpbWcgY2xhc3M9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIGltYWdlICsgJy5wbmdcIj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgcGxheWVkOiBmdW5jdGlvbihyYXd2YWwpIHtcclxuICAgICAgICAgICAgJCgnI3AtaGwtc3RhdHMtcGxheWVkJykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0YWxlbnRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24ociwgYywgdGllciwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+JyArXHJcbiAgICAgICAgICAgICcgPHNwYW4gY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1uYW1lXCI+JyArIG5hbWUgKyAnPC9zcGFuPjwvc3Bhbj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbciwgYywgdGllciwgdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX1Jvd1wiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Db2xcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1swLCAnYXNjJ10sIFsxLCAnYXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcGkgPSB0aGlzLmFwaSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJvd3MgPSBhcGkucm93cyh7cGFnZTogJ2N1cnJlbnQnfSkubm9kZXMoKTtcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBhcGkuY29sdW1uKDIsIHtwYWdlOiAnY3VycmVudCd9KS5kYXRhKCkuZWFjaChmdW5jdGlvbiAoZ3JvdXAsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdCAhPT0gZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChyb3dzKS5lcShpKS5iZWZvcmUoJzx0ciBjbGFzcz1cImdyb3VwIHRpZXJcIj48dGQgY29sc3Bhbj1cIjdcIj4nICsgZ3JvdXAgKyAnPC90ZD48L3RyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IGdyb3VwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZHM6IHtcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy1idWlsZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHRhbGVudHMsIGJ1aWxkVGFsZW50cywgcGlja3JhdGUsIHBvcHVsYXJpdHksIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmJ1aWxkcztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YWxlbnROYW1lSW50ZXJuYWwgb2YgYnVpbGRUYWxlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFsZW50cy5oYXNPd25Qcm9wZXJ0eSh0YWxlbnROYW1lSW50ZXJuYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHRhbGVudHNbdGFsZW50TmFtZUludGVybmFsXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50RmllbGQgKz0gc2VsZi5nZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSwgdGFsZW50LmltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudE5hbWVJbnRlcm5hbCwgXCJUYWxlbnQgbm8gbG9uZ2VyIGV4aXN0cy4uLlwiLCBcInN0b3JtX3VpX2ljb25fbW9ua190cmFpdDFcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZTogZnVuY3Rpb24obmFtZSwgZGVzYywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRoYXQgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyB0aGF0LnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtYnVpbGRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnQgQnVpbGRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnWW91ciBidWlsZCBkYXRhIGlzIGN1cnJlbnRseSBsaW1pdGVkIGZvciB0aGlzIGhlcm8uIFBsYXkgYSBjb21wbGV0ZSBidWlsZCBtb3JlIHRoYW4gb25jZSB0byBzZWUgaXRzIHN0YXRpc3RpY3MuJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1sxLCAnZGVzYyddLFszLCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlX251bWJlcnNcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgbWVkYWxzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbHNQYW5lOiBmdW5jdGlvbiAobWVkYWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtZWRhbFJvd3MgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1lZGFsIG9mIG1lZGFscykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lZGFsUm93cyArPSBzZWxmLmdlbmVyYXRlTWVkYWxSb3cobWVkYWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj48ZGl2IGNsYXNzPVwiaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLXN0YXRzLXRpdGxlXCI+VG9wIE1lZGFsczwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wgcGFkZGluZy1ob3Jpem9udGFsLTBcIj4nICsgbWVkYWxSb3dzICsgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbFJvdzogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnXCI+PGRpdiBjbGFzcz1cInJvdyBobC1tZWRhbHMtcm93XCI+PGRpdiBjbGFzcz1cImNvbFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsSW1hZ2UobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wgaGwtbm8td3JhcFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeShtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXIobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEltYWdlOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxpbWcgY2xhc3M9XCJobC1tZWRhbHMtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgbWVkYWwuaW1hZ2VfYmx1ZSArICcucG5nXCI+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxFbnRyeTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48c3BhbiBjbGFzcz1cImhsLW1lZGFscy1uYW1lXCI+JyArIG1lZGFsLm5hbWUgKyAnPC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxkaXYgY2xhc3M9XCJobC1tZWRhbHMtcGVyY2VudGJhclwiIHN0eWxlPVwid2lkdGg6JyArIChtZWRhbC52YWx1ZSAqIDEwMCkgKyAnJVwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ3BsYXllcmRhdGFfcGFnZWRhdGFfcGxheWVyX2hlcm8nLCB7XHJcbiAgICAgICAgcmVnaW9uOiBwbGF5ZXJfcmVnaW9uLFxyXG4gICAgICAgIHBsYXllcjogcGxheWVyX2lkXHJcbiAgICB9KTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcInNlYXNvblwiLCBcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiXTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9TaG93IGluaXRpYWwgY29sbGFwc2VzXHJcbiAgICAvL0hlcm9Mb2FkZXIuZGF0YS53aW5kb3cuc2hvd0luaXRpYWxDb2xsYXBzZSgpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9wbGF5ZXItaGVyby1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9