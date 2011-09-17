var BSPNode = function() {

	this.front = null;
	this.back = null;

	this.position = null;
	this.direction = null; // 0 : "x", 1 : "y", 2 : "z"

};

BSPNode.prototype = {

	init : function( elements, direction ) {

		var frontElements,
			backElements,
			element;

		this.direction = direction;
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

			if ( frontElements.length == 1 ) {

				this.front = frontElements[0];

			} else {

				this.front = new BSPNode().init( frontElements, direction );

			}

			if ( backElements.length == 1 ) {

				this.back = backElements[0];

			} else {

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

		var dir = this.direction;

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

				return this.back;

			}

		} else {

			this.back = this.back.remove( element );

			if ( !this.back ) {

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

	print : function( str ) {

		str += "    ";

		console.log( str + "front" );
		this.front.print( str );

		console.log( str + "back");
		this.back.print( str );

	}

};
