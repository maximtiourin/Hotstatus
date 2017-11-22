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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/hotstatus.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/hotstatus.js":
/*!********************************!*\
  !*** ./assets/js/hotstatus.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

//Begin hotstatus definitions
(function ($) {
    var Hotstatus = {
        advertising: {
            internal: {
                generated: false,
                generateByDefault: true
            },
            generateAdvertising: function generateAdvertising() {
                var self = Hotstatus.advertising;

                if (!self.internal.generated) {
                    //Enable/Disable ad classes
                    if (document.documentElement.clientWidth >= 1200) {
                        $('.adslot_vertical').addClass('adsbygoogle');
                    }

                    //Google Ads Define
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {
                        //Google ad exception -- fail quietly
                    }

                    self.internal.generated = true;
                }
            }
        },
        date: {
            /*
             * Given a UTC unix timestamp, returns the relative time between that timestamp and now, in the string form of:
             * 15 seconds ago || 3 minutes ago || 2 days ago
             */
            getRelativeTime: function getRelativeTime(ts) {
                var secs = Math.round(Date.now() / 1000) - ts; //Time Difference in seconds

                var plural = function plural(val) {
                    if (val === 1) {
                        return '';
                    } else {
                        return 's';
                    }
                };

                var timestr = function timestr(str, amt) {
                    var val = Math.floor(amt);

                    return val + " " + str + plural(val) + " ago";
                };

                //Seconds
                var mins = secs / 60.0;
                if (mins >= 1) {
                    var hours = mins / 60.0;

                    if (hours >= 1) {
                        var days = hours / 24.0;

                        if (days >= 1) {
                            var months = days / 30.0;

                            if (months >= 1) {
                                var years = months / 12.0;

                                if (years >= 1) {
                                    return timestr("year", years);
                                } else {
                                    return timestr("month", months);
                                }
                            } else {
                                return timestr("day", days);
                            }
                        } else {
                            return timestr("hour", hours);
                        }
                    } else {
                        return timestr("minute", mins);
                    }
                } else {
                    return timestr("second", secs);
                }
            },
            /*
             * Given a time in seconds, returns a string that describes the length of time in the string form of:
             * {mins}m {secs}s
             */
            getMinuteSecondTime: function getMinuteSecondTime(secs) {

                var mins = Math.floor(secs / 60.0);
                if (mins >= 1) {
                    var rsecs = secs % 60;

                    return mins + "m " + rsecs + "s";
                } else {
                    return secs + "s";
                }
            }
        }
    };
    window.Hotstatus = Hotstatus;

    var HotstatusFilter = {
        validFilters: false,
        /*
         * Validates the selectors of the given filter types, if their current selections are invalid, then
         * disable the given submit element and add a filter-error class to the invalid selectors. Returns
         * true if all selectors were valid, false if any selector was invalid
         */
        validateSelectors: function validateSelectors(filterSubmitElement, filter_types) {
            var self = HotstatusFilter;

            var invalid = false;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = filter_types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var type = _step.value;

                    var fvals = self.getSelectorValues(type);
                    var fcount = self.countSelectorOptions(type);

                    if (fvals === null || fvals.length <= 0) {
                        //Toggle filter-error on
                        self.setSelectorError(type, true);
                        invalid = true;
                    } else {
                        //Make sure filter-error is toggled off
                        self.setSelectorError(type, false);
                    }
                }
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

            if (invalid) {
                if (filterSubmitElement !== null) filterSubmitElement.prop("disabled", true);
                self.validFilters = false;
                return false;
            } else {
                if (filterSubmitElement !== null) filterSubmitElement.prop("disabled", false);
                self.validFilters = true;
                return true;
            }
        },
        /*
         * Generates a url with filter query parameters given a baseUrl and the filter types to look for.
         *
         * Filter types is an array of strings describing the types of filters in use
         * to generate a url for. EX: ['map', 'rank', 'gameType']
         */
        generateUrl: function generateUrl(baseUrl, filter_types) {
            var self = HotstatusFilter;

            var filterFragments = {};

            //Check filters
            var filterCount = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = filter_types[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var type = _step2.value;

                    //Check if filter fragment has been set yet
                    if (!filterFragments.hasOwnProperty(type)) {
                        //Attempt to find the filter and get its values
                        var fvals = self.getSelectorValues(type);

                        if (typeof fvals === "string" || fvals instanceof String) {
                            filterFragments[type] = type + '=' + fvals;
                            filterCount++;
                        } else if (fvals !== null && fvals.length > 0) {
                            //Construct filter fragment for these values
                            filterFragments[type] = type + '=' + fvals.join(',');
                            filterCount++;
                        }
                    }
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

            if (filterCount > 0) {
                var url = baseUrl + '?';

                Object.keys(filterFragments).forEach(function (key, index) {
                    url += filterFragments[key];

                    if (index < filterCount - 1) {
                        url += '&';
                    }
                });

                url = encodeURI(url);

                return url;
            } else {
                return encodeURI(baseUrl);
            }
        },
        setSelectorError: function setSelectorError(selector_type, bool) {
            var selector = $('div.filter-selector-' + selector_type + ' > .dropdown-toggle').first();

            if (bool) {
                selector.addClass('filter-error');
            } else {
                selector.removeClass('filter-error');
            }
        },
        getSelectorValues: function getSelectorValues(selector_type) {
            var selector = $('select.filter-selector-' + selector_type).first();
            if (selector.length) {
                return selector.val();
            } else {
                return null;
            }
        },
        countSelectorOptions: function countSelectorOptions(selector_type) {
            return $('select.filter-selector-' + selector_type).first().find('option').length;
        }
    };
    window.HotstatusFilter = HotstatusFilter;
})(jQuery);

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTVlNjc3OGU0OTBiNDk2NDFmNWUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyIkIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJpbnRlcm5hbCIsImdlbmVyYXRlZCIsImdlbmVyYXRlQnlEZWZhdWx0IiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsInNlbGYiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCJlIiwiZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsInRzIiwic2VjcyIsIk1hdGgiLCJyb3VuZCIsIkRhdGUiLCJub3ciLCJwbHVyYWwiLCJ2YWwiLCJ0aW1lc3RyIiwic3RyIiwiYW10IiwiZmxvb3IiLCJtaW5zIiwiaG91cnMiLCJkYXlzIiwibW9udGhzIiwieWVhcnMiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwicnNlY3MiLCJIb3RzdGF0dXNGaWx0ZXIiLCJ2YWxpZEZpbHRlcnMiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsImZpbHRlclN1Ym1pdEVsZW1lbnQiLCJmaWx0ZXJfdHlwZXMiLCJpbnZhbGlkIiwidHlwZSIsImZ2YWxzIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJmY291bnQiLCJjb3VudFNlbGVjdG9yT3B0aW9ucyIsImxlbmd0aCIsInNldFNlbGVjdG9yRXJyb3IiLCJwcm9wIiwiZ2VuZXJhdGVVcmwiLCJiYXNlVXJsIiwiZmlsdGVyRnJhZ21lbnRzIiwiZmlsdGVyQ291bnQiLCJoYXNPd25Qcm9wZXJ0eSIsIlN0cmluZyIsImpvaW4iLCJ1cmwiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImluZGV4IiwiZW5jb2RlVVJJIiwic2VsZWN0b3JfdHlwZSIsImJvb2wiLCJzZWxlY3RvciIsImZpcnN0IiwicmVtb3ZlQ2xhc3MiLCJm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Q0EsZ0JBQUlELFNBQVNuQixNQUFiLEVBQXFCO0FBQ2pCLHVCQUFPbUIsU0FBUzFDLEdBQVQsRUFBUDtBQUNILGFBRkQsTUFHSztBQUNELHVCQUFPLElBQVA7QUFDSDtBQUNKLFNBMUdpQjtBQTJHbEJzQiw4QkFBc0IsOEJBQVNrQixhQUFULEVBQXdCO0FBQzFDLG1CQUFPakUsRUFBRSw0QkFBNEJpRSxhQUE5QixFQUE2Q0csS0FBN0MsR0FBcURFLElBQXJELENBQTBELFFBQTFELEVBQW9FdEIsTUFBM0U7QUFDSDtBQTdHaUIsS0FBdEI7QUErR0FuQyxXQUFPd0IsZUFBUCxHQUF5QkEsZUFBekI7QUFDSCxDQTdORCxFQTZOR2tDLE1BN05ILEUiLCJmaWxlIjoiaG90c3RhdHVzLjNkMDE2MjM3ZDNjZjhhMTIxZWQyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA1NWU2Nzc4ZTQ5MGI0OTY0MWY1ZSIsIi8vQmVnaW4gaG90c3RhdHVzIGRlZmluaXRpb25zXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgbGV0IEhvdHN0YXR1cyA9IHtcclxuICAgICAgICBhZHZlcnRpc2luZzoge1xyXG4gICAgICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQnlEZWZhdWx0OiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdlbmVyYXRlQWR2ZXJ0aXNpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzLmFkdmVydGlzaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5nZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0VuYWJsZS9EaXNhYmxlIGFkIGNsYXNzZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDEyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmFkc2xvdF92ZXJ0aWNhbCcpLmFkZENsYXNzKCdhZHNieWdvb2dsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Hb29nbGUgQWRzIERlZmluZVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChhZHNieWdvb2dsZSA9IHdpbmRvdy5hZHNieWdvb2dsZSB8fCBbXSkucHVzaCh7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vR29vZ2xlIGFkIGV4Y2VwdGlvbiAtLSBmYWlsIHF1aWV0bHlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuZ2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZToge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBHaXZlbiBhIFVUQyB1bml4IHRpbWVzdGFtcCwgcmV0dXJucyB0aGUgcmVsYXRpdmUgdGltZSBiZXR3ZWVuIHRoYXQgdGltZXN0YW1wIGFuZCBub3csIGluIHRoZSBzdHJpbmcgZm9ybSBvZjpcclxuICAgICAgICAgICAgICogMTUgc2Vjb25kcyBhZ28gfHwgMyBtaW51dGVzIGFnbyB8fCAyIGRheXMgYWdvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBnZXRSZWxhdGl2ZVRpbWU6IGZ1bmN0aW9uKHRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VjcyA9IChNYXRoLnJvdW5kKERhdGUubm93KCkgLyAxMDAwKSAtIHRzKTsgLy9UaW1lIERpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwbHVyYWwgPSBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0ciA9IGZ1bmN0aW9uKHN0ciwgYW10KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbCA9IE1hdGguZmxvb3IoYW10KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArIFwiIFwiK3N0citwbHVyYWwodmFsKStcIiBhZ29cIjtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZWNvbmRzXHJcbiAgICAgICAgICAgICAgICBsZXQgbWlucyA9IHNlY3MgLyA2MC4wO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1pbnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBob3VycyA9IG1pbnMgLyA2MC4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF5cyA9IGhvdXJzIC8gMjQuMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXlzID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb250aHMgPSBkYXlzIC8gMzAuMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9udGhzID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeWVhcnMgPSBtb250aHMgLyAxMi4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeWVhcnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcInllYXJcIiwgeWVhcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJtb250aFwiLCBtb250aHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3RyKFwiZGF5XCIsIGRheXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJob3VyXCIsIGhvdXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJtaW51dGVcIiwgbWlucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJzZWNvbmRcIiwgc2Vjcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEdpdmVuIGEgdGltZSBpbiBzZWNvbmRzLCByZXR1cm5zIGEgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBsZW5ndGggb2YgdGltZSBpbiB0aGUgc3RyaW5nIGZvcm0gb2Y6XHJcbiAgICAgICAgICAgICAqIHttaW5zfW0ge3NlY3N9c1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZ2V0TWludXRlU2Vjb25kVGltZTogZnVuY3Rpb24oc2Vjcykge1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWlucyA9IE1hdGguZmxvb3Ioc2VjcyAvIDYwLjApO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1pbnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByc2VjcyA9IHNlY3MgJSA2MDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1pbnMgKyBcIm0gXCIgKyByc2VjcyArIFwic1wiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlY3MgKyBcInNcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB3aW5kb3cuSG90c3RhdHVzID0gSG90c3RhdHVzO1xyXG5cclxuICAgIGxldCBIb3RzdGF0dXNGaWx0ZXIgPSB7XHJcbiAgICAgICAgdmFsaWRGaWx0ZXJzOiBmYWxzZSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFZhbGlkYXRlcyB0aGUgc2VsZWN0b3JzIG9mIHRoZSBnaXZlbiBmaWx0ZXIgdHlwZXMsIGlmIHRoZWlyIGN1cnJlbnQgc2VsZWN0aW9ucyBhcmUgaW52YWxpZCwgdGhlblxyXG4gICAgICAgICAqIGRpc2FibGUgdGhlIGdpdmVuIHN1Ym1pdCBlbGVtZW50IGFuZCBhZGQgYSBmaWx0ZXItZXJyb3IgY2xhc3MgdG8gdGhlIGludmFsaWQgc2VsZWN0b3JzLiBSZXR1cm5zXHJcbiAgICAgICAgICogdHJ1ZSBpZiBhbGwgc2VsZWN0b3JzIHdlcmUgdmFsaWQsIGZhbHNlIGlmIGFueSBzZWxlY3RvciB3YXMgaW52YWxpZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhbGlkYXRlU2VsZWN0b3JzOiBmdW5jdGlvbihmaWx0ZXJTdWJtaXRFbGVtZW50LCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW52YWxpZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmNvdW50ID0gc2VsZi5jb3VudFNlbGVjdG9yT3B0aW9ucyh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnZhbHMgPT09IG51bGwgfHwgZnZhbHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RvZ2dsZSBmaWx0ZXItZXJyb3Igb25cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL01ha2Ugc3VyZSBmaWx0ZXItZXJyb3IgaXMgdG9nZ2xlZCBvZmZcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW52YWxpZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlclN1Ym1pdEVsZW1lbnQgIT09IG51bGwpIGZpbHRlclN1Ym1pdEVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi52YWxpZEZpbHRlcnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJTdWJtaXRFbGVtZW50ICE9PSBudWxsKSBmaWx0ZXJTdWJtaXRFbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnZhbGlkRmlsdGVycyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgYSB1cmwgd2l0aCBmaWx0ZXIgcXVlcnkgcGFyYW1ldGVycyBnaXZlbiBhIGJhc2VVcmwgYW5kIHRoZSBmaWx0ZXIgdHlwZXMgdG8gbG9vayBmb3IuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGaWx0ZXIgdHlwZXMgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBkZXNjcmliaW5nIHRoZSB0eXBlcyBvZiBmaWx0ZXJzIGluIHVzZVxyXG4gICAgICAgICAqIHRvIGdlbmVyYXRlIGEgdXJsIGZvci4gRVg6IFsnbWFwJywgJ3JhbmsnLCAnZ2FtZVR5cGUnXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyRnJhZ21lbnRzID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NoZWNrIGZpbHRlcnNcclxuICAgICAgICAgICAgbGV0IGZpbHRlckNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgZmlsdGVyIGZyYWdtZW50IGhhcyBiZWVuIHNldCB5ZXRcclxuICAgICAgICAgICAgICAgIGlmICghKGZpbHRlckZyYWdtZW50cy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0F0dGVtcHQgdG8gZmluZCB0aGUgZmlsdGVyIGFuZCBnZXQgaXRzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZnZhbHMgPT09IFwic3RyaW5nXCIgfHwgZnZhbHMgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJhZ21lbnRzW3R5cGVdID0gdHlwZSArICc9JyArIGZ2YWxzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmdmFscyAhPT0gbnVsbCAmJiBmdmFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ29uc3RydWN0IGZpbHRlciBmcmFnbWVudCBmb3IgdGhlc2UgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckZyYWdtZW50c1t0eXBlXSA9IHR5cGUgKyAnPScgKyBmdmFscy5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlsdGVyQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gYmFzZVVybCArICc/JztcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhmaWx0ZXJGcmFnbWVudHMpLmZvckVhY2goZnVuY3Rpb24oa2V5LGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IGZpbHRlckZyYWdtZW50c1trZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBmaWx0ZXJDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcmJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cmwgPSBlbmNvZGVVUkkodXJsKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVSSShiYXNlVXJsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2VsZWN0b3JFcnJvcjogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSwgYm9vbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCdkaXYuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlICsgJyA+IC5kcm9wZG93bi10b2dnbGUnKS5maXJzdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0b3JWYWx1ZXM6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnZhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvdW50U2VsZWN0b3JPcHRpb25zOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlKS5maXJzdCgpLmZpbmQoJ29wdGlvbicpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgd2luZG93LkhvdHN0YXR1c0ZpbHRlciA9IEhvdHN0YXR1c0ZpbHRlcjtcclxufSkoalF1ZXJ5KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaG90c3RhdHVzLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==