function surveyFieldsNames(){
    let howOften =  { everyday: "Codziennie", 
                   fourSixTimes: "4-6 razy w tygodniu", 
                   twiceThreeTimes: "2-3 razy w tygodniu", 
                   once: "Raz w tygodniu", 
                   zeroTimes: "Nie wychodzę na spacer"
        };
    let hours = { moreThanFiveHours: "Więcej niż 5 godzin", 
                 threeFourHours: "3-4 godziny", 
                 twoHours: "2 godziny", 
                 hour: "Godzinę", 
                 lessThanHour: "Mniej niż godzinę"
    };
    
    let weather = { sunny: "Słoneczną", 
                   cloudy: "Pochmurną", 
                   rainy: "Deszczową", 
                   windy: "Wietrzną", 
                   other: "Inną"
    };
    let place = { forest: "Do lasu", 
                 city: "Na miasto", 
                 beach: "Na plażę", 
                 hills: "W góry", 
                 otherPlace: "Gdzie indziej"
    };
    return {howOften: howOften, hours: hours, weather: weather, place: place};
}

async function collectData(sessionType){
    const results = await getSurveyResults(sessionType);

    let survey = {
        howOften:{ everyday: 0, fourSixTimes: 0, twiceThreeTimes: 0, once: 0, zeroTimes: 0,},
        hours: { moreThanFiveHours: 0, threeFourHours: 0, twoHours: 0, hour: 0, lessThanHour: 0},
        weather: { sunny: 0, cloudy: 0, rainy: 0, windy: 0, other: 0},
        place: { forest: 0, city: 0, beach: 0, hills: 0, otherPlace: 0},
    }

    for(let result of results){
        ++survey.howOften[result.howOften];
        ++survey.hours[result.hours];
        ++survey.weather[result.weather];
        ++survey.place[result.place];
    }

    return survey;

}

async function displayUserResults(sessionType){

    document.getElementById('allResults').style.display = "none";
    document.getElementById('allResultsAnalysys').style.display = "none";
    document.getElementById('userResults').style.display = "block";

    const userResults = await getUserResults(sessionType);
    let resultsTable = '';

    let survey = surveyFieldsNames();

    for(let result of userResults){
        let date = result.date.toLocaleString('pl');
        resultsTable += `<tr>`;
        resultsTable += `<td>${date}</td>`;
        resultsTable += `<td>${survey.howOften[result.howOften]}</td>`;
        resultsTable += `<td>${survey.hours[result.hours]}</td>`;
        resultsTable += `<td>${survey.weather[result.weather]}</td>`;
        resultsTable += `<td>${survey.place[result.place]}</td>`;
        resultsTable += `<tr/>`;
        
    }
    document.getElementById('tableRowsUser').innerHTML = resultsTable;
}


async function displayAllResults(sessionType){
    document.getElementById('userResults').style.display = "none";
    document.getElementById('allResultsAnalysys').style.display = "none";
    document.getElementById('allResults').style.display = "block";
    
    if(sessionType != 'online'){
        document.getElementById('userResults').innerHTML = "Zaloguj się, aby móc zobaczyć wszystkie wyniki";
    }
    const results = await getSurveyResults(sessionType);

    let survey = surveyFieldsNames();

    let resultsTable = '';
    for(let result of results){
        let date = result.date.toLocaleString('pl');
        resultsTable += `<tr>`;
        resultsTable += `<td>${date}</td>`;
        resultsTable += `<td>${result.user}</td>`;
        resultsTable += `<td>${survey.howOften[result.howOften]}</td>`;
        resultsTable += `<td>${survey.hours[result.hours]}</td>`;
        resultsTable += `<td>${survey.weather[result.weather]}</td>`;
        resultsTable += `<td>${survey.place[result.place]}</td>`;
        resultsTable += `<tr/>`;
        
    }
    document.getElementById('tableRowsAll').innerHTML = resultsTable;
}

async function visualizeResults(sessionType){
    document.getElementById('userResults').style.display = "none";
    document.getElementById('allResults').style.display = "none";
    document.getElementById('allResultsAnalysys').style.display = "block";

    let surveyParams = surveyFieldsNames();
    let surveyData = await collectData(sessionType);

    drawBarGraph("howOftenCanvas", surveyData.howOften, surveyParams.howOften);
    drawBarGraph("hoursCanvas", surveyData.hours, surveyParams.hours);
    drawBarGraph("weatherCanvas", surveyData.weather, surveyParams.weather);
    drawBarGraph("placeCanvas", surveyData.place, surveyParams.place);
}

function drawBarGraph(graphName, data, names){
    let canvas = document.getElementById(graphName);
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    names = Object.values(names);

    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(names[0], 30, canvas.height - 25);
    ctx.fillText(names[1], 150, canvas.height - 25);
    ctx.fillText(names[2], 270, canvas.height - 25);
    ctx.fillText(names[3], 390, canvas.height - 25);
    ctx.fillText(names[4], 510, canvas.height - 25);
    ctx.fillStyle = "#aaa";
    ctx.moveTo(0, canvas.height - 44);
    ctx.lineTo(canvas.width-1, canvas.height - 44);
    ctx.stroke();
    
    votes = Object.values(data);

    max_vote = Math.max(...votes);
    ctx.fillStyle = "#000";
    for(i=0; i<votes.length; i++){
        ctx.fillText(votes[i], 30 + i*120, canvas.height - 13);
    }

    drawBar = (startPosition, barColor, vote) => {
        const topOfBarPosition = 30 + (max_vote-vote)/max_vote*200;
        const barHeight = 200 * vote/max_vote;
        ctx.fillStyle = barColor;
        ctx.fillRect(startPosition, topOfBarPosition, 120, barHeight);
    }

    drawBar(30, "forestgreen", votes[0]);
    drawBar(150, "gold", votes[1]);
    drawBar(270, "orange", votes[2]);
    drawBar(390, "deepskyblue", votes[3]);
    drawBar(510, "red", votes[4]);
}
