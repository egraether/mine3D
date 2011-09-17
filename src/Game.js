var Game = {

	gameover : false,

	init : function( gl ) {

		Menu.init();

		Camera.init();

		Element.init( gl );
		Grid.init();

		InputHandler.init();

		this.reset();

	},

	draw : function( gl ) {

		var redraw = Grid.update();

		if ( Grid.recenter && Settings.recenter ) {

			Camera.recenterView( Settings.animations );

			Grid.recenter = false;

		}


		if ( Camera.update() || Camera.updateRotation ) {

			mat4.set( Camera.getMvMatrix(), gl.matrix );

			if ( Camera.updateRotation ) {

				Camera.updateFaceDirections( gl, Face.vertices, Face.attributeBuffer );

			}

			Grid.setElementInRay( null );

			redraw = true;

		}

		if ( Camera.updateRay && Grid.getCubeInRay( Camera.getMouseRay() ) ) {

			redraw = true;

		}


		if ( Settings.animations && TWEEN.getAll().length ) {

			TWEEN.update();

			redraw = true;

		}


		if ( redraw ) {

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			Grid.draw( gl );

		}

	},

	reset : function() {

		this.gameover = false;

		Camera.reset();

	},

	start : function() {

		// Grid.start();
		Grid.init();

		this.reset();

	},

	restart : function() {

		Grid.restart();

		this.reset();

	},

	over : function( won ) {

		this.gameover = true;

		Grid.showMines();

		if ( won ) {

			Menu.win();

		} else {

			Menu.lose();

		}

	}

};
