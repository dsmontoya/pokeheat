/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

(function(scope) {
  if (!scope.PokeHunter) {
    scope.PokeHunter = function(){};

    PokeHunter.prototype = {
      _request: function(method, url, body, headers, onSuccess, onError) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true
        xhr.crossDomain = true
        if ("withCredentials" in xhr) {
          xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
          xhr = new XDomainRequest();
          xhr.open(method, url);
        } else {
          xhr = null;
        }

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        console.log(headers);
        for (var k in headers) {
          console.log("yay");
          console.log(k, headers[k]);
          if (headers[k] != null)
            xhr.setRequestHeader(k, headers[k]);
        }

        xhr.onload = function(){
          onSuccess(xhr);
        };
        xhr.onerror = function() {
          onError(xhr);
        };
        xhr.send(JSON.stringify(body));
      },
      getCurrentPosition: function(onSuccess, onError){
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(onSuccess, onError)
        } else {
          onError();
        }
      },
      getNearbyPokemons: function(onSuccess, onError, factor) {
        var that = this;
        factor = factor || 1;
        pokehunter.getCurrentPosition(function(position){
          var coords = position.coords;
          that._request("GET", "https://api.fastpokemap.se/?key=allow-all&ts=0&lat="+coords.latitude+"&lng="+coords.longitude, "", {"Origin": "https://www.fastpokemap.se"}, function(result){
            var response = JSON.parse(result.response)
            if(factor >= 11) {
              onError("unable to request nearby pokemons")
              return
            }
            if(response.error) {
              alert("overload")
              factor++;
              setTimeout(that.getNearbyPokemons(onSuccess, onError, factor), factor * 50)
            } else {
              alert("no overload")
              var error = response.error;
              alert(response)
              alert(error)
              alert(response.error == "overload")
              onSuccess(result);
            }
          }, function(){
            onError()
          });
        }, function(error){
          if (error.code == 1) {
            alert("Activate you GPS, so you can use this app.");
          }
          onError(error)
        });
      },
      getUsernames: function(onSuccess, onError) {
        this._request("GET", "http://82.223.7.123/tokens/19.40652399989956/-99.17870850174401/-5089381", "", [], function(result){
          console.log(result.response)
        }, function(result) {
          console.log(result)
        });
      },
      getCallbackAuthorizeCookie: function(onSuccess, onError) {
        var that = this;
        alert(window.localStorage.getItem("JSESSIONID"))
        //xhr.setRequestHeader("Cookie", "");
        this._deleteCookie("JSESSIONID");
        this._request("GET", "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize", "", {"Cookie": ""}, function(result) {
          var response = {
            jSessionID: that._getCookieFromString("JSESSIONID",result.getResponseHeader("Set-Cookie")),
            lt: JSON.Stringify(response)
          }
          if(onSuccess)
            onSuccess(response)
        }, function(result) {
          console.log(result)
        })
      },
      callbackAuthorize: function(onSuccess, onError) {
        this._request("GET", "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize", "", [], function(result) {
          console.log(result)
          alert(result.getResponseHeader("Set-Cookie"))
        }, function(result) {
          console.log(result)
        })
      },
      _getCookie: function(name) {
        return this._getCookieFromString(name, document.cookie)
      },
      _getCookieFromString: function(name, str) {
        if(!str) {
          return ""
        }
        var nameEQ = name + "=";
        var ca = str.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return
      },
      _deleteCookie: function(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
  }
})(window)

var pokehunter = new PokeHunter();
pokehunter.getNearbyPokemons(function(result){
  alert(result.response);
}, function(error){
  alert(error);
})


var UserGist = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      lastGistUrl: ''
    };
  },

  _request: function(method, url, body, headers, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
    }

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    for (var k in headers) {
      if (headers[k])
        xhr.setRequestHeader(k, headers[k]);
    }

    xhr.onload = function(){
      onSuccess(xhr);
    };
    xhr.onerror = function() {
      onError(xhr);
    };
    xhr.send(JSON.stringify(body));
  },

  componentDidMount: function() {
    this.serverRequest = this._request("GET",this.props.source, "", [], function (result) {
      var lastGist = (JSON.parse(result.response)[0]);
      console.log(lastGist)
      this.setState({
        username: lastGist.owner.login,
        lastGistUrl: lastGist.html_url
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.serverRequest.abort();
  },

  render: function() {
    return (
      <div>
        {this.state.username} last gist is
        <a href={this.state.lastGistUrl}>here</a>.
      </div>
    );
  }
});

ReactDOM.render(
  <UserGist source="https://api.github.com/users/octocat/gists" />,
  document.getElementById('deviceready')
);
