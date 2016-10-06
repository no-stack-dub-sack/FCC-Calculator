$(document).ready(function() {
   var answer, 
      lastClicked,
      $formula = $('#formula'),
      $output = $('#output'),
      $output_formula = $('#output, #formula'),
      $formulaError = $('#formulaError'),
      $endsWithOperator = new RegExp(/(\‑)$|(\+)$|(\/)$|(⋅)$/);

  // EQUALS BUTTON:
  $('#equals').click(function() {
    if ($formula.html().lastIndexOf('.') == $formula.html().length - 1 ||
      lastClicked === undefined) { // PREVENT EVALUATE
    } else {
      closeParentheses($formula.html());
      var expression = $formula.html().replace(/‑/g, "-").replace(/⋅/g, "*");
      answer = Math.round(1000000000000 * eval(expression)) / 1000000000000;
      appendReplace('=' + answer, answer);
      lastClicked = 'evaluated';
    }
  });

  // OPERATOR FUNCTIONS:
  $('.operator').click(function() {
    clearFormulaError();
    if (lastClicked === undefined ||
      operatorShouldBePrevented($formula.text(), $output.text())) {} // LOCK
    else if ($endsWithOperator.test($formula.text())) {
      $formula.html($formula.text().replace($endsWithOperator, switchOperator($(this))));
      $output.html($(this).text());
    } else {
      closeParentheses($formula.text());
      if (answer !== undefined) operateOnAnswerAndWrapNegatives();
      if ($(this).attr('id') == 'add') appendReplace('+', '+');
      if ($(this).attr('id') == 'subtract') appendReplace('‑', '—');
      if ($(this).attr('id') == 'multiply') appendReplace('⋅', 'x');
      if ($(this).attr('id') == 'divide') appendReplace('/', '/');
    }
    lastClicked = 'operations';
  });

  function operatorShouldBePrevented(str1, str2) {
    return str1 === '' ||
      str1.lastIndexOf('.') == str1.length - 1 ||
      str1.lastIndexOf('(-') == str1.length - 1 ||
      str2.indexOf('Met') != -1;
  }

  function operateOnAnswerAndWrapNegatives() {
    if ($output.text().indexOf('-') != -1) $formula.html('(' + $output.text() + ')');
    else $formula.html($output.text());
    answer = undefined;
  }

  function switchOperator(e) {
    if (e.attr('id') == 'multiply') return '⋅';
    else if (e.attr('id') == 'subtract') return '‑';
    else return e.text();
  }

  // TOGGLE POSITIVE/NEGATIVE FUNCTIONS:
  $('#negative').click(function() {
    clearFormulaError();
    var formulaStr = $formula.text();
    var outputStr = $output.text();
    var lastOpenParentheses = formulaStr.lastIndexOf('(-');
    if (formulaStr !== '' &&
      formulaStr.lastIndexOf(')') == formulaStr.length - 1) { // LOCK 
    } else if (lastClicked == 'evaluated') { // TOGGLE SIGN OF ANSWER
      if (outputStr.indexOf('-') != -1) {
        $output_formula.html(outputStr.slice(outputStr.indexOf('-') + 1));
        lastClicked = 'positive';
      } else if (outputStr.indexOf('-') == -1) {
        $formula.html('(-' + outputStr), $output.html('-' + outputStr);
        lastClicked = 'negative';
      }
    } else if (lastClicked == 'negative') {
      toggleToPositive(formulaStr, lastOpenParentheses, outputStr);
    } else if (lastClicked == 'operations') {
      if (lastOpenParentheses > formulaStr.lastIndexOf(')')) {
        toggleToPositive(formulaStr, lastOpenParentheses, outputStr);
      } else appendReplace('(-', '-');
      lastClicked = 'negative';
    } else if (lastClicked == 'number' || lastClicked == 'point') {
      if (lastOpenParentheses > formulaStr.lastIndexOf(')')) {
        toggleToPositive(formulaStr, lastOpenParentheses, outputStr);
      } else toggleToNegative(formulaStr, outputStr);
    } else if (lastClicked == 'backspace') {
      if ($formula.text().indexOf('e') != -1 ||
        /(\‑)|(\+)|(\/)|(⋅)/.test(formulaStr) === false) {
        $formula.html('(-' + formulaStr);
        $output.html('-' + formulaStr);
      } else {
        var sliceAt = lastIndexOfOperator(formulaStr) + 1;
        $formula.html(formulaStr.replace(new RegExp(formulaStr.slice(sliceAt) + '$'),
          '(-' + formulaStr.slice(sliceAt)));
        $output.html('-' + formulaStr.slice(sliceAt));
      }
      lastClicked = 'negative';
    } else if (lastClicked == 'positive') {
      toggleToNegative(formulaStr, outputStr);
    } else {
      appendReplace('(-', '-');
      lastClicked = 'negative';
    }
  });

  function toggleToPositive(str1, str2, str3) {
    if (str3 == '-') {
      $formula.html(str1.substring(0, str2) + str1.substring(str2 + 2));
      $output.html(' 0');
      lastClicked = undefined;
    } else {
      $formula.html(str1.substring(0, str2) + str1.substring(str2 + 2));
      $output.html(str3.slice(str3.indexOf('-') + 1));
      lastClicked = 'positive';
    }
  }

  function toggleToNegative(str1, str2) {
    var escaper = str2.replace(/\+/, '\\+');
    str1 = str1.replace(new RegExp(escaper + '$'),
      '(-' + escaper).replace(/\\/, '');
    $formula.html(str1), $output.html('-' + str2);
    lastClicked = 'negative';
  }

  // # BUTTONS:
  $('.digit:not(#zero)').click(function() {
    var formulaStr = $formula.text();
    clearFormulaError();
    if (lastClicked == 'evaluated') {
      $output_formula.html($(this).text());
      lastClicked = 'number';
    } else if (lockNumbersAndDecimals()) { // LOCK 
    } else if (lastClicked == 'backspace' &&
      $endsWithOperator.test(formulaStr) === false) {
      var sliceAt = lastIndexOfOperator(formulaStr); // SEE COMMENT 1
      appendReplace($(this).text(), formulaStr.slice(sliceAt + 1) + $(this).text());
      lastClicked = 'number';
    } else if (lastClicked == 'negative' || lastClicked == 'point') {
      $output_formula.append($(this).text());
      lastClicked == 'point' ? lastClicked = 'number' : lastClicked = 'negative';
    } else {
      /(\s0)|x|\+|—|\//.test($output.text()) ? $output.html('') : $output.html();
      $output_formula.append($(this).text());
      lastClicked = 'number';
    }
  });

  $('#zero').click(function() {
    clearFormulaError();
    if (lastClicked == 'evaluated') {
      initializeCalc();
    } else if (/(\s0)$|-$|x|\+|—|\//.test($output.text()) ||
      lockNumbersAndDecimals()) { // PREVENTS UNWANTED ZEROS
    } else {
      $output_formula.append('0');
      lastClicked = 'number';
    }
  });

  // DECIMAL POINT:
  $('#point').click(function() {
    var formulaStr = $formula.text();
    if (lastClicked == 'evaluated' || lockNumbersAndDecimals()) { // LOCK 
    } else if (formulaStr.slice(lastIndexOfOperator(formulaStr) + 1).indexOf('.') != -1 ||
      lastClicked == 'backspace' && /(\d+)$/.test(formulaStr)) {
      lastClicked = 'backspace';
    } else {
      if (lastClicked == 'negative' && $output.text() == '-' ||
        lastClicked == 'operations' && $output.text() == '-') {
        $output_formula.append('0.');
      } else if (lastClicked == 'negative' && /(\d+)$/.test(formulaStr)) {
        $output_formula.append('.');
      } else if (lastClicked == 'operations' || lastClicked == 'negative' ||
        $output.html() == ' 0') {
        appendReplace('0.', '0.');
      } else {
        $output_formula.append('.');
      }
      lastClicked = 'point';
    }
  });

  // LOCK FUNCTION
  function lockNumbersAndDecimals() {
    if (lastClicked != 'evaluated') {
      return $output.text().length > 20 ||
        $formula.text().length > 64 ||
        $output.text().indexOf('Met') != -1 ||
        $formula.text() !== '' &&
        $formula.text().lastIndexOf(')') == $formula.text().length - 1;
    }
  }

  // MAX FORMULA ERROR
  $('.button:not(#AC, #backspace, #negative)').click(function() {
    if ($formula.text().length > 64) {
      console.log('wpr')
      if (lastClicked == 'evaluated') {
        $formula.css('top', '-1px');
        $formulaError.show(), $formula.hide();
      } else {
        $formulaError.show(), $formula.hide();
        setTimeout(function() {
          $formulaError.hide(), $formula.show();
        }, 1100);
      }
    } else if ($formula.text().length > 35) {
      $formula.animate({
        'top': '-17px'
      });
    } else {
      $formula.css('top', '-1px');
    } 
  });

  function clearFormulaError() {
    if ($formulaError.css('display') != 'none') {
      $formula.css('top', '-1px');
      $formulaError.hide(), $formula.show();
    }
  }

  // MAX DIGIT ERROR
  $('.digit, #point').click(function() {
    var outputHistory = $output.text();
    if ($output.text().length > 20) {
      $output.html('Digit Limit Met');
      setTimeout(function() {
        $output.html(outputHistory);
      }, 1100);
    }
  });

  // CLEAR CURRENT ENTRY BUTTON:
  $('#backspace').click(function() {
    var thisWith = new RegExp(/[⋅+‑\/]$|\d+\.?\d*$|(\(-\d+\.?\d*\)?)$|(\(-)$/);
    clearFormulaError();
    if ($formula.html().indexOf('=') != -1) {
      initializeCalc();
    } else {
      $formula.html($formula.html().replace(thisWith, ''));
      $output.html(' 0');
    }
    lastClicked = "backspace";
  });

  // ALL CLEAR BUTTON:
  $('#AC').click(initializeCalc);

  // INIT CALC:
  function initializeCalc() {
    clearFormulaError();
    $output.html(' 0'); $formula.html('');
    lastClicked = undefined;
    answer = undefined;
  }

  // CLOSE PARENTHESES:
  function closeParentheses(str) {
    if (str.lastIndexOf('(') > str.lastIndexOf(')')) {
      $formula.append(')');
    }
  }

  // MAIN APPEND/REPLACE FUNCTION:
  function appendReplace(str1, str2) {
    $formula.append(str1), $output.html(str2);
  }

  // FIND LAST INDEX OF OPERATOR:
  function lastIndexOfOperator(str) {
    return [str.lastIndexOf('‑'), str.lastIndexOf('+'),
      str.lastIndexOf('/'), str.lastIndexOf('⋅')
    ].sort(function(a, b) {
      return a < b;
    })[0];
  }

}); // end docuemnt ready


/*

Comment 1:

allows for user to add to number after using backspace button, and number to be displayed correctly in main output.

e.g. 5+5+ then backspace: formula bar will read 5+5, output 0, if user then hits 4, output will read 54, formula will read 5+54. Without this function, output would only read 4, while formula would read 5+54. 

*/