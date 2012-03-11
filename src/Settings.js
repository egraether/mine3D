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

		// optinally defined in the URL as "grid=1,2,3,4"

		if ( window.grid ) {

			grid = grid.split(',');

			this.setCustom( p( grid[0] ), p( grid[1] ), p( grid[2] ), p( grid[3] ) );

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

		var custom = this.levels.custom,
			i = 0;

		x = clamp( x, 1, maxCubes );
		y = clamp( y, 1, maxCubes );
		z = clamp( z, 1, maxCubes );

		while ( x * y * z > maxCubes ) {

			switch ( i % 3 ) {
				case 0 : x = Math.floor( x * 0.9 ); break;
				case 1 : y = Math.floor( y * 0.9 ); break;
				case 2 : z = Math.floor( z * 0.9 ); break;
			}

			i++;

		}

		m = clamp( m, 0, x * y * z * 0.9 );

		vec3.assign( custom.dimensions, x, y, z );
		custom.mines = m;

		this.currentLevel = custom;

		Menu.setLevel( 'custom' );
		Menu.updateCustom( this.currentLevel );

	}

};
