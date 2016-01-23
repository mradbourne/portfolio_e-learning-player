function onResourceLoad() {
	showWelcomeMessage(); // If inactive, the first slide will not look for an item to autoplay
	additionalJQueryUI();
	addFlashContent();
	addJWPlayers();
	initFilmstrip();
}

function additionalJQueryUI() {
	//e.g. $( "#tabs" ).tabs();
}

function addFlashContent() {
	//e.g. swfobject.embedSWF('resource/swf/slide.swf', 'flashdemo', '1024', '570', '10.0.0', false, false, {'scale':'noscale','wmode':'transparent'}, {'class':'fullscreen','data-autoplay':'true'});
}

function addJWPlayers() {
	swfobject.embedSWF('jw/player.swf', 'jwaudio-the_way_we_live', '640', '20', '9.0.124', false,{'file':'resource/audio/the_way_we_live.mp3','title':'The way we live'},{'allowscriptaccess':'always'},{'id':'newjwaudio-the_way_we_live','name':'newjwaudio-the_way_we_live','data-contenttype':'jw','data-autoplay':'true','class':'hidden'});
	swfobject.embedSWF('jw/player.swf', 'jwvideo-ecosystems', '640', '380', '9.0.124', false,{'file':'../resource/video/ecosystems.mov','title':'Ecosystems','backcolor':'FFFFFF','frontcolor':'000000','lightcolor':'00add0','screencolor':'000000'},{'allowfullscreen':'true','allowscriptaccess':'always','bgcolor':'#FFFFFF'},{'id':'newjwvideo-ecosystems','name':'newjwvideo-ecosystems','data-contenttype':'jw','data-autoplay':'true'});
}

var slideEvents = [];
slideEvents['Goals for a sustainable environment'] = {'events': [
			/* Reset */  {'time': 0, 'action': function() { $('#showme1st, #showme2nd, #showme3rd, #showme4th').hide() }},
						 {'time': 3, 'action': function() { $('#showme1st').fadeIn('slow') }},
						 {'time': 8, 'action': function() { $('#showme2nd').fadeIn('slow') }},
						 {'time': 18, 'action': function() { $('#showme3rd').fadeIn('slow') }},
						 {'time': 38, 'action': function() { $('#showme4th').fadeIn('slow') }}
						 ]};
slideEvents['Ecosystem services'] = {'events': [
			/* Reset */  {'time': 0, 'action': function() { $('#showaside1, #showaside2, #showaside3').hide() }},
						 {'time': 35, 'action': function() { $('#showaside1').fadeIn('slow') }},
						 {'time': 64, 'action': function() { $('#showaside1').fadeOut('slow', function(){$('#showaside2').fadeIn('slow')}) }},
						 {'time': 110, 'action': function() { $('#showaside2').fadeOut('slow', function(){$('#showaside3').fadeIn('slow')}) }}
						 ]};