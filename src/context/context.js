import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';
const GithubContext=React.createContext()


const GithubProvider=({children})=>{
    const [githubUser,setGithubUser]=useState(mockUser)
    const [repos,setRepos]=useState(mockRepos)
    const [followers,setFollowers]=useState(mockFollowers)
    const[isLoading,setIsLoading]=useState(false)
    const [requests,setRequests]=useState(0)
    const[error,setError]=useState({show:false,msg:""})
    //errors
    //check rate

    const searchGithubUsers=async(user)=>{
   //toggleError
   //setLoading(true)
   toggleError()
   setIsLoading(true)
   const response=await axios(`${rootUrl}/users/${user}`).catch(err=>console.log(err))
   console.log(response)
   if(response){
       setGithubUser(response.data)
       const {login,followers_url}=response.data
     
       //more logic
       //repos
       //https://api.github.com/users/john-smilga/repos?per_page=100
       //followers
       //https://api.github.com/users/john-smilga/followers
       await Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`),axios(`${followers_url}?per_page=100`)]).then((results)=>{
           const [repos,followers]=results
           const status='fulfilled';
           if(repos.status===status){
               setRepos(repos.value.data)
           }
           if(followers.status===status){
               setFollowers(followers.value.data)
           }
       }).catch(err=>console.log(err))
   }else{
       toggleError(true,'there is no user')
   }
   checkRequests()
   setIsLoading(false)
    }
    const checkRequests=()=>{
        axios(`${rootUrl}/rate_limit`)
        .then(({data})=>{
            let {
                rate:{remaining},
            }=data;
                setRequests(remaining)
             if(remaining===0){
                toggleError(true,'sorry,you have exceeded you hourly rate')
             
            }
        })
        .catch((err)=>console.log(err))
    }

    function toggleError(show=false,msg=''){
        setError({show,msg})
    }

    useEffect(checkRequests,[])

    return (
        <GithubContext.Provider value={{
            githubUser,
            repos,
            followers,
            requests,
            error,
            searchGithubUsers,
            isLoading,
            }}>

            {children}
        </GithubContext.Provider>
    )
}


export{GithubProvider,GithubContext}