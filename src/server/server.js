let path = require('path')
let express = require('express');
let app = express();
let bodyParser = require('body-parser')
const cors = require('cors');

//all routes endpoint 
let projectData = [
  {
    arrCity: "Paris",
    country: "France",
    depDate: "2020-04-29",
    reutrnData: "2020-05-01",
    weather: 64.04,
    weather_detail: "Broken Clouds",
  },
  {
    arrCity: "Mumbai",
    country: "India",
    depDate: "2020-06-29",
    reutrnData: "2020-09-01",
    weather: 54.774,
    weather_detail: "Sunny",
  },
];


app.use(cors())

app.use(bodyParser.json())  // to use json
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static('dist'));

//Get route
app.get('/', function(req, res){
    res.sendFile('dist/index.html');
});

// Post route
app.post('/add', postInfo );

function postInfo(req, res) {
    console.log(req.body)
    const data = {
        'arrCity' : req.body.arrCity,
        'country' : req.body.countryName,
        'depDate' : req.body.depDate,
        'reutrnData' : req.body.reutrnData,
        'weather' : req.body.weather,
        'weather_detail' : req.body.weather_detail,
        'daysLeft' : req.body.daysLeft,
    };
    projectData.push(data);
    console.log(projectData);
    res.send(data);

}

app.get('/alldata', (req, res) => {
    res.send(projectData)
})
//Spin the server

const port = 3000;
const server = app.listen(port, listening);

function listening(){
    console.log(`Server starts on port ${port}`);
}
