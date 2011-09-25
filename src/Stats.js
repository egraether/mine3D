var Stats = {

	storage : null,

	init : function() {

		this.storage = window.localStorage;

		if ( this.storage ) {

			console.log( this.storage );

		}

	},

	read : function( key ) {

		if ( this.storage ) {

			return parseInt( this.storage.getItem( key ) );

		} else {

			return null;

		}

	},

	write : function( key, value ) {

		if ( this.storage ) {

			this.storage.setItem( key, value );

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

};