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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2E1Y2JmZjJlYzdiMGE0YmQ1Y2EiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyIkIiwiSG90c3RhdHVzIiwiYWR2ZXJ0aXNpbmciLCJpbnRlcm5hbCIsImdlbmVyYXRlZCIsImdlbmVyYXRlQnlEZWZhdWx0IiwiZ2VuZXJhdGVBZHZlcnRpc2luZyIsInNlbGYiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiYWRkQ2xhc3MiLCJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCJlIiwiZGF0ZSIsImdldFJlbGF0aXZlVGltZSIsInRzIiwic2VjcyIsIk1hdGgiLCJyb3VuZCIsIkRhdGUiLCJub3ciLCJwbHVyYWwiLCJ2YWwiLCJ0aW1lc3RyIiwic3RyIiwiYW10IiwiZmxvb3IiLCJtaW5zIiwiaG91cnMiLCJkYXlzIiwibW9udGhzIiwieWVhcnMiLCJnZXRNaW51dGVTZWNvbmRUaW1lIiwicnNlY3MiLCJ1dGlsaXR5Iiwic2h1ZmZsZSIsImFycmF5IiwiY3VycmVudEluZGV4IiwibGVuZ3RoIiwidGVtcG9yYXJ5VmFsdWUiLCJyYW5kb21JbmRleCIsInJhbmRvbSIsIkhvdHN0YXR1c0ZpbHRlciIsInZhbGlkRmlsdGVycyIsInZhbGlkYXRlU2VsZWN0b3JzIiwiZmlsdGVyU3VibWl0RWxlbWVudCIsImZpbHRlcl90eXBlcyIsImludmFsaWQiLCJ0eXBlIiwiZnZhbHMiLCJnZXRTZWxlY3RvclZhbHVlcyIsImZjb3VudCIsImNvdW50U2VsZWN0b3JPcHRpb25zIiwic2V0U2VsZWN0b3JFcnJvciIsInByb3AiLCJnZW5lcmF0ZVVybCIsImJhc2VVcmwiLCJmaWx0ZXJGcmFnbWVudHMiLCJmaWx0ZXJDb3VudCIsImhhc093blByb3BlcnR5IiwiU3RyaW5nIiwiam9pbiIsInVybCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXgiLCJlbmNvZGVVUkkiLCJzZWxlY3Rvcl90eXBlIiwiYm9vbCIsInNlbGVjdG9yIiwiZmlyc3QiLCJyZW1vdmVDbGFzcyIsImZpbmQiLCJqUXVlcnkiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQTtBQUNBLENBQUMsVUFBVUEsQ0FBVixFQUFhO0FBQ1YsUUFBSUMsWUFBWTtBQUNaQyxxQkFBYTtBQUNUQyxzQkFBVTtBQUNOQywyQkFBVyxLQURMO0FBRU5DLG1DQUFtQjtBQUZiLGFBREQ7QUFLVEMsaUNBQXFCLCtCQUFZO0FBQzdCLG9CQUFJQyxPQUFPTixVQUFVQyxXQUFyQjs7QUFFQSxvQkFBSSxDQUFDSyxLQUFLSixRQUFMLENBQWNDLFNBQW5CLEVBQThCO0FBQzFCO0FBQ0Esd0JBQUlJLFNBQVNDLGVBQVQsQ0FBeUJDLFdBQXpCLElBQXdDLElBQTVDLEVBQWtEO0FBQzlDViwwQkFBRSxrQkFBRixFQUFzQlcsUUFBdEIsQ0FBK0IsYUFBL0I7QUFDSDs7QUFFRDtBQUNBLHdCQUFJO0FBQ0EseUJBQUNDLGNBQWNDLE9BQU9ELFdBQVAsSUFBc0IsRUFBckMsRUFBeUNFLElBQXpDLENBQThDLEVBQTlDO0FBQ0gscUJBRkQsQ0FHQSxPQUFPQyxDQUFQLEVBQVU7QUFDTjtBQUNIOztBQUVEUix5QkFBS0osUUFBTCxDQUFjQyxTQUFkLEdBQTBCLElBQTFCO0FBQ0g7QUFDSjtBQXhCUSxTQUREO0FBMkJaWSxjQUFNO0FBQ0Y7Ozs7QUFJQUMsNkJBQWlCLHlCQUFTQyxFQUFULEVBQWE7QUFDMUIsb0JBQUlDLE9BQVFDLEtBQUtDLEtBQUwsQ0FBV0MsS0FBS0MsR0FBTCxLQUFhLElBQXhCLElBQWdDTCxFQUE1QyxDQUQwQixDQUN1Qjs7QUFFakQsb0JBQUlNLFNBQVMsU0FBVEEsTUFBUyxDQUFTQyxHQUFULEVBQWM7QUFDdkIsd0JBQUlBLFFBQVEsQ0FBWixFQUFlO0FBQ1gsK0JBQU8sRUFBUDtBQUNILHFCQUZELE1BR0s7QUFDRCwrQkFBTyxHQUFQO0FBQ0g7QUFDSixpQkFQRDs7QUFTQSxvQkFBSUMsVUFBVSxTQUFWQSxPQUFVLENBQVNDLEdBQVQsRUFBY0MsR0FBZCxFQUFtQjtBQUM3Qix3QkFBSUgsTUFBTUwsS0FBS1MsS0FBTCxDQUFXRCxHQUFYLENBQVY7O0FBRUEsMkJBQU9ILE1BQU0sR0FBTixHQUFVRSxHQUFWLEdBQWNILE9BQU9DLEdBQVAsQ0FBZCxHQUEwQixNQUFqQztBQUNILGlCQUpEOztBQU1BO0FBQ0Esb0JBQUlLLE9BQU9YLE9BQU8sSUFBbEI7QUFDQSxvQkFBSVcsUUFBUSxDQUFaLEVBQWU7QUFDWCx3QkFBSUMsUUFBUUQsT0FBTyxJQUFuQjs7QUFFQSx3QkFBSUMsU0FBUyxDQUFiLEVBQWdCO0FBQ1osNEJBQUlDLE9BQU9ELFFBQVEsSUFBbkI7O0FBRUEsNEJBQUlDLFFBQVEsQ0FBWixFQUFlO0FBQ1gsZ0NBQUlDLFNBQVNELE9BQU8sSUFBcEI7O0FBRUEsZ0NBQUlDLFVBQVUsQ0FBZCxFQUFpQjtBQUNiLG9DQUFJQyxRQUFRRCxTQUFTLElBQXJCOztBQUVBLG9DQUFJQyxTQUFTLENBQWIsRUFBZ0I7QUFDWiwyQ0FBT1IsUUFBUSxNQUFSLEVBQWdCUSxLQUFoQixDQUFQO0FBQ0gsaUNBRkQsTUFHSztBQUNELDJDQUFPUixRQUFRLE9BQVIsRUFBaUJPLE1BQWpCLENBQVA7QUFDSDtBQUNKLDZCQVRELE1BVUs7QUFDRCx1Q0FBT1AsUUFBUSxLQUFSLEVBQWVNLElBQWYsQ0FBUDtBQUNIO0FBQ0oseUJBaEJELE1BaUJLO0FBQ0QsbUNBQU9OLFFBQVEsTUFBUixFQUFnQkssS0FBaEIsQ0FBUDtBQUNIO0FBQ0oscUJBdkJELE1Bd0JLO0FBQ0QsK0JBQU9MLFFBQVEsUUFBUixFQUFrQkksSUFBbEIsQ0FBUDtBQUNIO0FBQ0osaUJBOUJELE1BK0JLO0FBQ0QsMkJBQU9KLFFBQVEsUUFBUixFQUFrQlAsSUFBbEIsQ0FBUDtBQUNIO0FBQ0osYUEzREM7QUE0REY7Ozs7QUFJQWdCLGlDQUFxQiw2QkFBU2hCLElBQVQsRUFBZTs7QUFHaEMsb0JBQUlXLE9BQU9WLEtBQUtTLEtBQUwsQ0FBV1YsT0FBTyxJQUFsQixDQUFYO0FBQ0Esb0JBQUlXLFFBQVEsQ0FBWixFQUFlO0FBQ1gsd0JBQUlNLFFBQVFqQixPQUFPLEVBQW5COztBQUVBLDJCQUFPVyxPQUFPLElBQVAsR0FBY00sS0FBZCxHQUFzQixHQUE3QjtBQUNILGlCQUpELE1BS0s7QUFDRCwyQkFBT2pCLE9BQU8sR0FBZDtBQUNIO0FBQ0o7QUE1RUMsU0EzQk07QUF5R1prQixpQkFBUztBQUNMOzs7QUFHQUMscUJBQVMsaUJBQVNDLEtBQVQsRUFBZ0I7QUFDckIsb0JBQUlDLGVBQWVELE1BQU1FLE1BQXpCO0FBQUEsb0JBQWlDQyx1QkFBakM7QUFBQSxvQkFBaURDLG9CQUFqRDs7QUFFQTtBQUNBLHVCQUFPLE1BQU1ILFlBQWIsRUFBMkI7O0FBRXZCO0FBQ0FHLGtDQUFjdkIsS0FBS1MsS0FBTCxDQUFXVCxLQUFLd0IsTUFBTCxLQUFnQkosWUFBM0IsQ0FBZDtBQUNBQSxvQ0FBZ0IsQ0FBaEI7O0FBRUE7QUFDQUUscUNBQWlCSCxNQUFNQyxZQUFOLENBQWpCO0FBQ0FELDBCQUFNQyxZQUFOLElBQXNCRCxNQUFNSSxXQUFOLENBQXRCO0FBQ0FKLDBCQUFNSSxXQUFOLElBQXFCRCxjQUFyQjtBQUNIOztBQUVELHVCQUFPSCxLQUFQO0FBQ0g7QUFyQkk7QUF6R0csS0FBaEI7QUFpSUExQixXQUFPWixTQUFQLEdBQW1CQSxTQUFuQjs7QUFFQSxRQUFJNEMsa0JBQWtCO0FBQ2xCQyxzQkFBYyxLQURJO0FBRWxCOzs7OztBQUtBQywyQkFBbUIsMkJBQVNDLG1CQUFULEVBQThCQyxZQUE5QixFQUE0QztBQUMzRCxnQkFBSTFDLE9BQU9zQyxlQUFYOztBQUVBLGdCQUFJSyxVQUFVLEtBQWQ7O0FBSDJEO0FBQUE7QUFBQTs7QUFBQTtBQUszRCxxQ0FBaUJELFlBQWpCLDhIQUErQjtBQUFBLHdCQUF0QkUsSUFBc0I7O0FBQzNCLHdCQUFJQyxRQUFRN0MsS0FBSzhDLGlCQUFMLENBQXVCRixJQUF2QixDQUFaO0FBQ0Esd0JBQUlHLFNBQVMvQyxLQUFLZ0Qsb0JBQUwsQ0FBMEJKLElBQTFCLENBQWI7O0FBRUEsd0JBQUlDLFVBQVUsSUFBVixJQUFrQkEsTUFBTVgsTUFBTixJQUFnQixDQUF0QyxFQUF5QztBQUNyQztBQUNBbEMsNkJBQUtpRCxnQkFBTCxDQUFzQkwsSUFBdEIsRUFBNEIsSUFBNUI7QUFDQUQsa0NBQVUsSUFBVjtBQUNILHFCQUpELE1BS0s7QUFDRDtBQUNBM0MsNkJBQUtpRCxnQkFBTCxDQUFzQkwsSUFBdEIsRUFBNEIsS0FBNUI7QUFDSDtBQUNKO0FBbEIwRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9CM0QsZ0JBQUlELE9BQUosRUFBYTtBQUNULG9CQUFJRix3QkFBd0IsSUFBNUIsRUFBa0NBLG9CQUFvQlMsSUFBcEIsQ0FBeUIsVUFBekIsRUFBcUMsSUFBckM7QUFDbENsRCxxQkFBS3VDLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSx1QkFBTyxLQUFQO0FBQ0gsYUFKRCxNQUtLO0FBQ0Qsb0JBQUlFLHdCQUF3QixJQUE1QixFQUFrQ0Esb0JBQW9CUyxJQUFwQixDQUF5QixVQUF6QixFQUFxQyxLQUFyQztBQUNsQ2xELHFCQUFLdUMsWUFBTCxHQUFvQixJQUFwQjtBQUNBLHVCQUFPLElBQVA7QUFDSDtBQUNKLFNBckNpQjtBQXNDbEI7Ozs7OztBQU1BWSxxQkFBYSxxQkFBU0MsT0FBVCxFQUFrQlYsWUFBbEIsRUFBZ0M7QUFDekMsZ0JBQUkxQyxPQUFPc0MsZUFBWDs7QUFFQSxnQkFBSWUsa0JBQWtCLEVBQXRCOztBQUVBO0FBQ0EsZ0JBQUlDLGNBQWMsQ0FBbEI7QUFOeUM7QUFBQTtBQUFBOztBQUFBO0FBT3pDLHNDQUFpQlosWUFBakIsbUlBQStCO0FBQUEsd0JBQXRCRSxJQUFzQjs7QUFDM0I7QUFDQSx3QkFBSSxDQUFFUyxnQkFBZ0JFLGNBQWhCLENBQStCWCxJQUEvQixDQUFOLEVBQTZDO0FBQ3pDO0FBQ0EsNEJBQUlDLFFBQVE3QyxLQUFLOEMsaUJBQUwsQ0FBdUJGLElBQXZCLENBQVo7O0FBRUEsNEJBQUksT0FBT0MsS0FBUCxLQUFpQixRQUFqQixJQUE2QkEsaUJBQWlCVyxNQUFsRCxFQUEwRDtBQUN0REgsNENBQWdCVCxJQUFoQixJQUF3QkEsT0FBTyxHQUFQLEdBQWFDLEtBQXJDO0FBQ0FTO0FBQ0gseUJBSEQsTUFJSyxJQUFJVCxVQUFVLElBQVYsSUFBa0JBLE1BQU1YLE1BQU4sR0FBZSxDQUFyQyxFQUF3QztBQUN6QztBQUNBbUIsNENBQWdCVCxJQUFoQixJQUF3QkEsT0FBTyxHQUFQLEdBQWFDLE1BQU1ZLElBQU4sQ0FBVyxHQUFYLENBQXJDO0FBQ0FIO0FBQ0g7QUFDSjtBQUNKO0FBdkJ3QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXlCekMsZ0JBQUlBLGNBQWMsQ0FBbEIsRUFBcUI7QUFDakIsb0JBQUlJLE1BQU1OLFVBQVUsR0FBcEI7O0FBRUFPLHVCQUFPQyxJQUFQLENBQVlQLGVBQVosRUFBNkJRLE9BQTdCLENBQXFDLFVBQVNDLEdBQVQsRUFBYUMsS0FBYixFQUFvQjtBQUNyREwsMkJBQU9MLGdCQUFnQlMsR0FBaEIsQ0FBUDs7QUFFQSx3QkFBSUMsUUFBUVQsY0FBYyxDQUExQixFQUE2QjtBQUN6QkksK0JBQU8sR0FBUDtBQUNIO0FBQ0osaUJBTkQ7O0FBUUFBLHNCQUFNTSxVQUFVTixHQUFWLENBQU47O0FBRUEsdUJBQU9BLEdBQVA7QUFDSCxhQWRELE1BZUs7QUFDRCx1QkFBT00sVUFBVVosT0FBVixDQUFQO0FBQ0g7QUFDSixTQXZGaUI7QUF3RmxCSCwwQkFBa0IsMEJBQVNnQixhQUFULEVBQXdCQyxJQUF4QixFQUE4QjtBQUM1QyxnQkFBSUMsV0FBVzFFLEVBQUUseUJBQXlCd0UsYUFBekIsR0FBeUMscUJBQTNDLEVBQWtFRyxLQUFsRSxFQUFmOztBQUVBLGdCQUFJRixJQUFKLEVBQVU7QUFDTkMseUJBQVMvRCxRQUFULENBQWtCLGNBQWxCO0FBQ0gsYUFGRCxNQUdLO0FBQ0QrRCx5QkFBU0UsV0FBVCxDQUFxQixjQUFyQjtBQUNIO0FBQ0osU0FqR2lCO0FBa0dsQnZCLDJCQUFtQiwyQkFBU21CLGFBQVQsRUFBd0I7QUFDdkMsZ0JBQUlFLFdBQVcxRSxFQUFFLDRCQUE0QndFLGFBQTlCLEVBQTZDRyxLQUE3QyxFQUFmO0FBQ0EsZ0JBQUlELFNBQVNqQyxNQUFiLEVBQXFCO0FBQ2pCLHVCQUFPaUMsU0FBU2pELEdBQVQsRUFBUDtBQUNILGFBRkQsTUFHSztBQUNELHVCQUFPLElBQVA7QUFDSDtBQUNKLFNBMUdpQjtBQTJHbEI4Qiw4QkFBc0IsOEJBQVNpQixhQUFULEVBQXdCO0FBQzFDLG1CQUFPeEUsRUFBRSw0QkFBNEJ3RSxhQUE5QixFQUE2Q0csS0FBN0MsR0FBcURFLElBQXJELENBQTBELFFBQTFELEVBQW9FcEMsTUFBM0U7QUFDSDtBQTdHaUIsS0FBdEI7QUErR0E1QixXQUFPZ0MsZUFBUCxHQUF5QkEsZUFBekI7QUFDSCxDQXBQRCxFQW9QR2lDLE1BcFBILEUiLCJmaWxlIjoiaG90c3RhdHVzLjE5MDczNTlkZWY1OGRlZTU1OTdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAzYTVjYmZmMmVjN2IwYTRiZDVjYSIsIi8vQmVnaW4gaG90c3RhdHVzIGRlZmluaXRpb25zXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgbGV0IEhvdHN0YXR1cyA9IHtcclxuICAgICAgICBhZHZlcnRpc2luZzoge1xyXG4gICAgICAgICAgICBpbnRlcm5hbDoge1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQnlEZWZhdWx0OiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdlbmVyYXRlQWR2ZXJ0aXNpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzLmFkdmVydGlzaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2VsZi5pbnRlcm5hbC5nZW5lcmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0VuYWJsZS9EaXNhYmxlIGFkIGNsYXNzZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoID49IDEyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmFkc2xvdF92ZXJ0aWNhbCcpLmFkZENsYXNzKCdhZHNieWdvb2dsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Hb29nbGUgQWRzIERlZmluZVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChhZHNieWdvb2dsZSA9IHdpbmRvdy5hZHNieWdvb2dsZSB8fCBbXSkucHVzaCh7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vR29vZ2xlIGFkIGV4Y2VwdGlvbiAtLSBmYWlsIHF1aWV0bHlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwuZ2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZToge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBHaXZlbiBhIFVUQyB1bml4IHRpbWVzdGFtcCwgcmV0dXJucyB0aGUgcmVsYXRpdmUgdGltZSBiZXR3ZWVuIHRoYXQgdGltZXN0YW1wIGFuZCBub3csIGluIHRoZSBzdHJpbmcgZm9ybSBvZjpcclxuICAgICAgICAgICAgICogMTUgc2Vjb25kcyBhZ28gfHwgMyBtaW51dGVzIGFnbyB8fCAyIGRheXMgYWdvXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBnZXRSZWxhdGl2ZVRpbWU6IGZ1bmN0aW9uKHRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VjcyA9IChNYXRoLnJvdW5kKERhdGUubm93KCkgLyAxMDAwKSAtIHRzKTsgLy9UaW1lIERpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwbHVyYWwgPSBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0ciA9IGZ1bmN0aW9uKHN0ciwgYW10KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbCA9IE1hdGguZmxvb3IoYW10KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArIFwiIFwiK3N0citwbHVyYWwodmFsKStcIiBhZ29cIjtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZWNvbmRzXHJcbiAgICAgICAgICAgICAgICBsZXQgbWlucyA9IHNlY3MgLyA2MC4wO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1pbnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBob3VycyA9IG1pbnMgLyA2MC4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF5cyA9IGhvdXJzIC8gMjQuMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXlzID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb250aHMgPSBkYXlzIC8gMzAuMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9udGhzID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeWVhcnMgPSBtb250aHMgLyAxMi4wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeWVhcnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0cihcInllYXJcIiwgeWVhcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJtb250aFwiLCBtb250aHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3RyKFwiZGF5XCIsIGRheXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJob3VyXCIsIGhvdXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJtaW51dGVcIiwgbWlucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzdHIoXCJzZWNvbmRcIiwgc2Vjcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIEdpdmVuIGEgdGltZSBpbiBzZWNvbmRzLCByZXR1cm5zIGEgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBsZW5ndGggb2YgdGltZSBpbiB0aGUgc3RyaW5nIGZvcm0gb2Y6XHJcbiAgICAgICAgICAgICAqIHttaW5zfW0ge3NlY3N9c1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZ2V0TWludXRlU2Vjb25kVGltZTogZnVuY3Rpb24oc2Vjcykge1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWlucyA9IE1hdGguZmxvb3Ioc2VjcyAvIDYwLjApO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1pbnMgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByc2VjcyA9IHNlY3MgJSA2MDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1pbnMgKyBcIm0gXCIgKyByc2VjcyArIFwic1wiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlY3MgKyBcInNcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXRpbGl0eToge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSYW5kb21seSBzaHVmZmxlcyBlbGVtZW50cyBvZiBhcnJheVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc2h1ZmZsZTogZnVuY3Rpb24oYXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGgsIHRlbXBvcmFyeVZhbHVlLCByYW5kb21JbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IGFycmF5W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgd2luZG93LkhvdHN0YXR1cyA9IEhvdHN0YXR1cztcclxuXHJcbiAgICBsZXQgSG90c3RhdHVzRmlsdGVyID0ge1xyXG4gICAgICAgIHZhbGlkRmlsdGVyczogZmFsc2UsXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBWYWxpZGF0ZXMgdGhlIHNlbGVjdG9ycyBvZiB0aGUgZ2l2ZW4gZmlsdGVyIHR5cGVzLCBpZiB0aGVpciBjdXJyZW50IHNlbGVjdGlvbnMgYXJlIGludmFsaWQsIHRoZW5cclxuICAgICAgICAgKiBkaXNhYmxlIHRoZSBnaXZlbiBzdWJtaXQgZWxlbWVudCBhbmQgYWRkIGEgZmlsdGVyLWVycm9yIGNsYXNzIHRvIHRoZSBpbnZhbGlkIHNlbGVjdG9ycy4gUmV0dXJuc1xyXG4gICAgICAgICAqIHRydWUgaWYgYWxsIHNlbGVjdG9ycyB3ZXJlIHZhbGlkLCBmYWxzZSBpZiBhbnkgc2VsZWN0b3Igd2FzIGludmFsaWRcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YWxpZGF0ZVNlbGVjdG9yczogZnVuY3Rpb24oZmlsdGVyU3VibWl0RWxlbWVudCwgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzRmlsdGVyO1xyXG5cclxuICAgICAgICAgICAgbGV0IGludmFsaWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnZhbHMgPSBzZWxmLmdldFNlbGVjdG9yVmFsdWVzKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZjb3VudCA9IHNlbGYuY291bnRTZWxlY3Rvck9wdGlvbnModHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZ2YWxzID09PSBudWxsIHx8IGZ2YWxzLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9Ub2dnbGUgZmlsdGVyLWVycm9yIG9uXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTZWxlY3RvckVycm9yKHR5cGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGludmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9NYWtlIHN1cmUgZmlsdGVyLWVycm9yIGlzIHRvZ2dsZWQgb2ZmXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTZWxlY3RvckVycm9yKHR5cGUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJTdWJtaXRFbGVtZW50ICE9PSBudWxsKSBmaWx0ZXJTdWJtaXRFbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHNlbGYudmFsaWRGaWx0ZXJzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyU3VibWl0RWxlbWVudCAhPT0gbnVsbCkgZmlsdGVyU3VibWl0RWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi52YWxpZEZpbHRlcnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogR2VuZXJhdGVzIGEgdXJsIHdpdGggZmlsdGVyIHF1ZXJ5IHBhcmFtZXRlcnMgZ2l2ZW4gYSBiYXNlVXJsIGFuZCB0aGUgZmlsdGVyIHR5cGVzIHRvIGxvb2sgZm9yLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogRmlsdGVyIHR5cGVzIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MgZGVzY3JpYmluZyB0aGUgdHlwZXMgb2YgZmlsdGVycyBpbiB1c2VcclxuICAgICAgICAgKiB0byBnZW5lcmF0ZSBhIHVybCBmb3IuIEVYOiBbJ21hcCcsICdyYW5rJywgJ2dhbWVUeXBlJ11cclxuICAgICAgICAgKi9cclxuICAgICAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzRmlsdGVyO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbHRlckZyYWdtZW50cyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9DaGVjayBmaWx0ZXJzXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGZpbHRlciBmcmFnbWVudCBoYXMgYmVlbiBzZXQgeWV0XHJcbiAgICAgICAgICAgICAgICBpZiAoIShmaWx0ZXJGcmFnbWVudHMuaGFzT3duUHJvcGVydHkodHlwZSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9BdHRlbXB0IHRvIGZpbmQgdGhlIGZpbHRlciBhbmQgZ2V0IGl0cyB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZnZhbHMgPSBzZWxmLmdldFNlbGVjdG9yVmFsdWVzKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZ2YWxzID09PSBcInN0cmluZ1wiIHx8IGZ2YWxzIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckZyYWdtZW50c1t0eXBlXSA9IHR5cGUgKyAnPScgKyBmdmFscztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZnZhbHMgIT09IG51bGwgJiYgZnZhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NvbnN0cnVjdCBmaWx0ZXIgZnJhZ21lbnQgZm9yIHRoZXNlIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGcmFnbWVudHNbdHlwZV0gPSB0eXBlICsgJz0nICsgZnZhbHMuam9pbignLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlckNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGJhc2VVcmwgKyAnPyc7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZmlsdGVyRnJhZ21lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSxpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBmaWx0ZXJGcmFnbWVudHNba2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgZmlsdGVyQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCArPSAnJic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXJsID0gZW5jb2RlVVJJKHVybCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVVUkkoYmFzZVVybCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNlbGVjdG9yRXJyb3I6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUsIGJvb2wpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnZGl2LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSArICcgPiAuZHJvcGRvd24tdG9nZ2xlJykuZmlyc3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygnZmlsdGVyLWVycm9yJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygnZmlsdGVyLWVycm9yJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNlbGVjdG9yVmFsdWVzOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3ItJyArIHNlbGVjdG9yX3R5cGUpLmZpcnN0KCk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci52YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb3VudFNlbGVjdG9yT3B0aW9uczogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKS5maW5kKCdvcHRpb24nKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHdpbmRvdy5Ib3RzdGF0dXNGaWx0ZXIgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcbn0pKGpRdWVyeSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJzb3VyY2VSb290IjoiIn0=