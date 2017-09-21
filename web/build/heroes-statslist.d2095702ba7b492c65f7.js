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

heroes_statslist.data = [['Abathur', 'Utility', 48.89, 15.34, 1.34, -.49], ['Tyrande', 'Support', 52.34, 21.12, 16.73, 4.82], ['Kharazim', 'Healer', 51.45, 12.83, 4.92, 1.34], ['Li Li', 'Healer', 53.62, 18.78, 8.14, .89], ['Diablo', 'Tank', 57.10, 9.18, 2.16, 3.14]];

heroes_statslist.columns = [{ title: 'Hero' }, { title: 'Role' }, { title: 'Win %' }, { title: 'Play %' }, { title: 'Ban %' }, { title: 'Win Delta %' }];

heroes_statslist.order = [[0, 'asc']];

$(document).ready(function () {
    $('#hsl-table').DataTable(heroes_statslist);
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjc0MzBhYTNlZDJjM2ZmMDhlZWEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImRhdGEiLCJjb2x1bW5zIiwidGl0bGUiLCJvcmRlciIsIiQiLCJkb2N1bWVudCIsInJlYWR5IiwiRGF0YVRhYmxlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REEsSUFBSUEsbUJBQW1CLEVBQXZCOztBQUVBQSxpQkFBaUJDLElBQWpCLEdBQXdCLENBQ3BCLENBQUMsU0FBRCxFQUFnQixTQUFoQixFQUE0QixLQUE1QixFQUFxQyxLQUFyQyxFQUE2QyxJQUE3QyxFQUFzRCxDQUFDLEdBQXZELENBRG9CLEVBRXBCLENBQUMsU0FBRCxFQUFnQixTQUFoQixFQUE0QixLQUE1QixFQUFxQyxLQUFyQyxFQUE2QyxLQUE3QyxFQUFzRCxJQUF0RCxDQUZvQixFQUdwQixDQUFDLFVBQUQsRUFBZ0IsUUFBaEIsRUFBNEIsS0FBNUIsRUFBcUMsS0FBckMsRUFBNkMsSUFBN0MsRUFBc0QsSUFBdEQsQ0FIb0IsRUFJcEIsQ0FBQyxPQUFELEVBQWdCLFFBQWhCLEVBQTRCLEtBQTVCLEVBQXFDLEtBQXJDLEVBQTZDLElBQTdDLEVBQXNELEdBQXRELENBSm9CLEVBS3BCLENBQUMsUUFBRCxFQUFnQixNQUFoQixFQUE0QixLQUE1QixFQUFxQyxJQUFyQyxFQUE2QyxJQUE3QyxFQUFzRCxJQUF0RCxDQUxvQixDQUF4Qjs7QUFRQUQsaUJBQWlCRSxPQUFqQixHQUEyQixDQUN2QixFQUFDQyxPQUFPLE1BQVIsRUFEdUIsRUFFdkIsRUFBQ0EsT0FBTyxNQUFSLEVBRnVCLEVBR3ZCLEVBQUNBLE9BQU8sT0FBUixFQUh1QixFQUl2QixFQUFDQSxPQUFPLFFBQVIsRUFKdUIsRUFLdkIsRUFBQ0EsT0FBTyxPQUFSLEVBTHVCLEVBTXZCLEVBQUNBLE9BQU8sYUFBUixFQU51QixDQUEzQjs7QUFTQUgsaUJBQWlCSSxLQUFqQixHQUF5QixDQUFDLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FBRCxDQUF6Qjs7QUFFQUMsRUFBRUMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJGLE1BQUUsWUFBRixFQUFnQkcsU0FBaEIsQ0FBMEJSLGdCQUExQjtBQUNILENBRkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LmQyMDk1NzAyYmE3YjQ5MmM2NWY3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZjc0MzBhYTNlZDJjM2ZmMDhlZWEiLCJ2YXIgaGVyb2VzX3N0YXRzbGlzdCA9IHt9O1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW1xyXG4gICAgWydBYmF0aHVyJywgICAgICdVdGlsaXR5JywgIDQ4Ljg5LCAgIDE1LjM0LCAgMS4zNCwgICAgLS40OV0sXHJcbiAgICBbJ1R5cmFuZGUnLCAgICAgJ1N1cHBvcnQnLCAgNTIuMzQsICAgMjEuMTIsICAxNi43MywgICA0LjgyXSxcclxuICAgIFsnS2hhcmF6aW0nLCAgICAnSGVhbGVyJywgICA1MS40NSwgICAxMi44MywgIDQuOTIsICAgIDEuMzRdLFxyXG4gICAgWydMaSBMaScsICAgICAgICdIZWFsZXInLCAgIDUzLjYyLCAgIDE4Ljc4LCAgOC4xNCwgICAgLjg5XSxcclxuICAgIFsnRGlhYmxvJywgICAgICAnVGFuaycsICAgICA1Ny4xMCwgICA5LjE4LCAgIDIuMTYsICAgIDMuMTRdXHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7dGl0bGU6ICdIZXJvJ30sXHJcbiAgICB7dGl0bGU6ICdSb2xlJ30sXHJcbiAgICB7dGl0bGU6ICdXaW4gJSd9LFxyXG4gICAge3RpdGxlOiAnUGxheSAlJ30sXHJcbiAgICB7dGl0bGU6ICdCYW4gJSd9LFxyXG4gICAge3RpdGxlOiAnV2luIERlbHRhICUnfVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbMCwgJ2FzYyddXTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9