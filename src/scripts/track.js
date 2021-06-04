
import { handleClick, handlePitchChange } from './audio';


export const setupTracks = (syllables, parentNode) => {
  syllables.forEach((syl, i) => {
    parentNode.appendChild(trackTemplate(syl, i))
  });
}

const trackTemplate = (displayText, idx) => {
  // this will create the DOM elements that every track needs without the specifics

  // this is the container for each track
  const section = document.createElement('section');
  section.classList = 'track-section'; 

  const aside = document.createElement('aside'); 
  const h3 = document.createElement('h3'); 
  h3.innerText = displayText; 

  aside.appendChild(h3); 
  section.appendChild(aside); 

  const buttonDiv = document.createElement('div'); 
  buttonDiv.classList.add(`track`); 
  buttonDiv.classList.add(`track-${idx}`); 

  for (let i = 0; i < 8; i++) {
    let button = document.createElement('button'); 
    
    button.classList.add(`beat-btn`); 
    button.classList.add(`btn-${i}`); 
    if (i % 4 === 0) {
      button.classList.add(`downbeat`); 
    }

    button.dataset.beatNum = i; 
    button.dataset.active = false; 
    buttonDiv.appendChild(button); 
  }
  
  // BUTTONS LISTENERS
  buttonDiv.addEventListener("click", handleClick, false ); 
  section.appendChild(buttonDiv); 

  // LOCAL CONTROLS CONTAINER
  const controlsDiv = document.createElement('div'); 
  
  // PITCH CONTROL
  const pitchKnob = document.createElement('input'); 
  pitchKnob.type = "range"; 
  pitchKnob.min = "0.6"; 
  pitchKnob.max = "2.2"; 
  pitchKnob.step = "0.1"; 

  pitchKnob.dataset.trackNum = idx; 

  // USING INPUT KNOBS LIBRARY https://g200kg.github.io/input-knobs/
  pitchKnob.classList.add('input-knob'); 
  pitchKnob.dataset.diameter = "32"
  pitchKnob.dataset.fgcolor = "#f3ea5f"


  // <input type="range" id="pitch" min="0.6" max="2.2" step="0.2">
  
  // LOCAL CONTROLS LISTENERS
  pitchKnob.addEventListener("input", handlePitchChange, false);

  
  controlsDiv.appendChild(pitchKnob); 
  section.appendChild(controlsDiv); 

  return section; 

}

export const removeTracks = (parentNode) => {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild)
  }

}

