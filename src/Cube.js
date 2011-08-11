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

	},

	draw : function( gl, flag, highlight ) {

		var shader = Cube.shader,
			colorOffset = flag ? highlight ? (72 + 3 * 96) * 4 : (72 + 2 * 96) * 4 : highlight ? (72 + 96) * 4 : 72 * 4;

		// gl.useProgram( shader );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.colorAttribute, 4, gl.FLOAT, false, 0, colorOffset );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, (72 + 4 * 96) * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer );
		gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );

	}

};

extend( Cube, {

	init : function( gl ) {

		this.initShader( gl );
		this.initBuffers( gl );

		gl.uniformMatrix4fv( this.shader.pMatrixUniform, false, Camera.getPMatrix() );

	},

	initShader : function( gl ) {

		var shader = gl.loadShader( "vertex-shader", "fragment-shader" );
		gl.useProgram(shader);

		shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.colorAttribute = gl.getAttribLocation( shader, "aColor" );
		gl.enableVertexAttribArray( shader.colorAttribute );

		this.shader = shader;

	},

	initBuffers : function( gl ) {

		var vertices = new Float32Array([

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

		var i;

		for ( i = 0; i < 72; i++ ) {

			vertices[i] /= 2;

		}


		this.vertexVectors = [];

		var vV = this.vertexVectors,
			j;

		for ( i = 0; i < 24; i++ ) {

			j = i * 3;

			vV.push( vec3.assign(
				vec3.create(), 
				vertices[j],
				vertices[j + 1],
				vertices[j + 2]
			) );

		}


		var normals = new Float32Array([
		
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
		
		var nV = this.normalVectors;
		
		for ( i = 0; i < 24; i++ ) {
		
			j = i * 12;
		
			nV.push( vec3.assign(
				vec3.create(), 
				normals[j],
				normals[j + 1],
				normals[j + 2]
			) );
		
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

		var colors = [

			vec3.assign( vec3.create(), 0.7, 0.7, 0.7 ),
			vec3.assign( vec3.create(), 0.6, 0.6, 0.6 ),
			vec3.assign( vec3.create(), 0.8, 0.8, 0.8 )

		];

		var bC = baseColors = new Float32Array( 96 ),
			hC = highlightColors = new Float32Array( 96 ),
			fC = flagColors = new Float32Array( 96 ),
			fhC = flagHighlightColors = new Float32Array( 96 ),
			col;

		for ( i = 0; i < 24; i++ ) {

			col = colors[Math.floor( i / 4 ) % 3];

			fC[i * 4] = fhC[i * 4] = bC[i * 4] = hC[i * 4] = col[0];

			bC[i * 4 + 1] = hC[i * 4 + 1] = col[1];
			bC[i * 4 + 2] = hC[i * 4 + 2] = col[2];

			fhC[i * 4 + 1] = fC[i * 4 + 1] = col[1] / 4;
			fhC[i * 4 + 2] = fC[i * 4 + 2] = col[2] / 4;

			bC[i * 4 + 3] = fC[i * 4 + 3] = 1.0;
			fhC[i * 4 + 3] = hC[i * 4 + 3] = 0.8;

		}

		var texCoords = new Float32Array( 48 );

		for ( i = 0; i < 48; i++ ) {

			texCoords[i] = 0;

		}


		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (72 + 4 * 96 + 48) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 72 * 4, baseColors );
		gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 96) * 4, highlightColors );
		gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 2 * 96) * 4, flagColors );
		gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 3 * 96) * 4, flagHighlightColors );
		gl.bufferSubData( gl.ARRAY_BUFFER, (72 + 4 * 96) * 4, texCoords);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	}

} );