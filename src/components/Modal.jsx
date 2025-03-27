import React from 'react'
import { IoClose } from "react-icons/io5";

const Modal = ({url, limit, setShowModal, showModal}) => {

    
  return (
    <div className='absolute top-2 right-2 p-4 bg-black text-white rounded-xl z-50'>
        <button className='absolute top-2 right-2 cursor-pointer' onClick={() => setShowModal(!showModal)}><IoClose /></button>
        <p>New Limit set on {`${url}`} for {`${limit}`}</p>
    </div>
  )
}

export default Modal