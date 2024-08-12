const timerDiv = document.getElementById('timer');
const scoreCard = document.getElementById('score-val');
const image = document.getElementById('game-img');
const header = document.getElementById('game-instructions');
const gameWarning = document.getElementById('game-warning');
const customCursor = document.getElementById('sealcursor');
const hint = document.getElementById('hint');
const gameContainer = document.getElementsByClassName('game-container')[0];
const sealEasyActionDiv = document.getElementById('seal-actions');

const cprContainer = document.getElementById('cpr-quality-container');
const cprQuality = document.getElementById('cpr-quality-val');

const arContainer = document.getElementById('ar-quality-container');
const arQuality = document.getElementById('ar-quality-val');



// Variables required for AR
var arStatus = false;
var arAge;
var arAvg;
let lastArTimes;
let arCount;
let lastArClick;

// Vars required for CPR
var lastClick = -2;
let lastTimes;
let avg;
let count;

let gameHintState;
let gameErrorState;

var gamePoints = 0;


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

async function waitForCorrectButton(targetId, hintMessage, errorMessage) {
    var possiblePoints = 3;
    // Doing the analysis
    var event = null;

    // Display the Hint if we are in Hint state
    if(gameHintState){
        hint.innerHTML = hintMessage;
    }

    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target.classList.contains('event-action')){
            // They chose the right action
            if(event.target.id === targetId){
                gameWarning.style.display = "none";
                gameWarning.innerHTML = "";
                hint.innerHTML = "";
                gamePoints += possiblePoints > 0 ? possiblePoints : 0; 
                break;
            }
            else {
                // Display the Error if we are in the error state
                gameWarning.style.display = "block";
                if(gameErrorState){
                    gameWarning.innerHTML = errorMessage;
                }
                else{
                    gameWarning.innerHTML = "Wrong Choice!";
                }

                possiblePoints -= 1;
            }
        }
    }
    scoreCard.innerHTML = gamePoints;


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
    await startCPR(false);

    await cprBreathsSuccessful(false);

    await startCPR(false);

    await cprBreathsSuccessful(true);


    await startCPR(true);





}

async function training2() {
    startAR("child");
}

async function checkTheScene() {
    header.innerHTML = "You Come Across an Unconcious Patient Lying on the Floor";
    var possiblePoints = 3;
    // Doing the analysis
    var event = null;

    await waitForCorrectButton('survey', 'We need to check for Gas, Glass, Fire, Wire, and Ew' ,'You stepped on glass...');

    header.innerHTML = "Scene is safe, but what is missing...";

    await waitForCorrectButton('gloves', 'While surveying the scene you need one important piece of PPE (Personal Protective Equipment)' ,'Do you want bodily fluids on your hands?');

    header.innerHTML = "You Are Now Safe to Continue";

}

async function checkThePatient() {
    var event = null;

    await waitForCorrectButton('consciousness', 'Is our patient sleeping or completly unconcious?' ,'What if they were sleeping...');

    header.innerHTML = "Patient Doesn't Respond";

    await waitForCorrectButton('long-2', 'We need to alert others we need help!!!' ,'Should Anyone Be Unconcious');

    header.innerHTML = "First Responders are on their way"

}

async function checkTheCaroArtery(cond) {
    var event = null;

    await waitForCorrectButton('carotid', 'Is the adult alive or dead?' , 'What are their vitals?');

    if (cond === "cpr"){
        header.innerHTML = "You Don't Feel a Thumping or a Breath";
    }

}

async function startCPR(ems) {
    if(ems){
        emsArrivesDuringCpr();
    }

    await waitForCorrectButton('cpr', 'They have no pulse what do we need to do or continue to do' ,'They are not alive');

    cprContainer.style.display = "block";

    header.innerHTML = "Starting CPR (click on the patient)";

    resetCPRTimes();
    while( count !== 30){
        await new Promise(r => setTimeout(r, 100));
        if(avg < 500){
            cprQuality.innerHTML = "&#10007; Too Fast";
            cprQuality.style.backgroundColor = "rgba(255, 0, 0, 0.636)";
        }
        else if(avg > 600){
            cprQuality.innerHTML = "&#10007; Too Slow";
            cprQuality.style.backgroundColor = "rgba(255, 0, 0, 0.636)";
        }
        else{
            cprQuality.innerHTML = "&#10004; Perfect";
            cprQuality.style.backgroundColor = "rgba(0, 254, 0, 0.682)";
        }
    }
    // CPR is done, so no need to show CPR data anymore
    cprContainer.style.display = "none";
    // Done with CPR, time to move on to CPR Breaths (however there are different possibilities so that is handled in the specific training function)
    if(!ems){
        header.innerHTML = "30 Compressions Done";
    }  

}

function resetCPRTimes() {
    lastTimes = [550, 550, 550, 550, 550];
    avg = 550;
    lastClick = (new Date()).getTime();
    count = 0;
}

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


async function cprBreathsSuccessful(foam) {
    var event = true;

    await waitForCorrectButton('sealeasy', 'We completed our 30 compressions, what is next?', 'What do we do after 30 compressions for CPR');


    document.body.style.cursor = "none";

    customCursor.style.display = "block";

    header.innerHTML = "Give a Breath by tapping the patient";


    if(gameHintState){
        hint.innerHTML = "Place the mask on the GID"
    }
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target == image){
            gameWarning.style.display = 'none';
            break;
        }
        else {
            if(gameErrorState){
                gameWarning.innerHTML ='Place the mask on the individual';
            }
            gameWarning.style.display = 'block';
        }
    }


    var breathMsg = "First Breath Goes In";

    if(foam){
        breathMsg += " And Foam is Coming From the Mouth";
        if(gameHintState){
            hint.innerHTML = "Can't we just breathe through foam?"
        }
    }

    header.innerHTML = breathMsg;

    
    while(true){
        event = await waitForEvent(window, 'click');
        if(event.target == image){
            gameWarning.style.display = 'none';
            break;
            
        }
        else {
            if(gameErrorState){
                gameWarning.innerHTML ='Can we breath through foam?';
            }
            gameWarning.style.display = 'block';
        }
    }

    document.body.style.cursor = "pointer";

    customCursor.style.display = "none";

    header.innerHTML = "Second Breath Goes In...";

}

async function startAR(age){
    
    await waitForCorrectButton('sealeasy', 'They have no breathing but have a pulse, what do we need to do or continue to do' ,'They are not just not breathing');

    header.innerHTML = "Starting AR (click on the patient)";

    arContainer.style.display = "block";
    arStatus = true;
    arAge = age;

    let finalCount;
    let lowAvg;
    let highAvg;

    if(age === "adult"){
        finalCount = 20;
        lowAvg = 5550;
        highAvg = 6450;
    }
    else {
        finalCount = 40;
        lowAvg = 2550;
        highAvg = 3450;
    }

    resetARTimes(age);

    document.body.style.cursor = "none";

    customCursor.style.display = "block";

    while(arCount !== finalCount){
        await new Promise(r => setTimeout(r, 100));
        if(arAvg < lowAvg){
            arQuality.innerHTML = "&#10007; Too Fast";
            arQuality.style.backgroundColor = "rgba(255, 0, 0, 0.636)";
        }
        else if(arAvg > highAvg){
            arQuality.innerHTML = "&#10007; Too Slow";
            arQuality.style.backgroundColor = "rgba(255, 0, 0, 0.636)";
        }
        else{
            arQuality.innerHTML = "&#10004; Perfect";
            arQuality.style.backgroundColor = "rgba(0, 254, 0, 0.682)";
        }
        arQuality.innerHTML = arAvg;
    }

    document.body.style.cursor = "pointer";

    customCursor.style.display = "none";

    arStatus = false;
    
    header.innerHTML = "Breaths Done";

    arContainer.style.display = "none";

}


function resetARTimes(age) {
    if(age === "adult"){
        lastArTimes = [6000, 6000, 6000];
        arAvg = 6000;
    } 
    else {
        lastArTimes = [3000, 3000, 3000];
        arAvg = 3000;
    }
    
    lastArClick = -1;
    arCount = 0;
}

// Watching and tracking ar breaths
image.addEventListener("click", () => {

    // Ensuring that we are in Ar Event and then determining the timing by age of GID
    if(arStatus){
        if(lastArClick === -1){
            lastArClick = (new Date()).getTime();
            arCount = 1;
        }
        else{
            arCount += 1;
            var timeNow = (new Date()).getTime();

            let interval = timeNow - lastArClick;

            lastArClick = timeNow;

            var removed = lastArTimes.shift();
            lastArTimes.push(interval);

            arAvg += (interval - removed)/3;
        }
    }
});

async function emsArrivesDuringCpr() {

    await setTimeout(async () => {

        count = 30;

        header.innerHTML = "EMS has arrived and taken over"
        
        await waitForCorrectButton('hands-off','The professionals have arrived and we are done, what do we do?' , 'You are done :)');

        header.innerHTML = "Well Done! Training Over!"


    }, 5000)



}





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


// Game Setup buttons
const gameSetup = document.getElementsByClassName('game-setup')[0];
const trainingButtons = document.getElementById("training-selection-buttons");
const trainButton = document.getElementById("train");
const trainHintsButton = document.getElementById("train-hints");
const learnButton = document.getElementById("learn");

const trainingChoices = document.getElementById("training-choice");
const cprTraining = document.getElementById("cpr-training");
const arTraining = document.getElementById("ar-training");
const cprObTraining = document.getElementById("cpr-ob-training");
const randomTraining = document.getElementById("random-training");


function clearTrainingButtons() {

    trainButton.classList.remove("selected-div");
    trainHintsButton.classList.remove("selected-div");
    learnButton.classList.remove("selected-div");

}

trainingButtons.addEventListener("click", (event) => {

    var element = event.target;
    if(element.tagName === "SPAN"){
        element = element.parentElement;
    }

    clearTrainingButtons();

    element.classList.add("selected-div");

})

function clearTrainingChoices() {
    cprTraining.classList.remove("selected-div");
    arTraining.classList.remove("selected-div");
    cprObTraining.classList.remove("selected-div");
    randomTraining.classList.remove("selected-div");

}

trainingChoices.addEventListener("click", (event) => {

    clearTrainingChoices();

    event.target.classList.add("selected-div")

})


const startButton = document.getElementById("start-game");

const hintContainer = document.getElementById('hint-val-container');
const warningContainer = document.getElementById('warning-val-container');


startButton.addEventListener("click", () => {
 
    gameWarning.style.display = "none";

    if(trainButton.classList.contains("selected-div")){
        hintContainer.style.display = "none";
        warningContainer.style.display = "block";
        gameHintState = false;
        gameErrorState = false;

    }
    else if(learnButton.classList.contains("selected-div")){
        hintContainer.style.display = "block";
        warningContainer.style.display = "block";
        gameHintState = true;
        gameErrorState = false;
    }
    else {
        hintContainer.style.display = "none";
        warningContainer.style.display = "block";
        gameHintState = false;
        gameErrorState = true;
    }

    if(cprTraining.classList.contains("selected-div")){
        training1();
    } 
    else if(arTraining.classList.contains("selected-div")){
        training2();
    }
    else if(cprObTraining.classList.contains("selected-div")){
        training3();
    }
    else {
        trainingRand();
    }

    cprContainer.style.display = "none";
    arContainer.style.display = "none";
    gameContainer.style.display = "block";
    gameSetup.style.display = "none";


})

