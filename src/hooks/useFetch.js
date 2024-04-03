import { useEffect, useState } from 'react';

export function useFetch(fetchFn, initialValue){

    const [isFetching, setIsFetching] = useState();
    const [error, setError] = useState();
    const [fetchedData, setFetchedData] = useState(initialValue);

    useEffect(() => {
        async function fetchData(){
          setIsFetching(true);
          try{

            //calling the appropriate fetching function as per the function pointer passed in param
            const data = await fetchFn();
            setFetchedData(data);
          }
          catch(error){
            setError({message: error.message || "Failed to fetch user data."});
          }
          setIsFetching(false);
        }
        fetchData();
        
      },[fetchFn]);    

      //we need to add fetchFn as dependency because it is something external to useEffect and 
      //that may change, so we should tell useEffect to re-execute, so that we are
      //fetching data correctly based on the latest fetchFn change.

      return {
        isFetching,
        error,
        fetchedData,
        setFetchedData
    }
}