require("babel-core/register");
require("babel-polyfill");
import './styles/index.scss'; 

import { 
  getWordAudio, 
  getWordSyllables, 
  syllableToIpa, 
  getWordIPA 
} from './scripts/dictionary'; 

import { 
  setupTracks, 
  removeTracks 
} from './scripts/track';

import { 
  playWord, 
  playIPA, 
  loadSyllableSound, 
  playSyllable, 
  currentStateObj, 
  scheduler 
} from './scripts/audio'; 




currentStateObj.currentInput = null; 

document.addEventListener("DOMContentLoaded", init); 


// should maybe change this to a debouncing function that fires after a certain amount of time elapses without typing
document.querySelector("#input-text-form").addEventListener("submit", handleInput);
const playBtn = document.querySelector('#play-btn'); 
playBtn.setAttribute("disabled", "disabled"); 


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
  
  const inputText = e.currentTarget.children[1].value; 
  currentStateObj.currentInput = inputText; 

  // RESET THE INPUT
  // e.currentTarget.children[1].value = ""; 
  

  // CREATE THE TRACKS
  const trackContainer = document.getElementById('track-wrapper');

  // reset the samples array
  currentStateObj.syllableSamples = []; 
  const syllables = await getWordSyllables(inputText); 
  currentStateObj.numSyllables = syllables.length; 
  setupTracks(syllables, trackContainer); 
  
  // INITIALIZE AUDIO_CONTEXT
  const ctx = new AudioContext(); 
  
  // LOAD ALL OF THE SYLLABLE SOUNDS
  for (let i = 0; i < syllables.length; i++) {
    loadSyllableSound(syllables[i], ctx, i); 
  }
}

export const start = () => {
  const playBtn = document.querySelector('#play-btn');
  const syllableSamples = Object.values(currentStateObj.syllableSamples); 
  currentStateObj.isPlaying = false;
  // debugger

  // if there are audio files and they are not promises
  if (syllableSamples.length == currentStateObj.numSyllables && 
    syllableSamples.every( sample => typeof sample !== 'Promise')) {
    playBtn.removeAttribute("disabled"); 

    if (currentStateObj.firstWord) {
      playBtn.addEventListener("click", handleNewWord);
      currentStateObj.firstWord = false; 
    }
  }

}

const handleNewWord = (e) => {
  debugger
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
  // debugger

  while (noteQueue.length && noteQueue[0].time < currentTime) {
      drawNote = currentStateObj.noteQueue[0].note;
      currentStateObj.noteQueue.splice(0,1);   // remove note from queue
  }

  // We only need to draw if the note has moved.
  if (currentStateObj.lastNoteDrawn != drawNote) {
    const tracks = document.querySelectorAll('.track'); 
    tracks.forEach( track => {
      track.children[currentStateObj.lastNoteDrawn].style.boxShadow = '';
      track.children[drawNote].style.boxShadow = '0 0 8px rgba(137, 255, 82, 1)';
    });

    currentStateObj.lastNoteDrawn = drawNote;
  }
  
  requestAnimationFrame(draw);
}

function resetTracks() {
  const trackContainer = document.getElementById('track-wrapper');
  removeTracks(trackContainer); 
}
