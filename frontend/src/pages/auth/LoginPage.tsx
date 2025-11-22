import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/share/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";

export function LoginPage() {
  const [userEmail, setUserEmail] = useState("");
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
          userEmail,
          password,
        },
      );

      const data = response.data;
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("auth", JSON.stringify(data));

      if (data.role === 1) {
        navigate("/admin/dashboard");
      } else if (data.role === 2) {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "ログインに失敗しました。入力内容をご確認ください。",
      );
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
      <div className="w-full max-w-3xl px-4">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex size-16 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-slate-200">
            LOGO
          </div>
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold text-white">ログイン</p>
            <span className="block h-px w-16 bg-slate-700" />
          </div>
        </div>

        <Card className="w-full border-slate-800 bg-slate-900/70 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur">
          <CardHeader />

          <form onSubmit={handleLogin} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-200">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.target.value)}
                  className="border-slate-700 bg-slate-900/40 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-200">
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="border-slate-700 bg-slate-900/40 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
                />
                <Label htmlFor="remember" className="text-sm text-slate-300">
                  ログイン情報を記憶する
                </Label>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-400">{error}</p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-cyan-500 text-white hover:bg-cyan-400"
              >
                ログイン
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-700 text-white hover:bg-white/10"
                onClick={() => navigate("/register")}
              >
                新規登録
              </Button>
              <p className="text-center text-sm text-slate-400">
                アカウントをお持ちでない方は登録してください
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
