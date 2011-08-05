var BSPNode = function() {

	this.front = null;
	this.back = null;

	this.element = null;

	this.position = null;
	this.direction = null; // 0 : "x", 1 : "y", 2 : "z"

};

BSPNode.prototype = {

	init : function( elements, direction ) {

		var frontElements,
			backElements,
			element,
			pos;

		this.direction = direction;

		if ( elements.length == 1 ) {

			this.element = elements[0];

		} else {

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

			if ( frontElements.length ) {

				this.front = new BSPNode().init( frontElements, direction );

			}

			if ( backElements.length ) {

				this.back = new BSPNode().init( backElements, direction );

			}

		}

		return this;

	},

	getAveragePosition : function( elements, direction ) {

		var sum = vec3.zero(vec3.create()),
			number = 0,
			epsilon = .3,
			pos, i, j;

		for ( i = 0; i < elements.length; i++ ) {

			vec3.add( sum, elements[i].position );
			number++;

		}

		vec3.scale( sum, 1 / number );

		for ( i = 0; i < elements.length; i++ ) {

			pos = elements[i].position;
			j = ( direction == "x" ? 0 : ( direction == "y" ? 1 : 2 ) );

			if ( sum[direction] + epsilon > pos[direction] && 
				sum[direction] - epsilon < pos[direction] ) {

				sum[direction] -= 0.5;
				break;

			}

		}

		return sum;

	},

	draw : function( gl, position ) {

		var dir, inFront;

		if ( this.element ) {

			this.element.draw( gl );

		} else {

			dir = this.direction;
			inFront = ( position[dir] > this.position[dir] );

			if ( inFront && this.back ) {

				this.back.draw( gl, position );

			}

			if ( this.front ) {

				this.front.draw( gl, position )

			}

			if ( !inFront && this.back ) {

				this.back.draw( gl, position );

			}

		}

	},

	remove : function( element ) {

		var inFront, dir,
			front, back;

		if ( this.element ) {

			if ( this.element.index == element.index ) {

				return 0;

			}

		} else {

			dir = this.direction;
			inFront = ( element.position[dir] > this.position[dir] );

			if ( inFront && this.front ) {

				this.front = this.front.remove( element );

				if ( !this.front ) {

					return this.back;

				}

			}

			if ( !inFront && this.back ) {

				this.back = this.back.remove( element );

				if ( !this.back ) {

					return this.front;

				}

			}

		}

		return this;

	},

	count : function() {

		if ( this.element ) {

			return 1;

		}

		var sum = 0;

		if ( this.front ) {

			sum += this.front.count();

		}

		if ( this.back ) {

			sum += this.back.count();

		}

		return sum;

	},

	print : function( depth ) {

		var str = "",
			i;

		for ( i = 0; i < depth; i++ ) {

			str += "    ";

		}

		if ( this.element ) {

			console.log( str + vec3.str(this.element.position) );

		}

		if ( this.front ) {

			console.log( str + "front" );
			this.front.print( depth + 1 );

		}

		if ( this.back ) {

			console.log( str + "back");
			this.back.print( depth + 1 );

		}

	}

};
