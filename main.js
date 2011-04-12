var LazyDJ = {
        host: 'http://api.mixcloud.com',
        layoutTrack: function($track)
            {
                var $lis = $track.children();
                $lis.css('width', ($(document.body).innerWidth() - 30 * $lis.length - 10) / $lis.length);
            },
        layout: function()
            {
                $('#playlist ul').each(function() { LazyDJ.layoutTrack($(this)); });
                $('#search-input').css('width', $('#search-box').width() - 20);
            },
        showLoader: function()
            {
                $('#loader').css('visibility', 'visible');
            },
        hideLoader: function()
            {
                $('#loader').css('visibility', 'hidden');
            },
        startAgain: function()
            {
                $('#selected-result').slideUp(500);
                $('#playlist-not-found').slideUp(500);
                $('#start-again-button').fadeOut(500);
                var emptyOut = function()
                    {
                        $(this).empty();
                    }
                $('#results').slideUp(500, emptyOut);
                $('#playlist').slideUp(500, emptyOut);
                setTimeout(function()
                    {
                        $('#search').slideDown(500);
                    }, 500);
                LazyDJ.hideLoader();
            },
        search: function(q)
            {
                var $results = $('#results').show();
                var results = false, shownResults = false;
                
                var addResults = function()
                    {
                        if (results !== false && shownResults)
                        {
                            LazyDJ.hideLoader();
                            if (results.length > 0)
                            {
                                $.each(results, function()
                                    {
                                        LazyDJ.addResult($results, this.name, this.artist.name, this.key);
                                    });
                                var timeoutOffset = 0;
                                $results.children().each(function()
                                    {
                                        var $child = $(this);
                                        setTimeout(function()
                                            {
                                                $child.fadeIn(400);
                                            }, timeoutOffset);
                                        timeoutOffset += 200;
                                    });
                                setTimeout(function()
                                    {
                                        $('#start-again-button').fadeIn(500);
                                    }, timeoutOffset);
                            }
                        }
                    }
                
                $.getJSON(LazyDJ.host + '/search/?type=track&q=' + encodeURIComponent(q) + '&limit=10&callback=?', function(response)
                    {
                        results = response.data;
                        addResults();
                    });
                
                $('#search').slideUp(500, function()
                    {
                        LazyDJ.showLoader();
                        shownResults = true;
                        addResults();
                    });
            },
        addResult: function($results, song, artist, key)
            {
                var $result = $('<li style="display: none;"><h3></h3><h4></h4></li>');
                $results.append($result);
                $result.find('h3').text(song);
                $result.find('h4').text(artist);
                $result.data('track-key', key);
                return $result;
            },
        select: function(song, artist, track_key)
            {
                var $selectedResult = $('#selected-result');
                $selectedResult.find('h3').text(song);
                $selectedResult.find('h4').text(artist);
                $selectedResult.slideDown(500);
                
                $('#results').animate({'height':'hide','opacity':'hide'}, 500, function()
                    {
                        $('#playlist').slideDown(500);
                        LazyDJ.getTrack(track_key);
                    });
            },
        getTrack: function(track_key, $track)
            {
                LazyDJ.showLoader();
                $('#playlist-not-found').animate({'height': 'hide', 'opacity': 'hide'}, 500);
                
                if ($track)
                    $track.closest('.track').nextAll().remove();
                
                $.getJSON(LazyDJ.host + track_key + 'popular/?callback=?', function(response)
                    {
                        if (response.data.length > 0)
                        {
                            var tracks = [], index = 0;
                            var cloudcastFetch = function()
                                {
                                    if (index >= response.data.length || tracks.length > 2)
                                    {
                                        if (tracks.length > 0)
                                        {
                                            var $newTrack = $('<ul class="track" style="display: none;"></ul>');
                                            $('#playlist').append($newTrack);
                                            
                                            $.each(tracks, function()
                                                {
                                                    var $newLi = $('<li><h3></h3><h4></h4></li>').appendTo($newTrack);
                                                    $newLi.find('h3').text(this.title);
                                                    $newLi.find('h4').text(this.artist);
                                                    $newLi.data('track-key', this.key);
                                                });
                                            
                                            LazyDJ.layoutTrack($newTrack);
                                            $newTrack.slideDown(500);
                                        }
                                        else
                                        {
                                            $('#playlist-not-found').slideDown(500);
                                        }
                                        LazyDJ.hideLoader();
                                        return;
                                    }
                                    var cloudcast = response.data[index];
                                    index++;
                                    $.getJSON(LazyDJ.host + cloudcast.key + '?callback=?', function(response)
                                        {
                                            for (var i = 0; i < response.sections.length; i++)
                                            {
                                                if (response.sections[i].track && track_key == response.sections[i].track.key)
                                                {
                                                    i++;
                                                    for (; i < response.sections.length; i++)
                                                    {
                                                        if (response.sections[i].track)
                                                        {
                                                            tracks.push({
                                                                    title: response.sections[i].track.name,
                                                                    artist: response.sections[i].track.artist.name,
                                                                    key: response.sections[i].track.key
                                                                });
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                            
                                            cloudcastFetch();
                                        });
                                }
                            cloudcastFetch();
                        }
                        else
                        {
                            $('#playlist-not-found').slideDown(500);
                            LazyDJ.hideLoader();
                        }
                    });
            }
    }

$(document).ready(function()
    {
        $(':text[title].show-hint').formHints();
        
        LazyDJ.layout();
        $(window).resize(LazyDJ.layout);
        
        $('#search-button').click(function()
            {
                var $input = $('#search-input');
                if (!$input.hasClass('form-input-hint') && $input.val() != '')
                    LazyDJ.search($input.val());
                return false;
            });
        
        $('#start-again-button').click(function()
            {
                LazyDJ.startAgain();
            });
        window.scrollTo(0, 1);
    });

$('#results li').live('click', function()
    {
        var $track = $(this);
        LazyDJ.select($track.find('h3').text(), $track.find('h4').text(), $track.data('track-key'));
        return false;
    });

$('#playlist li').live('click', function()
    {
        var $track = $(this);
        $track.siblings().removeClass('chosen').addClass('not-chosen');
        $track.removeClass('not-chosen').addClass('chosen');
        LazyDJ.getTrack($track.data('track-key'), $track);
    });