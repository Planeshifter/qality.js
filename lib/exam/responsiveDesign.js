'use strict';

function ResponsiveDesign() {
	var self = this;

	// horizontal ranges
	this.hrs = [ 600, 800, 1024, 1280, 1400, 1900 ];

	this.horizontal_setting = function() {
		self.HR = 0;
		for ( var i = 0; i < self.hrs.length; i++ ) {
			if ( self.width > self.hrs[i] ) {
				self.HR = i;
			}
		}
		switch( self.HR ) {
		case 0:
		break;
		case 1:
		break;
		case 2:
		break;
		case 3:
		break;
		case 4:
		break;
		case 5:
		break;
		}
	};

	this.vertical_setting = function() {
		console.log("VERTICAL");
	};

	this.init = function() {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
		if ( self.width > self.height ) {
			self.horizontal_setting();
		} else {
			self.vertical_setting();
		}
	};

	self.init();
}


// EXPORTS //

module.exports = ResponsiveDesign;
