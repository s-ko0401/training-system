import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";
import { Label } from "@/share/ui/label";
import { Textarea } from "@/share/ui/textarea";

type AccountRow = {
  id: number;
  userName: string;
  userEmail: string;
  role: number;
};

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

type DailyReportListResponse = {
  pendingFeedback: DailyReport[];
  replied: DailyReport[];
};

export function DailyReportManagementPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<AccountRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [reports, setReports] = useState<DailyReportListResponse>({
    pendingFeedback: [],
    replied: [],
  });
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>(
    {},
  );
  const [error, setError] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedAuth);
    if (parsed.role !== 1 && parsed.role !== 2) {
      navigate("/student/dashboard");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  const authHeaders = useMemo(() => {
    if (!user) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  useEffect(() => {
    if (!user || !authHeaders) return;
    fetchStudents(authHeaders, user.role);
  }, [user, authHeaders]);

  useEffect(() => {
    if (!selectedStudentId || !authHeaders) return;
    fetchReports(selectedStudentId, authHeaders);
  }, [selectedStudentId, authHeaders]);

  const fetchStudents = async (
    headers: Record<string, string>,
    role: number,
  ) => {
    try {
      const res = await axios.get<AccountRow[]>(
        "http://localhost:8080/api/accounts/list",
        { headers },
      );
      const onlyStudents = res.data.filter((row) => row.role === 3);
      setStudents(onlyStudents);
      if (onlyStudents.length > 0) {
        setSelectedStudentId(onlyStudents[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        role === 2
          ? "担当している学習者の取得に失敗しました。"
          : "学習者一覧の取得に失敗しました。",
      );
    }
  };

  const fetchReports = async (
    studentId: number,
    headers: Record<string, string>,
  ) => {
    setLoadingReports(true);
    setError("");
    try {
      const res = await axios.get<DailyReportListResponse>(
        `http://localhost:8080/api/daily-reports/student/${studentId}`,
        { headers },
      );
      setReports(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "この学習者の日報を取得できませんでした。",
      );
      setReports({ pendingFeedback: [], replied: [] });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleFeedbackSubmit = async (reportId: number) => {
    if (!authHeaders) return;
    const feedback = feedbackDrafts[reportId];
    if (!feedback || feedback.trim().length === 0) {
      setError("フィードバックを入力してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        `http://localhost:8080/api/daily-reports/${reportId}/feedback`,
        { feedback },
        { headers: authHeaders },
      );
      if (selectedStudentId) {
        await fetchReports(selectedStudentId, authHeaders);
      }
      setFeedbackDrafts((prev) => ({ ...prev, [reportId]: "" }));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "フィードバックの送信に失敗しました。時間をおいて再度お試しください。",
      );
      console.error(err);
    }
  };

  const heading =
    user?.role === 1 ? "管理者向け日報管理" : "講師向け日報管理";
  const subheading =
    user?.role === 1
      ? "すべての学習者の日報を確認できます。"
      : "担当学習者の日報を確認し、フィードバックを返しましょう。";

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={user.role}
        roleLabel={user.role === 1 ? "管理者" : "講師"}
        active="diary"
      />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">日報</p>
            <h1 className="text-2xl font-semibold text-white">{heading}</h1>
            <p className="text-sm text-slate-300">{subheading}</p>
          </div>
          <UserHeaderInfo user={user} />
        </header>

        <section className="grid gap-6 px-10 py-8 lg:grid-cols-[320px_1fr]">
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/25">
            <CardHeader>
              <CardTitle className="text-base">学習者</CardTitle>
              <p className="text-xs text-slate-300">
                表示する学習者を選択してください。
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.map((student) => {
                const isActive = student.id === selectedStudentId;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-cyan-400/60 bg-cyan-400/10 text-white shadow-sm"
                        : "border-slate-800 bg-slate-900 hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-semibold">{student.userName}</p>
                    <p
                      className={`text-xs ${
                        isActive ? "text-slate-100" : "text-slate-400"
                      }`}
                    >
                      {student.userEmail}
                    </p>
                  </button>
                );
              })}
              {students.length === 0 && (
                <p className="text-sm text-slate-400">
                  表示できる学習者がいません。
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">日報一覧</h2>
                <p className="text-sm text-slate-300">
                  新しい順。未返信と返信済みで分けています。
                </p>
              </div>
              {selectedStudentId && (
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-100"
                  onClick={() =>
                    authHeaders && fetchReports(selectedStudentId, authHeaders)
                  }
                >
                  再読み込み
                </Button>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loadingReports ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center text-sm text-slate-400">
                日報を読み込み中です…
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <ReportColumn
                  title="未返信"
                  description="講師の返信待ちの日報です。"
                  reports={reports.pendingFeedback}
                  feedbackDrafts={feedbackDrafts}
                  setFeedbackDrafts={setFeedbackDrafts}
                  onSubmitFeedback={handleFeedbackSubmit}
                  allowReply
                />
                <ReportColumn
                  title="返信済み"
                  description="フィードバック済みの日報です。"
                  reports={reports.replied}
                  feedbackDrafts={feedbackDrafts}
                  setFeedbackDrafts={setFeedbackDrafts}
                  onSubmitFeedback={handleFeedbackSubmit}
                  allowReply={false}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

type ReportColumnProps = {
  title: string;
  description: string;
  reports: DailyReport[];
  feedbackDrafts: Record<number, string>;
  setFeedbackDrafts: Dispatch<SetStateAction<Record<number, string>>>;
  onSubmitFeedback: (reportId: number) => void;
  allowReply: boolean;
};

function ReportColumn({
  title,
  description,
  reports,
  feedbackDrafts,
  setFeedbackDrafts,
  onSubmitFeedback,
  allowReply,
}: ReportColumnProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-slate-300">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-white">
                  {report.title}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                {report.flag === 1 ? "提出済み" : "下書き"}
              </span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {report.memo}
            </p>

            <div className="space-y-2 rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
              <p className="text-xs font-semibold text-slate-300">
                フィードバック
              </p>
              {report.feedback ? (
                <p className="whitespace-pre-wrap">{report.feedback}</p>
              ) : (
                <p className="text-slate-400 text-sm">まだフィードバックがありません。</p>
              )}
              {report.teacherName && (
                <p className="text-xs text-slate-400">担当: {report.teacherName}</p>
              )}
            </div>

            {allowReply && (
              <div className="space-y-2">
                <Label htmlFor={`fb-${report.id}`} className="text-xs text-slate-300">
                  フィードバックを入力
                </Label>
                <Textarea
                  id={`fb-${report.id}`}
                  rows={3}
                  value={feedbackDrafts[report.id] ?? ""}
                  onChange={(e) =>
                    setFeedbackDrafts({
                      ...feedbackDrafts,
                      [report.id]: e.target.value,
                    })
                  }
                  placeholder="学習者へのコメントを入力してください"
                  className="border-slate-700 bg-slate-900/60 text-slate-100"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20"
                    onClick={() => onSubmitFeedback(report.id)}
                  >
                    送信
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {reports.length === 0 && (
          <p className="text-sm text-slate-400">表示する日報はありません。</p>
        )}
      </CardContent>
    </Card>
  );
}
