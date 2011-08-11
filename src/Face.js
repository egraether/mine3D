var Face = function( element ) {

	this.element = element;

}

Face.prototype = {

	draw : function( gl, value ) {

		var shader = Face.shader;

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, Face.attributeBuffer );

		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer( shader.colorAttribute, 4, gl.FLOAT, false, 0, 12 * 4 );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, (12 + 16 + value * 8) * 4 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Face.indexBuffer );
		gl.drawElements( gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 0 );

	}

};

extend( Face, {

	init : function( gl ) {

		this.initShader( gl );
		this.initTexture( gl );
		this.initBuffers( gl );

	},

	initShader : function( gl ) {

		var shader = Cube.shader;
		// var shader = gl.loadShader( "face-vertex-shader", "face-fragment-shader" );
		// gl.useProgram( shader );

		// shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		// shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		// shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		// gl.enableVertexAttribArray( shader.positionAttribute );

		shader.texCoordAttribute = gl.getAttribLocation( shader, "aTextureCoord" );
		gl.enableVertexAttribArray( shader.texCoordAttribute );

		shader.textureUniform = gl.getUniformLocation( shader, "uTexture" );

		this.shader = shader;

	},

	initTexture : function( gl ) {

		this.texture = gl.loadTexture( "textures/numbers.png", function( gl, texture ) {

			// gl.useProgram( Face.shader );
			gl.passTexture( texture, Face.shader.textureUniform );
			Camera.updateView = true;

		});

	},

	initBuffers : function( gl ) {

		this.vertices = new Float32Array([

			0,  0.5,  0.5,
			0, -0.5,  0.5,
			0, -0.5, -0.5,
			0,  0.5, -0.5

		]);

		var colors = new Float32Array([

			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0

		]);

		var texCoords = new Float32Array( 29 * 8 ),
			step = 1 / 32,
			top, botton, i;

		for ( i = 0; i < 29; i++ ) {

			top = 1 - i * step;
			bottom = 1 - ( i + 1 ) * step;

			texCoords[i * 8] = texCoords[i * 8 + 6] = 1;
			texCoords[i * 8 + 2] = texCoords[i * 8 + 4] = 0;

			texCoords[i * 8 + 1] = texCoords[i * 8 + 3] = top;
			texCoords[i * 8 + 5] = texCoords[i * 8 + 7] = bottom;

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

});
