// reference elements
const calculateButton = document.getElementById("calculateButton");
const inputTextArea = document.getElementById("inputTextArea");
const resultP = document.getElementById("resultPar");
// const axios = require('axios');
// var querystring = require('querystring');
// const { match } = require('assert');


// set event handler
calculateButton.onclick = calculate;

function calculate(){
    let text = inputTextArea.value;
    let textLower = text.toLowerCase();
    text = text.split('\n');
    
    getPartsOfSpeech(text,(code,res,err)=>{
        if(err)
        {
            alert(err);
            return;
        }
        let nuSub_nuWh = countSubAndWh(textLower);
        let nuVf = countUvf(res.data.taggedText);
        let nuNp = countUNp(res.data.taggedText);    
		nuSub_nuWh -= discardNonSubs(res.data.taggedText);
        resultP.innerText = (2 * nuSub_nuWh + nuVf + nuNp);
    });
}

function discardNonSubs(text){
	// sometimes something like "that" comes as a noun and sometimes as a sub, this function detects if it came as a noun and removes it from the list of subs
	let nonSubs = text.toLowerCase().match(/(( that_dt [^\?])|( that_in [^\?]))/g);
	return nonSubs ? nonSubs.length : 0;
}


function getPartsOfSpeech(text,cb){

    fetch("https://parts-of-speech.info/tagger/tagger", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US",
            "content-type": "application/x-www-form-urlencoded",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
          },
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": serialize({text:text[0],language:'en'}),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    })
    .then(res => res.json())
    .then(data => cb(data));

    // $.post('https://parts-of-speech.info/tagger/tagger',serialize({text: text[0],language: 'en'}))
    // .done((data,status) =>  cb(data,status,null) )
    // .fail((xhr, status, error) => cb(null,null,error));
}


function countSubAndWh(text){
	text = " " + text;
    let subList = ["after[.,; ]" , " although[.,; ]" , "[^such] as[.,; ]" , " as if[.,; ]" , " as long as[.,; ]" , " as much as[.,; ]" , " as soon as[.,; ]" , " as though[.,; ]" , " assuming that[.,; ]" , " because[.,; ]" , " before[.,; ]" , " by the time [.,; ]" , " consequently[.,; ]" , " due to[.,; ]" , " even if[.,; ]" , " even though [.,; ]" , " for[.,; ]" , " hence[.,; ]" , " how[.,; ?]" , " if[.,; ]" , " in case [.,; ]" , " in order that[.,; ]" , " in order to[.,; ]" , " lest [.,; ]" , " now[.,; ]" , " now that[.,; ]" , " once[.,; ]" , " only if [.,; ]" , " provided that[.,; ]" , " rather than[.,; ]" , " since[.,; ]" , " so that[.,; ]" , " than[.,; ]" , " that[.,; ]" , " therefore[.,; ]" , " though[.,; ]" , " till [.,; ]" , " unless[.,; ]" , " until[.,; ]" , " what[,; ']" , " whatever [.,; ']" , " when[.,; \?']" , " whenever[.,; ]" , " where[.,; \?']" , " whereas[.,; ]" , " wherever[.,; ]" , " whether[.,; ]" , " which[.,; \?']" , " whichever[.,; ]" , " while[.,; ]" , " whoever [.,; ]" , " whom[.,; ]" , " whomever[.,; ]" , " whosever[.,; ]"," who[.,; \?']","why[.,; \?']","whose[.,; \?']"];
    let ret = 0;
    for(let i = 0 ; i < subList.length ; i++){
        var re = new RegExp(subList[i], 'g');
        let matcher = text.match(re);
        ret+= matcher? matcher.length : 0;
    }
    return ret;
}


function countUvf(text){
    
    let matcher = text.match(/(_VBZ|_VBD|_VBN|_VBP|_MD|_VB)/g);
    return matcher? matcher.length : 0;
}


function countUNp(text){
    let matcher = text.match(/(_NN|_CC|_PRP|_DT|_TO|_JJ|_EX|_RB|_UH|[^as]_IN)/g);
    let size = matcher? matcher.length : 0;
	let matcherSuchAs = text.match(/(such_JJ as_IN)/g);
	size += matcherSuchAs ? matcherSuchAs.length : 0 ;
	return size;
}


serialize = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }