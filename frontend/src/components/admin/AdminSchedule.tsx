import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Todo {
  id: number;
  dayNumber: number;
  description: string;
  subItemId: number;
}

interface SubItem {
  id: number;
  title: string;
  description: string;
  mainItemId: number;
}

interface MainItem {
  id: number;
  title: string;
  description: string;
  order: number;
}

export function AdminSchedule() {
  const [mainItems, setMainItems] = useState<MainItem[]>([
    { id: 1, title: "第1章：システム基礎理解", description: "0.5〜1日", order: 1 },
    { id: 2, title: "第2章：フロントエンドスキル", description: "3〜4週間", order: 2 },
    { id: 3, title: "第3章：バックエンドスキル", description: "3週間", order: 3 },
  ]);

  const [subItems, setSubItems] = useState<SubItem[]>([
    { id: 1, title: "システム全体の流れを理解する", description: "フロントエンド → バックエンド → DB の連携", mainItemId: 1 },
    { id: 2, title: "HTTP / API の基礎", description: "API とは何か、JSON とは何か", mainItemId: 1 },
    { id: 3, title: "基礎技術", description: "HTML / CSS / JavaScript（基礎）", mainItemId: 2 },
    { id: 4, title: "React", description: "コンポーネント構造、Props / State の扱い", mainItemId: 2 },
  ]);

  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, dayNumber: 1, description: "システムアーキテクチャの概要を学習", subItemId: 1 },
    { id: 2, dayNumber: 1, description: "リクエスト・レスポンスフローを理解", subItemId: 1 },
    { id: 3, dayNumber: 2, description: "APIの基本概念を学習", subItemId: 2 },
    { id: 4, dayNumber: 2, description: "JSONフォーマットの理解", subItemId: 2 },
    { id: 5, dayNumber: 3, description: "HTML基礎の復習", subItemId: 3 },
  ]);

  const [expandedMainItems, setExpandedMainItems] = useState<Set<number>>(new Set([1, 2]));
  const [expandedSubItems, setExpandedSubItems] = useState<Set<number>>(new Set([1, 2]));

  // Dialog states
  const [mainItemDialog, setMainItemDialog] = useState(false);
  const [, setSubItemDialog] = useState(false);
  const [, setTodoDialog] = useState(false);
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

  // Form states
  const [newMainItem, setNewMainItem] = useState({ title: "", description: "" });
  const [newSubItem, setNewSubItem] = useState({ title: "", description: "" });
  const [newTodo, setNewTodo] = useState({ dayNumber: 1, description: "" });

  const toggleMainItem = (id: number) => {
    const newExpanded = new Set(expandedMainItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMainItems(newExpanded);
  };

  const toggleSubItem = (id: number) => {
    const newExpanded = new Set(expandedSubItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubItems(newExpanded);
  };

  const handleAddMainItem = () => {
    if (newMainItem.title) {
      const newItem: MainItem = {
        id: Date.now(),
        title: newMainItem.title,
        description: newMainItem.description,
        order: mainItems.length + 1,
      };
      setMainItems([...mainItems, newItem]);
      setNewMainItem({ title: "", description: "" });
      setMainItemDialog(false);
    }
  };

  const handleAddSubItem = () => {
    if (newSubItem.title && selectedMainId) {
      const newItem: SubItem = {
        id: Date.now(),
        title: newSubItem.title,
        description: newSubItem.description,
        mainItemId: selectedMainId,
      };
      setSubItems([...subItems, newItem]);
      setNewSubItem({ title: "", description: "" });
      setSubItemDialog(false);
    }
  };

  const handleAddTodo = () => {
    if (newTodo.description && selectedSubId) {
      const newItem: Todo = {
        id: Date.now(),
        dayNumber: newTodo.dayNumber,
        description: newTodo.description,
        subItemId: selectedSubId,
      };
      setTodos([...todos, newItem]);
      setNewTodo({ dayNumber: 1, description: "" });
      setTodoDialog(false);
    }
  };

  const handleDeleteMainItem = (id: number) => {
    setMainItems(mainItems.filter((item) => item.id !== id));
    setSubItems(subItems.filter((item) => item.mainItemId !== id));
  };

  const handleDeleteSubItem = (id: number) => {
    setSubItems(subItems.filter((item) => item.id !== id));
    setTodos(todos.filter((item) => item.subItemId !== id));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((item) => item.id !== id));
  };

  const getSubItemsByMainId = (mainId: number) => {
    return subItems.filter((sub) => sub.mainItemId === mainId);
  };

  const getTodosBySubId = (subId: number) => {
    return todos.filter((todo) => todo.subItemId === subId).sort((a, b) => a.dayNumber - b.dayNumber);
  };

  const getTotalDays = () => {
    return todos.length > 0 ? Math.max(...todos.map((t) => t.dayNumber)) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>研修日程管理</h1>
          <p className="text-muted-foreground">
            大項目・小項目・TODOを階層的に管理します（合計 {getTotalDays()} 日間）
          </p>
        </div>
        <Dialog open={mainItemDialog} onOpenChange={setMainItemDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              大項目を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>大項目を追加</DialogTitle>
              <DialogDescription>研修の大きなカテゴリを追加します</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="main-title">タイトル</Label>
                <Input
                  id="main-title"
                  placeholder="例: 第1章：システム基礎理解"
                  value={newMainItem.title}
                  onChange={(e) => setNewMainItem({ ...newMainItem, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main-desc">説明</Label>
                <Textarea
                  id="main-desc"
                  placeholder="例: 0.5〜1日"
                  value={newMainItem.description}
                  onChange={(e) => setNewMainItem({ ...newMainItem, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMainItemDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddMainItem}>追加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {mainItems.map((mainItem) => (
          <Card key={mainItem.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMainItem(mainItem.id)}
                    className="p-1 h-auto"
                  >
                    {expandedMainItems.has(mainItem.id) ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="default">大項目</Badge>
                      {mainItem.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {mainItem.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMainId(mainItem.id)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>小項目を追加</DialogTitle>
                        <DialogDescription>{mainItem.title} に小項目を追加します</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="sub-title">タイトル</Label>
                          <Input
                            id="sub-title"
                            placeholder="例: システム全体の流れを理解する"
                            value={newSubItem.title}
                            onChange={(e) => setNewSubItem({ ...newSubItem, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sub-desc">説明</Label>
                          <Textarea
                            id="sub-desc"
                            placeholder="詳細な説明を入力"
                            value={newSubItem.description}
                            onChange={(e) => setNewSubItem({ ...newSubItem, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNewSubItem({ title: "", description: "" })}>
                          キャンセル
                        </Button>
                        <Button onClick={handleAddSubItem}>追加</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMainItem(mainItem.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedMainItems.has(mainItem.id) && (
              <CardContent className="space-y-2 pt-0">
                {getSubItemsByMainId(mainItem.id).map((subItem) => (
                  <div key={subItem.id} className="ml-6 border-l-2 border-muted pl-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubItem(subItem.id)}
                        className="p-1 h-auto"
                      >
                        {expandedSubItems.has(subItem.id) ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">小項目</Badge>
                          <span className="font-medium">{subItem.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subItem.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSubId(subItem.id)}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>TODO を追加</DialogTitle>
                              <DialogDescription>{subItem.title} に TODO を追加します</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="todo-day">Day</Label>
                                <Input
                                  id="todo-day"
                                  type="number"
                                  min="1"
                                  placeholder="例: 1"
                                  value={newTodo.dayNumber}
                                  onChange={(e) => setNewTodo({ ...newTodo, dayNumber: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="todo-desc">TODO内容</Label>
                                <Textarea
                                  id="todo-desc"
                                  placeholder="具体的なタスクを入力"
                                  value={newTodo.description}
                                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setNewTodo({ dayNumber: 1, description: "" })}>
                                キャンセル
                              </Button>
                              <Button onClick={handleAddTodo}>追加</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubItem(subItem.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {expandedSubItems.has(subItem.id) && (
                      <div className="ml-6 space-y-2 mt-2">
                        {getTodosBySubId(subItem.id).map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-2 rounded-md border bg-muted/50 p-2"
                          >
                            <Badge variant="outline" className="shrink-0">
                              Day {todo.dayNumber}
                            </Badge>
                            <span className="flex-1 text-sm">{todo.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        {getTodosBySubId(subItem.id).length === 0 && (
                          <p className="text-sm text-muted-foreground ml-6">
                            まだ TODO がありません
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {getSubItemsByMainId(mainItem.id).length === 0 && (
                  <p className="text-sm text-muted-foreground ml-6">
                    まだ小項目がありません
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {mainItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">まだ大項目がありません</p>
            <p className="text-muted-foreground text-sm">上のボタンをクリックして大項目を追加しましょう</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
