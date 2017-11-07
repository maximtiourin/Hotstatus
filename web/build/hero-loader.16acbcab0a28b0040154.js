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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2Y0NDMwYmIzNDk5YWExOWZhNjMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJhamF4IiwiaW50ZXJuYWwiLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImxvYWQiLCIkIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwianNvbiIsImpzb25faGVyb2RhdGEiLCJqc29uX3N0YXRzIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJ0aXRsZSIsInRhZ2xpbmUiLCJiaW8iLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJmYWlsIiwiYWx3YXlzIiwidmFsIiwidGV4dCIsImF0dHIiLCJrZXkiLCJhdmciLCJwbWluIiwiZG9jdW1lbnQiLCJyZWFkeSIsInRvb2x0aXAiLCJiYXNlVXJsIiwiUm91dGluZyIsImdlbmVyYXRlIiwiZmlsdGVyVHlwZXMiLCJIb3RzdGF0dXNGaWx0ZXIiLCJnZW5lcmF0ZVVybCIsIm9uIiwiZXZlbnQiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsImNsaWNrIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FB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QTdCOztBQUVBO0FBQ0EsUUFBSUMsVUFBVUMsUUFBUUMsUUFBUixDQUFpQix3QkFBakIsQ0FBZDtBQUNBLFFBQUlDLGNBQWMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFsQjtBQUNBOUMsZUFBV0MsSUFBWCxDQUFnQkUsR0FBaEIsQ0FBb0I0QyxnQkFBZ0JDLFdBQWhCLENBQTRCTCxPQUE1QixFQUFxQ0csV0FBckMsQ0FBcEIsRUFBdUV4QyxJQUF2RTs7QUFFQTtBQUNBOztBQUVBO0FBQ0FDLE1BQUUsd0JBQUYsRUFBNEIwQyxFQUE1QixDQUErQixRQUEvQixFQUF5QyxVQUFTQyxLQUFULEVBQWdCO0FBQ3JESCx3QkFBZ0JJLGlCQUFoQixDQUFrQzVDLEVBQUUsc0JBQUYsQ0FBbEMsRUFBNkR1QyxXQUE3RDtBQUNILEtBRkQ7O0FBSUE7QUFDQXZDLE1BQUUsc0JBQUYsRUFBMEI2QyxLQUExQixDQUFnQyxZQUFZO0FBQ3hDLFlBQUlqRCxNQUFNNEMsZ0JBQWdCQyxXQUFoQixDQUE0QkwsT0FBNUIsRUFBcUNHLFdBQXJDLENBQVY7O0FBRUEsWUFBSTNDLFFBQVFILFdBQVdDLElBQVgsQ0FBZ0JFLEdBQWhCLEVBQVosRUFBbUM7QUFDL0JILHVCQUFXQyxJQUFYLENBQWdCRSxHQUFoQixDQUFvQkEsR0FBcEIsRUFBeUJHLElBQXpCO0FBQ0g7QUFDSixLQU5EO0FBT0gsQ0F6QkQsRSIsImZpbGUiOiJoZXJvLWxvYWRlci4xNmFjYmNhYjBhMjhiMDA0MDE1NC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBjZjQ0MzBiYjM0OTlhYTE5ZmE2MyIsIi8vcHJvY2Vzc2luZzogJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+J1xyXG5cclxuLypcclxuICogSGVybyBMb2FkZXJcclxuICogSGFuZGxlcyByZXRyaWV2aW5nIGhlcm8gZGF0YSB0aHJvdWdoIGFqYXggcmVxdWVzdHMgYmFzZWQgb24gc3RhdGUgb2YgZmlsdGVyc1xyXG4gKi9cclxubGV0IEhlcm9Mb2FkZXIgPSB7fTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfaGVyb2RhdGEgPSBkYXRhLmhlcm9kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9kYXRhXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIC8vaW1hZ2VfaGVyb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5pbWFnZV9oZXJvKGpzb25faGVyb2RhdGFbJ2ltYWdlX2hlcm8nXSk7XHJcbiAgICAgICAgICAgICAgICAvL25hbWVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEubmFtZShqc29uX2hlcm9kYXRhWyduYW1lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90aXRsZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50aXRsZShqc29uX2hlcm9kYXRhWyd0aXRsZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGFnbGluZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS50YWdsaW5lKGpzb25faGVyb2RhdGFbJ2Rlc2NfdGFnbGluZSddKTtcclxuICAgICAgICAgICAgICAgIC8vYmlvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmJpbyhqc29uX2hlcm9kYXRhWydkZXNjX2JpbyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogU3RhdHNcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RhdGtleSBpbiBhdmVyYWdlX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2ZXJhZ2Vfc3RhdHMuaGFzT3duUHJvcGVydHkoc3RhdGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBhdmVyYWdlX3N0YXRzW3N0YXRrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQudHlwZSA9PT0gJ2F2Zy1wbWluJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5hdmdfcG1pbihzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10sIGpzb25fc3RhdHNbc3RhdGtleV1bJ3Blcl9taW51dGUnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncGVyY2VudGFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMucGVyY2VudGFnZShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdrZGEnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmtkYShzdGF0a2V5LCBqc29uX3N0YXRzW3N0YXRrZXldWydhdmVyYWdlJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9raWxsc1xyXG4gICAgICAgICAgICAgICAgLy9kYXRhX3N0YXRzLmtpbGxzKGpzb25fc3RhdHNbJ2tpbGxzJ11bJ2F2ZXJhZ2UnXSwganNvbl9zdGF0c1sna2lsbHMnXVsncGVyX21pbnV0ZSddKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZhaWx1cmUgdG8gbG9hZCBEYXRhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL0Rpc2FibGUgUHJvY2Vzc2luZyBJbmRpY2F0b3JcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogSGFuZGxlcyBiaW5kaW5nIGRhdGEgdG8gdGhlIHBhZ2VcclxuICovXHJcbkhlcm9Mb2FkZXIuZGF0YSA9IHtcclxuICAgIGhlcm9kYXRhOiB7XHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtdGl0bGUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWdsaW5lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWRlc2MtdGFnbGluZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbzogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1kZXNjLWJpbycpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVybycpLmF0dHIoJ3NyYycsIHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLnRleHQocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy9FbmFibGUgdG9vbHRpcHMgZm9yIHRoZSBwYWdlXHJcbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnNcclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfcGFnZWRhdGFfaGVybycpO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCIsIFwicmFua1wiLCBcImRhdGVcIl07XHJcbiAgICBIZXJvTG9hZGVyLmFqYXgudXJsKEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcykpLmxvYWQoKTtcclxuXHJcbiAgICAvL0dldCB0aGUgZGF0YXRhYmxlIG9iamVjdFxyXG4gICAgLy9sZXQgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKCQoJ2J1dHRvbi5maWx0ZXItYnV0dG9uJyksIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vQ2FsY3VsYXRlIG5ldyB1cmwgYmFzZWQgb24gZmlsdGVycyBhbmQgbG9hZCBpdCwgb25seSBpZiB0aGUgdXJsIGhhcyBjaGFuZ2VkXHJcbiAgICAkKCdidXR0b24uZmlsdGVyLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHVybCAhPT0gSGVyb0xvYWRlci5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIEhlcm9Mb2FkZXIuYWpheC51cmwodXJsKS5sb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvLWxvYWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=