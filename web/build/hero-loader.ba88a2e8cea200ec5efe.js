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

//processing: '<i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span>'

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

            /*
             * Empty dynamically filled containers
             */
            data_herodata.empty();
            data_abilities.empty();
            data_talents.empty();

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
                //Define DataTable and generate table structure
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

            data_talents.generateTalentTable();

            var datatable = {};

            //Columns definition
            datatable.columns = [{ "title": "Tier", "visible": false }, { "title": "Talent", "width": "40%" }, { "title": "Played", "width": "20%" }, { "title": "Popularity", "width": "20%" }, { "title": "Winrate", "width": "20%" }];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.sorting = false;
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

                api.column(0, { page: 'current' }).data().each(function (group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before('<tr class="group tier"><td colspan="4">' + group + '</td></tr>');

                        last = group;
                    }
                });
            };

            datatable.data = [];

            for (var r = json_talents['minRow']; r <= json_talents['maxRow']; r++) {
                var rkey = r + '';
                var tier = json_talents[rkey]['tier'];

                //Build columns for Datatable
                for (var c = json_talents[rkey]['minCol']; c <= json_talents[rkey]['maxCol']; c++) {
                    var ckey = c + '';

                    var talent = json_talents[rkey][ckey];

                    datatable.data.push(data_talents.generateAbilityTableData(tier, talent['name'], talent['desc_simple'], talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_percentOnRange'], talent['winrate_display']));
                }
            }

            //Init Datatable
            data_talents.initTalentTable(datatable);

            //Enable tooltips for the page
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
            $('#hl-stats-' + key + '-percentage').text(_percentage);
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
        generateTalentTable: function generateTalentTable(rowId) {
            $('#hl-talents-container').append('<table id="hl-talents-table" class="display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateAbilityTableData: function generateAbilityTableData(tier, name, desc, image, pickrate, popularity, winrate, winrate_percentOnRange, winrateDisplay) {
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

            return [tier, talentField, pickrateField, popularityField, winrateField];
        },
        initTalentTable: function initTalentTable(dataTableConfig) {
            $('#hl-talents-table').DataTable(dataTableConfig);
        },
        empty: function empty() {
            $('#hl-talents-container').empty();
        },
        tooltip: function tooltip(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    }
};

$(document).ready(function () {
    //Set the initial url based on default filters, and attempt to load after validation
    var baseUrl = Routing.generate('herodata_pagedata_hero');
    var filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Get the datatable object
    //let table = $('#hsl-table').DataTable(heroes_statslist);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmFiNzM1MGYzYWE5MWZjMTFlZWYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsIndpbmRvdyIsInRpdGxlIiwiZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lciIsImltYWdlX2hlcm8iLCJuYW1lIiwic3RhdGtleSIsImF2ZXJhZ2Vfc3RhdHMiLCJoYXNPd25Qcm9wZXJ0eSIsInN0YXQiLCJ0eXBlIiwiYXZnX3BtaW4iLCJwZXJjZW50YWdlIiwia2RhIiwicmF3IiwidGltZV9zcGVudF9kZWFkIiwiYWJpbGl0eU9yZGVyIiwiYmVnaW5Jbm5lciIsImFiaWxpdHkiLCJnZW5lcmF0ZSIsImdlbmVyYXRlVGFsZW50VGFibGUiLCJkYXRhdGFibGUiLCJjb2x1bW5zIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJzb3J0aW5nIiwic2VhcmNoaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiZHJhd0NhbGxiYWNrIiwic2V0dGluZ3MiLCJhcGkiLCJyb3dzIiwicGFnZSIsIm5vZGVzIiwibGFzdCIsImNvbHVtbiIsImVhY2giLCJncm91cCIsImkiLCJlcSIsImJlZm9yZSIsInIiLCJya2V5IiwidGllciIsImMiLCJja2V5IiwidGFsZW50IiwicHVzaCIsImdlbmVyYXRlQWJpbGl0eVRhYmxlRGF0YSIsImluaXRUYWxlbnRUYWJsZSIsInRvb2x0aXAiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImhlcm9Qcm9wZXJOYW1lIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInRhZ2xpbmUiLCJiaW8iLCJ0b29sdGlwVGVtcGxhdGUiLCJhcHBlbmQiLCJpbWFnZV9oZXJvX3Rvb2x0aXAiLCJ2YWwiLCJ0ZXh0IiwiaW1hZ2UiLCJyYXJpdHkiLCJrZXkiLCJhdmciLCJwbWluIiwicmF3dmFsIiwiZGVzYyIsImltYWdlcGF0aCIsImltYWdlX2Jhc2VfcGF0aCIsInJvd0lkIiwicGlja3JhdGUiLCJwb3B1bGFyaXR5Iiwid2lucmF0ZSIsIndpbnJhdGVfcGVyY2VudE9uUmFuZ2UiLCJ3aW5yYXRlRGlzcGxheSIsInRhbGVudEZpZWxkIiwicGlja3JhdGVGaWVsZCIsInBvcHVsYXJpdHlGaWVsZCIsIndpbnJhdGVGaWVsZCIsImRhdGFUYWJsZUNvbmZpZyIsIkRhdGFUYWJsZSIsInJlYWR5IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FB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QTRCTHBHLGVBQU8saUJBQVc7QUFDZFYsY0FBRSx1QkFBRixFQUEyQlUsS0FBM0I7QUFDSCxTQTlCSTtBQStCTDRELGlCQUFTLGlCQUFTdEQsSUFBVCxFQUFlaUYsSUFBZixFQUFxQjtBQUMxQixtQkFBTyw2Q0FBNkNqRixJQUE3QyxHQUFvRCxhQUFwRCxHQUFvRWlGLElBQTNFO0FBQ0g7QUFqQ0k7QUE3RUssQ0FBbEI7O0FBbUhBakcsRUFBRThFLFFBQUYsRUFBWWtDLEtBQVosQ0FBa0IsWUFBVztBQUN6QjtBQUNBLFFBQUlySSxVQUFVcUcsUUFBUWxELFFBQVIsQ0FBaUIsd0JBQWpCLENBQWQ7QUFDQSxRQUFJbEQsY0FBYyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQWxCO0FBQ0FJLG9CQUFnQmlJLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q3JJLFdBQXhDO0FBQ0FILGVBQVdDLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0FvQixNQUFFLHdCQUFGLEVBQTRCa0gsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRG5JLHdCQUFnQmlJLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q3JJLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBb0IsTUFBRSxHQUFGLEVBQU9rSCxFQUFQLENBQVUsb0JBQVYsRUFBZ0MsVUFBU0UsQ0FBVCxFQUFZO0FBQ3hDM0ksbUJBQVdDLFlBQVgsQ0FBd0JDLE9BQXhCLEVBQWlDQyxXQUFqQztBQUNILEtBRkQ7QUFHSCxDQW5CRCxFIiwiZmlsZSI6Imhlcm8tbG9hZGVyLmJhODhhMmU4Y2VhMjAwZWM1ZWZlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGJhYjczNTBmM2FhOTFmYzExZWVmIiwiLy9wcm9jZXNzaW5nOiAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj4nXHJcblxyXG4vKlxyXG4gKiBIZXJvIExvYWRlclxyXG4gKiBIYW5kbGVzIHJldHJpZXZpbmcgaGVybyBkYXRhIHRocm91Z2ggYWpheCByZXF1ZXN0cyBiYXNlZCBvbiBzdGF0ZSBvZiBmaWx0ZXJzXHJcbiAqL1xyXG5sZXQgSGVyb0xvYWRlciA9IHt9O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBsb2FkaW5nIG9uIHZhbGlkIGZpbHRlcnMsIG1ha2luZyBzdXJlIHRvIG9ubHkgZmlyZSBvbmNlIHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGVcclxuICovXHJcbkhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkID0gZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb0xvYWRlci5hamF4LmludGVybmFsLmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgSGVyb0xvYWRlci5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsIC8vV2hldGhlciBvciBub3QgdGhlIGhlcm8gbG9hZGVyIGlzIGN1cnJlbnRseSBsb2FkaW5nIGEgcmVzdWx0XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICBsZXQgZGF0YV9oZXJvZGF0YSA9IGRhdGEuaGVyb2RhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG4gICAgICAgIGxldCBkYXRhX2FiaWxpdGllcyA9IGRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgIGxldCBkYXRhX3RhbGVudHMgPSBkYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9hYmlsaXRpZXMgPSBqc29uWydhYmlsaXRpZXMnXTtcclxuICAgICAgICAgICAgICAgIGxldCBqc29uX3RhbGVudHMgPSBqc29uWyd0YWxlbnRzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVtcHR5IGR5bmFtaWNhbGx5IGZpbGxlZCBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhX3RhbGVudHMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2xvYWRlciBDb250YWluZXJcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2luaXRpYWwtbG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBXaW5kb3dcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudGl0bGUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnVybChqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBpbWFnZSBjb21wb3NpdGUgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmdlbmVyYXRlSW1hZ2VDb21wb3NpdGVDb250YWluZXIoanNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10sIGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddLCBqc29uX2hlcm9kYXRhWydyYXJpdHknXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEFiaWxpdGllc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgYWJpbGl0eU9yZGVyID0gW1wiTm9ybWFsXCIsIFwiSGVyb2ljXCIsIFwiVHJhaXRcIl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGFiaWxpdHlPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmJlZ2luSW5uZXIodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYWJpbGl0eSBvZiBqc29uX2FiaWxpdGllc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5nZW5lcmF0ZSh0eXBlLCBhYmlsaXR5WyduYW1lJ10sIGFiaWxpdHlbJ2Rlc2Nfc2ltcGxlJ10sIGFiaWxpdHlbJ2ltYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogVGFsZW50c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL0RlZmluZSBEYXRhVGFibGUgYW5kIGdlbmVyYXRlIHRhYmxlIHN0cnVjdHVyZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmdlbmVyYXRlVGFsZW50VGFibGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YXRhYmxlID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Db2x1bW5zIGRlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGRhdGF0YWJsZS5jb2x1bW5zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGllclwiLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcInRpdGxlXCI6IFwiVGFsZW50XCIsIFwid2lkdGhcIjogXCI0MCVcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAge1widGl0bGVcIjogXCJQbGF5ZWRcIiwgXCJ3aWR0aFwiOiBcIjIwJVwifSxcclxuICAgICAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIlBvcHVsYXJpdHlcIiwgXCJ3aWR0aFwiOiBcIjIwJVwifSxcclxuICAgICAgICAgICAgICAgICAgICB7XCJ0aXRsZVwiOiBcIldpbnJhdGVcIiwgXCJ3aWR0aFwiOiBcIjIwJVwifSxcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YXRhYmxlLmxhbmd1YWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6ICcnLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZ1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCBpbnNpZGUgb2YgdGFibGUgd2hpbGUgbG9hZGluZyByZWNvcmRzIGluIGNsaWVudCBzaWRlIGFqYXggcmVxdWVzdHMgKG5vdCB1c2VkIGZvciBzZXJ2ZXIgc2lkZSlcclxuICAgICAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgICAgICAgICAgICAgICAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YXRhYmxlLnNvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRhdGF0YWJsZS5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRhdGF0YWJsZS5kZWZlclJlbmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZGF0YXRhYmxlLnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuICAgICAgICAgICAgICAgIGRhdGF0YWJsZS5yZXNwb25zaXZlID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG4gICAgICAgICAgICAgICAgZGF0YXRhYmxlLnNjcm9sbFggPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbiAgICAgICAgICAgICAgICBkYXRhdGFibGUuc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG4gICAgICAgICAgICAgICAgZGF0YXRhYmxlLmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbiAgICAgICAgICAgICAgICBkYXRhdGFibGUuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhdGFibGUuZHJhd0NhbGxiYWNrID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXBpID0gdGhpcy5hcGkoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcm93cyA9IGFwaS5yb3dzKHtwYWdlOiAnY3VycmVudCd9KS5ub2RlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYXBpLmNvbHVtbigwLCB7cGFnZTogJ2N1cnJlbnQnfSkuZGF0YSgpLmVhY2goZnVuY3Rpb24gKGdyb3VwLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSBncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChyb3dzKS5lcShpKS5iZWZvcmUoJzx0ciBjbGFzcz1cImdyb3VwIHRpZXJcIj48dGQgY29sc3Bhbj1cIjRcIj4nICsgZ3JvdXAgKyAnPC90ZD48L3RyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBncm91cDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhdGFibGUuZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSBqc29uX3RhbGVudHNbJ21pblJvdyddOyByIDw9IGpzb25fdGFsZW50c1snbWF4Um93J107IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBya2V5ID0gciArICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWVyID0ganNvbl90YWxlbnRzW3JrZXldWyd0aWVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQnVpbGQgY29sdW1ucyBmb3IgRGF0YXRhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IGpzb25fdGFsZW50c1tya2V5XVsnbWluQ29sJ107IGMgPD0ganNvbl90YWxlbnRzW3JrZXldWydtYXhDb2wnXTsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBja2V5ID0gYyArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGF0YWJsZS5kYXRhLnB1c2goZGF0YV90YWxlbnRzLmdlbmVyYXRlQWJpbGl0eVRhYmxlRGF0YSh0aWVyLCB0YWxlbnRbJ25hbWUnXSwgdGFsZW50WydkZXNjX3NpbXBsZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFsZW50WydpbWFnZSddLCB0YWxlbnRbJ3BpY2tyYXRlJ10sIHRhbGVudFsncG9wdWxhcml0eSddLCB0YWxlbnRbJ3dpbnJhdGUnXSwgdGFsZW50Wyd3aW5yYXRlX3BlcmNlbnRPblJhbmdlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IERhdGF0YWJsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmluaXRUYWxlbnRUYWJsZShkYXRhdGFibGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vRW5hYmxlIHRvb2x0aXBzIGZvciB0aGUgcGFnZVxyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB3aW5kb3c6IHtcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCJIb3RzdGF0LnVzOiBcIiArIHN0cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhlcm9kYXRhOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVJbWFnZUNvbXBvc2l0ZUNvbnRhaW5lcjogZnVuY3Rpb24odGFnbGluZSwgYmlvKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLmhlcm9kYXRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvb2x0aXBUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVxcJ3Rvb2x0aXBcXCcgcm9sZT1cXCd0b29sdGlwXFwnPjxkaXYgY2xhc3M9XFwnYXJyb3dcXCc+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cXCdoZXJvZGF0YS1iaW8gdG9vbHRpcC1pbm5lclxcJz48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29tcG9zaXRlLWNvbnRhaW5lcicpLmFwcGVuZCgnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS10ZW1wbGF0ZT1cIicgKyB0b29sdGlwVGVtcGxhdGUgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYuaW1hZ2VfaGVyb190b29sdGlwKHRhZ2xpbmUsIGJpbykgKyAnXCI+PGRpdiBpZD1cImhsLWhlcm9kYXRhLWltYWdlLWhlcm8tY29udGFpbmVyXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gaWQ9XCJobC1oZXJvZGF0YS1uYW1lXCI+PC9zcGFuPjxzcGFuIGlkPVwiaGwtaGVyb2RhdGEtdGl0bGVcIj48L3NwYW4+PC9zcGFuPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtdGl0bGUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvOiBmdW5jdGlvbihpbWFnZSwgcmFyaXR5KSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbnRhaW5lcicpLmFwcGVuZCgnPGltZyBjbGFzcz1cImhsLWhlcm9kYXRhLWltYWdlLWhlcm8gaGwtaGVyb2RhdGEtcmFyaXR5LScgKyByYXJpdHkgKyAnXCIgc3JjPVwiJyArIGltYWdlICsgJ1wiPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVyb190b29sdGlwOiBmdW5jdGlvbih0YWdsaW5lLCBiaW8pIHtcclxuICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC10YWxlbnRzLXRvb2x0aXAtbmFtZVxcJz4nICsgdGFnbGluZSArICc8L3NwYW4+PGJyPicgKyBiaW87XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvLWNvbXBvc2l0ZS1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS50ZXh0KHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYWJpbGl0aWVzOiB7XHJcbiAgICAgICAgYmVnaW5Jbm5lcjogZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUgKyAnXCIgY2xhc3M9XCJobC1hYmlsaXRpZXMtaW5uZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbih0eXBlLCBuYW1lLCBkZXNjLCBpbWFnZXBhdGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWlubmVyLScgKyB0eXBlKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAodHlwZSwgbmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5LWltYWdlXCIgc3JjPVwiJyArIGltYWdlcGF0aCArICdcIj48aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2UtZnJhbWVcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgJ3VpL2FiaWxpdHlfaWNvbl9mcmFtZS5wbmdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiSGVyb2ljXCIgfHwgdHlwZSA9PT0gXCJUcmFpdFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLScgKyB0eXBlICsgJ1xcJz5bJyArIHR5cGUgKyAnXTwvc3Bhbj48YnI+PHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGFsZW50VGFibGU6IGZ1bmN0aW9uKHJvd0lkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgnPHRhYmxlIGlkPVwiaGwtdGFsZW50cy10YWJsZVwiIGNsYXNzPVwiZGlzcGxheSB0YWJsZSB0YWJsZS1zbSBkdC1yZXNwb25zaXZlXCIgd2lkdGg9XCIxMDAlXCI+PHRoZWFkIGNsYXNzPVwiXCI+PC90aGVhZD48L3RhYmxlPicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVBYmlsaXR5VGFibGVEYXRhOiBmdW5jdGlvbih0aWVyLCBuYW1lLCBkZXNjLCBpbWFnZSwgcGlja3JhdGUsIHBvcHVsYXJpdHksIHdpbnJhdGUsIHdpbnJhdGVfcGVyY2VudE9uUmFuZ2UsIHdpbnJhdGVEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5kYXRhLnRhbGVudHM7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFsZW50RmllbGQgPSAnPHNwYW4gZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1odG1sPVwidHJ1ZVwiIHRpdGxlPVwiJyArIHNlbGYudG9vbHRpcChuYW1lLCBkZXNjKSArICdcIj4nICtcclxuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGwtbm8td3JhcCBobC1yb3ctaGVpZ2h0XCI+PGltZyBjbGFzcz1cImhsLXRhbGVudHMtdGFsZW50LWltYWdlXCIgc3JjPVwiJyArIGltYWdlICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAnIDxzcGFuIGNsYXNzPVwiaGwtdGFsZW50cy10YWxlbnQtbmFtZVwiPicgKyBuYW1lICsgJzwvc3Bhbj48L3NwYW4+PC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja3JhdGVGaWVsZCA9ICc8c3BhbiBjbGFzcz1cImhsLXJvdy1oZWlnaHRcIj4nICsgcGlja3JhdGUgKyAnPC9zcGFuPic7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9wdWxhcml0eUZpZWxkID0gJzxzcGFuIGNsYXNzPVwiaGwtcm93LWhlaWdodFwiPicgKyBwb3B1bGFyaXR5ICsgJyU8ZGl2IGNsYXNzPVwiaHNsLXBlcmNlbnRiYXIgaHNsLXBlcmNlbnRiYXItcG9wdWxhcml0eVwiIHN0eWxlPVwid2lkdGg6JyArIHBvcHVsYXJpdHkgKyAnJTtcIj48L2Rpdj48L3NwYW4+JztcclxuXHJcbiAgICAgICAgICAgIGxldCB3aW5yYXRlRmllbGQgPSAnJztcclxuICAgICAgICAgICAgaWYgKHdpbnJhdGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzxkaXYgY2xhc3M9XCJoc2wtcGVyY2VudGJhciBoc2wtcGVyY2VudGJhci13aW5yYXRlXCIgc3R5bGU9XCJ3aWR0aDonKyB3aW5yYXRlX3BlcmNlbnRPblJhbmdlICsgJyU7XCI+PC9kaXY+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aW5yYXRlRmllbGQgPSAnPHNwYW4gY2xhc3M9XCJobC1yb3ctaGVpZ2h0XCI+JyArIHdpbnJhdGVEaXNwbGF5ICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3RpZXIsIHRhbGVudEZpZWxkLCBwaWNrcmF0ZUZpZWxkLCBwb3B1bGFyaXR5RmllbGQsIHdpbnJhdGVGaWVsZF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0VGFsZW50VGFibGU6IGZ1bmN0aW9uKGRhdGFUYWJsZUNvbmZpZykge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10YWJsZScpLkRhdGFUYWJsZShkYXRhVGFibGVDb25maWcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDogZnVuY3Rpb24obmFtZSwgZGVzYykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLXRhbGVudHMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL0dldCB0aGUgZGF0YXRhYmxlIG9iamVjdFxyXG4gICAgLy9sZXQgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=