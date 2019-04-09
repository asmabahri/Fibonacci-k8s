const keys = require('./keys');

// ******************************* express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// ******************************* PostGres
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', ()=>{
    console.log('Lost PG connection');
});

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => {
        console.log(err);
    });

// *******************************  Redis
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPub = redisClient.duplicate();

// ******************************* Express Routes
app.get('/', (req,res)=>{
    res.send('hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// User submitting value
app.post('/values', async (req,res)=>{
    const index = req.body.index;
        
    // cap size of index submitted by user
    if(parseInt(index, 10) > 40){
        return res.status(402).send('index too high');
    }
    
    redisClient.hset('values', index, 'nothing yet');
    // event received by the worker
    redisPub.publish('insert', index);
    // storing index into PG
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({working: true});

});


app.listen(5000, () => {
    console.log('Listening on port 5000');
});