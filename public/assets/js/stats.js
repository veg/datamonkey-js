var UsageChart = React.createClass({displayName: "UsageChart",
  initialize: function(){
    var margin = {top:20, right:40, bottom:20, left:40},
        width = 1100 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        first_date = this.props.data[0].created,
        last_date = this.props.data[this.props.data.length-1].created,
        x = d3.time.scale()
          .domain([first_date, last_date])
          .range([0, width]),
        binned_data = d3.layout.histogram()
          .bins(52)
          (this.props.data.map(function(d) {
            return x(d.created)
          })),
        y = d3.scale.linear()
          .domain([0, d3.max(binned_data, function(d){
            return d.y;
          })])
          .range([height, 0])
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(d3.time.format("%m/%d/%Y")),
        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10)

    var svg = d3.select("#usage-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
      .data(binned_data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + d.x + "," + y(d.y) + ")"; });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", binned_data[0].dx - 1)
      .attr("height", function(d) { return height - y(d.y); })
      .attr("fill", "steelblue");

    bar.append("text")
      .attr("x", function(d) {return d.dx/2;})
      .attr("y", -2)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text(function(d) {return d.y})

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Jobs")
  },
  componentWillUpdate: function(){
    d3.select("#usage-chart").html("<h4>Weekly completed jobs</h4>");
  },
  componentDidMount: function(){
    this.initialize();
  },
  componentDidUpdate: function(){
    this.initialize();
  },
  render: function(){
    return (React.createElement("div", {id: "usage-chart", style: {"margin-bottom":"50px"}}, 
      React.createElement("h4", null, "Weekly completed jobs")
    ));
  }
});

var Histogram = React.createClass({displayName: "Histogram",
  initialize: function(){
    var margin = {top:20, right:40, bottom:40, left:40},
        width = 500 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom,
        x = d3.scale.linear()
          .domain(d3.extent(this.props.data))
          .range([0, width]),
        binned_data = d3.layout.histogram()
          .bins(25)
          (this.props.data),
        y = d3.scale.linear()
          .domain([0, d3.max(binned_data, function(d){
            return d.y;
          })])
          .range([height, 0])
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

    var svg = d3.select("#"+this.props.kind_of_data).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
      .data(binned_data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(binned_data[0].dx) - 1)
      .attr("height", function(d) { return height - y(d.y); })
      .attr("fill", "steelblue");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
        .attr("x", width/2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .text("Number of " + this.props.kind_of_data.toLowerCase() + " in job" );

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Jobs")
  },
  componentDidUpdate: function(){
    d3.select("#"+this.props.kind_of_data).html("<h4>" + this.props.kind_of_data + "</h4>");
    this.initialize();
  },
  componentDidMount: function(){
    this.initialize();
  },
  render: function(){
    return (React.createElement("div", {id: this.props.kind_of_data}, 
      React.createElement("h4", null, this.props.kind_of_data)
    ));
  }
});

var SitesAndSequencesScatterPlot = React.createClass({displayName: "SitesAndSequencesScatterPlot",
  initialize: function(){
    var margin = {top:50, bottom:50, right:50, left:50},
        width = 500 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom,
        x = d3.scale.linear()
          .domain(d3.extent(this.props.data.map(function(d) { return d.msa[0].sequences;})))
          .range([0, width]),
        y = d3.scale.linear()
          .domain(d3.extent(this.props.data.map(function(d) { return d.msa[0].sites;})))
          .range([height, 0])
        svg = d3.select("#sites-sequences").append("svg")
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom"),
    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height +")")
      .call(xAxis)
      .append("text")
        .attr("x", width/2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .text("Number of sequences in job");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text("Number of sites in job");

    svg.selectAll(".dot")
      .data(this.props.data)
      .enter()
      .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(+d.msa[0].sequences);})
        .attr("cy", function(d) { return y(+d.msa[0].sites);})
        .attr("fill", "steelblue")
        .attr("stroke", "blue")
        .attr("opacity", .5);
  },
  componentDidUpdate: function(){
    d3.select("#sites-sequences").html("<h4>Sites and sequences</h4>");
    this.initialize();
  },
  componentDidMount: function(){
    this.initialize();
  },
  render: function(){
    return (React.createElement("div", {id: "sites-sequences"}, 
      React.createElement("h4", null, "Sites and sequences")
    ));
  }
});

var UsageInformation = React.createClass({displayName: "UsageInformation",
  fetchData: function(method){
    var self = this;
    d3.json("/" + method + "/usage", function(data){
      data.forEach(function(d){
        d.created = new Date(d.created);
      });
      data.sort(function(a, b){
        return a.created - b.created;
      });
      self.setState({
        data: data
      });
    });
  },
  componentDidMount: function(){
    this.fetchData(this.props.active);
  },
  componentWillReceiveProps: function(nextProps){
    this.fetchData(nextProps.active);
  },
  getInitialState: function(){
    return {data: null};
  },
  render: function(){
    var content;
    if (this.state.data){
      var last_date_object = moment(this.state.data[this.state.data.length-1].created),
          last_date_string = last_date_object.format('MMMM Do, YYYY');
      content = [
        React.createElement("div", {className: "col-md-12"}, 
          React.createElement("p", null, "Last job submitted on ", last_date_string, ".")
        ),
        React.createElement("div", {className: "col-md-12"}, 
          React.createElement(UsageChart, {data: this.state.data})
        )
      ];
      if(this.state.data[0].msa){
        content.push(React.createElement("div", {className: "col-md-6"}, 
          React.createElement(SitesAndSequencesScatterPlot, {data: this.state.data})
        ));
        content.push(React.createElement("div", {className: "col-md-6"}, 
          React.createElement(Histogram, {kind_of_data: "Sites", data: this.state.data.map(function(d){ return d.msa[0].sites; })}), 
          React.createElement(Histogram, {kind_of_data: "Sequences", data: this.state.data.map(function(d){ return d.msa[0].sequences; })})
        ));
      }

    }else{
      content = (React.createElement("div", {className: "col-md-12"}, 
        React.createElement("p", null, "Loading...")
      ));
    }
    return (React.createElement("div", {className: "row"}, 
      content
    ));

  }
});

var UsageDashboard = React.createClass({displayName: "UsageDashboard",
  tabClick: function(selection){
    var self = this;
    return function(){
      self.setState({active: selection});
    };
  },
  getInitialState: function(){
    return {active: "absrel"};
  },
  render: function(){
    var self = this,
        methods = ["absrel", "busted", "relax", "hivtrace"],
        tabs = methods.map(function(method){
          return (React.createElement("li", {role: "presentation", className: method == self.state.active ? "active" : ""}, 
            React.createElement("a", {href: "#", onClick: self.tabClick(method)}, method)
          ));
        });

    return (React.createElement("div", null, 
      React.createElement("ul", {className: "nav nav-tabs"}, 
        tabs
      ), 
      React.createElement(UsageInformation, {active: this.state.active})
    ));
  }
});

React.render(
  React.createElement(UsageDashboard, null),
  document.getElementById('main')
);
