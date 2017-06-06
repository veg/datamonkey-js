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
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Jobs")
  },
  componentWillUpdate: function(){
    d3.select("#usage-chart").html("");
  },
  componentDidMount: function(){
    this.initialize();
  },
  componentDidUpdate: function(){
    this.initialize();
  },
  render: function(){
    return React.createElement("div", {id: "usage-chart"});
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
      debugger;
    });
  },
  componentDidMount: function(){
    var self = this;
    self.fetchData(self.props.active);
  },
  componentWillReceiveProps: function(nextProps){
    var self = this;
    self.fetchData(nextProps.active);
  },
  getInitialState: function(){
    return {data: null};
  },
  render: function(){
    var self = this,
        content;
    if (self.state.data){
      var last_date_object = self.state.data[self.state.data.length-1].created,
          last_date_string = (last_date_object.getMonth()+1)+"/"+last_date_object.getDate()+"/"+last_date_object.getFullYear();
      content = [
        React.createElement("p", null, "Last job submitted on ", last_date_string, "."),
        React.createElement(UsageChart, {data: self.state.data})
      ];
    }else{
      content = React.createElement("p", null, "Loading..."); 
    }
    return (React.createElement("div", {className: "row"}, 
      React.createElement("div", {className: "col-md-12"}, 
        content
      )
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
