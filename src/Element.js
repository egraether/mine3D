var Element = function( index, position ) {

	this.parent = null;
	this.index = index;

	this.position = position;
	this.matrix = mat4.translate( mat4.identity( mat4.create() ), position );

	this.offset = vec3.create();
	this.vector = vec3.create();

	this.cube = new Cube( this );
	this.neighbors = [];

	this.reset();

};

Element.prototype = {

	reset : function( center ) {

		this.maxValue = 0;
		this.isMine = false;

		this.untouched = true;
		this.animated = false;

		if ( Settings.animations ) {

			vec3.zero( Element.vector );

			if ( center ) {

				vec3.subtract( center, this.position, Element.vector );

			}

			this.scale = 0;
			this.changeState( 'cube', false, true );

			tween = new TWEEN.Tween( this );

			tween.to( { scale : 1 }, 200 );

			tween.easing( TWEEN.Easing.Back.EaseOut );

			tween.delay( vec3.length( Element.vector ) * ( 70 + Math.random() * 30 ) );

			tween.onUpdate( Grid.forceRedraw );

			tween.onComplete( this.restart );

			tween.start();

		} else {

			this.restart();

		}

	},

	restart : function() {

		this.changeState( 'cube' ); // [ 'cube', 'number', 'flag', 'flagopen', 'open', 'opening' ]

		this.value = this.maxValue;

		this.scale = 1;
		this.rotation = 0;

	},

	changeState : function( state, highlight, animated ) {

		var untouched = ( state === 'cube' && !highlight && !animated );

		this.highlight = highlight;
		this.animated = animated;
		this.state = state;

		if ( this.untouched !== untouched ) {

			this.untouched = untouched;

			if ( this.parent ) {

				if ( this.untouched ) {

					this.parent.untouch();

				} else {

					this.parent.touch();

				}

			}

		}

	},

	draw : function( gl ) {

		var shader = Element.shader;

		if ( this.animated ) {

			mat4.identity( gl.matrix );
			mat4.translate( gl.matrix, this.offset );
			gl.uniformMatrix4fv( shader.mvMatrixUniform, false, gl.matrix );

		} else {

			gl.uniformMatrix4fv( shader.mvMatrixUniform, false, this.matrix );

		}

		if ( this.untouched ) {

			Cube.draw( gl, shader, 0 );

		} else if ( this.state === 'number' && !this.rotation ) {

			Face.draw( gl, shader, this.value );

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
			shader = Element.shader,
			matrixUniform = shader.mvMatrixUniform,
			right = Camera.getRight();

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

				Face.draw( gl, shader, value );

			}

		} else if ( state === 'open' && this.isMine ) {

			if ( useIcosahedron ) {

				Icosahedron.draw( gl, shader );

			} else {

				mat4.identity( matrix );
				mat4.translate( matrix, position );

				mat4.scale( matrix, vec3.assign( Cube.vector, mineSize / numberSize ) );
				gl.uniformMatrix4fv( matrixUniform, false, matrix );

				Face.draw( gl, shader, value );

			}

		} else {

			var alphaUniform = shader.alphaUniform,
				stateIndex = state === 'flag' ? 1 : 0;

			if ( this.scale !== 1 ) {

				mat4.identity( matrix );
				mat4.translate( matrix, position );

				mat4.scale( matrix, vec3.assign( Cube.vector, this.scale ) );
				gl.uniformMatrix4fv( matrixUniform, false, matrix );

			}

			if ( state === 'flagopen' ) {

				stateIndex = this.isMine ? 3 : 2;

			}

			if ( this.highlight ) {

				gl.uniform1f( alphaUniform, mouseOverAlpha );

				Cube.draw( gl, shader, stateIndex );

				gl.uniform1f( alphaUniform, cubeAlpha );

			} else {

				Cube.draw( gl, shader, stateIndex );

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

	showMine : function( won, element ) {

		var vec = this.vector,
			self = this;

		if ( Settings.animations && !won && this.index !== element.index ) {

			vec3.subtract( this.position, element.position, vec );

			tween = new TWEEN.Tween( this );
			tween.to( null, 0 );

			tween.delay( vec3.length( vec ) * 50 - 50 * Math.random() );

			vec3.normalize( vec );
			vec3.scale( vec, 0.5 * ( element.isMine ? 1 : -1 ) );

			vec3.set( this.position, this.offset );

			tween.onComplete( function() {

				self.showMineNow();

				self.changeState( self.state, self.highlight, true );

				self.moveTo( vec, 150, TWEEN.Easing.Cubic.EaseOut, function() {

					self.moveTo( vec3.scale( vec, -1 ), 250, TWEEN.Easing.Cubic.EaseIn, function() {

						self.changeState( self.state, self.highlight );

					});

				});

			});

			tween.start();

		} else {

			this.showMineNow();

		}

	},

	showMineNow : function() {

		if ( ( this.state === 'cube' ) && this.isMine ) {

			this.changeState( 'open', this.highlight );

			this.value = 28;

			// this.openCube();

		} else if ( this.state === 'flag' ) {

			this.changeState( 'flagopen', this.highlight );

		}

	},

	moveTo : function( position, time, easing, onComplete ) {

		var pos = this.offset;

		tween = new TWEEN.Tween( pos );

		tween.to( { 
			0 : pos[0] + position[0],
			1 : pos[1] + position[1],
			2 : pos[2] + position[2]
		}, time );

		tween.easing( easing );

		tween.onUpdate( Grid.forceRedraw );

		tween.onComplete( onComplete );

		tween.start();

	},

	openCube : function() {

		var tween;

		if ( this.state === "cube" ) {

			this.changeState( 'opening', this.highlight );

			if ( Settings.animations ) {

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 150 );

				tween.delay( Math.random() * 100 );

				tween.onUpdate( Grid.forceRedraw );

				tween.onComplete( this.openCubeNow );

				tween.start();

			} else {

				this.openCubeNow();

			}

		}

	},

	openCubeNow : function() {

		this.scale = 1;

		if ( this.state === 'opening' ) {

			if ( this.isMine ) {

				// if ( Game.gameover ) {
				// 
				// 	this.changeState( 'open', this.highlight );
				// 
				// } else {

					this.changeState( 'cube', this.highlight );
					Game.over( false, this );

				// }

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
			Grid.remove( this );

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

				tween.onUpdate( Grid.forceRedraw );

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

			this.open();

			if ( this.isMine ) {

				neighbors = this.neighbors;

				for ( i = 0; i < neighbors.length; i++ ) {

					neighbors[i].decreaseValue();

				}

				Grid.minesLeft--;
				Menu.setMines( Grid.minesLeft );

			} else {

				Game.over( false, this );

			}

		}

	},

	openNeighbors : function() {

		var i,
			neighbors = this.neighbors;

		for ( i = 0; i < neighbors.length; i++ ) {

			neighbors[i].openCube();

		}

	},


	flag : function() {

		if ( this.state === 'cube' ) {

			this.changeState( 'flag', this.highlight );
			Grid.minesLeft--;

		} else if ( this.state === 'flag' ) {

			this.changeState( 'cube', this.highlight );
			Grid.minesLeft++;

		}

		Menu.setMines( Grid.minesLeft );

	},

	remove : function( element ) {

		if ( this.index === element.index ) {

			return 0;

		} else {

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
				Grid.remove( this );

				this.changeState( 'open', this.highlight );

			}

			Grid.cubeCount--;

		}

	},

	print : function( str ) {

		str += "  ";

		// console.log( str + vec3.str( this.position ) );
		console.log( str + this.untouched );

	}

};

extend( Element, {

	vector : vec3.create(),

	init : function( gl ) {

		this.initShader( gl );

		this.initTextures( gl );

		Cube.initBuffers( gl );
		Face.initBuffers( gl );
		Icosahedron.initBuffers( gl );

		this.updateMatrix( gl );

		gl.uniform1f( this.shader.alphaUniform, cubeAlpha );

	},

	updateMatrix : function( gl ) {

		mat4.multiply( Camera.getPMatrix(), Camera.getMvMatrix(), gl.matrix );
		gl.uniformMatrix4fv( Element.shader.pMatrixUniform, false, gl.matrix );

		mat4.identity( gl.matrix );

	},

	initShader : function( gl ) {

		var shader = gl.loadShader( "vertex-shader", "fragment-shader" );
		gl.useProgram( shader );

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
