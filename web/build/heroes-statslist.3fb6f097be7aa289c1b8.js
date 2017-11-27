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


var HeroesStatslist = {};

HeroesStatslist.loading = false;
HeroesStatslist.validateLoad = function (table, baseUrl, filterTypes) {
    if (!HeroesStatslist.loading && HotstatusFilter.validFilters) {
        var url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== table.ajax.url()) {
            table.ajax.url(url).load();
        }
    }
};

var heroes_statslist = {};

heroes_statslist.columns = [{ "width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1 }, { "title": 'Hero', "width": "17%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1 }, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
{ "title": 'Hero_Sort', "visible": false, "responsivePriority": 999 }, { "title": 'Role', "visible": false, "responsivePriority": 999 }, { "title": 'Role_Specific', "visible": false, "responsivePriority": 999 }, { "title": 'Games Played', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Games Banned', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Popularity', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": 'Winrate', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }, { "title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1 }];

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
heroes_statslist.responsive = false; //Controls whether or not the table collapses responsively as need
heroes_statslist.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
heroes_statslist.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
heroes_statslist.dom = "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
heroes_statslist.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

$(document).ready(function () {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    heroes_statslist.fixedHeader = document.documentElement.clientWidth >= 525;

    //Set the initial url based on default filters
    var baseUrl = Routing.generate('herodata_datatable_heroes_statslist');
    var filterTypes = ["gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    heroes_statslist.ajax.url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

    //Get the datatable object
    var table = $('#hsl-table').DataTable(heroes_statslist);

    //Track datatable processing of ajax data
    table.on('preXhr', function () {
        HeroesStatslist.loading = true;
    });

    table.on('xhr', function () {
        HeroesStatslist.loading = false;
    });

    //Track filter changes and validate
    $('select.filter-selector').on('change', function (event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function (e) {
        HeroesStatslist.validateLoad(table, baseUrl, filterTypes);
    });

    //Search the table for the new value typed in by user
    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function () {
        table.search($(this).val()).draw();
    });

    //Search the table for the new value populated by role button
    $('button.hsl-rolebutton').click(function () {
        table.search($(this).attr("value")).draw();
    });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTY2MmRiNmE3ODlkZWJiMGVkYmIiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiSGVyb2VzU3RhdHNsaXN0IiwibG9hZGluZyIsInZhbGlkYXRlTG9hZCIsInRhYmxlIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJhamF4IiwibG9hZCIsImhlcm9lc19zdGF0c2xpc3QiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsImRlZmVyUmVuZGVyIiwiZGF0YVNyYyIsImNhY2hlIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsIiQiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsImZpeGVkSGVhZGVyIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJSb3V0aW5nIiwiZ2VuZXJhdGUiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsIkRhdGFUYWJsZSIsIm9uIiwiZXZlbnQiLCJlIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FB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NEJMLE9BQTVCLEVBQXFDQyxXQUFyQyxDQUE1Qjs7QUFFQTtBQUNBLFFBQUlGLFFBQVEwQixFQUFFLFlBQUYsRUFBZ0JZLFNBQWhCLENBQTBCN0IsZ0JBQTFCLENBQVo7O0FBRUE7QUFDQVQsVUFBTXVDLEVBQU4sQ0FBUyxRQUFULEVBQW1CLFlBQVc7QUFDMUIxQyx3QkFBZ0JDLE9BQWhCLEdBQTBCLElBQTFCO0FBQ0gsS0FGRDs7QUFJQUUsVUFBTXVDLEVBQU4sQ0FBUyxLQUFULEVBQWdCLFlBQVc7QUFDdkIxQyx3QkFBZ0JDLE9BQWhCLEdBQTBCLEtBQTFCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBNEIsTUFBRSx3QkFBRixFQUE0QmEsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRHJDLHdCQUFnQmtDLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q25DLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBd0IsTUFBRSxHQUFGLEVBQU9hLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeEM1Qyx3QkFBZ0JFLFlBQWhCLENBQTZCQyxLQUE3QixFQUFvQ0MsT0FBcEMsRUFBNkNDLFdBQTdDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBd0IsTUFBRSxrQ0FBRixFQUFzQ2EsRUFBdEMsQ0FBeUMsK0NBQXpDLEVBQTBGLFlBQVc7QUFDakd2QyxjQUFNMEMsTUFBTixDQUFhaEIsRUFBRSxJQUFGLEVBQVFpQixHQUFSLEVBQWIsRUFBNEJDLElBQTVCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBbEIsTUFBRSx1QkFBRixFQUEyQm1CLEtBQTNCLENBQWlDLFlBQVk7QUFDekM3QyxjQUFNMEMsTUFBTixDQUFhaEIsRUFBRSxJQUFGLEVBQVFvQixJQUFSLENBQWEsT0FBYixDQUFiLEVBQW9DRixJQUFwQztBQUNILEtBRkQ7QUFHSCxDQTFDRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuM2ZiNmYwOTdiZTdhYTI4OWMxYjguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA5NjYyZGI2YTc4OWRlYmIwZWRiYiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmxldCBIZXJvZXNTdGF0c2xpc3QgPSB7fTtcclxuXHJcbkhlcm9lc1N0YXRzbGlzdC5sb2FkaW5nID0gZmFsc2U7XHJcbkhlcm9lc1N0YXRzbGlzdC52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbih0YWJsZSwgYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb2VzU3RhdHNsaXN0LmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSB0YWJsZS5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIHRhYmxlLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmxldCBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcImhzbC10YWJsZS1wb3J0cmFpdC10ZFwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJpRGF0YVNvcnRcIjogMiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sIC8vaURhdGFTb3J0IHRlbGxzIHdoaWNoIGNvbHVtbiBzaG91bGQgYmUgdXNlZCBhcyB0aGUgc29ydCB2YWx1ZSwgaW4gdGhpcyBjYXNlIEhlcm9fU29ydFxyXG4gICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgUGxheWVkJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0dhbWVzIEJhbm5lZCcsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdQb3B1bGFyaXR5JywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbnJhdGUnLCBcIndpZHRoXCI6IFwiMTclXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnJSDOlCcsIFwid2lkdGhcIjogXCI1JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9XHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0Lm9yZGVyID0gW1s4LCAnZGVzYyddXTsgLy9UaGUgZGVmYXVsdCBvcmRlcmluZyBvZiB0aGUgdGFibGUgb24gbG9hZCA9PiBjb2x1bW4gOSBhdCBpbmRleCA4IGRlc2NlbmRpbmdcclxuaGVyb2VzX3N0YXRzbGlzdC5sYW5ndWFnZSA9IHtcclxuICAgIHByb2Nlc3Npbmc6ICc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpbiBmYS01eCBmYS1md1wiPjwvaT48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Mb2FkaW5nLi4uPC9zcGFuPicsIC8vQ2hhbmdlIGNvbnRlbnQgb2YgcHJvY2Vzc2luZyBpbmRpY2F0b3JcclxuICAgIGxvYWRpbmdSZWNvcmRzOiAnICcsIC8vTWVzc2FnZSBkaXNwbGF5ZWQgaW5zaWRlIG9mIHRhYmxlIHdoaWxlIGxvYWRpbmcgcmVjb3JkcyBpbiBjbGllbnQgc2lkZSBhamF4IHJlcXVlc3RzIChub3QgdXNlZCBmb3Igc2VydmVyIHNpZGUpXHJcbiAgICB6ZXJvUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIHdoZW4gYSB0YWJsZSBoYXMgbm8gcm93cyBsZWZ0IGFmdGVyIGZpbHRlcmluZyAoc2FtZSB3aGlsZSBsb2FkaW5nIGluaXRpYWwgYWpheClcclxuICAgIGVtcHR5VGFibGU6ICcgJyAvL01lc3NhZ2Ugd2hlbiB0YWJsZSBpcyBlbXB0eSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZ1xyXG59O1xyXG5oZXJvZXNfc3RhdHNsaXN0LnByb2Nlc3NpbmcgPSB0cnVlOyAvL0Rpc3BsYXlzIGFuIGluZGljYXRvciB3aGVuZXZlciB0aGUgdGFibGUgaXMgcHJvY2Vzc2luZyBkYXRhXHJcbmhlcm9lc19zdGF0c2xpc3QuZGVmZXJSZW5kZXIgPSBmYWxzZTsgLy9EZWZlcnMgcmVuZGVyaW5nIHRoZSB0YWJsZSB1bnRpbCBkYXRhIHN0YXJ0cyBjb21pbmcgaW5cclxuaGVyb2VzX3N0YXRzbGlzdC5hamF4ID0ge1xyXG4gICAgdXJsOiAnJywgLy91cmwgdG8gZ2V0IGEgcmVzcG9uc2UgZnJvbVxyXG4gICAgZGF0YVNyYzogJ2RhdGEnLCAvL1RoZSBhcnJheSBvZiBkYXRhIGlzIGZvdW5kIGluIC5kYXRhIGZpZWxkXHJcbiAgICBjYWNoZTogdHJ1ZSAvL0NhY2hlIGFqYXggcmVzcG9uc2VcclxufTtcclxuLy9oZXJvZXNfc3RhdHNsaXN0LnBhZ2VMZW5ndGggPSAyNTsgLy9Db250cm9scyBob3cgbWFueSByb3dzIHBlciBwYWdlXHJcbmhlcm9lc19zdGF0c2xpc3QucGFnaW5nID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGlzIGFsbG93ZWQgdG8gcGFnaW5hdGUgZGF0YSBieSBwYWdlIGxlbmd0aFxyXG5oZXJvZXNfc3RhdHNsaXN0LnJlc3BvbnNpdmUgPSBmYWxzZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IHRydWU7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSBob3Jpem9udGFsIHNjcm9sbCBiYXJcclxuaGVyb2VzX3N0YXRzbGlzdC5zY3JvbGxZID0gZmFsc2U7IC8vQ29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIHRhYmxlIGNhbiBjcmVhdGUgYSB2ZXJ0aWNhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3QuZG9tID0gIFwiPCdyb3cnPCdjb2wtc20tMTIndHI+PlwiOyAvL1JlbW92ZSB0aGUgc2VhcmNoIGJhciBmcm9tIHRoZSBkb20gYnkgbW9kaWZ5aW5nIGJvb3RzdHJhcHMgZGVmYXVsdCBkYXRhdGFibGUgZG9tIHN0eWxpbmcgKHNvIGkgY2FuIGltcGxlbWVudCBjdXN0b20gc2VhcmNoIGJhciBsYXRlcilcclxuaGVyb2VzX3N0YXRzbGlzdC5pbmZvID0gZmFsc2U7IC8vQ29udHJvbHMgZGlzcGxheWluZyB0YWJsZSBjb250cm9sIGluZm9ybWF0aW9uLCBzdWNoIGFzIGlmIGZpbHRlcmluZyBkaXNwbGF5aW5nIHdoYXQgcmVzdWx0cyBhcmUgdmlld2VkIG91dCBvZiBob3cgbWFueVxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAkLmZuLmRhdGFUYWJsZUV4dC5zRXJyTW9kZSA9ICdub25lJzsgLy9EaXNhYmxlIGRhdGF0YWJsZXMgZXJyb3IgcmVwb3J0aW5nLCBpZiBzb21ldGhpbmcgYnJlYWtzIGJlaGluZCB0aGUgc2NlbmVzIHRoZSB1c2VyIHNob3VsZG4ndCBrbm93IGFib3V0IGl0XHJcblxyXG4gICAgaGVyb2VzX3N0YXRzbGlzdC5maXhlZEhlYWRlciA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCA+PSA1MjU7XHJcblxyXG4gICAgLy9TZXQgdGhlIGluaXRpYWwgdXJsIGJhc2VkIG9uIGRlZmF1bHQgZmlsdGVyc1xyXG4gICAgbGV0IGJhc2VVcmwgPSBSb3V0aW5nLmdlbmVyYXRlKCdoZXJvZGF0YV9kYXRhdGFibGVfaGVyb2VzX3N0YXRzbGlzdCcpO1xyXG4gICAgbGV0IGZpbHRlclR5cGVzID0gW1wiZ2FtZVR5cGVcIiwgXCJtYXBcIiwgXCJyYW5rXCIsIFwiZGF0ZVwiXTtcclxuICAgIEhvdHN0YXR1c0ZpbHRlci52YWxpZGF0ZVNlbGVjdG9ycyhudWxsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICBoZXJvZXNfc3RhdHNsaXN0LmFqYXgudXJsID0gSG90c3RhdHVzRmlsdGVyLmdlbmVyYXRlVXJsKGJhc2VVcmwsIGZpbHRlclR5cGVzKTtcclxuXHJcbiAgICAvL0dldCB0aGUgZGF0YXRhYmxlIG9iamVjdFxyXG4gICAgbGV0IHRhYmxlID0gJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxuXHJcbiAgICAvL1RyYWNrIGRhdGF0YWJsZSBwcm9jZXNzaW5nIG9mIGFqYXggZGF0YVxyXG4gICAgdGFibGUub24oJ3ByZVhocicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIEhlcm9lc1N0YXRzbGlzdC5sb2FkaW5nID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRhYmxlLm9uKCd4aHInLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBIZXJvZXNTdGF0c2xpc3QubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9UcmFjayBmaWx0ZXIgY2hhbmdlcyBhbmQgdmFsaWRhdGVcclxuICAgICQoJ3NlbGVjdC5maWx0ZXItc2VsZWN0b3InKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9Mb2FkIG5ldyBkYXRhIG9uIGEgc2VsZWN0IGRyb3Bkb3duIGJlaW5nIGNsb3NlZCAoSGF2ZSB0byB1c2UgJyonIHNlbGVjdG9yIHdvcmthcm91bmQgZHVlIHRvIGEgJ0Jvb3RzdHJhcCArIENocm9tZS1vbmx5JyBidWcpXHJcbiAgICAkKCcqJykub24oJ2hpZGRlbi5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBIZXJvZXNTdGF0c2xpc3QudmFsaWRhdGVMb2FkKHRhYmxlLCBiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1NlYXJjaCB0aGUgdGFibGUgZm9yIHRoZSBuZXcgdmFsdWUgdHlwZWQgaW4gYnkgdXNlclxyXG4gICAgJCgnI2hlcm9lcy1zdGF0c2xpc3QtdG9vbGJhci1zZWFyY2gnKS5vbihcInByb3BlcnR5Y2hhbmdlIGNoYW5nZSBjbGljayBrZXl1cCBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS52YWwoKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHBvcHVsYXRlZCBieSByb2xlIGJ1dHRvblxyXG4gICAgJCgnYnV0dG9uLmhzbC1yb2xlYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRhYmxlLnNlYXJjaCgkKHRoaXMpLmF0dHIoXCJ2YWx1ZVwiKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Fzc2V0cy9qcy9oZXJvZXMtc3RhdHNsaXN0LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==