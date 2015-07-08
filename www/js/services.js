angular.module('starter.services', ['ngCookies'])

.factory('Socket', function($q, $rootScope, $state, serverPath) {
  var sio = {};

  var setStatus = function(contact, bool) {
    if(contact) {
      $rootScope.$apply(function() {
        contact.status = bool;
      });
    }
  };
  return {
    connect: function(token) {
      return $q(function(resolve, reject) {
        sio.socket = io.connect(serverPath, {
          query: 'token=' + token,
          'force new connection': true
        });
        if(sio.socket) {
          sio.socket.on('disconnect', function(){
            $state.go('login');
            delete sio.socket;
          });
          sio.socket.on('A user has disconnected', function(data) {
            setStatus($rootScope.userProfile.contacts[data.userID], false);
          });
          sio.socket.on('A user has connected', function(data) {
            setStatus($rootScope.userProfile.contacts[data.userID], true);
          });
          resolve('The socket has connected!')
        }
        else {
          reject('The socket has not connected!');
        }
      });
    },
    get: function() {
      return sio;
    }
  };
})

.factory('Auth', function($q, $http, $cookies, $timeout, $rootScope, Socket, serverPath) {
  $rootScope.authenticating = false;

  var authenticated = function(fn) {
    $timeout(function() {
      $rootScope.authenticating = false;
      fn();
    }, 1000);
  };

  return {
    authentication: function(user) {
      $rootScope.authenticating = true;

      return $q(function(resolve, reject) {
        $http({
          url: serverPath + 'auth',
          method: 'POST',
          data: {
            username: user.username,
            password: user.password
          },
          headers: {
            "Content-Type": "application/json"
          }
        }).success(function(data) {
          if(data.status === 'Success') {
            var promise = Socket.connect(data.token);

            promise.then(function() {
              $rootScope.userProfile = data.userProfile;
              $cookies.accountUsername = user.username;
              $cookies.accountPassword = user.password;

              authenticated(function() {
                resolve('Authentication done!');
              });
            }, function() {
              authenticated(function() {
                reject('Authentication fail!');
              });
            });
          }
          else if(data.status === 'Fail') {
            authenticated(function() {
              reject(data.message);
            });
          }
        });
      });
    },
  };
})

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
