selLabelMatrix = {{"Codon","dN-dS","Normalized dN-dS","p-value"}};

/*___________________________________________________________________________________________________________*/

function	PrintASCIITable (dataMatrix, titleMatrix)
{
	outString="";
	outString*8192;
	if (Rows(dataMatrix))
	{
		outString*"<DIV CLASS='RepClassSM'>\n<TABLE BORDER = '0'><TR CLASS='TRReport' style = 'font-size:small'>";
		nc = Columns(titleMatrix);
		for (counter1=0; counter1<nc; counter1 = counter1+1)
		{
			outString*"<td>";
			outString*titleMatrix[counter1];
			outString*"</td>\n";
		}
		
		outString*"<td>Additional Information</td></tr>\n";
		
		for (counter1=0; counter1<Rows(dataMatrix); counter1 = counter1 + 1)
		{
			if (counter1%2)
			{
				outString*"\n<tr CLASS='TRReport2' style = 'font-size:x-small'>";
			}
			else
			{
				outString*"\n<tr CLASS='TRReport1' style = 'font-size:x-small'>";
			}
			for (counter2 = 0; counter2 < nc; counter2 = counter2+1)
			{
				outString*"\n<td>";
				outString*Format(dataMatrix[counter1][counter2],-1,-1);
				outString*"\n</td>\n";
			}
			
			codonIndex = dataMatrix[counter1][0]-1;
			outString*("<TD style = 'font-size: 10px;'><a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&amp;site="+codonIndex+"&amp;mode=0'>[Codons]</a>"+
					   "<a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&amp;site="+codonIndex+"&amp;mode=1'>[AA]</a>"+
							 "<a href='"+BASE_CGI_URL_STRING+"siteMap.pl?file="+filePrefix+"&amp;site="+codonIndex+"&amp;mode=2'>[Counts]</a>"+
							 "</TD></TR>\n");
		}
		outString*"</TABLE></DIV>\n";	
	}
	outString*0;
	return outString;
}



