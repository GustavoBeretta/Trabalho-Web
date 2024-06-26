'use client';

import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import NavBar from "../../components/NavBar";
import Swal from 'sweetalert2';

export default function EditAccount({params}) {
    // armazena os dados do usuário logado
    const [userData, setUserData] = useState({});
    //armazena os dados a serem cadastrados
    const [dadosCadastro, setDadosCadastro] = useState({});

    // pega o id do usuário a ser editado
    const id = params.id;
    const router = useRouter();

    //impede que guests acessem essa página
    useEffect(() => {
        async function checkAccess() {
            const session = await getSession();
            if (!session || session.user.role !== 'employee') {
                router.push('/home');
            }
        }
        checkAccess();
    }, []);

    //criptografa a senha
    function getHashPassword(senha) {
        return bcrypt.hash(senha, 10);
    }

    // busca usuário pelo seu ID
    async function getUserID() {
        try {
            const res = await fetch(`https://rental-request-app.vercel.app/api/users/${id}`, {
                cache: "no-store"
            });
            if (!res.ok) {
                throw new Error("Failed to fetch the user information");
            }
            const userData = await res.json();
            setUserData(await userData.user);
        } catch (error) {
            console.log("Error loading user information: ", error);
        }
    }
    useEffect(() => {
        if (id) {
            getUserID();
        }
    }, [id]);

    const updateUser = async (event) => {
        event.preventDefault();

        // obtém os valores do formulário
        const fullName = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("newPassword").value;
        const passwordConfirmation = document.getElementById("newPasswordConfirmation").value;
        const gender = document.getElementById("gender").value;
        const shoeSize = document.getElementById("shoeSize").value;
        const age = document.getElementById("age").value;
        const weight = document.getElementById("weight").value;
        const height = document.getElementById("height").value;
        const employeeYes = document.getElementById("employee-Yes").checked ? "employee" : "guest";

        //verifica se os campos de senha foram preenchidos e se são iguais
        if (password && passwordConfirmation) {
            if (password !== passwordConfirmation) {       
                Swal.fire('Passwords do not match', '', 'error')
                return;
            }

            // criptografa a senha
            const hashPassword = await getHashPassword(password);

            // objeto com os novos dados a serem cadastrados
            const dadosCadastro = {
                newName: fullName,
                newEmail: email,
                newPassword: hashPassword,
                newGender: gender,
                newShoeSize: shoeSize,
                newAge: age,
                newWeight: weight,
                newHeight: height,
                newRole: employeeYes,
            }
            setDadosCadastro(JSON.stringify(dadosCadastro));
        } else {
            const dadosCadastro = {
                newName: fullName,
                newEmail: email,
                newPassword: userData.password,
                newGender: gender,
                newShoeSize: shoeSize,
                newAge: age,
                newWeight: weight,
                newHeight: height,
                newRole: employeeYes,
            };
            setDadosCadastro(JSON.stringify(dadosCadastro));
        }

        // requisição para alterar os dados
        try {
            const res = await fetch(`https://rental-request-app.vercel.app/api/users/${id}`, {
                cache: "no-store",
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: dadosCadastro
            });
            if (!res.ok) {
                throw new Error("Failed to update user information");
            }
            Swal.fire('User information updated successfully!', '', 'success')
            router.push('/usersRegistered');

        } catch (error) {
            console.log("Error updating user information:", error);
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCheckboxChange = (event) => {
        const { checked } = event.target;
        setUserData((prevState) => ({
            ...prevState,
            'role': checked ? 'employee' : 'guest',
        }));
    };

    // configura botão de voltar à tela anterior
    const topButtonHandler = () => {
        router.push('/usersRegistered');
    }

    // configura botão de exclusão de usuário
    const trashButtonHandler = async () => {
        Swal.fire({
            title: "Attention!",
            text: "Are you sure you want to delete the user?",
            icon: "warning",
            showCancelButton:true,
            showConfirmButton:true,
            confirmButtonText:'Yes'

          }).then( async (result) => {
            if  (result.isConfirmed) { 
                    try {
                        const res = await fetch(`https://rental-request-app.vercel.app/api/users/${id}`, {
                            cache: "no-store",
                            method: "DELETE",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        });
                        if (!res.ok) {
                            throw new Error("Failed to DELETE user information");
                        }
                        Swal.fire('User deleted!', '', 'success')
                        router.push('/usersRegistered');
        
                    } catch (error) {
                        console.log("Error deleting user information:", error);
                    }
                }            
          });

    }

    const inputs = [
        { label: "FULL NAME:", name: "name", type: "text" },
        { label: "EMAIL:", name: "email", type: "email" },
        { label: "NEW PASSWORD:", name: "newPassword", type: "password" },
        { label: "NEW PASSWORD CONFIRMATION:", name: "newPasswordConfirmation", type: "password" },
        { label: "GENDER:", name: "gender", type: "select", options: ["Male", "Female"] },
        { label: "US SHOE SIZE:", name: "shoeSize", type: "number" },
        { label: "AGE:", name: "age", type: "number" },
        { label: "WEIGHT (KG):", name: "weight", type: "number" },
        { label: "HEIGHT (CM):", name: "height", type: "number" },
        { label: "EMPLOYEE:", name: "employee", type: "checkbox", options: ["Yes"] },
    ];

    return (
        <div>
            <NavBar showEmployeeHomeIcon={true} />
            <main className="mt-10">
                <section className="flex flex-col items-center justify-center snap-none">
                    <div className='mt-6 flex flex-col items-center md:flex-row md:justify-items-center md:place-items-center'>
                    <button class="hidden lg:block mr-4 items-center justify-center w-10 h-10 text-teal-600 border border-[#81C9D8] rounded-full shadow-lg hover:bg-[#3a7885] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 p-1" onClick={trashButtonHandler}>
                        <img className="w-full h-full rounded-full object-cover" src="/lata-de-lixo.png" alt="Lixeira Icon" />
                    </button>
                        <h1 className="lg:text-4xl text-2xl text-[#8F8E8E]">Edit User Information</h1>
                        <div className='flex mt-4 mb-4'>
                            <button class="md:hidden flex mr-4 items-center justify-center w-10 h-10 text-teal-600  border border-[#81C9D8] rounded-full shadow-lg hover:bg-[#3a7885] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 p-1" onClick={trashButtonHandler}>
                            <img className="w-full h-full rounded-full object-cover" src="/lata-de-lixo.png" alt="Lixeira Icon" />
                            </button>
                            <button class="flex ml-4 items-center justify-center w-10 h-10 text-white bg-[#81C9D8] rounded-full shadow-lg hover:bg-[#3a7885] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 p-1" onClick={topButtonHandler}>
                                <img className="w-full h-full rounded-full object-cover" src="/voltar.png" alt="Voltar Icon" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center content-center flex-col lg:w-6/12 ">
                        <form className="w-full rounded-lg space-y-4 sm:p-8" onSubmit={updateUser}>
                            {inputs.map((input) => (
                                <div key={input.name}>
                                    <label htmlFor={input.name} className="block mb-1 text-sm font-medium text-[#8F8E8E]">
                                        {input.label}
                                    </label>
                                    {input.type === 'select' ? (
                                        <select
                                            name={input.name}
                                            id={input.name}
                                            value={userData[input.name] || ''}
                                            onChange={handleChange}
                                            className="bg-[#ECECEC] border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                            required
                                        >
                                            {input.options.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : input.type === 'checkbox' ? (
                                        <div>
                                            {input.options.map((option) => (
                                                <label key={option}>
                                                    <input
                                                        type="checkbox"
                                                        name={input.name}
                                                        id={`${input.name}-${option}`}
                                                        value={option}
                                                        checked={userData.role === 'employee'}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type={input.type || 'text'}
                                            name={input.name}
                                            id={input.name}
                                            defaultValue={userData ? userData[input.name] : ''}
                                            className="bg-[#ECECEC] border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-center">
                                <button type="submit" className="bg-[#4094A5] hover:bg-[#81C9D8] text-white font-semibold text-lg rounded-lg p-2.5 w-8/12 mt-4 mb-4">Save</button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}