import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { Room, Star } from "@material-ui/icons";
import axios from "axios";
import {format} from "timeago.js";
import "mapbox-gl/dist/mapbox-gl.css";
import Register from './components/register/Register';
import Login from './components/login/Login';
import "./app.css";


function App() {
  // 将用户信息存放进localStorage 
  const myStorage = window.localStorage; 
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);  
  const [star, setStar] = useState(0);
  const [viewport, setViewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 4,
  });
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const {lat, lng} = e.lngLat;
    setNewPlace({
      lat,
      long: lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star, 
      lat: newPlace.lat, 
      long: newPlace.long,
    };

    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch(err) {
      console.log(err);
    }
   }

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins"); 
        setPins(allPins.data);
      } catch(err) {
        console.log(err);
      } 
    }
    getPins();
  }, [])

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  return (
    <div
      style={{height: "100vh", width: "100%"}}
    >
      <Map
        initialViewState={viewport}
        style={{width: '100%', height: '100%'}}
        transitionDuration="200"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        // onViewportChange={(viewport) => setViewport(viewport)}
        // 双击事件，有点意思...
        onDblClick={currentUsername && handleAddClick}
      >
        {pins.map(p => {
          <>
            <Marker 
              latitude={p.lat} 
              longitude={p.log} 
              offsetLeft={-3.5 * viewport.zoom} 
              offsetTop={-7 * viewport.zoom} 
            >
              <Room 
                style={{
                  fontSize: viewport.zoom * 7, 
                  color: p.username === currentUsername ? "tomato" : "slateblue", 
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup 
                key={p._id}
                longitude={p.log} 
                latitude={p.lat}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                // 这里利用id来控制Popup是否出现，有点巧妙
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {/* TODO： 这里的用法是真的牛逼，并且这里的Array 和 new Array的用法是一样的 */}
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">Created by <b>{p.username}</b></span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
          </>})
        }
        {newPlace && (
          <>
            <Marker>
              <Room
                style={{
                  fontSize: 7 * viewport.zoom,
                  color: "tomato",
                  cursor: "pointer",
                }}
              />
            </Marker>
            <Popup
              latitude={newPlace.lat}
              longitude={newPlace.long}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setNewPlace(null)}
              anchor="left"
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input 
                    placeholder='Enter a title'
                    autoFocus
                    onChange={e => setTitle(e.target.value)}
                  />
                  <label>Description</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    Add Pin
                  </button>
                </form>
              </div>
            </Popup>
          </>
        )}
        {currentUsername ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
          />
        )}
      </Map>
    </div>
  );
}
export default App;