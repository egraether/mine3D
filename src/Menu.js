var Menu = {

	mode : null,
	level : null,

	animations : true,
	recenter : true,

	resize : false,

	pageNames : [
		'about',
		'settings',
		'stats',
		'instructions',
		'controls'
	],

	levelNames : [
		'classic' + 'easy',
		'sweep' + 'easy',

		'classic' + 'medium',
		'sweep' + 'medium',

		'classic' + 'hard',
		'sweep' + 'hard'
	],

	init : function() {

		$('#newButton').show();
		$('#menuButton').show();

		$('#welcome').show();

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

		$('#shareButton').click(function() {

			$(this).toggleClass('active');
			$('#share').toggle();

		});

		this.initMenu();

		this.initSettings();

		this.initStats();

	},

	initMenu : function() {

		var names = this.pageNames,
			i;

		function clickHandler( name ) {

			return function() {

				Menu.hidePages();

				$('#' + name + 'Button').addClass( 'active' );
				$('#' + name).show();

			}

		}

		for ( i = 0; i < names.length; i++ ) {

			$('#' + names[i] + 'Button').click( clickHandler( names[i] ) );

		}

	},

	initSettings : function() {

		function setMode( modeName ) {

			if ( !($('#' + modeName).hasClass( 'active' )) ) {

				$('#classic').removeClass( 'active' );
				$('#sweep').removeClass( 'active' );

				$('#' + modeName).addClass( 'active' );
				Menu.mode = modeName;

				Menu.changedSettings( false );

			}

		};

		$('#classic').click(function() {

			setMode( 'classic' );

		});

		$('#sweep').click(function() {

			setMode( 'sweep' );

		});


		$('#playClassicButton').click(function() {

			setMode( 'classic' );

			Settings.setFromMenu();

			Game.start( Menu.resize );
			Menu.hide();

			$('#apply').removeClass( 'active' );
			$('#apply').hide();

		});

		$('#playSweepButton').click(function() {

			Menu.hide();

		});


		function setLevel( levelName ) {

			if ( !( $('#' + levelName).hasClass( 'active') ) ) {

				$('#easy').removeClass( 'active' );
				$('#medium').removeClass( 'active' );
				$('#hard').removeClass( 'active' );

				$('#' + levelName).addClass( 'active');
				Menu.level = Settings.levels[levelName];

				Menu.changedSettings( true );

			}

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


		function toggleFunction( name, on ) {

			if ( on !== Menu[name] ) {

				$('#' + name + 'On').toggleClass( 'active' );
				$('#' + name + 'Off').toggleClass( 'active' );

				Menu[name] = on;
				Menu.changedSettings( false );

			}

		};

		$('#animationsOn').click( function() {

			toggleFunction( 'animations', true );

		});

		$('#animationsOff').click( function() {

			toggleFunction( 'animations', false );

		});

		$('#recenterOn').click( function() {

			toggleFunction( 'recenter', true );

		});

		$('#recenterOff').click( function() {

			toggleFunction( 'recenter', false );

		});

		setMode( 'sweep' );
		setLevel( 'easy' );

		$('#animationsOn').addClass('active');
		$('#recenterOn').addClass('active');


		$('#apply').click(function() {

			if ( $(this).hasClass( 'active' ) ) {

				Settings.setFromMenu();

				Game.start( Menu.resize );
				Menu.hide();

				$(this).removeClass( 'active' );
				$(this).hide();

				Menu.resize = false;

			}

		});

		$('#apply').hide();

	},

	initStats : function() {

		function togglePrompt() {

			$('#clearButton').toggleClass( 'active' );
			$('#clearPrompt').toggle();

		}

		$('#clearButton').click( togglePrompt );

		$('#clearNowButton').click( function() {

			togglePrompt();
			Stats.clear();

			Menu.loadStats();

		});

		Menu.loadStats();

	},

	loadStats : function() {

		var names = this.levelNames,
			i;

		for ( i = 0; i < names.length; i++ ) {

			this.setBestTime( names[i] );

		}

		this.updateStats();

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

		$('#overlay').css('z-index', 0);
		$("#overlay").fadeTo(500, 0.7);

	},

	hide : function() {

		$('#menu').toggle( false );
		$('#menuButton').removeClass( 'active' );

		$("#overlay").fadeTo(100, 0.0, function() {

			$('#overlay').css('z-index', -1);

		});

		this.hidePages();

	},

	toggle : function() {

		if ( $('#menu').is(":visible") ) {

			this.hide();

		} else {

			this.show();

		}

	},

	hidePages : function() {

		var names = this.levelNames,
			i;

		for ( i = 0; i < names.length; i++ ) {

			$('#' + names[i]).removeClass('active');

		}

		names = this.pageNames;

		for ( i = 0; i < names.length; i++ ) {

			$('#' + names[i]).hide();
			$('#' + names[i] + 'Button').removeClass('active');

		}

		$('#newButton').removeClass( 'active' );
		$('#welcomeWrapper').hide();

	},

	showWelcome : function() {

		$('#overlay').show();
		$('#welcomeWrapper').show();

	},

	lose : function() {

		$('#loser').show();
		// $('#restartButton').show();
		$('#newButton').addClass( 'active' );

	},

	win : function() {

		$('#winner').show();
		$('#newButton').addClass( 'active' );

	},

	error: function() {

		$('#error').show();

	},

	changedSettings : function( resize ) {

		if ( resize ) {

			this.resize = true;

		}

		$('#apply').addClass( 'active' );
		$('#apply').show();

	},

	setBestTime : function( name ) {

		var time = Stats.read( name );

		$('#' + name).text( Math.floor( time * 0.001 ) || '-' );

	},

	updateTime : function( name, time ) {

		this.setBestTime( name );

		Menu.hide();
		Menu.show();

		$('#' + name).addClass( 'active' );

		$('#statsButton').addClass( 'active' );
		$('#stats').show();

	},

	updateStats : function() {

		$('#gamesWon').text( Stats.read( 'gamesWon' ) || 0 );
		$('#gamesPlayed').text( Stats.read( 'gamesPlayed' ) || 0 );
		$('#timePlayed').text( Math.floor( Stats.read( 'timePlayed' ) * 0.001 ) || 0 );

	}

};