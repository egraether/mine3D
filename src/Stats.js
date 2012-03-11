var Stats = {

	storage : null,

	init : function() {

		this.storage = window.localStorage || {

			storage : {},

			setItem : function( key, value ) {

				this.storage[key] = value.toString();

			},

			getItem : function( key ) {

				return this.storage[key];

			},

			clear : function() {

				this.storage = {};

			}

		};

	},

	read : function( key ) {

		return parseInt( this.storage.getItem( key ) ) || 0;

	},

	write : function( key, value ) {

		this.storage.setItem( key, value );

	},

	clear : function() {

		this.storage.clear();

	},

	updateScore : function( name, time ) {

		var oldTime = this.read( name );

		if ( !oldTime || time < oldTime ) {

			this.write( name, time );

			return true;

		}

		return false;

	},

	updateStats : function( time, won ) {

		if ( won ) {

			this.write( 'gamesWon', this.read( 'gamesWon' ) + 1 );

		}

		this.write( 'gamesPlayed', this.read( 'gamesPlayed' ) + 1 );
		this.write( 'timePlayed', this.read( 'timePlayed' ) + time );

	},

	saveSettings : function() {

		var levelName = Settings.currentLevel.name;

		if ( levelName === 'custom' ) {

			levelName = 'easy';

		}

		this.storage.setItem( 'settings', true );

		this.storage.setItem( 'level', levelName );
		this.storage.setItem( 'mode', Settings.mode );

		this.storage.setItem( 'animations', Settings.animations );
		this.storage.setItem( 'recenter', Settings.recenter );

	},

	loadSettings : function() {

		if ( this.storage.getItem( 'settings' )) {

			Settings.currentLevel = Settings.levels[this.storage.getItem( 'level' )];
			Settings.mode = this.storage.getItem( 'mode' );

			Settings.animations = this.storage.getItem( 'animations' ) === 'true';
			Settings.recenter = this.storage.getItem( 'recenter' ) === 'true';

		}

	}

};