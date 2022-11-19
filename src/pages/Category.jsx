import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase.config"
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Category() {
    const [ listings, setListings ] = useState([])
    const [ loading, setLoading ] = useState(true)

    const params = useParams() //Helps to match the current URL to the particular route path.

    useEffect(() => {
        const fetchListings = async () => {
            try {
                //Get a reference
                const listingsRef = collection(db, 'listings')

                //Create a query which is similar to format we need 
                const q = query(
                    listingsRef, 
                    where('type', '==', params.categoryName), 
                    orderBy('timestamp', 'desc'), 
                    limit(10)
                    )

                    //Execute query 
                    const querySnap = await getDocs(q) //Getting the doc of the query
                    const listings = []

                    //Push a single record/doc into the array
                    querySnap.forEach((doc) => {
                        return listings.push({
                            id: doc.id,
                            data: doc.data()
                        })
                    })

                    setListings(listings)
                    setLoading(false)

            } catch (error) {
                toast.error("Oops, could not fetch listings")
            }
        }
        fetchListings()
    }, [params.categoryName])

  return (
    <div className='category'>
        <header>
            <p className="pageHeader">{params.categoryName === "rent" ? "Places for rent" : "Places for sale"}</p>
        </header>

        {loading ? (
            <Spinner /> 
        ) : listings && listings.length > 0 ? (
        <>
            <main>
                <ul className="categoryListings">
                    {listings.map((listing) => (
                        <ListingItem listing={listing.data} id={listing.id} key={listing.id} />
                    ))}
                </ul>
            </main>
        </>
        ) : (
        <p>No listings for {params.categoryName}</p>)}
    </div>
  )
}

export default Category