import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/share/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";

export function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("USER");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        userName,
        userAccount,
        userPassword,
        userRole,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data || "登録に失敗しました。");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black via-slate-900 to-slate-950" />
      <Card className="w-full max-w-lg border-slate-800 bg-slate-900/70 text-slate-100 shadow-2xl shadow-black/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">新規登録</CardTitle>
          <CardDescription className="text-slate-300">
            アカウント情報を入力してください。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">氏名</Label>
                <Input
                  id="name"
                  placeholder="例：山田太郎"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border-slate-700 bg-slate-900/40 text-white"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="account">ユーザーID</Label>
                <Input
                  id="account"
                  placeholder="例：mentor001"
                  value={userAccount}
                  onChange={(e) => setUserAccount(e.target.value)}
                  className="border-slate-700 bg-slate-900/40 text-white"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上で入力"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="border-slate-700 bg-slate-900/40 text-white"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">役割</Label>
                <Select onValueChange={setUserRole} defaultValue={userRole}>
                  <SelectTrigger
                    id="role"
                    className="border-slate-700 bg-slate-900/40 text-white"
                  >
                    <SelectValue placeholder="役割を選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-slate-100">
                    <SelectItem value="USER">学習者</SelectItem>
                    <SelectItem value="ADMIN">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-cyan-500 text-white hover:bg-cyan-400"
            >
              登録する
            </Button>
            <p className="text-center text-sm text-slate-400">
              すでにアカウントをお持ちの方は{" "}
              <Link to="/login" className="text-cyan-300 hover:underline">
                こちら
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
