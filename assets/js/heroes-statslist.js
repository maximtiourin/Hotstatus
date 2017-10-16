var heroes_statslist = {};

heroes_statslist.columns = [
    {"width": "10%", "sClass": "hsl-table-portrait-td", "bSortable": false, "searchable": false, "responsivePriority": 1},
    {"title": 'Hero', "width": "18%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc'], "responsivePriority": 1}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
    {"title": 'Hero_Sort', "visible": false, "responsivePriority": 999},
    {"title": 'Role', "visible": false, "responsivePriority": 999},
    {"title": 'Role_Specific', "visible": false, "responsivePriority": 999},
    {"title": 'Games Played', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": 'Games Banned', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": 'Win Percent', "width": "18%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1},
    {"title": '% Δ', "width": "5%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc'], "responsivePriority": 1}
];

heroes_statslist.order = [[7, 'desc']]; //The default ordering of the table on load => column 8 at index 7 descending
heroes_statslist.processing = false; //Displays an indicator whenever the table is processing data
heroes_statslist.deferRender = true; //Defers rendering the table until data starts coming in
heroes_statslist.ajax = herodata_heroes_path; //Requests data from the path
//heroes_statslist.pageLength = 25; //Controls how many rows per page
heroes_statslist.paging = false; //Controls whether or not the table is allowed to paginate data by page length
heroes_statslist.responsive = true; //Controls whether or not the table collapses responsively as need
heroes_statslist.scrollX = false; //Controls whether or not the table can create a horizontal scroll bar
heroes_statslist.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
heroes_statslist.dom =  "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
heroes_statslist.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

$(document).ready(function() {
    $('#hsl-table').DataTable(heroes_statslist);

    $('#heroes-statslist-toolbar-search').on("propertychange change click keyup input paste", function() {
        $('#hsl-table').DataTable().search($(this).val()).draw();
    });

    $('.hsl-rolebutton').click(function () {
        $('#hsl-table').DataTable().search($(this).attr("value")).draw();
    });
});