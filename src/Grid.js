var Grid = {

	elements : [],
	cubeCount : 0,

	spacing : 0.1,

	minesLeft : 0,
	minesSet : false,

	leftClicked : false,
	rightClicked : false,

	redraw : true,
	recenter : true,

	time : 0,


	init : function() {

		this.elements = [];

		Settings.setFromMenu();

		this.createGrid();
		this.setNeighbors();

		this.reset();

	},

	reset : function() {

		BSPTree.createPartition( this.elements.concat() );

		this.cubeCount = this.elements.length;

		this.redraw = true;
		this.recenter = true;

		this.minesSet = false;
		this.minesLeft = Settings.currentLevel.mines;

		this.leftClicked = this.rightClicked = false;
		this.elementInRay = null;

		Menu.reset( 0, this.minesLeft );

	},

	start : function() {

		var i;

		for ( i = 0; i < this.elements.length; i++ ) {

			this.elements[i].reset();

		}

		this.reset();

	},

	restart : function() {

		var i;

		for ( i = 0; i < this.elements.length; i++ ) {

			this.elements[i].restart();

		}

		this.reset();
		this.minesSet = true;

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
			dim = Settings.currentLevel.dimensions;
	
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

					elements.push( new Element(
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
			dim = Settings.currentLevel.dimensions,
			element;

		for ( k = dim[2] - 1; k >= 0; k-- ) {

			if ( k == 0 ) {

				bottomBorder = true;

			}

			frontBorder = true;

			for ( j = dim[1] - 1; j >= 0; j-- ) {

				backBorder = ( j == 0 ? true : false );

				for ( i = dim[0] - 1; i >= 0; i-- ) {

					leftBorder = ( i == 0 ? true : false );

					element = elements[index];

					if ( !leftBorder ) {

						element.addNeighbor( elements[index + 1], true );

						if ( !backBorder ) {

							element.addNeighbor( elements[index + 1 + dim[0]], true );

							if ( !topBorder ) {

								element.addNeighbor( elements[index + 1 + dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !frontBorder ) {

							element.addNeighbor( elements[index + 1 - dim[0]], true );

							if ( !topBorder ) {

								element.addNeighbor( elements[index + 1 - dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !topBorder ) {

							element.addNeighbor( elements[index + 1 - dim[0] * dim[1]], true );

						}

					}

					if ( !backBorder ) {

						element.addNeighbor( elements[index + dim[0]], true );

						if (!topBorder) {

							element.addNeighbor( elements[index + dim[0] - dim[0] * dim[1]], true);

						}

					}

					if ( !bottomBorder ) {

						element.addNeighbor( elements[index + dim[0] * dim[1]], true );

						if ( !leftBorder ) {

							element.addNeighbor( elements[index + 1 + dim[0] * dim[1]], true );

							if ( !backBorder ) {

								element.addNeighbor( elements[index + 1 + dim[0] + dim[0] * dim[1]], true );

							}

							if ( !frontBorder ) {

								element.addNeighbor( elements[index + 1 - dim[0] + dim[0] * dim[1]], true );

							}

						}

						if ( !backBorder ) {

							element.addNeighbor( elements[index + dim[0] + dim[0] * dim[1]], true );

						}

					}

					index++;

				}

				frontBorder = false;

			}

			topBorder = false;

		}

	},


	setMines : function( element ) {

		var i, index,
			neighbors = element.neighbors,
			dim = Settings.currentLevel.dimensions,
			elementAmount = dim[0] * dim[1] * dim[2],
			mines = Settings.currentLevel.mines,
			openElementIndices = [],
			elements = this.elements;

		openElementIndices.push( element.index );

		for ( i = 0; i < neighbors.length; i++ ) {

			openElementIndices.push( neighbors[i].index );

		}


		if ( elementAmount - openElementIndices.length < mines ) {

			throw 'more mines than left elements';

		}

		mineWhile: while ( mines ) {

			index = Math.floor( Math.random() * elementAmount );

			for ( i = 0; i < openElementIndices.length; i++ ) {

				if ( openElementIndices[i] == index ) {

					continue mineWhile;

				}

			}

			element = elements[index];

			if ( !element.isMine ) {

				element.setMine();
				mines--;

			}

		}

		this.minesSet = true;
		this.time = new Date().getTime();

	},

	showMines : function() {

		var i,
			element,
			elements = this.elements;

		for ( i = 0; i < elements.length; i++ ) {

			element = elements[i];

			if ( (element.state == 'cube' || element.state == 'flag') && element.isMine ) {

				element.showMine();

			}

		}

		this.redraw = true;

	},


	update : function() {

		var elementInRay = this.elementInRay,
			newCubeCount = false;

		if ( elementInRay ) {

			if ( this.leftClicked ) {

				if ( !this.minesSet ) {

					this.setMines( elementInRay );

				}

				elementInRay.open();

				this.redraw = true;
				newCubeCount = true;

			} else if ( this.rightClicked && this.minesSet ) {

				if ( Settings.mode == 'classic' ) {

					elementInRay.flag();

				} else {

					elementInRay.openMine();
					newCubeCount = true;

				}

				Menu.setMines( this.minesLeft );
				this.redraw = true;

			}

		}

		this.leftClicked = this.rightClicked = false;


		if ( this.minesSet && !Game.gameover ) {

			Menu.setTime( new Date().getTime() - this.time );

			if ( newCubeCount &&
				( Settings.mode == 'classic' && this.cubeCount == Settings.currentLevel.mines ) ||
				( Settings.mode == 'sweep' && this.cubeCount == this.minesLeft ) ) {

				Game.over( true );

			}

		}

		return this.redraw;

	},

	draw : function( gl ) {

		BSPTree.draw( gl, Camera.getPosition() );

		this.redraw = false;

	},


	elementInRay : null,

	getCubeInRay : function( ray ) {

		var i,
			min = Infinity,
			elements = this.elements,
			element,
			cube,
			distanceFromOrigin,
			distanceToRay,
			nearest = null,
			vector = vec3.create(),
			origin = ray.origin,
			direction = ray.direction,
			imageChanged = false;

		for ( i = 0; i < elements.length; i++ ) {

			element = elements[i];

			if ( element.state == "cube" || element.state == "flag" ) {

				vec3.subtract( element.position, origin, vector );
				distanceFromOrigin = vec3.lengthSquared( vector );

				if ( distanceFromOrigin < min ) {

					cube = element.cube;

					distanceToRay = cube.distanceToRay( origin, direction );

					if ( !(distanceToRay > 0.75) && 
						(distanceToRay < 0.25 || cube.intersectsRay( origin, direction )) ) {

						nearest = element;
						min = distanceFromOrigin;

					}

				}

			}

		}

		return this.setElementInRay( nearest );

	},

	setElementInRay : function( element ) {

		var screenChanged = false;

		if ( this.elementInRay ) {

			this.elementInRay.highlight = false;

			screenChanged = true;

		}

		this.elementInRay = element;

		if ( element ) {

			element.highlight = true;

			screenChanged = true;

		}

		return screenChanged;

	}

};
