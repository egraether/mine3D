var Stats = {

	init : function() {

	},

	read : function( key ) {

		var storage = window.localStorage;

		return storage ? parseInt( storage.getItem( key ) ) : null;

	},

	write : function( key, value ) {

		var storage = window.localStorage;

		if ( storage ) {

			storage.setItem( key, value );

		}

	},

	clear : function() {

		var storage = window.localStorage;

		if ( storage ) {

			storage.clear();

		}

	},

	updateBestTime : function( name, time ) {

		var oldTime = this.read( name );

		if ( oldTime ) {

			if ( time < oldTime ) {

				this.write( name, time );

				return true;

			}

		} else if ( this.storage ) {

			this.write( name, time );

			return true;

		}

		return false;

	},

	updateStats : function( time, won ) {

		var storage = window.localStorage;

		if ( storage ) {

			if ( won ) {

				storage.setItem( 'gamesWon', parseInt( storage.getItem( 'gamesWon' ) || 0 ) + 1 );

			}

			storage.setItem( 'gamesPlayed', parseInt( storage.getItem( 'gamesPlayed' ) || 0 ) + 1 );
			storage.setItem( 'timePlayed', parseInt( storage.getItem( 'timePlayed' ) || 0 ) + time );

		}

	}

};