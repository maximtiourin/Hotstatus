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

heroes_statslist.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "18%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
{ "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Games Played', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Games Banned', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Win Percent', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

heroes_statslist.order = [[7, 'desc']]; //The default ordering of the table on load => column 8 at index 7 descending
heroes_statslist.language = {
    processing: '<i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span>', //Change content of processing indicator
    loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
    zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
    emptyTable: ' ' //Message when table is empty regardless of filtering
};
heroes_statslist.processing = true; //Displays an indicator whenever the table is processing data
heroes_statslist.deferRender = false; //Defers rendering the table until data starts coming in
heroes_statslist.ajax = {
    url: herodata_heroes_path, //url to get a response from
    dataSrc: 'data', //The array of data is found in .data field
    cache: true //Cache ajax response
};
heroes_statslist.ajax.url = herodata_heroes_path; //Requests data from the path
heroes_statslist.ajax.cache = true; //Caches the ajax response
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYjU3NjBmNTJlNjNhOWRlNmU2MzAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwiZGVmZXJSZW5kZXIiLCJhamF4IiwidXJsIiwiaGVyb2RhdGFfaGVyb2VzX3BhdGgiLCJkYXRhU3JjIiwiY2FjaGUiLCJwYWdpbmciLCJyZXNwb25zaXZlIiwic2Nyb2xsWCIsInNjcm9sbFkiLCJkb20iLCJpbmZvIiwiJCIsImRvY3VtZW50IiwicmVhZHkiLCJEYXRhVGFibGUiLCJvbiIsInNlYXJjaCIsInZhbCIsImRyYXciLCJjbGljayIsImF0dHIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQSxJQUFJQSxtQkFBbUIsRUFBdkI7O0FBRUFBLGlCQUFpQkMsT0FBakIsR0FBMkIsQ0FDdkIsRUFBQyxTQUFTLEtBQVYsRUFBaUIsVUFBVSx1QkFBM0IsRUFBb0QsYUFBYSxLQUFqRSxFQUF3RSxjQUFjLEtBQXRGLEVB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QTBGLFlBQVc7QUFDakdKLFVBQUUsWUFBRixFQUFnQkcsU0FBaEIsR0FBNEJFLE1BQTVCLENBQW1DTCxFQUFFLElBQUYsRUFBUU0sR0FBUixFQUFuQyxFQUFrREMsSUFBbEQ7QUFDSCxLQUZEOztBQUlBUCxNQUFFLGlCQUFGLEVBQXFCUSxLQUFyQixDQUEyQixZQUFZO0FBQ25DUixVQUFFLFlBQUYsRUFBZ0JHLFNBQWhCLEdBQTRCRSxNQUE1QixDQUFtQ0wsRUFBRSxJQUFGLEVBQVFTLElBQVIsQ0FBYSxPQUFiLENBQW5DLEVBQTBERixJQUExRDtBQUNILEtBRkQ7QUFHSCxDQVZELEUiLCJmaWxlIjoiaGVyb2VzLXN0YXRzbGlzdC4wYzg0NzljNjU1NTE4MmNiYTVmZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9ob3RzX3dlYmFwcC93ZWIvYnVpbGQvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzXCIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGI1NzYwZjUyZTYzYTlkZTZlNjMwIiwidmFyIGhlcm9lc19zdGF0c2xpc3QgPSB7fTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwiaHNsLXRhYmxlLXBvcnRyYWl0LXRkXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdHYW1lcyBQbGF5ZWQnLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgQmFubmVkJywgXCJ3aWR0aFwiOiBcIjE4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBQZXJjZW50JywgXCJ3aWR0aFwiOiBcIjE4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJyUgzpQnLCBcIndpZHRoXCI6IFwiNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbNywgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDggYXQgaW5kZXggNyBkZXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QubGFuZ3VhZ2UgPSB7XHJcbiAgICBwcm9jZXNzaW5nOiAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj4nLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxufTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG5oZXJvZXNfc3RhdHNsaXN0LmRlZmVyUmVuZGVyID0gZmFsc2U7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IHtcclxuICAgIHVybDogaGVyb2RhdGFfaGVyb2VzX3BhdGgsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgY2FjaGU6IHRydWUgLy9DYWNoZSBhamF4IHJlc3BvbnNlXHJcbn07XHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheC51cmwgPSBoZXJvZGF0YV9oZXJvZXNfcGF0aDsgLy9SZXF1ZXN0cyBkYXRhIGZyb20gdGhlIHBhdGhcclxuaGVyb2VzX3N0YXRzbGlzdC5hamF4LmNhY2hlID0gdHJ1ZTsgLy9DYWNoZXMgdGhlIGFqYXggcmVzcG9uc2VcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG5oZXJvZXNfc3RhdHNsaXN0LnJlc3BvbnNpdmUgPSB0cnVlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjb2xsYXBzZXMgcmVzcG9uc2l2ZWx5IGFzIG5lZWRcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxYID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3QuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuaGVyb2VzX3N0YXRzbGlzdC5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKGhlcm9lc19zdGF0c2xpc3QpO1xyXG5cclxuICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LXRvb2xiYXItc2VhcmNoJykub24oXCJwcm9wZXJ0eWNoYW5nZSBjaGFuZ2UgY2xpY2sga2V5dXAgaW5wdXQgcGFzdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZSgpLnNlYXJjaCgkKHRoaXMpLnZhbCgpKS5kcmF3KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaHNsLXJvbGVidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZSgpLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==