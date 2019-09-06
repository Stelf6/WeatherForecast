/*jshint esversion: 6 */

window.addEventListener('load', ()=> {
    let long,lat;

    let currentlyStats = {
        currentlyTime : document.querySelector(".date"),
        currentlySummary : document.querySelector(".temperature-description"),
        currentlyTemperature : document.querySelector(".temperature-degree"),
        currentlyTimeZone : document.querySelector(".location-timezone"),

        humidity : document.querySelector(".humidity"),
        wind : document.querySelector(".wind")
    }

    let hourlyStats = {
        hourlyTime : new Array(),
        hourlyTemperature : new Array()
    }

    let dailyStats = {
        dailyTime : new Array(),
        dailySummary : new Array(),
        dailyTemperatureHigh : new Array(),
        dailyTemperatureLow : new Array()
    }

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            long = position.coords.longitude;
            lat = position.coords.latitude;

            const proxy = "https://cors-anywhere.herokuapp.com/";
            const api = `${proxy}https://api.darksky.net/forecast/401344db83023e7646fe259b3fc65a7c/${lat},${long}`;
            
            fetch(api)
                .then(response => {
                    return response.json();
                })
                .then(Data => {
                    setCurrently(Data);
                    setHourly(Data);   
                    setDaily(Data);
                    
                    setChart();
                })
        });
    }
    function setCurrently(Data) {
        const {temperature, summary , icon, humidity, windGust, time} = Data.currently;

        currentlyStats.currentlyTemperature.textContent = Math.floor((temperature-32) * (5/9));
        currentlyStats.currentlySummary.textContent = summary;
        currentlyStats.currentlyTimeZone.textContent = Data.timezone;
        currentlyStats.humidity.textContent ="Humidity: " + Math.floor(humidity*100) + " %";
        currentlyStats.wind.textContent ="Wind: " + windGust + " km/h";

        currentlyStats.currentlyTime.textContent = setTime(time,"date");

        setIcons(icon, document.querySelector(".icon"));
    }

    function setHourly(Data) {
        const {data} = Data.hourly;
                    
        data.forEach(function(element) {
            hourlyStats.hourlyTime.push(setTime(element.time,"woDate"));
            hourlyStats.hourlyTemperature.push(Math.floor((element.temperature-32)*(5/9)));
        });
    }


    function setDaily(Data) {
        const {data} = Data.daily;

        data.forEach(function(element) {
            dailyStats.dailySummary.push(element.icon);
            dailyStats.dailyTime.push(setTime((element.time),"days"));
            dailyStats.dailyTemperatureHigh.push(Math.floor((element.temperatureHigh-32)*(5/9)));
            dailyStats.dailyTemperatureLow.push(Math.floor((element.temperatureLow-32)*(5/9)));
        })

        for (let i = 1; i <= 8; i++) {
            dayName = document.getElementsByClassName("dayName");
            dayName[i-1].innerText=dailyStats.dailyTime[i-1];

            dayTemperature = document.getElementsByClassName("dayTemperature");
            dayTemperature[i-1].innerText=dailyStats.dailyTemperatureHigh[i-1] + "° " + dailyStats.dailyTemperatureLow[i-1] + "°";
            

            setIcons(dailyStats.dailySummary[i-1], document.querySelector(".dayIcon"+i));
        }
    } 


    function setTime(unixTme, arg) {
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let date = new Date(unixTme*1000);

        if(arg=="date") {
            //fix
            return days[date.getDay()] + " " + (date.getHours())+":00";
        } 
        else if(arg=="days") {
            return days[date.getDay()];
        }
        else if(arg=="woDate") {
            return date.getHours()+":00";
        }
    }



    function setChart() {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {

            type: 'line',

            data: {
                labels: hourlyStats.hourlyTime.slice(2, 10),
                datasets: [{
                    backgroundColor: '#1c1c1c',
                    borderColor: '#373737',
                    data: hourlyStats.hourlyTemperature.slice(2, 10)
                }]
            },

            options: {}
        });
    }
    

    
    function setIcons(icon, iconID) {
        const skycons = new Skycons({ color: "white"});
        const currentIcon = icon.replace(/-/g, "_").toUpperCase();
        skycons.play();
        return skycons.set(iconID, Skycons[currentIcon]);
    }
});