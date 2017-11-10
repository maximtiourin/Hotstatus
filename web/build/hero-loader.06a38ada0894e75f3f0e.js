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
            //image_hero
            data_herodata.image_hero(json_herodata['image_hero']);
            //name
            data_herodata.name(json_herodata['name']);
            //title
            data_herodata.title(json_herodata['title']);
            //tagline
            data_herodata.tagline(json_herodata['desc_tagline']);
            //bio
            data_herodata.bio(json_herodata['desc_bio']);

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

            for (var r = json_talents['minRow']; r <= json_talents['maxRow']; r++) {
                var rkey = r + '';
                data_talents.generateTierRow(rkey);
                for (var c = json_talents[rkey]['minCol']; c <= json_talents[rkey]['maxCol']; c++) {
                    var ckey = c + '';

                    var talent = json_talents[rkey][ckey];

                    data_talents.generateAbilityRow(rkey, ckey, talent['name'], talent['desc_simple'], talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_display']);
                }
            }

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
        name: function name(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function title(val) {
            $('#hl-herodata-title').text(val);
        },
        tagline: function tagline(val) {
            $('#hl-herodata-desc-tagline').text(val);
        },
        bio: function bio(val) {
            $('#hl-herodata-desc-bio').text(val);
        },
        image_hero: function image_hero(val) {
            $('#hl-herodata-image-hero').attr('src', val);
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
        generateTierRow: function generateTierRow(rowId) {
            $('#hl-talents-container').append('<div id="hl-talents-tier-row-' + rowId + '"></div>');
        },
        generateAbilityRow: function generateAbilityRow(rowId, colId, name, desc, image, pickrate, popularity, winrate, winrateDisplay) {
            $('#hl-talents-tier-row-' + rowId).append('<div id="hl-talents-ability-row-' + colId + '">' + name + ' - ' + pickrate + ' - ' + popularity + '% - ' + winrateDisplay + '</div>');
        },
        empty: function empty() {
            $('#hl-talents-container').empty();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWMzYmQ5YmMwYTA3YTcwMDhmYWIiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwiZGF0YV9hYmlsaXRpZXMiLCJhYmlsaXRpZXMiLCJkYXRhX3RhbGVudHMiLCJ0YWxlbnRzIiwiJCIsInByZXBlbmQiLCJnZXRKU09OIiwiZG9uZSIsImpzb25SZXNwb25zZSIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsImpzb25fYWJpbGl0aWVzIiwianNvbl90YWxlbnRzIiwiZW1wdHkiLCJyZW1vdmVDbGFzcyIsIndpbmRvdyIsInRpdGxlIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJ0YWdsaW5lIiwiYmlvIiwic3RhdGtleSIsImF2ZXJhZ2Vfc3RhdHMiLCJoYXNPd25Qcm9wZXJ0eSIsInN0YXQiLCJ0eXBlIiwiYXZnX3BtaW4iLCJwZXJjZW50YWdlIiwia2RhIiwicmF3IiwidGltZV9zcGVudF9kZWFkIiwiYWJpbGl0eU9yZGVyIiwiYmVnaW5Jbm5lciIsImFiaWxpdHkiLCJnZW5lcmF0ZSIsInIiLCJya2V5IiwiZ2VuZXJhdGVUaWVyUm93IiwiYyIsImNrZXkiLCJ0YWxlbnQiLCJnZW5lcmF0ZUFiaWxpdHlSb3ciLCJ0b29sdGlwIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJnZW5lcmF0ZUFkdmVydGlzaW5nIiwiZmFpbCIsImFsd2F5cyIsInJlbW92ZSIsInN0ciIsImRvY3VtZW50IiwiaGVybyIsIlJvdXRpbmciLCJoZXJvUHJvcGVyTmFtZSIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJ2YWwiLCJ0ZXh0IiwiYXR0ciIsImtleSIsImF2ZyIsInBtaW4iLCJyYXd2YWwiLCJhcHBlbmQiLCJkZXNjIiwiaW1hZ2VwYXRoIiwiaW1hZ2VfYmFzZV9wYXRoIiwicm93SWQiLCJjb2xJZCIsImltYWdlIiwicGlja3JhdGUiLCJwb3B1bGFyaXR5Iiwid2lucmF0ZSIsIndpbnJhdGVEaXNwbGF5IiwicmVhZHkiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsIm9uIiwiZXZlbnQiLCJlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REE7O0FBRUE7Ozs7QUFJQSxJQUFJQSxhQUFhLEVBQWpCOztBQUVBOzs7QUFHQUEsV0FBV0MsWUFBWCxHQUEwQixVQUFTQyxPQUFULEVBQWtCQyxXQUFsQixFQUErQjtBQUNyRCxRQUFJLENBQUNILFdBQVdJLElBQVgsQ0FBZ0JDLFFBQWhCLENBQXlCQyxPQUExQixJQUFxQ0MsZ0JBQWdCQyxZQUF6RCxFQUF1RTtBQUNuRSxZQUFJQyxNQUFNRixnQkFBZ0JHLFdBQWhCLENBQTRCUixPQUE1QixFQUFxQ0MsV0FBckMsQ0FBVjs7QUFFQSxZQUFJTSxRQUFRVCxXQUFXSSxJQUFYLENBQWdCSyxH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QUYsRUFBMkJVLEtBQTNCO0FBQ0g7QUFUSTtBQW5FSyxDQUFsQjs7QUFpRkFWLEVBQUUrQyxRQUFGLEVBQVl3QixLQUFaLENBQWtCLFlBQVc7QUFDekI7QUFDQSxRQUFJNUYsVUFBVXNFLFFBQVFsQixRQUFSLENBQWlCLHdCQUFqQixDQUFkO0FBQ0EsUUFBSW5ELGNBQWMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFsQjtBQUNBSSxvQkFBZ0J3RixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0M1RixXQUF4QztBQUNBSCxlQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQTs7QUFFQTtBQUNBb0IsTUFBRSx3QkFBRixFQUE0QnlFLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckQxRix3QkFBZ0J3RixpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0M1RixXQUF4QztBQUNILEtBRkQ7O0FBSUE7QUFDQW9CLE1BQUUsR0FBRixFQUFPeUUsRUFBUCxDQUFVLG9CQUFWLEVBQWdDLFVBQVNFLENBQVQsRUFBWTtBQUN4Q2xHLG1CQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7QUFDSCxLQUZEO0FBR0gsQ0FuQkQsRSIsImZpbGUiOiJoZXJvLWxvYWRlci4wNmEzOGFkYTA4OTRlNzVmM2YwZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhYzNiZDliYzBhMDdhNzAwOGZhYiIsIi8vcHJvY2Vzc2luZzogJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+J1xyXG5cclxuLypcclxuICogSGVybyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIGhlcm8gZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IEhlcm9Mb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgbG9hZGluZyBvbiB2YWxpZCBmaWx0ZXJzLCBtYWtpbmcgc3VyZSB0byBvbmx5IGZpcmUgb25jZSB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLnZhbGlkYXRlTG9hZCA9IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlclR5cGVzKSB7XHJcbiAgICBpZiAoIUhlcm9Mb2FkZXIuYWpheC5pbnRlcm5hbC5sb2FkaW5nICYmIEhvdHN0YXR1c0ZpbHRlci52YWxpZEZpbHRlcnMpIHtcclxuICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHVybCAhPT0gSGVyb0xvYWRlci5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIEhlcm9Mb2FkZXIuYWpheC51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBBamF4IHJlcXVlc3RzXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmFqYXggPSB7XHJcbiAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLCAvL1doZXRoZXIgb3Igbm90IHRoZSBoZXJvIGxvYWRlciBpcyBjdXJyZW50bHkgbG9hZGluZyBhIHJlc3VsdFxyXG4gICAgICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgICAgICBkYXRhU3JjOiAnZGF0YScsIC8vVGhlIGFycmF5IG9mIGRhdGEgaXMgZm91bmQgaW4gLmRhdGEgZmllbGRcclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogSWYgc3VwcGxpZWQgYSB1cmwgd2lsbCBzZXQgdGhlIGFqYXggdXJsIHRvIHRoZSBnaXZlbiB1cmwsIGFuZCB0aGVuIHJldHVybiB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2Ugd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgdXJsIHRoZSBhamF4IG9iamVjdCBpcyBzZXQgdG8gcmVxdWVzdCBmcm9tLlxyXG4gICAgICovXHJcbiAgICB1cmw6IGZ1bmN0aW9uKHVybCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuYWpheDtcclxuXHJcbiAgICAgICAgaWYgKHVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcm5hbC51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmludGVybmFsLnVybCA9IHVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBSZWxvYWRzIGRhdGEgZnJvbSB0aGUgY3VycmVudCBpbnRlcm5hbCB1cmwsIGxvb2tpbmcgZm9yIGRhdGEgaW4gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZGF0YVNyYyBmaWVsZC5cclxuICAgICAqIFJldHVybnMgdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBsb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IEhlcm9Mb2FkZXIuYWpheDtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBIZXJvTG9hZGVyLmRhdGE7XHJcbiAgICAgICAgbGV0IGRhdGFfaGVyb2RhdGEgPSBkYXRhLmhlcm9kYXRhO1xyXG4gICAgICAgIGxldCBkYXRhX3N0YXRzID0gZGF0YS5zdGF0cztcclxuICAgICAgICBsZXQgZGF0YV9hYmlsaXRpZXMgPSBkYXRhLmFiaWxpdGllcztcclxuICAgICAgICBsZXQgZGF0YV90YWxlbnRzID0gZGF0YS50YWxlbnRzO1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJoZXJvbG9hZGVyLXByb2Nlc3NpbmdcIj48aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PicpO1xyXG5cclxuICAgICAgICAvL0FqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2RhdGEgPSBqc29uWydoZXJvZGF0YSddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdHMgPSBqc29uWydzdGF0cyddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fYWJpbGl0aWVzID0ganNvblsnYWJpbGl0aWVzJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl90YWxlbnRzID0ganNvblsndGFsZW50cyddO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBFbXB0eSBkeW5hbWljYWxseSBmaWxsZWQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhX2FiaWxpdGllcy5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgZGF0YV90YWxlbnRzLmVtcHR5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddKTtcclxuICAgICAgICAgICAgICAgIC8vbmFtZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5uYW1lKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICAvL3RpdGxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLnRpdGxlKGpzb25faGVyb2RhdGFbJ3RpdGxlJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90YWdsaW5lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLnRhZ2xpbmUoanNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9iaW9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuYmlvKGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdGF0a2V5IGluIGF2ZXJhZ2Vfc3RhdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZlcmFnZV9zdGF0cy5oYXNPd25Qcm9wZXJ0eShzdGF0a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGF2ZXJhZ2Vfc3RhdHNbc3RhdGtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC50eXBlID09PSAnYXZnLXBtaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmF2Z19wbWluKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSwganNvbl9zdGF0c1tzdGF0a2V5XVsncGVyX21pbnV0ZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdwZXJjZW50YWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wZXJjZW50YWdlKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ2tkYScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMua2RhKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncmF3Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5yYXcoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAndGltZS1zcGVudC1kZWFkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy50aW1lX3NwZW50X2RlYWQoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogQWJpbGl0aWVzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBhYmlsaXR5T3JkZXIgPSBbXCJOb3JtYWxcIiwgXCJIZXJvaWNcIiwgXCJUcmFpdFwiXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgYWJpbGl0eU9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV9hYmlsaXRpZXMuYmVnaW5Jbm5lcih0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhYmlsaXR5IG9mIGpzb25fYWJpbGl0aWVzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfYWJpbGl0aWVzLmdlbmVyYXRlKHR5cGUsIGFiaWxpdHlbJ25hbWUnXSwgYWJpbGl0eVsnZGVzY19zaW1wbGUnXSwgYWJpbGl0eVsnaW1hZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBUYWxlbnRzXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSBqc29uX3RhbGVudHNbJ21pblJvdyddOyByIDw9IGpzb25fdGFsZW50c1snbWF4Um93J107IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBya2V5ID0gciArICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZVRpZXJSb3cocmtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IGpzb25fdGFsZW50c1tya2V5XVsnbWluQ29sJ107IGMgPD0ganNvbl90YWxlbnRzW3JrZXldWydtYXhDb2wnXTsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBja2V5ID0gYyArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhbGVudCA9IGpzb25fdGFsZW50c1tya2V5XVtja2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfdGFsZW50cy5nZW5lcmF0ZUFiaWxpdHlSb3cocmtleSwgY2tleSwgdGFsZW50WyduYW1lJ10sIHRhbGVudFsnZGVzY19zaW1wbGUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhbGVudFsnaW1hZ2UnXSwgdGFsZW50WydwaWNrcmF0ZSddLCB0YWxlbnRbJ3BvcHVsYXJpdHknXSwgdGFsZW50Wyd3aW5yYXRlJ10sIHRhbGVudFsnd2lucmF0ZV9kaXNwbGF5J10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0VuYWJsZSB0b29sdGlwcyBmb3IgdGhlIHBhZ2VcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEVuYWJsZSBhZHZlcnRpc2luZ1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBIb3RzdGF0dXMuYWR2ZXJ0aXNpbmcuZ2VuZXJhdGVBZHZlcnRpc2luZygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgJCgnLmhlcm9sb2FkZXItcHJvY2Vzc2luZycpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIG5hbWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtbmFtZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLXRpdGxlJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFnbGluZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1kZXNjLXRhZ2xpbmUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW86IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtZGVzYy1iaW8nKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8nKS5hdHRyKCdzcmMnLCB2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS50ZXh0KHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYWJpbGl0aWVzOiB7XHJcbiAgICAgICAgYmVnaW5Jbm5lcjogZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgJCgnI2hsLWFiaWxpdGllcy1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgaWQ9XCJobC1hYmlsaXRpZXMtaW5uZXItJyArIHR5cGUgKyAnXCIgY2xhc3M9XCJobC1hYmlsaXRpZXMtaW5uZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbih0eXBlLCBuYW1lLCBkZXNjLCBpbWFnZXBhdGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmRhdGEuYWJpbGl0aWVzO1xyXG4gICAgICAgICAgICAkKCcjaGwtYWJpbGl0aWVzLWlubmVyLScgKyB0eXBlKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJobC1hYmlsaXRpZXMtYWJpbGl0eVwiPjxzcGFuIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtaHRtbD1cInRydWVcIiB0aXRsZT1cIicgKyBzZWxmLnRvb2x0aXAodHlwZSwgbmFtZSwgZGVzYykgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBjbGFzcz1cImhsLWFiaWxpdGllcy1hYmlsaXR5LWltYWdlXCIgc3JjPVwiJyArIGltYWdlcGF0aCArICdcIj48aW1nIGNsYXNzPVwiaGwtYWJpbGl0aWVzLWFiaWxpdHktaW1hZ2UtZnJhbWVcIiBzcmM9XCInICsgaW1hZ2VfYmFzZV9wYXRoICsgJ3VpL2FiaWxpdHlfaWNvbl9mcmFtZS5wbmdcIj4nICtcclxuICAgICAgICAgICAgICAgICc8L3NwYW4+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1hYmlsaXRpZXMtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvb2x0aXA6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiSGVyb2ljXCIgfHwgdHlwZSA9PT0gXCJUcmFpdFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVxcJ2hsLWFiaWxpdGllcy10b29sdGlwLScgKyB0eXBlICsgJ1xcJz5bJyArIHR5cGUgKyAnXTwvc3Bhbj48YnI+PHNwYW4gY2xhc3M9XFwnaGwtYWJpbGl0aWVzLXRvb2x0aXAtbmFtZVxcJz4nICsgbmFtZSArICc8L3NwYW4+PGJyPicgKyBkZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cXCdobC1hYmlsaXRpZXMtdG9vbHRpcC1uYW1lXFwnPicgKyBuYW1lICsgJzwvc3Bhbj48YnI+JyArIGRlc2M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGFsZW50czoge1xyXG4gICAgICAgIGdlbmVyYXRlVGllclJvdzogZnVuY3Rpb24ocm93SWQpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXRhbGVudHMtY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGlkPVwiaGwtdGFsZW50cy10aWVyLXJvdy0nICsgcm93SWQgKyAnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZUFiaWxpdHlSb3c6IGZ1bmN0aW9uKHJvd0lkLCBjb2xJZCwgbmFtZSwgZGVzYywgaW1hZ2UsIHBpY2tyYXRlLCBwb3B1bGFyaXR5LCB3aW5yYXRlLCB3aW5yYXRlRGlzcGxheSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtdGFsZW50cy10aWVyLXJvdy0nICsgcm93SWQpLmFwcGVuZCgnPGRpdiBpZD1cImhsLXRhbGVudHMtYWJpbGl0eS1yb3ctJyArIGNvbElkICsgJ1wiPicgKyBuYW1lICsgJyAtICcgKyBwaWNrcmF0ZSArICcgLSAnICsgcG9wdWxhcml0eSArICclIC0gJyArIHdpbnJhdGVEaXNwbGF5ICsnPC9kaXY+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXB0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNobC10YWxlbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVycywgYW5kIGF0dGVtcHQgdG8gbG9hZCBhZnRlciB2YWxpZGF0aW9uXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIEhlcm9Mb2FkZXIudmFsaWRhdGVMb2FkKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL0dldCB0aGUgZGF0YXRhYmxlIG9iamVjdFxyXG4gICAgLy9sZXQgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=