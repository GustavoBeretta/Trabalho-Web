'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import bcrypt from 'bcryptjs';
import NavBar from "../components/NavBar";
import Swal from 'sweetalert2';

export default function Cadastro() {

  // função que checa se o email digitado já foi cadastrado
  async function checkIfEmailIsRegistered(email) {
    const response = await fetch("https://rental-request-app.vercel.app/api/users");
    const usuarios = await response.json();
    const check = await usuarios.users.some((usuario) => usuario.email === email);
    return check;
  }

  // função para criptografar a senha
  function getHashPassword(senha) {
      return bcrypt.hash(senha, 10);
  }

  const router = useRouter();

  const postUsers = async (event) => {
    event.preventDefault();

    // obtém os valores digitados no formulário
    const fullName = document.getElementById("name").value;
    const email = document.getElementById("email").value.toLowerCase();
    const password = document.getElementById("password").value;
    const passwordConfirmation = document.getElementById("passwordConfirmation").value;
    const gender = document.getElementById("gender").value;
    const shoeSize = document.getElementById("shoeSize").value;
    const age = document.getElementById("age").value;
    const weight = document.getElementById("weight").value;
    const height = document.getElementById("height").value;
    const role = "guest";

    // checa se o email ja foi digitado
    if (await checkIfEmailIsRegistered(email)) {
      Swal.fire('Email already registered', '', 'warning')
     return;
    }
     
    // checa se as senhas digitadas batem entre si
    if (password !== passwordConfirmation) {
      Swal.fire('Passwords do not match', '', 'warning')
      return;
    }

    // criptografa a senha digitada
    const hashPassword =  await getHashPassword(password);

    // objeto com os dados do usuário
    const dadosCadastro = {
      name: fullName,
      email: email,
      password: hashPassword,
      gender: gender,
      shoeSize: shoeSize,
      age: age,
      weight: weight,
      height: height,
      role: role
    }

    // converte para JSON
    const dadosCadastroJson = JSON.stringify(dadosCadastro);

    try {
      // requisição para criar um novo usuário
      const res = await fetch('https://rental-request-app.vercel.app/api/users', {
        cache: "no-store",
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: dadosCadastroJson
      });
      if (!res.ok) {
        throw new Error("Failed to fetch the users")
      }
      Swal.fire('Account created!', '', 'success')
      router.push('/');

    } catch (error) {
      console.log("Error loading topics: ", error)
    }
  }

  // inputs disponíveis no formulário
  const inputs = [
    { label: "FULL NAME:", name: "name", type: "text" },
    { label: "EMAIL:", name: "email", type: "email" },
    { label: "PASSWORD:", name: "password", type: "password" },
    { label: "PASSWORD CONFIRMATION:", name: "passwordConfirmation", type: "password" },
    { label: "GENDER:", name: "gender", type: "select", options: ["Male", "Female"] },
    { label: "US SHOE SIZE:", name: "shoeSize", type: "number" },
    { label: "AGE:", name: "age", type: "number" },
    { label: "WEIGHT (KG):", name: "weight", type: "number" },
    { label: "HEIGHT (CM):", name: "height", type: "number" },
];

  return (
    <div>
      <NavBar/>
      <main className="mt-8">
        <section className="flex flex-col items-center justify-center px-6 py-8 lg:py-0 snap-none">
          <h1 className="text-4xl text-[#8F8E8E] pt-6">Create New Account</h1>
          <p className="text-l text-[#4094A5] mt-4">
            <a href="/" className="text-sm font-medium text-[#4094A5] hover:underline hover:text-black">Already registered? Sign in</a>
          </p>
          <div className="flex items-center content-center flex-col w-6/12">
            <form className="w-full bg-white rounded-lg p-6 space-y-4 sm:p-8" onSubmit={postUsers}>
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
                          required
                      >
                          <option value="" disabled defaultValue>Select an option</option>
                          {input.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                          ))}
                      </select>
                  ) : (
                      <input
                          type={input.type || 'text'}
                          name={input.name}
                          id={input.name}
                          className="bg-[#ECECEC] border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                          required
                      />
                  )}
              </div>
          ))}
              <div className="flex justify-center">
                <button type="submit" className="bg-[#4094A5] hover:bg-[#81C9D8] text-white font-semibold text-lg rounded-lg p-2.5 w-8/12 mt-4 mb-4">Sign up</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
