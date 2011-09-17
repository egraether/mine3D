var Game = {

	gameover : false,

	init : function( gl ) {

		Settings.init();
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

			Camera.recenterView();

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

		if ( redraw ) {

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			Grid.draw( gl );

		}

	},

	reset : function() {

		this.gameover = false;

	},

	start : function() {

		this.reset();

		Grid.start();

	},

	restart : function() {

		this.reset();

		Grid.restart();

	},

	over : function( box ) {

		this.gameover = true;

		Grid.showMines();

	}

};
