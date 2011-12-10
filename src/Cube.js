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

		var texOffset = ( 72 + 48 * ( stateIndex || 0 ) ) * 4;

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, texOffset );

		if ( drawLines ) {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
			gl.drawElements( gl.LINES, 24, gl.UNSIGNED_SHORT, 0 );

		} else {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

		}

	},

	drawDouble : function( gl, shader, direction, position ) {

		vec3.assign( this.vector, 1 );
		this.vector[direction] = 2 + cubeSpacing;

		this.drawMulti( gl, shader, position );

	},

	drawQuad : function( gl, shader, direction, direction2, position ) {

		vec3.assign( this.vector, 1 );
		this.vector[direction] = 2 + cubeSpacing;
		this.vector[direction2] = 2 + cubeSpacing;

		this.drawMulti( gl, shader, position );

	},

	drawOct : function( gl, shader, position ) {

		vec3.assign( this.vector, 2 + cubeSpacing );

		this.drawMulti( gl, shader, position );

	},

	drawHex : function( gl, shader, direction, position ) {

		vec3.assign( this.vector, 2 + cubeSpacing );
		this.vector[direction] = 4 + 3 * cubeSpacing;

		this.drawMulti( gl, shader, position );

	},

	draw32 : function( gl, shader, direction, direction2, position ) {

		vec3.assign( this.vector, 2 + cubeSpacing );
		this.vector[direction] = 4 + 3 * cubeSpacing;
		this.vector[direction2] = 4 + 3 * cubeSpacing;

		this.drawMulti( gl, shader, position );

	},

	draw64 : function( gl, shader, position ) {

		vec3.assign( this.vector, 4 + 3 * cubeSpacing );

		this.drawMulti( gl, shader, position );

	},

	drawMulti : function( gl, shader, position ) {

		var matrix = gl.matrix;

		mat4.identity( matrix );
		mat4.translate( matrix, position );

		mat4.scale( matrix, this.vector );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );

		this.draw( gl, shader, 0 );

	},

	initBuffers : function( gl ) {

		var i, j, l,
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

		for ( i = 0; i < 24; i++ ) {

			j = i * 3;

			vV.push( vec3.assign(
				vec3.create(), 
				vertices[j],
				vertices[j + 1],
				vertices[j + 2]
			) );

		}

		var nV = this.normalVectors = [],
			normals = new Float32Array([

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

		for ( i = 0; i < 6; i++ ) {

			j = i * 12;

			nV.push( vec3.assign(
				vec3.create(), 
				normals[j],
				normals[j + 1],
				normals[j + 2]
			) );

		}


		function texCoordsFromRect( x, y, w, h, px, py ) {

			return [
				x - px + w, 1 - y - py,
				x + px, 1 - y - py,
				x + px, 1 - (y - py + h),
				x - px + w, 1 - (y - py + h)
			];

		}


		var stepX = 1 / 4,
			stepY = 1 / 8,
			pixelX = 1 / 256,
			pixelY = 1 / 512,
			i, j, k,
			texCoords = [];

		for ( i = 0; i < 4; i++ ) {

			for ( k = 0; k < 2; k++ ) {

				for ( j = 5; j < 8; j++ ) {

					texCoords = texCoords.concat( texCoordsFromRect( i * stepX, j * stepY, stepX, stepY, pixelX, pixelY ) );

				}

			}

		}

		texCoords = new Float32Array( texCoords );


		var indices = new Uint16Array([

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

		]);

		var lineIndices = new Uint16Array([

			0, 1, 3, 0, 0, 12, 1, 2, 2, 3,
			12, 13, 13, 14, 14, 15, 15, 12,
			1, 15, 2, 14, 3, 13

		]);


		this.attributeBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (72 + 48 * 4) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 72 * 4, texCoords);


		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);

	}

} );