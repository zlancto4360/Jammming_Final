const clientID = '0cfcf5720de44cba8dc08efc84356b9e';
const redirectURI = 'http://sicariuus.surge.sh'


let accessToken;


const Spotify = {
  getAccessToken() {
      if (accessToken) {
        return accessToken;
      }
      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
      if (accessTokenMatch && expiresInMatch) {
        accessToken = accessTokenMatch[1];
        const expiresIn = Number(expiresInMatch[1]);
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/'); // This clears the parameters, allowing us to grab a new access token when it expires.
        return accessToken;
      } else {
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        window.location = accessUrl;
      }
    },

  search(term){
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&limit=20&q=${term}`, {
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Request Failed!');
    }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      if (jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      } else {
        return [];
      }
    });
  },

  savePlaylist(name, list){
    const accessToken = Spotify.getAccessToken();
    let user_id
    let playlist_id
    if (name && list) {
      return fetch('https://api.spotify.com/v1/me', {
        headers: {Authorization: `Bearer ${accessToken}`}
      }).then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Request Failed!');
      }, networkError => console.log(networkError.message)
      ).then(jsonResponse => {
        return user_id = jsonResponse.id;
      }).then(()=> {
        return fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
          headers: {Authorization: `Bearer ${accessToken}`},
          method: 'POST',
          body: JSON.stringify({name: name})
        }).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request Failed!');
        }, networkError => console.log(networkError.message)
        ).then(jsonResponse => {
          return playlist_id = jsonResponse.id;
        });
      }).then(()=> {
        return fetch(`https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`, {
          headers: {Authorization: `Bearer ${accessToken}`},
          method: 'POST',
          body: JSON.stringify({uris: list})
        }).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request Failed!');
        }, networkError => console.log(networkError.message)
        ).then(jsonResponse => {
        });
      });
    } else {
      return;
    }
  }
}

export default Spotify;
