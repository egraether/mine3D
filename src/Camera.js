var Camera = new ( function() {

	var eye = vec3.create(),
		up = vec3.create(),

		center = vec3.create(),
		right = vec3.create(),

		panVector = vec3.create(),

		pMatrix = mat4.create(),
		mvMatrix = mat4.create(),

		radius = 0,
		zoomDelta = 1,

		start = vec3.create(),
		end = vec3.create(),

		ray = {
			origin : null,
			direction : null
		},

		near = new glMatrixArrayType(4),
		far = new glMatrixArrayType(4),

		isRotating = false,
		isPanning = false,
		isZooming = false,

		isRecentering = false,

		vector = vec3.create(),
		vector2 = vec3.create(),

		matrix = mat4.create(),
		mouse = null;

	this.recenter = false;
	this.updateRay = true;
	this.updateRotation = true;

	this.init = function() {

		vec3.assign( eye, 100 );
		vec3.assign( up, 0, 0, 1 );

		vec3.zero( center );
		vec3.zero( panVector );

		vec3.normalize( vec3.cross( up, eye, right ) );
		vec3.normalize( vec3.cross( eye, right, up ) );

		mouse = EventHandler.mouse;

		this.resize();

	};

	this.resize = function() {

		mat4.perspective( 45, width / height, 0.1, 1000, pMatrix );

		radius = ( width + height ) / 4;

	};

	this.update = function() {

		var updateView = isRotating || isPanning || isZooming;

		if ( isRecentering ) {

			if ( isRotating ) {

				getMouseOnBall( mouse, start );

			} else if ( isZooming ) {

				zoomDelta = 1;

			} else if ( isPanning ) {

				getMouseOnScreen( mouse, start );

			}

			isRecentering = false;
			return true;

		} else if ( !updateView && this.recenter && 
			Settings.recenter && EventHandler.state === 'up' ) {

			return this.recenterView( Settings.animations );

		}

		if ( isRotating ) {

			this.rotateCamera();

			this.updateRotation = true;

		}

		if ( isZooming ) {

			this.zoomCamera();

		}

		if ( isPanning ) {

			this.panCamera();

		}

		isRotating = isPanning = isZooming = false;

		return updateView;

	};

	this.reset = function() {

		vec3.scale( eye, 1000 );

		vec3.normalize( vec3.cross( up, eye, right ) );
		vec3.normalize( vec3.cross( eye, right, up ) );

		vec3.zero( panVector );

		this.updateFaceDirections( gl, Face.vertices, Face.attributeBuffer );

		this.recenterView( false );

	};

	this.getPMatrix = function() {

		return pMatrix;

	};

	this.getMvMatrix = function() {

		mat4.lookAt( this.getPosition(), vec3.add( center, panVector, vector2 ), up, mvMatrix );

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

		return vec3.add( vec3.add( center, panVector, vector ), eye );

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

		if ( invertedControls ) {

			angle *= -1;

		}

		angle *= controlSpeed;

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

		var pan = vector2,
			panFactor = 0.3 * controlSpeed;

		if ( invertedControls ) {

			panFactor *= -1;

		}

		getMouseOnScreen( mouse, end );
		vec3.subtract( start, end, vector );

		if ( vec3.lengthSquared( vector ) ) {

			vec3.scale( vector, vec3.length( eye ) * panFactor );

			vec3.scale( right, vector[0], pan );
			vec3.add( pan, vec3.scale( up, vector[1], vector ) );

			vec3.add( panVector, pan );

			vec3.set( end, start );

		}

	};

	this.zoom = function( delta ) {

		isZooming = true;

		if ( invertedControls ) {

			delta = 1 / delta;

		}

		delta = Math.pow( delta, controlSpeed );

		zoomDelta *= delta;

	};

	this.zoomCamera = function() {

		var len = vec3.length( eye );

		vec3.scale( vec3.normalize( eye ), len * zoomDelta );

		len = vec3.lengthSquared( eye );

		if ( len > 10000 ) {

			vec3.scale( vec3.normalize( eye ), 100 );

		} else if ( len < 0.09 ) {

			vec3.scale( vec3.normalize( eye ), 0.3 );

		}

		zoomDelta = 1;

	};

	function invertPoint( point, matrix ) {

		mat4.multiplyVec4( matrix, point );

		point[0] /= point[3];
		point[1] /= point[3];
		point[2] /= point[3];

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

		vec3.add( up, right, vector );
		vec3.normalize( vector );
		vec3.scale( vector, Math.sqrt( numberSize ) );

		vertices[0] = vector[0];
		vertices[1] = vector[1];
		vertices[2] = vector[2];

		vertices[6] = -vector[0];
		vertices[7] = -vector[1];
		vertices[8] = -vector[2];

		mat4.identity( matrix );
		mat4.rotate( matrix, Math.PI / 2, eye );

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

	this.recenterView = function( animated ) {

		var visionSize = BSPTree.getCenterAndVisionSize( vector ),
			minEyeLength = 8,
			tweenCenter, tweenEye;

		visionSize += 1 * visionSize + 2;
		visionSize /= vec3.length( eye );

		this.recenter = false;

		if ( visionSize > 0 && visionSize < 0.99 ) {

			vec3.set( eye, vector2 )
			vec3.scale( vector2, visionSize );

			if ( vec3.lengthSquared( vector2 ) < minEyeLength * minEyeLength ) {

				vec3.scale( vec3.normalize( vector2 ), minEyeLength );

			}

			if ( animated ) {

				tweenCenter = new TWEEN.Tween( center );
				tweenEye = new TWEEN.Tween( eye );

				tweenCenter.to( { 
					0 : vector[0],
					1 : vector[1],
					2 : vector[2]
				}, 400 );

				tweenEye.to( { 
					0 : vector2[0],
					1 : vector2[1],
					2 : vector2[2]
				}, 400 );

				tweenCenter.onUpdate( function() {

					isRecentering = true;

				});

				tweenCenter.onComplete( function() {

					Camera.updateRay = true;

				});

				tweenCenter.easing( TWEEN.Easing.Quadratic.EaseInOut );
				tweenEye.easing( TWEEN.Easing.Quadratic.EaseInOut );

				tweenCenter.start();
				tweenEye.start();

			} else {

				vec3.set( vector, center );
				vec3.set( vector2, eye );

			}

			isRecentering = true;

			return true;

		}

		return false;

	};

	return this;

});
