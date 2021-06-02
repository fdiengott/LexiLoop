require("babel-core/register");
require("babel-polyfill");
import './styles/index.scss'; 

import { getWordAudio, getWordSyllables, syllableToIpa, getWordIPA } from './scripts/dictionary'; 
import { setupTracks, removeTracks } from './scripts/track';
import { playWord, playIPA, loadSyllableSound, playSyllable, currentStateObj } from './scripts/audio'; 


currentStateObj.currentInput = null; 

// {
//   currentInput: null,
//   audioContext: null, 
//   isPlaying: false, 
//   startTime: null, 
//   current16thNote: null,     // last note that was scheduled to be played
//   tempo: 50.0,              // measured in bpm
//   lookAhead: 25.0,          // how frequently to call the scheduling function
//   scheduleAheadTime: 0.1,   // how far ahead to schedule notes
//   nextNoteTime: 0, 
//   currentNote: 0, 
//   syllableSamples: {},
//   numSyllables: 0, 
//   // currentEventListeners: [],
// };

document.addEventListener("DOMContentLoaded", init); 


// should maybe change this to a debouncing function that fires after a certain amount of time elapses without typing
document.querySelector("#input-text-form").addEventListener("submit", handleInput);


// GLOBAL CONTROLS
const tempoControl = document.querySelector('#tempo'); 
tempoControl.addEventListener('input', (e) => {
  currentStateObj.tempo = Number(e.currentTarget.value); 
})

function init() {
  meSpeak.loadVoice('en/en-us'); 
}

async function handleInput(e) {
  e.preventDefault(); 
  resetTracks(); 
  
  const inputText = e.currentTarget.firstElementChild.firstElementChild.value; 
  currentStateObj.currentInput = inputText; 

  // RESET THE INPUT
  e.currentTarget.firstElementChild.firstElementChild.innerText = ""; 
  

  // CREATE THE TRACKS
  const trackContainer = document.getElementById('track-wrapper');
  const syllables = await getWordSyllables(inputText); 
  currentStateObj.numSyllables = syllables.length; 
  setupTracks(syllables, trackContainer); 
  
  // INITIALIZE AUDIO_CONTEXT
  const ctx = new AudioContext(); 
  

  // FOR TESTING
  // const audio = await loadSyllableSound('hel', ctx); 
  // await loadSyllableSound('hel', ctx).then( res => {
  //   debugger
  //   currentStateObj.syllableSamples[0] = res
  // }); 
  // currentStateObj.syllableSamples[0] = audio;  

  
  for (let i = 0; i < syllables.length; i++) {
    loadSyllableSound(syllables[i], ctx, i); 
  }
}


function startDOM() {
}

function unregisterEventListeners() { 
}

function resetTracks() {
  console.log("in reset tracks");

  // should remove all event listeners and trigger a remove all tracks

  // removeTracks(document.getElementById('track-wrapper')); 
}
