var slideshow;
var nominated;
var prevBtn = document.getElementById('prevBtn');
var nextBtn = document.getElementById('nextBtn');
var playPauseBtn = document.getElementById('playPauseBtn');
var initialVolume = 100;
var currentSlideTitle = "";
var currentTopicTitle = "";
var roundedTime = 0;

$(document).ready(function() {
	$('.slides').show();
	$('#menubar').show();
	$('#titleBar').show();
	$('.loadingMessage').hide();
	$('audio,video').bind('ended',function() {endOfNominated(nominated)});

	initStandardMenus();
	initControls();
	initCore();
	document.title = $('body h1:first').text()
	initJQueryUI();
	initSubtitles();
	updateSlideTitles();
	initVolume();
	onResourceLoad();
});


function initCore() {
       var disableBuilds = true;
       var spaces = /\s+/
	var arrayForString = [''];


       var query = function(query) {
         return $.makeArray($(query));
       };

       var strToArray = function(s) {
         if (typeof s == 'string' || s instanceof String) {
           if (s.indexOf(' ') < 0) {
             arrayForString[0] = s;
             return arrayForString;
           } else {
             return s.split(spaces);
           }
         }
         return s;
       };


       var addClass = function(node, classStr) {
         classStr = strToArray(classStr);
         var cls = ' ' + node.className + ' ';
         for (var i = 0, len = classStr.length, c; i < len; ++i) {
           c = classStr[i];
           if (c && cls.indexOf(' ' + c + ' ') < 0) {
             cls += c + ' ';
           }
         }
         try {
		  node.className = cls.trim();
	  } catch(err) {
		  node.className = cls;
		  //AIR error
	  }
       };

       var removeClass = function(node, classStr) {
         var cls;
         if (classStr !== undefined) {
           classStr = strToArray(classStr);
           cls = ' ' + node.className + ' ';
           for (var i = 0, len = classStr.length; i < len; ++i) {
             cls = cls.replace(' ' + classStr[i] + ' ', ' ');
           }
		try {
			cls = cls.trim();
		} catch(err) {
			//AIR error
		}
         } else {
           cls = '';
         }
         if (node.className != cls) {
           node.className = cls;
         }
       };

       var Slide = function(node, idx) {
         this._node = node;
         if (idx >= 0) {
           this._count = idx + 1;
         }
         if (this._node) {
           addClass(this._node, 'slide distant-slide');
         }
         this._makeCounter();
         this._makeBuildList();
       };

       Slide.prototype = {
         _node: null,
         _count: 0,
         _buildList: [],
         _visited: false,
         _currentState: '',
         _states: [ 'distant-slide', 'far-past',
                    'past', 'current', 'future',
                    'far-future', 'distant-slide' ],
         setState: function(state) {
           if (typeof state != 'string') {
             state = this._states[state];
           }
           if (state == 'current' && !this._visited) {
             this._visited = true;
             this._makeBuildList();
           }
           removeClass(this._node, this._states);
           addClass(this._node, state);
           this._currentState = state;

           // delay first auto run. Really wish this were in CSS.

           var thisSlide = this;
           setTimeout(function(){ thisSlide._runAutos(); } , 400);
         },
         _makeCounter: function() {
           if(!this._count || !this._node) { return; }
           var c = document.createElement('span');
           c.innerHTML = 'Slide ' + this._count;
           c.className = 'counter';
           this._node.appendChild(c);
         },
         _makeBuildList: function() {
           this._buildList = [];
           if (disableBuilds) { return; }
           if (this._node) {
             this._buildList = query('[data-build] > *', this._node);
           }
           this._buildList.forEach(function(el) {
             addClass(el, 'to-build');
           });
         },
         _runAutos: function() {
           if (this._currentState != 'current') {
             return;
           }
           // find the next auto, slice it out of the list, and run it
           var idx = -1;
           this._buildList.some(function(n, i) {
             if (n.hasAttribute('data-auto')) {
               idx = i;
               return true;
             }
             return false;
           });
           if (idx >= 0) {
             var elem = this._buildList.splice(idx, 1)[0];
             var transitionEnd = isWK ? 'webkitTransitionEnd' : (isFF ? 'mozTransitionEnd' : 'oTransitionEnd');
             var _t = this;
               var l = function(evt) {
                 elem.parentNode.removeEventListener(transitionEnd, l, false);
                 _t._runAutos();
               };
               elem.parentNode.addEventListener(transitionEnd, l, false);
               removeClass(elem, 'to-build');
           }
         },
         buildNext: function() {
           if (!this._buildList.length) {
             return false;
           }
           removeClass(this._buildList.shift(), 'to-build');
           return true;
         }
       };



	Array.prototype.map = function(fn) {
		  var r = [];
		  var l = this.length;
		  for(i=0;i<l;i++)
		  {
			  r.push(fn(this[i]));
		  }
		  return r;
		};



 Array.prototype.some = function(fun /*, thisp*/) {
   var len = this.length;
   if (typeof fun != "function")
     throw new TypeError();

   var thisp = arguments[1];
   for (var i = 0; i < len; i++)
   {
     if (i in this &&
         fun.call(thisp, this[i], i, this))
       return true;
   }

   return false;
 };



       var SlideShow = function(slides) {

         this._slides = slides.map(function(el, idx) {										
           return new Slide(el, idx);
         });

         this.current = 1;
	  var thisSlideShow = this;
	  
         $('body').keydown(function (e) { thisSlideShow.handleKeys(e)});
         this._update();
       };



       SlideShow.prototype = {
         _slides: [],
         _update: function(dontPush) {

		if (this.current > 1) {
			prevBtn.enabled(true);
		} else {
			prevBtn.enabled(false);
		}
		if (this.current < this._slides.length) {
			nextBtn.enabled(true);
		} else {
			nextBtn.enabled(false);
		}
           for (var x = this.current-1; x < this.current + 7; x++) {
             if (this._slides[x-4]) {
               this._slides[x-4].setState(Math.max(0, x-this.current));
             }
           }
         },

         current: 0,
         next: function() {

           if (!this._slides[this.current-1].buildNext()) {
             this.current = Math.min(this.current + 1, this._slides.length);
             this._update();
           }
		if (this.current == this._slides.length) {
			nextBtn.enabled(false);
		}
		updateSlideTitles();
		setTabIndex();
		autoPlaySlide();
         },
         prev: function() {
           this.current = Math.max(this.current-1, 1);
           this._update();
		if (this.current == 1) {
			prevBtn.enabled(false);
		}
		updateSlideTitles();
		setTabIndex();
		autoPlaySlide();
         },
	  goto: function(s) {
		var old = this.current;
		while (this.current < s) {
			this.current++;
			this._update();
		}
		while (this.current > s) {
			this.current--;
			this._update();
		}
		if (this.current == 1) {
			prevBtn.enabled(false);
		}
		if (this.current == this._slides.length) {
			nextBtn.enabled(false);
		}
		updateSlideTitles();
		setTabIndex();
		autoPlaySlide();
         },

	  handleKeys: function(e) {
		switch (e.keyCode) {
		case 107: // Add
			var vol = $('#volumeSlider').slider('value');
			if (vol < 100) vol++;
               $('#volumeSlider').slider('value',vol);
			break;
		case 109: // Subtract
               var vol = $('#volumeSlider').slider('value');
			if (vol > 0) vol--;
               $('#volumeSlider').slider('value',vol);
			break;
		}
         }

       };

       slideshow = new SlideShow(query('.slide'));
}

 
		var volume_control;
		function initVolume()
		{
				$('#volumeSlider').slider({
					orientation: 'vertical',
					change: function(event, ui){
				  set_volume($('#volumeSlider').slider('value') / 100);
				}
			  });
			$('#volumeSlider').slider('value',initialVolume);
		}

function set_volume(new_volume) {
	if (nominated) {
		if (nominated.getAttribute('data-contenttype') == 'flash') {
			nominated.updateVolume(new_volume); //Flash
		} else {
			try {
				nominated.getElementsByTagName('object')[0].sendEvent("VOLUME",(new_volume * 100));	 //JW			
			} catch(e) {
				try {
					nominated.volume = new_volume; //HTML5
				} catch(e) {
					//Don't know how to change the volume on this content
				}
			}
		}
	}
	document.getElementById('volume_display').innerHTML = parseInt(new_volume*100);
}

function changeBtnState(btn,state,type) {
	switch (type) {
		case 'toolbarSimple':
			$(btn).children('img').hide();
			$(btn).children('img[data-btnstate="' + state + '"]').show();
			if (state == 'down') {
				$(btn).css({'background-color': '#007b94'});
				if ($(btn).children('img').length == 0) $(btn).css({'background-color': '#007b94','padding-top': '7px','padding-bottom':'3px'});
			} else {
				$(btn).css({'background-color': 'transparent'});
				if ($(btn).children('img').length == 0) $(btn).css({'background-color': 'transparent','padding-top': '5px','padding-bottom':'5px'});
			}
			break;
		case 'mayBeDisabled':
			if (btn.enabledstate == true) {
				$(btn).children('img').hide();
				$(btn).children('img[data-btnstate="' + state + '"]').show();
			}
			break;
	}
}

function initStandardMenu(btn) {
	var mnu = document.getElementById(btn).attributes['data-pairedmenu'].value;
	
	$('#' + btn).click(function() { 
		showHideMenu(btn,mnu);
	});
	$('#' + btn).keypress(function(evt) {
		if (evt.which == '13') showHideMenu(btn,mnu);
	});
	
	if($('#' + mnu).find('img:first').attr('src') == 'images/closeBtn.png') {
		$('#' + mnu).find('img:first').click(function(){
			$('#' + mnu).hide('slide', { direction: 'down' }, 300);
			changeBtnState($('#'+btn),'up','toolbarSimple');
		});
	}
}

function showHideMenu(btn,mnu) {
	if ($('#' + mnu).is(':hidden')) {
		$('.popupMenu').each(function(i){
			if ($(this).is(':visible')) {
				$(this).hide('slide', { direction: 'down' }, 300);
			}
		});
		$('#' + mnu).show('slide', { direction: 'down' }, 300);
		changeBtnState($('.secondaryMenuBtn'),'up','toolbarSimple');
		changeBtnState($('#'+btn),'down','toolbarSimple');
	} else {
		$('#' + mnu).hide('slide', { direction: 'down' }, 300);
		changeBtnState($('#'+btn),'up','toolbarSimple');
	}
}

function initStandardMenus() {
	initStandardMenu('mainBtn');
	initStandardMenu('soundBtn');
	initStandardMenu('subtitlesBtn');

	$('#menubarSecondary').children().each(function() {
		initStandardMenu(this.id);
	});
	
	$('#mainMenu > nav').find('ul').hide();
	$('#mainMenu > nav').find('ul:first').show();
	$('#mainMenu > nav > li > h3').click(function() {
		$(this).next().toggle('slow');
	});
	$('#mainMenu > nav > li > h3').keypress(function(evt) {
		if (evt.which == '13') {
			$(this).next().toggle('slow');
		}
	});	
}

function initControls () {
	$(prevBtn).mousedown(function () { changeBtnState(this,'down','mayBeDisabled') });

	$(prevBtn).mouseup(function () {
								 	changeBtnState(this,'up','mayBeDisabled');
									slideshow.prev();
	});

	prevBtn.enabled = function (EorD) {
		if (EorD == true) {
			prevBtn.enabledstate = true;
			$(prevBtn).children().hide();
			$(prevBtn).children('[data-btnstate="up"]').show();
		} else {
			prevBtn.enabledstate = false;
			$(prevBtn).children().hide();
			$(prevBtn).children('[data-btnstate="disabled"]').show();
		}
	}

	$(nextBtn).mousedown(function () { changeBtnState(this,'down','mayBeDisabled') });
	$(nextBtn).mouseup(function () {
									changeBtnState(this,'up','mayBeDisabled');
									slideshow.next();
	});
	nextBtn.enabled = function (EorD) {
		if (EorD == true) {
			nextBtn.enabledstate = true;
			$(nextBtn).children().hide();
			$(nextBtn).children('[data-btnstate="up"]').show();
		} else {
			nextBtn.enabledstate = false;
			$(nextBtn).children().hide();
			$(nextBtn).children('[data-btnstate="disabled"]').show();
		}
	}
	playPauseBtn.toggle = function (PPorD) {
		if (PPorD == 'playing') {
			playPauseBtn.togglestate = 'playing';
			$(playPauseBtn).children().hide();
			$(playPauseBtn).children(':eq(1)').show();
		}
		if (PPorD == 'paused') {
			playPauseBtn.togglestate = 'paused';
			$(playPauseBtn).children().hide();
			$(playPauseBtn).children(':eq(2)').show();
		}
		if (PPorD == 'disabled') {
			playPauseBtn.togglestate = 'disabled';
			$(playPauseBtn).children().hide();
			$(playPauseBtn).children(':eq(0)').show();
		}
	}
	$(playPauseBtn).mousedown(function () {
		switch (playPauseBtn.togglestate) {
		case 'playing':
		$(playPauseBtn).children().hide();
			$(playPauseBtn).children(':eq(5)').show();
			break;
		case 'paused':
				$(playPauseBtn).children().hide();
			$(playPauseBtn).children(':eq(6)').show();
			break;
		case 'disabled':
			break;
		}
	});
	$(playPauseBtn).mouseup(function () {
		switch (playPauseBtn.togglestate) {
		case 'playing':
			playPauseBtn.toggle('paused');
			pauseNominated(nominated);
			break;
		case 'paused':
			playPauseBtn.toggle('playing');
			playNominated(nominated);
			break;
		case 'disabled':
			break;
		}
	});
	if (nominated) {
		playPauseBtn.toggle('playing');		
		playNominated(nominated);
	} else {
		playPauseBtn.toggle('disabled');
	}

	$('#homeBtn').children('[data-btnstate="down"]').hide();
	$('#homeBtn').mousedown(function () {
		changeBtnState(this,'down','toolbarSimple');
	});
	$('#homeBtn').mouseup(function () {
		changeBtnState(this,'up','toolbarSimple');
		slideshow.goto(1);
	});
	$('#homeBtn').keypress(function (evt) {
		if (evt.which == '13') {
			slideshow.goto(1);
		}
	});

	$('#printBtn').children('[data-btnstate="down"]').hide();
	$('#printBtn').mousedown(function () {
		changeBtnState(this,'down','toolbarSimple');
	});
	$('#printBtn').mouseup(function () {
		changeBtnState(this,'up','toolbarSimple');
		window.print();
	});
	$('#printBtn').keypress(function (evt) {
		if (evt.which == '13') {
			window.print();
		}
	});
	$('#soundBtn').children('[data-btnstate="down"]').hide();
}

//JW player global ready function
function playerReady(obj) {
	initJWSubs(obj);
	
	var player = document.getElementById(obj.id);
	player.addModelListener('STATE', 'jwStateMonitor');
}

function jwStateMonitor(obj) {
	if (obj.newstate == 'COMPLETED') endOfNominated(nominated);
}

function initJQueryUI() {
	$('button').button();
}

function showWelcomeMessage() {
	$('#welcome-message').dialog({
			modal: true,
			buttons: {
				Begin: function() {
					$(this).dialog( "close" );
				}
			},
			close: function () {
				slideshow.goto(slideshow.current);
			}
		});
}

var captions = []; // empty array to hold the individual captions
var caption = document.getElementById('caption');

// function to populate the 'captions' array with the specified language
function getCaptions(lang) {	
  captions = []; // empty the captions array
  var nodes = $('.current .transcript > div[lang="' + lang + '"] span'); // use the "lang" CSS pseudo-class to grab all spans in the language's transcript (not headings)
  var node = "";
  for (var i = 0, len = nodes.length; i < len; i++) { // loop through them
    node = nodes[i];
    var c = {'start': parseFloat(node.getAttribute('data-begin')), // get start time
      'end': parseFloat(node.getAttribute('data-end')), // and end time
      'text': node.innerHTML};
    captions.push(c); // and all the captions into an array
  }
}

initSubtitles = function() {
  getCaptions('en');
  $('#langbuttons').buttonset();
}


function initJWSubs(obj) {
	var player = document.getElementById(obj.id);
	player.addModelListener('TIME', 'jwtimeupdate');
}


function htmltimeupdate(obj) {
	timeupdate(obj.currentTime);
}

function jwtimeupdate(obj) {
	timeupdate(obj.position);
};

function timeupdate(now) {
	var roundedTimeToCheck = Math.round(now);
	if (roundedTimeToCheck != roundedTime) {
		roundedTime = roundedTimeToCheck;
		roundedtimeupdate(roundedTime);
	}
}

function roundedtimeupdate(now) {
  var text = "", cap = "";
  for (var i = 0, len = captions.length; i < len; i++) {
    cap = captions[i];
    if (now >= cap.start && now <= cap.end) {
		text = cap.text;
		break;
	}
  }
  document.getElementById('caption').innerHTML = text;
  
  if (slideEvents[currentSlideTitle]) {
	  for (var evt = 0; evt < slideEvents[currentSlideTitle].events.length; evt++) {
		  if (roundedTime == slideEvents[currentSlideTitle].events[evt].time) slideEvents[currentSlideTitle].events[evt].action();
	  }
  }
}

function nominate(element) {
	try {
		if (nominated)	pauseNominated(nominated);
		nominated = element;
		getCaptions('en');
		set_volume($('#volumeSlider').slider('option','value') / 100);
		playPauseBtn.toggle('playing');
		resetAndPlayNominated(nominated);			
	} catch(e) {
		alert('Whoops! Player error:' + e);
	}
}

function endOfNominated(nom) {
	playPauseBtn.toggle('paused');
	$('#nextBtn').fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn();
}

function forceSubtitle(text) {
	document.getElementById('caption').innerHTML = text;
}

function updateSlideTitles() {	
	currentSlideTitle = $('.current h3:first').text()
	currentTopicTitle = $('.current').parent().find('h2:first').text()
	document.getElementById('slidetitle').innerHTML = currentSlideTitle;
	document.getElementById('topictitle').innerHTML = currentTopicTitle;
}

function autoPlaySlide() {
	forceSubtitle('');
	var curr = $('.current')[0];
	if (curr.getAttribute("data-dontinterrupt") != 'true') {
	if (nominated) {			
				pauseNominated(nominated);
	}
		playPauseBtn.toggle('paused');
		
		var currAutoplayers = $('.current').find('[data-autoplay="true"]');
		if (currAutoplayers.length == 0) {
				playPauseBtn.toggle('disabled');
				nominated = undefined;		 
		} else {
			nominate(currAutoplayers[0]);
		}
	}
}

function setTabIndex() {
	$('a, area, button, h1, h2, h3, h4, img, li, map, p, video, .hidden').attr('tabindex','-1');
	$('.current').find('a, area, button, h1, h2, h3, h4, img, li, p, video').attr('tabindex','1');
	$('#menubar > menu > li, #mainMenu > nav > li > h3, #mainMenu > nav > li > ul > li').attr('tabindex','1');
	$('#glossaryBox .content-container').attr('tabindex','1');
}

$.fn.tabbedDialog = function (params) {
	this.tabs();
	this.dialog(params);
	this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
	this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
	this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
	var tabul = this.find('ul:first');
	this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
	this.siblings('.ui-dialog-titlebar:not(.ui-tabs-nav.)').remove();
	tabul.addClass('ui-dialog-titlebar');
}

function playNominated(nominated) {
	if (nominated.getAttribute('data-contenttype') == 'flash') {
		nominated.flashPlay();
	} else {
		try {
			nominated.getElementsByTagName('object')[0].sendEvent("PLAY",true);	 //JW			
		} catch(e) {
			try {
				nominated.play(); //HTML5
			} catch(e) {
				//Don't know how to play this content
			}
		}
	}
}

function pauseNominated(nominated) {
	if (nominated.getAttribute('data-contenttype') == 'flash') {
		nominated.flashPause();
	} else {
		try {
			nominated.getElementsByTagName('object')[0].sendEvent("PLAY",false);	 //JW			
		} catch(e) {
			try {
				nominated.pause(); //HTML5
			} catch(e) {
				//Don't know how to play this content
			}
		}
	}
}

function resetAndPlayNominated(nominated) {
	if (nominated.getAttribute('data-contenttype') == 'flash') {
		nominated.flashReset();
	} else {
		try {
			nominated.getElementsByTagName('object')[0].sendEvent("SEEK",0);	 //JW			
		} catch(e) {
			try {
				nominated.currentTime = 0; //HTML5
			} catch(e) {
				//Don't know how to play this content
			}
		}
	}
	playNominated(nominated); //For HTML/Flash because JW is playing already
}


//FILMSTRIP
window.onresize = function () {
  $('.filmstripwrapper').height(window.innerHeight - 80 + "px");
}

function initFilmstrip() {
	$('.filmstripcontent').children().hide();
}

function filmstripSelect(clickedImage) {
	$(clickedImage).parent().children().each(function(index){
		if (this == clickedImage) {
				$(clickedImage).parent().parent().next().children().hide();
				var clickedImagePartner = $(clickedImage).parent().parent().next().children()[index];
				$(clickedImagePartner).show();
		}
	});
}


//GLOSSARY
$(".letters li").each(function() { 
	$(this).click(function() {
		elementClick = $(this).attr("id");
		$(".content-container").scrollTo($("#content-for-"+elementClick), 1000);
	});
});