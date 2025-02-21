import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

const Login = ()=> {
  const [formData, setFormData] = useState({username:'', password:''})
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate()

  const onFormDataChange=(e)=>{
    const {value, name} = e.target
    setFormData((formData)=> ({...formData,[name]:value}))
  }

  const onFormSubmit= async (e)=> {
    e.preventDefault()
    // TODO: Handle login logic (validation, etc.)
    console.log("Login Data:", formData);
    setErrorMsg('');

    try{
      const response =  await fetch("http://localhost:5000/api/login", {
        method:"POST",
        headers:{ "Content-Type": "application/json" },
        body:JSON.stringify(formData)
      })

      if(!response.ok){
        switch(response.status){
          case 401:
            throw new Error('Invalid credentials')
          case 400:
            throw new Error('Bad request, check your input')
          case 404:
            throw new Error('Endpoint not found')
          case 500:
            throw new Error('Server error, please try again later');
          default:
            throw new Error('Something went wrong');
      }}

      const data = await response.json()
      console.log("Login successful")
      localStorage.setItem('token', data.token)
      navigate('/chat')


    }catch(err){
       setErrorMsg(err.message)
    }

  }

  return(<div>
    <form onSubmit={onFormSubmit}>
      <label htmlFor='username'>Username</label>
      <input
       type="text"
       name="username"
       id="username"
       value={formData.username}
       onChange={onFormDataChange}
       placeholder="Type your username"
       autoComplete="off"
      >
      </input>
      <label htmlFor='password'>Password</label>
      <input
       type="password"
       name="password"
       id='password'
       value={formData.password}
       onChange={onFormDataChange}
       placeholder="Type your password"
       autoComplete="off"
      >
      </input>
      <button>Login</button>
    </form>

    {errorMsg && <p style={{color:'red'}}>{errorMsg}</p>}

    <br/> or
    <div><Link to='/signup'>Create an Account</Link></div>
  </div>)

}

export default Login;