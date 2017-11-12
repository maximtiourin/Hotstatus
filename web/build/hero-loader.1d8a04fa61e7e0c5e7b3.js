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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/hero-loader.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/hero-loader.js":
/*!**********************************!*\
  !*** ./assets/js/hero-loader.js ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/*
 * Hero Loader
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
        var data_abilities = data.abilities;
        var data_talents = data.talents;
        var data_builds = data.builds;
        var data_graphs = data.graphs;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var json = jsonResponse[self.internal.dataSrc];
            var json_herodata = json['herodata'];
            var json_stats = json['stats'];
            var json_abilities = json['abilities'];
            var json_talents = json['talents'];
            var json_builds = json['builds'];
            var json_statMatrix = json['statMatrix'];

            /*
             * Empty dynamically filled containers
             */
            data_herodata.empty();
            data_abilities.empty();
            data_talents.empty();
            data_builds.empty();
            data_graphs.empty();

            /*
             * Heroloader Container
             */
            $('#heroloader-container').removeClass('initial-load');

            /*
             * Window
             */
            data.window.title(json_herodata['name']);
            data.window.url(json_herodata['name']);

            /*
             * Herodata
             */
            //Create image composite container
            data_herodata.generateImageCompositeContainer(json_herodata['universe'], json_herodata['difficulty'], json_herodata['role_blizzard'], json_herodata['role_specific'], json_herodata['desc_tagline'], json_herodata['desc_bio']);
            //image_hero
            data_herodata.image_hero(json_herodata['image_hero'], json_herodata['rarity']);
            //name
            data_herodata.name(json_herodata['name']);
            //title
            data_herodata.title(json_herodata['title']);

            /*
             * Stats
             */
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
             * Abilities
             */
            var abilityOrder = ["Normal", "Heroic", "Trait"];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = abilityOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var type = _step.value;

                    data_abilities.beginInner(type);
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = json_abilities[type][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var ability = _step2.value;

                            data_abilities.generate(type, ability['name'], ability['desc_simple'], ability['image']);
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
                }

                /*
                 * Talents
                 */
                //Define Talents DataTable and generate table structure
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
             * Graphs
             */
            //Stat Matrix
            data_graphs.generateStatMatrix(json_statMatrix);

            //Spacer
            data_graphs.generateSpacer();

            //Winrate over Match Length
            data_graphs.generateMatchLengthWinratesGraph(json_stats['range_match_length'], json_stats['winrate_raw']);

            //Spacer
            data_graphs.generateSpacer();

            //Winrate over Hero Level
            data_graphs.generateHeroLevelWinratesGraph(json_stats['range_hero_level'], json_stats['winrate_raw']);

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
            document.title = "Hotstat.us: " + str;
        },
        url: function url(hero) {
            var url = Routing.generate("hero", { heroProperName: hero });
            history.replaceState(hero, hero, url);
        }
    },
    herodata: {
        generateImageCompositeContainer: function generateImageCompositeContainer(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio) {
            var self = HeroLoader.data.herodata;

            var tooltipTemplate = '<div class=\'tooltip\' role=\'tooltip\'><div class=\'arrow\'></div>' + '<div class=\'herodata-bio tooltip-inner\'></div></div>';

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-template="' + tooltipTemplate + '" ' + 'data-html="true" title="' + self.image_hero_tooltip(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio) + '"><div id="hl-herodata-image-hero-container"></div>' + '<span id="hl-herodata-name"></span><span id="hl-herodata-title"></span></span>');
        },
        name: function name(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function title(val) {
            $('#hl-herodata-title').text(val);
        },
        image_hero: function image_hero(image, rarity) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero hl-herodata-rarity-' + rarity + '" src="' + image + '">');
        },
        image_hero_tooltip: function image_hero_tooltip(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio) {
            return '<span class=\'hl-herodata-tooltip-universe\'>[' + universe + ']</span><br>' + '<span class=\'hl-herodata-tooltip-role\'>' + roleBlizzard + ' - ' + roleSpecific + '</span><br>' + '<span class=\'hl-herodata-tooltip-difficulty\'>(Difficulty: ' + difficulty + ')</span><br>' + '<span class=\'hl-talents-tooltip-name\'>' + tagline + '</span><br>' + bio;
        },
        empty: function empty() {
            $('#hl-herodata-image-hero-composite-container').empty();
        }
    },
    stats: {
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
    abilities: {
        beginInner: function beginInner(type) {
            $('#hl-abilities-container').append('<div id="hl-abilities-inner-' + type + '" class="hl-abilities-inner"></div>');
        },
        generate: function generate(type, name, desc, imagepath) {
            var self = HeroLoader.data.abilities;
            $('#hl-abilities-inner-' + type).append('<div class="hl-abilities-ability"><span data-toggle="tooltip" data-html="true" title="' + self.tooltip(type, name, desc) + '">' + '<img class="hl-abilities-ability-image" src="' + imagepath + '"><img class="hl-abilities-ability-image-frame" src="' + image_base_path + 'ui/ability_icon_frame.png">' + '</span></div>');
        },
        empty: function empty() {
            $('#hl-abilities-container').empty();
        },
        tooltip: function tooltip(type, name, desc) {
            if (type === "Heroic" || type === "Trait") {
                return '<span class=\'hl-abilities-tooltip-' + type + '\'>[' + type + ']</span><br><span class=\'hl-abilities-tooltip-name\'>' + name + '</span><br>' + desc;
            } else {
                return '<span class=\'hl-abilities-tooltip-name\'>' + name + '</span><br>' + desc;
            }
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
        generateTable: function generateTable(rowId) {
            $('#hl-talents-builds-container').append('<table id="hl-talents-builds-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function generateTableData(talents, buildTalents, pickrate, popularity, popularity_percentOnRange, winrate, winrate_percentOnRange, winrateDisplay) {
            var self = HeroLoader.data.builds;

            var talentField = '';
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = buildTalents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var talentNameInternal = _step3.value;

                    if (talents.hasOwnProperty(talentNameInternal)) {
                        var talent = talents[talentNameInternal];

                        talentField += self.generateFieldTalentImage(talent.name, talent.desc_simple, talent.image);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
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
                emptyTable: 'Build Data is currently limited for this Hero. Increase date range or wait for more data.' //Message when table is empty regardless of filtering
            };

            datatable.order = [[1, 'desc']];

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
    graphs: {
        internal: {
            charts: [],
            collapse: {
                init: false,
                enabled: false
            }
        },
        resize: function resize() {
            var self = HeroLoader.data.graphs;
            var widthBreakpoint = 992;

            if (!self.internal.collapse.init) {
                if (document.documentElement.clientWidth >= widthBreakpoint) {
                    $('#hl-graphs-collapse').removeClass('collapse');
                    self.internal.collapse.enabled = false;
                    self.internal.collapse.init = true;
                } else {
                    $('#hl-graphs-collapse').addClass('collapse');
                    self.internal.collapse.enabled = true;
                    self.internal.collapse.init = true;
                }
            } else {
                if (self.internal.collapse.enabled && document.documentElement.clientWidth >= widthBreakpoint) {
                    $('#hl-graphs-collapse').removeClass('collapse');
                    self.internal.collapse.enabled = false;
                } else if (!self.internal.collapse.enabled && document.documentElement.clientWidth < widthBreakpoint) {
                    $('#hl-graphs-collapse').addClass('collapse');
                    self.internal.collapse.enabled = true;
                }
            }
        },
        generateSpacer: function generateSpacer() {
            $('#hl-graphs').append('<div class="hl-graph-spacer"></div>');
        },
        generateMatchLengthWinratesGraph: function generateMatchLengthWinratesGraph(winrates, avgWinrate) {
            var self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-matchlength-winrate">' + '<div class="hl-graph-chart-container" style="position: relative; height:200px">' + '<canvas id="hl-graph-matchlength-winrate-chart"></canvas></div></div>');

            //Create chart
            var cwinrates = [];
            var cavgwinrate = [];
            for (var wkey in winrates) {
                if (winrates.hasOwnProperty(wkey)) {
                    var winrate = winrates[wkey];
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            var data = {
                labels: Object.keys(winrates),
                datasets: [{
                    label: "Base Winrate",
                    data: cavgwinrate,
                    borderColor: "#28c2ff",
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: false
                }, {
                    label: "Match Length Winrate",
                    data: cwinrates,
                    backgroundColor: "rgba(34, 125, 37, 1)", //#227d25
                    borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                    borderWidth: 2,
                    pointRadius: 2
                }]
            };

            var options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Winrate",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            callback: function callback(value, index, values) {
                                return value + '%';
                            },
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Match Length (Minutes)",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            autoSkip: false,
                            labelOffset: 10,
                            minRotation: 30,
                            maxRotation: 30,
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }]
                }
            };

            var chart = new Chart($('#hl-graph-matchlength-winrate-chart'), {
                type: 'line',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        generateHeroLevelWinratesGraph: function generateHeroLevelWinratesGraph(winrates, avgWinrate) {
            var self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-herolevel-winrate">' + '<div class="hl-graph-chart-container" style="position: relative; height:200px">' + '<canvas id="hl-graph-herolevel-winrate-chart"></canvas></div></div>');

            //Create chart
            var cwinrates = [];
            var cavgwinrate = [];
            for (var wkey in winrates) {
                if (winrates.hasOwnProperty(wkey)) {
                    var winrate = winrates[wkey];
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            var data = {
                labels: Object.keys(winrates),
                datasets: [{
                    label: "Base Winrate",
                    data: cavgwinrate,
                    borderColor: "#28c2ff",
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: false
                }, {
                    label: "Hero Level Winrate",
                    data: cwinrates,
                    backgroundColor: "rgba(34, 125, 37, 1)", //#227d25
                    borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                    borderWidth: 2,
                    pointRadius: 2
                }]
            };

            var options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Winrate",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            callback: function callback(value, index, values) {
                                return value + '%';
                            },
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Hero Level",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            autoSkip: false,
                            labelOffset: 10,
                            minRotation: 30,
                            maxRotation: 30,
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }]
                }
            };

            var chart = new Chart($('#hl-graph-herolevel-winrate-chart'), {
                type: 'line',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        generateStatMatrix: function generateStatMatrix(heroStatMatrix) {
            var self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-statmatrix">' + '<div class="hl-graph-chart-container" style="position: relative; height:200px">' + '<canvas id="hl-graph-statmatrix-chart"></canvas></div></div>');

            //Get matrix keys
            var matrixKeys = [];
            var matrixVals = [];
            for (var smkey in heroStatMatrix) {
                if (heroStatMatrix.hasOwnProperty(smkey)) {
                    matrixKeys.push(smkey);
                    matrixVals.push(heroStatMatrix[smkey]);
                }
            }

            //Create chart
            var data = {
                labels: matrixKeys,
                datasets: [{
                    data: matrixVals,
                    backgroundColor: "rgba(165, 255, 248, 1)", //#a5fff8
                    borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                    borderWidth: 2,
                    pointRadius: 0
                }]
            };

            var options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                hover: {
                    mode: null
                },
                scale: {
                    pointLabels: {
                        fontColor: "#ada2c3",
                        fontFamily: "Arial sans-serif",
                        fontStyle: "normal",
                        fontSize: 11
                    },
                    ticks: {
                        maxTicksLimit: 1,
                        display: false,
                        min: 0,
                        max: 1.0
                    },
                    gridLines: {
                        lineWidth: 2
                    },
                    angleLines: {
                        lineWidth: 1
                    }
                }
            };

            var chart = new Chart($('#hl-graph-statmatrix-chart'), {
                type: 'radar',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        empty: function empty() {
            var self = HeroLoader.data.graphs;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = self.internal.charts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var chart = _step4.value;

                    chart.destroy();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            self.internal.charts.length = 0;

            $('#hl-graphs').empty();
        }
    }
};

$(document).ready(function () {
    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('herodata_pagedata_hero');
    var filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Track window width and toggle collapsability for graphs pane
    HeroLoader.data.graphs.resize();
    $(window).resize(function () {
        HeroLoader.data.graphs.resize();
    });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzYxNDhlMGZhYmYwZDU0MTM1YjAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX2dyYXBocyIsImdyYXBocyIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9oZXJvZGF0YSIsImpzb25fc3RhdHMiLCJqc29uX2FiaWxpdGllcyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwianNvbl9zdGF0TWF0cml4IiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsIndpbmRvdyIsInRpdGxlIiwiZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lciIsImltYWdlX2hlcm8iLCJuYW1lIiwic3RhdGtleSIsImF2ZXJhZ2Vfc3RhdHMiLCJoYXNPd25Qcm9wZXJ0eSIsInN0YXQiLCJ0eXBlIiwiYXZnX3BtaW4iLCJwZXJjZW50YWdlIiwia2RhIiwicmF3IiwidGltZV9zcGVudF9kZWFkIiwiYWJpbGl0eU9yZGVyIiwiYmVnaW5Jbm5lciIsImFiaWxpdHkiLCJnZW5lcmF0ZSIsImdlbmVyYXRlVGFibGUiLCJ0YWxlbnRzX2RhdGF0YWJsZSIsImdldFRhYmxlQ29uZmlnIiwidGFsZW50c0NvbGxhcHNlZCIsInIiLCJya2V5IiwidGllciIsImMiLCJja2V5IiwidGFsZW50IiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsImJ1aWxkc19kYXRhdGFibGUiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiYmtleSIsImJ1aWxkIiwicGlja3JhdGUiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGUiLCJ3aW5yYXRlX3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZV9kaXNwbGF5IiwiZ2VuZXJhdGVTdGF0TWF0cml4IiwiZ2VuZXJhdGVTcGFjZXIiLCJnZW5lcmF0ZU1hdGNoTGVuZ3RoV2lucmF0ZXNHcmFwaCIsImdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaCIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInVuaXZlcnNlIiwiZGlmZmljdWx0eSIsInJvbGVCbGl6emFyZCIsInJvbGVTcGVjaWZpYyIsInRhZ2xpbmUiLCJiaW8iLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwicmFyaXR5Iiwia2V5IiwiYXZnIiwicG1pbiIsImh0bWwiLCJyYXd2YWwiLCJkZXNjIiwiaW1hZ2VwYXRoIiwiaW1hZ2VfYmFzZV9wYXRoIiwicm93SWQiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsImJ1aWxkVGFsZW50cyIsInRhbGVudE5hbWVJbnRlcm5hbCIsImdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSIsInRoYXQiLCJyb3dMZW5ndGgiLCJwYWdlTGVuZ3RoIiwiY2hhcnRzIiwiY29sbGFwc2UiLCJpbml0IiwiZW5hYmxlZCIsInJlc2l6ZSIsIndpZHRoQnJlYWtwb2ludCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJ3aW5yYXRlcyIsImF2Z1dpbnJhdGUiLCJjd2lucmF0ZXMiLCJjYXZnd2lucmF0ZSIsIndrZXkiLCJsYWJlbHMiLCJkYXRhc2V0cyIsImxhYmVsIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsInBvaW50UmFkaXVzIiwiZmlsbCIsImJhY2tncm91bmRDb2xvciIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJtYWludGFpbkFzcGVjdFJhdGlvIiwibGVnZW5kIiwiZGlzcGxheSIsInNjYWxlcyIsInlBeGVzIiwic2NhbGVMYWJlbCIsImxhYmVsU3RyaW5nIiwiZm9udENvbG9yIiwiZm9udFNpemUiLCJ0aWNrcyIsImNhbGxiYWNrIiwidmFsdWUiLCJpbmRleCIsInZhbHVlcyIsImdyaWRMaW5lcyIsImxpbmVXaWR0aCIsInhBeGVzIiwiYXV0b1NraXAiLCJsYWJlbE9mZnNldCIsIm1pblJvdGF0aW9uIiwibWF4Um90YXRpb24iLCJjaGFydCIsIkNoYXJ0IiwiaGVyb1N0YXRNYXRyaXgiLCJtYXRyaXhLZXlzIiwibWF0cml4VmFscyIsInNta2V5IiwidG9vbHRpcHMiLCJob3ZlciIsIm1vZGUiLCJzY2FsZSIsInBvaW50TGFiZWxzIiwiZm9udEZhbWlseSIsImZvbnRTdHlsZSIsIm1heFRpY2tzTGltaXQiLCJtaW4iLCJtYXgiLCJhbmdsZUxpbmVzIiwiZGVzdHJveSIsInJlYWR5IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLFlBQVgsR0FBMEIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDckQsUUFBSSxDQUFDSCxXQUFXSSxJQUFYLENBQWdCQyxRQUFoQixDQUF5QkMsT0FBMUIsSUFBcUNDLGdCQUFnQkMsWUFBekQsRUFBdUU7QUFDbkUsWUFBSUMsTUFBTUYsZ0JBQWdCRyxXQUFoQixDQUE0QlIsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsWUFBSU0sUUFBUVQsV0FBV0ksSUFBWCxDQUFnQkssR0FBaEIsRUFBWixFQUFtQztBQUMvQlQsdUJBQVdJLElBQVgsQ0FBZ0JLLEdBQWhCLENBQW9CQSxHQUFwQixFQUF5QkUsSUFBekI7QUFDSDtBQUNKO0FBQ0osQ0FS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aWxlIjoiaGVyby1sb2FkZXIuMWQ4YTA0ZmE2MWU3ZTBjNWU3YjMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMzYxNDhlMGZhYmYwZDU0MTM1YjAiLCIvKlxyXG4gKiBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX2FiaWxpdGllcyA9IGRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfZ3JhcGhzID0gZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9hYmlsaXRpZXMgPSBqc29uWydhYmlsaXRpZXMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3RhbGVudHMgPSBqc29uWyd0YWxlbnRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9idWlsZHMgPSBqc29uWydidWlsZHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRNYXRyaXggPSBqc29uWydzdGF0TWF0cml4J107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5lbXB0eSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcjaGVyb2xvYWRlci1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFdpbmRvd1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy50aXRsZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudXJsKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9kYXRhXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGltYWdlIGNvbXBvc2l0ZSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lcihqc29uX2hlcm9kYXRhWyd1bml2ZXJzZSddLCBqc29uX2hlcm9kYXRhWydkaWZmaWN1bHR5J10sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbl9oZXJvZGF0YVsncm9sZV9ibGl6emFyZCddLCBqc29uX2hlcm9kYXRhWydyb2xlX3NwZWNpZmljJ10sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10sIGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddLCBqc29uX2hlcm9kYXRhWydyYXJpdHknXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEFiaWxpdGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWJpbGl0eU9yZGVyID0gW1wiTm9ybWFsXCIsIFwiSGVyb2ljXCIsIFwiVHJhaXRcIl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGFiaWxpdHlPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmJlZ2luSW5uZXIodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYWJpbGl0eSBvZiBqc29uX2FiaWxpdGllc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5nZW5lcmF0ZSh0eXBlLCBhYmlsaXR5WyduYW1lJ10sIGFiaWxpdHlbJ2Rlc2Nfc2ltcGxlJ10sIGFiaWxpdHlbJ2ltYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBUYWxlbnRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzX2RhdGF0YWJsZSA9IGRhdGFfdGFsZW50cy5nZXRUYWJsZUNvbmZpZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSB0YWxlbnRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db2xsYXBzZWQgb2JqZWN0IG9mIGFsbCB0YWxlbnRzIGZvciBoZXJvLCBmb3IgdXNlIHdpdGggZGlzcGxheWluZyBidWlsZHNcclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzQ29sbGFwc2VkID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGFsZW50IHRhYmxlIHRvIGNvbGxlY3QgdGFsZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IGpzb25fdGFsZW50c1snbWluUm93J107IHIgPD0ganNvbl90YWxlbnRzWydtYXhSb3cnXTsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJrZXkgPSByICsgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpZXIgPSBqc29uX3RhbGVudHNbcmtleV1bJ3RpZXInXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9CdWlsZCBjb2x1bW5zIGZvciBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0ganNvbl90YWxlbnRzW3JrZXldWydtaW5Db2wnXTsgYyA8PSBqc29uX3RhbGVudHNbcmtleV1bJ21heENvbCddOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNrZXkgPSBjICsgJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9BZGQgdGFsZW50IHRvIGNvbGxhcHNlZCBvYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YWxlbnRbJ25hbWUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2Nfc2ltcGxlOiB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudFsnaW1hZ2UnXSwgdGFsZW50WydwaWNrcmF0ZSddLCB0YWxlbnRbJ3BvcHVsYXJpdHknXSwgdGFsZW50Wyd3aW5yYXRlJ10sIHRhbGVudFsnd2lucmF0ZV9wZXJjZW50T25SYW5nZSddLCB0YWxlbnRbJ3dpbnJhdGVfZGlzcGxheSddKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBUYWxlbnRzIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmluaXRUYWJsZSh0YWxlbnRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudCBCdWlsZHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgQnVpbGRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGJ1aWxkc19kYXRhdGFibGUgPSBkYXRhX2J1aWxkcy5nZXRUYWJsZUNvbmZpZyhPYmplY3Qua2V5cyhqc29uX2J1aWxkcykubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgYnVpbGRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBidWlsZHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJrZXkgaW4ganNvbl9idWlsZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9idWlsZHMuaGFzT3duUHJvcGVydHkoYmtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ1aWxkID0ganNvbl9idWlsZHNbYmtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfYnVpbGRzLmdlbmVyYXRlVGFibGVEYXRhKHRhbGVudHNDb2xsYXBzZWQsIGJ1aWxkLnRhbGVudHMsIGJ1aWxkLnBpY2tyYXRlLCBidWlsZC5wb3B1bGFyaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQucG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZSwgYnVpbGQud2lucmF0ZV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZV9kaXNwbGF5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBCdWlsZHMgRGF0YVRhYmxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5pbml0VGFibGUoYnVpbGRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEdyYXBoc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1N0YXQgTWF0cml4XHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVN0YXRNYXRyaXgoanNvbl9zdGF0TWF0cml4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NwYWNlclxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTcGFjZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgb3ZlciBNYXRjaCBMZW5ndGhcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoKGpzb25fc3RhdHNbJ3JhbmdlX21hdGNoX2xlbmd0aCddLCBqc29uX3N0YXRzWyd3aW5yYXRlX3JhdyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NwYWNlclxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTcGFjZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgb3ZlciBIZXJvIExldmVsXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZUhlcm9MZXZlbFdpbnJhdGVzR3JhcGgoanNvbl9zdGF0c1sncmFuZ2VfaGVyb19sZXZlbCddLCBqc29uX3N0YXRzWyd3aW5yYXRlX3JhdyddKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmhlcm9kYXRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvb2x0aXBUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVxcJ3Rvb2x0aXBcXCcgcm9sZT1cXCd0b29sdGlwXFwnPjxkaXYgY2xhc3M9XFwnYXJyb3dcXCc+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdoZXJvZGF0YS1iaW8gdG9vbHRpcC1pbm5lclxcJz48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS10ZW1wbGF0ZT1cIicgKyB0b29sdGlwVGVtcGxhdGUgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYuaW1hZ2VfaGVyb190b29sdGlwKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSArICdcIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PHNwYW4gaWQ9XCJobC1oZXJvZGF0YS10aXRsZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKGltYWdlLCByYXJpdHkpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVybyBobC1oZXJvZGF0YS1yYXJpdHktJyArIHJhcml0eSArICdcIiBzcmM9XCInICsgaW1hZ2UgKyAnXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvX3Rvb2x0aXA6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC11bml2ZXJzZVxcJz5bJyArIHVuaXZlcnNlICsgJ108L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtcm9sZVxcJz4nICsgcm9sZUJsaXp6YXJkICsgJyAtICcgKyByb2xlU3BlY2lmaWMgKyAnPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLWRpZmZpY3VsdHlcXCc+KERpZmZpY3VsdHk6ICcgKyBkaWZmaWN1bHR5ICsgJyk8L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyB0YWdsaW5lICsgJzwvc3Bhbj48YnI+JyArIGJpbztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhYmlsaXRpZXM6IHtcclxuICAgICAgICBiZWdpbklubmVyOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSArICdcIiBjbGFzcz1cImhsLWFiaWxpdGllcy1pbm5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MsIGltYWdlcGF0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcCh0eXBlLCBuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VwYXRoICsgJ1wiPjxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZS1mcmFtZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyAndWkvYWJpbGl0eV9pY29uX2ZyYW1lLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJIZXJvaWNcIiB8fCB0eXBlID09PSBcIlRyYWl0XCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtJyArIHR5cGUgKyAnXFwnPlsnICsgdHlwZSArICddPC9zcGFuPjxicj48c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0YWxlbnRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24ociwgYywgdGllciwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nICtcclxuICAgICAgICAgICAgJyA8c3BhbiBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LW5hbWVcIj4nICsgbmFtZSArICc8L3NwYW4+PC9zcGFuPjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5ICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyLCBjLCB0aWVyLCB0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfUm93XCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX0NvbFwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllclwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50XCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXSwgWzEsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwaSA9IHRoaXMuYXBpKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm93cyA9IGFwaS5yb3dzKHtwYWdlOiAnY3VycmVudCd9KS5ub2RlcygpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGFwaS5jb2x1bW4oMiwge3BhZ2U6ICdjdXJyZW50J30pLmRhdGEoKS5lYWNoKGZ1bmN0aW9uIChncm91cCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSBncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHJvd3MpLmVxKGkpLmJlZm9yZSgnPHRyIGNsYXNzPVwiZ3JvdXAgdGllclwiPjx0ZCBjb2xzcGFuPVwiN1wiPicgKyBncm91cCArICc8L3RkPjwvdHI+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gZ3JvdXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkczoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtYnVpbGRzLXRhYmxlXCIgY2xhc3M9XCJob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbih0YWxlbnRzLCBidWlsZFRhbGVudHMsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5idWlsZHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFsZW50TmFtZUludGVybmFsIG9mIGJ1aWxkVGFsZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhbGVudHMuaGFzT3duUHJvcGVydHkodGFsZW50TmFtZUludGVybmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSB0YWxlbnRzW3RhbGVudE5hbWVJbnRlcm5hbF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUsIHRhbGVudC5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZTogZnVuY3Rpb24obmFtZSwgZGVzYywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRoYXQgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyB0aGF0LnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtYnVpbGRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9zcGFuPic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudCBCdWlsZFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICdCdWlsZCBEYXRhIGlzIGN1cnJlbnRseSBsaW1pdGVkIGZvciB0aGlzIEhlcm8uIEluY3JlYXNlIGRhdGUgcmFuZ2Ugb3Igd2FpdCBmb3IgbW9yZSBkYXRhLicgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMSwgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGdyYXBoczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNoYXJ0czogW10sXHJcbiAgICAgICAgICAgIGNvbGxhcHNlOiB7XHJcbiAgICAgICAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2l6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuICAgICAgICAgICAgbGV0IHdpZHRoQnJlYWtwb2ludCA9IDk5MjtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIDwgd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3BhY2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWdyYXBoLXNwYWNlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1hdGNoIExlbmd0aCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiTWF0Y2ggTGVuZ3RoIChNaW51dGVzKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhlcm8gTGV2ZWwgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIkhlcm8gTGV2ZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVN0YXRNYXRyaXg6IGZ1bmN0aW9uKGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9HZXQgbWF0cml4IGtleXNcclxuICAgICAgICAgICAgbGV0IG1hdHJpeEtleXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeFZhbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc21rZXkgaW4gaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvU3RhdE1hdHJpeC5oYXNPd25Qcm9wZXJ0eShzbWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhLZXlzLnB1c2goc21rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFZhbHMucHVzaChoZXJvU3RhdE1hdHJpeFtzbWtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogbWF0cml4S2V5cyxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRyaXhWYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNjUsIDI1NSwgMjQ4LCAxKVwiLCAvLyNhNWZmZjhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWwgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAxLjBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydCBvZiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIHdpbmRvdyB3aWR0aCBhbmQgdG9nZ2xlIGNvbGxhcHNhYmlsaXR5IGZvciBncmFwaHMgcGFuZVxyXG4gICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcclxuICAgICAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==