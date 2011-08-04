var Camera = ( function() {

	var eye = vec3.create(),
		up = vec3.create(),

		center = vec3.create(),
		right = vec3.create(),

		pMatrix = mat4.create(),
		mvMatrix = mat4.create(),

		radius = 0,
		zoomDelta = 1,

		start = vec3.create(),
		end = vec3.create(),

		ray = {
			origin : null,
			direction : null
		}

		near = new glMatrixArrayType(4),
		far = new glMatrixArrayType(4),

		vector = vec3.create(),
		vector2 = vec3.create(),
		vector3 = vec3.create(),

		matrix = mat4.create();

	this.updatedMatrix = true;
	this.updatedRay = false;

	this.init = function() {

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

		mat4.lookAt( vec3.add( eye, center, vector ), center, up, mvMatrix );

		this.updatedMatrix = false;

		return mvMatrix;

	};

	this.getEye = function() {

		return eye;

	};

	this.getUp = function() {

		return up;

	};

	this.getRight = function() {

		return right;

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
		
		var angle = vec3.angle( start, end ),
			axis;

		if ( angle ) {

			axis = vec3.cross( end, start, vector );

			mat4.identity( matrix );
			mat4.rotate( matrix, angle, axis );

			mat4.multiplyVec3( matrix, eye );
			mat4.multiplyVec3( matrix, up );
			mat4.multiplyVec3( matrix, right );

			mat4.multiplyVec3( matrix, end );
			vec3.set( end, start );

			this.updatedMatrix = true;

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

			this.updatedMatrix = true;

		}

	};

	this.zoom = function( delta ) {

		var len = vec3.length( eye );

		vec3.normalize( eye );
		vec3.scale( eye, len * delta );

		this.updatedMatrix = true;

	};

	function invertPoint( point, matrix ) {

		mat4.multiplyVec4( matrix, point );

		point[0] /= point[3];
		point[1] /= point[3];
		point[2] /= point[3];

	};

	this.calculateMouseRay = function( mouse ) {

		mat4.multiply( pMatrix, mvMatrix, matrix );
		mat4.inverse( matrix );

		near[0] = far[0] = mouse[0] / canvas.width * 2 - 1;
		near[1] = far[1] = mouse[1] / canvas.height * -2 + 1;

		near[2] = 0; far[2] = 1;
		near[3] = far[3] = 1;

		invertPoint( near, matrix );
		invertPoint( far, matrix );

		ray.origin = near;
		ray.direction = vec3.direction( far, near, far );

		this.updatedRay = true;

	};

	this.getMouseRay = function() {

		this.updatedRay = false;

		return ray;

	}

	this.updateFaceDirections = function( gl, vertexArray, vertexBuffer ) {

		mat4.identity( matrix );
		mat4.rotate( matrix, Math.PI / 2, eye );

		vec3.add( up, right, vector );
		vec3.normalize( vector );
		vec3.scale( vector, Math.sqrt( 0.5 ) );

		vertexArray[0] = vector[0];
		vertexArray[1] = vector[1];
		vertexArray[2] = vector[2];

		vertexArray[6] = -vector[0];
		vertexArray[7] = -vector[1];
		vertexArray[8] = -vector[2];

		mat4.multiplyVec3( matrix, vector );

		vertexArray[3] = vector[0];
		vertexArray[4] = vector[1];
		vertexArray[5] = vector[2];

		vertexArray[9] = -vector[0];
		vertexArray[10] = -vector[1];
		vertexArray[11] = -vector[2];

		gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW );

	}

	return this;

}).call({});
