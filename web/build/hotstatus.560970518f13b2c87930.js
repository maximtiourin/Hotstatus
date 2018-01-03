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
                        $('.adsbygoogle').each(function () {
                            (adsbygoogle = window.adsbygoogle || []).push({});
                        });
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
        },
        utility: {
            /*
             * Randomly shuffles elements of array
             */
            shuffle: function shuffle(array) {
                var currentIndex = array.length,
                    temporaryValue = void 0,
                    randomIndex = void 0;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTkxNjI5NTA0YjA1NjQyMWNlYTkiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyIkIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJpbnRlcm5hbCIsImdlbmVyYXRlZCIsImdlbmVyYXRlQnlEZWZhdWx0IiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsInNlbGYiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJlYWNoIiwiYWRzYnlnb29nbGUiLCJ3aW5kb3ciLCJwdXNoIiwiZSIsImRhdGUiLCJnZXRSZWxhdGl2ZVRpbWUiLCJ0cyIsInNlY3MiLCJNYXRoIiwicm91bmQiLCJEYXRlIiwibm93IiwicGx1cmFsIiwidmFsIiwidGltZXN0ciIsInN0ciIsImFtdCIsImZsb29yIiwibWlucyIsImhvdXJzIiwiZGF5cyIsIm1vbnRocyIsInllYXJzIiwiZ2V0TWludXRlU2Vjb25kVGltZSIsInJzZWNzIiwidXRpbGl0eSIsInNodWZmbGUiLCJhcnJheSIsImN1cnJlbnRJbmRleCIsImxlbmd0aCIsInRlbXBvcmFyeVZhbHVlIiwicmFuZG9tSW5kZXgiLCJyYW5kb20iLCJIb3RzdGF0dXNGaWx0ZXIiLCJ2YWxpZEZpbHRlcnMiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsImZpbHRlclN1Ym1pdEVsZW1lbnQiLCJmaWx0ZXJfdHlwZXMiLCJpbnZhbGlkIiwidHlwZSIsImZ2YWxzIiwiZ2V0U2VsZWN0b3JWYWx1ZXMiLCJmY291bnQiLCJjb3VudFNlbGVjdG9yT3B0aW9ucyIsInNldFNlbGVjdG9yRXJyb3IiLCJwcm9wIiwiZ2VuZXJhdGVVcmwiLCJiYXNlVXJsIiwiZmlsdGVyRnJhZ21lbnRzIiwiZmlsdGVyQ291bnQiLCJoYXNPd25Qcm9wZXJ0eSIsIlN0cmluZyIsImpvaW4iLCJ1cmwiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImluZGV4IiwiZW5jb2RlVVJJIiwic2VsZWN0b3JfdHlwZSIsImJvb2wiLCJzZWxlY3RvciIsImZpcnN0IiwicmVtb3ZlQ2xhc3MiLCJmaW5kIiwialF1ZXJ5Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REE7QUFDQSxDQUFDLFVBQVVBLENBQVYsRUFBYTtBQUNWLFFBQUlDLFlBQVk7QUFDWkMscUJBQWE7QUFDVEMsc0JBQVU7QUFDTkMsMkJBQVcsS0FETDtBQUVOQyxtQ0FBbUI7QUFGYixhQUREO0FBS1RDLGlDQUFxQiwrQkFBWTtBQUM3QixvQkFBSUMsT0FBT04sVUFBVUMsV0FBckI7O0FBRUEsb0JBQUksQ0FBQ0ssS0FBS0osUUFBTCxDQUFjQyxTQUFuQixFQUE4QjtBQUMxQjtBQUNBLHdCQUFJSSxTQUFTQyxlQUFULENBQXlCQyxXQUF6QixJQUF3QyxJQUE1QyxFQUFrRDtBQUM5Q1YsMEJBQUUsa0JBQUYsRUFBc0JXLFFBQXRCLENBQStCLGFBQS9CO0FBQ0g7O0FBRUQ7QUFDQSx3QkFBSTtBQUNBWCwwQkFBRSxjQUFGLEVBQWtCWSxJQUFsQixDQUF1QixZQUFXO0FBQzlCLDZCQUFDQyxjQUFjQyxPQUFPRCxXQUFQLElBQXNCLEVBQXJDLEVBQXlDRSxJQUF6QyxDQUE4QyxFQUE5QztBQUNILHlCQUZEO0FBR0gs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bnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhOTE2Mjk1MDRiMDU2NDIxY2VhOSIsIi8vQmVnaW4gaG90c3RhdHVzIGRlZmluaXRpb25zXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgbGV0IEhvdHN0YXR1cyA9IHtcclxuICAgICAgICBhZHZlcnRpc2luZzoge1xyXG4gICAgICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQnlEZWZhdWx0OiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdlbmVyYXRlQWR2ZXJ0aXNpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzLmFkdmVydGlzaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5nZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0VuYWJsZS9EaXNhYmxlIGFkIGNsYXNzZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDEyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmFkc2xvdF92ZXJ0aWNhbCcpLmFkZENsYXNzKCdhZHNieWdvb2dsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Hb29nbGUgQWRzIERlZmluZVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5hZHNieWdvb2dsZScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Hb29nbGUgYWQgZXhjZXB0aW9uIC0tIGZhaWwgcXVpZXRseVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnRlcm5hbC5nZW5lcmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRlOiB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEdpdmVuIGEgVVRDIHVuaXggdGltZXN0YW1wLCByZXR1cm5zIHRoZSByZWxhdGl2ZSB0aW1lIGJldHdlZW4gdGhhdCB0aW1lc3RhbXAgYW5kIG5vdywgaW4gdGhlIHN0cmluZyBmb3JtIG9mOlxyXG4gICAgICAgICAgICAgKiAxNSBzZWNvbmRzIGFnbyB8fCAzIG1pbnV0ZXMgYWdvIHx8IDIgZGF5cyBhZ29cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGdldFJlbGF0aXZlVGltZTogZnVuY3Rpb24odHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWNzID0gKE1hdGgucm91bmQoRGF0ZS5ub3coKSAvIDEwMDApIC0gdHMpOyAvL1RpbWUgRGlmZmVyZW5jZSBpbiBzZWNvbmRzXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBsdXJhbCA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdzJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RyID0gZnVuY3Rpb24oc3RyLCBhbXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsID0gTWF0aC5mbG9vcihhbXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsICsgXCIgXCIrc3RyK3BsdXJhbCh2YWwpK1wiIGFnb1wiO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NlY29uZHNcclxuICAgICAgICAgICAgICAgIGxldCBtaW5zID0gc2VjcyAvIDYwLjA7XHJcbiAgICAgICAgICAgICAgICBpZiAobWlucyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhvdXJzID0gbWlucyAvIDYwLjA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3VycyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXlzID0gaG91cnMgLyAyNC4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRheXMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1vbnRocyA9IGRheXMgLyAzMC4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb250aHMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB5ZWFycyA9IG1vbnRocyAvIDEyLjA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh5ZWFycyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3RyKFwieWVhclwiLCB5ZWFycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcIm1vbnRoXCIsIG1vbnRocyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJkYXlcIiwgZGF5cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcImhvdXJcIiwgaG91cnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcIm1pbnV0ZVwiLCBtaW5zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcInNlY29uZFwiLCBzZWNzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogR2l2ZW4gYSB0aW1lIGluIHNlY29uZHMsIHJldHVybnMgYSBzdHJpbmcgdGhhdCBkZXNjcmliZXMgdGhlIGxlbmd0aCBvZiB0aW1lIGluIHRoZSBzdHJpbmcgZm9ybSBvZjpcclxuICAgICAgICAgICAgICoge21pbnN9bSB7c2Vjc31zXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBnZXRNaW51dGVTZWNvbmRUaW1lOiBmdW5jdGlvbihzZWNzKSB7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW5zID0gTWF0aC5mbG9vcihzZWNzIC8gNjAuMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobWlucyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJzZWNzID0gc2VjcyAlIDYwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWlucyArIFwibSBcIiArIHJzZWNzICsgXCJzXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VjcyArIFwic1wiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1dGlsaXR5OiB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJhbmRvbWx5IHNodWZmbGVzIGVsZW1lbnRzIG9mIGFycmF5XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzaHVmZmxlOiBmdW5jdGlvbihhcnJheSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gYXJyYXlbY3VycmVudEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFycmF5W3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB3aW5kb3cuSG90c3RhdHVzID0gSG90c3RhdHVzO1xyXG5cclxuICAgIGxldCBIb3RzdGF0dXNGaWx0ZXIgPSB7XHJcbiAgICAgICAgdmFsaWRGaWx0ZXJzOiBmYWxzZSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFZhbGlkYXRlcyB0aGUgc2VsZWN0b3JzIG9mIHRoZSBnaXZlbiBmaWx0ZXIgdHlwZXMsIGlmIHRoZWlyIGN1cnJlbnQgc2VsZWN0aW9ucyBhcmUgaW52YWxpZCwgdGhlblxyXG4gICAgICAgICAqIGRpc2FibGUgdGhlIGdpdmVuIHN1Ym1pdCBlbGVtZW50IGFuZCBhZGQgYSBmaWx0ZXItZXJyb3IgY2xhc3MgdG8gdGhlIGludmFsaWQgc2VsZWN0b3JzLiBSZXR1cm5zXHJcbiAgICAgICAgICogdHJ1ZSBpZiBhbGwgc2VsZWN0b3JzIHdlcmUgdmFsaWQsIGZhbHNlIGlmIGFueSBzZWxlY3RvciB3YXMgaW52YWxpZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhbGlkYXRlU2VsZWN0b3JzOiBmdW5jdGlvbihmaWx0ZXJTdWJtaXRFbGVtZW50LCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW52YWxpZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmNvdW50ID0gc2VsZi5jb3VudFNlbGVjdG9yT3B0aW9ucyh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnZhbHMgPT09IG51bGwgfHwgZnZhbHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RvZ2dsZSBmaWx0ZXItZXJyb3Igb25cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL01ha2Ugc3VyZSBmaWx0ZXItZXJyb3IgaXMgdG9nZ2xlZCBvZmZcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW52YWxpZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlclN1Ym1pdEVsZW1lbnQgIT09IG51bGwpIGZpbHRlclN1Ym1pdEVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi52YWxpZEZpbHRlcnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJTdWJtaXRFbGVtZW50ICE9PSBudWxsKSBmaWx0ZXJTdWJtaXRFbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnZhbGlkRmlsdGVycyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgYSB1cmwgd2l0aCBmaWx0ZXIgcXVlcnkgcGFyYW1ldGVycyBnaXZlbiBhIGJhc2VVcmwgYW5kIHRoZSBmaWx0ZXIgdHlwZXMgdG8gbG9vayBmb3IuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGaWx0ZXIgdHlwZXMgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBkZXNjcmliaW5nIHRoZSB0eXBlcyBvZiBmaWx0ZXJzIGluIHVzZVxyXG4gICAgICAgICAqIHRvIGdlbmVyYXRlIGEgdXJsIGZvci4gRVg6IFsnbWFwJywgJ3JhbmsnLCAnZ2FtZVR5cGUnXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyRnJhZ21lbnRzID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NoZWNrIGZpbHRlcnNcclxuICAgICAgICAgICAgbGV0IGZpbHRlckNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgZmlsdGVyIGZyYWdtZW50IGhhcyBiZWVuIHNldCB5ZXRcclxuICAgICAgICAgICAgICAgIGlmICghKGZpbHRlckZyYWdtZW50cy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0F0dGVtcHQgdG8gZmluZCB0aGUgZmlsdGVyIGFuZCBnZXQgaXRzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZnZhbHMgPT09IFwic3RyaW5nXCIgfHwgZnZhbHMgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJhZ21lbnRzW3R5cGVdID0gdHlwZSArICc9JyArIGZ2YWxzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmdmFscyAhPT0gbnVsbCAmJiBmdmFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ29uc3RydWN0IGZpbHRlciBmcmFnbWVudCBmb3IgdGhlc2UgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckZyYWdtZW50c1t0eXBlXSA9IHR5cGUgKyAnPScgKyBmdmFscy5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlsdGVyQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gYmFzZVVybCArICc/JztcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhmaWx0ZXJGcmFnbWVudHMpLmZvckVhY2goZnVuY3Rpb24oa2V5LGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IGZpbHRlckZyYWdtZW50c1trZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBmaWx0ZXJDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcmJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cmwgPSBlbmNvZGVVUkkodXJsKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVSSShiYXNlVXJsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2VsZWN0b3JFcnJvcjogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSwgYm9vbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCdkaXYuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlICsgJyA+IC5kcm9wZG93bi10b2dnbGUnKS5maXJzdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0b3JWYWx1ZXM6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnZhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvdW50U2VsZWN0b3JPcHRpb25zOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlKS5maXJzdCgpLmZpbmQoJ29wdGlvbicpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgd2luZG93LkhvdHN0YXR1c0ZpbHRlciA9IEhvdHN0YXR1c0ZpbHRlcjtcclxufSkoalF1ZXJ5KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaG90c3RhdHVzLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==