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
            data_herodata.generateImageCompositeContainer(json_herodata['universe'], json_herodata['difficulty'], json_herodata['role_blizzard'], json_herodata['role_specific'], json_herodata['desc_tagline'], json_herodata['desc_bio'], json.last_updated);
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
        generateImageCompositeContainer: function generateImageCompositeContainer(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) {
            var self = HeroLoader.data.herodata;

            var tooltipTemplate = '<div class=\'tooltip\' role=\'tooltip\'><div class=\'arrow\'></div>' + '<div class=\'herodata-bio tooltip-inner\'></div></div>';

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-template="' + tooltipTemplate + '" ' + 'data-html="true" title="' + self.image_hero_tooltip(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) + '"><div id="hl-herodata-image-hero-container"></div>' + '<span id="hl-herodata-name"></span><span id="hl-herodata-title"></span></span>');
        },
        name: function name(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function title(val) {
            $('#hl-herodata-title').text(val);
        },
        image_hero: function image_hero(image, rarity) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero hl-herodata-rarity-' + rarity + '" src="' + image_base_path + image + '.png">');
        },
        image_hero_tooltip: function image_hero_tooltip(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) {
            var date = new Date(last_updated_timestamp * 1000).toLocaleString();

            return '<span class=\'hl-herodata-tooltip-universe\'>[' + universe + ']</span><br>' + '<span class=\'hl-herodata-tooltip-role\'>' + roleBlizzard + ' - ' + roleSpecific + '</span><br>' + '<span class=\'hl-herodata-tooltip-difficulty\'>(Difficulty: ' + difficulty + ')</span><br>' + '<span class=\'hl-talents-tooltip-name\'>' + tagline + '</span><br>' + bio + '<br>' + '<div class=\'lastupdated-text\'>Last Updated: ' + date + '.</div>';
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
            $('#hl-abilities-inner-' + type).append('<div class="hl-abilities-ability"><span data-toggle="tooltip" data-html="true" title="' + self.tooltip(type, name, desc) + '">' + '<img class="hl-abilities-ability-image" src="' + image_base_path + imagepath + '.png"><img class="hl-abilities-ability-image-frame" src="' + image_base_path + 'ui/ability_icon_frame.png">' + '</span></div>');
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
                emptyTable: 'Build Data is currently limited for this Hero. Increase date range or wait for more data.' //Message when table is empty regardless of filtering
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

            var imageField = '<img class="hl-matchups-image" src="' + image_base_path + matchupData.image + '.png">';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmUxNjQwZjI1MDIzZTk1OWRmYmYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX21lZGFscyIsIm1lZGFscyIsImRhdGFfZ3JhcGhzIiwiZ3JhcGhzIiwiZGF0YV9tYXRjaHVwcyIsIm1hdGNodXBzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwianNvbl9idWlsZHMiLCJqc29uX21lZGFscyIsImpzb25fc3RhdE1hdHJpeCIsImpzb25fbWF0Y2h1cHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJhYmlsaXR5T3JkZXIiLCJiZWdpbklubmVyIiwiYWJpbGl0eSIsImdlbmVyYXRlIiwiZ2VuZXJhdGVUYWJsZSIsInRhbGVudHNfZGF0YXRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJ0YWxlbnRzQ29sbGFwc2VkIiwiciIsInJrZXkiLCJ0aWVyIiwiYyIsImNrZXkiLCJ0YWxlbnQiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiaW5pdFRhYmxlIiwiYnVpbGRzX2RhdGF0YWJsZSIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJia2V5IiwiYnVpbGQiLCJwaWNrcmF0ZSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJnZW5lcmF0ZU1lZGFsc1BhbmUiLCJnZW5lcmF0ZVN0YXRNYXRyaXgiLCJnZW5lcmF0ZVNwYWNlciIsImdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lciIsImdlbmVyYXRlRm9lc1RhYmxlIiwibWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSIsImdldEZvZXNUYWJsZUNvbmZpZyIsIm1rZXkiLCJmb2VzIiwibWF0Y2h1cCIsImluaXRGb2VzVGFibGUiLCJnZW5lcmF0ZUZyaWVuZHNUYWJsZSIsIm1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUiLCJnZXRGcmllbmRzVGFibGVDb25maWciLCJmcmllbmRzIiwiaW5pdEZyaWVuZHNUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInNob3dJbml0aWFsQ29sbGFwc2UiLCJjb2xsYXBzZSIsInVuaXZlcnNlIiwiZGlmZmljdWx0eSIsInJvbGVCbGl6emFyZCIsInJvbGVTcGVjaWZpYyIsInRhZ2xpbmUiLCJiaW8iLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwidG9vbHRpcFRlbXBsYXRlIiwiYXBwZW5kIiwiaW1hZ2VfaGVyb190b29sdGlwIiwidmFsIiwidGV4dCIsInJhcml0eSIsImltYWdlX2Jhc2VfcGF0aCIsImRhdGUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJrZXkiLCJhdmciLCJwbWluIiwiaHRtbCIsInJhd3ZhbCIsImRlc2MiLCJpbWFnZXBhdGgiLCJyb3dJZCIsIndpbnJhdGVEaXNwbGF5IiwidGFsZW50RmllbGQiLCJwaWNrcmF0ZUZpZWxkIiwicG9wdWxhcml0eUZpZWxkIiwid2lucmF0ZUZpZWxkIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwib3JkZXIiLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJkcmF3Q2FsbGJhY2siLCJzZXR0aW5ncyIsImFwaSIsInJvd3MiLCJwYWdlIiwibm9kZXMiLCJsYXN0IiwiY29sdW1uIiwiZWFjaCIsImdyb3VwIiwiaSIsImVxIiwiYmVmb3JlIiwiYnVpbGRUYWxlbnRzIiwidGFsZW50TmFtZUludGVybmFsIiwiZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlIiwidGhhdCIsInJvd0xlbmd0aCIsInBhZ2VMZW5ndGgiLCJtZWRhbFJvd3MiLCJtZWRhbCIsImdlbmVyYXRlTWVkYWxSb3ciLCJnZW5lcmF0ZU1lZGFsSW1hZ2UiLCJnZW5lcmF0ZU1lZGFsRW50cnkiLCJnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyIiwiaW1hZ2VfYmx1ZSIsInZhbHVlIiwiY2hhcnRzIiwiaW5pdCIsImVuYWJsZWQiLCJyZXNpemUiLCJ3aWR0aEJyZWFrcG9pbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImFkZENsYXNzIiwid2lucmF0ZXMiLCJhdmdXaW5yYXRlIiwiY3dpbnJhdGVzIiwiY2F2Z3dpbnJhdGUiLCJ3a2V5IiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJvcmRlckNvbG9yIiwiYm9yZGVyV2lkdGgiLCJwb2ludFJhZGl1cyIsImZpbGwiLCJiYWNrZ3JvdW5kQ29sb3IiLCJvcHRpb25zIiwiYW5pbWF0aW9uIiwibWFpbnRhaW5Bc3BlY3RSYXRpbyIsImxlZ2VuZCIsImRpc3BsYXkiLCJzY2FsZXMiLCJ5QXhlcyIsInNjYWxlTGFiZWwiLCJsYWJlbFN0cmluZyIsImZvbnRDb2xvciIsImZvbnRTaXplIiwidGlja3MiLCJjYWxsYmFjayIsImluZGV4IiwidmFsdWVzIiwiZ3JpZExpbmVzIiwibGluZVdpZHRoIiwieEF4ZXMiLCJhdXRvU2tpcCIsImxhYmVsT2Zmc2V0IiwibWluUm90YXRpb24iLCJtYXhSb3RhdGlvbiIsImNoYXJ0IiwiQ2hhcnQiLCJoZXJvU3RhdE1hdHJpeCIsIm1hdHJpeEtleXMiLCJtYXRyaXhWYWxzIiwic21rZXkiLCJ0b29sdGlwcyIsImhvdmVyIiwibW9kZSIsInNjYWxlIiwicG9pbnRMYWJlbHMiLCJmb250RmFtaWx5IiwiZm9udFN0eWxlIiwibWF4VGlja3NMaW1pdCIsIm1pbiIsIm1heCIsImFuZ2xlTGluZXMiLCJkZXN0cm95IiwibWF0Y2h1cERhdGEiLCJpbWFnZUZpZWxkIiwiaGVyb0ZpZWxkIiwiaGVyb1NvcnRGaWVsZCIsIm5hbWVfc29ydCIsInJvbGVGaWVsZCIsInJvbGVfYmxpenphcmQiLCJyb2xlU3BlY2lmaWNGaWVsZCIsInJvbGVfc3BlY2lmaWMiLCJwbGF5ZWRGaWVsZCIsInBsYXllZCIsInBhZ2luZ1R5cGUiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxl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Q3hDM1IsbUJBQVdDLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQTNCRCxFIiwiZmlsZSI6Imhlcm8tbG9hZGVyLjg3Njg0MWVkMzQyNGQzYmViMmFjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGZlMTY0MGYyNTAyM2U5NTlkZmJmIiwiLypcclxuICogSGVybyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIGhlcm8gZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IEhlcm9Mb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLnZhbGlkYXRlTG9hZCA9IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICBpZiAoIUhlcm9Mb2FkZXIuYWpheC5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHVybCAhPT0gSGVyb0xvYWRlci5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIEhlcm9Mb2FkZXIuYWpheC51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmFqYXggPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBoZXJvIGxvYWRlciBpcyBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuYWpheDtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuYWpheDtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBIZXJvTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfaGVyb2RhdGEgPSBkYXRhLmhlcm9kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3N0YXRzID0gZGF0YS5zdGF0cztcclxuICAgICAgICBsZXQgZGF0YV9hYmlsaXRpZXMgPSBkYXRhLmFiaWxpdGllcztcclxuICAgICAgICBsZXQgZGF0YV90YWxlbnRzID0gZGF0YS50YWxlbnRzO1xyXG4gICAgICAgIGxldCBkYXRhX2J1aWxkcyA9IGRhdGEuYnVpbGRzO1xyXG4gICAgICAgIGxldCBkYXRhX21lZGFscyA9IGRhdGEubWVkYWxzO1xyXG4gICAgICAgIGxldCBkYXRhX2dyYXBocyA9IGRhdGEuZ3JhcGhzO1xyXG4gICAgICAgIGxldCBkYXRhX21hdGNodXBzID0gZGF0YS5tYXRjaHVwcztcclxuXHJcbiAgICAgICAgLy9FbmFibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKCcjaGVyb2xvYWRlci1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiaGVyb2xvYWRlci1wcm9jZXNzaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgLy9BamF4IFJlcXVlc3RcclxuICAgICAgICAkLmdldEpTT04oc2VsZi5pbnRlcm5hbC51cmwpXHJcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGpzb25SZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBqc29uUmVzcG9uc2Vbc2VsZi5pbnRlcm5hbC5kYXRhU3JjXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2hlcm9kYXRhID0ganNvblsnaGVyb2RhdGEnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRzID0ganNvblsnc3RhdHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2FiaWxpdGllcyA9IGpzb25bJ2FiaWxpdGllcyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fdGFsZW50cyA9IGpzb25bJ3RhbGVudHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX2J1aWxkcyA9IGpzb25bJ2J1aWxkcyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWVkYWxzID0ganNvblsnbWVkYWxzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0TWF0cml4ID0ganNvblsnc3RhdE1hdHJpeCddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fbWF0Y2h1cHMgPSBqc29uWydtYXRjaHVwcyddO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJy5pbml0aWFsLWxvYWQnKS5yZW1vdmVDbGFzcygnaW5pdGlhbC1sb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFdpbmRvd1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy50aXRsZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudXJsKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9kYXRhXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGltYWdlIGNvbXBvc2l0ZSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lcihqc29uX2hlcm9kYXRhWyd1bml2ZXJzZSddLCBqc29uX2hlcm9kYXRhWydkaWZmaWN1bHR5J10sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbl9oZXJvZGF0YVsncm9sZV9ibGl6emFyZCddLCBqc29uX2hlcm9kYXRhWydyb2xlX3NwZWNpZmljJ10sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10sIGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10sIGpzb24ubGFzdF91cGRhdGVkKTtcclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSwganNvbl9oZXJvZGF0YVsncmFyaXR5J10pO1xyXG4gICAgICAgICAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLm5hbWUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGl0bGVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEudGl0bGUoanNvbl9oZXJvZGF0YVsndGl0bGUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFN0YXRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRrZXkgaW4gYXZlcmFnZV9zdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmVyYWdlX3N0YXRzLmhhc093blByb3BlcnR5KHN0YXRrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gYXZlcmFnZV9zdGF0c1tzdGF0a2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LnR5cGUgPT09ICdhdmctcG1pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMuYXZnX3BtaW4oc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddLCBqc29uX3N0YXRzW3N0YXRrZXldWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3BlcmNlbnRhZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnBlcmNlbnRhZ2Uoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAna2RhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5rZGEoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnJhdyhzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICd0aW1lLXNwZW50LWRlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLnRpbWVfc3BlbnRfZGVhZChzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBBYmlsaXRpZXNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGFiaWxpdHlPcmRlciA9IFtcIk5vcm1hbFwiLCBcIkhlcm9pY1wiLCBcIlRyYWl0XCJdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBhYmlsaXR5T3JkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5iZWdpbklubmVyKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFiaWxpdHkgb2YganNvbl9hYmlsaXRpZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuZ2VuZXJhdGUodHlwZSwgYWJpbGl0eVsnbmFtZSddLCBhYmlsaXR5WydkZXNjX3NpbXBsZSddLCBhYmlsaXR5WydpbWFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgVGFsZW50cyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c19kYXRhdGFibGUgPSBkYXRhX3RhbGVudHMuZ2V0VGFibGVDb25maWcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgdGFsZW50cyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGFsZW50c19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ29sbGFwc2VkIG9iamVjdCBvZiBhbGwgdGFsZW50cyBmb3IgaGVybywgZm9yIHVzZSB3aXRoIGRpc3BsYXlpbmcgYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFsZW50c0NvbGxhcHNlZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIHRhbGVudCB0YWJsZSB0byBjb2xsZWN0IHRhbGVudHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSBqc29uX3RhbGVudHNbJ21pblJvdyddOyByIDw9IGpzb25fdGFsZW50c1snbWF4Um93J107IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBya2V5ID0gciArICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWVyID0ganNvbl90YWxlbnRzW3JrZXldWyd0aWVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQnVpbGQgY29sdW1ucyBmb3IgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IGpzb25fdGFsZW50c1tya2V5XVsnbWluQ29sJ107IGMgPD0ganNvbl90YWxlbnRzW3JrZXldWydtYXhDb2wnXTsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBja2V5ID0gYyArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNDb2xsYXBzZWRbdGFsZW50WyduYW1lX2ludGVybmFsJ11dID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhbGVudFsnaW1hZ2UnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGVEYXRhKHIsIGMsIHRpZXIsIHRhbGVudFsnbmFtZSddLCB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNZWRhbHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZ2VuZXJhdGVNZWRhbHNQYW5lKGpzb25fbWVkYWxzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogR3JhcGhzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU3RhdCBNYXRyaXhcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3RhdE1hdHJpeChqc29uX3N0YXRNYXRyaXgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIE1hdGNoIExlbmd0aFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGgoanNvbl9zdGF0c1sncmFuZ2VfbWF0Y2hfbGVuZ3RoJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIEhlcm8gTGV2ZWxcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaChqc29uX3N0YXRzWydyYW5nZV9oZXJvX2xldmVsJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNYXRjaHVwc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwc1snZm9lc19jb3VudCddID4gMCB8fCBqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBtYXRjaHVwcyBjb250YWluZXJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmdlbmVyYXRlTWF0Y2h1cHNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgKiBGb2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHNbJ2ZvZXNfY291bnQnXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9EZWZpbmUgTWF0Y2h1cCBEYXRhVGFibGVzIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZUZvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXBfZm9lc19kYXRhdGFibGUgPSBkYXRhX21hdGNodXBzLmdldEZvZXNUYWJsZUNvbmZpZyhqc29uX21hdGNodXBzWydmb2VzX2NvdW50J10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGZvZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWtleSBpbiBqc29uX21hdGNodXBzLmZvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzLmZvZXMuaGFzT3duUHJvcGVydHkobWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cCA9IGpzb25fbWF0Y2h1cHMuZm9lc1tta2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZm9lc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVUYWJsZURhdGEobWtleSwgbWF0Y2h1cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXQgTWF0Y2h1cCBEYXRhVGFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuaW5pdEZvZXNUYWJsZShtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgICogRnJpZW5kc1xyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRGVmaW5lIE1hdGNodXAgRGF0YVRhYmxlcyBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVGcmllbmRzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlID0gZGF0YV9tYXRjaHVwcy5nZXRGcmllbmRzVGFibGVDb25maWcoanNvbl9tYXRjaHVwc1snZnJpZW5kc19jb3VudCddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBmcmllbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1rZXkgaW4ganNvbl9tYXRjaHVwcy5mcmllbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwcy5mcmllbmRzLmhhc093blByb3BlcnR5KG1rZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXAgPSBqc29uX21hdGNodXBzLmZyaWVuZHNbbWtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX21hdGNodXBzLmdlbmVyYXRlVGFibGVEYXRhKG1rZXksIG1hdGNodXApKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0IE1hdGNodXAgRGF0YVRhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmluaXRGcmllbmRzVGFibGUobWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB3aW5kb3c6IHtcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCJIb3RzdGF0LnVzOiBcIiArIHN0cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93SW5pdGlhbENvbGxhcHNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2F2ZXJhZ2Vfc3RhdHMnKS5jb2xsYXBzZSgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvLCBsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmhlcm9kYXRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvb2x0aXBUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVxcJ3Rvb2x0aXBcXCcgcm9sZT1cXCd0b29sdGlwXFwnPjxkaXYgY2xhc3M9XFwnYXJyb3dcXCc+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdoZXJvZGF0YS1iaW8gdG9vbHRpcC1pbm5lclxcJz48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS10ZW1wbGF0ZT1cIicgKyB0b29sdGlwVGVtcGxhdGUgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYuaW1hZ2VfaGVyb190b29sdGlwKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvLCBsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSArICdcIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PHNwYW4gaWQ9XCJobC1oZXJvZGF0YS10aXRsZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKGltYWdlLCByYXJpdHkpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVybyBobC1oZXJvZGF0YS1yYXJpdHktJyArIHJhcml0eSArICdcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVyb190b29sdGlwOiBmdW5jdGlvbih1bml2ZXJzZSwgZGlmZmljdWx0eSwgcm9sZUJsaXp6YXJkLCByb2xlU3BlY2lmaWMsIHRhZ2xpbmUsIGJpbywgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtdW5pdmVyc2VcXCc+WycgKyB1bml2ZXJzZSArICddPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLXJvbGVcXCc+JyArIHJvbGVCbGl6emFyZCArICcgLSAnICsgcm9sZVNwZWNpZmljICsgJzwvc3Bhbj48YnI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC1kaWZmaWN1bHR5XFwnPihEaWZmaWN1bHR5OiAnICsgZGlmZmljdWx0eSArICcpPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgdGFnbGluZSArICc8L3NwYW4+PGJyPicgKyBiaW8gKyAnPGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XFwnbGFzdHVwZGF0ZWQtdGV4dFxcJz5MYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKycuPC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhYmlsaXRpZXM6IHtcclxuICAgICAgICBiZWdpbklubmVyOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSArICdcIiBjbGFzcz1cImhsLWFiaWxpdGllcy1pbm5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MsIGltYWdlcGF0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcCh0eXBlLCBuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2VwYXRoICsgJy5wbmdcIj48aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2UtZnJhbWVcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgJ3VpL2FiaWxpdHlfaWNvbl9mcmFtZS5wbmdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiSGVyb2ljXCIgfHwgdHlwZSA9PT0gXCJUcmFpdFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLScgKyB0eXBlICsgJ1xcJz5bJyArIHR5cGUgKyAnXTwvc3Bhbj48YnI+PHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHIsIGMsIHRpZXIsIG5hbWUsIGRlc2MsIGltYWdlLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAnIDxzcGFuIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtbmFtZVwiPicgKyBuYW1lICsgJzwvc3Bhbj48L3NwYW4+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHkgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3IsIGMsIHRpZXIsIHRhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Sb3dcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfQ29sXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMCwgJ2FzYyddLCBbMSwgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXBpID0gdGhpcy5hcGkoKTtcclxuICAgICAgICAgICAgICAgIGxldCByb3dzID0gYXBpLnJvd3Moe3BhZ2U6ICdjdXJyZW50J30pLm5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgYXBpLmNvbHVtbigyLCB7cGFnZTogJ2N1cnJlbnQnfSkuZGF0YSgpLmVhY2goZnVuY3Rpb24gKGdyb3VwLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgIT09IGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQocm93cykuZXEoaSkuYmVmb3JlKCc8dHIgY2xhc3M9XCJncm91cCB0aWVyXCI+PHRkIGNvbHNwYW49XCI3XCI+JyArIGdyb3VwICsgJzwvdGQ+PC90cj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBncm91cDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtYnVpbGRzLXRhYmxlXCIgY2xhc3M9XCJob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbih0YWxlbnRzLCBidWlsZFRhbGVudHMsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5idWlsZHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFsZW50TmFtZUludGVybmFsIG9mIGJ1aWxkVGFsZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhbGVudHMuaGFzT3duUHJvcGVydHkodGFsZW50TmFtZUludGVybmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSB0YWxlbnRzW3RhbGVudE5hbWVJbnRlcm5hbF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUsIHRhbGVudC5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZTogZnVuY3Rpb24obmFtZSwgZGVzYywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRoYXQgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwYWdpbmF0ZWQtdG9vbHRpcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyB0aGF0LnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtYnVpbGRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnQgQnVpbGRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnQnVpbGQgRGF0YSBpcyBjdXJyZW50bHkgbGltaXRlZCBmb3IgdGhpcyBIZXJvLiBJbmNyZWFzZSBkYXRlIHJhbmdlIG9yIHdhaXQgZm9yIG1vcmUgZGF0YS4nIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzEsICdkZXNjJ10sIFszLCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgLy9kYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlX251bWJlcnNcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnBhZ2luYXRlZC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgbWVkYWxzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbHNQYW5lOiBmdW5jdGlvbiAobWVkYWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChtZWRhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtZWRhbFJvd3MgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1lZGFsIG9mIG1lZGFscykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lZGFsUm93cyArPSBzZWxmLmdlbmVyYXRlTWVkYWxSb3cobWVkYWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj48ZGl2IGNsYXNzPVwiaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLXN0YXRzLXRpdGxlXCI+VG9wIE1lZGFsczwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wgcGFkZGluZy1ob3Jpem9udGFsLTBcIj4nICsgbWVkYWxSb3dzICsgJzwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbFJvdzogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWVkYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgbWVkYWwuZGVzY19zaW1wbGUgKyAnXCI+PGRpdiBjbGFzcz1cInJvdyBobC1tZWRhbHMtcm93XCI+PGRpdiBjbGFzcz1cImNvbFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsSW1hZ2UobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wgaGwtbm8td3JhcFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeShtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXIobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEltYWdlOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxpbWcgY2xhc3M9XCJobC1tZWRhbHMtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgbWVkYWwuaW1hZ2VfYmx1ZSArICcucG5nXCI+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxFbnRyeTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48c3BhbiBjbGFzcz1cImhsLW1lZGFscy1uYW1lXCI+JyArIG1lZGFsLm5hbWUgKyAnPC9zcGFuPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyOiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxkaXYgY2xhc3M9XCJobC1tZWRhbHMtcGVyY2VudGJhclwiIHN0eWxlPVwid2lkdGg6JyArIChtZWRhbC52YWx1ZSAqIDEwMCkgKyAnJVwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZ3JhcGhzOiB7XHJcbiAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgY2hhcnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGFwc2U6IHtcclxuICAgICAgICAgICAgICAgIGluaXQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzO1xyXG4gICAgICAgICAgICBsZXQgd2lkdGhCcmVha3BvaW50ID0gOTkyO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuaW5pdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykuYWRkQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPCB3aWR0aEJyZWFrcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykuYWRkQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVTcGFjZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtc3BhY2VyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1hdGNoTGVuZ3RoV2lucmF0ZXNHcmFwaDogZnVuY3Rpb24od2lucmF0ZXMsIGF2Z1dpbnJhdGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWdyYXBoLW1hdGNobGVuZ3RoLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlLWNoYXJ0XCI+PC9jYW52YXM+PC9kaXY+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgY3dpbnJhdGVzID0gW107XHJcbiAgICAgICAgICAgIGxldCBjYXZnd2lucmF0ZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB3a2V5IGluIHdpbnJhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lucmF0ZXMuaGFzT3duUHJvcGVydHkod2tleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2lucmF0ZSA9IHdpbnJhdGVzW3drZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGN3aW5yYXRlcy5wdXNoKHdpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdmd3aW5yYXRlLnB1c2goYXZnV2lucmF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiBPYmplY3Qua2V5cyh3aW5yYXRlcyksXHJcbiAgICAgICAgICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiQmFzZSBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNhdmd3aW5yYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjMjhjMmZmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiTWF0Y2ggTGVuZ3RoIFdpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3dpbnJhdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgzNCwgMTI1LCAzNywgMSlcIiwgLy8jMjI3ZDI1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMTg0LCAyNTUsIDE5MywgMSlcIiwgLy8jYjhmZmMxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIldpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICAgICAgeEF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJNYXRjaCBMZW5ndGggKE1pbnV0ZXMpXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU2tpcDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Sb3RhdGlvbjogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhSb3RhdGlvbjogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUhlcm9MZXZlbFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJobC1ncmFwaC1jaGFydC1jb250YWluZXJcIiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OjIwMHB4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cImhsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0XCI+PC9jYW52YXM+PC9kaXY+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgY3dpbnJhdGVzID0gW107XHJcbiAgICAgICAgICAgIGxldCBjYXZnd2lucmF0ZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB3a2V5IGluIHdpbnJhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lucmF0ZXMuaGFzT3duUHJvcGVydHkod2tleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2lucmF0ZSA9IHdpbnJhdGVzW3drZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGN3aW5yYXRlcy5wdXNoKHdpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdmd3aW5yYXRlLnB1c2goYXZnV2lucmF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiBPYmplY3Qua2V5cyh3aW5yYXRlcyksXHJcbiAgICAgICAgICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiQmFzZSBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNhdmd3aW5yYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjMjhjMmZmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGVybyBMZXZlbCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiSGVybyBMZXZlbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGUtY2hhcnQnKSwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5wdXNoKGNoYXJ0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3RhdE1hdHJpeDogZnVuY3Rpb24oaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWdyYXBoLXN0YXRtYXRyaXhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0XCI+PC9jYW52YXM+PC9kaXY+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgICAgICAvL0dldCBtYXRyaXgga2V5c1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4S2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4VmFscyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzbWtleSBpbiBoZXJvU3RhdE1hdHJpeCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhlcm9TdGF0TWF0cml4Lmhhc093blByb3BlcnR5KHNta2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeEtleXMucHVzaChzbWtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4VmFscy5wdXNoKGhlcm9TdGF0TWF0cml4W3Nta2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiBtYXRyaXhLZXlzLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG1hdHJpeFZhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDE2NSwgMjU1LCAyNDgsIDEpXCIsIC8vI2E1ZmZmOFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhvdmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRMYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogXCJBcmlhbCBzYW5zLXNlcmlmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogXCJub3JtYWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDExXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhUaWNrc0xpbWl0OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXg6IDEuMFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLXN0YXRtYXRyaXgtY2hhcnQnKSwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3JhZGFyJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXJ0IG9mIHNlbGYuaW50ZXJuYWwuY2hhcnRzKSB7XHJcbiAgICAgICAgICAgICAgICBjaGFydC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWF0Y2h1cHM6IHtcclxuICAgICAgICBnZW5lcmF0ZU1hdGNodXBzQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhvdHN0YXR1cy1zdWJjb250YWluZXJcIj48ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbC1sZy02IHBhZGRpbmctbGctcmlnaHQtMFwiPjxkaXYgaWQ9XCJobC1tYXRjaHVwcy1mb2VzLWNvbnRhaW5lclwiPjwvZGl2PjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtbGctNiBwYWRkaW5nLWxnLWxlZnQtMFwiPjxkaXYgaWQ9XCJobC1tYXRjaHVwcy1mcmllbmRzLWNvbnRhaW5lclwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKGhlcm8sIG1hdGNodXBEYXRhKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlRmllbGQgPSAnPGltZyBjbGFzcz1cImhsLW1hdGNodXBzLWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIG1hdGNodXBEYXRhLmltYWdlICsgJy5wbmdcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9GaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgaGVybyArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvU29ydEZpZWxkID0gbWF0Y2h1cERhdGEubmFtZV9zb3J0O1xyXG4gICAgICAgICAgICBsZXQgcm9sZUZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9ibGl6emFyZDtcclxuICAgICAgICAgICAgbGV0IHJvbGVTcGVjaWZpY0ZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZWRGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEucGxheWVkICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEud2lucmF0ZV9kaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtpbWFnZUZpZWxkLCBoZXJvRmllbGQsIGhlcm9Tb3J0RmllbGQsIHJvbGVGaWVsZCwgcm9sZVNwZWNpZmljRmllbGQsIHBsYXllZEZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZvZXMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGcmllbmRzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZyaWVuZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9lc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGb2UnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgQWdhaW5zdCcsIFwid2lkdGhcIjogXCIzMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIEFnYWluc3QnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzYsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZyaWVuZHNUYWJsZUNvbmZpZzogZnVuY3Rpb24ocm93TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1wid2lkdGhcIjogXCIxMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2UsIFwic2VhcmNoYWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRnJpZW5kJywgXCJ3aWR0aFwiOiBcIjMwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJpRGF0YVNvcnRcIjogMiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXX0sIC8vaURhdGFTb3J0IHRlbGxzIHdoaWNoIGNvbHVtbiBzaG91bGQgYmUgdXNlZCBhcyB0aGUgc29ydCB2YWx1ZSwgaW4gdGhpcyBjYXNlIEhlcm9fU29ydFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnUGxheWVkIFdpdGgnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnV2lucyBXaXRoJywgXCJ3aWR0aFwiOiBcIjMwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1s2LCAnZGVzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZvZXNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mb2VzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0RnJpZW5kc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWZyaWVuZHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnMsIGFuZCBhdHRlbXB0IHRvIGxvYWQgYWZ0ZXIgdmFsaWRhdGlvblxyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdoZXJvZGF0YV9wYWdlZGF0YV9oZXJvJyk7XHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJoZXJvXCIsIFwiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9TaG93IGluaXRpYWwgY29sbGFwc2VzXHJcbiAgICAvL0hlcm9Mb2FkZXIuZGF0YS53aW5kb3cuc2hvd0luaXRpYWxDb2xsYXBzZSgpO1xyXG5cclxuICAgIC8vVHJhY2sgd2luZG93IHdpZHRoIGFuZCB0b2dnbGUgY29sbGFwc2FiaWxpdHkgZm9yIGdyYXBocyBwYW5lXHJcbiAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpe1xyXG4gICAgICAgIEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0xvYWQgbmV3IGRhdGEgb24gYSBzZWxlY3QgZHJvcGRvd24gYmVpbmcgY2xvc2VkIChIYXZlIHRvIHVzZSAnKicgc2VsZWN0b3Igd29ya2Fyb3VuZCBkdWUgdG8gYSAnQm9vdHN0cmFwICsgQ2hyb21lLW9ubHknIGJ1ZylcclxuICAgICQoJyonKS5vbignaGlkZGVuLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9