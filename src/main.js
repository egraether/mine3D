var canvas,
	width, height,
	gl,
	stats;

function init( gl ) {

	setViewport();

	gl.clearColor.apply( gl, hexToRGB( backgroundColor ) );

	gl.enable( gl.CULL_FACE );
	gl.disable( gl.DEPTH_TEST );

	gl.lineWidth( 2 );

	gl.enableAlpha();

	gl.initQuad();


	Stats.init();
	Stats.loadSettings();

	Settings.init();
	EventHandler.init();

	Game.init( gl );


	Menu.init();

	if ( showWelcomeScreen || !Stats.read( 'hideWelcomeScreen' ) ) {

		Menu.fsm.changeState( 'welcome' );

	} else {

		Menu.fsm.play();

	}

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

	stats.update();

};

function start() {

	var container;

	canvas = document.createElement( "canvas" );
	gl = null;

	if ( System.support.webgl ) {

		gl = canvas.getContext( "experimental-webgl", { antialias : useAntialias } );

	}

	if ( !gl ) {

		$('#error').show();
		return;

	}


	container = document.querySelector( "#container" );

	container.appendChild( canvas );
	canvas.style.backgroundColor = "black";

	canvas.style.width = '100%';
	canvas.style.height = '100%';


	if ( !( System.browser === "Chrome" && System.os === "Windows") ) {

		$('body').addClass( 'useFont' );

	}


	stats = new StatsJS();
	stats.hide();

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	container.appendChild( stats.domElement );


	applyURLParams();

	extend( gl, WebGLUtilities );


	init( gl );

	draw();

};
