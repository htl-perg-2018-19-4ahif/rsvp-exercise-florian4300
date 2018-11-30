import express = require("express");
import loki = require("lokijs");
import basicAuth = require('express-basic-auth')
const app = express();
app.use(express.json());


const db = new loki('loki.json');
db.loadDatabase({}, function () {
    if (db.getCollection("Party") === null) {
        db.addCollection('Party').insert({ title: 'Halloween Party', location: "Ernsthofen", date: "31.10.2018", members: [] });
        db.saveDatabase();
    }
    const partyCollection = db.getCollection("Party");
    app.listen(8080, function () {
        console.log('App listening on port 8080!');
    });
    app.get('/party', function (req, response) {
        const party = partyCollection.get(1);
        response.write("Title: " + party.title);
        response.write("\n");
        response.write("Location: " + party.location);
        response.write("\n");
        response.write("Date: " + party.date);
        response.write("\n");
        response.end();
    });
    app.post('/register', function (req, res) {
        const party = partyCollection.get(1);
        const count = party.members.length;
        if(!req.body || !req.body.firstName || !req.body.firstName){
            res.status(400);
            res.end();
            return;
        }
        if(count >= 10){
            res.status(401);
            res.end();
            return;
        }
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        
        party.members.push({ firstName: firstName, lastName: lastName });
        partyCollection.update(party);
        db.saveDatabase();
        res.end();
    });
    app.use(basicAuth({
        users: { 'admin': 'supersecret' }
    }))
    app.get('/guests', function (req, res) {
        const party = partyCollection.get(1);
        for (let i = 0; i < party.members.length; i++) {
            res.write("Member " + (i + 1) + ": " + party.members[i].firstName + " " + party.members[i].lastName);
            res.write("\n");
        }
        res.end();
    });
});






