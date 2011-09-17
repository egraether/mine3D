var Level = function( dimensions, mines ) {

	this.dimensions = vec3.assign( vec3.create(), dimensions, dimensions, dimensions );
	this.mines = mines;

};

var Settings = {

	levels : {

		easy : new Level( 5, 10 ),
		medium : new Level( 7, 40 ),
		hard : new Level( 10, 99 ),
		custom : new Level( 10, 99 )

	},

	currentLevel : null,

	animations : false,
	transitions : false,

	mode : 'classic', // [ 'classic', 'sweep' ]

	init : function() {

		this.currentLevel = this.levels.easy;

		this.animations = true;
		this.transitions = true;

		this.mode = 'sweep';

	}

};
