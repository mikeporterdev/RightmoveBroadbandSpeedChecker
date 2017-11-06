const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";
const postcodeRegex = new RegExp('postcode":"([A-Z0-9 ]+)"');
const SPEED_CHROME_STORAGE_KEY = "postcodeSpeed2t";
const POSTCODE_CHROME_STORAGE_KEY = "postcodeCache2t";

var postcodeCache = {};
var speedCache = {};

$(document).ready(function () {
    chrome.storage.local.get(POSTCODE_CHROME_STORAGE_KEY, function (postcodeStorage) {
        chrome.storage.local.get(SPEED_CHROME_STORAGE_KEY, function (speedStorage) {
            let postcodeResult = postcodeStorage[POSTCODE_CHROME_STORAGE_KEY];
            if (postcodeResult) {
                postcodeCache = postcodeResult;
            }
            let speedResult = speedStorage[SPEED_CHROME_STORAGE_KEY];
            if (speedResult) {
                speedCache = speedResult;
            }

            var pathname = window.location.pathname;

            if (contains(pathname, '/property-to-rent/find.html') || contains(pathname, '/property-for-sale/find.html') || contains(pathname, '/student-accommodation') || contains(pathname, 'new-homes-for-sale')) {
                searchPage();
            } else if (contains(pathname, '/property-to-rent/property-') || contains(pathname, '/property-for-sale/property-')) {
                renderPropertyPage();
            }
        });
    });
});

function renderPropertyPage() {
    var exec = postcodeRegex.exec(document.documentElement.innerHTML);

    var hrefText = exec[1];

    updateBroadbandSpeedOnPropertyPage(hrefText);
}

function searchPage() {
    let message = " (<span id='hiddenCounter'>0</span> filtered for broadband speed)";

    if (contains(window.location.pathname, 'new-homes-for-sale')) {
        message += " New homes may not be registered with the broadband service"
    }
    $('#searchHeader').append(message);

    setupFilter();
    filterCards();

    $('.l-searchResult').bind('DOMNodeInserted, DOMNodeRemoved', function (event) {
        //Ignore the changing of speedtext
        if (!$(event.target).hasClass("speedText") && !$(event.target).hasClass("propertyCard-header") && !$(event.target).hasClass("propertyCard-headerLink")) {
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

    if (postcodeCache[propertyId]) {
        updateBroadbandSpeedOnSearchResult(postcodeCache[propertyId], property);
    } else {
        //put storage here
        var link = $(property).find('.propertyCard-link').attr("href");

        $.get(link, function (data) {
            var postcode = postcodeRegex.exec(data)[1];

            if (postcode) {
                postcodeCache[propertyId] = postcode;

                chrome.storage.local.set({'postcodeCache2t': postcodeCache}, function () {
                    updateBroadbandSpeedOnSearchResult(postcode, property);
                });
            }
        });
    }
}


function updateBroadbandSpeedOnSearchResult(hrefText, property) {
    getSpeed(hrefText, function (broadbandSpeed) {
        updateCard(property, broadbandSpeed);
    });
}

function updateBroadbandSpeedOnPropertyPage(hrefText) {
    getSpeed(hrefText, function (broadbandSpeed) {
        $('.fs-22').append(" - " + broadbandSpeed + " mbps");
    });
}

function getSpeed(postcode, callback) {
    var postcodeFormatted = postcode.replace(" ", "+");

    if (speedCache[postcode]) {
        callback(speedCache[postcode]);
    } else {
        $.getJSON(url + postcodeFormatted, function (response) {
            var broadbandSpeed = response['broadbandAverageSpeed'];
            speedCache[postcode] = broadbandSpeed;

            chrome.storage.local.set({'postcodeSpeed2t': speedCache}, function () {
                callback(broadbandSpeed);
            });
        });
    }
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