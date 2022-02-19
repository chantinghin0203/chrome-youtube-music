/// <reference path="MyExternalFile.js" />

var prevSong = "";

function displayNotFound() {
    console.error("Cannot find lyrics.....");
    document.getElementById("lyric-block").innerHTML = "Cannot find any....";
}

function loadLyrics() {
    chrome.tabs.query({"url": "https://music.youtube.com/*"}, function (tabs) {
        if (tabs !== null) {
            console.log("Found youtube music is running..... Title : " + tabs[0].title);
            if (prevSong !== tabs[0].title && tabs[0].title !== "YouTube Music") {
                prevSong = tabs[0].title;
                var songName = tabs[0].title.split(" ")[0].trim();
                var singer = tabs[0].title.split(" ")[0].trim();
                var url = "https://www.google.com/search?q=" + songName + "  lyrics";

                fetch(url)
                    .then(function (value) {
                        value.text().then(function (result) {
                            var parser = new DOMParser();
                            var htmlDoc = parser.parseFromString(result, 'text/html');
                            var lyrics = htmlDoc.getElementsByTagName("block-component");
                            if (lyrics.length > 0) {
                                console.log(lyrics);
                                document.getElementById("lyric-block").innerHTML = lyrics[0].innerHTML;
                            } else {
                                var mojimUrl = "https://mojim.com/+" + songName + "+.html?t3";
                                fetch(mojimUrl).then(function (mojimReuslt) {
                                    mojimReuslt.text().then(function (result) {
                                        var mojimReusltHtml = parser.parseFromString(result, 'text/html');
                                        var spans = mojimReusltHtml.getElementsByClassName("mxsh_ss4");
                                        var target = null;
                                        for (var index = 0; index < spans.length; index++) {
                                            try {
                                                if (spans[index].getElementsByTagName("a")[0].title.split(" ")[0] === songName) {
                                                    target = spans[index].getElementsByTagName("a")[0].getAttribute("href");
                                                    break;
                                                }
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        if (target === null) {
                                            displayNotFound();
                                        }
                                        fetch("https://mojim.com" + target)
                                            .then(function (value1) {
                                                value1.text()
                                                    .then(function (value2) {
                                                        document.getElementById("lyric-block").innerHTML = value2
                                                    })
                                            })
                                            .catch(function (reason) {
                                                displayNotFound()
                                            })
                                            .catch(function (reason) {
                                                displayNotFound();
                                            })
                                    })
                                });

                            }
                        })
                    });
            } else {
                console.debug("Same song.... No need to refresh");
            }
        }
    })
}


setInterval(loadLyrics, 1000);

