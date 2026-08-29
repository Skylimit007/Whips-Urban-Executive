/* Whips Urban Executive - reliable AJAX form handler */
(function () {
  'use strict';

  function initFormHandler() {
    var forms = document.querySelectorAll('form.ajax-email-form');

    forms.forEach(function (form) {
      // Prevent duplicate listeners if the script is loaded more than once.
      if (form.dataset.emailHandlerAttached === 'true') return;
      form.dataset.emailHandlerAttached = 'true';

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        var button = form.querySelector('button[type="submit"]') || form.querySelector('button');
        var status = form.querySelector('.form-status');
        var originalText = button ? button.textContent : '';

        if (status) {
          status.className = 'form-status mt-3';
          status.textContent = 'Sending...';
        }
        if (button) {
          button.disabled = true;
          button.textContent = 'Sending...';
        }

        var data = {};
        new FormData(form).forEach(function (value, key) {
          data[key] = value;
        });

        // Give FormSubmit the exact page URL. This is especially useful while testing locally.
        if (!data._url) data._url = window.location.href;

        console.log('[Whips Urban Executive] Sending form to FormSubmit:', data);

        try {
          var response = await fetch(form.action, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data)
          });

          var text = await response.text();
          var result;
          try {
            result = JSON.parse(text);
          } catch (e) {
            result = { success: false, message: text || 'Unexpected response from FormSubmit.' };
          }

          console.log('[Whips Urban Executive] FormSubmit HTTP status:', response.status);
          console.log('[Whips Urban Executive] FormSubmit response:', result);

          if (!response.ok || result.success === false) {
            throw new Error(result.message || 'FormSubmit rejected the submission.');
          }

          if (status) {
            status.className = 'form-status mt-3 text-success';
            status.innerHTML = '<strong>Thank you!</strong> Your request has been sent successfully. We will get back to you shortly.';
          }
          form.reset();
        } catch (error) {
          console.error('[Whips Urban Executive] Form submission failed:', error);
          if (status) {
            status.className = 'form-status mt-3 text-danger';
            status.textContent = 'Sorry, we could not send your request. Please try again or contact us directly.';
          }
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = originalText;
          }
        }
      });
    });

    console.log('[Whips Urban Executive] Form handler initialized. Forms found:', forms.length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormHandler);
  } else {
    initFormHandler();
  }
})();
