var canvas,
	gl;

function init() {

	canvas = document.createElement( "canvas" );
	document.querySelector( "#container" ).appendChild( canvas );

	canvas.style.backgroundColor = "black";

	canvas.width = window.innerWidth,
	canvas.height = window.innerHeight;


	gl = canvas.getContext( "experimental-webgl" );
	extend( gl, WebGLUtilities );

	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.enable( gl.CULL_FACE );
	gl.enable( gl.DEPTH_TEST );


	Cube.init();
	Grid.init();
	Game.init( gl );

}

function draw() {

	// requestAnimationFrame(run, canvas);

	Game.draw( gl );

}

window.onload = function () {

	if ( !window.WebGLRenderingContext ) {

		return;

	}

	init();

	draw();

};
