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

	draw : function( gl, shader, flag, highlight, scale ) {

		var colorOffset = ( 72 + 48 + ( flag ? highlight ? 3 : 2 : highlight ? 1 : 0 ) * 96 ) * 4;

		if ( scale != 1 ) {

			vec3.assign( this.vector, scale );
			mat4.scale( gl.matrix, this.vector );

		}

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.colorAttribute, 4, gl.FLOAT, false, 0, colorOffset );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 72 * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

	},

	initBuffers : function( gl ) {

		var i, j,
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

		var colors = [

			// baseColors
			[

				[ 0.7, 0.7, 0.7, 1.0 ],
				[ 0.6, 0.6, 0.6, 1.0 ],
				[ 0.8, 0.8, 0.8, 1.0 ]

			// highlightColors
			], [

				[ 0.7, 0.7, 0.7, 0.8 ],
				[ 0.6, 0.6, 0.6, 0.8 ],
				[ 0.8, 0.8, 0.8, 0.8 ]

			// flagColors
			], [

				[ 0.7, 0.175, 0.175, 1.0 ],
				[ 0.6, 0.15, 0.15, 1.0 ],
				[ 0.8, 0.2, 0.2, 1.0 ]

			// flagHighlightColors
			], [

				[ 0.7, 0.175, 0.175, 0.9 ],
				[ 0.6, 0.15, 0.15, 0.9 ],
				[ 0.8, 0.2, 0.2, 0.9 ]

			]

		];


		var texCoords = new Float32Array( 48 );

		for ( i = 0; i < 48; i++ ) {

			texCoords[i] = 0;

		}


		var indices = new Uint16Array([

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


		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (72 + 48 + colors.length * 96) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 72 * 4, texCoords);

		for ( i = 0; i < colors.length; i++ ) {

			gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 48 + i * 96) * 4, createColorArray( colors[i] ) );

		}

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	}

} );