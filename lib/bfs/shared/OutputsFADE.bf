FADE_ResultTable = {};
FADE_ResultTable ["Site"]      = "INTEGER"; 
FADE_ResultTable ["Attribute"]     = "TEXT"; 
FADE_ResultTable ["Value"]    	   = "REAL"; 

//---------------------------------------------------------------------------------

function count_properties (dbid, prop_count, sel_type, pv) {
    return Abs(_ExecuteSQL  (dbid,"select DISTINCT (SITE) from FADE_RESULTS WHERE (ATTRIBUTE LIKE '%" + sel_type + "%' AND VALUE >= " + pv + ")"));
}   

//---------------------------------------------------------------------------------

function get_csv_table (dbid, residue) {
    
    all_attributes = _ExecuteSQL  (dbid,"SELECT DISTINCT (ATTRIBUTE) from FADE_RESULTS WHERE ATTRIBUTE LIKE '`residue`%'");
    prop_count = Abs ( all_attributes);
     
    mapper = {prop_count, 2};
    
    for (_p = 0; _p < prop_count; _p+=1) {
        mapper[_p][0] = all_attributes[_p];
        mapper[_p][1] = (all_attributes[_p])[2][Abs (all_attributes[_p])];
    }
 
    fprintf (stdout, "Site");
    for (_p = 0; _p < Rows(mapper); _p+=1) {
        fprintf (stdout, ",",mapper[_p][1]);        
    }
    
    
    for (_r = 0; _r < Rows (mapper); _r+=1) {
        values = _ExecuteSQL  (dbid,"SELECT VALUE FROM FADE_RESULTS WHERE ATTRIBUTE = '" + mapper[_r][0] + "' ORDER BY SITE;");
        if (_r == 0) {
            _codon_count = Abs (values);
            _numeric_values = {_codon_count, Rows (mapper)+1}["_MATRIX_ELEMENT_ROW_+1"];
        }
        for (_c = 0; _c < _codon_count; _c+=1) {
            _numeric_values [_c][_r+1] = 0 + (values[_c]);
        }
    }

    for (_c = 0; _c < _codon_count; _c+=1) {
        fprintf (stdout, "\n", Join (",", _numeric_values[_c][-1]));
    }
    
    return 0;
}   
