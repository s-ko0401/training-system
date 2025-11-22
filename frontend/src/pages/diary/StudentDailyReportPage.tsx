import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Textarea } from "@/share/ui/textarea";

type DailyReport = {
  id: number;
  studentUserId: number;
  date: string;
  title: string;
  memo: string;
  feedback?: string;
  teacherName?: string;
  flag: number;
  createdAt: string;
  updatedAt: string;
};

export function StudentDailyReportPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "",
    memo: "",
    flag: "1",
  });

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedAuth);
    if (parsed.role !== 3) {
      navigate(parsed.role === 2 ? "/teacher/diary" : "/admin/diary");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  const authHeaders = useMemo(() => {
    if (!user) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  useEffect(() => {
    if (!authHeaders) return;
    fetchReports(authHeaders);
  }, [authHeaders]);

  const fetchReports = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<DailyReport[]>(
        "http://localhost:8080/api/daily-reports/my",
        { headers },
      );
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authHeaders) return;
    setError("");

    const payload = {
      date: formState.date,
      title: formState.title,
      memo: formState.memo,
      flag: Number(formState.flag),
    };

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:8080/api/daily-reports/${editingId}`,
          payload,
          { headers: authHeaders },
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/daily-reports",
          payload,
          { headers: authHeaders },
        );
      }

      await fetchReports(authHeaders);
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "日報の保存に失敗しました。しばらくしてから再度お試しください。",
      );
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormState({
      date: new Date().toISOString().slice(0, 10),
      title: "",
      memo: "",
      flag: "1",
    });
    setEditingId(null);
    setError("");
  };

  const startEdit = (report: DailyReport) => {
    setShowForm(true);
    setEditingId(report.id);
    setFormState({
      date: report.date,
      title: report.title,
      memo: report.memo,
      flag: String(report.flag ?? 1),
    });
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar role={user.role} roleLabel="学習者" active="diary" />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">日報</p>
            <h1 className="text-2xl font-semibold text-white">マイ日報</h1>
            <p className="text-sm text-slate-300">
              新しい日報を作成したり、既存データを編集できます。最新順に表示します。
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              ＋ 日報を追加
            </Button>
            <UserHeaderInfo user={user} />
          </div>
        </header>

        <section className="px-10 py-8 space-y-6">
          {showForm && (
            <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-xl shadow-black/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {editingId ? "日報を編集" : "日報を作成"}
                  </p>
                  <CardTitle className="text-lg">
                    {editingId ? "日報内容を更新する" : "新しい日報を登録する"}
                  </CardTitle>
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
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">日付</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formState.date}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, date: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flag">ステータス</Label>
                      <select
                        id="flag"
                        value={formState.flag}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, flag: e.target.value }))
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      >
                        <option value="1">提出済み</option>
                        <option value="0">下書き</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={formState.title}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="今日取り組んだ内容を入力してください"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memo">内容</Label>
                    <Textarea
                      id="memo"
                      value={formState.memo}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, memo: e.target.value }))
                      }
                      rows={5}
                      placeholder="進捗・課題・次のアクションなどを記載してください"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 text-slate-100"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" className="bg-white/10 text-white hover:bg-white/20">
                      {editingId ? "保存する" : "登録する"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">最新の日報</h2>
            <div className="space-y-3">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                      <CardTitle className="text-lg text-white">
                        {report.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          report.flag === 1
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {report.flag === 1 ? "提出済み" : "下書き"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-100"
                        onClick={() => startEdit(report)}
                      >
                        編集
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-200">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {report.memo}
                    </p>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-300">
                        講師フィードバック
                      </p>
                      {report.feedback ? (
                        <p className="mt-1 whitespace-pre-wrap text-slate-100">
                          {report.feedback}
                        </p>
                      ) : (
                        <p className="mt-1 text-slate-400">
                          まだフィードバックがありません。
                        </p>
                      )}
                      {report.teacherName && (
                        <p className="mt-1 text-xs text-slate-400">
                          {report.teacherName} からの返信
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reports.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center text-sm text-slate-400">
                  まだ日報がありません。最初の日報を作成しましょう。
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
