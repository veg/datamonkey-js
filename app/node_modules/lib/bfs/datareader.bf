internalRenames = 0;

function notify(type, msg) {
  // Print to log
	fprintf ("./datareader.log", type + " : " + msg + "\n");
	return 0;
}

function except(msg) {
	fprintf (stdout, "{" );
	fprintf (stdout, "\"error\": \"" + msg + "\"");
	fprintf (stdout, "}");
  return 0;
}

function to_json (file_info_record, sequence_records, fpi_record) {
	fprintf (stdout, "{" );
	fprintf (stdout, "\"FILE_INFO\": " + file_info_record + ",");
	fprintf (stdout, "\"SEQUENCES\": " + sequence_records + ",");
	fprintf (stdout, "\"FILE_PARTITION_INFO\": " + fpi_record);
	fprintf (stdout, "}");
	return 0;
}


/*------------------------------------------------------------------------------------*/

function removeNodeFromParent (nodeID) {
	parentID = (tAVL[nodeID])["Parent"];
	childrenCount 	= Abs ((tAVL[parentID])["Children"]);
	(tAVL[nodeID])["Parent"] = -1;

	for (k2 = 0; k2 < childrenCount; k2 = k2+1)
	{
		if (((tAVL[parentID])["Children"])[k2] == nodeID)
		{
			break;
		}
	}
	for (; k2 < childrenCount - 1; k2=k2+1)
	{
		((tAVL[parentID])["Children"])[k2] = ((tAVL[parentID])["Children"])[k2+1];
	}
	
	(tAVL[parentID])["Children"] - (childrenCount-1);
	childrenCount = childrenCount-1;
	
	if (childrenCount == 1)
	{
		nodeID 			= (tAVL[parentID])["Parent"];
		childrenCount 	= Abs ((tAVL[nodeID])["Children"]);
		remainingChild 	= ((tAVL[parentID])["Children"])[0];
		
		for (k2 = 0; k2 < childrenCount; k2 = k2+1)
		{
			if (((tAVL[nodeID])["Children"])[k2] == parentID)
			{
				((tAVL[nodeID])["Children"])[k2] 	= remainingChild;
				(tAVL[parentID])["Parent"] 			= -1;
				(tAVL[remainingChild])["Parent"] 	= nodeID;
				(tAVL[remainingChild])["Depth"] 	= (tAVL[nodeID])["Depth"] + 1;
				break;
			}
		}
	}
		
	return 0;
}

/*------------------------------------------------------------------------------------*/
function checkTreeString (treeS, treeID) {
    if (treeID == 1) {
      notify("info",  "Successful file upload, " + "Read " + filteredData.species +  " sequences and " + filteredData.sites + " " + dType + " alignment columns and " + _pCount + " partitions.");
      if (genCodeID >= 0)
      {
        //TODO: update path
        notify("info", "Aminoacid translation in <a href='" + BASE_CGI_URL_STRING + "showdata.pl?" + filePath + ".aa'");
      }
    }
	if (Abs(treeS))
	{
		Topology t 	= treeS;
		leafCount 	= TipCount (t) - Abs (removedSequences);
		
		internalLabels = {};
		
		if (filteredData.species == leafCount)
		{
			tAVL         = t ^ 0;
			for (k=1; k<Abs(tAVL);k=k+1)
			{
				seqName = (tAVL[k])["Name"] && 1;
				if (Type (((tAVL[k])["Children"])) != "AssociativeList")
				{
					if (removedSequences[seqName])
					{
						removeNodeFromParent (k);
					}
					else
					{
						p = seqNamesMap[seqName];
						if (Abs(p)==0)
						{
              notify("warning", "A tree (#" + treeID + ") was included in the data file, but leaf " + seqName + "had no matching sequence (or was a duplicate) in the data.");
							seqNamesList - seqName;
							break;
						}
						else
						{
							(tAVL[k])["Name"] = seqNamesMap[seqName];
						}
					}
				}
				else
				{
					(tAVL[k])["Name"] = normalizeSequenceID (seqName,"internalLabels");
					if (internalRenames == 0)
					{
						internalRenames = (seqName!=(tAVL[k])["Name"]);
					}
				}
				(tAVL[k])["Length"] = -1;
			}
			
			
			if (k == Abs(tAVL))
			{
        notify(info, "A well defined tree (#" + treeID + ") was included in the data file, and all leaves were successfully matched to sequence names in the alignment.");
				if (renames || internalRenames || Abs(removedSequences))
				{	
					if (Abs(removedSequences))
					{
							treeSize = Abs(tAVL);
							for (nodeIndex = treeSize-1; nodeIndex>0; nodeIndex = nodeIndex - 1)
							{
								if (nodeIndex < treeSize && (tAVL[nodeIndex])["Parent"] < 0)
								{
									continue;
								}
							
								_cc		 = Abs((tAVL[nodeIndex])["Children"]);
								if (_cc > 0)
								{
									_cd = (tAVL[nodeIndex])["Depth"] + 1;
									for (_cci = 0; _cci < _cc; _cci = _cci+1)
									{				
										_cn =  ((tAVL[nodeIndex])["Children"])[_cci];
										(tAVL[_cn])["Depth"] = _cd;
									}
								}
							}				
					}
				
					doneTree = 	PostOrderAVL2String(tAVL);
					return doneTree;
				}
				else
				{
					return  treeS;
				}
				
			}
		}
		else
		{
      notify(warning, "A tree (#" + treeID + ") was found in the data file, but the number of leaves (" + leafCount + ") did not match the number of sequences in the file.");
		}
	}
	return "";
}

/*------------------------------------------------------------------------------------*/

fscanf (stdin,"String", fileName);
fscanf (stdin,"Number", genCodeID);

skipCodeSelectionStep = 1;
ExecuteAFile	("./shared/HyPhyGlobals.ibf");
ExecuteAFile	("./shared/chooseGeneticCode.def");
ExecuteAFile	("./shared/ReadDelimitedFiles.bf");
ExecuteAFile	("./shared/TreeTools.ibf");
ExecuteAFile	("./shared/NJ.bf");


/* first check for MEGA headers */

fscanf (fileName, "String", testForMega);
if (testForMega == "#mega")
{
	fscanf (fileName, "Lines", testForMega);
	fprintf (fileName, CLEAR_FILE, KEEP_OPEN);
	for (k=0; k<Columns(testForMega); k=k+1)
	{
		if ((testForMega[k])[0] != "!")	
		{
			fprintf (fileName, testForMega[k], "\n");	
		}
	}
	fprintf (fileName, CLOSE_FILE);
	
}

if (genCodeID >= 0)
{
	ApplyGeneticCodeTable (genCodeID);
}

DataSet 			ds 	=  ReadDataFile (fileName);

fileDirInfo = splitOnRegExp(fileName,"/");
filePath    = fileDirInfo[Abs(fileDirInfo)-1];
	


if (ds.sites < 3)
{
  except("This doesn't seem to be a valid alignment file.");
  return 1;
}

HarvestFrequencies (freqs, ds, 1,1,1);

if (genCodeID != (-2)) /* not an AA alignment */
{
	if (Rows(freqs) != 4)
	{
    except("This doesn't seem to be a nucelotide alignment. It had " + Rows(freqs) + " character states, whereas we expected 4. Perhaps you uploaded an amino-acid alignment by mistake?");
    return 1;
	}
}
else
{
	if (Rows(freqs) != 20)
	{
    except("This doesn't seem to be a protein alignment. It had "+ Rows(freqs) + "character states, whereas we expected 20. Perhaps you uploaded a nucleotide alignment by mistake?");
    return 1;
	}
}

if (ds.sites%3 && genCodeID >= 0)
{
   except("The number of nucleotide columns in the data set must be divisible by 3 - had " + ds.sites + " sites. Please check that the reading frame is aligned with the beginning of the data set, and that no trailing sites are extraneous");
   return 1;
}

if (genCodeID >= 0)
{
	DataSetFilter filteredData = CreateFilter (ds,3,"","",GeneticCodeExclusions);
	if (!filteredData.sites)
	{
    except("Only stop codons were found in your alignment.");
    return 1;
	}
}
else
{
	DataSetFilter		filteredData = CreateFilter (ds,1);
}

GetString 	  (sequenceNames, filteredData, -1);

terminalCodonsStripped = 0;

if (genCodeID >= 0 && filteredData.sites*3 < ds.sites)
{
	DataSetFilter	    	all64 = CreateFilter (ds, 3);

	stopCodonTemplate    = {1,64}["_Genetic_Code[_MATRIX_ELEMENT_COLUMN_]==10"];
	nonstopCodonTemplate = {1,64}["1"]-stopCodonTemplate;

	stopCodonIndex	    = {};

	for (stateCount=0; stateCount<64; stateCount=stateCount+1)
	{
		if (_Genetic_Code[stateCount] == 10)
		{
			stopCodonIndex [Abs(stopCodonIndex)] = stateCount;
		}
	}

	GetInformation (sequenceData, all64);
	GetDataInfo    (duplicateMapper, all64);

	doSomething 	  = 0;
	reportString	  = "";
	
	reportString*512;
	reportString*"<table border = '0'><tr class='HeaderClassSM'><td>Sequence Name</td><td>Position (in nucleotides)</td><td>Codon found</td></tr>";

	nucLetters 		  		= "ACGT";
	totalStopCodonsFound 	= 0;
	classID					= 0;
	
	stopsPerSite			= {};

	for (sequenceIndex = 0; sequenceIndex < all64.species; sequenceIndex = sequenceIndex+1)
	{		
		for (siteIndex = 0; siteIndex < all64.sites; siteIndex = siteIndex+1)
		{
			sI = duplicateMapper[siteIndex];
			GetDataInfo(siteInfo, all64, sequenceIndex, sI);
			if ((stopCodonTemplate*siteInfo)[0] > 0 && (nonstopCodonTemplate*siteInfo)[0]==0)
			{	
				stopsPerSite [siteIndex] = stopsPerSite [siteIndex] + 1;
				
				if (classID == 0)
				{
					reportString*("<tr class = 'TRReport1'><td>"+sequenceNames[sequenceIndex]+"</td><td>"+(3*siteIndex+1)+"</td><td>");
				}
				else
				{
					reportString*("<tr class = 'TRReport2'><td>"+sequenceNames[sequenceIndex]+"</td><td>"+(3*siteIndex+1)+"</td><td>");				
				}
				classID = !classID;
				for (z=0; z<Abs(stopCodonIndex); z=z+1)
				{
					siteInfo2 = stopCodonIndex[z];
					if (siteInfo[siteInfo2] > 0)
					{
						reportString*(nucLetters[siteInfo2$16]+nucLetters[siteInfo2%16$4]+nucLetters[siteInfo2%4]);
						break;
					}
				}
				totalStopCodonsFound = totalStopCodonsFound + 1;
				reportString*("</td></tr>");
			}
		}
	}

	reportString*("</table>");
	reportString*0;
	
	if (stopsPerSite[all64.sites-1] == all64.species && Abs (stopsPerSite) == 1)
	{
		terminalCodonsStripped = 1;
	}
	else
	{
    except("" + totalStopCodonsFound + " stop codons found (detailed report below). Please double-check your alignment and ensure that only coding data are present and that the correct genetic code is selected.");
    return 1;
	}
}

if (filteredData.species > maxUploadSize || filteredData.sites > maxDMSites)
{
  except("Your data set is too large ("+filteredData.species+" species and "+filteredData.sites+" sites). We currently reject files with more than " + maxSLACSize + " sequences or " + maxDMSites + " sites. " +  
                  "We'll increase the numbers when we acquire better dedicated hardware. Alternatively, you can download <a href='http://www.hyphy.org/downloads/'>HyPhy</a> and selection analyses locally (see <a href='http://www.hyphy.org/pubs/hyphybook2007.pdf'>[this document]</a> for details).");
	return 1;
}


seqNamesList 	  = {};
seqNamesMap		  = {};
alreadyDefinedSeq = {};
seqMap			  = {};

DuplicateSequenceWarning = "";
DuplicateSequenceWarning * 256;

renameSequenceWarning 	 = "";
renameSequenceWarning	 * 256;

dupSeqCount      = 0;
renames		     = 0;
padWarning       = 0;
removedSequences = {};

for (k=0; k<filteredData.species;k=k+1)
{
	newSeqName = normalizeSequenceID (sequenceNames[k],"seqNamesList");
	if (newSeqName != sequenceNames[k])
	{
		renameSequenceWarning * ("<DT class = 'DT1'>" + sequenceNames[k] + "&rarr;" + newSeqName);
		renames	= renames+1;
		SetParameter (ds,k,newSeqName);
	}	
	seqNamesMap[sequenceNames[k]&&1] = newSeqName;
	GetDataInfo (thisSeqData, filteredData, k);
	
	z = alreadyDefinedSeq[thisSeqData];
	
	if (z)
	{
		seqMap[k] = z-1;
		dupSeqCount = dupSeqCount + 1;
		DuplicateSequenceWarning * ("<DT class = 'DT2'>" + sequenceNames[k] + " = " + sequenceNames[z-1]);
		removedSequences[sequenceNames[k]&&1] = 1;
	}
	else
	{
		alreadyDefinedSeq[thisSeqData] = k+1;
		seqMap [k] = k;
		if ((thisSeqData$"\\?+$")[0]>=0)
		{
			padWarning = 1;
		}
	}
}

renameSequenceWarning    * 0;
DuplicateSequenceWarning * 0;

_pCount = 1;
if (dupSeqCount || renames)
{
	if (genCodeID >= 0)
	{
		DataSetFilter filteredData 	= CreateFilter (ds,3,"",seqMap[speciesIndex]==speciesIndex,GeneticCodeExclusions);
	}
	else
	{
		DataSetFilter filteredData 	= CreateFilter (ds,1,"",seqMap[speciesIndex]==speciesIndex);	
	}
	GetString(sequenceNames, filteredData, -1);
}
else
{
	if (Rows(NEXUS_FILE_TREE_MATRIX))
	{
		_pCount = Rows(NEXUS_FILE_TREE_MATRIX);
		if ((_pCount == Columns(DATA_FILE_PARTITION_MATRIX) && Columns(DATA_FILE_PARTITION_MATRIX)) && _pCount > 1)
		{
			ExecuteAFile ("./shared/PartitionReader.ibf");
			for (k=0; k<ds.sites;k=k+1)
			{
				if(filterCoverage[k] != 1)
				{
          except("Paritition specification must cover each nucleotide site exactly once. Had coverage of " + filterCoverage[k] + " at nucleotide " + (k+1) + "(" + mySplits + ")");
          return 1;
				}
			}
		}
	}
}

if (filteredData.species < 3)
{
  except("The alignment must include at least 3 unique sequences for selection methods to work");
  return 1;
}

if (genCodeID >= 0)
{
	dType = "codon";
}
else
{
	if (genCodeID == (-1))
	{
		dType = "nucleotide";
	}
	else
	{
		dType = "aminoacid";
	}
}

goodTree = Abs (DATAFILE_TREE);

if (_pCount == 1)
{
	DATAFILE_TREE = checkTreeString (DATAFILE_TREE,1);
	goodTree = goodTree && Abs (DATAFILE_TREE);
}
else
{
	for (_k2 = 0; _k2 < _pCount; _k2 = _k2+1)
	{
		myTrees[_k2] = checkTreeString(myTrees[_k2],_k2+1);
		goodTree	  = goodTree && Abs (myTrees[_k2]);
	}
}

buildNJtree = filteredData.species <= maxSLACSize;

if (!goodTree && !buildNJtree) {
  except("Alignments with more than " + maxSLACSize + " sequences must include prebuilt trees");
  return 1;
}

if (Abs(DuplicateSequenceWarning))
{
  notify("warning", "" + dupSeqCount + " duplicate sequences found and removed. look at the reduced alignment in NEXUS format for reference.");
}

if (terminalCodonsStripped)
{
  notify("warning", "Trailing stop codons were stripped (this only happens when every sequence in the file has a stop codon at the 3' end and nowhere else).")
}

if (Abs(renameSequenceWarning))
{
  notify("info", renames + " sequences were renamed to conform to HyPhy standards. You can look at the renamed alignment in NEXUS format for reference.");
}

if (padWarning)
{
  notify("warning", "It appears that some of the sequences were of unequal length and were padded by HyPhy. This could be because unaligned sequences were uploaded or non-standard characters were used to mark gaps ('-' and '?' are allowed; but '~' (BioEdit) and '_' for example, are not)." +
					 "Always use the standard IUPAC-IUB <a href='http://en.wikipedia.org/wiki/Nucleic_acid_notation#IUPAC_notation'>character table</a> to prepare the alignment for DataMonkey.org.");
}

/* convert to AA */

codonToAAMap = {};
codeToAA 	 = "FLIMVSPTAYXHQNKDECWRG";

nucChars = "ACGT";

if (genCodeID >= 0)
{
	for (p1=0; p1<64; p1=p1+1)
	{
		codon = nucChars[p1$16]+nucChars[p1%16$4]+nucChars[p1%4];
		ccode = _Genetic_Code[p1];
		codonToAAMap[codon] = codeToAA[ccode];
	}
}

if (genCode >= 0)
{
	DataSetFilter nucData = CreateFilter(filteredData,1);
	GetInformation(theSequences,nucData);

	outSequences = "";
	outSequences * (nucData.sites* nucData.species);

	for (seqCounter = 0; seqCounter < nucData.species; seqCounter = seqCounter+1)
	{
		aSeq = theSequences[seqCounter];
		seqLen = Abs(aSeq)-2;
		GetString (seqName, nucData, seqCounter);
		translString = "";
		translString * (seqLen/3+1);
		for (seqPos = 0; seqPos < seqLen; seqPos = seqPos+3)
		{
			codon = aSeq[seqPos][seqPos+2];
			prot = codonToAAMap[codon];
			if (Abs(prot))
			{
				translString * prot;
			}
			else
			{
				translString * "?";
			}
		} 
		translString * 0;
		outSequences * (">" + seqName + "\n" + translString + "\n");
	}

	outSequences * 0;
	aaName = fileName+".aa";
	fprintf (aaName, CLEAR_FILE, outSequences);
}

ExecuteAFile	("./shared/GrabBag.bf");

//Success 
//To be replaced by JSON output
//ExecuteAFile("../Shared/DBTools.ibf");

//slacDBID = _openCacheDB      (jobID);
notify("info", "jobID: " + jobID);


if (dupSeqCount || renames || internalRenames || terminalCodonsStripped)
{
  DATA_FILE_PRINT_FORMAT = 6;
  fprintf(fileName,CLEAR_FILE,filteredData);
  DataSet ds = ReadDataFile (fileName);
}


file_info_record = {};
file_info_record ["partitions"] = _pCount;
file_info_record ["gencodeid"] = genCodeID;
file_info_record ["sites"] = filteredData.sites;

DataSetFilter filteredData = CreateFilter (ds,1);

if (buildNJtree) {
  InferTreeTopology(1.0);
  treeString 		= TreeMatrix2TreeString (1);
} else {
  treeString      = "";
}

file_info_record["sequences"] = filteredData.species;
file_info_record["timestamp"] = Format(Time(1),20,0);
file_info_record["goodtree"] = goodTree; 
file_info_record["nj"] = treeString; 
file_info_record["rawsites"] = filteredData.sites;

sequence_records = {};
GetString(seqNames, filteredData, -1);
for (k = 0; k < Columns (seqNames); k = k+1)
{
  sequence_record = {};
  sequence_record["seqindex"] = k;
  sequence_record["name"]  = seqNames[k];
  sequence_records[k] = sequence_record;
}

fpi_record = {};
if (_pCount == 1)
{
  fpi_record["partition"] = 1;
  fpi_record["startcodon"] = 0; 
  fpi_record["endcodon"] = filteredData.sites-1; 
  fpi_record["span"] = filteredData.sites;

  if (goodTree)
  {
    fpi_record["usertree"] = DATAFILE_TREE;
  }
}
else
{
  for (_k2 = 0; _k2 < _pCount; _k2 = _k2+1)
  {
    fpi_record["partition"] = _k2+1;
    fpi_record["startcodon"] = filterCodonBounds[_k2][0]; 
    fpi_record["endcodon"] = filterCodonBounds[_k2][1]; 
    fpi_record["span"] = filterCodonBounds[_k2][1]-filterCodonBounds[_k2][0]+1;
    if (goodTree)
    {
      fpi_record ["usertree"] = myTrees[_k2];
    }
  }
}

to_json(file_info_record, sequence_records, fpi_record);
