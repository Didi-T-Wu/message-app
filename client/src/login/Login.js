import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'

const Login = ()=> {
  const [formData, setFormData] = useState({username:'', password:''})
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [errorMsg]);


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
      const response =  await fetch("http://localhost:5000/api/login", {
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
            throw new Error(errorData.msg || 'Bad request, check your input')
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
      localStorage.setItem('user_id', data.user_id);
      navigate('/chat')


    }catch(err){
       setErrorMsg(err.message)
    } finally{
      setLoading(false);
    }
  }

  return(<div>
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
      {loading? "Logging in...":"Login"}
      </button>
    </form>

    {errorMsg && <p style={{color:'red'}} aria-live="assertive" >{errorMsg}</p>}

    <br/> or
    <div><Link to='/signup'>Create an Account</Link></div>
  </div>)

}

export default Login;