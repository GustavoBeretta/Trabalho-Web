'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import NavBar from "../../../components/NavBar";
import Swal from 'sweetalert2';

export default function RentalRequestInformation({params}) {
    const [rentalRequestData, setRentalRequestData] = useState(null);
    const [buttonText, setButtonText] = useState("Cancel");

    const router = useRouter();
    const id = params.id

    const topButtonHandler = () => {
        router.push('/rental-requests');
    }

    useEffect(() => {
        const fetchRentalRequestData = async () => {
            try {
                const res = await fetch(`https://rental-request-app.vercel.app/api/rental-requests/${id}`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch the rental request");
                }
                const data = await res.json();
                setRentalRequestData(data.rentalRequest);
            } catch (error) {
                console.log("Error loading user data: ", error);
            }
        };

        fetchRentalRequestData();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();


        Swal.fire({
            title: "Attention!",
            text: "Are you sure you want to cancel this request?",
            icon: "question",
            showCancelButton:true,
            showConfirmButton:true,
            confirmButtonText:'Yes'
          }).then( async (result) => {
            if  (result.isConfirmed) { 
                try {
                    const res = await fetch(`https://rental-request-app.vercel.app/api/rental-requests/${rentalRequestData._id}`, {
                        cache: "no-store",
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        },
                        body: rentalRequestDataJson
                    });
                    if (!res.ok) {
                        throw new Error("Failed to cancel the rental request");
                    }
                    setButtonText("Canceled");
                    document.getElementById("submit").disabled = true;
                } catch (error) {
                    console.log("Error canceling the rental request: ", error);
                }
        
                router.push('/rental-requests');
                    
                }            
          });


        const rentalRequestDataCanceled = {...rentalRequestData, status: 'canceled'};
        const { createdAt, updatedAt, __v, _id, ...cleanedData } = rentalRequestDataCanceled;
        const rentalRequestNewData = {
            newUserId: cleanedData.userId,
            newNameUser: cleanedData.nameUser,
            newGender: cleanedData.gender,
            newShoeSize: cleanedData.shoeSize,
            newAge: cleanedData.age,
            newWeight: cleanedData.weight,
            newHeight: cleanedData.height,
            newSport: cleanedData.sport,
            newStatus: cleanedData.status,
            newSki_Board: cleanedData.ski_board,
            newBoots: cleanedData.boots,
            newHelmet: cleanedData.helmet
        }
        const rentalRequestDataJson = JSON.stringify(rentalRequestNewData);
    }

    const inputs = [
        { label: "Full Name", name: "nameUser", type: "text" },
        { label: "Sport", name: "sport", type: "text" },
        { label: "Date", name: "date", type: "text" },
        { label: "Time", name: "time", type: "text" },
        { label: "Status", name: "status", type: "text" },
        { label: "Gender", name: "gender", type: "select", options: ["Male", "Female"] },
        { label: "Shoe size", name: "shoeSize", type: "number" },
        { label: "Age", name: "age", type: "number" },
        { label: "Weight (KG)", name: "weight", type: "number" },
    ];

    return (
        <div>
            <NavBar showGuestHomeIcon={true} />
            <main className="mt-10">
                <section className="flex flex-col items-center justify-center snap-none">
                    <div className='mt-6 flex flex-col items-center md:flex-row md:justify-items-center md:place-items-center'>
                        <h1 className="lg:text-4xl text-2xl text-[#8F8E8E]">Rental Request Information</h1>
                        <button class="flex ml-4 items-center justify-center w-10 h-10 text-white bg-[#81C9D8] rounded-full shadow-lg hover:bg-[#3a7885] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 p-1" onClick={topButtonHandler}>
                                <img className="w-full h-full rounded-full object-cover" src="/voltar.png" alt="Log Out Icon" />
                            </button>
                    </div>
                    <div className="flex items-center content-center flex-col lg:w-6/12 ">
                        <form className="w-full rounded-lg space-y-4 sm:p-8" onSubmit={handleSubmit}>
                            {inputs.map((input) => (
                                <div key={input.name}>
                                    <label htmlFor={input.name} className="block mb-1 text-sm font-medium text-[#8F8E8E]">
                                        {input.label}
                                    </label>
                                    {input.options ? (
                                        <select
                                            name={input.name}
                                            id={input.name}
                                            className="bg-[#ECECEC] border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                            disabled
                                        >
                                            <option value="" disabled defaultValue>Selecione uma opção</option>
                                            {input.options.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={input.type || 'text'}
                                            name={input.name}
                                            id={input.name}
                                            defaultValue={
                                                rentalRequestData ?
                                                    (input.name === 'date' ? formatDate(rentalRequestData.createdAt) :
                                                        input.name === 'time' ? formatTime(rentalRequestData.createdAt) :
                                                            rentalRequestData[input.name])
                                                    : ''
                                            }
                                            className="bg-[#ECECEC] border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                            readOnly
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex flex-col space-y-4">
                                <div className="text-sm font-medium text-[#8F8E8E]">INCLUDES :</div>
                                <div className="flex items-center">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="ski-board" checked={rentalRequestData?.ski_board} aria-describedby="ski-board" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" disabled />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="ski-board" className="text-[#8F8E8E]">SKI/BOARD</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="boots" checked={rentalRequestData?.boots} aria-describedby="boots" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" disabled />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="boots" className="text-[#8F8E8E]">BOOTS</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="helmet" checked={rentalRequestData?.helmet} aria-describedby="helmet" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" disabled />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="helmet" className="text-[#8F8E8E]">HELMET</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button id="submit" type="submit" className="bg-[#4094A5] hover:bg-[#81C9D8] text-white font-semibold text-lg rounded-lg p-2.5 w-8/12 mt-4 mb-4">{buttonText}</button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}