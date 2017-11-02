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

//Begin htostatus definitions
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
            return $('select.filter-selector-' + selector_type + ' option').length;
        }
    };

    window.HotstatusFilter = HotstatusFilter;
})(jQuery);

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmY1Yzc4MTgzZTYyNDYyNzM3MzYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hvdHN0YXR1cy5qcyJdLCJuYW1lcyI6WyJhZHNieWdvb2dsZSIsIndpbmRvdyIsInB1c2giLCIkIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJmaWx0ZXJTdWJtaXRFbGVtZW50IiwiZmlsdGVyX3R5cGVzIiwic2VsZiIsImludmFsaWQiLCJ0eXBlIiwiZnZhbHMiLCJnZXRTZWxlY3RvclZhbHVlcyIsImZjb3VudCIsImNvdW50U2VsZWN0b3JPcHRpb25zIiwibGVuZ3RoIiwic2V0U2VsZWN0b3JFcnJvciIsInByb3AiLCJnZW5lcmF0ZVVybCIsImJhc2VVcmwiLCJmaWx0ZXJGcmFnbWVudHMiLCJmaWx0ZXJDb3VudCIsImhhc093blByb3BlcnR5Iiwiam9pbiIsInVybCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXgiLCJlbmNvZGVVUkkiLCJzZWxlY3Rvcl90eXBlIiwiYm9vbCIsInNlbGVjdG9yIiwiZmlyc3QiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwidmFsIiwialF1ZXJ5Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7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QUFJQyxXQUFXOUIsRUFBRSx5QkFBeUI0QixhQUF6QixHQUF5QyxxQkFBM0MsRUFBa0VHLEtBQWxFLEVBQWY7O0FBRUEsZ0JBQUlGLElBQUosRUFBVTtBQUNOQyx5QkFBU0UsUUFBVCxDQUFrQixjQUFsQjtBQUNILGFBRkQsTUFHSztBQUNERix5QkFBU0csV0FBVCxDQUFxQixjQUFyQjtBQUNIO0FBQ0osU0EzRmlCO0FBNEZsQnhCLDJCQUFtQiwyQkFBU21CLGFBQVQsRUFBd0I7QUFDdkMsZ0JBQUlFLFdBQVc5QixFQUFFLDRCQUE0QjRCLGFBQTlCLEVBQTZDRyxLQUE3QyxFQUFmO0FBQ0EsZ0JBQUlELFNBQVNsQixNQUFiLEVBQXFCO0FBQ2pCLHVCQUFPa0IsU0FBU0ksR0FBVCxFQUFQO0FBQ0gsYUFGRCxNQUdLO0FBQ0QsdUJBQU8sSUFBUDtBQUNIO0FBQ0osU0FwR2lCO0FBcUdsQnZCLDhCQUFzQiw4QkFBU2lCLGFBQVQsRUFBd0I7QUFDMUMsbUJBQU81QixFQUFFLDRCQUE0QjRCLGFBQTVCLEdBQTRDLFNBQTlDLEVBQXlEaEIsTUFBaEU7QUFDSDtBQXZHaUIsS0FBdEI7O0FBMEdBZCxXQUFPRyxlQUFQLEdBQXlCQSxlQUF6QjtBQUNILENBNUdELEVBNEdHa0MsTUE1R0gsRSIsImZpbGUiOiJob3RzdGF0dXMuNGNkZTIwYzZjZGI1YTYyYzUzNzcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaG90c3RhdHVzLmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDZmNWM3ODE4M2U2MjQ2MjczNzM2IiwiLy9Hb29nbGUgQWRzIERlZmluZVxyXG4oYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xyXG5cclxuLy9CZWdpbiBodG9zdGF0dXMgZGVmaW5pdGlvbnNcclxuKGZ1bmN0aW9uICgkKSB7XHJcbiAgICBsZXQgSG90c3RhdHVzRmlsdGVyID0ge1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVmFsaWRhdGVzIHRoZSBzZWxlY3RvcnMgb2YgdGhlIGdpdmVuIGZpbHRlciB0eXBlcywgaWYgdGhlaXIgY3VycmVudCBzZWxlY3Rpb25zIGFyZSBpbnZhbGlkLCB0aGVuXHJcbiAgICAgICAgICogZGlzYWJsZSB0aGUgZ2l2ZW4gc3VibWl0IGVsZW1lbnQgYW5kIGFkZCBhIGZpbHRlci1lcnJvciBjbGFzcyB0byB0aGUgaW52YWxpZCBzZWxlY3RvcnMuIFJldHVybnNcclxuICAgICAgICAgKiB0cnVlIGlmIGFsbCBzZWxlY3RvcnMgd2VyZSB2YWxpZCwgZmFsc2UgaWYgYW55IHNlbGVjdG9yIHdhcyBpbnZhbGlkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFsaWRhdGVTZWxlY3RvcnM6IGZ1bmN0aW9uKGZpbHRlclN1Ym1pdEVsZW1lbnQsIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhvdHN0YXR1c0ZpbHRlcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbnZhbGlkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZ2YWxzID0gc2VsZi5nZXRTZWxlY3RvclZhbHVlcyh0eXBlKTtcclxuICAgICAgICAgICAgICAgIGxldCBmY291bnQgPSBzZWxmLmNvdW50U2VsZWN0b3JPcHRpb25zKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmdmFscyA9PT0gbnVsbCB8fCBmdmFscy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVG9nZ2xlIGZpbHRlci1lcnJvciBvblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U2VsZWN0b3JFcnJvcih0eXBlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vTWFrZSBzdXJlIGZpbHRlci1lcnJvciBpcyB0b2dnbGVkIG9mZlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U2VsZWN0b3JFcnJvcih0eXBlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJTdWJtaXRFbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlclN1Ym1pdEVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEdlbmVyYXRlcyBhIHVybCB3aXRoIGZpbHRlciBxdWVyeSBwYXJhbWV0ZXJzIGdpdmVuIGEgYmFzZVVybCBhbmQgdGhlIGZpbHRlciB0eXBlcyB0byBsb29rIGZvci5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEZpbHRlciB0eXBlcyBpcyBhbiBhcnJheSBvZiBzdHJpbmdzIGRlc2NyaWJpbmcgdGhlIHR5cGVzIG9mIGZpbHRlcnMgaW4gdXNlXHJcbiAgICAgICAgICogdG8gZ2VuZXJhdGUgYSB1cmwgZm9yLiBFWDogWydtYXAnLCAncmFuaycsICdnYW1lVHlwZSddXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2VuZXJhdGVVcmw6IGZ1bmN0aW9uKGJhc2VVcmwsIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IEhvdHN0YXR1c0ZpbHRlcjtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJGcmFnbWVudHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vQ2hlY2sgZmlsdGVyc1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVyQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0eXBlIG9mIGZpbHRlcl90eXBlcykge1xyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBmaWx0ZXIgZnJhZ21lbnQgaGFzIGJlZW4gc2V0IHlldFxyXG4gICAgICAgICAgICAgICAgaWYgKCEoZmlsdGVyRnJhZ21lbnRzLmhhc093blByb3BlcnR5KHR5cGUpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQXR0ZW1wdCB0byBmaW5kIHRoZSBmaWx0ZXIgYW5kIGdldCBpdHMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZ2YWxzID0gc2VsZi5nZXRTZWxlY3RvclZhbHVlcyh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ2YWxzICE9PSBudWxsICYmIGZ2YWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Db25zdHJ1Y3QgZmlsdGVyIGZyYWdtZW50IGZvciB0aGVzZSB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJhZ21lbnRzW3R5cGVdID0gdHlwZSArICc9JyArIGZ2YWxzLmpvaW4oJysnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBiYXNlVXJsICsgJz8nO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhmaWx0ZXJGcmFnbWVudHMpLmZvckVhY2goZnVuY3Rpb24oa2V5LGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IGZpbHRlckZyYWdtZW50c1trZXldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBmaWx0ZXJDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcmJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cmwgPSBlbmNvZGVVUkkodXJsKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVSSShiYXNlVXJsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2VsZWN0b3JFcnJvcjogZnVuY3Rpb24oc2VsZWN0b3JfdHlwZSwgYm9vbCkge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAkKCdkaXYuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlICsgJyA+IC5kcm9wZG93bi10b2dnbGUnKS5maXJzdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdmaWx0ZXItZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0b3JWYWx1ZXM6IGZ1bmN0aW9uKHNlbGVjdG9yX3R5cGUpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gJCgnc2VsZWN0LmZpbHRlci1zZWxlY3Rvci0nICsgc2VsZWN0b3JfdHlwZSkuZmlyc3QoKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnZhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvdW50U2VsZWN0b3JPcHRpb25zOiBmdW5jdGlvbihzZWxlY3Rvcl90eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yLScgKyBzZWxlY3Rvcl90eXBlICsgJyBvcHRpb24nKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuSG90c3RhdHVzRmlsdGVyID0gSG90c3RhdHVzRmlsdGVyO1xyXG59KShqUXVlcnkpO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9ob3RzdGF0dXMuanMiXSwic291cmNlUm9vdCI6IiJ9