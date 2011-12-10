var Element = function( index, position ) {

	this.index = index;

	this.position = position;
	this.matrix = mat4.translate( mat4.identity( mat4.create() ), position );

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

		this.changeState( 'cube', false ); // [ 'cube', 'number', 'flag', 'open', 'opening' ]

		this.value = this.maxValue;

		this.scale = 1;
		this.rotation = 0;

	},

	changeState : function( state, highlight ) {

		this.highlight = highlight;
		this.state = state;

		this.untouched = ( state === 'cube' && !highlight );

	},

	draw : function( gl ) {

		gl.uniformMatrix4fv( Element.shader.mvMatrixUniform, false, this.matrix );

		if ( this.untouched ) {

			Cube.draw( gl, Element.shader, 0 );

		} else if ( this.state === 'number' && !this.rotation ) {

			Face.draw( gl, Element.shader, this.value );

		} else {

			this.drawSpecial( gl );

		}

	},

	drawSpecial : function( gl ) {

		var state = this.state,
			rotation = this.rotation,
			position = this.position,
			value = this.value,
			matrix = gl.matrix,
			matrixUniform = Element.shader.mvMatrixUniform,
			right = Camera.getRight();
			// distance = vec3.lengthSquared( vec3.subtract( Camera.getEye(), this.position, Cube.vector ) ),
			// scale = 1 - clamp( map( distance, 70, 200, 0, 0.5 ), 0, 0.5 );

		// vec3.assign( Cube.vector, scale );
		// mat4.scale( gl.matrix, Cube.vector );

		if ( state === "number" ) {

			mat4.identity( matrix );
			mat4.translate( matrix, position );

			if ( rotation < -Math.PI / 2 ) {

				mat4.rotate( matrix, rotation + Math.PI, right );
				value++;

			} else {

				mat4.rotate( matrix, rotation, right );

			}

			gl.uniformMatrix4fv( matrixUniform, false, matrix );

			if ( value ) {

				Face.draw( gl, Element.shader, value );

			}

		} else if ( state === 'open' && this.isMine ) {

			if ( useIcosahedron ) {

				Mine.draw( gl, Element.shader );

			} else {

				mat4.identity( matrix );
				mat4.translate( matrix, position );

				mat4.scale( matrix, vec3.assign( Cube.vector, mineSize / numberSize ) );
				gl.uniformMatrix4fv( matrixUniform, false, matrix );

				Face.draw( gl, Element.shader, value );

			}

		// } else if ( state === 'open' ) {
		// 
		// 	Cube.drawLine( gl, Element.shader );

		} else {

			var flag = state === 'flag',
				alphaUniform = Element.shader.alphaUniform,
				stateIndex = flag ? 1 : 0;

			if ( this.scale !== 1 ) {

				mat4.identity( matrix );
				mat4.translate( matrix, position );

				mat4.scale( matrix, vec3.assign( Cube.vector, this.scale ) );
				gl.uniformMatrix4fv( matrixUniform, false, matrix );

			}

			if ( Game.gameover && flag ) {

				stateIndex = this.isMine ? 3 : 2;

			}

			if ( this.highlight ) {

				gl.uniform1f( alphaUniform, mouseOverAlpha );

				Cube.draw( gl, Element.shader, stateIndex );

				gl.uniform1f( alphaUniform, standardAlpha );

			} else {

				Cube.draw( gl, Element.shader, stateIndex );

			}

		}

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

			this.changeState( 'open', this.highlight );

		}

		this.value = 28;

	},

	openCube : function() {

		var tween;

		if ( this.state === "cube" ) {

			this.changeState( 'opening', this.highlight );

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

				this.changeState( 'cube', this.highlight );
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

			this.changeState( 'number', this.highlight );

		} else {

			this.changeState( 'open', this.highlight );

			BSPTree.remove( this );

			this.openNeighbors();

			Camera.recenter = true;

		}

	},

	openMine : function() {

		var tween;

		if ( this.state === "cube" ) {

			if ( Settings.animations ) {

				this.changeState( 'flag', this.highlight );

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 200 );

				tween.onUpdate( function () {

					Grid.redraw = true;

				});

				tween.onComplete( function() {

					this.scale = 1;
					this.changeState( 'opening', this.highlight );
					this.openMineNow();

				});

				tween.start();

			} else {

				this.changeState( 'opening', this.highlight );
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
				Menu.setMines( Grid.minesLeft );

			} else {

				this.changeState( 'cube', this.highlight );
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

			this.changeState( 'flag', this.highlight );
			Grid.minesLeft--;

		} else if ( this.state === 'flag' ) {

			this.changeState( 'cube', this.highlight );
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

				this.changeState( 'number', this.highlight );

			} else {

				BSPTree.remove( this );

				this.changeState( 'open', this.highlight );

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
		Mine.initBuffers( gl );

		this.updateMatrix( gl );

		gl.uniform1f( this.shader.alphaUniform, standardAlpha );

	},

	updateMatrix : function( gl ) {

		// mat4.set( Camera.getMvMatrix(), gl.matrix );

		mat4.multiply( Camera.getPMatrix(), Camera.getMvMatrix(), gl.matrix );
		gl.uniformMatrix4fv( Element.shader.pMatrixUniform, false, gl.matrix );

		mat4.identity( gl.matrix );

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
