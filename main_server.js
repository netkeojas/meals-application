const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');


MongoClient.connect('mongodb+srv://ojas:ojas1234@cluster0.lywtm.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true})
.then(client => {
    console.log('connected to data base')

    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({extended: true}));
    const db = client.db('my-meals');
    const mealsCollection = db.collection('meals');


    app.listen('3000', () => {
        console.log('I am listening now');
    })
    
    app.get('/', (req, res) => {
        db.collection('meals').aggregate([
            {
                $lookup: {
                    from: 'meal_details',
                    localField: 'meals',
                    foreignField: 'meal_type',
                    as: 'meal_data'
                }
            }
        ]).toArray().then(result => {
            // console.log(result[0].meal_data[0]);
            console.log(JSON.stringify(result));
            let total_amt = 0;
            for(let i=0; i < result.length; i++)
            {
                total_amt = total_amt + (result[i].meal_data[0].cost * result[i].quantity);
            }
            result.total_amt = total_amt;
            res.render('index.ejs', {meals: result});
        }).catch(error => console.log(error));
    })

    app.post('/meal', (req, res) => {
        console.log(req.body);
        const input = req.body;
        input.quantity = parseInt(input.quantity);
        mealsCollection.insertOne(input)
        .then(result => console.log(result))
        .catch(error => console.log(error));

        res.redirect('/');
    })

    app.post('/update_meal', (req, res) => {
        console.log(req.body);
        
        res.redirect('/');
    })


}).catch(err => console.error());

