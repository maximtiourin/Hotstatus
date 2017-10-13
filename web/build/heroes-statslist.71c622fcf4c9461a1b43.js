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

/*heroes_statslist.data = [];

for (var i = 0; i < herodata_heroes.length; i++) {
    var hero = herodata_heroes[i];
    heroes_statslist.data.push(
        [
            '<img src="' + herodata_imagepath + hero['image_hero'] + '.png" width="40px" height="40px">',
            hero['name'],
            hero['role_blizzard'],
            hero['role_specific'],
            5,
            5,
            5,
            5
        ]
    );
}*/

/*heroes_statslist.data = [
    ['Abathur',     'Utility',  48.89,   15.34,  1.34,    -.49],
    ['Tyrande',     'Support',  52.34,   21.12,  16.73,   4.82],
    ['Kharazim',    'Healer',   51.45,   12.83,  4.92,    1.34],
    ['Li Li',       'Healer',   53.62,   18.78,  8.14,    .89],
    ['Diablo',      'Tank',     57.10,   9.18,   2.16,    3.14]
];*/

heroes_statslist.columns = [{ "width": 50, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": 100, "responsivePriority": 2 }, { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Win %', "searchable": false, "responsivePriority": 3 }, { "title": 'Play %', "searchable": false, "responsivePriority": 4 }, { "title": 'Ban %', "searchable": false, "responsivePriority": 5 }, { "title": 'Win Delta %', "searchable": false, "responsivePriority": 6 }];

heroes_statslist.order = [[0, 'asc']];
heroes_statslist.processing = true;
heroes_statslist.deferRender = true;
heroes_statslist.ajax = herodata_heroes_path;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGFmYzYyOTQ4NzRjM2FmMWU0YzgiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsInByb2Nlc3NpbmciLCJkZWZlclJlbmRlciIsImFqYXgiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsIiQiLCJkb2N1bWVudCIsInJlYWR5IiwiRGF0YVRhYmxlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REEsSUFBSUEsbUJBQW1CLEVBQXZCOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7Ozs7Ozs7O0FBUUFBLGlCQUFpQkMsT0FBakIsR0FBMkIsQ0FDdkIsRUFBQyxTQUFTLEVBQVYsRUFBYyxjQUFjLEtBQTVCLEVBQW1DLHNCQUFzQixDQUF6RCxFQUR1QixFQUV2QixFQUFDLFNBQVMsTUFBVixFQUFrQixTQUFTLEdBQTNCLEVBQWdDLHNCQUFzQixDQUF0RCxFQUZ1QixFQUd2QixFQUFDLFNBQVMsV0FBVixFQUF1QixXQUFXLEtBQWxDLEVBSHVCLEVBSXZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFdBQVcsS0FBN0IsRUFKdUIsRUFLdkIsRUFBQyxTQUFTLGVBQVYsRUFBMkIsV0FBVyxLQUF0QyxFQUx1QixFQU12QixFQUFDLFNBQVMsT0FBVixFQUFtQixjQUFjLEtBQWpDLEVBQXdDLHNCQUFzQixDQUE5RCxFQU51QixFQU92QixFQUFDLFNBQVMsUUFBVixFQUFvQixjQUFjLEtBQWxDLEVBQXlDLHNCQUFzQixDQUEvRCxFQVB1QixFQVF2QixFQUFDLFNBQVMsT0FBVixFQUFtQixjQUFjLEtBQWpDLEVBQXdDLHNCQUFzQixDQUE5RCxFQVJ1QixFQVN2QixFQUFDLFNBQVMsYUFBVixFQUF5QixjQUFjLEtBQXZDLEVBQTZDLHNCQUFzQixDQUFuRSxFQVR1QixDQUEzQjs7QUFZQUQsaUJBQWlCRSxLQUFqQixHQUF5QixDQUFDLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FBRCxDQUF6QjtBQUNBRixpQkFBaUJHLFVBQWpCLEdBQThCLElBQTlCO0FBQ0FILGlCQUFpQkksV0FBakIsR0FBK0IsSUFBL0I7QUFDQUosaUJBQWlCSyxJQUFqQixHQUF3QkMsb0JBQXhCO0FBQ0E7QUFDQU4saUJBQWlCTyxNQUFqQixHQUEwQixLQUExQjtBQUNBUCxpQkFBaUJRLFVBQWpCLEdBQThCLElBQTlCO0FBQ0FSLGlCQUFpQlMsT0FBakIsR0FBMkIsS0FBM0I7QUFDQVQsaUJBQWlCVSxPQUFqQixHQUEyQixLQUEzQjs7QUFFQUMsRUFBRUMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJGLE1BQUUsWUFBRixFQUFnQkcsU0FBaEIsQ0FBMEJkLGdCQUExQjtBQUNILENBRkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjcxYzYyMmZjZjRjOTQ2MWExYjQzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZGFmYzYyOTQ4NzRjM2FmMWU0YzgiLCJ2YXIgaGVyb2VzX3N0YXRzbGlzdCA9IHt9O1xyXG5cclxuLypoZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXTtcclxuXHJcbmZvciAodmFyIGkgPSAwOyBpIDwgaGVyb2RhdGFfaGVyb2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaGVybyA9IGhlcm9kYXRhX2hlcm9lc1tpXTtcclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZGF0YS5wdXNoKFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgJzxpbWcgc3JjPVwiJyArIGhlcm9kYXRhX2ltYWdlcGF0aCArIGhlcm9bJ2ltYWdlX2hlcm8nXSArICcucG5nXCIgd2lkdGg9XCI0MHB4XCIgaGVpZ2h0PVwiNDBweFwiPicsXHJcbiAgICAgICAgICAgIGhlcm9bJ25hbWUnXSxcclxuICAgICAgICAgICAgaGVyb1sncm9sZV9ibGl6emFyZCddLFxyXG4gICAgICAgICAgICBoZXJvWydyb2xlX3NwZWNpZmljJ10sXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDVcclxuICAgICAgICBdXHJcbiAgICApO1xyXG59Ki9cclxuXHJcbi8qaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW1xyXG4gICAgWydBYmF0aHVyJywgICAgICdVdGlsaXR5JywgIDQ4Ljg5LCAgIDE1LjM0LCAgMS4zNCwgICAgLS40OV0sXHJcbiAgICBbJ1R5cmFuZGUnLCAgICAgJ1N1cHBvcnQnLCAgNTIuMzQsICAgMjEuMTIsICAxNi43MywgICA0LjgyXSxcclxuICAgIFsnS2hhcmF6aW0nLCAgICAnSGVhbGVyJywgICA1MS40NSwgICAxMi44MywgIDQuOTIsICAgIDEuMzRdLFxyXG4gICAgWydMaSBMaScsICAgICAgICdIZWFsZXInLCAgIDUzLjYyLCAgIDE4Ljc4LCAgOC4xNCwgICAgLjg5XSxcclxuICAgIFsnRGlhYmxvJywgICAgICAnVGFuaycsICAgICA1Ny4xMCwgICA5LjE4LCAgIDIuMTYsICAgIDMuMTRdXHJcbl07Ki9cclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHtcIndpZHRoXCI6IDUwLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IDEwMCwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMn0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdXaW4gJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogM30sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUGxheSAlJywgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA0fSxcclxuICAgIHtcInRpdGxlXCI6ICdCYW4gJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luIERlbHRhICUnLCBcInNlYXJjaGFibGVcIjogZmFsc2UsXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNn1cclxuXTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3Qub3JkZXIgPSBbWzAsICdhc2MnXV07XHJcbmhlcm9lc19zdGF0c2xpc3QucHJvY2Vzc2luZyA9IHRydWU7XHJcbmhlcm9lc19zdGF0c2xpc3QuZGVmZXJSZW5kZXIgPSB0cnVlO1xyXG5oZXJvZXNfc3RhdHNsaXN0LmFqYXggPSBoZXJvZGF0YV9oZXJvZXNfcGF0aDtcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wYWdpbmcgPSBmYWxzZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxYID0gZmFsc2U7XHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qcyJdLCJzb3VyY2VSb290IjoiIn0=