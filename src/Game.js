var Game = {

	gameover : false,

	init : function( gl ) {

		Camera.init();

		Cube.init( gl );
		Face.init( gl );

		Grid.init();
		InputHandler.init();

	},

	draw : function( gl ) {

		var redraw = Grid.update();

		if ( Camera.update() ) {

			mat4.set( Camera.getMvMatrix(), gl.matrix );

			if ( Camera.updateRotation ) {

				Camera.updateFaceDirections( gl, Face.vertexArray, Face.vertexBuffer );

			}

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

	over : function( box ) {

		this.gameover = true;

	}

};
