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

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#heroloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let data = HeroLoader.data;
                let data_herodata = data.herodata;
                let data_stats = data.stats;

                let json = jsonResponse[self.internal.dataSrc];
                let json_herodata = json['herodata'];
                let json_stats = json['stats'];

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
    }
};


$(document).ready(function() {
    //Enable tooltips for the page
    $('[data-toggle="tooltip"]').tooltip();

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