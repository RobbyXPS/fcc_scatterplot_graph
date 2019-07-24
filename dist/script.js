//define vars for svg sizes
var height = 400,
width = 800;

//define the svg container to draw on
var svgContainer = d3.select('#visHolder').
append('svg').
attr('height', height + 60).
attr('width', width + 100);

//define the y-axis and place it
svgContainer.append('text').
text('Minutes').
attr('x', -250).
attr('y', 20).
attr('transform', 'rotate(-90)');

//define the x-axis and place it
svgContainer.append('text').
text('Years').
attr('x', 450).
attr('y', 450);

//define the tooltip that displays when a dot is hovered over
var tooltip = d3.select("#visHolder").
append("div").
attr('id', 'tooltip').
style('opacity', .0);

//fetch the supplied data
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', function (data) {

  //define an array for housing y-axis values
  var times = [];
  //define an array for housing x-axis values
  var years = [];

  //iterate through each item in the original data and capture it's value in the times/years arrays
  data.forEach(function (item) {
    times.push(item.Time);
    years.push(item.Year);
  });

  //parse the string times from the times array into date objects housed in the parsedTime array
  var parsedTime = times.map(function (d) {
    return d3.timeParse("%M:%S")(d);
  });

  //parse the string years from the years array into date objects housed in the parsedYears array
  var parsedYears = years.map(function (d) {
    return d3.timeParse("%Y")(d);
  });

  //define the y-scale
  var yScale = d3.scaleTime()
  //the extend method returns both min/max values at once
  .domain(d3.extent(parsedTime))
  //no need to flip range, lower times are better and should be on top
  .range([0, height]);

  //define the x-scale
  var xScale = d3.scaleTime()
  //the extend method returns both min/max values at once
  .domain(d3.extent(parsedYears)).
  range([0, width]);

  //define the y-axis
  var yAxis = d3.axisLeft()
  //feed it the scale created earlier
  .scale(yScale)
  //define that the tick mark format to display
  .tickFormat(d3.timeFormat("%M:%S"));

  //define the x-axis
  var xAxis = d3.axisBottom()
  //feed it the scale created earlier
  .scale(xScale)
  //define that the tick mark format to display
  .tickFormat(d3.timeFormat("%Y"));

  //group all the y-axis elements together so they are easier to transform.
  var yAxisGroup = svgContainer.append('g').
  call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(80,10)').
  attr("stroke-width", 2);

  //group all the x-axis elements together so they are easier to transform.
  var xAxisGroup = svgContainer.append('g').
  call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(80,410)').
  attr("stroke-width", 2);

  //define and draw the graph's dots
  svgContainer.selectAll("circle")
  //interate over the original datasource
  .data(data)
  //draw the dots via enter/append
  .enter().
  append("circle")
  //assign the x value of the dot based on the date object, run it through the scale so it fits
  .attr("cx", function (d, i) {
    return xScale(parsedYears[i]);
  })
  //assign the y value of the dot based on the date object, run it through the scale so it fits
  .attr("cy", function (d, i) {
    return yScale(parsedTime[i]);
  })
  //assign the dot a radius of 5
  .attr("r", "5")
  //move the dots over to match the x/y axis placement
  .attr('transform', 'translate(80,10)')
  //assign a custom attribute with the value of the single year (e.g. 1994)
  .attr('data-xvalue', function (d, i) {
    return years[i];
  })
  //assign a custom attribute for the value of how many minutes, per the AC the time value should be in a date object format (e.g. Mon Jan 01 1900 00:39:50 GMT-0800 (Pacific Standard Time))
  .attr('data-yvalue', function (d, i) {
    return parsedTime[i];
  })
  //define and apply the fill color for the dots
  .attr("fill", function (d) {
    //if the rider has doping allegations color them red, otherwise color them green
    return this.__data__.Doping.length > 0 ? "#D1345B" : "#34D1BF";
  })
  //assign the dots a class
  .classed('dot', true)
  //define the behaivor and properties for when a user hovers over a dot
  .on("mouseover", function (d) {
    tooltip.transition().
    duration(0).
    style('opacity', .95).
    style('border', '#103816 solid 2px')
    //use x/y axis of the mouseover action in relation to the whole page to place the tooltip
    .style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY - 50 + "px")
    //get the year data from the .dot via select(this) and pass it to the tooltip
    .attr("data-year", d3.select(this).attr("data-xvalue"));

    //define vars for tooltip data
    var time = this.__data__.Time;
    var place = this.__data__.Place;
    var name = this.__data__.Name;
    var year = this.__data__.Year;
    var nationality = this.__data__.Nationality;
    var doping = this.__data__.Doping.length > 0 ? this.__data__.Doping : "N/A";

    //define the text that will be displayed in the tooltip
    tooltip.html(
    "<b>Rider: </b>" + name + "<br/>" +
    "<b>Nationality: </b>" + nationality + "<br/>" +
    "<br/>" +
    "<b>Year: </b>" + year + "<br/>" +
    "<b>Time: </b>" + time + "<br/>" +
    "<b>Place: </b>" + place + "<br/>" +
    "<br/>" +
    "<b>Aligations: </b>" + doping + "<br/>");

  })

  //define the behaivor and properties for when a user hovers off of a dot
  .on("mouseout", function (d) {
    tooltip.transition().
    duration(0).
    style('opacity', .0);
  });
});