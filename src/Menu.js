var Menu = {

	mode : null,
	level : null,

	animations : false,
	recenter : false,

	init : function() {

		$('#newButton').show();
		$('#menuButton').show();

		$('#newButton').click(function () {

			Game.start();
			Menu.hide();

		});

		$('#menuButton').click(function () {

			Menu.toggle();

		});

		$('#restartButton').click(function() {

			Game.restart();
			Menu.hide();

		});

		this.initMenu();

		this.initSettings();

	},

	initMenu : function() {

		$('#aboutButton').click( function() {

			Menu.hidePages();

			$(this).addClass( 'active' );
			$('#about').show();

		});

		$('#settingsButton').click( function() {

			Menu.hidePages();

			$(this).addClass( 'active' );
			$('#settings').show();

		});

		$('#statsButton').click( function() {

			Menu.hidePages();

			$(this).addClass( 'active' );
			$('#stats').show();

		});

		$('#instructionsButton').click( function() {

			Menu.hidePages();

			$(this).addClass( 'active' );
			$('#instructions').show();

		});

	},

	initSettings : function() {

		function setMode( modeName ) {

			$('#classic').removeClass( 'active' );
			$('#sweep').removeClass( 'active' );

			$('#' + modeName).addClass( 'active' );
			Menu.mode = modeName;

			Menu.changedSettings( false );

		};

		$('#classic').click(function() {

			setMode( 'classic' );

		});

		$('#sweep').click(function() {

			setMode( 'sweep' );

		});


		function setLevel( levelName ) {

			$('#easy').removeClass( 'active' );
			$('#medium').removeClass( 'active' );
			$('#hard').removeClass( 'active' );

			$('#' + levelName).addClass( 'active');
			Menu.level = Settings.levels[levelName];

			Menu.changedSettings( true );

		};

		$('#easy').click(function() {

			setLevel( 'easy' );

		});

		$('#medium').click(function() {

			setLevel( 'medium' );

		});

		$('#hard').click(function() {

			setLevel( 'hard' );

		});


		function toggleAnimation() {

			$('#animations').toggleClass( 'active' );
			Menu.animations = !Menu.animations;

			$('#animations').text( Menu.animations ? 'On' : 'Off' );

			Menu.changedSettings( false );

		};

		function toggleRecenter() {

			$('#recenter').toggleClass( 'active' );
			Menu.recenter = !Menu.recenter;

			$('#recenter').text( Menu.recenter ? 'On' : 'Off' );

			Menu.changedSettings( false );

		};

		$('#animations').click( toggleAnimation );
		$('#recenter').click( toggleRecenter );

		setMode( 'sweep' );
		setLevel( 'easy' );

		toggleAnimation();
		toggleRecenter();


		$('#apply').click(function() {

			Game.start();
			Menu.hide();

		});

	},

	setTime : function( time ) {

		$('#time').text( Math.floor( time * 0.001 ) );

	},

	setMines : function( mines ) {

		mines = mines < 0 ? 0 : mines;

		$('#mines').text( mines );

	},

	reset : function( time, mines ) {

		this.setTime( time );
		this.setMines( mines );

		$('#winner').hide();
		$('#loser').hide();

		$('#restartButton').hide();

	},

	show : function() {

		$('#menu').toggle( true );
		$('#menuButton').addClass( 'active' );

	},

	hide : function() {

		$('#menu').toggle( false );
		$('#menuButton').removeClass( 'active' );

		this.hidePages();

	},

	toggle : function() {

		$('#menu').toggle();
		$('#menuButton').toggleClass('active');

		this.hidePages();

	},

	lose : function() {

		$('#loser').show();
		$('#restartButton').show();

	},

	win : function() {

		$('#winner').show();

	},

	error: function() {

		$('#error').show();

	},

	hidePages : function() {

		$('#about').hide();
		$('#settings').hide();
		$('#stats').hide();
		$('#instructions').hide();

		$('#aboutButton').removeClass('active');
		$('#settingsButton').removeClass('active');
		$('#statsButton').removeClass('active');
		$('#instructionsButton').removeClass('active');

		$('#apply').removeClass( 'active' );

	},

	changedSettings : function( resize ) {

		if ( resize ) {

			Settings.changedSize = true;

		} else {

			Settings.changed = true;

		}

		$('#apply').addClass( 'active' );

	}

};