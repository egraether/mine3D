var Icosahedron = {

	draw : function( gl, shader ) {

		gl.enable( gl.DEPTH_TEST );

		if ( gl.lastDraw !== 'i' ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );

			gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
			gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 20 * 3 * 3 * 3 * 4 );

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
			stepX = 1 / 4,
			stepY = 1 / 8,
			texCoords = [],
			indices = [],
			lineIndices = [],
			t = ( 1 + Math.sqrt( 5 ) ) / 2,
			vertices,
			vertexArray,
			triangleList,
			middle = vec3.create();


		function addTexCoords( x, y, w, h ) {

			texCoords.push(
				x + w / 2, y,
				x + w, y + h / 2,
				x, y + h
			);

		}

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
			0, 5, 11,
			0, 11, 8,
			0, 8, 4,
			0, 4, 3,

			1, 8, 11,
			1, 11, 6,
			1, 7, 8,
			1, 6, 2,
			1, 2, 7,

			2, 9, 7,
			2, 6, 10,
			2, 10, 9,

			3, 10, 5,
			3, 4, 9,
			3, 9, 10,

			4, 7, 9,
			4, 8, 7,

			5, 6, 11,
			5, 10, 6

		];

		vertexArray = new Float32Array( triangleList.length * 9 );


		for ( k = 0; k < triangleList.length; k += 3 ) {

			a = vertices[triangleList[k]];
			b = vertices[triangleList[k + 1]];
			c = vertices[triangleList[k + 2]];

			vec3.add( vec3.add( a, b, middle ), c );
			vec3.scale( vec3.normalize( middle ), mineSpikyness * mineSize );

			for ( i = 0; i < 3; i++ ) {

				j = k * 9 + i;

				vertexArray[j] = middle[i];
				vertexArray[j + 3] = a[i];
				vertexArray[j + 6] = b[i];

				vertexArray[j + 9] = middle[i];
				vertexArray[j + 12] = b[i];
				vertexArray[j + 15] = c[i];

				vertexArray[j + 18] = middle[i];
				vertexArray[j + 21] = c[i];
				vertexArray[j + 24] = a[i];

				addTexCoords( 3 * stepX, (i + 2) * stepY, stepX, stepY );

			}

		}


		texCoords = new Float32Array( texCoords );


		for ( i = 0; i < 180; i++ ) {

			indices.push( i );

		}

		indices = new Uint16Array( indices );


		for ( i = 0; i < 60; i++ ) {

			j = i * 3;

			lineIndices.push( 
				j, j + 1,
				j + 1, j + 2,
				j + 2, j
			);

		}

		lineIndices = new Uint16Array( lineIndices );


		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, ( vertexArray.length + texCoords.length ) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertexArray );
		gl.bufferSubData( gl.ARRAY_BUFFER, vertexArray.length * 4, texCoords);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);

	}

};