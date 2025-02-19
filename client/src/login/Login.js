import React, { useState } from "react";

const Login = ()=> {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')



  const onUsernameChange=(e)=>{
    setUsername(e.target.value)

  }

  const onPasswordChange=(e)=>{
    setPassword(e.target.value)

  }

  const onFormSubmit=(e)=>{
    e.preventDefault()

  }

  return(<div>
    <form onSubmit={onFormSubmit}>
      <label htmlFor='username'>Username</label>
      <input
       type="text"
       name="text"
       id="username"
       value={username}
       onChange={onUsernameChange}
       placeholder="Type your username"
      >
      </input>
      <label htmlFor='password'>Password</label>
      <input
       type="password"
       name="password"
       id='password'
       value={password}
       onChange={onPasswordChange}
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