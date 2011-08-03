var Box = function( index, position ) {

	this.index = index;
	this.state = Box.states.cube;

	this.position = position;

	this.cube = new Cube( this );
	this.face = new Face( this );

	this.neighbors = [];

	this.active = true;
	this.isMine = false;

}

Box.states = {
	cube : 0,
	flag : 1,
	number : 2,
	mine : 3
};

Box.prototype = {

	addNeighbor : function( neighbor, reverse ) {

		this.neighbors.push( neighbor );

		if ( reverse ) {

			neighbor.addNeighbor( this, false );

		}

	},

	increaseValue : function() {

		this.value++;

	},

	decreaseValue : function() {

		this.value--;

		if ( this.state == Box.states.number ) {

			this.face.valueChanged( this.value );

		}

	},

	setMine : function() {

		this.isMine = true;

		var i, neighbors = this.neighbors;

		for ( i = 0; i < neighbors.length; i++ ) {

			neighbors[i].increaseValue();

		}

	},

	draw : function( gl ) {

		gl.pushMatrix();
		mat4.translate(gl.matrix, this.position);

		this.cube.draw( gl );

		gl.popMatrix();

	}

};