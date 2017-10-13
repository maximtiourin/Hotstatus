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

heroes_statslist.order = [[0, 'asc']]; //The default ordering of the table on load => column 0 ascending
heroes_statslist.processing = false; //Displays an indicator whenever the table is processing data
heroes_statslist.deferRender = true; //Defers rendering the table until data starts coming in
heroes_statslist.ajax = herodata_heroes_path; //Requests data from the path
//heroes_statslist.pageLength = 25; //Controls how many rows per page
heroes_statslist.paging = false; //Controls whether or not the table is allowed to paginate data by page length
heroes_statslist.responsive = true; //Controls whether or not the table collapses responsively as need
heroes_statslist.scrollX = false; //Controls whether or not the table can create a horizontal scroll bar
heroes_statslist.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
heroes_statslist.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
heroes_statslist.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

$(document).ready(function () {
    $('#hsl-table').DataTable(heroes_statslist);

    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
        $('#hsl-table').DataTable().search($(this).val()).draw();
    });

    $('.hsl-rolebutton').click(function () {
        $('#hsl-table').DataTable().search($(this).attr("value")).draw();
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNWUxYmUzOWVmZmQzZTE0NzQ4ZjciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsInByb2Nlc3NpbmciLCJkZWZlclJlbmRlciIsImFqYXgiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsIkRhdGFUYWJsZSIsIm9uIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQUlBLG1CQUFtQixFQUF2Qjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOzs7Ozs7OztBQVFBQSxpQkFBaUJDLE9BQWpCLEdBQTJCLENBQ3ZCLEVBQUMsU0FBUyxFQUFWLEVBQWMsY0FBYyxLQUE1QixFQUFtQyxzQkFBc0IsQ0FBekQsRUFEdUIsRUFFdkIsRUFBQyxTQUFTLE1BQVYsRUFBa0IsU0FBUyxHQUEzQixFQUFnQyxzQkFBc0IsQ0FBdEQsRUFGdUIsRUFHdkIsRUFBQyxTQUFTLFdBQVYsRUFBdUIsV0FBVyxLQUFsQyxFQUh1QixFQUl2QixFQUFDLFNBQVMsTUFBVixFQUFrQixXQUFXLEtBQTdCLEVBSnVCLEVBS3ZCLEVBQUMsU0FBUyxlQUFWLEVBQTJCLFdBQVcsS0FBdEMsRUFMdUIsRUFNdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsY0FBYyxLQUFqQyxFQUF3QyxzQkFBc0IsQ0FBOUQsRUFOdUIsRUFPdkIsRUFBQyxTQUFTLFFBQVYsRUFBb0IsY0FBYyxLQUFsQyxFQUF5QyxzQkFBc0IsQ0FBL0QsRUFQdUIsRUFRdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsY0FBYyxLQUFqQyxFQUF3QyxzQkFBc0IsQ0FBOUQsRUFSdUIsRUFTdkIsRUFBQyxTQUFTLGFBQVYsRUFBeUIsY0FBYyxLQUF2QyxFQUE2QyxzQkFBc0IsQ0FBbkUsRUFUdUIsQ0FBM0I7O0FBWUFELGlCQUFpQkUsS0FBakIsR0FBeUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxLQUFKLENBQUQsQ0FBekIsQyxDQUF1QztBQUN2Q0YsaUJBQWlCRyxVQUFqQixHQUE4QixLQUE5QixDLENBQXFDO0FBQ3JDSCxpQkFBaUJJLFdBQWpCLEdBQStCLElBQS9CLEMsQ0FBcUM7QUFDckNKLGlCQUFpQkssSUFBakIsR0FBd0JDLG9CQUF4QixDLENBQThDO0FBQzlDO0FBQ0FOLGlCQUFpQk8sTUFBakIsR0FBMEIsS0FBMUIsQyxDQUFpQztBQUNqQ1AsaUJBQWlCUSxVQUFqQixHQUE4QixJQUE5QixDLENBQW9DO0FBQ3BDUixpQkFBaUJTLE9BQWpCLEdBQTJCLEtBQTNCLEMsQ0FBa0M7QUFDbENULGlCQUFpQlUsT0FBakIsR0FBMkIsS0FBM0IsQyxDQUFrQztBQUNsQ1YsaUJBQWlCVyxHQUFqQixHQUF3Qix3QkFBeEIsQyxDQUFrRDtBQUNsRFgsaUJBQWlCWSxJQUFqQixHQUF3QixLQUF4QixDLENBQStCOztBQUUvQkMsRUFBRUMsUUFBRixFQUFZQyxLQUFaLENBQWtCLFlBQVc7QUFDekJGLE1BQUUsWUFBRixFQUFnQkcsU0FBaEIsQ0FBMEJoQixnQkFBMUI7O0FBRUFhLE1BQUUsa0NBQUYsRUFBc0NJLEVBQXRDLENBQXlDLCtDQUF6QyxFQUEwRixZQUFXO0FBQ2pHSixVQUFFLFlBQUYsRUFBZ0JHLFNBQWhCLEdBQTRCRSxNQUE1QixDQUFtQ0wsRUFBRSxJQUFGLEVBQVFNLEdBQVIsRUFBbkMsRUFBa0RDLElBQWxEO0FBQ0gsS0FGRDs7QUFJQVAsTUFBRSxpQkFBRixFQUFxQlEsS0FBckIsQ0FBMkIsWUFBWTtBQUNuQ1IsVUFBRSxZQUFGLEVBQWdCRyxTQUFoQixHQUE0QkUsTUFBNUIsQ0FBbUNMLEVBQUUsSUFBRixFQUFRUyxJQUFSLENBQWEsT0FBYixDQUFuQyxFQUEwREYsSUFBMUQ7QUFDSCxLQUZEO0FBR0gsQ0FWRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuMzE4MjkyNTg4NWIyYjY3NTBkOTUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA1ZTFiZTM5ZWZmZDNlMTQ3NDhmNyIsInZhciBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG4vKmhlcm9lc19zdGF0c2xpc3QuZGF0YSA9IFtdO1xyXG5cclxuZm9yICh2YXIgaSA9IDA7IGkgPCBoZXJvZGF0YV9oZXJvZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBoZXJvID0gaGVyb2RhdGFfaGVyb2VzW2ldO1xyXG4gICAgaGVyb2VzX3N0YXRzbGlzdC5kYXRhLnB1c2goXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAnPGltZyBzcmM9XCInICsgaGVyb2RhdGFfaW1hZ2VwYXRoICsgaGVyb1snaW1hZ2VfaGVybyddICsgJy5wbmdcIiB3aWR0aD1cIjQwcHhcIiBoZWlnaHQ9XCI0MHB4XCI+JyxcclxuICAgICAgICAgICAgaGVyb1snbmFtZSddLFxyXG4gICAgICAgICAgICBoZXJvWydyb2xlX2JsaXp6YXJkJ10sXHJcbiAgICAgICAgICAgIGhlcm9bJ3JvbGVfc3BlY2lmaWMnXSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNVxyXG4gICAgICAgIF1cclxuICAgICk7XHJcbn0qL1xyXG5cclxuLypoZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXHJcbiAgICBbJ0FiYXRodXInLCAgICAgJ1V0aWxpdHknLCAgNDguODksICAgMTUuMzQsICAxLjM0LCAgICAtLjQ5XSxcclxuICAgIFsnVHlyYW5kZScsICAgICAnU3VwcG9ydCcsICA1Mi4zNCwgICAyMS4xMiwgIDE2LjczLCAgIDQuODJdLFxyXG4gICAgWydLaGFyYXppbScsICAgICdIZWFsZXInLCAgIDUxLjQ1LCAgIDEyLjgzLCAgNC45MiwgICAgMS4zNF0sXHJcbiAgICBbJ0xpIExpJywgICAgICAgJ0hlYWxlcicsICAgNTMuNjIsICAgMTguNzgsICA4LjE0LCAgICAuODldLFxyXG4gICAgWydEaWFibG8nLCAgICAgICdUYW5rJywgICAgIDU3LjEwLCAgIDkuMTgsICAgMi4xNiwgICAgMy4xNF1cclxuXTsqL1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5jb2x1bW5zID0gW1xyXG4gICAge1wid2lkdGhcIjogNTAsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVybycsIFwid2lkdGhcIjogMTAwLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAyfSxcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiAlJywgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAzfSxcclxuICAgIHtcInRpdGxlXCI6ICdQbGF5ICUnLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDR9LFxyXG4gICAge1widGl0bGVcIjogJ0JhbiAlJywgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA1fSxcclxuICAgIHtcInRpdGxlXCI6ICdXaW4gRGVsdGEgJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSxcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA2fVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbMCwgJ2FzYyddXTsgLy9UaGUgZGVmYXVsdCBvcmRlcmluZyBvZiB0aGUgdGFibGUgb24gbG9hZCA9PiBjb2x1bW4gMCBhc2NlbmRpbmdcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gZmFsc2U7IC8vRGlzcGxheXMgYW4gaW5kaWNhdG9yIHdoZW5ldmVyIHRoZSB0YWJsZSBpcyBwcm9jZXNzaW5nIGRhdGFcclxuaGVyb2VzX3N0YXRzbGlzdC5kZWZlclJlbmRlciA9IHRydWU7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IGhlcm9kYXRhX2hlcm9lc19wYXRoOyAvL1JlcXVlc3RzIGRhdGEgZnJvbSB0aGUgcGF0aFxyXG4vL2hlcm9lc19zdGF0c2xpc3QucGFnZUxlbmd0aCA9IDI1OyAvL0NvbnRyb2xzIGhvdyBtYW55IHJvd3MgcGVyIHBhZ2VcclxuaGVyb2VzX3N0YXRzbGlzdC5wYWdpbmcgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgaXMgYWxsb3dlZCB0byBwYWdpbmF0ZSBkYXRhIGJ5IHBhZ2UgbGVuZ3RoXHJcbmhlcm9lc19zdGF0c2xpc3QucmVzcG9uc2l2ZSA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNvbGxhcHNlcyByZXNwb25zaXZlbHkgYXMgbmVlZFxyXG5oZXJvZXNfc3RhdHNsaXN0LnNjcm9sbFggPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIGhvcml6b250YWwgc2Nyb2xsIGJhclxyXG5oZXJvZXNfc3RhdHNsaXN0LnNjcm9sbFkgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY2FuIGNyZWF0ZSBhIHZlcnRpY2FsIHNjcm9sbCBiYXJcclxuaGVyb2VzX3N0YXRzbGlzdC5kb20gPSAgXCI8J3Jvdyc8J2NvbC1zbS0xMid0cj4+XCI7IC8vUmVtb3ZlIHRoZSBzZWFyY2ggYmFyIGZyb20gdGhlIGRvbSBieSBtb2RpZnlpbmcgYm9vdHN0cmFwcyBkZWZhdWx0IGRhdGF0YWJsZSBkb20gc3R5bGluZyAoc28gaSBjYW4gaW1wbGVtZW50IGN1c3RvbSBzZWFyY2ggYmFyIGxhdGVyKVxyXG5oZXJvZXNfc3RhdHNsaXN0LmluZm8gPSBmYWxzZTsgLy9Db250cm9scyBkaXNwbGF5aW5nIHRhYmxlIGNvbnRyb2wgaW5mb3JtYXRpb24sIHN1Y2ggYXMgaWYgZmlsdGVyaW5nIGRpc3BsYXlpbmcgd2hhdCByZXN1bHRzIGFyZSB2aWV3ZWQgb3V0IG9mIGhvdyBtYW55XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcblxyXG4gICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKCkuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oc2wtcm9sZWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKCkuc2VhcmNoKCQodGhpcykuYXR0cihcInZhbHVlXCIpKS5kcmF3KCk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9