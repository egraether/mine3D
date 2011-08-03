var Grid = {

	elements : [],

	spacing : 0.1,

	dimensions : vec3.create(),

	mineAmount : 1,
	minesLeft : 0,
	minesSet : false,

	init : function() {

		vec3.assign( this.dimensions, 5, 5, 5 );
		this.mineAmount = 10;

		this.createGrid();
		this.setNeighbors();

	},

	createGrid : function( ) {

		var index = 0,
			elements = this.elements,
			topBorder = true,
			bottomBorder = false,
			rightBorder, leftBorder,
			frontBorder, backBorder,
			k, j, i,
			spacing = this.spacing,
			position = vec3.create(),
			dim = this.dimensions;
	
		position[2] = ( dim[2] - 1 ) * ( 1 + spacing ) / 2;

		for ( k = dim[2] - 1; k >= 0; k-- ) {

			if ( k == 0 ) {

				bottomBorder = true;

			}

			rightBorder = true;
			leftBorder = false;

			position[1] = ( dim[1] - 1 ) * ( 1 + spacing ) / 2;

			for ( j = dim[1] - 1; j >= 0; j-- ) {
			
				if (j == 0) {

					leftBorder = true;

				}

				frontBorder = true;
				backBorder = false;

				position[0] = ( dim[0] - 1 ) * ( 1 + spacing ) / 2;

				for ( i = dim[0] - 1; i >= 0; i-- ) {

					if (i == 0) {

						backBorder = true;

					}

					elements.push( new Box(
						index,
						vec3.create( position )
					) );

					index++;

					position[0] -= 1 + spacing;
					frontBorder = false;

				}

				position[1] -= 1 + spacing;
				rightBorder = false;

			}

			position[2] -= 1 + spacing;
			topBorder = false;

		}

	},

	setNeighbors : function() {

		var index = 0,
			elements = this.elements,
			topBorder = true,
			bottomBorder = false,
			frontBorder, backBorder, 
			rightBorder, leftBorder,
			k, j, i,
			dim = this.dimensions,
			box;

		for ( k = dim[2] - 1; k >= 0; k-- ) {

			if ( k == 0 ) {

				bottomBorder = true;

			}

			frontBorder = true;

			for ( j = dim[1] - 1; j >= 0; j-- ) {

				backBorder = ( j == 0 ? true : false );

				for ( i = dim[0] - 1; i >= 0; i-- ) {

					leftBorder = ( i == 0 ? true : false );

					box = elements[index];

					if ( !leftBorder ) {

						box.addNeighbor( elements[index + 1], true );

						if ( !backBorder ) {

							box.addNeighbor( elements[index + 1 + dim[0]], true );

							if ( !topBorder ) {

								box.addNeighbor( elements[index + 1 + dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !frontBorder ) {

							box.addNeighbor( elements[index + 1 - dim[0]], true );

							if ( !topBorder ) {

								box.addNeighbor( elements[index + 1 - dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !topBorder ) {

							box.addNeighbor( elements[index + 1 - dim[0] * dim[1]], true );

						}

					}

					if ( !backBorder ) {

						box.addNeighbor( elements[index + dim[0]], true );

						if (!topBorder) {

							box.addNeighbor( elements[index + dim[0] - dim[0] * dim[1]], true);

						}

					}

					if ( !bottomBorder ) {

						box.addNeighbor( elements[index + dim[0] * dim[1]], true );

						if ( !leftBorder ) {

							box.addNeighbor( elements[index + 1 + dim[0] * dim[1]], true );

							if ( !backBorder ) {

								box.addNeighbor( elements[index + 1 + dim[0] + dim[0] * dim[1]], true );

							}

							if ( !frontBorder ) {

								box.addNeighbor( elements[index + 1 - dim[0] + dim[0] * dim[1]], true );

							}

						}

						if ( !backBorder ) {

							box.addNeighbor( elements[index + dim[0] + dim[0] * dim[1]], true );

						}

					}

					index++;

				}

				frontBorder = false;

			}

			topBorder = false;

		}

	},

	removeBox : function( box ) {

		this.elements[box.index] = null;
		box.active = false;

	},

	setMines : function( box ) {

		var i, counter = 1,
			neighbors = box.neighbors,
			dim = this.dimensions,
			boxAmount = dim[0] * dim[1] * dim[2],
			mines = this.mineAmount,
			box;

		this.removeBox( box );

		for ( i = 0; i < neighbors.length; i++ ) {

			this.removeBox( neighbors[i] );
			counter++;

		}


		var boxesLeft = boxAmount - counter;

		if ( boxesLeft < 0 ) {

			mines = 0;

		} else if ( boxesLeft < mines ) {

			mines = boxesLeft;

		}

		this.mineAmount = mines;
		this.minesLeft = mines;


		while ( mines ) {

			box = elements[Math.floor( Math.random() * boxAmount )];

			if ( box && !box.isMine ) {

				box.setMine();
				mines--;

			}

		}

		this.minesSet = true;

	},

	draw : function(gl) {

		var i, elements = this.elements;

		for ( i = 0; i < elements.length; i++ ) {

			elements[i].draw( gl );

		}

	}

};
