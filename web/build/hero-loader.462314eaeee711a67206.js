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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjU4MjAxMjMyZDY4MDZhMTdlMDQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiZGF0YV9idWlsZHMiLCJidWlsZHMiLCJkYXRhX21lZGFscyIsIm1lZGFscyIsImRhdGFfZ3JhcGhzIiwiZ3JhcGhzIiwiZGF0YV9tYXRjaHVwcyIsIm1hdGNodXBzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwianNvbl9idWlsZHMiLCJqc29uX21lZGFscyIsImpzb25fc3RhdE1hdHJpeCIsImpzb25fbWF0Y2h1cHMiLCJlbXB0eSIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyIiwibGFzdF91cGRhdGVkIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJhYmlsaXR5T3JkZXIiLCJiZWdpbklubmVyIiwiYWJpbGl0eSIsImdlbmVyYXRlIiwiZ2VuZXJhdGVUYWJsZSIsInRhbGVudHNfZGF0YXRhYmxlIiwiZ2V0VGFibGVDb25maWciLCJ0YWxlbnRzQ29sbGFwc2VkIiwiciIsInJrZXkiLCJ0aWVyIiwiYyIsImNrZXkiLCJvbGR0YWxlbnQiLCJ0YWxlbnQiLCJkZXNjX3NpbXBsZSIsImltYWdlIiwicHVzaCIsImdlbmVyYXRlVGFibGVEYXRhIiwiY2lubmVyIiwibGVuZ3RoIiwiaW5pdFRhYmxlIiwiYnVpbGRzX2RhdGF0YWJsZSIsIk9iamVjdCIsImtleXMiLCJia2V5IiwiYnVpbGQiLCJwaWNrcmF0ZSIsInBvcHVsYXJpdHkiLCJwb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlIiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlX2Rpc3BsYXkiLCJnZW5lcmF0ZU1lZGFsc1BhbmUiLCJnZW5lcmF0ZVN0YXRNYXRyaXgiLCJnZW5lcmF0ZVNwYWNlciIsImdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoIiwiZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lciIsImdlbmVyYXRlRm9lc1RhYmxlIiwibWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSIsImdldEZvZXNUYWJsZUNvbmZpZyIsIm1rZXkiLCJmb2VzIiwibWF0Y2h1cCIsIndpbnJhdGVfcmF3IiwiaW5pdEZvZXNUYWJsZSIsImdlbmVyYXRlRnJpZW5kc1RhYmxlIiwibWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSIsImdldEZyaWVuZHNUYWJsZUNvbmZpZyIsImZyaWVuZHMiLCJpbml0RnJpZW5kc1RhYmxlIiwidG9vbHRpcCIsIkhvdHN0YXR1cyIsImFkdmVydGlzaW5nIiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsImZhaWwiLCJhbHdheXMiLCJyZW1vdmUiLCJzdHIiLCJkb2N1bWVudCIsImhlcm8iLCJSb3V0aW5nIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwic2hvd0luaXRpYWxDb2xsYXBzZSIsImNvbGxhcHNlIiwidW5pdmVyc2UiLCJkaWZmaWN1bHR5Iiwicm9sZUJsaXp6YXJkIiwicm9sZVNwZWNpZmljIiwidGFnbGluZSIsImJpbyIsImxhc3RfdXBkYXRlZF90aW1lc3RhbXAiLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwicmFyaXR5IiwiaW1hZ2VfYmFzZV9wYXRoIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImtleSIsImF2ZyIsInBtaW4iLCJodG1sIiwicmF3dmFsIiwiZGVzYyIsImltYWdlcGF0aCIsInJvd0lkIiwid2lucmF0ZURpc3BsYXkiLCJ0YWxlbnRGaWVsZCIsInBpY2tyYXRlRmllbGQiLCJwb3B1bGFyaXR5RmllbGQiLCJ3aW5yYXRlRmllbGQiLCJkYXRhVGFibGVDb25maWciLCJEYXRhVGFibGUiLCJkYXRhdGFibGUiLCJjb2x1bW5zIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJvcmRlciIsInNlYXJjaGluZyIsImRlZmVyUmVuZGVyIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsImRyYXdDYWxsYmFjayIsInNldHRpbmdzIiwiYXBpIiwicm93cyIsInBhZ2UiLCJub2RlcyIsImxhc3QiLCJjb2x1bW4iLCJlYWNoIiwiZ3JvdXAiLCJpIiwiZXEiLCJiZWZvcmUiLCJidWlsZFRhbGVudHMiLCJ0YWxlbnROYW1lSW50ZXJuYWwiLCJnZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2UiLCJ0aGF0Iiwicm93TGVuZ3RoIiwicGFnZUxlbmd0aCIsIm1lZGFsUm93cyIsIm1lZGFsIiwiZ2VuZXJhdGVNZWRhbFJvdyIsImdlbmVyYXRlTWVkYWxJbWFnZSIsImdlbmVyYXRlTWVkYWxFbnRyeSIsImdlbmVyYXRlTWVkYWxFbnRyeVBlcmNlbnRCYXIiLCJpbWFnZV9ibHVlIiwidmFsdWUiLCJjaGFydHMiLCJpbml0IiwiZW5hYmxlZCIsInJlc2l6ZSIsIndpZHRoQnJlYWtwb2ludCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJ3aW5yYXRlcyIsImF2Z1dpbnJhdGUiLCJjd2lucmF0ZXMiLCJjYXZnd2lucmF0ZSIsIndrZXkiLCJsYWJlbHMiLCJkYXRhc2V0cyIsImxhYmVsIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsInBvaW50UmFkaXVzIiwiZmlsbCIsImJhY2tncm91bmRDb2xvciIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJtYWludGFpbkFzcGVjdFJhdGlvIiwibGVnZW5kIiwiZGlzcGxheSIsInNjYWxlcyIsInlBeGVzIiwic2NhbGVMYWJlbCIsImxhYmVsU3RyaW5nIiwiZm9udENvbG9yIiwiZm9udFNpemUiLCJ0aWNrcyIsImNhbGxiYWNrIiwiaW5kZXgiLCJ2YWx1ZXMiLCJncmlkTGluZXMiLCJsaW5lV2lkdGgiLCJ4QXhlcyIsImF1dG9Ta2lwIiwibGFiZWxPZmZzZXQiLCJtaW5Sb3RhdGlvbiIsIm1heFJvdGF0aW9uIiwiY2hhcnQiLCJDaGFydCIsImhlcm9TdGF0TWF0cml4IiwibWF0cml4S2V5cyIsIm1hdHJpeFZhbHMiLCJzbWtleSIsInRvb2x0aXBzIiwiaG92ZXIiLCJtb2RlIiwic2NhbGUiLCJwb2ludExhYmVscyIsImZvbnRGYW1pbHkiLCJmb250U3R5bGUiLCJtYXhUaWNrc0xpbWl0IiwibWluIiwibWF4IiwiYW5nbGVMaW5lcyIsImRlc3Ryb3kiLCJtYXRjaHVwRGF0YSIsIm1haW5IZXJvV2lucmF0ZSIsImltYWdlRmllbGQiLCJoZXJvRmllbGQiLCJoZXJvU29ydEZpZWxkIiwibmFtZV9zb3J0Iiwicm9sZUZpZWxkIiwicm9sZV9ibGl6emFyZCIsInJvbGVTcGVjaWZpY0ZpZWxkIiwicm9sZV9zcGVjaWZpYyIsInBsYXllZEZpZWxkIiwicGxheWVkIiwiZWRnZVdpbnJhdGUiLCJjb2xvcmNsYXNzIiwic2lnbiIsImVkZ2VGaWVsZCIsInRvRml4ZWQiLCJwYWdpbmdUeXBlIiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZUV4dCIsInNFcnJNb2RlIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLFlBQVgsR0FBMEIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7QUFDckQsUUFBSSxDQUFDSCxXQUFXSSxJQUFYLENBQWdCQyxRQUFoQixDQUF5QkMsT0FBMUIsSUFBcUNDLGdCQUFnQkMsWUFBekQsRUFBdUU7QUFDbkUsWUFBSUMsTUFBTUYsZ0JBQWdCRyxXQUFoQixDQUE0QlIsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsWUFBSU0sUUFBUVQsV0FBV0ksSUFBWCxDQUFnQkssR0FBaEIsRUFBWixFQUFtQztBQUMvQlQsdUJBQVdJLElBQVgsQ0FBZ0JLLEdBQWhCLENBQW9CQSxHQUFwQixFQUF5QkUsSUFBekI7QUFDSDtBQUNKO0FBQ0osQ0FSRDs7QUFVQTs7O0FBR0FYLFdBQVdJLElBQVgsR0FBa0I7QUFD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QztBQUNBLFFBQUk5UixVQUFVMkgsUUFBUTNELFFBQVIsQ0FBaUIsd0JBQWpCLENBQWQ7QUFDQSxRQUFJL0QsY0FBYyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQWxCO0FBQ0FJLG9CQUFnQjBSLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3QzlSLFdBQXhDO0FBQ0FILGVBQVdDLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0FILGVBQVdjLElBQVgsQ0FBZ0JjLE1BQWhCLENBQXVCcUwsTUFBdkI7QUFDQWxMLE1BQUVnQixNQUFGLEVBQVVrSyxNQUFWLENBQWlCLFlBQVU7QUFDdkJqTixtQkFBV2MsSUFBWCxDQUFnQmMsTUFBaEIsQ0FBdUJxTCxNQUF2QjtBQUNILEtBRkQ7O0FBSUE7QUFDQWxMLE1BQUUsd0JBQUYsRUFBNEJtUSxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JENVIsd0JBQWdCMFIsaUJBQWhCLENBQWtDLElBQWxDLEVBQXdDOVIsV0FBeEM7QUFDSCxLQUZEOztBQUlBO0FBQ0E0QixNQUFFLEdBQUYsRUFBT21RLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeENwUyxtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBM0JELEUiLCJmaWxlIjoiaGVyby1sb2FkZXIuNDYyMzE0ZWFlZWU3MTFhNjcyMDYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMjU4MjAxMjMyZDY4MDZhMTdlMDQiLCIvKlxyXG4gKiBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX2FiaWxpdGllcyA9IGRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcbiAgICAgICAgbGV0IGRhdGFfYnVpbGRzID0gZGF0YS5idWlsZHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWVkYWxzID0gZGF0YS5tZWRhbHM7XHJcbiAgICAgICAgbGV0IGRhdGFfZ3JhcGhzID0gZGF0YS5ncmFwaHM7XHJcbiAgICAgICAgbGV0IGRhdGFfbWF0Y2h1cHMgPSBkYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL0FqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2RhdGEgPSBqc29uWydoZXJvZGF0YSddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdHMgPSBqc29uWydzdGF0cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYWJpbGl0aWVzID0ganNvblsnYWJpbGl0aWVzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYnVpbGRzID0ganNvblsnYnVpbGRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tZWRhbHMgPSBqc29uWydtZWRhbHMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3N0YXRNYXRyaXggPSBqc29uWydzdGF0TWF0cml4J107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9tYXRjaHVwcyA9IGpzb25bJ21hdGNodXBzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX21lZGFscy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnLmluaXRpYWwtbG9hZCcpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgaW1hZ2UgY29tcG9zaXRlIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5nZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyKGpzb25faGVyb2RhdGFbJ3VuaXZlcnNlJ10sIGpzb25faGVyb2RhdGFbJ2RpZmZpY3VsdHknXSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uX2hlcm9kYXRhWydyb2xlX2JsaXp6YXJkJ10sIGpzb25faGVyb2RhdGFbJ3JvbGVfc3BlY2lmaWMnXSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uX2hlcm9kYXRhWydkZXNjX3RhZ2xpbmUnXSwganNvbl9oZXJvZGF0YVsnZGVzY19iaW8nXSwganNvbi5sYXN0X3VwZGF0ZWQpO1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddLCBqc29uX2hlcm9kYXRhWydyYXJpdHknXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEFiaWxpdGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWJpbGl0eU9yZGVyID0gW1wiTm9ybWFsXCIsIFwiSGVyb2ljXCIsIFwiVHJhaXRcIl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGFiaWxpdHlPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmJlZ2luSW5uZXIodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYWJpbGl0eSBvZiBqc29uX2FiaWxpdGllc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5nZW5lcmF0ZSh0eXBlLCBhYmlsaXR5WyduYW1lJ10sIGFiaWxpdHlbJ2Rlc2Nfc2ltcGxlJ10sIGFiaWxpdHlbJ2ltYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBUYWxlbnRzIERhdGFUYWJsZSBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZ2VuZXJhdGVUYWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzX2RhdGF0YWJsZSA9IGRhdGFfdGFsZW50cy5nZXRUYWJsZUNvbmZpZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSB0YWxlbnRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db2xsYXBzZWQgb2JqZWN0IG9mIGFsbCB0YWxlbnRzIGZvciBoZXJvLCBmb3IgdXNlIHdpdGggZGlzcGxheWluZyBidWlsZHNcclxuICAgICAgICAgICAgICAgIGxldCB0YWxlbnRzQ29sbGFwc2VkID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggdGFsZW50IHRhYmxlIHRvIGNvbGxlY3QgdGFsZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IGpzb25fdGFsZW50c1snbWluUm93J107IHIgPD0ganNvbl90YWxlbnRzWydtYXhSb3cnXTsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJrZXkgPSByICsgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpZXIgPSBqc29uX3RhbGVudHNbcmtleV1bJ3RpZXInXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9CdWlsZCBjb2x1bW5zIGZvciBEYXRhdGFibGVcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0ganNvbl90YWxlbnRzW3JrZXldWydtaW5Db2wnXTsgYyA8PSBqc29uX3RhbGVudHNbcmtleV1bJ21heENvbCddOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNrZXkgPSBjICsgJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2xkdGFsZW50ID0ganNvbl90YWxlbnRzW3JrZXldW2NrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZHRhbGVudC5oYXNPd25Qcm9wZXJ0eShcIm5hbWVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWxlbnQgPSBqc29uX3RhbGVudHNbcmtleV1bY2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BZGQgdGFsZW50IHRvIGNvbGxhcHNlZCBvYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNDb2xsYXBzZWRbdGFsZW50WyduYW1lX2ludGVybmFsJ11dID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhbGVudFsnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2Nfc2ltcGxlOiB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhbGVudFsnaW1hZ2UnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGVEYXRhKHIsIGMsIHRpZXIsIHRhbGVudFsnbmFtZSddLCB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNpbm5lciA9IDA7IGNpbm5lciA8IGpzb25fdGFsZW50c1tya2V5XVtja2V5XS5sZW5ndGg7IGNpbm5lcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XVtjaW5uZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0YWxlbnQgdG8gY29sbGFwc2VkIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudHNDb2xsYXBzZWRbdGFsZW50WyduYW1lX2ludGVybmFsJ11dID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YWxlbnRbJ25hbWUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY19zaW1wbGU6IHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhbGVudFsnaW1hZ2UnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWxlbnRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFibGVEYXRhKHIsIGMsIHRpZXIsIHRhbGVudFsnbmFtZSddLCB0YWxlbnRbJ2Rlc2Nfc2ltcGxlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudFsnaW1hZ2UnXSwgdGFsZW50WydwaWNrcmF0ZSddLCB0YWxlbnRbJ3BvcHVsYXJpdHknXSwgdGFsZW50Wyd3aW5yYXRlJ10sIHRhbGVudFsnd2lucmF0ZV9wZXJjZW50T25SYW5nZSddLCB0YWxlbnRbJ3dpbnJhdGVfZGlzcGxheSddKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IFRhbGVudHMgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuaW5pdFRhYmxlKHRhbGVudHNfZGF0YXRhYmxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50IEJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBCdWlsZHMgRGF0YVRhYmxlIGFuZCBnZW5lcmF0ZSB0YWJsZSBzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmdlbmVyYXRlVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYnVpbGRzX2RhdGF0YWJsZSA9IGRhdGFfYnVpbGRzLmdldFRhYmxlQ29uZmlnKE9iamVjdC5rZXlzKGpzb25fYnVpbGRzKS5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgIGJ1aWxkc19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vTG9vcCB0aHJvdWdoIGJ1aWxkc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYmtleSBpbiBqc29uX2J1aWxkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX2J1aWxkcy5oYXNPd25Qcm9wZXJ0eShia2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnVpbGQgPSBqc29uX2J1aWxkc1tia2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV9idWlsZHMuZ2VuZXJhdGVUYWJsZURhdGEodGFsZW50c0NvbGxhcHNlZCwgYnVpbGQudGFsZW50cywgYnVpbGQucGlja3JhdGUsIGJ1aWxkLnBvcHVsYXJpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZC5wb3B1bGFyaXR5X3BlcmNlbnRPblJhbmdlLCBidWlsZC53aW5yYXRlLCBidWlsZC53aW5yYXRlX3BlcmNlbnRPblJhbmdlLCBidWlsZC53aW5yYXRlX2Rpc3BsYXkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IEJ1aWxkcyBEYXRhVGFibGVcclxuICAgICAgICAgICAgICAgIGRhdGFfYnVpbGRzLmluaXRUYWJsZShidWlsZHNfZGF0YXRhYmxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogTWVkYWxzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfbWVkYWxzLmdlbmVyYXRlTWVkYWxzUGFuZShqc29uX21lZGFscyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEdyYXBoc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL1N0YXQgTWF0cml4XHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZVN0YXRNYXRyaXgoanNvbl9zdGF0TWF0cml4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NwYWNlclxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTcGFjZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgb3ZlciBNYXRjaCBMZW5ndGhcclxuICAgICAgICAgICAgICAgIGRhdGFfZ3JhcGhzLmdlbmVyYXRlTWF0Y2hMZW5ndGhXaW5yYXRlc0dyYXBoKGpzb25fc3RhdHNbJ3JhbmdlX21hdGNoX2xlbmd0aCddLCBqc29uX3N0YXRzWyd3aW5yYXRlX3JhdyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NwYWNlclxyXG4gICAgICAgICAgICAgICAgZGF0YV9ncmFwaHMuZ2VuZXJhdGVTcGFjZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1dpbnJhdGUgb3ZlciBIZXJvIExldmVsXHJcbiAgICAgICAgICAgICAgICBkYXRhX2dyYXBocy5nZW5lcmF0ZUhlcm9MZXZlbFdpbnJhdGVzR3JhcGgoanNvbl9zdGF0c1sncmFuZ2VfaGVyb19sZXZlbCddLCBqc29uX3N0YXRzWyd3aW5yYXRlX3JhdyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogTWF0Y2h1cHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHNbJ2ZvZXNfY291bnQnXSA+IDAgfHwganNvbl9tYXRjaHVwc1snZnJpZW5kc19jb3VudCddID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vR2VuZXJhdGUgbWF0Y2h1cHMgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZU1hdGNodXBzQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgICogRm9lc1xyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uX21hdGNodXBzWydmb2VzX2NvdW50J10gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRGVmaW5lIE1hdGNodXAgRGF0YVRhYmxlcyBhbmQgZ2VuZXJhdGUgdGFibGUgc3RydWN0dXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWF0Y2h1cHMuZ2VuZXJhdGVGb2VzVGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlID0gZGF0YV9tYXRjaHVwcy5nZXRGb2VzVGFibGVDb25maWcoanNvbl9tYXRjaHVwc1snZm9lc19jb3VudCddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdGlhbGl6ZSBidWlsZHMgZGF0YXRhYmxlIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mb2VzX2RhdGF0YWJsZS5kYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0xvb3AgdGhyb3VnaCBmb2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1rZXkgaW4ganNvbl9tYXRjaHVwcy5mb2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwcy5mb2VzLmhhc093blByb3BlcnR5KG1rZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNodXAgPSBqc29uX21hdGNodXBzLmZvZXNbbWtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGRhdGF0YWJsZSByb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaHVwX2ZvZXNfZGF0YXRhYmxlLmRhdGEucHVzaChkYXRhX21hdGNodXBzLmdlbmVyYXRlVGFibGVEYXRhKG1rZXksIG1hdGNodXAsIGpzb25fc3RhdHMud2lucmF0ZV9yYXcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Jbml0IE1hdGNodXAgRGF0YVRhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmluaXRGb2VzVGFibGUobWF0Y2h1cF9mb2VzX2RhdGF0YWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgICAqIEZyaWVuZHNcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbl9tYXRjaHVwc1snZnJpZW5kc19jb3VudCddID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0RlZmluZSBNYXRjaHVwIERhdGFUYWJsZXMgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX21hdGNodXBzLmdlbmVyYXRlRnJpZW5kc1RhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZSA9IGRhdGFfbWF0Y2h1cHMuZ2V0RnJpZW5kc1RhYmxlQ29uZmlnKGpzb25fbWF0Y2h1cHNbJ2ZyaWVuZHNfY291bnQnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luaXRpYWxpemUgYnVpbGRzIGRhdGF0YWJsZSBkYXRhIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Mb29wIHRocm91Z2ggZnJpZW5kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBta2V5IGluIGpzb25fbWF0Y2h1cHMuZnJpZW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25fbWF0Y2h1cHMuZnJpZW5kcy5oYXNPd25Qcm9wZXJ0eShta2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaHVwID0ganNvbl9tYXRjaHVwcy5mcmllbmRzW21rZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBkYXRhdGFibGUgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2h1cF9mcmllbmRzX2RhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV9tYXRjaHVwcy5nZW5lcmF0ZVRhYmxlRGF0YShta2V5LCBtYXRjaHVwLCBqc29uX3N0YXRzLndpbnJhdGVfcmF3KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5pdCBNYXRjaHVwIERhdGFUYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9tYXRjaHVwcy5pbml0RnJpZW5kc1RhYmxlKG1hdGNodXBfZnJpZW5kc19kYXRhdGFibGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy9FbmFibGUgaW5pdGlhbCB0b29sdGlwcyBmb3IgdGhlIHBhZ2UgKFBhZ2luYXRlZCB0b29sdGlwcyB3aWxsIG5lZWQgdG8gYmUgcmVpbml0aWFsaXplZCBvbiBwYWdpbmF0ZSlcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0luaXRpYWxDb2xsYXBzZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNhdmVyYWdlX3N0YXRzJykuY29sbGFwc2UoJ3Nob3cnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGVyb2RhdGE6IHtcclxuICAgICAgICBnZW5lcmF0ZUltYWdlQ29tcG9zaXRlQ29udGFpbmVyOiBmdW5jdGlvbih1bml2ZXJzZSwgZGlmZmljdWx0eSwgcm9sZUJsaXp6YXJkLCByb2xlU3BlY2lmaWMsIHRhZ2xpbmUsIGJpbywgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5oZXJvZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0b29sdGlwVGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cXCd0b29sdGlwXFwnIHJvbGU9XFwndG9vbHRpcFxcJz48ZGl2IGNsYXNzPVxcJ2Fycm93XFwnPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XFwnaGVyb2RhdGEtYmlvIHRvb2x0aXAtaW5uZXJcXCc+PC9kaXY+PC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5hcHBlbmQoJzxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtdGVtcGxhdGU9XCInICsgdG9vbHRpcFRlbXBsYXRlICsgJ1wiICcgK1xyXG4gICAgICAgICAgICAgICAgJ2RhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLmltYWdlX2hlcm9fdG9vbHRpcCh1bml2ZXJzZSwgZGlmZmljdWx0eSwgcm9sZUJsaXp6YXJkLCByb2xlU3BlY2lmaWMsIHRhZ2xpbmUsIGJpbywgbGFzdF91cGRhdGVkX3RpbWVzdGFtcCkgKyAnXCI+PGRpdiBpZD1cImhsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gaWQ9XCJobC1oZXJvZGF0YS1uYW1lXCI+PC9zcGFuPjxzcGFuIGlkPVwiaGwtaGVyb2RhdGEtdGl0bGVcIj48L3NwYW4+PC9zcGFuPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtdGl0bGUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvOiBmdW5jdGlvbihpbWFnZSwgcmFyaXR5KSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbnRhaW5lcicpLmFwcGVuZCgnPGltZyBjbGFzcz1cImhsLWhlcm9kYXRhLWltYWdlLWhlcm8gaGwtaGVyb2RhdGEtcmFyaXR5LScgKyByYXJpdHkgKyAnXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIGltYWdlICsgJy5wbmdcIj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm9fdG9vbHRpcDogZnVuY3Rpb24odW5pdmVyc2UsIGRpZmZpY3VsdHksIHJvbGVCbGl6emFyZCwgcm9sZVNwZWNpZmljLCB0YWdsaW5lLCBiaW8sIGxhc3RfdXBkYXRlZF90aW1lc3RhbXApIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSAobmV3IERhdGUobGFzdF91cGRhdGVkX3RpbWVzdGFtcCAqIDEwMDApKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1oZXJvZGF0YS10b29sdGlwLXVuaXZlcnNlXFwnPlsnICsgdW5pdmVyc2UgKyAnXTwvc3Bhbj48YnI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XFwnaGwtaGVyb2RhdGEtdG9vbHRpcC1yb2xlXFwnPicgKyByb2xlQmxpenphcmQgKyAnIC0gJyArIHJvbGVTcGVjaWZpYyArICc8L3NwYW4+PGJyPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVxcJ2hsLWhlcm9kYXRhLXRvb2x0aXAtZGlmZmljdWx0eVxcJz4oRGlmZmljdWx0eTogJyArIGRpZmZpY3VsdHkgKyAnKTwvc3Bhbj48YnI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XFwnaGwtdGFsZW50cy10b29sdGlwLW5hbWVcXCc+JyArIHRhZ2xpbmUgKyAnPC9zcGFuPjxicj4nICsgYmlvICsgJzxicj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVxcJ2xhc3R1cGRhdGVkLXRleHRcXCc+TGFzdCBVcGRhdGVkOiAnKyBkYXRlICsnLjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS5odG1sKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYWJpbGl0aWVzOiB7XHJcbiAgICAgICAgYmVnaW5Jbm5lcjogZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUgKyAnXCIgY2xhc3M9XCJobC1hYmlsaXRpZXMtaW5uZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbih0eXBlLCBuYW1lLCBkZXNjLCBpbWFnZXBhdGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWlubmVyLScgKyB0eXBlKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAodHlwZSwgbmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5LWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIGltYWdlcGF0aCArICcucG5nXCI+PGltZyBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5LWltYWdlLWZyYW1lXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArICd1aS9hYmlsaXR5X2ljb25fZnJhbWUucG5nXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b29sdGlwOiBmdW5jdGlvbih0eXBlLCBuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBcIkhlcm9pY1wiIHx8IHR5cGUgPT09IFwiVHJhaXRcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC0nICsgdHlwZSArICdcXCc+WycgKyB0eXBlICsgJ108L3NwYW4+PGJyPjxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLW5hbWVcXCc+JyArIG5hbWUgKyAnPC9zcGFuPjxicj4nICsgZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRhbGVudHM6IHtcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlOiBmdW5jdGlvbihyb3dJZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLXRhbGVudHMtdGFibGVcIiBjbGFzcz1cImhzbC10YWJsZSBob3RzdGF0dXMtZGF0YXRhYmxlIGRpc3BsYXkgdGFibGUgdGFibGUtc20gZHQtcmVzcG9uc2l2ZVwiIHdpZHRoPVwiMTAwJVwiPjx0aGVhZCBjbGFzcz1cIlwiPjwvdGhlYWQ+PC90YWJsZT4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihyLCBjLCB0aWVyLCBuYW1lLCBkZXNjLCBpbWFnZSwgcGlja3JhdGUsIHBvcHVsYXJpdHksIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIGltYWdlICsgJy5wbmdcIj4nICtcclxuICAgICAgICAgICAgJyA8c3BhbiBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LW5hbWVcIj4nICsgbmFtZSArICc8L3NwYW4+PC9zcGFuPjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tyYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHBpY2tyYXRlICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcHVsYXJpdHlGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcG9wdWxhcml0eSArICclPGRpdiBjbGFzcz1cImhzbC1wZXJjZW50YmFyIGhzbC1wZXJjZW50YmFyLXBvcHVsYXJpdHlcIiBzdHlsZT1cIndpZHRoOicgKyBwb3B1bGFyaXR5ICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2lucmF0ZUZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh3aW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItd2lucmF0ZVwiIHN0eWxlPVwid2lkdGg6Jysgd2lucmF0ZV9wZXJjZW50T25SYW5nZSArICclO1wiPjwvZGl2Pjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lucmF0ZUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyB3aW5yYXRlRGlzcGxheSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtyLCBjLCB0aWVyLCB0YWxlbnRGaWVsZCwgcGlja3JhdGVGaWVsZCwgcG9wdWxhcml0eUZpZWxkLCB3aW5yYXRlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdFRhYmxlOiBmdW5jdGlvbihkYXRhVGFibGVDb25maWcpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtdGFibGUnKS5EYXRhVGFibGUoZGF0YVRhYmxlQ29uZmlnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRhYmxlQ29uZmlnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlRpZXJfUm93XCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJUaWVyX0NvbFwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllclwiLCBcInZpc2libGVcIjogZmFsc2UsIFwiYlNvcnRhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50XCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJyAnIC8vTWVzc2FnZSB3aGVuIHRhYmxlIGlzIGVtcHR5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUub3JkZXIgPSBbWzAsICdhc2MnXSwgWzEsICdhc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwaSA9IHRoaXMuYXBpKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm93cyA9IGFwaS5yb3dzKHtwYWdlOiAnY3VycmVudCd9KS5ub2RlcygpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGFwaS5jb2x1bW4oMiwge3BhZ2U6ICdjdXJyZW50J30pLmRhdGEoKS5lYWNoKGZ1bmN0aW9uIChncm91cCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSBncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHJvd3MpLmVxKGkpLmJlZm9yZSgnPHRyIGNsYXNzPVwiZ3JvdXAgdGllclwiPjx0ZCBjb2xzcGFuPVwiN1wiPicgKyBncm91cCArICc8L3RkPjwvdHI+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gZ3JvdXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkczoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuYXBwZW5kKCc8dGFibGUgaWQ9XCJobC10YWxlbnRzLWJ1aWxkcy10YWJsZVwiIGNsYXNzPVwiaG90c3RhdHVzLWRhdGF0YWJsZSBkaXNwbGF5IHRhYmxlIHRhYmxlLXNtIGR0LXJlc3BvbnNpdmVcIiB3aWR0aD1cIjEwMCVcIj48dGhlYWQgY2xhc3M9XCJcIj48L3RoZWFkPjwvdGFibGU+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRhYmxlRGF0YTogZnVuY3Rpb24odGFsZW50cywgYnVpbGRUYWxlbnRzLCBwaWNrcmF0ZSwgcG9wdWxhcml0eSwgcG9wdWxhcml0eV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZSwgd2lucmF0ZV9wZXJjZW50T25SYW5nZSwgd2lucmF0ZURpc3BsYXkpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuYnVpbGRzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhbGVudEZpZWxkID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhbGVudE5hbWVJbnRlcm5hbCBvZiBidWlsZFRhbGVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YWxlbnRzLmhhc093blByb3BlcnR5KHRhbGVudE5hbWVJbnRlcm5hbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFsZW50ID0gdGFsZW50c1t0YWxlbnROYW1lSW50ZXJuYWxdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWxlbnRGaWVsZCArPSBzZWxmLmdlbmVyYXRlRmllbGRUYWxlbnRJbWFnZSh0YWxlbnQubmFtZSwgdGFsZW50LmRlc2Nfc2ltcGxlLCB0YWxlbnQuaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHlfcGVyY2VudE9uUmFuZ2UgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3RhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUZpZWxkVGFsZW50SW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIGRlc2MsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aGF0ID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwicGFnaW5hdGVkLXRvb2x0aXBcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLWh0bWw9XCJ0cnVlXCIgdGl0bGU9XCInICsgdGhhdC50b29sdGlwKG5hbWUsIGRlc2MpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLWJ1aWxkcy10YWxlbnQtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgaW1hZ2UgKyAnLnBuZ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWJ1aWxkcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VGFibGVDb25maWc6IGZ1bmN0aW9uKHJvd0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NvbHVtbnMgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuY29sdW1ucyA9IFtcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50IEJ1aWxkXCIsIFwid2lkdGhcIjogXCI0MCVcIiwgXCJiU29ydGFibGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiUG9wdWxhcml0eVwiLCBcIndpZHRoXCI6IFwiMjAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ119LFxyXG4gICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJXaW5yYXRlXCIsIFwid2lkdGhcIjogXCIyMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzaW5nOiAnJywgLy9DaGFuZ2UgY29udGVudCBvZiBwcm9jZXNzaW5nIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgd2hlbiBhIHRhYmxlIGhhcyBubyByb3dzIGxlZnQgYWZ0ZXIgZmlsdGVyaW5nIChzYW1lIHdoaWxlIGxvYWRpbmcgaW5pdGlhbCBhamF4KVxyXG4gICAgICAgICAgICAgICAgZW1wdHlUYWJsZTogJ0J1aWxkIERhdGEgaXMgY3VycmVudGx5IGxpbWl0ZWQgZm9yIHRoaXMgSGVyby4gSW5jcmVhc2UgZGF0ZSByYW5nZSBvciB3YWl0IGZvciBtb3JlIGRhdGEuJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGF0YXRhYmxlLm9yZGVyID0gW1sxLCAnZGVzYyddLCBbMywgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIC8vZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZV9udW1iZXJzXCI7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RycD4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG4gICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kcmF3Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoJy5wYWdpbmF0ZWQtdG9vbHRpcFtkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1idWlsZHMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1lZGFsczoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxzUGFuZTogZnVuY3Rpb24gKG1lZGFscykge1xyXG4gICAgICAgICAgICBpZiAobWVkYWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWVkYWxSb3dzID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtZWRhbCBvZiBtZWRhbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZWRhbFJvd3MgKz0gc2VsZi5nZW5lcmF0ZU1lZGFsUm93KG1lZGFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgJCgnI2hsLW1lZGFscy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sXCI+PGRpdiBjbGFzcz1cImhvdHN0YXR1cy1zdWJjb250YWluZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJobC1zdGF0cy10aXRsZVwiPlRvcCBNZWRhbHM8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sIHBhZGRpbmctaG9yaXpvbnRhbC0wXCI+JyArIG1lZGFsUm93cyArICc8L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxSb3c6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1lZGFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIG1lZGFsLmRlc2Nfc2ltcGxlICsgJ1wiPjxkaXYgY2xhc3M9XCJyb3cgaGwtbWVkYWxzLXJvd1wiPjxkaXYgY2xhc3M9XCJjb2xcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sXCI+JyArIHNlbGYuZ2VuZXJhdGVNZWRhbEltYWdlKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sIGhsLW5vLXdyYXBcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnkobWVkYWwpICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2xcIj4nICsgc2VsZi5nZW5lcmF0ZU1lZGFsRW50cnlQZXJjZW50QmFyKG1lZGFsKSArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj48L3NwYW4+JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlTWVkYWxJbWFnZTogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48aW1nIGNsYXNzPVwiaGwtbWVkYWxzLWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIG1lZGFsLmltYWdlX2JsdWUgKyAnLnBuZ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZU1lZGFsRW50cnk6IGZ1bmN0aW9uKG1lZGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImhsLW1lZGFscy1saW5lXCI+PHNwYW4gY2xhc3M9XCJobC1tZWRhbHMtbmFtZVwiPicgKyBtZWRhbC5uYW1lICsgJzwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNZWRhbEVudHJ5UGVyY2VudEJhcjogZnVuY3Rpb24obWVkYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLWxpbmVcIj48ZGl2IGNsYXNzPVwiaGwtbWVkYWxzLXBlcmNlbnRiYXJcIiBzdHlsZT1cIndpZHRoOicgKyAobWVkYWwudmFsdWUgKiAxMDApICsgJyVcIj48L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWVkYWxzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdyYXBoczoge1xyXG4gICAgICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgICAgIGNoYXJ0czogW10sXHJcbiAgICAgICAgICAgIGNvbGxhcHNlOiB7XHJcbiAgICAgICAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2l6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuICAgICAgICAgICAgbGV0IHdpZHRoQnJlYWtwb2ludCA9IDk5MjtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmluaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jb2xsYXBzZS5pbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IHdpZHRoQnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNobC1ncmFwaHMtY29sbGFwc2UnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLmludGVybmFsLmNvbGxhcHNlLmVuYWJsZWQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIDwgd2lkdGhCcmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2hsLWdyYXBocy1jb2xsYXBzZScpLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY29sbGFwc2UuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlU3BhY2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhsLWdyYXBoLXNwYWNlclwiPjwvZGl2PicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaExlbmd0aFdpbnJhdGVzR3JhcGg6IGZ1bmN0aW9uKHdpbnJhdGVzLCBhdmdXaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1tYXRjaGxlbmd0aC13aW5yYXRlXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1hdGNoIExlbmd0aCBXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN3aW5yYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMzQsIDEyNSwgMzcsIDEpXCIsIC8vIzIyN2QyNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE4NCwgMjU1LCAxOTMsIDEpXCIsIC8vI2I4ZmZjMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogXCJXaW5yYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiI2FkYTJjM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiTWF0Y2ggTGVuZ3RoIChNaW51dGVzKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NraXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluUm90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um90YXRpb246IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiM3MTY3ODdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjaGFydCA9IG5ldyBDaGFydCgkKCcjaGwtZ3JhcGgtbWF0Y2hsZW5ndGgtd2lucmF0ZS1jaGFydCcpLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVIZXJvTGV2ZWxXaW5yYXRlc0dyYXBoOiBmdW5jdGlvbih3aW5yYXRlcywgYXZnV2lucmF0ZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICAkKCcjaGwtZ3JhcGhzJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtZ3JhcGgtaGVyb2xldmVsLXdpbnJhdGVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGwtZ3JhcGgtY2hhcnQtY29udGFpbmVyXCIgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDoyMDBweFwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxjYW52YXMgaWQ9XCJobC1ncmFwaC1oZXJvbGV2ZWwtd2lucmF0ZS1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9DcmVhdGUgY2hhcnRcclxuICAgICAgICAgICAgbGV0IGN3aW5yYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2F2Z3dpbnJhdGUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgd2tleSBpbiB3aW5yYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpbnJhdGVzLmhhc093blByb3BlcnR5KHdrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbnJhdGUgPSB3aW5yYXRlc1t3a2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjd2lucmF0ZXMucHVzaCh3aW5yYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXZnd2lucmF0ZS5wdXNoKGF2Z1dpbnJhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogT2JqZWN0LmtleXMod2lucmF0ZXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkJhc2UgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYXZnd2lucmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzI4YzJmZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhlcm8gTGV2ZWwgV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjd2lucmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LCAxMjUsIDM3LCAxKVwiLCAvLyMyMjdkMjVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IFwiV2lucmF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiBcIiNhZGEyYzNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICclJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6IFwiIzcxNjc4N1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiBcIkhlcm8gTGV2ZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Ta2lwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvdGF0aW9uOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjNzE2Nzg3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hhcnQgPSBuZXcgQ2hhcnQoJCgnI2hsLWdyYXBoLWhlcm9sZXZlbC13aW5yYXRlLWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5jaGFydHMucHVzaChjaGFydCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVN0YXRNYXRyaXg6IGZ1bmN0aW9uKGhlcm9TdGF0TWF0cml4KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmdyYXBocztcclxuXHJcbiAgICAgICAgICAgICQoJyNobC1ncmFwaHMnKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1ncmFwaC1zdGF0bWF0cml4XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhsLWdyYXBoLWNoYXJ0LWNvbnRhaW5lclwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6MjAwcHhcIj4nICtcclxuICAgICAgICAgICAgICAgICc8Y2FudmFzIGlkPVwiaGwtZ3JhcGgtc3RhdG1hdHJpeC1jaGFydFwiPjwvY2FudmFzPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgICAgICAgICAgLy9HZXQgbWF0cml4IGtleXNcclxuICAgICAgICAgICAgbGV0IG1hdHJpeEtleXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeFZhbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc21rZXkgaW4gaGVyb1N0YXRNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoZXJvU3RhdE1hdHJpeC5oYXNPd25Qcm9wZXJ0eShzbWtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhLZXlzLnB1c2goc21rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFZhbHMucHVzaChoZXJvU3RhdE1hdHJpeFtzbWtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0NyZWF0ZSBjaGFydFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogbWF0cml4S2V5cyxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRyaXhWYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNjUsIDI1NSwgMjQ4LCAxKVwiLCAvLyNhNWZmZjhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxODQsIDI1NSwgMTkzLCAxKVwiLCAvLyNiOGZmYzFcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50UmFkaXVzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBob3Zlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogXCIjYWRhMmMzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWwgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAxLjBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbmV3IENoYXJ0KCQoJyNobC1ncmFwaC1zdGF0bWF0cml4LWNoYXJ0JyksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuY2hhcnRzLnB1c2goY2hhcnQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuZGF0YS5ncmFwaHM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydCBvZiBzZWxmLmludGVybmFsLmNoYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLmNoYXJ0cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWdyYXBocycpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hdGNodXBzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNYXRjaHVwc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJob3RzdGF0dXMtc3ViY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wtbGctNiBwYWRkaW5nLWxnLXJpZ2h0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLWxnLTYgcGFkZGluZy1sZy1sZWZ0LTBcIj48ZGl2IGlkPVwiaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXJcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGFibGVEYXRhOiBmdW5jdGlvbihoZXJvLCBtYXRjaHVwRGF0YSwgbWFpbkhlcm9XaW5yYXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLm1hdGNodXBzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlRmllbGQgPSAnPGltZyBjbGFzcz1cImhsLW1hdGNodXBzLWltYWdlXCIgc3JjPVwiJyArIGltYWdlX2Jhc2VfcGF0aCArIG1hdGNodXBEYXRhLmltYWdlICsgJy5wbmdcIj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhlcm9GaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj48YSBjbGFzcz1cImhzbC1saW5rXCIgaHJlZj1cIicrIFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm8nLCB7aGVyb1Byb3Blck5hbWU6IGhlcm99KSArJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBoZXJvICsgJzwvYT48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCBoZXJvU29ydEZpZWxkID0gbWF0Y2h1cERhdGEubmFtZV9zb3J0O1xyXG4gICAgICAgICAgICBsZXQgcm9sZUZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9ibGl6emFyZDtcclxuICAgICAgICAgICAgbGV0IHJvbGVTcGVjaWZpY0ZpZWxkID0gbWF0Y2h1cERhdGEucm9sZV9zcGVjaWZpYztcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZWRGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEucGxheWVkICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IHdpbnJhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgbWF0Y2h1cERhdGEud2lucmF0ZV9kaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVkZ2VXaW5yYXRlID0gbWF0Y2h1cERhdGEud2lucmF0ZSAtIG1haW5IZXJvV2lucmF0ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb2xvcmNsYXNzID0gXCJobC1udW1iZXItd2lucmF0ZS1yZWRcIjtcclxuICAgICAgICAgICAgbGV0IHNpZ24gPSAnJztcclxuICAgICAgICAgICAgaWYgKGVkZ2VXaW5yYXRlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29sb3JjbGFzcyA9IFwiaGwtbnVtYmVyLXdpbnJhdGUtZ3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIHNpZ24gPSAnKyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVkZ2VGaWVsZCA9ICc8c3BhbiBjbGFzcz1cIicrIGNvbG9yY2xhc3MgKydcIj4nKyBzaWduICsgZWRnZVdpbnJhdGUudG9GaXhlZCgxKSArJyU8L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbaW1hZ2VGaWVsZCwgaGVyb0ZpZWxkLCBoZXJvU29ydEZpZWxkLCByb2xlRmllbGQsIHJvbGVTcGVjaWZpY0ZpZWxkLCBwbGF5ZWRGaWVsZCwgd2lucmF0ZUZpZWxkLCBlZGdlRmllbGRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGb2VzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZvZXMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVGcmllbmRzVGFibGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZnJpZW5kcy1jb250YWluZXInKS5hcHBlbmQoJzx0YWJsZSBpZD1cImhsLW1hdGNodXBzLWZyaWVuZHMtdGFibGVcIiBjbGFzcz1cImhvdHN0YXR1cy1kYXRhdGFibGUgZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9lc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGb2UnLCBcIndpZHRoXCI6IFwiMjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgQWdhaW5zdCcsIFwid2lkdGhcIjogXCIyNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIEFnYWluc3QnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRWRnZScsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNywgJ2FzYyddXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmRlZmVyUmVuZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdlTGVuZ3RoID0gNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmcgPSAocm93TGVuZ3RoID4gZGF0YXRhYmxlLnBhZ2VMZW5ndGgpOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZ1R5cGUgPSBcInNpbXBsZVwiO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucmVzcG9uc2l2ZSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cnA+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuICAgICAgICAgICAgZGF0YXRhYmxlLmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YXRhYmxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RnJpZW5kc1RhYmxlQ29uZmlnOiBmdW5jdGlvbihyb3dMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGF0YWJsZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgZGF0YXRhYmxlLmNvbHVtbnMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdGcmllbmQnLCBcIndpZHRoXCI6IFwiMjUlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdQbGF5ZWQgV2l0aCcsIFwid2lkdGhcIjogXCIyNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6ICdXaW5zIFdpdGgnLCBcIndpZHRoXCI6IFwiMzAlXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXX0sXHJcbiAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiAnRWRnZScsIFwid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddfSxcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5sYW5ndWFnZSA9IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5vcmRlciA9IFtbNywgJ2Rlc2MnXV07XHJcblxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnZUxlbmd0aCA9IDU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG4gICAgICAgICAgICBkYXRhdGFibGUucGFnaW5nID0gKHJvd0xlbmd0aCA+IGRhdGF0YWJsZS5wYWdlTGVuZ3RoKTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5wYWdpbmdUeXBlID0gXCJzaW1wbGVcIjtcclxuICAgICAgICAgICAgZGF0YXRhYmxlLnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5zY3JvbGxYID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICBkYXRhdGFibGUuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHJwPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgIGRhdGF0YWJsZS5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGF0YWJsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRGb2VzVGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtbWF0Y2h1cHMtZm9lcy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZyaWVuZHNUYWJsZTogZnVuY3Rpb24oZGF0YVRhYmxlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1mcmllbmRzLXRhYmxlJykuRGF0YVRhYmxlKGRhdGFUYWJsZUNvbmZpZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1tYXRjaHVwcy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQuZm4uZGF0YVRhYmxlRXh0LnNFcnJNb2RlID0gJ25vbmUnOyAvL0Rpc2FibGUgZGF0YXRhYmxlcyBlcnJvciByZXBvcnRpbmcsIGlmIHNvbWV0aGluZyBicmVha3MgYmVoaW5kIHRoZSBzY2VuZXMgdGhlIHVzZXIgc2hvdWxkbid0IGtub3cgYWJvdXQgaXRcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfcGFnZWRhdGFfaGVybycpO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCIsIFwicmFua1wiLCBcImRhdGVcIl07XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vU2hvdyBpbml0aWFsIGNvbGxhcHNlc1xyXG4gICAgLy9IZXJvTG9hZGVyLmRhdGEud2luZG93LnNob3dJbml0aWFsQ29sbGFwc2UoKTtcclxuXHJcbiAgICAvL1RyYWNrIHdpbmRvdyB3aWR0aCBhbmQgdG9nZ2xlIGNvbGxhcHNhYmlsaXR5IGZvciBncmFwaHMgcGFuZVxyXG4gICAgSGVyb0xvYWRlci5kYXRhLmdyYXBocy5yZXNpemUoKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcclxuICAgICAgICBIZXJvTG9hZGVyLmRhdGEuZ3JhcGhzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==