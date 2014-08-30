(function() {

    // Cache selectors
    var lastId,
        topMenu = $("#nav"),
        topMenuHeight = topMenu.outerHeight() + 15,
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function() {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });

    // Bind click handler to menu items
    // so we can get a fancy scroll animation
    menuItems.click(function(e) {
        var href = $(this).attr("href"),
            offsetTop = href === "#" ? 0 : $(href).offset().top - topMenuHeight + 150;
        $('html, body').stop().animate({
            scrollTop: offsetTop
        }, 800);
        e.preventDefault();
    });

    // Bind to scroll
    $(window).scroll(function() {
        // Get container scroll position
        var fromTop = $(this).scrollTop() + topMenuHeight;

        // Get id of current scroll item
        var cur = scrollItems.map(function() {
            if ($(this).offset().top < fromTop)
                return this;
        });
        // Get the id of the current element
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
            lastId = id;
            // Set/remove active class
            menuItems
                .parent().removeClass("active")
                .end().filter("[href=#" + id + "]").parent().addClass("active");
        }
    });

    function Slider(container, nav) {

        this.container = container;
        this.nav = nav.show();

        this.imgs = this.container.find('img');
        this.imgWidth = this.imgs[0].width;
        this.imgsLen = this.imgs.length;

        this.current = 0;
    }
    Slider.prototype = {
        transition: function(coords) {

            this.container.animate({
                'margin-left': coords || (-this.current * this.imgWidth)
            });
        },
        setCurrent: function(dir) {
            var pos = this.current;
            pos += (~~(dir === 'next') || -1);
            this.current = (pos < 0) ? this.imgsLen - 1 : pos % this.imgsLen;
            return pos;
        }
    };

    var container = $('div.slider').css('overflow', 'hidden').children('ul'),
        slider = new Slider(container, $('#slider-nav'));

    slider.nav.find('input').on('click', function() {
        slider.setCurrent($(this).data('dir'));
        slider.transition();
    });
})();