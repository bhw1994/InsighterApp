/**
 * Created by bhw on 2015-08-05.
 */

/*

DbAccessor 사용법

DbAccessor.js 인클루드 한다
DbAccessor.insert(tableName,ValueArr);
DbAccessor.createTable(tableName);
DbAccessor.select(Query sentence);  Or DbAccessor.select(target , tableName);


*/


function DbAccessor()
{
    this.db;
    this.dbName="test";
    this.init();
}
DbAccessor.prototype.init=function(){

    var self=this;
    switch (arguments.length)
    {
        case 4:
            this.db = window.openDatabase(arguments[0], arguments[1], arguments[2], arguments[3]);
            break;
        default :
            this.db = window.openDatabase(self.dbName, "1.0", "Test DB", 1000000);
            break;
    }
}

DbAccessor.prototype.changeQuery=function(){
    switch (arguments.length)
    {
        case 1:

            this.db.transaction(arguments[0], errorCB, successCB);
            break;
        case 2:
            this.db.transaction(arguments[0], errorCB, arguments[1]);
            break;
        case 3:
            this.db.transaction(arguments[0], arguments[1], arguments[2]);
            break;
        default :
            alert("argument number error");
            break;

    }
    //this.db.transaction(populateDB, errorCB, successCB);
};
DbAccessor.prototype.resultQuery=function(){
    switch (arguments.length)
    {
        case 1:
            this.db.transaction(arguments[0], errorCB);
            break;
        case 2:
            this.db.transaction(arguments[0], arguments[1]);
            break;
        default :
            alert("argument number error");
            break;

    }
    //db.transaction(queryDB, errorCB);
};

DbAccessor.prototype.createTable=function(tableName,valueArr)
{

    var self=this;

    var str="CREATE TABLE IF NOT EXISTS "+tableName+" ("+valueArr.join(",")+")";
    var queryFunc=self.makeQueryFunc(str);
    self.changeQuery(queryFunc);

}
DbAccessor.prototype.insert=function(tableName,valueArr){
    var self=this;

    var str="insert into "+tableName+" values(\""+valueArr.join("\",\"")+"\")";
    var queryFunc=self.makeQueryFunc(str);
    self.changeQuery(queryFunc);
};
DbAccessor.prototype.select=function(){
    var self=this;

    var queryFunc;
    switch(arguments.length)
    {
        case 1:
            queryFunc=self.makeQueryFunc(arguments[0],querySuccess);
            self.resultQuery(queryFunc);
            break;

        case 2:
            var str="select "+arguments[1]+" from "+arguments[0];
            var queryFunc=self.makeQueryFunc(str,querySuccess);
            self.resultQuery(queryFunc);
            break;

        default:
            break;

    }
}
DbAccessor.prototype.makeQueryFunc=function()
{

    var arg=arguments;
    switch (arguments.length)
    {
        case 1:

            return function (tx){
                tx.executeSql(arg[0]);
            };
        case 2:
            return function(tx){
                tx.executeSql(arg[0],[],arg[1],errorCB);
            };

    }

}

function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS DEMO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
    tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
    tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
}

function errorCB(err) {
    alert("Error processing SQL: "+err.message);
}

function successCB() {
    console.log("success!");
}


function queryDB(tx) {
    tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function querySuccess(tx, results) {

    var resultString='';
    var len = results.rows.length;
    resultString+=len+" rows found.\n";

    for (var i=0; i<len; i++){
        resultString+="Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data+"\n";
    }
    alert(resultString);
}

var dbAccessor=new DbAccessor();