//processing: '<i class="fa fa-refresh fa-spin fa-5x fa-fw"></i><span class="sr-only">Loading...</span>'

/*
 * Hero Loader
 * Handles retrieving hero data through ajax requests based on state of filters
 */
let HeroLoader = {};

HeroLoader.ajax = {
    internal: {
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

        //Ajax Request
        $.getJSON(self.internal.url)
            .done(function(json) {
                //Assign data
            })
            .fail(function() {
                //Failure to load Data
            })
            .always(function() {
                //Disable Processing Indicator
            });

        return self;
    }
};


$(document).ready(function() {
    //Set the initial url based on default filters
    let baseUrl = Routing.generate('herodata_pagedata_hero');
    let filterTypes = ["hero", "gameType", "map", "rank", "date"];
    HeroLoader.ajax.url(HotstatusFilter.generateUrl(baseUrl, filterTypes)).load();

    //Get the datatable object
    //let table = $('#hsl-table').DataTable(heroes_statslist);

    //Track filter changes and validate
    $('select.filter-selector').on('change', function(event) {
        HotstatusFilter.validateSelectors($('button.filter-button'), filterTypes);
    });

    //Calculate new url based on filters and load it, only if the url has changed
    $('button.filter-button').click(function () {
        let url = HotstatusFilter.generateUrl(baseUrl, filterTypes);

        if (url !== HeroLoader.ajax.url()) {
            HeroLoader.ajax.url(url).load();
        }
    });
});