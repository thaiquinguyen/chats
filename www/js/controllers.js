angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $timeout, $ionicSideMenuDelegate, Auth) {
  $scope.user = {};

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.login = function() {
    var promise = Auth.authentication($scope.user);

    promise.then(function(message) {
      $state.go('tab.dash');
    }, function(error) {
      $scope.errorMsg = error;
      $timeout(function() {
        $scope.$apply(function() {
          $scope.errorMsg = '';
        });
      }, 3000);
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

.controller('ContactsCtrl', function($scope, $rootScope, $ionicPopup, $ionicModal,
                                      Socket, Contacts, Modal) {
  var sio = Socket.get();

  $scope.shouldShowDelete = false;
  $scope.contacts = Contacts.all();

  $rootScope.$watch('userProfile', function() {
    $scope.contacts = Contacts.all();
  });

  $scope.deleteContact = function(key) {
    sio.socket.emit('deleteContact', {contactKey: key});
  };

 $scope.showConfirm = function(key) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm delete contact',
     template: 'Are you sure delete this contact?'
   });
   confirmPopup.then(function(res) {
     if(res) {
        $scope.deleteContact(key);
     }
   });
 };

  $scope.showDelete = function() {
    $scope.shouldShowDelete = true;
  };
  $scope.hideDelete = function() {
    $scope.shouldShowDelete = false;
  };

  var promise = Modal.createModal($scope, 'templates/modals/contact-detail.html', 'fade-in');
  promise.then(function(modal) {
    $scope.showContactDetail = function(contact) {
      $scope.contact = contact;
      $scope.contactDetailModal = modal;
      modal.show();
    };
  }, function(error) {
    console.log(error);
  });

  promise = Modal.createModal($scope, 'templates/modals/add-new-contact.html', 'fade-in');
  promise.then(function(modal) {
    $scope.openAddNewContactModal = function() {
      $scope.newContactModal = modal;
      modal.show();
    };
  }, function(error) {
    console.log(error);
  });
})

.controller('GroupCtrl', function() {});
