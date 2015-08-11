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
            self.db = window.openDatabase(arguments[0], arguments[1], arguments[2], arguments[3]);
            break;

        default :
            self.db = window.openDatabase(self.dbName, "1.0", "Test DB", 1000000);
            break;
    }
}

function errorCB(err) {
    alert("Error processing SQL: "+err.message);
}

function successCB() {
    console.log("success!");
}


DbAccessor.prototype.transaction=function()
{
    var arg=arguments;
    var self=this;

    switch (arg.length)
    {
        case 1:
            self.db.transaction(arg[0]);
            break;

        case 2:
            self.db.transaction(arg[0],arg[1]);
            break;

        case 3:
            self.db.transaction(arg[0],arg[1],arg[2]);
            break;
    }
//this.db.transaction(query,error,succeess);
}

DbAccessor.prototype.makeExecuteSql=function()
{

    var arg=arguments;
    switch (arguments.length)
    {
        case 1:
            return function (tx){
                tx.executeSql(arg[0],successCB,errorCB);
            };
        case 2:
            return function(tx){
                tx.executeSql(arg[0],[],arg[1],errorCB);
            };

        case 3:
            return function(tx){
                tx.executeSql(arg[0],[],arg[1],arg[2]);
            };


    }

}
DbAccessor.prototype.makeQuerySuccess=function(logFunc,dfd){
    return function(tx,results){
        logFunc(tx, results);
        dfd.resolve(results);

    }
}
DbAccessor.prototype.select=function()
{
    var self=this;
    var arg=arguments;

    var dfd= new Deferred();


    switch(arguments.length)
    {
        case 1:
            var success=dbAccessor.makeQuerySuccess(querySuccess,dfd);
            var sql=dbAccessor.makeExecuteSql(arg[0],success,errorCB);
            dbAccessor.transaction(sql,errorCB,successCB);
            break;
        case 2:
            var str="select "+arg[1]+" from "+arg[0];
            var success=dbAccessor.makeQuerySuccess(querySuccess,dfd);
            var sql=dbAccessor.makeExecuteSql(str,success,errorCB);
            dbAccessor.transaction(sql,errorCB,successCB);
            break;
    }


    return dfd.promise;
}





DbAccessor.prototype.createTable=function(tableName,valueArr)
{

    var self=this;

    var str="CREATE TABLE IF NOT EXISTS "+tableName+" ("+valueArr.join(",")+")";
    var sql=self.makeExecuteSql(str);
    self.transaction(sql);
}
DbAccessor.prototype.dropTable=function(tableName)
{
    var self=this;

    var str="DROP TABLE IF EXISTS "+tableName;
    var sql=self.makeExecuteSql(str);
    self.transaction(sql);
}
DbAccessor.prototype.insert=function(tableName,valueArr){
    var self=this;

    var str="insert into "+tableName+" values(\""+valueArr.join("\",\"")+"\")";

    var sql=self.makeExecuteSql(str);
    self.transaction(sql);

};


DbAccessor.prototype.checkTable=function(tableName){
    var self=this;

    var str="SELECT name FROM sqlite_master WHERE type='table' AND name='"+tableName+"'";
    var promise=self.select(str);

    var resultPromise=promise.then(function(results){
        var _promise;
        if(self.hasRow(results))
        {
            _promise=Promise.resolve();
        }
        else
        {
            _promise=Promise.reject();
        }
        return _promise;
    })
    return resultPromise;
}

DbAccessor.prototype.hasRow=function(results)
{
    return results.rows.length;
}

/*
DbAccessor.prototype.hasTable(tableName)
{
    var self=this;
    var str="SELECT name FROM sqlite_master WHERE type='table' AND name='"+tableName+"'";
    var dfd=self.select(str);

}


DbAccessor.prototype.downloadTable=function(results)
{
    if(!results.rows.length)
    {
        var data=downloadWordTable();
        insertResources(window.sessionStorage.getItem("selectedTable"),data);
    }

}
DbAccessor.prototype.showWordTable=function(tableName)
{

}


function addListView(results){
    for(var index=0;index<results.rows.length;index++) {
        $("#wordLists").append("<li>" + results.rows[index].word +  "</li>");
    }
}




function downloadWordTable() {

    var getData;
    $.ajax({
        url: "http://192.168.0.7:9611",
        async: true,
        success: function (data) {
            getData = data;
        },
        error: function (e) {
            getData = null;
            alert("download error");
            // $("#test").find("h1").text("error");
        }
    });
    return getData;
}

*/
function insertResources(tableName, wordTableResource){
    var id=0;
    dbAccessor.createTable(tableName);
    for(var index in wordTableResource.wordMap){
        var wordSet = wordTableResource.wordMap[index];
        id++;
        dbAccessor.insert(tableName, [id,wordSet.word,wordSet.mean]);
    }

}




function querySuccess(tx, results) {

    var resultString='';
    var len = results.rows.length;
    resultString+=len+" rows found.\n";

    for (var i=0; i<len; i++){
        resultString+="Row = " + i + " ID = " + results.rows.item(i).id + " word =  " + results.rows.item(i).word+" mean =  " + results.rows.item(i).mean+"\n";
    }
    alert(resultString);
}


var dbAccessor=new DbAccessor();



/*
 DbAccessor.prototype.select=function(){
 var arg=arguments;
 var self=this;

 var promise= $.deferred();
 var queryFunc;
 switch(arguments.length)
 {
 case 1:
 var querySuccessFunc=self.makeQuerySuccessFunc(querySuccess,null);
 queryFunc=self.makeQueryFunc(arg[0],querySuccessFunc);
 self.transaction(queryFunc);
 break;

 case 2:
 if(typeof(arg[1])=="function")
 {
 var querySuccessFunc=self.makeQuerySuccessFunc(querySuccess,arg[1]);
 queryFunc=self.makeQueryFunc(arg[0],querySuccessFunc);
 self.transaction(queryFunc);
 }
 else
 {
 var str="select "+arg[1]+" from "+arg[0];
 queryFunc=self.makeQueryFunc(str,querySuccess);
 self.transaction(queryFunc);
 }

 break;
 case 3:

 var querySuccessFunc=self.makeQuerySuccessFunc(querySuccess,arg[2]);
 var str="select "+arg[1]+" from "+arg[0];
 var queryFunc=self.makeQueryFunc(str,querySuccessFunc);
 self.transaction(queryFunc);
 break;

 default:
 break;

 }




 return promise.promise();

 }
 */