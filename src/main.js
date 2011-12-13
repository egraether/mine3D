var canvas,
	width, height,
	gl,
	stats;

function init( gl ) {

	setViewport();

	setReferences();

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

function setReferences() {

	gl.cubeSpacing = cubeSpacing;

	gl.numberSize = numberSize;
	gl.mineSize = mineSize;

	gl.standardAlpha = standardAlpha;
	gl.mouseOverAlpha = mouseOverAlpha;

	gl.drawLines = drawLines;
	gl.useMultiCubes = useMultiCubes;
	gl.fakeCubes = fakeCubes;
	gl.useIcosahedron = useIcosahedron;

	gl.Camera = Camera;
	gl.Element = Element;

	gl.Cube = Cube;
	gl.Face = Face;
	gl.Icosahedron = Icosahedron;

	gl.Game = Game;
	gl.Grid = Grid;

	gl.vec3 = vec3;
	gl.mat4 = mat4;

}

function draw() {

	requestAnimationFrame( draw, canvas );

	Game.draw( gl );

	stats.update();

};

function start() {

	var container;

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


	container = document.querySelector( "#container" );

	container.appendChild( canvas );
	canvas.style.backgroundColor = "black";

	canvas.style.width = '100%';
	canvas.style.height = '100%';


	stats = new StatsJS();
	stats.hide();

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	container.appendChild( stats.domElement );


	extend( gl, WebGLUtilities );

	init( gl );

	draw();

};
