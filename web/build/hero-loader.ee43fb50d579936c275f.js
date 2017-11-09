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

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url).done(function (jsonResponse) {
            var data = HeroLoader.data;
            var data_herodata = data.herodata;
            var data_stats = data.stats;

            var json = jsonResponse[self.internal.dataSrc];
            var json_herodata = json['herodata'];
            var json_stats = json['stats'];

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
    }
};

$(document).ready(function () {
    //Enable tooltips for the page
    $('[data-toggle="tooltip"]').tooltip();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTU4YjBhNDE1MzAxZDE1NWEwZDUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJ2YWxpZGF0ZUxvYWQiLCJiYXNlVXJsIiwiZmlsdGVyVHlwZXMiLCJhamF4IiwiaW50ZXJuYWwiLCJsb2FkaW5nIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJsb2FkIiwiZGF0YVNyYyIsInNlbGYiLCIkIiwicHJlcGVuZCIsImdldEpTT04iLCJkb25lIiwianNvblJlc3BvbnNlIiwiZGF0YSIsImRhdGFfaGVyb2RhdGEiLCJoZXJvZGF0YSIsImRhdGFfc3RhdHMiLCJzdGF0cyIsImpzb24iLCJqc29uX2hlcm9kYXRhIiwianNvbl9zdGF0cyIsInJlbW92ZUNsYXNzIiwid2luZG93IiwidGl0bGUiLCJpbWFnZV9oZXJvIiwibmFtZSIsInRhZ2xpbmUiLCJiaW8iLCJzdGF0a2V5IiwiYXZlcmFnZV9zdGF0cyIsImhhc093blByb3BlcnR5Iiwic3RhdCIsInR5cGUiLCJhdmdfcG1pbiIsInBlcmNlbnRhZ2UiLCJrZGEiLCJyYXciLCJ0aW1lX3NwZW50X2RlYWQiLCJIb3RzdGF0dXMiLCJhZHZlcnRpc2luZyIsImdlbmVyYXRlQWR2ZXJ0aXNpbmciLCJmYWlsIiwiYWx3YXlzIiwicmVtb3ZlIiwic3RyIiwiZG9jdW1lbnQiLCJoZXJvIiwiUm91dGluZyIsImdlbmVyYXRlIiwiaGVyb1Byb3Blck5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwidmFsIiwidGV4dCIsImF0dHIiLCJrZXkiLCJhdmciLCJwbWluIiwicmF3dmFsIiwicmVhZHkiLCJ0b29sdGlwIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJvbiIsImV2ZW50IiwiZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFF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QUE1QixFQUFvQyxNQUFwQyxDQUFsQjtBQUNBSSxvQkFBZ0I0RCxpQkFBaEIsQ0FBa0MsSUFBbEMsRUFBd0NoRSxXQUF4QztBQUNBSCxlQUFXQyxZQUFYLENBQXdCQyxPQUF4QixFQUFpQ0MsV0FBakM7O0FBRUE7QUFDQTs7QUFFQTtBQUNBVyxNQUFFLHdCQUFGLEVBQTRCc0QsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRDlELHdCQUFnQjRELGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q2hFLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBVyxNQUFFLEdBQUYsRUFBT3NELEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeEN0RSxtQkFBV0MsWUFBWCxDQUF3QkMsT0FBeEIsRUFBaUNDLFdBQWpDO0FBQ0gsS0FGRDtBQUdILENBdEJELEUiLCJmaWxlIjoiaGVyby1sb2FkZXIuZWU0M2ZiNTBkNTc5OTM2YzI3NWYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNTU4YjBhNDE1MzAxZDE1NWEwZDUiLCIvL3Byb2Nlc3Npbmc6ICc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPidcclxuXHJcbi8qXHJcbiAqIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGxvYWRpbmcgb24gdmFsaWQgZmlsdGVycywgbWFraW5nIHN1cmUgdG8gb25seSBmaXJlIG9uY2UgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKi9cclxuSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJUeXBlcykge1xyXG4gICAgaWYgKCFIZXJvTG9hZGVyLmFqYXguaW50ZXJuYWwubG9hZGluZyAmJiBIb3RzdGF0dXNGaWx0ZXIudmFsaWRGaWx0ZXJzKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgQWpheCByZXF1ZXN0c1xyXG4gKi9cclxuSGVyb0xvYWRlci5hamF4ID0ge1xyXG4gICAgaW50ZXJuYWw6IHtcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZSwgLy9XaGV0aGVyIG9yIG5vdCB0aGUgaGVybyBsb2FkZXIgaXMgY3VycmVudGx5IGxvYWRpbmcgYSByZXN1bHRcclxuICAgICAgICB1cmw6ICcnLCAvL3VybCB0byBnZXQgYSByZXNwb25zZSBmcm9tXHJcbiAgICAgICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIElmIHN1cHBsaWVkIGEgdXJsIHdpbGwgc2V0IHRoZSBhamF4IHVybCB0byB0aGUgZ2l2ZW4gdXJsLCBhbmQgdGhlbiByZXR1cm4gdGhlIGFqYXggb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVybCB0aGUgYWpheCBvYmplY3QgaXMgc2V0IHRvIHJlcXVlc3QgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdXJsOiBmdW5jdGlvbih1cmwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICh1cmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWwudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKlxyXG4gICAgICogUmVsb2FkcyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaW50ZXJuYWwgdXJsLCBsb29raW5nIGZvciBkYXRhIGluIHRoZSBjdXJyZW50IGludGVybmFsIGRhdGFTcmMgZmllbGQuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSBIZXJvTG9hZGVyLmFqYXg7XHJcblxyXG4gICAgICAgIC8vRW5hYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCgnI2hlcm9sb2FkZXItY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImhlcm9sb2FkZXItcHJvY2Vzc2luZ1wiPjxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluIGZhLTV4IGZhLWZ3XCI+PC9pPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIC8vQWpheCBSZXF1ZXN0XHJcbiAgICAgICAgJC5nZXRKU09OKHNlbGYuaW50ZXJuYWwudXJsKVxyXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc29uUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gSGVyb0xvYWRlci5kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfaGVyb2RhdGEgPSBkYXRhLmhlcm9kYXRhO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFfc3RhdHMgPSBkYXRhLnN0YXRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBqc29uID0ganNvblJlc3BvbnNlW3NlbGYuaW50ZXJuYWwuZGF0YVNyY107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9oZXJvZGF0YSA9IGpzb25bJ2hlcm9kYXRhJ107XHJcbiAgICAgICAgICAgICAgICBsZXQganNvbl9zdGF0cyA9IGpzb25bJ3N0YXRzJ107XHJcblxyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAqIEhlcm9sb2FkZXIgQ29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICQoJyNoZXJvbG9hZGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdpbml0aWFsLWxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogV2luZG93XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGRhdGEud2luZG93LnRpdGxlKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLndpbmRvdy51cmwoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogSGVyb2RhdGFcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgLy9pbWFnZV9oZXJvXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLmltYWdlX2hlcm8oanNvbl9oZXJvZGF0YVsnaW1hZ2VfaGVybyddKTtcclxuICAgICAgICAgICAgICAgIC8vbmFtZVxyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5uYW1lKGpzb25faGVyb2RhdGFbJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICAgICAvL3RpdGxlXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLnRpdGxlKGpzb25faGVyb2RhdGFbJ3RpdGxlJ10pO1xyXG4gICAgICAgICAgICAgICAgLy90YWdsaW5lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLnRhZ2xpbmUoanNvbl9oZXJvZGF0YVsnZGVzY190YWdsaW5lJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9iaW9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuYmlvKGpzb25faGVyb2RhdGFbJ2Rlc2NfYmlvJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBTdGF0c1xyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdGF0a2V5IGluIGF2ZXJhZ2Vfc3RhdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZlcmFnZV9zdGF0cy5oYXNPd25Qcm9wZXJ0eShzdGF0a2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGF2ZXJhZ2Vfc3RhdHNbc3RhdGtleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC50eXBlID09PSAnYXZnLXBtaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhX3N0YXRzLmF2Z19wbWluKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSwganNvbl9zdGF0c1tzdGF0a2V5XVsncGVyX21pbnV0ZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LnR5cGUgPT09ICdwZXJjZW50YWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5wZXJjZW50YWdlKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQudHlwZSA9PT0gJ2tkYScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfc3RhdHMua2RhKHN0YXRrZXksIGpzb25fc3RhdHNbc3RhdGtleV1bJ2F2ZXJhZ2UnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAncmF3Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy5yYXcoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC50eXBlID09PSAndGltZS1zcGVudC1kZWFkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9zdGF0cy50aW1lX3NwZW50X2RlYWQoc3RhdGtleSwganNvbl9zdGF0c1tzdGF0a2V5XVsnYXZlcmFnZSddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEhvdHN0YXR1cy5hZHZlcnRpc2luZy5nZW5lcmF0ZUFkdmVydGlzaW5nKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9GYWlsdXJlIHRvIGxvYWQgRGF0YVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9EaXNhYmxlIFByb2Nlc3NpbmcgSW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAkKCcuaGVyb2xvYWRlci1wcm9jZXNzaW5nJykucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEhhbmRsZXMgYmluZGluZyBkYXRhIHRvIHRoZSBwYWdlXHJcbiAqL1xyXG5IZXJvTG9hZGVyLmRhdGEgPSB7XHJcbiAgICB3aW5kb3c6IHtcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCJIb3RzdGF0LnVzOiBcIiArIHN0cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVybDogZnVuY3Rpb24oaGVybykge1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gUm91dGluZy5nZW5lcmF0ZShcImhlcm9cIiwge2hlcm9Qcm9wZXJOYW1lOiBoZXJvfSk7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhlcm8sIGhlcm8sIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhlcm9kYXRhOiB7XHJcbiAgICAgICAgbmFtZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1uYW1lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtdGl0bGUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YWdsaW5lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWRlc2MtdGFnbGluZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbzogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1kZXNjLWJpbycpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlX2hlcm86IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtaW1hZ2UtaGVybycpLmF0dHIoJ3NyYycsIHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN0YXRzOiB7XHJcbiAgICAgICAgYXZnX3BtaW46IGZ1bmN0aW9uKGtleSwgYXZnLCBwbWluKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1hdmcnKS50ZXh0KGF2Zyk7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1wbWluJykudGV4dChwbWluKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBlcmNlbnRhZ2U6IGZ1bmN0aW9uKGtleSwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAkKCcjaGwtc3RhdHMtJyArIGtleSArICctcGVyY2VudGFnZScpLnRleHQocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZGE6IGZ1bmN0aW9uKGtleSwga2RhKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1rZGEnKS50ZXh0KGtkYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByYXc6IGZ1bmN0aW9uKGtleSwgcmF3dmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy1yYXcnKS50ZXh0KHJhd3ZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lX3NwZW50X2RlYWQ6IGZ1bmN0aW9uKGtleSwgdGltZV9zcGVudF9kZWFkKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1zdGF0cy0nICsga2V5ICsgJy10aW1lLXNwZW50LWRlYWQnKS50ZXh0KHRpbWVfc3BlbnRfZGVhZCk7XHJcbiAgICAgICAgfSxcclxuICAgIH1cclxufTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIC8vRW5hYmxlIHRvb2x0aXBzIGZvciB0aGUgcGFnZVxyXG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzLCBhbmQgYXR0ZW1wdCB0byBsb2FkIGFmdGVyIHZhbGlkYXRpb25cclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfcGFnZWRhdGFfaGVybycpO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiaGVyb1wiLCBcImdhbWVUeXBlXCIsIFwibWFwXCIsIFwicmFua1wiLCBcImRhdGVcIl07XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgSGVyb0xvYWRlci52YWxpZGF0ZUxvYWQoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgIC8vR2V0IHRoZSBkYXRhdGFibGUgb2JqZWN0XHJcbiAgICAvL2xldCB0YWJsZSA9ICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvTG9hZGVyLnZhbGlkYXRlTG9hZChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==