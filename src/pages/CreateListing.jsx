import React, { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db } from "../firebase.config"
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from "uuid"
import { useNavigate } from "react-router-dom"
import Spinner from '../components/Spinner'
import { toast } from "react-toastify"

function CreateListing() {
    //eslint-disbale-next-line
    const [geolocationEnabled, setGeoLocationEnabled] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: [],
        latitude: 0,
        longitude: 0
    })

    const {
        type, 
        name, 
        bedrooms, 
        bathrooms, 
        parking, 
        furnished, 
        address, 
        offer, 
        regularPrice, 
        discountedPrice, 
        images, 
        latitude, 
        longitude
    } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const isMounted = useRef(true) //Use to avoid memory leak

    useEffect(() => {
        if(isMounted) {
            //This function is used to check the state of the user whether he's logged in or not
            //auth is used to call the loggedin user
            onAuthStateChanged(auth, (user) => {
                if(user) {
                    setFormData({...formData, userRef: user.uid})
                } else {
                    navigate('/sign-in')
                }
            })
        }
        return () => {
            isMounted.current = false
        }
        //eslint-disbale-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    if(loading) {
        return <Spinner />
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)


        if(discountedPrice >= regularPrice) {
            setLoading(false)
            toast.error("Discounted price needs to be less than regular price")
            return
        }

        //Store image in firebase
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage()

                //Reference to where our image will be located in the firebase storage
                const storageRef = ref(storage, `images/ ${auth.currentUser.uid}-${image.name}-${uuidv4()}`)
                
                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed', (snapshot) => {
                    //Checking our progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                    console.log("Upload is " + progress + "% done")

                    switch(snapshot.state) {
                        case "paused": 
                            console.log("Upload is paused")
                            break
                        case "running":
                            console.log("Upload is running")
                            break
                        default:
                            break
                    }
                },
                (error) => {
                    reject(error)
                },

                //An expression we use to resolve our image
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL)
                    })
                }
                )
            })
        }

        //The array of images is empty at default stage
        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false)
            toast.error("Images not uploaded")
        })

        setLoading(false)

        const formDataCopy = {
            ...formData,
            imgUrls,
            timestamp: serverTimestamp()
        }

        formDataCopy.location = address
        delete formDataCopy.images
        delete formDataCopy.address
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        await addDoc(collection(db, "listings"), formDataCopy)
        setLoading(false)
        toast.success("Listing saved")
        navigate('/')
    }

    const onMutate = (e) => {
        let boolean = null

        if(e.target.value === "true") {
            boolean = true
        }

        if(e.target.value === "false") {
            boolean = false
        }

        //Files
        if(e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }

        //Text/ Booleans/ Numbers
        if(!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value //nullish coalescing
            }))
        }
    }

  return (
    <div className='profile'>
        <header>
            <p className="pageHeader">Create a Listing</p>
        </header>

        <main>
            <form onSubmit={onSubmit}>
                <label className='formLabel'>Sell / Rent</label>
                <div className="formButtons">
                    <button 
                        type='button' 
                        className={type === "sale" ? "formButtonActive" : "formButton"} 
                        id="type"
                        value="sale"
                        onClick={onMutate}
                    >
                        Sell
                    </button>
                    <button 
                        type='button' 
                        className={type === "rent" ? "formButtonActive" : "formButton"} 
                        id="type"
                        value="rent"
                        onClick={onMutate}
                    >
                        Rent
                    </button>
                </div>

                <label className='formLabel'>Name</label>
                <input 
                    className='formInputName'
                    type="text"
                    id="name"
                    value={name}
                    onChange={onMutate}
                    maxLength="32"
                    minLength="10"
                    required
                />

            <div className="formRooms flex">
                <div>
                    <label className="formLabel">Bedrooms</label>
                    <input 
                        className='formInputSmall'
                        type="number"
                        id="bedrooms"
                        value={bedrooms}
                        onChange={onMutate}
                        min="1"
                        max="50"
                        required
                    />
                </div>
                <div>
                    <label className="formLabel">Bathrooms</label>
                    <input 
                        className='formInputSmall'
                        type='number'
                        id="bathrooms"
                        value={bathrooms}
                        onChange={onMutate}
                        min="1"
                        max="50"
                        required
                    />
                </div>
            </div>

            <label className='formLabel'>Parking spot</label>
            <div className="formButtons">
                <button
                    className={parking ? "formButtonActive" : "formButton"}
                    type="button"
                    id="parking"
                    value={true}
                    onClick={onMutate}
                    min="1"
                    max="50"
                >
                    Yes
                </button>

                <button
                    className={!parking && parking !== null ? "formButtonActive" : "formButton"}
                    type="button"
                    id="parking"
                    value={false}
                    onClick={onMutate}
                >
                    No
                </button>
            </div>

            <label className='formLabel'>Furnished</label>
            <div className="formButtons">
                <button
                    className={furnished ? "formButtonActive" : "formButton"}
                    type="button"
                    id="furnished"
                    value={true}
                    onClick={onMutate}
                >
                    Yes
                </button>
                <button
                    className={!furnished && furnished !== null ? "formButtonActive" : "formButton"}
                    type="button"
                    id="furnished"
                    value={false}
                    onClick={onMutate}
                >
                    No
                </button>
            </div>

            <label className="formLabel">Address</label>
            <textarea 
                className="formInputAddress" 
                id="address"
                value={address}
                onChange={onMutate}
                required
            />
            {!geolocationEnabled && (
                <div className="formLatLng flex">
                    <div>
                        <label className="formLabel">Latitude</label>
                        <input 
                            type="number" 
                            className="formInputSmall"
                            id='latitude'
                            value={latitude}
                            onChange={onMutate}
                            required
                        />
                    </div>
                    <div>
                        <label className="formLabel">Longitude</label>
                        <input 
                            type="number" 
                            className="formInputSmall" 
                            id="longitude"
                            value={longitude}
                            onChange={onMutate}
                            required
                        />
                    </div>
                </div>
            )}

            <label className='formLabel'>Offer</label>
            <div className="formButtons">
                <button
                    className={offer ? "formButtonActive" : "formButton"}
                    type="button"
                    id="offer"
                    value={true}
                    onClick={onMutate}
                >
                    Yes
                </button>
                <button
                    className={!offer && offer !== null ? "formButtonActive" : "formButton"}
                    type="button"
                    id="offer"
                    value={false}
                    onClick={onMutate}
                >
                    No

                </button>
            </div>

            <label className="formLabel">Regular Price</label>
            <div className="formPriceDiv">
                <input 
                    type="number" 
                    className="formInputSmall" 
                    id='regularPrice'
                    value={regularPrice}
                    onChange={onMutate}
                    min="50"
                    max="750000000"
                    required    
                />
                {type === "rent" && (
                    <p className="formPriceText">$ /Month</p>
                )}
            </div>
                
              {offer && (
                <>
                    <label className='formLabel'>Discounted Price</label>
                    <input 
                        type="number" 
                        className="formInputSmall" 
                        id='discountedPrice'
                        value={discountedPrice}
                        onChange={onMutate}
                        min="50"
                        max="75000000"
                        required={offer}
                        />
                </>
              )}  
            
            <label className="formLabel">Images</label>
            <p className="imagesInfo">The first image will be the cover (max 6).</p>
            <input 
                type="file" 
                className="formInputFile" 
                id="images"
                onChange={onMutate}
                max="6"
                accept='.jpg,.png,.jpeg'
                multiple
                required
                />

                <button className="primaryButton createListingButton">Create Listing</button>
            </form>
        </main>
    </div>
  )
}

export default CreateListing