var Camera = {

	eye : vec3.create(),
	up : vec3.create(),

	center : vec3.create(),
	right : vec3.create(),

	pMatrix : mat4.create(),
	mvMatrix : mat4.create(),

	rotMatrix : mat4.create(),

	radius : 0,
	update : true,

	start : vec3.create(),
	end : vec3.create(),

	vector : vec3.create(),
	vector2 : vec3.create(),
	vector3 : vec3.create(),

	init : function( gl ) {

		var up = this.up,
			eye = this.eye,
			center = this.center,
			right = this.right;

		vec3.assign( eye, 8, 8, 8 );
		vec3.assign( up, 0, 0, 1 );

		vec3.zero( center );

		vec3.normalize( vec3.cross( up, eye, right ) );
		vec3.normalize( vec3.cross( eye, right, up ) );

		mat4.perspective( 45, canvas.width / canvas.height, 0.1, 1000, this.pMatrix );
		mat4.lookAt( vec3.add( eye, center, this.vector ), center, up, this.mvMatrix );

		this.radius = ( canvas.width + canvas.height ) / 4;

	},

	getMvMatrix : function() {

		if ( this.update ) {

			mat4.lookAt( this.eye, this.center, this.up, this.mvMatrix );

			this.update = false;

		}

		return this.mvMatrix;

	},

	getMouseOnBall : function( mouse, projection ) {

		var mouseOnBall = vec3.assign(
				this.vector,
				( mouse[0] - canvas.width * 0.5 ) / this.radius,
				( canvas.height * 0.5 - mouse[1] ) / this.radius,
				0.0
			),
			len = vec3.length( mouseOnBall );

		if ( len > 1.0 ) {

			vec3.normalize( mouseOnBall );

		} else {

			mouseOnBall[2] = Math.sqrt( 1.0 - len * len );

		}

		vec3.scale( vec3.normalize( this.eye, projection ), mouseOnBall[2] );

		vec3.add( projection, vec3.scale( this.right, mouseOnBall[0], this.vector2 ) );
		vec3.add( projection, vec3.scale( this.up, mouseOnBall[1], this.vector2 ) );

		return projection;

	},

	startRotate : function( mouse ) {

		this.getMouseOnBall( mouse, this.start );

	},

	rotate : function( mouse ) {

		var start = this.start,
			end = this.getMouseOnBall( mouse, this.end ),
			angle = Math.acos( vec3.dot( start, end ) / vec3.length( start ) / vec3.length( end ) ),
			rotMatrix = this.rotMatrix,
			axis;

		if ( angle ) {

			axis = vec3.cross( end, start, this.vector );

			mat4.identity( rotMatrix );
			mat4.rotate( rotMatrix, angle, axis );

			mat4.multiplyVec3( rotMatrix, this.eye );
			mat4.multiplyVec3( rotMatrix, this.up );
			mat4.multiplyVec3( rotMatrix, this.right );

			mat4.multiplyVec3( rotMatrix, end );
			vec3.set( end, start );

			this.update = true;

		}

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
