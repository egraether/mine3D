var WebGLUtilities = {


	loadShaderScript : function( shaderScriptID ) {

		var shaderScript = document.getElementById( shaderScriptID ),
			shader;

		if ( shaderScript.type === "x-shader/x-fragment" ) {

			shader = this.createShader( this.FRAGMENT_SHADER );

		} else if ( shaderScript.type === "x-shader/x-vertex" ) {

			shader = this.createShader( this.VERTEX_SHADER );

		} else {

			return null;

		}


		this.shaderSource( shader, shaderScript.text );
		this.compileShader( shader );

		if ( !this.getShaderParameter( shader, this.COMPILE_STATUS ) ) {

			console.log( "shader " + this.getShaderInfoLog( shader ) );
			return null;

		}

		return shader;

	},

	linkShaderProgramm : function( vertexShader, fragmentShader ) {

		var shaderProgram = this.createProgram();

		this.attachShader( shaderProgram, vertexShader );
		this.attachShader( shaderProgram, fragmentShader );

		this.linkProgram( shaderProgram );


		if ( !this.getProgramParameter( shaderProgram, this.LINK_STATUS ) ) {

			console.log( "Unable to initialize the shader program." );

		}

		return shaderProgram;

	},

	loadShader : function( vertexShaderID, fragmentShaderID ) {

		var vertexShader = this.loadShaderScript( vertexShaderID ),
			fragmentShader = this.loadShaderScript( fragmentShaderID );

		return this.linkShaderProgramm( vertexShader, fragmentShader );

	},


	textureCount : 0,

	loadTexture : function( imagePath, callback ) {

		var texture = this.createTexture(),
			self = this;

		texture.ID = this.textureCount++;

		texture.image = new Image();

		texture.image.onload = function () {

			self.textureImageLoaded( texture, callback );

		}

		texture.image.src = imagePath;

		return texture;

	},

	textureImageLoaded : function( texture, callback ) {

		this.activeTexture( this["TEXTURE" + texture.ID] );
		this.bindTexture( this.TEXTURE_2D, texture );

		this.pixelStorei( this.UNPACK_FLIP_Y_WEBGL, true );
		this.texImage2D( this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, texture.image );	   

		this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR_MIPMAP_LINEAR );
		this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_LINEAR );	

		this.texParameteri( this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE );
		this.texParameteri( this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE );

		this.generateMipmap( this.TEXTURE_2D );

		this.bindTexture( this.TEXTURE_2D, null );

		if ( callback ) {

			callback( this );

		}

	},


	matrixStack : [],

	pushMatrix : function( matrix ) {

		this.matrixStack.push( mat4.create( matrix ) );

	},

	popMatrix : function() {

		if ( !this.matrixStack.length ) {

			throw "error: popMatrix failed";

		}

		return this.matrixStack.pop();

	},


	enableAlpha : function() {

		this.enable( this.BLEND );
		this.blendFunc( this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA );

	},

	disableAlpha : function() {

		this.disable( this.BLEND );

	}

};