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
    var table = $('#hsl-table').DataTable(heroes_statslist);

    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
        $('#hsl-table').DataTable().search($('#heroes-statslist-toolbar-search').val()).draw();
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODI0OGI3Mzc2ZjkwNDQ4OTI1N2MiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsInByb2Nlc3NpbmciLCJkZWZlclJlbmRlciIsImFqYXgiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJ2YWwiLCJkcmF3Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM3REEsSUFBSUEsbUJBQW1CLEVBQXZCOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7Ozs7Ozs7O0FBUUFBLGlCQUFpQkMsT0FBakIsR0FBMkIsQ0FDdkIsRUFBQyxTQUFTLEVBQVYsRUFBYyxjQUFjLEtBQTVCLEVBQW1DLHNCQUFzQixDQUF6RCxFQUR1QixFQUV2QixFQUFDLFNBQVMsTUFBVixFQUFrQixTQUFTLEdBQTNCLEVBQWdDLHNCQUFzQixDQUF0RCxFQUZ1QixFQUd2QixFQUFDLFNBQVMsV0FBVixFQUF1QixXQUFXLEtBQWxDLEVBSHVCLEVBSXZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFdBQVcsS0FBN0IsRUFKdUIsRUFLdkIsRUFBQyxTQUFTLGVBQVYsRUFBMkIsV0FBVyxLQUF0QyxFQUx1QixFQU12QixFQUFDLFNBQVMsT0FBVixFQUFtQixjQUFjLEtBQWpDLEVBQXdDLHNCQUFzQixDQUE5RCxFQU51QixFQU92QixFQUFDLFNBQVMsUUFBVixFQUFvQixjQUFjLEtBQWxDLEVBQXlDLHNCQUFzQixDQUEvRCxFQVB1QixFQVF2QixFQUFDLFNBQVMsT0FBVixFQUFtQixjQUFjLEtBQWpDLEVBQXdDLHNCQUFzQixDQUE5RCxFQVJ1QixFQVN2QixFQUFDLFNBQVMsYUFBVixFQUF5QixjQUFjLEtBQXZDLEVBQTZDLHNCQUFzQixDQUFuRSxFQVR1QixDQUEzQjs7QUFZQUQsaUJBQWlCRSxLQUFqQixHQUF5QixDQUFDLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FBRCxDQUF6QixDLENBQXVDO0FBQ3ZDRixpQkFBaUJHLFVBQWpCLEdBQThCLEtBQTlCLEMsQ0FBcUM7QUFDckNILGlCQUFpQkksV0FBakIsR0FBK0IsSUFBL0IsQyxDQUFxQztBQUNyQ0osaUJBQWlCSyxJQUFqQixHQUF3QkMsb0JBQXhCLEMsQ0FBOEM7QUFDOUM7QUFDQU4saUJBQWlCTyxNQUFqQixHQUEwQixLQUExQixDLENBQWlDO0FBQ2pDUCxpQkFBaUJRLFVBQWpCLEdBQThCLElBQTlCLEMsQ0FBb0M7QUFDcENSLGlCQUFpQlMsT0FBakIsR0FBMkIsS0FBM0IsQyxDQUFrQztBQUNsQ1QsaUJBQWlCVSxPQUFqQixHQUEyQixLQUEzQixDLENBQWtDO0FBQ2xDVixpQkFBaUJXLEdBQWpCLEdBQXdCLHdCQUF4QixDLENBQWtEO0FBQ2xEWCxpQkFBaUJZLElBQWpCLEdBQXdCLEtBQXhCLEMsQ0FBK0I7O0FBRS9CQyxFQUFFQyxRQUFGLEVBQVlDLEtBQVosQ0FBa0IsWUFBVztBQUN6QixRQUFJQyxRQUFRSCxFQUFFLFlBQUYsRUFBZ0JJLFNBQWhCLENBQTBCakIsZ0JBQTFCLENBQVo7O0FBRUFhLE1BQUUsa0NBQUYsRUFBc0NLLEVBQXRDLENBQXlDLCtDQUF6QyxFQUEwRixZQUFXO0FBQ2pHTCxVQUFFLFlBQUYsRUFBZ0JJLFNBQWhCLEdBQTRCRSxNQUE1QixDQUFtQ04sRUFBRSxrQ0FBRixFQUFzQ08sR0FBdEMsRUFBbkMsRUFBZ0ZDLElBQWhGO0FBQ0gsS0FGRDtBQUdILENBTkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjY3OTdkYzVmNWEzYWFjY2U2NTJhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgODI0OGI3Mzc2ZjkwNDQ4OTI1N2MiLCJ2YXIgaGVyb2VzX3N0YXRzbGlzdCA9IHt9O1xyXG5cclxuLypoZXJvZXNfc3RhdHNsaXN0LmRhdGEgPSBbXTtcclxuXHJcbmZvciAodmFyIGkgPSAwOyBpIDwgaGVyb2RhdGFfaGVyb2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaGVybyA9IGhlcm9kYXRhX2hlcm9lc1tpXTtcclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZGF0YS5wdXNoKFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgJzxpbWcgc3JjPVwiJyArIGhlcm9kYXRhX2ltYWdlcGF0aCArIGhlcm9bJ2ltYWdlX2hlcm8nXSArICcucG5nXCIgd2lkdGg9XCI0MHB4XCIgaGVpZ2h0PVwiNDBweFwiPicsXHJcbiAgICAgICAgICAgIGhlcm9bJ25hbWUnXSxcclxuICAgICAgICAgICAgaGVyb1sncm9sZV9ibGl6emFyZCddLFxyXG4gICAgICAgICAgICBoZXJvWydyb2xlX3NwZWNpZmljJ10sXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDVcclxuICAgICAgICBdXHJcbiAgICApO1xyXG59Ki9cclxuXHJcbi8qaGVyb2VzX3N0YXRzbGlzdC5kYXRhID0gW1xyXG4gICAgWydBYmF0aHVyJywgICAgICdVdGlsaXR5JywgIDQ4Ljg5LCAgIDE1LjM0LCAgMS4zNCwgICAgLS40OV0sXHJcbiAgICBbJ1R5cmFuZGUnLCAgICAgJ1N1cHBvcnQnLCAgNTIuMzQsICAgMjEuMTIsICAxNi43MywgICA0LjgyXSxcclxuICAgIFsnS2hhcmF6aW0nLCAgICAnSGVhbGVyJywgICA1MS40NSwgICAxMi44MywgIDQuOTIsICAgIDEuMzRdLFxyXG4gICAgWydMaSBMaScsICAgICAgICdIZWFsZXInLCAgIDUzLjYyLCAgIDE4Ljc4LCAgOC4xNCwgICAgLjg5XSxcclxuICAgIFsnRGlhYmxvJywgICAgICAnVGFuaycsICAgICA1Ny4xMCwgICA5LjE4LCAgIDIuMTYsICAgIDMuMTRdXHJcbl07Ki9cclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHtcIndpZHRoXCI6IDUwLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IDEwMCwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMn0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlfSxcclxuICAgIHtcInRpdGxlXCI6ICdXaW4gJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogM30sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUGxheSAlJywgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA0fSxcclxuICAgIHtcInRpdGxlXCI6ICdCYW4gJScsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luIERlbHRhICUnLCBcInNlYXJjaGFibGVcIjogZmFsc2UsXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogNn1cclxuXTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3Qub3JkZXIgPSBbWzAsICdhc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDAgYXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QucHJvY2Vzc2luZyA9IGZhbHNlOyAvL0Rpc3BsYXlzIGFuIGluZGljYXRvciB3aGVuZXZlciB0aGUgdGFibGUgaXMgcHJvY2Vzc2luZyBkYXRhXHJcbmhlcm9lc19zdGF0c2xpc3QuZGVmZXJSZW5kZXIgPSB0cnVlOyAvL0RlZmVycyByZW5kZXJpbmcgdGhlIHRhYmxlIHVudGlsIGRhdGEgc3RhcnRzIGNvbWluZyBpblxyXG5oZXJvZXNfc3RhdHNsaXN0LmFqYXggPSBoZXJvZGF0YV9oZXJvZXNfcGF0aDsgLy9SZXF1ZXN0cyBkYXRhIGZyb20gdGhlIHBhdGhcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG5oZXJvZXNfc3RhdHNsaXN0LnJlc3BvbnNpdmUgPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxYID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3QuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuaGVyb2VzX3N0YXRzbGlzdC5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGFibGUgPSAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LXRvb2xiYXItc2VhcmNoJykub24oXCJwcm9wZXJ0eWNoYW5nZSBjaGFuZ2UgY2xpY2sga2V5dXAgaW5wdXQgcGFzdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZSgpLnNlYXJjaCgkKCcjaGVyb2VzLXN0YXRzbGlzdC10b29sYmFyLXNlYXJjaCcpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9