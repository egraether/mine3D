var canvas,
	gl;

function init() {

	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.enable( gl.CULL_FACE );
	// gl.enable( gl.DEPTH_TEST );

	gl.enableAlpha();

	Game.init( gl );

};

function draw() {

	requestAnimationFrame( draw, canvas );

	Game.draw( gl );

};

window.onload = function () {

	canvas = document.createElement( "canvas" );

	if ( canvas.getContext && !!window.WebGLRenderingContext ) {

		gl = canvas.getContext( "experimental-webgl" );

	}

	if ( !gl ) {

		Menu.error();
		return;

	}

	Menu.showWelcome();

	document.querySelector( "#container" ).appendChild( canvas );
	canvas.style.backgroundColor = "black";

	canvas.width = window.innerWidth,
	canvas.height = window.innerHeight;

	extend( gl, WebGLUtilities );

	init( gl );

	draw();

};
