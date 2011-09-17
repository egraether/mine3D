var Menu = {

	init : function() {

		$('#newButton').click(function () {

			Game.start();

			$('#menu').toggle(false);
			$('#menuButton').removeClass('active');

		});

		$('#menuButton').click(function () {

			Menu.toggle();

		});

		$('#classic').click(function() {

			if ( !$(this).hasClass('active') ) {

				$(this).addClass('active');
				$('#sweep').removeClass('active');
				Settings.mode = 'classic';

			}

		});

		$('#sweep').click(function() {

			if ( !$(this).hasClass('active') ) {

				$(this).addClass('active');
				$('#classic').removeClass('active');
				Settings.mode = 'sweep';

			}

		});

		function setLevel( levelName ) {

			$('#easy').removeClass('active');
			$('#medium').removeClass('active');
			$('#hard').removeClass('active');

			$('#' + levelName).addClass('active');
			Settings.currentLevel = Settings.levels[levelName];

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

		$('#animations').click(function() {

			$(this).toggleClass('active');
			Settings.animated = !Settings.animated;

		});

		$('#recenter').click(function() {

			$(this).toggleClass('active');
			Settings.recenter = !Settings.recenter;

		});

		$('#sweep').addClass('active');
		$('#easy').addClass('active');

		$('#animations').addClass('active');
		$('#recenter').addClass('active');

	},

	setTime : function( time ) {

		$('#time').text( Math.floor( time * 0.001 ) );

	},

	setMines : function( mines ) {

		$('#mines').text( mines );

	},

	reset : function( time, mines ) {

		this.setTime( time );
		this.setMines( mines );

	},

	toggle : function() {

		$('#menu').toggle();
		$('#menuButton').toggleClass('active');

	}

};