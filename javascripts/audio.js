(function() {


    //utils
    var checkPlayer = function(src, audioPlayer, target, changeDescription) {
        if (src === audioPlayer.getAttribute('src')) {
            if (audioPlayer.paused) {
                audioPlayer.play();
                target.attr('id', 'playing');
            } else {
                audioPlayer.pause();
                target.attr('id', 'paused');
            }
        } else {
            audioPlayer.src = src;
            audioPlayer.play();
            audioPlayer.volume = 0.5;
            AudioElement.changeTrackDescription(changeDescription.albumName, changeDescription.cdName, changeDescription.track);
            if (document.querySelector('#playing')) {
                document.querySelector('#playing').id = '';
            } else {
                if (document.querySelector('#paused')) {
                    document.querySelector('#paused').id = '';
                }

            }
            target.attr('id', 'playing');
        }

    };

    function scrollIntoView(element, container) {
        var containerTop = container.scrollTop(),
            containerBottom = containerTop + container.height(),
            elemTop = element[0].offsetTop - 230,
            elemBottom = elemTop + element.height();
        if (elemTop < containerTop) {
            container.scrollTop(elemTop);
        } else if (elemBottom > containerBottom) {
            container.scrollTop((elemBottom) - container.height());
        }
    }

    function Playlist(config) {
        this.file = config.file;
        this.template = config.template;
        this.container = config.container;
        this.fetch();
    };
    Playlist.prototype = {
        attachTemplate: function() {
            var self = this;
            var template = Handlebars.compile(this.template);
            Handlebars.registerHelper('log', function(context) {
                return console.log(context);
            });
            this.container.append(template(this.items));
            this.events();

        },
        fetch: function() {
            var self = this;

            $.getJSON(this.file, function(data) {

                self.items = $.map(data, function(item) {

                    return {
                        name: item.album,
                        index: item.index,
                        subfolders: item.subfolders
                    };
                });
                self.attachTemplate();
            });
        },
        events: function() {
            var self = this,
                li_folder = self.container.find($('li.subfolder')),
                div_tracks = self.container.find($('div.tracks'));
            li_folder.first().siblings().css('display', 'block');
            $('.accordion').accordion({
                active: 0,
                collapsible: true,
                animate: {
                    easing: "easeInCubic",
                    duration: 400,
                    down: {
                        easing: "easeOutCirc",
                        duration: 400
                    }
                },
                heightStyle: "fill",
                icons: {
                    "header": "ui-icon-plus",
                    "activeHeader": "ui-icon-minus"
                }
            });
            li_folder.on('click', function() {
                var $this = $(this);
                self.container.find($('.subfolder')).removeClass('selected').siblings();

                scrollIntoView($this, $this.parents('div.albumName'));
                $this.siblings().fadeToggle();
                $this.addClass('selected');

                self.container.find($('.subfolder')).each(function(i, elem) {
                    if (!$(elem).hasClass('selected')) {
                        $(elem).siblings().fadeOut(0);
                    }
                });
            });

            div_tracks.on('click', 'li.track', function() {
                // console.log("items " + self.items);
                var $this = $(this),
                    track = $this.text(),
                    song = $('#mySong'),
                    indexCD = $this.closest('div').data('cd'),
                    indexAlbum = $this.closest('div.albumName').data('album'),
                    album = self.items[indexAlbum],
                    albumName = album.name,
                    subfolders = album.subfolders,
                    cdName = subfolders[indexCD].name;

                var currentSrc = subfolders[indexCD].src + track + '.mp3';
                AudioElement.setTrackInfo($this, self.items, {
                    indexA: indexAlbum,
                    name: albumName
                }, {
                    indexS: indexCD,
                    name: cdName
                });
                checkPlayer(currentSrc, song[0], $this, {
                    albumName: albumName,
                    cdName: cdName,
                    track: track
                });
            });
        }

    };

    var AudioElement = {
        init: function(config) {
            this.nextButton = config.nextButton;
            this.prevButton = config.prevButton;
            this.audioPlayer = config.audioPlayer;
            this.events();
        },
        events: function() {
            var self = this;

            this.nextButton.on('click', function() {
                //conditions
                if (self.currentTrackIndex === self.items_tracks.length - 1) {
                    console.log("end of list");
                    self.currentTrackIndex = -1;
                }

                //find next track info
                var nextTrack = self.items_tracks[++self.currentTrackIndex],
                    nextSrc = self.subfolders[self.indexSubfolder].src + nextTrack + '.mp3';

                //set current info to the next track info
                self.playTrack(nextSrc, nextTrack, (self.trackObject.next().text() !== "") ? self.trackObject.next() : self.trackObject.siblings().first());
            });
            this.prevButton.on('click', function() {

                if (self.currentTrackIndex === 0) {

                    self.currentTrackIndex = self.items_tracks.length;
                }
                //find prev track info
                var prevTrack = self.items_tracks[--self.currentTrackIndex],
                    prevSrc = self.subfolders[self.indexSubfolder].src + prevTrack + '.mp3';

                self.playTrack(prevSrc, prevTrack, (self.trackObject.prev().text() !== "") ? self.trackObject.prev() : self.trackObject.siblings().last());

            });
            this.audioPlayer.on('ended', function() {
                self.nextButton.trigger('click');
            });
            this.audioPlayer.on('pause', function() {
                self.trackObject.attr('id', 'paused');

            });
            this.audioPlayer.on('play', function() {
                self.trackObject.attr('id', 'playing');
            });

        },
        changeTrackDescription: function(albumName, cdName, track) {
            $('#songDescription').html('<b>' + "Album " + albumName + "<br> " + (cdName || "") + "<br>" + track + "</b>").slideUp(0).fadeIn(800);
        },
        setTrackInfo: function(currentTrack, items, album, subfolder) {
            var self = this;
            self.indexAlbum = album.indexA;
            self.indexSubfolder = subfolder.indexS;
            self.subfolders = items[self.indexAlbum].subfolders;
            self.items_tracks = items[self.indexAlbum].subfolders[self.indexSubfolder].tracks;
            self.currentTrack = currentTrack.text();
            self.currentTrackIndex = self.items_tracks.indexOf(self.currentTrack);
            self.album = album;
            self.subfolder = subfolder;
            self.trackObject = currentTrack;
        },
        playTrack: function(src, changedTrack, changedTrackObject) {
            var self = this;
            //set current info to the next track info
            self.currentTrack = changedTrack;
            self.trackObject = changedTrackObject;
            var changeDescription = {
                albumName: self.album.name,
                cdName: self.subfolder.name,
                track: self.currentTrack
            };
            self.audioPlayer[0].volume = 0.5;
            checkPlayer(src, self.audioPlayer[0], self.trackObject, changeDescription);
            scrollIntoView(self.trackObject, self.trackObject.parents('div.albumName'));
        }
    };

    var playlist_left = new Playlist({
        file: 'json/audio.json',
        template: $('.audioTemplate').html(),
        container: $('#playlist-left'),
    });

    var playlist_right = new Playlist({
        file: 'json/audio-right.json',
        template: $('.audioTemplate').html(),
        container: $('#playlist-right'),
    });

    AudioElement.init({
        nextButton: $('#next'),
        prevButton: $('#prev'),
        audioPlayer: $('#mySong')
    });

})();