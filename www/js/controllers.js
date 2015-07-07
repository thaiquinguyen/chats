angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicSideMenuDelegate, Auth) {
  $scope.user = {};

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.login = function() {
    var promise = Auth.authentication($scope.user);

    promise.then(function(message) {
      $state.go('tab.dash');
    }, function(error) {
      $scope.errorMsg = error;
    });
  };
})

.controller('ProfileCtrl', function($scope, $cookies, Socket) {
  var sio = Socket.get();

  $scope.logOut = function() {
    sio.socket.disconnect();
    delete $cookies.accountUsername;
    delete $cookies.accountPassword;
  };
})

.controller('DashCtrl', function() {})

.controller('ChatsCtrl', function() {})

.controller('ChatDetailCtrl', function() {})

.controller('ContactsCtrl', function() {})

.controller('GroupCtrl', function() {});
