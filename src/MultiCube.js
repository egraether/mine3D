var MultiCube = {

	drawDouble : function( gl, shader, direction, position ) {

		vec3.assign( Cube.vector, 1 );
		Cube.vector[direction] = 2 + cubeSpacing;

		this.draw( gl, shader, position );

	},

	drawQuad : function( gl, shader, direction, direction2, position ) {

		vec3.assign( Cube.vector, 1 );
		Cube.vector[direction] = 2 + cubeSpacing;
		Cube.vector[direction2] = 2 + cubeSpacing;

		this.draw( gl, shader, position );

	},

	drawOct : function( gl, shader, position ) {

		vec3.assign( Cube.vector, 2 + cubeSpacing );

		this.draw( gl, shader, position );

	},

	draw : function( gl, shader, position ) {

		var matrix = gl.matrix;

		mat4.identity( matrix );
		mat4.translate( matrix, position );

		mat4.scale( matrix, Cube.vector );
		gl.uniformMatrix4fv( shader.mvMatrixUniform, false, matrix );

		Cube.draw( gl, shader, 0 );

	},

	initBuffers : function( gl ) {



	}

};
