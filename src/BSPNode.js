var BSPNode = function( parent ) {

	this.parent = parent;

	this.front = null;
	this.back = null;

	this.position = null;
	this.direction = null; // 0 : "x", 1 : "y", 2 : "z"

	this.untouched = true;
	this.permaTouched = false;

	this.numChildren = null;

};

BSPNode.prototype = {

	init : function( elements, direction ) {

		var frontElements,
			backElements,
			element,
			pos;

		this.direction = direction;
		this.numChildren = elements.length;

		this.position = this.getAveragePosition( elements, direction );

		frontElements = [];
		backElements = [];

		while ( elements.length ) {

			element = elements.pop();
			pos = element.position;

			if ( pos[direction] < this.position[direction] ) {

				backElements.push( element );

			} else {

				frontElements.push( element );

			}

		}

		direction = ( direction + 1 ) % 3;

		if ( !frontElements.length ) {

			this.init( backElements, direction );

		} else if ( !backElements.length ) {

			this.init( frontElements, direction );

		} else {

			if ( frontElements.length === 1 ) {

				this.front = frontElements[0];
				this.front.parent = this;

			} else {

				this.front = new BSPNode( this ).init( frontElements, direction );

			}

			if ( backElements.length === 1 ) {

				this.back = backElements[0];
				this.back.parent = this;

			} else {

				this.back = new BSPNode( this ).init( backElements, direction );

			}

		}

		return this;

	},

	getAveragePosition : function( elements, direction ) {

		var sum = vec3.zero( vec3.create() ),
			number = 0,
			epsilon = .3,
			pos, i;

		for ( i = 0; i < elements.length; i++ ) {

			vec3.add( sum, elements[i].position );
			number++;

		}

		vec3.scale( sum, 1 / number );

		for ( i = 0; i < elements.length; i++ ) {

			pos = elements[i].position;

			if ( sum[direction] + epsilon > pos[direction] && 
				sum[direction] - epsilon < pos[direction] ) {

				sum[direction] += Math.random() > 0.5 ? 0.5 : -0.5;
				break;

			}

		}

		return sum;

	},

	draw : function( gl, position ) {

		var n = this.numChildren,
			dir = this.direction,
			dir2;

		if ( useMultiCubes && this.untouched ) {

			if ( n === 2 ) {

				Cube.drawDouble( gl, Element.shader, dir, this.position );
				return;

			} else if ( dir !== ( dir2 = this.front.direction ) ) {

				if ( n === 4 ) {

					Cube.drawQuad( gl, Element.shader, dir, dir2, this.position );
					return;

				} else if ( n === 8 && dir !== this.front.front.direction ) {

					Cube.drawOct( gl, Element.shader, this.position );
					return;

				} else if ( n === 16 ) {

					Cube.drawHex( gl, Element.shader, dir, this.position );
					return;

				} else if ( n === 32 ) {

					Cube.draw32( gl, Element.shader, dir, this.front.direction, this.position );
					return;

				} else if ( n === 64 ) {

					Cube.draw64( gl, Element.shader, this.position );
					return;

				}

			}

		}

		if ( position[dir] > this.position[dir] ) {

			this.back.draw( gl, position );
			this.front.draw( gl, position );

		} else {

			this.front.draw( gl, position );
			this.back.draw( gl, position );

		}

	},

	remove : function( element ) {

		var dir = this.direction;

		if ( element.position[dir] > this.position[dir] ) {

			this.front = this.front.remove( element );

			if ( !this.front ) {

				if ( this.parent ) {

					this.parent.untouched = false;
					this.parent.permaTouched = true;

				}

				return this.back;

			}

		} else {

			this.back = this.back.remove( element );

			if ( !this.back ) {

				if ( this.parent ) {

					this.parent.untouched = false;
					this.parent.permaTouched = true;

				}

				return this.front;

			}

		}

		return this;

	},

	count : function() {

		return this.front.count() + this.back.count();

	},

	getCenter : function( highVector, lowVector ) {

		this.front.getCenter( highVector, lowVector );
		this.back.getCenter( highVector, lowVector );

	},

	getVisionSize : function( center, vector ) {

		var a = this.front.getVisionSize( center, vector ),
			b = this.back.getVisionSize( center, vector );

		return a < b ? b : a;

	},

	solve : function() {

		this.front.solve();
		this.back.solve();

	},

	print : function( str ) {

		str += "  ";

		console.log( str + this.direction );

		// console.log( str + "front" );
		this.front.print( str );

		// console.log( str + "back");
		this.back.print( str );

	},

	touch : function() {

		if ( this.untouched ) {

			this.untouched = false;

			if ( this.parent ) {

				this.parent.touch();

			}

		}

	},

	untouch : function() {

		if ( !this.untouched && !this.permaTouched &&
			this.front.untouched && this.back.untouched ) {

			this.untouched = true;

			if ( this.parent ) {

				this.parent.untouch();

			}

		}

	}

};
