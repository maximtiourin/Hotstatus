var heroes_statslist = {};

heroes_statslist.data = [
    ['Abathur',     'Utility',  48.89,   15.34,  1.34,    -.49],
    ['Tyrande',     'Support',  52.34,   21.12,  16.73,   4.82],
    ['Kharazim',    'Healer',   51.45,   12.83,  4.92,    1.34],
    ['Li Li',       'Healer',   53.62,   18.78,  8.14,    .89],
    ['Diablo',      'Tank',     57.10,   9.18,   2.16,    3.14]
];

heroes_statslist.columns = [
    {title: 'Hero'},
    {title: 'Role'},
    {title: 'Win %'},
    {title: 'Play %'},
    {title: 'Ban %'},
    {title: 'Win Delta %'}
];

heroes_statslist.order = [[0, 'asc']];

$(document).ready(function() {
    $('#hsl-table').DataTable(heroes_statslist);
});