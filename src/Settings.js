var Level = function( dimensions, mines ) {

	this.dimensions = vec3.assign( vec3.create(), dimensions );
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

	animated : false,
	recenter : false,

	mode : 'classic', // [ 'classic', 'sweep' ]

	init : function() {

		this.currentLevel = this.levels.easy;

		this.animated = true;
		this.recenter = true;

		this.mode = 'sweep';

	}

};
