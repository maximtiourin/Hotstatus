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
    stats: {}
};

$(document).ready(function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTFjYWIwN2VjNjFjOWQxZjkzMDQiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm8tbG9hZGVyLmpzIl0sIm5hbWVzIjpbIkhlcm9Mb2FkZXIiLCJhamF4IiwiaW50ZXJuYWwiLCJ1cmwiLCJkYXRhU3JjIiwic2VsZiIsImxvYWQiLCIkIiwiZ2V0SlNPTiIsImRvbmUiLCJqc29uUmVzcG9uc2UiLCJkYXRhIiwiZGF0YV9oZXJvZGF0YSIsImhlcm9kYXRhIiwiZGF0YV9zdGF0cyIsInN0YXRzIiwianNvbiIsImpzb25faGVyb2RhdGEiLCJqc29uX3N0YXRzIiwiaW1hZ2VfaGVybyIsIm5hbWUiLCJ0aXRsZSIsInRhZ2xpbmUiLCJiaW8iLCJmYWlsIiwiYWx3YXlzIiwidmFsIiwidGV4dCIsImF0dHIiLCJkb2N1bWVudCIsInJlYWR5IiwiYmFzZVVybCIsIlJvdXRpbmciLCJnZW5lcmF0ZSIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwiZ2VuZXJhdGVVcmwiLCJvbiIsImV2ZW50IiwidmFsaWRhdGVTZWxlY3RvcnMiLCJjbGljayJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBOztBQUVBOzs7O0FBSUEsSUFBSUEsYUFBYSxFQUFqQjs7QUFFQTs7O0FBR0FBLFdBQVdDLElBQVgsR0FBa0I7QUFDZEMsY0FBVTtBQUNOQyxhQUFLLEVBREMsRUFDRztBQUNUQyxpQkFBUyxNQUZILENBRVc7QUFGWCxLQURJO0FBS2Q7Ozs7QUFJQUQsU0FBSyxlQUFxQjtBQUFBLFlBQVpBLElBQVksdUVBQU4sSUFBTTs7QUFDdEIsWUFBSUUsT0FBT0wsV0FBV0MsSUFBdEI7O0FBRUEsWUFBSUUsU0FBUSxJQUFaLEVBQWtCO0FBQ2QsbUJBQU9FLEtBQUtILFFBQUwsQ0FBY0MsR0FBckI7QUFDSCxTQUZELE1BR0s7QUFDREUsaUJBQUtILFFBQUwsQ0FBY0MsR0FBZCxHQUFvQkEsSUFBcEI7QUFDQSxtQkFBT0UsSUFBUDtBQUNIO0FBQ0osS0FuQmE7QUFvQmQ7Ozs7QUFJQUMsVUFBTSxnQkFBVztBQUNiLFlBQUlELE9BQU9MLFdBQVdDLElBQXRCOztBQUVBOztBQUVBO0FBQ0FNLFVBQUVDLE9BQUYsQ0FBVUgsS0FBS0gsUUFBTCxDQUFjQyxHQUF4QixFQUNLTSxJQURMLENBQ1UsVUFBU0MsWUFBVCxFQUF1QjtBQUN6QixnQkFBSUMsT0FBT1gsV0FBV1csSUFBdEI7QUFDQSxnQkFBSUMsZ0JBQWdCRCxLQUFLRSxRQUF6QjtBQUNBLGdCQUFJQyxhQUFhSCxLQUFLSSxLQUF0Qjs7QUFFQSxnQkFBSUMsT0FBT04sYUFBYUwsS0FBS0gsUUFBTCxDQUFjRSxPQUEzQixDQUFYO0FBQ0EsZ0JBQUlhLGdCQUFnQkQsS0FBSyxVQUFMLENBQXBCO0FBQ0EsZ0JBQUlFLGFBQWFGLEtBQUssT0FBTCxDQUFqQjs7QUFFQTs7O0FBR0E7QUFDQUosMEJBQWNPLFVBQWQsQ0FBeUJGLGNBQWMsWUFBZCxDQUF6QjtBQUNBO0FBQ0FMLDBCQUFjUSxJQUFkLENBQW1CSCxjQUFjLE1BQWQsQ0FBbkI7QUFDQTtBQUNBTCwwQkFBY1MsS0FBZCxDQUFvQkosY0FBYyxPQUFkLENBQXBCO0FBQ0E7QUFDQUwsMEJBQWNVLE9BQWQsQ0FBc0JMLGNBQWMsY0FBZCxDQUF0QjtBQUNBO0FBQ0FMLDBCQUFjVyxHQUFkLENBQWtCTixjQUFjLFVBQWQsQ0FBbEI7QUFFSCxTQXhCTCxFQXlCS08sSUF6QkwsQ0F5QlUsWUFBVztBQUNiO0FBQ0gsU0EzQkwsRUE0QktDLE1BNUJMLENBNEJZLFlBQVc7QUFDZjtBQUNILFNBOUJMOztBQWdDQSxlQUFPcEIsSUFBUDtBQUNIO0FBL0RhLENBQWxCOztBQWtFQTs7O0FBR0FMLFdBQVdXLElBQVgsR0FBa0I7QUFDZEUsY0FBVTtBQUNOTyxjQUFNLGNBQVNNLEdBQVQsRUFBYztBQUNoQm5CLGNBQUUsbUJBQUYsRUFBdUJvQixJQUF2QixDQUE0QkQsR0FBNUI7QUFDSCxTQUhLO0FBSU5MLGVBQU8sZUFBU0ssR0FBVCxFQUFjO0FBQ2pCbkIsY0FBRSxvQkFBRixFQUF3Qm9CLElBQXhCLENBQTZCRCxHQUE3QjtBQUNILFNBTks7QUFPTkosaUJBQVMsaUJBQVNJLEdBQVQsRUFBYztBQUNuQm5CLGNBQUUsMkJBQUYsRUFBK0JvQixJQUEvQixDQUFvQ0QsR0FBcEM7QUFDSCxTQVRLO0FBVU5ILGFBQUssYUFBU0csR0FBVCxFQUFjO0FBQ2ZuQixjQUFFLHVCQUFGLEVBQTJCb0IsSUFBM0IsQ0FBZ0NELEdBQWhDO0FBQ0gsU0FaSztBQWFOUCxvQkFBWSxvQkFBU08sR0FBVCxFQUFjO0FBQ3RCbkIsY0FBRSx5QkFBRixFQUE2QnFCLElBQTdCLENBQWtDLEtBQWxDLEVBQXlDRixHQUF6QztBQUNIO0FBZkssS0FESTtBQWtCZFgsV0FBTztBQWxCTyxDQUFsQjs7QUF3QkFSLEVBQUVzQixRQUFGLEVBQVlDLEtBQVosQ0FBa0IsWUFBVztBQUN6QjtBQUNBLFFBQUlDLFVBQVVDLFFBQVFDLFFBQVIsQ0FBaUIsd0JBQWpCLENBQWQ7QUFDQSxRQUFJQyxjQUFjLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0MsTUFBcEMsQ0FBbEI7QUFDQWxDLGVBQVdDLElBQVgsQ0FBZ0JFLEdBQWhCLENBQW9CZ0MsZ0JBQWdCQyxXQUFoQixDQUE0QkwsT0FBNUIsRUFBcUNHLFdBQXJDLENBQXBCLEVBQXVFNUIsSUFBdkU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBQyxNQUFFLHdCQUFGLEVBQTRCOEIsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyREgsd0JBQWdCSSxpQkFBaEIsQ0FBa0NoQyxFQUFFLHNCQUFGLENBQWxDLEVBQTZEMkIsV0FBN0Q7QUFDSCxLQUZEOztBQUlBO0FBQ0EzQixNQUFFLHNCQUFGLEVBQTBCaUMsS0FBMUIsQ0FBZ0MsWUFBWTtBQUN4QyxZQUFJckMsTUFBTWdDLGdCQUFnQkMsV0FBaEIsQ0FBNEJMLE9BQTVCLEVBQXFDRyxXQUFyQyxDQUFWOztBQUVBLFlBQUkvQixRQUFRSCxXQUFXQyxJQUFYLENBQWdCRSxHQUFoQixFQUFaLEVBQW1DO0FBQy9CSCx1QkFBV0MsSUFBWCxDQUFnQkUsR0FBaEIsQ0FBb0JBLEdBQXBCLEVBQXlCRyxJQUF6QjtBQUNIO0FBQ0osS0FORDtBQU9ILENBdEJELEUiLCJmaWxlIjoiaGVyby1sb2FkZXIuMTY5MDc5MTczODk2NmZiYmE2MzQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYTFjYWIwN2VjNjFjOWQxZjkzMDQiLCIvL3Byb2Nlc3Npbmc6ICc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPidcclxuXHJcbi8qXHJcbiAqIEhlcm8gTG9hZGVyXHJcbiAqIEhhbmRsZXMgcmV0cmlldmluZyBoZXJvIGRhdGEgdGhyb3VnaCBhamF4IHJlcXVlc3RzIGJhc2VkIG9uIHN0YXRlIG9mIGZpbHRlcnNcclxuICovXHJcbmxldCBIZXJvTG9hZGVyID0ge307XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIEFqYXggcmVxdWVzdHNcclxuICovXHJcbkhlcm9Mb2FkZXIuYWpheCA9IHtcclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgKiBJZiBzdXBwbGllZCBhIHVybCB3aWxsIHNldCB0aGUgYWpheCB1cmwgdG8gdGhlIGdpdmVuIHVybCwgYW5kIHRoZW4gcmV0dXJuIHRoZSBhamF4IG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1cmwgdGhlIGFqYXggb2JqZWN0IGlzIHNldCB0byByZXF1ZXN0IGZyb20uXHJcbiAgICAgKi9cclxuICAgIHVybDogZnVuY3Rpb24odXJsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW50ZXJuYWwudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAqIFJlbG9hZHMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGludGVybmFsIHVybCwgbG9va2luZyBmb3IgZGF0YSBpbiB0aGUgY3VycmVudCBpbnRlcm5hbCBkYXRhU3JjIGZpZWxkLlxyXG4gICAgICogUmV0dXJucyB0aGUgYWpheCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gSGVyb0xvYWRlci5hamF4O1xyXG5cclxuICAgICAgICAvL0VuYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG5cclxuICAgICAgICAvL0FqYXggUmVxdWVzdFxyXG4gICAgICAgICQuZ2V0SlNPTihzZWxmLmludGVybmFsLnVybClcclxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oanNvblJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IEhlcm9Mb2FkZXIuZGF0YTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhX2hlcm9kYXRhID0gZGF0YS5oZXJvZGF0YTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhX3N0YXRzID0gZGF0YS5zdGF0cztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQganNvbiA9IGpzb25SZXNwb25zZVtzZWxmLmludGVybmFsLmRhdGFTcmNdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25faGVyb2RhdGEgPSBqc29uWydoZXJvZGF0YSddO1xyXG4gICAgICAgICAgICAgICAgbGV0IGpzb25fc3RhdHMgPSBqc29uWydzdGF0cyddO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgKiBIZXJvZGF0YVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAvL2ltYWdlX2hlcm9cclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEuaW1hZ2VfaGVybyhqc29uX2hlcm9kYXRhWydpbWFnZV9oZXJvJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgICAgICAgICBkYXRhX2hlcm9kYXRhLm5hbWUoanNvbl9oZXJvZGF0YVsnbmFtZSddKTtcclxuICAgICAgICAgICAgICAgIC8vdGl0bGVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEudGl0bGUoanNvbl9oZXJvZGF0YVsndGl0bGUnXSk7XHJcbiAgICAgICAgICAgICAgICAvL3RhZ2xpbmVcclxuICAgICAgICAgICAgICAgIGRhdGFfaGVyb2RhdGEudGFnbGluZShqc29uX2hlcm9kYXRhWydkZXNjX3RhZ2xpbmUnXSk7XHJcbiAgICAgICAgICAgICAgICAvL2Jpb1xyXG4gICAgICAgICAgICAgICAgZGF0YV9oZXJvZGF0YS5iaW8oanNvbl9oZXJvZGF0YVsnZGVzY19iaW8nXSk7XHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRmFpbHVyZSB0byBsb2FkIERhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vRGlzYWJsZSBQcm9jZXNzaW5nIEluZGljYXRvclxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBIYW5kbGVzIGJpbmRpbmcgZGF0YSB0byB0aGUgcGFnZVxyXG4gKi9cclxuSGVyb0xvYWRlci5kYXRhID0ge1xyXG4gICAgaGVyb2RhdGE6IHtcclxuICAgICAgICBuYW1lOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLW5hbWUnKS50ZXh0KHZhbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS10aXRsZScpLnRleHQodmFsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhZ2xpbmU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAkKCcjaGwtaGVyb2RhdGEtZGVzYy10YWdsaW5lJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmlvOiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgJCgnI2hsLWhlcm9kYXRhLWRlc2MtYmlvJykudGV4dCh2YWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2VfaGVybzogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICQoJyNobC1oZXJvZGF0YS1pbWFnZS1oZXJvJykuYXR0cignc3JjJywgdmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc3RhdHM6IHtcclxuXHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvL1NldCB0aGUgaW5pdGlhbCB1cmwgYmFzZWQgb24gZGVmYXVsdCBmaWx0ZXJzXHJcbiAgICBsZXQgYmFzZVVybCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX3BhZ2VkYXRhX2hlcm8nKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImhlcm9cIiwgXCJnYW1lVHlwZVwiLCBcIm1hcFwiLCBcInJhbmtcIiwgXCJkYXRlXCJdO1xyXG4gICAgSGVyb0xvYWRlci5hamF4LnVybChIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpKS5sb2FkKCk7XHJcblxyXG4gICAgLy9HZXQgdGhlIGRhdGF0YWJsZSBvYmplY3RcclxuICAgIC8vbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxuXHJcbiAgICAvL1RyYWNrIGZpbHRlciBjaGFuZ2VzIGFuZCB2YWxpZGF0ZVxyXG4gICAgJCgnc2VsZWN0LmZpbHRlci1zZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycygkKCdidXR0b24uZmlsdGVyLWJ1dHRvbicpLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0NhbGN1bGF0ZSBuZXcgdXJsIGJhc2VkIG9uIGZpbHRlcnMgYW5kIGxvYWQgaXQsIG9ubHkgaWYgdGhlIHVybCBoYXMgY2hhbmdlZFxyXG4gICAgJCgnYnV0dG9uLmZpbHRlci1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgICAgIGlmICh1cmwgIT09IEhlcm9Mb2FkZXIuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICBIZXJvTG9hZGVyLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyby1sb2FkZXIuanMiXSwic291cmNlUm9vdCI6IiJ9