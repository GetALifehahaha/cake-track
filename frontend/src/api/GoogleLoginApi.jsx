import { AuthContext } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";

const GoogleLoginApi = () => {
    const navigate = useNavigate();

    const {googleLogin} = useContext(AuthContext);
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