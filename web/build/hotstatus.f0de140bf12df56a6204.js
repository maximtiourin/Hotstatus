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

//Google Ads Define
(adsbygoogle = window.adsbygoogle || []).push({});

//Begin hotstatus definitions
(function ($) {
    var HotstatusFilter = {
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
                filterSubmitElement.prop("disabled", true);
                return false;
            } else {
                filterSubmitElement.prop("disabled", false);
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

                        if (fvals !== null && fvals.length > 0) {
                            //Construct filter fragment for these values
                            filterFragments[type] = type + '=' + fvals.join('+');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2FhYWU3YTYzOTgxNmU1Y2RjYTUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCIkIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJmaWx0ZXJTdWJtaXRFbGVtZW50IiwiZmlsdGVyX3R5cGVzIiwic2VsZiIsImludmFsaWQiLCJ0eXBlIiwiZnZhbHMiLCJnZXRTZWxlY3RvclZhbHVlcyIsImZjb3VudCIsImNvdW50U2VsZWN0b3JPcHRpb25zIiwibGVuZ3RoIiwic2V0U2VsZWN0b3JFcnJvciIsInByb3AiLCJnZW5lcmF0ZVVybCIsImJhc2VVcmwiLCJmaWx0ZXJGcmFnbWVudHMiLCJmaWx0ZXJDb3VudCIsImhhc093blByb3BlcnR5Iiwiam9pbiIsInVybCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXgiLCJlbmNvZGVVUkkiLCJzZWxlY3Rvcl90eXBlIiwiYm9vbCIsInNlbGVjdG9yIiwiZmlyc3QiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwidmFsIiwiZmluZCIsImpRdWVyeSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtB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QzVDLGdCQUFJQyxXQUFXOUIsRUFBRSx5QkFBeUI0QixhQUF6QixHQUF5QyxxQkFBM0MsRUFBa0VHLEtBQWxFLEVBQWY7O0FBRUEsZ0JBQUlGLElBQUosRUFBVTtBQUNOQyx5QkFBU0UsUUFBVCxDQUFrQixjQUFsQjtBQUNILGFBRkQsTUFHSztBQUNERix5QkFBU0csV0FBVCxDQUFxQixjQUFyQjtBQUNIO0FBQ0osU0ExRmlCO0FBMkZsQnhCLDJCQUFtQiwyQkFBU21CLGFBQVQsRUFBd0I7QUFDdkMsZ0JBQUlFLFdBQVc5QixFQUFFLDRCQUE0QjRCLGFBQTlCLEVBQTZDRyxLQUE3QyxFQUFmO0FBQ0EsZ0JBQUlELFNBQVNsQixNQUFiLEVBQXFCO0FBQ2pCLHVCQUFPa0IsU0FBU0ksR0FBVCxFQUFQO0FBQ0gsYUFGRCxNQUdLO0FBQ0QsdUJBQU8sSUFBUDtBQUNIO0FBQ0osU0FuR2lCO0FBb0dsQnZCLDhCQUFzQiw4QkFBU2lCLGFBQVQsRUFBd0I7QUFDMUMsbUJBQU81QixFQUFFLDRCQUE0QjRCLGFBQTlCLEVBQTZDRyxLQUE3QyxHQUFxREksSUFBckQsQ0FBMEQsUUFBMUQsRUFBb0V2QixNQUEzRTtBQUNIO0FBdEdpQixLQUF0Qjs7QUF5R0FkLFdBQU9HLGVBQVAsR0FBeUJBLGVBQXpCO0FBQ0gsQ0EzR0QsRUEyR0dtQyxNQTNHSCxFIiwiZmlsZSI6ImhvdHN0YXR1cy5mMGRlMTQwYmYxMmRmNTZhNjIwNC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9ob3RzdGF0dXMuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgY2FhYWU3YTYzOTgxNmU1Y2RjYTUiLCIvL0dvb2dsZSBBZHMgRGVmaW5lXHJcbihhZHNieWdvb2dsZSA9IHdpbmRvdy5hZHNieWdvb2dsZSB8fCBbXSkucHVzaCh7fSk7XHJcblxyXG4vL0JlZ2luIGhvdHN0YXR1cyBkZWZpbml0aW9uc1xyXG4oZnVuY3Rpb24gKCQpIHtcclxuICAgIGxldCBIb3RzdGF0dXNGaWx0ZXIgPSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBWYWxpZGF0ZXMgdGhlIHNlbGVjdG9ycyBvZiB0aGUgZ2l2ZW4gZmlsdGVyIHR5cGVzLCBpZiB0aGVpciBjdXJyZW50IHNlbGVjdGlvbnMgYXJlIGludmFsaWQsIHRoZW5cclxuICAgICAgICAgKiBkaXNhYmxlIHRoZSBnaXZlbiBzdWJtaXQgZWxlbWVudCBhbmQgYWRkIGEgZmlsdGVyLWVycm9yIGNsYXNzIHRvIHRoZSBpbnZhbGlkIHNlbGVjdG9ycy4gUmV0dXJuc1xyXG4gICAgICAgICAqIHRydWUgaWYgYWxsIHNlbGVjdG9ycyB3ZXJlIHZhbGlkLCBmYWxzZSBpZiBhbnkgc2VsZWN0b3Igd2FzIGludmFsaWRcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YWxpZGF0ZVNlbGVjdG9yczogZnVuY3Rpb24oZmlsdGVyU3VibWl0RWxlbWVudCwgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzRmlsdGVyO1xyXG5cclxuICAgICAgICAgICAgbGV0IGludmFsaWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnZhbHMgPSBzZWxmLmdldFNlbGVjdG9yVmFsdWVzKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZjb3VudCA9IHNlbGYuY291bnRTZWxlY3Rvck9wdGlvbnModHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZ2YWxzID09PSBudWxsIHx8IGZ2YWxzLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9Ub2dnbGUgZmlsdGVyLWVycm9yIG9uXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTZWxlY3RvckVycm9yKHR5cGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGludmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9NYWtlIHN1cmUgZmlsdGVyLWVycm9yIGlzIHRvZ2dsZWQgb2ZmXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTZWxlY3RvckVycm9yKHR5cGUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlclN1Ym1pdEVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyU3VibWl0RWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogR2VuZXJhdGVzIGEgdXJsIHdpdGggZmlsdGVyIHF1ZXJ5IHBhcmFtZXRlcnMgZ2l2ZW4gYSBiYXNlVXJsIGFuZCB0aGUgZmlsdGVyIHR5cGVzIHRvIGxvb2sgZm9yLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogRmlsdGVyIHR5cGVzIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MgZGVzY3JpYmluZyB0aGUgdHlwZXMgb2YgZmlsdGVycyBpbiB1c2VcclxuICAgICAgICAgKiB0byBnZW5lcmF0ZSBhIHVybCBmb3IuIEVYOiBbJ21hcCcsICdyYW5rJywgJ2dhbWVUeXBlJ11cclxuICAgICAgICAgKi9cclxuICAgICAgICBnZW5lcmF0ZVVybDogZnVuY3Rpb24oYmFzZVVybCwgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gSG90c3RhdHVzRmlsdGVyO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbHRlckZyYWdtZW50cyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy9DaGVjayBmaWx0ZXJzXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgZmlsdGVyX3R5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGZpbHRlciBmcmFnbWVudCBoYXMgYmVlbiBzZXQgeWV0XHJcbiAgICAgICAgICAgICAgICBpZiAoIShmaWx0ZXJGcmFnbWVudHMuaGFzT3duUHJvcGVydHkodHlwZSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9BdHRlbXB0IHRvIGZpbmQgdGhlIGZpbHRlciBhbmQgZ2V0IGl0cyB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZnZhbHMgPSBzZWxmLmdldFNlbGVjdG9yVmFsdWVzKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZnZhbHMgIT09IG51bGwgJiYgZnZhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0NvbnN0cnVjdCBmaWx0ZXIgZnJhZ21lbnQgZm9yIHRoZXNlIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGcmFnbWVudHNbdHlwZV0gPSB0eXBlICsgJz0nICsgZnZhbHMuam9pbignKycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlckNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGJhc2VVcmwgKyAnPyc7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZmlsdGVyRnJhZ21lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSxpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBmaWx0ZXJGcmFnbWVudHNba2V5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgZmlsdGVyQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCArPSAnJic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXJsID0gZW5jb2RlVVJJKHVybCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVVUkkoYmFzZVVybCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNlbGVjdG9yRXJyb3I6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUsIGJvb2wpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnZGl2LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSArICcgPiAuZHJvcGRvd24tdG9nZ2xlJykuZmlyc3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygnZmlsdGVyLWVycm9yJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygnZmlsdGVyLWVycm9yJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNlbGVjdG9yVmFsdWVzOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3ItJyArIHNlbGVjdG9yX3R5cGUpLmZpcnN0KCk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci52YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb3VudFNlbGVjdG9yT3B0aW9uczogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKS5maW5kKCdvcHRpb24nKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuSG90c3RhdHVzRmlsdGVyID0gSG90c3RhdHVzRmlsdGVyO1xyXG59KShqUXVlcnkpO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9ob3RzdGF0dXMuanMiXSwic291cmNlUm9vdCI6IiJ9