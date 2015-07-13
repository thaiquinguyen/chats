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

  $scope.addContact = function(contactId) {
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.message">',
      title: 'Send a message for them',
      subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Add</b>',
          type: 'button-positive',
          onTap: function(e) {
            return $scope.data.message;
          }
        }
      ]
    });
    myPopup.then(function(res) {
      sio.socket.emit('Add new contact', { contactId: contactId, message: res});
      sio.socket.on('Add new contact is success', function(data) {
        $rootScope.$apply(function() {
          console.log(data);
          Contacts.addContacts(data);
        });
      });
    });
  };

  $scope.searchInDirectory = function(text) {
    if(text) {
      sio.socket.emit('Search contacts', { searchText: text});
      sio.socket.on('Get search contacts', function(data) {
        $scope.$apply(function() {
          $scope.newContacts = data;
        });
      });
    }
    else {
      $scope.newContacts = [];
    }
  };

  $scope.showContactDetail = function(contact) {
    var promise = Modal.createModal($scope, 'contactDetailModal',
                                      'templates/modals/contact-detail.html', 'fade-in');
    promise.then(function(data) {
      $scope.contact = contact;
      $scope.contactDetailModal = Modal.getModal('contactDetailModal');
      $scope.contactDetailModal.show();
    }, function(error) {
      console.log(error);
    });
  };

  $scope.openAddNewContactModal = function() {
    promise = Modal.createModal($scope, 'newContactModal',
                                  'templates/modals/add-to-contact.html', 'fade-in');
    promise.then(function(data) {
        $scope.newContactModal = Modal.getModal('newContactModal');
        $scope.data = {};
        $scope.$on('modal.hidden', function() {
          $scope.data.searchText = '';
          $scope.newContacts = [];
        });
        $scope.newContactModal.show();
    }, function(error) {
      console.log(error);
    });
  };
})

.controller('GroupCtrl', function() {});
