var Camera = {

	eye : vec3.create(),
	up : vec3.create(),

	center : vec3.create(),
	right : vec3.create(),

	pMatrix : mat4.create(),
	mvMatrix : mat4.create(),

	init : function( gl ) {

		vec3.assign( this.eye, 8, 8, 8 );
		vec3.assign( this.up, 0, 0, 1 );

		vec3.zero( this.center );

		mat4.perspective( 45, canvas.width / canvas.height, 0.1, 1000, this.pMatrix );
		mat4.lookAt( this.eye, this.center, this.up, this.mvMatrix );

	},

	getMvMatrix : function() {

		if ( this.update ) {

			mat4.lookAt( this.eye, this.center, this.up, this.mvMatrix );

		}

		return this.mvMatrix;

	},

	startRotate : function( mouse ) {

		

	},

	rotate : function( mouse ) {

		

	},

	startPan : function( mouse ) {

		

	},

	pan : function( mouse ) {

		

	},

	zoom : function( delta ) {

		

	},

	find : function( mouse ) {

		

	}

};
