function project(){
    let filePath2="new.csv"
    plot0(filePath2);
}

let plot0=function(filePath2){
    //preprocess data
    d3.csv(filePath2).then(function(data){
        data.forEach(element => {
            element.critic_score = element.critic_score*1;
            element.people_score = element.people_score*1;
        });
        plt1(data);
        plt2(data);
        plt3(); 
    });
}

let plt1=function(data){
    const width = 800;
    const height = 600;
    const margin = {top: 60, right: 0, bottom: 40, left: 60};

    var svg = d3.select("#plot1").append("svg").attr("width", width).attr("height",height);
    var xScale = d3.scaleLinear().domain([0, 100]).range([margin.left, width-margin.left-margin.right]);
    var yScale = d3.scaleLinear().domain([0, 100]).range([height-margin.bottom, margin.bottom]);
    var pathScale = d3.scaleOrdinal().domain(["red","green","orange"]).range(["tomato.png","splat.png",'question.png']);
  
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
    svg.append("g").attr("id", "xaxis").attr("transform","translate(0,"+(height-margin.bottom)+")").call(xAxis);
    svg.append("g").attr("id", "yaxis").attr("transform","translate("+margin.left+",0)").call(yAxis);

    var tooltip = d3.select("#plot1").append("div")
                    .attr("class", "tooltip");

    tomato = data.filter(d=>d.color == "red")
    splat = data.filter(d=>d.color == "green")
    question = data.filter(d=>d.color == "orange")
    svg.selectAll('image').data(data).enter().append('image')
            .attr('xlink:href',d=>pathScale(d.color))
            .attr('x', (d)=>xScale(d.critic_score))
            .attr('y', (d)=>yScale(d.people_score))
            .attr('width', 30) // Adjust the width of the image as desired
            .attr('height', 30)
            .on("mouseover", function(){
                tooltip.style("visibility", "visible");
            }).on("mousemove",function(event){
                var title = event.target.__data__.title
                var critic = event.target.__data__.critic_score
                var people = event.target.__data__.people_score
                var year = event.target.__data__.year
                tooltip.html("Title: \'"+title+"\'<br> Year: "+year+"<br> People's Score: "+people+"<br> Critic's Score: "+critic)
                .style("left", (event.pageX) + 10+ "px")
                .style("top", (event.pageY)+ 10 + "px");
            }).on("mouseout",function(){tooltip.style("visibility", "hidden")});
    
    //legend and title                   
    svg.append("circle").attr("cx",2*margin.left).attr("cy",50).attr("r", 6).style("fill", "#f93107");
    svg.append("circle").attr("cx",2*margin.left).attr("cy",75).attr("r", 6).style("fill", "#09c754");
    svg.append("circle").attr("cx",2*margin.left).attr("cy",100).attr("r", 6).style("fill", "#ffa100");
    svg.append("text").attr("class","legend_text").attr("x", 2*margin.left+20).attr("y", 53)
                .text("Fresh")
                .attr('fill', "#fff");
    svg.append("text").attr("class","legend_text").attr("x", 2*margin.left+20).attr("y", 79)
                .text("Rotten")
                .attr('fill', "#fff");
    svg.append("text").attr("class","legend_text").attr("x", 2*margin.left+20).attr("y", 104)
                .text("Reputation divides")
                .attr('fill', "#fff");


    svg.append("text").attr("class", "title").attr("x", width/2).attr("y", margin.top/4).text("How people's score and critics' score are related?");
    svg.append("text").attr("class", "xlabel").attr("x", width/2).attr("y", height).text("Critics' Score");
    svg.append("text").attr("class", "ylabel").attr("x", -height/2).attr("y", 18).attr("transform", "rotate(-90)").text("People's Score");
        

    
}

let plt2=function(data){
    const width = 800;
    const height = 600;
    const margin = {top: 40, right: 0, bottom: 30, left: 40};

    scorebyOrigin = d3.rollup(data, v=>d3.mean(v,d=>d.people_score), d=>d['Origin/Ethnicity'])

    var marker = [
        {long: -95.712891, lat: 37.090240, continent: "Am", size: scorebyOrigin.get('American'), name: 'American'},
        {long: -0.127758, lat: 51.507351, continent: "E", size: scorebyOrigin.get('British'), name:'British' },
        {long: 138.252930, lat: 36.204823, continent: "A", size: scorebyOrigin.get('Japanese'), name:'Japanese' },
        {long: 104.195396, lat: 35.861660, continent: "A", size: scorebyOrigin.get('Chinese'), name: 'Chinese'},
        {long: 114.190271, lat: 22.259868, continent: "A", size: scorebyOrigin.get("Hong Kong"), name: "Hong Kong"},
        {long: -114.227531, lat: 61.773123, continent: "Am", size: scorebyOrigin.get("Canadian"), name: "Canadian"},
        {long: 134.166281, lat: -27.371767, continent: "O", size: scorebyOrigin.get("Australian"), name: "Australian"},
        {long: 37.618423, lat: 55.751244, continent: "E", size: scorebyOrigin.get("Russian"), name: "Russian"},
        {long: 127.707191, lat: 35.853440, continent: "A", size: scorebyOrigin.get("South_Korean"), name: "South Korean"},
        {long: 72.877426, lat: 19.076090, continent: "A", size: scorebyOrigin.get("Bollywood"), name: "Bollywood"},
        {long: 78.656891, lat:  11.127123, continent: "A", size: scorebyOrigin.get("Tamil"), name: "Tamil"}
    ];

    var svg = d3.select("#plot2").append('svg').attr("width", width).attr("height", height);
    
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(map){
        map.features = map.features.filter(function(d){return d.properties.name != 'Antarctica'});

        var colorScale = d3.scaleOrdinal().domain(["Am", "E", "A","O"]).range([ "#9daa0b", "#ff7b0f","#fcba03","#019ef1"]);
        var sizeScale = d3.scaleLinear().domain([d3.min(marker, d=>d.size),d3.max(marker, d=>d.size)]).range([10,50]);

        var tooltip = d3.select("#plot2").append("div")
                        .attr("class", "tooltip");

        var projection = d3.geoMercator().fitExtent([[margin.left,margin.top],[width-margin.right-margin.left, height]],map)

        svg.append("g").selectAll("path").data(map.features).enter().append("path")
                .attr("class", "map")
                .attr("d",d3.geoPath().projection(projection))
                .attr("fill", "#b8b8b8")
                .attr("stroke", "#b8b8b8");

        svg.append("g").selectAll("circle").data(marker).enter().append("circle")
                .attr("cx", d=>projection([d.long, d.lat])[0])
                .attr("cy", d=>projection([d.long, d.lat])[1])
                .attr("r", d=>sizeScale(d.size))
                .style("fill", d=>colorScale(d.continent))
                .attr("stroke", d=>colorScale(d.continent))
                .attr("stroke-width", 3)
                .attr("fill-opacity", .4)
                .on("mouseover", function(){
                    tooltip.style("visibility", "visible");
                }).on("mousemove",function(event){
                    var eth = event.toElement.__data__.name
                    var scr = Math.round(event.toElement.__data__.size,2)

                    tooltip.html("Ethnicity/Origin: "+eth+"<br> Mean Score: "+scr)
                    .style("left", (event.pageX) + 10+ "px")
                    .style("top", (event.pageY)+ 10 + "px");
                }).on("mouseout",function(){tooltip.style("visibility", "hidden")});
        
        var zoom = d3.zoom().scaleExtent([1,5])
            .translateExtent([[0,0],[width,height]])
            .on("zoom", function(e){
                svg.selectAll("g").attr("transform",e.transform);
            });
        svg.call(zoom);

        svg.append("text").attr("class", "title").attr("x", width/2).attr("y", margin.top*1.5).text("People's score for movies from worldwide");
    });




}


let plt3=function(){
    d3.json("data.json").then(function(data){
        console.log(data);
        const width = 800;
        const height = 1000;
        const margin = {top: 0, right: 0, bottom: 30, left: 0};

        var svg = d3.select("#plot3").append('svg').attr("width", width).attr("height", height).append("g")
                 .attr("transform","translate(" + margin.left + "," + margin.top + ")");

        var quantity = d3.map(data.links, d=>d.value)
        var strokeScale = d3.scaleLinear().domain([d3.min(quantity), d3.max(quantity)]).range([1,7]);
        
        var link = svg.append("g").selectAll("line").data(data.links).enter().append("line")
                    .attr("class","links");

        var node = svg.append("g").selectAll("circle").data(data.nodes).enter()
                    .append("circle")
                    .attr("r", 10)
                    .attr("class","nodes")
                    .attr('fill', "#9daa0b");


        var label = svg.append("g").selectAll("text").data(data.nodes).join("text")
                    .attr("class", "labels").text(d => d.name)
                    .attr("fill", "white");
        
        var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink(data.links).id(d=>d.id))
        .force("charge", d3.forceManyBody().strength(-15))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
        
        simulation.on("tick", function(){
            link.attr("x1", d=>d.source.x)
                .attr("y1", d=>d.source.y)
                .attr("x2", d=>d.target.x)
                .attr("y2", d=>d.target.y)
                .attr("stroke-width",d=>strokeScale(d.value));
        
            node.attr("cx", d=>d.x)
                .attr("cy", d=>d.y);
            
            label.attr("x", d=> d.x-4).attr("y", d=>d.y-2.5);
        });

        var zoom = d3.zoom().scaleExtent([1,5])
                .translateExtent([[0,0],[width,height]])
                .on("zoom", function(e){
                    svg.selectAll("g").attr("transform",e.transform);
                });
        svg.call(zoom);

        svg.append("text").attr("class", "title").attr("x", width/2).attr("y", 100).text("Network of directors and crews");
    });
      
}
      

