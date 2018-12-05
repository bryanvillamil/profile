$( document ).ready(function() {
  $('#back-top').click(function(){
    $('html,body').animate({ scrollTop: 0 }, 'slow');
    return false;
  });

  cloneMenuForMobiles();

  $('#menu-access').click(function(){
    if($(this).is('.active')){
      $(this).removeClass('active');
      $('nav.mobile').hide();
      return;
    }

    $(this).addClass('active');
    $('nav.mobile').show();
  });

  $('header li.hello span').click(showRecentlyWatchDesktop);
  $('nav.mobile li.hello span').click(showRecentlyWatchMobile);

  $('input.search').keypress(function (e) {
   var key = e.which;
   if(key == 13){
     document.location.href = './results.html?q=' + encodeURIComponent($(this).val());
   }
  });
});

function showHide(args){
  if(args.isClosing){
    args.menuButton.removeClass('sclose');
    args.watchBox.removeClass('sshow');
    return;
  }

  args.menuButton.addClass('sclose');
  args.watchBox.addClass('sshow');
}

function showRecentlyWatchDesktop(e){
  e.preventDefault();
  showHide({
    isClosing: $(this).is('.sclose'),
    menuButton: $(this),
    watchBox: $('header div.recently-watched')
  });
}

function showRecentlyWatchMobile(e){
  e.preventDefault();
  showHide({
    isClosing: $(this).is('.sclose'),
    menuButton: $(this),
    watchBox: $('nav.mobile div.recently-watched')
  });
}

function cloneMenuForMobiles(){
  $('nav.mobile ul').append($('li.hello').clone());
  $('nav.mobile ul').append($('nav.desktop ul li').clone());
  $('nav.mobile ul').append($('li.logout').clone());
  $('nav.mobile ul li.hello').append($('div.recently-watched').clone());
}

