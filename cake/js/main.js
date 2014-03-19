var cuts = [];
var cutsTranslate = [];
var friendPositions = [];
var doc = document;
var $friends = $('.friend');
var $hand = $('.hand');
// pre load $() for each friend element for better perf in touchmove event
var friends = []; 
// store friend's cut
var friendCut = []; 

var ifShowDraging = true;

// store cuts;

for (var i = 1; i <= 8; i++) {
	cuts.push($('.cut-' + i));
};

// store friend;
for (var i = 0; i <= $friends.length; i++) {
	friends.push($($friends[i]));
	friendCut.push([]);
};

var centerX = 150;
var centerY = 150;

// helper for css transform

var trans = function(x, y, z) {
	return {
		'-webkit-transform': "translate3D("+ x +"px, "+ y +"px, "+ (z || 0) +")"
	};
};

var getTanDeg = function(deg) {
   var rad = deg * Math.PI/180;
   return Math.tan(rad);
}

var cacuEndPoint = function(point) {
	if (point.x >=150 && point.y >= 150) {

			// 0, 6, 7

			var angle = (point.y - 150) / (point.x - 150);

			if (angle < getTanDeg(25)) {
				return 6;
			} else if (angle < getTanDeg(75)) {
				return 7;
			} else {
				return 0;
			}

	} else if (point.x >= 150 && point.y < 150) {

			// 4, 5, 6

			var angle = (150 - point.y) / (point.x - 150);

			if (angle < getTanDeg(25)) {
				return 6;
			} else if (angle < getTanDeg(75)) {
				return 5;
			} else {
				return 4;
			}

	} else if (point.x < 150 && point.y >= 150) {

			// 0, 1, 2

			var angle = (point.y - 150) / (150 - point.x);

			if (angle < getTanDeg(25)) {
				return 2;
			} else if (angle < getTanDeg(75)) {
				return 1;
			} else {
				return 0;
			}

	} else {

			// 2, 3, 4

			var angle = (150 - point.y) / (150 - point.x);

			if (angle < getTanDeg(25)) {
				return 2;
			} else if (angle < getTanDeg(75)) {
				return 3;
			} else {
				return 4;
			}

	}
};

var vibrate = function(time) {
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate; 
	if (navigator.vibrate) {
	    // vibration API supported
	    navigator.vibrate(time);
	}
}


// do things after image loaded

$('.cut img').last().on('load', function(){	

	// show hand moving

	$('.hand').addClass('hand-cutting');

	setTimeout(function() {
		$('.hand').addClass('hidden').removeClass('hand-cutting');
	}, 3000);

	var touch, moveX, moveY;
	var onTarget = false;
	var friendTarget = -1;
	// for detecting state change
	var preFriendTarget = -1;


	// arrange cuts

	$.each(cuts, function(i, el){
		var tempX = el.width();
		var tempY = el.height();
		switch ((i+1)) {
		  case 1:
		  case 2:
				el.css(trans(centerX - tempX, centerY));
				cutsTranslate[i] = [centerX - tempX, centerY, 0];
		    break;
		  case 3:
		  case 4:
				el.css(trans(centerX - tempX, centerY - tempY));
				cutsTranslate[i] = [centerX - tempX, centerY - tempY, 0];
		    break;
		  case 5:
		  case 6:
				el.css(trans(centerX, centerY - tempY));
				cutsTranslate[i] = [centerX, centerY - tempY, 0];
		    break;
		  case 7:
		  case 8:
				el.css(trans(centerX, centerY));
				cutsTranslate[i] = [centerX, centerY, 0];
		    break;
		}
	});

	$friends.each(function(index){
		var offset = $(this).offset();

		friendPositions[index] = {
			x1: offset.left,
			y1: offset.top,
			x2: offset.left + offset.width,
			y2: offset.top + offset.height
		};
	});

	// drag and drop

	var ifSelected = false;
	var ifDrag = false;
	var ifOnTarget = false;
	var startPoint = { x: 0, y: 0 };
	var currentPoint = { x: 0, y: 0 };
	var cutDrags = [];

	doc.ontouchstart = function(e) {
		console.log('doc touch start');
		if(e.touches.length == 1){
			var touch = e.touches[0];
			startPoint.x = touch.pageX;
			startPoint.y = touch.pageY;
		}
		// make sure draging started from standby cuts
		if ($(e.target).hasClass('selected')) {
			ifOnTarget = true;
		} else {
			ifOnTarget = false;
		}
	};

	doc.ontouchend = function(e) {
		console.log('doc touch end');
		if(!ifDrag && !ifSelected){

			var endPoint = currentPoint;

			var indexStart = cacuEndPoint(startPoint);
			var indexEnd = cacuEndPoint(endPoint);

			// sweep if end smaller than start
			var temp = 0;
			if (indexEnd < indexStart) {
				temp = indexStart;
				indexStart = indexEnd;
				indexEnd = temp;
			} else if (indexEnd == indexStart && indexEnd != 7) {
				indexEnd += 1;
			} else if (indexEnd == indexStart && indexEnd == 7) {
				indexStart -= 1;
			}

			// make sure selection is a smaller portion

			if (indexEnd - indexStart > 4) {
				for (i = 0; i < indexStart; i++) {
					$('.cut-' + (i+1)).addClass('cut-drag-standby').children('img').addClass('selected');
					cutDrags.push({
						el: $('.cut-' + (i+1)),
						i: $('.cut-' + (i+1)).index()
					});
				}
				for (i = indexEnd; i <= 7; i++) {
					$('.cut-' + (i+1)).addClass('cut-drag-standby').children('img').addClass('selected');
					cutDrags.push({
						el: $('.cut-' + (i+1)),
						i: $('.cut-' + (i+1)).index()
					});
				}	
			} else {
				for (var i = indexStart; i < indexEnd; i++) {
					$('.cut-' + (i+1)).addClass('cut-drag-standby').children('img').addClass('selected');
					cutDrags.push({
						el: $('.cut-' + (i+1)),
						i: $('.cut-' + (i+1)).index()
					});
				};
			}

			$('.cut').addClass('half-opacity');

			ifDrag = true;
			ifSelected = true;

			// show hand draging

			if (ifShowDraging) {
				ifShowDraging = false;

				$hand.removeClass('hidden');

				setTimeout(function() {
					$hand.addClass('hand-draging');
				}, 10);

				setTimeout(function() {
					$hand.addClass('hidden').removeClass('hand-draging');
				}, 3000);
			}
			
		} 
		else if (ifDrag && ifSelected){

			if (onTarget) {

				// restore cut position when not drag on target
				$.each(cutDrags, function(index, model){
					model.el.addClass('hidden');
					friendCut[friendTarget].push(model);
				});

				friends[friendTarget]
					.removeClass('selected')
					.addClass('filled')
					.children('.cut-count')
					.removeClass('hidden')
					.html(friendCut[friendTarget].length);

				// restore state
				$('.cut')
					.removeClass('half-opacity')
					.removeClass('cut-drag-standby');
				ifDrag = false;
				ifSelected = false;
				cutDrags = [];

				// show / hide btns

				$('.share').removeClass('hidden');
				$('.skip').addClass('hidden');

			} else {

				// restore cut position when not drag on target
				$.each(cutDrags, function(index, model){
					model.el
						.addClass('cut-drag-end')
						.css(trans(
							cutsTranslate[model.i][0], 
							cutsTranslate[model.i][1]
						));
					setTimeout(function(){
						model.el.removeClass('cut-drag-end');
					}, 500);
				});

			}
	  }
	};

	// cancel friend share
	$friends.on('click', function(e) {
		var index = $(this).removeClass('filled').index();
		// remove the count number
		$(this)
			.children('.cut-count')
			.addClass('hidden')
			.html('0');

		$.each(friendCut[index], function(index, model){
				model.el.removeClass('hidden');
				setTimeout(function(){
					model.el.addClass('cut-drag-end')
						.css(trans(
							cutsTranslate[model.i][0], 
							cutsTranslate[model.i][1]
						));
				}, 10);
				setTimeout(function(){
					model.el.removeClass('cut-drag-end');
				}, 510);
		});
		friendCut[index] = [];

		// show / hide skip button
		var showSkip = true;

		for (var i = friendCut.length - 1; i >= 0; i--) {
			if (friendCut[i].length > 0) {
				showSkip = false;
				break;
			}
		};

		console.log(friendCut);

		if (showSkip) {
			$('.share').addClass('hidden');
			$('.skip').removeClass('hidden');
		}

	});

	// cancel standby status
	doc.onclick = function(e) {
		$('.cut')
			.removeClass('half-opacity')
			.removeClass('cut-drag-standby');
		ifDrag = false;
		ifSelected = false;
		cutDrags = [];
	}

	doc.ontouchmove = function(e) {
    e.preventDefault();
	  touch = e.touches[0]; // Get the information for finger #1
	  onTarget = false;

    // cutting cake 

		if(e.touches.length == 1 && !ifDrag && !ifSelected){

	    currentPoint.x = touch.pageX;
	    currentPoint.y = touch.pageY;

	  } 

	  // drag cuts

		else if (e.touches.length == 1 && ifDrag && ifSelected && ifOnTarget){ // Only deal with one finger

			moveX = touch.pageX - startPoint.x;
			moveY = touch.pageY - startPoint.y;

			$.each(cutDrags, function(index, model){
				model.el.css(trans(
					cutsTranslate[model.i][0] + moveX, 
					cutsTranslate[model.i][1] + moveY
				));
			});

		  // check if on target

		  for (var i = friendPositions.length - 1; i >= 0; i--) {
		  	if (touch.pageX >= friendPositions[i].x1
		  		&& touch.pageX <= friendPositions[i].x2
		  		&& touch.pageY >= friendPositions[i].y1
		  		&& touch.pageY <= friendPositions[i].y2) {
		  		onTarget = true;
		  		friendTarget = i;
		  		break;
		  	}
		  };

		  // change current target

		  if (!onTarget) {
		  	friendTarget = -1;
		  }

		  // if state change

	  	if (friendTarget != preFriendTarget) {

	  		// clear selected
	  		for (var i = friends.length - 1; i >= 0; i--) {
	  			friends[i].removeClass('selected');
	  		};

				// if drag on target

			  if (onTarget) {
			  		// add new selected
				  	friends[friendTarget].addClass('selected');
						vibrate(44);
			  		preFriendTarget = friendTarget;
			  } else {
			  	preFriendTarget = -1;
			  }

		  }

	  }
	};

});