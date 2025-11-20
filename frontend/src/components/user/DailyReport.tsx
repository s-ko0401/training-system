import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

interface Report {
  id: number;
  date: string;
  title: string;
  content: string;
  status: "提出済み" | "下書き";
}

export function DailyReport() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      date: "2025-11-19",
      title: "React Hooks 学習の振り返り",
      content: "今日は useState と useEffect について学習しました。状態管理についてより深く理解することができました...",
      status: "提出済み",
    },
    {
      id: 2,
      date: "2025-11-18",
      title: "TypeScript 基礎の復習",
      content: "TypeScript の基本的な型システムを復習しました。interface と type の違いについて学びました...",
      status: "提出済み",
    },
    {
      id: 3,
      date: "2025-11-17",
      title: "プロジェクト開発の進捗",
      content: "個人プロジェクトの企画を始めました。使用する技術スタックを決定しました...",
      status: "下書き",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    content: "",
  });

  const handleSubmitReport = () => {
    if (newReport.title && newReport.content) {
      setReports([
        {
          id: Date.now(),
          ...newReport,
          status: "提出済み",
        },
        ...reports,
      ]);
      setNewReport({
        date: new Date().toISOString().split("T")[0],
        title: "",
        content: "",
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>日報</h1>
          <p className="text-muted-foreground">
            学習の進捗と振り返りを記録しましょう
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              日報を作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>日報を作成</DialogTitle>
              <DialogDescription>
                今日の学習内容と振り返りを記録する
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">日付</Label>
                <Input
                  id="date"
                  type="date"
                  value={newReport.date}
                  onChange={(e) =>
                    setNewReport({ ...newReport, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  placeholder="日報のタイトルを入力..."
                  value={newReport.title}
                  onChange={(e) =>
                    setNewReport({ ...newReport, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  placeholder="学習内容と振り返りを入力..."
                  rows={8}
                  value={newReport.content}
                  onChange={(e) =>
                    setNewReport({ ...newReport, content: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSubmitReport}>日報を提出</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4" />
                    <CardTitle>{report.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {new Date(report.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </CardDescription>
                </div>
                <Badge
                  variant={report.status === "提出済み" ? "default" : "secondary"}
                >
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{report.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">まだ日報がありません</p>
            <p className="text-muted-foreground text-sm">上のボタンをクリックして日報を作成しましょう</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
