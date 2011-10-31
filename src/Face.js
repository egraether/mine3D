var Face = {

	size : 0.3,

	draw : function( gl, shader, value ) {

		if ( value === 28 ) {

			vec3.assign( Cube.vector, mineSize );

		} else {

			vec3.assign( Cube.vector, numberSize );

		}

		mat4.scale( gl.matrix, Cube.vector );

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.colorAttribute, 4, gl.FLOAT, false, 0, 12 * 4 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, (12 + 16 + value * 8) * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.drawElements( gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 0 );

	},

	initBuffers : function( gl ) {

		var s = this.size;

		this.vertices = new Float32Array([

			0,  s,  s,
			0, -s,  s,
			0, -s, -s,
			0,  s, -s

		]);

		var colors = new Float32Array([

			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0

		]);

		var texCoords = new Float32Array( 29 * 8 ),
			stepX = 1 / 4,
			stepY = 1 / 8,
			top, bottom, left, right, 
			i, j, index = 0;

		for ( i = 3; i >= 0; i-- ) {

			for ( j = 0; j < 8; j++ ) {

				top = 1 - j * stepY;
				bottom = 1 - ( j + 1 ) * stepY;

				left = 1 - i * stepX;
				right = 1 - ( i + 1 ) * stepX;

				texCoords[index * 8] = texCoords[index * 8 + 6] = left;
				texCoords[index * 8 + 2] = texCoords[index * 8 + 4] = right;

				texCoords[index * 8 + 1] = texCoords[index * 8 + 3] = top;
				texCoords[index * 8 + 5] = texCoords[index * 8 + 7] = bottom;

				index++;

			}

		}

		this.attributeBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (12 + 16 + 29 * 8) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, this.vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, 12 * 4, colors );
		gl.bufferSubData( gl.ARRAY_BUFFER, (12 + 16) * 4, texCoords);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( [0, 1, 2, 3] ), gl.STATIC_DRAW);

	}

};
