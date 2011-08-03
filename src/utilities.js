function bind( scope, fn ) {

	return function() {

		fn.apply( scope, arguments );

	};

};

function extend( destination, source ) {

	for ( var key in source ) {

		if ( source.hasOwnProperty( key ) ) {

			destination[key] = source[key];

		}

	}

	return destination;

};

vec3.assign = function( dest, x, y, z ) {

	dest[0] = x;
	dest[1] = y;
	dest[2] = z;

	return dest;

};

vec3.zero = function( dest ) {

	dest[0] = dest[1] = dest[2] = 0;

	return dest;

};

vec3.lengthSquared = function( vec ) {

	var x = vec[0], y = vec[1], z = vec[2];

	return x*x + y*y + z*z;

};