import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";
import { Progress } from "@/share/ui/progress";

const roleLabelMap: Record<number, string> = {
  2: "講師",
  3: "学習者",
};

type StudentTrainingTask = {
  id: number;
  todoId: number;
  todoName: string;
  topicName: string;
  sectionName: string;
  dayIndex: number;
  sortOrder: number;
  sectionSortOrder: number;
  topicSortOrder: number;
  status: string;
  progressNote: string;
  startedAt: string | null;
  completedAt: string | null;
};

type StudentTrainingPlan = {
  id: number;
  studentId: number;
  planId: number;
  planName: string;
  expectedDays: number;
  description: string;
  status: string;
  assignedAt: string;
  assignedBy: number;
  tasks: StudentTrainingTask[];
};

type SectionProgress = {
  sectionName: string;
  sectionSortOrder: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

export function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<StudentTrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ?? sessionStorage.getItem("auth");
    if (!storedAuth) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedAuth);
    setUser(parsedUser);
  }, [navigate]);

  const authHeaders = useMemo(() => {
    if (!user) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  useEffect(() => {
    if (!user || !authHeaders || user.role !== 3) return;

    const fetchPlans = async () => {
      try {
        const response = await axios.get<StudentTrainingPlan[]>(
          "http://localhost:8080/api/training/my",
          { headers: authHeaders }
        );
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch training plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user, authHeaders]);

  // Calculate statistics
  const stats = useMemo(() => {
    const allTasks = plans.flatMap((plan) => plan.tasks);
    const completedTasks = allTasks.filter((t) => t.status === "完了");
    const incompleteTasks = allTasks.filter((t) => t.status !== "完了");
    const overallProgress =
      allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : 0;

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      incompleteTasks: incompleteTasks.length,
      overallProgress,
    };
  }, [plans]);

  // Calculate section progress
  const sectionProgress = useMemo(() => {
    const allTasks = plans.flatMap((plan) => plan.tasks);
    const sections = new Map<string, SectionProgress>();

    allTasks.forEach((task) => {
      const sectionName = task.sectionName || "その他";
      if (!sections.has(sectionName)) {
        sections.set(sectionName, {
          sectionName,
          sectionSortOrder: task.sectionSortOrder || 0,
          totalTasks: 0,
          completedTasks: 0,
          progress: 0,
        });
      }
      const section = sections.get(sectionName)!;
      section.totalTasks++;
      if (task.status === "完了") {
        section.completedTasks++;
      }
    });

    // Calculate progress percentage for each section
    sections.forEach((section) => {
      section.progress = Math.round(
        (section.completedTasks / section.totalTasks) * 100
      );
    });

    return Array.from(sections.values()).sort((a, b) =>
      a.sectionSortOrder - b.sectionSortOrder
    );
  }, [plans]);

  if (!user) return null;

  const role = user.role;
  const roleLabel = roleLabelMap[role] ?? "ユーザー";
  const activeMenuId = role === 3 ? "dashboard" : "schedule";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={role}
        roleLabel={roleLabel}
        active={activeMenuId}
      />
      <main className="flex-1 bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">個人研修ポータル</p>
            <h1 className="text-2xl font-semibold text-white">
              {role === 2 ? "担当研修サマリー" : "マイダッシュボード"}
            </h1>
          </div>
          <UserHeaderInfo user={user} />
        </header>

        <section className="px-10 py-10 space-y-8">
          {role === 3 && !loading && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                  <CardHeader className="space-y-1 pb-2">
                    <p className="text-xs font-medium text-slate-300">
                      未完成TODO
                    </p>
                    <CardTitle className="text-2xl font-bold">
                      {stats.incompleteTasks} 件
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300">
                    全 {stats.totalTasks} 件中
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                  <CardHeader className="space-y-1 pb-2">
                    <p className="text-xs font-medium text-slate-300">
                      完了TODO
                    </p>
                    <CardTitle className="text-2xl font-bold">
                      {stats.completedTasks} 件
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300">
                    お疲れさまです！
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/60 text-slate-100 shadow-lg shadow-black/20">
                  <CardHeader className="space-y-1 pb-2">
                    <p className="text-xs font-medium text-slate-300">
                      整体進度
                    </p>
                    <CardTitle className="text-2xl font-bold">
                      {stats.overallProgress}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300">
                    全体の進捗状況
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/30">
                <h2 className="text-lg font-semibold text-white mb-6">
                  研修カリキュラム進捗
                </h2>
                <p className="text-sm text-slate-300 mb-4">
                  全{sectionProgress.length}章の学習状況
                </p>

                {/* Overall progress */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      全体進度
                    </span>
                    <span className="text-sm font-medium text-cyan-400">
                      {stats.overallProgress}%
                    </span>
                  </div>
                  <Progress value={stats.overallProgress} className="h-3" />
                </div>

                {/* Section progress bars */}
                <div className="space-y-4">
                  {sectionProgress.map((section, index) => (
                    <div key={section.sectionName}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-300">
                            第{index + 1}章：{section.sectionName}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${section.progress === 100
                              ? "bg-emerald-500/20 text-emerald-300"
                              : section.progress > 0
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-slate-700/50 text-slate-400"
                              }`}
                          >
                            {section.progress === 100
                              ? "完了"
                              : section.progress > 0
                                ? "進行中"
                                : "未開始"}
                          </span>
                        </div>
                        <span className="text-sm text-slate-400">
                          {section.completedTasks}/{section.totalTasks}
                        </span>
                      </div>
                      <Progress value={section.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {role !== 3 && (
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-900/30 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white">本日の進捗メモ</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>・Java 基礎の復習テストを完了しました。</li>
                <li>・REST API 設計の課題を 2 件提出しました。</li>
                <li>・次回レビューは火曜日の予定です。</li>
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
