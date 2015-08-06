/**
 * Created by bhw on 2015-08-05.
 */
function DbAccessor()
{
    this.db;
    this.init();
}
DbAccessor.prototype.init=function(){

    switch (arguments.length)
    {
        case 4:
            this.db = window.openDatabase(arguments[0], arguments[1], arguments[2], arguments[3]);
            break;
        default :
            this.db = window.openDatabase("test", "1.0", "Test DB", 1000000);
            break;
    }
}