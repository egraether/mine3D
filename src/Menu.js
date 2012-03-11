var Menu = {

	mode : null,
	level : null,

	customDimensions : vec3.create(),
	customMines : 0,

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
		'classiceasy',
		'sweepeasy',

		'classicmedium',
		'sweepmedium',

		'classichard',
		'sweephard'
	],

	fsm : null,

	secrets : {

		'classiceasy' : [
			'mainAlpha=0.3&hoverAlpha=1',
			'grid=30,16,1,99'
		],

		'sweepeasy' : [
			'backgroundColor=0x672824',
			'cubeSpacing=0.5',
			'numberSize=0.4'
		],

		'classicmedium' : [
			'controlSpeed=5'
		],

		'sweepmedium' : [
			'invertedControls=1',
			'invertedNumbers=1'
		],

		'classichard' : [
			'drawBigCubes=1'
		],

		'sweephard' : [
			'drawLines=1'
		]

	},

	secretCounter : Math.floor( Math.random() * 100 ),

	init : function() {

		this.fsm = new StateMachine( this );

		this.fsm.init({

			initial : 'init',

			states : [
				{ name : 'init' },
				{ name : 'welcome', enter : this.enterWelcome, exit : this.exitWelcome },
				{ name : 'level', enter : this.enterLevel, exit : this.exitLevel },
				{ name : 'play' },
				{ name : 'menu', enter : this.enterMenu, exit : this.exitMenu },
				{ name : 'gameover', enter : this.enterGameOver, exit : this.exitGameOver }
			],

			transitions : [
				{ name : 'play', from : '*', to: 'play', callback : this.onPlay },

				{ name : 'win', from : 'play', to: 'gameover', callback : this.onWin },
				{ name : 'lose', from : 'play', to: 'gameover', callback : this.onLose }
			]

		});


		$('.newButton').click(function () {

			Game.start();
			Menu.fsm.changeState( 'play' );

		});

		$('#menuButton').click(function () {

			Menu.toggle();

		});

		$('#restartButton').click(function() {

			Game.restart();
			Menu.fsm.changeState( 'play' );

		});

		function toggleButton( name, other ) {

			$('#' + name + 'Button').toggleClass('active');
			$('#' + name).toggle();

			$('#' + other + 'Button').removeClass('active');
			$('#' + other).hide();

		};

		$('#shareButton').click(function() { toggleButton( 'share', 'feedback' ); });
		$('#feedbackButton').click(function() { toggleButton( 'feedback', 'share' ); });


		$('#playClassicButton').click( function() {

			Menu.setMode( 'classic' );
			Menu.fsm.changeState( 'level' );

		});

		$('#playSweepButton').click( function() {

			Menu.setMode( 'sweep' );
			Menu.fsm.changeState( 'level' );

		});


		$('#cancel').click( function() {

			Menu.fsm.changeState( 'welcome' );

		});

		$('#ok').click( function() {

			Menu.fsm.play();

		});


		this.initMenu();

		this.initSettings();

		this.initStats();

		$('.button').disableSelection();

		var i;

		for ( i = 0; i < 4; i++ ) {

			$('.customUp' + i).disableSelection();
			$('.customDown' + i).disableSelection();

		}

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

		$('#classic').click( function() { Menu.setMode( 'classic' ); });
		$('#sweep').click( function() { Menu.setMode( 'sweep' ); });

		$('.easy').click( function() { Menu.setLevel( 'easy' ); });
		$('.medium').click( function() { Menu.setLevel( 'medium' ); });
		$('.hard').click( function() { Menu.setLevel( 'hard' ); });

		$('.custom').click( function() { Menu.setLevel( 'custom' ); });

		function toggleFunction( name, on ) {

			if ( on !== Menu[name] ) {

				$('#' + name + 'On').toggleClass( 'active' );
				$('#' + name + 'Off').toggleClass( 'active' );

				Menu[name] = on;
				Menu.changedSettings( false );

			}

		};

		$('#animationsOn').click( function() { toggleFunction( 'animations', true ); });
		$('#animationsOff').click( function() { toggleFunction( 'animations', false ); });

		$('#recenterOn').click( function() { toggleFunction( 'recenter', true ); });
		$('#recenterOff').click( function() { toggleFunction( 'recenter', false ); });


		$('#apply').click(function() {

			Menu.fsm.changeState( 'play' );
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

			this.showScore( names[i] );

		}

		this.updateStats();

	},

	showScore : function( name ) {

		var time = Stats.read( name );

		$('#' + name).text( Math.floor( time * 0.001 ) || '-' );

	},

	updateEndScreenTimes : function() {

		var time = Stats.read( Settings.getKey() );

		$('.gameTime').text( Math.floor( Grid.playTime * 0.001 ) );
		$('.bestTime').text( Math.floor( time * 0.001 ) || '-' );

	},

	updateStats : function() {

		$('#gamesWon').text( Stats.read( 'gamesWon' ) || 0 );
		$('#gamesPlayed').text( Stats.read( 'gamesPlayed' ) || 0 );
		$('#timePlayed').text( Math.floor( Stats.read( 'timePlayed' ) * 0.001 ) || 0 );

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

		$('.easy').removeClass( 'active' );
		$('.medium').removeClass( 'active' );
		$('.hard').removeClass( 'active' );
		$('.custom').removeClass( 'active' );

		$('.' + levelName).addClass( 'active');
		this.toggleCustom();

		if ( this.level !== Settings.levels[levelName] ) {

			this.changedSettings( true );

		}

		this.level = Settings.levels[levelName];

		if ( levelName !== 'custom' ) {

			this.updateCustom( this.level );

		}

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

		if ( this.fsm.hasState( 'menu' ) ) {

			this.fsm.changeState( 'play' );

		} else {

			this.fsm.changeState( 'menu' );

		}

	},

	hidePages : function() {

		var names = this.pageNames,
			i;

		for ( i = 0; i < names.length; i++ ) {

			$('#' + names[i]).hide();
			$('#' + names[i] + 'Button').removeClass('active');

		}

		$('#newButton').removeClass( 'active' );

	},

	showHUD : function() {

		$('#newButton').show();
		$('#menuButton').show();

		$('#shareButton').show();
		$('#feedbackButton').show();

		$('#timeDisplay').show();
		$('#mineDisplay').show();

		$('#overlay').click(function() {

			Menu.fsm.changeState( 'play' );

		});

		EventHandler.bind();

	},

	enterWelcome : function() {

		$('#overlay').show();
		$('#welcome').show();

	},

	exitWelcome : function() {

		$('#welcome').hide();

	},

	enterLevel : function() {

		$('#levelPanel').show();

	},

	exitLevel : function() {

		$('#levelPanel').hide();

		Stats.write( 'hideWelcomeScreen', $('#welcomeCheckbox' ).attr( 'checked' ) ? 1 : 0 );

	},

	onPlay : function() {

		this.overlayOut();

		this.showHUD();
		this.applyChanges();

	},

	enterMenu : function() {

		this.show();
		this.overlayIn();

		$('#settingsButton').trigger( 'click' );

	},

	exitMenu : function() {

		this.overlayOut();
		this.hide();

	},

	onLose : function() {

		this.updateEndScreenTimes();

		$('#loser').show();

	},

	onWin : function() {

		var name = Settings.getKey(),
			secrets, secretUrl;

		$('#newBest').hide();
		$('#secret').hide();

		if ( Settings.currentLevel.name !== 'custom' ) {

			secrets = this.secrets[ name ];
			secretUrl = '?' + secrets[this.secretCounter % secrets.length];
			this.secretCounter++;

			$("#secretUrl").attr( "href", secretUrl ).text( secretUrl );
			$('#secret').show();

			if ( Stats.updateScore( name, Grid.playTime ) ) {

				this.showScore( name );
				$('#newBest').show();

			}

		}

		this.updateEndScreenTimes();

		$('#winner').show();

	},

	enterGameOver : function() {

		this.overlayIn();

	},

	exitGameOver : function() {

		$('#winner').hide();
		$('#loser').hide();

		this.overlayOut();

	},

	changedSettings : function( resize ) {

		if ( resize ) {

			this.resize = true;

		}

		$('#apply').show();

	},

	applyChanges : function() {

		if ( this.level.name === 'custom' ) {

			vec3.set(
				this.customDimensions,
				this.level.dimensions
			);

			this.level.mines = this.customMines;

		}

		Settings.setFromMenu();
		Stats.saveSettings();

		Game.start( this.resize );

		$('#apply').hide();

		this.resize = false;

	},

	overlayIn : function() {

		$('#overlay').stop();

		$('#overlay').css( 'z-index', 1 );
		$("#overlay").fadeTo( 500, 0.7, function() {} );

	},

	overlayOut : function() {

		$("#overlay").fadeTo( 100, 0.0, function() {

			$('#overlay').css( 'z-index', -1 );

		});

	},

	updateCustom : function( level ) {

		vec3.set( level.dimensions, this.customDimensions );
		this.customMines = level.mines;

		$('.custom0').text( level.dimensions[0] );
		$('.custom1').text( level.dimensions[1] );
		$('.custom2').text( level.dimensions[2] );

		$('.custom3').text( level.mines );

	},

	checkCustomButtons : function() {

		var dim = this.customDimensions,
			sum = [
				( dim[0] + 1 ) * dim[1] * dim[2],
				dim[0] * ( dim[1] + 1 ) * dim[2],
				dim[0] * dim[1] * ( dim[2] + 1 ),
				Math.floor( dim[0] * dim[1] * dim[2] * 0.8 )
			],
			i;

		for ( i = 0; i < 4; i++ ) {

			if ( i === 3 ? this.customMines >= sum[i] : sum[i] > maxCubes ) {

				this.disableCustomButton( i, true );

			} else if ( $('.customUp' + i).hasClass( 'disabled' ) ) {

				this.enableCustomButton( i, true );

			}

			if ( i === 3 ? this.customMines < 1 : dim[i] <= 1 ) {

				this.disableCustomButton( i, false );

			} else if ( $('.customDown' + i).hasClass( 'disabled' ) ) {

				this.enableCustomButton( i, false );

			}

		}

		if ( sum[3] < this.customMines ) {

			this.customMines = sum[3];
			$('.custom3').text( sum[3] );

		}

	},

	enableCustomButton: function( number, isUp ) {

		var name = '.custom' + ( isUp ? 'Up' : 'Down' ) + number;

		$(name).removeClass( 'disabled' );
		$(name).click( function() {

			var x;

			if ( number === 3 ) {

				x = isUp ? ++Menu.customMines : --Menu.customMines;

			} else {

				x = isUp ? ++Menu.customDimensions[number] : --Menu.customDimensions[number];

			}

			$('.custom' + number).text( x );

			Menu.checkCustomButtons();
			Menu.changedSettings( true );

		});

	},

	disableCustomButton: function( number, isUp ) {

		var name = '.custom' + ( isUp ? 'Up' : 'Down' ) + number;

		$( name ).addClass( 'disabled' );
		$( name ).unbind( 'click' );

	},

	toggleCustom : function() {

		var i;

		if ( $('.custom').hasClass( 'active' ) ) {

			this.checkCustomButtons();

		} else {

			for ( i = 0; i < 4; i++ ) {

				this.disableCustomButton( i, true );
				this.disableCustomButton( i, false );

			}

		}

	}

};