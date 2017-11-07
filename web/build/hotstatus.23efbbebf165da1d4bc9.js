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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2Y0NDMwYmIzNDk5YWExOWZhNjMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCIkIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJmaWx0ZXJTdWJtaXRFbGVtZW50IiwiZmlsdGVyX3R5cGVzIiwic2VsZiIsImludmFsaWQiLCJ0eXBlIiwiZnZhbHMiLCJnZXRTZWxlY3RvclZhbHVlcyIsImZjb3VudCIsImNvdW50U2VsZWN0b3JPcHRpb25zIiwibGVuZ3RoIiwic2V0U2VsZWN0b3JFcnJvciIsInByb3AiLCJnZW5lcmF0ZVVybCIsImJhc2VVcmwiLCJmaWx0ZXJGcmFnbWVudHMiLCJmaWx0ZXJDb3VudCIsImhhc093blByb3BlcnR5IiwiU3RyaW5nIiwiam9pbiIsInVybCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXgiLCJlbmNvZGVVUkkiLCJzZWxlY3Rvcl90eXBlIiwiYm9vbCIsInNlbGVjdG9yIiwiZmlyc3QiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwidmFsIiwiZmluZCIsImpRdWVyeSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFD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R0FBVixDQUFOOztBQUVBLHVCQUFPQSxHQUFQO0FBQ0gsYUFkRCxNQWVLO0FBQ0QsdUJBQU9NLFVBQVVaLE9BQVYsQ0FBUDtBQUNIO0FBQ0osU0FwRmlCO0FBcUZsQkgsMEJBQWtCLDBCQUFTZ0IsYUFBVCxFQUF3QkMsSUFBeEIsRUFBOEI7QUFDNUMsZ0JBQUlDLFdBQVcvQixFQUFFLHlCQUF5QjZCLGFBQXpCLEdBQXlDLHFCQUEzQyxFQUFrRUcsS0FBbEUsRUFBZjs7QUFFQSxnQkFBSUYsSUFBSixFQUFVO0FBQ05DLHlCQUFTRSxRQUFULENBQWtCLGNBQWxCO0FBQ0gsYUFGRCxNQUdLO0FBQ0RGLHlCQUFTRyxXQUFULENBQXFCLGNBQXJCO0FBQ0g7QUFDSixTQTlGaUI7QUErRmxCekIsMkJBQW1CLDJCQUFTb0IsYUFBVCxFQUF3QjtBQUN2QyxnQkFBSUUsV0FBVy9CLEVBQUUsNEJBQTRCNkIsYUFBOUIsRUFBNkNHLEtBQTdDLEVBQWY7QUFDQSxnQkFBSUQsU0FBU25CLE1BQWIsRUFBcUI7QUFDakIsdUJBQU9tQixTQUFTSSxHQUFULEVBQVA7QUFDSCxhQUZELE1BR0s7QUFDRCx1QkFBTyxJQUFQO0FBQ0g7QUFDSixTQXZHaUI7QUF3R2xCeEIsOEJBQXNCLDhCQUFTa0IsYUFBVCxFQUF3QjtBQUMxQyxtQkFBTzdCLEVBQUUsNEJBQTRCNkIsYUFBOUIsRUFBNkNHLEtBQTdDLEdBQXFESSxJQUFyRCxDQUEwRCxRQUExRCxFQUFvRXhCLE1BQTNFO0FBQ0g7QUExR2lCLEtBQXRCOztBQTZHQWQsV0FBT0csZUFBUCxHQUF5QkEsZUFBekI7QUFDSCxDQS9HRCxFQStHR29DLE1BL0dILEUiLCJmaWxlIjoiaG90c3RhdHVzLjIzZWZiYmViZjE2NWRhMWQ0YmM5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBjZjQ0MzBiYjM0OTlhYTE5ZmE2MyIsIi8vR29vZ2xlIEFkcyBEZWZpbmVcclxuKGFkc2J5Z29vZ2xlID0gd2luZG93LmFkc2J5Z29vZ2xlIHx8IFtdKS5wdXNoKHt9KTtcclxuXHJcbi8vQmVnaW4gaG90c3RhdHVzIGRlZmluaXRpb25zXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgbGV0IEhvdHN0YXR1c0ZpbHRlciA9IHtcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFZhbGlkYXRlcyB0aGUgc2VsZWN0b3JzIG9mIHRoZSBnaXZlbiBmaWx0ZXIgdHlwZXMsIGlmIHRoZWlyIGN1cnJlbnQgc2VsZWN0aW9ucyBhcmUgaW52YWxpZCwgdGhlblxyXG4gICAgICAgICAqIGRpc2FibGUgdGhlIGdpdmVuIHN1Ym1pdCBlbGVtZW50IGFuZCBhZGQgYSBmaWx0ZXItZXJyb3IgY2xhc3MgdG8gdGhlIGludmFsaWQgc2VsZWN0b3JzLiBSZXR1cm5zXHJcbiAgICAgICAgICogdHJ1ZSBpZiBhbGwgc2VsZWN0b3JzIHdlcmUgdmFsaWQsIGZhbHNlIGlmIGFueSBzZWxlY3RvciB3YXMgaW52YWxpZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhbGlkYXRlU2VsZWN0b3JzOiBmdW5jdGlvbihmaWx0ZXJTdWJtaXRFbGVtZW50LCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW52YWxpZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmNvdW50ID0gc2VsZi5jb3VudFNlbGVjdG9yT3B0aW9ucyh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnZhbHMgPT09IG51bGwgfHwgZnZhbHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RvZ2dsZSBmaWx0ZXItZXJyb3Igb25cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL01ha2Ugc3VyZSBmaWx0ZXItZXJyb3IgaXMgdG9nZ2xlZCBvZmZcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNlbGVjdG9yRXJyb3IodHlwZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW52YWxpZCkge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyU3VibWl0RWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJTdWJtaXRFbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgYSB1cmwgd2l0aCBmaWx0ZXIgcXVlcnkgcGFyYW1ldGVycyBnaXZlbiBhIGJhc2VVcmwgYW5kIHRoZSBmaWx0ZXIgdHlwZXMgdG8gbG9vayBmb3IuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGaWx0ZXIgdHlwZXMgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBkZXNjcmliaW5nIHRoZSB0eXBlcyBvZiBmaWx0ZXJzIGluIHVzZVxyXG4gICAgICAgICAqIHRvIGdlbmVyYXRlIGEgdXJsIGZvci4gRVg6IFsnbWFwJywgJ3JhbmsnLCAnZ2FtZVR5cGUnXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdlbmVyYXRlVXJsOiBmdW5jdGlvbihiYXNlVXJsLCBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyRnJhZ21lbnRzID0ge307XHJcblxyXG4gICAgICAgICAgICAvL0NoZWNrIGZpbHRlcnNcclxuICAgICAgICAgICAgbGV0IGZpbHRlckNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBmaWx0ZXJfdHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgZmlsdGVyIGZyYWdtZW50IGhhcyBiZWVuIHNldCB5ZXRcclxuICAgICAgICAgICAgICAgIGlmICghKGZpbHRlckZyYWdtZW50cy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0F0dGVtcHQgdG8gZmluZCB0aGUgZmlsdGVyIGFuZCBnZXQgaXRzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmdmFscyA9IHNlbGYuZ2V0U2VsZWN0b3JWYWx1ZXModHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZnZhbHMgPT09IFwic3RyaW5nXCIgfHwgZnZhbHMgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJhZ21lbnRzW3R5cGVdID0gdHlwZSArICc9JyArIGZ2YWxzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmdmFscyAhPT0gbnVsbCAmJiBmdmFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQ29uc3RydWN0IGZpbHRlciBmcmFnbWVudCBmb3IgdGhlc2UgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckZyYWdtZW50c1t0eXBlXSA9IHR5cGUgKyAnPScgKyBmdmFscy5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlsdGVyQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gYmFzZVVybCArICc/JztcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhmaWx0ZXJGcmFnbWVudHMpLmZvckVhY2goZnVuY3Rpb24oa2V5LGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IGZpbHRlckZyYWdtZW50c1trZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBmaWx0ZXJDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcmJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cmwgPSBlbmNvZGVVUkkodXJsKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVSSShiYXNlVXJsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2VsZWN0b3JFcnJvcjogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSwgYm9vbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCdkaXYuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlICsgJyA+IC5kcm9wZG93bi10b2dnbGUnKS5maXJzdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0b3JWYWx1ZXM6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnZhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvdW50U2VsZWN0b3JPcHRpb25zOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlKS5maXJzdCgpLmZpbmQoJ29wdGlvbicpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5Ib3RzdGF0dXNGaWx0ZXIgPSBIb3RzdGF0dXNGaWx0ZXI7XHJcbn0pKGpRdWVyeSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJzb3VyY2VSb290IjoiIn0=