// import { fetchSyllables } from './util'; 
// import { fetchWordData, fetchIPA } from './hiddenApiKeyFunctions'; 


// export const getWordAudio = (searchWord) => {
//   let data = fetchWordData(searchWord); 

//   debugger
//   return data[0]?.hwi?.prs[0]?.sound?.audio; 
// }

// WORDS API
async function getWordSyllables(searchWord) {
  let response = await fetch(`./syllables/${searchWord}`);
  let data = await response.json(); 

  debugger
  // let data = await fetchSyllables(searchWord); 
  return data.syllables ? data.syllables.list : data.message; 

}

async function getRandomWord() {
  let response = await fetch(`./randomWord`);
  let data = await response.json(); 

  debugger
  return filterWord(data.word); 
}

const filterWord = (word) => {
  debugger
  if (word.indexOf(' ') > 0) {
    return word.split(' ')[0]; 
  } 
  
  if (word.indexOf('-') > 0) {
    return word.split('-')[0]; 
  }

  return word; 
}

module.exports.getWordSyllables = getWordSyllables; 
module.exports.getRandomWord = getRandomWord; 