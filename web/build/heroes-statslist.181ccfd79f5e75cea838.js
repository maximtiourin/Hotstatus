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

heroes_statslist.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "18%", "iDataSort": 2, "responsivePriority": 2 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
{ "title": 'Hero_Sort', "visible": false }, { "title": 'Role', "visible": false }, { "title": 'Role_Specific', "visible": false }, { "title": 'Win %', "width": "18%", "searchable": false, "responsivePriority": 3 }, { "title": 'Play %', "width": "18%", "searchable": false, "responsivePriority": 4 }, { "title": 'Ban %', "width": "18%", "searchable": false, "responsivePriority": 5 }, { "title": 'Win Delta %', "width": "18%", "searchable": false, "responsivePriority": 6 }];

heroes_statslist.order = [[2, 'asc']]; //The default ordering of the table on load => column 3 at index 2 ascending
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzY1ODMxNjgxNDA2MDZkODRjZTMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsInByb2Nlc3NpbmciLCJkZWZlclJlbmRlciIsImFqYXgiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsIkRhdGFUYWJsZSIsIm9uIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQUlBLG1CQUFtQixFQUF2Qjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOzs7Ozs7OztBQVFBQSxpQkFBaUJDLE9BQWpCLEdBQTJCLENBQ3ZCLEVBQUMsU0FBUyxLQUFWLEVBQWlCLFVBQVUsdUJBQTNCLEVBQW9ELGNBQWMsS0FBbEUsRUFBeUUsc0JBQXNCLENBQS9GLEVBRHVCLEVBRXZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFNBQVMsS0FBM0IsRUFBa0MsYUFBYSxDQUEvQyxFQUFrRCxzQkFBc0IsQ0FBeEUsRUFGdUIsRUFFcUQ7QUFDNUUsRUFBQyxTQUFTLFdBQVYsRUFBdUIsV0FBVyxLQUFsQyxFQUh1QixFQUl2QixFQUFDLFNBQVMsTUFBVixFQUFrQixXQUFXLEtBQTdCLEVBSnVCLEVBS3ZCLEVBQUMsU0FBUyxlQUFWLEVBQTJCLFdBQVcsS0FBdEMsRUFMdUIsRUFNdkIsRUFBQyxTQUFTLE9BQVYsRUFBbUIsU0FBUyxLQUE1QixFQUFtQyxjQUFjLEtBQWpELEVBQXdELHNCQUFzQixDQUE5RSxFQU51QixFQU92QixFQUFDLFNBQVMsUUFBVixFQUFvQixTQUFTLEtBQTdCLEVBQW9DLGNBQWMsS0FBbEQsRUFBeUQsc0JBQXNCLENBQS9FLEVBUHVCLEVBUXZCLEVBQUMsU0FBUyxPQUFWLEVBQW1CLFNBQVMsS0FBNUIsRUFBbUMsY0FBYyxLQUFqRCxFQUF3RCxzQkFBc0IsQ0FBOUUsRUFSdUIsRUFTdkIsRUFBQyxTQUFTLGFBQVYsRUFBeUIsU0FBUyxLQUFsQyxFQUF5QyxjQUFjLEtBQXZELEVBQTZELHNCQUFzQixDQUFuRixFQVR1QixDQUEzQjs7QUFZQUQsaUJBQWlCRSxLQUFqQixHQUF5QixDQUFDLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FBRCxDQUF6QixDLENBQXVDO0FBQ3ZDRixpQkFBaUJHLFVBQWpCLEdBQThCLEtBQTlCLEMsQ0FBcUM7QUFDckNILGlCQUFpQkksV0FBakIsR0FBK0IsSUFBL0IsQyxDQUFxQztBQUNyQ0osaUJBQWlCSyxJQUFqQixHQUF3QkMsb0JBQXhCLEMsQ0FBOEM7QUFDOUM7QUFDQU4saUJBQWlCTyxNQUFqQixHQUEwQixLQUExQixDLENBQWlDO0FBQ2pDUCxpQkFBaUJRLFVBQWpCLEdBQThCLElBQTlCLEMsQ0FBb0M7QUFDcENSLGlCQUFpQlMsT0FBakIsR0FBMkIsS0FBM0IsQyxDQUFrQztBQUNsQ1QsaUJBQWlCVSxPQUFqQixHQUEyQixLQUEzQixDLENBQWtDO0FBQ2xDVixpQkFBaUJXLEdBQWpCLEdBQXdCLHdCQUF4QixDLENBQWtEO0FBQ2xEWCxpQkFBaUJZLElBQWpCLEdBQXdCLEtBQXhCLEMsQ0FBK0I7O0FBRS9CQyxFQUFFQyxRQUFGLEVBQVlDLEtBQVosQ0FBa0IsWUFBVztBQUN6QkYsTUFBRSxZQUFGLEVBQWdCRyxTQUFoQixDQUEwQmhCLGdCQUExQjs7QUFFQWEsTUFBRSxrQ0FBRixFQUFzQ0ksRUFBdEMsQ0FBeUMsK0NBQXpDLEVBQTBGLFlBQVc7QUFDakdKLFVBQUUsWUFBRixFQUFnQkcsU0FBaEIsR0FBNEJFLE1BQTVCLENBQW1DTCxFQUFFLElBQUYsRUFBUU0sR0FBUixFQUFuQyxFQUFrREMsSUFBbEQ7QUFDSCxLQUZEOztBQUlBUCxNQUFFLGlCQUFGLEVBQXFCUSxLQUFyQixDQUEyQixZQUFZO0FBQ25DUixVQUFFLFlBQUYsRUFBZ0JHLFNBQWhCLEdBQTRCRSxNQUE1QixDQUFtQ0wsRUFBRSxJQUFGLEVBQVFTLElBQVIsQ0FBYSxPQUFiLENBQW5DLEVBQTBERixJQUExRDtBQUNILEtBRkQ7QUFHSCxDQVZELEUiLCJmaWxlIjoiaGVyb2VzLXN0YXRzbGlzdC4xODFjY2ZkNzlmNWU3NWNlYTgzOC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDM2NTgzMTY4MTQwNjA2ZDg0Y2UzIiwidmFyIGhlcm9lc19zdGF0c2xpc3QgPSB7fTtcclxuXHJcbi8qaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW107XHJcblxyXG5mb3IgKHZhciBpID0gMDsgaSA8IGhlcm9kYXRhX2hlcm9lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGhlcm8gPSBoZXJvZGF0YV9oZXJvZXNbaV07XHJcbiAgICBoZXJvZXNfc3RhdHNsaXN0LmRhdGEucHVzaChcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgICc8aW1nIHNyYz1cIicgKyBoZXJvZGF0YV9pbWFnZXBhdGggKyBoZXJvWydpbWFnZV9oZXJvJ10gKyAnLnBuZ1wiIHdpZHRoPVwiNDBweFwiIGhlaWdodD1cIjQwcHhcIj4nLFxyXG4gICAgICAgICAgICBoZXJvWyduYW1lJ10sXHJcbiAgICAgICAgICAgIGhlcm9bJ3JvbGVfYmxpenphcmQnXSxcclxuICAgICAgICAgICAgaGVyb1sncm9sZV9zcGVjaWZpYyddLFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICA1XHJcbiAgICAgICAgXVxyXG4gICAgKTtcclxufSovXHJcblxyXG4vKmhlcm9lc19zdGF0c2xpc3QuZGF0YSA9IFtcclxuICAgIFsnQWJhdGh1cicsICAgICAnVXRpbGl0eScsICA0OC44OSwgICAxNS4zNCwgIDEuMzQsICAgIC0uNDldLFxyXG4gICAgWydUeXJhbmRlJywgICAgICdTdXBwb3J0JywgIDUyLjM0LCAgIDIxLjEyLCAgMTYuNzMsICAgNC44Ml0sXHJcbiAgICBbJ0toYXJhemltJywgICAgJ0hlYWxlcicsICAgNTEuNDUsICAgMTIuODMsICA0LjkyLCAgICAxLjM0XSxcclxuICAgIFsnTGkgTGknLCAgICAgICAnSGVhbGVyJywgICA1My42MiwgICAxOC43OCwgIDguMTQsICAgIC44OV0sXHJcbiAgICBbJ0RpYWJsbycsICAgICAgJ1RhbmsnLCAgICAgNTcuMTAsICAgOS4xOCwgICAyLjE2LCAgICAzLjE0XVxyXG5dOyovXHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcImhzbC10YWJsZS1wb3J0cmFpdC10ZFwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTglXCIsIFwiaURhdGFTb3J0XCI6IDIsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDJ9LCAvL2lEYXRhU29ydCB0ZWxscyB3aGljaCBjb2x1bW4gc2hvdWxkIGJlIHVzZWQgYXMgdGhlIHNvcnQgdmFsdWUsIGluIHRoaXMgY2FzZSBIZXJvX1NvcnRcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2V9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiAlJywgXCJ3aWR0aFwiOiBcIjE4JVwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDN9LFxyXG4gICAge1widGl0bGVcIjogJ1BsYXkgJScsIFwid2lkdGhcIjogXCIxOCVcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA0fSxcclxuICAgIHtcInRpdGxlXCI6ICdCYW4gJScsIFwid2lkdGhcIjogXCIxOCVcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA1fSxcclxuICAgIHtcInRpdGxlXCI6ICdXaW4gRGVsdGEgJScsIFwid2lkdGhcIjogXCIxOCVcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDZ9XHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0Lm9yZGVyID0gW1syLCAnYXNjJ11dOyAvL1RoZSBkZWZhdWx0IG9yZGVyaW5nIG9mIHRoZSB0YWJsZSBvbiBsb2FkID0+IGNvbHVtbiAzIGF0IGluZGV4IDIgYXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QucHJvY2Vzc2luZyA9IGZhbHNlOyAvL0Rpc3BsYXlzIGFuIGluZGljYXRvciB3aGVuZXZlciB0aGUgdGFibGUgaXMgcHJvY2Vzc2luZyBkYXRhXHJcbmhlcm9lc19zdGF0c2xpc3QuZGVmZXJSZW5kZXIgPSB0cnVlOyAvL0RlZmVycyByZW5kZXJpbmcgdGhlIHRhYmxlIHVudGlsIGRhdGEgc3RhcnRzIGNvbWluZyBpblxyXG5oZXJvZXNfc3RhdHNsaXN0LmFqYXggPSBoZXJvZGF0YV9oZXJvZXNfcGF0aDsgLy9SZXF1ZXN0cyBkYXRhIGZyb20gdGhlIHBhdGhcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG5oZXJvZXNfc3RhdHNsaXN0LnJlc3BvbnNpdmUgPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxYID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3QuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuaGVyb2VzX3N0YXRzbGlzdC5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LXRvb2xiYXItc2VhcmNoJykub24oXCJwcm9wZXJ0eWNoYW5nZSBjaGFuZ2UgY2xpY2sga2V5dXAgaW5wdXQgcGFzdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZSgpLnNlYXJjaCgkKHRoaXMpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaHNsLXJvbGVidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZSgpLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==