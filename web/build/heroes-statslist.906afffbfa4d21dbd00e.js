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
    heroes_statslist.data.push(['<img src="' + herodata_imagepath + hero['image_hero'] + '.png" width="48px" height="48px">' + hero['name'], hero['role_specific'], 5, 5, 5, 5]);
}

/*heroes_statslist.data = [
    ['Abathur',     'Utility',  48.89,   15.34,  1.34,    -.49],
    ['Tyrande',     'Support',  52.34,   21.12,  16.73,   4.82],
    ['Kharazim',    'Healer',   51.45,   12.83,  4.92,    1.34],
    ['Li Li',       'Healer',   53.62,   18.78,  8.14,    .89],
    ['Diablo',      'Tank',     57.10,   9.18,   2.16,    3.14]
];*/

heroes_statslist.columns = [{ title: 'Hero' }, { title: 'Role' }, { title: 'Win %' }, { title: 'Play %' }, { title: 'Ban %' }, { title: 'Win Delta %' }];

heroes_statslist.order = [[0, 'asc']];

heroes_statslist.processing = true;
heroes_statslist.pageLength = 25;

$(document).ready(function () {
    $('#hsl-table').DataTable(heroes_statslist);
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTY0NDU0MTAwZTI1N2JhZDQxODUiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImRhdGEiLCJpIiwiaGVyb2RhdGFfaGVyb2VzIiwibGVuZ3RoIiwiaGVybyIsInB1c2giLCJoZXJvZGF0YV9pbWFnZXBhdGgiLCJjb2x1bW5zIiwidGl0bGUiLCJvcmRlciIsInByb2Nlc3NpbmciLCJwYWdlTGVuZ3RoIiwiJCIsImRvY3VtZW50IiwicmVhZHkiLCJEYXRhVGFibGUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQSxJQUFJQSxtQkFBbUIsRUFBdkI7O0FBRUFBLGlCQUFpQkMsSUFBakIsR0FBd0IsRUFBeEI7O0FBRUEsS0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLGdCQUFnQkMsTUFBcEMsRUFBNENGLEdBQTVDLEVBQWlEO0FBQzdDLFFBQUlHLE9BQU9GLGdCQUFnQkQsQ0FBaEIsQ0FBWDtBQUNBRixxQkFBaUJDLElBQWpCLENBQXNCSyxJQUF0QixDQUEyQixDQUFDLGVBQWVDLGtCQUFmLEdBQW9DRixLQUFLLFlBQUwsQ0FBcEMsR0FBeUQsbUNBQXpELEdBQStGQSxLQUFLLE1BQUwsQ0FBaEcsRUFBOEdBLEtBQUssZUFBTCxDQUE5RyxFQUFxSSxDQUFySSxFQUF3SSxDQUF4SSxFQUEySSxDQUEzSSxFQUE4SSxDQUE5SSxDQUEzQjtBQUNIOztBQUVEOzs7Ozs7OztBQVFBTCxpQkFBaUJRLE9BQWpCLEdBQTJCLENBQ3ZCLEVBQUNDLE9BQU8sTUFBUixFQUR1QixFQUV2QixFQUFDQSxPQUFPLE1BQVIsRUFGdUIsRUFHdkIsRUFBQ0EsT0FBTyxPQUFSLEVBSHVCLEVBSXZCLEVBQUNBLE9BQU8sUUFBUixFQUp1QixFQUt2QixFQUFDQSxPQUFPLE9BQVIsRUFMdUIsRUFNdkIsRUFBQ0EsT0FBTyxhQUFSLEVBTnVCLENBQTNCOztBQVNBVCxpQkFBaUJVLEtBQWpCLEdBQXlCLENBQUMsQ0FBQyxDQUFELEVBQUksS0FBSixDQUFELENBQXpCOztBQUVBVixpQkFBaUJXLFVBQWpCLEdBQThCLElBQTlCO0FBQ0FYLGlCQUFpQlksVUFBakIsR0FBOEIsRUFBOUI7O0FBRUFDLEVBQUVDLFFBQUYsRUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCRixNQUFFLFlBQUYsRUFBZ0JHLFNBQWhCLENBQTBCaEIsZ0JBQTFCO0FBQ0gsQ0FGRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuOTA2YWZmZmJmYTRkMjFkYmQwMGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAxNjQ0NTQxMDBlMjU3YmFkNDE4NSIsInZhciBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXTtcclxuXHJcbmZvciAodmFyIGkgPSAwOyBpIDwgaGVyb2RhdGFfaGVyb2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaGVybyA9IGhlcm9kYXRhX2hlcm9lc1tpXTtcclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZGF0YS5wdXNoKFsnPGltZyBzcmM9XCInICsgaGVyb2RhdGFfaW1hZ2VwYXRoICsgaGVyb1snaW1hZ2VfaGVybyddICsgJy5wbmdcIiB3aWR0aD1cIjQ4cHhcIiBoZWlnaHQ9XCI0OHB4XCI+JyArIGhlcm9bJ25hbWUnXSwgaGVyb1sncm9sZV9zcGVjaWZpYyddLCA1LCA1LCA1LCA1XSk7XHJcbn1cclxuXHJcbi8qaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW1xyXG4gICAgWydBYmF0aHVyJywgICAgICdVdGlsaXR5JywgIDQ4Ljg5LCAgIDE1LjM0LCAgMS4zNCwgICAgLS40OV0sXHJcbiAgICBbJ1R5cmFuZGUnLCAgICAgJ1N1cHBvcnQnLCAgNTIuMzQsICAgMjEuMTIsICAxNi43MywgICA0LjgyXSxcclxuICAgIFsnS2hhcmF6aW0nLCAgICAnSGVhbGVyJywgICA1MS40NSwgICAxMi44MywgIDQuOTIsICAgIDEuMzRdLFxyXG4gICAgWydMaSBMaScsICAgICAgICdIZWFsZXInLCAgIDUzLjYyLCAgIDE4Ljc4LCAgOC4xNCwgICAgLjg5XSxcclxuICAgIFsnRGlhYmxvJywgICAgICAnVGFuaycsICAgICA1Ny4xMCwgICA5LjE4LCAgIDIuMTYsICAgIDMuMTRdXHJcbl07Ki9cclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHt0aXRsZTogJ0hlcm8nfSxcclxuICAgIHt0aXRsZTogJ1JvbGUnfSxcclxuICAgIHt0aXRsZTogJ1dpbiAlJ30sXHJcbiAgICB7dGl0bGU6ICdQbGF5ICUnfSxcclxuICAgIHt0aXRsZTogJ0JhbiAlJ30sXHJcbiAgICB7dGl0bGU6ICdXaW4gRGVsdGEgJSd9XHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0Lm9yZGVyID0gW1swLCAnYXNjJ11dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==