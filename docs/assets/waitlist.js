/* Mello Acres wait list forms.
   Sends each signup to the farm inbox through FormSubmit without leaving the
   page, then thanks the visitor in place. No libraries. */
(function () {
  var forms = document.querySelectorAll('form[data-waitlist]');
  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type=submit]');
    var boxes = form.querySelectorAll('input[name="Interested in"]');

    function say(msg, bad) {
      status.textContent = msg;
      status.className = 'form-status' + (bad ? ' is-error' : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var picked = [];
      Array.prototype.forEach.call(boxes, function (b) { if (b.checked) picked.push(b.value); });
      if (boxes.length && !picked.length) {
        say('Please tick at least one thing you would love to be on the list for.', true);
        boxes[0].focus();
        return;
      }

      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.name === 'Interested in' || el.type === 'submit') return;
        data[el.name] = el.value;
      });
      data['Interested in'] = picked.join(', ');
      data['Name'] = (data['First name'] + ' ' + data['Last name']).trim();
      delete data._next;

      button.disabled = true;
      button.textContent = 'Adding you…';
      say('');

      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (String(res.success) !== 'true') throw new Error(res.message || 'not sent');
          var first = data['First name'] || 'friend';
          var done = document.createElement('div');
          done.className = 'waitlist-done';
          done.setAttribute('tabindex', '-1');
          done.innerHTML = '<h3></h3><p>You’re on our wait list for <strong></strong>. ' +
            'We’ll reach out to you personally as soon as it’s ready. ' +
            'Thank you so much for thinking of us!</p>';
          done.querySelector('h3').textContent = 'Thank you, ' + first + '!';
          done.querySelector('strong').textContent = data['Interested in'] || 'your favorites';
          form.parentNode.replaceChild(done, form);
          done.focus();
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = 'Add me to the wait list';
          say('Oh dear, that didn’t go through. Please check your connection and try once more.', true);
        });
    });
  });
})();
