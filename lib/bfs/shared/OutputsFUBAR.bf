selLabelMatrix  = {{"Codon","&alpha;","&beta;","&beta;-&alpha;","Posterior Prob &beta;&gt;&alpha;","Emp. Bayes Factor","PSRF","N<sub>eff</sub>"}};
selLabelMatrixN = {{"Codon","&alpha;","&beta;","&beta;-&alpha;","Posterior Prob &beta;&lt;&alpha;"}};

FUBAR_ResultTable = {};
FUBAR_ResultTable ["Codon"]     = "INTEGER"; 
FUBAR_ResultTable ["alpha"]     = "REAL"; // 1
FUBAR_ResultTable ["beta"]    	= "REAL"; // 2
FUBAR_ResultTable ["dnmds"]   	= "REAL"; // 3
FUBAR_ResultTable ["possel"]   	= "REAL"; // 4
FUBAR_ResultTable ["negsel"]    = "REAL"; // 5
FUBAR_ResultTable ["psr"]       = "REAL"; // 6
FUBAR_ResultTable ["neff"]      = "REAL"; // 7
FUBAR_ResultTable ["var"]      = "REAL"; // 8
FUBAR_ResultTable ["EBF"]      = "REAL"; // 9

FUBAR_GridTable = {};
FUBAR_GridTable ["logL"]     =  "INTEGER"; 
FUBAR_GridTable ["weight"]    = "REAL"; 
FUBAR_GridTable ["alpha"]     = "REAL"; // 1
FUBAR_GridTable ["beta"]      = "REAL"; // 2

FUBAR_MCMC_Trace = {};
FUBAR_MCMC_Trace ["sample"]     = "INTEGER"; 
FUBAR_MCMC_Trace ["logL"]       = "REAL"; // 1

FUBAR_Site_Info = {};
FUBAR_Site_Info ["Codon"]       = "INTEGER";
FUBAR_Site_Info ["alpha"]       = "REAL";
FUBAR_Site_Info ["beta"]        = "REAL";
FUBAR_Site_Info ["weight"]      = "REAL";
FUBAR_Site_Info ["prob"]        = "REAL";

/*___________________________________________________________________________________________________________*/

function computeENFP_CI (p_i,sig_level) {
    N = Abs (p_i);  
    PDF_old = {{1-p_i[0], p_i[0]}};
    PDF = PDF_old;
   
    for (i = 1; i < N; i+=1) {
        PDF = {1,i+2};
        PDF[0] = PDF_old[0] * (1-p_i[i]);
        for (X = 1; X < i+1; X+=1) { 
            PDF[X] = PDF_old[X] * (1-p_i[i]) + PDF_old[X-1] * (p_i[i]);
        }
        PDF[i+1] = PDF_old[i] * p_i[i];
        PDF_old = PDF;
    }
    
    sum = PDF[0];
    _idx = 0;
    while (sum < sig_level/2) {
        _idx+=1;
        sum += PDF[_idx];
    }
    lb = _idx;
    
    while (sum < 1-sig_level/2) {
        _idx+=1;
        sum += PDF[_idx];        
    }
    
    return {{lb__, _idx__}}
}

/*___________________________________________________________________________________________________________*/

function computeFDR (sigLevel,posSel) {
    if (posSel == 0) {
        return "N/A";
    }
    postPP  = Eval(_ExecuteSQLSingle (slacDBID,"SELECT SUM(1-possel) FROM FUBAR_RESULTS WHERE possel > " + sigLevel));
    posSel  = _ExecuteSQL (slacDBID,"SELECT possel FROM FUBAR_RESULTS WHERE possel > " + sigLevel);
    posSelCount = Abs(posSel);
    p_i = {};
    for (_k = 0; _k < posSelCount; _k += 1) {
        p_i + (1 - (0 + posSel[_k]));
    }
    ci = computeENFP_CI (p_i, 0.05);
    return "" +  Format (+p_i, 4,2) + " (95% CI: [" + Format(ci[0],0,0) + "-" + Format(ci[1],0,0) + "])";
}

/*___________________________________________________________________________________________________________*/

function makeLabels (theMatrix, doZero) {
    lastP  = -10;
    points = Columns (theMatrix);
    values = {points,1};
    for (k = 0; k < points; k += 1) {
        values[k] = 0 + theMatrix[k];
    } 
    values = values % 0;
    
    lastP = -1e100;
    labels = {points,1};

    for (k = 0; k < points; k += 1) {
        theValue = values[k];
         if (theValue - lastP > 1) {
            lastP = theValue;
            label = Format (Exp(theValue),3,1);
            if (! doZero && 0 + label == 0.0){
                label = "";
            }   
        } else {
            label = "";
        }
        labels [k] = "\"" + label  + "\" " + theValue; 
    }
    return Join(",",labels);
}    



/*___________________________________________________________________________________________________________*/

function   report3DGrid (slacDBID, pv, ll, format, islog, grid_only) {

    alpha_points = 0+_ExecuteSQLSingle (slacDBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='AlphaPoints'");
    beta_points = 0+_ExecuteSQLSingle (slacDBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='AlphaPoints'");

    result_String = ""; result_String * 128;

    if ((format&&1) == "SVG") {
       result_String * "set term svg dynamic fsize 8 enhanced mouse jsdir 'http://www.datamonkey.org/js/gnuplot/'\n";
    }

    if ((format&&1) == "PNG") {
         result_String * ("set term png size 1024,768\n");
    }
 
    alphaTics = {};
    betaTics  = {};
    max_weight = 0;
    
    minV = 1e10;
    maxV = 0;
    
    for (k=0; k<Abs(pv); k+=1)
    {
        alpha = Log (Max(0+(pv[k])["alpha"], Exp(-4)));
        beta  = Log (Max(0+(pv[k])["beta"], Exp(-4)));
        alphaTics[alpha] = 1;
        betaTics [beta] = 1;
        max_weight = Max (max_weight, 0+(pv[k])["weight"]);
        minV = Min (minV, alpha);
        maxV = Max (maxV, alpha);
    }
 
    xyplane = -max_weight/2;
    
    if (grid_only) {
        result_String * ("\nunset key\n\nset xlabel 'a' font 'Symbol, 12' \nset ylabel 'b' font 'Symbol,12'\n"+
        "\nset xtics offset 0. (" + makeLabels(Rows(alphaTics),1) + ") out nomirror "+
        "\nset ytics offset -1.0 ("+ makeLabels(Rows(betaTics),0) + ") out nomirror "+
        "\nset object 1 polygon from graph 0, graph 0 to graph 1, graph 1 to graph 1, graph 0"+
	"\nset object 1 fc rgb 'blue' fillstyle transparent solid .5 border lt -1 " +  
        "\nset object 2 polygon from graph 0, graph 0 to graph 1, graph 1 to graph 0, graph 1"+
        "\nset object 2 fc rgb 'red' fillstyle transparent solid 0.5 border lt -1 " +
	"\nset label at 0,0.2 'Positive Selection' front center font 'Arial, 18' rotate by 37 tc rgb '#dddddd'"+
	"\nset label at 0.3,-0.2 'Negative Selection' front center font 'Arial, 18' rotate by 37 tc rgb '#dddddd'"+
	//"\nset grid on lt 3 lc rgb 'gold' " + 
        "\nset title 'FUBAR Grid' font 'Arial, 18'"+
	//"\nplot x with lines\n" +
        "\nplot '-' u 1:2 with points ps 0.5 pt 7 lc rgb 'black'\n");    
    } else {    
        result_String * ("\nunset key\nset zlabel 'Posterior mean' rotate by 90\nset xlabel 'alpha'\nset ylabel 'beta'\nset dgrid3d " + 2*alpha_points + "," + 2*beta_points + " qnorm 8 " +
        "\nset view 70, 35, 1, 1 " +
        "\nset tmargin at screen 0.9\nset bmargin at screen 0.2"+
        "\nset xtics offset -2.0 (" + makeLabels(Rows(alphaTics),1) + ")"+
        "\nset ytics offset +2.0 ("+ makeLabels(Rows(betaTics),1) + ")"+
        "\nset ztics " + 10^(Log(max_weight/5)/Log(10)$1)+
        "\nset pm3d" +
        "\nset contour base"+
        "\nset hidden3d"+
        "\nset xyplane at "+ xyplane+ 
        "\nset arrow from  " +minV + "," +minV +"," + xyplane + " to " +maxV + "," +maxV + "," + xyplane + " nohead" +
        "\nset label at -1.5,1," + xyplane + " 'Positive selection' front center" +
        "\nset label at 0.5,-2," + xyplane + " 'Negative selection' front center" +
        "\nset object rectangle from graph 0, graph 0, graph 0 to graph 1, graph 1, graph 1 front" +
        "\nset object rectangle fc rgb 'red' fillstyle solid 1.0"+
        "\nset palette defined (0 \"blue\", " + max_weight/2 + " \"white\", " + max_weight + " \"red\")"+ 
        "\nset title 'Rate class weight'"+
        "\nsplot '-' u 1:2:3 with lines");
    }

    for (k=0; k<Abs(pv); k+=1)
    {
        alpha = Log (Max(0+(pv[k])["alpha"], Exp(-4)));
        beta = Log (Max(0+(pv[k])["beta"], Exp(-4)));
        result_String * ( "\n" + Join ("\t",{{alpha,beta,Max(0,0+(pv[k])["weight"])}}));
    }
    result_String * ("\ne");
    /*
    for (k=0; k<Abs(ll); k+=1)
    {
        alpha = Log (Max(0+(ll[k])["alpha"], Exp(-4)));
        beta = Log (Max(0+(ll[k])["beta"], Exp(-4)));
        result_String * ( "\n" + Join ("\t",{{alpha,beta,Max(0,0+(ll[k])["prob"])}}));
    }
    result_String * ("\ne");*/

    result_String * 0;
    return result_String;
}

/*___________________________________________________________________________________________________________*/

function   gridReportString (DBID) {

    return Join("",{{"FUBAR was run on a grid with <b>", 
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='AlphaPoints'"), 
                    "</b> synonymous rates and <b>", 
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='BetaPoints'"), 
                    "</b> non-synonymous rates, yielding <b>",
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='TotalPoints'"), 
                    "</b> total points, of which <b>", 
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='NegGridPoints'"), 
                    "</b> represented <i>negative</i> selection, <b>", 
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='NeutGridPoints'"), 
                    "</b> - <i>neutral</i> evolution, and <b>", 
                    _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='PosGridPoints'"), 
                    "</b> - <i>positive</i> selection."}});
}

/*___________________________________________________________________________________________________________*/

function   grid3DPlot (DBID) {

    gridLogL = _ExecuteSQL (DBID, "SELECT alpha,beta,logL from FUBAR_GRID");
    
    rows = _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='AlphaPoints'");
    cols = _ExecuteSQLSingle (DBID,"SELECT COL_VALUE FROM FUBAR_SUMMARY WHERE COL_KEY=='BetaPoints'");
    


threeDString = "";threeDString*128;
threeDString * "
    <div id = 'surfacePlotDiv'>
    </div>
    <script type='text/javascript'>
            
    google.load('visualization', '1');
    google.setOnLoadCallback(setUp);
    
    function isIE()
    {
        return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
    }
    
    function setUp()
    {
        var numRows = `rows`;
        var numCols = `cols`;
    
        var tooltipStrings = new Array();
        var data = new google.visualization.DataTable();
        
        for (var i = 0; i < numCols; i++)
        {
            data.addColumn('number', 'col'+i);
        }
        
        data.addRows(numRows);
        var d = 360 / numRows;
        var idx = 0;
";

alphaV = {};
betaV  = {};
minV   = 0;

for (_k = 0; _k < Abs(gridLogL); _k += 1) {
    value = 0 + (gridLogL[_k])["logL"];
    if (value > -1e-9) {
        minV = Min(minV, value);
    }
}
        for (_k = 0; _k < Abs(gridLogL); _k += 1) {
            if (alphaV[(gridLogL[_k])["alpha"]] == 0) {
                alphaV [(gridLogL[_k])["alpha"]] = Abs (alphaV) + 1; 
            }
            if (betaV[(gridLogL[_k])["beta"]] == 0) {
                betaV [(gridLogL[_k])["beta"]] = Abs (betaV) + 1; 
            }
            
            value = Max(minV,0 + (gridLogL[_k])["logL"]);
            
            threeDString * ("data.setValue(" + (alphaV [(gridLogL[_k])["alpha"]]-1) + "," + (betaV [(gridLogL[_k])["beta"]]-1) + "," + value + ");\n");
            threeDString * ("tooltipStrings[" + _k +"] = 'alpha:' + '" + (gridLogL[_k])["alpha"] + "' + ' beta:' + '" + (gridLogL[_k])["beta"] + "' + '= ' + '" + (gridLogL[_k])["logL"] +  "';\n");
            
       }
        
threeDString * "
        var surfacePlot = new greg.ross.visualisation.SurfacePlot(document.getElementById('surfacePlotDiv'));
        
        // Don't fill polygons in IE. It's too slow.
        var fillPly = !isIE();
        
        // Define a colour gradient.
        var colour1 = {red:0, green:0, blue:255};
        var colour2 = {red:0, green:255, blue:255};
        var colour3 = {red:0, green:255, blue:0};
        var colour4 = {red:255, green:255, blue:0};
        var colour5 = {red:255, green:0, blue:0};
        var colours = [colour1, colour2, colour3, colour4, colour5];
        
        // Axis labels.
        var xAxisHeader	= 'alpha';
        var yAxisHeader	= 'beta';
        var zAxisHeader	= 'log(L)';
        
        var options = {xPos: 0, yPos: 0, width: 300, height: 300, colourGradient: colours, fillPolygons: fillPly,
            tooltips: tooltipStrings, xTitle: xAxisHeader, yTitle: yAxisHeader, zTitle: zAxisHeader};
        
        surfacePlot.draw(data, options);
    }
    </script>
";


threeDString * 0;

return threeDString;

}

/*___________________________________________________________________________________________________________*/

function   mcmcTraceReport (DBID) {

    traces = _ExecuteSQL (DBID, "SELECT logl from FUBAR_MCMC_TRACE order by sample;");
    
    return_text = ""; return_text * 128;
    
    return_text * "<div style='width:650px;height:260px;spacing:10px;background-color:white;border: 1px solid black;'>
                   <span style='text-align:right; width:100%'>MCMC trace</span>
                   <div id=\"fubar_mcmc_trace\" style = 'width:625px;height:225px;'></div></div><script type=\"text/javascript\">
$(function () {
    var d1 = [];
    var mcmc = [";
    
    for (_k = 1; _k <= Abs (traces); _k += 1) {
        return_text * ("\n[" + _k + "," + (traces[_k-1]) + "],");
    }
return_text *"];    
    plot = $.plot($(\"#fubar_mcmc_trace\"), [{ label: 'log(L) = hover to show',  data: mcmc, color: 'rgb(64, 64, 64)'}], 
                                     {crosshair: { mode: 'x' },
                                     grid: { hoverable: true, autoHighlight: false} 
                                     });
                                     
var legends = $('#fubar_mcmc_trace .legendLabel');
    legends.each(function () {
        // fix the widths so they don't jump around
        $(this).css('width', $(this).width());
    });

    var updateLegendTimeout = null;
    var latestPosition = null;
    
    function updateLegend() {
        updateLegendTimeout = null;
        
        var pos = latestPosition;
        
        var axes = plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
            pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
            return;

        var i, j, dataset = plot.getData();
        for (i = 0; i < dataset.length; ++i) {
            var series = dataset[i];

            // find the nearest points, x-wise
            for (j = 0; j < series.data.length; ++j)
                if (series.data[j][0] > pos.x)
                    break;
            
            p1 = series.data[j - 1][1];

            legends.eq(i).text(series.label.replace(/=.*/, '= ' + p1));
        }
    }
    
    $('#fubar_mcmc_trace').bind('plothover',  function (event, pos, item) {
        latestPosition = pos;
        if (!updateLegendTimeout)
            updateLegendTimeout = setTimeout(updateLegend, 50);
    });

});
</script>";


    return_text * 0;
    return return_text;

}

/*___________________________________________________________________________________________________________*/

function	PrintASCIITable (dataMatrix, titleMatrix, doSLACMaps)
{
	outString="";
	outString*8192;
	if (Rows(dataMatrix))
	{
		outString*"<DIV CLASS='RepClassSM'>\n<TABLE BORDER = '0'><TR CLASS='TRReport' style = 'font-size:small'>";
		nc = Columns(titleMatrix);
		
		for (counter1=0; counter1<nc; counter1 += 1)
		{
			outString*"<td>";
			outString*titleMatrix[counter1];
			outString*"</td>\n";
		}
		
		
		
		outString*("<td>3D rate plot"+toolTipCode("TOOLTIP","The SVG format may not display correctly in all browsers")+"</td>");		    
		if (doSLACMaps) {
			outString*"<td>Additional Information</td>";
		}
		
		outString*"</tr>\n";
		
		for (counter1=0; counter1<Rows(dataMatrix); counter1 += 1)
		{
			if (counter1%2) {
				outString*"\n<tr CLASS='TRReport2' style = 'font-size:x-small'>";
			}
			else {
				outString*"\n<tr CLASS='TRReport1' style = 'font-size:x-small'>";
			}
			
			for (counter2 = 0; counter2 < nc; counter2 = counter2+1) {
				outString*"\n<td>";
				outString*Format(dataMatrix[counter1][counter2],-1,-1);
				outString*"\n</td>\n";
			}

			codonIndex = dataMatrix[counter1][0];
            outString*("<TD><a href = '" + BASE_CGI_URL_STRING + "wrapHyPhyBF.pl?file=fubar_plotter&arguments="+filePrefix+"-"+codonIndex+"-svg&mode=4' target = '_blank'>[SVG]</a>"+
            "<a href = '" + BASE_CGI_URL_STRING + "wrapHyPhyBF.pl?file=fubar_plotter&arguments="+filePrefix+"-"+codonIndex+"-png&mode=5' target = '_blank'>[PNG]</a></TD>");
            
            
			if (doSLACMaps)
			{
				codonIndex = dataMatrix[counter1][0]-1;
				outString*("<TD style = 'font-size: 10px;'><a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&site="+codonIndex+"&mode=0'>[Codons]</a>"+
						   "<a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&site="+codonIndex+"&mode=1'>[AA]</a>"+
								 "<a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&site="+codonIndex+"&mode=2'>[Counts]</a>"+
								 "</TD>");
			}
			outString*"</tr>\n";
		}
		outString*"</TABLE></DIV>\n";	
	}
	outString*0;
	return outString;
}

