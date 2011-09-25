var InputHandler = {

	mouse : vec3.create(),
	oldMouse : vec3.create(),

	vector : vec3.create(),

	state : "up",
	button : 0,

	timeoutID : null,

	init : function() {

		canvas.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
		canvas.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
		canvas.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );

		document.addEventListener( "DOMMouseScroll", bind( this, this.onScroll ), false );
		document.addEventListener( "mousewheel", bind( this, this.onScroll ), false );

		document.addEventListener( "keydown", bind( this, this.onKeyDown ), false );
		document.addEventListener( "keyup", bind( this, this.onKeyUp ), false );

		window.addEventListener( "resize", bind( this, this.onResize ), false );

		canvas.addEventListener( 'contextmenu', function( event ) { event.preventDefault(); }, false );
		canvas.onselectstart = function() { return false; };

		vec3.zero( this.oldMouse );
		vec3.zero( this.mouse );

	},

	getMouse : function( event, mouse ) {

		mouse[0] = event.clientX;
		mouse[1] = event.clientY;

		return mouse;

	},

	onMouseDown : function(event) {

		event.stopPropagation();

		this.state = "down";
		this.button = event.button;

		var oldMouse = this.getMouse( event, this.oldMouse );

		if ( this.button == 0 ) {

			Camera.startRotate( oldMouse );

		} else if ( this.button == 2 ) {

			Camera.startPan( oldMouse );

		}

		this.timeoutID = setTimeout( bind( this, this.onClickTimeout ), 250 );

	},

	onMouseUp : function( event ) {

		event.stopPropagation();

		if ( this.state == "down" ) {

			this.onClick( event );
			clearTimeout( this.timeoutID );

		}

		this.state = "up";

		Camera.updateRay = true;

	},

	onMouseMove : function( event ) {

		event.stopPropagation();

		var mouse = this.getMouse( event, this.mouse ),
			len, ray;

		if ( this.state == "down" ) {

			len = vec3.lengthSquared( vec3.subtract( mouse, this.oldMouse, this.vector ) );

			if ( len > 25 ) {

				this.state = "drag";
				clearTimeout( this.timeoutID );

			}

		}

		if ( this.state == "drag" ) {

			if ( this.button == 0 ) {

				Camera.rotate();

			} else if ( this.button == 2 ) {

				Camera.pan();

			}

		} else {

			Camera.updateRay = true;

		}

	},

	onClick : function( ) {

		if ( !Game.gameover ) {

			if ( this.button == 0 ) {

				Grid.leftClicked = true;

			} else if ( this.button == 2 ) {

				Grid.rightClicked = true;

			}

		}

	},

	onClickTimeout : function() {

		if ( this.state == "down" ) {

			this.state = "drag";

		}

	},

	onScroll : function( event ) {

		event.stopPropagation();
		// event.preventDefault();

		var delta = event.wheelDelta || (event.detail * -5);
		delta = 1 - delta * 0.0002;

		Camera.zoom( delta );

	},

	onKeyDown : function( event ) {

		if (event.keyCode === 32) {

			vec3.set( this.mouse, this.oldMouse );

			Camera.startRotate( this.oldMouse );

			this.button = 0;
			this.state = "drag";

		}

	},

	onKeyUp : function( event ) {

		if (event.keyCode === 32) {

			this.state = "up";

			Camera.updateRay = true;

		} else if (event.keyCode == 82 || event.keyCode == 78) {

			Game.start();

		} else if (event.keyCode === 27) {

			Menu.toggle();

		}

	},

	onResize : function( event ) {

		canvas.width = window.innerWidth,
		canvas.height = window.innerHeight;

		gl.viewport( 0, 0, canvas.width, canvas.height );

		Camera.resize();
		Element.resize( gl );

		Grid.redraw = true;

	}

};
