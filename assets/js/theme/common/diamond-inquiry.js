import $ from 'jquery';
import noUiSlider from 'nouislider';

const color = 'D E F G H I J'.split(' ');
const clarity = 'FL IF VVS1 VVS2 VS1 VS2 SI1 SI2'.split(' ');
const cut = ['Excellent', 'Very Good', 'Good'];

const formatter = function createFormatter(map) {
    return {
        to(i) {
            return map[parseInt(i, 10)];
        },
        from(l) {
            return map.lastIndexOf(l);
        },
    };
};

function formatPrice(n = 0, c = 0, d = '.', t = ',') {
    const s = n < 0 ? '-' : '';
    const i = String(parseInt(Math.abs(Number(n)).toFixed(c), 10));
    const j = i.length > 3 ? i.length % 3 : 0;

    const price = s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${t}`) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');

    if (price === '30,000') {
        return '30,000+';
    }
    return price;
}

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
    return (n) => {
        if (n % l === 0) { return 1; } else if (n % m === 0) { return 2; }
        return 0;
    };
}

function doModulo(n, l, m) {
    if (n % l === 0) { return 1; } else if (n % m === 0) { return 2; }
    return 0;
}

// function filter(m) {
//     return function (n) {
//         return n % m ? 2 : 1;
//     };
// }

function autoSelect(evt) {
    evt.target.select();
}

const sheet = (() => {
    const style = document.createElement('style');
    // WebKit hack :(
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    return style.sheet;
})();

function pipClickWidth(id, l) {
    return `${id} .noUi-pips > .noUi-value {width: ${Number((100 / l).toFixed(2))}%;}`;
}

function setSliderVal(i, value) {
    const r = [null, null];
    r[i] = value;
    return r;
}

function clickLogic(sld, values, i) {
    const low = parseInt(values[0], 10);
    const high = parseInt(values[1], 10);
    const isCloserToLow = (Math.abs(low - i) - Math.abs(high - i - 1)) < 0;
    if (high === i + 1 || low > i) {
        sld.set([i, null]);
    } else if (low === i) {
        sld.set([null, i + 1]);
    } else if (isCloserToLow) {
        sld.set([i, null]);
    } else {
        sld.set([null, i + 1]);
    }
}

function keydownLogic(i, sld) {
    return (e) => {
        const v = Number(sld.get()[i]);
        const s = sld.steps()[i];
        let p;
        let wasArrow = true;
        switch (e.which) {
        // up
        case 38:
            p = s[1] * 5;
            break;
        // down
        case 40:
            p = -s[0] * 5;
            break;
        // left
        case 37:
            p = -s[0];
            break;
        // right
        case 39:
            p = s[1];
            break;
        // enter
        case 13:
            e.preventDefault();
            $(e.target).blur();
            return false;
        default:
            wasArrow = false;
        }
        if (p === false) {
            p = 1;
        }
        if (p !== null && p !== undefined) {
            sld.set(setSliderVal(i, v + p));
        }
        if (wasArrow) {
            e.preventDefault();
            autoSelect(e);
        }
    };
}

function rangeSlider(elId, arr) {
    const el = document.getElementById(elId);
    const slider = el.querySelector('.slider');
    const from = el.querySelector('.from');
    const to = el.querySelector('.to');
    const inputs = [from, to];
    const length = arr.length;

    noUiSlider.create(slider, {
        behaviour: 'none',
        start: [0, length],
        step: 1,
        margin: 1,
        connect: true,
        range: {
            min: 0,
            max: length,
        },
        pips: {
            mode: 'count',
            values: (arr.length * 2) + 1,
            density: -1,
            filter(i) {
                if (isInt(i)) { return 0; }
                return 1;
            },
            format: formatter(arr),
        },
    });

    sheet.insertRule(pipClickWidth(`#${elId}`, length));

    el.querySelector('.noUi-base').appendChild(el.querySelector('.noUi-pips'));

    const offset = {
        from(i, v) {
            if (i === 1) { return v + 1; }
            return v;
        },
        to(i, v) {
            if (i === 1) { return v - 1; }
            return v;
        },
    };

    slider.noUiSlider.on('update', (value, handle) => {
        const index = offset.to(handle, value[handle]);
        if (inputs[handle].selectedIndex === index) { return; }
        inputs[handle].selectedIndex = index;
    });

    inputs.forEach((input, i) => {
        // input.addEventListener('keydown', function (evt) {
        //     evt.preventDefault();
        //     return false;
        // });
        input.addEventListener('change', function () {
            const index = offset.from(i, this.selectedIndex);
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

    el.querySelectorAll('.noUi-value').forEach((val, i) => {
        val.addEventListener('click', () => {
            const values = slider.noUiSlider.get();

            clickLogic(slider.noUiSlider, values, i);
        });
    });

    return slider;
}

function standardSlider(elId, range, start, step, pips) {
    const el = document.getElementById(elId);
    const slider = el.querySelector('.slider');
    const from = el.querySelector('.from');
    const to = el.querySelector('.to');
    const inputs = [from, to];

    noUiSlider.create(slider, {
        start,
        connect: true,
        step,
        range,
        pips,
    });

    slider.noUiSlider.on('update', (values, handle) => {
        inputs[handle].value = pips.format.to(values[handle]);
    });

    inputs.forEach((input, i) => {
        input.addEventListener('click', autoSelect);
        input.addEventListener('change', function () {
            slider.noUiSlider.set(setSliderVal(i, pips.format.from(this.value)));
        });
        input.addEventListener('keydown', keydownLogic(i, slider.noUiSlider));
    });

    return slider;
}

const shapeSelector = (() => {
    function click() {
        const $this = $(this);
        const $shapeList = $('#shape-list');

        $this.toggleClass('active');

        const activeShapes = [];

        $('#shape-selector li').each((i, el) => {
            const $el = $(el);
            if ($el.hasClass('active')) { activeShapes.push($el.children('span').text().trim()); }
        });

        $shapeList.val(activeShapes);
    }

    return (el) => {
        $(el).on('click', 'li', click);
    };
})();

export default function () {
    shapeSelector('#shape-selector');
    const caratSlider = standardSlider(
        'caratSlider',
        {
            min: 75,
            // '20%': [100, 5],
            // '50%': [200, 25],
            '70%': [200, 25],
            max: 500,
        },
        [100, 125],
        5,
        {
            // mode: 'values',
            mode: 'steps',
            // values: [100, 200, 300, 400, 500],
            density: -1,
            // padding: 100,
            filter(n) {
                if (n > 200) {
                    return doModulo(n, 100, 100);
                }
                return doModulo(n, 50, 25);
            },
            format: {
                to(s) {
                    const str = (s / 100).toFixed(2); // + 'ct';
                    if (str === '5.00') {
                        $('#caratSlider .postfix-to').text('ct+');
                    } else {
                        $('#caratSlider .postfix-to').text('ct');
                    }
                    return str;
                },
                from(s) {
                    return s * 100;
                },
            },
        },
    );
    const colorSlider = rangeSlider('colorSlider', color);
    const claritySlider = rangeSlider('claritySlider', clarity);
    const cutSlider = rangeSlider('cutSlider', cut);
    const priceSlider = standardSlider(
        'priceSlider',
        {
            min: 2500,
            '40%': [10000, 1000],
            '75%': [20000, 2500],
            // '90%': [25000, 1000],
            max: 30000,
        },
        [5000, 10000],
        500,
        {
            mode: 'steps',
            density: -1,
            filter: modulo(5000),
            format: {
                to: formatPrice,
                from(s) {
                    return Number(s.replace(/[$,+]/g, ''));
                },
            },
        },
    );

    return {
        caratSlider,
        colorSlider,
        claritySlider,
        cutSlider,
        priceSlider,
    };
}
