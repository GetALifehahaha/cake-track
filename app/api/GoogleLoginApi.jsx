import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

const GoogleLoginApi = () => {
    const navigate = useNavigate();

    const {googleLogin} = useAuth()
    const {addToast} = useToast();

    const handleSuccess = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;
            await googleLogin(token);

            navigate('/');
        } catch (err) {
            addToast('Google login failed. Please try again.', 'error');
        }
    }

    const handleError = () => {
        addToast('Google login was unsuccessful. Please try again.', 'error');
    }

    return (
        <GoogleLogin
            type="standard"
            text="continue_with"
            shape="pill"
            onSuccess={handleSuccess}
            onError={handleError}
        />
    )
}

export default GoogleLoginApi;