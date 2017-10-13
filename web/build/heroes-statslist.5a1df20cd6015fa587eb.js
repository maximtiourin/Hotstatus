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

heroes_statslist.columns = [{ "width": 50, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": 100, "responsivePriority": 2 }, { "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Win %', "searchable": false, "responsivePriority": 3 }, { "title": 'Play %', "searchable": false, "responsivePriority": 4 }, { "title": 'Ban %', "searchable": false, "responsivePriority": 5 }, { "title": 'Win Delta %', "searchable": false, "responsivePriority": 6 }];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNGI0YWJhNDcyOGNmZGE4MTFjYmEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImRhdGEiLCJpIiwiaGVyb2RhdGFfaGVyb2VzIiwibGVuZ3RoIiwiaGVybyIsInB1c2giLCJoZXJvZGF0YV9pbWFnZXBhdGgiLCJjb2x1bW5zIiwib3JkZXIiLCJwcm9jZXNzaW5nIiwiZGVmZXJSZW5kZXIiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsIkRhdGFUYWJsZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQUlBLG1CQUFtQixFQUF2Qjs7QUFFQUEsaUJBQWlCQyxJQUFqQixHQUF3QixFQUF4Qjs7QUFFQSxLQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUMsZ0JBQWdCQyxNQUFwQyxFQUE0Q0YsR0FBNUMsRUFBaUQ7QUFDN0MsUUFBSUcsT0FBT0YsZ0JBQWdCRCxDQUFoQixDQUFYO0FBQ0FGLHFCQUFpQkMsSUFBakIsQ0FBc0JLLElBQXRCLENBQ0ksQ0FDSSxlQUFlQyxrQkFBZixHQUFvQ0YsS0FBSyxZQUFMLENBQXBDLEdBQXlELG1DQUQ3RCxFQUVJQSxLQUFLLE1BQUwsQ0FGSixFQUdJQSxLQUFLLGVBQUwsQ0FISixFQUlJQSxLQUFLLGVBQUwsQ0FKSixFQUtJLENBTEosRUFNSSxDQU5KLEVBT0ksQ0FQSixFQVFJLENBUkosQ0FESjtBQVlIOztBQUVEOzs7Ozs7OztBQVFBTCxpQkFBaUJRLE9BQWpCLEdBQTJCLENBQ3ZCLEVBQUMsU0FBUyxFQUFWLEVBQWMsY0FBYyxLQUE1QixFQUFtQyxzQkFBc0IsQ0FBekQsRUFEdUIsRUFFdkIsRUFBQyxTQUFTLE1BQVYsRUFBa0IsU0FBUyxHQUEzQixFQUFnQyxzQkFBc0IsQ0FBdEQsRUFGdUIsRUFHdkIsRUFBQyxTQUFTLFdBQVYsRUFBdUIsV0FBVyxLQUFsQyxFQUh1QixFQUl2QixFQUFDLFNBQVMsTUFBVixFQUFrQixXQUFXLEtBQTdCLEVBSnVCLEVBS3ZCLEVBQUMsU0FBUyxlQUFWLEVBQTJCLFdBQVcsS0FBdEMsRUFMdUIsRUFNdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsY0FBYyxLQUFqQyxFQUF3QyxzQkFBc0IsQ0FBOUQsRUFOdUIsRUFPdkIsRUFBQyxTQUFTLFFBQVYsRUFBb0IsY0FBYyxLQUFsQyxFQUF5QyxzQkFBc0IsQ0FBL0QsRUFQdUIsRUFRdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsY0FBYyxLQUFqQyxFQUF3QyxzQkFBc0IsQ0FBOUQsRUFSdUIsRUFTdkIsRUFBQyxTQUFTLGFBQVYsRUFBeUIsY0FBYyxLQUF2QyxFQUE2QyxzQkFBc0IsQ0FBbkUsRUFUdUIsQ0FBM0I7O0FBWUFSLGlCQUFpQlMsS0FBakIsR0FBeUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxLQUFKLENBQUQsQ0FBekI7O0FBRUFULGlCQUFpQlUsVUFBakIsR0FBOEIsSUFBOUI7QUFDQVYsaUJBQWlCVyxXQUFqQixHQUErQixJQUEvQjtBQUNBO0FBQ0FYLGlCQUFpQlksTUFBakIsR0FBMEIsS0FBMUI7QUFDQVosaUJBQWlCYSxVQUFqQixHQUE4QixJQUE5QjtBQUNBYixpQkFBaUJjLE9BQWpCLEdBQTJCLEtBQTNCO0FBQ0FkLGlCQUFpQmUsT0FBakIsR0FBMkIsS0FBM0I7O0FBRUFDLEVBQUVDLFFBQUYsRUFBWUMsS0FBWixDQUFrQixZQUFXO0FBQ3pCRixNQUFFLFlBQUYsRUFBZ0JHLFNBQWhCLENBQTBCbkIsZ0JBQTFCO0FBQ0gsQ0FGRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuNWExZGYyMGNkNjAxNWZhNTg3ZWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA0YjRhYmE0NzI4Y2ZkYTgxMWNiYSIsInZhciBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXTtcclxuXHJcbmZvciAodmFyIGkgPSAwOyBpIDwgaGVyb2RhdGFfaGVyb2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaGVybyA9IGhlcm9kYXRhX2hlcm9lc1tpXTtcclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZGF0YS5wdXNoKFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgJzxpbWcgc3JjPVwiJyArIGhlcm9kYXRhX2ltYWdlcGF0aCArIGhlcm9bJ2ltYWdlX2hlcm8nXSArICcucG5nXCIgd2lkdGg9XCI0MHB4XCIgaGVpZ2h0PVwiNDBweFwiPicsXHJcbiAgICAgICAgICAgIGhlcm9bJ25hbWUnXSxcclxuICAgICAgICAgICAgaGVyb1sncm9sZV9ibGl6emFyZCddLFxyXG4gICAgICAgICAgICBoZXJvWydyb2xlX3NwZWNpZmljJ10sXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDVcclxuICAgICAgICBdXHJcbiAgICApO1xyXG59XHJcblxyXG4vKmhlcm9lc19zdGF0c2xpc3QuZGF0YSA9IFtcclxuICAgIFsnQWJhdGh1cicsICAgICAnVXRpbGl0eScsICA0OC44OSwgICAxNS4zNCwgIDEuMzQsICAgIC0uNDldLFxyXG4gICAgWydUeXJhbmRlJywgICAgICdTdXBwb3J0JywgIDUyLjM0LCAgIDIxLjEyLCAgMTYuNzMsICAgNC44Ml0sXHJcbiAgICBbJ0toYXJhemltJywgICAgJ0hlYWxlcicsICAgNTEuNDUsICAgMTIuODMsICA0LjkyLCAgICAxLjM0XSxcclxuICAgIFsnTGkgTGknLCAgICAgICAnSGVhbGVyJywgICA1My42MiwgICAxOC43OCwgIDguMTQsICAgIC44OV0sXHJcbiAgICBbJ0RpYWJsbycsICAgICAgJ1RhbmsnLCAgICAgNTcuMTAsICAgOS4xOCwgICAyLjE2LCAgICAzLjE0XVxyXG5dOyovXHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7XCJ3aWR0aFwiOiA1MCwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvJywgXCJ3aWR0aFwiOiAxMDAsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDJ9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luICUnLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDN9LFxyXG4gICAge1widGl0bGVcIjogJ1BsYXkgJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNH0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnQmFuICUnLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDV9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBEZWx0YSAlJywgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDZ9XHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0Lm9yZGVyID0gW1swLCAnYXNjJ11dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuaGVyb2VzX3N0YXRzbGlzdC5kZWZlclJlbmRlciA9IHRydWU7XHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7XHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7XHJcbmhlcm9lc19zdGF0c2xpc3QucmVzcG9uc2l2ZSA9IHRydWU7XHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlO1xyXG5oZXJvZXNfc3RhdHNsaXN0LnNjcm9sbFkgPSBmYWxzZTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9