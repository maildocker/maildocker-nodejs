Maildocker-NodeJS
=================

This library allows you to quickly and easily send emails through
Maildocker using NodeJS.

Example
-------

.. code:: javascript

    var md = require('maildocker')(api_user, api_password);

    md.send({
      to:       'john.snow@thrones.com',
      from:     'maildocker@ecentry.io',
      subject:  'maildocker-nodejs-library',
      text:     '**{{system}}** ({{url}})'
    }, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });

    // OR

    var message = new maildocker.Mail({
      subject:    'maildocker-nodejs-library',
      text:       '**{{system}}** ({{url}})',
      merge_vars: {
        system: 'Maildocker', url: 'http://maildocker.io'
      }
    });
    message.addTo('john.snow@thrones.com', 'John Snow');
    message.setFrom('maildocker@ecentry.io', 'Maildocker');
    message.addAttachment({
      filename: 'spreadsheet.xls',
      content: new Buffer('You know nothing...')
    });

    md.send(message, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
