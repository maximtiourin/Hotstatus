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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGE4MzE0OTdhNDM0YzhlMzQ0NTAiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiSGVyb2VzU3RhdHNsaXN0IiwibG9hZGluZyIsInZhbGlkYXRlTG9hZCIsInRhYmxlIiwiYmFzZVVybCIsImZpbHRlclR5cGVzIiwiSG90c3RhdHVzRmlsdGVyIiwidmFsaWRGaWx0ZXJzIiwidXJsIiwiZ2VuZXJhdGVVcmwiLCJhamF4IiwibG9hZCIsImhlcm9lc19zdGF0c2xpc3QiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsInByb2Nlc3NpbmciLCJsb2FkaW5nUmVjb3JkcyIsInplcm9SZWNvcmRzIiwiZW1wdHlUYWJsZSIsImRlZmVyUmVuZGVyIiwiZGF0YVNyYyIsImNhY2hlIiwicGFnaW5nIiwicmVzcG9uc2l2ZSIsInNjcm9sbFgiLCJzY3JvbGxZIiwiZG9tIiwiaW5mbyIsIiQiLCJkb2N1bWVudCIsInJlYWR5IiwiZm4iLCJkYXRhVGFibGVFeHQiLCJzRXJyTW9kZSIsImZpeGVkSGVhZGVyIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJSb3V0aW5nIiwiZ2VuZXJhdGUiLCJ2YWxpZGF0ZVNlbGVjdG9ycyIsIkRhdGFUYWJsZSIsIm9uIiwiZXZlbnQiLCJlIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FB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NEJMLE9BQTVCLEVBQXFDQyxXQUFyQyxDQUE1Qjs7QUFFQTtBQUNBLFFBQUlGLFFBQVEwQixFQUFFLFlBQUYsRUFBZ0JZLFNBQWhCLENBQTBCN0IsZ0JBQTFCLENBQVo7O0FBRUE7QUFDQVQsVUFBTXVDLEVBQU4sQ0FBUyxRQUFULEVBQW1CLFlBQVc7QUFDMUIxQyx3QkFBZ0JDLE9BQWhCLEdBQTBCLElBQTFCO0FBQ0gsS0FGRDs7QUFJQUUsVUFBTXVDLEVBQU4sQ0FBUyxLQUFULEVBQWdCLFlBQVc7QUFDdkIxQyx3QkFBZ0JDLE9BQWhCLEdBQTBCLEtBQTFCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBNEIsTUFBRSx3QkFBRixFQUE0QmEsRUFBNUIsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBU0MsS0FBVCxFQUFnQjtBQUNyRHJDLHdCQUFnQmtDLGlCQUFoQixDQUFrQyxJQUFsQyxFQUF3Q25DLFdBQXhDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBd0IsTUFBRSxHQUFGLEVBQU9hLEVBQVAsQ0FBVSxvQkFBVixFQUFnQyxVQUFTRSxDQUFULEVBQVk7QUFDeEM1Qyx3QkFBZ0JFLFlBQWhCLENBQTZCQyxLQUE3QixFQUFvQ0MsT0FBcEMsRUFBNkNDLFdBQTdDO0FBQ0gsS0FGRDs7QUFJQTtBQUNBd0IsTUFBRSxrQ0FBRixFQUFzQ2EsRUFBdEMsQ0FBeUMsK0NBQXpDLEVBQTBGLFlBQVc7QUFDakd2QyxjQUFNMEMsTUFBTixDQUFhaEIsRUFBRSxJQUFGLEVBQVFpQixHQUFSLEVBQWIsRUFBNEJDLElBQTVCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBbEIsTUFBRSx1QkFBRixFQUEyQm1CLEtBQTNCLENBQWlDLFlBQVk7QUFDekM3QyxjQUFNMEMsTUFBTixDQUFhaEIsRUFBRSxJQUFGLEVBQVFvQixJQUFSLENBQWEsT0FBYixDQUFiLEVBQW9DRixJQUFwQztBQUNILEtBRkQ7QUFHSCxDQTFDRCxFIiwiZmlsZSI6Imhlcm9lcy1zdGF0c2xpc3QuYmRhMjQ2MjJkMDBkYTllZjBhZjUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvaG90c193ZWJhcHAvd2ViL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qc1wiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBkYTgzMTQ5N2E0MzRjOGUzNDQ1MCIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmxldCBIZXJvZXNTdGF0c2xpc3QgPSB7fTtcclxuXHJcbkhlcm9lc1N0YXRzbGlzdC5sb2FkaW5nID0gZmFsc2U7XHJcbkhlcm9lc1N0YXRzbGlzdC52YWxpZGF0ZUxvYWQgPSBmdW5jdGlvbih0YWJsZSwgYmFzZVVybCwgZmlsdGVyVHlwZXMpIHtcclxuICAgIGlmICghSGVyb2VzU3RhdHNsaXN0LmxvYWRpbmcgJiYgSG90c3RhdHVzRmlsdGVyLnZhbGlkRmlsdGVycykge1xyXG4gICAgICAgIGxldCB1cmwgPSBIb3RzdGF0dXNGaWx0ZXIuZ2VuZXJhdGVVcmwoYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG5cclxuICAgICAgICBpZiAodXJsICE9PSB0YWJsZS5hamF4LnVybCgpKSB7XHJcbiAgICAgICAgICAgIHRhYmxlLmFqYXgudXJsKHVybCkubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmxldCBoZXJvZXNfc3RhdHNsaXN0ID0ge307XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0LmNvbHVtbnMgPSBbXHJcbiAgICB7XCJ3aWR0aFwiOiBcIjEwJVwiLCBcInNDbGFzc1wiOiBcImhzbC10YWJsZS1wb3J0cmFpdC10ZFwiLCBcImJTb3J0YWJsZVwiOiBmYWxzZSwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX1RleHRcIiwgXCJpRGF0YVNvcnRcIjogMiwgXCJvcmRlclNlcXVlbmNlXCI6IFsnYXNjJywgJ2Rlc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sIC8vaURhdGFTb3J0IHRlbGxzIHdoaWNoIGNvbHVtbiBzaG91bGQgYmUgdXNlZCBhcyB0aGUgc29ydCB2YWx1ZSwgaW4gdGhpcyBjYXNlIEhlcm9fU29ydFxyXG4gICAge1widGl0bGVcIjogJ0hlcm9fU29ydCcsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ1JvbGVfU3BlY2lmaWMnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnR2FtZXMgUGxheWVkJywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ0dhbWVzIEJhbm5lZCcsIFwid2lkdGhcIjogXCIxNyVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdQb3B1bGFyaXR5JywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJ1dpbiBQZXJjZW50JywgXCJ3aWR0aFwiOiBcIjE3JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LFxyXG4gICAge1widGl0bGVcIjogJyUgzpQnLCBcIndpZHRoXCI6IFwiNSVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfVxyXG5dO1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5vcmRlciA9IFtbOCwgJ2Rlc2MnXV07IC8vVGhlIGRlZmF1bHQgb3JkZXJpbmcgb2YgdGhlIHRhYmxlIG9uIGxvYWQgPT4gY29sdW1uIDkgYXQgaW5kZXggOCBkZXNjZW5kaW5nXHJcbmhlcm9lc19zdGF0c2xpc3QubGFuZ3VhZ2UgPSB7XHJcbiAgICBwcm9jZXNzaW5nOiAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW4gZmEtNXggZmEtZndcIj48L2k+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TG9hZGluZy4uLjwvc3Bhbj4nLCAvL0NoYW5nZSBjb250ZW50IG9mIHByb2Nlc3NpbmcgaW5kaWNhdG9yXHJcbiAgICBsb2FkaW5nUmVjb3JkczogJyAnLCAvL01lc3NhZ2UgZGlzcGxheWVkIGluc2lkZSBvZiB0YWJsZSB3aGlsZSBsb2FkaW5nIHJlY29yZHMgaW4gY2xpZW50IHNpZGUgYWpheCByZXF1ZXN0cyAobm90IHVzZWQgZm9yIHNlcnZlciBzaWRlKVxyXG4gICAgemVyb1JlY29yZHM6ICcgJywgLy9NZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgdGFibGUgaGFzIG5vIHJvd3MgbGVmdCBhZnRlciBmaWx0ZXJpbmcgKHNhbWUgd2hpbGUgbG9hZGluZyBpbml0aWFsIGFqYXgpXHJcbiAgICBlbXB0eVRhYmxlOiAnICcgLy9NZXNzYWdlIHdoZW4gdGFibGUgaXMgZW1wdHkgcmVnYXJkbGVzcyBvZiBmaWx0ZXJpbmdcclxufTtcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gdHJ1ZTsgLy9EaXNwbGF5cyBhbiBpbmRpY2F0b3Igd2hlbmV2ZXIgdGhlIHRhYmxlIGlzIHByb2Nlc3NpbmcgZGF0YVxyXG5oZXJvZXNfc3RhdHNsaXN0LmRlZmVyUmVuZGVyID0gZmFsc2U7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IHtcclxuICAgIHVybDogJycsIC8vdXJsIHRvIGdldCBhIHJlc3BvbnNlIGZyb21cclxuICAgIGRhdGFTcmM6ICdkYXRhJywgLy9UaGUgYXJyYXkgb2YgZGF0YSBpcyBmb3VuZCBpbiAuZGF0YSBmaWVsZFxyXG4gICAgY2FjaGU6IHRydWUgLy9DYWNoZSBhamF4IHJlc3BvbnNlXHJcbn07XHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG5oZXJvZXNfc3RhdHNsaXN0LnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG5oZXJvZXNfc3RhdHNsaXN0LmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbmhlcm9lc19zdGF0c2xpc3QuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJC5mbi5kYXRhVGFibGVFeHQuc0Vyck1vZGUgPSAnbm9uZSc7IC8vRGlzYWJsZSBkYXRhdGFibGVzIGVycm9yIHJlcG9ydGluZywgaWYgc29tZXRoaW5nIGJyZWFrcyBiZWhpbmQgdGhlIHNjZW5lcyB0aGUgdXNlciBzaG91bGRuJ3Qga25vdyBhYm91dCBpdFxyXG5cclxuICAgIGhlcm9lc19zdGF0c2xpc3QuZml4ZWRIZWFkZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggPj0gNTI1O1xyXG5cclxuICAgIC8vU2V0IHRoZSBpbml0aWFsIHVybCBiYXNlZCBvbiBkZWZhdWx0IGZpbHRlcnNcclxuICAgIGxldCBiYXNlVXJsID0gUm91dGluZy5nZW5lcmF0ZSgnaGVyb2RhdGFfZGF0YXRhYmxlX2hlcm9lc19zdGF0c2xpc3QnKTtcclxuICAgIGxldCBmaWx0ZXJUeXBlcyA9IFtcImdhbWVUeXBlXCIsIFwibWFwXCIsIFwicmFua1wiLCBcImRhdGVcIl07XHJcbiAgICBIb3RzdGF0dXNGaWx0ZXIudmFsaWRhdGVTZWxlY3RvcnMobnVsbCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgaGVyb2VzX3N0YXRzbGlzdC5hamF4LnVybCA9IEhvdHN0YXR1c0ZpbHRlci5nZW5lcmF0ZVVybChiYXNlVXJsLCBmaWx0ZXJUeXBlcyk7XHJcblxyXG4gICAgLy9HZXQgdGhlIGRhdGF0YWJsZSBvYmplY3RcclxuICAgIGxldCB0YWJsZSA9ICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoaGVyb2VzX3N0YXRzbGlzdCk7XHJcblxyXG4gICAgLy9UcmFjayBkYXRhdGFibGUgcHJvY2Vzc2luZyBvZiBhamF4IGRhdGFcclxuICAgIHRhYmxlLm9uKCdwcmVYaHInLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBIZXJvZXNTdGF0c2xpc3QubG9hZGluZyA9IHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0YWJsZS5vbigneGhyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgSGVyb2VzU3RhdHNsaXN0LmxvYWRpbmcgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vVHJhY2sgZmlsdGVyIGNoYW5nZXMgYW5kIHZhbGlkYXRlXHJcbiAgICAkKCdzZWxlY3QuZmlsdGVyLXNlbGVjdG9yJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgSG90c3RhdHVzRmlsdGVyLnZhbGlkYXRlU2VsZWN0b3JzKG51bGwsIGZpbHRlclR5cGVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTG9hZCBuZXcgZGF0YSBvbiBhIHNlbGVjdCBkcm9wZG93biBiZWluZyBjbG9zZWQgKEhhdmUgdG8gdXNlICcqJyBzZWxlY3RvciB3b3JrYXJvdW5kIGR1ZSB0byBhICdCb290c3RyYXAgKyBDaHJvbWUtb25seScgYnVnKVxyXG4gICAgJCgnKicpLm9uKCdoaWRkZW4uYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgSGVyb2VzU3RhdHNsaXN0LnZhbGlkYXRlTG9hZCh0YWJsZSwgYmFzZVVybCwgZmlsdGVyVHlwZXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9TZWFyY2ggdGhlIHRhYmxlIGZvciB0aGUgbmV3IHZhbHVlIHR5cGVkIGluIGJ5IHVzZXJcclxuICAgICQoJyNoZXJvZXMtc3RhdHNsaXN0LXRvb2xiYXItc2VhcmNoJykub24oXCJwcm9wZXJ0eWNoYW5nZSBjaGFuZ2UgY2xpY2sga2V5dXAgaW5wdXQgcGFzdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGFibGUuc2VhcmNoKCQodGhpcykudmFsKCkpLmRyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vU2VhcmNoIHRoZSB0YWJsZSBmb3IgdGhlIG5ldyB2YWx1ZSBwb3B1bGF0ZWQgYnkgcm9sZSBidXR0b25cclxuICAgICQoJ2J1dHRvbi5oc2wtcm9sZWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0YWJsZS5zZWFyY2goJCh0aGlzKS5hdHRyKFwidmFsdWVcIikpLmRyYXcoKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qcyJdLCJzb3VyY2VSb290IjoiIn0=