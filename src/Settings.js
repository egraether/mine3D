var Level = function( name, dimensions, mines ) {

	this.name = name;
	this.dimensions = vec3.assign( vec3.create(), dimensions );
	this.mines = mines;

};

var Settings = {

	levels : {

		easy : new Level( 'easy', 5, 10 ),
		medium : new Level( 'medium', 7, 33 ),
		hard : new Level( 'hard', 10, 99 ),
		custom : new Level( 'custom', 3, 3 )

	},

	currentLevel : null,
	mode : 'sweep', // [ 'classic', 'sweep' ]

	animations : true,
	recenter : true,


	init : function() {

		var p = parseFloat;

		// optinally defined in the URL as "d=1,2,3,4"

		if ( window.d ) {

			d = d.split(',');

			this.setCustom( p( d[0] ), p( d[1] ), p( d[2] ), p( d[3] ) );

		} else if ( !this.currentLevel ) {

			this.currentLevel = this.levels.easy;

		}

	},

	getKey : function() {

		return this.mode + this.currentLevel.name;

	},

	setFromMenu : function() {

		this.currentLevel = Menu.level;
		this.mode = Menu.mode;

		this.animations = Menu.animations;
		this.recenter = Menu.recenter;

	},

	setCustom : function( x, y, z, m ) {

		var custom = this.levels.custom;

		x = clamp( x, 1, 50 );
		y = clamp( y, 1, 50 );
		z = clamp( z, 1, 50 );

		m = clamp( m, 1, x * y * z );

		vec3.assign( custom.dimensions, x, y, z );
		custom.mines = m;

		this.currentLevel = custom;

		// Game.start( true );

	}

};
