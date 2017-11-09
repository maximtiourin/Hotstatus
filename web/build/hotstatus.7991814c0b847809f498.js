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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGE4MzE0OTdhNDM0YzhlMzQ0NTAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCIkIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJmaWx0ZXJTdWJtaXRFbGVtZW50IiwiZmlsdGVyX3R5cGVzIiwic2VsZiIsImludmFsaWQiLCJ0eXBlIiwiZnZhbHMiLCJnZXRTZWxlY3RvclZhbHVlcyIsImZjb3VudCIsImNvdW50U2VsZWN0b3JPcHRpb25zIiwibGVuZ3RoIiwic2V0U2VsZWN0b3JFcnJvciIsInByb3AiLCJnZW5lcmF0ZVVybCIsImJhc2VVcmwiLCJmaWx0ZXJGcmFnbWVudHMiLCJmaWx0ZXJDb3VudCIsImhhc093blByb3BlcnR5IiwiU3RyaW5nIiwiam9pbiIsInVybCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXgiLCJlbmNvZGVVUkkiLCJzZWxlY3Rvcl90eXBlIiwiYm9vbCIsInNlbGVjdG9yIiwiZmlyc3QiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwidmFsIiwiZmluZCIsImpRdWVyeSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtE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MDlmNDk4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBkYTgzMTQ5N2E0MzRjOGUzNDQ1MCIsIi8vR29vZ2xlIEFkcyBEZWZpbmVcclxuKGFkc2J5Z29vZ2xlID0gd2luZG93LmFkc2J5Z29vZ2xlIHx8IFtdKS5wdXNoKHt9KTtcclxuXHJcbi8vQmVnaW4gaG90c3RhdHVzIGRlZmluaXRpb25zXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgbGV0IEhvdHN0YXR1c0ZpbHRlciA9IHtcclxuICAgICAgICB2YWxpZEZpbHRlcnM6IGZhbHNlLFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVmFsaWRhdGVzIHRoZSBzZWxlY3RvcnMgb2YgdGhlIGdpdmVuIGZpbHRlciB0eXBlcywgaWYgdGhlaXIgY3VycmVudCBzZWxlY3Rpb25zIGFyZSBpbnZhbGlkLCB0aGVuXHJcbiAgICAgICAgICogZGlzYWJsZSB0aGUgZ2l2ZW4gc3VibWl0IGVsZW1lbnQgYW5kIGFkZCBhIGZpbHRlci1lcnJvciBjbGFzcyB0byB0aGUgaW52YWxpZCBzZWxlY3RvcnMuIFJldHVybnNcclxuICAgICAgICAgKiB0cnVlIGlmIGFsbCBzZWxlY3RvcnMgd2VyZSB2YWxpZCwgZmFsc2UgaWYgYW55IHNlbGVjdG9yIHdhcyBpbnZhbGlkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFsaWRhdGVTZWxlY3RvcnM6IGZ1bmN0aW9uKGZpbHRlclN1Ym1pdEVsZW1lbnQsIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhvdHN0YXR1c0ZpbHRlcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbnZhbGlkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZ2YWxzID0gc2VsZi5nZXRTZWxlY3RvclZhbHVlcyh0eXBlKTtcclxuICAgICAgICAgICAgICAgIGxldCBmY291bnQgPSBzZWxmLmNvdW50U2VsZWN0b3JPcHRpb25zKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmdmFscyA9PT0gbnVsbCB8fCBmdmFscy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGZpbHRlci1lcnJvciBvblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U2VsZWN0b3JFcnJvcih0eXBlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vTWFrZSBzdXJlIGZpbHRlci1lcnJvciBpcyB0b2dnbGVkIG9mZlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U2VsZWN0b3JFcnJvcih0eXBlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyU3VibWl0RWxlbWVudCAhPT0gbnVsbCkgZmlsdGVyU3VibWl0RWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnZhbGlkRmlsdGVycyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlclN1Ym1pdEVsZW1lbnQgIT09IG51bGwpIGZpbHRlclN1Ym1pdEVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHNlbGYudmFsaWRGaWx0ZXJzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEdlbmVyYXRlcyBhIHVybCB3aXRoIGZpbHRlciBxdWVyeSBwYXJhbWV0ZXJzIGdpdmVuIGEgYmFzZVVybCBhbmQgdGhlIGZpbHRlciB0eXBlcyB0byBsb29rIGZvci5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEZpbHRlciB0eXBlcyBpcyBhbiBhcnJheSBvZiBzdHJpbmdzIGRlc2NyaWJpbmcgdGhlIHR5cGVzIG9mIGZpbHRlcnMgaW4gdXNlXHJcbiAgICAgICAgICogdG8gZ2VuZXJhdGUgYSB1cmwgZm9yLiBFWDogWydtYXAnLCAncmFuaycsICdnYW1lVHlwZSddXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhvdHN0YXR1c0ZpbHRlcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJGcmFnbWVudHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ2hlY2sgZmlsdGVyc1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVyQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBmaWx0ZXIgZnJhZ21lbnQgaGFzIGJlZW4gc2V0IHlldFxyXG4gICAgICAgICAgICAgICAgaWYgKCEoZmlsdGVyRnJhZ21lbnRzLmhhc093blByb3BlcnR5KHR5cGUpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQXR0ZW1wdCB0byBmaW5kIHRoZSBmaWx0ZXIgYW5kIGdldCBpdHMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZ2YWxzID0gc2VsZi5nZXRTZWxlY3RvclZhbHVlcyh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmdmFscyA9PT0gXCJzdHJpbmdcIiB8fCBmdmFscyBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGcmFnbWVudHNbdHlwZV0gPSB0eXBlICsgJz0nICsgZnZhbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZ2YWxzICE9PSBudWxsICYmIGZ2YWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Db25zdHJ1Y3QgZmlsdGVyIGZyYWdtZW50IGZvciB0aGVzZSB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJhZ21lbnRzW3R5cGVdID0gdHlwZSArICc9JyArIGZ2YWxzLmpvaW4oJywnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBiYXNlVXJsICsgJz8nO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGZpbHRlckZyYWdtZW50cykuZm9yRWFjaChmdW5jdGlvbihrZXksaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gZmlsdGVyRnJhZ21lbnRzW2tleV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGZpbHRlckNvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyYnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHVybCA9IGVuY29kZVVSSSh1cmwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlVVJJKGJhc2VVcmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTZWxlY3RvckVycm9yOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlLCBib29sKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9ICQoJ2Rpdi5maWx0ZXItc2VsZWN0b3ItJyArIHNlbGVjdG9yX3R5cGUgKyAnID4gLmRyb3Bkb3duLXRvZ2dsZScpLmZpcnN0KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYm9vbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ2ZpbHRlci1lcnJvcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ2ZpbHRlci1lcnJvcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTZWxlY3RvclZhbHVlczogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlKS5maXJzdCgpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IudmFsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY291bnRTZWxlY3Rvck9wdGlvbnM6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3ItJyArIHNlbGVjdG9yX3R5cGUpLmZpcnN0KCkuZmluZCgnb3B0aW9uJykubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LkhvdHN0YXR1c0ZpbHRlciA9IEhvdHN0YXR1c0ZpbHRlcjtcclxufSkoalF1ZXJ5KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaG90c3RhdHVzLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==