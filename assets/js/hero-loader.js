//processing: '<i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span>'

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

                /*
                 * Empty dynamically filled containers
                 */
                data_abilities.empty();
                data_talents.empty();

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
                //image_hero
                data_herodata.image_hero(json_herodata['image_hero']);
                //name
                data_herodata.name(json_herodata['name']);
                //title
                data_herodata.title(json_herodata['title']);
                //tagline
                data_herodata.tagline(json_herodata['desc_tagline']);
                //bio
                data_herodata.bio(json_herodata['desc_bio']);

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
                //Define DataTable and generate table structure
                data_talents.generateTalentTable();

                let datatable = {};

                //Columns definition
                datatable.columns = [
                    {"title": "Talent", "width": "40%"},
                    {"title": "Played", "width": "20%"},
                    {"title": "Popularity", "width": "20%"},
                    {"title": "Winrate", "width": "20%"},
                ];

                datatable.language = {
                    processing: '', //Change content of processing indicator
                    loadingRecords: ' ', //Message displayed inside of table while loading records in client side ajax requests (not used for server side)
                    zeroRecords: ' ', //Message displayed when a table has no rows left after filtering (same while loading initial ajax)
                    emptyTable: ' ' //Message when table is empty regardless of filtering
                };

                datatable.sorting = false;
                datatable.searching = false;
                datatable.deferRender = false;
                datatable.paging = false; //Controls whether or not the table is allowed to paginate data by page length
                datatable.responsive = false; //Controls whether or not the table collapses responsively as need
                datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
                datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
                datatable.dom =  "<'row'<'col-sm-12'tr>>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
                datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

                datatable.data = [];

                for (let r = json_talents['minRow']; r <= json_talents['maxRow']; r++) {
                    let rkey = r + '';

                    //Build columns for Datatable
                    for (let c = json_talents[rkey]['minCol']; c <= json_talents[rkey]['maxCol']; c++) {
                        let ckey = c + '';

                        let talent = json_talents[rkey][ckey];

                        datatable.data.push(data_talents.generateAbilityTableData(talent['name'], talent['desc_simple'],
                            talent['image'], talent['pickrate'], talent['popularity'], talent['winrate'], talent['winrate_percentOnRange'], talent['winrate_display']));
                    }
                }

                //Init Datatable
                data_talents.initTalentTable(datatable);

                //Enable tooltips for the page
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
        name: function(val) {
            $('#hl-herodata-name').text(val);
        },
        title: function(val) {
            $('#hl-herodata-title').text(val);
        },
        tagline: function(val) {
            $('#hl-herodata-desc-tagline').text(val);
        },
        bio: function(val) {
            $('#hl-herodata-desc-bio').text(val);
        },
        image_hero: function(val) {
            $('#hl-herodata-image-hero').attr('src', val);
        }
    },
    stats: {
        avg_pmin: function(key, avg, pmin) {
            $('#hl-stats-' + key + '-avg').text(avg);
            $('#hl-stats-' + key + '-pmin').text(pmin);
        },
        percentage: function(key, percentage) {
            $('#hl-stats-' + key + '-percentage').text(percentage);
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
        generateTalentTable: function(rowId) {
            $('#hl-talents-container').append('<table id="hl-talents-table" class="display table table-sm dt-responsive" width="100%"><thead class=""></thead></table>');
        },
        generateAbilityTableData: function(name, desc, image, pickrate, popularity, winrate, winrate_percentOnRange, winrateDisplay) {
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

            return [talentField, pickrateField, popularityField, winrateField];
        },
        initTalentTable: function(dataTableConfig) {
            $('#hl-talents-table').DataTable(dataTableConfig);
        },
        empty: function() {
            $('#hl-talents-container').empty();
        },
        tooltip: function(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    }
};


$(document).ready(function() {
    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('herodata_pagedata_hero');
    let filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HotstatusFilter.validateSelectors(null, filterTypes);
    HeroLoader.validateLoad(baseUrl, filterTypes);

    //Get the datatable object
    //let table = $('#hsl-table').DataTable(heroes_statslist);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        HeroLoader.validateLoad(baseUrl, filterTypes);
    });
});