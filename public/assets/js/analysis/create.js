$(document).ready(function(){
  setBF();
});

function populateForm () {
  SetMethodByValue(0);
  setBF();
  document.getElementById('all_enclosure').style.visibility = 'visible';
}

function toggleBox(szDivID, iState) {
  // 1 visible, 0 hidden
  try {
    var ele = document.getElementById(szDivID);
    if(iState == 0) {
      ele.style.display = "none";
    } else {
    ele.style.display = "block";
    }
  }
  catch (err) {
  }
}

function toggleElement(szDivID, iState) {
  // 1 visible, 0 hidden
  try {
    var ele = document.getElementById(szDivID);
    if(iState == 0) {
      ele.style.display = "none";
    } else {
      ele.style.display = "inline";
    }

    }  catch (err)  {

  }
}

function SetNamedModel() {
  SetModel(modelForm.NamedModels.options[modelForm.NamedModels.selectedIndex].value);
}

function SetMethodByValue(v) {
  for (k=0; k<modelForm.method.options.length;k++) {
    if (modelForm.method.options[k].value == v) {
      modelForm.method.selectedIndex = k;
      break;
    }
  }
}

function SetModel(modelString) {
  if (modelString.length == 6) {
    document.getElementById('AC').selectedIndex = parseInt(modelString.charAt(0));
    document.getElementById('AT').selectedIndex = parseInt(modelString.charAt(2));
    document.getElementById('CG').selectedIndex = parseInt(modelString.charAt(3));
    document.getElementById('CT').selectedIndex = parseInt(modelString.charAt(4));
    document.getElementById('GT').selectedIndex = parseInt(modelString.charAt(5));
  }
}

function setBF() {
  checkValue = parseFloat (modelForm.pValue.value);
  selMethodV = modelForm.method.options[modelForm.method.selectedIndex].value;
  toggleBox ("rOptionsDIV", selMethodV==0 || selMethodV==6);
  toggleBox ("ambChoice", selMethodV==0 || selMethodV==6 || selMethodV==69);
  toggleBox ("sigLevel", selMethodV < 5 || selMethodV == 69 || selMethodV == 12 || selMethodV == 13);
  toggleBox ("rvoptions1", selMethodV >=20  && selMethodV != 55 && selMethodV != 42 && selMethodV != 69 && selMethodV != 71);
  toggleBox ("rvoptionsNoConstant", selMethodV == 60 );
  toggleBox ("rootOn", selMethodV == 22);
  toggleBox ("treeMode", selMethodV != 20 && selMethodV != 21);
  toggleElement ("treeModeChoice2", selMethodV != 5 && selMethodV != 6 && selMethodV != 9);
  toggleElement ("treeModeChoice3", selMethodV != 5 && selMethodV != 6 && selMethodV != 9);
  toggleBox ("run_model_selector", selMethodV != 71 && selMethodV != 13);
  toggleBox ("property_set", selMethodV == 71);
  toggleBox ("modelmatrix", !(selMethodV == 9 || selMethodV == 13 || selMethodV == 71));

  if (selMethodV == 3) {
    if (checkValue < 1.0) {
      modelForm.pValue.value = 50;
    }
  } else {
    if (selMethodV < 3 || selMethodV == 4) {
      if (checkValue >= 0.5) {
        modelForm.pValue.value = 0.1;   
      }
    } else {
      if (selMethodV == 6) {
        if (checkValue >= 1.0 || checkValue < 0.5)
          modelForm.pValue.value = 0.5;   
      } else {
        if (selMethodV == 13) {
          if (checkValue >= 1.0 || checkValue < 0.5) {
              modelForm.pValue.value = 0.9;   
          }
        }       
      }
    }
  }
}

function flagOddValues() {
  checkValue = parseFloat (modelForm.pValue.value);
  selMethodV = modelForm.method.options[modelForm.method.selectedIndex].value;
  
  if (selMethodV<5 && selMethodV != 3 || selMethodV == 12) {
    if (checkValue > 0.25) {
      alert ("Warning: p-values for SLAC, FEL, IFEL, MEME and PARRIS should be small (e.g. p<=0.25), since they measure the probability of observing large (or small) dN/dS in random neutral data.");
    }
  } else {
    if (selMethodV == 3) {
      if (checkValue < 10 && modelForm.method.selectedIndex<5) {
        alert ("Warning: Bayes Factors for the REL test should be large (>=10), since they measure the effect of the data on our prior beliefs.");
      }
    } else {
      if (checkValue < 0.5 || checkValue > 1.0) {
        alert ("Warning: Posterior probability for Spidermonkey/BGM/FUBAR analyses must be between 0 and 1 and generally be greater than 0.5");
      }
    }
  }
}

function CheckValidDnDS() {

  checkValue = parseFloat (modelForm.pValue.value);
  selMethodV = modelForm.method.options[modelForm.method.selectedIndex].value;

  if (selMethodV<3 || selMethodV==4) {
    if ((checkValue <= 0.0)||(checkValue>=1.0)) {
      alert ("User supplied p-value must be in (0,1).");
      return false;
    }
  } else {
    if (selMethodV == 3) { 
      if (checkValue <= 1.0) {
        alert ("User supplied Bayes Factor must be > 1.");
        return false; 
      }
    } else {
      if (selMethodV == 6 || selMethod == 13) { 
        if ((checkValue <= 0.0)||(checkValue>=1.0)) {
          alert ("User supplied posterior probability must be in (0,1).");
          return false;
        }
      }
    }   
  }
  if (modelForm.rOptions.selectedIndex==1) {
    checkValue = parseFloat (modelForm.dNdS.value);
    if (checkValue <= 0.0) {
      alert ("User supplied dN/dS value must be positive");
      return false;
    }
  } else {
    modelForm.dNdS.value = "1.0";
  }

  var subs =["AT","CG","CT","GT"];
  modelSpec = document.getElementById('AC').options[document.getElementById('AC').selectedIndex].value+"1";

  for (k = 0; k < 4; k++) {
    modelSpec += document.getElementById(subs[k]).options[document.getElementById(subs[k]).selectedIndex].value;
  }

  modelForm.modelString.value = modelSpec;
  return true;

}
