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

			console.log( str + "front " + vec3.str(this.position) );
			this.front.print( depth + 1 );

		}

		if ( this.back ) {

			console.log( str + "back " + vec3.str(this.position) );
			this.back.print( depth + 1 );

		}

	}

};
