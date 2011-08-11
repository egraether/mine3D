var Element = function( index, position ) {

	this.index = index;
	this.state = "cube";

	this.position = position;

	this.cube = new Cube( this );
	this.face = new Face( this );

	this.neighbors = [];

	this.value = 0;
	this.isMine = false;
	this.highlight = false;

}

/** states:
  * - cube
  * - number
  * - flag
  * - mine
  * - open
  */

Element.prototype = {

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

		if ( !(--this.value) ) {

			this.state = "open";

		}

	},

	setMine : function() {

		this.isMine = true;

		var i, neighbors = this.neighbors;

		for ( i = 0; i < neighbors.length; i++ ) {

			neighbors[i].increaseValue();

		}

	},

	showMine : function() {

		this.state = "mine";

		this.value = 28;

	},

	draw : function( gl ) {

		var state = this.state;

		gl.pushMatrix();
		mat4.translate(gl.matrix, this.position);

		if ( state == "number" || state == "mine" ) {

			this.face.draw( gl, this.value );

		} else {

			this.cube.draw( gl, this.state == "flag", this.highlight );

		}

		gl.popMatrix();

	},

	open : function() {

		var i,
			neighbors;

		if ( this.state == "cube" ) {

			if ( this.isMine ) {

				Grid.showMines();

			} else if ( this.value ) {

				this.state = "number";

			} else {

				this.state = "open";

				BSPTree.remove( this );

				neighbors = this.neighbors;

				for ( i = 0; i < neighbors.length; i++ ) {

					neighbors[i].open();

				}

			}

		}

	},

	flag : function() {

		if ( this.state == "cube" ) {

			this.state = "flag";

		} else {

			this.state = "cube";

		}

	}

};