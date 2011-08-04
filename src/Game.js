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

		var redraw = false;

		if ( !this.gameover ) {

			redraw = Grid.update();

		}

		if ( Camera.updatedRay ) {

			redraw = Grid.getCubeInRay( Camera.getMouseRay() );

		}

		if ( Camera.updatedMatrix ) {

			mat4.set( Camera.getMvMatrix(), gl.matrix );
			Camera.updateFaceDirections( gl, Face.vertexArray, Face.vertexBuffer );

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
