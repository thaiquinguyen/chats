angular.module('starter.services', ['ngCookies'])

.factory('Contacts', function() {
  var contacts = {};

  return {
    all: function() {
      return contacts;
    },
    addContacts: function(contactList) {
      contacts = contactList;
    },
    setStatus: function(contactId, bool) {
      var contact = contacts[contactId]
      if(contact) {
        contact.status = bool;
      }
    },
    remove: function(contactId) {
      delete contacts[contactId];
    },
  }
})

.factory('Socket', function($q, $rootScope, $state, $ionicSideMenuDelegate,
                              serverPath, Contacts, Modal) {
  var sio = {};
  return {
    connect: function(token) {
      return $q(function(resolve, reject) {
        sio.socket = io.connect(serverPath, {
          query: 'token=' + token,
          'force new connection': true
        });

        sio.socket.on('connect', function () {
          sio.socket.on('disconnect', function(){
            delete sio.socket;
            Modal.clearAll();
            $ionicSideMenuDelegate.toggleLeft(false);
            $state.go('login');
          });
          sio.socket.on('A user has disconnected', function(data) {
            Contacts.setStatus(data.userId, false);
          });
          sio.socket.on('A user has connected', function(data) {
            Contacts.setStatus(data.userId, true);
          });
          sio.socket.on('Socket is connected', function(data) {
            resolve(data);
          });
          sio.socket.on('Have a suggest add contact', function(data) {
            Contacts.add(data);
          });
          sio.socket.on('The contact has deleted', function(data) {
            $rootScope.$apply(function() {
              Contacts.remove(data.contactId);
            });
          });
        });

        sio.socket.on('error', function (data) {
          reject('The socket has not connected!');
        });
      });
    },
    get: function() {
      return sio;
    }
  };
})

.factory('Auth', function($q, $http, $cookies, $timeout, $rootScope, Socket, serverPath, Contacts) {
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
          url: serverPath + 'api/auth',
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

            promise.then(function(result) {
              $rootScope.userProfile = result;

              Contacts.addContacts(result.contacts);

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

.service('Modal', function($q, $ionicModal) {
  var that = this;

  that.modals = {};

  that.clearAll = function() {
    for(key in this.modals) {
      this.modals[key].hide();
      delete this.modals[key];
    }
  };

  that.getModal = function(modalName) {
    return that.modals[modalName];
  };

  that.createModal = function(scope, modalName, templateUrl, animation) {
    return $q(function(resolve, reject) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: scope,
        animation: animation
      }).then(function(modal) {
        if(modal) {
          if(!that.modals[modalName]) {
            that.modals[modalName] = modal;
          }
          resolve('Create modal is success!');
        }
        else {
          reject('Create modal is fail!');
        }
      });
    });
  };
});
