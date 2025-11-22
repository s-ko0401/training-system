import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";

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

type StudentTrainingPlan = {
  id: number;
  planName: string;
  status: string;
  expectedDays?: number;
  tasks: StudentTrainingTask[];
};

type StudentTrainingTask = {
  id: number;
  todoName: string;
  sectionName?: string;
  topicName?: string;
  dayIndex?: number;
  status: string;
  progressNote?: string;
};

export function StudentTrainingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<StudentTrainingPlan[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<string>("未開始");
  const [taskDrafts, setTaskDrafts] = useState<Record<number, { status: string; note: string }>>(
    {},
  );
  const [selectedDayMap, setSelectedDayMap] = useState<Record<number, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsedAuth = JSON.parse(storedAuth);
    if (parsedAuth.role !== 3) {
      navigate("/");
      return;
    }
    setUser(parsedAuth);
  }, [navigate]);

  const authHeaders = useMemo(() => {
    if (!user) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  useEffect(() => {
    if (!authHeaders || !user) return;
    fetchMyPlans(authHeaders);
    fetchUserStatus(authHeaders);
  }, [authHeaders, user]);

  const fetchUserStatus = async (headers: Record<string, string>) => {
    try {
      const res = await axios.get<any>(
        `http://localhost:8080/api/users/profile`,
        { headers }
      );
      if (res.data.trainingStatus) {
        setTrainingStatus(res.data.trainingStatus);
      }
    } catch (err) {
      console.error("Failed to fetch training status:", err);
    }
  };

  const fetchMyPlans = async (headers: Record<string, string>) => {
    setError("");
    try {
      const res = await axios.get<StudentTrainingPlan[]>(
        "http://localhost:8080/api/training/my",
        { headers },
      );
      setPlans(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "研修計画の取得に失敗しました。時間をおいて再度お試しください。",
      );
    }
  };

  const handleTaskUpdate = async (task: StudentTrainingTask) => {
    if (!authHeaders) return;
    const draft = taskDrafts[task.id];
    if (!draft || !draft.status) {
      setError("ステータスを選択してください。");
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
      fetchMyPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar role={user.role} roleLabel="学習者" active="training" />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">研修進捗</p>
            <h1 className="text-2xl font-semibold text-white">マイ研修計画</h1>
            <p className="text-sm text-slate-300">
              指定された研修計画のTODOを進めましょう。
            </p>
          </div>
          <UserHeaderInfo user={user} />
        </header>

        <section className="px-10 py-8 space-y-6">
          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {plans.length === 0 && (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardContent className="py-6 text-sm text-slate-300">
                現在割り当てられている研修計画はありません。
              </CardContent>
            </Card>
          )}

          {plans.map((plan) => {
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
              <Card
                key={plan.id}
                className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white">{plan.planName}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded ${trainingStatus === "研修終了" ? "bg-emerald-500/20 text-emerald-300" :
                          trainingStatus === "研修中" ? "bg-cyan-500/20 text-cyan-300" :
                            "bg-slate-700/50 text-slate-400"
                        }`}>
                        {trainingStatus}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-cyan-400">{progress}% 完了</span>
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
                <CardContent className="space-y-8">
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
        </section>
      </main>
    </div>
  );
}
