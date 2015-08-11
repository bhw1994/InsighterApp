/**
 * Created by bhw on 2015-08-11.
 */

function Deferred()
{
    this.promise=new Promise(function(resolve,reject){
        this._resolve=resolve;
        this._reject=reject;
    }.bind(this))
}
Deferred.prototype.resolve=function(value){
    this._resolve.call(this.promise,value);
};
Deferred.prototype.reject=function(error){
    this._reject.call(this.promise,error);
};
