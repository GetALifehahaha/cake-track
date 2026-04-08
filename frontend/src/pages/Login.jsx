import React, { useContext, useState } from 'react';
import { Button, Label, Title } from '../components/atoms';
import { Link } from 'react-router-dom'
import loginImage1 from '../assets/image/login-image-1.webp'
import loginImage2 from '../assets/image/login-image-2.png'
import loginImage3 from '../assets/image/login-image-3.png'
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Loader2, Eye, EyeClosed } from 'lucide-react';
import GoogleLoginApi from '@/api/GoogleLoginApi';

const Login = () => {

    const { login } = useContext(AuthContext)
    const { addToast } = useToast();
    const [username, setUsername] = useState(JSON.parse(localStorage.getItem('username')) || '');
    const [password, setPassword] = useState();
    const [rememberMe, setRememberMe] = useState(() => {
        const stored = localStorage.getItem('rememberMe');
        return stored ? JSON.parse(stored) : false;
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSetUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value);
    }
    const handleSetPassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value);
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true)

        if (rememberMe) {
            localStorage.setItem('rememberMe', JSON.stringify(true));
            localStorage.setItem('username', JSON.stringify(username));
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('username');
        }

        try {
            const res = await login(username, password);

            if (!res.success) {
                addToast('Invalid username or password', 'error');
            }
        } catch {
            addToast('Something went wrong. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-row bg-main w-full h-screen'>
            {/* Left Side */}
            <div className='flex-1 flex flex-col justify-center items-center'>
                <div className='flex flex-col justify-between items-center h-2/3 w-full my-auto'>
                    <div className='flex flex-col gap-4 items-center'>
                        <Title variant='form' text='Hello, Friend!' />
                        <h5 className='text-text text-sm'>Please enter your details</h5>
                    </div>

                    <div className='flex flex-col gap-6 items-center w-4/5'>
                        <GoogleLoginApi />

                        <h5 className='text-sm font-semibold'>OR</h5>
                    </div>

                    <form onSubmit={handleLogin} className='flex flex-col gap-8 w-3/5'>
                        <div className='flex flex-col gap-4'>
                            <Label variant='login' text='USERNAME' />
                            <input type='text' value={username} onChange={(e) => handleSetUsername(e)} className='py-2 px-1 border-b border-b-text/75 focus:outline-none focus:bg-border/50 focus:border-main focus:rounded-sm' placeholder='Input your username' />
                        </div>
                        <div className='flex flex-col gap-4'>
                            <Label variant='login' text='PASSWORD' />
                            <div className='flex gap-2 w-full'>
                                {showPassword ?
                                    <input type='text' value={password} onChange={(e) => handleSetPassword(e)} className='flex-1 py-2 px-1 border-b border-b-text/75 focus:outline-none focus:bg-border/50 focus:border-main focus:rounded-sm' placeholder='Input your password' />
                                    :
                                    <input type='password' value={password} onChange={(e) => handleSetPassword(e)} className='flex-1 py-2 px-1 border-b border-b-text/75 focus:outline-none focus:bg-border/50 focus:border-main focus:rounded-sm' placeholder='Input your password' />
                                }

                                <button type='button' className='p-1.5 bg-main cursor-pointer text-text/50' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ?
                                        <Eye />
                                        :
                                        <EyeClosed />
                                    }
                                </button>
                            </div>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='flex flex-row items-center gap-2'>
                                <input type='checkbox' checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                <label className='font-semibold text-accent-mute'>Remember me</label>
                            </span>
                            <Link to='/forgotPassword' className='text-accent-text hover:underline hover:underline-offset-1'> Forgot Password</Link>
                        </div>

                        <span className='w-4/5 mx-auto flex gap-2 items-center justify-center'>
                            {loading ?
                                <>
                                    <h5 className='text-accent font-semibold'>Logging In</h5>
                                    <Loader2 size={14} className='text-accent animate-spin' />
                                </>
                                :
                                <Button type='submit' className='bg-accent' text='Login' variant='form' onClick={handleLogin} />
                            }
                        </span>
                    </form>
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
