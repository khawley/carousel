/*
    This carousel object class was meant to be a friendlier and more accessible alternative to some carousels.
    It does not require ul/li tags (though they are encouraged for accessibility purposes).
    It assumes a structure of:
    <tag id/class="selector">
        <tag class="prev-button">Previous</tag>
        .....
        <tag class=".item-page">...</tag>
        <tag class=".item-page">...</tag>
        ....
        <tag class=".next-button">Next</tag>
    </tag>

    Carousel will add class activeClass to the current item, and notActiveClass to any hidden items.
    Will also adjust aria-hidden accordingly.

    CSS for activeClass is NOT necessary, as long as using a notActiveClass with a display:none style.
    activeClass IS needed for javascript selecting.


 */
$(function(){

    function Carousel(selector, options){
        // root ~= $(selector)
        var self = this;
        var root = $(selector);
        var defaultOptions = {
            activeClass: 'active',
            notActiveClass: 'hidden',
            pageClass: ".item-page",
            rightButton: ".next-button",
            leftButton: ".prev-button",
            randomStart: false,
            currentPage: ".currentPage",
            totalPages: ".totalPages",
            progress: "#progress",
            debug: false
        };
        var key = {
            rightArrow: 39,
            leftArrow: 37,
            space: 32,
            enter: 13
        }
        $.extend(self, defaultOptions, options);

        self.buttons = self.rightButton+","+self.leftButton;

        function triggered(e){
            print("triggered", true);
            if ( e.type != "click" ){
                // only trigger key press/key down for enter, space, or left/right arrow keys
                var code = (e.keyCode || e.which);
                if([key.rightArrow, key.leftArrow, key.space, key.enter].indexOf(code) == -1){
                    return;
                }
            }

            // has been triggered by root, do not need to check if root
            if( $(e.target).is(self.rightButton) || code == key.rightArrow ){
                self.turnPage(e, "right");
            }else if( $(e.target).is(self.leftButton) || code == key.leftArrow){
                self.turnPage(e, "left")
            }
        }
        function turnPage(e, direction){
            e.preventDefault();
            print("turning "+direction);
            var current = self.getActivePage();
            var newCurrent = self.nextPage(direction);
            self.makePageActive(newCurrent);
            self.makePageInactive(current);
            self.updatePageLocation();
            updateFocus(e);
        }
        function updateFocus(e){
            /* Specifically if user navs with arrows from within carousel, the focus will need to be shifted
                else the user will be directed to the top of the page again :P
            */
            if( ! $(e.target).is(self.buttons) ){
                $("."+self.activeClass+" a:first").focus();
            }
        }
        function pickRandom(){
            var l = self.getSize();
            $(self.progress).text("picking random, size="+l).append("<br>");
            var rand = Math.floor(Math.random() * (l));
            $(self.progress).append("rand="+rand+"<br>");
            makePageInactive(self.getPages());
            self.makePageActive(rand);
            self.updatePageLocation();
            print("chose random start");
        }
        function makePageActive(el){
            // check if passing pageIndex
            if(el === parseInt(el, 10)){
                el = self.getPages().eq(el);
            }

            if(! el instanceof jQuery){
                el = $(el);
            }
            $(el).addClass(self.activeClass).removeClass(self.notActiveClass);
            $(el).attr("aria-hidden", "");
        }
        function makePageInactive(el){
            if(! el instanceof jQuery){
                el = $(el);
            }
            $(el).addClass(self.notActiveClass).removeClass(self.activeClass);
            $(el).attr("aria-hidden", "true");
        }
        function print(msg, firstMsg){
            //if($(self.progress).length !=0){
            // firstMsg, set to true/false, will wipe all prev text from element when true
            if(!self.debug){
                return;
            }
            if($(self.progress).length != 0) {
                if (firstMsg) {
                    $(self.progress).text(msg).append("<br>");
                } else {
                    $(self.progress).append(msg + "<br>");
                }
            }else{
                console.log("Carousel: "+msg);
            }
        }

        // add all above functions to self
        $.extend(self, {
            getSize: function(){
                return self.getPages().size();
            },
            getPages: function(){
                return root.find(self.pageClass);
            },
            getActivePage: function(){
                return self.getPages().filter("."+self.activeClass);
            },
            updatePageLocation: function(current){
                self.updateCurrentPage(current);
                self.updateTotalPages();
            },
            updateCurrentPage: function(page){
                if(page === undefined){
                    page = self.getActivePage().index();
                }
                root.find(self.currentPage).text(page+1);
            },
            updateTotalPages: function(){
                root.find(self.totalPages).text(self.getSize());
            },
            nextPage: function(direction){
                if( direction == "right" ){
                    return self.rightPage();
                }else if( direction == "left" ){
                    return self.leftPage();
                }
            },
            rightPage: function(){
                var next = self.getActivePage().next(self.pageClass);
                if(next.length != 0){
                    return next;
                }else{
                    return self.getPages().first();
                }
            },
            leftPage:function(){
                var prev = self.getActivePage().prev(self.pageClass);
                if(prev.length != 0){
                    return prev;
                }else{
                    return self.getPages().last();
                }
            },
            turnPage: turnPage,
            makePageActive: makePageActive,
            makePageInactive: makePageInactive,
            pickRandom: pickRandom,
            triggered: triggered

        });


        // initialization code
        if(self.randomStart){
            self.pickRandom();
        }else{
            self.updatePageLocation();
        }

        root.on("click keypress keydown", self.triggered);
    }

    // jQuery plugin implementation
    $.fn.carousel = function(opts) {
        // already constructed --> return API
        var el = this.data("carousel");
        if (el) { return el; }

        this.each(function() {
            el = new Carousel(this, opts);
            $(this).data("carousel", el);
        });

        return el;

    };
});