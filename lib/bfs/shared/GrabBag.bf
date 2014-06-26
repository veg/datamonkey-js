colors 		   = {{"#4444FF","#FF4444"}
                  {"white","black"}};
                  
/*---------------------------------------------------------*/
/* Turn the keys of an AVL into a string for labeling 
   chart rows */
   
function avlToLabels (_gb_anAVL,_gb_prefix,_gb_delim)
{
	_gb_resString = "";
	_gb_keys	  = Rows (_gb_anAVL);
	_gb_count	  = Columns (_gb_keys);
	_gb_resString * 128;
	_gb_resString * _gb_prefix;
	if (Abs(_gb_prefix))
	{
		_gb_resString * _gb_delim;
	}
	if (_gb_count)
	{
		_gb_resString * _gb_keys[0];
	}
	for (_gb_idx = 1; _gb_idx < _gb_count; _gb_idx = _gb_idx + 1)
	{
		_gb_resString * (_gb_delim+_gb_keys[_gb_idx]);
	}
	_gb_resString * 0;
	return _gb_resString;
}

/*---------------------------------------------------------*/
/* Turn the keys of an AVL into a numerical column matrix  */
   
function avlKeysToMatrix (_gb_anAVL)
{
	_gb_keys	  = Rows (_gb_anAVL);
	_gb_count	  = Columns (_gb_keys);
	_gb_resMatrix = {_gb_count,1};

	for (_gb_idx = 0; _gb_idx < _gb_count; _gb_idx = _gb_idx + 1)
	{
		_gb_resMatrix[_gb_idx] = 0+_gb_keys[_gb_idx];
	}
	return _gb_resMatrix;
}

/*---------------------------------------------------------*/
/* Assuming that the AVL is 0..N indexed, produce a 
string with AVL entries separated by _gb_delim */

function avlToString (_gb_anAVL,_gb_delim)
{
	_gb_count	  = Abs (_gb_anAVL);
	_gb_resString = "";
	_gb_resString * 128;
	if (_gb_count)
	{
		_gb_resString * (""+_gb_anAVL[0]);
	}
	for (_gb_idx = 1; _gb_idx < _gb_count; _gb_idx = _gb_idx + 1)
	{
		_gb_resString * (_gb_delim+_gb_anAVL[_gb_idx]);
	}
	_gb_resString * 0;
	return _gb_resString;
}

/*---------------------------------------------------------*/
/* Assuming that the AVL is 0..N indexed, produce a 
row matrix with AVL entries, using _gb_map to map the values 
and _gb_stride to do the conversion */

function avlToRow (_gb_anAVL, _gb_map, _gb_stride)
{
	_gb_count	  = Abs (_gb_anAVL);
	_gb_matrix	  = {1,_gb_count*_gb_stride};
	
	if (_gb_stride>1)
	{
		for (_gb_idx = 0; _gb_idx < _gb_count; _gb_idx = _gb_idx + 1)
		{
			for (_gb_idx2 = 0; _gb_idx2 < _gb_stride; _gb_idx2 = _gb_idx2 + 1)
			{
				_gb_matrix [_gb_idx*_gb_stride+_gb_idx2] = _gb_map[_gb_stride*_gb_anAVL[_gb_idx]+_gb_idx2];
			}
		}
	}	
	else
	{
		for (_gb_idx = 0; _gb_idx < _gb_count; _gb_idx = _gb_idx + 1)
		{
			_gb_matrix [_gb_idx] = _gb_map[_gb_anAVL[_gb_idx]];
		}
	}
	return _gb_matrix;
}

/*---------------------------------------------------------*/
/* Turn the keys of an AVL into a string for labeling 
   chart rows */
   
function splitFilePath (_filePath)
{
	_splitPath = {};
	_split     = _filePath $ ("[^\\"+DIRECTORY_SEPARATOR+"]+$");
	if (_split[0] == 0 && _split[1] == Abs (_filePath)-1) /* no path, all file name */
	{
		_splitPath ["DIRECTORY"] = "";
	}
	else
	{
		_splitPath ["DIRECTORY"] = _filePath[0][_split[0]-1];
		_filePath = _filePath[_split[0]][Abs(_filePath)];
	}

	_split     = _filePath || "\\.";
	if (_split[0] < 0) /* no extension */
	{
		_splitPath ["EXTENSION"] = "";
		_splitPath ["FILENAME"]  = _filePath;
 	}
	else
	{
		_splitPath ["EXTENSION"] = _filePath[_split[Rows(_split)-1]+1][Abs(_filePath)-1];
		_splitPath ["FILENAME"]  = _filePath[0][_split[Rows(_split)-1]-1];
	}
	return _splitPath;
}

/*---------------------------------------------------------*/
/* fix global variables in a LF at their current values */
   
function fixGlobalParameters (_lfName)
{
	ExecuteCommands ("GetString (_lfInfo," + _lfName + ",-1);");
	_lfInfo = _lfInfo["Global Independent"];
	for (_gb_idx = 0; _gb_idx < Columns (_lfInfo); _gb_idx = _gb_idx + 1)
	{
		ExecuteCommands (_lfInfo[_gb_idx] + ":=" + _lfInfo[_gb_idx] + "__;");
	} 	
	return 0;
}

/*---------------------------------------------------------*/
/* prompt for global variabless in a LF and fix their values */
   
function promptForGlobalParameters (_lfName)
{
	ExecuteCommands ("GetString (_lfInfo," + _lfName + ",-1);");
	_lfInfo = _lfInfo["Global Independent"];
	for (_gb_idx = 0; _gb_idx < Columns (_lfInfo); _gb_idx = _gb_idx + 1)
	{
		fprintf (stdout, "\nEnter a value for ", _lfInfo[_gb_idx], ":");
		fscanf  (stdin, "Number", _tval);
		ExecuteCommands (_lfInfo[_gb_idx] + ":=" + _tval + ";");
	} 	
	return 0;
}

/*---------------------------------------------------------*/
/* prompt for global variabless in a LF and fix their values */
   
function echoGlobalParameters (_lfName)
{
	ExecuteCommands ("GetString (_lfInfo," + _lfName + ",-1);");
	_lfInfo = _lfInfo["Global Independent"];
	for (_gb_idx = 0; _gb_idx < Columns (_lfInfo); _gb_idx = _gb_idx + 1)
	{
		ExecuteCommands ("_tval = "+_lfInfo[_gb_idx]);
		fprintf (stdout, _lfInfo[_gb_idx], " : ", Format (_tval, 12, 4), "\n");
	} 	
	return 0;
}


/*---------------------------------------------------------*/
/* take a snapshot of global parameters */
   
function stashGlobalParameters (_lfName)
{
	ExecuteCommands ("GetString (_lfInfo," + _lfName + ",-1);");
	_lfInfo = _lfInfo["Global Independent"];
	_paramStash = {};
	for (_gb_idx = 0; _gb_idx < Columns (_lfInfo); _gb_idx = _gb_idx + 1)
	{
		ExecuteCommands ("_paramStash[\""+_lfInfo[_gb_idx]+"\"] :=" + _lfInfo[_gb_idx] + ";");
	} 	
	return _paramStash;
}

/*---------------------------------------------------------*/
/* define a global parameter if not already defined */
   
function defineIfNeeded (_parName, _parValue)
{
	ExecuteCommands("GetInformation (_gb_idx, \"^`_parName`$\");");
	if (Rows (_gb_idx) == 0)
	{
		ExecuteCommands ("global `_parName`="+_parValue+";");
		return 0;
	}
	return 1;
}

/*---------------------------------------------------------*/
/* restore values of global parameters */
   

function restoreGlobalParameters (_paramStash)
{
	_stashKeys = Rows(_paramStash);
	for (_gb_idx = 0; _gb_idx < Abs (_paramStash); _gb_idx = _gb_idx + 1)
	{
		ExecuteCommands (_stashKeys[_gb_idx] + "=" + _paramStash[_stashKeys[_gb_idx]] + ";");
	} 	
	return 0;
}

/*---------------------------------------------------------*/
/* take a string row/column matrix and turn it into an AVL of 
   the form avl["matrix entry"] = 1 for each matrix entry */
   
function stringMatrixToAVL (_theList&)
{
	_gb_dim = Rows(_theList)*Columns(_theList);
	_gb_ret = {};
	for (_gb_idx = 0; _gb_idx < _gb_dim; _gb_idx = _gb_idx + 1)
	{
		_gb_ret [_theList[_gb_idx]] = _gb_idx+1;
	} 	
	return _gb_ret;
}

/*---------------------------------------------------------*/
/* take an avl indexed by 0..N-1 and convert to a row matrix */
   
function avlToMatrix (_theList&)
{
	_gb_dim = Abs(_theList);
	_gb_ret = {_gb_dim,1};
	for (_gb_idx = 0; _gb_idx < _gb_dim; _gb_idx = _gb_idx + 1)
	{
		_gb_ret [_gb_idx] = _theList[_gb_idx];
	} 	
	return _gb_ret;
}


/*---------------------------------------------------------*/
/* report a string version of an a/b ratio, handling the cases
   of a and/or b = 0 */
   
function _standardizeRatio (_num, _denom)
{
	if (_denom != 0)
	{
		_ratio = _num/_denom;
		if (_ratio < 10000)
		{
			return Format (_ratio,10,4);
		}
	}
	else
	{
		if (_num == 0)
		{
			return " Undefined";
		}
	}
	return "  Infinite";
}

/*---------------------------------------------------------*/
/* copy branch lengths */
   
function _copyws (_treeID1, _treeID2, _op, _suffix)
{
	ExecuteCommands ("_gb_dim=BranchName("+_treeID2+",-1);");
	_gb_ret = "";
	_gb_ret * 128;
	
	for (_gb_idx = 0; _gb_idx < Columns(_gb_dim)-1; _gb_idx = _gb_idx + 1)
	{
		_gb_idx2 = _treeID2 + "." + _gb_dim[_gb_idx] + "." + _suffix;
		ExecuteCommands ("_gb_idx2="+_gb_idx2);
		_gb_ret * (_treeID1 + "." + _gb_dim[_gb_idx] + "." +_suffix + ":=" + _op + _gb_idx2 + ";\n");
	} 	
	_gb_ret * 0;
	return _gb_ret;
}


/*---------------------------------------------*/
/* convert a number into a 3 letter string 
   for initializing stdin lists */
/*---------------------------------------------*/
   
function _mapNumberToString (n)
{
	if (n>=100)
	{
		return "" + n;
	}
	if (n>=10)
	{
		return "0" + n;
	}
	return "00" + n;
}


/*---------------------------------------------*/
/* return HTML code for the datamonkey job ID
/*---------------------------------------------*/
   
function _makeJobIDHTML (fileName)
{
	return "<DIV Class='RepClassBox'><b>Job ID:</b>"+
		   fileName+
		   " <a class = 'InfoLink' href='"+
		   BASE_CGI_URL_STRING+
		   "jobStatus.pl?file="+
		   fileName+
		   "' TARGET = '_top'>[Information:Other analyses]</a></DIV>";
		   /*
		   <IMG SRC='http://www.datamonkey.org/images/monkeys.gif' WIDTH='66' HEIGHT='20' BORDER='0' ALT='Integrative Selection' ALIGN='MIDDLE'></DIV>";
		   */
}

/*---------------------------------------------*/
/* return upload page HTML code for the datamonkey job ID
/*---------------------------------------------*/

function _makeJobIDHTMLSimple (fileName)
{
	return "<DIV Class='RepClassBox'><b>Job ID:</b>"+
		   fileName+"</DIV>";
		  
}

/*---------------------------------------------*/
/* return upload page HTML code for the datamonkey job ID
/*---------------------------------------------*/

function _makeJobIDHTMLSimpleExtra (fileName,link,label)
{
	return "<DIV Class='RepClassBox'><b>Job ID:</b>"+
		   fileName+
		   " <a class = 'InfoLink' href='"+
		   BASE_HTML_URL_STRING+
		   link+"'>["+label+"]</a></DIV>";
}

/*---------------------------------------------*/
/* return date stamp code for the datamonkey job ID
/*---------------------------------------------*/
   
function _makeTimeStampHTML (dummy)
{
	GetString (_dateStamp, TIME_STAMP, -1);
	
	return "<DIV Class='DateStamp'>Page generated on<i> "+_dateStamp+" GMT</i></DIV>";
}


/*---------------------------------------------*/
/* return date stamp code for the datamonkey job ID
/*---------------------------------------------*/
   
function _returnTreePS (treeS, scaleOn, iLabels)
{
	Tree _TT = treeS;
	
	TREE_OUTPUT_OPTIONS = {}; 
	
	_TTAVL   = _TT^0;
	_TTDepth = 0;
	
	/*TREE_OUTPUT_OPTIONS ["__FONT_SIZE__"] = 24;*/ 
	_stringMode = Type (iLabels) == "String";
	_listMode   = Type (iLabels) == "AssociativeList";
	
	for (_gb_idx = 1; _gb_idx < Abs(_TTAVL); _gb_idx = _gb_idx + 1)
	{
		_TTDepth = Max((_TTAVL[_gb_idx])["Depth"],_TTDepth);
		if (Abs(iLabels))
		{
			_myName = (_TTAVL[_gb_idx])["Name"];
			if (_stringMode)
			{
				if (_myName == iLabels)
				{
					TREE_OUTPUT_OPTIONS[_myName] = {};
					(TREE_OUTPUT_OPTIONS[_myName])["TREE_OUTPUT_BRANCH_TLABEL"] = _myName;
					(TREE_OUTPUT_OPTIONS[_myName])["TREE_OUTPUT_BRANCH_COLOR"] = {{1,0,0}};
				}
			}
			else
			{	
				if (_listMode)
				{
					if (Abs(iLabels[_myName]))
					{
						TREE_OUTPUT_OPTIONS[_myName] = {};
						(TREE_OUTPUT_OPTIONS[_myName])["TREE_OUTPUT_BRANCH_TLABEL"] = iLabels[_myName];
					}
				}
				else
				{
					if (Abs((_TTAVL[_gb_idx])["Children"]))
					{
						TREE_OUTPUT_OPTIONS[_myName] = {};
						(TREE_OUTPUT_OPTIONS[_myName])["TREE_OUTPUT_BRANCH_TLABEL"] = _myName;
					}
				}
			}
		}
	}
	
	_imageHeight = Min(1600,Max(200,30 * TipCount(_TT)));
	_imageWidth	 = Min(680, Max (200, _TTDepth*50+200));
	
	_retString = PSTreeString (_TT, scaleOn, {{_imageWidth__,_imageHeight__}});
	TREE_OUTPUT_OPTIONS = {}; 
	return _retString;
}

/*------------------------------------------------------------------------------------------*/
/* return tree descriptions
/*------------------------------------------------------------------------------------------*/
   
function _getTreeDescriptionTag (mode)
{
	if (mode == 0)
	{
		return "Neighbor Joining Tree";
	}
	if (mode == 1)
	{
		return "User Tree(s)";
	}
	if (mode == 2)
	{
		return "SBP Inferred Trees";
	}
	if (mode == 3)
	{
		return "GARD Inferred Trees";
	}
	return "Unknown";
}

/*------------------------------------------------------------------------------------------*/

function _getTreeLink (fileName,mode,format)
{
	return _getTreeLinkRR (fileName,mode,format, "");
	
}

/*------------------------------------------------------------------------------------------*/

function _getTreeLinkRR (fileName,mode,format, reroot)
{
	if (Abs(reroot))
	{
		reroot = "-" + reroot;
	}
	if (format == 1)
	{
		return BASE_CGI_URL_STRING + "wrapHyPhyBF.pl?file=pdftrees&mode=2&arguments=" + fileName + "-" + mode + reroot;
	
	}
	return BASE_CGI_URL_STRING + "wrapHyPhyBF.pl?file=splits&mode=1&arguments=" + fileName + "-" + mode + reroot;	
}

/*------------------------------------------------------------------------------------------*/

function _getTreeDescription (dbName, mode)
/*
modes :
0 - NJ for the whole dataset
1 - User trees
2 - SBP trees
3 - GARD trees
*/
{
	_trees  = {};
	_left   = {};
	_right  = {};
	
	_sendMeBack = {};

	if 		(mode == 0) 
	{
		_res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");
		
		if (Abs((_res[0])["NJ"])) {		
            _trees[0] = (_res[0])["NJ"];
            _left[0]  = 0;
            _right[0] = 0+(_res[0])["RawSites"]-1;
        }
	}
	else
	{
		if 		(mode == 1) 
		{
			_res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");
			if (0+(_res[0])["GoodTree"])
			{
				_res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_PARTITION_INFO ORDER BY Partition");
				for (_k = 0; _k < Abs (_res); _k = _k + 1)
				{
					_trees[_k] 	   = (_res[_k])["UserTree"];
					_left  [_k]    = 0+(_res[_k])["StartCodon"];
					_right [_k]    = 0+(_res[_k])["EndCodon"];
				}
			}
		}
		else
		{
			if 		(mode == 2) 
			{
				haveSBP = _TableExists (slacDBID, "SBP_SUMMARY");
				if (haveSBP)
				{
					_res = _ExecuteSQL  (dbName,"SELECT COL_VALUE FROM SBP_SUMMARY WHERE COL_KEY  = 'TREE1'");
					_res2 = _ExecuteSQL  (dbName,"SELECT COL_VALUE FROM SBP_SUMMARY WHERE COL_KEY = 'TREE2'");
					_res3 = _ExecuteSQL  (dbName,"SELECT COL_VALUE FROM SBP_SUMMARY WHERE COL_KEY = 'BP'");
					
					if (Abs(_res) && Abs (_res2) && Abs (_res3))
					{
						_trees[0] 	    = _res[0];
						_trees[1] 	    = _res2[0];
						_left [0] 	    = 0;
						_left [1]       = 0+_res3[0];
						_right [0]      = _left [1] - 1;
						_res 			= _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");
						_right[1] 		= 0+(_res[0])["RawSites"]-1;						
					}
				}
			}
			else
			{
				if 		(mode == 3) 
				{
					haveGARD = _TableExists (slacDBID, "GARD_SPLITS");
					if (haveGARD)
					{
						_res = _ExecuteSQL  (dbName,"SELECT * FROM GARD_SPLITS ORDER BY PART");
						for (_k = 0; _k < Abs (_res); _k = _k + 1)
						{
							_trees[_k] 	   = (_res[_k])["TREE"];
							_left  [_k]    = 0+(_res[_k])["LEFT"];
							_right [_k]    = 0+(_res[_k])["RIGHT"];
						}
					}
				}
			}
		}
	}
	
	
	if (Abs(_trees))
	{
		_sendMeBack["TREES"] = _trees;
		_sendMeBack["LEFT"]  = _left;
		_sendMeBack["RIGHT"] = _right;
	}
	
	return _sendMeBack;
}

/*---------------------------------------------*/
/* return HTML code for the data description blurb
/*---------------------------------------------*/
   
function _makeDataDescription (dbName, treeLengthArray)
{
	 _res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");

	 _sc        = 0+(_res[0])["Sequences"];
	 _partCount = 0+(_res[0])["Partitions"];
	 _genCodeID = 0+(_res[0])["genCodeID"];
	 
	 result = "<DIV CLASS='RepClassSM'><b>Data summary</b><p><b>"+ _sc +
			  "</b> sequences with <b>"+_partCount+"</b> partition";
			 
	if (_partCount>1)
	{
		result = result + "s";
	}
			  
	_res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_PARTITION_INFO ORDER BY Partition");
	
	_scaler = 1;
	if (_genCodeID>=0)
	{
		_scaler = 1/3;
	}

	for (_k = 1; _k<=Abs(_res); _k=_k+1)	
	{	
		result = result + "<br clear=all><span style = 'font-size: x-small; margin-left:10px;'>Partition <b>" + _k + 
				"</b>: " + (0+(_res[_k-1])["Span"])*_scaler + " codons, " + treeLengthArray[_k] + " subs/nucleotide";
				
		if (treeLengthArray[_k]>5*_sc)
		{
			result = result + "&nbsp; <font color = 'red'>Warning: Unusually long tree. Perhaps the sequences were misaligned?</font>";
		}
		result = result + "</span>\n";
	}
	return result + "</DIV>";	
}

/*---------------------------------------------*/
/* return recombination status for the alignment
0 - not screened
>=0 - screened/has recombination with this many fragments
<0  - screened/has no evidence of recombination
   
/*---------------------------------------------*/

function _checkRecombinationStatus (dbName)
{
	haveSBP  = _TableExists (dbName, "SBP_SUMMARY");
	haveGARD = _TableExists (dbName, "GARD_SUMMARY");
	if (haveSBP || haveGARD)
	{
		if (haveGARD)
		{
			_frags = 1+(_ExecuteSQL  (slacDBID,"SELECT COL_VALUE FROM GARD_SUMMARY WHERE COL_KEY = 'Breakpoints'"))[0];
		}
		else
		{
			if (haveSBP)
			{
				gi1 = _ExecuteSQL  (dbName,"SELECT COL_VALUE FROM SBP_SUMMARY WHERE COL_KEY = 'bestScores'");
				ExecuteCommands ("bestScores = " + gi1[0]);
				if (bestScores[0][0] > 0 || bestScores[1][0] > 0 || bestScores[2][0] > 0)
				{
					_frags = 2;
				}
				else
				{
					_frags = 1;
				}
			}
		}
		if (_frags > 1)
		{
			return _frags;
		}
		return -1;
		
	}
	return 0;
}

/*------------------------------------------------------------------------------------------*/
/* return HTML code for the data description blurb
/*------------------------------------------------------------------------------------------*/
   
function _makeDataDescriptionTM_bootstrap (dbName, treeMode, treeLengthArray)
{
	 _res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");

	 _sc        = 0+(_res[0])["Sequences"];
	 _genCodeID = 0+(_res[0])["genCodeID"];
	 _treeDesc  = _getTreeDescription (dbName, treeMode);
	 _partCountI = 0+(_res[0])["Partitions"];

	 
	 _partCount = Abs(_treeDesc["TREES"]);
	 
	 result = {"Data summary" : {"0": "" + _sc + " sequences with " + _partCount + " partitions."}, "Warnings": {}};
	 
	
	_recombWarning = _checkRecombinationStatus (dbName);
	_recombWarningStr = "";	  
	if (_recombWarning == 0 && (treeMode == 0 || treeMode == 1 && _partCount == 0))
	{
		if (treeMode == 0 &&  _partCountI > 1) {
			(result["Warnings"]) ["Data summary"] = "A neighbor joining tree was used to analyze an alignment whose uploaded file included multiple trees (indicative or recombination).";		
		}
		else {
			(result["Warnings"]) ["Data summary"] = "These sequences have not been screened for recombination.";
		}
	}
	else
	{
		if (_recombWarning > 0 && _partCount < 0) {
			(result["Warnings"]) ["Data summary"] = "These sequences appear to have undergone recombination and there are fewer trees used for this analysis than inferred non-recombinant segments.";
		}
	}
	
	if (Abs((result["Warnings"]) ["Data summary"])) {
		(result["Warnings"]) ["Data summary"] += " Selection analyses of alignments with recombinants in them using a single tree may generate <u>misleading</u> results.";
	}
			  
	_data = returnDataAdjective (_genCodeID,0);
	if (_genCodeID >= 0) {
		_factor = 1/3;
	}
	else {
		_factor = 1;
	}

	for (_k = 1; _k<=_partCount; _k=_k+1)	
	{	
		result ["Partition " + _k] = {"0": "" + (1+(_treeDesc["RIGHT"])[_k-1] - (_treeDesc["LEFT"])[_k-1])*_factor + " `_data`s",
		                              "1" : Format(treeLengthArray[_k-1]*_factor,5,2) + " subs/ `_data`  site"};
				
		if (treeLengthArray[_k-1]>5*_sc) {
			(result ["Warnings"])["Partition " + _k] = "Unusually long tree. Perhaps the sequences were misaligned?";
		}
	}
	return result;	
}

/*---------------------------------------------*/
/* return HTML code for the data description blurb
/*---------------------------------------------*/
   
function _makeDataDescriptionTM (dbName, treeMode, treeLengthArray)
{
	 _res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");

	 _sc        = 0+(_res[0])["Sequences"];
	 _genCodeID = 0+(_res[0])["genCodeID"];
	 _treeDesc  = _getTreeDescription (dbName, treeMode);
	 _partCountI = 0+(_res[0])["Partitions"];

	 
	 _partCount = Abs(_treeDesc["TREES"]);
	 
	 result = "<DIV CLASS='RepClassSM'><b>Data summary</b><p><b>"+ _sc +
			  "</b> sequences with <b>"+_partCount+"</b> partition";
			 
	if (_partCount>1)
	{
		result = result + "s";
	}
	
	_recombWarning = _checkRecombinationStatus (dbName);
	_recombWarningStr = "";	  
	if (_recombWarning == 0 && (treeMode == 0 || treeMode == 1 && _partCount == 0))
	{
		if (treeMode == 0 &&  _partCountI > 1)
		{
			_recombWarningStr = "<DIV CLASS = 'ErrorTagSM'>A neighbor joining tree was used to analyze an alignment whose uploaded file included multiple trees (indicative or recombination).";		
		}
		else
		{
			_recombWarningStr = "<DIV CLASS = 'ErrorTagSM'>These sequences have not been screened for recombination.";
		}
	}
	else
	{
		if (_recombWarning > 0 && _partCount < 0)
		{
			_recombWarningStr = "<DIV CLASS = 'ErrorTagSM'>These sequences appear to have undergone recombination and there are fewer trees used for this analysis than inferred non-recombinant segments.";
		}
	}
	if (Abs(_recombWarningStr))
	{
		if (Abs(treeLengthArray) == 0)
		{
			return _recombWarningStr + " Selection analyses of alignments with recombinants in them using a single tree may generate <u>misleading</u> results.</DIV>";
		}
		else
		{
			result = result + _recombWarningStr + " Selection analyses of alignments with recombinants in them using a single tree may generate <u>misleading</u> results.</DIV>";
		}
	}
	if (Abs(treeLengthArray) == 0)
	{
		return "";
	}
			  
	_data = returnDataAdjective (_genCodeID,0);
	if (_genCodeID >= 0)
	{
		_factor = 1/3;
	}
	else
	{
		_factor = 1;
	}

	for (_k = 1; _k<=_partCount; _k=_k+1)	
	{	
		result = result + "<br clear=all><span style = 'font-size: x-small; margin-left:10px;'>Partition <b>" + _k + 
				"</b>: " + (1+(_treeDesc["RIGHT"])[_k-1] - (_treeDesc["LEFT"])[_k-1])*_factor + " "+  _data + "s " + treeLengthArray[_k]*_factor + " subs/site";
				
		if (treeLengthArray[_k]>5*_sc)
		{
			result = result + "&nbsp; <font color = 'red'>Warning: Unusually long tree. Perhaps the sequences were misaligned?</font>";
		}
		result = result + "</span>\n";
	}
	return result + "</DIV>";	
}

/*---------------------------------------------*/
/* return HTML code for the data description blurb
/*---------------------------------------------*/
   
function _makeSimpleDataDescription (dbName)
{
	 _res = _ExecuteSQL  (dbName,"SELECT * FROM FILE_INFO");

	 result = "<DIV CLASS='RepClassSM'><b>Data summary</b><p><b>"+ (0+(_res[0])["Sequences"]) +
			  "</b> sequences with <b>"+(_res[0])["Sites"]+"</b> sites.";
			  
	return result + "</DIV>";	
}

/*---------------------------------------------*/
/* return HTML code for the data description blurb
/*---------------------------------------------*/
   
function _formatTimeString (secondCount)
{
	_hours = secondCount $3600;
	if (_hours < 10)
	{
		_timeString = "0"+_hours;
	}
	else
	{
		_timeString = ""+_hours;
	}
	_minutes = (secondCount%3600)$60;
	if (_minutes < 10)
	{
		_timeString = _timeString+":0"+_minutes;
	}
	else
	{
		_timeString = _timeString+":"+_minutes;
	}
	_seconds = (secondCount%60);
	if (_seconds < 10)
	{
		_timeString = _timeString+":0"+_seconds;
	}
	else
	{
		_timeString = _timeString+":"+_seconds;
	}
	return _timeString;
}	

/*---------------------------------------------*/
/* make splits string from trees and lengths
/*---------------------------------------------*/
   
function _makeSplitsString (_trees,_lengths)
/* _trees 		= a vector with N tree strings
   _lengths		= a vector with N spans
*/
{
	_splitString = ""; _splitString * 256;
	_size = Columns(_trees)*Rows(_trees);
	_splitString * (""+_size+"\n");
	_currentStart = 0;
	for (_r = 0; _r < _size; _r = _r+1)
	{
		_splitString * (Format(_currentStart,10,0) + "-" + Format(_currentStart+(_lengths[_r]-1),10,0) + "\n");
		_splitString * (_trees[_r] + "\n");		
		_currentStart = _currentStart + _lengths[_r];
	}
	_splitString * 0;
	return _splitString;
}	


/*---------------------------------------------*/
/* return normalized ratio for dN/dS
/*---------------------------------------------*/
   
function _normalizeRatio (alpha,beta)
{
	if (alpha>0)
	{
		return ""+Format(beta/alpha,8,3);
	}
	if (beta == 0)
	{
		return "Undefined";	
	}
	return "Infinite";
}


/*___________________________________________________________________________________________________________*/

function defaultErrorOut (errString)
{
	fprintf (stdout, "ERROR:<DIV class = 'ErrorTagSM'>\n", errString, "</DIV>");
	return 0;

}

/*___________________________________________________________________________________________________________*/

function psErrorOut (errString)
{
	fprintf (stdout, "/Times-Roman findfont 20 scalefont setfont newpath 100 600 moveto (",errString,") show showpage");
	return 0

}
/*___________________________________________________________________________________________________________*/

function generateFilteredData (jobID,dbID,siteID)
{
	_fileName = BASE_CLUSTER_ACCESS_PATH + jobID;
	DataSet _rawFile = ReadDataFile (_fileName);
	_generalInfo = _ExecuteSQL  (dbID,"SELECT * FROM FILE_INFO");
	_genCodeID		= 0+(_generalInfo[0])["genCodeID"];
	if (_genCodeID < 0)
	{
		if (siteID >= 0)
		{
			pSpec = ""+siteID;
			DataSetFilter filteredData = CreateFilter (_rawFile,1,pSpec);
		}
		else
		{
			DataSetFilter filteredData = CreateFilter (_rawFile,1);
		
		}
	}
	else
	{
		ApplyGeneticCodeTable (_genCodeID);
		if (siteID >= 0)
		{
			pSpec = ""+(3*siteID)+"-"+(3*siteID+2);
			DataSetFilter filteredData = CreateFilter (_rawFile,3,pSpec,"",GeneticCodeExclusions);		
		}
		else
		{
			DataSetFilter filteredData = CreateFilter (_rawFile,3,"","",GeneticCodeExclusions);		
		}
	}
	return 0;
}

/*___________________________________________________________________________________________________________*/

function	AVL2Matrix (theAVL, keyMap)
{
	rowCount 	= Abs (theAVL);
	colCount 	= Columns (keyMap);
	outMatrix 	= {rowCount, colCount};
	
	for (_r = 0; _r < rowCount; _r = _r+1)
	{
		for (_c=0; _c < colCount; _c = _c+1)
		{
			outMatrix[_r][_c] = 0+(theAVL[_r])[keyMap[_c]];
		}
	}
	
	return outMatrix;
}

/*___________________________________________________________________________________________________________*/

function	returnDataAdjective (gc,mode)
{
	if (gc == (-1))
	{
		return "nucleotide";
	}
	else
	{
		if (gc == (-2))
		{
			return "aminoacid";
		}
		else
		{
			if (mode)
			{
				return "nonsynonymous";
			}
			else
			{
				return "codon";
			}
		}
	}
}

/*___________________________________________________________________________________________________________*/

function printALongString (string, cutoff)
{
	if (Abs(string)<cutoff)
	{
		return string;
	}
	return "<span onmouseover = \"Tip('"+string+"')\">"+string[0][cutoff-3]+"...</span>";
}

/*___________________________________________________________________________________________________________*/

function vectorToAVLFreqs (_vector)
{
	_result = {};
	_s = Rows(_vector) * Columns (_vector);
	for (_r = 0; _r < _s; _r = _r+1)
	{
		_result[_vector[_r]] = 	_result[_vector[_r]]+1;
	}
	return _result;
}

/*___________________________________________________________________________________________________________*/

function vectorToAVL (_vector)
{
	_result = {};
	_s = Rows(_vector) * Columns (_vector);
	for (_r = 0; _r < _s; _r = _r+1)
	{
		_result[_r] = 	_vector[_r];
	}
	return _result;
}

/*---------------------------------------------
take an AVL of the form ["string"] = number
and print it as:

key[_sepChar]+: number (%)

---------------------------------------------*/
function _printAnAVLCB (_theList, _label, _doCB)
{
	_gb_keys 		= _sortStrings(Rows (_theList));
	_gb_dim   		= Abs(_theList);
	_gb_total 		= 0;
	_gb_max_key_len = 0;
	
	fprintf (stdout, "<TABLE BORDER = 0 SPACING = '10px'><TR class = 'HeaderClassSM'><TD>",_label,"</TD><TD>Count</TD><TD>Frequency</TD>");

	if (Abs(_doCB))
	{
		fprintf (stdout, "<TD>Select</TD>");
	}

	fprintf (stdout, "</TR>");
	
	for (_gb_idx = 0; _gb_idx < _gb_dim; _gb_idx = _gb_idx + 1)
	{
		_gb_key 		= _gb_keys[_gb_idx];
		_gb_max_key_len = Max (_gb_max_key_len, Abs(_gb_key));
		_gb_total 		= _gb_total + _theList[_gb_key];
	}
	
	fprintf (stdout, "\n");
	for (_gb_idx = 0; _gb_idx < _gb_dim; _gb_idx = _gb_idx + 1)
	{
		_gb_key 		= _gb_keys[_gb_idx];
		fprintf (stdout, "<TR CLASS = 'TRReport", 1+(_gb_idx%2), "'><TD>",_gb_key,"</TD><TD>",Format (_theList[_gb_key],8,0),"</TD><TD>",Format (100*_theList[_gb_key]/_gb_total,5,2),"%</TD>");
		if (Abs(_doCB))
		{
			if (Type (_doCB) == "AssociativeList")
			{
				fprintf (stdout, "<TD><input type = 'checkbox' id = '_hyphy_argument_", _gb_idx,"' value = '",_doCB[_gb_key],"'></TD>");
			}
			else
			{
				fprintf (stdout, "<TD><input type = 'checkbox' id = '_hyphy_argument_", _gb_idx,"' value = '",_gb_key,"'></TD>");
			}
		}
	
		fprintf (stdout, "</TR>");
	}
		
	fprintf (stdout, "</TABLE>");
	return 0;
}

function _printAnAVL (_theList, _label)
{
	return _printAnAVLCB (_theList, _label, 0);
}

/*---------------------------------------------
sort a matrix of strings; return a 
column vector
---------------------------------------------*/
function _sortStringsAux (theKey, theValue)
{
	for (_gb_idx2 = 0; _gb_idx2 < theValue; _gb_idx2=_gb_idx2+1)
	{
		_gb_sortedStrings [_gb_idx] = theKey;
		_gb_idx = _gb_idx + 1;
	}
	return 0;
}

function _sortStrings (_theList)
{
	_gb_dim = Rows (_theList)*Columns (_theList);
	_toSort = {};
	for (_gb_idx = 0; _gb_idx < _gb_dim; _gb_idx = _gb_idx + 1)
	{
		_toSort[_theList[_gb_idx]] = _toSort[_theList[_gb_idx]]+1;
	}
	_gb_sortedStrings = {_gb_dim,1};
	_gb_idx = 0;
	_toSort["_sortStringsAux"][""];
	return _gb_sortedStrings;
}

/*--------------------------------------------------------------------------------------------------------------------*/

function _matrixToJSArray (_id, _theMatrix, _extra) {
	_rows = Rows (_theMatrix);

	_js = ""; _js * 128; _js * "\n<script type = 'text/javascript' language = 'javascript1.7'>\n `_id` = [";
	
	if (Type (_theMatrix[0][0]) == "String") {
	    _columns = Columns (_theMatrix);
        for (_r = 0; _r < _rows; _r += 1) {
            if (_r) {
                _js * ",";
            }
            _js * ("\n['" + _theMatrix[_r][0] + "'");
            for (_c = 1; _c < _columns; _c+=1) {
               _js * (",'" + _theMatrix[_r][_c] + "'");
            }
            _js * "]";
        }	
	} else {
        _js * ("\n[" + Join(",", _theMatrix[0][-1]) + "]");
        for (_r = 1; _r < _rows; _r += 1) {
            _js * ("\n,[" + Join(",", _theMatrix[_r][-1]) + "]");
        }	
	}
	
	
	_js * "\n];\n`_extra`</script>\n";
	_js * 0; 
	return _js;
}

/*--------------------------------------------------------------------------------------------------------------------*/

function		echoAVLAsTable (theData, theKeys, avlKind, avlMap, tFontSize)
{
	if (doPlainText == 0)
	{
		fprintf (stdout, "<TABLE BORDER = '0' cellspacing = '1px' cellpadding = '5px' style = 'padding:10px'>");
	}
	if (Abs(theKeys))
	{
		_rc = Abs (theKeys)-1;
		if (doPlainText == 0)
		{
			fprintf (stdout, "\n<TR CLASS = 'HeaderClassSM'>");
			for (_k=0; _k <= _rc; _k=_k+1)
			{
				fprintf (stdout, "<TH>", theKeys[_k], "</TH>");
			}
			fprintf (stdout, "</TR>\n");
		}
		else
		{
			fprintf (stdout, theKeys[0]);
			for (_k=1; _k <= _rc; _k=_k+1)
			{
				fprintf (stdout, ",", theKeys[_k]);
			}		
		}
	}

	_avlSize = Abs  (theData);
	_avlKeys = Rows (theData);
	
	if (avlKind == 0)
	{
		for (_k=0; _k<_avlSize;_k=_k+1)
		{
			fprintf (stdout, "<TR CLASS = 'ModelClass",(1+_k%2),"' style = 'padding:3px; text-align: left; font-size: ",tFontSize,"px;'><TH>",
							 _avlKeys[_k],
							 "</TH><TD>",
							 theData[_avlKeys[_k]],
							 "</TR>");
		}	
	}
	else
	{
	
		for (_k=0; _k<_avlSize;_k=_k+1)
		{
			if (doPlainText == 0)
			{
				fprintf (stdout, "<TR CLASS = 'ModelClass",(1+_k%2),"' style = 'padding:3px; text-align: left; font-size: ",tFontSize,"px;'>");	
			}
				
			if (avlKind == 1)
			{	
				if (doPlainText == 0)
				{
					fprintf (stdout, "<TH>",_avlKeys[_k],"</TH>");
					for (_k2 = 0; _k2 < _rc; _k2 = _k2+1)
				    {
				    	fprintf (stdout, "<TD>",
									 	(theData[_avlKeys[_k]])[_k2],
									 	"</TD>");
									 	
					}
				}
				else
				{
					fprintf (stdout,"\n",_avlKeys[_k]);
					for (_k2 = 0; _k2 < _rc; _k2 = _k2+1)
				    {
				    	fprintf (stdout,",", (theData[_avlKeys[_k]])[_k2]);
									 	
					}	
				}
			}
			else
			{
		    	fprintf (stdout, "<TH>",_k+1,"</TH>");
		    	
				for (_k2 = 0; _k2 < _rc; _k2 = _k2+1)
			    {
			    	if (_k2 == 0 && Abs(avlMap["LINK"]))
			    	{
			    		theLink = avlMap["LINK"] ^ {{"THELINK",(theData[_avlKeys[_k]])[avlMap[0]]}};
			    		fprintf (stdout, "<TD><a href = '", theLink, "'>",(theData[_avlKeys[_k]])[avlMap[_k2]],"</a></TD>");
			    	}
			    	else
			    	{			
			    		fprintf (stdout, "<TD>",(theData[_avlKeys[_k]])[avlMap[_k2]], "</TD>");
					}	
				}	
					
			}
							 
			if (doPlainText == 0)
			{
				fprintf (stdout, "</TR>\n");
			}
		}	
		
	}
	if (doPlainText == 0)
	{
		fprintf (stdout, "</TABLE>\n");
	}
	return 0;
}

function toolTipCode (string, toolTip)
{
	return string^{{"TOOLTIP","<span class = 'INFO' onmouseover = \"Tip('"+toolTip+"')\">?</span>"}};
}
