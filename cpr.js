const timerDiv = document.getElementById('timer');
const scoreCard = document.getElementById('score-val');
const image = document.getElementById('game-img');
const header = document.getElementById('game-instructions');
const gameWarning = document.getElementById('game-warning');
const customCursor = document.getElementById('sealcursor');

const sealEasyActionDiv = document.getElementById('seal-actions');

var lastClick = -2;
let lastTimes;
let avg;
let count;

var gamePoints;


// Event Listener function
function waitForEvent(element, eventName) {
    return new Promise((resolve) => {
        const handler = (event) => {
            element.removeEventListener(eventName, handler);
            resolve(event);
        };
        element.addEventListener(eventName, handler);
    });
}

// Value Waiting
async function waitForValue(obj, targetValue) {
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if (obj === targetValue) {
                clearInterval(intervalId);
                resolve();
            }
        }, 50); // Check every 100 milliseconds (you can adjust the interval)
    });
}


async function waitForCorrectButton(targetId, errorMessage) {
    var possiblePoints = 3;
    // Doing the analysis
    var event = null;
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === targetId){
                gameWarning.style.display = 'none';
                points += possiblePoints > 0 ? possiblePoints : 0; 
                break;
            }
            else {
                gameWarning.innerHTML = errorMessage;
                gameWarning.style.display = 'block';
                possiblePoints -= 1;
            }
        }
    }

}



// Game Start
async function startTraining() {
    points = 0;


    
    
    // From here, we have to choose a training path
    training1();
}

// Unconscious to CPR until EMS arrives and takes over (with foam coming from the mouth)
async function training1() {

    await checkTheScene();

    await checkThePatient();

    await checkTheCaroArtery("cpr");
    
    // START CPR
    await startCPR();

    



}

async function checkTheScene() {
    header.innerHTML = "You Come Across an Unconcious Patient Lying on the Floor";
    var possiblePoints = 3;
    // Doing the analysis
    var event = null;
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'survey'){
                gameWarning.style.display = 'none';
                points += possiblePoints > 0 ? possiblePoints : 0; 
                break;
            }
            else {
                gameWarning.innerHTML ='HINT: You stepped on glass...';
                gameWarning.style.display = 'block';
                possiblePoints -= 1;
            }
        }
    }

    header.innerHTML = "Scene is safe, but what is missing...";

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'gloves'){
                gameWarning.style.display = 'none';
                break;
            }
            else {
                gameWarning.innerHTML ='HINT: You stepped on glass...';
                gameWarning.style.display = 'block';
            }
        }
    }

    header.innerHTML = "You Are Now Safe to Continue";

}


async function checkThePatient() {
    var event = null;

    // Waitin
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'consciousness'){
                gameWarning.style.display = 'none';
                break;
            }
            else {
                gameWarning.innerHTML ='HINT: What if they were sleeping...';
                gameWarning.style.display = 'block';
            }
        }
    }

    header.innerHTML = "Patient Doesn't Respond";

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'long-2'){
                gameWarning.style.display = 'none';
                break;
            }
            else {
                gameWarning.innerHTML ='HINT: Should Anyone Be Unconcious';
                gameWarning.style.display = 'block';
            }
        }
    }

    header.innerHTML = "First Responders are on their way"

}

async function checkTheCaroArtery(cond) {
    var event = null;

    // Waitin
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'carotid'){
                gameWarning.style.display = 'none';
                break;
                
            }
            else {
                gameWarning.innerHTML ='HINT: What are their vitals?';
                gameWarning.style.display = 'block';
            }
        }
    }
    if (cond === "cpr"){
        header.innerHTML = "You Don't Feel a Thumping or a Breath";
    }

}


async function startCPR() {
    var event = null;

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'cpr'){
                gameWarning.style.display = 'none';
                break;
                
            }
            else {
                gameWarning.innerHTML ='HINT: They are not alive';
                gameWarning.style.display = 'block';
            }
        }
    }



    header.innerHTML = "Starting CPR (click on the patient)";

    resetCPRTimes();
    while( count !== 30){
        await new Promise(r => setTimeout(r, 100));
        if(avg < 500){
            scoreCard.innerHTML = "Too Fast" + avg;
        }
        else if(avg > 600){
            scoreCard.innerHTML = "Too Slow" + avg;
        }
        else{
            scoreCard.innerHTML = "Perfect" + avg;
        }
    }
    // CPR is done, so no need to show CPR data anymore
    scoreCard.innerHTML = "";

    // Done with CPR, time to move on to CPR Breaths (however there are different possibilities so that is handled in the specific training function)
    header.innerHTML = "30 Compressions Done";

}

async function cprBreathsSuccessful() {
    var event = true;

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === 'sealeasy'){
                gameWarning.style.display = 'none';
                break;
                
            }
            else {
                gameWarning.innerHTML ='HINT: What do we do after 30 compressions for CPR';
                gameWarning.style.display = 'block';
            }
        }
    }


    document.body.style.cursor.display = "none";

    customCursor.style.display = "block";

    header.innerHTML = "Give a Breath by tapping the patient";



    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target == image){
            gameWarning.style.display = 'none';
            break;
            
        }
        else {
            gameWarning.innerHTML ='HINT: Place the mask on the individual';
            gameWarning.style.display = 'block';
        }
    }

    header.innerHTML = "First Breath Goes In";

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target == image){
            gameWarning.style.display = 'none';
            break;
            
        }
        else {
            gameWarning.innerHTML ='HINT: Place the mask on the individual';
            gameWarning.style.display = 'block';
        }
    }

    document.body.style.cursor.display = "pointer";

    customCursor.style.display = "none";

    header.innerHTML = "Second Breath Goes In...";

}



function resetCPRTimes() {
    lastTimes = [550, 550, 550, 550, 550];
    avg = 550;
    lastClick = (new Date()).getTime();
    count = 0;
}

// sealEasyActionDiv.addEventListener("click", () => {
// })


// CPR CLICKING
image.addEventListener("click", () => {

    
    // This is the case that prevents the cpr functionality while we are not in cpr mode
    if(lastClick === -2){
        return;
    }
    // If its the first time that we clicked the button, we need to set its original time otherwise, we find the interval between button presses
    if(lastClick === -1) {
        lastClick = (new Date()).getTime();
        resetCPRTimes();
        count = 1;
    }
    else if(count === 30){
        // Change the game state as they are over the amount of CPR they should be doing 
        lastClick = -2;
    }
    else{
        count += 1;
        // We get the interval between the last time and now, and then we add it to our 5 count array and fix the average
        var timeNow = (new Date()).getTime();

        let interval = timeNow - lastClick;

        lastClick = timeNow;

        var removed = lastTimes.shift();
        lastTimes.push(interval);

        // Recalculating the average
        avg += (interval - removed)/5

    }
});


// Actions Reactive elements
const gloves = document.getElementById('supplies-gloves');
const whistle = document.getElementById('supplies-whistle');
const sealeasy = document.getElementById('supplies-sealeasy');
const analysis = document.getElementById('supplies-analysis');
const patient = document.getElementById('supplies-patient');

const suppliesDiv = document.getElementById('supplies');

suppliesDiv.addEventListener("click", (event) => {
    
    resetDropdowns();

    // When we click on a specific link, we want it to become opened, otherwise the rest should stay closed
    if(event.target.classList.contains('add-drop')){
        event.target.nextElementSibling.style.display = "flex";
    }
});

function resetDropdowns(){
    gloves.style.display = "none";
    whistle.style.display = "none";
    sealeasy.style.display = "none";
    analysis.style.display = "none";
    patient.style.display = "none";
}


const updateCursorPosition = (event) => {
  customCursor.style.top = `${event.clientY}px`;
  customCursor.style.left = `${event.clientX}px`;
}
window.addEventListener('mousemove', (event) => {
  updateCursorPosition(event)
})