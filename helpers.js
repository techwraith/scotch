/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */
exports.humaneDate = function humane_date(date_str){
  var time_formats = [
    [60, 'Just Now'],
    [90, '1 Minute'], // 60*1.5
    [3600, 'Minutes', 60], // 60*60, 60
    [5400, '1 Hour'], // 60*60*1.5
    [86400, 'Hours', 3600], // 60*60*24, 60*60
    [129600, '1 Day'], // 60*60*24*1.5
    [604800, 'Days', 86400], // 60*60*24*7, 60*60*24
    [907200, '1 Week'], // 60*60*24*7*1.5
    [2628000, 'Weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
    [3942000, '1 Month'], // 60*60*24*(365/12)*1.5
    [31536000, 'Months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
    [47304000, '1 Year'], // 60*60*24*365*1.5
    [3153600000, 'Years', 31536000], // 60*60*24*365*100, 60*60*24*365
    [4730400000, '1 Century'], // 60*60*24*365*100*1.5
  ];

  var time = date_str,
    dt = new Date,
    seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
    token = ' Ago',
    i = 0,
    format;

  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = '';
  }

  while (format = time_formats[i++]) {
    if (seconds < format[0]) {
      if (format.length == 2) {
        return format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
      } else {
        return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
      }
    }
  }

  // overflow for centuries
  if(seconds > 4730400000)
    return Math.round(seconds / 4730400000) + ' Centuries' + token;

  return date_str;
};

/**
 * truncateHTML
 * @param  {String} str  The string of HTML that you'd like to truncate
 * @param  {Number} len  The number of characters to limit the string to
 * @param  {String} tail What you'd like to add at the end of the string e.g. "..."
 * @return {String}
 */
exports.truncateHTML = function (str, len, tail) {
    // The returned string of content
    var s = '';
    // Any tail to append after truncation -- e.g. ellipses
    var t = tail || '';
    // Split pattern for HTML tags
    var pat = /(<[^>]*>)/;
    // Opening HTML tag -- used as a flag that there's an
    // HTML tag sitting open when truncation happens
    var openTag = null;
    // Used to close any open tag
    var closeTag = '';
    // An array of merged content and tags, e.g., ['foo',
    // '<strong>', 'bar', '</strong>']
    var arr = [];
    // Current length of the string to return
    var currLen = 0;
    // Lookahead to see if we'll overshoot the max length
    var nextLen = 0;
    // Truncated final segment of the string
    var trunc;
    // Each item in the merged tag/content array
    var item;

    // Build the merged array of tags/content
    var result = pat.exec(str);
    while (result) {
      var firstPos = result.index;
      var lastPos = pat.lastIndex;
      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos));
        str = str.slice(firstPos);
      }
      arr.push(result[0]);
      str = str.slice(result[0].length);
      result = pat.exec(str);
    }
    if (str !== '') {
      arr.push(str);
    }

    // Parse each item in the tag/content array
    // Have to parse in all cases -- no simple test to see
    // if you can just return the entire string
    // Global regex replace would work, but who knows
    // how much if any faster that is
    for (var i = 0; i < arr.length; i++) {
      item = arr[i];
      switch (true) {
        // Closing tag
        case item.indexOf('</') == 0:
          s += item;
          openTag = null;
          break;
        // Opening tag
        case item.indexOf('<') == 0:
          s += item;
          openTag = item;
          break;
        // Text
        default:
          nextLen += item.length;
          // If adding the content will overshoot the limit
          // use the truncation fu
          if (nextLen >= len) {
            // Chop the string to the amount needed to complete
            // the max length, minus the amount for the tail string if any
            // NOTE: Content segment can be less than the length of the
            // tail string -- this can result in a fudge factor of the length
            // of the tail for the entire string
            trunc = item.substr(0, (len - currLen) - t.length);
            s += trunc;
            // If we're sitting on an open HTML tag
            if (openTag) {
              // If there's content in the final truncated string,
              // just append a closing tag of the same kind as
              // the opening tag
              if (trunc.length) {
                closeTag = openTag.split(
                    /\s|>/)[0].replace('<', '</') + '>';
                s += closeTag;
              }
              // If there's no content in the truncated string,
              // just strip out the previous open tag
              else {
                s = s.replace(openTag, '');
              }
            }
            // Append the tail, if any, and return
            s += t;
            return s;
          }
          else {
            s += item;
          }
          currLen = nextLen;
        }
    }
    return s;
  };
