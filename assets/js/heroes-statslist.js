'use strict';

let HeroesStatslist = {};

HeroesStatslist.loading = false;
HeroesStatslist.validateLoad = function(table, baseUrl, filterTypes) {
    if (!HeroesStatslist.loading && HotstatusFilter.validFilters) {
        let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== table.ajax.url()) {
            table.ajax.url(url).load();
        }
    }
};

let heroes_statslist = {};

heroes_statslist.columns = [
    {"width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1},
    {"title": 'Hero', "width": "17%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
    {"title": 'Hero_Sort', "visible": false, "responsivePriority": 999},
    {"title": 'Role', "visible": false, "responsivePriority": 999},
    {"title": 'Role_Specific', "visible": false, "responsivePriority": 999},
    {"title": 'Games Played', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": 'Games Banned', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": 'Popularity', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": 'Win Percent', "width": "17%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1}
];

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
heroes_statslist.dom =  "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
heroes_statslist.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    heroes_statslist.fixedHeader = document.documentElement.clientWidth >= 525;

    //Set the initial url based on default filters
    let baseUrl = Routing.generate('herodata_datatable_heroes_statslist');
    let filterTypes = ["gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    heroes_statslist.ajax.url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

    //Get the datatable object
    let table = $('#hsl-table').DataTable(heroes_statslist);

    //Track datatable processing of ajax data
    table.on('preXhr', function() {
        HeroesStatslist.loading = true;
    });

    table.on('xhr', function() {
        HeroesStatslist.loading = false;
    });

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        HeroesStatslist.validateLoad(table, baseUrl, filterTypes);
    });

    //Search the table for the new value typed in by user
    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function() {
        table.search($(this).val()).draw();
    });

    //Search the table for the new value populated by role button
    $('button.hsl-rolebutton').click(function () {
        table.search($(this).attr("value")).draw();
    });
});