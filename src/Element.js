var Element = function( index, position ) {

	this.index = index;
	this.position = position;

	this.cube = new Cube( this );
	this.neighbors = [];

	this.reset();

};

Element.prototype = {

	reset : function() {

		this.maxValue = 0;
		this.isMine = false;

		this.restart();

	},

	restart : function() {

		this.state = "cube"; // [ 'cube', 'number', 'flag', 'open', 'opening' ]

		this.value = this.maxValue;

		this.scale = 1;
		this.rotation = 0;

		this.highlight = false;

	},

	addNeighbor : function( neighbor, reverse ) {

		this.neighbors.push( neighbor );

		if ( reverse ) {

			neighbor.addNeighbor( this, false );

		}

	},

	increaseValue : function() {

		this.value++;
		this.maxValue++;

	},

	decreaseValue : function() {

		var tween;

		this.value--;

		if ( Settings.animations ) {

			this.rotation = -Math.PI;

			tween = new TWEEN.Tween( this );

			tween.to( { rotation : 0 }, 250 );

			tween.onComplete( this.valueDecreased );

			tween.start();

		} else {

			this.valueDecreased();

		}

	},

	valueDecreased : function() {

		if ( this.value === 0 && this.state !== 'cube' ) {

			this.open();

		}

	},

	setMine : function() {

		this.isMine = true;

		var i, neighbors = this.neighbors;

		for ( i = 0; i < neighbors.length; i++ ) {

			neighbors[i].increaseValue();

		}

	},

	showMine : function() {

		if ( this.state !== 'flag' ) {

			this.state = 'open';

		}

		this.value = 28;

	},

	draw : function( gl ) {

		var state = this.state,
			rotation = this.rotation,
			value = this.value,
			right;

		gl.pushMatrix();
		mat4.translate( gl.matrix, this.position );

		if ( state === "number" || ( state === 'open' && this.isMine ) ) {

			if ( rotation ) {

				right = Camera.getRight();

				if ( rotation < -Math.PI / 2 ) {

					mat4.rotate( gl.matrix, rotation + Math.PI, right );
					value++;

				} else {

					mat4.rotate( gl.matrix, rotation, right );

				}

			}

			if ( value ) {

				Face.draw( gl, Element.shader, value );

			}

		} else {

			Cube.draw( gl, Element.shader, this.isMine, state === "flag", this.highlight, this.scale );

		}

		gl.popMatrix();

	},

	openCube : function() {

		var tween;

		if ( this.state === "cube" ) {

			this.state = 'opening';

			if ( Settings.animations ) {

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 150 );

				tween.onUpdate( function () {

					Grid.redraw = true;

				});

				tween.onComplete( function() {

					this.scale = 1;
					this.openCubeNow();

				});

				tween.start();

			} else {

				this.openCubeNow();

			}

		}

	},

	openCubeNow : function() {

		if ( this.state === 'opening' ) {

			if ( this.isMine ) {

				this.state = 'cube';
				return Game.over();

			} else {

				this.open();

			}

		}

	},

	open : function() {

		if ( this.state === 'open' ) {

			return;

		}


		if ( this.state === 'opening' ) {

			Grid.cubeCount--;

		}


		if ( this.value ) {

			this.state = "number";

		} else {

			this.state = "open";

			BSPTree.remove( this );

			this.openNeighbors();

			Camera.recenter = true;

		}

	},

	openMine : function() {

		var tween;

		if ( this.state === "cube" ) {

			if ( Settings.animations ) {

				this.state = 'flag';

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 200 );

				tween.onUpdate( function () {

					Grid.redraw = true;

				});

				tween.onComplete( function() {

					this.scale = 1;
					this.state = 'opening';
					this.openMineNow();

				});

				tween.start();

			} else {

				this.state = 'opening';
				this.openMineNow();

			}

		}

	},

	openMineNow : function() {

		var i,
			neighbors;

		if ( this.state === 'opening' ) {

			if ( this.isMine ) {

				this.open();

				neighbors = this.neighbors;

				for ( i = 0; i < neighbors.length; i++ ) {

					neighbors[i].decreaseValue();

				}

				Grid.minesLeft--;

			} else {

				this.state = 'cube';
				Game.over();

			}

		}

	},

	openNeighbors : function() {

		var i = 0,
			neighbors = this.neighbors;

		do {

			neighbors[i].openCube();

		} while ( ++i < neighbors.length );

	},


	flag : function() {

		if ( this.state === 'cube' ) {

			this.state = 'flag';
			Grid.minesLeft--;

		} else if ( this.state === 'flag' ) {

			this.state = 'cube';
			Grid.minesLeft++;

		}

	},

	remove : function( element ) {

		if ( this.index === element.index ) {

			return 0;

		} else {

			console.log("wtf");
			throw "wtf";

		}

	},

	count : function() {

		return 1;

	},

	getCenter : function( highVector, lowVector ) {

		var i,
			pos = this.position;

		for ( i = 0; i < 3; i++ ) {

			highVector[i] = pos[i] > highVector[i] ? pos[i] : highVector[i];
			lowVector[i] = pos[i] < lowVector[i] ? pos[i] : lowVector[i];

		}

	},

	getVisionSize : function( center, vector ) {

		return vec3.lengthSquared( vec3.subtract( this.position, center, vector ) );

	},

	solve : function() {

		if ( this.state === "cube" && !this.isMine ) {

			if ( this.value ) {

				this.state = "number";

			} else {

				BSPTree.remove( this );

				this.state = "open";

			}

			Grid.cubeCount--;

		}

	},

	print : function( str ) {

		str += "    ";

		console.log( str + vec3.str( this.position ) );

	}

};

extend( Element, {

	init : function( gl ) {

		this.initShader( gl );

		this.initTextures( gl );

		Cube.initBuffers( gl );
		Face.initBuffers( gl );

		this.resize( gl );

		gl.uniform1f( this.shader.alphaUniform, standardAlpha );

	},

	resize : function( gl ) {

		gl.uniformMatrix4fv( this.shader.pMatrixUniform, false, Camera.getPMatrix() );

	},

	initShader : function( gl ) {

		var shader = gl.loadShader( "vertex-shader", "fragment-shader" );
		gl.useProgram(shader);

		shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		shader.textureUniform = gl.getUniformLocation( shader, "uTexture" );
		shader.alphaUniform = gl.getUniformLocation( shader, "uAlpha" );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.colorAttribute = gl.getAttribLocation( shader, "aColor" );
		gl.enableVertexAttribArray( shader.colorAttribute );
		
		shader.texCoordAttribute = gl.getAttribLocation( shader, "aTextureCoord" );
		gl.enableVertexAttribArray( shader.texCoordAttribute );

		this.shader = shader;

	},

	initTextures : function( gl ) {

		this.texture = gl.loadTexture( texturePath, useTextureFiltering, function( gl, texture ) {

			gl.passTexture( texture, Element.shader.textureUniform );
			Grid.redraw = true;

		});

	}

});
