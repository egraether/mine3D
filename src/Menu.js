var Menu = {

	mode : null,
	level : null,

	animations : false,
	recenter : false,

	init : function() {

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


		function setMode( modeName ) {

			$('#classic').removeClass( 'active' );
			$('#sweep').removeClass( 'active' );

			$('#' + modeName).addClass( 'active' );
			Menu.mode = modeName;

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

		};

		function toggleRecenter() {

			$('#recenter').toggleClass( 'active' );
			Menu.recenter = !Menu.recenter;

		};

		$('#animations').click( toggleAnimation );
		$('#recenter').click( toggleRecenter );

		setMode( 'sweep' );
		setLevel( 'easy' );

		toggleAnimation();
		toggleRecenter();

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

	toggle : function() {

		$('#menu').toggle();
		$('#menuButton').toggleClass('active');

	},

	lose : function() {

		$('#loser').show();
		$('#restartButton').show();

	},

	win : function() {

		$('#winner').show();

	},

	show : function() {

		$('#time').show();
		$('#mines').show();

		$('#newButton').show();
		$('#menuButton').show();

	},

	hide : function() {

		$('#menu').toggle( false );
		$('#menuButton').removeClass( 'active' );

	},

	error: function() {

		$('#error').show();

	}

};