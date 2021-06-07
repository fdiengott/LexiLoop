
// WORDS API
async function getWordSyllables(searchWord) {
  let response = await fetch(`./syllables/${searchWord}`);
  let data = await response.json(); 

  return data.syllables ? data.syllables.list : data.message; 

}

async function getRandomWordSyllables() {
  let response = await fetch(`./randomWord`);
  let data = await response.json(); 
  
  // OPTIMIZATION
  if (data.syllables) {
    return data.syllables.list; 
  }
  
  if (data.word.indexOf(' ') > 0 || data.word.indexOf('-') > 0) {
    return getRandomWordSyllables(); 
  }
  
  const syllables = await getWordSyllables(data.word); 
  
  if (Array.isArray(syllables)) {
    return syllables;
  } else {
    return getRandomWordSyllables(); 
  }
}

async function getRandomWord() {
  let response = await fetch(`./randomWord`);
  let data = await response.json(); 

  if (data.word.indexOf(' ') > 0 || data.word.indexOf('-') > 0) {
    return getRandomWord(); 
  }

  return data.word; 

  // return filterWord(data.word); 
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
module.exports.getRandomWordSyllables = getRandomWordSyllables; 