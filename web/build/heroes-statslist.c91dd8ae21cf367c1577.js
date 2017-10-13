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
heroes_statslist.deferRender = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDI1ZDViOGVkMDA1ZDhkYzVjZDUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImRhdGEiLCJpIiwiaGVyb2RhdGFfaGVyb2VzIiwibGVuZ3RoIiwiaGVybyIsInB1c2giLCJoZXJvZGF0YV9pbWFnZXBhdGgiLCJjb2x1bW5zIiwib3JkZXIiLCJwcm9jZXNzaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsIkRhdGFUYWJsZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQUlBLG1CQUFtQixFQUF2Qjs7QUFFQUEsaUJBQWlCQyxJQUFqQixHQUF3QixFQUF4Qjs7QUFFQSxLQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUMsZ0JBQWdCQyxNQUFwQyxFQUE0Q0YsR0FBNUMsRUFBaUQ7QUFDN0MsUUFBSUcsT0FBT0YsZ0JBQWdCRCxDQUFoQixDQUFYO0FBQ0FGLHFCQUFpQkMsSUFBakIsQ0FBc0JLLElBQXRCLENBQ0ksQ0FDSSxlQUFlQyxrQkFBZixHQUFvQ0YsS0FBSyxZQUFMLENBQXBDLEdBQXlELG1DQUQ3RCxFQUVJQSxLQUFLLE1BQUwsQ0FGSixFQUdJQSxLQUFLLGVBQUwsQ0FISixFQUlJQSxLQUFLLGVBQUwsQ0FKSixFQUtJLENBTEosRUFNSSxDQU5KLEVBT0ksQ0FQSixFQVFJLENBUkosQ0FESjtBQVlIOztBQUVEOzs7Ozs7OztBQVFBTCxpQkFBaUJRLE9BQWpCLEdBQTJCLENBQ3ZCLEVBQUMsU0FBUyxFQUFWLEVBQWMsY0FBYyxLQUE1QixFQUFtQyxzQkFBc0IsQ0FBekQsRUFEdUIsRUFFdkIsRUFBQyxTQUFTLE1BQVYsRUFBa0IsU0FBUyxHQUEzQixFQUFnQyxzQkFBc0IsQ0FBdEQsRUFGdUIsRUFHdkIsRUFBQyxTQUFTLE1BQVYsRUFBa0IsV0FBVyxLQUE3QixFQUh1QixFQUl2QixFQUFDLFNBQVMsZUFBVixFQUEyQixXQUFXLEtBQXRDLEVBSnVCLEVBS3ZCLEVBQUMsU0FBUyxPQUFWLEVBQW1CLHNCQUFzQixDQUF6QyxFQUx1QixFQU12QixFQUFDLFNBQVMsUUFBVixFQUFvQixzQkFBc0IsQ0FBMUMsRUFOdUIsRUFPdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsc0JBQXNCLENBQXpDLEVBUHVCLEVBUXZCLEVBQUMsU0FBUyxhQUFWLEVBQXlCLHNCQUFzQixDQUEvQyxFQVJ1QixDQUEzQjs7QUFXQVIsaUJBQWlCUyxLQUFqQixHQUF5QixDQUFDLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FBRCxDQUF6Qjs7QUFFQVQsaUJBQWlCVSxVQUFqQixHQUE4QixJQUE5QjtBQUNBVixpQkFBaUJXLFdBQWpCLEdBQStCLElBQS9CO0FBQ0E7QUFDQVgsaUJBQWlCWSxNQUFqQixHQUEwQixLQUExQjtBQUNBWixpQkFBaUJhLFVBQWpCLEdBQThCLElBQTlCO0FBQ0FiLGlCQUFpQmMsT0FBakIsR0FBMkIsS0FBM0I7QUFDQWQsaUJBQWlCZSxPQUFqQixHQUEyQixLQUEzQjs7QUFFQUMsRUFBRUMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJGLE1BQUUsWUFBRixFQUFnQkcsU0FBaEIsQ0FBMEJuQixnQkFBMUI7QUFDSCxDQUZELEUiLCJmaWxlIjoiaGVyb2VzLXN0YXRzbGlzdC5jOTFkZDhhZTIxY2YzNjdjMTU3Ny5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDAyNWQ1YjhlZDAwNWQ4ZGM1Y2Q1IiwidmFyIGhlcm9lc19zdGF0c2xpc3QgPSB7fTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuZGF0YSA9IFtdO1xyXG5cclxuZm9yICh2YXIgaSA9IDA7IGkgPCBoZXJvZGF0YV9oZXJvZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBoZXJvID0gaGVyb2RhdGFfaGVyb2VzW2ldO1xyXG4gICAgaGVyb2VzX3N0YXRzbGlzdC5kYXRhLnB1c2goXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAnPGltZyBzcmM9XCInICsgaGVyb2RhdGFfaW1hZ2VwYXRoICsgaGVyb1snaW1hZ2VfaGVybyddICsgJy5wbmdcIiB3aWR0aD1cIjQwcHhcIiBoZWlnaHQ9XCI0MHB4XCI+JyxcclxuICAgICAgICAgICAgaGVyb1snbmFtZSddLFxyXG4gICAgICAgICAgICBoZXJvWydyb2xlX2JsaXp6YXJkJ10sXHJcbiAgICAgICAgICAgIGhlcm9bJ3JvbGVfc3BlY2lmaWMnXSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNVxyXG4gICAgICAgIF1cclxuICAgICk7XHJcbn1cclxuXHJcbi8qaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW1xyXG4gICAgWydBYmF0aHVyJywgICAgICdVdGlsaXR5JywgIDQ4Ljg5LCAgIDE1LjM0LCAgMS4zNCwgICAgLS40OV0sXHJcbiAgICBbJ1R5cmFuZGUnLCAgICAgJ1N1cHBvcnQnLCAgNTIuMzQsICAgMjEuMTIsICAxNi43MywgICA0LjgyXSxcclxuICAgIFsnS2hhcmF6aW0nLCAgICAnSGVhbGVyJywgICA1MS40NSwgICAxMi44MywgIDQuOTIsICAgIDEuMzRdLFxyXG4gICAgWydMaSBMaScsICAgICAgICdIZWFsZXInLCAgIDUzLjYyLCAgIDE4Ljc4LCAgOC4xNCwgICAgLjg5XSxcclxuICAgIFsnRGlhYmxvJywgICAgICAnVGFuaycsICAgICA1Ny4xMCwgICA5LjE4LCAgIDIuMTYsICAgIDMuMTRdXHJcbl07Ki9cclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHtcIndpZHRoXCI6IDUwLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IDEwMCwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMn0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luICUnLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAzfSxcclxuICAgIHtcInRpdGxlXCI6ICdQbGF5ICUnLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA0fSxcclxuICAgIHtcInRpdGxlXCI6ICdCYW4gJScsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDV9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBEZWx0YSAlJywgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNn1cclxuXTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3Qub3JkZXIgPSBbWzAsICdhc2MnXV07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LnByb2Nlc3NpbmcgPSB0cnVlO1xyXG5oZXJvZXNfc3RhdHNsaXN0LmRlZmVyUmVuZGVyID0gdHJ1ZTtcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wYWdpbmcgPSBmYWxzZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxYID0gZmFsc2U7XHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qcyJdLCJzb3VyY2VSb290IjoiIn0=