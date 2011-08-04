var Box = function( index, position ) {

	this.index = index;
	this.state = "cube";

	this.position = position;

	this.cube = new Cube( this );
	this.face = new Face( this );

	this.neighbors = [];

	this.value = 0;
	this.isMine = false;

}

/** states:
  * - cube
  * - number
  * - flag
  * - mine
  * - open
  */

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

		if ( this.state == "number" ) {

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

		if ( this.state == "cube" ) {

			gl.pushMatrix();
			mat4.translate(gl.matrix, this.position);

			this.cube.draw( gl );

			gl.popMatrix();

		}

	},

	open : function() {

		var i,
			neighbors;

		if ( this.state == "cube" ) {

			if ( this.isMine ) {

				Game.over( this );

			} else if ( this.value ) {

				this.state = "number";

			} else {

				this.state = "open";

				neighbors = this.neighbors;

				for ( i = 0; i < neighbors.length; i++ ) {

					neighbors[i].open();

				}

			}

		}

	}

};