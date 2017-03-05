'use strict';

var mysql = require("mysql");
const fs = require('fs');
const express = require("express");
const app = express();
app.use(require('body-parser').json());
var config = JSON.parse(fs.readFileSync("config.json"));
var port = 8080;
var todos;

// First you need to create a connection to the db
var pool  = mysql.createPool({
    "connectionLimit" : 10,

    "host"      : config.host,

    "user"      : config.user,

    "password"  : config.password,

    "port"      : config.port,

    "database"  : config.database

});


app.listen(port, () => { 
    console.log('applicatioin is listening on port', port);
});

function addTodo(item) {

    var q="INSERT INTO `todos`(`Name`,`Done`) VALUES ('"+ pool.escape(item.Name)+"','"+pool.escape(item.Done)+"');";
    //console.log(q);
    pool.getConnection(function(err, connection) {
        connection.query(q, function(err,rows){
            connection.release();
            if(err) throw err;
            console.log('row inserted succssfully :\n');
        });
    });
    return true;

}
function deletTodo(id) {

    var q="delete from `todos` where id= '"+pool.escape(id)+"';";
    //console.log(q);
    pool.getConnection(function(err, connection) {
        connection.query(q, function(err,rows){
            connection.release();
            if(err) throw err;
            console.log('row deleted succssfully :\n');
        });
    });
    return true;
}

function updateTodo(id,state) {

    var q="update `todos` set `Done`='"+pool.escape(state)+"' where Id='"+pool.escape(id)+"';";
    //console.log(q);
    pool.getConnection(function(err, connection) {
        connection.query(q, function(err,rows){
            connection.release();
            if(err) throw err;
            console.log('row updated succssfully :\n');
        });
    });
    return true;
}

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

app.get('/todos',(request,response,next) => {
    console.log('we got get request');
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM todos',function(err,rows) {
            if(err) throw err;
            console.log('Data received from Db:\n');
            response.status(200).json(rows);
            connection.release();
        });
    });

});

app.post('/todos',(request,response,next) => {
    console.log('we got a post request');
    var todo=request.body;

    if (!isEmptyObject(todo)) {
        if(todo.Done && todo.Name && (todo.Done==='1' || todo.Done==='0')  && todo.Name !=='') {
            if (addTodo(todo)) {

                response.status(201).send("created success");
                console.log('todo has been added');
            } else {
                response.status(500).send("Oops something wrong happen and we are trying to fix it");
                console.log('server error');
            }
        } else {
            response.status(400).send("please make sure you send the todo in the corecct format {'Name':'value','Done':'value'} exmple {'Name':'visiting my mam','Done':'1'}");
            console.log('Mistake in the format');
        }     
    } else {
        response.status(400).send("please make sure you send the todo in the corecct format {'Name':'value','Done':'value'} exmple {'Name':'visiting my mam','Done':'1'}");
        console.log('empty json object');            
    }      
});


app.put('/todos/:id',(request,response) => {
    console.log('we got delete request');
    var id=Number(request.params.id);
    console.log(id);
    var todo=request.body;

    if (!isEmptyObject(todo)) {
        if(todo.Done && (todo.Done==='1' || todo.Done==='0')) {
            if(isNaN(id)) {
                response.status(400).send("The Id you entered is not correct");
            } else {
                if (updateTodo(id,todo.Done)) {

                    response.status(200).send("todo updated success");
                    console.log('todo has been updated');
                } else {
                    response.status(500).send("Oops something wrong happen and we are trying to fix it");
                    console.log('server error');
                }
            }
        } else {
            response.status(400).send("please make sure you update the todo in the corecct format {'Done':'value'} exmple {'Name':'visiting my mam','Done':'1'}");
            console.log('Mistake in the format');
        }     
    } else {
        response.status(400).send("please make sure you send the todo in the corecct format {'Done':'value'} exmple {'Done':'1'}");
        console.log('empty json object');            
    }       
});

app.delete('/todos/:id',(request,response) => {
    console.log('we got delete request');
    var id=Number(request.params.id);
    console.log(id);
    if(isNaN(id)) {
        response.status(400).send("The Id you entered is not correct");
    } else {
        if(deletTodo(id)) {
            response.status(200).send("the todo deleted successfully");
        } else {
            response.status(404).send("Something wrong happend");
        }
    }
});


