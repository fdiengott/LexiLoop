

export const fetchWordData = (searchWord) => {
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${searchWord}?key=${process.env.MERRIAM_WEBSTER_KEY}`; 
  
  // get audio
  let res = await fetch(url);
  
  if (res.ok) {  
    let json = await res.json(); 
  } else {
    let json = { Error: res.status }
  }

  return json; 
}

