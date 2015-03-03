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
        $.extend(self, defaultOptions, options);

        function triggered(e){
            print("triggered", true);
            // has been triggered by root, do not need to check if root
            if( $(e.target).is(self.rightButton) ){
                self.turnPage(e, "right");
            }else if( $(e.target).is(self.leftButton)){
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

        root.on("click keypress", self.triggered);
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