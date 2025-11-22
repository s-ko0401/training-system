import { type FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardHeader, CardTitle } from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";

type Summary = {
  adminCount: number;
  teacherCount: number;
  studentCount: number;
  activeCount: number;
  completedCount: number;
};

type AccountRow = {
  id: number;
  userId?: string;
  userName: string;
  userEmail: string;
  role: number;
  flag: number;
  teacherName?: string;
  teacherEmail?: string;
  progress?: number;
  trainingStatus?: string;
};

type Teacher = {
  id: number;
  userName: string;
  userEmail: string;
};

const roleLabel = (role: number) => {
  switch (role) {
    case 1:
      return "管理者";
    case 2:
      return "教師";
    case 3:
      return "研修生";
    default:
      return "未設定";
  }
};

const statusLabel = (flag: number) => (flag === 0 ? "有効" : "無効");
const statusClass = (flag: number) =>
  flag === 0
    ? "bg-emerald-500/20 text-emerald-200"
    : "bg-white/10 text-slate-300";

export function AccountManagementPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<Summary>({
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0,
    activeCount: 0,
    completedCount: 0,
  });
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState({
    userId: "",
    userName: "",
    userEmail: "",
    password: "",
    role: "3",
    teacherUserId: "",
  });

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsedAuth = JSON.parse(storedAuth);
    if (parsedAuth.role !== 1 && parsedAuth.role !== 2) {
      navigate("/student/dashboard");
      return;
    }
    setUser(parsedAuth);
  }, [navigate]);

  const authHeaders = useMemo(() => {
    if (!user) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  useEffect(() => {
    if (!user || !authHeaders) return;
    fetchSummary(authHeaders);
    fetchAccounts(authHeaders);
    if (user.role === 1) {
      fetchTeachers();
    }
  }, [user, authHeaders]);

  const fetchSummary = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<Summary>(
        "http://localhost:8080/api/accounts/summary",
        { headers },
      );
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<AccountRow[]>(
        "http://localhost:8080/api/accounts/list",
        { headers },
      );
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get<Teacher[]>(
        "http://localhost:8080/api/users/teachers",
      );
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user?.role === 1;
  const isTeacher = user?.role === 2;

  const handleInputChange = (
    field: string,
    value: string,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormState({
      userId: "",
      userName: "",
      userEmail: "",
      password: "",
      role: "3",
      teacherUserId: "",
    });
    setFormError("");
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authHeaders) return;
    setFormError("");

    try {
      const payload: any = {
        userId: formState.userId || null,
        userName: formState.userName,
        userEmail: formState.userEmail,
        password: formState.password,
        role: isAdmin ? Number(formState.role) : 3,
      };

      if (payload.role === 3) {
        if (isAdmin) {
          payload.teacherUserId = formState.teacherUserId
            ? Number(formState.teacherUserId)
            : null;
        } else if (isTeacher) {
          payload.teacherUserId = user.id;
        }
      }

      await axios.post(
        "http://localhost:8080/api/accounts",
        payload,
        { headers: authHeaders },
      );

      fetchSummary(authHeaders);
      fetchAccounts(authHeaders);
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
        "アカウントの作成に失敗しました。",
      );
      console.error(err);
    }
  };

  const handleStatusChange = async (accountId: number, newStatus: string) => {
    if (!authHeaders) return;

    try {
      await axios.put(
        `http://localhost:8080/api/accounts/${accountId}/training-status`,
        { trainingStatus: newStatus },
        { headers: authHeaders }
      );

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? { ...acc, trainingStatus: newStatus }
            : acc
        )
      );
    } catch (err: any) {
      setFormError(err.response?.data?.message || "ステータス更新に失敗しました。");
      console.error(err);
    }
  };

  if (!user) return null;

  const sidebarRoleLabel = isAdmin ? "管理者" : "教師";



  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={user.role}
        roleLabel={sidebarRoleLabel}
        active="account"
      />
      <main className="flex-1 overflow-y-auto bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6">
          <div>
            <p className="text-sm text-slate-300">システム管理</p>
            <h1 className="text-2xl font-semibold text-white">アカウント管理</h1>
            <p className="text-sm text-slate-300">
              システムユーザーのアカウントと研修状態を管理します
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              ＋ アカウントを追加
            </Button>
            <UserHeaderInfo user={user} />
          </div>
        </header>

        <section className="px-10 py-10 space-y-8">


          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isAdmin ? "全アカウント" : "担当学生"}
                </h2>
                <p className="text-sm text-slate-300">
                  合計 {accounts.length} 件のアカウント
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm text-slate-200">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">氏名</th>
                    <th className="px-4 py-3 font-medium">メールアドレス</th>
                    <th className="px-4 py-3 font-medium">役割</th>
                    {isAdmin && (
                      <th className="px-4 py-3 font-medium">担当教師</th>
                    )}
                    <th className="px-4 py-3 font-medium">状態</th>
                    <th className="px-4 py-3 font-medium">研修進度</th>
                    <th className="px-4 py-3 font-medium">研修ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-slate-800/70 last:border-0"
                    >
                      <td className="px-4 py-3 text-white">
                        {account.userName}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {account.userEmail}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                          {roleLabel(account.role)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-slate-200">
                          {account.teacherName ?? "-"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(account.flag)
                            }`}
                        >
                          {statusLabel(account.flag)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {account.role === 3 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-cyan-500"
                                style={{ width: `${account.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">
                              {account.progress || 0}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {account.role === 3 ? (
                          <Select
                            value={account.trainingStatus || "未開始"}
                            onValueChange={(value) =>
                              handleStatusChange(account.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                              <SelectItem value="未開始">未開始</SelectItem>
                              <SelectItem value="研修中">研修中</SelectItem>
                              <SelectItem value="研修終了">研修終了</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-4 py-6 text-center text-sm text-slate-400"
                      >
                        表示できるアカウントがありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-black/60 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  アカウントを追加
                </h3>
                <p className="text-sm text-slate-300">
                  必要情報を入力して新しいユーザーを登録します。
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-slate-200 hover:bg-white/10"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                閉じる
              </Button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={handleCreateAccount}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userId">ユーザーID（任意）</Label>
                  <Input
                    id="userId"
                    value={formState.userId}
                    onChange={(e) => handleInputChange("userId", e.target.value)}
                    placeholder="例：mentor001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">氏名</Label>
                  <Input
                    id="userName"
                    value={formState.userName}
                    onChange={(e) =>
                      handleInputChange("userName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">メールアドレス</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formState.userEmail}
                    onChange={(e) =>
                      handleInputChange("userEmail", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">役割</Label>
                    <Select
                      value={formState.role}
                      onValueChange={(value) => handleInputChange("role", value)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">管理者</SelectItem>
                        <SelectItem value="2">教師</SelectItem>
                        <SelectItem value="3">研修生</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formState.role === "3" && (
                    <div className="space-y-2">
                      <Label htmlFor="teacher">担当教師</Label>
                      <Select
                        value={formState.teacherUserId}
                        onValueChange={(value) =>
                          handleInputChange("teacherUserId", value)
                        }
                      >
                        <SelectTrigger id="teacher">
                          <SelectValue placeholder="担当教師を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={String(teacher.id)}
                            >
                              {teacher.userName}（{teacher.userEmail}）
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  キャンセル
                </Button>
                <Button type="submit" className="bg-slate-900 text-white">
                  登録する
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
