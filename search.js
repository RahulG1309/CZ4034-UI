async function myFunc() {
    // let url = 'http://localhost:8983/solr/tweets/query?defType=dismax&indent=true&rows=100&df=Text&fl=*,score&debugQuery=true&q.op=OR&q=';
    let url1 = 'http://localhost:8983/solr/tweets/query?defType=dismax&indent=true&rows=100&df=';
    let url2 = '&fl=*,score&debugQuery=true&q.op=OR&q=';
    let url3 = '&fq=PolarityMeter:';
    let query = document.getElementById('userSearchQuery');
    let queryField = document.getElementById('searchCat'); //lets users query field
    let queryFilter = document.getElementById('sentimentCat');

    let url = url1 + queryField.value + url2+query.value + url3 + queryFilter.value;
    console.log(url);
    //url = url + query.value;

    var div1 = document.getElementById('resultTitleText');
    div1.innerHTML = "";
    var div2 = document.getElementById('resultStatsText');
    div2.innerHTML = "";
    var div3 = document.getElementById('resultContent');
    div3.innerHTML = "";
    var div4 = document.getElementById('chartContainer');
    div4.innerHTML = "";
    //Emptying the current results, incase of requery
    //console.log(url)
    var response = await fetch(url);
    var data = await response.json();
    // console.log(data.response)
    // console.log(data.response.docs)
    // console.log(data.responseHeader)
    var noOfDocs = data.response.numFound
    var myData = data.response.docs
    // var preparationTime = data.debug.timing.prepare.query.time;
    // var processingTime = data.debug.timing.process.query.time;
    // console.log(data.debug);
    var querySpeed = data.debug.timing.time;
    console.log(data)
    var correctlySpelled = data.spellcheck.correctlySpelled;
    if(!correctlySpelled){
      if(data.spellcheck.collations.length != 0){
        console.log(data.spellcheck.collations[1].collationQuery);
        var newQuery = data.spellcheck.collations[1].collationQuery;
        var urlNew = url1+queryField.value+url2+newQuery;
        }
        else var newQuery = null;
    }

    //create new query link ???
    //console.log(data.spellcheck.suggestions[1].suggestion[0].word)
    //var suggestedTerm = data.spellcheck.suggestions[1].suggestion[0].word;
    // Output
    if(!correctlySpelled){
      var sendNewQuery = document.getElementById("sendNewQuery");
      if(newQuery != null){
        sendNewQuery.innerHTML = urlNew;
      }
      else{
                if(data.spellcheck.suggestions.length != 0){
          var suggestedTerm = data.spellcheck.suggestions[1].suggestion[0].word;
          sendNewQuery.innerHTML = "Query not found , did you mean : " + "<a href='#' id='newSearchTerm' onclick='newSearch()'>"+ suggestedTerm + "</a>";
        }
        else{
          var num = data.response.numFound;
          //console.log(num)
          if(num == 0){
            sendNewQuery.innerHTML = "Query not found , please type another term";
          }
          
        }
      }
    }
    let displayColumns = ['name', 'username', 'text', 'score', 'PolarityMeter'];
    myData = myData.map(x => {
      let newObj = {};
      for (col of displayColumns) {
        newObj[col] = x[col];
      }
      return newObj;
    });
    var col = [];
    for (var i = 0; i < myData.length; i++) {
      for (var key in myData[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }

    //Initialize data for the chart
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;

    //Creating the Base Table
    var table = document.createElement("table");
    table.classList.add("table");
    table.classList.add("table-striped");
    table.classList.add("table-bordered");
    table.classList.add("table-hover")
    //Creating Headers
    var tr = table.insertRow(-1); //Table Row
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th"); //Table Header
      th.innerHTML = displayColumns[i];
      th.style.textAlign = "center";
      tr.appendChild(th);
    }
    //Adding Rows
    for (var i = 0; i < myData.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = myData[i][col[j]];
        if(col[j] === "PolarityMeter") {
          switch(myData[i][col[j]][0]) {
            case "Neutral": c1++;
            break;
            case "Slightly Pro Ukraine": c2++;
            break;
            case "Pro Ukraine": c3++;
            break;
            case "Slightly Pro Russia": c4++;
            break;
            case "Pro Russia": c5++;
            break;
          }
        }
      }
    }
    //console.log("Neutral: " +c1);
    //console.log("Slightly Pro-Ukraine: " + c2);
    //console.log("Pro-Ukraine: " + c3);
    //console.log("Slightly Pro-Russia: " + c4);
    //console.log("Pro-Russia: " + c5);
    
    //Result Chart
      // set the data
      var data = [
        {x: "Neutral", value: c1},
        {x: "Slightly Pro-Ukraine", value: c2},
        {x: "Pro-Ukraine", value: c3},
        {x: "Slightly Pro-Russia", value: c4},
        {x: "Pro-Russia", value: c5}
      ];
      // create the chart
      var chart = anychart.pie();
      // set the chart title
      chart.title("Semantic Category"); 
      // add the data
      chart.data(data);
      //set items layout
      chart.legend().itemsLayout("horizontal");
        //set legend position
        //chart.legend().position("bottom");
        chart.legend().fontSize(10);
        chart.legend().fontWeight(600);
        var bounds = chart.bounds(0,0,500,500);
      // display the chart in the container
      chart.container('chartContainer');
      chart.draw();

    
    //Results Title
    var resultTitle= document.getElementById("resultTitleText");
    var num = (noOfDocs >= 100) ? 100 : noOfDocs;
    resultTitle.innerHTML = resultTitle.innerHTML + "Displaying Top " + num + " Search Results";
    resultTitle.style.textAlign = "center";

    //Result Stats
    var resultStats = document.getElementById("resultStatsText");
    resultStats.innerHTML = resultStats.innerHTML + noOfDocs + " Docs found in " + querySpeed + " milliseconds!";
    resultStats.style.textAlign  = "center";
    //The (preparationTime + processingTime) can also be used here

    var resultContent = document.getElementById("resultContent");
    resultContent.innerHTML = "";

    //Result Content
    for (var i = 1; i < table.rows.length; i++) {
      row = table.rows[i].getElementsByTagName("td");
      //console.log(row);
      var outerCard = document.createElement("div");
      outerCard.className = 'card mx-3 my-3 px-3 py-3 w-50';
      var title = document.createElement("h6");
      title.innerHTML = row[0].innerHTML + " (<i>@" + row[1].innerHTML + "</i>)";
      var body = document.createElement("div");
      body.innerHTML = row[2].innerHTML;
      body.style.marginBottom = "20px";
      var score = document.createElement("div");
      score.innerHTML = "<b>Query Score: </b>" + row[3].innerHTML;
      var sentiment = document.createElement("div");
      sentiment.innerHTML = "<b>Polarity: </b> " + row[4].innerHTML;
      outerCard.appendChild(title);
      outerCard.appendChild(body);
      outerCard.appendChild(score);
      outerCard.appendChild(sentiment);
      if(row[4].innerText ==  "Slightly Pro Ukraine" || row[4].innerText ==  "Pro Ukraine") { 
        outerCard.style.backgroundColor = 'AliceBlue';
      }
      else if(row[4].innerText ==  "Slightly Pro Russia" || row[4].innerText == "Pro Russia") {
        outerCard.style.backgroundColor = 'LightPink';
      }
      else {
        outerCard.style.backgroundColor = 'white';
      }  
      resultContent.appendChild(outerCard);
    }//Creating a card for each result
  }

async function newSearch(){
  var newTerm = document.getElementById("newSearchTerm").text;
  //alert("Hello! I am an alert box!!"+ newTerm+"");
  let url1 = 'http://localhost:8983/solr/tweets/query?defType=dismax&indent=true&rows=100&df=';
    let url2 = '&fl=*,score&debugQuery=true&q.op=OR&q=';
    let url3 = '&fq=PolarityMeter:';
    let query = newTerm;
    let queryField = document.getElementById('searchCat'); //lets users query field
    let queryFilter = document.getElementById('sentimentCat');
    //console.log(query)
    let url = url1 + queryField.value + url2+query + url3 + queryFilter.value;
    //console.log(url);
    var div1 = document.getElementById('resultTitleText');
    div1.innerHTML = "";
    var div2 = document.getElementById('resultStatsText');
    div2.innerHTML = "";
    var div3 = document.getElementById('resultContent');
    div3.innerHTML = "";
    var div4 = document.getElementById('chartContainer');
    div4.innerHTML = "";
    var response = await fetch(url);
    var data = await response.json();
    var noOfDocs = data.response.numFound
    var myData = data.response.docs
    var querySpeed = data.debug.timing.time;
  //console.log(myData)
  sendNewQuery.innerHTML = "Displaying results for "+ query +" instead";
    let displayColumns = ['name', 'username', 'text', 'score', 'PolarityMeter'];
    myData = myData.map(x => {
      let newObj = {};
      for (col of displayColumns) {
        newObj[col] = x[col];
      }
      return newObj;
    });
    var col = [];
    for (var i = 0; i < myData.length; i++) {
      for (var key in myData[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    var table = document.createElement("table");
    table.classList.add("table");
    table.classList.add("table-striped");
    table.classList.add("table-bordered");
    table.classList.add("table-hover")
    var tr = table.insertRow(-1); 
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th"); 
      th.innerHTML = displayColumns[i];
      th.style.textAlign = "center";
      tr.appendChild(th);
    }
    for (var i = 0; i < myData.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = myData[i][col[j]];
        if(col[j] === "PolarityMeter") {
          switch(myData[i][col[j]][0]) {
            case "Neutral": c1++;
            break;
            case "Slightly Pro Ukraine": c2++;
            break;
            case "Pro Ukraine": c3++;
            break;
            case "Slightly Pro Russia": c4++;
            break;
            case "Pro Russia": c5++;
            break;
          }
        }
      }
    }
      var data = [
        {x: "Neutral", value: c1},
        {x: "Slightly Pro-Ukraine", value: c2},
        {x: "Pro-Ukraine", value: c3},
        {x: "Slightly Pro-Russia", value: c4},
        {x: "Pro-Russia", value: c5}
      ];
      var chart = anychart.pie();
      chart.title("Semantic Category"); 
      chart.data(data);
      chart.legend().itemsLayout("horizontal");
        chart.legend().fontSize(10);
        chart.legend().fontWeight(600);
        var bounds = chart.bounds(0,0,500,500);
      chart.container('chartContainer');
      chart.draw();

    var resultTitle= document.getElementById("resultTitleText");
    var num = (noOfDocs >= 100) ? 100 : noOfDocs;
    resultTitle.innerHTML = resultTitle.innerHTML + "Displaying Top " + num + " Search Results";
    resultTitle.style.textAlign = "center";

    var resultStats = document.getElementById("resultStatsText");
    resultStats.innerHTML = resultStats.innerHTML + noOfDocs + " Docs found in " + querySpeed + " milliseconds!";
    resultStats.style.textAlign  = "center";

    var resultContent = document.getElementById("resultContent");
    resultContent.innerHTML = "";

    for (var i = 1; i < table.rows.length; i++) {
      row = table.rows[i].getElementsByTagName("td");
      var outerCard = document.createElement("div");
      outerCard.className = 'card mx-3 my-3 px-3 py-3 w-50';
      var title = document.createElement("h6");
      title.innerHTML = row[0].innerHTML + " (<i>@" + row[1].innerHTML + "</i>)";
      var body = document.createElement("div");
      body.innerHTML = row[2].innerHTML;
      body.style.marginBottom = "20px";
      var score = document.createElement("div");
      score.innerHTML = "<b>Query Score: </b>" + row[3].innerHTML;
      var sentiment = document.createElement("div");
      sentiment.innerHTML = "<b>Polarity: </b> " + row[4].innerHTML;
      outerCard.appendChild(title);
      outerCard.appendChild(body);
      outerCard.appendChild(score);
      outerCard.appendChild(sentiment);
      if(row[4].innerText ==  "Slightly Pro Ukraine" || row[4].innerText ==  "Pro Ukraine") { 
        outerCard.style.backgroundColor = 'AliceBlue';
      }
      else if(row[4].innerText ==  "Slightly Pro Russia" || row[4].innerText == "Pro Russia") {
        outerCard.style.backgroundColor = 'LightPink';
      }
      else {
        outerCard.style.backgroundColor = 'white';
      }  
      resultContent.appendChild(outerCard);
    }
}
