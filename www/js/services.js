angular.module('starter.services', ['ngCookies'])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Socket', function($q, $state, serverPath) {
  var sio = {};
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

.factory('Auth', function($q, $http, $cookies, $rootScope, Socket, serverPath) {
  return {
    authentication: function(user) {
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
                // Setting a cookie
                $cookies.accountUsername = user.username;
                $cookies.accountPassword = user.password;
                resolve('Authentication done!')
              }, function() {
                reject('Authentication fail!');
              });
            }
            else if(data.status === 'Fail') {
              console.log(data.message);
               reject(data.message);
            }
          }).error(function(data, status, headers, config) {});
      });
    },
  };
});
