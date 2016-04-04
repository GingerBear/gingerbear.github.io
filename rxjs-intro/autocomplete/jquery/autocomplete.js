(function (global, $) {

  // Search Wikipedia for a given term
  function searchWikipedia (term) {
    return $.ajax({
      url: 'http://en.wikipedia.org/w/api.php',
      dataType: 'jsonp',
      data: {
        action: 'opensearch',
        format: 'json',
        search: term
      }
    }).promise();
  }

  function main() {
    var $input = $('#textInput');
    var $results = $('#results');

    var timer;
    var pre;

    $input.on('keyup', function(e) {
      clearTimeout(timer);

      var value = this.value.trim();
      if (pre === value) return;
      if (value.length <= 2) return;
      pre = value;

      timer = setTimeout(function() {
        searchWikipedia(value)
          .done(function(data) {
            $results
              .empty()
              .append ($.map(data[1], function (v) { return $('<li>').text(v); }));
          })
          .fail(function(error) {
            $results
              .empty()
              .append($('<li>'))
              .text('Error:' + error);
          });
      }, 250);
    });

  }

  $(main);

}(window, jQuery));
