import PageManager from './page-manager';
import nod from './common/nod';
import forms from './common/models/forms';
import initializeSliders from './common/diamond-inquiry';

function dummy() {}

export default class ContactUs extends PageManager {
    ifDiamondInquiry(cb = dummy) {
        if ($('#contact_rma').length > 0) {
            cb();
            return true;
        }
        return false;
    }

    onReady() {
        this.registerContactFormValidation();
        this.ifDiamondInquiry(initializeSliders);
    }

    serializeSliderData() {
        const caratFrom = $('#caratSlider .from').val();
        const caratTo = $('#caratSlider .to').val();
        const colorFrom = $('#colorSlider .from').val();
        const colorTo = $('#colorSlider .to').val();
        const clarityFrom = $('#claritySlider .from').val();
        const clarityTo = $('#claritySlider .to').val();
        const cutFrom = $('#cutSlider .from').val();
        const cutTo = $('#cutSlider .to').val();
        const priceFrom = $('#priceSlider .from').val();
        const priceTo = $('#priceSlider .to').val();
        const shapes = $('#shape-list').val().join(', ');

        let data = `Shape: ${shapes}\n`;
        data += `Size: ${caratFrom}-${caratTo}\n`;
        data += `Color: ${colorFrom}-${colorTo}\n`;
        data += `Clairty: ${clarityFrom}-${clarityTo}\n`;
        data += `Cut: ${cutFrom}-${cutTo}\n`;
        data += `Budget: ${priceFrom}-${priceTo}`;

        const textBox = $('form[data-contact-form] textarea[name="contact_question"]');

        textBox.val(`${textBox.val()}\n\n\n\n${data}`);
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
                this.ifDiamondInquiry(this.serializeSliderData);
                return;
            }

            event.preventDefault();
        });
    }
}
