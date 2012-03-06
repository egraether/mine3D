var StateMachine = function( scope ) {

	this.scope = scope;

	this.currentState = new this.State();

	this.states = {};
	this.transitions = {};

}

StateMachine.prototype = {

	State : function( params ) {

		params = params || {};

		this.name = params.name || 'none';

		this.enter = params.enter || function( fsm ) {};
		this.update = params.update || function( dt, fsm ) {};
		this.draw = params.draw || function( ctx, fsm ) {};
		this.exit = params.exit || function( fsm ) {};

	},

	Transition : function( params ) {

		params = params || {};

		this.name = params.name || 'none';
		this.from = params.from || 'none';
		this.to = params.to || 'none';
		this.callback = params.callback || function( fsm ) {};

	},

	init : function( params ) {

		var i,
			states = params.states instanceof Array ? params.states : [];
			transitions = params.transitions instanceof Array ? params.transitions : [];

		for ( i = 0; i < states.length; i++ ) {

			this.addState( new this.State( states[i] ) );

		}

		for ( i = 0; i < transitions.length; i++ ) {

			this.addTransition( new this.Transition( transitions[i] ) );

		}

		if ( this.states[params.initial] ) {

			this.changeState( params.initial );

		}

	},

	update : function( dt ) {

		this.currentState.update.call( this.scope, dt, this ) ;

	},

	draw : function( ctx ) {

		this.currentState.draw.call( this.scope, ctx, this );

	},

	addState : function( state ) {

		this.states[state.name] = state;

	},

	addTransition : function( transition ) {

		var self = this;

		this.transitions[transition.name] = transition;

		this[transition.name] = function() {

			if ( self.currentState.name !== transition.to &&
				( self.currentState.name === transition.from || transition.from === '*' ) ) {

				self.changeState( transition.to, transition.callback, arguments );

				return true;

			}

			return false;

		}

	},

	changeState : function( name, callback, args ) {

		var callbackArgs = [];

		this.currentState.exit.call( this.scope );

		this.currentState = this.states[name];

		if ( callback ) {

			args = args || [];

			callbackArgs.push.apply( callbackArgs, args );
			callbackArgs.push( this );

			callback.apply( this.scope, callbackArgs );

		}

		this.currentState.enter.call( this.scope );

	},

	hasState : function( name ) {

		return this.currentState.name === name;

	}

};
