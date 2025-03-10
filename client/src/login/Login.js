import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom'
import { ClipLoader } from "react-spinners";

// import { Button } from '@shadcn/ui'

import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthProvider'

const Login = ()=> {
  const [formData, setFormData] = useState({username:'', password:''})
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [errorMsg]);

  useEffect(()=>{
    if(successMsg){
      console.log("Success message set, starting redirect timeout...");
      const timer = setTimeout(() => {
        console.log("Redirecting to /chat...");
        navigate('/chat')
      }, 1500);  // Wait 1.5 sec before redirecting
      return () => clearTimeout(timer);
    }

  }, [successMsg, navigate])


  const onFormDataChange=(e)=>{
    const {value, name} = e.target
    setFormData((formData)=> ({...formData,[name]:value}))
  }

  const onFormSubmit= async (e)=> {
    e.preventDefault()

    // TODO: Handle login logic (validation, etc.)
    // Prevent submission if fields are empty
    if (!formData.username.trim() || !formData.password.trim()) {
      setErrorMsg("Username and password are required");
      return;
    }

    console.log("Login Data:", formData);
    setLoading(true);
    setErrorMsg('');

    try{
      const response =  await fetch(`${API_BASE_URL}/api/login`, {
        method:"POST",
        headers:{ "Content-Type": "application/json" },
        body:JSON.stringify(formData)
      })

      if(!response.ok){
        const errorData = await response.json();
        switch(response.status){
          case 401:
            throw new Error(errorData.msg || 'Invalid credentials')
          case 400:
            throw new Error(errorData.msg || "Invalid input. Please check your details and try again.")
          case 404:
            throw new Error("Server not found. Please try again later.")
          case 500:
            throw new Error("Internal server error. Please try again in a few minutes.");
          default:
            throw new Error("An unexpected error occurred. Please try again.");
      }}

      const data = await response.json()
      console.log("Login successful")
      //TODO: get token and username from backend then login(using login function in auth context)
      login(data.username, data.token)

      setSuccessMsg("Login successful! Redirecting...");

    }catch(err){
      if (err.message.includes("Failed to fetch")) {
        setErrorMsg("Network error. Check your internet connection and try again.");
      } else {
        setErrorMsg(err.message);
      }
    } finally{
      setLoading(false);
    }
  }

  return(<div>
    <h1 className="text-2xl font-bold underline text-blue-500">
      Hello world!
    </h1>
    {/* <div className="p-4">
      <Button variant="default">Click Me</Button>
    </div> */}
    <form onSubmit={onFormSubmit}>
      <label>
        Username
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onFormDataChange}
          placeholder="Type your username"
          autoComplete="off"
          >
        </input>
      </label>
      <label >
        Password
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onFormDataChange}
          placeholder="Type your password"
          autoComplete="off"
        >
        </input>
      </label>
      <button type="submit" disabled={loading}>
      {loading ? <ClipLoader size={15} color="#ffffff" /> : "Login"}
      </button>
    </form>
    {errorMsg && <p style={{color:'red'}} aria-live="assertive" >{errorMsg}</p>}
    {successMsg && <p style={{ color: 'green' }} aria-live="polite">{successMsg}</p>}
    <br/> or
    <div><Link to='/signup'>Create an Account</Link></div>
  </div>)

}

export default Login;