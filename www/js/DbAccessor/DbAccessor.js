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
    this.querySentence='';
    this.init();
}
DbAccessor.prototype.init=function(){

    var self=this;

    var dbName;
    var dbVersion;
    var dbShowName;
    var dbSize;
    switch (arguments.length)
    {
        case 4:
            dbName=arguments[0];
            dbVersion=arguments[1];
            dbShowName=arguments[2];
            dbSize=arguments[3];
            break;

        default :
            dbName=self.dbName;
            dbVersion="1.0";
            dbShowName="Test DB";
            dbSize=1000000;
            break;
    }

    self.db = window.openDatabase(dbName, dbVersion, dbShowName,dbSize);

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

    var queryFunc;
    var errorFunc;
    var successFunc;

    switch (arg.length)
    {
        case 1:
            queryFunc=arg[0];
            errorFunc=errorCB;
            successFunc=successCB;
            break;

        case 2:
            queryFunc=arg[0];
            errorFunc=arg[1];
            successFunc=successCB;
            break;

        case 3:
            queryFunc=arg[0];
            errorFunc=arg[1];
            successFunc=arg[2];
            break;
    }

    self.db.transaction(queryFunc,errorFunc,successFunc);
}


DbAccessor.prototype.makeExecuteSql=function()
{

    var self=this;
    var arg=arguments;

    var sqlFunc;
    var successFunc;
    var errorFunc;

    switch (arguments.length)
    {
        case 1:
            sqlFunc=arg[0];
            successFunc=successCB;
            errorFunc=errorCB;
            break;

        case 2:
            sqlFunc=arg[0];
            successFunc=arg[1];
            errorFunc=errorCB;
            break;

        case 3:
            sqlFunc=arg[0];
            successFunc=arg[1];
            errorFunc=arg[2];
            break;
    }

    return function(tx){
        tx.executeSql(sqlFunc,successFunc,errorFunc);
    };

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

    var sqlSentence;

    switch(arguments.length)
    {
        case 1:

            sqlSentence=arg[0];
            break;
        case 2:
            sqlSentence="select "+arg[1]+" from "+arg[0];
            break;
    }

    var success=dbAccessor.makeQuerySuccess(querySuccess,dfd);
    var sql=dbAccessor.makeExecuteSql(sqlSentence,success,errorCB);
    dbAccessor.transaction(sql,errorCB,successCB);


    return dfd.promise;
}





DbAccessor.prototype.createTable=function(tableName,valueArr)
{

    var self=this;

    var dfd=new Deferred();

    var str="CREATE TABLE IF NOT EXISTS "+tableName+" ("+valueArr.join(",")+")";
    var success=self.makeQuerySuccess(successCB,dfd);
    var sql=self.makeExecuteSql(str,success);
    self.transaction(sql);
    return dfd.promise;
}
DbAccessor.prototype.dropTable=function(tableName)
{

    var self=this;

    var dfd=new Deferred();
    var str="DROP TABLE IF EXISTS "+tableName;
    var success=self.makeQuerySuccess(successCB,dfd);
    var sql=self.makeExecuteSql(str,success);

    self.transaction(sql);
    return dfd.promise;
}

DbAccessor.prototype.insert=function(tableName,valueArr){
    var self=this;

    var arg=arguments;
    var str;
    var dfd=new Deferred();

    switch(arguments.length)
    {
        case 1:
            str=arg[0];
            var success=self.makeQuerySuccess(successCB,dfd);
            var sql=self.makeExecuteSql(str,success);
            self.transaction(sql);
        case 2:
            str="insert into "+arg[0]+" values(\""+arg[1].join("\",\"")+"\")";
            var success=self.makeQuerySuccess(successCB,dfd);
            var sql=self.makeExecuteSql(str,success);
            self.transaction(sql);
            break;

        default:
            dfd.reject();
            alert("insert arguments error");
    }


    return dfd.promise;
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



function addListView(results){
    for(var index=0;index<results.rows.length;index++) {
        $("#wordLists").append("<li>" + results.rows[index].word +  "</li>");
    }
}




function downloadWordTable(tableName) {

    var getData;
    $.ajax({
        url: "http://192.168.0.7:9611",
        async: false,
        data:{title:tableName},
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


function makeInsertQuery(resultSet){

    var query = "insert into " + resultSet.title + " values ";
    var isFirstCategory = true;

    for(var i in resultSet.wordMap){
        if(i!=0)
            query+=",";

        query+="(";
        isFirstCategory=true;
        for(var j in resultSet.wordMap[i]) {
            if (!isFirstCategory) {
                query += ",";
            }else
                isFirstCategory=false;
            query += resultSet.wordMap[i][j];
        }
        query+=")";
    }
    return query;

}


var dbAccessor=new DbAccessor();

