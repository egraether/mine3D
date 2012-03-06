var Background = {

	init : function( gl ) {

		var shader = gl.loadShader( "texture-vertex-shader", "texture-fragment-shader" );
		gl.useProgram( shader );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition");
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.texCoordAttribute = gl.getAttribLocation( shader, "aTextureCoord" );
		gl.enableVertexAttribArray( shader.texCoordAttribute );

		shader.textureUniform = gl.getUniformLocation( shader, "uTexture" );

		this.patternTexture = gl.loadTexture( backgroundPatternTexture, useTextureFiltering, function() {
			Background.resize();
		}, true);

		this.glowTexture = gl.loadTexture( backgroundGlowTexture, useTextureFiltering, false, true);

		this.shader = shader;

		gl.useProgram( Element.shader );

	},

	draw : function( gl ) {

		var shader = this.shader;

		gl.useProgram( shader );

		gl.passTexture( this.patternTexture, shader.textureUniform );
		gl.drawQuad( shader, 32 );

		gl.passTexture( this.glowTexture, shader.textureUniform );
		gl.drawQuad( shader, 0 );

		gl.useProgram( Element.shader );

	},

	resize : function() {

		gl.updateQuadTexCoords( canvas.width / this.patternTexture.image.width );

	}

};
