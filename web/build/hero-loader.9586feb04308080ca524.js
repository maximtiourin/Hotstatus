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
                            matchup_foes_datatable.data.push(data_matchups.generateTableData(mkey, matchup, json_stats.winrate_raw));
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
                            matchup_friends_datatable.data.push(data_matchups.generateTableData(_mkey, _matchup, json_stats.winrate_raw));
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
                    } else {
                        talentField += self.generateFieldTalentImage(talentNameInternal, "Talent no longer exists...", "storm_ui_icon_monk_trait1");
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
        generateTableData: function generateTableData(hero, matchupData, mainHeroWinrate) {
            var self = HeroLoader.data.matchups;

            var imageField = '<img class="hl-matchups-image" src="' + image_base_path + matchupData.image + '.png">';

            var heroField = '<span class="hl-row-height"><a class="hsl-link" href="' + Routing.generate('hero', { heroProperName: hero }) + '" target="_blank">' + hero + '</a></span>';

            var heroSortField = matchupData.name_sort;
            var roleField = matchupData.role_blizzard;
            var roleSpecificField = matchupData.role_specific;

            var playedField = '<span class="hl-row-height">' + matchupData.played + '</span>';

            var winrateField = '<span class="hl-row-height">' + matchupData.winrate_display + '</span>';

            var edgeWinrate = matchupData.winrate - mainHeroWinrate;

            var colorclass = "hl-number-winrate-red";
            var sign = '';
            if (edgeWinrate > 0) {
                colorclass = "hl-number-winrate-green";
                sign = '+';
            }
            var edgeField = '<span class="' + colorclass + '">' + sign + edgeWinrate.toFixed(1) + '%</span>';

            return [imageField, heroField, heroSortField, roleField, roleSpecificField, playedField, winrateField, edgeField];
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
            datatable.columns = [{ "width": "10%", "bSortable": false, "searchable": false }, { "title": 'Foe', "width": "25%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'] }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Played Against', "width": "25%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Wins Against', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Edge', "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[7, 'asc']];

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
            datatable.columns = [{ "width": "10%", "bSortable": false, "searchable": false }, { "title": 'Friend', "width": "25%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'] }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
            { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Played With', "width": "25%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Wins With', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }, { "title": 'Edge', "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'] }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[7, 'desc']];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTM2MTVlODQ4MTRhNzMwN2UwYmQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX21lZGFscyIsIm1lZGFscyIsImRhdGFfZ3JhcGhzIiwiZ3JhcGhzIiwiZGF0YV9tYXRjaHVwcyIsIm1hdGNodXBzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwianNvbl9idWlsZHMiLCJqc29uX21lZGFscyIsImpzb25fc3RhdE1hdHJpeCIsImpzb25fbWF0Y2h1cHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJhYmlsaXR5T3JkZXIiLCJiZWdpbklubmVyIiwiYWJpbGl0eSIsImdlbmVyYXRlIiwiZ2VuZXJhdGVUYWJsZSIsInRhbGVudHNfZGF0YXRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJ0YWxlbnRzQ29sbGFwc2VkIiwiciIsInJrZXkiLCJ0aWVyIiwiYyIsImNrZXkiLCJvbGR0YWxlbnQiLCJ0YWxlbnQiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiY2lubmVyIiwibGVuZ3RoIiwiaW5pdFRhYmxlIiwiYnVpbGRzX2RhdGF0YWJsZSIsIk9iamVjdCIsImtleXMiLCJia2V5IiwiYnVpbGQiLCJwaWNrcmF0ZSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJnZW5lcmF0ZU1lZGFsc1BhbmUiLCJnZW5lcmF0ZVN0YXRNYXRyaXgiLCJnZW5lcmF0ZVNwYWNlciIsImdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lciIsImdlbmVyYXRlRm9lc1RhYmxlIiwibWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSIsImdldEZvZXNUYWJsZUNvbmZpZyIsIm1rZXkiLCJmb2VzIiwibWF0Y2h1cCIsIndpbnJhdGVfcmF3IiwiaW5pdEZvZXNUYWJsZSIsImdlbmVyYXRlRnJpZW5kc1RhYmxlIiwibWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSIsImdldEZyaWVuZHNUYWJsZUNvbmZpZyIsImZyaWVuZHMiLCJpbml0RnJpZW5kc1RhYmxlIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJzdHIiLCJkb2N1bWVudCIsImhlcm8iLCJSb3V0aW5nIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwic2hvd0luaXRpYWxDb2xsYXBzZSIsImNvbGxhcHNlIiwidW5pdmVyc2UiLCJkaWZmaWN1bHR5Iiwicm9sZUJsaXp6YXJkIiwicm9sZVNwZWNpZmljIiwidGFnbGluZSIsImJpbyIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwicmFyaXR5IiwiaW1hZ2VfYmFzZV9wYXRoIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImtleSIsImF2ZyIsInBtaW4iLCJodG1sIiwicmF3dmFsIiwiZGVzYyIsImltYWdlcGF0aCIsInJvd0lkIiwid2lucmF0ZURpc3BsYXkiLCJ0YWxlbnRGaWVsZCIsInBpY2tyYXRlRmllbGQiLCJwb3B1bGFyaXR5RmllbGQiLCJ3aW5yYXRlRmllbGQiLCJkYXRhVGFibGVDb25maWciLCJEYXRhVGFibGUiLCJkYXRhdGFibGUiLCJjb2x1bW5zIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJvcmRlciIsInNlYXJjaGluZyIsImRlZmVyUmVuZGVyIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsInNldHRpbmdzIiwiYXBpIiwicm93cyIsInBhZ2UiLCJub2RlcyIsImxhc3QiLCJjb2x1bW4iLCJlYWNoIiwiZ3JvdXAiLCJpIiwiZXEiLCJiZWZvcmUiLCJidWlsZFRhbGVudHMiLCJ0YWxlbnROYW1lSW50ZXJuYWwiLCJnZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UiLCJ0aGF0Iiwicm93TGVuZ3RoIiwicGFnZUxlbmd0aCIsIm1lZGFsUm93cyIsIm1lZGFsIiwiZ2VuZXJhdGVNZWRhbFJvdyIsImdlbmVyYXRlTWVkYWxJbWFnZSIsImdlbmVyYXRlTWVkYWxFbnRyeSIsImdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXIiLCJpbWFnZV9ibHVlIiwidmFsdWUiLCJjaGFydHMiLCJpbml0IiwiZW5hYmxlZCIsInJlc2l6ZSIsIndpZHRoQnJlYWtwb2ludCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJ3aW5yYXRlcyIsImF2Z1dpbnJhdGUiLCJjd2lucmF0ZXMiLCJjYXZnd2lucmF0ZSIsIndrZXkiLCJsYWJlbHMiLCJkYXRhc2V0cyIsImxhYmVsIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsInBvaW50UmFkaXVzIiwiZmlsbCIsImJhY2tncm91bmRDb2xvciIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJtYWludGFpbkFzcGVjdFJhdGlvIiwibGVnZW5kIiwiZGlzcGxheSIsInNjYWxlcyIsInlBeGVzIiwic2NhbGVMYWJlbCIsImxhYmVsU3RyaW5nIiwiZm9udENvbG9yIiwiZm9udFNpemUiLCJ0aWNrcyIsImNhbGxiYWNrIiwiaW5kZXgiLCJ2YWx1ZXMiLCJncmlkTGluZXMiLCJsaW5lV2lkdGgiLCJ4QXhlcyIsImF1dG9Ta2lwIiwibGFiZWxPZmZzZXQiLCJtaW5Sb3RhdGlvbiIsIm1heFJvdGF0aW9uIiwiY2hhcnQiLCJDaGFydCIsImhlcm9TdGF0TWF0cml4IiwibWF0cml4S2V5cyIsIm1hdHJpeFZhbHMiLCJzbWtleSIsInRvb2x0aXBzIiwiaG92ZXIiLCJtb2RlIiwic2NhbGUiLCJwb2ludExhYmVscyIsImZvbnRGYW1pbHkiLCJmb250U3R5bGUiLCJtYXhUaWNrc0xpbWl0IiwibWluIiwibWF4IiwiYW5nbGVMaW5lcyIsImRlc3Ryb3kiLCJtYXRjaHVwRGF0YSIsIm1haW5IZXJvV2lucmF0ZSIsImltYWdlRmllbGQiLCJoZXJvRmllbGQiLCJoZXJvU29ydEZpZWxkIiwibmFtZV9zb3J0Iiwicm9sZUZpZWxkIiwicm9sZV9ibGl6emFyZCIsInJvbGVTcGVjaWZpY0ZpZWxkIiwicm9sZV9zcGVjaWZpYyIsInBsYXllZEZpZWxkIiwicGxheWVkIiwiZWRnZVdpbnJhdGUiLCJjb2xvcmNsYXNzIiwic2lnbiIsImVkZ2VGaWVsZCIsInRvRml4ZWQiLCJwYWdpbmdUeXBlIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLFlBQVgsR0FBMEIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDckQsUUFBSSxDQUFDSCxXQUFXSSxJQUFYLENBQWdCQyxRQUFoQixDQUF5QkMsT0FBMUIsSUFBcUNDLGdCQUFnQkMsWUFBekQsRUFBdUU7QUFDbkUsWUFBSUMsTUFBTUYsZ0JBQWdCRyxXQUFoQixDQUE0QlIsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsWUFBSU0sUUFBUVQsV0FBV0ksSUFBWCxDQUFnQkssR0FBaEIsRUFBWixFQUFtQztBQUMvQlQsdUJBQVdJLElBQVgsQ0FBZ0JLLEdBQWhCLENBQW9CQSxHQUFwQixFQUF5QkUsSUFBekI7QUFDSDtBQUNKO0FBQ0osQ0FSRDs7QUFVQTs7O0FBR0FYLFdBQVdJLElBQVgsR0FBa0I7QUFD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LEtBQVosQ0FBa0IsWUFBVztBQUN6QjlQLE1BQUUrUCxFQUFGLENBQUtDLFlBQUwsQ0FBa0JDLFFBQWxCLEdBQTZCLE1BQTdCLENBRHlCLENBQ1k7O0FBRXJDO0FBQ0EsUUFBSTlSLFVBQVUySCxRQUFRM0QsUUFBUixDQUFpQix3QkFBakIsQ0FBZDtBQUNBLFFBQUkvRCxjQUFjLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0MsTUFBcEMsQ0FBbEI7QUFDQUksb0JBQWdCMFIsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDOVIsV0FBeEM7QUFDQUgsZUFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQUgsZUFBV2MsSUFBWCxDQUFnQmMsTUFBaEIsQ0FBdUJxTCxNQUF2QjtBQUNBbEwsTUFBRWdCLE1BQUYsRUFBVWtLLE1BQVYsQ0FBaUIsWUFBVTtBQUN2QmpOLG1CQUFXYyxJQUFYLENBQWdCYyxNQUFoQixDQUF1QnFMLE1BQXZCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBbEwsTUFBRSx3QkFBRixFQUE0Qm1RLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckQ1Uix3QkFBZ0IwUixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0M5UixXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQTRCLE1BQUUsR0FBRixFQUFPbVEsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q3BTLG1CQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0EzQkQsRSIsImZpbGUiOiJoZXJvLWxvYWRlci45NTg2ZmViMDQzMDgwODBjYTUyNC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhMzYxNWU4NDgxNGE3MzA3ZTBiZCIsIi8qXHJcbiAqIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKi9cclxuSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgaWYgKCFIZXJvTG9hZGVyLmFqYXguaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgaGVybyBsb2FkZXIgaXMgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX2hlcm9kYXRhID0gZGF0YS5oZXJvZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9zdGF0cyA9IGRhdGEuc3RhdHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYWJpbGl0aWVzID0gZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgbGV0IGRhdGFfdGFsZW50cyA9IGRhdGEudGFsZW50cztcclxuICAgICAgICBsZXQgZGF0YV9idWlsZHMgPSBkYXRhLmJ1aWxkcztcclxuICAgICAgICBsZXQgZGF0YV9tZWRhbHMgPSBkYXRhLm1lZGFscztcclxuICAgICAgICBsZXQgZGF0YV9ncmFwaHMgPSBkYXRhLmdyYXBocztcclxuICAgICAgICBsZXQgZGF0YV9tYXRjaHVwcyA9IGRhdGEubWF0Y2h1cHM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9hYmlsaXRpZXMgPSBqc29uWydhYmlsaXRpZXMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3RhbGVudHMgPSBqc29uWyd0YWxlbnRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9idWlsZHMgPSBqc29uWydidWlsZHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21lZGFscyA9IGpzb25bJ21lZGFscyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdE1hdHJpeCA9IGpzb25bJ3N0YXRNYXRyaXgnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX21hdGNodXBzID0ganNvblsnbWF0Y2h1cHMnXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW1wdHkgZHluYW1pY2FsbHkgZmlsbGVkIGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfbWVkYWxzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5lbXB0eSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvbG9hZGVyIENvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAkKCcuaW5pdGlhbC1sb2FkJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBXaW5kb3dcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudGl0bGUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnVybChqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBpbWFnZSBjb21wb3NpdGUgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXIoanNvbl9oZXJvZGF0YVsndW5pdmVyc2UnXSwganNvbl9oZXJvZGF0YVsnZGlmZmljdWx0eSddLFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25faGVyb2RhdGFbJ3JvbGVfYmxpenphcmQnXSwganNvbl9oZXJvZGF0YVsncm9sZV9zcGVjaWZpYyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25faGVyb2RhdGFbJ2Rlc2NfdGFnbGluZSddLCBqc29uX2hlcm9kYXRhWydkZXNjX2JpbyddLCBqc29uLmxhc3RfdXBkYXRlZCk7XHJcbiAgICAgICAgICAgICAgICAvL2ltYWdlX2hlcm9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuaW1hZ2VfaGVybyhqc29uX2hlcm9kYXRhWydpbWFnZV9oZXJvJ10sIGpzb25faGVyb2RhdGFbJ3Jhcml0eSddKTtcclxuICAgICAgICAgICAgICAgIC8vbmFtZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5uYW1lKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICAvL3RpdGxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLnRpdGxlKGpzb25faGVyb2RhdGFbJ3RpdGxlJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdGF0a2V5IGluIGF2ZXJhZ2Vfc3RhdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZlcmFnZV9zdGF0cy5oYXNPd25Qcm9wZXJ0eShzdGF0a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGF2ZXJhZ2Vfc3RhdHNbc3RhdGtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC50eXBlID09PSAnYXZnLXBtaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmF2Z19wbWluKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSwganNvbl9zdGF0c1tzdGF0a2V5XVsncGVyX21pbnV0ZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdwZXJjZW50YWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wZXJjZW50YWdlKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ2tkYScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMua2RhKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncmF3Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5yYXcoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAndGltZS1zcGVudC1kZWFkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy50aW1lX3NwZW50X2RlYWQoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogQWJpbGl0aWVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBhYmlsaXR5T3JkZXIgPSBbXCJOb3JtYWxcIiwgXCJIZXJvaWNcIiwgXCJUcmFpdFwiXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgYWJpbGl0eU9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuYmVnaW5Jbm5lcih0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhYmlsaXR5IG9mIGpzb25fYWJpbGl0aWVzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmdlbmVyYXRlKHR5cGUsIGFiaWxpdHlbJ25hbWUnXSwgYWJpbGl0eVsnZGVzY19zaW1wbGUnXSwgYWJpbGl0eVsnaW1hZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIFRhbGVudHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNfZGF0YXRhYmxlID0gZGF0YV90YWxlbnRzLmdldFRhYmxlQ29uZmlnKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIHRhbGVudHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NvbGxhcHNlZCBvYmplY3Qgb2YgYWxsIHRhbGVudHMgZm9yIGhlcm8sIGZvciB1c2Ugd2l0aCBkaXNwbGF5aW5nIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhbGVudHNDb2xsYXBzZWQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCB0YWxlbnQgdGFibGUgdG8gY29sbGVjdCB0YWxlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0ganNvbl90YWxlbnRzWydtaW5Sb3cnXTsgciA8PSBqc29uX3RhbGVudHNbJ21heFJvdyddOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmtleSA9IHIgKyAnJztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGllciA9IGpzb25fdGFsZW50c1tya2V5XVsndGllciddO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL0J1aWxkIGNvbHVtbnMgZm9yIERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSBqc29uX3RhbGVudHNbcmtleV1bJ21pbkNvbCddOyBjIDw9IGpzb25fdGFsZW50c1tya2V5XVsnbWF4Q29sJ107IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2tleSA9IGMgKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvbGR0YWxlbnQgPSBqc29uX3RhbGVudHNbcmtleV1bY2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkdGFsZW50Lmhhc093blByb3BlcnR5KFwibmFtZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0YWxlbnQgdG8gY29sbGFwc2VkIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFsZW50WyduYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY19zaW1wbGU6IHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRbJ2ltYWdlJ10sIHRhbGVudFsncGlja3JhdGUnXSwgdGFsZW50Wydwb3B1bGFyaXR5J10sIHRhbGVudFsnd2lucmF0ZSddLCB0YWxlbnRbJ3dpbnJhdGVfcGVyY2VudE9uUmFuZ2UnXSwgdGFsZW50Wyd3aW5yYXRlX2Rpc3BsYXknXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY2lubmVyID0gMDsgY2lubmVyIDwganNvbl90YWxlbnRzW3JrZXldW2NrZXldLmxlbmd0aDsgY2lubmVyKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldW2Npbm5lcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRhbGVudCB0byBjb2xsYXBzZWQgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50c0NvbGxhcHNlZFt0YWxlbnRbJ25hbWVfaW50ZXJuYWwnXV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhbGVudFsnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjX3NpbXBsZTogdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGFsZW50WydpbWFnZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZURhdGEociwgYywgdGllciwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgVGFsZW50cyBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5pbml0VGFibGUodGFsZW50c19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnQgQnVpbGRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vRGVmaW5lIEJ1aWxkcyBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWlsZHNfZGF0YXRhYmxlID0gZGF0YV9idWlsZHMuZ2V0VGFibGVDb25maWcoT2JqZWN0LmtleXMoanNvbl9idWlsZHMpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggYnVpbGRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBia2V5IGluIGpzb25fYnVpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fYnVpbGRzLmhhc093blByb3BlcnR5KGJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidWlsZCA9IGpzb25fYnVpbGRzW2JrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX2J1aWxkcy5nZW5lcmF0ZVRhYmxlRGF0YSh0YWxlbnRzQ29sbGFwc2VkLCBidWlsZC50YWxlbnRzLCBidWlsZC5waWNrcmF0ZSwgYnVpbGQucG9wdWxhcml0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGUsIGJ1aWxkLndpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIGJ1aWxkLndpbnJhdGVfZGlzcGxheSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgQnVpbGRzIERhdGFUYWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9idWlsZHMuaW5pdFRhYmxlKGJ1aWxkc19kYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNZWRhbHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YV9tZWRhbHMuZ2VuZXJhdGVNZWRhbHNQYW5lKGpzb25fbWVkYWxzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogR3JhcGhzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vU3RhdCBNYXRyaXhcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlU3RhdE1hdHJpeChqc29uX3N0YXRNYXRyaXgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIE1hdGNoIExlbmd0aFxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGgoanNvbl9zdGF0c1sncmFuZ2VfbWF0Y2hfbGVuZ3RoJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3BhY2VyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVNwYWNlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vV2lucmF0ZSBvdmVyIEhlcm8gTGV2ZWxcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlSGVyb0xldmVsV2lucmF0ZXNHcmFwaChqc29uX3N0YXRzWydyYW5nZV9oZXJvX2xldmVsJ10sIGpzb25fc3RhdHNbJ3dpbnJhdGVfcmF3J10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBNYXRjaHVwc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwc1snZm9lc19jb3VudCddID4gMCB8fCBqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9HZW5lcmF0ZSBtYXRjaHVwcyBjb250YWluZXJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmdlbmVyYXRlTWF0Y2h1cHNDb250YWluZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgKiBGb2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHNbJ2ZvZXNfY291bnQnXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9EZWZpbmUgTWF0Y2h1cCBEYXRhVGFibGVzIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZUZvZXNUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXBfZm9lc19kYXRhdGFibGUgPSBkYXRhX21hdGNodXBzLmdldEZvZXNUYWJsZUNvbmZpZyhqc29uX21hdGNodXBzWydmb2VzX2NvdW50J10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0aWFsaXplIGJ1aWxkcyBkYXRhdGFibGUgZGF0YSBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlLmRhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGZvZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWtleSBpbiBqc29uX21hdGNodXBzLmZvZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzLmZvZXMuaGFzT3duUHJvcGVydHkobWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cCA9IGpzb25fbWF0Y2h1cHMuZm9lc1tta2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DcmVhdGUgZGF0YXRhYmxlIHJvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZm9lc19kYXRhdGFibGUuZGF0YS5wdXNoKGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVUYWJsZURhdGEobWtleSwgbWF0Y2h1cCwganNvbl9zdGF0cy53aW5yYXRlX3JhdykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXQgTWF0Y2h1cCBEYXRhVGFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuaW5pdEZvZXNUYWJsZShtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgICogRnJpZW5kc1xyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzWydmcmllbmRzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRGVmaW5lIE1hdGNodXAgRGF0YVRhYmxlcyBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVGcmllbmRzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlID0gZGF0YV9tYXRjaHVwcy5nZXRGcmllbmRzVGFibGVDb25maWcoanNvbl9tYXRjaHVwc1snZnJpZW5kc19jb3VudCddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBmcmllbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1rZXkgaW4ganNvbl9tYXRjaHVwcy5mcmllbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwcy5mcmllbmRzLmhhc093blByb3BlcnR5KG1rZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXAgPSBqc29uX21hdGNodXBzLmZyaWVuZHNbbWtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZyaWVuZHNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX21hdGNodXBzLmdlbmVyYXRlVGFibGVEYXRhKG1rZXksIG1hdGNodXAsIGpzb25fc3RhdHMud2lucmF0ZV9yYXcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0IE1hdGNodXAgRGF0YVRhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmluaXRGcmllbmRzVGFibGUobWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSBpbml0aWFsIHRvb2x0aXBzIGZvciB0aGUgcGFnZSAoUGFnaW5hdGVkIHRvb2x0aXBzIHdpbGwgbmVlZCB0byBiZSByZWluaXRpYWxpemVkIG9uIHBhZ2luYXRlKVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB3aW5kb3c6IHtcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCJIb3RzdGF0LnVzOiBcIiArIHN0cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93SW5pdGlhbENvbGxhcHNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2F2ZXJhZ2Vfc3RhdHMnKS5jb2xsYXBzZSgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIGdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXI6IGZ1bmN0aW9uKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvLCBsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmhlcm9kYXRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvb2x0aXBUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVxcJ3Rvb2x0aXBcXCcgcm9sZT1cXCd0b29sdGlwXFwnPjxkaXYgY2xhc3M9XFwnYXJyb3dcXCc+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdoZXJvZGF0YS1iaW8gdG9vbHRpcC1pbm5lclxcJz48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS10ZW1wbGF0ZT1cIicgKyB0b29sdGlwVGVtcGxhdGUgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYuaW1hZ2VfaGVyb190b29sdGlwKHVuaXZlcnNlLCBkaWZmaWN1bHR5LCByb2xlQmxpenphcmQsIHJvbGVTcGVjaWZpYywgdGFnbGluZSwgYmlvLCBsYXN0X3VwZGF0ZWRfdGltZXN0YW1wKSArICdcIj48ZGl2IGlkPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVyby1jb250YWluZXJcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cImhsLWhlcm9kYXRhLW5hbWVcIj48L3NwYW4+PHNwYW4gaWQ9XCJobC1oZXJvZGF0YS10aXRsZVwiPjwvc3Bhbj48L3NwYW4+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKGltYWdlLCByYXJpdHkpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyJykuYXBwZW5kKCc8aW1nIGNsYXNzPVwiaGwtaGVyb2RhdGEtaW1hZ2UtaGVybyBobC1oZXJvZGF0YS1yYXJpdHktJyArIHJhcml0eSArICdcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVyb190b29sdGlwOiBmdW5jdGlvbih1bml2ZXJzZSwgZGlmZmljdWx0eSwgcm9sZUJsaXp6YXJkLCByb2xlU3BlY2lmaWMsIHRhZ2xpbmUsIGJpbywgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZShsYXN0X3VwZGF0ZWRfdGltZXN0YW1wICogMTAwMCkpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtdW5pdmVyc2VcXCc+WycgKyB1bml2ZXJzZSArICddPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLXJvbGVcXCc+JyArIHJvbGVCbGl6emFyZCArICcgLSAnICsgcm9sZVNwZWNpZmljICsgJzwvc3Bhbj48YnI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC1kaWZmaWN1bHR5XFwnPihEaWZmaWN1bHR5OiAnICsgZGlmZmljdWx0eSArICcpPC9zcGFuPjxicj4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgdGFnbGluZSArICc8L3NwYW4+PGJyPicgKyBiaW8gKyAnPGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XFwnbGFzdHVwZGF0ZWQtdGV4dFxcJz5MYXN0IFVwZGF0ZWQ6ICcrIGRhdGUgKycuPC9kaXY+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLmh0bWwocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhYmlsaXRpZXM6IHtcclxuICAgICAgICBiZWdpbklubmVyOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBpZD1cImhsLWFiaWxpdGllcy1pbm5lci0nICsgdHlwZSArICdcIiBjbGFzcz1cImhsLWFiaWxpdGllcy1pbm5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MsIGltYWdlcGF0aCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5hYmlsaXRpZXM7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5XCI+PHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcCh0eXBlLCBuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2VwYXRoICsgJy5wbmdcIj48aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2UtZnJhbWVcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgJ3VpL2FiaWxpdHlfaWNvbl9mcmFtZS5wbmdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiSGVyb2ljXCIgfHwgdHlwZSA9PT0gXCJUcmFpdFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLScgKyB0eXBlICsgJ1xcJz5bJyArIHR5cGUgKyAnXTwvc3Bhbj48YnI+PHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy10YWJsZVwiIGNsYXNzPVwiaHNsLXRhYmxlIGhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZURhdGE6IGZ1bmN0aW9uKHIsIGMsIHRpZXIsIG5hbWUsIGRlc2MsIGltYWdlLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEudGFsZW50cztcclxuXHJcbiAgICAgICAgICAgIGxldCB0YWxlbnRGaWVsZCA9ICc8c3BhbiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgc2VsZi50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1uby13cmFwIGhsLXJvdy1oZWlnaHRcIj48aW1nIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAnIDxzcGFuIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtbmFtZVwiPicgKyBuYW1lICsgJzwvc3Bhbj48L3NwYW4+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHkgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3IsIGMsIHRpZXIsIHRhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllcl9Sb3dcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfQ29sXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUYWxlbnRcIiwgXCJ3aWR0aFwiOiBcIjQwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBsYXllZFwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiV2lucmF0ZVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbMCwgJ2FzYyddLCBbMSwgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRyYXdDYWxsYmFjayA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXBpID0gdGhpcy5hcGkoKTtcclxuICAgICAgICAgICAgICAgIGxldCByb3dzID0gYXBpLnJvd3Moe3BhZ2U6ICdjdXJyZW50J30pLm5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgYXBpLmNvbHVtbigyLCB7cGFnZTogJ2N1cnJlbnQnfSkuZGF0YSgpLmVhY2goZnVuY3Rpb24gKGdyb3VwLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgIT09IGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQocm93cykuZXEoaSkuYmVmb3JlKCc8dHIgY2xhc3M9XCJncm91cCB0aWVyXCI+PHRkIGNvbHNwYW49XCI3XCI+JyArIGdyb3VwICsgJzwvdGQ+PC90cj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBncm91cDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhdGFibGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGRzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVUYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtYnVpbGRzLXRhYmxlXCIgY2xhc3M9XCJob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbih0YWxlbnRzLCBidWlsZFRhbGVudHMsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCBwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlLCB3aW5yYXRlX3BlcmNlbnRPblJhbmdlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5idWlsZHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnJztcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFsZW50TmFtZUludGVybmFsIG9mIGJ1aWxkVGFsZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhbGVudHMuaGFzT3duUHJvcGVydHkodGFsZW50TmFtZUludGVybmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSB0YWxlbnRzW3RhbGVudE5hbWVJbnRlcm5hbF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhbGVudEZpZWxkICs9IHNlbGYuZ2VuZXJhdGVGaWVsZFRhbGVudEltYWdlKHRhbGVudC5uYW1lLCB0YWxlbnQuZGVzY19zaW1wbGUsIHRhbGVudC5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRGaWVsZCArPSBzZWxmLmdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSh0YWxlbnROYW1lSW50ZXJuYWwsIFwiVGFsZW50IG5vIGxvbmdlciBleGlzdHMuLi5cIiwgXCJzdG9ybV91aV9pY29uX21vbmtfdHJhaXQxXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3RhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIGRlc2MsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aGF0ID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgdGhhdC50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLWJ1aWxkcy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50IEJ1aWxkXCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJ0J1aWxkIERhdGEgaXMgY3VycmVudGx5IGxpbWl0ZWQgZm9yIHRoaXMgSGVyby4gSW5jcmVhc2UgZGF0ZSByYW5nZSBvciB3YWl0IGZvciBtb3JlIGRhdGEuJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1sxLCAnZGVzYyddLCBbMywgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1lZGFsczoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxzUGFuZTogZnVuY3Rpb24gKG1lZGFscykge1xyXG4gICAgICAgICAgICBpZiAobWVkYWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWVkYWxSb3dzID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtZWRhbCBvZiBtZWRhbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZWRhbFJvd3MgKz0gc2VsZi5nZW5lcmF0ZU1lZGFsUm93KG1lZGFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgJCgnI2hsLW1lZGFscy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sXCI+PGRpdiBjbGFzcz1cImhvdHN0YXR1cy1zdWJjb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1zdGF0cy10aXRsZVwiPlRvcCBNZWRhbHM8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sIHBhZGRpbmctaG9yaXpvbnRhbC0wXCI+JyArIG1lZGFsUm93cyArICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxSb3c6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJ1wiPjxkaXYgY2xhc3M9XCJyb3cgaGwtbWVkYWxzLXJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEltYWdlKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sIGhsLW5vLXdyYXBcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnkobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxJbWFnZTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48aW1nIGNsYXNzPVwiaGwtbWVkYWxzLWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIG1lZGFsLmltYWdlX2JsdWUgKyAnLnBuZ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnk6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PHNwYW4gY2xhc3M9XCJobC1tZWRhbHMtbmFtZVwiPicgKyBtZWRhbC5uYW1lICsgJzwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhcjogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLXBlcmNlbnRiYXJcIiBzdHlsZT1cIndpZHRoOicgKyAobWVkYWwudmFsdWUgKiAxMDApICsgJyVcIj48L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdyYXBoczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNoYXJ0czogW10sXHJcbiAgICAgICAgICAgIGNvbGxhcHNlOiB7XHJcbiAgICAgICAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2l6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuICAgICAgICAgICAgbGV0IHdpZHRoQnJlYWtwb2ludCA9IDk5MjtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIDwgd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3BhY2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWdyYXBoLXNwYWNlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1hdGNoIExlbmd0aCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiTWF0Y2ggTGVuZ3RoIChNaW51dGVzKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhlcm8gTGV2ZWwgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIkhlcm8gTGV2ZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVN0YXRNYXRyaXg6IGZ1bmN0aW9uKGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9HZXQgbWF0cml4IGtleXNcclxuICAgICAgICAgICAgbGV0IG1hdHJpeEtleXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeFZhbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc21rZXkgaW4gaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvU3RhdE1hdHJpeC5oYXNPd25Qcm9wZXJ0eShzbWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhLZXlzLnB1c2goc21rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFZhbHMucHVzaChoZXJvU3RhdE1hdHJpeFtzbWtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogbWF0cml4S2V5cyxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRyaXhWYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNjUsIDI1NSwgMjQ4LCAxKVwiLCAvLyNhNWZmZjhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWwgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAxLjBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydCBvZiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hdGNodXBzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJob3RzdGF0dXMtc3ViY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wtbGctNiBwYWRkaW5nLWxnLXJpZ2h0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLWxnLTYgcGFkZGluZy1sZy1sZWZ0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvLCBtYXRjaHVwRGF0YSwgbWFpbkhlcm9XaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlRmllbGQgPSAnPGltZyBjbGFzcz1cImhsLW1hdGNodXBzLWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIG1hdGNodXBEYXRhLmltYWdlICsgJy5wbmdcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9GaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj48YSBjbGFzcz1cImhzbC1saW5rXCIgaHJlZj1cIicrIFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm8nLCB7aGVyb1Byb3Blck5hbWU6IGhlcm99KSArJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBoZXJvICsgJzwvYT48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvU29ydEZpZWxkID0gbWF0Y2h1cERhdGEubmFtZV9zb3J0O1xyXG4gICAgICAgICAgICBsZXQgcm9sZUZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9ibGl6emFyZDtcclxuICAgICAgICAgICAgbGV0IHJvbGVTcGVjaWZpY0ZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZWRGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEucGxheWVkICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEud2lucmF0ZV9kaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVkZ2VXaW5yYXRlID0gbWF0Y2h1cERhdGEud2lucmF0ZSAtIG1haW5IZXJvV2lucmF0ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb2xvcmNsYXNzID0gXCJobC1udW1iZXItd2lucmF0ZS1yZWRcIjtcclxuICAgICAgICAgICAgbGV0IHNpZ24gPSAnJztcclxuICAgICAgICAgICAgaWYgKGVkZ2VXaW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29sb3JjbGFzcyA9IFwiaGwtbnVtYmVyLXdpbnJhdGUtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIHNpZ24gPSAnKyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVkZ2VGaWVsZCA9ICc8c3BhbiBjbGFzcz1cIicrIGNvbG9yY2xhc3MgKydcIj4nKyBzaWduICsgZWRnZVdpbnJhdGUudG9GaXhlZCgxKSArJyU8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbaW1hZ2VGaWVsZCwgaGVyb0ZpZWxkLCBoZXJvU29ydEZpZWxkLCByb2xlRmllbGQsIHJvbGVTcGVjaWZpY0ZpZWxkLCBwbGF5ZWRGaWVsZCwgd2lucmF0ZUZpZWxkLCBlZGdlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZvZXMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGcmllbmRzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZyaWVuZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9lc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGb2UnLCBcIndpZHRoXCI6IFwiMjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgQWdhaW5zdCcsIFwid2lkdGhcIjogXCIyNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIEFnYWluc3QnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRWRnZScsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNywgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RnJpZW5kc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGcmllbmQnLCBcIndpZHRoXCI6IFwiMjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgV2l0aCcsIFwid2lkdGhcIjogXCIyNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIFdpdGgnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRWRnZScsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNywgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRGb2VzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZyaWVuZHNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mcmllbmRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfcGFnZWRhdGFfaGVybycpO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCIsIFwicmFua1wiLCBcImRhdGVcIl07XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vU2hvdyBpbml0aWFsIGNvbGxhcHNlc1xyXG4gICAgLy9IZXJvTG9hZGVyLmRhdGEud2luZG93LnNob3dJbml0aWFsQ29sbGFwc2UoKTtcclxuXHJcbiAgICAvL1RyYWNrIHdpbmRvdyB3aWR0aCBhbmQgdG9nZ2xlIGNvbGxhcHNhYmlsaXR5IGZvciBncmFwaHMgcGFuZVxyXG4gICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcclxuICAgICAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==