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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/heroes-statslist.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/heroes-statslist.js":
/*!***************************************!*\
  !*** ./assets/js/heroes-statslist.js ***!
  \***************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var heroes_statslist = {};

heroes_statslist.data = [];

for (var i = 0; i < herodata_heroes.length; i++) {
    var hero = herodata_heroes[i];
    heroes_statslist.data.push(['<img src="' + herodata_imagepath + hero['image_hero'] + '.png" width="40px" height="40px">', hero['name'], hero['role_blizzard'], hero['role_specific'], 5, 5, 5, 5]);
}

/*heroes_statslist.data = [
    ['Abathur',     'Utility',  48.89,   15.34,  1.34,    -.49],
    ['Tyrande',     'Support',  52.34,   21.12,  16.73,   4.82],
    ['Kharazim',    'Healer',   51.45,   12.83,  4.92,    1.34],
    ['Li Li',       'Healer',   53.62,   18.78,  8.14,    .89],
    ['Diablo',      'Tank',     57.10,   9.18,   2.16,    3.14]
];*/

heroes_statslist.columns = [{ "width": 50, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": 100, "responsivePriority": 2 }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Win %', "responsivePriority": 3 }, { "title": 'Play %', "responsivePriority": 4 }, { "title": 'Ban %', "responsivePriority": 5 }, { "title": 'Win Delta %', "responsivePriority": 6 }];

heroes_statslist.order = [[0, 'asc']];

heroes_statslist.processing = true;
//heroes_statslist.pageLength = 25;
heroes_statslist.paging = false;
heroes_statslist.responsive = true;
heroes_statslist.scrollX = false;
heroes_statslist.scrollY = false;

$(document).ready(function () {
    $('#hsl-table').DataTable(heroes_statslist);
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGRmMzRiYTFhZWU5MWM4MWYyZjYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImRhdGEiLCJpIiwiaGVyb2RhdGFfaGVyb2VzIiwibGVuZ3RoIiwiaGVybyIsInB1c2giLCJoZXJvZGF0YV9pbWFnZXBhdGgiLCJjb2x1bW5zIiwib3JkZXIiLCJwcm9jZXNzaW5nIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiJCIsImRvY3VtZW50IiwicmVhZHkiLCJEYXRhVGFibGUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQSxJQUFJQSxtQkFBbUIsRUFBdkI7O0FBRUFBLGlCQUFpQkMsSUFBakIsR0FBd0IsRUFBeEI7O0FBRUEsS0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLGdCQUFnQkMsTUFBcEMsRUFBNENGLEdBQTVDLEVBQWlEO0FBQzdDLFFBQUlHLE9BQU9GLGdCQUFnQkQsQ0FBaEIsQ0FBWDtBQUNBRixxQkFBaUJDLElBQWpCLENBQXNCSyxJQUF0QixDQUNJLENBQ0ksZUFBZUMsa0JBQWYsR0FBb0NGLEtBQUssWUFBTCxDQUFwQyxHQUF5RCxtQ0FEN0QsRUFFSUEsS0FBSyxNQUFMLENBRkosRUFHSUEsS0FBSyxlQUFMLENBSEosRUFJSUEsS0FBSyxlQUFMLENBSkosRUFLSSxDQUxKLEVBTUksQ0FOSixFQU9JLENBUEosRUFRSSxDQVJKLENBREo7QUFZSDs7QUFFRDs7Ozs7Ozs7QUFRQUwsaUJBQWlCUSxPQUFqQixHQUEyQixDQUN2QixFQUFDLFNBQVMsRUFBVixFQUFjLGNBQWMsS0FBNUIsRUFBbUMsc0JBQXNCLENBQXpELEVBRHVCLEVBRXZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFNBQVMsR0FBM0IsRUFBZ0Msc0JBQXNCLENBQXRELEVBRnVCLEVBR3ZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFdBQVcsS0FBN0IsRUFIdUIsRUFJdkIsRUFBQyxTQUFTLGVBQVYsRUFBMkIsV0FBVyxLQUF0QyxFQUp1QixFQUt2QixFQUFDLFNBQVMsT0FBVixFQUFtQixzQkFBc0IsQ0FBekMsRUFMdUIsRUFNdkIsRUFBQyxTQUFTLFFBQVYsRUFBb0Isc0JBQXNCLENBQTFDLEVBTnVCLEVBT3ZCLEVBQUMsU0FBUyxPQUFWLEVBQW1CLHNCQUFzQixDQUF6QyxFQVB1QixFQVF2QixFQUFDLFNBQVMsYUFBVixFQUF5QixzQkFBc0IsQ0FBL0MsRUFSdUIsQ0FBM0I7O0FBV0FSLGlCQUFpQlMsS0FBakIsR0FBeUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxLQUFKLENBQUQsQ0FBekI7O0FBRUFULGlCQUFpQlUsVUFBakIsR0FBOEIsSUFBOUI7QUFDQTtBQUNBVixpQkFBaUJXLE1BQWpCLEdBQTBCLEtBQTFCO0FBQ0FYLGlCQUFpQlksVUFBakIsR0FBOEIsSUFBOUI7QUFDQVosaUJBQWlCYSxPQUFqQixHQUEyQixLQUEzQjtBQUNBYixpQkFBaUJjLE9BQWpCLEdBQTJCLEtBQTNCOztBQUVBQyxFQUFFQyxRQUFGLEVBQVlDLEtBQVosQ0FBa0IsWUFBVztBQUN6QkYsTUFBRSxZQUFGLEVBQWdCRyxTQUFoQixDQUEwQmxCLGdCQUExQjtBQUNILENBRkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjNhY2FhY2JkYTcyOWFhNWNkYjg5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZGRmMzRiYTFhZWU5MWM4MWYyZjYiLCJ2YXIgaGVyb2VzX3N0YXRzbGlzdCA9IHt9O1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW107XHJcblxyXG5mb3IgKHZhciBpID0gMDsgaSA8IGhlcm9kYXRhX2hlcm9lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGhlcm8gPSBoZXJvZGF0YV9oZXJvZXNbaV07XHJcbiAgICBoZXJvZXNfc3RhdHNsaXN0LmRhdGEucHVzaChcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgICc8aW1nIHNyYz1cIicgKyBoZXJvZGF0YV9pbWFnZXBhdGggKyBoZXJvWydpbWFnZV9oZXJvJ10gKyAnLnBuZ1wiIHdpZHRoPVwiNDBweFwiIGhlaWdodD1cIjQwcHhcIj4nLFxyXG4gICAgICAgICAgICBoZXJvWyduYW1lJ10sXHJcbiAgICAgICAgICAgIGhlcm9bJ3JvbGVfYmxpenphcmQnXSxcclxuICAgICAgICAgICAgaGVyb1sncm9sZV9zcGVjaWZpYyddLFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1XHJcbiAgICAgICAgXVxyXG4gICAgKTtcclxufVxyXG5cclxuLypoZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXHJcbiAgICBbJ0FiYXRodXInLCAgICAgJ1V0aWxpdHknLCAgNDguODksICAgMTUuMzQsICAxLjM0LCAgICAtLjQ5XSxcclxuICAgIFsnVHlyYW5kZScsICAgICAnU3VwcG9ydCcsICA1Mi4zNCwgICAyMS4xMiwgIDE2LjczLCAgIDQuODJdLFxyXG4gICAgWydLaGFyYXppbScsICAgICdIZWFsZXInLCAgIDUxLjQ1LCAgIDEyLjgzLCAgNC45MiwgICAgMS4zNF0sXHJcbiAgICBbJ0xpIExpJywgICAgICAgJ0hlYWxlcicsICAgNTMuNjIsICAgMTguNzgsICA4LjE0LCAgICAuODldLFxyXG4gICAgWydEaWFibG8nLCAgICAgICdUYW5rJywgICAgIDU3LjEwLCAgIDkuMTgsICAgMi4xNiwgICAgMy4xNF1cclxuXTsqL1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5jb2x1bW5zID0gW1xyXG4gICAge1wid2lkdGhcIjogNTAsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVybycsIFwid2lkdGhcIjogMTAwLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAyfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdXaW4gJScsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDN9LFxyXG4gICAge1widGl0bGVcIjogJ1BsYXkgJScsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDR9LFxyXG4gICAge1widGl0bGVcIjogJ0JhbiAlJywgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luIERlbHRhICUnLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA2fVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbMCwgJ2FzYyddXTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3QucHJvY2Vzc2luZyA9IHRydWU7XHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7XHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7XHJcbmhlcm9lc19zdGF0c2xpc3QucmVzcG9uc2l2ZSA9IHRydWU7XHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlO1xyXG5oZXJvZXNfc3RhdHNsaXN0LnNjcm9sbFkgPSBmYWxzZTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9