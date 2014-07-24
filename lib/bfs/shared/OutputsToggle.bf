togLabelMatrix = { { "codon", "aa", "logL(n)", "logL(a)", "LRT", "P", "omega", "rho", "kappa", "Tx", "Ty", "Tz" } };

Toggle_ResultTable = {};
Toggle_ResultTable 	["Codon"] 		= "INTEGER";
Toggle_ResultTable 	["Amino_Acid"] 	= "INTEGER";
Toggle_ResultTable 	["LogL_null"]   = "REAL";
Toggle_ResultTable 	["LogL_alt"]    = "REAL";
Toggle_ResultTable 	["LRT"]    		= "REAL";
Toggle_ResultTable 	["p"]    		= "REAL";
Toggle_ResultTable 	["omega"]    	= "REAL";
Toggle_ResultTable 	["rho"]    		= "REAL";
Toggle_ResultTable 	["kappa"]    	= "REAL";
Toggle_ResultTable 	["Tx"]    	 	= "REAL";
Toggle_ResultTable 	["Ty"]   		= "REAL";
Toggle_ResultTable 	["Tz"]    	 	= "REAL";


aminoacidOrdering = "";
aminoacidOrdering = "FLIMVSPTAY*HQNKDECWRG";

residueMap =  	  {{"Phe",
					"Leu",
					"Ile",
					"Met",
					"Val",
					"Ser",
					"Pro",
					"Thr",
					"Ala",
					"Tyr",
					"stp",
					"His",
					"Gln",
					"Asn",
					"Lys",
					"Asp",
					"Glu",
					"Cys",
					"Trp",
					"Arg",
					"Gly"}};
					
function	PrintToggleASCIITable (dataMatrix, titleMatrix, doProfile, doLogo, residue, genCodeID)
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
		
		if ( (doProfile) || ( doLogo ) )
		{
			if ( doProfile ) {
				outString*"<td>profile</td>\n";
			}
			if ( doLogo ) {
				outString*"<td>logo</td>\n";
			}
			outString*"</tr>\n";
		}
		else
		{
			outString*"</tr>\n";
		}	
		
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
			
			for (counter2 = 0; counter2 < Columns(dataMatrix); counter2 = counter2+1)
			{
				outString*"\n<td>";
				outString*Format(dataMatrix[counter1][counter2],-1,-1);
				outString*"\n</td>\n";
			}

			
			if ( (doProfile) || ( doLogo ) ) 
			{
				if ( doProfile ) 
				{
					outString*("<TD style = 'font-size: 10px;'>" );
					for ( l1 = 0; l1 < 21; l1 = l1 + 1 ) {
						if ( l1 != 10 ) {
							if ( aa_profile [ dataMatrix [ counter1 ][0] - 1 ][ l1 ] > 0 ) {
								outString*( "<p>" + residueMap [ l1 ] + "(" + aminoacidOrdering [l1] + "):" + aa_profile [ dataMatrix [ counter1 ][0] - 1][ l1 ]);	
							}
						}
					}
					outString*("</TD>\n");
				}
				if ( doLogo ) {
					outString*("<TD style = 'font-size: 10px;'>"
								+"<a href='" + BASE_CGI_URL_STRING +"toggleSiteMap.pl?file="+filePrefix+"&site="+dataMatrix [ counter1 ][0]+"&aa="+residue+"&genCodeID="+genCodeID+"&mode=0'>[site report]</a>"
								+"</TD>\n");
				}
				outString*"</TR>\n";
			}
			else
			{
				outString*"</tr>\n";
			}
		}
		outString*"</TABLE></DIV>\n";	
	}
	outString*0;
	return outString;
}