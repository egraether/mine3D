var Camera = ( function() {

	var eye = vec3.create(),
		up = vec3.create(),

		center = vec3.create(),
		right = vec3.create(),

		pMatrix = mat4.create(),
		mvMatrix = mat4.create(),

		width = 0,
		height = 0,

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

		isRotating = false,
		isPanning = false,
		isZooming = false,
		isRecentered = false,

		vector = vec3.create(),
		vector2 = vec3.create(),
		vector3 = vec3.create(),

		matrix = mat4.create();

	this.updateRay = true;
	this.updateRotation = true;

	this.init = function() {

		width = canvas.width;
		height = canvas.height;

		vec3.assign( eye, 8, 8, 8 );
		vec3.assign( up, 0, 0, 1 );

		vec3.zero( center );

		vec3.normalize( vec3.cross( up, eye, right ) );
		vec3.normalize( vec3.cross( eye, right, up ) );

		mat4.perspective( 45, width / height, 0.1, 1000, pMatrix );

		radius = ( width + height ) / 4;

		mouse = InputHandler.mouse;

	};

	this.update = function() {

		var updateView = isRotating || isPanning || isZooming || isRecentered;

		if ( isZooming ) {

			this.zoomCamera();

		}

		if ( isPanning ) {

			this.panCamera();

		}

		if ( isRotating ) {

			this.rotateCamera();

			this.updateRotation = true;

		}

		isRotating = isPanning = isZooming = isRecentered = false;

		return updateView;

	};

	this.getPMatrix = function() {

		return pMatrix;

	};

	this.getMvMatrix = function() {

		mat4.lookAt( vec3.add( eye, center, vector ), center, up, mvMatrix );

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

	this.getPosition = function() {

		return vec3.add( center, eye, vector );

	};

	function getMouseOnScreen( mouse, vector ) {

		return vec3.assign(
			vector,
			( mouse[0] - width * 0.5 ) / radius,
			( height * 0.5 - mouse[1] ) / radius,
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

	this.rotate = function() {

		isRotating = true;

	}

	this.rotateCamera = function() {

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

		}

	};

	this.startPan = function( mouse ) {

		getMouseOnScreen( mouse, start );

	};

	this.pan = function() {

		isPanning = true;

	};

	this.panCamera = function() {

		var pan = vector2;

		getMouseOnScreen( mouse, end );
		vec3.subtract( start, end, vector );

		if ( vec3.lengthSquared( vector ) ) {

			vec3.scale( vector, vec3.length( eye ) * 0.3 );

			vec3.scale( right, vector[0], pan );
			vec3.add( pan, vec3.scale( up, vector[1], vector ) );

			vec3.add( center, pan );

			vec3.set( end, start );

		}

	};

	this.zoom = function( delta ) {

		isZooming = true;
		zoomDelta *= delta;

	};

	this.zoomCamera = function() {

		var len = vec3.length( eye );

		vec3.normalize( eye );
		vec3.scale( eye, len * zoomDelta );

		zoomDelta = 1;

	};

	function invertPoint( point, matrix ) {

		mat4.multiplyVec4( matrix, point );

		point[0] /= point[3];
		point[1] /= point[3];
		point[2] /= point[3];

	};

	this.calculateMouseRay = function() {

		this.updateRay = true;

	};

	this.getMouseRay = function() {

		mat4.multiply( pMatrix, mvMatrix, matrix );
		mat4.inverse( matrix );

		near[0] = far[0] = mouse[0] / width * 2 - 1;
		near[1] = far[1] = mouse[1] / height * -2 + 1;

		near[2] = 0; far[2] = 1;
		near[3] = far[3] = 1;

		invertPoint( near, matrix );
		invertPoint( far, matrix );

		ray.origin = near;
		ray.direction = vec3.direction( far, near, far );

		this.updateRay = false;

		return ray;

	};

	this.updateFaceDirections = function( gl, vertices, buffer ) {

		mat4.identity( matrix );
		mat4.rotate( matrix, Math.PI / 2, eye );

		vec3.add( up, right, vector );
		vec3.normalize( vector );
		vec3.scale( vector, Math.sqrt( Face.size ) );

		vertices[0] = vector[0];
		vertices[1] = vector[1];
		vertices[2] = vector[2];

		vertices[6] = -vector[0];
		vertices[7] = -vector[1];
		vertices[8] = -vector[2];

		mat4.multiplyVec3( matrix, vector );

		vertices[3] = vector[0];
		vertices[4] = vector[1];
		vertices[5] = vector[2];

		vertices[9] = -vector[0];
		vertices[10] = -vector[1];
		vertices[11] = -vector[2];

		gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );

		this.updateRotation = false;

	};

	this.recenterView = function() {

		var visionSize = BSPTree.getCenterAndVisionSize( center );

		visionSize /= vec3.length( eye );

		if ( visionSize < 1 ) {

			vec3.scale( eye, visionSize );

		}

		isRecentered = true;

	};

	return this;

}).call({});
