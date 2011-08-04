var Cube = function( box ) {

	this.box = box;
	this.vertices = [];
	// this.colors = [];

	var i;

	for ( i = 0; i < 24; i++ ) {

		this.vertices.push( vec3.add(
			box.position, 
			Cube.vertexVectors[i],
			vec3.create()
		) );

		// this.colors.push( Cube.colors[Math.floor( i / 6 ) % 3] );

	}

	this.highlight = false;

};

Cube.prototype = {

	vector : vec3.create(),
	vector2 : vec3.create(),
	vector3 : vec3.create(),

	distanceToRay : function( origin, direction ) {

		var vector = this.vector,
			vector2 = this.vector2;

		vec3.subtract( this.box.position, origin, vector );
		vec3.scale( direction, vec3.dot( direction, vector ), vector2 );

		vec3.subtract( vector, vector2 );

		return vec3.lengthSquared( vector );

	},

	intersectsRay : function( origin, direction ) {

		var i, j, t,
			normals = Cube.normalVectors,
			normal,
			vertices = this.vertices,
			p = this.vector,
			a = this.vector2,
			b = this.vector3,
			dotaa, dotab, dotap, dotbb, dotbp,
			invDenom, u, v;

		for ( i = 0; i < 6; i++ ) {

			j = i * 4;

			normal = normals[i];

			t = vec3.dot( normal, vertices[j] ) - vec3.dot( normal, origin );
			t /= vec3.dot( normal, direction );

			if ( t ) {

				vec3.add( vec3.scale( direction, t, p ), origin );

				vec3.subtract( p, vertices[j] );
				vec3.subtract( vertices[j + 1], vertices[j], a );
				vec3.subtract( vertices[j + 3], vertices[j], b );

				dotaa = vec3.dot( a, a );
				dotab = vec3.dot( a, b );
				dotap = vec3.dot( a, p );
				dotbb = vec3.dot( b, b );
				dotbp = vec3.dot( b, p );

				invDenom = 1 / ( dotaa * dotbb - dotab * dotab );

				u = ( dotbb * dotap - dotab * dotbp ) * invDenom,
				v = ( dotaa * dotbp - dotab * dotap ) * invDenom;

				if ( u > 0 && v > 0 && u < 1 && v < 1 ) {

					return true;

				}

			}

		}

		return false;

	},

	draw : function( gl ) {

		var shader = Cube.shader;

		gl.useProgram( shader );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		if ( this.highlight ) {

			gl.enableAlpha();

		}

		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.vertexBuffer );
		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.colorBuffer );
		gl.vertexAttribPointer( shader.colorAttribute, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer );
		gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

		if ( this.highlight ) {

			gl.disableAlpha();

		}

	}

	// updateToArray : function( values, array, offset ) {
	// 
	// 	var i, j,
	// 		value;
	// 
	// 	for ( i = 0; i < 24; i++ ) {
	// 
	// 		j = i * 3 + offset;
	// 		value = values[i];
	// 
	// 		array[j] = value[0];
	// 		array[j + 1] = value[1];
	// 		array[j + 2] = value[2];
	// 
	// 	}
	// 
	// },
	// 
	// updateToBuffer : function( gl, values, buffer ) {
	// 
	// 	var array = new Float32Array(  );
	// 
	// 	this.updateToArray( values, array, 0 );
	// 
	// 	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	// 	gl.bufferData( gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW );
	// 
	// }

};

extend( Cube, {

	init : function( gl ) {

		this.initShader( gl );
		this.initGeometry();
		this.initBuffers( gl );

		gl.uniformMatrix4fv( this.shader.pMatrixUniform, false, Camera.getPMatrix() );

	},

	// setupArrays : function( gl, elements ) {
	// 
	// 	var i, cube, offset, len = elements.length;
	// 
	// 	this.vertexArray = new Float32Array( len * 72 );
	// 	this.colorArray = new Float32Array( len * 72 );
	// 
	// 	this.indexArray = new Uint16Array( len * 36 );
	// 	this.count = len;
	// 
	// 	for ( i = 0; i < len; i++ ) {
	// 
	// 		cube = elements[i].cube;
	// 		offset = cube.index * 3;
	// 
	// 		cube.updateToArray( cube.vertices, this.vertexArray, offset );
	// 		cube.updateToArray( cube.colors, this.colorArray, offset );
	// 
	// 	}
	// 
	// 	gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
	// 	gl.bufferData( gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW );
	// 
	// 	gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
	// 	gl.bufferData( gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW );
	// 
	// 	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
	// 	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STREAM_DRAW);
	// 
	// },

	initShader : function( gl ) {

		var shader = gl.loadShader( "cube-vertex-shader", "cube-fragment-shader" );
		gl.useProgram(shader);

		shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.colorAttribute = gl.getAttribLocation( shader, "aColor" );
		gl.enableVertexAttribArray( shader.colorAttribute );

		this.shader = shader;

	},

	initGeometry : function() {

		this.vertexArray = new Float32Array([

			// front
			1, 1, 1,
			1, -1, 1,
			1, -1, -1,
			1, 1, -1,

			// right
			1, 1, 1,
			1, 1, -1,
			-1, 1, -1,
			-1, 1, 1,

			// top
			1, 1, 1,
			-1, 1, 1,
			-1, -1, 1,
			1, -1, 1,

			// back
			-1, 1, 1,
			-1, 1, -1,
			-1, -1, -1,
			-1, -1, 1,

			// left
			1, -1, 1,
			-1, -1, 1,
			-1, -1, -1,
			1, -1, -1,

			// bottom
			1, 1, -1,
			1, -1, -1,
			-1, -1, -1,
			-1, 1, -1

		]);

		var i,
			v = this.vertexArray;

		for ( i = 0; i < 72; i++ ) {

			v[i] /= 2;

		}


		this.vertexVectors = [];

		var vV = this.vertexVectors,
			j;

		for ( i = 0; i < 24; i++ ) {

			j = i * 3;

			vV.push( vec3.assign(
				vec3.create(), 
				v[j],
				v[j + 1],
				v[j + 2]
			) );

		}


		this.normals = new Float32Array([

			// front
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,

			// right
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,

			// top
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			// back
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,

			// left
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,

			// bottom
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1

		]);

		this.normalVectors = [];

		var nV = this.normalVectors,
			n = this.normals;

		for ( i = 0; i < 24; i++ ) {

			j = i * 12;

			nV.push( vec3.assign(
				vec3.create(), 
				n[j],
				n[j + 1],
				n[j + 2]
			) );

		}


		this.indexArray = new Uint16Array([

			// front
			0, 1, 2, 0, 2, 3,

			// back
			4, 5, 6, 4, 6, 7,

			// right
			8, 9, 10, 8, 10, 11,

			// left
			12, 13, 14, 12, 14, 15,

			// top
			16, 17, 18, 16, 18, 19,

			// bottom
			20, 21, 22, 20, 22, 23

		]);

		this.colors = [

			vec3.assign( vec3.create(), 0.7, 0.7, 0.7 ),
			vec3.assign( vec3.create(), 0.6, 0.6, 0.6 ),
			vec3.assign( vec3.create(), 0.8, 0.8, 0.8 )

		];

		this.colorArray = new Float32Array( 72 );

		var c = this.colors,
			cA = this.colorArray,
			col;

		for ( i = 0; i < 24; i++ ) {

			col = c[Math.floor( i / 4 ) % 3];

			cA[i * 3] = col[0];
			cA[i * 3 + 1] = col[1];
			cA[i * 3 + 2] = col[2];

		}

	},

	initBuffers : function( gl ) {

		this.vertexBuffer = gl.createBuffer();
		this.colorBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);

	}

} );