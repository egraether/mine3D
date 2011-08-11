var BSPTree = {

	root : null,

	createPartition : function( elements ) {

		if ( elements.length > 1 ) {

			this.root = new BSPNode().init( elements, 0 );

		} else if ( elements.length == 1 ) {

			this.root = elements[0];

		}

	},

	draw : function( gl, position ) {

		if ( this.root ) {

			this.root.draw( gl, position );

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

	print : function() {

		console.log( "root " + vec3.str( this.root.position ) );

		this.root.print( "" );

	}

};
