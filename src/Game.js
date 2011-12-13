var Game = {

	gameover : false,
	framesSinceDraw : 0,

	fboMin : null,
	fboMed : null,
	fboMax : null,

	init : function( gl ) {

		Settings.init();

		Stats.init();
		Stats.loadSettings();

		Menu.init();

		Camera.init();

		Element.init( gl );
		Grid.init();

		// moved to Menu.showHUD()
		// EventHandler.init();

		if ( useSmoothing ) {

			this.fboMin = gl.initFBO( width * fboMinScale, height * fboMinScale );
			this.fboMed = gl.initFBO( width * fboMedScale, height * fboMedScale );
			this.fboMax = gl.initFBO( width * fboMaxScale, height * fboMaxScale );

		}

		this.reset();

	},

	draw : function( gl ) {

		var redraw = false;

		if ( Settings.animations && TWEEN.getAll().length ) {

			if ( Grid.leftClicked || Grid.rightClicked ) {

				TWEEN.completeAll();

				// Grid.leftClicked = Grid.rightClicked = false;

			} else {

				TWEEN.update();

			}

			redraw = true;

		}


		Grid.update();


		if ( Camera.update() ) {

			Element.updateMatrix( gl );

			if ( Camera.updateRotation ) {

				Camera.updateFaceDirections( gl, Face.vertices, Face.attributeBuffer );

			}

			Grid.setElementInRay( null );

			redraw = true;

		}

		if ( Camera.updateRay ) {

			Grid.getCubeInRay( Camera.getMouseRay() );

		}


		if ( Grid.redraw || redraw ) {

			if ( useSmoothing ) {

				this.drawWithFBO( gl, this.fboMin );

			} else {

				if ( this.gameover ) {

					gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				} else {

					gl.clear( gl.COLOR_BUFFER_BIT );

				}

				Grid.draw( gl );

			}

			this.framesSinceDraw = 0;

		} else if ( useSmoothing && this.framesSinceDraw === 20 ) {

			this.drawWithFBO( gl, this.fboMed );

		} else if ( useSmoothing && this.framesSinceDraw === 40 ) {

			this.drawWithFBO( gl, this.fboMax );

		}

		this.framesSinceDraw++;

	},

	drawWithFBO : function( gl, fbo ) {

		if ( this.gameover ) {

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		} else {

			gl.clear( gl.COLOR_BUFFER_BIT );

		}

		gl.bindFBO( fbo );

		Grid.draw( gl );

		gl.drawFBO( fbo, Element.shader );

		gl.passTexture( Element.texture, Element.shader.textureUniform );
		Element.updateMatrix( gl );

	},

	reset : function() {

		this.gameover = false;

		TWEEN.removeAll();

		Camera.reset();

	},

	start : function( resize ) {

		this.saveStats( Grid.playTime, false );

		if ( resize ) {

			Grid.init();

		} else {

			Grid.start();

		}

		this.reset();

	},

	restart : function() {

		this.saveStats( Grid.playTime, false );

		Grid.restart();

		this.reset();

	},

	over : function( won ) {

		var name = Settings.getKey();

		this.saveStats( Grid.playTime, won );

		this.gameover = true;

		Grid.showMines();

		if ( won ) {

			if ( Settings.currentLevel.name !== 'custom' && 
				Stats.updateScores( name, Grid.playTime ) ) {

				Menu.showScores( name );

			}

			Menu.win();

		} else {

			Menu.lose();

		}

	},

	saveStats : function( time, won ) {

		if ( !this.gameover && Grid.started ) {

			Stats.updateStats( time, won );
			Menu.updateStats();

		}

	}

};
