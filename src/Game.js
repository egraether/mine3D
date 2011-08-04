var Game = {

	init : function( gl ) {

		Cube.init( gl );
		Grid.init( gl );

		Camera.init( gl );
		gl.uniformMatrix4fv( Cube.shader.pMatrixUniform, false, Camera.getPMatrix() );

		InputHandler.init();

	},

	draw : function( gl ) {

		var redraw = Grid.update();

		if ( Camera.updatedRay ) {

			redraw = Grid.getCubeInRay( Camera.getMouseRay() );

		}

		if ( Camera.updatedMatrix ) {

			gl.matrix = Camera.getMvMatrix();

			redraw = true;

		}

		if ( redraw ) {

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			Grid.draw( gl );

		}

	}

};
