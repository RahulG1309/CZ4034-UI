am5.ready(async function() { 
 
    // Create root element 
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element 
    var root = am5.Root.new("chartdiv"); 
    // Set themes 
    // https://www.amcharts.com/docs/v5/concepts/themes/ 
    root.setThemes([ 
      am5themes_Animated.new(root) 
    ]); 
    // Add series 
    // https://www.amcharts.com/docs/v5/charts/word-cloud/ 
    var series = root.container.children.push(am5wc.WordCloud.new(root, { 
      categoryField: "key", 
      valueField: "value", 
      maxFontSize: am5.percent(15) 
    })); 
    // Configure labels 
    series.labels.template.setAll({ 
      fontFamily: "Courier New" 
    }); 
    // code for animation 
    setInterval(function() {   
      am5.array.each(series.dataItems, function(dataItem) { 
        var value = Math.random() * 65; 
        value = value - Math.random() * value; 
        dataItem.set("value", value); 
        dataItem.set("valueWorking", value); 
      }) 
    }, 5000) 
     
    let url = "http://localhost:8983/solr/tweets/query?q=*:*&q.op=OR&indent=true&facet=true&facet.field=Text&facet.query=*:*"; 
    var response = await fetch(url); 
    var data = await response.json(); 
    const values = {}; 
    var count = []; 
    var words = []; 
    //console.log(data)
    console.log(data.facet_counts.facet_fields.Text)
    for (var i = 0; i < data.facet_counts.facet_fields.Text.length; i += 2) { 
        words.push(data.facet_counts.facet_fields.Text[i]); 
        data.facet_counts.facet_fields.Text[i+1] && count.push(data.facet_counts.facet_fields.Text[i + 1]); 
    } 
    var list = []; 
    for(var i=0; i<words.length; i++){ 
      var item = {}; 
      item[words[i]] = count[i]; 
      list.push(item); 
    } 
    // Data from: 
    // https://insights.stackoverflow.com/survey/2021#section-most-popular-technologies-programming-scripting-and-markup-languages 
    for(var i=0; i<words.length; i++){ 
      series.data.push({ 
        key : words[i], value : count[i] 
      }); 
    } 
    }); // end am5.ready()