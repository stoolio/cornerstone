import PageManager from './page-manager';
import nod from './common/nod';
import $ from 'jquery';
import forms from './common/models/forms';
import initializeSliders from './common/diamond-inquiry';

function dummy() {};

export default class ContactUs extends PageManager {
    onReady() {
        this.registerContactFormValidation();
        ifDiamondInquiry(initializeSliders);
    }

    ifDiamondInquiry(cb = dummy) {
      if ($('#contact_rma').length > 0) {
        cb();
        return true;
      }
      return false;
    }

    serializeSliderData() {
        var caratFrom = $('#caratSlider .from').val(),
            caratTo = $('#caratSlider .to').val(),
            colorFrom = $('#colorSlider .from').val(),
            colorTo = $('#colorSlider .to').val(),
            clarityFrom = $('#claritySlider .from').val(),
            clarityTo = $('#claritySlider .to').val(),
            cutFrom = $('#cutSlider .from').val(),
            cutTo = $('#cutSlider .to').val(),
            priceFrom = $('#priceSlider .from').val(),
            priceTo = $('#priceSlider .to').val(),
            shapes = $('#shape-list').val().join(', ');

        var data = `Shape: ${shapes}\n`;
        data += `Size: ${caratFrom}-${caratTo}\n`;
        data += `Color: ${colorFrom}-${colorTo}\n`;
        data += `Clairty: ${clarityFrom}-${clarityTo}\n`;
        data += `Cut: ${cutFrom}-${cutTo}\n`;
        data += `Budget: ${priceFrom}-${priceTo}`;

        $('form[data-contact-form] textarea[name="contact_question"]').val($('form[data-contact-form] textarea[name="contact_question"]').val() + `\n\n ${data}`);
    }

    registerContactFormValidation() {
        const formSelector = 'form[data-contact-form]';
        const contactUsValidator = nod({
            submit: `${formSelector} input[type="submit"]`,
        });
        const $contactForm = $(formSelector);

        contactUsValidator.add([
            {
                selector: `${formSelector} input[name="contact_email"]`,
                validate: (cb, val) => {
                    const result = forms.email(val);

                    cb(result);
                },
                errorMessage: this.context.contactEmail,
            },
            {
                selector: `${formSelector} textarea[name="contact_question"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.contactQuestion,
            },
        ]);

        $contactForm.on('submit', event => {
            contactUsValidator.performCheck();

            if (contactUsValidator.areAll('valid')) {
                ifDiamondInquiry(serializeSliderData);
                return;
            }

            event.preventDefault();
        });
    }
}
