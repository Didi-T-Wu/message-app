import React,  { createContext, useState, useEffect }  from 'react';

const AuthContext = createContext()

const AuthProvider = ({children}) => {

  const [users, setUsers] = useState({}) // Store users as { username: token }
  const [curUser, setCurUser] = useState('') // Track current user(username) in this tab

  useEffect(()=> {
    // Load all logged-in users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('loggedInUsers')) || {}
    setUsers(storedUsers)

    // Load current user from sessionStorage(tab-specific)
    const storedCurUser = sessionStorage.getItem('curUser')
    if(storedCurUser && storedUsers[storedCurUser]){
      setCurUser(storedCurUser)
    }

  },[])

  const login = (username, token)=> {
    setUsers(prevUsers => {
     const updatedUsers = {...prevUsers, [username]:token}
     localStorage.setItem('loggedInUsers', JSON.stringify(updatedUsers))
     return updatedUsers
    })
    setCurUser(username)
    sessionStorage.setItem('curUser', username)
    localStorage.setItem(`token_${username}`, token)
  }

  const logout = (username)=> {
    setUsers(prevUsers => {
      const updatedUsers = {...prevUsers}
      delete updatedUsers[username]
      localStorage.setItem('loggedInUsers', JSON.stringify(updatedUsers))
      return updatedUsers
    });

    if (curUser === username){
      setCurUser('');
      sessionStorage.removeItem('curUser')
      localStorage.removeItem(`token_${username}`)
    }

  }

  const getCurUserToken =(username) => {
    return users[username]
  }

  return (
      <AuthContext.Provider value={{users, curUser, login, logout, getCurUserToken }}>
          {children}
      </AuthContext.Provider>
  );
}

export { AuthProvider , AuthContext }