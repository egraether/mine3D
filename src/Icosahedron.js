var Icosahedron = {

	draw : function( gl, shader ) {

		gl.enable( gl.DEPTH_TEST );

		if ( gl.lastDraw !== 'i' ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );

			gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
			gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 20 * 9 * 3 * 4 );

		}

		if ( drawLines ) {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
			gl.drawElements( gl.LINES, 360, gl.UNSIGNED_SHORT, 0 );

		} else {

			gl.drawElements( gl.TRIANGLES, 180, gl.UNSIGNED_SHORT, 0 );

		}

		gl.lastDraw = 'i';

		gl.disable( gl.DEPTH_TEST );

	},

	initBuffers : function( gl ) {

		var i, j, k,
			a, b, c,
			s, x, xl, yt,
			sX = 1 / 4,
			sY = 1 / 8,
			texCoords = [],
			indices = [],
			lineIndices = [],
			t = ( 1 + Math.sqrt( 5 ) ) / 2,
			vertices,
			vertexArray,
			triangleList,
			m = vec3.create();

		vertices = [

			[ 0,  t,  1],
			[ 0, -t,  1],
			[ 0, -t, -1],
			[ 0,  t, -1],

			[ t,  1,  0],
			[-t,  1,  0],
			[-t, -1,  0],
			[ t, -1,  0],

			[ 1,  0,  t],
			[ 1,  0, -t],
			[-1,  0, -t],
			[-1,  0,  t]

		];

		for ( i = 0; i < vertices.length; i++ ) {

			vec3.scale( vec3.normalize( vertices[i] ), mineSize );

		}

		triangleList = [

			0, 3, 5,
			10, 5, 3,
			5, 10, 6,
			2, 6, 10,

			0, 5, 11,
			6, 11, 5,
			11, 6, 1,
			2, 1, 6,

			0, 11, 8,
			1, 8, 11,
			8, 1, 7,
			2, 7, 1,

			0, 8, 4,
			7, 4, 8,
			4, 7, 9,
			2, 9, 7,

			0, 4, 3,
			9, 3, 4,
			3, 9, 10,
			2, 10, 9

		];

		vertexArray = new Float32Array( triangleList.length * 9 );

		for ( k = 0; k < triangleList.length; k += 3 ) {

			a = vertices[triangleList[k]];
			b = vertices[triangleList[k + 1]];
			c = vertices[triangleList[k + 2]];

			vec3.add( vec3.add( a, b, m ), c );
			vec3.scale( vec3.normalize( m ), mineSpikyness * mineSize );

			for ( i = 0; i < 3; i++ ) {

				j = k * 9 + i;

				vertexArray[j] = m[i];
				vertexArray[j + 3] = a[i];
				vertexArray[j + 6] = b[i];

				vertexArray[j + 9] = m[i];
				vertexArray[j + 12] = b[i];
				vertexArray[j + 15] = c[i];

				vertexArray[j + 18] = m[i];
				vertexArray[j + 21] = c[i];
				vertexArray[j + 24] = a[i];

			}

		}

		texCoords = new Float32Array( triangleList.length * 6 );

		function addTexTriangleStrip( index, x1, x2, x3, y1, y2, y3 ) {

			var i, j, t = texCoords;

			for ( i = 0; i < 5; i++ ) {

				j = 4 * 9 * 2 * i + 9 * 2 * index;

				t[j] = t[j + 6] = t[j + 12] = x1;
				t[j + 1] = t[j + 7] = t[j + 13] = y1 + i * s;

				t[j + 2] = t[j + 16] = x2;
				t[j + 3] = t[j + 17] = y1 + i * s;

				t[j + 4] = t[j + 8] = x3;
				t[j + 5] = t[j + 9] = y2 + i * s;

				t[j + 10] = t[j + 14] = x3;
				t[j + 11] = t[j + 15] = y3 + i * s;

			}

		};

		s = 2 * sY / Math.sqrt( 3 ) / 4;
		x = Math.tan( Math.PI / 6 ) / 2 * sX / 4;

		xl = 1 - sX / 8;
		yt = sY + sY / 8;

		addTexTriangleStrip( 0, xl - sX / 4 + x, xl, xl - sX / 4, yt + s * 0.5, yt, yt + s );
		addTexTriangleStrip( 1, xl - sX / 4 - x, xl - sX / 2, xl - sX / 4, yt + s * 0.5, yt + s, yt );
		addTexTriangleStrip( 2, xl - sX / 2 + x, xl - sX / 4, xl - sX / 2, yt + s, yt + s * 0.5, yt + s * 1.5 );
		addTexTriangleStrip( 3, xl - sX / 2 - x, xl - sX * 3 / 4, xl - sX / 2, yt + s, yt + s * 1.5, yt + s * 0.5 );


		for ( i = 0; i < 180; i++ ) {

			indices.push( i );

			j = i * 3;

			lineIndices.push( 
				j, j + 1,
				j + 1, j + 2,
				j + 2, j
			);

		}

		indices = new Uint16Array( indices );
		lineIndices = new Uint16Array( lineIndices );


		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, ( vertexArray.length + texCoords.length ) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertexArray );
		gl.bufferSubData( gl.ARRAY_BUFFER, vertexArray.length * 4, texCoords );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW );

	}

};