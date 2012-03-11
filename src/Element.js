var Element = function( index, position ) {

	this.parent = null;
	this.index = index;

	this.position = position;
	this.matrix = mat4.translate( mat4.identity( mat4.create() ), position );

	this.offset = vec3.create();
	this.vector = vec3.create();

	this.cube = new Cube( this );
	this.neighbors = [];

};

Element.prototype = {

	start : function( center ) {

		this.maxValue = 0;
		this.isMine = false;

		this.restart( center );

	},

	restart : function( center ) {

		var vec = this.vector;

		this.value = this.maxValue;

		this.untouched = true;

		this.flagged = false;
		this.highlight = false;

		this.opening = false;
		this.moving = false;

		this.rotation = 0;
		this.scale = 1;

		this.changeState( 'cube' ); // [ 'cube', 'number', 'mine', 'open' ]

		if ( Settings.animations ) {

			vec3.zero( vec );

			if ( center ) {

				vec3.subtract( center, this.position, vec );

			}

			this.scale = 0;
			this.adjustState();

			tween = new TWEEN.Tween( this );

			tween.to( { scale : 1 }, 200 );

			tween.easing( TWEEN.Easing.Back.EaseOut );

			tween.delay( vec3.length( vec ) * ( 70 + Math.random() * 30 ) );

			tween.onUpdate( Grid.forceRedraw );

			tween.onComplete( this.adjustState );

			tween.start();

		}

	},

	changeState : function( state ) {

		this.state = state;

		this.adjustState();

	},

	adjustState : function() {

		var modified = this.highlight || this.rotation || this.scale !== 1 || this.moving || this.flagged;

		if ( this.untouched !== ( this.state === 'cube' && !modified ) ) {

			this.untouched = !this.untouched;

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

		var shader = Element.shader,
			state = this.state;

		if ( this.untouched ) {

			gl.uniformMatrix4fv( shader.mvMatrixUniform, false, this.matrix );
			Cube.draw( gl, shader, 0 );

		} else if ( state === 'number' ) {

			this.drawNumber( gl, shader );

		} else if ( state === 'cube' ) {

			this.drawCube( gl, shader );

		} else if ( state === 'mine' ) {

			this.drawMine( gl, shader );

		}

	},

	drawCube : function( gl, shader ) {

		var alphaUniform = shader.alphaUniform,
			matrix = gl.matrix,
			scale = this.scale,
			stateIndex = this.flagged ? 1 : 0;


		if ( !scale ) {

			return;

		} else if ( scale !== 1 ) {

			mat4.identity( matrix );
			mat4.translate( matrix, this.position );

			mat4.scale( matrix, vec3.assign( Element.vector, scale ) );

		} else if ( this.moving ) {

			mat4.identity( matrix );
			mat4.translate( matrix, this.offset );

		} else {

			matrix = this.matrix;

		}

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );


		if ( this.flagged && this.opening ) {

			stateIndex = this.isMine ? 3 : 2;

		}

		if ( this.highlight ) {

			gl.uniform1f( alphaUniform, hoverAlpha );

			Cube.draw( gl, shader, stateIndex );

			gl.uniform1f( alphaUniform, mainAlpha );

		} else {

			Cube.draw( gl, shader, stateIndex );

		}

	},

	drawNumber : function( gl, shader ) {

		var matrix = gl.matrix,
			rotation = this.rotation,
			value = this.value,
			right;

		if ( this.moving ) {

			mat4.identity( matrix );
			mat4.translate( matrix, this.offset );

		} else if ( !rotation ) {

			matrix = this.matrix;

		} else {

			right = Camera.getRight();

			mat4.identity( matrix );
			mat4.translate( matrix, this.position );

			if ( rotation < -Math.PI / 2 ) {

				mat4.rotate( matrix, rotation + Math.PI, right );
				value++;

			} else {

				mat4.rotate( matrix, rotation, right );

			}

		}

		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );

		if ( value ) {

			if ( invertedNumbers ) {

				// value = this.neighbors.length - value;
				value = 27 - value;

			}

			Face.draw( gl, shader, value );

		}

	},

	drawMine : function( gl, shader ) {

		var matrix = gl.matrix,
			matrixUniform = shader.mvMatrixUniform;

		if ( this.moving ) {

			mat4.identity( matrix );
			mat4.translate( matrix, this.offset );

		} else {

			matrix = this.matrix;

		}

		if ( useIcosahedron ) {

			gl.uniformMatrix4fv( matrixUniform, false, matrix );
			Icosahedron.draw( gl, shader );

		} else {

			matrix = mat4.set( matrix, gl.matrix );

			mat4.scale( matrix, vec3.assign( Cube.vector, mineSize / numberSize ) );
			gl.uniformMatrix4fv( matrixUniform, false, matrix );

			Face.draw( gl, shader, 28 );

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

				self.moveTo( vec, 150, TWEEN.Easing.Cubic.EaseOut, function() {

					self.moveTo( vec3.scale( vec, -1 ), 250, TWEEN.Easing.Cubic.EaseIn, function() {

						self.moving = false;
						self.adjustState();

					});

				});

			});

			tween.start();

		} else {

			this.showMineNow();

		}

	},

	showMineNow : function() {

		if ( ( this.state === 'cube' ) ) {

			if ( this.flagged ) {

				this.opening = true;

			} else if ( this.isMine ) {

				this.changeState( 'mine' );

			}

		}

	},

	moveTo : function( position, time, easing, onComplete ) {

		var pos = this.offset;

		this.moving = true;
		this.adjustState();

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

	openCube : function( noDelay ) {

		var tween;

		if ( this.state === "cube" && !this.flagged && !this.opening ) {

			this.opening = true;

			if ( Settings.animations ) {

				this.scale = 0.99;
				this.adjustState();

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 150 );

				if ( !noDelay ) {

					tween.delay( Math.random() * 100 );

				}

				tween.easing( TWEEN.Easing.Quadratic.EaseOut );

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

		if ( this.isMine ) {

			Game.over( false, this );

		} else {

			this.open();

		}

	},

	open : function() {

		if ( this.state === 'open' ) {

			return;

		} else if ( this.state === 'cube' ) {

			Grid.cubeCount--;

		}


		if ( this.value ) {

			this.changeState( 'number' );

		} else {

			this.changeState( 'open' );

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

				this.flagged = true;
				this.adjustState();

				tween = new TWEEN.Tween( this );

				tween.to( { scale : 0 }, 200 );

				tween.onUpdate( Grid.forceRedraw );

				tween.onComplete( this.openMineNow );

				tween.start();

			} else {

				this.openMineNow();

			}

		}

	},

	openMineNow : function() {

		var i,
			neighbors;

		this.scale = 1;

		if ( this.state === 'cube' ) {

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

		this.flagged = !this.flagged;

		this.adjustState();


		Grid.minesLeft += this.flagged ? -1 : 1;

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

				this.changeState( 'number' );

			} else {

				BSPTree.remove( this );
				Grid.remove( this );

				this.changeState( 'open' );

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

		gl.uniform1f( this.shader.alphaUniform, mainAlpha );

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
