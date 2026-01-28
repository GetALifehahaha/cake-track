import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const KeyboardShortcuts = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const keypressHandler = (e) => {
            const tag = e.target.tagName;

            if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return

            if (e.ctrlKey && e.key == 1) {
                e.preventDefault()
                navigate('/home')
            }
        }

        window.addEventListener("keydown", keypressHandler);

        return () => window.removeEventListener("keydown", keypressHandler)
    }, [navigate]);

    return null;
}

export default KeyboardShortcuts