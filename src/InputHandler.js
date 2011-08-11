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

		document.addEventListener("DOMMouseScroll", bind( this, this.onScroll ), false);
		document.addEventListener("mousewheel", bind( this, this.onScroll ), false);

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

			Camera.calculateMouseRay();

		}

	},

	onClick : function( ) {

		if ( this.button == 0 ) {

			Grid.clicked = true;

		} else if ( this.button == 2 ) {

			Grid.flagged = true;

		}

	},

	onClickTimeout : function() {

		if ( this.state == "down" ) {

			this.state = "drag";

		}

	},

	onScroll : function(event) {

		event.stopPropagation();
		event.preventDefault();

		var delta = event.wheelDelta || (event.detail * -5);
		delta = 1 - delta * 0.0002;

		Camera.zoom( delta );

	}

};
