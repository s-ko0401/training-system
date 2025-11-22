import { useNavigate } from "react-router-dom";
import { Button } from "@/share/ui/button";

interface UserHeaderInfoProps {
    user: {
        userName: string;
    };
}

export function UserHeaderInfo({ user }: UserHeaderInfoProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("auth");
        sessionStorage.removeItem("auth");
        navigate("/login");
    };

    return (
        <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>こんにちは、{user.userName} さん</span>
            <Button variant="outline" onClick={handleLogout}>
                ログアウト
            </Button>
        </div>
    );
}
