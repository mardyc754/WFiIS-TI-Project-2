async function dataHandler(event, sessionType){
    event.preventDefault();

    const formData = {
        howOften: document.survey.howOften.value,
        hours: document.survey.hours.value,
        weather: document.survey.weather.value,
        place: document.survey.place.value,
        date: new Date()
    }
    if(sessionType === 'online') {
        let res = await fetch('/survey', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        let data = await res.json();
        console.log(data);

    } else {
        console.log(formData);
        saveData(formData, 'surveyResults');
    }
    window.location.href = '/results';
}

async function loginHandler(event){
   event.preventDefault();
   const User = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
   }

   try{
    let res = await fetch('/login', {
        method: 'POST',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(User),
    });
    let data = await res.json();


    if(res.status === 200){
        await synchronizeData();
        alert("Pomyślnie zalogowano.\n Lokalne wyniki ankiety zostały wysłane do bazy danych");
        window.location.href = "/";
    }
    else{
        document.getElementById('status').innerHTML = data.error;
        }
    } catch(error){
        console.log(error);
    }
}

async function registrationHandler(event){
    event.preventDefault();
    const User = {
         username: document.getElementById('username').value,
         password: document.getElementById('password').value,
         passwordAgain: document.getElementById('passwordAgain').value,
    }

    
    let res = await fetch('/register', {
         method: 'POST',
         credentials: 'include', 
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(User),
     });
     let data = await res.json();

     if(res.status === 201){
         alert("Pomyślnie zarejestrowano! Teraz wystarczy się zalogować");
         window.location.href = "/";
     }
     else{
         document.getElementById('status').innerHTML = data.error;
     }
}

async function sendSurveyResults(){
    const Survey = {
         howOften: document.querySelector('input[name=howOften]:checked').value,
         hours: document.querySelector('input[name=hours]:checked').value,
         weather: document.querySelector('input[name=weather]:checked').value,
         place: document.querySelector('input[name=place]:checked').value,
         date: new Date()
    }

     let res = await fetch('/survey', {
         method: 'POST',
         credentials: 'include', 
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(Survey),
     });
     let data = await res.json();
     window.location.href = "/results";
}


async function getSurveyResults(sessionType){
    if(sessionType === 'online'){
        let res = await fetch('/results/data', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json'
            },
        });

        let data = await res.json();
        console.log(data);
        return data;
    }
    else{
        return await getData('surveyResults');
    }
}

async function getSurveyResultsOnline(){
    let res = await fetch('/results/data', {
        method: 'POST',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json'
        },
    });

    let data = await res.json();
    console.log(data);
    return data;
}

async function getSurveyResultsOffline(){
    return await getData('surveyResults');
}

async function getUserResults(sessionType){
    if(sessionType === "online"){
        let response = await fetch('/results/user', {
            method: 'POST',
        })
        let data = await response.json();
        return data;
    }
    else{
        return getSurveyResultsOffline();
    }
}

