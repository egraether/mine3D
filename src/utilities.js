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

function clamp( x, a, b ) {

	return x ? x < a ? a : x > b ? b : x : a;

};

function map( x, a1, a2, b1, b2 ) {

	return ( x  - a1 ) * ( b2 - b1 ) / ( a2 - a1 ) + b1;

};

function multipleOfTwo( x ) {

	var a = x;

	while ( !(a & 1) ) {

		if ( ( a /= 2 ) === 1 ) {

			return x;

		}

	}

	return 0;

};

function getURLParams() {

	var params = {},
		floatRegex = /^[-+]?\d*\.?\d+$/,
		results = window.location.href.match( /[^?&#]*=[^&#]*/g ) || [],
		a, i;

	for ( i = 0; i < results.length; i++ ) {

		a = results[i].split('=');

		params[a[0]] = floatRegex.test( a[1] ) ? parseFloat( a[1] ) : a[1];

	}

	return params;

};

function applyURLParams( scope ) {

	var params = getURLParams();

	scope = scope || window;

	for ( var key in params ) {

		if ( params.hasOwnProperty( key ) ) { // && scope.hasOwnProperty( key ) ) {

			scope[key] = params[key];

		}

	}

};

function hexToRGB( hex ) {

	return [ 
		( hex >> 16 & 255 ) / 255,
		( hex >> 8 & 255 ) / 255,
		( hex & 255 ) / 255,
		1.0
	];

};

vec3.assign = function( dest, x, y, z ) {

	dest[0] = x = typeof x === 'number' ? x : 0;
	dest[1] = typeof y === 'number' ? y : x;
	dest[2] = typeof z === 'number' ? z : x;

	return dest;

};

vec3.zero = function( dest ) {

	dest[0] = dest[1] = dest[2] = 0;

	return dest;

};

vec3.lengthSquared = function( vec ) {

	var x = vec[0], y = vec[1], z = vec[2];

	return x * x + y * y + z * z;

};

vec3.angle = function( vec, vec2 ) {

	return Math.acos( this.dot( vec, vec2 ) / this.length( vec ) / vec3.length( vec2 ) );

};

vec3.equal = function( vec, vec2 ) {

	return vec[0] === vec2[0] && vec[1] === vec2[1] && vec[2] === vec2[2];

};

Clock = {

	time : null,

	start : function() {

		this.time = new Date().getTime();

	},

	stop : function() {

		console.log( new Date().getTime() - this.time );

	}

};
