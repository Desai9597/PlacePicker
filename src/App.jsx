import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchUserPlaces, updateUserPlaces } from './http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [isFetching, setIsFetching] = useState(false);
  
  const [error, setError] = useState();

  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    async function fetchPlaces(){
      setIsFetching(true);
      try{
        const places = await fetchUserPlaces();
        setUserPlaces(places);
      }
      catch(error){
        setError({message: error.message || "Failed to fetch user places."});
      }
      setIsFetching(false);
    }
    fetchPlaces();
  },[]);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];

    });

    //decorate below with await because it can take time to response back.
    //Hence decorate function handler with async
    try{
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    }
    catch(error){
        setUserPlaces(userPlaces);
        setErrorUpdatingPlaces({message: error.message || "Failed to update places"});
    }  

  }

  /*useCallback hook must be used to make sure that inner function is not re-created 
  on every exution rendering of App component, but instead storing internally,
  and re-using whenver App is loaded again. We must use useCallback hook whenever
  we have a function as a dependency of useEffect. 
  Because if function is re-created, setUserPlaces will be called again and
  App will be rendered agian, leading to infinite loop.We have such case here because
  onConfirm function handle is a dependency of useEffect in DeleteConfirmation component,
  and if we dont use useCallback, we will get infinite loop of set Timer there due to function re-creation 
  and setUserPlaces state updating call also.
  */
  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try{
      await updateUserPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    }
    catch(error){
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to delete place.',
      });
    }
   

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
    <Modal open={errorUpdatingPlaces} onClose={handleError}>
      {errorUpdatingPlaces && 
          (<Error 
          title="An error occurred!"
          message={errorUpdatingPlaces.message}
          onConfirm={handleError}
          />)
      }
    </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured!" message={error.message} />}
        {!error && (<Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          isLoading={isFetching}
          loadingText="Fetching your places..."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />)
        }

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
