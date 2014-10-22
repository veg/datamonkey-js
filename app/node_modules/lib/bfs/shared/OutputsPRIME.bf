PRIME_ResultTable = {};
PRIME_ResultTable ["Codon"]         = "INTEGER"; 
PRIME_ResultTable ["Attribute"]     = "TEXT"; 
PRIME_ResultTable ["Value"]    	    = "REAL"; 

//---------------------------------------------------------------------------------

function count_properties (dbid, prop_count, sel_type, pv) {
    if (sel_type == "Conserved") {
        sign = ">";
    } else {
        sign = "<";
    }
    queries = {prop_count,1};
    for (_c = 0; _c< prop_count; _c += 1) {
        queries [_c] = "select DISTINCT (CODON) from PRIME_RESULTS WHERE (ATTRIBUTE LIKE '%test property "+(_c+1) + "%' AND VALUE < " + pv +" AND CODON IN (select DISTINCT (CODON) from PRIME_RESULTS WHERE (ATTRIBUTE LIKE 'alpha_" + (_c) + "' AND VALUE `sign` 0.00)))";
    }
    return Abs(_ExecuteSQL  (dbid,Join (" UNION ", queries)));
}   

//---------------------------------------------------------------------------------

function get_csv_table (dbid, prop_count) {
    mapper = {2*(1+prop_count), 2};
    
    mapper[0][0] = "_felScaler";
    mapper[0][1] = "syn_rate";
    
    for (_p = 0; _p < prop_count; _p+=1) {
        mapper[2*_p+1][0] = "alpha_" + _p;
        mapper[2*_p+1][1] = "Property_"+(1+_p)+"_weight";
        mapper[2*_p+2][0] = "Corrected p-value for Test property "+(1+_p);
        mapper[2*_p+2][1] = "Property_"+(1+_p)+"_pvalue";
    }
    mapper[2*_p+1][0] = "LogL";
    mapper[2*_p+1][1] = "LogL";
    
    fprintf (stdout, "Codon");
    for (_p = 0; _p < Rows(mapper); _p+=1) {
        fprintf (stdout, ",",mapper[_p][1]);        
    }
    
    
    for (_r = 0; _r < Rows (mapper); _r+=1) {
        values = _ExecuteSQL  (dbid,"SELECT VALUE FROM PRIME_RESULTS WHERE ATTRIBUTE = '" + mapper[_r][0] + "' ORDER BY CODON;");
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
