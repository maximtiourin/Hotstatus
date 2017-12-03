/*
 * Player Loader
 * Handles retrieving player data through ajax requests based on state of filters
 */
let PlayerLoader = {};

/*
 * Handles Ajax requests
 */
PlayerLoader.ajax = {
    /*
     * Executes function after given milliseconds
     */
    delay: function(milliseconds, func) {
        setTimeout(func, milliseconds);
    }
};

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
        let ajax_matches = ajax.matches;
        let ajax_topheroes = ajax.topheroes;
        let ajax_parties = ajax.parties;

        let data = PlayerLoader.data;
        let data_matches = data.matches;

        //Enable Processing Indicator
        self.internal.loading = true;

        //$('#playerloader-container').prepend('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //-- Initial Matches First Load
        $('#pl-recentmatches-loader').append('<div class="playerloader-processing"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //Main Filter Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];

                /*
                 * Empty dynamically filled containers, reset all subajax objects
                 */
                ajax_matches.reset();
                ajax_topheroes.reset();
                ajax_parties.reset();

                /*
                 * Heroloader Container
                 */
                $('#playerloader-container').removeClass('initial-load');

                /*
                 * Initial matches
                 */
                data_matches.generateRecentMatchesContainer();

                ajax_matches.internal.offset = 0;
                ajax_matches.internal.limit = json.limits.matches;

                //Load initial match set
                ajax_matches.load();

                /*
                 * Initial Top Heroes
                 */
                ajax_topheroes.load();

                /*
                 * Initial Parties
                 */
                ajax_parties.load();


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
                //Disable processing indicator
                setTimeout(function() {
                    $('.playerloader-processing').fadeIn().delay(750).queue(function(){
                        $(this).remove();
                    });
                });

                self.internal.loading = false;
            });

        return self;
    }
};

PlayerLoader.ajax.topheroes = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    reset: function() {
        let self = PlayerLoader.ajax.topheroes;

        self.internal.loading = false;
        self.internal.url = '';
        PlayerLoader.data.topheroes.empty();
    },
    generateUrl: function() {
        let self = PlayerLoader.ajax.topheroes;

        let bUrl = Routing.generate("playerdata_pagedata_player_topheroes", {
            player: player_id
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    /*
     * Loads Top Heroes from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = PlayerLoader.ajax;
        let self = ajax.topheroes;

        let data = PlayerLoader.data;
        let data_topheroes = data.topheroes;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Top Heroes Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_heroes = json.heroes;

                /*
                 * Process Top Heroes
                 */
                if (json_heroes.length > 0) {
                    data_topheroes.generateTopHeroesContainer();

                    data_topheroes.generateTopHeroesTable();

                    let topHeroesTable = data_topheroes.getTopHeroesTableConfig(json_heroes.length);

                    topHeroesTable.data = [];
                    for (let hero of json_heroes) {
                        topHeroesTable.data.push(data_topheroes.generateTopHeroesTableData(hero));
                    }

                    data_topheroes.initTopHeroesTable(topHeroesTable);
                }

                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                self.internal.loading = false;
            });

        return self;
    }
};

PlayerLoader.ajax.parties = {
    internal: {
        loading: false, //Whether or not currently loading a result
        url: '', //url to get a response from
        dataSrc: 'data', //The array of data is found in .data field
    },
    reset: function() {
        let self = PlayerLoader.ajax.parties;

        self.internal.loading = false;
        self.internal.url = '';
        PlayerLoader.data.parties.empty();
    },
    generateUrl: function() {
        let self = PlayerLoader.ajax.parties;

        let bUrl = Routing.generate("playerdata_pagedata_player_parties", {
            player: player_id
        });

        return HotstatusFilter.generateUrl(bUrl, ["season", "gameType"]);
    },
    /*
     * Loads Parties from current internal url, looking for data in the current internal dataSrc field.
     * Returns the ajax object.
     */
    load: function() {
        let ajax = PlayerLoader.ajax;
        let self = ajax.parties;

        let data = PlayerLoader.data;
        let data_parties = data.parties;

        //Generate url based on internal state
        self.internal.url = self.generateUrl();

        //Enable Processing Indicator
        self.internal.loading = true;

        //+= Parties Ajax Request
        $.getJSON(self.internal.url)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_parties = json.parties;

                /*
                 * Process Parties
                 */
                if (json_parties.length > 0) {
                    data_parties.generatePartiesContainer();

                    data_parties.generatePartiesTable();

                    let partiesTable = data_parties.getPartiesTableConfig(json_parties.length);

                    partiesTable.data = [];
                    for (let party of json_parties) {
                        partiesTable.data.push(data_parties.generatePartiesTableData(party));
                    }

                    data_parties.initPartiesTable(partiesTable);
                }

                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                self.internal.loading = false;
            });

        return self;
    }
};

PlayerLoader.ajax.matches = {
    internal: {
        loading: false, //Whether or not currently loading a result
        matchloading: false, //Whether or not currently loading a fullmatch result
        url: '', //url to get a response from
        matchurl: '', //url to get a fullmatch response from
        dataSrc: 'data', //The array of data is found in .data field
        offset: 0, //Matches offset
        limit: 6, //Matches limit (Initial limit is set by initial loader)
    },
    reset: function() {
        let self = PlayerLoader.ajax.matches;

        self.internal.loading = false;
        self.internal.matchloading = false;
        self.internal.url = '';
        self.internal.matchurl = '';
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
    generateMatchUrl: function(match_id) {
        return Routing.generate("playerdata_pagedata_match", {
            matchid: match_id,
        });
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
                if (json_matches.length > 0) {
                    //Set new offset
                    self.internal.offset = json_offsets.matches + self.internal.limit;

                    //Append new Match widgets for matches that aren't in the manifest
                    for (let match of json_matches) {
                        if (!data_matches.isMatchGenerated(match.id)) {
                            data_matches.generateMatch(match);
                        }
                    }

                    //Set displayMatchLoader if we got as many matches as we asked for
                    if (json_matches.length >= self.internal.limit) {
                        displayMatchLoader = true;
                    }
                }
                else if (self.internal.offset === 0) {
                    data_matches.generateNoMatchesMessage();
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

                //Remove initial load
                $('#pl-recentmatches-container').removeClass('initial-load');

                self.internal.loading = false;
            });

        return self;
    },
    /*
     * Loads the match of given id to be displayed under match simplewidget
     */
    loadMatch: function(matchid) {
        let ajax = PlayerLoader.ajax;
        let self = ajax.matches;

        let data = PlayerLoader.data;
        let data_matches = data.matches;

        //Generate url based on internal state
        self.internal.matchurl = self.generateMatchUrl(matchid);

        //Enable Processing Indicator
        self.internal.matchloading = true;

        $('#recentmatch-fullmatch-'+ matchid).prepend('<div class="fullmatch-processing"><i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span></div>');

        //+= Recent Matches Ajax Request
        $.getJSON(self.internal.matchurl)
            .done(function(jsonResponse) {
                let json = jsonResponse[self.internal.dataSrc];
                let json_match = json.match;

                /*
                 * Process Match
                 */
                data_matches.generateFullMatchRows(matchid, json_match);


                //Enable initial tooltips for the page (Paginated tooltips will need to be reinitialized on paginate)
                $('[data-toggle="tooltip"]').tooltip();
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                $('.fullmatch-processing').remove();

                self.internal.matchloading = false;
            });

        return self;
    }
};

/*
 * Handles binding data to the page
 */
PlayerLoader.data = {
    topheroes: {
        internal: {
            heroLimit: 5, //How many heroes should be displayed at a time
        },
        empty: function() {
            $('#pl-topheroes-container').remove();
        },
        generateTopHeroesContainer: function() {
            let html = '<div id="pl-topheroes-container" class="pl-topheroes-container hotstatus-subcontainer padding-left-0 padding-right-0">' +
                '</div>';

            $('#player-leftpane-container').append(html);
        },
        generateTopHeroesTableData: function(hero) {
            /*
             * Hero
             */
            let herofield = '<div class="pl-th-heropane"><div><img class="pl-th-hp-heroimage" src="'+ hero.image_hero +'"></div>' +
                '<div><a class="pl-th-hp-heroname" href="' + Routing.generate("hero", {heroProperName: hero.name}) + '" target="_blank">'+ hero.name +'</a></div></div>';


            /*
             * KDA
             */
            //Good kda
            let goodkda = 'rm-sw-sp-kda-num';
            if (hero.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good'
            }
            if (hero.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great'
            }

            let kda = '<span class="'+ goodkda +'">' + hero.kda_avg + '</span> KDA';

            let kdaindiv = hero.kills_avg + ' / <span class="pl-th-kda-indiv-deaths">' + hero.deaths_avg + '</span> / ' + hero.assists_avg;

            let kdafield = '<div class="pl-th-kdapane">' +
                //KDA actual
                '<div class="pl-th-kda-kda"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths">' +
                kda +
                '</span></div>' +
                //KDA indiv
                '<div class="pl-th-kda-indiv"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists">' +
                kdaindiv +
                '</span></div>' +
                '</div>';

            /*
             * Winrate / Played
             */
            //Good winrate
            let goodwinrate = 'pl-th-wr-winrate';
            if (hero.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad'
            }
            if (hero.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible'
            }
            if (hero.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good'
            }
            if (hero.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great'
            }

            let winratefield = '<div class="pl-th-winratepane">' +
                //Winrate
                '<div class="'+ goodwinrate +'"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' +
                hero.winrate + '%' +
                '</span></div>' +
                //Played
                '<div class="pl-th-wr-played">' +
                hero.played + ' played' +
                '</div>' +
                '</div>';

            return [herofield, kdafield, winratefield];
        },
        getTopHeroesTableConfig: function(rowLength) {
            let self = PlayerLoader.data.topheroes;

            let datatable = {};

            //Columns definition
            datatable.columns = [
                {},
                {},
                {}
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
            datatable.pageLength = self.internal.heroLimit; //Controls how many rows per page
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'tr>><'pl-topheroes-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function() {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        generateTopHeroesTable: function() {
            $('#pl-topheroes-container').append('<table id="pl-topheroes-table" class="pl-topheroes-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class="d-none"></thead></table>');
        },
        initTopHeroesTable: function(dataTableConfig) {
            $('#pl-topheroes-table').DataTable(dataTableConfig);
        }
    },
    parties: {
        internal: {
            partyLimit: 5, //How many parties should be displayed at a time
        },
        empty: function() {
            $('#pl-parties-container').remove();
        },
        generatePartiesContainer: function() {
            let html = '<div id="pl-parties-container" class="pl-parties-container hotstatus-subcontainer padding-left-0 padding-right-0">' +
                '</div>';

            $('#player-leftpane-container').append(html);
        },
        generatePartiesTableData: function(hero) {
            /*
             * Winrate / Played
             */
            //Good winrate
            let goodwinrate = 'pl-th-wr-winrate';
            if (hero.winrate_raw <= 49) {
                goodwinrate = 'pl-th-wr-winrate-bad'
            }
            if (hero.winrate_raw <= 40) {
                goodwinrate = 'pl-th-wr-winrate-terrible'
            }
            if (hero.winrate_raw >= 51) {
                goodwinrate = 'pl-th-wr-winrate-good'
            }
            if (hero.winrate_raw >= 60) {
                goodwinrate = 'pl-th-wr-winrate-great'
            }

            let winratefield = '<div class="pl-th-winratepane">' +
                //Winrate
                '<div class="'+ goodwinrate +'"><span class="paginated-tooltip" data-toggle="tooltip" data-html="true" title="Winrate">' +
                hero.winrate + '%' +
                '</span></div>' +
                //Played
                '<div class="pl-th-wr-played">' +
                hero.played + ' played' +
                '</div>' +
                '</div>';

            return [herofield, kdafield, winratefield];
        },
        getPartiesTableConfig: function(rowLength) {
            let self = PlayerLoader.data.parties;

            let datatable = {};

            //Columns definition
            datatable.columns = [
                {},
                {}
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
            datatable.pageLength = self.internal.partyLimit; //Controls how many rows per page
            datatable.paging = (rowLength > datatable.pageLength); //Controls whether or not the table is allowed to paginate data by page length
            datatable.pagingType = "simple";
            datatable.responsive = false; //Controls whether or not the table collapses responsively as need
            datatable.scrollX = true; //Controls whether or not the table can create a horizontal scroll bar
            datatable.scrollY = false; //Controls whether or not the table can create a vertical scroll bar
            datatable.dom =  "<'row'<'col-sm-12'tr>><'pl-topheroes-pagination'p>"; //Remove the search bar from the dom by modifying bootstraps default datatable dom styling (so i can implement custom search bar later)
            datatable.info = false; //Controls displaying table control information, such as if filtering displaying what results are viewed out of how many

            datatable.drawCallback = function() {
                $('.paginated-tooltip[data-toggle="tooltip"]').tooltip();
            };

            return datatable;
        },
        generatePartiesTable: function() {
            $('#pl-parties-container').append('<table id="pl-parties-table" class="pl-parties-table hotstatus-datatable display table table-sm dt-responsive" width="100%"><thead class="d-none"></thead></table>');
        },
        initPartiesTable: function(dataTableConfig) {
            $('#pl-parties-table').DataTable(dataTableConfig);
        }
    },
    matches: {
        internal: {
            matchLoaderGenerated: false,
            matchManifest: {} //Keeps track of which match ids are currently being displayed, to prevent offset requests from repeating matches over large periods of time
        },
        empty: function() {
            let self = PlayerLoader.data.matches;

            $('#pl-recentmatches-container').remove();
            self.internal.matchLoaderGenerated = false;
            self.internal.matchManifest = {};
        },
        isMatchGenerated: function(matchid) {
            let self = PlayerLoader.data.matches;

            return self.internal.matchManifest.hasOwnProperty(matchid + "");
        },
        generateRecentMatchesContainer: function() {
            $('#player-rightpane-container').append('<div id="pl-recentmatches-container" class="pl-recentmatches-container initial-load hotstatus-subcontainer horizontal-scroller"></div>');
        },
        generateNoMatchesMessage: function() {
            $('#pl-recentmatches-container').append('<div class="pl-norecentmatches">No Recent Matches Found...</div>');
        },
        generateMatch: function(match) {
            //Generates all subcomponents of a match display
            let self = PlayerLoader.data.matches;

            //Match component container
            let html = '<div id="pl-recentmatch-container-' + match.id + '" class="pl-recentmatch-container"></div>';

            $('#pl-recentmatches-container').append(html);

            //Generate one-time party colors for match
            let partiesColors = [1, 2, 3, 4, 5]; //Array of colors to use for party at index = partyIndex - 1
            Hotstatus.utility.shuffle(partiesColors);

            //Log match in manifest
            self.internal.matchManifest[match.id + ""] = {
                fullGenerated: false, //Whether or not the full match data has been loaded for the first time
                fullDisplay: false, //Whether or not the full match data is currently toggled to display
                matchPlayer: match.player.id, //Id of the match's player for whom the match is being displayed, for use with highlighting inside of fullmatch (while decoupling mainplayer)
                partiesColors: partiesColors //Colors to use for the party indexes
            };

            //Subcomponents
            self.generateMatchWidget(match);
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

            //Silence
            let silence = function(isSilenced) {
                let r = '';

                if (isSilenced) {
                    r = 'rm-sw-link-toxic';
                }
                else {
                    r = 'rm-sw-link';
                }

                return r;
            };

            let silence_image = function(isSilenced, size) {
                let s = '';

                if (isSilenced) {
                    if (size > 0) {
                        let path = image_bpath + '/ui/icon_toxic.png';
                        s += '<span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<span class=\'rm-sw-link-toxic\'>Silenced</span>"><img class="rm-sw-toxic" style="width:' + size + 'px;height:' + size + 'px;" src="' + path + '"></span>';
                    }
                }

                return s;
            };

            //Good kda
            let goodkda = 'rm-sw-sp-kda-num';
            if (match.player.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good'
            }
            if (match.player.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great'
            }

            //Medal
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

            //Talents
            let talentshtml = "";
            for (let i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-sw-tp-talent-bg'>";

                if (match.player.talents.length > i) {
                    let talent = match.player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-sw-tp-talent" src="' + talent.image + '"></span>';
                }

                talentshtml += "</div>";
            }

            //Players
            let playershtml = "";
            let partiesCounter = [0, 0, 0, 0, 0]; //Counts index of party member, for use with creating connectors, up to 5 parties possible
            let partiesColors = self.internal.matchManifest[match.id + ""].partiesColors;
            let t = 0;
            for (let team of match.teams) {
                playershtml += '<div class="rm-sw-pp-team' + t + '">';

                for (let player of team.players) {
                    let party = '';
                    if (player.party > 0) {
                        let partyOffset = player.party - 1;
                        let partyColor = partiesColors[partyOffset];

                        party = '<div class="rm-party rm-party-sm rm-party-'+ partyColor +'"></div>';

                        if (partiesCounter[partyOffset] > 0) {
                            party += '<div class="rm-party-sm rm-party-sm-connecter rm-party-'+ partyColor +'"></div>';
                        }

                        partiesCounter[partyOffset]++;
                    }

                    let special = '<a class="'+silence(player.silenced)+'" href="' + Routing.generate("player", {id: player.id}) + '" target="_blank">';
                    if (player.id === match.player.id) {
                        special = '<a class="rm-sw-special">';
                    }

                    playershtml += '<div class="rm-sw-pp-player"><span data-toggle="tooltip" data-html="true" title="' + player.hero + '"><img class="rm-sw-pp-player-image" src="'
                        + player.image_hero + '"></span>' + party + silence_image(player.silenced, 12) + special + player.name + '</a></div>';
                }

                playershtml += '</div>';

                t++;
            }

            let html = '<div id="recentmatch-container-'+ match.id +'"><div id="recentmatch-simplewidget-' + match.id + '" class="recentmatch-simplewidget">' +
                '<div class="recentmatch-simplewidget-leftpane ' + self.color_MatchWonLost(match.player.won) + '" style="background-image: url(' + match.map_image + ');">' +
                '<div class="rm-sw-lp-gameType"><span class="rm-sw-lp-gameType-text" data-toggle="tooltip" data-html="true" title="' + match.map + '">' + match.gameType + '</span></div>' +
                '<div class="rm-sw-lp-date"><span data-toggle="tooltip" data-html="true" title="' + date + '"><span class="rm-sw-lp-date-text">' + relative_date + '</span></span></div>' +
                '<div class="rm-sw-lp-victory">' + victoryText + '</div>' +
                '<div class="rm-sw-lp-matchlength">' + match_time + '</div>' +
                '</div>' +
                '<div class="recentmatch-simplewidget-heropane">' +
                '<div><img class="rounded-circle rm-sw-hp-portrait" src="' + match.player.image_hero + '"></div>' +
                '<div class="rm-sw-hp-heroname">'+silence_image(match.player.silenced, 16)+'<a class="'+silence(match.player.silenced)+'" href="' + Routing.generate("hero", {heroProperName: match.player.hero}) + '" target="_blank">' + match.player.hero + '</a></div>' +
                '</div>' +
                '<div class="recentmatch-simplewidget-statspane"><div class="rm-sw-sp-inner">' +
                nomedalhtml +
                '<div class="rm-sw-sp-kda-indiv"><span data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists"><span class="rm-sw-sp-kda-indiv-text">'
                        + match.player.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + match.player.deaths + '</span> / ' + match.player.assists + '</span></span></div>' +
                '<div class="rm-sw-sp-kda"><span data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="'+ goodkda +'">' + match.player.kda + '</span> KDA</div></span></div>' +
                medalhtml +
                '</div></div>' +
                '<div class="recentmatch-simplewidget-talentspane"><div class="rm-sw-tp-talent-container">' +
                talentshtml +
                '</div></div>' +
                '<div class="recentmatch-simplewidget-playerspane"><div class="rm-sw-pp-inner">' +
                playershtml +
                '</div></div>' +
                '<div id="recentmatch-simplewidget-inspect-' + match.id + '" class="recentmatch-simplewidget-inspect">' +
                '<i class="fa fa-chevron-down" aria-hidden="true"></i>' +
                '</div>' +
                '</div></div>';

            $('#pl-recentmatch-container-' + match.id).append(html);

            //Create click listeners for inspect pane
            $('#recentmatch-simplewidget-inspect-' + match.id).click(function() {
                let t = $(this);

                self.generateFullMatchPane(match.id);
            });
        },
        generateFullMatchPane: function(matchid) {
            //Generates the full match pane that loads when a match widget is clicked for a detailed view, if it's already loaded, toggle its display
            let self = PlayerLoader.data.matches;
            let ajax = PlayerLoader.ajax.matches;

            if (self.internal.matchManifest[matchid + ""].fullGenerated) {
                //Toggle display
                let matchman = self.internal.matchManifest[matchid + ""];
                matchman.fullDisplay = !matchman.fullDisplay;
                let selector = $('#recentmatch-fullmatch-'+ matchid);

                if (matchman.fullDisplay) {
                    selector.slideDown(250);
                }
                else {
                    selector.slideUp(250);
                }
            }
            else {
                if (!ajax.internal.matchloading) {
                    ajax.internal.matchloading = true;

                    //Generate full match pane
                    $('#recentmatch-container-' + matchid).append('<div id="recentmatch-fullmatch-' + matchid + '" class="recentmatch-fullmatch"></div>');

                    //Load data
                    ajax.loadMatch(matchid);

                    //Log as generated in manifest
                    self.internal.matchManifest[matchid + ""].fullGenerated = true;
                    self.internal.matchManifest[matchid + ""].fullDisplay = true;
                }
            }
        },
        generateFullMatchRows: function(matchid, match) {
            let self = PlayerLoader.data.matches;
            let fullmatch_container = $('#recentmatch-fullmatch-'+ matchid);

            //Loop through teams
            let partiesCounter = [0, 0, 0, 0, 0]; //Counts index of party member, for use with creating connectors, up to 5 parties possible
            let t = 0;
            for (let team of match.teams) {
                //Team Container
                fullmatch_container.append('<div id="recentmatch-fullmatch-team-container-'+ matchid +'"></div>');
                let team_container = $('#recentmatch-fullmatch-team-container-'+ matchid);

                //Team Row Header
                self.generateFullMatchRowHeader(team_container, team, match.winner === t, match.hasBans);

                //Loop through players for team
                let p = 0;
                for (let player of team.players) {
                    //Player Row
                    self.generateFullmatchRow(matchid, team_container, player, team.color, match.stats, p % 2, partiesCounter);

                    if (player.party > 0) {
                        let partyOffset = player.party - 1;
                        partiesCounter[partyOffset]++;
                    }

                    p++;
                }

                t++;
            }
        },
        generateFullMatchRowHeader: function(container, team, winner, hasBans) {
            let self = PlayerLoader.data.matches;

            //Victory
            let victory = (winner) ? ('<span class="rm-fm-rh-victory">Victory</span>') : ('<span class="rm-fm-rh-defeat">Defeat</span>');

            //Bans
            let bans = '';
            if (hasBans) {
                bans += 'Bans: ';
                for (let ban of team.bans) {
                    bans += '<span data-toggle="tooltip" data-html="true" title="' + ban.name + '"><img class="rm-fm-rh-ban" src="'+ ban.image +'"></span>';
                }
            }

            let html = '<div class="rm-fm-rowheader">' +
                //Victory Container
                '<div class="rm-fm-rh-victory-container">' +
                victory +
                '</div>' +
                //Team Level Container
                '<div class="rm-fm-rh-level-container">' +
                team.level +
                '</div>' +
                //Bans Container
                '<div class="rm-fm-rh-bans-container">' +
                bans +
                '</div>' +
                //KDA Container
                '<div class="rm-fm-rh-kda-container">KDA</div>' +
                //Statistics Container
                '<div class="rm-fm-rh-statistics-container">Performance</div>' +
                //Mmr Container
                '<div class="rm-fm-rh-mmr-container">MMR: <span class="rm-fm-rh-mmr">' +
                team.mmr.old.rating +
                '</span></div>' +
                '</div>';

            container.append(html);
        },
        generateFullmatchRow: function(matchid, container, player, teamColor, matchStats, oddEven, partiesCounter) {
            let self = PlayerLoader.data.matches;

            //Match player
            let matchPlayerId = self.internal.matchManifest[matchid + ""].matchPlayer;

            //Silence
            let silence = function(isSilenced) {
                let r = '';

                if (isSilenced) {
                    r = 'rm-sw-link-toxic';
                }
                else {
                    r = 'rm-sw-link';
                }

                return r;
            };

            let silence_image = function(isSilenced, size) {
                let s = '';

                if (isSilenced) {
                    if (size > 0) {
                        let path = image_bpath + '/ui/icon_toxic.png';
                        s += '<span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<span class=\'rm-sw-link-toxic\'>Silenced</span>"><img class="rm-sw-toxic" style="width:' + size + 'px;height:' + size + 'px;" src="' + path + '"></span>';
                    }
                }

                return s;
            };

            //Player name
            let playername = '';
            let special = '';
            if (player.id === matchPlayerId) {
                special = '<a class="rm-fm-r-playername rm-sw-special">';
            }
            else {
                special = '<a class="rm-fm-r-playername '+ silence(player.silenced) +'" href="' + Routing.generate("player", {id: player.id}) + '" target="_blank">';
            }
            playername += silence_image(player.silenced, 14) + special + player.name + '</a>';

            //Medal
            let medal = player.medal;
            let medalhtml = "";
            if (medal.exists) {
                medalhtml = '<div class="rm-fm-r-medal-inner"><span style="cursor: help;" data-toggle="tooltip" data-html="true" title="<div class=\'hl-talents-tooltip-name\'>'
                    + medal.name + '</div><div>' + medal.desc_simple + '</div>"><img class="rm-fm-r-medal" src="'
                    + medal.image + '_'+ teamColor +'.png"></span></div>';
            }

            //Talents
            let talentshtml = "";
            for (let i = 0; i < 7; i++) {
                talentshtml += "<div class='rm-fm-r-talent-bg'>";

                if (player.talents.length > i) {
                    let talent = player.talents[i];

                    talentshtml += '<span data-toggle="tooltip" data-html="true" title="' + self.talenttooltip(talent.name, talent.desc_simple) + '"><img class="rm-fm-r-talent" src="' + talent.image + '"></span>';
                }

                talentshtml += "</div>";
            }

            //Stats
            let stats = player.stats;

            let goodkda = 'rm-sw-sp-kda-num';
            if (stats.kda_raw >= 3) {
                goodkda = 'rm-sw-sp-kda-num-good'
            }
            if (stats.kda_raw >= 6) {
                goodkda = 'rm-sw-sp-kda-num-great'
            }

            let rowstat_tooltip = function (val, desc) {
                return val +'<br>'+ desc;
            };

            let rowstats = [
                {key: "hero_damage", class: "herodamage", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Hero Damage'},
                {key: "siege_damage", class: "siegedamage", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Siege Damage'},
                {key: "merc_camps", class: "merccamps", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Merc Camps Taken'},
                {key: "healing", class: "healing", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Healing'},
                {key: "damage_taken", class: "damagetaken", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Damage Taken'},
                {key: "exp_contrib", class: "expcontrib", width: 0, value: "", valueDisplay: "", html: '', tooltip: 'Experience Contribution'}
            ];

            for (stat of rowstats) {
                let max = matchStats[stat.key]["max"];

                let percentOnRange = 0;
                if (max > 0) {
                    percentOnRange = (stats[stat.key + "_raw"] / (max * 1.00)) * 100.0;
                }

                stat.width = percentOnRange;

                stat.value = stats[stat.key];
                stat.valueDisplay = stat.value;
                if (stats[stat.key + "_raw"] <= 0) {
                    stat.valueDisplay = '<span class="rm-fm-r-stats-number-none">' + stat.value + '</span>';
                }

                stat.tooltip = rowstat_tooltip(stat.value, stat.tooltip);

                stat.html = '<span data-toggle="tooltip" data-html="true" title="' + stat.tooltip + '"><div class="rm-fm-r-stats-row"><div class="rm-fm-r-stats-'+ stat.class +' rm-fm-r-stats-bar" style="width: '+ stat.width +'%"></div><div class="rm-fm-r-stats-number">'+ stat.valueDisplay +'</div></div></span>';
            }

            //MMR
            let mmrDeltaType = "neg";
            let mmrDeltaPrefix = "";
            if (player.mmr.delta >= 0) {
                mmrDeltaType = "pos";
                mmrDeltaPrefix = "+";
            }
            let mmrDelta = player.mmr.rank +' '+ player.mmr.tier +' (<span class=\'rm-fm-r-mmr-delta-'+ mmrDeltaType +'\'>'+ mmrDeltaPrefix + player.mmr.delta +'</span>)';

            //Party
            let party = '';
            let partiesColors = self.internal.matchManifest[matchid + ""].partiesColors;
            if (player.party > 0) {
                let partyOffset = player.party - 1;
                let partyColor = partiesColors[partyOffset];

                party = '<div class="rm-party rm-party-md rm-party-'+ partyColor +'"></div>';

                if (partiesCounter[partyOffset] > 0) {
                    party += '<div class="rm-party-md rm-party-md-connecter rm-party-'+ partyColor +'"></div>';
                }
            }

            //Build html
            let html = '<div class="rm-fm-row rm-fm-row-'+ oddEven +'">' +
            //Party Stripe
            party +
            //Hero Image Container (With Hero Level)
            '<div class="rm-fm-r-heroimage-container">' +
            '<span style="cursor:help;" data-toggle="tooltip" data-html="true" title="' + player.hero + '"><div class="rm-fm-r-herolevel">'+ player.hero_level +'</div><img class="rm-fm-r-heroimage" src="'+ player.image_hero +'"></span>' +
            '</div>' +
            //Player Name Container
            '<div class="rm-fm-r-playername-container">' +
            playername +
            '</div>' +
            //Medal Container
            '<div class="rm-fm-r-medal-container">' +
            medalhtml +
            '</div>' +
            //Talents Container
            '<div class="rm-fm-r-talents-container"><div class="rm-fm-r-talent-container">' +
            talentshtml +
            '</div></div>' +
            //KDA Container
            '<div class="rm-fm-r-kda-container">' +
            '<div class="rm-fm-r-kda-indiv"><span style="cursor:help;" data-toggle="tooltip" data-html="true" title="Kills / Deaths / Assists">'
            + stats.kills + ' / <span class="rm-sw-sp-kda-indiv-deaths">' + stats.deaths + '</span> / ' + stats.assists + '</span></div>' +
            '<div class="rm-fm-r-kda"><span style="cursor:help;" data-toggle="tooltip" data-html="true" title="(Kills + Assists) / Deaths"><div class="rm-sw-sp-kda-text"><span class="'+ goodkda +'">' + stats.kda + '</span> KDA</div></span></div>' +
            '</div>' +
            //Stats Offense Container
            '<div class="rm-fm-r-stats-offense-container">' +
            rowstats[0].html +
            rowstats[1].html +
            rowstats[2].html +
            '</div>' +
            //Stats Utility Container
            '<div class="rm-fm-r-stats-utility-container">' +
            rowstats[3].html +
            rowstats[4].html +
            rowstats[5].html +
            '</div>' +
            //MMR Container
            '<div class="rm-fm-r-mmr-container">' +
            '<div class="rm-fm-r-mmr-tooltip-area" style="cursor:help;" data-toggle="tooltip" data-html="true" title="'+ mmrDelta +'"><img class="rm-fm-r-mmr" src="'+ image_bpath + 'ui/ranked_player_icon_' + player.mmr.rank +'.png"><div class="rm-fm-r-mmr-number">'+ player.mmr.tier +'</div></div>' +
            '</div>' +
            '</div>';

            container.append(html);
        },
        remove_matchLoader: function() {
            let self = PlayerLoader.data.matches;

            self.internal.matchLoaderGenerated = false;
            $('#pl-recentmatch-matchloader').remove();
        },
        generate_matchLoader: function() {
            let self = PlayerLoader.data.matches;
            let ajax = PlayerLoader.ajax.matches;

            self.remove_matchLoader();

            let loaderhtml = '<div id="pl-recentmatch-matchloader">Load More Matches...</div>';

            $('#pl-recentmatches-container').append(loaderhtml);

            $('#pl-recentmatch-matchloader').click(function() {
                if (!ajax.internal.loading) {
                    ajax.internal.loading = true;

                    let t = $(this);

                    t.html('<i class="fa fa-refresh fa-spin fa-1x fa-fw"></i>');

                    PlayerLoader.ajax.matches.load();
                }
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
        talenttooltip: function(name, desc) {
            return '<span class=\'hl-talents-tooltip-name\'>' + name + '</span><br>' + desc;
        }
    }
};


$(document).ready(function() {
    $.fn.dataTableExt.sErrMode = 'none'; //Disable datatables error reporting, if something breaks behind the scenes the user shouldn't know about it

    //Set the initial url based on default filters, and attempt to load after validation
    let baseUrl = Routing.generate('playerdata_pagedata_player', {player: player_id});

    let filterTypes = ["season", "gameType"];
    let filterAjax = PlayerLoader.ajax.filter;

    //filterAjax.validateLoad(baseUrl);
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