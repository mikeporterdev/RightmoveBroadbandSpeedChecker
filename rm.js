
const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";


$(document).ready(function () {

    var properties = $('.propertyCard');

    // var property = properties[0];

    $.each(properties, function (i, property) {
        var title = $(property).find('.propertyCard-title');

        var link = $(property).find('.propertyCard-link').attr("href");
        getPostcode(link, title);
    });
});

function updateBroadbandSpeed(broadbandLink, title) {
    console.log("Sending BB request");
    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];
        $(title).append('<div style="float:right">' + broadbandSpeed + 'mbps</div>');
    });
}

function getPostcode(link, title) {
    $.get(link, function (data) {
        var hrefText = $(data).find('.icon-broadband').attr("href");

        if (hrefText) {
            var broadbandLink = hrefText.split('#')[1];
            broadbandLink = broadbandLink.replace("_", "+");
            updateBroadbandSpeed(broadbandLink, title);
        }
    });
}