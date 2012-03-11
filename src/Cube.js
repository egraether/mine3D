var Cube = function( element ) {

	this.element = element;
	this.vertices = [];

	var i;

	for ( i = 0; i < 24; i++ ) {

		this.vertices.push( vec3.add(
			element.position, 
			Cube.vertexVectors[i],
			vec3.create()
		) );

	}

};

Cube.prototype = {

	vector : vec3.create(),
	vector2 : vec3.create(),
	vector3 : vec3.create(),

	distanceToRay : function( origin, direction ) {

		var vector = this.vector,
			vector2 = this.vector2;

		vec3.subtract( this.element.position, origin, vector );
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

	}

};

extend( Cube, {

	vector : vec3.create(),

	draw : function( gl, shader, stateIndex ) {

		var texOffset = ( 72 * 8 + 48 * ( stateIndex || 0 ) ) * 4;

		if ( gl.lastDraw !== 'c' ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );

			gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );

			gl.lastTexOffset = -1;

		}

		if ( gl.lastTexOffset !== texOffset ) {

			gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, texOffset );

			gl.lastTexOffset = texOffset;

		}


		if ( drawLines ) {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
			gl.drawElements( gl.LINES, 24, gl.UNSIGNED_SHORT, 0 );

			gl.lastDraw = null;

		} else {

			gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

			gl.lastDraw = 'c';

		}

	},

	drawMultiple : function( gl, position, count, start ) {

		var matrix = gl.matrix,
			shader = Element.shader;

		mat4.identity( matrix );
		mat4.translate( matrix, position );

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );

		if ( gl.lastDraw !== 'c' ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );

			gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );

			gl.lastTexOffset = -1;

		}

		if ( gl.lastTexOffset !== 3072 ) {

			gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 3072 );
			gl.lastTexOffset = 3072;

		}

		gl.drawElements( gl.TRIANGLES, 36 * count, gl.UNSIGNED_SHORT, 72 * start );

		gl.lastDraw = 'c';

	},

	drawDouble : function( gl, position, camera, direction ) {

		var vector = this.vector,
			start;

		if ( drawBigCubes ) {

			vec3.assign( vector, 1 );
			vector[direction] = 2 + cubeSpacing;

			this.drawMulti( gl, position );

		} else {

			vec3.set( position, vector );
			vector[direction] -= 0.5 + cubeSpacing * 0.5;

			start = 2 * direction + ( camera[direction] > vector[direction] ? 0 : 1 );

			this.drawMultiple( gl, vector, 2, start );

		}

	},

	drawQuad : function( gl, position, camera, direction ) {

		var vector = this.vector,
			dir = ( direction + 1 ) % 3,
			dir2 = ( direction + 2 ) % 3,
			start;

		if ( drawBigCubes ) {

			vec3.assign( vector, 2 + cubeSpacing );
			vector[direction] = 1;

			this.drawMulti( gl, position );

		} else {

			vec3.assign( vector, - 0.5 - cubeSpacing * 0.5 );
			vector[direction] = 0;

			vec3.add( vector, position );

			start = direction === 0 ? 26 : ( direction === 1 ? 16 : 6 );

			if ( camera[dir] < vector[dir] ) {

				start += 5;

			}

			if ( camera[dir2] < vector[dir2] ) {

				start += 2;

			}

			this.drawMultiple( gl, vector, 4, start );

		}

	},

	drawOct : function( gl, position, camera ) {

		var vector = this.vector,
			start, i;

		if ( drawBigCubes ) {

			vec3.assign( this.vector, 2 + cubeSpacing );

			this.drawMulti( gl, position );

		} else {

			vec3.assign( vector, - 0.5 - cubeSpacing * 0.5 );
			vec3.add( vector, position );

			start = 37;

			if ( camera[0] < vector[0] ) {

				start += 12;

			}

			if ( camera[1] < vector[1] ) {

				start += 24;

			}

			if ( camera[2] < vector[2] ) {

				start += 4;

			}

			this.drawMultiple( gl, vector, 8, start );

		}

	},

	drawHex : function( gl, position, direction ) {

		vec3.assign( this.vector, 2 + cubeSpacing );
		this.vector[direction] = 4 + 3 * cubeSpacing;

		this.drawMulti( gl, position );

	},

	draw32 : function( gl, position, direction ) {

		vec3.assign( this.vector, 4 + 3 * cubeSpacing );
		this.vector[direction] = 2 + cubeSpacing;

		this.drawMulti( gl, position );

	},

	draw64 : function( gl, position ) {

		vec3.assign( this.vector, 4 + 3 * cubeSpacing );

		this.drawMulti( gl, position );

	},

	drawMulti : function( gl, position ) {

		var matrix = gl.matrix,
			shader = Element.shader;

		mat4.identity( matrix );
		mat4.translate( matrix, position );

		mat4.scale( matrix, this.vector );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );

		this.draw( gl, shader, 0 );

	},

	initBuffers : function( gl ) {

		var vertexArray = this.initVertices(),
			texCoordsArray = this.initTexCoords(),
			indexArray = this.initIndices(),
			lineIndexArray = this.initLineIndices();

		this.initNormals();

		this.attributeBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, ( vertexArray.length + texCoordsArray.length ) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertexArray );
		gl.bufferSubData( gl.ARRAY_BUFFER, vertexArray.length * 4, texCoordsArray );


		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);


		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndexArray, gl.STATIC_DRAW);

	},

	initVertices : function() {

		var i, j, k,
			vertexArray,
			cubePositions,
			s = 0.5,
			vV = this.vertexVectors = [],
			vertices = new Float32Array([

			// front
			s, s, s,
			s, -s, s,
			s, -s, -s,
			s, s, -s,

			// right
			s, s, s,
			s, s, -s,
			-s, s, -s,
			-s, s, s,

			// top
			s, s, s,
			-s, s, s,
			-s, -s, s,
			s, -s, s,

			// back
			-s, s, s,
			-s, s, -s,
			-s, -s, -s,
			-s, -s, s,

			// left
			s, -s, s,
			-s, -s, s,
			-s, -s, -s,
			s, -s, -s,

			// bottom
			s, s, -s,
			s, -s, -s,
			-s, -s, -s,
			-s, s, -s

		]);


		s = s * 2 + cubeSpacing;

		cubePositions = [

			[0, 0, 0],

			[s, 0, 0],
			[0, s, 0],
			[s, s, 0],

			[0, 0, s],
			[s, 0, s],
			[0, s, s],
			[s, s, s]

		];

		vertexArray = new Float32Array( 72 * cubePositions.length );

		for ( j = 0; j < cubePositions.length; j++ ) {

			k = 72 * j;

			for ( i = 0; i < 72; i++ ) {

				vertexArray[k + i] = vertices[i] + cubePositions[j][i % 3];

			}

		}


		for ( i = 0; i < 24; i++ ) {

			j = i * 3;

			vV.push( vec3.assign(
				vec3.create(), 
				vertices[j],
				vertices[j + 1],
				vertices[j + 2]
			) );

		}

		return vertexArray;

	},

	initNormals : function() {

		var i, j,
			nV = this.normalVectors = [],
			normals = new Float32Array([

			1, 0, 0,
			0, 1, 0,
			0, 0, 1,

			-1, 0, 0,
			0, -1, 0,
			0, 0, -1

		]);

		for ( i = 0; i < 6; i++ ) {

			j = i * 3;

			nV.push( vec3.assign(
				vec3.create(), 
				normals[j],
				normals[j + 1],
				normals[j + 2]
			) );

		}

	},

	initTexCoords : function() {

		var stepX = 1 / 4,
			stepY = 1 / 8,
			i, j, k,
			texCoords = [],
			texCoordsArray;

		function addTexCoords( x, y, w, h ) {

			var wo = w * 0.125,
				ho = h * 0.125;

			texCoords.push(
				x + 7 * wo, y + ho,
				x + wo, y + ho,
				x + wo, y + 7 * ho,
				x + 7 * wo, y + 7 * ho
			);

		}

		for ( k = 0; k < 2; k++ ) {

			for ( j = 5; j < 8; j++ ) {

				addTexCoords( 0, j * stepY, stepX, stepY );

			}

		}

		stepX = 1 / 6;
		stepY = 1 / 12;

		for ( i = 3; i < 6; i++ ) {

			for ( k = 0; k < 2; k++ ) {

				for ( j = 9; j < 12; j++ ) {

					addTexCoords( i * stepX, j * stepY, stepX, stepY );

				}

			}

		}

		texCoordsArray = new Float32Array( 48 * 12 );

		for ( i = 0; i < 48 * 4; i++ ) {

			texCoordsArray[i] = texCoords[i];

		}

		for ( i = 0; i < 48; i++ ) {

			for ( j = 4; j < 12; j++ ) {

				texCoordsArray[i + j * 48] = texCoords[i];

			}

		}

		return texCoordsArray;

	},

	initIndices : function() {

		var i, j, k,
			indexArray,
			cubeList,
			singleIndices = [

			// front
			0, 1, 2, 0, 2, 3,

			// right
			4, 5, 6, 4, 6, 7,

			// top
			8, 9, 10, 8, 10, 11,

			// back
			12, 13, 14, 12, 14, 15,

			// left
			16, 17, 18, 16, 18, 19,

			// bottom
			20, 21, 22, 20, 22, 23

		];


		cubeList = [

			// single
			0,

			// doubles
			1, 0,
			2, 0,
			4, 0,

			// quads
			1, 2, 3, 0, 1,
			0, 3, 2, 1, 0,

			4, 1, 5, 0, 4,
			0, 5, 1, 4, 0,

			2, 4, 6, 0, 2,
			0, 6, 4, 2, 0,

			// octs
			0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3,
			1, 0, 3, 2, 5, 4, 7, 6, 1, 0, 3, 2,
			2, 3, 0, 1, 6, 7, 4, 5, 2, 3, 0, 1,
			3, 2, 1, 0, 7, 6, 5, 4, 3, 2, 1, 0

		];

		indexArray = new Uint16Array( 36 * cubeList.length );

		for ( j = 0; j < cubeList.length; j++ ) {

			k = j * 36;

			for ( i = 0; i < 36; i++ ) {

				indexArray[k + i] = singleIndices[i] + 24 * cubeList[j];

			}

		}

		return indexArray;

	},

	initLineIndices : function() {

		return new Uint16Array([

			0, 1, 3, 0, 0, 12, 1, 2, 2, 3,
			12, 13, 13, 14, 14, 15, 15, 12,
			1, 15, 2, 14, 3, 13

		]);

	}

} );