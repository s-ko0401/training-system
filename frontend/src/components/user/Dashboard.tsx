import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { CheckSquare, FileText, MessageSquare, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";

export function Dashboard() {
  const stats = [
    {
      title: "研修進捗",
      value: "第2章",
      subtitle: "フロントエンドスキル",
      percentage: 28,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "TODO完了率",
      value: "8/15",
      percentage: 53,
      icon: CheckSquare,
      color: "text-green-600",
    },
    {
      title: "日報提出",
      value: "18/20",
      percentage: 90,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "未回答質問",
      value: "3件",
      percentage: 0,
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  const chapters = [
    { id: 1, title: "第1章：システム基礎理解", status: "完了", progress: 100 },
    { id: 2, title: "第2章：フロントエンドスキル", status: "進行中", progress: 45 },
    { id: 3, title: "第3章：バックエンドスキル", status: "未開始", progress: 0 },
    { id: 4, title: "第4章：データベーススキル", status: "未開始", progress: 0 },
    { id: 5, title: "第5章：Git / チーム開発スキル", status: "未開始", progress: 0 },
    { id: 6, title: "第6章：AI 協働スキル", status: "未開始", progress: 0 },
    { id: 7, title: "第7章：開発プロセス", status: "未開始", progress: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>ダッシュボード</h1>
        <p className="text-muted-foreground">
          おかえりなさい！研修の進捗状況を確認しましょう
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <Icon className={`size-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="mb-1">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mb-2">{stat.subtitle}</p>
                )}
                {stat.percentage > 0 && (
                  <Progress value={stat.percentage} className="h-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>研修カリキュラム進捗</CardTitle>
            <CardDescription>全7章の学習状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{chapter.title}</p>
                    <Badge
                      variant={
                        chapter.status === "完了"
                          ? "default"
                          : chapter.status === "進行中"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {chapter.status}
                    </Badge>
                  </div>
                  <Progress value={chapter.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今週の予定</CardTitle>
            <CardDescription>今後の研修スケジュール</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "11/20 (水)", title: "React コンポーネント実装", time: "09:00-12:00" },
                { date: "11/21 (木)", title: "Hooks 演習（useState/useEffect）", time: "14:00-17:00" },
                { date: "11/22 (金)", title: "API通信とフォーム処理", time: "10:00-12:00" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs">
                    {item.date}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p>{item.title}</p>
                    <p className="text-muted-foreground text-sm">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>今日のTODO</CardTitle>
          <CardDescription>本日完了すべきタスク</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: "今週の日報を提出", priority: "高", dueDate: "今日" },
              { task: "React Hooks の課題を完成", priority: "高", dueDate: "今日" },
              { task: "フォーム実装の復習", priority: "中", dueDate: "11/22" },
              { task: "次週のカリキュラムを予習", priority: "低", dueDate: "11/24" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p>{item.task}</p>
                  <p className="text-muted-foreground text-sm">
                    期限: {item.dueDate}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${item.priority === "高"
                      ? "bg-red-100 text-red-700"
                      : item.priority === "中"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
