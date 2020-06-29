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
        let nuWh = countWH(textLower);
        let nuSub = countSub(textLower);
        let nuVf = countUvf(res.data.taggedText);
        let nuNp = countUNp(res.data.taggedText);    
        resultP.innerText = (2 * nuSub + 2 * nuWh + nuVf + nuNp);
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


function countWH(text){
    let whList = ['where','which','who','why','how','when'];
    let ret = 0;
    for(let i = 0 ; i < whList.length ; i++){
        var re = new RegExp(whList[i], 'g');
        let matcher = text.match(re);
        ret+= matcher? matcher.length : 0;
    }
    return ret;
}


function countSub(text){
    let subList = ['that'];
    let ret = 0;
    for(let i = 0 ; i < subList.length ; i++){
        var re = new RegExp(subList[i], 'g');
        let matcher = text.match(re);
        ret+= matcher? matcher.length : 0;
    }
    return ret;
}


function countUvf(text){
    
    let matcher = text.match(/_VBZ/g);
    return matcher? matcher.length : 0;
}


function countUNp(text){
    let matcher = text.match(/_NN/g);
    return matcher? matcher.length : 0;
}