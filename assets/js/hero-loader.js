/*
 * Hero Loader
 * Handles retrieving hero data through ajax requests based on state of filters
 */
let HeroLoader = {};

/*
 * Handles loading on valid filters, making sure to only fire once until loading is complete
 */
HeroLoader.validateLoad = function(baseUrl, filterTypes) {
    if (!HeroLoader.ajax.internal.loading && HotstatusFilter.validFilters) {
        let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== HeroLoader.ajax.url()) {
            HeroLoader.ajax.url(url).load();
        }
    }
};

/*
 * Handles Ajax requests
 */
HeroLoader.ajax = {
    internal: {
        loading: false, //Whether or not the hero loader is currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function(url = null) {
        let self = HeroLoader.ajax;

        if (url === null) {
            return self.internal.url;
        }
        else {
            self.internal.url = url;
            return self;
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let self = HeroLoader.ajax;

        let data = HeroLoader.data;
        let data_herodata = data.herodata;
        let data_stats = data.stats;
        let data_abilities = data.abilities;
        let data_talents = data.talents;
        let data_builds = data.builds;
        let data_graphs = data.graphs;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_herodata = json['herodata'];
                let json_stats = json['stats'];
                let json_abilities = json['abilities'];
                let json_talents = json['talents'];
                let json_builds = json['builds'];

                /*
                 * Empty dynamically filled containers
                 */
                data_herodata.empty();
                data_abilities.empty();
                data_talents.empty();
                data_builds.empty();
                data_graphs.empty();

                /*
                 * Heroloader Container
                 */
                $('#heroloader-container').removeClass('initial-load');

                /*
                 * Window
                 */
                data.window.title(json_herodata['name']);
                data.window.url(json_herodata['name']);

                /*
                 * Herodata
                 */
                //Create image composite container
                data_herodata.generateImageCompositeContainer(json_herodata['desc_tagline'], json_herodata['desc_bio']);
                //image_hero
                data_herodata.image_hero(json_herodata['image_hero'], json_herodata['rarity']);
                //name
                data_herodata.name(json_herodata['name']);
                //title
                data_herodata.title(json_herodata['title']);

                /*
                 * Stats
                 */
                for (let statkey in average_stats) {
                    if (average_stats.hasOwnProperty(statkey)) {
                        let stat = average_stats[statkey];

                        if (stat.type === 'avg-pmin') {
                            data_stats.avg_pmin(statkey, json_stats[statkey]['average'], json_stats[statkey]['per_minute']);
                        }
                        else if (stat.type === 'percentage') {
                            data_stats.percentage(statkey, json_stats[statkey]);
                        }
                        else if (stat.type === 'kda') {
                            data_stats.kda(statkey, json_stats[statkey]['average']);
                        }
                        else if (stat.type === 'raw') {
                            data_stats.raw(statkey, json_stats[statkey]);
                        }
                        else if (stat.type === 'time-spent-dead') {
                            data_stats.time_spent_dead(statkey, json_stats[statkey]['average']);
                        }
                    }
                }

                /*
                 * Abilities
                 */
                let abilityOrder = ["Normal", "Heroic", "Trait"];
                for (let type of abilityOrder) {
                    data_abilities.beginInner(type);
                    for (let ability of json_abilities[type]) {
                        data_abilities.generate(type, ability['name'], ability['desc_simple'], ability['image']);
                    }
                }

                /*
                 * Talents
                 */
                //Define Talents DataTable and generate table structure
                data_talents.generateTable();

                let talents_datatable = data_talents.getTableConfig();

                //Initialize talents datatable data array
                talents_datatable.data = [];

                //Collapsed object of all talents for hero, for use with displaying builds
                let talentsCollapsed = {};

                //Loop through talent table to collect talents
                for (let r = json_talents['minRow']; r <= json_talents['maxRow']; r++) {
                    let rkey = r + '';
                    let tier = json_talents[rkey]['tier'];

                    //Build columns for Datatable
                    for (let c = json_talents[rkey]['minCol']; c <= json_talents[rkey]['maxCol']; c++) {
                        let ckey = c + '';

                        let talent = json_talents[rkey][ckey];

                        //Add talent to collapsed obj
                        talentsCollapsed[talent['name_internal']] = {
                            name: talent['name'],
                            desc_simple: talent['desc_simple'],
                            image: talent['image']
                        };

                        //Create datatable row
                        talents_datatable.data.push(data_talents.generateTableData(r, c, tier, talent['name'], talent['desc_simple'],
                            talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_percentOnRange'], talent['winrate_display']));
                    }
                }

                //Init Talents Datatable
                data_talents.initTable(talents_datatable);

                /*
                 * Talent Builds
                 */
                //Define Builds DataTable and generate table structure
                data_builds.generateTable();

                let builds_datatable = data_builds.getTableConfig(Object.keys(json_builds).length);

                //Initialize builds datatable data array
                builds_datatable.data = [];

                //Loop through builds
                for (let bkey in json_builds) {
                    if (json_builds.hasOwnProperty(bkey)) {
                        let build = json_builds[bkey];

                        //Create datatable row
                        builds_datatable.data.push(data_builds.generateTableData(talentsCollapsed, build.talents, build.pickrate, build.popularity,
                            build.popularity_percentOnRange, build.winrate, build.winrate_percentOnRange, build.winrate_display));
                    }
                }

                //Init Builds DataTable
                data_builds.initTable(builds_datatable);

                /*
                 * Graphs
                 */
                //Stat Matrix
                data_graphs.generateStatMatrix(null, null); //TODO - Have to flesh out

                //Spacer
                data_graphs.generateSpacer();

                //Winrate over Match Length
                data_graphs.generateMatchLengthWinratesGraph(json_stats['range_match_length'], json_stats['winrate_raw']);

                //Spacer
                data_graphs.generateSpacer();

                //Winrate over Hero Level
                data_graphs.generateHeroLevelWinratesGraph(json_stats['range_hero_level'], json_stats['winrate_raw']);


                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();

                /*
                 * Enable advertising
                 */
                Hotstatus.advertising.generateAdvertising();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                //Disable Processing Indicator
                $('.heroloader-processing').remove();

                self.internal.loading = false;
            });

        return self;
    }
};

/*
 * Handles binding data to the page
 */
HeroLoader.data = {
    window: {
        title: function(str) {
            document.title = "Hotstat.us: " + str;
        },
        url: function(hero) {
            let url = Routing.generate("hero", {heroProperName: hero});
            history.replaceState(hero, hero, url);
        }
    },
    herodata: {
        generateImageCompositeContainer: function(tagline, bio) {
            let self = HeroLoader.data.herodata;

            let tooltipTemplate = '<div class=\'tooltip\' role=\'tooltip\'><div class=\'arrow\'></div>' +
                '<div class=\'herodata-bio tooltip-inner\'></div></div>';

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-template="' + tooltipTemplate + '" ' +
                'data-html="true" title="' + self.image_hero_tooltip(tagline, bio) + '"><div id="hl-herodata-image-hero-container"></div>' +
                '<span id="hl-herodata-name"></span><span id="hl-herodata-title"></span></span>');
        },
        name: function(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function(val) {
            $('#hl-herodata-title').text(val);
        },
        image_hero: function(image, rarity) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero hl-herodata-rarity-' + rarity + '" src="' + image + '">');
        },
        image_hero_tooltip: function(tagline, bio) {
            return '<span class=\'hl-talents-tooltip-name\'>' + tagline + '</span><br>' + bio;
        },
        empty: function() {
            $('#hl-herodata-image-hero-composite-container').empty();
        }
    },
    stats: {
        avg_pmin: function(key, avg, pmin) {
            $('#hl-stats-' + key + '-avg').text(avg);
            $('#hl-stats-' + key + '-pmin').text(pmin);
        },
        percentage: function(key, percentage) {
            $('#hl-stats-' + key + '-percentage').html(percentage);
        },
        kda: function(key, kda) {
            $('#hl-stats-' + key + '-kda').text(kda);
        },
        raw: function(key, rawval) {
            $('#hl-stats-' + key + '-raw').text(rawval);
        },
        time_spent_dead: function(key, time_spent_dead) {
            $('#hl-stats-' + key + '-time-spent-dead').text(time_spent_dead);
        },
    },
    abilities: {
        beginInner: function(type) {
          $('#hl-abilities-container').append('<div id="hl-abilities-inner-' + type + '" class="hl-abilities-inner"></div>');
        },
        generate: function(type, name, desc, imagepath) {
            let self = HeroLoader.data.abilities;
            $('#hl-abilities-inner-' + type).append('<div class="hl-abilities-ability"><span data-toggle="tooltip" data-html="true" title="' + self.tooltip(type, name, desc) + '">' +
                '<img class="hl-abilities-ability-image" src="' + imagepath + '"><img class="hl-abilities-ability-image-frame" src="' + image_base_path + 'ui/ability_icon_frame.png">' +
                '</span></div>');
        },
        empty: function() {
            $('#hl-abilities-container').empty();
        },
        tooltip: function(type, name, desc) {
            if (type === "Heroic" || type === "Trait") {
                return '<span class=\'hl-abilities-tooltip-' + type + '\'>[' + type + ']</span><br><span class=\'hl-abilities-tooltip-name\'>' + name + '</span><br>' + desc;
            }
            else {
                return '<span class=\'hl-abilities-tooltip-name\'>' + name + '</span><br>' + desc;
            }
        }
    },
    talents: {
        generateTable: function(rowId) {
            $('#hl-talents-container').append('<table id="hl-talents-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function(r, c, tier, name, desc, image, pickrate, popularity, winrate, winrate_percentOnRange, winrateDisplay) {
            let self = HeroLoader.data.talents;

            let talentField = '<span data-toggle="tooltip" data-html="true" title="' + self.tooltip(name, desc) + '">' +
            '<span class="hl-no-wrap hl-row-height"><img class="hl-talents-talent-image" src="' + image + '">' +
            ' <span class="hl-talents-talent-name">' + name + '</span></span></span>';

            let pickrateField = '<span class="hl-row-height">' + pickrate + '</span>';

            let popularityField = '<span class="hl-row-height">' + popularity + '%<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + popularity + '%;"></div></span>';

            let winrateField = '';
            if (winrate > 0) {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:'+ winrate_percentOnRange + '%;"></div></span>';
            }
            else {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '</span>';
            }

            return [r, c, tier, talentField, pickrateField, popularityField, winrateField];
        },
        initTable: function(dataTableConfig) {
            $('#hl-talents-table').DataTable(dataTableConfig);
        },
        getTableConfig: function() {
            let datatable = {};

            //Columns definition
            datatable.columns = [
                {"title": "Tier_Row", "visible": false, "bSortable": false},
                {"title": "Tier_Col", "visible": false, "bSortable": false},
                {"title": "Tier", "visible": false, "bSortable": false},
                {"title": "Talent", "width": "40%", "bSortable": false},
                {"title": "Played", "width": "20%", "bSortable": false},
                {"title": "Popularity", "width": "20%", "bSortable": false},
                {"title": "Winrate", "width": "20%", "bSortable": false},
            ];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[0, 'asc'], [1, 'asc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.paging = false; //Controls whether or not the table is allowed to paginate data by page length
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function(settings) {
                let api = this.api();
                let rows = api.rows({page: 'current'}).nodes();
                let last = null;

                api.column(2, {page: 'current'}).data().each(function (group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before('<tr class="group tier"><td colspan="7">' + group + '</td></tr>');

                        last = group;
                    }
                });
            };

            return datatable;
        },
        empty: function() {
            $('#hl-talents-container').empty();
        },
        tooltip: function(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    },
    builds: {
        generateTable: function(rowId) {
            $('#hl-talents-builds-container').append('<table id="hl-talents-builds-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function(talents, buildTalents, pickrate, popularity, popularity_percentOnRange, winrate, winrate_percentOnRange, winrateDisplay) {
            let self = HeroLoader.data.builds;

            let talentField = '';
            for (let talentNameInternal of buildTalents) {
                if (talents.hasOwnProperty(talentNameInternal)) {
                    let talent = talents[talentNameInternal];

                    talentField += self.generateFieldTalentImage(talent.name, talent.desc_simple, talent.image);
                }
            }

            let pickrateField = '<span class="hl-row-height">' + pickrate + '</span>';

            let popularityField = '<span class="hl-row-height">' + popularity + '%<div class="hsl-percentbar hsl-percentbar-popularity" style="width:' + popularity_percentOnRange + '%;"></div></span>';

            let winrateField = '';
            if (winrate > 0) {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '<div class="hsl-percentbar hsl-percentbar-winrate" style="width:'+ winrate_percentOnRange + '%;"></div></span>';
            }
            else {
                winrateField = '<span class="hl-row-height">' + winrateDisplay + '</span>';
            }

            return [talentField, pickrateField, popularityField, winrateField];
        },
        generateFieldTalentImage: function(name, desc, image) {
            let that = HeroLoader.data.talents;

            return '<span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="' + that.tooltip(name, desc) + '">' +
                '<span class="hl-no-wrap hl-row-height"><img class="hl-builds-talent-image" src="' + image + '">' +
                '</span></span>';
        },
        initTable: function(dataTableConfig) {
            $('#hl-talents-builds-table').DataTable(dataTableConfig);
        },
        getTableConfig: function(rowLength) {
            let datatable = {};

            //Columns definition
            datatable.columns = [
                {"title": "Talent Build", "width": "40%", "bSortable": false},
                {"title": "Played", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc']},
                {"title": "Popularity", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc']},
                {"title": "Winrate", "width": "20%", "sClass": "sortIcon_Number", "orderSequence": ['desc', 'asc']},
            ];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: 'Build Data is currently limited for this Hero. Increase date range or wait for more data.' //Message when table is empty regardless of filtering
            };

            datatable.order = [[1, 'desc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            //datatable.pagingType = "simple_numbers";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function() {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        empty: function() {
            $('#hl-talents-builds-container').empty();
        },
    },
    graphs: {
        internal: {
            charts: []
        },
        resize: function() {
            if (document.documentElement.clientWidth >= 992) {
                $('#hl-graphs-collapse').removeClass('collapse');
            }
            else {
                $('#hl-graphs-collapse').addClass('collapse');
            }
        },
        generateSpacer: function() {
            $('#hl-graphs').append('<div class="hl-graph-spacer"></div>');
        },
        generateMatchLengthWinratesGraph: function(winrates, avgWinrate) {
            let self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-matchlength-winrate">' +
                '<div class="hl-graph-chart-container" style="position: relative; height:200px">' +
                '<canvas id="hl-graph-matchlength-winrate-chart"></canvas></div></div>');

            //Create chart
            let cwinrates = [];
            let cavgwinrate = [];
            for (let wkey in winrates) {
                if (winrates.hasOwnProperty(wkey)) {
                    let winrate = winrates[wkey];
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            let data = {
                labels: Object.keys(winrates),
                datasets: [
                    {
                        label: "Base Winrate",
                        data: cavgwinrate,
                        borderColor: "#28c2ff",
                        borderWidth: 2,
                        pointRadius: 2,
                        fill: false
                    },
                    {
                        label: "Match Length Winrate",
                        data: cwinrates,
                        backgroundColor: "rgba(34, 125, 37, 1)", //#227d25
                        borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                        borderWidth: 2,
                        pointRadius: 2
                    }
                ]
            };

            let options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Winrate",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            callback: function (value, index, values) {
                                return value + '%';
                            },
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Match Length (Minutes)",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            autoSkip: false,
                            labelOffset: 10,
                            minRotation: 30,
                            maxRotation: 30,
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }]
                }
            };

            let chart = new Chart($('#hl-graph-matchlength-winrate-chart'), {
                type: 'line',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        generateHeroLevelWinratesGraph: function(winrates, avgWinrate) {
            let self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-herolevel-winrate">' +
                '<div class="hl-graph-chart-container" style="position: relative; height:200px">' +
                '<canvas id="hl-graph-herolevel-winrate-chart"></canvas></div></div>');

            //Create chart
            let cwinrates = [];
            let cavgwinrate = [];
            for (let wkey in winrates) {
                if (winrates.hasOwnProperty(wkey)) {
                    let winrate = winrates[wkey];
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            let data = {
                labels: Object.keys(winrates),
                datasets: [
                    {
                        label: "Base Winrate",
                        data: cavgwinrate,
                        borderColor: "#28c2ff",
                        borderWidth: 2,
                        pointRadius: 2,
                        fill: false
                    },
                    {
                        label: "Hero Level Winrate",
                        data: cwinrates,
                        backgroundColor: "rgba(34, 125, 37, 1)", //#227d25
                        borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                        borderWidth: 2,
                        pointRadius: 2
                    }
                ]
            };

            let options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Winrate",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            callback: function (value, index, values) {
                                return value + '%';
                            },
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Hero Level",
                            fontColor: "#ada2c3",
                            fontSize: 14
                        },
                        ticks: {
                            autoSkip: false,
                            labelOffset: 10,
                            minRotation: 30,
                            maxRotation: 30,
                            fontColor: "#716787",
                            fontSize: 12
                        },
                        gridLines: {
                            lineWidth: 2
                        }
                    }]
                }
            };

            let chart = new Chart($('#hl-graph-herolevel-winrate-chart'), {
                type: 'line',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        generateStatMatrix: function(heroStats, minMaxTotalHeroStats) {
            //TODO - have to flesh out
            let self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-statmatrix">' +
                '<div class="hl-graph-chart-container" style="position: relative; height:200px">' +
                '<canvas id="hl-graph-statmatrix-chart"></canvas></div></div>');

            //Create chart
            let data = {
                labels: ["Healer", "Tank", "Safety", "Demolition", "Damage", "Waveclear", "Exp Soak", "Merc Camps"],
                datasets: [
                    {
                        data: [.8, .2, .3, .05, 0, .5],
                        backgroundColor: "rgba(165, 255, 248, 1)", //#a5fff8
                        borderColor: "rgba(184, 255, 193, 1)", //#b8ffc1
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            };

            let options = {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                hover: {
                    mode: null
                },
                scale: {
                    pointLabels: {
                        fontColor: "#ada2c3",
                        fontFamily: "Arial sans-serif",
                        fontStyle: "normal",
                        fontSize: 11
                    },
                    ticks: {
                        maxTicksLimit: 1,
                        display: false
                    },
                    gridLines: {
                        lineWidth: 2
                    },
                    angleLines: {
                        lineWidth: 1
                    }
                }
            };

            let chart = new Chart($('#hl-graph-statmatrix-chart'), {
                type: 'radar',
                data: data,
                options: options
            });

            self.internal.charts.push(chart);
        },
        empty: function() {
            let self = HeroLoader.data.graphs;

            for (let chart of self.internal.charts) {
                chart.destroy();
            }

            self.internal.charts.length = 0;

            $('#hl-graphs').empty();
        }
    }
};


$(document).ready(function() {
    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('herodata_pagedata_hero');
    let filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Track window width and toggle collapsability for graphs pane
    HeroLoader.data.graphs.resize();
    $(window).resize(function(){
        HeroLoader.data.graphs.resize();
    });

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        HeroLoader.validateLoad(baseUrl, filterTypes);
    });
});