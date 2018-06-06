import $ from 'jquery';
import noUiSlider from './common/nouislider.js';

var color = 'D E F G H I J'.split(' ');
var clarity = 'FL IF VVS1 VVS2 VS1 VS2 SI1 SI2'.split(' ');
var cut = ['Ideal', 'Excellent', 'Very Good', 'Good'];

var formatter =  function (map) {
  return {
    to: function(i) {
      return map[parseInt(i, 10)];
    },
    from: function(l) {
      return map.lastIndexOf(l);
    }
  };
}

function formatPrice(n, c, d, t){
  var c = isNaN(c = Math.abs(c)) ? 0 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  var price = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  if (price === '30,000')
    return '30,000+'
  else
    return price;
 };

// function isEven(n) {
//    return n % 2 == 0;
// }

// function isOdd(n) {
//    return !isEven(n);
// }

function isInt(n) {
  return n === parseInt(n, 10);
}

function modulo(l, m) {
  return function(n) {
    if (n % l === 0)
      return 1;
    else if (n % m === 0)
      return 2
    else
      return 0
  }
}

function doModulo(n, l, m) {
  if (n % l === 0)
    return 1;
  else if (n % m === 0)
    return 2
  else
    return 0
}

function filter(m) {
  return function (n) {
    return n % m ? 2 : 1;
  }
}

function autoSelect(evt) {
  evt.target.select();
}

var sheet = (function() {
  var style = document.createElement('style');
  // WebKit hack :(
  style.appendChild(document.createTextNode(""));
  document.head.appendChild(style);
  return style.sheet;
})();

function pipClickWidth(id, l) {
  return id + ' .noUi-pips > .noUi-value {width: ' + Number((100/l).toFixed(2)) + '%;}';
}

function setSliderVal(i, value) {
  var r = [null,null];
  r[i] = value;
  return r;
}

function clickLogic(sld, values, i) {
  var low = parseInt(values[0], 10);
  var high = parseInt(values[1], 10);
  var isCloserToLow = (Math.abs(low - i) - Math.abs(high - i - 1)) < 0;
  if (high === i + 1 || low > i) {
    sld.set([i, null]);
  }
  else if (low === i) {
    sld.set([null, i + 1]);
  }
  else if (isCloserToLow) {
    sld.set([i, null]);
  }
  else {
    sld.set([null, i + 1]);
  }
}

function keydownLogic(i, sld) {
  return function (e) {
    var v = Number(sld.get()[i]);
    var s = sld.steps()[i];
    var p;
    switch (e.which) {
      // up
      case 38:
        p = s[1];
        break;
      // down
      case 40:
        p = -s[0];
        break;
      // left
      case 37:
        p = -s[0] * 5
        break;
      // right
      case 39:
        p = s[0] * 5
        break;
    }
    if (p === false) {
      p = 1;
    }
    if (p !== null && p !== undefined) {
      sld.set(setSliderVal(v + p));
    }
  }
}

function rangeSlider(elId, arr) {
  var el = document.getElementById(elId)
  var slider = el.querySelector('.slider');
  var from = el.querySelector('.from');
  var to = el.querySelector('.to');
  var inputs = [from, to];
  var length = arr.length;

  noUiSlider.create(slider, {
    behaviour: 'none',
    start: [0, length],
    step: 1,
    margin: 1,
    connect: true,
    range: {
      'min': 0,
      'max': length
    },
    pips: {
      mode: 'count',
      values: (arr.length * 2) + 1,
      density: -1,
      filter: function(i) {
        if(isInt(i))
          return 0;
        else
          return 1;
      },
      format: formatter(arr)
    }
  });

  sheet.insertRule(pipClickWidth('#' + elId, length));

  el.querySelector('.noUi-base').appendChild(el.querySelector('.noUi-pips'));

  var offset = {
    from: function (i, v) {
      if (i === 1)
        return v + 1;
      else
        return v;
    },
    to: function (i, v) {
      if (i === 1)
        return v - 1;
      else
        return v;
    }
  }

  slider.noUiSlider.on('update', function( value, handle ) {
    var index = offset.to(handle, value[handle]);
    if (inputs[handle].selectedIndex === index)
      return;
    inputs[handle].selectedIndex = index;
  });

  inputs.forEach(function (input, i) {
    input.addEventListener('change', function() {
      var index = offset.from(i, this.selectedIndex);
      // var values = slider.noUiSlider.get();
      // // values[1] = offset.from(1, values[1]);
      // if (i === 0 && values[1] < index) {
      //   slider.noUiSlider.set([values[1], null]);
      //   return;
      // }
      // if (values[i] === index);
      //   return;
      slider.noUiSlider.set(setSliderVal(i, index));
    });
  });

//   from.addEventListener('change', function(e) {
//     slider.noUiSlider.set([e.target.selectedIndex, null]);
//   })

//   to.addEventListener('change', function(e) {
//     slider.noUiSlider.set([null, e.target.selectedIndex + 1]);
//   })

  el.querySelectorAll('.noUi-value').forEach(function (el, i) {
    el.addEventListener('click', function (e) {
      var values = slider.noUiSlider.get();

      clickLogic(slider.noUiSlider, values, i);
    });
  });

  return slider;
}

function standardSlider(elId, range, start, step, pips) {
  var el = document.getElementById(elId)
  var slider = el.querySelector('.slider');
  var from = el.querySelector('.from');
  var to = el.querySelector('.to');
  var inputs = [from, to];

  noUiSlider.create(slider, {
    start: start,
    connect: true,
    step: step,
    range: range,
    pips: pips
  });

  slider.noUiSlider.on('update', function( values, handle ) {
    inputs[handle].value = pips.format.to(values[handle]);
  });

  inputs.forEach(function (input, i) {
    input.addEventListener('click', autoSelect);
    input.addEventListener('change', function() {
      slider.noUiSlider.set(setSliderVal(i, pips.format.from(this.value)));
    });
    input.addEventListener('keydown', keydownLogic(i, slider.noUiSlider));
  })

  return slider;
}

var ShapeSelector = (function() {

  function click() {
    var $this = $(this),
        $shapeList = $('#shape-list');

    $this.toggleClass('active');

    var activeShapes = [];

    $('#shape-selector li').each(function (i, el) {
      var $el = $(el);
      if ($el.hasClass('active'))
        activeShapes.push($el.children('span').text().trim());
    })

    $shapeList.val(activeShapes);
  }

  function ShapeSelector(el) {
    $(el).on('click', 'li', click);
  }

  return ShapeSelector;
}());

export default function () {
  ShapeSelector('#shape-selector');
  var caratSlider = standardSlider( 'caratSlider',
                                    {
                                      'min': 75,
                                      // '20%': [100, 5],
                                      // '50%': [200, 25],
                                      '70%': [200, 25],
                                      'max': 500
                                    },
                                    [100, 125],
                                    5,
                                    {
                                      // mode: 'values',
                                      mode: 'steps',
                                      // values: [100, 200, 300, 400, 500],
                                      density: -1,
                                      // padding: 100,
                                      filter: function (n) {
                                        if (n > 200) {
                                          return doModulo(n, 100, 100);
                                        } else {
                                          return doModulo(n, 50, 25);
                                        }
                                      },
                                      format: {
                                        to: function (s) {
                                          var str = (s / 100).toFixed(2); // + 'ct';
                                          if (str === '5.00') {
                                            $('#caratSlider .postfix-to').text('ct+');
                                          } else {
                                            $('#caratSlider .postfix-to').text('ct');
                                          }
                                          return str;
                                        },
                                        from: function (s) {
                                          return s * 100;
                                        }
                                      }
                                    }
                                  )
  var colorSlider = rangeSlider('colorSlider', color);
  var claritySlider = rangeSlider('claritySlider', clarity);
  var cutSlider = rangeSlider('cutSlider', cut);
  var priceSlider = standardSlider( 'priceSlider',
                                    {
                                      'min': 2500,
                                      '40%': [10000, 1000],
                                      '75%': [20000, 2500],
                                      // '90%': [25000, 1000],
                                      'max': 30000
                                    },
                                    [5000, 10000],
                                    500,
                                    {
                                      mode: 'steps',
                                      density: -1,
                                      filter: modulo(5000),
                                      format: {
                                        to: formatPrice,
                                        from: function (s) {
                                          return Number(s.replace(/[$,+]/g, ''));
                                        }
                                      }
                                  });
}
