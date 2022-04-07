async function myFunc() {
    // wordcloud = document.getElementById("chartdiv");
    // wordcloud.style.display = "none";
    //Hide the Word Cloud
    let url = 'http://localhost:8983/solr/tweets/query?defType=dismax&indent=true&rows=100&df=Text&fl=*,score&debugQuery=true&q.op=OR&q=';
    let query = document.getElementById('userSearchQuery');
    //url = url + query.value
    //console.log(url);
    url = url + query.value;
    var div = document.getElementById('resultsDiv');
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
    //To measure the speed of querying
    // let displayColumns = ['name', 'username', 'text', 'retweet_count', 'like_count', 'score'];
    let displayColumns = ['Name', 'Username', 'Text', 'score', 'PolarityMeter'];
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
    // the table
    var table = document.createElement("table");
    table.classList.add("table");
    table.classList.add("table-striped");
    table.classList.add("table-bordered");
    table.classList.add("table-hover")
    // create headers
    var tr = table.insertRow(-1); // TABLE ROW.
    //var tableHeaders = ['Profile Name', 'Username', 'Text', 'Query Score'];
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th"); // TABLE HEADER.
      th.innerHTML = displayColumns[i];
      th.style.textAlign = "center";
      tr.appendChild(th);
    }
    // add rows
    for (var i = 0; i < myData.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = myData[i][col[j]];
      }
    }
    // Output
    var resultWording = document.getElementById("resultWord");
    var num = (noOfDocs >= 100) ? 100 : noOfDocs;
    resultWording.innerHTML = div.innerHTML + "Displaying Top " + num + " Search Results";
    resultWording.style.textAlign = "center";

    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = div.innerHTML + noOfDocs + " Docs found in " + querySpeed + " milliseconds!";
    //The (preparationTime + processingTime) can also be used here

    var divContainer = document.getElementById("resultsDiv");
    divContainer.innerHTML = "";

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
      sentiment.innerHTML = "<b>Sentiment: </b>" + row[4].innerHTML;
      outerCard.appendChild(title);
      outerCard.appendChild(body);
      outerCard.appendChild(score);
      outerCard.appendChild(sentiment);
      divContainer.appendChild(outerCard);
      if(row[4].innerText ==  "Slightly Pro Ukraine" || row[4].innerText ==  "Pro Ukraine"){
        outerCard.style.backgroundColor = 'AliceBlue';
      }
      else if(row[4].innerText ==  "Slightly Pro Russia" || row[4].innerText == "Pro Russia"){
        outerCard.style.backgroundColor = 'LightPink';
      }
      else{
        outerCard.style.backgroundColor = 'white';
      }  
    }//Creating a card for each result
  }
