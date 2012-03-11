var Grid = {

	elements : [],
	elementList : [],
	cubeCount : 0,

	minesLeft : 0,
	minesSet : false,

	started : false,

	leftClicked : false,
	rightClicked : false,

	redraw : true,

	time : 0,
	playTime : 0,


	init : function() {

		this.elements = [];

		this.createGrid();
		this.setNeighbors();

		this.start();

	},

	reset : function( elementResetFunction ) {

		var i, center, elements = this.elements;

		TWEEN.removeAll();

		BSPTree.createPartition( elements.concat() );

		this.elementList = elements.concat();

		this.cubeCount = elements.length;

		center = elements[Math.floor( Math.random() * elements.length )].position;

		for ( i = 0; i < elements.length; i++ ) {

			elementResetFunction.call( elements[i], center );

		}

		this.redraw = true;

		this.minesSet = false;
		this.started = false;

		this.minesLeft = Settings.currentLevel.mines;

		this.leftClicked = this.rightClicked = false;
		this.elementInRay = null;

		this.playTime = 0;
		Menu.reset( 0, this.minesLeft );

	},

	start : function() {

		this.reset( Element.prototype.start );

	},

	restart : function() {

		this.reset( Element.prototype.restart );

		this.minesSet = true;

	},


	createGrid : function( ) {

		var elements = this.elements,
			k, j, i,
			spacing = 1 + cubeSpacing,
			position = vec3.create(),
			dim = Settings.currentLevel.dimensions,
			index = 0;


		position[2] = ( dim[2] - 1 ) * spacing / -2;

		for ( k = 0; k < dim[2]; k++ ) {

			position[1] = ( dim[1] - 1 ) * spacing / -2;

			for ( j = 0; j < dim[1]; j++ ) {

				position[0] = ( dim[0] - 1 ) * spacing / -2;

				for ( i = 0; i < dim[0]; i++ ) {

					elements.push( new Element(
						index,
						vec3.create( position )
					) );

					index++;

					position[0] += spacing;

				}

				position[1] += spacing;

			}

			position[2] += spacing;

		}

	},

	setNeighbors : function() {

		var index = 0,
			elements = this.elements,
			top = true,
			bottom, left,
			front, back,
			k, j, i,
			dim = Settings.currentLevel.dimensions,
			element;

		for ( k = dim[2] - 1; k >= 0; k-- ) {

			bottom = ( k === 0 );

			front = true;

			for ( j = dim[1] - 1; j >= 0; j-- ) {

				back = ( j === 0 );

				for ( i = dim[0] - 1; i >= 0; i-- ) {

					left = ( i === 0 );

					element = elements[index];

					if ( !left ) {

						element.addNeighbor( elements[index + 1], true );

						if ( !back ) {

							element.addNeighbor( elements[index + 1 + dim[0]], true );

							if ( !top ) {

								element.addNeighbor( elements[index + 1 + dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !front ) {

							element.addNeighbor( elements[index + 1 - dim[0]], true );

							if ( !top ) {

								element.addNeighbor( elements[index + 1 - dim[0] - dim[0] * dim[1]], true );

							}

						}

						if ( !top ) {

							element.addNeighbor( elements[index + 1 - dim[0] * dim[1]], true );

						}

					}

					if ( !back ) {

						element.addNeighbor( elements[index + dim[0]], true );

						if ( !top ) {

							element.addNeighbor( elements[index + dim[0] - dim[0] * dim[1]], true);

						}

					}

					if ( !bottom ) {

						element.addNeighbor( elements[index + dim[0] * dim[1]], true );

						if ( !left ) {

							element.addNeighbor( elements[index + 1 + dim[0] * dim[1]], true );

							if ( !back ) {

								element.addNeighbor( elements[index + 1 + dim[0] + dim[0] * dim[1]], true );

							}

							if ( !front ) {

								element.addNeighbor( elements[index + 1 - dim[0] + dim[0] * dim[1]], true );

							}

						}

						if ( !back ) {

							element.addNeighbor( elements[index + dim[0] + dim[0] * dim[1]], true );

						}

					}

					index++;

				}

				front = false;

			}

			top = false;

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

			mines = Math.floor( ( elementAmount - openElementIndices.length ) * 0.9 );

			Settings.currentLevel.mines = this.minesLeft = mines;
			Menu.reset( 0, mines );

		}

		mineWhile: while ( mines ) {

			index = Math.floor( Math.random() * elementAmount );

			for ( i = 0; i < openElementIndices.length; i++ ) {

				if ( openElementIndices[i] === index ) {

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

	},

	showMines : function( won, element ) {

		var i,
			elements = this.elementList;

		for ( i = 0; i < elements.length; i++ ) {

			elements[i].showMine( won, element );

		}

		this.redraw = true;

	},


	update : function() {

		var elementInRay = this.elementInRay,
			t, dt, pt;

		if ( elementInRay ) {

			if ( this.leftClicked ) {

				if ( !this.started ) {

					if ( !this.minesSet ) {

						this.setMines( elementInRay );
						elementInRay.openNeighbors();

					}

					this.time = new Date().getTime();
					this.started = true;

				}

				elementInRay.openCube( true );

				this.redraw = true;

			} else if ( this.rightClicked && this.started ) {

				if ( Settings.mode === 'classic' ) {

					elementInRay.flag();

				} else {

					elementInRay.openMine();

				}

				this.redraw = true;

			}

		}

		this.leftClicked = this.rightClicked = false;


		if ( this.started && !Game.gameover ) {

			pt = this.playTime;

			t = new Date().getTime();
			dt = t - this.time;

			dt = dt > 500 ? 100 : dt;

			if ( pt % 1000 < ( pt + dt ) % 1000 ) {

				Menu.setTime( pt + dt );

			}

			this.playTime += dt;
			this.time = t;

			if ( ( Settings.mode === 'classic' && this.cubeCount === Settings.currentLevel.mines ) ||
				( Settings.mode === 'sweep' && this.cubeCount === this.minesLeft ) ) {

				Game.over( true );

			}

		}

		return this.redraw;

	},

	draw : function( gl ) {

		gl.lastDraw = null;

		BSPTree.draw( gl, Camera.getPosition() );

		this.redraw = false;

	},


	elementInRay : null,

	getCubeInRay : function( ray ) {

		var i,
			min = Infinity,
			elements = this.elementList,
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

			if ( element.state === 'cube' ) {

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

		this.setElementInRay( nearest );

	},

	setElementInRay : function( element ) {

		var elementInRay = this.elementInRay;

		if ( elementInRay && element && elementInRay.index === element.index ) {

			return;

		}

		if ( elementInRay ) {

			elementInRay.highlight = false;
			elementInRay.adjustState();

			this.redraw = true;

		}

		this.elementInRay = element;

		if ( element ) {

			element.highlight = true;
			element.adjustState();

			this.redraw = true;

		}

	},

	remove : function( element ) {

		var index = Math.min( element.index, this.elementList.length - 1 );

		while ( element.index !== this.elementList[index].index ) {

			index--;

			if ( index < 0 ) {

				throw "wtf";

			}

		}

		this.elementList.splice( index, 1 );

	},

	forceRedraw : function() {

		Grid.redraw = true;

	}

};
