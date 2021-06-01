require("babel-core/register");
require("babel-polyfill");
import './styles/index.scss'; 

import { getWordAudio, getWordSyllables } from './scripts/dictionary'; 
import { setupTracks } from './scripts/track';
import { playWord, playIPA } from './scripts/audio'; 

const currentStateObj = {
  currentInput: null,
  // currentEventListeners: [],
};


// should maybe change this to a debouncing function that fires after a certain amount of time elapses without typing
document.querySelector("#input-text-form").addEventListener("submit", handleInput);

async function handleInput(e) {
  e.preventDefault(); 
  resetTracks(); 
  
  const inputText = e.currentTarget.firstElementChild.firstElementChild.value; 
  const syllables = await getWordSyllables(inputText); 
  // playWord(inputText); 

  // setupTracks(syllables, document.getElementById('track-wrapper')); 
  playIPA(syllables[0]); 

}


function startDOM() {
}

function unregisterEventListeners() { 
}

function resetTracks() {
  console.log("in reset tracks");
}
