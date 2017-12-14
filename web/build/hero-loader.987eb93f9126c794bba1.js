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

            var heroField = '<span class="hl-row-height"><a class="hsl-link" href="' + Routing.generate('hero', { heroProperName: hero }) + '" target="_blank">' + hero + '</a></span>';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTM2YTM5ZmQ4MDhjNGVlMjdiMzUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX21lZGFscyIsIm1lZGFscyIsImRhdGFfZ3JhcGhzIiwiZ3JhcGhzIiwiZGF0YV9tYXRjaHVwcyIsIm1hdGNodXBzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwianNvbl9idWlsZHMiLCJqc29uX21lZGFscyIsImpzb25fc3RhdE1hdHJpeCIsImpzb25fbWF0Y2h1cHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJhYmlsaXR5T3JkZXIiLCJiZWdpbklubmVyIiwiYWJpbGl0eSIsImdlbmVyYXRlIiwiZ2VuZXJhdGVUYWJsZSIsInRhbGVudHNfZGF0YXRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJ0YWxlbnRzQ29sbGFwc2VkIiwiciIsInJrZXkiLCJ0aWVyIiwiYyIsImNrZXkiLCJ0YWxlbnQiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiaW5pdFRhYmxlIiwiYnVpbGRzX2RhdGF0YWJsZSIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJia2V5IiwiYnVpbGQiLCJwaWNrcmF0ZSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJnZW5lcmF0ZU1lZGFsc1BhbmUiLCJnZW5lcmF0ZVN0YXRNYXRyaXgiLCJnZW5lcmF0ZVNwYWNlciIsImdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lciIsImdlbmVyYXRlRm9lc1RhYmxlIiwibWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSIsImdldEZvZXNUYWJsZUNvbmZpZyIsIm1rZXkiLCJmb2VzIiwibWF0Y2h1cCIsImluaXRGb2VzVGFibGUiLCJnZW5lcmF0ZUZyaWVuZHNUYWJsZSIsIm1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUiLCJnZXRGcmllbmRzVGFibGVDb25maWciLCJmcmllbmRzIiwiaW5pdEZyaWVuZHNUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInNob3dJbml0aWFsQ29sbGFwc2UiLCJjb2xsYXBzZSIsInVuaXZlcnNlIiwiZGlmZmljdWx0eSIsInJvbGVCbGl6emFyZCIsInJvbGVTcGVjaWZpYyIsInRhZ2xpbmUiLCJiaW8iLCJsYXN0X3VwZGF0ZWRfdGltZXN0YW1wIiwidG9vbHRpcFRlbXBsYXRlIiwiYXBwZW5kIiwiaW1hZ2VfaGVyb190b29sdGlwIiwidmFsIiwidGV4dCIsInJhcml0eSIsImltYWdlX2Jhc2VfcGF0aCIsImRhdGUiLCJEYXRlIiwidG9Mb2NhbGVTdHJpbmciLCJrZXkiLCJhdmciLCJwbWluIiwiaHRtbCIsInJhd3ZhbCIsImRlc2MiLCJpbWFnZXBhdGgiLCJyb3dJZCIsIndpbnJhdGVEaXNwbGF5IiwidGFsZW50RmllbGQiLCJwaWNrcmF0ZUZpZWxkIiwicG9wdWxhcml0eUZpZWxkIiwid2lucmF0ZUZpZWxkIiwiZGF0YVRhYmxlQ29uZmlnIiwiRGF0YVRhYmxlIiwiZGF0YXRhYmxlIiwiY29sdW1ucyIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwib3JkZXIiLCJzZWFyY2hpbmciLCJkZWZlclJlbmRlciIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCJkcmF3Q2FsbGJhY2siLCJzZXR0aW5ncyIsImFwaSIsInJvd3MiLCJwYWdlIiwibm9kZXMiLCJsYXN0IiwiY29sdW1uIiwiZWFjaCIsImdyb3VwIiwiaSIsImVxIiwiYmVmb3JlIiwiYnVpbGRUYWxlbnRzIiwidGFsZW50TmFtZUludGVybmFsIiwiZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlIiwidGhhdCIsInJvd0xlbmd0aCIsInBhZ2VMZW5ndGgiLCJtZWRhbFJvd3MiLCJtZWRhbCIsImdlbmVyYXRlTWVkYWxSb3ciLCJnZW5lcmF0ZU1lZGFsSW1hZ2UiLCJnZW5lcmF0ZU1lZGFsRW50cnkiLCJnZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyIiwiaW1hZ2VfYmx1ZSIsInZhbHVlIiwiY2hhcnRzIiwiaW5pdCIsImVuYWJsZWQiLCJyZXNpemUiLCJ3aWR0aEJyZWFrcG9pbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImFkZENsYXNzIiwid2lucmF0ZXMiLCJhdmdXaW5yYXRlIiwiY3dpbnJhdGVzIiwiY2F2Z3dpbnJhdGUiLCJ3a2V5IiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJvcmRlckNvbG9yIiwiYm9yZGVyV2lkdGgiLCJwb2ludFJhZGl1cyIsImZpbGwiLCJiYWNrZ3JvdW5kQ29sb3IiLCJvcHRpb25zIiwiYW5pbWF0aW9uIiwibWFpbnRhaW5Bc3BlY3RSYXRpbyIsImxlZ2VuZCIsImRpc3BsYXkiLCJzY2FsZXMiLCJ5QXhlcyIsInNjYWxlTGFiZWwiLCJsYWJlbFN0cmluZyIsImZvbnRDb2xvciIsImZvbnRTaXplIiwidGlja3MiLCJjYWxsYmFjayIsImluZGV4IiwidmFsdWVzIiwiZ3JpZExpbmVzIiwibGluZVdpZHRoIiwieEF4ZXMiLCJhdXRvU2tpcCIsImxhYmVsT2Zmc2V0IiwibWluUm90YXRpb24iLCJtYXhSb3RhdGlvbiIsImNoYXJ0IiwiQ2hhcnQiLCJoZXJvU3RhdE1hdHJpeCIsIm1hdHJpeEtleXMiLCJtYXRyaXhWYWxzIiwic21rZXkiLCJ0b29sdGlwcyIsImhvdmVyIiwibW9kZSIsInNjYWxlIiwicG9pbnRMYWJlbHMiLCJmb250RmFtaWx5IiwiZm9udFN0eWxlIiwibWF4VGlja3NMaW1pdCIsIm1pbiIsIm1heCIsImFuZ2xlTGluZXMiLCJkZXN0cm95IiwibWF0Y2h1cERhdGEiLCJpbWFnZUZpZWxkIiwiaGVyb0ZpZWxkIiwiaGVyb1NvcnRGaWVsZCIsIm5hbWVfc29ydCIsInJvbGVGaWVsZCIsInJvbGVfYmxpenphcmQiLCJyb2xlU3BlY2lmaWNGaWVsZCIsInJvbGVfc3BlY2lmaWMiLCJwbGF5ZWRGaWVsZCIsInBsYXllZCIsInBhZ2luZ1R5cGUiLCJyZWFkeSIsImZuIiwiZGF0YVRhYmxl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eEM7QUFDSCxLQUZEOztBQUlBO0FBQ0E0QixNQUFFLEdBQUYsRUFBTzBQLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeEMzUixtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBM0JELEUiLCJmaWxlIjoiaGVyby1sb2FkZXIuOTg3ZWI5M2Y5MTI2Yzc5NGJiYTEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMTM2YTM5ZmQ4MDhjNGVlMjdiMzUiLCIvKlxyXG4gKiBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX2FiaWxpdGllcyA9IGRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWVkYWxzID0gZGF0YS5tZWRhbHM7XHJcbiAgICAgICAgbGV0IGRhdGFfZ3JhcGhzID0gZGF0YS5ncmFwaHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2h1cHMgPSBkYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL0FqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2RhdGEgPSBqc29uWydoZXJvZGF0YSddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdHMgPSBqc29uWydzdGF0cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYWJpbGl0aWVzID0ganNvblsnYWJpbGl0aWVzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYnVpbGRzID0ganNvblsnYnVpbGRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tZWRhbHMgPSBqc29uWydtZWRhbHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRNYXRyaXggPSBqc29uWydzdGF0TWF0cml4J107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaHVwcyA9IGpzb25bJ21hdGNodXBzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21lZGFscy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgaW1hZ2UgY29tcG9zaXRlIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5nZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyKGpzb25faGVyb2RhdGFbJ3VuaXZlcnNlJ10sIGpzb25faGVyb2RhdGFbJ2RpZmZpY3VsdHknXSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uX2hlcm9kYXRhWydyb2xlX2JsaXp6YXJkJ10sIGpzb25faGVyb2RhdGFbJ3JvbGVfc3BlY2lmaWMnXSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uX2hlcm9kYXRhWydkZXNjX3RhZ2xpbmUnXSwganNvbl9oZXJvZGF0YVsnZGVzY19iaW8nXSwganNvbi5sYXN0X3VwZGF0ZWQpO1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddLCBqc29uX2hlcm9kYXRhWydyYXJpdHknXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEFiaWxpdGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWJpbGl0eU9yZGVyID0gW1wiTm9ybWFsXCIsIFwiSGVyb2ljXCIsIFwiVHJhaXRcIl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGFiaWxpdHlPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmJlZ2luSW5uZXIodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYWJpbGl0eSBvZiBqc29uX2FiaWxpdGllc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5nZW5lcmF0ZSh0eXBlLCBhYmlsaXR5WyduYW1lJ10sIGFiaWxpdHlbJ2Rlc2Nfc2ltcGxlJ10sIGFiaWxpdHlbJ2ltYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBUYWxlbnRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzX2RhdGF0YWJsZSA9IGRhdGFfdGFsZW50cy5nZXRUYWJsZUNvbmZpZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSB0YWxlbnRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db2xsYXBzZWQgb2JqZWN0IG9mIGFsbCB0YWxlbnRzIGZvciBoZXJvLCBmb3IgdXNlIHdpdGggZGlzcGxheWluZyBidWlsZHNcclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzQ29sbGFwc2VkID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGFsZW50IHRhYmxlIHRvIGNvbGxlY3QgdGFsZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IGpzb25fdGFsZW50c1snbWluUm93J107IHIgPD0ganNvbl90YWxlbnRzWydtYXhSb3cnXTsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJrZXkgPSByICsgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpZXIgPSBqc29uX3RhbGVudHNbcmtleV1bJ3RpZXInXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9CdWlsZCBjb2x1bW5zIGZvciBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0ganNvbl90YWxlbnRzW3JrZXldWydtaW5Db2wnXTsgYyA8PSBqc29uX3RhbGVudHNbcmtleV1bJ21heENvbCddOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNrZXkgPSBjICsgJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9BZGQgdGFsZW50IHRvIGNvbGxhcHNlZCBvYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YWxlbnRbJ25hbWUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2Nfc2ltcGxlOiB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudFsnaW1hZ2UnXSwgdGFsZW50WydwaWNrcmF0ZSddLCB0YWxlbnRbJ3BvcHVsYXJpdHknXSwgdGFsZW50Wyd3aW5yYXRlJ10sIHRhbGVudFsnd2lucmF0ZV9wZXJjZW50T25SYW5nZSddLCB0YWxlbnRbJ3dpbnJhdGVfZGlzcGxheSddKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBUYWxlbnRzIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmluaXRUYWJsZSh0YWxlbnRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFRhbGVudCBCdWlsZHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9EZWZpbmUgQnVpbGRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGJ1aWxkc19kYXRhdGFibGUgPSBkYXRhX2J1aWxkcy5nZXRUYWJsZUNvbmZpZyhPYmplY3Qua2V5cyhqc29uX2J1aWxkcykubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgYnVpbGRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBidWlsZHNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGJrZXkgaW4ganNvbl9idWlsZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9idWlsZHMuaGFzT3duUHJvcGVydHkoYmtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ1aWxkID0ganNvbl9idWlsZHNbYmtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfYnVpbGRzLmdlbmVyYXRlVGFibGVEYXRhKHRhbGVudHNDb2xsYXBzZWQsIGJ1aWxkLnRhbGVudHMsIGJ1aWxkLnBpY2tyYXRlLCBidWlsZC5wb3B1bGFyaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQucG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZSwgYnVpbGQud2lucmF0ZV9wZXJjZW50T25SYW5nZSwgYnVpbGQud2lucmF0ZV9kaXNwbGF5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBCdWlsZHMgRGF0YVRhYmxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2J1aWxkcy5pbml0VGFibGUoYnVpbGRzX2RhdGF0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIE1lZGFsc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX21lZGFscy5nZW5lcmF0ZU1lZGFsc1BhbmUoanNvbl9tZWRhbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBHcmFwaHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9TdGF0IE1hdHJpeFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTdGF0TWF0cml4KGpzb25fc3RhdE1hdHJpeCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TcGFjZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3BhY2VyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlIG92ZXIgTWF0Y2ggTGVuZ3RoXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZU1hdGNoTGVuZ3RoV2lucmF0ZXNHcmFwaChqc29uX3N0YXRzWydyYW5nZV9tYXRjaF9sZW5ndGgnXSwganNvbl9zdGF0c1snd2lucmF0ZV9yYXcnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TcGFjZXJcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3BhY2VyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9XaW5yYXRlIG92ZXIgSGVybyBMZXZlbFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoKGpzb25fc3RhdHNbJ3JhbmdlX2hlcm9fbGV2ZWwnXSwganNvbl9zdGF0c1snd2lucmF0ZV9yYXcnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIE1hdGNodXBzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzWydmb2VzX2NvdW50J10gPiAwIHx8IGpzb25fbWF0Y2h1cHNbJ2ZyaWVuZHNfY291bnQnXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0dlbmVyYXRlIG1hdGNodXBzIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgICAqIEZvZXNcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwc1snZm9lc19jb3VudCddID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0RlZmluZSBNYXRjaHVwIERhdGFUYWJsZXMgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmdlbmVyYXRlRm9lc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSA9IGRhdGFfbWF0Y2h1cHMuZ2V0Rm9lc1RhYmxlQ29uZmlnKGpzb25fbWF0Y2h1cHNbJ2ZvZXNfY291bnQnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgYnVpbGRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZm9lc19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggZm9lc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBta2V5IGluIGpzb25fbWF0Y2h1cHMuZm9lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHMuZm9lcy5oYXNPd25Qcm9wZXJ0eShta2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwID0ganNvbl9tYXRjaHVwcy5mb2VzW21rZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mb2VzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZVRhYmxlRGF0YShta2V5LCBtYXRjaHVwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdCBNYXRjaHVwIERhdGFUYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5pbml0Rm9lc1RhYmxlKG1hdGNodXBfZm9lc19kYXRhdGFibGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgKiBGcmllbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHNbJ2ZyaWVuZHNfY291bnQnXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9EZWZpbmUgTWF0Y2h1cCBEYXRhVGFibGVzIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZUZyaWVuZHNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUgPSBkYXRhX21hdGNodXBzLmdldEZyaWVuZHNUYWJsZUNvbmZpZyhqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGZyaWVuZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWtleSBpbiBqc29uX21hdGNodXBzLmZyaWVuZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzLmZyaWVuZHMuaGFzT3duUHJvcGVydHkobWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cCA9IGpzb25fbWF0Y2h1cHMuZnJpZW5kc1tta2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVUYWJsZURhdGEobWtleSwgbWF0Y2h1cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXQgTWF0Y2h1cCBEYXRhVGFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuaW5pdEZyaWVuZHNUYWJsZShtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIGluaXRpYWwgdG9vbHRpcHMgZm9yIHRoZSBwYWdlIChQYWdpbmF0ZWQgdG9vbHRpcHMgd2lsbCBuZWVkIHRvIGJlIHJlaW5pdGlhbGl6ZWQgb24gcGFnaW5hdGUpXHJcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbmFibGUgYWR2ZXJ0aXNpbmdcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgSG90c3RhdHVzLmFkdmVydGlzaW5nLmdlbmVyYXRlQWR2ZXJ0aXNpbmcoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICQoJy5oZXJvbG9hZGVyLXByb2Nlc3NpbmcnKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcbkhlcm9Mb2FkZXIuZGF0YSA9IHtcclxuICAgIHdpbmRvdzoge1xyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBcIkhvdHN0YXQudXM6IFwiICsgc3RyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXJsOiBmdW5jdGlvbihoZXJvKSB7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBSb3V0aW5nLmdlbmVyYXRlKFwiaGVyb1wiLCB7aGVyb1Byb3Blck5hbWU6IGhlcm99KTtcclxuICAgICAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoaGVybywgaGVybywgdXJsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3dJbml0aWFsQ29sbGFwc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYXZlcmFnZV9zdGF0cycpLmNvbGxhcHNlKCdzaG93Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhlcm9kYXRhOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lcjogZnVuY3Rpb24odW5pdmVyc2UsIGRpZmZpY3VsdHksIHJvbGVCbGl6emFyZCwgcm9sZVNwZWNpZmljLCB0YWdsaW5lLCBiaW8sIGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuaGVyb2RhdGE7XHJcblxyXG4gICAgICAgICAgICBsZXQgdG9vbHRpcFRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XFwndG9vbHRpcFxcJyByb2xlPVxcJ3Rvb2x0aXBcXCc+PGRpdiBjbGFzcz1cXCdhcnJvd1xcJz48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVxcJ2hlcm9kYXRhLWJpbyB0b29sdGlwLWlubmVyXFwnPjwvZGl2PjwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb21wb3NpdGUtY29udGFpbmVyJykuYXBwZW5kKCc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLXRlbXBsYXRlPVwiJyArIHRvb2x0aXBUZW1wbGF0ZSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi5pbWFnZV9oZXJvX3Rvb2x0aXAodW5pdmVyc2UsIGRpZmZpY3VsdHksIHJvbGVCbGl6emFyZCwgcm9sZVNwZWNpZmljLCB0YWdsaW5lLCBiaW8sIGxhc3RfdXBkYXRlZF90aW1lc3RhbXApICsgJ1wiPjxkaXYgaWQ9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbnRhaW5lclwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGlkPVwiaGwtaGVyb2RhdGEtbmFtZVwiPjwvc3Bhbj48c3BhbiBpZD1cImhsLWhlcm9kYXRhLXRpdGxlXCI+PC9zcGFuPjwvc3Bhbj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hbWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtbmFtZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLXRpdGxlJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVybzogZnVuY3Rpb24oaW1hZ2UsIHJhcml0eSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXInKS5hcHBlbmQoJzxpbWcgY2xhc3M9XCJobC1oZXJvZGF0YS1pbWFnZS1oZXJvIGhsLWhlcm9kYXRhLXJhcml0eS0nICsgcmFyaXR5ICsgJ1wiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvX3Rvb2x0aXA6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvLCBsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gKG5ldyBEYXRlKGxhc3RfdXBkYXRlZF90aW1lc3RhbXAgKiAxMDAwKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC11bml2ZXJzZVxcJz5bJyArIHVuaXZlcnNlICsgJ108L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtcm9sZVxcJz4nICsgcm9sZUJsaXp6YXJkICsgJyAtICcgKyByb2xlU3BlY2lmaWMgKyAnPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLWRpZmZpY3VsdHlcXCc+KERpZmZpY3VsdHk6ICcgKyBkaWZmaWN1bHR5ICsgJyk8L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyB0YWdsaW5lICsgJzwvc3Bhbj48YnI+JyArIGJpbyArICc8YnI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdsYXN0dXBkYXRlZC10ZXh0XFwnPkxhc3QgVXBkYXRlZDogJysgZGF0ZSArJy48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb21wb3NpdGUtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc3RhdHM6IHtcclxuICAgICAgICBhdmdfcG1pbjogZnVuY3Rpb24oa2V5LCBhdmcsIHBtaW4pIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLWF2ZycpLnRleHQoYXZnKTtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBtaW4nKS50ZXh0KHBtaW4pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGVyY2VudGFnZTogZnVuY3Rpb24oa2V5LCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wZXJjZW50YWdlJykuaHRtbChwZXJjZW50YWdlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGtkYTogZnVuY3Rpb24oa2V5LCBrZGEpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLWtkYScpLnRleHQoa2RhKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJhdzogZnVuY3Rpb24oa2V5LCByYXd2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXJhdycpLnRleHQocmF3dmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpbWVfc3BlbnRfZGVhZDogZnVuY3Rpb24oa2V5LCB0aW1lX3NwZW50X2RlYWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXRpbWUtc3BlbnQtZGVhZCcpLnRleHQodGltZV9zcGVudF9kZWFkKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGFiaWxpdGllczoge1xyXG4gICAgICAgIGJlZ2luSW5uZXI6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtYWJpbGl0aWVzLWlubmVyLScgKyB0eXBlICsgJ1wiIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWlubmVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYywgaW1hZ2VwYXRoKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmFiaWxpdGllcztcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHlcIj48c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKHR5cGUsIG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZXBhdGggKyAnLnBuZ1wiPjxpbWcgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eS1pbWFnZS1mcmFtZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyAndWkvYWJpbGl0eV9pY29uX2ZyYW1lLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24odHlwZSwgbmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJIZXJvaWNcIiB8fCB0eXBlID09PSBcIlRyYWl0XCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtJyArIHR5cGUgKyAnXFwnPlsnICsgdHlwZSArICddPC9zcGFuPjxicj48c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0YWxlbnRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLXRhYmxlXCIgY2xhc3M9XCJoc2wtdGFibGUgaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24ociwgYywgdGllciwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAobmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBpbWFnZSArICcucG5nXCI+JyArXHJcbiAgICAgICAgICAgICcgPHNwYW4gY2xhc3M9XCJobC10YWxlbnRzLXRhbGVudC1uYW1lXCI+JyArIG5hbWUgKyAnPC9zcGFuPjwvc3Bhbj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrcmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwaWNrcmF0ZSArICc8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3B1bGFyaXR5RmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBvcHVsYXJpdHkgKyAnJTxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci1wb3B1bGFyaXR5XCIgc3R5bGU9XCJ3aWR0aDonICsgcG9wdWxhcml0eSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAod2lucmF0ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXdpbnJhdGVcIiBzdHlsZT1cIndpZHRoOicrIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgd2lucmF0ZURpc3BsYXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbciwgYywgdGllciwgdGFsZW50RmllbGQsIHBpY2tyYXRlRmllbGQsIHBvcHVsYXJpdHlGaWVsZCwgd2lucmF0ZUZpZWxkXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUYWJsZUNvbmZpZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhdGFibGUgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ29sdW1ucyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX1Jvd1wiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Db2xcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQb3B1bGFyaXR5XCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1swLCAnYXNjJ10sIFsxLCAnYXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcGkgPSB0aGlzLmFwaSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJvd3MgPSBhcGkucm93cyh7cGFnZTogJ2N1cnJlbnQnfSkubm9kZXMoKTtcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBhcGkuY29sdW1uKDIsIHtwYWdlOiAnY3VycmVudCd9KS5kYXRhKCkuZWFjaChmdW5jdGlvbiAoZ3JvdXAsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdCAhPT0gZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChyb3dzKS5lcShpKS5iZWZvcmUoJzx0ciBjbGFzcz1cImdyb3VwIHRpZXJcIj48dGQgY29sc3Bhbj1cIjdcIj4nICsgZ3JvdXAgKyAnPC90ZD48L3RyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IGdyb3VwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZHM6IHtcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy1idWlsZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHRhbGVudHMsIGJ1aWxkVGFsZW50cywgcGlja3JhdGUsIHBvcHVsYXJpdHksIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmJ1aWxkcztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YWxlbnROYW1lSW50ZXJuYWwgb2YgYnVpbGRUYWxlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFsZW50cy5oYXNPd25Qcm9wZXJ0eSh0YWxlbnROYW1lSW50ZXJuYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IHRhbGVudHNbdGFsZW50TmFtZUludGVybmFsXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFsZW50RmllbGQgKz0gc2VsZi5nZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UodGFsZW50Lm5hbWUsIHRhbGVudC5kZXNjX3NpbXBsZSwgdGFsZW50LmltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFt0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlOiBmdW5jdGlvbihuYW1lLCBkZXNjLCBpbWFnZSkge1xyXG4gICAgICAgICAgICBsZXQgdGhhdCA9IEhlcm9Mb2FkZXIuZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cInBhZ2luYXRlZC10b29sdGlwXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHRoYXQudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhsLW5vLXdyYXAgaGwtcm93LWhlaWdodFwiPjxpbWcgY2xhc3M9XCJobC1idWlsZHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIGltYWdlICsgJy5wbmdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9zcGFuPic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRhbGVudCBCdWlsZFwiLCBcIndpZHRoXCI6IFwiNDAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUGxheWVkXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZzogJycsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgIGVtcHR5VGFibGU6ICdCdWlsZCBEYXRhIGlzIGN1cnJlbnRseSBsaW1pdGVkIGZvciB0aGlzIEhlcm8uIEluY3JlYXNlIGRhdGUgcmFuZ2Ugb3Igd2FpdCBmb3IgbW9yZSBkYXRhLicgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMSwgJ2Rlc2MnXSwgWzMsICdkZXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSA1OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICAvL2RhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVfbnVtYmVyc1wiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcucGFnaW5hdGVkLXRvb2x0aXBbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtYnVpbGRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBtZWRhbHM6IHtcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsc1BhbmU6IGZ1bmN0aW9uIChtZWRhbHMpIHtcclxuICAgICAgICAgICAgaWYgKG1lZGFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1lZGFsUm93cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWVkYWwgb2YgbWVkYWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVkYWxSb3dzICs9IHNlbGYuZ2VuZXJhdGVNZWRhbFJvdyhtZWRhbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICQoJyNobC1tZWRhbHMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbFwiPjxkaXYgY2xhc3M9XCJob3RzdGF0dXMtc3ViY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtc3RhdHMtdGl0bGVcIj5Ub3AgTWVkYWxzPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbCBwYWRkaW5nLWhvcml6b250YWwtMFwiPicgKyBtZWRhbFJvd3MgKyAnPC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsUm93OiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5tZWRhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBtZWRhbC5kZXNjX3NpbXBsZSArICdcIj48ZGl2IGNsYXNzPVwicm93IGhsLW1lZGFscy1yb3dcIj48ZGl2IGNsYXNzPVwiY29sXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiPicgKyBzZWxmLmdlbmVyYXRlTWVkYWxJbWFnZShtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbCBobC1uby13cmFwXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEVudHJ5KG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhcihtZWRhbCkgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsSW1hZ2U6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PGltZyBjbGFzcz1cImhsLW1lZGFscy1pbWFnZVwiIHNyYz1cIicgKyBpbWFnZV9iYXNlX3BhdGggKyBtZWRhbC5pbWFnZV9ibHVlICsgJy5wbmdcIj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEVudHJ5OiBmdW5jdGlvbihtZWRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJobC1tZWRhbHMtbGluZVwiPjxzcGFuIGNsYXNzPVwiaGwtbWVkYWxzLW5hbWVcIj4nICsgbWVkYWwubmFtZSArICc8L3NwYW4+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXI6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PGRpdiBjbGFzcz1cImhsLW1lZGFscy1wZXJjZW50YmFyXCIgc3R5bGU9XCJ3aWR0aDonICsgKG1lZGFsLnZhbHVlICogMTAwKSArICclXCI+PC9kaXY+PC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1lZGFscy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBncmFwaHM6IHtcclxuICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICBjaGFydHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsYXBzZToge1xyXG4gICAgICAgICAgICAgICAgaW5pdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aEJyZWFrcG9pbnQgPSA5OTI7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNlbGYuaW50ZXJuYWwuY29sbGFwc2UuaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCA+PSB3aWR0aEJyZWFrcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5hZGRDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuaW5pdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCA+PSB3aWR0aEJyZWFrcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjaGwtZ3JhcGhzLWNvbGxhcHNlJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5lbmFibGVkICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCA8IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5hZGRDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVNwYWNlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJobC1ncmFwaC1zcGFjZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJobC1ncmFwaC1jaGFydC1jb250YWluZXJcIiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OjIwMHB4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cImhsLWdyYXBoLW1hdGNobGVuZ3RoLXdpbnJhdGUtY2hhcnRcIj48L2NhbnZhcz48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgIGxldCBjd2lucmF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhdmd3aW5yYXRlID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHdrZXkgaW4gd2lucmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlcy5oYXNPd25Qcm9wZXJ0eSh3a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlID0gd2lucmF0ZXNbd2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgY3dpbnJhdGVzLnB1c2god2lucmF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F2Z3dpbnJhdGUucHVzaChhdmdXaW5yYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IE9iamVjdC5rZXlzKHdpbnJhdGVzKSxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJCYXNlIFdpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY2F2Z3dpbnJhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiMyOGMyZmZcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJNYXRjaCBMZW5ndGggV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIk1hdGNoIExlbmd0aCAoTWludXRlcylcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLW1hdGNobGVuZ3RoLXdpbnJhdGUtY2hhcnQnKSwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5wdXNoKGNoYXJ0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaDogZnVuY3Rpb24od2lucmF0ZXMsIGF2Z1dpbnJhdGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGUtY2hhcnRcIj48L2NhbnZhcz48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgIGxldCBjd2lucmF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhdmd3aW5yYXRlID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHdrZXkgaW4gd2lucmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh3aW5yYXRlcy5oYXNPd25Qcm9wZXJ0eSh3a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5yYXRlID0gd2lucmF0ZXNbd2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgY3dpbnJhdGVzLnB1c2god2lucmF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F2Z3dpbnJhdGUucHVzaChhdmdXaW5yYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IE9iamVjdC5rZXlzKHdpbnJhdGVzKSxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJCYXNlIFdpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY2F2Z3dpbnJhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiMyOGMyZmZcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIZXJvIExldmVsIFdpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3dpbnJhdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgzNCwgMTI1LCAzNywgMSlcIiwgLy8jMjI3ZDI1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMTg0LCAyNTUsIDE5MywgMSlcIiwgLy8jYjhmZmMxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIldpbnJhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICAgICAgeEF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJIZXJvIExldmVsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU2tpcDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Sb3RhdGlvbjogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhSb3RhdGlvbjogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVTdGF0TWF0cml4OiBmdW5jdGlvbihoZXJvU3RhdE1hdHJpeCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJobC1ncmFwaC1jaGFydC1jb250YWluZXJcIiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OjIwMHB4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGNhbnZhcyBpZD1cImhsLWdyYXBoLXN0YXRtYXRyaXgtY2hhcnRcIj48L2NhbnZhcz48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2V0IG1hdHJpeCBrZXlzXHJcbiAgICAgICAgICAgIGxldCBtYXRyaXhLZXlzID0gW107XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXhWYWxzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNta2V5IGluIGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGVyb1N0YXRNYXRyaXguaGFzT3duUHJvcGVydHkoc21rZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4S2V5cy5wdXNoKHNta2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhWYWxzLnB1c2goaGVyb1N0YXRNYXRyaXhbc21rZXldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IG1hdHJpeEtleXMsXHJcbiAgICAgICAgICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbWF0cml4VmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMTY1LCAyNTUsIDI0OCwgMSlcIiwgLy8jYTVmZmY4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMTg0LCAyNTUsIDE5MywgMSlcIiwgLy8jYjhmZmMxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFJhZGl1czogMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0b29sdGlwczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaG92ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb2ludExhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBcIkFyaWFsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFN0eWxlOiBcIm5vcm1hbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTFcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFRpY2tzTGltaXQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogMS4wXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZUxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAncmFkYXInLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5wdXNoKGNoYXJ0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hhcnQgb2Ygc2VsZi5pbnRlcm5hbC5jaGFydHMpIHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0LmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXRjaHVwczoge1xyXG4gICAgICAgIGdlbmVyYXRlTWF0Y2h1cHNDb250YWluZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaG90c3RhdHVzLXN1YmNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sLWxnLTYgcGFkZGluZy1sZy1yaWdodC0wXCI+PGRpdiBpZD1cImhsLW1hdGNodXBzLWZvZXMtY29udGFpbmVyXCI+PC9kaXY+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1sZy02IHBhZGRpbmctbGctbGVmdC0wXCI+PGRpdiBpZD1cImhsLW1hdGNodXBzLWZyaWVuZHMtY29udGFpbmVyXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24oaGVybywgbWF0Y2h1cERhdGEpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEubWF0Y2h1cHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2VGaWVsZCA9ICc8aW1nIGNsYXNzPVwiaGwtbWF0Y2h1cHMtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgbWF0Y2h1cERhdGEuaW1hZ2UgKyAnLnBuZ1wiPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGVyb0ZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPjxhIGNsYXNzPVwiaHNsLWxpbmtcIiBocmVmPVwiJysgUm91dGluZy5nZW5lcmF0ZSgnaGVybycsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pICsnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIGhlcm8gKyAnPC9hPjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9Tb3J0RmllbGQgPSBtYXRjaHVwRGF0YS5uYW1lX3NvcnQ7XHJcbiAgICAgICAgICAgIGxldCByb2xlRmllbGQgPSBtYXRjaHVwRGF0YS5yb2xlX2JsaXp6YXJkO1xyXG4gICAgICAgICAgICBsZXQgcm9sZVNwZWNpZmljRmllbGQgPSBtYXRjaHVwRGF0YS5yb2xlX3NwZWNpZmljO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBsYXllZEZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBtYXRjaHVwRGF0YS5wbGF5ZWQgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBtYXRjaHVwRGF0YS53aW5yYXRlX2Rpc3BsYXkgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW2ltYWdlRmllbGQsIGhlcm9GaWVsZCwgaGVyb1NvcnRGaWVsZCwgcm9sZUZpZWxkLCByb2xlU3BlY2lmaWNGaWVsZCwgcGxheWVkRmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZvZXNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mb2VzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtbWF0Y2h1cHMtZm9lcy10YWJsZVwiIGNsYXNzPVwiaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZyaWVuZHNUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mcmllbmRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtbWF0Y2h1cHMtZnJpZW5kcy10YWJsZVwiIGNsYXNzPVwiaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGb2VzVGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ0ZvZScsIFwid2lkdGhcIjogXCIzMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9UZXh0XCIsIFwiaURhdGFTb3J0XCI6IDIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ119LCAvL2lEYXRhU29ydCB0ZWxscyB3aGljaCBjb2x1bW4gc2hvdWxkIGJlIHVzZWQgYXMgdGhlIHNvcnQgdmFsdWUsIGluIHRoaXMgY2FzZSBIZXJvX1NvcnRcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1BsYXllZCBBZ2FpbnN0JywgXCJ3aWR0aFwiOiBcIjMwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogJ1dpbnMgQWdhaW5zdCcsIFwid2lkdGhcIjogXCIzMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNiwgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RnJpZW5kc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGcmllbmQnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgV2l0aCcsIFwid2lkdGhcIjogXCIzMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIFdpdGgnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzYsICdkZXNjJ11dO1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUuZGVmZXJSZW5kZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2VMZW5ndGggPSA1OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IChyb3dMZW5ndGggPiBkYXRhdGFibGUucGFnZUxlbmd0aCk7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nVHlwZSA9IFwic2ltcGxlXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0Rm9lc1RhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLW1hdGNodXBzLWZvZXMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRGcmllbmRzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZnJpZW5kcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL1Nob3cgaW5pdGlhbCBjb2xsYXBzZXNcclxuICAgIC8vSGVyb0xvYWRlci5kYXRhLndpbmRvdy5zaG93SW5pdGlhbENvbGxhcHNlKCk7XHJcblxyXG4gICAgLy9UcmFjayB3aW5kb3cgd2lkdGggYW5kIHRvZ2dsZSBjb2xsYXBzYWJpbGl0eSBmb3IgZ3JhcGhzIHBhbmVcclxuICAgIEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHMucmVzaXplKCk7XHJcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=