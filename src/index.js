require("babel-core/register");
require("babel-polyfill");
import './styles/index.scss'; 

import { 
  getWordSyllables, 
  getRandomWordSyllables
} from './scripts/dictionary'; 

import { 
  setupTracks, 
  removeTracks 
} from './scripts/track';

import { 
  loadSyllableSound, 
  currentStateObj, 
  scheduler, 
  resetEffects
} from './scripts/audio'; 




currentStateObj.currentInput = null; 

document.addEventListener("DOMContentLoaded", init); 


// should this be a debouncing function that fires after a certain amount of time without the user typing
document.querySelector("#input-text-form").addEventListener("submit", handleInput);
const playBtn = document.querySelector('#play-btn'); 
playBtn.setAttribute("disabled", "disabled"); 


// HANDLE BUTTONS
document.querySelector('#random-word').addEventListener('click', handleRandomWord); 


// GLOBAL CONTROLS
const tempoControl = document.querySelector('#tempo'); 
tempoControl.addEventListener('input', (e) => {
  currentStateObj.globalInputs.tempo = Number(e.currentTarget.value); 
}); 

const pitchControl = document.querySelector('#pitch'); 
pitchControl.addEventListener('input', (e) => {
  currentStateObj.globalInputs.sampleRate = Number(e.currentTarget.value); 
}); 

const volumeControl = document.querySelector('#volume'); 
volumeControl.addEventListener('input', (e) => {
  currentStateObj.globalInputs.volume = Number(e.currentTarget.value); 
}); 


function init() {
  meSpeak.loadVoice('en/en-us'); 
}

const getLocalControlLabels = () => {
  const localControlsLabels = document.createElement('div'); 
  localControlsLabels.classList.add("local-controls-labels"); 

  const pitchLabel = document.createElement('h2'); 
  pitchLabel.innerText = "Pitch"; 
  const panLabel = document.createElement('h2'); 
  panLabel.innerText = "Pan"; 
  const filterLabel = document.createElement('h2'); 
  filterLabel.innerText = "Filter"; 
  
  localControlsLabels.appendChild(pitchLabel); 
  localControlsLabels.appendChild(panLabel); 
  localControlsLabels.appendChild(filterLabel); 
  return localControlsLabels; 
} 

const getClearButton = () => {
  let clearBtn = document.querySelector('#clear'); 

  if (!clearBtn) {
    clearBtn = document.createElement('button'); 
    clearBtn.id = 'clear'; 
    clearBtn.innerText = 'clear'
  }

  clearBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    document.querySelector('#input-text').value = ""; 
    disablePlayBtn(); 
    resetTracks(); 
  });   

  return clearBtn; 
}

async function handleInput(e) {
  e.preventDefault(); 
  stopPlaying(); 
  addLoader(); 
  
  let inputText = document.querySelector("#input-text").value; 
  currentStateObj.currentInput = inputText; 

  const syllables = await getWordSyllables(inputText); 

  if (Array.isArray(syllables)) disablePlayBtn(); 

  handleNewWord(syllables); 
}

async function handleRandomWord(e) {
  e.preventDefault(); 
  stopPlaying(); 
  disablePlayBtn(); 
  addLoader(); 

  const randomWordSyllables = await getRandomWordSyllables(); 
  const randomWord = randomWordSyllables.join(''); 

  const input = document.querySelector('#input-text'); 
  input.value = randomWord; 
  currentStateObj.currentInput = randomWord; 

  handleNewWord(randomWordSyllables); 
}

async function handleNewWord(syllables) {
  // reset the samples array
  currentStateObj.syllableSamples = []; 
  resetEffects(); 
  
  if (Array.isArray(syllables)) {
    currentStateObj.syllables = syllables; 

    let error = document.querySelector('#error'); 
    if (error) {
      error.remove(); 
    }
    
    resetTracks(); 

    // CREATE THE TRACKS
    const trackContainer = document.getElementById('track-wrapper');
    trackContainer.appendChild(getClearButton()); 
    trackContainer.appendChild(getLocalControlLabels()); 
    setupTracks(syllables, trackContainer); 
    
    // INITIALIZE AUDIO_CONTEXT
    const ctx = currentStateObj.audioContext || new AudioContext(); 
    
    // LOAD ALL OF THE SYLLABLE SOUNDS
    for (let i = 0; i < syllables.length; i++) {
      loadSyllableSound(syllables[i], ctx, i); 
    }

  // IF ERROR
  } else {
    const oldError = document.querySelector('#error'); 

    const error = document.querySelector('#error') || document.createElement('p'); 
    error.innerText = syllables;  
    
    if (!oldError) {
      error.id = "error"; 
      
      const inputTextForm = document.getElementById('input-text-form'); 
      inputTextForm.prepend(error); 
    }

  }
}

const stopPlaying = () => {
  playBtn.innerHTML = "&#9654;"
  window.clearTimeout(currentStateObj.timerID);
}

const disablePlayBtn = () => {
  // RESET THE PLAY BUTTON SO IT CAN'T BE PUSHED UNTIL THE TRACKS ARE LOADED
  const playBtn = document.querySelector('#play-btn')
  playBtn.setAttribute("disabled", "disabled"); 
  playBtn.classList.remove('active'); 
}

const addLoader = () => {
  const loader = document.createElement('div'); 
  loader.innerText = "Loading..."; 
  loader.id = 'loader'; 

  let loaderModalScreen = document.createElement('div'); 
  loaderModalScreen.id = 'loader-modal-screen'; 

  const trackWrapper = document.querySelector('#track-wrapper'); 
  trackWrapper.prepend(loaderModalScreen); 
  trackWrapper.prepend(loader); 
}

export const start = () => {
  const playBtn = document.querySelector('#play-btn');
  const syllableSamples = Object.values(currentStateObj.syllableSamples); 
  currentStateObj.isPlaying = false;

  // if there are audio files and they are not promises
  if (syllableSamples.length == currentStateObj.syllables.length && 
    syllableSamples.every( sample => typeof sample !== 'Promise')) {
    playBtn.removeAttribute("disabled"); 
    playBtn.classList.add('active'); 

    if (currentStateObj.firstWord) {
      // SETTING UP EVENT LISTENERS 
      playBtn.addEventListener("click", handlePlay);

      // const voices = document.querySelectorAll('.voice'); 
      // for (let i = 0; i < voices.length; i++) {
      //   voices[i].addEventListener('change', handleVoiceChange); 
      // }

      currentStateObj.firstWord = false; 
    }
  }

}

const handlePlay = (e) => {
  currentStateObj.isPlaying = !currentStateObj.isPlaying; 

  // start playing
  if (currentStateObj.isPlaying) { 

    if (currentStateObj.audioContext.state === 'suspended') {
      currentStateObj.audioContext.resume();
    }

    playBtn.innerHTML = "&#10074;&#10074;"
    currentStateObj.currentNote = 0;
    currentStateObj.nextNoteTime = currentStateObj.audioContext.currentTime;
    scheduler(); // kick off scheduling
    
    requestAnimationFrame(draw); // start the drawing loop.
    e.currentTarget.dataset.playing = 'true';
    
  } else {
    // stop playing 
    playBtn.innerHTML = "&#9654;"
    
    window.clearTimeout(currentStateObj.timerID);
    e.currentTarget.dataset.playing = 'false';
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
function draw() {
  let drawNote = currentStateObj.lastNoteDrawn;
  let currentTime = currentStateObj.audioContext.currentTime;
  let noteQueue = currentStateObj.noteQueue; 

  while (noteQueue.length && noteQueue[0].time < currentTime) {
      drawNote = currentStateObj.noteQueue[0].note;
      currentStateObj.noteQueue.splice(0,1);   // remove note from queue
  }

  // We only need to draw if the note has moved.
  if (currentStateObj.lastNoteDrawn != drawNote) {
    const tracks = document.querySelectorAll('.track'); 
    tracks.forEach( track => {
      track.children[currentStateObj.lastNoteDrawn].classList.remove("playing");
      track.children[drawNote].classList.add("playing");
    });

    currentStateObj.lastNoteDrawn = drawNote;

    jiggleTriangles(); 
  }
  
  requestAnimationFrame(draw);
}

function resetTracks() {
  const trackContainer = document.getElementById('track-wrapper');
  removeTracks(trackContainer); 
}

const jiggleTriangles = () => {
  const triangles = document.getElementsByClassName("triangle")
  // const triangles = document.querySelectorAll('.triangle'); 
  const degs = {
    0: 10,
    1: 80, 
    2: 50, 
  }

  const jitter = [2, -2]; 

  for (let i = 0; i < triangles.length; i++) {
    let randomJitter =  jitter[Math.floor(Math.random()*2)]; 
    triangles[i].style.transform = `rotate(${ degs[i] + randomJitter }deg)`; 
  }
}


function handleVoiceChange(e) {
  document.querySelector('#play-btn').setAttribute("disabled", "disabled"); 
  currentStateObj.syllableSamples = []; 

  const syllables = currentStateObj.syllables; 
  const ctx = currentStateObj.audioContext || new AudioContext(); 

  debugger
  const vox = e.currentTarget.value; 
  
  for (let i = 0; i < syllables.length; i++) {
    loadSyllableSound(syllables[i], ctx, i, vox); 
  }
}