
import { handleClick } from './audio';


export const setupTracks = (syllables, parentNode) => {
  console.log('inside setupTracks');
  
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
  buttonDiv.classList = `track`; 
  buttonDiv.classList = `track-${idx}`; 

  for (let i = 0; i < 8; i++) {
    let button = document.createElement('button'); 

    
    button.classList = `beat-btn btn-${i}`; 
    button.dataset.beatNum = i; 
    button.dataset.active = false; 
    buttonDiv.appendChild(button); 
  }
  
  // probably need to add a specific event listener    
  // buttonDiv.addEventListener("click", handleClick, { capture: false })
  buttonDiv.addEventListener("click", handleClick, false )

  section.appendChild(buttonDiv); 

  // add filters and what not. Will call methods in audio.js

  return section; 

}

export const removeTracks = (parentNode) => {

  // MUST ALSO REMOVE ALL EVENT LISTENERS

  while (parentNode.firstChild()) {
    parentNode.removeChild(parentNode.firstChild)
  }

}

