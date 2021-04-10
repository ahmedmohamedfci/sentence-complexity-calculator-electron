// reference elements
const calculateButton = document.getElementById("calculateButton");
const inputTextArea = document.getElementById("inputTextArea");
const resultP = document.getElementById("resultPar");
const axios = require('axios');
var querystring = require('querystring');
const { match } = require('assert');


// set event handler
calculateButton.onclick = calculate;

async function calculate(){
    let text = inputTextArea.value;
    let textLower = text.toLowerCase();
    
    

    getPartsOfSpeech(text,(code,res,err)=>{
        if(err)
        {
            console.error(err);
            return;
        }
        let nuSub_nuWh = countSubAndWh(textLower);
        let nuVf = countUvf(res.data.taggedText);
        let nuNp = countUNp(res.data.taggedText);    
        resultP.innerText = (2 * nuSub_nuWh + nuVf + nuNp);
    });
}


function getPartsOfSpeech(text,cb){
    var bodyFormData = new FormData();

    axios.post('https://parts-of-speech.info/tagger/tagger', querystring.stringify({
        text: text,
        language: 'en'
    }))
    .then((res) => {
        cb(res.statusCode,res,null);
    })
    .catch((error) => {
        cb(null,null,error);
    })
}


function countSubAndWh(text){
	text = " " + text;
    let subList = ["after[.,; ]" , " although[.,; ]" , " as[.,; ]" , " as if[.,; ]" , " as long as[.,; ]" , " as much as[.,; ]" , " as soon as[.,; ]" , " as though[.,; ]" , " assuming that[.,; ]" , " because[.,; ]" , " before[.,; ]" , " by the time [.,; ]" , " consequently[.,; ]" , " due to[.,; ]" , " even if[.,; ]" , " even though [.,; ]" , " for[.,; ]" , " hence[.,; ]" , " how[.,; ?]" , " if[.,; ]" , " in case [.,; ]" , " in order that[.,; ]" , " in order to[.,; ]" , " lest [.,; ]" , " now[.,; ]" , " now that[.,; ]" , " once[.,; ]" , " only if [.,; ]" , " provided that[.,; ]" , " rather than[.,; ]" , " since[.,; ]" , " so that[.,; ]" , " than[.,; ]" , " that[.,; ]" , " therefore[.,; ]" , " though[.,; ]" , " till [.,; ]" , " unless[.,; ]" , " until[.,; ]" , " what[,; ][^\?]*[\.]\." , " whatever [.,; ]" , " when[.,; ?]" , " whenever[.,; ]" , " where[.,; ?]" , " whereas[.,; ]" , " wherever[.,; ]" , " whether[.,; ]" , " which[.,; ?]" , " whichever[.,; ]" , " while[.,; ]" , " whoever [.,; ]" , " whom[.,; ]" , " whom[.,; ]" , " whomever[.,; ]" , " whosever[.,; ]"," who[.,; ?]","why[.,; ?]","whose[.,; ?]"];
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
    let matcher = text.match(/(_NN|_PRP|_DT|_IN|_TO|_JJ)/g);
    return matcher? matcher.length : 0;
}