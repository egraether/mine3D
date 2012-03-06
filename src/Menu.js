var Menu = {

	mode : null,
	level : null,

	animations : false,
	recenter : false,

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

	fsm : null,

	init : function() {

		this.fsm = new StateMachine( this );

		this.fsm.init({

			initial : 'init',

			states : [
				{ name : 'init' },
				{ name : 'welcome', enter : this.enterWelcome, exit : this.exitWelcome },
				{ name : 'level', enter : this.enterLevel, exit : this.exitLevel },
				{ name : 'play', enter : this.enterPlay },
				{ name : 'menu', enter : this.enterMenu, exit : this.exitMenu },
				{ name : 'custom'},
				{ name : 'info'},
				{ name : 'gameover'},
				{ name : 'error'}
			],

			transitions : [
				{ name : 'showWelcome', from : 'init', to: 'welcome' },
				{ name : 'chooseLevel', from : 'welcome', to: 'level' },

				{ name : 'play', from : '*', to: 'play', callback : this.onPlay },

				{ name : 'showMenu', from : 'play', to: 'menu', callback : this.onShowMenu },

				{ name : 'setCustom', from : 'menu', to: 'custom', callback : this.onSetCustom },
				{ name : 'backToMenu', from : 'custom', to: 'menu', callback : this.onBackToMenu },

				{ name : 'win', from : 'play', to: 'gameover', callback : this.onWin },
				{ name : 'lose', from : 'play', to: 'gameover', callback : this.onLose },

				{ name : 'showInfo', from : 'play', to: 'info', callback : this.onInfo },
			]

		});


		$('#newButton').click(function () {

			Game.start();
			Menu.fsm.play();

		});

		$('#menuButton').click(function () {

			Menu.toggle();

		});

		$('#restartButton').click(function() {

			Game.restart();
			Menu.fsm.play();

		});

		// function toggleButton( name ) {
		// 
		// 	$('#' + name + 'Button').toggleClass('active');
		// 	$('#' + name).toggle();
		// 
		// };

		$('#shareButton').click(function() {

			// toggleButton( 'share' );

		});

		$('#feedbackButton').click(function() {

			// toggleButton( 'feedback' );

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

		$('#classic').click(function() {

			Menu.setMode( 'classic' );

		});

		$('#sweep').click(function() {

			Menu.setMode( 'sweep' );

		});


		$('#easy').click(function() {

			Menu.setLevel( 'easy' );

		});

		$('#medium').click(function() {

			Menu.setLevel( 'medium' );

		});

		$('#hard').click(function() {

			Menu.setLevel( 'hard' );

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


		$('#apply').click(function() {

			Menu.fsm.play();
			Menu.applyChanges();

		});


		this.setMode( Settings.mode );
		this.setLevel( Settings.currentLevel.name );

		this.animations = Settings.animations;
		this.recenter = Settings.recenter;

		$('#animations' + (Settings.animations ? 'On' : 'Off') ).addClass('active');
		$('#recenter' + (Settings.recenter ? 'On' : 'Off') ).addClass('active');

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

			this.setScore( names[i] );

		}

		this.updateStats();

	},

	setMode : function( modeName ) {

		$('#classic').removeClass( 'active' );
		$('#sweep').removeClass( 'active' );

		$('#' + modeName).addClass( 'active' );

		if ( this.mode !== modeName ) {

			this.changedSettings( false );

		}

		this.mode = modeName;

	},

	setLevel : function( levelName ) {

		$('#easy').removeClass( 'active' );
		$('#medium').removeClass( 'active' );
		$('#hard').removeClass( 'active' );

		$('#' + levelName).addClass( 'active');

		if ( this.level !== Settings.levels[levelName] ) {

			this.changedSettings( true );

		}

		this.level = Settings.levels[levelName]

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

		$('#menu').show();
		$('#menuButton').addClass( 'active' );

	},

	hide : function() {

		$('#menu').hide();
		$('#menuButton').removeClass( 'active' );

		this.hidePages();

	},

	toggle : function() {

		if ( this.fsm.hasState( 'play' ) ) {

			this.fsm.showMenu();

		} else {

			this.fsm.play();

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

	},

	enterWelcome : function() {

		$('#overlay').show();
		$('#welcome').show();

		$('#playClassicButton').click( function() {

			Menu.setMode( 'classic' );
			Menu.fsm.chooseLevel();

		});

		$('#playSweepButton').click( function() {

			Menu.setMode( 'sweep' );
			Menu.fsm.chooseLevel();

		});

	},

	exitWelcome : function() {

		$('#welcome').hide();

	},

	enterLevel : function() {

		$('#level').show();

		$('#easyButton').click( function() {

			Menu.setLevel( 'easy' );
			Menu.fsm.play();

		});

		$('#mediumButton').click( function() {

			Menu.setLevel( 'medium' );
			Menu.fsm.play();

		});

		$('#hardButton').click( function() {

			Menu.setLevel( 'hard' );
			Menu.fsm.play();

		});

		$('#customButton').click( function() {

			Menu.setLevel( 'easy' );
			Menu.fsm.play();

		});

	},

	exitLevel : function() {

		this.overlayOut();
		$('#level').hide();

		this.showHUD();
		this.applyChanges();

	},

	enterPlay : function() {

		

	},

	onPlay : function() {

		

	},

	enterMenu : function() {

		this.show();
		this.overlayIn( 1 );

	},

	exitMenu : function() {

		this.hide();
		this.overlayOut();

	},

	showHUD : function() {

		$('#newButton').show();
		$('#menuButton').show();

		$('#shareButton').show();
		$('#feedbackButton').show();

		$('#timeDisplay').show();
		$('#mineDisplay').show();

		$('#overlay').click(function() {

			Menu.fsm.play();

		});

		EventHandler.init();

	},

	error : function() {

		$('#error').show();

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

	changedSettings : function( resize ) {

		if ( resize ) {

			this.resize = true;

		}

		$('#apply').show();

	},

	applyChanges : function() {

		Settings.setFromMenu();
		Stats.saveSettings();

		Game.start( this.resize );

		$('#apply').hide();

		this.resize = false;

	},

	setScore : function( name ) {

		var time = Stats.read( name );

		$('#' + name).text( Math.floor( time * 0.001 ) || '-' );

	},

	showScores : function( name ) {

		this.setScore( name );

		Menu.show();

		$('#' + name).addClass( 'active' );

		$('#statsButton').addClass( 'active' );
		$('#stats').show();

	},

	updateStats : function() {

		$('#gamesWon').text( Stats.read( 'gamesWon' ) || 0 );
		$('#gamesPlayed').text( Stats.read( 'gamesPlayed' ) || 0 );
		$('#timePlayed').text( Math.floor( Stats.read( 'timePlayed' ) * 0.001 ) || 0 );

	},

	overlayIn : function( zIndex ) {

		$('#overlay').css( 'z-index', zIndex );
		$("#overlay").fadeTo( 500, 0.7 );

	},

	overlayOut : function() {

		$("#overlay").fadeTo( 100, 0.0, function() {

			$('#overlay').css( 'z-index', -1 );

		});

	}

};