import React from 'react'
import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy, limit} from "firebase/firestore"
import { db } from "../firebase.config"
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
    const [ listings, setListings ] = useState(null)
    const [ loading, setLoading ] = useState(true)


    useEffect(() => {
        const fetchListings = async () => {
            try {
                //Get a reference
                const listingsRef = collection(db, 'listings')

                //Create a query
                const q = query(
                    listingsRef, 
                    where('offer', '==', true), 
                    orderBy('timestamp', 'desc'), 
                    limit(10)
                    )

                    //Execute query 
                    const querySnap = await getDocs(q) 

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
    }, [])

  return (
    <div className='category'>
        <header>
            <p className="pageHeader">Offers</p>
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
        <p>There are no current offers</p>)}
    </div>
  )
}

export default Offers