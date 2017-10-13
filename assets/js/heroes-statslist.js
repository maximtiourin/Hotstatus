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

heroes_statslist.columns = [
    {"width": 50, "searchable": false, "responsivePriority": 1},
    {"title": 'Hero', "width": 100, "responsivePriority": 2},
    {"title": 'Hero_Sort', "visible": false},
    {"title": 'Role', "visible": false},
    {"title": 'Role_Specific', "visible": false},
    {"title": 'Win %', "searchable": false, "responsivePriority": 3},
    {"title": 'Play %', "searchable": false, "responsivePriority": 4},
    {"title": 'Ban %', "searchable": false, "responsivePriority": 5},
    {"title": 'Win Delta %', "searchable": false,"responsivePriority": 6}
];

heroes_statslist.order = [[0, 'asc']]; //The default ordering of the table on load => column 0 ascending
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