/**
 * Mello Acres — inquiry forms
 * ---------------------------------------------------------------------------
 * Run setUp() ONCE. It builds both inquiry forms, wires up the email
 * notifications, and prints the links you need for the website.
 *
 * After that the script keeps running quietly in the background: every time
 * someone submits a form it emails the farm and sends the customer a receipt.
 *
 * To change the wording later, edit the text in this file and save. You do not
 * need to run setUp() again — only do that if you want to build fresh forms.
 */

// ---------------------------------------------------------------------------
// Settings — edit these if anything changes
// ---------------------------------------------------------------------------

var FARM_NAME  = 'Mello Acres';
var OWNER_NAME = 'Michelle Mello';
var OWNER_MAIL = 'connect@melloacres.com';   // where inquiries are sent
var FARM_PHONE = '(559) 836-2880';
var PHONE_HREF = 'tel:+15598362880';
var SITE_URL   = 'https://melloacres.com';
var LOGO_URL   = 'https://melloacres.com/assets/logo.png';

// Brand colors, matched to the website
var C_INK   = '#241A16';
var C_SOFT  = '#7B6A5D';
var C_BLOOM = '#B04B2C';
var C_LINE  = '#E4D8CC';
var C_CREAM = '#FBF7F1';


// ===========================================================================
// ONE-TIME SETUP
// ===========================================================================

function setUp() {
  var flock   = buildFlockForm();
  var flowers = buildFlowersForm();

  // One spreadsheet holding both forms' responses, a tab each — a running
  // list Michelle can sort, filter and keep notes in.
  var book = SpreadsheetApp.create(FARM_NAME + ' — Website Inquiries');

  [flock, flowers].forEach(function (form) {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, book.getId());


    // Remove any old triggers for this form so re-running never doubles up
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (t.getTriggerSourceId() === form.getId()) ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger('onInquirySubmit').forForm(form).onFormSubmit().create();
  });

  var out = [
    '',
    '===========================================================',
    '  BOTH FORMS ARE BUILT. Send these two links to Claude.',
    '===========================================================',
    '',
    'FLOCK FORM',
    '  Embed link : ' + flock.getPublishedUrl().replace('/viewform', '/viewform?embedded=true'),
    '  Edit it at : ' + flock.getEditUrl(),
    '',
    'FLOWERS FORM',
    '  Embed link : ' + flowers.getPublishedUrl().replace('/viewform', '/viewform?embedded=true'),
    '  Edit it at : ' + flowers.getEditUrl(),
    '',
    'RESPONSE SPREADSHEET',
    '  ' + book.getUrl(),
    '',
    'Inquiries will be emailed to: ' + OWNER_MAIL,
    '===========================================================',
    ''
  ].join('\n');

  Logger.log(out);
  return out;
}


// ===========================================================================
// THE FLOCK FORM
// ===========================================================================

function buildFlockForm() {
  var form = FormApp.create('Mello Acres — Flock Inquiry');

  form.setTitle('Tell us what you’re hoping for')
      .setDescription(
        'We’d love to help you find the right birds. Share a few details below and ' +
        OWNER_NAME + ' will be in touch soon with what’s available and what’s coming.')
      .setConfirmationMessage(
        'Thank you — your note is on its way to us!\n\n' +
        'Watch for a confirmation in your inbox, and we’ll follow up personally very soon. ' +
        'If you’d rather talk it through, give us a ring at ' + FARM_PHONE + '.')
      .setAllowResponseEdits(false)
      .setProgressBar(false);

  form.addTextItem().setTitle('Your name').setRequired(true);

  form.addTextItem()
      .setTitle('Email address')
      .setHelpText('So we can send your confirmation and reply.')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText('Please check the email address — it looks incomplete.')
        .build());

  form.addTextItem().setTitle('Phone number').setHelpText('Optional — handy if it’s easier to talk.');

  form.addListItem()
      .setTitle('What are you hoping for?')
      .setChoiceValues([
        'Hatching eggs',
        'Started goslings',
        'Either — whatever is available',
        'Not sure yet — I’d love some guidance'])
      .setRequired(true);

  form.addListItem()
      .setTitle('Which breed?')
      .setChoiceValues([
        'Sebastopol geese',
        'Embden geese',
        'Toulouse geese',
        'Bresse chickens',
        'Mixed duck eggs',
        'Mixed chicken eggs',
        'Not sure — please help me choose'])
      .setRequired(true);

  form.addListItem()
      .setTitle('How many?')
      .setChoiceValues([
        'Just a few (up to 6)',
        'Half a dozen to a dozen',
        'A dozen to two dozen',
        'More than two dozen',
        'Not sure yet'])
      .setRequired(true);

  form.addTextItem()
      .setTitle('Color preference, if you have one')
      .setHelpText('Optional — tell us if a particular color matters to you and we’ll do our best.');

  form.addListItem()
      .setTitle('When would you like them?')
      .setChoiceValues([
        'As soon as they’re available',
        'Within the next month',
        'Sometime this season',
        'Next season — I’m planning ahead',
        'I’m flexible']);

  form.addListItem()
      .setTitle('Pick up or shipping?')
      .setChoiceValues([
        'I’ll come to the farm',
        'I’d like to ask about shipping',
        'Either works for me']);

  form.addParagraphTextItem()
      .setTitle('Anything else we should know?')
      .setHelpText('Optional — tell us about your flock, your setup, or what you’re planning.');

  return form;
}


// ===========================================================================
// THE FLOWERS FORM
// ===========================================================================

function buildFlowersForm() {
  var form = FormApp.create('Mello Acres — Dahlia Inquiry');

  form.setTitle('Tell us what you have in mind')
      .setDescription(
        'Whether it’s an armful for the kitchen table or tubers to start your own patch, ' +
        'we’d love to help. Share a few details and ' + OWNER_NAME +
        ' will let you know what’s blooming and what’s coming.')
      .setConfirmationMessage(
        'Thank you — your note is on its way to us!\n\n' +
        'Watch for a confirmation in your inbox, and we’ll follow up personally very soon. ' +
        'If you’d rather talk it through, give us a ring at ' + FARM_PHONE + '.')
      .setAllowResponseEdits(false)
      .setProgressBar(false);

  form.addTextItem().setTitle('Your name').setRequired(true);

  form.addTextItem()
      .setTitle('Email address')
      .setHelpText('So we can send your confirmation and reply.')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText('Please check the email address — it looks incomplete.')
        .build());

  form.addTextItem().setTitle('Phone number').setHelpText('Optional — handy if it’s easier to talk.');

  form.addListItem()
      .setTitle('What are you hoping for?')
      .setChoiceValues([
        'Cut flowers',
        'Tubers',
        'Both',
        'Not sure yet — I’d love some guidance'])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('Colors you’re drawn to')
      .setHelpText('Choose as many as you like — we’ll tell you what we have in those shades.')
      .setChoiceValues([
        'Blush and soft pink',
        'Coral and peach',
        'Red and burgundy',
        'Orange and bronze',
        'Yellow and gold',
        'Cream and white',
        'Purple and lavender',
        'Bicolor and variegated',
        'Open to anything — surprise me']);

  form.addParagraphTextItem()
      .setTitle('Varieties you have in mind')
      .setHelpText('Optional — if you already know the names you’re after, list them here.');

  form.addListItem()
      .setTitle('How much are you thinking?')
      .setChoiceValues([
        'A single bunch',
        'Several bunches',
        'A bucket for my own arranging',
        'A few tubers',
        'A dozen tubers or more',
        'Not sure yet'])
      .setRequired(true);

  form.addTextItem()
      .setTitle('Date you need them, if you have one')
      .setHelpText('Optional — a wedding, a party, a standing weekly bunch.');

  form.addParagraphTextItem()
      .setTitle('Anything else we should know?')
      .setHelpText('Optional — tell us about the occasion or what you’re picturing.');

  return form;
}


// ===========================================================================
// WHAT HAPPENS WHEN SOMEONE SUBMITS
// ===========================================================================

function onInquirySubmit(e) {
  var form  = e.source;
  var resp  = e.response;
  var items = resp.getItemResponses();

  var kind = form.getTitle().toLowerCase().indexOf('dahlia') > -1 ? 'Dahlia' : 'Flock';

  // Pull out the answers
  var rows = [], name = '', email = '';
  items.forEach(function (ir) {
    var q = ir.getItem().getTitle();
    var a = ir.getResponse();
    if (a instanceof Array) a = a.join(', ');
    if (!a) return;
    if (q === 'Your name')     name  = a;
    if (q === 'Email address') email = a;
    rows.push({ q: q, a: a });
  });

  notifyFarm(kind, name, email, rows);
  if (email) sendReceipt(kind, name, email, rows);
}


/** The email that goes to the farm. */
function notifyFarm(kind, name, email, rows) {
  var body = rows.map(function (r) {
    return '<tr>' +
      '<td style="padding:9px 16px 9px 0;vertical-align:top;white-space:nowrap;' +
      'font:600 12px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.06em;' +
      'text-transform:uppercase;color:' + C_SOFT + ';border-bottom:1px solid ' + C_LINE + '">' +
      esc(r.q) + '</td>' +
      '<td style="padding:9px 0;vertical-align:top;font:16px/1.55 Helvetica,Arial,sans-serif;' +
      'color:' + C_INK + ';border-bottom:1px solid ' + C_LINE + '">' + esc(r.a) + '</td></tr>';
  }).join('');

  var html =
    '<div style="background:' + C_CREAM + ';padding:26px">' +
      '<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid ' + C_LINE + ';padding:28px">' +
        '<p style="margin:0 0 4px;font:600 11px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.16em;' +
        'text-transform:uppercase;color:' + C_BLOOM + '">New ' + kind + ' inquiry</p>' +
        '<h1 style="margin:0 0 20px;font:400 27px/1.25 Georgia,serif;color:' + C_INK + '">' +
        esc(name || 'Someone') + ' is interested</h1>' +
        '<table style="width:100%;border-collapse:collapse">' + body + '</table>' +
        (email
          ? '<p style="margin:22px 0 0;font:16px/1.6 Helvetica,Arial,sans-serif;color:' + C_INK + '">' +
            '<a href="mailto:' + esc(email) + '" style="color:' + C_BLOOM + ';font-weight:700">' +
            'Reply to ' + esc(name || email) + '</a></p>'
          : '') +
        '<p style="margin:20px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:' + C_SOFT + '">' +
        'A confirmation has already been sent to them automatically.</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: OWNER_MAIL,
    replyTo: email || OWNER_MAIL,
    subject: kind + ' inquiry from ' + (name || 'the website'),
    htmlBody: html,
    body: rows.map(function (r) { return r.q + ': ' + r.a; }).join('\n'),
    name: FARM_NAME + ' Website'
  });
}


/** The receipt that goes back to the customer. */
function sendReceipt(kind, name, email, rows) {
  var summary = rows
    .filter(function (r) { return r.q !== 'Your name' && r.q !== 'Email address'; })
    .map(function (r) {
      return '<tr>' +
        '<td style="padding:7px 16px 7px 0;vertical-align:top;white-space:nowrap;' +
        'font:600 11px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.06em;' +
        'text-transform:uppercase;color:' + C_SOFT + '">' + esc(r.q) + '</td>' +
        '<td style="padding:7px 0;vertical-align:top;font:15px/1.55 Helvetica,Arial,sans-serif;' +
        'color:' + C_INK + '">' + esc(r.a) + '</td></tr>';
    }).join('');

  var html =
    '<div style="background:' + C_CREAM + ';padding:30px 20px">' +
      '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid ' + C_LINE + '">' +

        '<div style="padding:30px 32px 0;text-align:center">' +
          '<a href="' + SITE_URL + '"><img src="' + LOGO_URL + '" alt="' + FARM_NAME +
          '" width="240" style="width:240px;max-width:72%;height:auto;border:0"></a>' +
        '</div>' +

        '<div style="padding:24px 32px 30px">' +
          '<h1 style="margin:0 0 14px;font:400 28px/1.3 Georgia,serif;color:' + C_INK + '">' +
          'Thank you, ' + esc(firstName(name)) + '!</h1>' +

          '<p style="margin:0 0 14px;font:16px/1.65 Helvetica,Arial,sans-serif;color:' + C_INK + '">' +
          'Your ' + kind.toLowerCase() + ' inquiry came through beautifully, and we’re so glad ' +
          'you reached out.</p>' +

          '<p style="margin:0 0 24px;font:16px/1.65 Helvetica,Arial,sans-serif;color:' + C_INK + '">' +
          esc(OWNER_NAME) + ' reads every note herself and will be in touch shortly to let you know ' +
          'what’s available and what’s coming along. We’re a small family farm rather than ' +
          'an office, so if we’re out with the birds or in the flower patch when your note arrives, ' +
          'we’ll get back to you just as soon as we’re in.</p>' +

          '<div style="border-top:1px solid ' + C_LINE + ';border-bottom:1px solid ' + C_LINE +
          ';padding:16px 0;margin:0 0 24px">' +
            '<p style="margin:0 0 10px;font:600 11px/1.5 Helvetica,Arial,sans-serif;' +
            'letter-spacing:.16em;text-transform:uppercase;color:' + C_BLOOM + '">' +
            'Here’s what you told us</p>' +
            '<table style="width:100%;border-collapse:collapse">' + summary + '</table>' +
          '</div>' +

          '<p style="margin:0 0 6px;font:600 11px/1.5 Helvetica,Arial,sans-serif;' +
          'letter-spacing:.16em;text-transform:uppercase;color:' + C_BLOOM + '">' +
          'In the meantime</p>' +
          '<p style="margin:0;font:16px/1.9 Helvetica,Arial,sans-serif;color:' + C_INK + '">' +
            'Call us at <a href="' + PHONE_HREF + '" style="color:' + C_BLOOM +
            ';font-weight:700;text-decoration:none">' + FARM_PHONE + '</a><br>' +
            'Email <a href="mailto:' + OWNER_MAIL + '" style="color:' + C_BLOOM +
            ';font-weight:700;text-decoration:none">' + OWNER_MAIL + '</a><br>' +
            'Visit <a href="' + SITE_URL + '" style="color:' + C_BLOOM +
            ';font-weight:700;text-decoration:none">melloacres.com</a>' +
          '</p>' +
        '</div>' +

        '<div style="background:' + C_CREAM + ';border-top:1px solid ' + C_LINE +
        ';padding:18px 32px;text-align:center">' +
          '<p style="margin:0;font:13px/1.7 Helvetica,Arial,sans-serif;color:' + C_SOFT + '">' +
          FARM_NAME + ' · ' + OWNER_NAME + ' · Hanford, California<br>' +
          'Farm, flock and flowers</p>' +
        '</div>' +

      '</div>' +
    '</div>';

  var plain =
    'Thank you, ' + firstName(name) + '!\n\n' +
    'Your ' + kind.toLowerCase() + ' inquiry came through, and we\'re so glad you reached out. ' +
    OWNER_NAME + ' reads every note herself and will be in touch shortly.\n\n' +
    'In the meantime:\n' +
    '  Phone   ' + FARM_PHONE + '\n' +
    '  Email   ' + OWNER_MAIL + '\n' +
    '  Website ' + SITE_URL + '\n\n' +
    FARM_NAME + ' * ' + OWNER_NAME + ' * Hanford, California';

  MailApp.sendEmail({
    to: email,
    replyTo: OWNER_MAIL,
    subject: 'We received your note — ' + FARM_NAME,
    htmlBody: html,
    body: plain,
    name: FARM_NAME
  });
}


// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function firstName(n) {
  if (!n) return 'friend';
  return String(n).trim().split(/\s+/)[0];
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}
