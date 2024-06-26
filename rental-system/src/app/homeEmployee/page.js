'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from "../components/NavBar";
import RentalRequestCardEmployee from '../components/RentalRequestCardEmployee';
import { useRouter } from 'next/navigation';

//pega as rental requests cadastradas no BD
const getRequests = async () => {
    try {
        const res = await fetch('https://rental-request-app.vercel.app/api/rental-requests', {
            cache: "no-store"
        });
        if (!res.ok) {
            throw new Error("Failed to fetch the rental requests");
        }
        return res.json();
    } catch (error) {
        console.error("Error loading rental requests: ", error);
        throw error;
    }
};

//trata as informações de data e horário
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
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

//abrevia nomes
const abbreviateName = (fullName) => {
    if (!fullName) return '';

    const nameParts = fullName.split(' ');
    if (nameParts.length === 1) return fullName;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleNames = nameParts.slice(1, -1).map(name => name.charAt(0) + '.').join(' ');

    return `${firstName} ${middleNames} ${lastName}`;
};

export default function HomeEmployee() {
    //pega os dados da sessão
    const { data: session, status } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRequests();
                setRequests(data.requests);
            } catch (error) {
                setError("Failed to load rental requests. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        // impede guests de acessarem a página
        if (status === 'authenticated' && session?.user?.role === 'guest') {
            router.push('/home');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [session, status, router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    //separa as requests de acordo com seu status
    const sentRequests = requests.filter(r => r.status === "sent");
    const inProgressRequests = requests.filter(r => r.status === "in-progress");
    const returnedRequests = requests.filter(r => r.status === "returned");
    const canceledRequests = requests.filter(r => r.status === "canceled");

    return (
        <div>
            <NavBar showLogOutIcon={true} showUsersIcon={true} />
            <main className="mt-10 flex flex-col items-center justify-between p-4">
                <div className="mb-10">
                    <h1 className="lg:text-4xl text-2xl text-[#8F8E8E] uppercase text-center">Rental Requests</h1>
                </div>
                <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 p-4">
                    <div className="flex flex-col items-center">
                        <h2 className="text-center text-xl">Sent</h2>
                        {sentRequests.map(r => (
                            <RentalRequestCardEmployee
                                key={r._id}
                                _id={r._id}
                                name={abbreviateName(r.nameUser)}
                                boots={r.boots}
                                helmet={r.helmet}
                                skiBoard={r.skiBoard}
                                date={formatDate(r.createdAt)}
                                time={formatTime(r.createdAt)}
                                sport={r.sport}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-center text-xl">In Progress</h2>
                        {inProgressRequests.map(r => (
                            <RentalRequestCardEmployee
                                key={r._id}
                                _id={r._id}
                                name={abbreviateName(r.nameUser)}
                                date={formatDate(r.createdAt)}
                                time={formatTime(r.createdAt)}
                                boots={r.boots}
                                helmet={r.helmet}
                                skiBoard={r.skiBoard}
                                sport={r.sport}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-center text-xl">Returned</h2>
                        {returnedRequests.map(r => (
                            <RentalRequestCardEmployee
                                key={r._id}
                                _id={r._id}
                                name={abbreviateName(r.nameUser)}
                                date={formatDate(r.createdAt)}
                                time={formatTime(r.createdAt)}
                                boots={r.boots}
                                helmet={r.helmet}
                                skiBoard={r.skiBoard}
                                sport={r.sport}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-center text-xl">Canceled</h2>
                        {canceledRequests.map(r => (
                            <RentalRequestCardEmployee
                                key={r._id}
                                _id={r._id}
                                name={abbreviateName(r.nameUser)}
                                date={formatDate(r.createdAt)}
                                time={formatTime(r.createdAt)}
                                boots={r.boots}
                                helmet={r.helmet}
                                skiBoard={r.skiBoard}
                                sport={r.sport}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
