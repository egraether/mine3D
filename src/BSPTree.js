var BSPTree = {

	root : null,

	highVector : vec3.create(),
	lowVector : vec3.create(),

	createPartition : function( elements ) {

		if ( elements.length > 1 ) {

			this.root = new BSPNode( null ).init( elements, 0 );

		} else if ( elements.length === 1 ) {

			this.root = elements[0];

		}

	},

	draw : function( gl, camera ) {

		if ( this.root ) {

			this.root.draw( gl, camera );

		}

	},

	remove : function( element ) {

		if ( this.root ) {

			this.root = this.root.remove( element );

		}

	},

	count : function() {

		if ( this.root ) {

			return this.root.count();

		} else {

			return 0;

		}

	},

	getCenterAndVisionSize : function( center ) {

		if ( this.root ) {

			vec3.assign( this.highVector, -Infinity );
			vec3.assign( this.lowVector, Infinity );

			this.root.getCenter( this.highVector, this.lowVector );

			vec3.add( this.highVector, this.lowVector, center );
			vec3.scale( center, 0.5 );

			return Math.sqrt( this.root.getVisionSize( center, this.highVector ) );

		}

		return 0;

	},

	solve : function() {

		if ( this.root ) {

			this.root.solve();

		}

	},

	print : function() {

		this.root.print( "" );

	}

};
