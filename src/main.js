var canvas,
	width, height,
	gl;

function init( gl ) {

	setViewport();

	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	gl.enable( gl.CULL_FACE );
	// gl.enable( gl.DEPTH_TEST );

	gl.lineWidth( 2 );

	gl.enableAlpha();

	gl.initQuad();

	Game.init( gl );

};

function setViewport() {

	canvas.width = width = canvas.clientWidth;
	canvas.height = height = canvas.clientHeight;

	// canvas.width = 1024;
	// canvas.height = 768;

	// width = canvas.clientWidth;
	// height = canvas.clientHeight;

	gl.viewport( 0, 0, canvas.width, canvas.height );

}

function draw() {

	requestAnimationFrame( draw, canvas );

	Game.draw( gl );

};

function start() {

	canvas = document.createElement( "canvas" );
	gl = null;

	if ( !!window.WebGLRenderingContext ) {

		gl = canvas.getContext( "experimental-webgl", { antialias : useAntialias } );

	}

	if ( !gl ) {

		Menu.error();
		return;

	}

	if ( showWelcomeScreen) {

		Menu.showWelcome();

	} else {

		Menu.showHUD();

	}

	document.querySelector( "#container" ).appendChild( canvas );
	canvas.style.backgroundColor = "black";

	canvas.style.width = '100%';
	canvas.style.height = '100%';

	extend( gl, WebGLUtilities );

	init( gl );

	draw();

};
