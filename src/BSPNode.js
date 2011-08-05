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

			if ( !frontElements.length ) {

				this.init( backElements, direction );

			} else if ( !backElements.length ) {

				this.init( frontElements, direction );

			} else {

				this.front = new BSPNode().init( frontElements, direction );

				this.back = new BSPNode().init( backElements, direction );

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

			if ( inFront ) {

				this.back.draw( gl, position );

			}

			this.front.draw( gl, position )

			if ( !inFront ) {

				this.back.draw( gl, position );

			}

		}

	},

	remove : function( element ) {

		var dir;

		if ( this.element ) {

			if ( this.element.index == element.index ) {

				return 0;

			} else {

				console.log("wtf");

			}

		} else {

			dir = this.direction;

			if ( element.position[dir] > this.position[dir] ) {

				this.front = this.front.remove( element );

				if ( !this.front ) {

					return this.back;

				}

			} else {

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

		return this.front.count() + this.back.count();

	},

	print : function( depth ) {

		var str = "",
			i;

		for ( i = 0; i < depth; i++ ) {

			str += "    ";

		}

		if ( this.element ) {

			console.log( str + vec3.str(this.element.position) );

		} else {

			console.log( str + "front" );
			this.front.print( depth + 1 );

			console.log( str + "back");
			this.back.print( depth + 1 );

		}

	}

};
