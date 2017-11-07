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
 * Handles Ajax requests
 */
HeroLoader.ajax = {
    internal: {
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

        //Enable Processing Indicator

        //Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var data = HeroLoader.data;
            var data_herodata = data.herodata;
            var data_stats = data.stats;

            var json = jsonResponse[self.internal.dataSrc];
            var json_herodata = json['herodata'];
            var json_stats = json['stats'];

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
            //kills
            //data_stats.kills(json_stats['kills']['average'], json_stats['kills']['per_minute']);
        }).fail(function () {
            //Failure to load Data
        }).always(function () {
            //Disable Processing Indicator
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
            history.pushState(hero, hero, url);
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
    }
};

$(document).ready(function () {
    //Enable tooltips for the page
    $('[data-toggle="tooltip"]').tooltip();

    //Set the initial url based on default filters
    var baseUrl = Routing.generate('herodata_pagedata_hero');
    var filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HeroLoader.ajax.url(HotstatusFilter.generateUrl(baseUrl, filterTypes)).load();

    //Get the datatable object
    //let table = $('#hsl-table').DataTable(heroes_statslist);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event) {
        HotstatusFilter.validateSelectors($('button.filter-button'), filterTypes);
    });

    //Todo, instead of using blur event, use the change above, but add a timer for when the data is loaded after a change (or explore other options)
    /*$('div.filter-selector > .btn.dropdown-toggle').on('blur', function(event) {
        let valid = HotstatusFilter.validateSelectors($('button.filter-button'), filterTypes);
          if (valid) {
            let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);
              if (url !== HeroLoader.ajax.url()) {
                HeroLoader.ajax.url(url).load();
            }
        }
    });*/

    //Calculate new url based on filters and load it, only if the url has changed
    $('button.filter-button').click(function () {
        var url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== HeroLoader.ajax.url()) {
            HeroLoader.ajax.url(url).load();
        }
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWI4MDFlYmVjNmNiMjQzMGRiN2EiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJhamF4IiwiaW50ZXJuYWwiLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImxvYWQiLCIkIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwianNvbiIsImpzb25faGVyb2RhdGEiLCJqc29uX3N0YXRzIiwid2luZG93IiwidGl0bGUiLCJpbWFnZV9oZXJvIiwibmFtZSIsInRhZ2xpbmUiLCJiaW8iLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJmYWlsIiwiYWx3YXlzIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImdlbmVyYXRlIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwidmFsIiwidGV4dCIsImF0dHIiLCJrZXkiLCJhdmciLCJwbWluIiwicmF3dmFsIiwicmVhZHkiLCJ0b29sdGlwIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2VuZXJhdGVVcmwiLCJvbiIsImV2ZW50IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJjbGljayJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtB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WWMsS0FBWixDQUFrQixZQUFXO0FBQ3pCO0FBQ0E3QyxNQUFFLHlCQUFGLEVBQTZCOEMsT0FBN0I7O0FBRUE7QUFDQSxRQUFJQyxVQUFVZCxRQUFRQyxRQUFSLENBQWlCLHdCQUFqQixDQUFkO0FBQ0EsUUFBSWMsY0FBYyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQWxCO0FBQ0F2RCxlQUFXQyxJQUFYLENBQWdCRSxHQUFoQixDQUFvQnFELGdCQUFnQkMsV0FBaEIsQ0FBNEJILE9BQTVCLEVBQXFDQyxXQUFyQyxDQUFwQixFQUF1RWpELElBQXZFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQUMsTUFBRSx3QkFBRixFQUE0Qm1ELEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLFVBQVNDLEtBQVQsRUFBZ0I7QUFDckRILHdCQUFnQkksaUJBQWhCLENBQWtDckQsRUFBRSxzQkFBRixDQUFsQyxFQUE2RGdELFdBQTdEO0FBQ0gsS0FGRDs7QUFJQTtBQUNBOzs7Ozs7Ozs7O0FBWUE7QUFDQWhELE1BQUUsc0JBQUYsRUFBMEJzRCxLQUExQixDQUFnQyxZQUFZO0FBQ3hDLFlBQUkxRCxNQUFNcUQsZ0JBQWdCQyxXQUFoQixDQUE0QkgsT0FBNUIsRUFBcUNDLFdBQXJDLENBQVY7O0FBRUEsWUFBSXBELFFBQVFILFdBQVdDLElBQVgsQ0FBZ0JFLEdBQWhCLEVBQVosRUFBbUM7QUFDL0JILHVCQUFXQyxJQUFYLENBQWdCRSxHQUFoQixDQUFvQkEsR0FBcEIsRUFBeUJHLElBQXpCO0FBQ0g7QUFDSixLQU5EO0FBT0gsQ0F0Q0QsRSIsImZpbGUiOiJoZXJvLWxvYWRlci41ZTBjOGFhMDFiN2M2MzQwODA1My5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhYjgwMWViZWM2Y2IyNDMwZGI3YSIsIi8vcHJvY2Vzc2luZzogJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+J1xyXG5cclxuLypcclxuICogSGVybyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIGhlcm8gZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IEhlcm9Mb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfaGVyb2RhdGEgPSBkYXRhLmhlcm9kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIFdpbmRvd1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy50aXRsZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS53aW5kb3cudXJsKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9kYXRhXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGFnbGluZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50YWdsaW5lKGpzb25faGVyb2RhdGFbJ2Rlc2NfdGFnbGluZSddKTtcclxuICAgICAgICAgICAgICAgIC8vYmlvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmJpbyhqc29uX2hlcm9kYXRhWydkZXNjX2JpbyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3JhdycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucmF3KHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ3RpbWUtc3BlbnQtZGVhZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMudGltZV9zcGVudF9kZWFkKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2tpbGxzXHJcbiAgICAgICAgICAgICAgICAvL2RhdGFfc3RhdHMua2lsbHMoanNvbl9zdGF0c1sna2lsbHMnXVsnYXZlcmFnZSddLCBqc29uX3N0YXRzWydraWxscyddWydwZXJfbWludXRlJ10pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgd2luZG93OiB7XHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiSG90c3RhdC51czogXCIgKyBzdHI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cmw6IGZ1bmN0aW9uKGhlcm8pIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoXCJoZXJvXCIsIHtoZXJvUHJvcGVyTmFtZTogaGVyb30pO1xyXG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShoZXJvLCBoZXJvLCB1cmwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoZXJvZGF0YToge1xyXG4gICAgICAgIG5hbWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtbmFtZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLXRpdGxlJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFnbGluZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1kZXNjLXRhZ2xpbmUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW86IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtZGVzYy1iaW8nKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZV9oZXJvOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWltYWdlLWhlcm8nKS5hdHRyKCdzcmMnLCB2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdGF0czoge1xyXG4gICAgICAgIGF2Z19wbWluOiBmdW5jdGlvbihrZXksIGF2ZywgcG1pbikge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctYXZnJykudGV4dChhdmcpO1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcG1pbicpLnRleHQocG1pbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZXJjZW50YWdlOiBmdW5jdGlvbihrZXksIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgJCgnI2hsLXN0YXRzLScgKyBrZXkgKyAnLXBlcmNlbnRhZ2UnKS50ZXh0KHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2RhOiBmdW5jdGlvbihrZXksIGtkYSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICcta2RhJykudGV4dChrZGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmF3OiBmdW5jdGlvbihrZXksIHJhd3ZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcmF3JykudGV4dChyYXd2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZV9zcGVudF9kZWFkOiBmdW5jdGlvbihrZXksIHRpbWVfc3BlbnRfZGVhZCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctdGltZS1zcGVudC1kZWFkJykudGV4dCh0aW1lX3NwZW50X2RlYWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvL0VuYWJsZSB0b29sdGlwcyBmb3IgdGhlIHBhZ2VcclxuICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVyc1xyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdoZXJvZGF0YV9wYWdlZGF0YV9oZXJvJyk7XHJcbiAgICBsZXQgZmlsdGVyVHlwZXMgPSBbXCJoZXJvXCIsIFwiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIEhlcm9Mb2FkZXIuYWpheC51cmwoSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKSkubG9hZCgpO1xyXG5cclxuICAgIC8vR2V0IHRoZSBkYXRhdGFibGUgb2JqZWN0XHJcbiAgICAvL2xldCB0YWJsZSA9ICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMoJCgnYnV0dG9uLmZpbHRlci1idXR0b24nKSwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Ub2RvLCBpbnN0ZWFkIG9mIHVzaW5nIGJsdXIgZXZlbnQsIHVzZSB0aGUgY2hhbmdlIGFib3ZlLCBidXQgYWRkIGEgdGltZXIgZm9yIHdoZW4gdGhlIGRhdGEgaXMgbG9hZGVkIGFmdGVyIGEgY2hhbmdlIChvciBleHBsb3JlIG90aGVyIG9wdGlvbnMpXHJcbiAgICAvKiQoJ2Rpdi5maWx0ZXItc2VsZWN0b3IgPiAuYnRuLmRyb3Bkb3duLXRvZ2dsZScpLm9uKCdibHVyJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBsZXQgdmFsaWQgPSBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMoJCgnYnV0dG9uLmZpbHRlci1idXR0b24nKSwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodmFsaWQpIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsICE9PSBIZXJvTG9hZGVyLmFqYXgudXJsKCkpIHtcclxuICAgICAgICAgICAgICAgIEhlcm9Mb2FkZXIuYWpheC51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTsqL1xyXG5cclxuICAgIC8vQ2FsY3VsYXRlIG5ldyB1cmwgYmFzZWQgb24gZmlsdGVycyBhbmQgbG9hZCBpdCwgb25seSBpZiB0aGUgdXJsIGhhcyBjaGFuZ2VkXHJcbiAgICAkKCdidXR0b24uZmlsdGVyLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHVybCAhPT0gSGVyb0xvYWRlci5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIEhlcm9Mb2FkZXIuYWpheC51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=