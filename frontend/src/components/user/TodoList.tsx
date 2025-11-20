import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Todo {
  id: number;
  task: string;
  priority: "高" | "中" | "低";
  dueDate: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: "今週の日報を提出", priority: "高", dueDate: "2025-11-20", completed: false },
    { id: 2, task: "React Hooks の課題を完成", priority: "高", dueDate: "2025-11-22", completed: false },
    { id: 3, task: "フォーム実装の復習", priority: "中", dueDate: "2025-11-25", completed: false },
    { id: 4, task: "指定教材を読む", priority: "低", dueDate: "2025-11-27", completed: true },
  ]);

  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState<"高" | "中" | "低">("中");
  const [newDueDate, setNewDueDate] = useState("");

  const addTodo = () => {
    if (newTask.trim() && newDueDate) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          task: newTask,
          priority: newPriority,
          dueDate: newDueDate,
          completed: false,
        },
      ]);
      setNewTask("");
      setNewDueDate("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "高":
        return "bg-red-100 text-red-700";
      case "中":
        return "bg-yellow-100 text-yellow-700";
      case "低":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-6">
      <div>
        <h1>TODO リスト</h1>
        <p className="text-muted-foreground">
          タスクを管理しましょう ({completedCount}/{totalCount} 完了)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新しいタスクを追加</CardTitle>
          <CardDescription>新しいタスクをリストに追加する</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-5">
              <Input
                placeholder="タスクを入力..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
            </div>
            <div className="md:col-span-2">
              <Select value={newPriority} onValueChange={(value) => setNewPriority(value as "高" | "中" | "低")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addTodo} className="w-full">
                <Plus className="mr-2 size-4" />
                追加
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>進行中</CardTitle>
            <CardDescription>未完了のタスク</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todos.filter((todo) => !todo.completed).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <p>{todo.task}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-xs">
                        期限: {new Date(todo.dueDate).toLocaleDateString("ja-JP")}
                      </p>
                      <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {todos.filter((todo) => !todo.completed).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  未完了のタスクはありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>完了</CardTitle>
            <CardDescription>完了したタスク</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todos.filter((todo) => todo.completed).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 rounded-lg border p-3 opacity-60"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="line-through">{todo.task}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-xs">
                        期限: {new Date(todo.dueDate).toLocaleDateString("ja-JP")}
                      </p>
                      <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {todos.filter((todo) => todo.completed).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  まだタスクを完了していません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
