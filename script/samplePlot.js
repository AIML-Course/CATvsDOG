function dashboard1(id, fData) {
    var barColor = 'steelblue';
    function segColor(c){ return {cat:"#807dba", dog:"#e08214"}[c]; }
    // compute total for each state.
    fData.forEach(function(d){d.total=0;});
    // function to handle histogram.
    function br() {
        d3.select(id).append("br");
    }
    function histoGram(fD, hGTitle){
        var hG = {}, hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 800 - hGDim.l - hGDim.r, 
        hGDim.h = 200 - hGDim.t - hGDim.b;
        //create svg for histogram.
        d3.select(id).append("h1").text(hGTitle).append("br");
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));
        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");
        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill', barColor)
            .on("mouseover", mouseover)// mouseover is defined below.
            .on("mouseout", mouseout);// mouseout is defined below.
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");
        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
            // call update functions of pie-chart and legend.    
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            pC.update(tF);
            leg.update(tF);
        }
        
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);
            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1]).substr(0,3)})
                .attr("y", function(d) {return y(d[1])-5; });            
        }        
        return hG;
    }
    
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
        // create svg for pie chart.
        d3.select(id).append("h1").text("Cat vs Dog PieChart").append("br");
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);
        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });
        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);
        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }        
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hGW.update(fData.map(function(v){ 
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
            hGR.update(fData.map(function(v){ 
                return [v.State,v.rate[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hGW.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
            hGR.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
        return pC;
    }
    
    // function to handle legend.
    function legend(lD){
        var leg = {};
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');
        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(d){ return segColor(d.type); });
        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});
        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});
        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});
        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);
            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});
            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }
        return leg;
    }
    // calculate total frequency by segment for all state.
    var tF = ['cat','dog'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });
    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State, d.total];});
    var pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF),  // create the legend.
        br1 = br(),
        hGW = histoGram(sF, "Unit Count"), // create the histogram.
        br2 = br(),
        hGR = histoGram(sF, "Unit WinRate"); // create the histogram.
}
var groupBy = function(xs, key) {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
function form1(tempData) {
    console.log(tempData);
    var groupData = groupBy(tempData, "id");
    var arr = [];
    for(var i = 1; i <= 50; i++) {
        var tmp = groupData[i];
        if(tmp) {
            arr.push({
                "State": i + "",
                "freq": {
                    "cat": tmp.filter(obj =>
                        obj.catdog == "cat").reduce((a, b) =>
                        a + b.win, 0),
                    "dog": tmp.filter(obj =>
                        obj.catdog == "dog").reduce((a, b) =>
                        a + b.win, 0)
                },
                "rate": {
                    "cat": tmp.filter(obj =>
                        obj.catdog == "cat").reduce((a, b) =>
                        a + b.win / b.cnt, 0.0),
                    "dog": tmp.filter(obj =>
                        obj.catdog == "dog").reduce((a, b) =>
                        a + b.win / b.cnt, 0.0)
                }
            })
        }
    }
    console.log(arr);
    return arr;
}

var req = new XMLHttpRequest();
req.open('GET', 'https://t66c0e5zv9.execute-api.ap-northeast-1.amazonaws.com/default/getCatDogResult', true);
req.onload = function() {
    if(this.status >= 200 && this.status < 400) {
        var tempData = JSON.parse(this.response);
        dashboard1('#dashboard1', form1(tempData));
    } else {
        console.log("ERROR: Return");
    }
};
req.onerror = function() {
    console.log("ERROR: Server Connection");
};
req.send();
