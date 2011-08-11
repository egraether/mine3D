var Face = function( element ) {

	this.element = element;

	this.updateValue = true;

	this.texCoordArray = new Float32Array([
		1, 1,
		0, 1,
		0, 0,
		1, 0
	]);

}

Face.prototype = {

	updateTexCoords : function( value ) {

		var texCoords = this.texCoordArray,
			value = this.element.value,
			step = 1 / 32,
			top = 1 - value * step,
			bottom = 1 - ( value + 1 ) * step;

		texCoords[1] = texCoords[3] = top;
		texCoords[5] = texCoords[7] = bottom;

	},

	draw : function( gl ) {

		if ( this.updateValue ) {

			this.updateTexCoords();

		}

		var shader = Face.shader;

		gl.enableAlpha();

		gl.useProgram( shader );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		gl.bindBuffer( gl.ARRAY_BUFFER, Face.vertexBuffer );
		gl.vertexAttribPointer( shader.positionAttribute, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, Face.texCoordBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.texCoordArray, gl.STATIC_DRAW );
		gl.vertexAttribPointer( shader.texCoordAttribute, 2, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Face.indexBuffer );
		gl.drawElements( gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 0 );

		gl.disableAlpha();

	}

};

extend( Face, {

	init : function( gl ) {

		this.initShader( gl );
		this.initTexture( gl );
		this.initBuffers( gl );

		gl.uniformMatrix4fv( this.shader.pMatrixUniform, false, Camera.getPMatrix() );

	},

	initShader : function( gl ) {

		var shader = gl.loadShader( "face-vertex-shader", "face-fragment-shader" );
		gl.useProgram( shader );

		shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.texCoordAttribute = gl.getAttribLocation( shader, "aTextureCoord" );
		gl.enableVertexAttribArray( shader.texCoordAttribute );

		shader.textureUniform = gl.getUniformLocation( shader, "uTexture" );

		this.shader = shader;

	},

	initTexture : function( gl ) {

		this.texture = gl.loadTexture( "textures/numbers.png", function( gl, texture ) {

			gl.useProgram( Face.shader );
			gl.passTexture( texture, Face.shader.textureUniform );

		});

	},

	initBuffers : function( gl ) {

		this.vertexArray = new Float32Array([

			0,  0.5,  0.5,
			0, -0.5,  0.5,
			0, -0.5, -0.5,
			0,  0.5, -0.5

		]);

		this.indexArray = new Uint16Array([

			0, 1, 2, 3

		]);

		this.vertexBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);

	}

});
