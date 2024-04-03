
import Places from './Places.jsx';
import Error from "./Error.jsx";
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces} from '../http.js';
import { useFetch } from "../hooks/useFetch.js";

async function fetchSortedPlaces() {
  const places = await fetchAvailablePlaces();
  return new Promise((resolve,reject) => {

  //Initially before creating new Promise, we cant use async await for below method although it takes time to get location of browser
  //because getCurrentPosition() does not yeild a promise, but we can use 
  //the callback pattern to define function to be executed once we get current position.
  //Browser will provide position object that will contain users coordinates
  navigator.geolocation.getCurrentPosition((position) => {
    const sortedPlaces = sortPlacesByDistance(
      places,
      position.coords.latitude,
      position.coords.longitude
      );

      //resolve will make sure to tell useFetch custom hook function fetchFn that
      //wiat time is finished and we got response from the promise
      resolve(sortedPlaces);
  });
  }); 
}



export default function AvailablePlaces({ onSelectPlace }) {


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

  //alternative way by async await. Here we are using async await in custom hook

  const {
    isFetching,
    error,
    fetchedData: availablePlaces,
   
  } = useFetch(fetchSortedPlaces ,[]);

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
