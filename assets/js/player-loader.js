/*
 * Player Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
let PlayerLoader = {};

/*
 * Handles Ajax requests
 */
PlayerLoader.ajax = {};

/*
 * The ajax handler for handling filters
 */
PlayerLoader.ajax.filter = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    /*
     * If supplied a url will set the ajax url to the given url, and then return the ajax object.
     * Otherwise will return the current url the ajax object is set to request from.
     */
    url: function(url = null) {
        let self = PlayerLoader.ajax.filter;

        if (url === null) {
            return self.internal.url;
        }
        else {
            self.internal.url = url;
            return self;
        }
    },
    /*
     * Returns the current season selected based on filter
     */
    getSeason: function() {
        let val = HotstatusFilter.getSelectorValues("season");

        let season = "Unknown";

        if (typeof val === "string" || val instanceof String) {
            season = val;
        }
        else if (val !== null && val.length > 0) {
            season = val[0];
        }

        return season;
    },
    /*
     * Handles loading on valid filters, making sure to only fire once until loading is complete
     */
    validateLoad: function(baseUrl, filterTypes) {
        let self = PlayerLoader.ajax.filter;

        if (!self.internal.loading && HotstatusFilter.validFilters) {
            let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

            if (url !== self.url()) {
                self.url(url).load();
            }
        }
    },
    /*
     * Reloads data from the current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = PlayerLoader.ajax;
        let self = PlayerLoader.ajax.filter;

        let data = PlayerLoader.data;

        //Enable Processing Indicator
        self.internal.loading = true;

        $('#playerloader-container').prepend('<div class="heroloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];

                /*
                 * Empty dynamically filled containers, reset all subajax objects
                 */
                ajax.matches.reset();

                /*
                 * Heroloader Container
                 */
                $('#playerloader-container').removeClass('initial-load');

                /*
                 * Initial matches
                 */
                let ajaxMatches = ajax.matches;
                ajaxMatches.internal.offset = 0;
                ajaxMatches.internal.limit = json.limits.matches;

                //Load initial match set
                ajaxMatches.load();


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

PlayerLoader.ajax.matches = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
        offset: 0, //Matches offset
        limit: 6, //Matches limit (Initial limit is set by initial loader)
    },
    reset: function() {
        let self = PlayerLoader.ajax.matches;

        self.internal.loading = false;
        self.internal.url = '';
        self.internal.offset = 0;
        PlayerLoader.data.matches.empty();
    },
    generateUrl: function() {
        let self = PlayerLoader.ajax.matches;

        let bUrl = Routing.generate("playerdata_pagedata_player_recentmatches", {
            player: player_id,
            offset: self.internal.offset,
            limit: self.internal.limit
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    /*
     * Loads {limit} recent matches offset by {offset} from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = PlayerLoader.ajax;
        let self = ajax.matches;

        let data = PlayerLoader.data;
        let data_matches = data.matches;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        let displayMatchLoader = false;
        self.internal.loading = true;

        //+= Recent Matches Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_offsets = json.offsets;
                let json_limits = json.limits;
                let json_matches = json.matches;

                /*
                 * Process Matches
                 */
                //Set new offset
                self.internal.offset = json_offsets.matches + self.internal.limit;

                //Append new Match widgets for matches that aren't in the manifest
                for (let match of json_matches) {
                    if (!data_matches.isMatchGenerated(match)) {
                        data_matches.generateMatch(match);
                    }
                }

                //Set displayMatchLoader if we got as many matches as we asked for
                if (json_matches.length >= self.internal.limit) {
                    displayMatchLoader = true;
                }

                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                //Toggle display match loader button if hadNewMatch
                if (displayMatchLoader) {
                    data_matches.generate_matchLoader();
                }
                else {
                    data_matches.remove_matchLoader();
                }

                self.internal.loading = false;
            });

        return self;
    }
};

/*
 * Handles binding data to the page
 */
PlayerLoader.data = {
    matches: {
        internal: {
            matchLoaderGenerated: false,
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        generateMatch: function(match) {
            //Generates all subcomponents of a match display
            let self = PlayerLoader.data.matches;

            //Match component container
            let html = '<div id="pl-recentmatch-container-' + match.id + '" class="pl-recentmatch-container"></div>';

            $('#pl-recentmatches-container').append(html);

            //Subcomponents
            self.generateMatchWidget(match);
            self.generateFullMatchPane(match);

            //Log match in manifest
            self.internal.matchManifest[match.id] = true;
        },
        generateMatchWidget: function(match) {
            //Generates the small match bar with simple info
            let self = PlayerLoader.data.matches;

            //Match Widget Container
            let timestamp = match.date;
            let relative_date = Hotstatus.date.getRelativeTime(timestamp);
            let date = (new Date(timestamp * 1000)).toLocaleString();
            let match_time = Hotstatus.date.getMinuteSecondTime(match.match_length);
            let victoryText = (match.player.won) ? ('<span class="pl-recentmatch-won">Victory</span>') : ('<span class="pl-recentmatch-lost">Defeat</span>');
            let medal = match.player.medal;

            let medalhtml = "";
            let nomedalhtml = "";
            if (medal.exists) {
                medalhtml = '<div class="rm-sw-sp-medal-container"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>'
                    + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-sw-sp-medal" src="'
                    + medal.image + '_blue.png"></span></div>';
            }
            else {
                nomedalhtml = "<div class='rm-sw-sp-offset'></div>";
            }

            let talentshtml = "";

            for (let i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-sw-tp-talent-bg'>";

                if (match.player.talents.length > i) {
                    let talent = match.player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-sw-tp-talent" src="' + talent.image + '"></span>';
                }

                talentshtml += "</div>";
            }

            let playershtml = "";

            let t = 0;
            for (let team of match.teams) {
                playershtml += '<div class="rm-sw-pp-team' + t + '">';

                for (let player of team.players) {
                    let special = '<a class="rm-sw-link" href="' + Routing.generate("player", {id: player.id}) + '" target="_blank">';
                    if (player.id === match.player.id) {
                        special = '<a class="rm-sw-special">';
                    }

                    playershtml += '<div class="rm-sw-pp-player"><span data-toggle="tooltip" data-html="true" title="' + player.hero + '"><img class="rm-sw-pp-player-image" src="'
                        + player.image_hero + '"></span>' + special + player.name + '</a></div>';
                }

                playershtml += '</div>';

                t++;
            }

            let html = '<div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' +
                '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + match.map_image + ');">' +
                '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' +
                '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' +
                '<div class="rm-sw-lp-victory">' + victoryText + '</div>' +
                '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' +
                '</div>' +
                '<div class="recentmatch-simplewidget-heropane">' +
                '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + match.player.image_hero + '"></div>' +
                '<div class="rm-sw-hp-heroname"><a class="rm-sw-link" href="' + Routing.generate("hero", {heroProperName: match.player.hero}) + '" target="_blank">' + match.player.hero + '</a></div>' +
                '</div>' +
                '<div class="recentmatch-simplewidget-statspane">' +
                nomedalhtml +
                '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">'
                        + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' +
                '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><span class="rm-sw-sp-kda-text"><span class="rm-sw-sp-kda-num">' + match.player.kda + '</span> KDA</span></span></div>' +
                medalhtml +
                '</div>' +
                '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' +
                talentshtml +
                '</div></div>' +
                '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' +
                playershtml +
                '</div></div>' +
                '</div>';

            $('#pl-recentmatch-container-' + match.id).append(html);
        },
        generateFullMatchPane: function(match) {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view

        },
        remove_matchLoader: function() {
            let self = PlayerLoader.data.matches;

            self.internal.matchLoaderGenerated = false;
            $('#pl-recentmatch-matchloader').remove();
        },
        generate_matchLoader: function() {
            let self = PlayerLoader.data.matches;

            self.remove_matchLoader();

            let loaderhtml = '<div id="pl-recentmatch-matchloader">Load More Matches...</div>';

            $('#pl-recentmatches-container').append(loaderhtml);

            $('#pl-recentmatch-matchloader').click(function() {
                let t = $(this);

                t.html('<i class="fa fa-refresh fa-spin fa-1x fa-fw"></i>');

                PlayerLoader.ajax.matches.load();
            });

            self.internal.matchLoaderGenerated = true;
        },
        color_MatchWonLost: function(won) {
            if (won) {
                return 'pl-recentmatch-bg-won';
            }
            else {
                return 'pl-recentmatch-bg-lost';
            }
        },
        isMatchGenerated: function(matchid) {
            let self = PlayerLoader.data.matches;

            return self.internal.matchManifest.hasOwnProperty(matchid + "");
        },
        talenttooltip: function(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        },
        empty: function() {
            let self = PlayerLoader.data.matches;

            $('#pl-recentmatches-container').empty();
            self.internal.matchLoaderGenerated = false;
            self.internal.matchManifest = {};
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_player', {player: player_id});

    let filterTypes = ["season", "gameType"];
    let filterAjax = PlayerLoader.ajax.filter;

    filterAjax.validateLoad(baseUrl);
    HotstatusFilter.validateSelectors(null, filterTypes);
    filterAjax.validateLoad(baseUrl, filterTypes);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors(null, filterTypes);
    });

    //Load new data on a select dropdown being closed (Have to use '*' selector workaround due to a 'Bootstrap + Chrome-only' bug)
    $('*').on('hidden.bs.dropdown', function(e) {
        filterAjax.validateLoad(baseUrl, filterTypes);
    });
});