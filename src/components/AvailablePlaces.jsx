import { useState, useEffect } from 'react';
import Places from './Places.jsx';
import Error from "./Error.jsx";
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces} from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {

  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();

    /*Start backend> node app.js command first,
  After that npm start in terminal, so that we get different port for frontend ,other than 3000
  */

  /*
  fetch() is a javascript function to send http request to the server.
  Below fetch will send GET request by default to the backend server running on localhost:3000 
  and call url /places from app.js
  That function reads data from places.json file and parses it to send back response
  fetch returns a promise that is javascript object that results in another value.
  Promise is basically a wrapper around another object which is not available now, 
  but will eventually be available. To access that result, we chain it by then().
  The function defined inside then() is executed when the promise is resolved and
  response is received. In this then() function, we automatically receive response parameter
  when promise is resolved. Browser will execute it only whne promise is finished.
  Alternatively we can use await. But for that we need to mark component function as async,
  but that is not allowed.
  */

 /*
  useEffect(() => {
    fetch('http://localhost:3000/places')
      .then((response) => {
      return response.json()
    })
   .then((resData) => {
      setAvailablePlaces(resData.places);
   });
  }, []);
 */

  //alternative way by async await
  useEffect(() => {
      async function fetchPlaces() {
        setIsFetching(true);
        
        try{
          
          //we have to write await because fetchAvailablePlaces is async
         const places =  await fetchAvailablePlaces();

          //cant use async await for below method although it takes time to get location of browser
          //because getCurrentPosition() does not yeild a promise, but we can use 
          //the callback pattern to define function to be executed once we get current position.
          //Browser will provide position object that will contain users coordinates
          navigator.geolocation.getCurrentPosition((position) => {
            const sortedPlaces = sortPlacesByDistance(
              places,
              position.coords.latitude,
              position.coords.longitude
              );
            setAvailablePlaces(sortedPlaces);
            setIsFetching(false);
          });

        
        }catch(error){
          setError({message: error.message || 'Could not find places, please try agian later.'});
          setIsFetching(false);
        }        
       
      }

      fetchPlaces();
  }, []);

  if(error){
    return <Error title="An error occurred" message={error.message} />
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
