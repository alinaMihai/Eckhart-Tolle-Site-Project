$(function() {
      //utils
      //play or pause the video element, changing the style accordingly
      var checkPlayer = function(src, videoPlayer, target, changeDescription) {
          //set display none for previous track
          $('.youtube').css('display', 'none').attr('src', '');

          $('#youtube-current').css('display', 'none');
          $('.selected').removeClass('selected');
          //set display block for the current video
          $('#videoWrapper').css('display', 'block');

          if (src === videoPlayer.getAttribute('src')) {
              if (videoPlayer.paused) {
                  videoPlayer.play();
                  target.attr('id', 'playing');
              } else {
                  videoPlayer.pause();
                  target.attr('id', 'paused');
              }
          } else {
              videoPlayer.src = src;
              videoPlayer.play();
              videoPlayer.volume = 0.5;
              videoElement.changeDescription(changeDescription.part);
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

      //create a playlist object to fetch data and initialize
      function Playlist(config) {
          this.file = config.file;
          this.template = config.template;
          this.container = config.container;
          Handlebars.registerHelper('log', function(context) {
              return console.log(context);
          });
          this.fetch();


      }
      Playlist.prototype = {

          attachTemplate: function(tmpl, cntr, items) {
              var template = Handlebars.compile(tmpl);
              //refresh the container for each video album
              if (!cntr.is(":empty")) {
                  cntr.html(tmpl);
              }
              cntr.html(template(items));
          },
          fetch: function() {
              var self = this;

              $.getJSON(this.file, function(data) {

                  self.items = $.map(data, function(item) {

                      return {
                          name: item.album,
                          index: item.index,
                          parts: item.parts,
                          src: item.src
                      };
                  });
                  //attach the read data to the container
                  self.attachTemplate(self.template, self.container, self.items);
                  //activate the events
                  self.events();
                  // select first video by default
                  $('li.albumName').first().trigger("click");
                  $('div.play').first().trigger("click");
                  $('#video')[0].pause();
              });
          },
          events: function() {
              var self = this;
              var thePartsTemplate = $('.partsTemplate').html(),
                  thePartsContainer = $('#video-parts');

              $('li.albumName').on('click', function() {
                  //change active li class
                  var $this = $(this);
                  $('li.current').removeClass('current');
                  $this.addClass('current');

                  var element = self.seachElement(self.items, $this.text());
                  //console.log(element, self.items);
                  self.attachTemplate(thePartsTemplate, thePartsContainer, self.items[element]);

                  // self.attachTemplate(thePartsTemplate, thePartsContainer, self.items[element]);
                  if (!$('#accordion').hasClass('ui-accordion')) {
                      $('#accordion').accordion({
                          active: 0,
                          collapsible: false,
                          animate: {
                              easing: "easeInCubic",
                              duration: 400,
                              down: {
                                  easing: "easeOutCirc",
                                  duration: 400
                              }
                          },
                          icons: {
                              "header": "ui-icon-plus",
                              "activeHeader": "ui-icon-minus"
                          }
                      });
                  }

                  $('div.play').on('click', function() {

                      var partName = $(this).data('partname'),
                          currentSrc = self.items[element].src + partName + '.mp4',
                          videoPlayer = $('#video');

                      var changeDescription = {
                          part: partName
                      };
                      videoElement.setInfo({
                          part: $(this)
                      });
                      checkPlayer(currentSrc, videoPlayer[0], $(this), changeDescription);

                  });
              });
          },
          seachElement: function(arrayObject, value) {
              for (var i = 0; i < arrayObject.length; i++) {
                  if (arrayObject[i].name === value) {
                      return arrayObject[i].index;
                  }
              }


          }
      };

      // takes care of the video events by changing the style accordingly
      var videoElement = {
          init: function(conf) {
              this.videoPlayer = conf.videoPlayer;
              this.currentPlayBox = conf.playBox;
              this.events();
          },
          events: function() {
              var self = this;
              this.videoPlayer.on('pause', function() {
                  self.trackObject.attr('id', 'paused');
                  //console.log(self.trackObject);
              });
              this.videoPlayer.on('play', function() {
                  self.trackObject.attr('id', 'playing');
              });
          },
          setInfo: function(conf) {
              this.trackObject = conf.part;

          },
          changeDescription: function(partName) {
              this.currentPlayBox.html('<b>' + partName + '</b>').slideUp(0).fadeIn(800);
          }
      };

      function embedYoutube() {
          $('.youtube-list').on('click', function() {
              //pause and make invisible the film if it was playing
              $('#videoWrapper').css('display', 'none');
              $('#video')[0].pause();

              //find the current video src
              var youtubePlayer = $('.youtube'),
                  src = $(this).data('src'),
                  name = $(this).text();

              //change style
              $('.selected').removeClass('selected');
              $(this).addClass('selected');

              //change src of the iframe
              youtubePlayer.attr('src', src);
              youtubePlayer.css('display', 'block');

              $('#youtube-current').html('<b>' + name + '</b>').slideUp(0).slideDown(400);
          });

      }
      $(document).ready(function() {
          var playlist_left = new Playlist({
              file: 'json/video.json',
              template: $('.videoTemplate').html(),
              container: $('#videos-list'),
          });
          videoElement.init({
              videoPlayer: $('#video'),
              playBox: $('#currentPlay')
          });
          embedYoutube();

      });

  });