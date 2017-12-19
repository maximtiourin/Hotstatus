/*
 * Player Hero Loader
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
        let data_talents = data.talents;
        let data_builds = data.builds;
        let data_medals = data.medals;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_herodata = json['herodata'];
                let json_stats = json['stats'];
                let json_talents = json['talents'];
                let json_builds = json['builds'];
                let json_medals = json['medals'];

                /*
                 * Empty dynamically filled containers
                 */
                data_herodata.empty();
                data_talents.empty();
                data_builds.empty();
                data_medals.empty();

                /*
                 * Heroloader Container
                 */
                $('.initial-load').removeClass('initial-load');

                /*
                 * Window
                 */
                data.window.title(json_herodata['name']);
                data.window.url(json_herodata['name']);

                /*
                 * Herodata
                 */
                //Create image composite container
                data_herodata.generateImageCompositeContainer(json.last_updated);
                //image_hero
                data_herodata.image_hero(json_herodata['image_hero']);
                //name
                data_herodata.name(json_herodata['name']);

                /*
                 * Stats
                 */
                //Player Hero Loader - Special Stat - Played
                data_stats.played(json_stats.played);

                //Other stats
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

                        let oldtalent = json_talents[rkey][ckey];

                        if (oldtalent.hasOwnProperty("name")) {
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
                        else {
                            for (let cinner = 0; cinner < json_talents[rkey][ckey].length; cinner++) {
                                let talent = json_talents[rkey][ckey][cinner];

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
                 * Medals
                 */
                data_medals.generateMedalsPane(json_medals);


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
            document.title = "Hotstat.us: " + str + " (" + player_name +"#"+ player_tag + ")";
        },
        url: function(hero) {
            let url = Routing.generate("playerhero", {region: player_region, id: player_id, heroProperName: hero});
            history.replaceState(hero, hero, url);
        },
        showInitialCollapse: function() {
            $('#average_stats').collapse('show');
        }
    },
    herodata: {
        generateImageCompositeContainer: function(last_updated_timestamp) {
            let date = (new Date(last_updated_timestamp * 1000)).toLocaleString();

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-html="true" title="<div class=\'lastupdated-text\'>Last Updated: '+ date +'.</div>"><div id="hl-herodata-image-hero-container"></div>' +
                '<span id="hl-herodata-name"></span></span>');
        },
        name: function(val) {
            $('#hl-herodata-name').text(val);
        },
        image_hero: function(image) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero" src="' + image_base_path + image + '.png">');
        },
        empty: function() {
            $('#hl-herodata-image-hero-composite-container').empty();
        }
    },
    stats: {
        played: function(rawval) {
            $('#p-hl-stats-played').text(rawval);
        },
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
    talents: {
        generateTable: function(rowId) {
            $('#hl-talents-container').append('<table id="hl-talents-table" class="hsl-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateTableData: function(r, c, tier, name, desc, image, pickrate, popularity, winrate, winrate_percentOnRange, winrateDisplay) {
            let self = HeroLoader.data.talents;

            let talentField = '<span data-toggle="tooltip" data-html="true" title="' + self.tooltip(name, desc) + '">' +
            '<span class="hl-no-wrap hl-row-height"><img class="hl-talents-talent-image" src="' + image_base_path + image + '.png">' +
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
        generateTable: function() {
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
                '<span class="hl-no-wrap hl-row-height"><img class="hl-builds-talent-image" src="' + image_base_path + image + '.png">' +
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
                emptyTable: 'Your build data is currently limited for this hero. Play a complete build more than once to see its statistics.' //Message when table is empty regardless of filtering
            };

            datatable.order = [[1, 'desc'],[3, 'desc']];

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
    medals: {
        generateMedalsPane: function (medals) {
            if (medals.length > 0) {
                let self = HeroLoader.data.medals;

                let medalRows = '';
                for (let medal of medals) {
                    medalRows += self.generateMedalRow(medal);
                }


                $('#hl-medals-container').append('<div class="row"><div class="col"><div class="hotstatus-subcontainer">' +
                    '<span class="hl-stats-title">Top Medals</span>' +
                    '<div class="row"><div class="col padding-horizontal-0">' + medalRows + '</div></div>' +
                    '</div></div></div>');
            }
        },
        generateMedalRow: function(medal) {
            let self = HeroLoader.data.medals;

            return '<span data-toggle="tooltip" data-html="true" title="' + medal.desc_simple + '"><div class="row hl-medals-row"><div class="col">' +
                '<div class="col">' + self.generateMedalImage(medal) + '</div>' +
                '<div class="col hl-no-wrap">' + self.generateMedalEntry(medal) + '</div>' +
                '<div class="col">' + self.generateMedalEntryPercentBar(medal) + '</div>' +
                '</div></div></span>';
        },
        generateMedalImage: function(medal) {
            return '<div class="hl-medals-line"><img class="hl-medals-image" src="' + image_base_path + medal.image_blue + '.png"></div>';
        },
        generateMedalEntry: function(medal) {
            return '<div class="hl-medals-line"><span class="hl-medals-name">' + medal.name + '</span></div>';
        },
        generateMedalEntryPercentBar: function(medal) {
            return '<div class="hl-medals-line"><div class="hl-medals-percentbar" style="width:' + (medal.value * 100) + '%"></div></div>';
        },
        empty: function() {
            $('#hl-medals-container').empty();
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_player_hero', {
        region: player_region,
        player: player_id
    });
    let filterTypes = ["season", "hero", "gameType", "map"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Show initial collapses
    //HeroLoader.data.window.showInitialCollapse();

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        HeroLoader.validateLoad(baseUrl, filterTypes);
    });
});