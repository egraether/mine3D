var WebGLUtilities = {

	loadShaderScript : function( shaderScriptID ) {

		var shaderScript = document.getElementById( shaderScriptID ),
			shader,
			t = this;

		if ( shaderScript.type === "x-shader/x-fragment" ) {

			shader = t.createShader( t.FRAGMENT_SHADER );

		} else if ( shaderScript.type === "x-shader/x-vertex" ) {

			shader = t.createShader( t.VERTEX_SHADER );

		} else {

			return null;

		}


		t.shaderSource( shader, shaderScript.text );
		t.compileShader( shader );

		if ( !t.getShaderParameter( shader, t.COMPILE_STATUS ) ) {

			console.log( "shader " + t.getShaderInfoLog( shader ) );
			return null;

		}

		return shader;

	},

	linkShaderProgramm : function( vertexShader, fragmentShader ) {

		var t = this,
			shaderProgram = t.createProgram();

		t.attachShader( shaderProgram, vertexShader );
		t.attachShader( shaderProgram, fragmentShader );

		t.linkProgram( shaderProgram );


		if ( !t.getProgramParameter( shaderProgram, t.LINK_STATUS ) ) {

			console.log( "Unable to initialize the shader program." );

		}

		return shaderProgram;

	},

	loadShader : function( vertexShaderID, fragmentShaderID ) {

		var t = this,
			vertexShader = t.loadShaderScript( vertexShaderID ),
			fragmentShader = t.loadShaderScript( fragmentShaderID );

		return t.linkShaderProgramm( vertexShader, fragmentShader );

	},


	textureCount : 0,

	loadTexture : function( imagePath, useMipmap, callback, repeat ) {

		var t = this,
			texture = t.createTexture();

		texture.ID = t.textureCount++;

		texture.image = new Image();

		texture.image.onload = function () {

			t.textureImageLoaded( texture, useMipmap, repeat );

			if ( callback ) {

				callback( t, texture );

			}

		}

		texture.image.src = imagePath;

		return texture;

	},

	textureImageLoaded : function( texture, useMipmap, repeat ) {

		var t = this;
			wrapping = repeat ? t.REPEAT : t.CLAMP_TO_EDGE;

		t.activeTexture( t["TEXTURE" + texture.ID] );
		t.bindTexture( t.TEXTURE_2D, texture );

		t.texImage2D( t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, texture.image );

		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_WRAP_S, wrapping );
		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_WRAP_T, wrapping );

		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR );


		if ( useMipmap ) {

			t.texParameteri( t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR_MIPMAP_LINEAR );

			t.generateMipmap( t.TEXTURE_2D );

		} else {

			t.texParameteri( t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR );

		}


		t.bindTexture( t.TEXTURE_2D, null );

	},

	passTexture : function( texture, textureUniform ) {

		var t = this;

		t.activeTexture( t["TEXTURE" + texture.ID] );
		t.bindTexture( t.TEXTURE_2D, texture );
		t.uniform1i( textureUniform, texture.ID );

	},


	matrixStack : [],
	stackPosition : 0,
	matrix : mat4.create(),

	pushMatrix : function() {

		var t = this,
			pos = t.stackPosition,
			stack = t.matrixStack,
			matrix = t.matrix;

		if ( pos < stack.length ) {

			mat4.set( matrix, stack[pos] );

		} else {

			stack.push( mat4.create( matrix ) );

		}

		this.stackPosition++;

	},

	popMatrix : function() {

		var pos = --this.stackPosition,
			stack = this.matrixStack;

		if ( !stack.length ) {

			throw "error: popMatrix failed";

		}

		mat4.set( stack[pos], this.matrix );

	},

	passMatrix : function( uniform, matrix ) {

		this.uniformMatrix4fv( uniform, false, matrix || this.matrix );

	},


	enableAlpha : function() {

		var t = this;

		t.enable( t.BLEND );
		t.blendFunc( t.SRC_ALPHA, t.ONE_MINUS_SRC_ALPHA );

	},

	disableAlpha : function() {

		this.disable( this.BLEND );

	},


	initQuad : function() {

		var t = this;

		t.quadAttributeBuffer = t.createBuffer();

		t.bindBuffer( t.ARRAY_BUFFER, t.quadAttributeBuffer );
		t.bufferData( t.ARRAY_BUFFER, 112, t.STATIC_DRAW );

		t.bufferSubData( t.ARRAY_BUFFER, 0, new Float32Array([
			-1, 1, 0,
			-1, -1, 0,
			1, -1, 0,
			1, 1, 0
		]));

		t.bufferSubData( t.ARRAY_BUFFER, 48, new Float32Array([
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
			20.0, 1.0,
			20.0, 0.0
		]));

		t.quadIndexBuffer = t.createBuffer();

		t.bindBuffer( t.ELEMENT_ARRAY_BUFFER, t.quadIndexBuffer );
		t.bufferData( t.ELEMENT_ARRAY_BUFFER, new Uint16Array( [0, 1, 2, 3] ), t.STATIC_DRAW );

	},

	updateQuadTexCoords : function( sections ) {

		var t = this;

		t.bindBuffer( t.ARRAY_BUFFER, t.quadAttributeBuffer );

		t.bufferSubData( t.ARRAY_BUFFER, 48, new Float32Array([
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
			sections, 1.0,
			sections, 0.0
		]));

	},

	drawQuad : function( shader, texOffset ) {

		var t = this;
		texOffset = 48 + ( texOffset || 0 );

		t.bindBuffer( t.ARRAY_BUFFER, t.quadAttributeBuffer );
		t.vertexAttribPointer( shader.positionAttribute, 3, t.FLOAT, false, 0, 0 );
		t.vertexAttribPointer( shader.texCoordAttribute, 2, t.FLOAT, false, 0, texOffset );

		t.bindBuffer( t.ELEMENT_ARRAY_BUFFER, t.quadIndexBuffer );
		t.drawElements( t.TRIANGLE_FAN, 4, t.UNSIGNED_SHORT, 0 );

	},


	fboCount : 0,
	identity : mat4.identity( mat4.create() ),

	initFBO : function( width, height, fbo ) {

		var t = this;

		if ( !fbo ) {

			fbo = t.createFramebuffer();
			fbo.texture = t.createTexture();
			fbo.depthBuffer = t.createRenderbuffer();

			fbo.texture.ID = t.textureCount++;

		}


		fbo.width = width;
		fbo.height = height;


		t.bindTexture( t.TEXTURE_2D, fbo.texture );
		t.texImage2D( t.TEXTURE_2D, 0, t.RGBA, fbo.width, fbo.height, 0, t.RGBA, t.UNSIGNED_BYTE, null );

		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE );
		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE );

		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR );
		t.texParameteri( t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR );


		t.bindRenderbuffer( t.RENDERBUFFER, fbo.depthBuffer );
		t.renderbufferStorage( t.RENDERBUFFER, t.DEPTH_COMPONENT16, fbo.width, fbo.height );


		t.bindFramebuffer( t.FRAMEBUFFER, fbo );
		t.framebufferTexture2D( t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, fbo.texture, 0 );
		t.framebufferRenderbuffer( t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, fbo.depthBuffer );


		t.bindTexture( t.TEXTURE_2D, null );
		t.bindRenderbuffer( t.RENDERBUFFER, null );
		t.bindFramebuffer( t.FRAMEBUFFER, null );

		return fbo;

	},

	bindFBO : function( fbo ) {

		var t = this;

		t.bindFramebuffer( t.FRAMEBUFFER, fbo );
		t.viewport( 0, 0, fbo.width, fbo.height );

		if ( Game.gameover ) {

			t.clear( t.COLOR_BUFFER_BIT | t.DEPTH_BUFFER_BIT );

		} else {

			t.clear( t.COLOR_BUFFER_BIT );

		}

	},

	drawFBO : function( fbo, shader ) {

		var t = this;

		t.bindFramebuffer( t.FRAMEBUFFER, null );

		t.viewport( 0, 0, canvas.width, canvas.height );

		t.passTexture( fbo.texture, shader.textureUniform );

		t.uniformMatrix4fv( shader.mvMatrixUniform, false, t.identity );
		t.uniformMatrix4fv( shader.pMatrixUniform, false, t.identity );

		t.drawQuad( shader );

	}

};
