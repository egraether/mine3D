var Game = {

	init : function( gl ) {

		Cube.init( gl );
		Grid.init( gl );

		Camera.init( gl );
		gl.uniformMatrix4fv( Cube.shader.pMatrixUniform, false, Camera.pMatrix );

		InputHandler.init();

	},

	draw : function( gl ) {

		if ( Camera.update ) {

			gl.matrix = Camera.getMvMatrix();

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			Grid.draw( gl );

		}

	}

};
