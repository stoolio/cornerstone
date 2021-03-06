let recaptchaIncluded = false;

function forceIncludeRecaptcha() {
    const recaptchaExist = Array.prototype.slice.call(document.querySelectorAll('script')).some((s) => {
        if (s.src.includes('recaptcha/api.js')) return true;
        return false;
    });
    if (!recaptchaExist) {
        const recaptchaEl = document.createElement('script');
        recaptchaEl.type = 'text/javascript';
        recaptchaEl.async = true;
        recaptchaEl.src = 'https://www.google.com/recaptcha/api.js';
        document.head.appendChild(recaptchaEl);
    }
    recaptchaIncluded = true;
}

function safeActivateRecaptcha(el) {
    if (window.grecaptcha !== undefined) {
        window.grecaptcha.render(el);
    } else {
        if (!recaptchaIncluded) forceIncludeRecaptcha();
        window.setTimeout(() => {
            safeActivateRecaptcha(el);
        }, 200);
    }
}

export {
    forceIncludeRecaptcha,
    safeActivateRecaptcha,
};
