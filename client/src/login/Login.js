import React, { useState } from "react";
import { Link } from 'react-router-dom'
const Login = ()=> {
  const [formData, setFormData] = useState({username:'', password:''})

  const onFormDataChange=(e)=>{

    const {value, name} = e.target

    setFormData((formData)=> ({...formData,[name]:value}))

  }

  const onFormSubmit=(e)=>{
    e.preventDefault()
    // TODO: Handle login logic (API call, validation, etc.)
    console.log("Login Data:", formData);
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
    <br/> or
    <div><Link to='/signup'>Create an Account</Link></div>
  </div>)

}

export default Login;