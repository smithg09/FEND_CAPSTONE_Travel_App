const formSection = document.querySelector('#form-section');
const all_trips = document.querySelector('#all_trips');
const goSomewhereBtn = document.querySelector('.go-somewhere-btn');
const form = document.querySelector('form');
const deleteBtn = document.querySelector('#delete-btn');
const destination = document.querySelector('input[name="destination"]');
const destinationDate = document.querySelector('input[name="date"]');
const returndate = document.querySelector('input[name="returndate"]');
const timestampNow = (Date.now()) / 1000;
const geoNamesURL = 'http://api.geonames.org/searchJSON?q=';
const username = "smithg09"
const weatherbitAPI = "9fed0894388d4df4837b7a7b4e054924";
const weatherbitURL = 'https://api.weatherbit.io/v2.0/forecast/daily?';
const pixabayAPI = "16351437-8489d2029284623348ae1ae1e";
const pixabayAPIURL = "https://pixabay.com/api/?key="; 
const resultSection = document.querySelector('#result-section')
let list_array;
if (localStorage.getItem('list') != null) {
    list_array = localStorage.getItem("list").split(",");
    add_item_to_list()
} else {
    list_array = [];
}

const goSomewhere = goSomewhereBtn.addEventListener('click', function (e) {
    e.preventDefault();
    all_trips.scrollIntoView({ behavior: 'smooth' });
});

all_trips_fetch();
export function all_trips_fetch() {
    fetch("http://localhost:3000/alldata", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    })
      .then((resData) => {
        return resData.json();
      })
      .then((response) => {
        //   console.log(response);
          response.forEach( async (element) => {
              const res = await fetch(pixabayAPIURL + pixabayAPI + "&q=" + element.arrCity + "+city&image_type=photo");
              const imgLink = await res.json();
              var color = "#0053ff36";
              var display_color = "blue";
              var display = 'Upcoming';
            var varDate = new Date(element.reutrnData); //dd-mm-YYYY
              var today = new Date();
              today.setHours(0, 0, 0, 0);
              if (varDate   <= today) { 
                // console.log("Expired")
                  var display = 'Expired';
                  var display_color = "red";
                var color = "#ff707042";
            }
            //   console.log(element)
              document.getElementById("all-result-container").innerHTML += `
            <div class="result-container" style="margin: 1rem 0rem;padding: 1rem 2.5rem;border-radius: 5px;background: ${color};">
             <div class="result-left">
                <img id="destination-img"src="${imgLink.hits[0].webformatURL}" alt="destination-img">
            </div>  
            <div class="result-right">
            <h2 class="destination-text">
                Trip to :
                <span id="city" class="result-underline">
                    ${element.arrCity} , ${element.country}
                </span>
            </h2>
            <h2 class="destination-date">
                Departing :
                <span id="date" class="result-underline">
                    ${element.depDate}
                </span>
            </h2>
            <h2 class="return-date">
                Return :
                <span id="return" class="result-underline">
                    ${element.reutrnData}
                </span>
            </h2>
            <h2 class="local-weather">
                Typical Weather is:
                <span id="destination-weather" class="result-underline">
                    ${element.weather}
                </span>
                &#176; F
            </h2>
            <h2 class="local-weather">
                Mostly
                <span id="weather-description" class="result-underline">
                    ${element.weather_detail}
                </span>
                </h2>
                <h6 style="color:${display_color}"> ${display} </h6>
            </div>
            </div>
          `;  
        })
      });
}

//remove trip
deleteBtn.addEventListener('click', function(e){
    form.reset();
    formSection.classList.add('hidden');
    location.reload();
})

// submit form
form.addEventListener('submit',goSomewhereFunc)

function add_item_to_list() {
    var list_value = document.getElementById('items').value;
    if (list_value != '') {
        list_array.push(list_value);
    }
    localStorage.setItem('list', list_array);
    
    var list_data = localStorage.getItem('list');
    var list_array_data = list_data.split(',');
    document.getElementById('item_list').innerHTML = ``;
    list_array_data.forEach(items => {
        document.getElementById('item_list').innerHTML += `<li>${items}</li>`;
    })

}

export function goSomewhereFunc(e){
    e.preventDefault();
    const destinationValue = destination.value;
    const destinationDateValue = destinationDate.value;
    const destreturndate = returndate.value;
    const timestamp = (new Date(destinationDateValue).getTime()) / 1000;
    let country= '';
    Client.checkInput(destinationValue);

    getPlaceInfo(geoNamesURL, destinationValue, username)
        .then((cityData) => {
            const cityLat = cityData.geonames[0].lat ;
            const cityLong = cityData.geonames[0].lng ;
            this.country = cityData.geonames[0].countryName;
            const weatherData = getWeather(cityLat, cityLong, country, timestamp)
            return weatherData;
        })
        .then((weatherData ) => {
            const daysLeft = Math.round((timestamp - timestampNow) / 86400);
    
            const userData = postData('http://localhost:3000/add', {destinationValue, country_name: this.country ,destinationDateValue , destreturndate, weather: weatherData.data[15], daysLeft })
            document.getElementById("hidden_check").classList.remove('hidden');
            document.getElementById('message').style.display = 'none';
            return userData;
            
        })
        .then((userData) => {
            updateUI(userData);
        });
}

// Fetch location from Geonames API
export const getPlaceInfo = async (geoNamesURL, destinationValue, username)=>{
    const res = await fetch(geoNamesURL + destinationValue + "&maxRows=10&" + "username=" + username);
    try{
        const cityData = await res.json();
        return cityData;
    } catch(error){
        console.log("error", error);
        
    }
}

// Fetch weather from Weatherbit API
export const getWeather = async(cityLat, cityLong,)=>{
    const req = await fetch(weatherbitURL + "lat=" +  cityLat + "&lon=" +  cityLong + "&key=" + weatherbitAPI);
    try {
        const weatherData = await req.json();
        return weatherData;
    } catch(error){
        console.log("error", error)
    }
}

// POST information to local server

export const postData = async (url = '', data = {}) => {
    var tempC = data.weather.temp;
    // console.log(data.country_name)
    const req = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': "application/json;charset=UTF-8"
        },
        body: JSON.stringify({
            arrCity: data.destinationValue,
            countryName: data.country_name,
            depDate: data.destinationDateValue,
            reutrnData: data.destreturndate,
            weather: (tempC * 9 / 5) + 32,
            weather_detail: data.weather.weather.description,
            daysLeft: data.daysLeft
        })
    })
    try{
        const userData = await req.json();
        return userData;
    } catch(error){
        console.log('error'), error;
    }
}

// Updates UI with information from API

export const updateUI = async (userData) => {
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({behavior: "smooth"});

    const res = await fetch(pixabayAPIURL + pixabayAPI + "&q=" + userData.arrCity + "+city&image_type=photo");


    try{
        const imgLink = await res.json();
        const dateSplit = userData.depDate.split("_").reverse().join(" / ");
        const returndate = userData.reutrnData.split("_").reverse().join(" / ");
        var date1 = new Date(userData.depDate);
        var date2 = new Date(userData.reutrnData);
        var Difference_In_Time = date2.getTime() - date1.getTime();
        var days_length = ( Difference_In_Time / (1000 * 3600 * 24) ) + 1;
        document.querySelector("#destination-img").setAttribute('src', imgLink.hits[0].webformatURL);
        document.querySelector("#city").innerHTML = `${userData.arrCity}, ${userData.country}`;
        document.querySelector("#date").innerHTML = dateSplit;
        document.querySelector("#return").innerHTML = returndate;
        document.querySelector("#length-day").innerHTML = `This trip is ${days_length} days long`;
        document.querySelector("#days-left").innerHTML = `${userData.arrCity}, ${userData.country} is ${userData.daysLeft} days away`;
        document.querySelector("#destination-weather").innerHTML = userData.weather;
        document.querySelector("#weather-description").innerHTML =  userData.weather_detail;
        
    }
    catch(error){
        console.log("error", error)
    }
}

export { add_item_to_list , goSomewhere  };