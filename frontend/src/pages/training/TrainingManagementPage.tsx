import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";
import { Label } from "@/share/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Textarea } from "@/share/ui/textarea";
import { Progress } from "@/share/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/share/ui/table";

type AccountRow = {
  id: number;
  userName: string;
  userEmail: string;
  role: number;
};

type PlanTemplate = {
  id: number;
  planName: string;
};

type StudentTrainingPlan = {
  id: number;
  planId: number;
  planName: string;
  expectedDays?: number;
  description?: string;
  status: string;
  assignedAt: string;
  tasks: StudentTrainingTask[];
};

type StudentTrainingTask = {
  id: number;
  todoName: string;
  topicName?: string;
  sectionName?: string;
  dayIndex?: number;
  status: string;
  progressNote?: string;
};

type TrainingStats = {
  unrepliedReportsCount: number;
  unrepliedQuestionsCount: number;
  studentsInTrainingCount: number;
  studentsCompletedCount: number;
};

export function TrainingManagementPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<AccountRow[]>([]);
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [studentPlans, setStudentPlans] = useState<StudentTrainingPlan[]>([]);
  const [assignPlanId, setAssignPlanId] = useState<string>("");
  const [taskDrafts, setTaskDrafts] = useState<Record<number, { status: string; note: string }>>(
    {},
  );
  const [selectedDayMap, setSelectedDayMap] = useState<Record<number, number>>({});
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 1 && parsed.role !== 2) {
      navigate("/student/training");
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
    fetchStats(authHeaders);
    fetchStudents(authHeaders);
    fetchTemplates(authHeaders);
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedStudentId || !authHeaders) return;
    fetchStudentPlans(selectedStudentId, authHeaders);
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
      setError("学生一覧の取得に失敗しました。");
    }
  };

  const fetchTemplates = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<PlanTemplate[]>(
        "http://localhost:8080/api/training/templates",
        { headers },
      );
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentPlans = async (
    studentId: number,
    headers: Record<string, string>,
  ) => {
    setError("");
    try {
      const res = await axios.get<StudentTrainingPlan[]>(
        `http://localhost:8080/api/training/student/${studentId}`,
        { headers },
      );
      setStudentPlans(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "この学生の研修計画を取得できませんでした。",
      );
      setStudentPlans([]);
    }
  };

  const fetchStats = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<TrainingStats>(
        "http://localhost:8080/api/training/stats",
        { headers }
      );
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleAssignPlan = async () => {
    if (!authHeaders || !selectedStudentId || !assignPlanId) {
      setError("学生と研修計画を選択してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        "http://localhost:8080/api/training/assign",
        {
          studentId: selectedStudentId,
          planId: Number(assignPlanId),
        },
        { headers: authHeaders },
      );
      setAssignPlanId("");
      fetchStudentPlans(selectedStudentId, authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "研修計画の割り当てに失敗しました。");
    }
  };

  const handleTaskUpdate = async (task: StudentTrainingTask) => {
    if (!authHeaders) return;
    const draft = taskDrafts[task.id];
    if (!draft || !draft.status) {
      setError("ステータスを入力してください。");
      return;
    }
    setError("");
    try {
      await axios.put(
        `http://localhost:8080/api/training/tasks/${task.id}`,
        {
          status: draft.status,
          progressNote: draft.note,
        },
        { headers: authHeaders },
      );
      if (selectedStudentId) {
        fetchStudentPlans(selectedStudentId, authHeaders);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "タスク更新に失敗しました。");
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!authHeaders) return;
    if (!window.confirm("本当にこの研修計画を削除しますか？\nこの操作は取り消せません。")) {
      return;
    }

    setError("");
    try {
      await axios.delete(`http://localhost:8080/api/training/student/plan/${planId}`, {
        headers: authHeaders,
      });
      setStudentPlans((prev) => prev.filter((p) => p.id !== planId));
      // Remove from selectedDayMap if exists
      setSelectedDayMap((prev) => {
        const next = { ...prev };
        delete next[planId];
        return next;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "研修計画の削除に失敗しました。");
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={user.role}
        roleLabel={user.role === 1 ? "管理者" : "講師"}
        active="training"
      />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">研修進捗</p>
            <h1 className="text-2xl font-semibold text-white">研修計画の配属と進捗</h1>
            <p className="text-sm text-slate-300">
              学生に研修計画を割り当て、TODOの進捗を確認します。
            </p>
          </div>
          <UserHeaderInfo user={user} />
        </header>

        {/* Statistics Cards */}
        {stats && (
          <section className="px-10 pt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                <CardHeader className="space-y-1 pb-2">
                  <p className="text-xs font-medium text-slate-300">
                    未回答の日報
                  </p>
                  <CardTitle className="text-2xl font-bold">
                    {stats.unrepliedReportsCount} 件
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  回答待ちの日報数
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                <CardHeader className="space-y-1 pb-2">
                  <p className="text-xs font-medium text-slate-300">
                    未回答の質問
                  </p>
                  <CardTitle className="text-2xl font-bold">
                    {stats.unrepliedQuestionsCount} 件
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  回答待ちの質問数
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                <CardHeader className="space-y-1 pb-2">
                  <p className="text-xs font-medium text-slate-300">
                    {user?.role === 1 ? "研修中の学生" : "担当している研修中の学生"}
                  </p>
                  <CardTitle className="text-2xl font-bold">
                    {stats.studentsInTrainingCount} 名
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  研修中の学生数
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                <CardHeader className="space-y-1 pb-2">
                  <p className="text-xs font-medium text-slate-300">
                    {user?.role === 1 ? "研修完了の学生" : "担当している研修完了の学生"}
                  </p>
                  <CardTitle className="text-2xl font-bold">
                    {stats.studentsCompletedCount} 名
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  研修を完了した学生数
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        <section className="grid gap-6 px-10 py-8 lg:grid-cols-[320px_1fr]">
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/25">
            <CardHeader>
              <CardTitle className="text-base">学生一覧</CardTitle>
              <p className="text-xs text-slate-300">
                学生を選択して研修計画とTODOを表示します。
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.map((student) => {
                const isActive = selectedStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${isActive
                      ? "border-cyan-400/60 bg-cyan-400/10 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900 hover:border-slate-600"
                      }`}
                  >
                    <p className="text-sm font-semibold">{student.userName}</p>
                    <p
                      className={`text-xs ${isActive ? "text-slate-100" : "text-slate-400"
                        }`}
                    >
                      {student.userEmail}
                    </p>
                  </button>
                );
              })}
              {students.length === 0 && (
                <p className="text-sm text-slate-400">
                  表示できる学生がいません。
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/25">
              <CardHeader>
                <CardTitle className="text-base">研修計画の割り当て</CardTitle>
                <p className="text-xs text-slate-300">
                  設計済みの研修テンプレートを学生に割り当てます。
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>研修計画</Label>
                  <Select value={assignPlanId} onValueChange={setAssignPlanId}>
                    <SelectTrigger className="border-slate-700 bg-slate-900/40 text-white">
                      <SelectValue placeholder="計画を選択" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white">
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.planName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={handleAssignPlan}
                  disabled={!selectedStudentId}
                >
                  割り当てる
                </Button>
              </CardContent>
            </Card>

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            {studentPlans.map((plan) => {
              const totalTasks = plan.tasks.length;
              const completedTasks = plan.tasks.filter((t) => t.status === "完了").length;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              // Group tasks by Day
              const tasksByDay = plan.tasks.reduce((acc, task) => {
                const day = task.dayIndex ?? 0;
                if (!acc[day]) acc[day] = [];
                acc[day].push(task);
                return acc;
              }, {} as Record<number, StudentTrainingTask[]>);

              const sortedDays = Object.keys(tasksByDay)
                .map(Number)
                .sort((a, b) => a - b);

              const currentDay = selectedDayMap[plan.id] ?? sortedDays[0];

              return (
                <Card key={plan.id} className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        {plan.planName}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-cyan-400">
                          {Math.round(progress)}% 完了
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => handleDeletePlan(plan.id)}
                          title="研修計画を削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-800" />

                    {/* Day Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {sortedDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDayMap((prev) => ({ ...prev, [plan.id]: day }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentDay === day
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            }`}
                        >
                          Day {day}
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.tasks.length === 0 && (
                      <p className="text-sm text-slate-400">
                        TODO がまだ展開されていません。
                      </p>
                    )}
                    {currentDay && tasksByDay[currentDay] ? (
                      <div className="space-y-8">
                        {(() => {
                          // Group by Section, aggregating tasks for the same section
                          const sectionMap = new Map<string, StudentTrainingTask[]>();
                          const sectionOrder: string[] = [];

                          tasksByDay[currentDay].forEach((task) => {
                            const secName = task.sectionName || "未分類";
                            if (!sectionMap.has(secName)) {
                              sectionMap.set(secName, []);
                              sectionOrder.push(secName);
                            }
                            sectionMap.get(secName)!.push(task);
                          });

                          return sectionOrder.map((secName) => ({
                            name: secName,
                            tasks: sectionMap.get(secName)!,
                          })).map((section, idx) => (
                            <div key={idx} className="space-y-3">
                              <h3 className="text-lg font-semibold text-cyan-400 border-l-4 border-cyan-500 pl-3">
                                {section.name}
                              </h3>
                              <div className="rounded-md border border-slate-800 bg-slate-900/40">
                                <Table>
                                  <TableHeader className="bg-slate-900/60">
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                      <TableHead className="w-[150px] text-slate-300">小項目</TableHead>
                                      <TableHead className="w-[250px] text-slate-300">TODO</TableHead>
                                      <TableHead className="w-[140px] text-slate-300">ステータス</TableHead>
                                      <TableHead className="text-slate-300">メモ</TableHead>
                                      <TableHead className="w-[80px] text-slate-300">操作</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {section.tasks.map((task) => (
                                      <TableRow key={task.id} className="border-slate-800 hover:bg-slate-800/30">
                                        <TableCell className="font-medium text-slate-300 align-top">
                                          {task.topicName ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-slate-300 align-top">
                                          {task.todoName}
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <Select
                                            value={taskDrafts[task.id]?.status ?? task.status}
                                            onValueChange={(value) =>
                                              setTaskDrafts((prev) => ({
                                                ...prev,
                                                [task.id]: {
                                                  status: value,
                                                  note: prev[task.id]?.note ?? task.progressNote ?? "",
                                                },
                                              }))
                                            }
                                          >
                                            <SelectTrigger className="h-8 border-slate-700 bg-slate-900/40 text-white text-xs">
                                              <SelectValue placeholder={task.status} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white">
                                              <SelectItem value="未開始">未開始</SelectItem>
                                              <SelectItem value="進行中">進行中</SelectItem>
                                              <SelectItem value="完了">完了</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <Textarea
                                            rows={1}
                                            className="min-h-[32px] border-slate-700 bg-slate-900/40 text-white text-xs resize-none focus:min-h-[80px] transition-all"
                                            value={taskDrafts[task.id]?.note ?? task.progressNote ?? ""}
                                            onChange={(e) =>
                                              setTaskDrafts((prev) => ({
                                                ...prev,
                                                [task.id]: {
                                                  status: prev[task.id]?.status ?? task.status,
                                                  note: e.target.value,
                                                },
                                              }))
                                            }
                                            placeholder="メモを入力..."
                                          />
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <Button
                                            size="sm"
                                            className="h-8 w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300"
                                            onClick={() => handleTaskUpdate(task)}
                                          >
                                            保存
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">この日のTODOはありません。</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
