var heroes_statslist = {};

heroes_statslist.data = [];

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
}

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
    {"title": 'Role', "visible": false},
    {"title": 'Role_Specific', "visible": false},
    {"title": 'Win %', "responsivePriority": 3},
    {"title": 'Play %', "responsivePriority": 4},
    {"title": 'Ban %', "responsivePriority": 5},
    {"title": 'Win Delta %', "responsivePriority": 6}
];

heroes_statslist.order = [[0, 'asc']];

heroes_statslist.processing = false;
//heroes_statslist.pageLength = 25;
heroes_statslist.paging = false;
heroes_statslist.responsive = true;
heroes_statslist.scrollX = false;
heroes_statslist.scrollY = false;

$(document).ready(function() {
    $('#hsl-table').DataTable(heroes_statslist);
});