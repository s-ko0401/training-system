import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MessageSquare, Send } from "lucide-react";
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
  traineeName: string;
  date: string;
  title: string;
  content: string;
  status: "回答済み" | "未回答";
  reply?: string;
  replyDate?: string;
}

export function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      traineeName: "山田太郎",
      date: "2025-11-19",
      title: "React Hooks の使用タイミングについて",
      content: "どのような場合に useEffect を使い、どのような場合に useLayoutEffect を使うべきでしょうか？",
      status: "回答済み",
      reply: "useEffect は多くの副作用操作に適しており、ブラウザが描画を完了した後に実行されます。useLayoutEffect はブラウザが描画する前に同期的に実行され、DOM の測定や同期更新が必要な場合に適しています。",
      replyDate: "2025-11-19",
    },
    {
      id: 2,
      traineeName: "佐藤花子",
      date: "2025-11-18",
      title: "TypeScript ジェネリクスの問題",
      content: "TypeScript のジェネリクスを使用する際、ジェネリック型パラメータに特定のプロパティを含むように制約するにはどうすればよいでしょうか？",
      status: "未回答",
    },
    {
      id: 3,
      traineeName: "鈴木一郎",
      date: "2025-11-17",
      title: "状態管理の選択について",
      content: "中規模プロジェクトの場合、Context API と Redux のどちらを選ぶべきでしょうか？それぞれの長所と短所は何ですか？",
      status: "未回答",
    },
  ]);

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (selectedQuestion && replyText.trim()) {
      setQuestions(
        questions.map((q) =>
          q.id === selectedQuestion.id
            ? {
                ...q,
                status: "回答済み" as const,
                reply: replyText,
                replyDate: new Date().toISOString().split("T")[0],
              }
            : q
        )
      );
      setReplyText("");
      setReplyDialogOpen(false);
      setSelectedQuestion(null);
    }
  };

  const pendingCount = questions.filter((q) => q.status === "未回答").length;
  const repliedCount = questions.filter((q) => q.status === "回答済み").length;

  return (
    <div className="space-y-6">
      <div>
        <h1>質問管理</h1>
        <p className="text-muted-foreground">
          研修生の質問を確認し、回答します
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">総質問数</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">未回答</CardTitle>
            <MessageSquare className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div>{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">回答済み</CardTitle>
            <MessageSquare className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div>{repliedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{question.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {question.traineeName} · 投稿日:{" "}
                    {new Date(question.date).toLocaleDateString("ja-JP")}
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
                  <AvatarFallback>
                    {question.traineeName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{question.traineeName}</p>
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
                      <p className="text-sm">あなたの回答</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(question.replyDate!).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <p className="text-muted-foreground">{question.reply}</p>
                  </div>
                </div>
              )}

              {question.status === "未回答" && (
                <Dialog
                  open={replyDialogOpen && selectedQuestion?.id === question.id}
                  onOpenChange={(open) => {
                    setReplyDialogOpen(open);
                    if (open) {
                      setSelectedQuestion(question);
                    } else {
                      setSelectedQuestion(null);
                      setReplyText("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Send className="mr-2 size-4" />
                      回答する
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>質問に回答</DialogTitle>
                      <DialogDescription>
                        {question.traineeName} の質問に回答する
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm mb-2">{question.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {question.content}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reply">あなたの回答</Label>
                        <Textarea
                          id="reply"
                          placeholder="回答を入力..."
                          rows={6}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyDialogOpen(false);
                          setReplyText("");
                        }}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={handleReply}>
                        <Send className="mr-2 size-4" />
                        回答を送信
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
