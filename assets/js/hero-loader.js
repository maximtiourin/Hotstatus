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
        let data_medals = data.medals;
        let data_graphs = data.graphs;
        let data_matchups = data.matchups;

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
                let json_medals = json['medals'];
                let json_statMatrix = json['statMatrix'];
                let json_matchups = json['matchups'];

                /*
                 * Empty dynamically filled containers
                 */
                data_herodata.empty();
                data_abilities.empty();
                data_talents.empty();
                data_builds.empty();
                data_medals.empty();
                data_graphs.empty();
                data_matchups.empty();

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
                data_herodata.generateImageCompositeContainer(json_herodata['universe'], json_herodata['difficulty'],
                    json_herodata['role_blizzard'], json_herodata['role_specific'],
                    json_herodata['desc_tagline'], json_herodata['desc_bio'], json.last_updated);
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

                /*
                 * Graphs
                 */
                //Stat Matrix
                data_graphs.generateStatMatrix(json_statMatrix);

                //Spacer
                data_graphs.generateSpacer();

                //Winrate over Match Length
                data_graphs.generateMatchLengthWinratesGraph(json_stats['range_match_length'], json_stats['winrate_raw']);

                //Spacer
                data_graphs.generateSpacer();

                //Winrate over Hero Level
                data_graphs.generateHeroLevelWinratesGraph(json_stats['range_hero_level'], json_stats['winrate_raw']);

                /*
                 * Matchups
                 */
                if (json_matchups['foes_count'] > 0 || json_matchups['friends_count'] > 0) {
                    //Generate matchups container
                    data_matchups.generateMatchupsContainer();

                    /*
                     * Foes
                     */
                    if (json_matchups['foes_count'] > 0) {
                        //Define Matchup DataTables and generate table structure
                        data_matchups.generateFoesTable();

                        let matchup_foes_datatable = data_matchups.getFoesTableConfig(json_matchups['foes_count']);

                        //Initialize builds datatable data array
                        matchup_foes_datatable.data = [];

                        //Loop through foes
                        for (let mkey in json_matchups.foes) {
                            if (json_matchups.foes.hasOwnProperty(mkey)) {
                                let matchup = json_matchups.foes[mkey];

                                //Create datatable row
                                matchup_foes_datatable.data.push(data_matchups.generateTableData(mkey, matchup, json_stats.winrate_raw));
                            }
                        }

                        //Init Matchup DataTables
                        data_matchups.initFoesTable(matchup_foes_datatable);
                    }

                    /*
                     * Friends
                     */
                    if (json_matchups['friends_count'] > 0) {
                        //Define Matchup DataTables and generate table structure
                        data_matchups.generateFriendsTable();

                        let matchup_friends_datatable = data_matchups.getFriendsTableConfig(json_matchups['friends_count']);

                        //Initialize builds datatable data array
                        matchup_friends_datatable.data = [];

                        //Loop through friends
                        for (let mkey in json_matchups.friends) {
                            if (json_matchups.friends.hasOwnProperty(mkey)) {
                                let matchup = json_matchups.friends[mkey];

                                //Create datatable row
                                matchup_friends_datatable.data.push(data_matchups.generateTableData(mkey, matchup, json_stats.winrate_raw));
                            }
                        }

                        //Init Matchup DataTables
                        data_matchups.initFriendsTable(matchup_friends_datatable);
                    }
                }


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
        },
        showInitialCollapse: function() {
            $('#average_stats').collapse('show');
        }
    },
    herodata: {
        generateImageCompositeContainer: function(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) {
            let self = HeroLoader.data.herodata;

            let tooltipTemplate = '<div class=\'tooltip\' role=\'tooltip\'><div class=\'arrow\'></div>' +
                '<div class=\'herodata-bio tooltip-inner\'></div></div>';

            $('#hl-herodata-image-hero-composite-container').append('<span data-toggle="tooltip" data-template="' + tooltipTemplate + '" ' +
                'data-html="true" title="' + self.image_hero_tooltip(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) + '"><div id="hl-herodata-image-hero-container"></div>' +
                '<span id="hl-herodata-name"></span><span id="hl-herodata-title"></span></span>');
        },
        name: function(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function(val) {
            $('#hl-herodata-title').text(val);
        },
        image_hero: function(image, rarity) {
            $('#hl-herodata-image-hero-container').append('<img class="hl-herodata-image-hero hl-herodata-rarity-' + rarity + '" src="' + image_base_path + image + '.png">');
        },
        image_hero_tooltip: function(universe, difficulty, roleBlizzard, roleSpecific, tagline, bio, last_updated_timestamp) {
            let date = (new Date(last_updated_timestamp * 1000)).toLocaleString();

            return '<span class=\'hl-herodata-tooltip-universe\'>[' + universe + ']</span><br>' +
                '<span class=\'hl-herodata-tooltip-role\'>' + roleBlizzard + ' - ' + roleSpecific + '</span><br>' +
                '<span class=\'hl-herodata-tooltip-difficulty\'>(Difficulty: ' + difficulty + ')</span><br>' +
                '<span class=\'hl-talents-tooltip-name\'>' + tagline + '</span><br>' + bio + '<br>' +
                '<div class=\'lastupdated-text\'>Last Updated: '+ date +'.</div>';
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
                '<img class="hl-abilities-ability-image" src="' + image_base_path + imagepath + '.png"><img class="hl-abilities-ability-image-frame" src="' + image_base_path + 'ui/ability_icon_frame.png">' +
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
                else {
                    talentField += self.generateFieldTalentImage(talentNameInternal, "Talent no longer exists...", "storm_ui_icon_monk_trait1");
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
                emptyTable: 'Build Data is currently limited for this Hero. Increase date range or wait for more data.' //Message when table is empty regardless of filtering
            };

            datatable.order = [[1, 'desc'], [3, 'desc']];

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
    },
    graphs: {
        internal: {
            charts: [],
            collapse: {
                init: false,
                enabled: false
            }
        },
        resize: function() {
            let self = HeroLoader.data.graphs;
            let widthBreakpoint = 992;

            if (!self.internal.collapse.init) {
                if (document.documentElement.clientWidth >= widthBreakpoint) {
                    $('#hl-graphs-collapse').removeClass('collapse');
                    self.internal.collapse.enabled = false;
                    self.internal.collapse.init = true;
                }
                else {
                    $('#hl-graphs-collapse').addClass('collapse');
                    self.internal.collapse.enabled = true;
                    self.internal.collapse.init = true;
                }
            }
            else {
                if (self.internal.collapse.enabled && document.documentElement.clientWidth >= widthBreakpoint) {
                    $('#hl-graphs-collapse').removeClass('collapse');
                    self.internal.collapse.enabled = false;
                }
                else if (!self.internal.collapse.enabled && document.documentElement.clientWidth < widthBreakpoint) {
                    $('#hl-graphs-collapse').addClass('collapse');
                    self.internal.collapse.enabled = true;
                }
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
            let keymap = [
                "0-10",
                "11-15",
                "16-20",
                "21-25",
                "26-30",
                "31+"
            ];

            let ckeys = [];
            let cwinrates = [];
            let cavgwinrate = [];
            for (let wkey of keymap) {
                if (winrates.hasOwnProperty(wkey)) {
                    let winrate = winrates[wkey];
                    ckeys.push(wkey);
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            let data = {
                labels: ckeys,
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
            let keymap = [
                "1-5",
                "6-10",
                "11-15",
                "16+"
            ];

            let ckeys = [];
            let cwinrates = [];
            let cavgwinrate = [];
            for (let wkey of keymap) {
                if (winrates.hasOwnProperty(wkey)) {
                    let winrate = winrates[wkey];
                    ckeys.push(wkey);
                    cwinrates.push(winrate);
                    cavgwinrate.push(avgWinrate);
                }
            }

            let data = {
                labels: ckeys,
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
        generateStatMatrix: function(heroStatMatrix) {
            let self = HeroLoader.data.graphs;

            $('#hl-graphs').append('<div id="hl-graph-statmatrix">' +
                '<div class="hl-graph-chart-container" style="position: relative; height:200px">' +
                '<canvas id="hl-graph-statmatrix-chart"></canvas></div></div>');

            //Get matrix keys
            let matrixSortMap = [
                "Healer",
                "Safety",
                "Demolition",
                "Damage",
                "Tank",
                "Waveclear",
                "Exp Contrib",
                "Merc Camps"
            ];

            let matrixKeys = [];
            let matrixVals = [];

            for (let smkey of matrixSortMap) {
                if (heroStatMatrix.hasOwnProperty(smkey)) {
                    matrixKeys.push(smkey);
                    matrixVals.push(heroStatMatrix[smkey]);
                }
            }

            //Create chart
            let data = {
                labels: matrixKeys,
                datasets: [
                    {
                        data: matrixVals,
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
                        display: false,
                        min: 0,
                        max: 1.0
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
    },
    matchups: {
        generateMatchupsContainer: function() {
            $('#hl-matchups-container').append('<div class="hotstatus-subcontainer"><div class="row"><div class="col-lg-6 padding-lg-right-0"><div id="hl-matchups-foes-container"></div></div>' +
                '<div class="col-lg-6 padding-lg-left-0"><div id="hl-matchups-friends-container"></div></div></div></div>');
        },
        generateTableData: function(hero, matchupData, mainHeroWinrate) {
            let self = HeroLoader.data.matchups;

            let imageField = '<img class="hl-matchups-image" src="' + image_base_path + matchupData.image + '.png">';

            let heroField = '<span class="hl-row-height"><a class="hsl-link" href="'+ Routing.generate('hero', {heroProperName: hero}) +'" target="_blank">' + hero + '</a></span>';

            let heroSortField = matchupData.name_sort;
            let roleField = matchupData.role_blizzard;
            let roleSpecificField = matchupData.role_specific;

            let playedField = '<span class="hl-row-height">' + matchupData.played + '</span>';

            let winrateField = '<span class="hl-row-height">' + matchupData.winrate_display + '</span>';

            let edgeWinrate = matchupData.winrate - mainHeroWinrate;

            let colorclass = "hl-number-winrate-red";
            let sign = '';
            if (edgeWinrate > 0) {
                colorclass = "hl-number-winrate-green";
                sign = '+';
            }
            let edgeField = '<span class="'+ colorclass +'">'+ sign + edgeWinrate.toFixed(1) +'%</span>';

            return [imageField, heroField, heroSortField, roleField, roleSpecificField, playedField, winrateField, edgeField];
        },
        generateFoesTable: function() {
            $('#hl-matchups-foes-container').append('<table id="hl-matchups-foes-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateFriendsTable: function() {
            $('#hl-matchups-friends-container').append('<table id="hl-matchups-friends-table" class="hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        getFoesTableConfig: function(rowLength) {
            let datatable = {};

            //Columns definition
            datatable.columns = [
                {"width": "10%", "bSortable": false, "searchable": false},
                {"title": 'Foe', "width": "25%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc']}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
                {"title": 'Hero_Sort', "visible": false},
                {"title": 'Role', "visible": false},
                {"title": 'Role_Specific', "visible": false},
                {"title": 'Played Against', "width": "25%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
                {"title": 'Wins Against', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
                {"title": 'Edge', "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
            ];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[7, 'asc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        getFriendsTableConfig: function(rowLength) {
            let datatable = {};

            //Columns definition
            datatable.columns = [
                {"width": "10%", "bSortable": false, "searchable": false},
                {"title": 'Friend', "width": "25%", "sClass": "sortIcon_Text", "iDataSort": 2, "orderSequence": ['asc', 'desc']}, //iDataSort tells which column should be used as the sort value, in this case Hero_Sort
                {"title": 'Hero_Sort', "visible": false},
                {"title": 'Role', "visible": false},
                {"title": 'Role_Specific', "visible": false},
                {"title": 'Played With', "width": "25%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
                {"title": 'Wins With', "width": "30%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
                {"title": 'Edge', "width": "10%", "sClass": "sortIcon_Number", "searchable": false, "orderSequence": ['desc', 'asc']},
            ];

            datatable.language = {
                processing: '', //Change content of processing indicator
                loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                emptyTable: ' ' //Message when table is empty regardless of filtering
            };

            datatable.order = [[7, 'desc']];

            datatable.searching = false;
            datatable.deferRender = false;
            datatable.pageLength = 5; //Controls how many rows per page
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'trp>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            return datatable;
        },
        initFoesTable: function(dataTableConfig) {
            $('#hl-matchups-foes-table').DataTable(dataTableConfig);
        },
        initFriendsTable: function(dataTableConfig) {
            $('#hl-matchups-friends-table').DataTable(dataTableConfig);
        },
        empty: function() {
            $('#hl-matchups-container').empty();
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('herodata_pagedata_hero');
    let filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Show initial collapses
    //HeroLoader.data.window.showInitialCollapse();

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