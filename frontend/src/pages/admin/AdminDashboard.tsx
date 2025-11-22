import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";

const stats = [
  { id: "programs", label: "研修プログラム数", value: "5", hint: "先週 +1" },
  { id: "assignments", label: "小課題の進行率", value: "18", hint: "完了率 65%" },
  { id: "pending", label: "レビュー待ち", value: "3", hint: "要フォロー" },
  { id: "students", label: "研修中の学習者", value: "12", hint: "順調に進行中" },
];

const todoList = [
  {
    title: "Java 設計レビュー",
    detail: "A クラスのレビューを完了しましょう。",
  },
  {
    title: "API ドキュメント更新",
    detail: "次回スプリント用に最新化します。",
  },
  {
    title: "メンタリング面談",
    detail: "木曜 13:00 から 2 名予定。",
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedAuth);
    if (parsedUser.role !== 1) {
      navigate("/user/dashboard");
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar role={1} roleLabel="管理者" active="schedule" />

      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">個人研修管理システム</p>
            <h1 className="text-2xl font-semibold text-white">研修運営ダッシュボード</h1>
            <p className="text-xs text-slate-400">
              大課題・小課題・TODO を一元管理できます。
            </p>
          </div>
          <UserHeaderInfo user={user} />
        </header>

        <section className="px-10 py-10 space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <Card
                key={item.id}
                className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/25"
              >
                <CardHeader className="space-y-1 pb-2">
                  <p className="text-xs font-medium text-slate-300">{item.label}</p>
                  <CardTitle className="text-2xl font-bold">{item.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  {item.hint}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">直近のタスク状況</p>
                <p className="text-xs text-slate-400">更新日: 11/21 10:00</p>
              </div>
              <Button
                variant="ghost"
                className="text-slate-200 hover:bg-white/10"
              >
                タスクを追加
              </Button>
            </div>

            <div className="space-y-3">
              {todoList.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
