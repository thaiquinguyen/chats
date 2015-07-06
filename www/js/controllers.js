angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicSideMenuDelegate, $stateParams, Auth) {
  $scope.user = {};

  // if($stateParams.params.message) {
  //   $state.errorMsg = $stateParams.params.message;
  // }

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.login = function() {
    var promise = Auth.authentication($scope.user);

    promise.then(function(message) {
      $state.go('tab.dash');
    }, function(error) {
      $scope.errorMsg = error;
    })
  };
})

.controller('DashCtrl', function($scope) {
})

.controller('ProfileCtrl', function($scope, $cookies, Socket) {
  var sio = Socket.get();

  $scope.logOut = function() {
    sio.socket.disconnect();
    delete $cookies.accountUsername;
    delete $cookies.accountPassword;
  };
})

.controller('ChatsCtrl', function($scope, $ionicPopup, Chats, Socket) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
  // An elaborate, custom popup
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
