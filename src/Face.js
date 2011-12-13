var Face = {

	draw : function( gl, shader, stateIndex ) {

		var texOffset = (12 + ( stateIndex || 0 ) * 8 ) * 4;

		if ( gl.lastDraw !== 'f' ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );

			gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );

			gl.lastTexOffset = -1;

		}

		if ( gl.lastTexOffset !== texOffset ) {

			gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, texOffset );

			gl.lastTexOffset = texOffset;

		}

		gl.drawElements( gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 0 );

		gl.lastDraw = 'f';

	},

	initBuffers : function( gl ) {

		var s = numberSize,
			stepX = 1 / 4,
			stepY = 1 / 8,
			i, j,
			texCoords = [];

		this.vertices = new Float32Array([

			0,  s,  s,
			0, -s,  s,
			0, -s, -s,
			0,  s, -s

		]);


		function addTexCoords( x, y, w, h ) {

			texCoords.push(
				x + w, y,
				x, y,
				x, y + h,
				x + w, y + h
			);

		}


		addTexCoords( 3 * stepX, 0, stepX, stepY );

		for ( i = 0; i < 3; i++ ) {

			for ( j = 0; j < 3; j++ ) {

				addTexCoords( j * stepX, i * stepY, stepX, stepY );

			}

		}

		stepX = 1 / 8;
		stepY = 1 / 16;

		for ( i = 6; i < 9; i++ ) {

			for ( j = 0; j < 6; j++ ) {

				addTexCoords( j * stepX, i * stepY, stepX, stepY );

			}

		}

		addTexCoords(  3 / 4, 0, 1 / 4, 1 / 8 );

		texCoords = new Float32Array( texCoords );


		this.attributeBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.attributeBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, (this.vertices.length + texCoords.length) * 4, gl.STATIC_DRAW );

		gl.bufferSubData( gl.ARRAY_BUFFER, 0, this.vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, this.vertices.length * 4, texCoords );


		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( [0, 1, 2, 3] ), gl.STATIC_DRAW );

	}

};
