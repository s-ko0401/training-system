import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { UserHeaderInfo } from "@/components/layout/UserHeaderInfo";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Textarea } from "@/share/ui/textarea";
import { Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from "lucide-react";

type PlanTemplate = {
  id: number;
  planName: string;
  expectedDays?: number;
  description?: string;
  sections: PlanSection[];
};

type PlanSection = {
  id: number;
  planId: number;
  sectionName: string;
  expectedDays?: number;
  sortOrder?: number;
  topics: PlanTopic[];
};

type PlanTopic = {
  id: number;
  sectionId: number;
  topicName: string;
  sortOrder?: number;
  todos: PlanTodo[];
};

type PlanTodo = {
  id: number;
  topicId: number;
  todoName: string;
  dayIndex?: number;
  sortOrder?: number;
};

export function PlanTemplatePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    planName: "",
    expectedDays: "",
    description: "",
  });

  const [sectionForm, setSectionForm] = useState({
    sectionName: "",
    expectedDays: "",
    sortOrder: "",
  });

  const [topicForm, setTopicForm] = useState({
    topicName: "",
    sortOrder: "",
  });

  const [todoForm, setTodoForm] = useState({
    todoName: "",
    dayIndex: "",
    sortOrder: "",
  });

  const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
  const [targetTopicId, setTargetTopicId] = useState<number | null>(null);

  // Edit States
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  // Separate Edit Forms to avoid conflict with Add Forms
  const [editPlanForm, setEditPlanForm] = useState({
    planName: "",
    expectedDays: "",
    description: "",
  });
  const [editSectionForm, setEditSectionForm] = useState({
    sectionName: "",
    expectedDays: "",
    sortOrder: "",
  });
  const [editTopicForm, setEditTopicForm] = useState({
    topicName: "",
    sortOrder: "",
  });
  const [editTodoForm, setEditTodoForm] = useState({
    todoName: "",
    dayIndex: "",
    sortOrder: "",
  });

  // Collapsible State (Track collapsed sections)
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<number[]>([]);

  const toggleSection = (sectionId: number) => {
    setCollapsedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

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
    if (!authHeaders) return;
    fetchPlans(authHeaders);
  }, [authHeaders]);

  const fetchPlans = async (headers: Record<string, string>) => {
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

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  const handlePlanSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders) return;
    setError("");
    try {
      if (editingPlanId) {
        await axios.put(
          `http://localhost:8080/api/training/templates/${editingPlanId}`,
          {
            planName: editPlanForm.planName,
            expectedDays: editPlanForm.expectedDays ? Number(editPlanForm.expectedDays) : null,
            description: editPlanForm.description || null,
          },
          { headers: authHeaders }
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/training/templates",
          {
            planName: planForm.planName,
            expectedDays: planForm.expectedDays ? Number(planForm.expectedDays) : null,
            description: planForm.description || null,
          },
          { headers: authHeaders }
        );
      }
      setPlanForm({ planName: "", expectedDays: "", description: "" });
      setEditPlanForm({ planName: "", expectedDays: "", description: "" });
      setEditingPlanId(null);
      setShowPlanModal(false);
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "研修計画の保存に失敗しました。");
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, planId: number) => {
    e.stopPropagation();
    if (!window.confirm("本当にこの研修計画を削除しますか？\n紐づく全ての項目が削除されます。")) return;
    if (!authHeaders) return;
    try {
      await axios.delete(`http://localhost:8080/api/training/templates/${planId}`, { headers: authHeaders });
      if (selectedPlanId === planId) setSelectedPlanId(null);
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "削除に失敗しました。");
    }
  };

  const startEditPlan = (e: React.MouseEvent, plan: PlanTemplate) => {
    e.stopPropagation();
    setEditPlanForm({
      planName: plan.planName,
      expectedDays: plan.expectedDays?.toString() ?? "",
      description: plan.description ?? "",
    });
    setEditingPlanId(plan.id);
    setShowPlanModal(true);
  };

  const handleAddSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders || !selectedPlanId) {
      setError("先に対象の研修計画を選択してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        "http://localhost:8080/api/training/templates/sections",
        {
          planId: selectedPlanId,
          sectionName: sectionForm.sectionName,
          expectedDays: sectionForm.expectedDays ? Number(sectionForm.expectedDays) : null,
          sortOrder: sectionForm.sortOrder ? Number(sectionForm.sortOrder) : null,
        },
        { headers: authHeaders },
      );
      setSectionForm({ sectionName: "", expectedDays: "", sortOrder: "" });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "大項目の追加に失敗しました。");
    }
  };

  const handleUpdateSection = async (sectionId: number) => {
    if (!authHeaders) return;
    try {
      await axios.put(
        `http://localhost:8080/api/training/templates/sections/${sectionId}`,
        {
          planId: selectedPlan?.id,
          sectionName: editSectionForm.sectionName,
          expectedDays: editSectionForm.expectedDays ? Number(editSectionForm.expectedDays) : null,
          sortOrder: editSectionForm.sortOrder ? Number(editSectionForm.sortOrder) : null,
        },
        { headers: authHeaders }
      );
      setEditingSectionId(null);
      setEditSectionForm({ sectionName: "", expectedDays: "", sortOrder: "" });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm("本当にこの大項目を削除しますか？")) return;
    if (!authHeaders) return;
    try {
      await axios.delete(`http://localhost:8080/api/training/templates/sections/${sectionId}`, { headers: authHeaders });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "削除に失敗しました。");
    }
  };

  const startEditSection = (section: PlanSection) => {
    setEditSectionForm({
      sectionName: section.sectionName,
      expectedDays: section.expectedDays?.toString() ?? "",
      sortOrder: section.sortOrder?.toString() ?? "",
    });
    setEditingSectionId(section.id);
  };

  const handleAddTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders || !targetSectionId) {
      setError("大項目を選択してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        "http://localhost:8080/api/training/templates/topics",
        {
          sectionId: targetSectionId,
          topicName: topicForm.topicName,
          sortOrder: topicForm.sortOrder ? Number(topicForm.sortOrder) : null,
        },
        { headers: authHeaders },
      );
      setTopicForm({ topicName: "", sortOrder: "" });
      setTargetSectionId(null);
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "小項目の追加に失敗しました。");
    }
  };

  const handleUpdateTopic = async (topicId: number, sectionId: number) => {
    if (!authHeaders) return;
    try {
      await axios.put(
        `http://localhost:8080/api/training/templates/topics/${topicId}`,
        {
          sectionId: sectionId,
          topicName: editTopicForm.topicName,
          sortOrder: editTopicForm.sortOrder ? Number(editTopicForm.sortOrder) : null,
        },
        { headers: authHeaders }
      );
      setEditingTopicId(null);
      setEditTopicForm({ topicName: "", sortOrder: "" });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm("本当にこの小項目を削除しますか？")) return;
    if (!authHeaders) return;
    try {
      await axios.delete(`http://localhost:8080/api/training/templates/topics/${topicId}`, { headers: authHeaders });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "削除に失敗しました。");
    }
  };

  const startEditTopic = (topic: PlanTopic) => {
    setEditTopicForm({
      topicName: topic.topicName,
      sortOrder: topic.sortOrder?.toString() ?? "",
    });
    setEditingTopicId(topic.id);
  };

  const handleAddTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders || !targetTopicId) {
      setError("小項目を選択してください。");
      return;
    }
    setError("");
    try {
      await axios.post(
        "http://localhost:8080/api/training/templates/todos",
        {
          topicId: targetTopicId,
          todoName: todoForm.todoName,
          dayIndex: todoForm.dayIndex ? Number(todoForm.dayIndex) : null,
          sortOrder: todoForm.sortOrder ? Number(todoForm.sortOrder) : null,
        },
        { headers: authHeaders },
      );
      setTodoForm({ todoName: "", dayIndex: "", sortOrder: "" });
      setTargetTopicId(null);
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "TODO の追加に失敗しました。");
    }
  };

  const handleUpdateTodo = async (todoId: number, topicId: number) => {
    if (!authHeaders) return;
    try {
      await axios.put(
        `http://localhost:8080/api/training/templates/todos/${todoId}`,
        {
          topicId: topicId,
          todoName: editTodoForm.todoName,
          dayIndex: editTodoForm.dayIndex ? Number(editTodoForm.dayIndex) : null,
          sortOrder: editTodoForm.sortOrder ? Number(editTodoForm.sortOrder) : null,
        },
        { headers: authHeaders }
      );
      setEditingTodoId(null);
      setEditTodoForm({ todoName: "", dayIndex: "", sortOrder: "" });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!window.confirm("本当にこのTODOを削除しますか？")) return;
    if (!authHeaders) return;
    try {
      await axios.delete(`http://localhost:8080/api/training/templates/todos/${todoId}`, { headers: authHeaders });
      fetchPlans(authHeaders);
    } catch (err: any) {
      setError(err.response?.data?.message || "削除に失敗しました。");
    }
  };

  const startEditTodo = (todo: PlanTodo) => {
    setEditTodoForm({
      todoName: todo.todoName,
      dayIndex: todo.dayIndex?.toString() ?? "",
      sortOrder: todo.sortOrder?.toString() ?? "",
    });
    setEditingTodoId(todo.id);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <DashboardSidebar
        role={user.role}
        roleLabel={user.role === 1 ? "管理者" : "講師"}
        active="plan"
      />
      <main className="flex-1 overflow-y-auto bg-slate-900/40">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-10 py-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-300">研修テンプレート</p>
            <h1 className="text-2xl font-semibold text-white">研修計画の設計</h1>
            <p className="text-sm text-slate-300">
              研修計画を作成し、大項目・小項目・TODOを階層的に管理します。
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setPlanForm({ planName: "", expectedDays: "", description: "" });
                setEditingPlanId(null);
                setShowPlanModal(true);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              ＋ 研修計画を追加
            </Button>
            <UserHeaderInfo user={user} />
          </div>
        </header>

        <section className="px-10 py-8 space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-200">
              現在の研修計画
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`group relative w-full rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${selectedPlanId === plan.id
                    ? "border-cyan-400/60 bg-cyan-400/10 text-white shadow-sm"
                    : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-600"
                    }`}
                >
                  <div
                    className="absolute right-3 top-3 hidden gap-2 group-hover:flex"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={(e) => startEditPlan(e, plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                      onClick={(e) => handleDeletePlan(e, plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between pr-16">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          研修計画
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {plan.planName}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                        {plan.sections.length} 大項目
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                      {plan.description || "説明は未登録です。"}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                      <span>想定 {plan.expectedDays ?? "-"} 日</span>
                      <span>
                        小項目{" "}
                        {plan.sections.reduce(
                          (sum, section) => sum + section.topics.length,
                          0,
                        )}
                        件
                      </span>
                    </div>
                  </button>
                </div>
              ))}
              {plans.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center text-sm text-slate-400">
                  まだ研修計画が登録されていません。「研修計画を追加」から作成してください。
                </p>
              )}
            </div>
          </div>

          {selectedPlan ? (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    選択中の研修計画
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {selectedPlan.planName}
                  </p>
                  <p className="text-sm text-slate-400">
                    想定 {selectedPlan.expectedDays ?? "-"} 日 / 大項目{" "}
                    {selectedPlan.sections.length} 件
                  </p>
                </div>
                <Button
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setTargetSectionId(-1)}
                >
                  ＋ 大項目を追加
                </Button>
              </div>

              {targetSectionId === -1 && (
                <Card className="border-slate-700 bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-200">
                      大項目を追加
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4 md:grid-cols-3" onSubmit={handleAddSection}>
                      <div className="space-y-1">
                        <Label htmlFor="sectionName" className="text-slate-300">大項目名</Label>
                        <Input
                          id="sectionName"
                          value={sectionForm.sectionName}
                          onChange={(e) =>
                            setSectionForm((prev) => ({
                              ...prev,
                              sectionName: e.target.value,
                            }))
                          }
                          className="border-slate-700 bg-slate-950 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="sectionDays" className="text-slate-300">想定日数</Label>
                        <Input
                          id="sectionDays"
                          value={sectionForm.expectedDays}
                          onChange={(e) =>
                            setSectionForm((prev) => ({
                              ...prev,
                              expectedDays: e.target.value,
                            }))
                          }
                          className="border-slate-700 bg-slate-950 text-white"
                          placeholder="例：5"
                          type="number"
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="sectionOrder" className="text-slate-300">表示順</Label>
                        <Input
                          id="sectionOrder"
                          value={sectionForm.sortOrder}
                          onChange={(e) =>
                            setSectionForm((prev) => ({
                              ...prev,
                              sortOrder: e.target.value,
                            }))
                          }
                          className="border-slate-700 bg-slate-950 text-white"
                          placeholder="例：1"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                          onClick={() => setTargetSectionId(null)}
                        >
                          キャンセル
                        </Button>
                        <Button type="submit" className="bg-cyan-600 text-white hover:bg-cyan-700">
                          追加する
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {selectedPlan.sections.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center text-sm text-slate-400">
                  大項目がまだ登録されていません。上のボタンから追加してください。
                </p>
              )}

              <div className="space-y-4">
                {selectedPlan.sections.map((section) => (
                  <div
                    key={section.id}
                    className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      {editingSectionId === section.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editSectionForm.sectionName}
                            onChange={(e) => setEditSectionForm(p => ({ ...p, sectionName: e.target.value }))}
                            className="max-w-xs border-slate-700 bg-slate-950 text-white"
                            placeholder="大項目名"
                          />
                          <Input
                            value={editSectionForm.expectedDays}
                            onChange={(e) => setEditSectionForm(p => ({ ...p, expectedDays: e.target.value }))}
                            className="w-20 border-slate-700 bg-slate-950 text-white"
                            placeholder="日数"
                            type="number"
                            step="0.1"
                          />
                          <Input
                            value={editSectionForm.sortOrder}
                            onChange={(e) => setEditSectionForm(p => ({ ...p, sortOrder: e.target.value }))}
                            className="w-16 border-slate-700 bg-slate-950 text-white"
                            placeholder="順序"
                            type="number"
                          />
                          <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateSection(section.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setEditingSectionId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-slate-400 hover:text-white"
                              onClick={() => toggleSection(section.id)}
                            >
                              {collapsedSectionIds.includes(section.id) ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="inline-flex items-center rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                              大項目
                            </span>
                          </div>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {section.sectionName}
                          </p>
                          <p className="text-sm text-slate-400">
                            想定 {section.expectedDays ?? "-"} 日 / 表示順{" "}
                            {section.sortOrder ?? "-"}
                          </p>
                          <div className="hidden gap-1 group-hover:flex">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => startEditSection(section)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDeleteSection(section.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                        onClick={() => {
                          setTargetSectionId(section.id);
                          setTargetTopicId(null);
                        }}
                      >
                        ＋ 小項目を追加
                      </Button>
                    </div>

                    {!collapsedSectionIds.includes(section.id) && (
                      <>
                        {targetSectionId === section.id && (
                          <Card className="border-slate-700 bg-slate-900">
                            <CardContent className="pt-4">
                              <form
                                className="grid gap-3 md:grid-cols-[2fr_1fr]"
                                onSubmit={handleAddTopic}
                              >
                                <div className="space-y-1">
                                  <Label htmlFor={`topic-${section.id}`} className="text-slate-300">
                                    小項目名
                                  </Label>
                                  <Input
                                    id={`topic-${section.id}`}
                                    value={topicForm.topicName}
                                    onChange={(e) =>
                                      setTopicForm((prev) => ({
                                        ...prev,
                                        topicName: e.target.value,
                                      }))
                                    }
                                    className="border-slate-700 bg-slate-950 text-white"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`topicSort-${section.id}`} className="text-slate-300">
                                    表示順
                                  </Label>
                                  <Input
                                    id={`topicSort-${section.id}`}
                                    value={topicForm.sortOrder}
                                    onChange={(e) =>
                                      setTopicForm((prev) => ({
                                        ...prev,
                                        sortOrder: e.target.value,
                                      }))
                                    }
                                    className="border-slate-700 bg-slate-950 text-white"
                                    placeholder="例：1"
                                    type="number"
                                  />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                                    onClick={() => {
                                      setTargetSectionId(null);
                                      setTopicForm({ topicName: "", sortOrder: "" });
                                    }}
                                  >
                                    キャンセル
                                  </Button>
                                  <Button type="submit" className="bg-cyan-600 text-white hover:bg-cyan-700">
                                    追加する
                                  </Button>
                                </div>
                              </form>
                            </CardContent>
                          </Card>
                        )}

                        <div className="space-y-3 border-l border-slate-700 pl-4">
                          {section.topics.length === 0 && (
                            <p className="text-sm text-slate-500">
                              小項目が登録されていません。
                            </p>
                          )}
                          {section.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="space-y-2 rounded-xl bg-slate-900/50 p-3"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                {editingTopicId === topic.id ? (
                                  <div className="flex flex-1 items-center gap-2">
                                    <Input
                                      value={editTopicForm.topicName}
                                      onChange={(e) => setEditTopicForm(p => ({ ...p, topicName: e.target.value }))}
                                      className="max-w-xs border-slate-700 bg-slate-950 text-white"
                                      placeholder="小項目名"
                                    />
                                    <Input
                                      value={editTopicForm.sortOrder}
                                      onChange={(e) => setEditTopicForm(p => ({ ...p, sortOrder: e.target.value }))}
                                      className="w-16 border-slate-700 bg-slate-950 text-white"
                                      placeholder="順序"
                                      type="number"
                                    />
                                    <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateTopic(topic.id, section.id)}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setEditingTopicId(null)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="group flex items-center gap-4">
                                    <div>
                                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                                        小項目
                                      </span>
                                      <p className="text-base font-semibold text-slate-200">
                                        {topic.topicName}
                                      </p>
                                    </div>
                                    <div className="hidden gap-1 group-hover:flex">
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => startEditTopic(topic)}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDeleteTopic(topic.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                                  onClick={() => {
                                    setTargetTopicId(topic.id);
                                    setTargetSectionId(null);
                                  }}
                                >
                                  ＋ TODOを追加
                                </Button>
                              </div>

                              {targetTopicId === topic.id && (
                                <Card className="border-slate-700 bg-slate-900">
                                  <CardContent className="pt-4">
                                    <form
                                      className="grid gap-3 md:grid-cols-3"
                                      onSubmit={handleAddTodo}
                                    >
                                      <div className="md:col-span-2 space-y-1">
                                        <Label htmlFor={`todo-${topic.id}`} className="text-slate-300">
                                          TODO 名
                                        </Label>
                                        <Input
                                          id={`todo-${topic.id}`}
                                          value={todoForm.todoName}
                                          onChange={(e) =>
                                            setTodoForm((prev) => ({
                                              ...prev,
                                              todoName: e.target.value,
                                            }))
                                          }
                                          className="border-slate-700 bg-slate-950 text-white"
                                          required
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label htmlFor={`todoDay-${topic.id}`} className="text-slate-300">
                                          推奨日
                                        </Label>
                                        <Input
                                          id={`todoDay-${topic.id}`}
                                          value={todoForm.dayIndex}
                                          onChange={(e) =>
                                            setTodoForm((prev) => ({
                                              ...prev,
                                              dayIndex: e.target.value,
                                            }))
                                          }
                                          className="border-slate-700 bg-slate-950 text-white"
                                          placeholder="例：5"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label htmlFor={`todoSort-${topic.id}`} className="text-slate-300">
                                          同日の順序
                                        </Label>
                                        <Input
                                          id={`todoSort-${topic.id}`}
                                          value={todoForm.sortOrder}
                                          onChange={(e) =>
                                            setTodoForm((prev) => ({
                                              ...prev,
                                              sortOrder: e.target.value,
                                            }))
                                          }
                                          className="border-slate-700 bg-slate-950 text-white"
                                          placeholder="例：1"
                                        />
                                      </div>
                                      <div className="md:col-span-3 flex justify-end gap-3">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                                          onClick={() => {
                                            setTargetTopicId(null);
                                            setTodoForm({
                                              todoName: "",
                                              dayIndex: "",
                                              sortOrder: "",
                                            });
                                          }}
                                        >
                                          キャンセル
                                        </Button>
                                        <Button type="submit" className="bg-cyan-600 text-white hover:bg-cyan-700">
                                          追加する
                                        </Button>
                                      </div>
                                    </form>
                                  </CardContent>
                                </Card>
                              )}

                              <ul className="space-y-2">
                                {topic.todos.length === 0 && (
                                  <li className="text-sm text-slate-500">
                                    TODO は未登録です。
                                  </li>
                                )}
                                {topic.todos.map((todo) => (
                                  <li
                                    key={todo.id}
                                    className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 text-sm shadow-sm"
                                  >
                                    <div className="flex-1">
                                      {editingTodoId === todo.id ? (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={editTodoForm.todoName}
                                            onChange={(e) => setEditTodoForm(p => ({ ...p, todoName: e.target.value }))}
                                            className="max-w-xs border-slate-700 bg-slate-950 text-white"
                                            placeholder="TODO 名"
                                          />
                                          <Input
                                            value={editTodoForm.dayIndex}
                                            onChange={(e) => setEditTodoForm(p => ({ ...p, dayIndex: e.target.value }))}
                                            className="w-20 border-slate-700 bg-slate-950 text-white"
                                            placeholder="例：5"
                                          />
                                          <Input
                                            value={editTodoForm.sortOrder}
                                            onChange={(e) => setEditTodoForm(p => ({ ...p, sortOrder: e.target.value }))}
                                            className="w-16 border-slate-700 bg-slate-950 text-white"
                                            placeholder="順序"
                                            type="number"
                                          />
                                          <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateTodo(todo.id, topic.id)}>
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setEditingTodoId(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="group flex items-center justify-between">
                                          <div>
                                            <p className="font-medium text-slate-200">
                                              {todo.todoName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                              Day {todo.dayIndex ?? "-"} / 順序{" "}
                                              {todo.sortOrder ?? "-"}
                                            </p>
                                          </div>
                                          <div className="hidden gap-1 group-hover:flex">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => startEditTodo(todo)}>
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-400" onClick={() => handleDeleteTodo(todo.id)}>
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-12 text-center text-sm text-slate-400">
              編集する研修計画を選択してください。大項目・小項目・TODO をここで追加できます。
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}
        </section>
      </main>

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {editingPlanId ? "研修計画を編集" : "研修計画を作成"}
                </h3>
                <p className="text-sm text-slate-400">
                  計画名・想定日数・説明を入力してください。
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-white"
              >
                閉じる
              </Button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handlePlanSubmit}>
              <div className="space-y-1">
                <Label htmlFor="planNameModal" className="text-slate-300">計画名</Label>
                <Input
                  id="planNameModal"
                  value={editingPlanId ? editPlanForm.planName : planForm.planName}
                  onChange={(e) =>
                    editingPlanId
                      ? setEditPlanForm((prev) => ({ ...prev, planName: e.target.value }))
                      : setPlanForm((prev) => ({ ...prev, planName: e.target.value }))
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planDays" className="text-slate-300">想定日数</Label>
                <Input
                  id="planDays"
                  value={editingPlanId ? editPlanForm.expectedDays : planForm.expectedDays}
                  onChange={(e) =>
                    editingPlanId
                      ? setEditPlanForm((prev) => ({ ...prev, expectedDays: e.target.value }))
                      : setPlanForm((prev) => ({ ...prev, expectedDays: e.target.value }))
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                  placeholder="例：30"
                  type="number"
                  step="0.1"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planDescription" className="text-slate-300">説明</Label>
                <Textarea
                  id="planDescription"
                  rows={4}
                  value={editingPlanId ? editPlanForm.description : planForm.description}
                  onChange={(e) =>
                    editingPlanId
                      ? setEditPlanForm((prev) => ({ ...prev, description: e.target.value }))
                      : setPlanForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                  placeholder="計画の概要や狙いを入力"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setShowPlanModal(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" className="bg-cyan-600 text-white hover:bg-cyan-700">
                  {editingPlanId ? "更新する" : "登録する"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
