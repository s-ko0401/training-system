import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { MessageSquare, Plus, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface Question {
  id: number;
  date: string;
  title: string;
  content: string;
  status: "回答済み" | "未回答";
  reply?: string;
  replyDate?: string;
}

export function Questions() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      date: "2025-11-19",
      title: "React Hooks の使用タイミングについて",
      content: "どのような場合に useEffect を使い、どのような場合に useLayoutEffect を使うべきでしょうか？",
      status: "回答済み",
      reply: "useEffect は多くの副作用操作に適しており、ブラウザが描画を完了した後に実行されます。useLayoutEffect はブラウザが描画する前に同期的に実行され、DOM の測定や同期更新が必要な場合に適しています。",
      replyDate: "2025-11-19",
    },
    {
      id: 2,
      date: "2025-11-18",
      title: "TypeScript ジェネリクスの問題",
      content: "TypeScript のジェネリクスを使用する際、ジェネリック型パラメータに特定のプロパティを含むように制約するにはどうすればよいでしょうか？",
      status: "回答済み",
      reply: "extends キーワードを使用してジェネリクスを制約できます。例: function fn<T extends { id: number }>(obj: T) { ... }",
      replyDate: "2025-11-18",
    },
    {
      id: 3,
      date: "2025-11-17",
      title: "状態管理の選択について",
      content: "中規模プロジェクトの場合、Context API と Redux のどちらを選ぶべきでしょうか？",
      status: "未回答",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
  });

  const handleSubmitQuestion = () => {
    if (newQuestion.title && newQuestion.content) {
      setQuestions([
        {
          id: Date.now(),
          date: new Date().toISOString().split("T")[0],
          ...newQuestion,
          status: "未回答",
        },
        ...questions,
      ]);
      setNewQuestion({ title: "", content: "" });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>質問</h1>
          <p className="text-muted-foreground">
            質問を投稿して回答を確認しましょう
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              質問する
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>質問を投稿</DialogTitle>
              <DialogDescription>
                質問を詳しく説明してください。できるだけ早く回答します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question-title">質問タイトル</Label>
                <Input
                  id="question-title"
                  placeholder="質問のタイトルを入力..."
                  value={newQuestion.title}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-content">質問内容</Label>
                <Textarea
                  id="question-content"
                  placeholder="質問を詳しく説明してください..."
                  rows={6}
                  value={newQuestion.content}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, content: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSubmitQuestion}>
                <Send className="mr-2 size-4" />
                質問を投稿
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    <CardTitle>{question.title}</CardTitle>
                  </div>
                  <CardDescription>
                    投稿日:{" "}
                    {new Date(question.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Badge
                  variant={question.status === "回答済み" ? "default" : "secondary"}
                >
                  {question.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="size-8">
                  <AvatarFallback>あ</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">あなた</p>
                  <p className="text-muted-foreground">{question.content}</p>
                </div>
              </div>

              {question.reply && (
                <div className="flex gap-3 rounded-lg bg-muted p-4">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      M
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">メンターからの回答</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(question.replyDate!).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <p className="text-muted-foreground">{question.reply}</p>
                  </div>
                </div>
              )}

              {question.status === "未回答" && (
                <div className="rounded-lg border-2 border-dashed p-4 text-center text-muted-foreground text-sm">
                  メンターからの回答をお待ちください
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">まだ質問がありません</p>
            <p className="text-muted-foreground text-sm">上のボタンをクリックして質問を投稿しましょう</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
