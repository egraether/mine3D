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

		// this.fboMin = gl.initFBO( canvas.width * fboMinScale, canvas.height * fboMinScale );
		// this.fboMed = gl.initFBO( canvas.width * fboMedScale, canvas.height * fboMedScale );
		// this.fboMax = gl.initFBO( canvas.width * fboMaxScale, canvas.height * fboMaxScale );

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

			// this.drawWithFBO( gl, this.fboMin );

			// if ( useSmoothing ) {
			// 
			// 	this.drawWithFBO( gl, this.fboMin );
			// 
			// } else {
			// 
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				Grid.draw( gl );

			// 
			// }

			framesSinceDraw = 0;

		}
		framesSinceDraw = 0;

		if ( framesSinceDraw === 20 ) {

			this.drawWithFBO( gl, this.fboMed );

		} else if ( framesSinceDraw === 40 ) {

			this.drawWithFBO( gl, this.fboMax );

		}

		framesSinceDraw++;

	},

	drawWithFBO : function( gl, fbo ) {

		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		gl.bindFBO( fbo );

		Grid.draw( gl );

		gl.drawFBO( fbo, Element.shader );

		gl.passTexture( Element.texture, Element.shader.textureUniform );
		gl.uniformMatrix4fv( Element.shader.pMatrixUniform, false, Camera.getPMatrix() );

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

			if ( Stats.updateScores( name, Grid.playTime ) ) {

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
