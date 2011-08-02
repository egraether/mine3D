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
