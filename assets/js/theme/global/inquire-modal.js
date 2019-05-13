import $ from 'jquery';
import modalFactory from './modal';
import utils from '@bigcommerce/stencil-utils';
import { safeActivateRecaptcha } from './recaptcha-helpers';

let init = false;

export default function initializeInquireForm() {
    if (init) return;
    $('body').on('click', '#inquireButton', (event) => {
        event.preventDefault();
        const modal = modalFactory('#inquireModal')[0];
        modal.open({ size: 'large' });

        utils.api.getPage('/product-inquiry', {
            template: 'page/product-inquiry-form',
        }, (err, response) => {
            modal.updateContent(response);
            safeActivateRecaptcha(document.querySelector('.g-recaptcha'));
            const $productIdField = $('#contact_orderno');
            const $productTitle = $('.productView-title');
            $productIdField.attr('value', $productTitle.last().text());
        });
    });
    init = true;
}
