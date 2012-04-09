var EventHandler = {

	mouse : vec3.create(),
	oldMouse : vec3.create(),

	vector : vec3.create(),

	state : "up",
	button : 0,

	timeoutID : null,

	init : function() {

		window.addEventListener( "resize", bind( this, this.onResize ), false );

		vec3.zero( this.oldMouse );
		vec3.zero( this.mouse );

	},

	bind : function() {

		canvas.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
		canvas.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
		canvas.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );

		document.addEventListener( "DOMMouseScroll", bind( this, this.onScroll ), false );
		document.addEventListener( "mousewheel", bind( this, this.onScroll ), false );

		document.addEventListener( "keydown", bind( this, this.onKeyDown ), false );
		document.addEventListener( "keyup", bind( this, this.onKeyUp ), false );

		canvas.addEventListener( 'contextmenu', function( event ) { event.preventDefault(); }, false );
		canvas.onselectstart = function() { return false; };

	},

	getMouse : function( event, mouse ) {

		mouse[0] = event.clientX;
		mouse[1] = event.clientY;

		return mouse;

	},

	onMouseDown : function( event ) {

		event.stopPropagation();

		this.state = "down";
		this.button = event.button;

		if ( invertedControls ) {

			this.button = ( this.button + 2 ) % 4;

		}

		var oldMouse = this.getMouse( event, this.oldMouse );

		if ( this.button === 0 ) {

			Camera.startRotate( oldMouse );

		} else if ( this.button === 2 ) {

			Camera.startPan( oldMouse );

		}

		this.timeoutID = setTimeout( bind( this, this.onClickTimeout ), 250 );

	},

	onMouseUp : function( event ) {

		event.stopPropagation();

		if ( this.state === "down" ) {

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

		if ( this.state === "down" ) {

			len = vec3.lengthSquared( vec3.subtract( mouse, this.oldMouse, this.vector ) );

			if ( len > 60 ) {

				this.state = "drag";
				clearTimeout( this.timeoutID );

			}

		}

		if ( this.state === "drag" ) {

			if ( this.button === 0 ) {

				Camera.rotate();

			} else if ( this.button === 2 ) {

				Camera.pan();

			}

		} else {

			Camera.updateRay = true;

		}

	},

	onClick : function( ) {

		if ( this.button === 0 ) {

			Grid.leftClicked = true;

		} else if ( this.button === 1 ) {

			Camera.reset();

		} else if ( this.button === 2 ) {

			Grid.rightClicked = true;

		}

	},

	onClickTimeout : function() {

		if ( this.state === "down" ) {

			this.state = "drag";

		}

	},

	onScroll : function( event ) {

		var delta;

		event.stopPropagation();

		if ( Menu.fsm.hasState( 'play' ) ) {

			event.preventDefault();

			delta = event.wheelDelta || ( event.detail * -5 );
			delta = 1 - delta * 0.0002;

			Camera.zoom( delta );

		}

	},

	isMouseKey : function( keyCode ) {

		return this.isLeftMouseKey( keyCode ) || this.isRightMouseKey( keyCode );

	},

	isLeftMouseKey : function( keyCode ) {

		return keyCode === 70 /* F */ || keyCode === 74 /* J */;

	},

	isRightMouseKey : function( keyCode ) {

		return keyCode === 68 /* D */ || keyCode === 75 /* K */;

	},

	augmentEvent : function( event ) {

		event.clientX = this.mouse[0];
		event.clientY = this.mouse[1];

		event.button = this.isLeftMouseKey( event.keyCode ) ? 0 : 2;

		return event;

	},

	onKeyDown : function( event ) {

		if ( this.state === "up" && this.isMouseKey( event.keyCode ) && Menu.fsm.hasState( 'play' ) ) {

			this.onMouseDown( this.augmentEvent( event ) );

		}

	},

	onKeyUp : function( event ) {

		// console.log( event.keyCode );

		if ( event.keyCode === 32  /* SPACE */ ) {

			Game.start();
			Menu.fsm.changeState( 'play' );

		} else if ( event.keyCode === 27 /* ECS */ ) {

			Menu.toggle();

		} else if ( Menu.fsm.hasState( 'play' ) ) {

			if ( this.isMouseKey( event.keyCode ) ) {

				this.onMouseUp( this.augmentEvent( event ) );

			} else if ( event.keyCode === 82 /* R */ ) {

				Camera.reset();

			} else if ( event.keyCode === 73 /* I */ ) {

				stats.toggle();

			} else if ( event.keyCode === 79 /* O */ ) {

				stats.switchMode();

			}

		}

	},

	onResize : function( event ) {

		setViewport();

		Camera.resize();
		Element.updateMatrix( gl );

    if ( useBackgroundTextures ) {
    
      Background.resize();
    
    }

		Grid.redraw = true;

		requestAnimationFrame( function() {
			Grid.redraw = true;
		});

	}

};
