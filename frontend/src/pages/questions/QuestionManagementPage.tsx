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

type Question = {
  id: number;
  studentUserId: number;
  date: string;
  title: string;
  memo: string;
  feedback?: string;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
};

type QuestionListResponse = {
  pendingFeedback: Question[];
  replied: Question[];
};

export function QuestionManagementPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<AccountRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [questions, setQuestions] = useState<QuestionListResponse>({
    pendingFeedback: [],
    replied: [],
  });
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>(
    {},
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 1 && parsed.role !== 2) {
      navigate("/student/questions");
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
    fetchStudents(authHeaders);
  }, [user, authHeaders]);

  useEffect(() => {
    if (!selectedStudentId || !authHeaders) return;
    fetchQuestions(selectedStudentId, authHeaders);
  }, [selectedStudentId, authHeaders]);

  const fetchStudents = async (headers: Record<string, string>) => {
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
      setError("学習者一覧の取得に失敗しました。");
    }
  };

  const fetchQuestions = async (
    studentId: number,
    headers: Record<string, string>,
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get<QuestionListResponse>(
        `http://localhost:8080/api/questions/student/${studentId}`,
        { headers },
      );
      setQuestions(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "この学習者の質問を取得できませんでした。",
      );
      setQuestions({ pendingFeedback: [], replied: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (questionId: number) => {
    if (!authHeaders) return;
    const feedback = feedbackDrafts[questionId];
    if (!feedback || feedback.trim().length === 0) {
      setError("フィードバックを入力してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        `http://localhost:8080/api/questions/${questionId}/feedback`,
        { feedback },
        { headers: authHeaders },
      );
      if (selectedStudentId) {
        await fetchQuestions(selectedStudentId, authHeaders);
      }
      setFeedbackDrafts((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "フィードバックの送信に失敗しました。時間をおいて再度お試しください。",
      );
      console.error(err);
    }
  };

  const heading =
    user?.role === 1 ? "管理者向け質疑管理" : "講師向け質疑管理";
  const subheading =
    user?.role === 1
      ? "全学習者の質問を確認できます。"
      : "担当学習者の質問に素早く回答しましょう。";

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={user.role}
        roleLabel={user.role === 1 ? "管理者" : "講師"}
        active="qa"
      />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">質疑</p>
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
                <h2 className="text-lg font-semibold text-white">質問一覧</h2>
                <p className="text-sm text-slate-300">
                  未回答と回答済みで表示します。
                </p>
              </div>
              {selectedStudentId && (
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-100"
                  onClick={() =>
                    authHeaders && fetchQuestions(selectedStudentId, authHeaders)
                  }
                >
                  再読み込み
                </Button>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loading ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center text-sm text-slate-400">
                質問を読み込み中です…
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <QuestionColumn
                  title="未回答"
                  description="講師の回答待ちの質問です。"
                  questions={questions.pendingFeedback}
                  feedbackDrafts={feedbackDrafts}
                  setFeedbackDrafts={setFeedbackDrafts}
                  onSubmitFeedback={handleFeedbackSubmit}
                  allowReply
                />
                <QuestionColumn
                  title="回答済み"
                  description="回答済みの質問です。"
                  questions={questions.replied}
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

type QuestionColumnProps = {
  title: string;
  description: string;
  questions: Question[];
  feedbackDrafts: Record<number, string>;
  setFeedbackDrafts: Dispatch<SetStateAction<Record<number, string>>>;
  onSubmitFeedback: (questionId: number) => void;
  allowReply: boolean;
};

function QuestionColumn({
  title,
  description,
  questions,
  feedbackDrafts,
  setFeedbackDrafts,
  onSubmitFeedback,
  allowReply,
}: QuestionColumnProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-slate-300">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <div
            key={question.id}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  {new Date(question.date).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-white">
                  {question.title}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {question.memo}
            </p>

            <div className="space-y-2 rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
              <p className="text-xs font-semibold text-slate-300">フィードバック</p>
              {question.feedback ? (
                <p className="whitespace-pre-wrap">{question.feedback}</p>
              ) : (
                <p className="text-slate-400 text-sm">まだ回答がありません。</p>
              )}
              {question.teacherName && (
                <p className="text-xs text-slate-400">担当: {question.teacherName}</p>
              )}
            </div>

            {allowReply && (
              <div className="space-y-2">
                <Label htmlFor={`fb-${question.id}`} className="text-xs text-slate-300">
                  フィードバックを入力
                </Label>
                <Textarea
                  id={`fb-${question.id}`}
                  rows={3}
                  value={feedbackDrafts[question.id] ?? ""}
                  onChange={(e) =>
                    setFeedbackDrafts({
                      ...feedbackDrafts,
                      [question.id]: e.target.value,
                    })
                  }
                  placeholder="学習者へのコメントを入力してください"
                  className="border-slate-700 bg-slate-900/60 text-slate-100"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20"
                    onClick={() => onSubmitFeedback(question.id)}
                  >
                    送信
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-sm text-slate-400">表示する質問はありません。</p>
        )}
      </CardContent>
    </Card>
  );
}
