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

var useFixedHeader = false;

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
//heroes_statslist.pageLength = 25; //Controls how many rows per page
heroes_statslist.paging = false; //Controls whether or not the table is allowed to paginate data by page length
heroes_statslist.responsive = true; //Controls whether or not the table collapses responsively as need
heroes_statslist.scrollX = false; //Controls whether or not the table can create a horizontal scroll bar
heroes_statslist.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
heroes_statslist.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
heroes_statslist.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

$(document).ready(function () {
    useFixedHeader = document.documentElement.clientWidth >= 525;
    heroes_statslist.fixedHeader = useFixedHeader;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjNkODhiZGFiYmI4MTUwNjE0OWEiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsInVzZUZpeGVkSGVhZGVyIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJwcm9jZXNzaW5nIiwibG9hZGluZ1JlY29yZHMiLCJ6ZXJvUmVjb3JkcyIsImVtcHR5VGFibGUiLCJkZWZlclJlbmRlciIsImFqYXgiLCJ1cmwiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsImRhdGFTcmMiLCJjYWNoZSIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiZml4ZWRIZWFkZXIiLCJEYXRhVGFibGUiLCJvbiIsInNlYXJjaCIsInZhbCIsImRyYXciLCJjbGljayIsImF0dHIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdEQSxJQUFJQSxtQkFBbUIsRUFBdkI7O0FBRUEsSUFBSUMsaUJBQWlCLEtBQXJCOztBQUVBRCxpQkFBaUJF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TSxTQUFoQixDQUEwQjNCLGdCQUExQjs7QUFFQXFCLE1BQUUsa0NBQUYsRUFBc0NPLEVBQXRDLENBQXlDLCtDQUF6QyxFQUEwRixZQUFXO0FBQ2pHUCxVQUFFLFlBQUYsRUFBZ0JNLFNBQWhCLEdBQTRCRSxNQUE1QixDQUFtQ1IsRUFBRSxJQUFGLEVBQVFTLEdBQVIsRUFBbkMsRUFBa0RDLElBQWxEO0FBQ0gsS0FGRDs7QUFJQVYsTUFBRSxpQkFBRixFQUFxQlcsS0FBckIsQ0FBMkIsWUFBWTtBQUNuQ1gsVUFBRSxZQUFGLEVBQWdCTSxTQUFoQixHQUE0QkUsTUFBNUIsQ0FBbUNSLEVBQUUsSUFBRixFQUFRWSxJQUFSLENBQWEsT0FBYixDQUFuQyxFQUEwREYsSUFBMUQ7QUFDSCxLQUZEO0FBR0gsQ0FiRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuNWQ3OTU5MGVlYmFkNGQ5N2QzN2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA2M2Q4OGJkYWJiYjgxNTA2MTQ5YSIsInZhciBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG52YXIgdXNlRml4ZWRIZWFkZXIgPSBmYWxzZTtcclxuXHJcbmhlcm9lc19zdGF0c2xpc3QuY29sdW1ucyA9IFtcclxuICAgIHtcIndpZHRoXCI6IFwiMTAlXCIsIFwic0NsYXNzXCI6IFwiaHNsLXRhYmxlLXBvcnRyYWl0LXRkXCIsIFwiYlNvcnRhYmxlXCI6IGZhbHNlLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0hlcm8nLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fVGV4dFwiLCBcImlEYXRhU29ydFwiOiAyLCBcIm9yZGVyU2VxdWVuY2VcIjogWydhc2MnLCAnZGVzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSwgLy9pRGF0YVNvcnQgdGVsbHMgd2hpY2ggY29sdW1uIHNob3VsZCBiZSB1c2VkIGFzIHRoZSBzb3J0IHZhbHVlLCBpbiB0aGlzIGNhc2UgSGVyb19Tb3J0XHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVyb19Tb3J0JywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGUnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZV9TcGVjaWZpYycsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdHYW1lcyBQbGF5ZWQnLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgQmFubmVkJywgXCJ3aWR0aFwiOiBcIjE4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBQZXJjZW50JywgXCJ3aWR0aFwiOiBcIjE4JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJyUgzpQnLCBcIndpZHRoXCI6IFwiNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbNywgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDggYXQgaW5kZXggNyBkZXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QubGFuZ3VhZ2UgPSB7XHJcbiAgICBwcm9jZXNzaW5nOiAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj4nLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxufTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG5oZXJvZXNfc3RhdHNsaXN0LmRlZmVyUmVuZGVyID0gZmFsc2U7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IHtcclxuICAgIHVybDogaGVyb2RhdGFfaGVyb2VzX3BhdGgsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgY2FjaGU6IHRydWUgLy9DYWNoZSBhamF4IHJlc3BvbnNlXHJcbn07XHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG5oZXJvZXNfc3RhdHNsaXN0LnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG5oZXJvZXNfc3RhdHNsaXN0LmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbmhlcm9lc19zdGF0c2xpc3QuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgdXNlRml4ZWRIZWFkZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gNTI1O1xyXG4gICAgaGVyb2VzX3N0YXRzbGlzdC5maXhlZEhlYWRlciA9IHVzZUZpeGVkSGVhZGVyO1xyXG5cclxuICAgICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcblxyXG4gICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKCkuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oc2wtcm9sZWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcjaHNsLXRhYmxlJykuRGF0YVRhYmxlKCkuc2VhcmNoKCQodGhpcykuYXR0cihcInZhbHVlXCIpKS5kcmF3KCk7XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9