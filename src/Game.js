var Game = {

	init : function( gl ) {

		Cube.init( gl );
		Grid.init( gl );

		Camera.init( gl );
		gl.uniformMatrix4fv( Cube.shader.pMatrixUniform, false, Camera.pMatrix );

	},

	draw : function( gl ) {

		gl.matrix = Camera.mvMatrix;

		Grid.draw( gl );

	}

};
