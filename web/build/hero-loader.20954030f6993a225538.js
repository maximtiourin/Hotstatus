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
            data_graphs.generateStatMatrix(json_herodata['name'], null, null);

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
        resize: function resize() {
            if (document.documentElement.clientWidth >= 992) {
                $('#hl-graphs-collapse').removeClass('collapse');
            } else {
                $('#hl-graphs-collapse').addClass('collapse');
            }
        },
        generateStatMatrix: function generateStatMatrix(heroName, heroStats, minMaxTotalHeroStats) {
            $('#hl-graphs').append('<div id="hl-graph-statmatrix">' + '<div class="hl-graph-chart-container" style="position: relative; height:200px">' + '<canvas id="hl-graph-statmatrix-chart"></canvas></div></div>');

            //Create chart
            var data = {
                labels: ["Healing", "Tanking", "Sieging", "Damage", "Poke", "Waveclear", "Soaking", "Jungling"],
                datasets: [{
                    label: heroName,
                    data: [.8, .2, .3, .05, 0, .5],
                    backgroundColor: "#a5fff8",
                    borderColor: "#b8ffc1",
                    borderWidth: 2,
                    pointRadius: 0
                }]
            };

            var options = {
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
                        fontSize: 14
                    },
                    ticks: {
                        maxTicksLimit: 1,
                        display: false
                    }
                }
            };

            new Chart($('#hl-graph-statmatrix-chart'), {
                type: 'radar',
                data: data,
                options: options
            });
        },
        empty: function empty() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTNkYzU4ZTkxMzg1M2ZlZWEyOTYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX2dyYXBocyIsImdyYXBocyIsIiQiLCJwcmVwZW5kIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJqc29uIiwianNvbl9oZXJvZGF0YSIsImpzb25fc3RhdHMiLCJqc29uX2FiaWxpdGllcyIsImpzb25fdGFsZW50cyIsImpzb25fYnVpbGRzIiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsIndpbmRvdyIsInRpdGxlIiwiZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lciIsImltYWdlX2hlcm8iLCJuYW1lIiwic3RhdGtleSIsImF2ZXJhZ2Vfc3RhdHMiLCJoYXNPd25Qcm9wZXJ0eSIsInN0YXQiLCJ0eXBlIiwiYXZnX3BtaW4iLCJwZXJjZW50YWdlIiwia2RhIiwicmF3IiwidGltZV9zcGVudF9kZWFkIiwiYWJpbGl0eU9yZGVyIiwiYmVnaW5Jbm5lciIsImFiaWxpdHkiLCJnZW5lcmF0ZSIsImdlbmVyYXRlVGFibGUiLCJ0YWxlbnRzX2RhdGF0YWJsZSIsImdldFRhYmxlQ29uZmlnIiwidGFsZW50c0NvbGxhcHNlZCIsInIiLCJya2V5IiwidGllciIsImMiLCJja2V5IiwidGFsZW50IiwiZGVzY19zaW1wbGUiLCJpbWFnZSIsInB1c2giLCJnZW5lcmF0ZVRhYmxlRGF0YSIsImluaXRUYWJsZSIsImJ1aWxkc19kYXRhdGFibGUiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiYmtleSIsImJ1aWxkIiwicGlja3JhdGUiLCJwb3B1bGFyaXR5IiwicG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSIsIndpbnJhdGUiLCJ3aW5yYXRlX3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZV9kaXNwbGF5IiwiZ2VuZXJhdGVTdGF0TWF0cml4IiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJzdHIiLCJkb2N1bWVudCIsImhlcm8iLCJSb3V0aW5nIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwidGFnbGluZSIsImJpbyIsInRvb2x0aXBUZW1wbGF0ZSIsImFwcGVuZCIsImltYWdlX2hlcm9fdG9vbHRpcCIsInZhbCIsInRleHQiLCJyYXJpdHkiLCJrZXkiLCJhdmciLCJwbWluIiwiaHRtbCIsInJhd3ZhbCIsImRlc2MiLCJpbWFnZXBhdGgiLCJpbWFnZV9iYXNlX3BhdGgiLCJyb3dJZCIsIndpbnJhdGVEaXNwbGF5IiwidGFsZW50RmllbGQiLCJwaWNrcmF0ZUZpZWxkIiwicG9wdWxhcml0eUZpZWxkIiwid2lucmF0ZUZpZWxkIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwib3JkZXIiLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJkcmF3Q2FsbGJhY2siLCJzZXR0aW5ncyIsImFwaSIsInJvd3MiLCJwYWdlIiwibm9kZXMiLCJsYXN0IiwiY29sdW1uIiwiZWFjaCIsImdyb3VwIiwiaSIsImVxIiwiYmVmb3JlIiwiYnVpbGRUYWxlbnRzIiwidGFsZW50TmFtZUludGVybmFsIiwiZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlIiwidGhhdCIsInJvd0xlbmd0aCIsInBhZ2VMZW5ndGgiLCJyZXNpemUiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImFkZENsYXNzIiwiaGVyb05hbWUiLCJoZXJvU3RhdHMiLCJtaW5NYXhUb3RhbEhlcm9TdGF0cyIsImxhYmVscyIsImRhdGFzZXRzIiwibGFiZWwiLCJiYWNrZ3JvdW5kQ29sb3IiLCJib3JkZXJDb2xvciIsImJvcmRlcldpZHRoIiwicG9pbnRSYWRpdXMiLCJvcHRpb25zIiwibWFpbnRhaW5Bc3BlY3RSYXRpbyIsImxlZ2VuZCIsImRpc3BsYXkiLCJ0b29sdGlwcyIsImVuYWJsZWQiLCJob3ZlciIsIm1vZGUiLCJzY2FsZSIsInBvaW50TGFiZWxzIiwiZm9udENvbG9yIiwiZm9udFNpemUiLCJ0aWNrcyIsIm1heFRpY2tzTGltaXQiLCJDaGFydCIsInJlYWR5IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFF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LE1BQUYsRUFBVXdILE1BQVYsQ0FBaUIsWUFBVTtBQUN2QmhLLG1CQUFXYyxJQUFYLENBQWdCWSxNQUFoQixDQUF1QnNJLE1BQXZCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBckksTUFBRSx3QkFBRixFQUE0Qm9LLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckR6TCx3QkFBZ0J1TCxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0MzTCxXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQXdCLE1BQUUsR0FBRixFQUFPb0ssRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q2pNLG1CQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0F0QkQsRSIsImZpbGUiOiJoZXJvLWxvYWRlci4yMDk1NDAzMGY2OTkzYTIyNTUzOC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhM2RjNThlOTEzODUzZmVlYTI5NiIsIi8qXHJcbiAqIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKi9cclxuSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgaWYgKCFIZXJvTG9hZGVyLmFqYXguaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgaGVybyBsb2FkZXIgaXMgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX2hlcm9kYXRhID0gZGF0YS5oZXJvZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9zdGF0cyA9IGRhdGEuc3RhdHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYWJpbGl0aWVzID0gZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdGFsZW50cyA9IGRhdGEudGFsZW50cztcclxuICAgICAgICBsZXQgZGF0YV9idWlsZHMgPSBkYXRhLmJ1aWxkcztcclxuICAgICAgICBsZXQgZGF0YV9ncmFwaHMgPSBkYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjaGVyb2xvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9BamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9kYXRhID0ganNvblsnaGVyb2RhdGEnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRzID0ganNvblsnc3RhdHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2FiaWxpdGllcyA9IGpzb25bJ2FiaWxpdGllcyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fdGFsZW50cyA9IGpzb25bJ3RhbGVudHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2J1aWxkcyA9IGpzb25bJ2J1aWxkcyddO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBXaW5kb3dcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudGl0bGUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnVybChqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBpbWFnZSBjb21wb3NpdGUgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXIoanNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10sIGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddLCBqc29uX2hlcm9kYXRhWydyYXJpdHknXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEFiaWxpdGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWJpbGl0eU9yZGVyID0gW1wiTm9ybWFsXCIsIFwiSGVyb2ljXCIsIFwiVHJhaXRcIl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGFiaWxpdHlPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmJlZ2luSW5uZXIodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYWJpbGl0eSBvZiBqc29uX2FiaWxpdGllc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5nZW5lcmF0ZSh0eXBlLCBhYmlsaXR5WyduYW1lJ10sIGFiaWxpdHlbJ2Rlc2Nfc2ltcGxlJ10sIGFiaWxpdHlbJ2ltYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBUYWxlbnRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzX2RhdGF0YWJsZSA9IGRhdGFfdGFsZW50cy5nZXRUYWJsZUNvbmZpZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSB0YWxlbnRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db2xsYXBzZWQgb2JqZWN0IG9mIGFsbCB0YWxlbnRzIGZvciBoZXJvLCBmb3IgdXNlIHdpdGggZGlzcGxheWluZyBidWlsZHNcclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzQ29sbGFwc2VkID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGFsZW50IHRhYmxlIHRvIGNvbGxlY3QgdGFsZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IGpzb25fdGFsZW50c1snbWluUm93J107IHIgPD0ganNvbl90YWxlbnRzWydtYXhSb3cnXTsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJrZXkgPSByICsgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpZXIgPSBqc29uX3RhbGVudHNbcmtleV1bJ3RpZXInXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9CdWlsZCBjb2x1bW5zIGZvciBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0ganNvbl90YWxlbnRzW3JrZXldWydtaW5Db2wnXTsgYyA8PSBqc29uX3RhbGVudHNbcmtleV1bJ21heENvbCddOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNrZXkgPSBjICsgJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9BZGQgdGFsZW50IHRvIGNvbGxhcHNlZCBvYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YWxlbnRbJ25hbWUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2Nfc2ltcGxlOiB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudFsnaW1hZ2UnXSwgdGFsZW50WydwaWNrcmF0ZSddLCB0YWxlbnRbJ3BvcHVsYXJpdHknXSwgdGFsZW50Wyd3aW5yYXRlJ10sIHRhbGVudFsnd2lucmF0ZV9wZXJjZW50T25SYW5nZSddLCB0YWxlbnRbJ3dpbnJhdGVfZGlzcGxheSddKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBUYWxlbnRzIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmluaXRUYWJsZSh0YWxlbnRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudCBCdWlsZHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgQnVpbGRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGJ1aWxkc19kYXRhdGFibGUgPSBkYXRhX2J1aWxkcy5nZXRUYWJsZUNvbmZpZyhPYmplY3Qua2V5cyhqc29uX2J1aWxkcykubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgYnVpbGRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBidWlsZHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJrZXkgaW4ganNvbl9idWlsZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9idWlsZHMuaGFzT3duUHJvcGVydHkoYmtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ1aWxkID0ganNvbl9idWlsZHNbYmtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfYnVpbGRzLmdlbmVyYXRlVGFibGVEYXRhKHRhbGVudHNDb2xsYXBzZWQsIGJ1aWxkLnRhbGVudHMsIGJ1aWxkLnBpY2tyYXRlLCBidWlsZC5wb3B1bGFyaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQucG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZSwgYnVpbGQud2lucmF0ZV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZV9kaXNwbGF5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBCdWlsZHMgRGF0YVRhYmxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5pbml0VGFibGUoYnVpbGRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEdyYXBoc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1N0YXQgTWF0cml4XHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVN0YXRNYXRyaXgoanNvbl9oZXJvZGF0YVsnbmFtZSddLCBudWxsLCBudWxsKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKHRhZ2xpbmUsIGJpbykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5oZXJvZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0b29sdGlwVGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cXCd0b29sdGlwXFwnIHJvbGU9XFwndG9vbHRpcFxcJz48ZGl2IGNsYXNzPVxcJ2Fycm93XFwnPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XFwnaGVyb2RhdGEtYmlvIHRvb2x0aXAtaW5uZXJcXCc+PC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5hcHBlbmQoJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtdGVtcGxhdGU9XCInICsgdG9vbHRpcFRlbXBsYXRlICsgJ1wiICcgK1xyXG4gICAgICAgICAgICAgICAgJ2RhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLmltYWdlX2hlcm9fdG9vbHRpcCh0YWdsaW5lLCBiaW8pICsgJ1wiPjxkaXYgaWQ9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbnRhaW5lclwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGlkPVwiaGwtaGVyb2RhdGEtbmFtZVwiPjwvc3Bhbj48c3BhbiBpZD1cImhsLWhlcm9kYXRhLXRpdGxlXCI+PC9zcGFuPjwvc3Bhbj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hbWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtbmFtZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLXRpdGxlJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVybzogZnVuY3Rpb24oaW1hZ2UsIHJhcml0eSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXInKS5hcHBlbmQoJzxpbWcgY2xhc3M9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvIGhsLWhlcm9kYXRhLXJhcml0eS0nICsgcmFyaXR5ICsgJ1wiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm9fdG9vbHRpcDogZnVuY3Rpb24odGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIHRhZ2xpbmUgKyAnPC9zcGFuPjxicj4nICsgYmlvO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb21wb3NpdGUtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc3RhdHM6IHtcclxuICAgICAgICBhdmdfcG1pbjogZnVuY3Rpb24oa2V5LCBhdmcsIHBtaW4pIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLWF2ZycpLnRleHQoYXZnKTtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBtaW4nKS50ZXh0KHBtaW4pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGVyY2VudGFnZTogZnVuY3Rpb24oa2V5LCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wZXJjZW50YWdlJykuaHRtbChwZXJjZW50YWdlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGtkYTogZnVuY3Rpb24oa2V5LCBrZGEpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLWtkYScpLnRleHQoa2RhKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJhdzogZnVuY3Rpb24oa2V5LCByYXd2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXJhdycpLnRleHQocmF3dmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpbWVfc3BlbnRfZGVhZDogZnVuY3Rpb24oa2V5LCB0aW1lX3NwZW50X2RlYWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXRpbWUtc3BlbnQtZGVhZCcpLnRleHQodGltZV9zcGVudF9kZWFkKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGFiaWxpdGllczoge1xyXG4gICAgICAgIGJlZ2luSW5uZXI6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtYWJpbGl0aWVzLWlubmVyLScgKyB0eXBlICsgJ1wiIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWlubmVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYywgaW1hZ2VwYXRoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmFiaWxpdGllcztcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHlcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKHR5cGUsIG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZXBhdGggKyAnXCI+PGltZyBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5LWltYWdlLWZyYW1lXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArICd1aS9hYmlsaXR5X2ljb25fZnJhbWUucG5nXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbih0eXBlLCBuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBcIkhlcm9pY1wiIHx8IHR5cGUgPT09IFwiVHJhaXRcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC0nICsgdHlwZSArICdcXCc+WycgKyB0eXBlICsgJ108L3NwYW4+PGJyPjxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRhbGVudHM6IHtcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbihyb3dJZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtdGFibGVcIiBjbGFzcz1cImhzbC10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihyLCBjLCB0aWVyLCBuYW1lLCBkZXNjLCBpbWFnZSwgcGlja3JhdGUsIHBvcHVsYXJpdHksIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnIDxzcGFuIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtbmFtZVwiPicgKyBuYW1lICsgJzwvc3Bhbj48L3NwYW4+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHkgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3IsIGMsIHRpZXIsIHRhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Sb3dcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfQ29sXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMCwgJ2FzYyddLCBbMSwgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXBpID0gdGhpcy5hcGkoKTtcclxuICAgICAgICAgICAgICAgIGxldCByb3dzID0gYXBpLnJvd3Moe3BhZ2U6ICdjdXJyZW50J30pLm5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgYXBpLmNvbHVtbigyLCB7cGFnZTogJ2N1cnJlbnQnfSkuZGF0YSgpLmVhY2goZnVuY3Rpb24gKGdyb3VwLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgIT09IGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQocm93cykuZXEoaSkuYmVmb3JlKCc8dHIgY2xhc3M9XCJncm91cCB0aWVyXCI+PHRkIGNvbHNwYW49XCI3XCI+JyArIGdyb3VwICsgJzwvdGQ+PC90cj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBncm91cDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy1idWlsZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHRhbGVudHMsIGJ1aWxkVGFsZW50cywgcGlja3JhdGUsIHBvcHVsYXJpdHksIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmJ1aWxkcztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YWxlbnROYW1lSW50ZXJuYWwgb2YgYnVpbGRUYWxlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFsZW50cy5oYXNPd25Qcm9wZXJ0eSh0YWxlbnROYW1lSW50ZXJuYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHRhbGVudHNbdGFsZW50TmFtZUludGVybmFsXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50RmllbGQgKz0gc2VsZi5nZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSwgdGFsZW50LmltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFt0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlOiBmdW5jdGlvbihuYW1lLCBkZXNjLCBpbWFnZSkge1xyXG4gICAgICAgICAgICBsZXQgdGhhdCA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHRoYXQudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC1idWlsZHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50IEJ1aWxkXCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJ0J1aWxkIERhdGEgaXMgY3VycmVudGx5IGxpbWl0ZWQgZm9yIHRoaXMgSGVyby4gSW5jcmVhc2UgZGF0ZSByYW5nZSBvciB3YWl0IGZvciBtb3JlIGRhdGEuJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1sxLCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlX251bWJlcnNcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgZ3JhcGhzOiB7XHJcbiAgICAgICAgcmVzaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCA+PSA5OTIpIHtcclxuICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5hZGRDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVTdGF0TWF0cml4OiBmdW5jdGlvbihoZXJvTmFtZSwgaGVyb1N0YXRzLCBtaW5NYXhUb3RhbEhlcm9TdGF0cykge1xyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJobC1ncmFwaC1jaGFydC1jb250YWluZXJcIiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OjIwMHB4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cImhsLWdyYXBoLXN0YXRtYXRyaXgtY2hhcnRcIj48L2NhbnZhcz48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiBbXCJIZWFsaW5nXCIsIFwiVGFua2luZ1wiLCBcIlNpZWdpbmdcIiwgXCJEYW1hZ2VcIiwgXCJQb2tlXCIsIFwiV2F2ZWNsZWFyXCIsIFwiU29ha2luZ1wiLCBcIkp1bmdsaW5nXCJdLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBoZXJvTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWy44LCAuMiwgLjMsIC4wNSwgMCwgLjVdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2E1ZmZmOFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjYjhmZmMxXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1RyYWNrIHdpbmRvdyB3aWR0aCBhbmQgdG9nZ2xlIGNvbGxhcHNhYmlsaXR5IGZvciBncmFwaHMgcGFuZVxyXG4gICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcclxuICAgICAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==