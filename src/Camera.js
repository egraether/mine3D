var Camera = ( function() {

	var eye = vec3.create(),
		up = vec3.create(),

		center = vec3.create(),
		right = vec3.create(),

		pMatrix = mat4.create(),
		mvMatrix = mat4.create(),

		rotMatrix = mat4.create(),

		radius = 0,

		start = vec3.create(),
		end = vec3.create(),

		vector = vec3.create(),
		vector2 = vec3.create(),
		vector3 = vec3.create();

	this.update = true;

	this.init = function( gl ) {

		vec3.assign( eye, 8, 8, 8 );
		vec3.assign( up, 0, 0, 1 );
		
		vec3.zero( center );
		
		vec3.normalize( vec3.cross( up, eye, right ) );
		vec3.normalize( vec3.cross( eye, right, up ) );

		mat4.perspective( 45, canvas.width / canvas.height, 0.1, 1000, pMatrix );
		
		radius = ( canvas.width + canvas.height ) / 4;

	};

	this.getPMatrix = function() {

		return pMatrix;

	};

	this.getMvMatrix = function() {

		if ( this.update ) {

			mat4.lookAt( vec3.add( eye, center, vector ), center, up, mvMatrix );

			this.update = false;

		}

		return mvMatrix;

	};

	function getMouseOnScreen( mouse, vector ) {

		return vec3.assign(
			vector,
			( mouse[0] - canvas.width * 0.5 ) / radius,
			( canvas.height * 0.5 - mouse[1] ) / radius,
			0.0
		);

	};

	function getMouseOnBall( mouse, projection ) {

		var mouseOnBall = getMouseOnScreen( mouse, vector ),
			len = vec3.length( mouseOnBall );

		if ( len > 1.0 ) {

			vec3.normalize( mouseOnBall );

		} else {

			mouseOnBall[2] = Math.sqrt( 1.0 - len * len );

		}

		vec3.scale( vec3.normalize( eye, projection ), mouseOnBall[2] );

		vec3.add( projection, vec3.scale( right, mouseOnBall[0], vector2 ) );
		vec3.add( projection, vec3.scale( up, mouseOnBall[1], vector2 ) );

		return projection;

	};

	this.startRotate = function( mouse ) {

		getMouseOnBall( mouse, start );

	};

	this.rotate = function( mouse ) {

		getMouseOnBall( mouse, end );
		
		var angle = Math.acos( vec3.dot( start, end ) / vec3.length( start ) / vec3.length( end ) ),
			axis;

		if ( angle ) {

			axis = vec3.cross( end, start, vector );

			mat4.identity( rotMatrix );
			mat4.rotate( rotMatrix, angle, axis );

			mat4.multiplyVec3( rotMatrix, eye );
			mat4.multiplyVec3( rotMatrix, up );
			mat4.multiplyVec3( rotMatrix, right );

			mat4.multiplyVec3( rotMatrix, end );
			vec3.set( end, start );

			this.update = true;

		}

	};

	this.startPan = function( mouse ) {

		getMouseOnScreen( mouse, start );

	};

	this.pan = function( mouse ) {

		var pan = vector2;

		getMouseOnScreen( mouse, end );
		vec3.subtract( start, end, vector );

		if ( vec3.lengthSquared( vector ) ) {

			vec3.scale( vector, vec3.length( eye ) * 0.3 );

			vec3.scale( right, vector[0], pan );
			vec3.add( pan, vec3.scale( up, vector[1], vector ) );

			vec3.add( center, pan );

			vec3.set( end, start );

			this.update = true;

		}

	};

	this.zoom = function( delta ) {

		var len = vec3.length( eye );

		vec3.normalize( eye );
		vec3.scale( eye, len * delta );

		this.update = true;

	};

	this.find = function( mouse ) {

		

	};

	return this;

}).call({});
