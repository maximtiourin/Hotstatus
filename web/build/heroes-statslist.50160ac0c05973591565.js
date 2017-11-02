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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var heroes_statslist = {};

//let herodata_heroes_path = Routing.generate('herodata_datatable_heroes_statslist');

heroes_statslist.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "17%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
{ "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Games Played', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Games Banned', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Popularity', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Win Percent', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

heroes_statslist.order = [[8, 'desc']]; //The default ordering of the table on load => column 9 at index 8 descending
heroes_statslist.language = {
    processing: '<i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span>', //Change content of processing indicator
    loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
    zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
    emptyTable: ' ' //Message when table is empty regardless of filtering
};
heroes_statslist.processing = true; //Displays an indicator whenever the table is processing data
heroes_statslist.deferRender = false; //Defers rendering the table until data starts coming in
heroes_statslist.ajax = {
    url: '', //url to get a response from
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
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    heroes_statslist.fixedHeader = document.documentElement.clientWidth >= 525;

    //Set the initial url based on default filters
    var baseUrl = Routing.generate('herodata_datatable_heroes_statslist');
    var filterTypes = ["map", "rank"];
    heroes_statslist.ajax.url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

    //Get the datatable object
    var table = $('#hsl-table').DataTable(heroes_statslist);

    //Search the table for the new value typed in by user
    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
        table.search($(this).val()).draw();
    });

    //Search the table for the new value populated by role button
    $('button.hsl-rolebutton').click(function () {
        table.search($(this).attr("value")).draw();
    });

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event, clickedIndex, newValue, oldValue) {
        HotstatusFilter.validateSelectors($('button.filter-button'), filterTypes);
    });

    //Calculate new url based on filters and load it, only if the url has changed
    $('button.filter-button').click(function () {
        var url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== table.ajax.url()) {
            table.ajax.url(url).load();
        }
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmY1Yzc4MTgzZTYyNDYyNzM3MzYiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsImxhbmd1YWdlIiwicHJvY2Vzc2luZyIsImxvYWRpbmdSZWNvcmRzIiwiemVyb1JlY29yZHMiLCJlbXB0eVRhYmxlIiwiZGVmZXJSZW5kZXIiLCJhamF4IiwidXJsIiwiZGF0YVNyYyIsImNhY2hlIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsIiQiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsImZpeGVkSGVhZGVyIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJiYXNlVXJsIiwiUm91dGluZyIsImdlbmVyYXRlIiwiZmlsdGVyVHlwZXMiLCJIb3RzdGF0dXNGaWx0ZXIiLCJnZW5lcmF0ZVVybCIsInRhYmxlIiwiRGF0YVRhYmxlIiwib24iLCJzZWFyY2giLCJ2YWwiLCJkcmF3IiwiY2xpY2siLCJhdHRyIiwiZXZlbnQiLCJjbGlja2VkSW5kZXgiLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwidmFsaWRhdGVTZWxlY3RvcnMiLCJsb2FkIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FB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QUF3Q0MsUUFBeEMsRUFBa0Q7QUFDdkZiLHdCQUFnQmMsaUJBQWhCLENBQWtDM0IsRUFBRSxzQkFBRixDQUFsQyxFQUE2RFksV0FBN0Q7QUFDSCxLQUZEOztBQUlBO0FBQ0FaLE1BQUUsc0JBQUYsRUFBMEJxQixLQUExQixDQUFnQyxZQUFZO0FBQ3hDLFlBQUk5QixNQUFNc0IsZ0JBQWdCQyxXQUFoQixDQUE0QkwsT0FBNUIsRUFBcUNHLFdBQXJDLENBQVY7O0FBRUEsWUFBSXJCLFFBQVF3QixNQUFNekIsSUFBTixDQUFXQyxHQUFYLEVBQVosRUFBOEI7QUFDMUJ3QixrQkFBTXpCLElBQU4sQ0FBV0MsR0FBWCxDQUFlQSxHQUFmLEVBQW9CcUMsSUFBcEI7QUFDSDtBQUNKLEtBTkQ7QUFPSCxDQXBDRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuNTAxNjBhYzBjMDU5NzM1OTE1NjUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA2ZjVjNzgxODNlNjI0NjI3MzczNiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmxldCBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG4vL2xldCBoZXJvZGF0YV9oZXJvZXNfcGF0aCA9IFJvdXRpbmcuZ2VuZXJhdGUoJ2hlcm9kYXRhX2RhdGF0YWJsZV9oZXJvZXNfc3RhdHNsaXN0Jyk7XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcImhzbC10YWJsZS1wb3J0cmFpdC10ZFwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJpRGF0YVNvcnRcIjogMiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sIC8vaURhdGFTb3J0IHRlbGxzIHdoaWNoIGNvbHVtbiBzaG91bGQgYmUgdXNlZCBhcyB0aGUgc29ydCB2YWx1ZSwgaW4gdGhpcyBjYXNlIEhlcm9fU29ydFxyXG4gICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgUGxheWVkJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0dhbWVzIEJhbm5lZCcsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdQb3B1bGFyaXR5JywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBQZXJjZW50JywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJyUgzpQnLCBcIndpZHRoXCI6IFwiNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbOCwgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDkgYXQgaW5kZXggOCBkZXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QubGFuZ3VhZ2UgPSB7XHJcbiAgICBwcm9jZXNzaW5nOiAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj4nLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxufTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG5oZXJvZXNfc3RhdHNsaXN0LmRlZmVyUmVuZGVyID0gZmFsc2U7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IHtcclxuICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgY2FjaGU6IHRydWUgLy9DYWNoZSBhamF4IHJlc3BvbnNlXHJcbn07XHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG5oZXJvZXNfc3RhdHNsaXN0LnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG5oZXJvZXNfc3RhdHNsaXN0LmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbmhlcm9lc19zdGF0c2xpc3QuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZml4ZWRIZWFkZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gNTI1O1xyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnNcclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfZGF0YXRhYmxlX2hlcm9lc19zdGF0c2xpc3QnKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcIm1hcFwiLCBcInJhbmtcIl07XHJcbiAgICBoZXJvZXNfc3RhdHNsaXN0LmFqYXgudXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL0dldCB0aGUgZGF0YXRhYmxlIG9iamVjdFxyXG4gICAgbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxuXHJcbiAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgdHlwZWQgaW4gYnkgdXNlclxyXG4gICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS52YWwoKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHBvcHVsYXRlZCBieSByb2xlIGJ1dHRvblxyXG4gICAgJCgnYnV0dG9uLmhzbC1yb2xlYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQsIGNsaWNrZWRJbmRleCwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKCQoJ2J1dHRvbi5maWx0ZXItYnV0dG9uJyksIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vQ2FsY3VsYXRlIG5ldyB1cmwgYmFzZWQgb24gZmlsdGVycyBhbmQgbG9hZCBpdCwgb25seSBpZiB0aGUgdXJsIGhhcyBjaGFuZ2VkXHJcbiAgICAkKCdidXR0b24uZmlsdGVyLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgdXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHVybCAhPT0gdGFibGUuYWpheC51cmwoKSkge1xyXG4gICAgICAgICAgICB0YWJsZS5hamF4LnVybCh1cmwpLmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9