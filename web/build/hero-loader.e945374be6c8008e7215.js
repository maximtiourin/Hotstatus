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
        var data_medals = data.medals;
        var data_graphs = data.graphs;
        var data_matchups = data.matchups;

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
            var json_medals = json['medals'];
            var json_statMatrix = json['statMatrix'];
            var json_matchups = json['matchups'];

            /*
             * Empty dynamically filled containers
             */
            data_herodata.empty();
            data_abilities.empty();
            data_talents.empty();
            data_builds.empty();
            data_medals.empty();
            data_graphs.empty();
            data_matchups.empty();

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
             * Medals
             */
            data_medals.generateMedalsPane(json_medals);

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

            /*
             * Matchups
             */
            if (json_matchups['foes_count'] > 0 || json_matchups['friends_count'] > 0) {
                //Generate matchups container
                data_matchups.generateMatchupsContainer();

                /*
                 * Foes
                 */
                if (json_matchups['foes_count'] > 0) {
                    //Define Matchup DataTables and generate table structure
                    data_matchups.generateFoesTable();

                    var matchup_foes_datatable = data_matchups.getFoesTableConfig(json_matchups['foes_count']);

                    //Initialize builds datatable data array
                    matchup_foes_datatable.data = [];

                    //Loop through foes
                    for (var mkey in json_matchups.foes) {
                        if (json_matchups.foes.hasOwnProperty(mkey)) {
                            var matchup = json_matchups.foes[mkey];

                            //Create datatable row
                            matchup_foes_datatable.data.push(data_matchups.generateTableData(mkey, matchup));
                        }
                    }

                    //Init Matchup DataTables
                    data_matchups.initFoesTable(matchup_foes_datatable);
                }

                /*
                 * Friends
                 */
                if (json_matchups['friends_count'] > 0) {
                    //Define Matchup DataTables and generate table structure
                    data_matchups.generateFriendsTable();

                    var matchup_friends_datatable = data_matchups.getFriendsTableConfig(json_matchups['friends_count']);

                    //Initialize builds datatable data array
                    matchup_friends_datatable.data = [];

                    //Loop through friends
                    for (var _mkey in json_matchups.friends) {
                        if (json_matchups.friends.hasOwnProperty(_mkey)) {
                            var _matchup = json_matchups.friends[_mkey];

                            //Create datatable row
                            matchup_friends_datatable.data.push(data_matchups.generateTableData(_mkey, _matchup));
                        }
                    }

                    //Init Matchup DataTables
                    data_matchups.initFriendsTable(matchup_friends_datatable);
                }
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
HeroLoader.data = {
    window: {
        title: function title(str) {
            document.title = "Hotstat.us: " + str;
        },
        url: function url(hero) {
            var url = Routing.generate("hero", { heroProperName: hero });
            history.replaceState(hero, hero, url);
        },
        showInitialCollapse: function showInitialCollapse() {
            $('#average_stats').collapse('show');
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
        generateTable: function generateTable() {
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
    medals: {
        generateMedalsPane: function generateMedalsPane(medals) {
            if (medals.length > 0) {
                var self = HeroLoader.data.medals;

                var medalRows = '';
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = medals[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var medal = _step4.value;

                        medalRows += self.generateMedalRow(medal);
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

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = self.internal.charts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var chart = _step5.value;

                    chart.destroy();
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            self.internal.charts.length = 0;

            $('#hl-graphs').empty();
        }
    },
    matchups: {
        generateMatchupsContainer: function generateMatchupsContainer() {
            $('#hl-matchups-container').append('<div class="hotstatus-subcontainer"><div class="row"><div class="col-lg-6 padding-lg-right-0"><div id="hl-matchups-foes-container"></div></div>' + '<div class="col-lg-6 padding-lg-left-0"><div id="hl-matchups-friends-container"></div></div></div></div>');
        },
        generateTableData: function generateTableData(hero, matchupData) {
            var self = HeroLoader.data.matchups;

            var imageField = '<img class="hl-matchups-image" src="' + matchupData.image + '">';

            var heroField = '<span class="hl-row-height">' + hero + '</span>';

            var heroSortField = matchupData.name_sort;
            var roleField = matchupData.role_blizzard;
            var roleSpecificField = matchupData.role_specific;

            var playedField = '<span class="hl-row-height">' + matchupData.played + '</span>';

            var winrateField = '<span class="hl-row-height">' + matchupData.winrate_display + '</span>';

            return [imageField, heroField, heroSortField, roleField, roleSpecificField, playedField, winrateField];
        },
        generateFoesTable: function generateFoesTable() {
            $('#hl-matchups-foes-container').append('<table id="hl-matchups-foes-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateFriendsTable: function generateFriendsTable() {
            $('#hl-matchups-friends-container').append('<table id="hl-matchups-friends-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        getFoesTableConfig: function getFoesTableConfig(rowLength) {
            var datatable = {};

            //Columns definition
            datatable.columns = [{ "width": "10%", "bSortable": false, "searchable": false }, { "title": 'Foe', "width": "30%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'] }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Played Against', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Wins Against', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[6, 'asc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        getFriendsTableConfig: function getFriendsTableConfig(rowLength) {
            var datatable = {};

            //Columns definition
            datatable.columns = [{ "width": "10%", "bSortable": false, "searchable": false }, { "title": 'Friend', "width": "30%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'] }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Played With', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Wins With', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[6, 'desc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = rowLength > datatable.pageLength; //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom = "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        initFoesTable: function initFoesTable(dataTableConfig) {
            $('#hl-matchups-foes-table').DataTable(dataTableConfig);
        },
        initFriendsTable: function initFriendsTable(dataTableConfig) {
            $('#hl-matchups-friends-table').DataTable(dataTableConfig);
        },
        empty: function empty() {
            $('#hl-matchups-container').empty();
        }
    }
};

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('herodata_pagedata_hero');
    var filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Show initial collapses
    //HeroLoader.data.window.showInitialCollapse();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTdhNDk3YjIyZjg2NDJmZjlkNzUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX21lZGFscyIsIm1lZGFscyIsImRhdGFfZ3JhcGhzIiwiZ3JhcGhzIiwiZGF0YV9tYXRjaHVwcyIsIm1hdGNodXBzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwianNvbl9idWlsZHMiLCJqc29uX21lZGFscyIsImpzb25fc3RhdE1hdHJpeCIsImpzb25fbWF0Y2h1cHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJhYmlsaXR5T3JkZXIiLCJiZWdpbklubmVyIiwiYWJpbGl0eSIsImdlbmVyYXRlIiwiZ2VuZXJhdGVUYWJsZSIsInRhbGVudHNfZGF0YXRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJ0YWxlbnRzQ29sbGFwc2VkIiwiciIsInJrZXkiLCJ0aWVyIiwiYyIsImNrZXkiLCJ0YWxlbnQiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiaW5pdFRhYmxlIiwiYnVpbGRzX2RhdGF0YWJsZSIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJia2V5IiwiYnVpbGQiLCJwaWNrcmF0ZSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJnZW5lcmF0ZU1lZGFsc1BhbmUiLCJnZW5lcmF0ZVN0YXRNYXRyaXgiLCJnZW5lcmF0ZVNwYWNlciIsImdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lciIsImdlbmVyYXRlRm9lc1RhYmxlIiwibWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSIsImdldEZvZXNUYWJsZUNvbmZpZyIsIm1rZXkiLCJmb2VzIiwibWF0Y2h1cCIsImluaXRGb2VzVGFibGUiLCJnZW5lcmF0ZUZyaWVuZHNUYWJsZSIsIm1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUiLCJnZXRGcmllbmRzVGFibGVDb25maWciLCJmcmllbmRzIiwiaW5pdEZyaWVuZHNUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInNob3dJbml0aWFsQ29sbGFwc2UiLCJjb2xsYXBzZSIsInVuaXZlcnNlIiwiZGlmZmljdWx0eSIsInJvbGVCbGl6emFyZCIsInJvbGVTcGVjaWZpYyIsInRhZ2xpbmUiLCJiaW8iLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwicmFyaXR5Iiwia2V5IiwiYXZnIiwicG1pbiIsImh0bWwiLCJyYXd2YWwiLCJkZXNjIiwiaW1hZ2VwYXRoIiwiaW1hZ2VfYmFzZV9wYXRoIiwicm93SWQiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsImRhdGF0YWJsZSIsImNvbHVtbnMiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsIm9yZGVyIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsImJ1aWxkVGFsZW50cyIsInRhbGVudE5hbWVJbnRlcm5hbCIsImdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSIsInRoYXQiLCJyb3dMZW5ndGgiLCJwYWdlTGVuZ3RoIiwibWVkYWxSb3dzIiwibWVkYWwiLCJnZW5lcmF0ZU1lZGFsUm93IiwiZ2VuZXJhdGVNZWRhbEltYWdlIiwiZ2VuZXJhdGVNZWRhbEVudHJ5IiwiZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhciIsImltYWdlX2JsdWUiLCJ2YWx1ZSIsImNoYXJ0cyIsImluaXQiLCJlbmFibGVkIiwicmVzaXplIiwid2lkdGhCcmVha3BvaW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJhZGRDbGFzcyIsIndpbnJhdGVzIiwiYXZnV2lucmF0ZSIsImN3aW5yYXRlcyIsImNhdmd3aW5yYXRlIiwid2tleSIsImxhYmVscyIsImRhdGFzZXRzIiwibGFiZWwiLCJib3JkZXJDb2xvciIsImJvcmRlcldpZHRoIiwicG9pbnRSYWRpdXMiLCJmaWxsIiwiYmFja2dyb3VuZENvbG9yIiwib3B0aW9ucyIsImFuaW1hdGlvbiIsIm1haW50YWluQXNwZWN0UmF0aW8iLCJsZWdlbmQiLCJkaXNwbGF5Iiwic2NhbGVzIiwieUF4ZXMiLCJzY2FsZUxhYmVsIiwibGFiZWxTdHJpbmciLCJmb250Q29sb3IiLCJmb250U2l6ZSIsInRpY2tzIiwiY2FsbGJhY2siLCJpbmRleCIsInZhbHVlcyIsImdyaWRMaW5lcyIsImxpbmVXaWR0aCIsInhBeGVzIiwiYXV0b1NraXAiLCJsYWJlbE9mZnNldCIsIm1pblJvdGF0aW9uIiwibWF4Um90YXRpb24iLCJjaGFydCIsIkNoYXJ0IiwiaGVyb1N0YXRNYXRyaXgiLCJtYXRyaXhLZXlzIiwibWF0cml4VmFscyIsInNta2V5IiwidG9vbHRpcHMiLCJob3ZlciIsIm1vZGUiLCJzY2FsZSIsInBvaW50TGFiZWxzIiwiZm9udEZhbWlseSIsImZvbnRTdHlsZSIsIm1heFRpY2tzTGltaXQiLCJtaW4iLCJtYXgiLCJhbmdsZUxpbmVzIiwiZGVzdHJveSIsIm1hdGNodXBEYXRhIiwiaW1hZ2VGaWVsZCIsImhlcm9GaWVsZCIsImhlcm9Tb3J0RmllbGQiLCJuYW1lX3NvcnQiLCJyb2xlRmllbGQiLCJyb2xlX2JsaXp6YXJkIiwicm9sZVNwZWNpZmljRmllbGQiLCJyb2xlX3NwZWNpZmljIiwicGxheWVkRmllbGQiLCJwbGF5ZWQiLCJwYWdpbmdUeXBlIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFB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QWQ7QUFDQSxRQUFJOUQsY0FBYyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQWxCO0FBQ0FJLG9CQUFnQjRRLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q2hSLFdBQXhDO0FBQ0FILGVBQVdDLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0FILGVBQVdjLElBQVgsQ0FBZ0JjLE1BQWhCLENBQXVCNkssTUFBdkI7QUFDQTFLLE1BQUVnQixNQUFGLEVBQVUwSixNQUFWLENBQWlCLFlBQVU7QUFDdkJ6TSxtQkFBV2MsSUFBWCxDQUFnQmMsTUFBaEIsQ0FBdUI2SyxNQUF2QjtBQUNILEtBRkQ7O0FBSUE7QUFDQTFLLE1BQUUsd0JBQUYsRUFBNEJxUCxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JEOVEsd0JBQWdCNFEsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDaFIsV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0E0QixNQUFFLEdBQUYsRUFBT3FQLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeEN0UixtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBM0JELEUiLCJmaWxlIjoiaGVyby1sb2FkZXIuZTk0NTM3NGJlNmM4MDA4ZTcyMTUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZTdhNDk3YjIyZjg2NDJmZjlkNzUiLCIvKlxyXG4gKiBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX2FiaWxpdGllcyA9IGRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWVkYWxzID0gZGF0YS5tZWRhbHM7XHJcbiAgICAgICAgbGV0IGRhdGFfZ3JhcGhzID0gZGF0YS5ncmFwaHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2h1cHMgPSBkYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL0FqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2RhdGEgPSBqc29uWydoZXJvZGF0YSddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdHMgPSBqc29uWydzdGF0cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYWJpbGl0aWVzID0ganNvblsnYWJpbGl0aWVzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYnVpbGRzID0ganNvblsnYnVpbGRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tZWRhbHMgPSBqc29uWydtZWRhbHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRNYXRyaXggPSBqc29uWydzdGF0TWF0cml4J107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaHVwcyA9IGpzb25bJ21hdGNodXBzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21lZGFscy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBXaW5kb3dcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudGl0bGUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnVybChqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBpbWFnZSBjb21wb3NpdGUgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXIoanNvbl9oZXJvZGF0YVsndW5pdmVyc2UnXSwganNvbl9oZXJvZGF0YVsnZGlmZmljdWx0eSddLFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25faGVyb2RhdGFbJ3JvbGVfYmxpenphcmQnXSwganNvbl9oZXJvZGF0YVsncm9sZV9zcGVjaWZpYyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25faGVyb2RhdGFbJ2Rlc2NfdGFnbGluZSddLCBqc29uX2hlcm9kYXRhWydkZXNjX2JpbyddKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSwganNvbl9oZXJvZGF0YVsncmFyaXR5J10pO1xyXG4gICAgICAgICAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLm5hbWUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGl0bGVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEudGl0bGUoanNvbl9oZXJvZGF0YVsndGl0bGUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBBYmlsaXRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFiaWxpdHlPcmRlciA9IFtcIk5vcm1hbFwiLCBcIkhlcm9pY1wiLCBcIlRyYWl0XCJdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBhYmlsaXR5T3JkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5iZWdpbklubmVyKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFiaWxpdHkgb2YganNvbl9hYmlsaXRpZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuZ2VuZXJhdGUodHlwZSwgYWJpbGl0eVsnbmFtZSddLCBhYmlsaXR5WydkZXNjX3NpbXBsZSddLCBhYmlsaXR5WydpbWFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgVGFsZW50cyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c19kYXRhdGFibGUgPSBkYXRhX3RhbGVudHMuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgdGFsZW50cyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGFsZW50c19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ29sbGFwc2VkIG9iamVjdCBvZiBhbGwgdGFsZW50cyBmb3IgaGVybywgZm9yIHVzZSB3aXRoIGRpc3BsYXlpbmcgYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c0NvbGxhcHNlZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRhbGVudCB0YWJsZSB0byBjb2xsZWN0IHRhbGVudHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSBqc29uX3RhbGVudHNbJ21pblJvdyddOyByIDw9IGpzb25fdGFsZW50c1snbWF4Um93J107IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBya2V5ID0gciArICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWVyID0ganNvbl90YWxlbnRzW3JrZXldWyd0aWVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQnVpbGQgY29sdW1ucyBmb3IgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IGpzb25fdGFsZW50c1tya2V5XVsnbWluQ29sJ107IGMgPD0ganNvbl90YWxlbnRzW3JrZXldWydtYXhDb2wnXTsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBja2V5ID0gYyArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNDb2xsYXBzZWRbdGFsZW50WyduYW1lX2ludGVybmFsJ11dID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhbGVudFsnaW1hZ2UnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGVEYXRhKHIsIGMsIHRpZXIsIHRhbGVudFsnbmFtZSddLCB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNZWRhbHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZ2VuZXJhdGVNZWRhbHNQYW5lKGpzb25fbWVkYWxzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogR3JhcGhzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU3RhdCBNYXRyaXhcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3RhdE1hdHJpeChqc29uX3N0YXRNYXRyaXgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIE1hdGNoIExlbmd0aFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGgoanNvbl9zdGF0c1sncmFuZ2VfbWF0Y2hfbGVuZ3RoJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIEhlcm8gTGV2ZWxcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaChqc29uX3N0YXRzWydyYW5nZV9oZXJvX2xldmVsJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNYXRjaHVwc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwc1snZm9lc19jb3VudCddID4gMCB8fCBqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBtYXRjaHVwcyBjb250YWluZXJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmdlbmVyYXRlTWF0Y2h1cHNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgKiBGb2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHNbJ2ZvZXNfY291bnQnXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9EZWZpbmUgTWF0Y2h1cCBEYXRhVGFibGVzIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZUZvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXBfZm9lc19kYXRhdGFibGUgPSBkYXRhX21hdGNodXBzLmdldEZvZXNUYWJsZUNvbmZpZyhqc29uX21hdGNodXBzWydmb2VzX2NvdW50J10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGZvZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWtleSBpbiBqc29uX21hdGNodXBzLmZvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzLmZvZXMuaGFzT3duUHJvcGVydHkobWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cCA9IGpzb25fbWF0Y2h1cHMuZm9lc1tta2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZm9lc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVUYWJsZURhdGEobWtleSwgbWF0Y2h1cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXQgTWF0Y2h1cCBEYXRhVGFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuaW5pdEZvZXNUYWJsZShtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgICogRnJpZW5kc1xyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRGVmaW5lIE1hdGNodXAgRGF0YVRhYmxlcyBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVGcmllbmRzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlID0gZGF0YV9tYXRjaHVwcy5nZXRGcmllbmRzVGFibGVDb25maWcoanNvbl9tYXRjaHVwc1snZnJpZW5kc19jb3VudCddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBmcmllbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1rZXkgaW4ganNvbl9tYXRjaHVwcy5mcmllbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwcy5mcmllbmRzLmhhc093blByb3BlcnR5KG1rZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXAgPSBqc29uX21hdGNodXBzLmZyaWVuZHNbbWtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX21hdGNodXBzLmdlbmVyYXRlVGFibGVEYXRhKG1rZXksIG1hdGNodXApKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0IE1hdGNodXAgRGF0YVRhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmluaXRGcmllbmRzVGFibGUobWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB3aW5kb3c6IHtcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCJIb3RzdGF0LnVzOiBcIiArIHN0cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93SW5pdGlhbENvbGxhcHNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2F2ZXJhZ2Vfc3RhdHMnKS5jb2xsYXBzZSgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmhlcm9kYXRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvb2x0aXBUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVxcJ3Rvb2x0aXBcXCcgcm9sZT1cXCd0b29sdGlwXFwnPjxkaXYgY2xhc3M9XFwnYXJyb3dcXCc+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdoZXJvZGF0YS1iaW8gdG9vbHRpcC1pbm5lclxcJz48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS10ZW1wbGF0ZT1cIicgKyB0b29sdGlwVGVtcGxhdGUgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYuaW1hZ2VfaGVyb190b29sdGlwKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSArICdcIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PHNwYW4gaWQ9XCJobC1oZXJvZGF0YS10aXRsZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKGltYWdlLCByYXJpdHkpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVybyBobC1oZXJvZGF0YS1yYXJpdHktJyArIHJhcml0eSArICdcIiBzcmM9XCInICsgaW1hZ2UgKyAnXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvX3Rvb2x0aXA6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC11bml2ZXJzZVxcJz5bJyArIHVuaXZlcnNlICsgJ108L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtcm9sZVxcJz4nICsgcm9sZUJsaXp6YXJkICsgJyAtICcgKyByb2xlU3BlY2lmaWMgKyAnPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLWRpZmZpY3VsdHlcXCc+KERpZmZpY3VsdHk6ICcgKyBkaWZmaWN1bHR5ICsgJyk8L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyB0YWdsaW5lICsgJzwvc3Bhbj48YnI+JyArIGJpbztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhYmlsaXRpZXM6IHtcclxuICAgICAgICBiZWdpbklubmVyOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSArICdcIiBjbGFzcz1cImhsLWFiaWxpdGllcy1pbm5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MsIGltYWdlcGF0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcCh0eXBlLCBuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VwYXRoICsgJ1wiPjxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZS1mcmFtZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyAndWkvYWJpbGl0eV9pY29uX2ZyYW1lLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJIZXJvaWNcIiB8fCB0eXBlID09PSBcIlRyYWl0XCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtJyArIHR5cGUgKyAnXFwnPlsnICsgdHlwZSArICddPC9zcGFuPjxicj48c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0YWxlbnRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24ociwgYywgdGllciwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZSArICdcIj4nICtcclxuICAgICAgICAgICAgJyA8c3BhbiBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LW5hbWVcIj4nICsgbmFtZSArICc8L3NwYW4+PC9zcGFuPjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5ICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyLCBjLCB0aWVyLCB0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfUm93XCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX0NvbFwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllclwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50XCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXSwgWzEsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwaSA9IHRoaXMuYXBpKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm93cyA9IGFwaS5yb3dzKHtwYWdlOiAnY3VycmVudCd9KS5ub2RlcygpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGFwaS5jb2x1bW4oMiwge3BhZ2U6ICdjdXJyZW50J30pLmRhdGEoKS5lYWNoKGZ1bmN0aW9uIChncm91cCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSBncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHJvd3MpLmVxKGkpLmJlZm9yZSgnPHRyIGNsYXNzPVwiZ3JvdXAgdGllclwiPjx0ZCBjb2xzcGFuPVwiN1wiPicgKyBncm91cCArICc8L3RkPjwvdHI+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gZ3JvdXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkczoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLWJ1aWxkcy10YWJsZVwiIGNsYXNzPVwiaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24odGFsZW50cywgYnVpbGRUYWxlbnRzLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuYnVpbGRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhbGVudE5hbWVJbnRlcm5hbCBvZiBidWlsZFRhbGVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YWxlbnRzLmhhc093blByb3BlcnR5KHRhbGVudE5hbWVJbnRlcm5hbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gdGFsZW50c1t0YWxlbnROYW1lSW50ZXJuYWxdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRGaWVsZCArPSBzZWxmLmdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlLCB0YWxlbnQuaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3RhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIGRlc2MsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aGF0ID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgdGhhdC50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLWJ1aWxkcy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2UgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnQgQnVpbGRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnQnVpbGQgRGF0YSBpcyBjdXJyZW50bHkgbGltaXRlZCBmb3IgdGhpcyBIZXJvLiBJbmNyZWFzZSBkYXRlIHJhbmdlIG9yIHdhaXQgZm9yIG1vcmUgZGF0YS4nIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzEsICdkZXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSA1OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVfbnVtYmVyc1wiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBtZWRhbHM6IHtcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsc1BhbmU6IGZ1bmN0aW9uIChtZWRhbHMpIHtcclxuICAgICAgICAgICAgaWYgKG1lZGFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1lZGFsUm93cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWVkYWwgb2YgbWVkYWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVkYWxSb3dzICs9IHNlbGYuZ2VuZXJhdGVNZWRhbFJvdyhtZWRhbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbFwiPjxkaXYgY2xhc3M9XCJob3RzdGF0dXMtc3ViY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtc3RhdHMtdGl0bGVcIj5Ub3AgTWVkYWxzPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbCBwYWRkaW5nLWhvcml6b250YWwtMFwiPicgKyBtZWRhbFJvd3MgKyAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsUm93OiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICdcIj48ZGl2IGNsYXNzPVwicm93IGhsLW1lZGFscy1yb3dcIj48ZGl2IGNsYXNzPVwiY29sXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxJbWFnZShtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbCBobC1uby13cmFwXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEVudHJ5KG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhcihtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsSW1hZ2U6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PGltZyBjbGFzcz1cImhsLW1lZGFscy1pbWFnZVwiIHNyYz1cIicgKyBtZWRhbC5pbWFnZV9ibHVlICsgJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnk6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PHNwYW4gY2xhc3M9XCJobC1tZWRhbHMtbmFtZVwiPicgKyBtZWRhbC5uYW1lICsgJzwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhcjogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLXBlcmNlbnRiYXJcIiBzdHlsZT1cIndpZHRoOicgKyAobWVkYWwudmFsdWUgKiAxMDApICsgJyVcIj48L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdyYXBoczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNoYXJ0czogW10sXHJcbiAgICAgICAgICAgIGNvbGxhcHNlOiB7XHJcbiAgICAgICAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2l6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuICAgICAgICAgICAgbGV0IHdpZHRoQnJlYWtwb2ludCA9IDk5MjtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIDwgd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3BhY2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWdyYXBoLXNwYWNlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1hdGNoIExlbmd0aCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiTWF0Y2ggTGVuZ3RoIChNaW51dGVzKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhlcm8gTGV2ZWwgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIkhlcm8gTGV2ZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVN0YXRNYXRyaXg6IGZ1bmN0aW9uKGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9HZXQgbWF0cml4IGtleXNcclxuICAgICAgICAgICAgbGV0IG1hdHJpeEtleXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeFZhbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc21rZXkgaW4gaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvU3RhdE1hdHJpeC5oYXNPd25Qcm9wZXJ0eShzbWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhLZXlzLnB1c2goc21rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFZhbHMucHVzaChoZXJvU3RhdE1hdHJpeFtzbWtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogbWF0cml4S2V5cyxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRyaXhWYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNjUsIDI1NSwgMjQ4LCAxKVwiLCAvLyNhNWZmZjhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWwgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAxLjBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydCBvZiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hdGNodXBzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJob3RzdGF0dXMtc3ViY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wtbGctNiBwYWRkaW5nLWxnLXJpZ2h0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLWxnLTYgcGFkZGluZy1sZy1sZWZ0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvLCBtYXRjaHVwRGF0YSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5tYXRjaHVwcztcclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZUZpZWxkID0gJzxpbWcgY2xhc3M9XCJobC1tYXRjaHVwcy1pbWFnZVwiIHNyYz1cIicgKyBtYXRjaHVwRGF0YS5pbWFnZSArICdcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9GaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgaGVybyArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvU29ydEZpZWxkID0gbWF0Y2h1cERhdGEubmFtZV9zb3J0O1xyXG4gICAgICAgICAgICBsZXQgcm9sZUZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9ibGl6emFyZDtcclxuICAgICAgICAgICAgbGV0IHJvbGVTcGVjaWZpY0ZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZWRGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEucGxheWVkICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEud2lucmF0ZV9kaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtpbWFnZUZpZWxkLCBoZXJvRmllbGQsIGhlcm9Tb3J0RmllbGQsIHJvbGVGaWVsZCwgcm9sZVNwZWNpZmljRmllbGQsIHBsYXllZEZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZvZXMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGcmllbmRzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZyaWVuZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9lc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGb2UnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgQWdhaW5zdCcsIFwid2lkdGhcIjogXCIzMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIEFnYWluc3QnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzYsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZyaWVuZHNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1wid2lkdGhcIjogXCIxMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2UsIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRnJpZW5kJywgXCJ3aWR0aFwiOiBcIjMwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJpRGF0YVNvcnRcIjogMiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXX0sIC8vaURhdGFTb3J0IHRlbGxzIHdoaWNoIGNvbHVtbiBzaG91bGQgYmUgdXNlZCBhcyB0aGUgc29ydCB2YWx1ZSwgaW4gdGhpcyBjYXNlIEhlcm9fU29ydFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUGxheWVkIFdpdGgnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnV2lucyBXaXRoJywgXCJ3aWR0aFwiOiBcIjMwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1s2LCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZvZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mb2VzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0RnJpZW5kc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWZyaWVuZHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdoZXJvZGF0YV9wYWdlZGF0YV9oZXJvJyk7XHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJoZXJvXCIsIFwiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9TaG93IGluaXRpYWwgY29sbGFwc2VzXHJcbiAgICAvL0hlcm9Mb2FkZXIuZGF0YS53aW5kb3cuc2hvd0luaXRpYWxDb2xsYXBzZSgpO1xyXG5cclxuICAgIC8vVHJhY2sgd2luZG93IHdpZHRoIGFuZCB0b2dnbGUgY29sbGFwc2FiaWxpdHkgZm9yIGdyYXBocyBwYW5lXHJcbiAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpe1xyXG4gICAgICAgIEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9