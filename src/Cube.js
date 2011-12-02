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

	draw : function( gl, shader, mine, flag, highlight, scale ) {

		var colorIndex = flag ? 1 : 0,
			colorOffset,
			texOffset;

		if ( Game.gameover && flag ) {

			colorIndex = mine ? 3 : 2;

		}

		texOffset = ( 72 + 48 * colorIndex ) * 4;

		if ( highlight ) {

			gl.uniform1f( Element.shader.alphaUniform, mouseOverAlpha );

			// colorIndex += 4;

		}

		colorOffset = ( 72 + 48 * 4 + colorIndex * 96 ) * 4;

		if ( scale !== 1 ) {

			vec3.assign( this.vector, scale );
			mat4.scale( gl.matrix, this.vector );

		}

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		// gl.vertexAttribPointer( shader.colorAttribute, 4, gl.FLOAT, false, 0, colorOffset );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, texOffset );

		if ( drawLines ) {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
			gl.drawElements( gl.LINES, 24, gl.UNSIGNED_SHORT, 0 );

		} else {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

		}

		if ( highlight ) {

			gl.uniform1f( Element.shader.alphaUniform, standardAlpha );

		}

	},

	initBuffers : function( gl ) {

		var i, j, l,
			vV = this.vertexVectors = [],
			vertices = new Float32Array([

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

		for ( i = 0; i < 72; i++ ) {

			vertices[i] /= 2;

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


		function createColorArray( colors ) {

			var array = new Float32Array( 96 ),
				i, j, col;

			for ( i = 0; i < 24; i++ ) {

				j = i * 4;
				col = colors[Math.floor( i / 4 ) % 3];

				array[j] = col[0];
				array[j + 1] = col[1];
				array[j + 2] = col[2];
				array[j + 3] = col[3];

			}

			return array;

		}


		function convert( hex ) {

			return [ 
				( hex >> 16 & 255 ) / 255,
				( hex >> 8 & 255 ) / 255,
				( hex & 255 ) / 255,
				standardAlpha
			];

		}

		var colors = [

			convert( baseColor ),

			convert( flagColor ),

			convert( failColor ),

			convert( rightColor )

		];

		var highlightColor;

		for ( i = 0, l = colors.length; i < l; i++ ) {

			highlightColor = colors[i].concat();
			highlightColor[3] = mouseOverAlpha;

			colors.push( highlightColor );

		}


		function addShades( colors ) {

			var shadeUp = colors.concat(),
				shadeDown = colors.concat(),
				i, value;

			for ( i = 0; i < 3; i++ ) {

				value = colors[i] * shadeFactor;

				shadeUp[i] += value;
				shadeDown[i] -= value;

			}

			return [ colors, shadeDown, shadeUp ];

		}

		for ( i = 0; i < colors.length; i++ ) {

			colors[i] = addShades( colors[i] );

		}


		// var texCoords = new Float32Array( 48 );
		// 
		// for ( i = 0; i < 48 * 4; i++ ) {
		// 
		// 	texCoords[i] = 1;
		// 
		// }


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
		this.indexBuffer = gl.createBuffer();
		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (72 + 48 * 4 + colors.length * 96) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 72 * 4, texCoords);

		for ( i = 0; i < colors.length; i++ ) {

			gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 48 * 4 + i * 96) * 4, createColorArray( colors[i] ) );

		}

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);

	}

} );