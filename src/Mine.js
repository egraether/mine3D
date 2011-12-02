var Mine = {

	draw : function( gl, shader ) {

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 20 * 3 * 3 * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.drawElements( gl.TRIANGLES, 60, gl.UNSIGNED_SHORT, 0 );

	},

	drawLine : function( gl, shader ) {

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 20 * 3 * 3 * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.drawElements( gl.LINES, 120, gl.UNSIGNED_SHORT, 0 );

	},

	initBuffers : function( gl ) {

		var i, j, l,
			t = ( 1 + Math.sqrt( 5 ) ) / 2,
			v = [

				0, t, 1,
				0, -t, 1,
				0, -t, -1,
				0, t, -1,

				t, 1, 0,
				-t, 1, 0,
				-t, -1, 0,
				t, -1, 0,

				1, 0, t,
				1, 0, -t,
				-1, 0, -t,
				-1, 0, t

		], vertices = new Float32Array( 20 * 3 * 3 );

		for ( i = 0; i < v.length; i++ ) {

			v[i] /= 4;

		}

		function addTriangle( j, a, b, c ) {

			var i;

			for ( i = 0; i < 3; i++ ) {

				vertices[j * 9 + i] = v[a * 3 + i];
				vertices[j * 9 + i + 3] = v[b * 3 + i];
				vertices[j * 9 + i + 6] = v[c * 3 + i];

			}

		}

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


		function texCoordsFromRect( x, y, w, h, px, py ) {

			return [
				x - px + w, 1 - y - py,
				x + px, 1 - y - py,
				x + px, 1 - (y - py + h)
			];

		}


		var stepX = 1 / 4,
			stepY = 1 / 8,
			pixelX = 1 / 256,
			pixelY = 1 / 512,
			i, j,
			texCoords = [];

		for ( i = 0, j = 0; i < 20; i++, j++ ) {

			texCoords = texCoords.concat( texCoordsFromRect( (i % 4) * stepX, (j % 3) + 5 * stepY, stepX, stepY, pixelX, pixelY ) );

		}

		texCoords = new Float32Array( texCoords );


		var indices = [];

		for ( i = 0; i < 60; i++ ) {

			indices.push( i );

		}

		indices = new Uint16Array( indices );


		var lineIndices = [];

		for ( i = 0; i < 20; i++ ) {

			lineIndices.push( 
				i * 3,
				i * 3 + 1,

				i * 3 + 1,
				i * 3 + 2,

				i * 3 + 2,
				i * 3
			);

		}

		lineIndices = new Uint16Array( lineIndices );


		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		this.lineIndexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, ( 20 * 3 * 3 + 20 * 2 * 3 ) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 20 * 3 * 3 * 4, texCoords);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);

	}

};