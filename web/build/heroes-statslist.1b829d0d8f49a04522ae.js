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
heroes_statslist.processing = false; //Displays an indicator whenever the table is processing data
heroes_statslist.deferRender = true; //Defers rendering the table until data starts coming in
heroes_statslist.ajax = {
    url: herodata_heroes_path,
    dataSrc: 'data',
    cache: true
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2QzOWVjY2Y3NDdhMjY5ZGI3N2EiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanMiXSwibmFtZXMiOlsiaGVyb2VzX3N0YXRzbGlzdCIsImNvbHVtbnMiLCJvcmRlciIsInByb2Nlc3NpbmciLCJkZWZlclJlbmRlciIsImFqYXgiLCJ1cmwiLCJoZXJvZGF0YV9oZXJvZXNfcGF0aCIsImRhdGFTcmMiLCJjYWNoZSIsInBhZ2luZyIsInJlc3BvbnNpdmUiLCJzY3JvbGxYIiwic2Nyb2xsWSIsImRvbSIsImluZm8iLCIkIiwiZG9jdW1lbnQiLCJyZWFkeSIsIkRhdGFUYWJsZSIsIm9uIiwic2VhcmNoIiwidmFsIiwiZHJhdyIsImNsaWNrIiwiYXR0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQUlBLG1CQUFtQixFQUF2Qjs7QUFFQUEsaUJBQWlCQyxPQUFqQixHQUEyQixDQUN2QixFQUFDLFNBQVMsS0FBVixFQUFpQixVQUFVLHVCQUEzQixFQUFvRCxhQUFhLEtBQWpFLEVBQXdFLGNBQWMsS0FBdEYsRUFBNkYsc0JBQXNCLENBQW5ILEVBRHVCLEVBRXZCLEVBQUMsU0FBUyxNQUFWLEVBQWtCLFNBQVMs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UVMsSUFBUixDQUFhLE9BQWIsQ0FBbkMsRUFBMERGLElBQTFEO0FBQ0gsS0FGRDtBQUdILENBVkQsRSIsImZpbGUiOiJoZXJvZXMtc3RhdHNsaXN0LjFiODI5ZDBkOGY0OWEwNDUyMmFlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2hvdHNfd2ViYXBwL3dlYi9idWlsZC9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vYXNzZXRzL2pzL2hlcm9lcy1zdGF0c2xpc3QuanNcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgM2QzOWVjY2Y3NDdhMjY5ZGI3N2EiLCJ2YXIgaGVyb2VzX3N0YXRzbGlzdCA9IHt9O1xyXG5cclxuaGVyb2VzX3N0YXRzbGlzdC5jb2x1bW5zID0gW1xyXG4gICAge1wid2lkdGhcIjogXCIxMCVcIiwgXCJzQ2xhc3NcIjogXCJoc2wtdGFibGUtcG9ydHJhaXQtdGRcIiwgXCJiU29ydGFibGVcIjogZmFsc2UsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnSGVybycsIFwid2lkdGhcIjogXCIxOCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9UZXh0XCIsIFwiaURhdGFTb3J0XCI6IDIsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2FzYycsICdkZXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9LCAvL2lEYXRhU29ydCB0ZWxscyB3aGljaCBjb2x1bW4gc2hvdWxkIGJlIHVzZWQgYXMgdGhlIHNvcnQgdmFsdWUsIGluIHRoaXMgY2FzZSBIZXJvX1NvcnRcclxuICAgIHtcInRpdGxlXCI6ICdIZXJvX1NvcnQnLCBcInZpc2libGVcIjogZmFsc2UsIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDk5OX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnUm9sZScsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogOTk5fSxcclxuICAgIHtcInRpdGxlXCI6ICdSb2xlX1NwZWNpZmljJywgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiA5OTl9LFxyXG4gICAge1widGl0bGVcIjogJ0dhbWVzIFBsYXllZCcsIFwid2lkdGhcIjogXCIxOCVcIiwgXCJzQ2xhc3NcIjogXCJzb3J0SWNvbl9OdW1iZXJcIiwgXCJzZWFyY2hhYmxlXCI6IGZhbHNlLCBcIm9yZGVyU2VxdWVuY2VcIjogWydkZXNjJywgJ2FzYyddLCBcInJlc3BvbnNpdmVQcmlvcml0eVwiOiAxfSxcclxuICAgIHtcInRpdGxlXCI6ICdHYW1lcyBCYW5uZWQnLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnV2luIFBlcmNlbnQnLCBcIndpZHRoXCI6IFwiMTglXCIsIFwic0NsYXNzXCI6IFwic29ydEljb25fTnVtYmVyXCIsIFwic2VhcmNoYWJsZVwiOiBmYWxzZSwgXCJvcmRlclNlcXVlbmNlXCI6IFsnZGVzYycsICdhc2MnXSwgXCJyZXNwb25zaXZlUHJpb3JpdHlcIjogMX0sXHJcbiAgICB7XCJ0aXRsZVwiOiAnJSDOlCcsIFwid2lkdGhcIjogXCI1JVwiLCBcInNDbGFzc1wiOiBcInNvcnRJY29uX051bWJlclwiLCBcInNlYXJjaGFibGVcIjogZmFsc2UsIFwib3JkZXJTZXF1ZW5jZVwiOiBbJ2Rlc2MnLCAnYXNjJ10sIFwicmVzcG9uc2l2ZVByaW9yaXR5XCI6IDF9XHJcbl07XHJcblxyXG5oZXJvZXNfc3RhdHNsaXN0Lm9yZGVyID0gW1s3LCAnZGVzYyddXTsgLy9UaGUgZGVmYXVsdCBvcmRlcmluZyBvZiB0aGUgdGFibGUgb24gbG9hZCA9PiBjb2x1bW4gOCBhdCBpbmRleCA3IGRlc2NlbmRpbmdcclxuaGVyb2VzX3N0YXRzbGlzdC5wcm9jZXNzaW5nID0gZmFsc2U7IC8vRGlzcGxheXMgYW4gaW5kaWNhdG9yIHdoZW5ldmVyIHRoZSB0YWJsZSBpcyBwcm9jZXNzaW5nIGRhdGFcclxuaGVyb2VzX3N0YXRzbGlzdC5kZWZlclJlbmRlciA9IHRydWU7IC8vRGVmZXJzIHJlbmRlcmluZyB0aGUgdGFibGUgdW50aWwgZGF0YSBzdGFydHMgY29taW5nIGluXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheCA9IHtcclxuICAgIHVybDogaGVyb2RhdGFfaGVyb2VzX3BhdGgsXHJcbiAgICBkYXRhU3JjOiAnZGF0YScsXHJcbiAgICBjYWNoZTogdHJ1ZVxyXG59O1xyXG5oZXJvZXNfc3RhdHNsaXN0LmFqYXgudXJsID0gaGVyb2RhdGFfaGVyb2VzX3BhdGg7IC8vUmVxdWVzdHMgZGF0YSBmcm9tIHRoZSBwYXRoXHJcbmhlcm9lc19zdGF0c2xpc3QuYWpheC5jYWNoZSA9IHRydWU7IC8vQ2FjaGVzIHRoZSBhamF4IHJlc3BvbnNlXHJcbi8vaGVyb2VzX3N0YXRzbGlzdC5wYWdlTGVuZ3RoID0gMjU7IC8vQ29udHJvbHMgaG93IG1hbnkgcm93cyBwZXIgcGFnZVxyXG5oZXJvZXNfc3RhdHNsaXN0LnBhZ2luZyA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBpcyBhbGxvd2VkIHRvIHBhZ2luYXRlIGRhdGEgYnkgcGFnZSBsZW5ndGhcclxuaGVyb2VzX3N0YXRzbGlzdC5yZXNwb25zaXZlID0gdHJ1ZTsgLy9Db250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFibGUgY29sbGFwc2VzIHJlc3BvbnNpdmVseSBhcyBuZWVkXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWCA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgaG9yaXpvbnRhbCBzY3JvbGwgYmFyXHJcbmhlcm9lc19zdGF0c2xpc3Quc2Nyb2xsWSA9IGZhbHNlOyAvL0NvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSB0YWJsZSBjYW4gY3JlYXRlIGEgdmVydGljYWwgc2Nyb2xsIGJhclxyXG5oZXJvZXNfc3RhdHNsaXN0LmRvbSA9ICBcIjwncm93JzwnY29sLXNtLTEyJ3RyPj5cIjsgLy9SZW1vdmUgdGhlIHNlYXJjaCBiYXIgZnJvbSB0aGUgZG9tIGJ5IG1vZGlmeWluZyBib290c3RyYXBzIGRlZmF1bHQgZGF0YXRhYmxlIGRvbSBzdHlsaW5nIChzbyBpIGNhbiBpbXBsZW1lbnQgY3VzdG9tIHNlYXJjaCBiYXIgbGF0ZXIpXHJcbmhlcm9lc19zdGF0c2xpc3QuaW5mbyA9IGZhbHNlOyAvL0NvbnRyb2xzIGRpc3BsYXlpbmcgdGFibGUgY29udHJvbCBpbmZvcm1hdGlvbiwgc3VjaCBhcyBpZiBmaWx0ZXJpbmcgZGlzcGxheWluZyB3aGF0IHJlc3VsdHMgYXJlIHZpZXdlZCBvdXQgb2YgaG93IG1hbnlcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnI2hzbC10YWJsZScpLkRhdGFUYWJsZShoZXJvZXNfc3RhdHNsaXN0KTtcclxuXHJcbiAgICAkKCcjaGVyb2VzLXN0YXRzbGlzdC10b29sYmFyLXNlYXJjaCcpLm9uKFwicHJvcGVydHljaGFuZ2UgY2hhbmdlIGNsaWNrIGtleXVwIGlucHV0IHBhc3RlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoKS5zZWFyY2goJCh0aGlzKS52YWwoKSkuZHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhzbC1yb2xlYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJyNoc2wtdGFibGUnKS5EYXRhVGFibGUoKS5zZWFyY2goJCh0aGlzKS5hdHRyKFwidmFsdWVcIikpLmRyYXcoKTtcclxuICAgIH0pO1xyXG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hc3NldHMvanMvaGVyb2VzLXN0YXRzbGlzdC5qcyJdLCJzb3VyY2VSb290IjoiIn0=