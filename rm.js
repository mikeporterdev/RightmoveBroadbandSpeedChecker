const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";

var speedCache = {};

$(document).ready(function () {
    var pathname = window.location.pathname;

    if (contains(pathname, '/property-to-rent/find.html') || contains(pathname, '/property-for-sale/find.html') || contains(pathname, '/student-accommodation') || contains(pathname, 'new-homes-for-sale')) {
        searchPage();
    } else if (contains(pathname, '/property-to-rent/property-') || contains(pathname, '/property-for-sale/property-')) {
        propertyPage();
    }
});

function propertyPage() {

    var re = new RegExp('broadbandCtmUrl: \\"(.*)"');
    var exec = re.exec(document.documentElement.innerHTML);

    if (exec && exec[1]) {
        updateBroadbandSpeedOnPropertyPage(exec[1]);
    }


}

function searchPage() {
    var message = " (<span id='hiddenCounter'>0</span> filtered for broadband speed)";

    if (contains(window.location.pathname, 'new-homes-for-sale')) {
        message += " New homes may not be registered with the broadband service"
    }
    $('#searchHeader').append(message);

    setupFilter();
    filterCards();

    $('.l-searchResult').bind('DOMNodeInserted, DOMNodeRemoved', function (event) {
        //Ignore the changing of speedtext
        if (!$(event.target).hasClass("speedText")) {
            updateOnChange();
        }
    });
}

function setupFilter() {
    var filterArea;
    var forSale = false;
    if ($('#letTypeFilter').length > 0) {
        filterArea = $('#letTypeFilter');
    } else {
        forSale = true;
        filterArea = $('#addedToSiteFilter');
    }
    filterArea.after(`
    <div class="addedToSiteAndLetType">
        <label class="filters-label">Broadband Speed:</label>
        <div class="addedToSiteAndLetType-flexSpaceWrapper">
            <div class="select-wrapper filters-selectWrapper">
                <div class="select-value">
                    <span class="select-valuePrefix">Let Type:</span>
                    <span id="filterSpeedLabel">Any</span>
                    <div class="no-svg-chevron select-chevron">
                        <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#core-icon--chevron"></use></svg>
                    </div>
                </div>
                <select id="speedSelect" class="select" data-bind="optionsValue: 'value'"> 
                    <option value="0">Don't filter</option>
                    <option value="17">ADSL (17mbps)</option>
                    <option value="52">Fiber (52mbps)</option>
                    <option value="200">Superfast (200mbps)</option>
                    <option value="1000">Gigabit (1000mbps)</option>
                </select>
            </div>
            <div class="addedToSiteAndLetType-flexSpacer"></div>
        </div>
    </div>
    `);

    if (forSale) {
        $('.filtersTray-filter .select-wrapper').width('100%');
        $('.addedToSiteAndLetType').width('24%');
        $('.addedToSiteAndLetType-flexSpacer').hide();
    }

    chrome.storage.local.get('filterSpeed', function (results) {
        updateSpeedLabel(results.filterSpeed)
    });

    $('#speedSelect').on("change", function () {
        var value = $(this).val();

        cacheSpeedFilter(value);
        filterCards();
    });
}

function cacheSpeedFilter(filterSpeed) {
    chrome.storage.local.set({'filterSpeed': filterSpeed}, function () {
        updateSpeedLabel(filterSpeed);
    });
}

function updateSpeedLabel(speed) {
    if (!speed || speed == 0) {
        $('#filterSpeedLabel').text("Any");
    } else {
        $('#filterSpeedLabel').text(speed + 'mbps');
    }
}

function updateOnChange() {
    $('#hiddenCounter').text(0);
    setTimeout(function () {
        filterCards();
    }, 500)
}

function filterCards() {
    var properties = $('.propertyCard').not('.is-hidden > div');
    $('.js-searchResult-creative').hide();

    $.each(properties, function (i, property) {
        updatePropertyCard(property);
    });
}

function updatePropertyCard(property) {
    addSpeedTextIfNotExists(property);

    var propertyId = $(property).find('.propertyCard-anchor').attr('id');

    if (!(propertyId in speedCache)) {

        speedCache[propertyId] = 0;
        var link = $(property).find('.propertyCard-link').attr("href");
        $.get(link, function (data) {

            var re = new RegExp('broadbandCtmUrl: \\"(.*)"');
            var exec = re.exec(data);

            if (exec && exec[1]) {
                updateBroadbandSpeedOnSearchResult(exec[1], property);
            }
        });
    } else {
        updateCard(property, speedCache[propertyId]);
    }
}


function updateBroadbandSpeedOnSearchResult(broadbandLink, property) {
    $.getJSON(broadbandLink, function (response) {
        var broadbandSpeed = response['speed_display'].slice(0, -2);


        var propertyId = $(property).find('.propertyCard-anchor').attr('id');
        speedCache[propertyId] = broadbandSpeed;


        updateCard(property, broadbandSpeed);
    });
}

function updateBroadbandSpeedOnPropertyPage(broadbandLink) {
    $.getJSON(broadbandLink, function (response) {
        var broadbandSpeed = response['speed_display'].slice(0, -2);
        $('.fs-22').append(" - " + broadbandSpeed + " mbps");
    });
}

function updateCard(property, speed) {
    if (speed > 0) {
        chrome.storage.local.get("filterSpeed", function (results) {
            var minBroadbandSpeed = results.filterSpeed;
            if (minBroadbandSpeed == undefined || minBroadbandSpeed == "") {
                minBroadbandSpeed = 0
            }

            $(property).find('.speedText').text(speed + 'mbps');
            var parent = $(property).parent();
            parent.toggle(minBroadbandSpeed == 0 || speed >= minBroadbandSpeed);

            updateCounter();
        });
    }
}

function addSpeedTextIfNotExists(property) {
    var speedTest = $(property).find('.speedText');

    if (speedTest.length == 0) {
        var title = $(property).find('.propertyCard-title');
        $(title).append('<div class="speedText" style="float:right">...mbps</div>')
    }
}

function updateCounter() {
    var properties = $('.propertyCard:hidden').not('.is-hidden > div');

    $('#hiddenCounter').text(properties.length);
}

function contains(string, searchString) {
    return string.indexOf(searchString) > -1
}