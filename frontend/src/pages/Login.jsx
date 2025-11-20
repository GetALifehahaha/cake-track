import React, { useContext, useState } from 'react';
import { Button, Label, Title } from '../components/atoms';
import { useNavigate } from 'react-router-dom'
import loginImage1 from '../assets/image/login-image-1.webp'
import loginImage2 from '../assets/image/login-image-2.png'
import loginImage3 from '../assets/image/login-image-3.png'
import { AuthContext } from '@/context/AuthContext';

const Login = () => {

    const {login} = useContext(AuthContext)
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSetUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value);
    }
    const handleSetPassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value);
    }
    
    const handleLogin = async () => {
        try {
            await login(username, password);
            navigate('/')
        } catch (err) {
            alert(err)
        }
    }

    return (
        <div className='flex flex-row bg-main w-full h-screen'>
            {/* Left Side */}
            <div className='flex-1 flex flex-col justify-center items-center'>
                <div className='flex flex-col justify-between items-center h-2/3 w-full my-auto'>
                    <div className='flex flex-col gap-4 items-center'>
                        <Title variant='form' text='Hello, Friend!'/>
                        <h5 className='text-text text-sm'>Please enter your details</h5>
                    </div>

                    <div className='flex flex-col gap-6 items-center w-4/5'>
                        <button className='flex justify-between items-center rounded-2xl px-4 py-2 border-accent-mute border-4 w-1/2'>
                            <img
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google logo"
                                className="w-5 h-5"
                            />
                            <span className="text-gray-700 font-medium">Continue with Google</span>
                            <div></div>
                        </button>

                        <h5 className='text-sm font-semibold'>OR</h5>
                    </div>

                    <div className='flex flex-col gap-8 w-3/5'>   
                        <div className='flex flex-col gap-4'>
                            <Label variant='login' text='EMAIL' />
                            <input value={username} onChange={(e) => handleSetUsername(e)} className='py-2 px-1 border-b border-b-text/75 focus:outline-none focus:bg-border/50 focus:border-main focus:rounded-sm' placeholder='dummycashier'/>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <Label variant='login' text='PASSWORD' />
                            <input value={password} onChange={(e) => handleSetPassword(e)} className='py-2 px-1 border-b border-b-text/75 focus:outline-none focus:bg-border/50 focus:border-main focus:rounded-sm' placeholder='dummy_dummy'/>
                        </div>
                        <span className='flex flex-row items-center gap-2'>
                            <input type='checkbox' />
                            <label>Remember me</label>
                        </span>
                        
                        <span className='w-4/5 mx-auto'>
                            <Button text='Login' variant='form' onClick={handleLogin}/>
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className='flex-1 flex items-center justify-center'>
                <div className='flex gap-8 h-2/3'>
                    <img src={loginImage1} className='w-1/3 object-cover rounded-2xl' />

                    <div className='w-1/3 flex flex-col'>
                        <img src={loginImage2} className='object-cover h-1/2 rounded-2xl pb-4' />
                        <img src={loginImage3} className='object-cover h-1/2 rounded-2xl pt-4' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;
