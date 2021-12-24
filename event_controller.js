
class EventController{

    constructor(){
        this.listeners = {};
    }
    //cb( e )
    regListener( type, cb ){

        var vec = this.listeners[type];
        if( null == vec ){
            vec = []
            this.listeners[type] = vec;
        }

        vec.push( cb );
    }
    unregListener( type, cb ){
        var vec = this.listeners[type];

        var tmp = null;
        for( var l=vec.length, i=l-1; i>=0; --i ){
            tmp = vec[i];
            if( tmp == cb ){
                vec.splice( i,1 );
            }
        }
    }
    dispatch( type, uid, e ){
        var vec = this.listeners[type];
        if( null == vec ) return

        for( var i=0,l=vec.length; i<l; ++i ){
            var cb = vec[i];
            cb(uid, e);
        }
    }
}


function test_event_controller(){

    var cb_test1 = function( e ){
        console.log( "test 1", e );
    }

    var cb_test2 = function( e ){
        console.log( "test 2", e );
    }

    var cb_test3 = function( e ){
        console.log( "test 3", e );
    }

    var cb_hello = function( e ){
        console.log( "hello", e );
    }


    var o = new EventController();
    o.regListener( "test", cb_test1 );
    o.regListener( "test", cb_test2 );
    o.regListener( "test", cb_test3 );

    o.regListener( "hello", cb_hello );

    o.unregListener( "test", cb_test1 );

    o.dispatch( "test", "111" );
    o.dispatch( "hello", "222" );

    var str = "{\"x\":1,\"y\":2}";
    var obj = JSON.parse(str);
    console.log( obj.x, obj.y );
}

if (require.main === module) {
    test_event_controller();
}
module.exports = EventController;
