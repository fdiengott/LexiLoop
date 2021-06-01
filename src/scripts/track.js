

export const setupTracks = (syllables, parentNode) => {
  console.log('inside setupTracks');
  
  syllables.forEach(syl => {
    parentNode.appendChild(trackTemplate(syl, null))
  });
}

const trackTemplate = (displayText, audio) => {
  // this will create the DOM elements that every track needs without the specifics

  // this is the container for each track
  const section = document.createElement('section');
  section.classList = 'track'; 

  const aside = document.createElement('aside'); 
  const h3 = document.createElement('h3'); 
  h3.innerText = displayText; 

  aside.appendChild(h3); 
  section.appendChild(aside); 

  const buttonDiv = document.createElement('div'); 

  for (let i = 0; i < 8; i++) {
    let button = document.createElement('button'); 

    // probably need to add a specific event listener

    button.classList = `beat-btn btn-${i}`; 
    buttonDiv.appendChild(button); 
  }

  section.appendChild(buttonDiv); 

  // add filters and what not. Will call methods in audio.js

  return section; 

}

export const removeTracks = () => {

}