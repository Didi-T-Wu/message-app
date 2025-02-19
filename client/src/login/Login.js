import React, { useState } from "react";

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
      >
      </input>
      <button>Login</button>
    </form>
    <br/> or
    {/* FIXME:  react router to sign in page*/}
    <div>Create an Account (To sign in page)</div>
  </div>)

}

export default Login;