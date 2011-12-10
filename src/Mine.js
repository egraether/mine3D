var Mine = {

	draw : function( gl, shader ) {

		gl.enable( gl.DEPTH_TEST );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 20 * 3 * 3 * 3 * 4 );

		if ( drawLines ) {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
			gl.drawElements( gl.LINES, 360, gl.UNSIGNED_SHORT, 0 );

		} else {

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.drawElements( gl.TRIANGLES, 180, gl.UNSIGNED_SHORT, 0 );

		}

		gl.disable( gl.DEPTH_TEST );

	},

	initBuffers : function( gl ) {

		var i, j, l,
			stepX = 1 / 4,
			stepY = 1 / 8,
			texCoords = [],
			t = ( 1 + Math.sqrt( 5 ) ) / 2,
			v = [],
			vertices = new Float32Array( 20 * 3 * 3 * 3 ),
			middle = vec3.create();


		function addVertex( x, y, z ) {

			v.push( vec3.scale( vec3.normalize( vec3.assign( vec3.create(), x, y, z ) ), mineSize ) );

		}


		function texFromRect( x, y, w, h ) {

			return [
				x + w / 2, 1 - y,
				x + w, 1 - y - h / 2,
				x, 1 - (y + h)
			];

		}


		function addTriangle( k, a, b, c ) {

			var i, j;

			a = v[a];
			b = v[b];
			c = v[c];

			vec3.zero( middle );

			vec3.add( middle, a );
			vec3.add( middle, b );
			vec3.add( middle, c );

			vec3.scale( vec3.normalize( middle ), mineSpikyness * mineSize );

			for ( i = 0; i < 3; i++ ) {

				j = k * 9 * 3 + i;

				vertices[j] = middle[i];
				vertices[j + 3] = a[i];
				vertices[j + 6] = b[i];

				vertices[j + 9] = middle[i];
				vertices[j + 12] = b[i];
				vertices[j + 15] = c[i];

				vertices[j + 18] = middle[i];
				vertices[j + 21] = c[i];
				vertices[j + 24] = a[i];

				texCoords = texCoords.concat( texFromRect( 3 * stepX, (i + 2) * stepY, stepX, stepY ) );

			}

		}


		addVertex( 0, t, 1 );
		addVertex( 0, -t, 1 );
		addVertex( 0, -t, -1 );
		addVertex( 0, t, -1 );

		addVertex( t, 1, 0 );
		addVertex( -t, 1, 0 );
		addVertex( -t, -1, 0 );
		addVertex( t, -1, 0 );

		addVertex( 1, 0, t );
		addVertex( 1, 0, -t );
		addVertex( -1, 0, -t );
		addVertex( -1, 0, t );


		addTriangle( 0, 0, 3, 5 );
		addTriangle( 1, 0, 5, 11 );
		addTriangle( 2, 0, 11, 8 );
		addTriangle( 3, 0, 8, 4 );
		addTriangle( 4, 0, 4, 3 );

		addTriangle( 5, 1, 8, 11 );
		addTriangle( 6, 1, 11, 6 );
		addTriangle( 7, 1, 7, 8 );
		addTriangle( 8, 1, 6, 2 );
		addTriangle( 9, 1, 2, 7 );

		addTriangle( 10, 2, 9, 7 );
		addTriangle( 11, 2, 6, 10 );
		addTriangle( 12, 2, 10, 9 );

		addTriangle( 13, 3, 10, 5 );
		addTriangle( 14, 3, 4, 9 );
		addTriangle( 15, 3, 9, 10 );

		addTriangle( 16, 4, 7, 9 );
		addTriangle( 17, 4, 8, 7 );

		addTriangle( 18, 5, 6, 11 );
		addTriangle( 19, 5, 10, 6 );

		texCoords = new Float32Array( texCoords );


		var indices = [];

		for ( i = 0; i < 180; i++ ) {

			indices.push( i );

		}

		indices = new Uint16Array( indices );


		var lineIndices = [];

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
		gl.bufferData( gl.ARRAY_BUFFER, ( 20 * 3 * 3 * 3 + 20 * 3 * 3 * 2 ) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 20 * 3 * 3 * 3 * 4, texCoords);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);

	}

};