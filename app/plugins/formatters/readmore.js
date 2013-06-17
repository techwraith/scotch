/**
* Generates a Read More link in the "index" scenario
*/
(function () {
  var readmore = function (buffer) {
    //Find a readmore link
    var match = buffer.match(/<!-- *more *-->/gi);
    
    if(match != null) {
      //Snip it off at the first match
      buffer = buffer.substring(0, buffer.indexOf(match[0]))
      //Append a readmore link
        + '<p><a href="/' + this.slug + '">Read On &raquo;</a></p>';
      
      return buffer;
    }
    
    return buffer;
  };
  
  exports.index = readmore;
}());