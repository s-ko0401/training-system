import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/share/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/share/ui/card";
import { Checkbox } from "@/share/ui/checkbox";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";

export function LoginPage() {
  const [companyId, setCompanyId] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          companyId,
          account,
          password,
        },
      );

      const user = response.data;
      if (remember) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      if (user.userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError("ログインに失敗しました。入力内容をご確認ください。");
      console.error(err);
    }
  };

  const handleCompanyIdChange = (event: ChangeEvent<HTMLInputElement>) =>
    setCompanyId(event.target.value);
  const handleAccountChange = (event: ChangeEvent<HTMLInputElement>) =>
    setAccount(event.target.value);
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  return (
    <div className="flex min-h-screen flex-col items-center bg-white">
      <div className="h-10 w-full bg-slate-900/80" />

      <div className="flex w-full flex-1 flex-col items-center px-4 py-10">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex size-16 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-600">
            LOGO
          </div>
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold text-slate-700">ログイン</p>
            <span className="block h-px w-16 bg-slate-200" />
          </div>
        </div>

        <Card className="w-full max-w-xl border-slate-200 shadow-sm">


          <form onSubmit={handleLogin} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-600 ">
                  アカウント
                </Label>
                <Input
                  id="email"
                  placeholder="アカウント"
                  value={account}
                  onChange={handleAccountChange}
                  className="bg-slate-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-600">
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={handlePasswordChange}
                  className="bg-slate-100"
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full bg-slate-400 text-white hover:bg-slate-500">
                ログイン
              </Button>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
}
