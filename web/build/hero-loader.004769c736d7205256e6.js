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
            data_herodata.generateImageCompositeContainer(json_herodata['desc_tagline'], json_herodata['desc_bio']);
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
        generateImageCompositeContainer: function generateImageCompositeContainer(tagline, bio) {
            var self = HeroLoader.data.herodata;

            var tooltipTemplate = '<div class=\'tooltip\' role=\'tooltip\'><div class=\'arrow\'></div>' + '<div class=\'herodata-bio tooltip-inner\'></div></div>';

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-template="' + tooltipTemplate + '" ' + 'data-html="true" title="' + self.image_hero_tooltip(tagline, bio) + '"><div id="hl-herodata-image-hero-container"></div>' + '<span id="hl-herodata-name"></span><span id="hl-herodata-title"></span></span>');
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
        image_hero_tooltip: function image_hero_tooltip(tagline, bio) {
            return '<span class=\'hl-talents-tooltip-name\'>' + tagline + '</span><br>' + bio;
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
            charts: []
        },
        resize: function resize() {
            if (document.documentElement.clientWidth >= 992) {
                $('#hl-graphs-collapse').removeClass('collapse');
            } else {
                $('#hl-graphs-collapse').addClass('collapse');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjY2ODdkMTUyMTk5NzNjMzJlNmUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX2dyYXBocyIsImdyYXBocyIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9oZXJvZGF0YSIsImpzb25fc3RhdHMiLCJqc29uX2FiaWxpdGllcyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwianNvbl9zdGF0TWF0cml4IiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsIndpbmRvdyIsInRpdGxlIiwiZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lciIsImltYWdlX2hlcm8iLCJuYW1lIiwic3RhdGtleSIsImF2ZXJhZ2Vfc3RhdHMiLCJoYXNPd25Qcm9wZXJ0eSIsInN0YXQiLCJ0eXBlIiwiYXZnX3BtaW4iLCJwZXJjZW50YWdlIiwia2RhIiwicmF3IiwidGltZV9zcGVudF9kZWFkIiwiYWJpbGl0eU9yZGVyIiwiYmVnaW5Jbm5lciIsImFiaWxpdHkiLCJnZW5lcmF0ZSIsImdlbmVyYXRlVGFibGUiLCJ0YWxlbnRzX2RhdGF0YWJsZSIsImdldFRhYmxlQ29uZmlnIiwidGFsZW50c0NvbGxhcHNlZCIsInIiLCJya2V5IiwidGllciIsImMiLCJja2V5IiwidGFsZW50IiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsImJ1aWxkc19kYXRhdGFibGUiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiYmtleSIsImJ1aWxkIiwicGlja3JhdGUiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGUiLCJ3aW5yYXRlX3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZV9kaXNwbGF5IiwiZ2VuZXJhdGVTdGF0TWF0cml4IiwiZ2VuZXJhdGVTcGFjZXIiLCJnZW5lcmF0ZU1hdGNoTGVuZ3RoV2lucmF0ZXNHcmFwaCIsImdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaCIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInRhZ2xpbmUiLCJiaW8iLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwicmFyaXR5Iiwia2V5IiwiYXZnIiwicG1pbiIsImh0bWwiLCJyYXd2YWwiLCJkZXNjIiwiaW1hZ2VwYXRoIiwiaW1hZ2VfYmFzZV9wYXRoIiwicm93SWQiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsImJ1aWxkVGFsZW50cyIsInRhbGVudE5hbWVJbnRlcm5hbCIsImdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSIsInRoYXQiLCJyb3dMZW5ndGgiLCJwYWdlTGVuZ3RoIiwiY2hhcnRzIiwicmVzaXplIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJhZGRDbGFzcyIsIndpbnJhdGVzIiwiYXZnV2lucmF0ZSIsImN3aW5yYXRlcyIsImNhdmd3aW5yYXRlIiwid2tleSIsImxhYmVscyIsImRhdGFzZXRzIiwibGFiZWwiLCJib3JkZXJDb2xvciIsImJvcmRlcldpZHRoIiwicG9pbnRSYWRpdXMiLCJmaWxsIiwiYmFja2dyb3VuZENvbG9yIiwib3B0aW9ucyIsImFuaW1hdGlvbiIsIm1haW50YWluQXNwZWN0UmF0aW8iLCJsZWdlbmQiLCJkaXNwbGF5Iiwic2NhbGVzIiwieUF4ZXMiLCJzY2FsZUxhYmVsIiwibGFiZWxTdHJpbmciLCJmb250Q29sb3IiLCJmb250U2l6ZSIsInRpY2tzIiwiY2FsbGJhY2siLCJ2YWx1ZSIsImluZGV4IiwidmFsdWVzIiwiZ3JpZExpbmVzIiwibGluZVdpZHRoIiwieEF4ZXMiLCJhdXRvU2tpcCIsImxhYmVsT2Zmc2V0IiwibWluUm90YXRpb24iLCJtYXhSb3RhdGlvbiIsImNoYXJ0IiwiQ2hhcnQiLCJoZXJvU3RhdE1hdHJpeCIsIm1hdHJpeEtleXMiLCJtYXRyaXhWYWxzIiwic21rZXkiLCJ0b29sdGlwcyIsImVuYWJsZWQiLCJob3ZlciIsIm1vZGUiLCJzY2FsZSIsInBvaW50TGFiZWxzIiwiZm9udEZhbWlseSIsImZvbnRTdHlsZSIsIm1heFRpY2tzTGltaXQiLCJtaW4iLCJtYXgiLCJhbmdsZUxpbmVzIiwiZGVzdHJveSIsInJlYWR5IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLFlBQVgsR0FBMEIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDckQsUUFBSSxDQUFDSCxXQUFXSSxJQUFYLENBQWdCQyxRQUFoQixDQUF5QkMsT0FBMUIsSUFBcUNDLGdCQUFnQkMsWUFBekQsRUFBdUU7QUFDbkUsWUFBSUMsTUFBTUYsZ0JBQWdCRyxXQUFoQixDQUE0QlIsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsWUFBSU0sUUFBUVQsV0FBV0ksSUFBWCxDQUFnQkssR0FBaEIsRUFBWixFQUFtQztBQUMvQlQsdUJBQVdJLElBQVgsQ0FBZ0JLLEdBQWhCLENBQW9CQSxHQUFwQixFQUF5QkUsSUFBekI7QUFDSDtBQUNKO0FBQ0osQ0FSRDs7QUFVQTs7O0FBR0FYLFdBQVdJLElBQVgsR0FBa0I7QUFDZEMsY0FBVTtBQUNOQyxpQkFBUyxLQURILEVBQ1U7QUFDaEJHLGFBQUssRUFGQyxFQUVHO0FB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OU4sV0FBeEM7QUFDQUgsZUFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0FILGVBQVdjLElBQVgsQ0FBZ0JZLE1BQWhCLENBQXVCMkksTUFBdkI7QUFDQTFJLE1BQUVjLE1BQUYsRUFBVTRILE1BQVYsQ0FBaUIsWUFBVTtBQUN2QnJLLG1CQUFXYyxJQUFYLENBQWdCWSxNQUFoQixDQUF1QjJJLE1BQXZCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBMUksTUFBRSx3QkFBRixFQUE0QnVNLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckQ1Tix3QkFBZ0IwTixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0M5TixXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQXdCLE1BQUUsR0FBRixFQUFPdU0sRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q3BPLG1CQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJoZXJvLWxvYWRlci4wMDQ3NjljNzM2ZDcyMDUyNTZlNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBmNjY4N2QxNTIxOTk3M2MzMmU2ZSIsIi8qXHJcbiAqIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKi9cclxuSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgaWYgKCFIZXJvTG9hZGVyLmFqYXguaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgaGVybyBsb2FkZXIgaXMgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX2hlcm9kYXRhID0gZGF0YS5oZXJvZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9zdGF0cyA9IGRhdGEuc3RhdHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYWJpbGl0aWVzID0gZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdGFsZW50cyA9IGRhdGEudGFsZW50cztcclxuICAgICAgICBsZXQgZGF0YV9idWlsZHMgPSBkYXRhLmJ1aWxkcztcclxuICAgICAgICBsZXQgZGF0YV9ncmFwaHMgPSBkYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjaGVyb2xvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9BamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9kYXRhID0ganNvblsnaGVyb2RhdGEnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRzID0ganNvblsnc3RhdHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2FiaWxpdGllcyA9IGpzb25bJ2FiaWxpdGllcyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fdGFsZW50cyA9IGpzb25bJ3RhbGVudHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2J1aWxkcyA9IGpzb25bJ2J1aWxkcyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdE1hdHJpeCA9IGpzb25bJ3N0YXRNYXRyaXgnXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgaW1hZ2UgY29tcG9zaXRlIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5nZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyKGpzb25faGVyb2RhdGFbJ2Rlc2NfdGFnbGluZSddLCBqc29uX2hlcm9kYXRhWydkZXNjX2JpbyddKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSwganNvbl9oZXJvZGF0YVsncmFyaXR5J10pO1xyXG4gICAgICAgICAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLm5hbWUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGl0bGVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEudGl0bGUoanNvbl9oZXJvZGF0YVsndGl0bGUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBBYmlsaXRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFiaWxpdHlPcmRlciA9IFtcIk5vcm1hbFwiLCBcIkhlcm9pY1wiLCBcIlRyYWl0XCJdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBhYmlsaXR5T3JkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5iZWdpbklubmVyKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFiaWxpdHkgb2YganNvbl9hYmlsaXRpZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuZ2VuZXJhdGUodHlwZSwgYWJpbGl0eVsnbmFtZSddLCBhYmlsaXR5WydkZXNjX3NpbXBsZSddLCBhYmlsaXR5WydpbWFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgVGFsZW50cyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c19kYXRhdGFibGUgPSBkYXRhX3RhbGVudHMuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgdGFsZW50cyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGFsZW50c19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ29sbGFwc2VkIG9iamVjdCBvZiBhbGwgdGFsZW50cyBmb3IgaGVybywgZm9yIHVzZSB3aXRoIGRpc3BsYXlpbmcgYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c0NvbGxhcHNlZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRhbGVudCB0YWJsZSB0byBjb2xsZWN0IHRhbGVudHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSBqc29uX3RhbGVudHNbJ21pblJvdyddOyByIDw9IGpzb25fdGFsZW50c1snbWF4Um93J107IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBya2V5ID0gciArICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWVyID0ganNvbl90YWxlbnRzW3JrZXldWyd0aWVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQnVpbGQgY29sdW1ucyBmb3IgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IGpzb25fdGFsZW50c1tya2V5XVsnbWluQ29sJ107IGMgPD0ganNvbl90YWxlbnRzW3JrZXldWydtYXhDb2wnXTsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBja2V5ID0gYyArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNDb2xsYXBzZWRbdGFsZW50WyduYW1lX2ludGVybmFsJ11dID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhbGVudFsnaW1hZ2UnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGVEYXRhKHIsIGMsIHRpZXIsIHRhbGVudFsnbmFtZSddLCB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBHcmFwaHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0IE1hdHJpeFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTdGF0TWF0cml4KGpzb25fc3RhdE1hdHJpeCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TcGFjZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3BhY2VyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlIG92ZXIgTWF0Y2ggTGVuZ3RoXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZU1hdGNoTGVuZ3RoV2lucmF0ZXNHcmFwaChqc29uX3N0YXRzWydyYW5nZV9tYXRjaF9sZW5ndGgnXSwganNvbl9zdGF0c1snd2lucmF0ZV9yYXcnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TcGFjZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3BhY2VyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlIG92ZXIgSGVybyBMZXZlbFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoKGpzb25fc3RhdHNbJ3JhbmdlX2hlcm9fbGV2ZWwnXSwganNvbl9zdGF0c1snd2lucmF0ZV9yYXcnXSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcbkhlcm9Mb2FkZXIuZGF0YSA9IHtcclxuICAgIHdpbmRvdzoge1xyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBcIkhvdHN0YXQudXM6IFwiICsgc3RyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXJsOiBmdW5jdGlvbihoZXJvKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwiaGVyb1wiLCB7aGVyb1Byb3Blck5hbWU6IGhlcm99KTtcclxuICAgICAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoaGVybywgaGVybywgdXJsKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGVyb2RhdGE6IHtcclxuICAgICAgICBnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyOiBmdW5jdGlvbih0YWdsaW5lLCBiaW8pIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuaGVyb2RhdGE7XHJcblxyXG4gICAgICAgICAgICBsZXQgdG9vbHRpcFRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XFwndG9vbHRpcFxcJyByb2xlPVxcJ3Rvb2x0aXBcXCc+PGRpdiBjbGFzcz1cXCdhcnJvd1xcJz48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVxcJ2hlcm9kYXRhLWJpbyB0b29sdGlwLWlubmVyXFwnPjwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb21wb3NpdGUtY29udGFpbmVyJykuYXBwZW5kKCc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLXRlbXBsYXRlPVwiJyArIHRvb2x0aXBUZW1wbGF0ZSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi5pbWFnZV9oZXJvX3Rvb2x0aXAodGFnbGluZSwgYmlvKSArICdcIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PHNwYW4gaWQ9XCJobC1oZXJvZGF0YS10aXRsZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKGltYWdlLCByYXJpdHkpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVybyBobC1oZXJvZGF0YS1yYXJpdHktJyArIHJhcml0eSArICdcIiBzcmM9XCInICsgaW1hZ2UgKyAnXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvX3Rvb2x0aXA6IGZ1bmN0aW9uKHRhZ2xpbmUsIGJpbykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyB0YWdsaW5lICsgJzwvc3Bhbj48YnI+JyArIGJpbztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhYmlsaXRpZXM6IHtcclxuICAgICAgICBiZWdpbklubmVyOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSArICdcIiBjbGFzcz1cImhsLWFiaWxpdGllcy1pbm5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MsIGltYWdlcGF0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcCh0eXBlLCBuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VwYXRoICsgJ1wiPjxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZS1mcmFtZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyAndWkvYWJpbGl0eV9pY29uX2ZyYW1lLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJIZXJvaWNcIiB8fCB0eXBlID09PSBcIlRyYWl0XCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtJyArIHR5cGUgKyAnXFwnPlsnICsgdHlwZSArICddPC9zcGFuPjxicj48c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0YWxlbnRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24ociwgYywgdGllciwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nICtcclxuICAgICAgICAgICAgJyA8c3BhbiBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LW5hbWVcIj4nICsgbmFtZSArICc8L3NwYW4+PC9zcGFuPjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5ICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyLCBjLCB0aWVyLCB0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfUm93XCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX0NvbFwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllclwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50XCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXSwgWzEsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwaSA9IHRoaXMuYXBpKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm93cyA9IGFwaS5yb3dzKHtwYWdlOiAnY3VycmVudCd9KS5ub2RlcygpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGFwaS5jb2x1bW4oMiwge3BhZ2U6ICdjdXJyZW50J30pLmRhdGEoKS5lYWNoKGZ1bmN0aW9uIChncm91cCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSBncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHJvd3MpLmVxKGkpLmJlZm9yZSgnPHRyIGNsYXNzPVwiZ3JvdXAgdGllclwiPjx0ZCBjb2xzcGFuPVwiN1wiPicgKyBncm91cCArICc8L3RkPjwvdHI+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gZ3JvdXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkczoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtYnVpbGRzLXRhYmxlXCIgY2xhc3M9XCJob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbih0YWxlbnRzLCBidWlsZFRhbGVudHMsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5idWlsZHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFsZW50TmFtZUludGVybmFsIG9mIGJ1aWxkVGFsZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhbGVudHMuaGFzT3duUHJvcGVydHkodGFsZW50TmFtZUludGVybmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSB0YWxlbnRzW3RhbGVudE5hbWVJbnRlcm5hbF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUsIHRhbGVudC5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZTogZnVuY3Rpb24obmFtZSwgZGVzYywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRoYXQgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyB0aGF0LnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtYnVpbGRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9zcGFuPic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudCBCdWlsZFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICdCdWlsZCBEYXRhIGlzIGN1cnJlbnRseSBsaW1pdGVkIGZvciB0aGlzIEhlcm8uIEluY3JlYXNlIGRhdGUgcmFuZ2Ugb3Igd2FpdCBmb3IgbW9yZSBkYXRhLicgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMSwgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGdyYXBoczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNoYXJ0czogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2l6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gOTkyKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykuYWRkQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3BhY2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWdyYXBoLXNwYWNlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1hdGNoIExlbmd0aCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiTWF0Y2ggTGVuZ3RoIChNaW51dGVzKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhlcm8gTGV2ZWwgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIkhlcm8gTGV2ZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVN0YXRNYXRyaXg6IGZ1bmN0aW9uKGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9HZXQgbWF0cml4IGtleXNcclxuICAgICAgICAgICAgbGV0IG1hdHJpeEtleXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeFZhbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc21rZXkgaW4gaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvU3RhdE1hdHJpeC5oYXNPd25Qcm9wZXJ0eShzbWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhLZXlzLnB1c2goc21rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFZhbHMucHVzaChoZXJvU3RhdE1hdHJpeFtzbWtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogbWF0cml4S2V5cyxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRyaXhWYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNjUsIDI1NSwgMjQ4LCAxKVwiLCAvLyNhNWZmZjhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWwgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAxLjBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydCBvZiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIHdpbmRvdyB3aWR0aCBhbmQgdG9nZ2xlIGNvbGxhcHNhYmlsaXR5IGZvciBncmFwaHMgcGFuZVxyXG4gICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcclxuICAgICAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==