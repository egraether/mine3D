var Game = {

	gameover : false,

	init : function( gl ) {

		Settings.init();
		Camera.init();

		Element.init( gl );
		Grid.init();

		InputHandler.init();

	},

	draw : function( gl ) {

		var redraw = Grid.update();

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

	start : function() {

		Grid.start();

	},

	restart : function() {

		Grid.restart();

	},

	over : function( box ) {

		this.gameover = true;

	}

};
