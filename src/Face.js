var Face = {

	draw : function( gl, shader, value ) {

		if ( value === 28 ) {

			vec3.assign( Cube.vector, mineSize / numberSize );
			mat4.scale( gl.matrix, Cube.vector );

		}

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, (12 + value * 8) * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.drawElements( gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 0 );

	},

	initBuffers : function( gl ) {

		var s = numberSize;

		this.vertices = new Float32Array([

			0,  s,  s,
			0, -s,  s,
			0, -s, -s,
			0,  s, -s

		]);


		function texCoordsFromRect( x, y, w, h ) {

			return [
				x + w, 1 - y,
				x, 1 - y,
				x, 1 - (y + h),
				x + w, 1 - (y + h)
			];

		}


		var stepX = 1 / 4,
			stepY = 1 / 8,
			i, j,
			texCoords = texCoordsFromRect( 3 * stepX, 0, stepX, stepY );

		for ( i = 0; i < 3; i++ ) {

			for ( j = 0; j < 3; j++ ) {

				texCoords = texCoords.concat( texCoordsFromRect( j * stepX, i * stepY, stepX, stepY ) );

			}

		}

		stepX = 1 / 8;
		stepY = 1 / 16;

		for ( i = 6; i < 9; i++ ) {

			for ( j = 0; j < 6; j++ ) {

				texCoords = texCoords.concat( texCoordsFromRect( j * stepX, i * stepY, stepX, stepY ) );

			}

		}

		texCoords = texCoords.concat( texCoordsFromRect(  3 / 4, 0, 1 / 4, 1 / 8 ) );

		texCoords = new Float32Array( texCoords );


		this.attributeBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (12 + 29 * 8) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, this.vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 12 * 4, texCoords );


		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( [0, 1, 2, 3] ), gl.STATIC_DRAW );

	}

};
