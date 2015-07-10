angular.module('starter.filters', [])

.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

.filter('filterContact', function() {
  return function(items, field, input) {
    if(!input ) {
      return items;
    }

    var filtered = [];
    var regex = new RegExp('\\b' + input, 'i' );

    angular.forEach(items, function(item) {
      var fullField = '';

      if(angular.isArray(field)) {
        for(key in field) {
          fullField += item[field[key]] + ' ';
        }
        fullField = fullField.trim();
      }
      else {
        fullField = field;
      }

      if(regex.test(fullField)) {
        filtered.push(item);
      }
    });
    return filtered;
  };
});
